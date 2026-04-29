// ============================================================
// ui.js — UI helpers: toast, modal, format, loading
// ============================================================

// ---- Toast ----
function showToast(message, type = 'info') {
  const existing = document.getElementById('lho-toast');
  if (existing) existing.remove();

  const colors = {
    success: '#2e7d32', error: '#c62828', info: '#1565c0', warning: '#e65100'
  };
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  const toast = document.createElement('div');
  toast.id = 'lho-toast';
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${colors[type]}; color:#fff;
    padding:12px 20px; border-radius:8px;
    font-size:14px; font-family:inherit;
    display:flex; align-items:center; gap:8px;
    box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation:slideIn .2s ease; max-width:320px;
  `;
  toast.innerHTML = `<span style="font-size:16px">${icons[type]}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.style.opacity = '0', 3000);
  setTimeout(() => toast.remove(), 3300);
}

// ---- Loading button ----
function setLoading(btn, loading, text = '') {
  if (loading) {
    btn._originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>${text || 'Memproses...'}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._originalText || text;
  }
}

// ---- Modal ----
function showModal(title, bodyHtml, onConfirm = null, confirmText = 'Konfirmasi') {
  const existing = document.getElementById('lho-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'lho-modal';
  modal.style.cssText = `
    position:fixed; inset:0; z-index:9998;
    background:rgba(0,0,0,0.5);
    display:flex; align-items:center; justify-content:center; padding:16px;
  `;
  modal.innerHTML = `
    <div style="background:#fff; border-radius:12px; padding:24px;
                max-width:480px; width:100%; font-family:inherit;">
      <h3 style="margin:0 0 16px; font-size:17px; color:#1a1a2e">${title}</h3>
      <div style="font-size:14px; color:#444; line-height:1.6; margin-bottom:24px">
        ${bodyHtml}
      </div>
      <div style="display:flex; gap:10px; justify-content:flex-end">
        <button id="modal-cancel" class="btn btn-ghost">Batal</button>
        ${onConfirm ? `<button id="modal-confirm" class="btn btn-primary">${confirmText}</button>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('modal-cancel').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  if (onConfirm) {
    document.getElementById('modal-confirm').onclick = async () => {
      modal.remove();
      await onConfirm();
    };
  }
}

// ---- Format helpers ----
function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function formatPeriod(period) {
  if (!period) return '-';
  const [y, m] = period.split('-');
  const months = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${months[parseInt(m)]} ${y}`;
}

function formatDate(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('id-ID', {
    day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
  });
}

function formatDateOnly(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('id-ID', {
    day:'2-digit', month:'short', year:'numeric'
  });
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
}

// ---- Status badge ----
function statusBadge(status) {
  const map = {
    pending:   { label:'Menunggu', color:'#e65100', bg:'#fff3e0' },
    confirmed: { label:'Dikonfirmasi', color:'#2e7d32', bg:'#e8f5e9' },
    rejected:  { label:'Ditolak', color:'#c62828', bg:'#ffebee' },
  };
  const s = map[status] || { label: status, color:'#555', bg:'#f0f0f0' };
  return `<span style="background:${s.bg};color:${s.color};padding:3px 10px;
    border-radius:20px;font-size:12px;font-weight:600">${s.label}</span>`;
}

function typeBadge(type) {
  const map = {
    kas:        { label:'Kas Bulanan', color:'#1565c0', bg:'#e3f2fd' },
    reimburse:  { label:'Reimburse',   color:'#6a1b9a', bg:'#f3e5f5' },
    donasi:     { label:'Donasi',      color:'#0f6e56', bg:'#e1f5ee' },
    pengeluaran:{ label:'Pengeluaran', color:'#c62828', bg:'#ffebee' },
    pemasukan:  { label:'Pemasukan',   color:'#2e7d32', bg:'#e8f5e9' },
    transfer:   { label:'Transfer',    color:'#e65100', bg:'#fff3e0' },
    honorarium: { label:'Honorarium',  color:'#4527a0', bg:'#ede7f6' },
  };
  const t = map[type] || { label: type, color:'#555', bg:'#f0f0f0' };
  return `<span style="background:${t.bg};color:${t.color};padding:3px 10px;
    border-radius:20px;font-size:12px;font-weight:600">${t.label}</span>`;
}

// ---- Navbar render ----
function renderNavbar(profile, activePage) {
  const isAdmin = profile?.role === 'admin';
  const memberLinks = [
    { href:'dashboard.html',  label:'Dashboard', id:'dashboard' },
    { href:'kas.html',        label:'Bayar Kas',  id:'kas' },
    { href:'reimburse.html',  label:'Reimburse',  id:'reimburse' },
    { href:'riwayat.html',    label:'Riwayat',    id:'riwayat' },
  ];
  const adminLinks = [
    { href:'admin-dashboard.html', label:'Dashboard',  id:'admin-dashboard' },
    { href:'admin-validasi.html',  label:'Validasi',   id:'admin-validasi' },
    { href:'admin-transaksi.html', label:'Transaksi',  id:'admin-transaksi' },
    { href:'admin-laporan.html',   label:'Laporan',    id:'admin-laporan' },
    { href:'admin-kas-import.html',label:'Import Kas', id:'admin-kas-import' },
    { href:'admin-member.html',    label:'Member',     id:'admin-member' },
    { href:'admin-attend.html',    label:'Absensi',    id:'admin-attend' },
    { href:'admin-setting.html',   label:'Pengaturan', id:'admin-setting' },
  ];
  const links = isAdmin ? adminLinks : memberLinks;

  return `
  <nav class="navbar">
    <div class="navbar-brand">${APP_CONFIG.APP_NAME}</div>
    <button class="navbar-toggle" onclick="toggleMobileNav()" aria-label="Menu">☰</button>
    <div class="navbar-links" id="navbar-links">
      ${links.map(l => `
        <a href="${l.href}" class="nav-link ${activePage === l.id ? 'active' : ''}">${l.label}</a>
      `).join('')}
      <div class="nav-divider"></div>
      <span class="nav-user">${profile?.full_name?.split(' ')[0] || ''}</span>
      <button class="btn btn-ghost btn-sm" onclick="signOut()">Keluar</button>
    </div>
  </nav>`;
}

function toggleMobileNav() {
  document.getElementById('navbar-links')?.classList.toggle('open');
}
