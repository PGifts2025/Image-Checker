import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getOrCreateSessionId, getUserIP } from '../lib/session';
import { analyseImage } from '../lib/analyseImage';
import { uploadFile } from '../lib/upload';

export default function UploadButton() {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('Reading file...');
    setPreview(URL.createObjectURL(file));

    // Analyse file
    const analysis = await analyseImage(file);

    // Generate session + IP
    const session_id = getOrCreateSessionId();
    const ip_address = await getUserIP();

    // Upload to Supabase
    setStatus('Uploading to Supabase...');
    const result = await uploadFile({ file, analysis, session_id, ip_address });

    if (result?.success) {
      setStatus('✅ Uploaded successfully!');
    } else {
      setStatus('❌ Upload failed');
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow w-full max-w-md mx-auto mt-6">
      <label className="block font-medium mb-2">Upload your logo:</label>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      {preview && <img src={preview} alt="Preview" className="w-32 h-auto border mb-4" />}
      <p className="text-sm text-gray-700">{status}</p>
    </div>
  );
}
