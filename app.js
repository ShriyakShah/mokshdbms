// Supabase config
const SUPABASE_URL = 'https://idzzufagowkpnfmsnwfn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkenp1ZmFnb3drcG5mbXNud2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjc4NjcsImV4cCI6MjA2MzkwMzg2N30.UGmclAbiYW94kXQwilsjbgaKdGmsTqoL2004PNwT2IU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const forgotLink = document.getElementById('forgotPassword');
const forgotContainer = document.querySelector('.forgot-container');
const loginContainer = document.querySelector('.login-container');
const backBtn = document.getElementById('backBtn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Supabase login (using email as username)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password: password
  });

  if (error) {
    errorMsg.textContent = 'Invalid username or password.';
  } else {
    // Redirect to home page (placeholder)
    window.location.href = 'home.html';
  }
});

forgotLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginContainer.style.display = 'none';
  forgotContainer.style.display = 'block';
});

backBtn.addEventListener('click', () => {
  forgotContainer.style.display = 'none';
  loginContainer.style.display = 'block';
});
