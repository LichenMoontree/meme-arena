import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';

const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

function showMsg(type, html) {
  msg.className = `alert alert-${type}`;
  msg.innerHTML = html;
  msg.classList.remove('d-none');
}
function hideMsg() {
  msg.classList.add('d-none');
  msg.textContent = '';
}

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

    showMsg(
      'success',
      `Logged in! <a class="btn btn-success btn-sm ms-2" href="/src/pages/upload/index.html">Continue</a>`
    );
  } catch (err) {
    console.error(err);
    showMsg('danger', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
});