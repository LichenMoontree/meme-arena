import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/theme.css';
import { supabase } from './supabaseClient.js';

function esc(s) {
  return (s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
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

  const pillLinks = visibleLinks
    .map((l) => {
      const isActive = l.key === active;
      return `
        <a class="btn btn-sm ma-pill ${isActive ? 'btn-primary' : 'btn-outline-primary'} px-3"
           href="${l.href}">
          ${l.label}
        </a>`;
    })
    .join('');

  const authBlockDesktop = session
    ? `
      <div class="d-flex align-items-center gap-2">
        <span class="text-muted small">${esc(session.user.email ?? 'Logged in')}</span>
        <button id="navLogout" class="btn btn-outline-danger btn-sm ma-pill px-3" type="button">Logout</button>
      </div>
    `
    : `
      <div class="d-flex align-items-center gap-2">
        <a class="btn btn-outline-primary btn-sm ma-pill px-3" href="/src/pages/login/index.html">Login</a>
        <a class="btn btn-primary btn-sm ma-pill px-3" href="/src/pages/register/index.html">Register</a>
      </div>
    `;

  const authBlockMobile = session
    ? `
      <div class="d-flex flex-column gap-2 mt-2">
        <div class="text-muted small">${esc(session.user.email ?? 'Logged in')}</div>
        <button id="navLogoutMobile" class="btn btn-outline-danger btn-sm ma-pill px-3" type="button">Logout</button>
      </div>
    `
    : `
      <div class="d-flex flex-column gap-2 mt-2">
        <a class="btn btn-outline-primary btn-sm ma-pill px-3" href="/src/pages/login/index.html">Login</a>
        <a class="btn btn-primary btn-sm ma-pill px-3" href="/src/pages/register/index.html">Register</a>
      </div>
    `;

  // Full-width, responsive layout:
  nav.innerHTML = `
    <div class="container-fluid">
      <!-- Desktop -->
      <div class="ma-desktop w-100 align-items-center justify-content-between gap-3 p-3">
        <a class="ma-brand" href="/src/pages/home/index.html">🎭 Meme Arena</a>

        <div class="d-flex align-items-center justify-content-center gap-3 flex-wrap">
          ${pillLinks}
        </div>

        ${authBlockDesktop}
      </div>

      <!-- Mobile -->
      <div class="ma-mobile p-3">
        <div class="d-flex align-items-center justify-content-between gap-2">
          <a class="ma-brand" href="/src/pages/home/index.html">🎭 Meme Arena</a>

          <details class="ma-menu">
            <summary class="ma-hamburger">☰ Menu</summary>

            <div class="ma-menu-panel">
              <div class="d-flex flex-wrap gap-2">
                ${pillLinks}
              </div>
              ${authBlockMobile}
            </div>
          </details>
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

  const logoutBtnMobile = document.getElementById('navLogoutMobile');
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = '/src/pages/home/index.html';
    });
  }
}