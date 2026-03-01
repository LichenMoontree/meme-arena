import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '../../services/supabaseClient.js';

console.log('Home page loaded');

const statusEl = document.getElementById('sbStatus');
if (statusEl) statusEl.textContent = 'Checking Supabase…';

const { data, error } = await supabase.auth.getSession();

if (error) {
  console.error(error);
  if (statusEl) statusEl.textContent = 'Supabase error (see console).';
} else {
  if (statusEl) {
    statusEl.textContent = data.session
      ? 'Logged in session detected.'
      : 'Supabase OK (no session).';
  }
  console.log('Session:', data.session);
}