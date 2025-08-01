import React from 'react';
import ProofingWidget from '../components/ProofingWidget';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">Promo Gifts Proofing Tool</h1>
      <p className="mb-6">Upload your logo to preview it on our best-selling products.</p>
      <ProofingWidget />
    </main>
  );
}
