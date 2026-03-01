import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';

const form = document.getElementById('registerForm');
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

// ✅ Guard: if already logged in, send away
const { data: sessionData } = await supabase.auth.getSession();
if (sessionData.session) {
  window.location.href = '/src/pages/home/index.html';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMsg();

  const displayName = document.getElementById('displayName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const btn = form.querySelector('button[type="submit"]');
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Creating…';

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) throw error;

    showMsg(
      'success',
      `Registered! <a class="btn btn-success btn-sm ms-2" href="/src/pages/login/index.html">Go to Login</a>`
    );
    form.reset();
  } catch (err) {
    console.error(err);
    showMsg('danger', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
});