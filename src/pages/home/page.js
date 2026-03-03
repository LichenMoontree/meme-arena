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

function esc(s) {
  return (s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
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

function isNew(createdAt) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < 24 * 60 * 60 * 1000; // 24h
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
      const newBadge = isNew(m.created_at)
        ? `<span class="badge rounded-pill" style="background: rgba(239,98,108,0.14); color: #22181C;">NEW</span>`
        : '';

      return `
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100">
            <div style="position:relative;">
              <img src="${img}" class="card-img-top" alt="${esc(m.title)}"
                   style="height:220px; object-fit:cover;" />
              <div style="position:absolute; top:12px; left:12px;">
                ${newBadge}
              </div>
            </div>

            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <h5 class="card-title mb-1" style="line-height:1.2;">${esc(m.title)}</h5>
              </div>

              <div class="small text-muted mb-3">${new Date(m.created_at).toLocaleString()}</div>

              <div class="mt-auto">
                <a class="btn btn-primary btn-sm px-3" href="/src/pages/meme/index.html?id=${m.id}">Open</a>
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