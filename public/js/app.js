// public/js/app.js — shared utilities

/* ── DARK MODE ─────────────────────────────────────────────
   Persists in localStorage as 'vm_theme' = 'dark' | 'light'
   Applied to <html data-theme="dark|light">
   Works across all pages — apply on every page load first.
   ──────────────────────────────────────────────────────── */
(function applyThemeEarly() {
  const saved = localStorage.getItem('vm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleDarkMode() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('vm_theme', next);
  updateAllDmToggles(next);
}

function updateAllDmToggles(theme) {
  document.querySelectorAll('.dm-label').forEach(el => {
    el.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
  document.querySelectorAll('.dm-toggle').forEach(btn => {
    btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  });
}

function buildDmToggle() {
  const saved = localStorage.getItem('vm_theme') || 'light';
  const isDark = saved === 'dark';
  return `<button class="dm-toggle" onclick="toggleDarkMode()" title="${isDark ? 'Switch to light mode' : 'Switch to dark mode'}">
    <span class="dm-label">${isDark ? '☀️' : '🌙'}</span>
  </button>`;
}

const API = {
  async get(url) { const r = await fetch(url,{credentials:'include',cache:'no-store'}); return r.json(); },
  async post(url,data) { const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(data)}); return r.json(); },
  async put(url,data) { const r = await fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(data)}); return r.json(); },
  async delete(url) { const r = await fetch(url,{method:'DELETE',credentials:'include'}); return r.json(); }
};

function showToast(msg, isErr=false) {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.style.background = isErr ? '#ef4444' : 'var(--sky-dark)';
  t.style.transform = 'translateY(0)'; t.style.opacity = '1';
  setTimeout(()=>{ t.style.transform='translateY(100px)'; t.style.opacity='0'; }, 2800);
}

function getCatClass(cat) {
  const m = {'Beach':'cat-beach','Wildlife':'cat-wildlife','Nature':'cat-nature','Religious':'cat-religious','Historical':'cat-historical','Museum':'cat-museum','Recreation':'cat-recreation','Cultural':'cat-cultural','Urban Park':'cat-urban-park'};
  return m[cat] || 'cat-nature';
}

function getCatEmoji(cat) {
  const m = {'Beach':'🏖️','Wildlife':'🦁','Nature':'🌿','Religious':'🛕','Historical':'🏛️','Museum':'🏺','Recreation':'🌊','Cultural':'🎨','Urban Park':'🌳'};
  return m[cat] || '📍';
}

function starHTML(rating, max=5) {
  let h = '';
  for(let i=1;i<=max;i++) h += `<span style="color:${i<=rating?'#f59e0b':'#d1d5db'}">★</span>`;
  return h;
}

function logout() { API.post('/api/auth/logout',{}).then(()=> window.location.href='/'); }

async function initNav() {
  const d = await API.get('/api/auth/me');
  const login=document.getElementById('navLogin'), reg=document.getElementById('navRegister'),
        logout_=document.getElementById('navLogout'), user=document.getElementById('navUser'),
        admin=document.getElementById('navAdmin');
  if(d.loggedIn) {
    if(login) login.classList.add('hidden');
    if(reg) reg.classList.add('hidden');
    if(logout_) logout_.classList.remove('hidden');
    if(user) { user.textContent='👤 '+d.name; user.classList.remove('hidden'); }
    if(admin && d.role==='admin') admin.classList.remove('hidden');
  } else {
    if(logout_) logout_.classList.add('hidden');
    if(user) user.classList.add('hidden');
    if(admin) admin.classList.add('hidden');
  }
  injectDmToggle();
}

function injectDmToggle() {
  const navInner = document.querySelector('.nav-inner');
  if (!navInner) {
    const adminBrand = document.querySelector('.admin-brand');
    if (adminBrand && !adminBrand.querySelector('.dm-toggle')) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'margin-top:.75rem;';
      wrapper.innerHTML = buildDmToggle();
      adminBrand.appendChild(wrapper);
    }
    return;
  }
  if (navInner.querySelector('.dm-toggle')) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildDmToggle();
  const btn = wrapper.firstElementChild;
  const logo = navInner.querySelector('.nav-logo');
  const navLinks = navInner.querySelector('.nav-links');
  if (logo && navLinks) {
    logo.insertAdjacentElement('afterend', btn);
    const spacer = document.createElement('div');
    spacer.style.cssText = 'flex:1;';
    btn.insertAdjacentElement('afterend', spacer);
  } else {
    navInner.appendChild(btn);
  }
}

document.addEventListener('DOMContentLoaded', initNav);
