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

async function loadApprovedWithStats() {
  // Pull memes + stats via a join on the view
  const { data, error } = await supabase
    .from('memes')
    .select('id,title,image_path,created_at,meme_stats(score,comments_count)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((m) => ({
    ...m,
    score: m.meme_stats?.score ?? 0,
    comments: m.meme_stats?.comments_count ?? 0,
  }));
}

function isNew(createdAt) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < 24 * 60 * 60 * 1000;
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
        ? `<span class="badge rounded-pill" style="background: rgba(239,98,108,0.12); color:#22181C;">NEW</span>`
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
              <div style="position:absolute; top:12px; right:12px;">
                <span class="badge rounded-pill" style="background: rgba(89,201,165,0.18); color:#22181C;">
                  ▲ ${m.score}
                </span>
              </div>
            </div>

            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-1" style="line-height:1.2;">${esc(m.title)}</h5>
              <div class="small text-muted mb-2">${new Date(m.created_at).toLocaleString()}</div>

              <div class="d-flex align-items-center justify-content-between mt-auto pt-2">
                <span class="small text-muted">💬 ${m.comments}</span>
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
  const memes = await loadApprovedWithStats();
  renderFeed(memes);
  setStatus('Ready.');
} catch (err) {
  console.error(err);
  setStatus('Failed to load (see console).');
}