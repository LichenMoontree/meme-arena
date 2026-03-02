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

function showMsg(type, text) {
  msgEl.className = `alert alert-${type}`;
  msgEl.textContent = text;
  msgEl.classList.remove('d-none');
}

function publicUrl(path) {
  const { data } = supabase.storage.from('memes').getPublicUrl(path);
  return data.publicUrl;
}

if (!memeId) {
  showMsg('warning', 'Missing meme id in URL.');
} else {
  try {
    const { data: meme, error } = await supabase
      .from('memes')
      .select('id,title,image_path,created_at,status')
      .eq('id', memeId)
      .single();

    if (error) throw error;

    titleEl.textContent = meme.title;
    imgEl.src = publicUrl(meme.image_path);
    imgEl.alt = meme.title;
    metaEl.textContent = `Created: ${new Date(meme.created_at).toLocaleString()} • Status: ${meme.status}`;
  } catch (err) {
    console.error(err);
    showMsg('danger', err.message);
  }
}