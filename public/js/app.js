// public/js/app.js — shared utilities

const API = {
  async get(url) { const r = await fetch(url,{credentials:'include'}); return r.json(); },
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
}

document.addEventListener('DOMContentLoaded', initNav);
