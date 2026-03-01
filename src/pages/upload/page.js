import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';

const form = document.getElementById('uploadForm');
const msg = document.getElementById('msg');

function showMsg(type, text) {
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
  msg.classList.remove('d-none');
}
function hideMsg() {
  msg.classList.add('d-none');
  msg.textContent = '';
}

// ✅ Guard: must be logged in
const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
if (sessionErr) {
  console.error(sessionErr);
  showMsg('danger', 'Auth error. Check console.');
} else if (!sessionData.session) {
  showMsg('info', 'Please login first. Redirecting…');
  setTimeout(() => (window.location.href = '/src/pages/login/index.html'), 2000);
  // Stop here (don’t attach submit handler)
} else {
  // Logged in: enable upload
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg();

    const title = document.getElementById('title').value.trim();
    const file = document.getElementById('file').files[0];

    if (!title || !file) {
      showMsg('warning', 'Title and image are required.');
      return;
    }

    const userId = sessionData.session.user.id;

    const submitBtn = form.querySelector('button[type="submit"]');
    const oldBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading…';

    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const safeExt = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) ? ext : 'png';
      const path = `${userId}/${crypto.randomUUID()}.${safeExt}`;

      const { error: upErr } = await supabase.storage.from('memes').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from('memes').insert([
        { owner_id: userId, title, image_path: path, status: 'pending' },
      ]);
      if (dbErr) throw dbErr;

      showMsg('success', 'Uploaded! Meme is pending approval.');
      form.reset();
    } catch (err) {
      console.error(err);
      showMsg('danger', err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = oldBtnText;
    }
  });
}