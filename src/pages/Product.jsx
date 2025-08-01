import React from 'react';
import { useParams } from 'react-router-dom';
import ProofingWidget from '../components/ProofingWidget';

export default function Product() {
  const { id } = useParams();

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-semibold mb-2">Product ID: {id}</h1>
      <p className="mb-4">Use the tool below to see your logo on this product.</p>
      <ProofingWidget productId={id} />
    </main>
  );
}
