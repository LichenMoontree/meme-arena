import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';

const queue = document.getElementById('queue');

function renderMessage(html) {
  queue.innerHTML = html;
}

// ✅ Guard: must be logged in
const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();

if (sessionErr) {
  console.error(sessionErr);
  renderMessage(`<div class="alert alert-danger">Auth error. Check console.</div>`);
} else if (!sessionData.session) {
  renderMessage(`<div class="alert alert-info">Please login first. Redirecting…</div>`);
  setTimeout(() => (window.location.href = '/src/pages/login/index.html'), 2000);
} else {
  // Logged in (role check comes later)
  renderMessage(`<div class="alert alert-secondary">Admin panel will list pending memes here.</div>`);
}