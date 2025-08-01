import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function UploadLogo() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const countUniqueColors = (image) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colorSet = new Set();

    for (let i = 0; i < data.length; i += 4) {
      const rgb = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      colorSet.add(rgb);
      if (colorSet.size > 1000) break; // cap for performance
    }

    return colorSet.size;
  };

  const handleUpload = async () => {
    if (!file) return alert('Please choose a file.');

    setUploading(true);

    const filename = `${Date.now()}-${file.name}`;
    const { data: storageData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filename, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Upload failed');
      setUploading(false);
      return;
    }

    const previewPublicUrl = supabase.storage
      .from('uploads')
      .getPublicUrl(filename).data.publicUrl;

    // Auto-analysis
    const fileType = file.type;
    const isVector = /\.(svg|pdf|ai)$/i.test(file.name);
    let width = null;
    let height = null;
    let colourCount = null;

    if (!isVector) {
      const img = new Image();
      img.src = previewPublicUrl;

      img.onload = async () => {
        width = img.width;
        height = img.height;
        colourCount = countUniqueColors(img);

        // Final DB write
        const { error: dbError } = await supabase.from('uploads').insert([
          {
            filename: file.name,
            file_type: fileType,
            is_vector: isVector,
            width,
            height,
            colour_count: colourCount,
            preview_url: previewPublicUrl,
            ip_address: '', // Optional enhancement: use client IP API
          }
        ]);

        setUploading(false);
        if (dbError) {
          console.error('DB insert error:', dbError);
          alert('Upload succeeded but DB save failed');
        } else {
          alert('Upload complete ✅');
        }
      };

      img.onerror = () => {
        alert('Image load failed');
        setUploading(false);
      };
    } else {
      // Vector = no pixel scan
      const { error: dbError } = await supabase.from('uploads').insert([
        {
          filename: file.name,
          file_type: fileType,
          is_vector: isVector,
          width: null,
          height: null,
          colour_count: null,
          preview_url: previewPublicUrl,
          ip_address: '',
        }
      ]);

      setUploading(false);
      if (dbError) {
        console.error('DB insert error:', dbError);
        alert('Upload succeeded but DB save failed');
      } else {
        alert('Upload complete ✅');
      }
    }
  };

  return (
    <div>
      <h2>Upload Your Logo</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {previewUrl && (
        <>
          <h3>Preview:</h3>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px' }} />
        </>
      )}
    </div>
  );
}
