import { supabase } from './supabase';

export async function uploadFile({ file, analysis, session_id, ip_address }) {
  const filePath = `${Date.now()}-${file.name}`;

  const { data: storageData, error: storageError } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);

  if (storageError) {
    console.error('Storage upload error:', storageError.message);
    return { success: false };
  }

  const { error: insertError } = await supabase.from('uploads').insert([{
    filename: file.name,
    type: file.type,
    size: file.size,
    color_mode: analysis.colorMode,
    format: analysis.format,
    vector_detected: analysis.vectorDetected,
    session_id,
    ip_address,
    created_at: new Date().toISOString(),
  }]);

  if (insertError) {
    console.error('Database insert error:', insertError.message);
    return { success: false };
  }

  return { success: true, filePath };
}
