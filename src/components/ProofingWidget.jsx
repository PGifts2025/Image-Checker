import React, { useState } from 'react';
import UploadButton from './UploadButton';
import { uploadFile } from '../lib/upload';
import { analyseImage } from '../lib/analyseImage';
import { storeUploadMeta } from '../lib/session';

export default function ProofingWidget({ productId }) {
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(file) {
    try {
      setIsUploading(true);
      setError(null);

      const analysis = await analyseImage(file);
      const path = await uploadFile(file);

      const metadata = {
        product_id: productId || null,
        ...analysis,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        path,
      };

      await storeUploadMeta(metadata);
      setUploadResult(metadata);
    } catch (err) {
      console.error('Upload failed', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }
