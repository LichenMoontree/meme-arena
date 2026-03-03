import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';
import { renderNav } from '../../services/nav.js';

await renderNav('');

const form = document.getElementById('loginForm');
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

const { data: sessionData } = await supabase.auth.getSession();
if (sessionData.session) window.location.href = '/src/pages/home/index.html';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMsg();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const btn = form.querySelector('button[type="submit"]');
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Logging in…';

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    showMsg('success', 'Logged in! Redirecting…');
    setTimeout(() => (window.location.href = '/src/pages/home/index.html'), 800);
  } catch (err) {
    console.error(err);
    showMsg('danger', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
});