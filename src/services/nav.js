import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/theme.css';
import { supabase } from './supabaseClient.js';

function esc(s) {
  return (s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function renderLogoWord(word) {
  return word.split('').map((ch) => `<span class="ma-letter">${ch}</span>`).join('');
}

export async function renderNav(active = '') {
  const nav = document.getElementById('appNav');
  if (!nav) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  let isAdmin = false;
  if (session) {
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();
    isAdmin = roleRow?.role === 'admin';
  }

  const links = [
    { key: 'home', label: 'Home', href: '/src/pages/home/index.html' },
    { key: 'upload', label: 'Upload', href: '/src/pages/upload/index.html', auth: true },
    { key: 'my', label: 'My Memes', href: '/src/pages/my-memes/index.html', auth: true },
    { key: 'admin', label: 'Admin', href: '/src/pages/admin/index.html', admin: true, auth: true },
  ];

  const visibleLinks = links.filter((l) => (!l.auth || session) && (!l.admin || isAdmin));

  const navLinksHtml = visibleLinks
    .map((l) => {
      const cls = l.key === active ? 'ma-navlink is-active' : 'ma-navlink';
      return `<a class="${cls}" href="${l.href}">${l.label}</a>`;
    })
    .join('');

  const right = session
    ? `
      <span class="text-muted small">${esc(session.user.email ?? 'Logged in')}</span>
      <button id="navLogout" class="btn btn-outline-danger btn-sm px-3" type="button">Logout</button>
    `
    : `
      <a class="btn btn-outline-primary btn-sm px-3" href="/src/pages/login/index.html">Login</a>
      <a class="btn btn-primary btn-sm px-3" href="/src/pages/register/index.html">Register</a>
    `;

  const logoHtml = `<span class="ma-title">${renderLogoWord('BATTLEMeme')}</span>`;

  nav.innerHTML = `
    <div class="container-fluid">
      <!-- Ribbon label row (white text on black strip) -->
      <div style="position: relative; top: -12px; height: 0; pointer-events:none;">
        <div style="position:absolute; left: 16px; top: 0; color: white; font-weight: 800; font-family: system-ui; font-size: 12px; letter-spacing: .12em;">
          MENU
        </div>
      </div>

      <div class="w-100 d-flex align-items-center justify-content-between gap-3 p-3">
        <a class="ma-brand" href="/src/pages/home/index.html">${logoHtml}</a>

        <div class="ma-navlinks">
          ${navLinksHtml}
        </div>

        <div class="d-flex align-items-center gap-2">
          ${right}
        </div>
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById('navLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/src/pages/home/index.html';
    });
  }
}