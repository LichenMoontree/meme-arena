import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';
import { renderNav } from '../../services/nav.js';

await renderNav('admin');

const queue = document.getElementById('queue');

function render(html) {
  queue.innerHTML = html;
}

function publicUrl(path) {
  const { data } = supabase.storage.from('memes').getPublicUrl(path);
  return data.publicUrl;
}

function esc(s) {
  return (s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// Must be logged in
const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();

if (sessionErr) {
  console.error(sessionErr);
  render(`<div class="alert alert-danger">Auth error. Check console.</div>`);
} else if (!sessionData.session) {
  render(`<div class="alert alert-info">Please login first. Redirecting…</div>`);
  setTimeout(() => (window.location.href = '/src/pages/login/index.html'), 2000);
} else {
  // Must be admin
  const userId = sessionData.session.user.id;

  const { data: roleRow, error: roleErr } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleErr) {
    console.error(roleErr);
    render(`<div class="alert alert-danger">Role check failed. Check console.</div>`);
  } else if (roleRow?.role !== 'admin') {
    render(`<div class="alert alert-warning">Admins only. Redirecting…</div>`);
    setTimeout(() => (window.location.href = '/src/pages/home/index.html'), 2000);
  } else {
    await bootAdmin();
  }
}

async function loadPending() {
  const { data, error } = await supabase
    .from('memes')
    .select('id,title,image_path,created_at,status')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function setStatus(id, status) {
  const { error } = await supabase.from('memes').update({ status }).eq('id', id);
  if (error) throw error;
}

async function removeMeme(id) {
  const { error } = await supabase.from('memes').delete().eq('id', id);
  if (error) throw error;
}

async function bootAdmin() {
  render(`
    <div id="msg" class="alert d-none" role="alert"></div>
    <div id="pendingList" class="row g-3"></div>
  `);

  const msg = document.getElementById('msg');
  const list = document.getElementById('pendingList');

  function showMsg(type, text) {
    msg.className = `alert alert-${type}`;
    msg.textContent = text;
    msg.classList.remove('d-none');
  }
  function hideMsg() {
    msg.classList.add('d-none');
    msg.textContent = '';
  }

  async function refresh() {
    hideMsg();
    const pending = await loadPending();

    if (pending.length === 0) {
      list.innerHTML = `<div class="text-muted">No pending memes 🎉</div>`;
      return;
    }

    list.innerHTML = pending
      .map((m) => {
        const img = publicUrl(m.image_path);
        return `
          <div class="col-12 col-sm-6 col-lg-4">
            <div class="card h-100">
              <img src="${img}" class="card-img-top" alt="${esc(m.title)}"
                   style="height:220px; object-fit:cover;" />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${esc(m.title)}</h5>
                <div class="small text-muted mb-3">${new Date(m.created_at).toLocaleString()}</div>

                <div class="mt-auto d-flex gap-2">
                  <button class="btn btn-primary btn-sm px-3" data-approve="${m.id}">Approve</button>
                  <button class="btn btn-outline-danger btn-sm px-3" data-reject="${m.id}">Reject</button>
                  <button class="btn btn-outline-primary btn-sm px-3" data-delete="${m.id}">Delete</button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    list.querySelectorAll('[data-approve]').forEach((b) =>
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-approve');
        b.disabled = true;
        try {
          await setStatus(id, 'approved');
          showMsg('success', 'Approved.');
          await refresh();
        } catch (err) {
          console.error(err);
          showMsg('danger', err.message);
        } finally {
          b.disabled = false;
        }
      })
    );

    list.querySelectorAll('[data-reject]').forEach((b) =>
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-reject');
        b.disabled = true;
        try {
          await setStatus(id, 'rejected');
          showMsg('warning', 'Rejected.');
          await refresh();
        } catch (err) {
          console.error(err);
          showMsg('danger', err.message);
        } finally {
          b.disabled = false;
        }
      })
    );

    list.querySelectorAll('[data-delete]').forEach((b) =>
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-delete');
        if (!confirm('Delete this meme permanently?')) return;

        b.disabled = true;
        try {
          await removeMeme(id);
          showMsg('secondary', 'Deleted.');
          await refresh();
        } catch (err) {
          console.error(err);
          showMsg('danger', err.message);
        } finally {
          b.disabled = false;
        }
      })
    );
  }

  try {
    await refresh();
  } catch (err) {
    console.error(err);
    render(`<div class="alert alert-danger">Failed to load pending memes. Check console.</div>`);
  }
}