import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';
import { renderNav } from '../../services/nav.js';

await renderNav('register');

const form = document.getElementById('registerForm');
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

  const displayName = document.getElementById('displayName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const btn = form.querySelector('button[type="submit"]');
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Creating…';

  try {
    // 1) Sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (signUpError) throw signUpError;

    // 2) If Supabase returned a session, user is already logged in
    if (signUpData?.session) {
      showMsg('success', 'Welcome! Logging you in…');
      setTimeout(() => (window.location.href = '/src/pages/upload/index.html'), 2000);
      return;
    }

    // 3) If no session returned, try logging in directly (works if confirmation not required / user is confirmed)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData?.session) {
      showMsg('success', 'Welcome! You’re in. 😈');
      setTimeout(() => (window.location.href = '/src/pages/upload/index.html'), 2000);
      return;
    }

    // 4) Fallback: send to login page with email prefilled
    showMsg('success', 'Account created. Please log in to continue.');
    form.reset();
    setTimeout(() => {
      window.location.href = `/src/pages/login/index.html?email=${encodeURIComponent(email)}`;
    }, 2000);
  } catch (err) {
    console.error(err);
    showMsg('danger', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
});