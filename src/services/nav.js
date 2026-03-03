import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/theme.css';
import { supabase } from './supabaseClient.js';

function esc(s) {
  return (s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export async function renderNav(active = '') {
  const nav = document.getElementById('appNav');
  if (!nav) return;

  nav.className = 'p-3 d-flex justify-content-between align-items-center flex-wrap gap-2';

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  const links = [
    { key: 'home', label: 'Home', href: '/src/pages/home/index.html' },
    { key: 'upload', label: 'Upload', href: '/src/pages/upload/index.html', auth: true },
    { key: 'my', label: 'My Memes', href: '/src/pages/my-memes/index.html', auth: true },
    { key: 'admin', label: 'Admin', href: '/src/pages/admin/index.html', admin: true, auth: true },
  ];

  let isAdmin = false;
  if (session) {
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();
    isAdmin = roleRow?.role === 'admin';
  }

  const left = links
    .filter((l) => (!l.auth || session) && (!l.admin || isAdmin))
    .map((l) => {
      const isActive = l.key === active;
      return `
        <a class="btn btn-sm ma-pill ${isActive ? 'btn-primary' : 'btn-outline-primary'}"
           href="${l.href}">
          ${l.label}
        </a>`;
    })
    .join('');

  const right = session
    ? `
      <span class="text-muted small">${esc(session.user.email ?? 'Logged in')}</span>
      <button id="navLogout" class="btn btn-outline-danger btn-sm ma-pill" type="button">Logout</button>
    `
    : `
      <a class="btn btn-outline-primary btn-sm ma-pill" href="/src/pages/login/index.html">Login</a>
      <a class="btn btn-primary btn-sm ma-pill" href="/src/pages/register/index.html">Register</a>
    `;

  nav.innerHTML = `
    <div class="d-flex align-items-center flex-wrap gap-2">
      <a class="ma-link ma-brand me-2" href="/src/pages/home/index.html">🎭 Meme Arena</a>
      ${left}
    </div>
    <div class="d-flex align-items-center flex-wrap gap-2">${right}</div>
  `;

  const logoutBtn = document.getElementById('navLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/src/pages/home/index.html';
    });
  }
}