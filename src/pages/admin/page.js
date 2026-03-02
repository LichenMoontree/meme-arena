import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';

const queue = document.getElementById('queue');

function render(html) {
  queue.innerHTML = html;
}

// 1) Must be logged in
const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();

if (sessionErr) {
  console.error(sessionErr);
  render(`<div class="alert alert-danger">Auth error. Check console.</div>`);
} else if (!sessionData.session) {
  render(`<div class="alert alert-info">Please login first. Redirecting…</div>`);
  setTimeout(() => (window.location.href = '/src/pages/login/index.html'), 2000);
} else {
  // 2) Must be admin
  const userId = sessionData.session.user.id;

  const { data: roleRow, error: roleErr } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleErr) {
    console.error(roleErr);
    render(`<div class="alert alert-danger">Role check failed. Check console.</div>`);
  } else if (roleRow?.role !== 'admin') {
    render(`<div class="alert alert-warning">Admins only. Redirecting…</div>`);
    setTimeout(() => (window.location.href = '/src/pages/home/index.html'), 2000);
  } else {
    render(`<div class="alert alert-success">Admin access granted ✅</div>
            <div class="alert alert-secondary mt-3">Next: we’ll list pending memes here.</div>`);
  }
}