import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';
import { renderNav } from '../../services/nav.js';

await renderNav('my');

const msg = document.getElementById('msg');
const list = document.getElementById('list');

function showMsg(type, text) {
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove('d-none');
}
function hideMsg() {
  msg.classList.add('d-none');
  msg.textContent = '';
}

function badgeForStatus(status) {
  if (status === 'approved') return 'bg-success';
  if (status === 'pending') return 'bg-warning text-dark';
  if (status === 'rejected') return 'bg-danger';
  return 'bg-secondary';
}

function publicUrl(path) {
  const { data } = supabase.storage.from('memes').getPublicUrl(path);
  return data.publicUrl;
}

// ✅ Guard: must be logged in
const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
if (sessionErr) {
  console.error(sessionErr);
  showMsg('danger', 'Auth error. Check console.');
} else if (!sessionData.session) {
  showMsg('info', 'Please login first. Redirecting…');
  setTimeout(() => (window.location.href = '/src/pages/login/index.html'), 2000);
} else {
  const userId = sessionData.session.user.id;

  async function loadMyMemes() {
    const { data, error } = await supabase
      .from('memes')
      .select('id,title,image_path,status,created_at,owner_id')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async function deleteMeme(id) {
    const { error } = await supabase.from('memes').delete().eq('id', id);
    if (error) throw error;
  }

  function render(memes) {
    if (memes.length === 0) {
      list.innerHTML = `<div class="text-muted">No memes yet. Upload one!</div>`;
      return;
    }

    list.innerHTML = memes
      .map((m) => {
        const img = publicUrl(m.image_path);
        return `
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
              <img src="${img}" class="card-img-top" alt="${escapeHtml(m.title)}"
                   style="max-height:260px;object-fit:cover;" />
              <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <h5 class="card-title mb-0">${escapeHtml(m.title)}</h5>
                  <span class="badge ${badgeForStatus(m.status)}">${m.status}</span>
                </div>
                <div class="mt-auto pt-3 d-flex gap-2">
                  <a class="btn btn-outline-primary btn-sm" href="/src/pages/meme/index.html?id=${m.id}">Open</a>
                  <button class="btn btn-outline-danger btn-sm" data-del="${m.id}">Delete</button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    list.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-del');
        if (!confirm('Delete this meme?')) return;

        hideMsg();
        btn.disabled = true;

        try {
          await deleteMeme(id);
          showMsg('success', 'Deleted.');
          await boot();
        } catch (err) {
          console.error(err);
          showMsg('danger', err.message);
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  function escapeHtml(s) {
    return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  async function boot() {
    try {
      const memes = await loadMyMemes();
      render(memes);
    } catch (err) {
      console.error(err);
      showMsg('danger', err.message);
    }
  }

  boot();
}