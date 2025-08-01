import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function UploadLogo() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [ipAddress, setIpAddress] = useState('');

  // Generate or load session ID
  useEffect(() => {
    let id = localStorage.getItem('promo_session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('promo_session_id', id);
    }
    setSessionId(id);
  }, []);

  // Fetch IP address
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(err => console.warn('IP fetch failed:', err));
  }, []);

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
      if (colorSet.size > 1000) break;
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

        await logUpload({
          filename: file.name,
          file_type: fileType,
          is_vector: isVector,
          width,
          height,
          colour_count: colourCount,
          preview_url: previewPublicUrl,
        });
      };

      img.onerror = () => {
        alert('Image load failed');
        setUploading(false);
      };
    } else {
      await logUpload({
        filename: file.name,
        file_type: fileType,
        is_vector: isVector,
        preview_url: previewPublicUrl,
      });
    }
  };

  const logUpload = async (meta) => {
    const { error } = await supabase.from('uploads').insert([
      {
        ...meta,
        session_id: sessionId,
        ip_address: ipAddress,
        uploaded_at: new Date().toISOString(),
      }
    ]);

    setUploading(false);
    if (error) {
      console.error('DB insert error:', error);
      alert('Upload succeeded but DB save failed');
    } else {
      alert('Upload complete ✅');
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
