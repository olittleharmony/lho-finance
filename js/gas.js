// ============================================================
// gas.js — Komunikasi ke GAS backend (upload, notif, sync)
// ============================================================

async function gasPost(action, payload = {}) {
  const res = await fetch(APP_CONFIG.GAS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'text/plain' }, // GAS butuh text/plain untuk avoid CORS preflight
    body:    JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

/**
 * Upload file bukti ke Google Drive via GAS proxy
 * Mengembalikan { url, directUrl, fileName, fileId }
 */
async function uploadBukti(file, category, uploaderName) {
  // Validasi sisi client
  const ALLOWED = ['image/jpeg','image/png','image/webp','image/heic','application/pdf'];
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Ukuran file maksimal 10MB.');
  }

  // Convert ke base64
  const base64 = await fileToBase64(file);

  return gasPost('uploadFile', {
    fileBase64:   base64,
    fileName:     file.name,
    mimeType:     file.type,
    uploaderName: uploaderName,
    category:     category,
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

async function sendNotification(type, recipientEmail, recipientName, data) {
  return gasPost('sendNotification', { type, recipientEmail, recipientName, data });
}

async function triggerSyncSheets(syncType = 'full') {
  return gasPost('syncToSheets', { syncType });
}

async function inviteMemberViaGAS(member) {
  return gasPost('inviteMember', member);
}
