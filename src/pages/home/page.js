import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';
import { renderNav } from '../../services/nav.js';

await renderNav('home');

const statusEl = document.getElementById('sbStatus');
const feedEl = document.getElementById('feed');

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function publicUrl(path) {
  const { data } = supabase.storage.from('memes').getPublicUrl(path);
  return data.publicUrl;
}

function escapeHtml(s) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

async function loadApproved() {
  const { data, error } = await supabase
    .from('memes')
    .select('id,title,image_path,created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

function renderFeed(memes) {
  if (!feedEl) return;

  if (memes.length === 0) {
    feedEl.innerHTML = `<div class="text-muted">No approved memes yet.</div>`;
    return;
  }

  feedEl.innerHTML = memes
    .map((m) => {
      const img = publicUrl(m.image_path);
      return `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm">
            <img src="${img}" class="card-img-top" alt="${escapeHtml(m.title)}"
                 style="max-height:260px;object-fit:cover;" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${escapeHtml(m.title)}</h5>
              <div class="small text-muted">${new Date(m.created_at).toLocaleString()}</div>
              <div class="mt-auto pt-3">
                <a class="btn btn-primary btn-sm" href="/src/pages/meme/index.html?id=${m.id}">Open</a>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

try {
  setStatus('Loading approved memes…');
  const memes = await loadApproved();
  renderFeed(memes);
  setStatus('Ready.');
} catch (err) {
  console.error(err);
  setStatus('Failed to load (see console).');
}