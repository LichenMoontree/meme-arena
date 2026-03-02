import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';
import { renderNav } from '../../services/nav.js';

await renderNav('');

const params = new URLSearchParams(window.location.search);
const memeId = params.get('id');

const titleEl = document.getElementById('title');
const imgEl = document.getElementById('img');
const metaEl = document.getElementById('meta');
const msgEl = document.getElementById('msg');

const voteBox = document.getElementById('voteBox');
const loginHint = document.getElementById('loginHint');
const scoreEl = document.getElementById('score');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');

const commentsEl = document.getElementById('comments');
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('comment');

function showMsg(type, text) {
  msgEl.className = `alert alert-${type}`;
  msgEl.textContent = text;
  msgEl.classList.remove('d-none');
}
function hideMsg() {
  msgEl.classList.add('d-none');
  msgEl.textContent = '';
}

function publicUrl(path) {
  const { data } = supabase.storage.from('memes').getPublicUrl(path);
  return data.publicUrl;
}
function esc(s) {
  return (s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

if (!memeId) {
  showMsg('warning', 'Missing meme id in URL.');
} else {
  await boot();
}

async function boot() {
  hideMsg();

  const { data: meme, error: memeErr } = await supabase
    .from('memes')
    .select('id,title,image_path,created_at,status,owner_id')
    .eq('id', memeId)
    .single();

  if (memeErr) {
    console.error(memeErr);
    showMsg('danger', memeErr.message);
    return;
  }

  titleEl.textContent = meme.title;
  imgEl.src = publicUrl(meme.image_path);
  imgEl.alt = meme.title;
  metaEl.textContent = `Created: ${new Date(meme.created_at).toLocaleString()} • Status: ${meme.status}`;

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  const userId = session?.user?.id ?? null;

  if (userId) {
    voteBox.classList.remove('d-none');
    commentForm.classList.remove('d-none');
    loginHint.classList.add('d-none');
  } else {
    voteBox.classList.add('d-none');
    commentForm.classList.add('d-none');
    loginHint.classList.remove('d-none');
  }

  await refreshScore();
  await refreshComments(userId);

  if (userId) {
    upBtn.onclick = async () => {
      await vote(userId, 1);
      await refreshScore();
    };
    downBtn.onclick = async () => {
      await vote(userId, -1);
      await refreshScore();
    };

    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const content = commentInput.value.trim();
      if (!content) return;

      const { error } = await supabase.from('comments').insert([
        { meme_id: Number(memeId), user_id: userId, content },
      ]);

      if (error) {
        console.error(error);
        showMsg('danger', error.message);
        return;
      }

      commentInput.value = '';
      await refreshComments(userId);
    };
  }
}

async function refreshScore() {
  const { data, error } = await supabase.from('votes').select('value').eq('meme_id', Number(memeId));
  if (error) {
    console.error(error);
    showMsg('danger', error.message);
    return;
  }
  const score = (data ?? []).reduce((a, v) => a + (v.value || 0), 0);
  scoreEl.textContent = String(score);
}

async function vote(userId, value) {
  hideMsg();
  const { error } = await supabase
    .from('votes')
    .upsert({ meme_id: Number(memeId), user_id: userId, value }, { onConflict: 'meme_id,user_id' });

  if (error) {
    console.error(error);
    showMsg('danger', error.message);
  }
}

async function refreshComments(userId) {
  const { data, error } = await supabase
    .from('comments')
    .select('id,user_id,content,created_at')
    .eq('meme_id', Number(memeId))
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    showMsg('danger', error.message);
    return;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    commentsEl.innerHTML = `<div class="text-muted">No comments yet.</div>`;
    return;
  }

  commentsEl.innerHTML = rows
    .map((c) => {
      const canDelete = userId && c.user_id === userId;
      return `
        <div class="border rounded p-2 mb-2">
          <div class="small text-muted">${new Date(c.created_at).toLocaleString()}</div>
          <div>${esc(c.content)}</div>
          ${
            canDelete
              ? `<button class="btn btn-outline-danger btn-sm mt-2" data-del="${c.id}">Delete</button>`
              : ''
          }
        </div>
      `;
    })
    .join('');

  commentsEl.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      if (!confirm('Delete this comment?')) return;

      const { error: delErr } = await supabase.from('comments').delete().eq('id', Number(id));
      if (delErr) {
        console.error(delErr);
        showMsg('danger', delErr.message);
        return;
      }
      await refreshComments(userId);
    });
  });
}