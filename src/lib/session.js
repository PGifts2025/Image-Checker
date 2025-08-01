// src/lib/session.js

export function getOrCreateSessionId() {
  const existing = localStorage.getItem('session_id');
  if (existing) return existing;

  const newId = crypto.randomUUID();
  localStorage.setItem('session_id', newId);
  return newId;
}

export async function getUserIP() {
  try {
    const res = await fetch('https://api64.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (err) {
    console.error("Failed to fetch IP address:", err);
    return null;
  }
}
