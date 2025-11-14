/* Main frontend logic: search, tags, sort, theme, cart, orders */
let games = [];
let state = {
  cart: JSON.parse(localStorage.getItem('cart')||'{}'),
  category: 'all',
  sort: localStorage.getItem('sort') || 'popular',
  theme: localStorage.getItem('theme') || 'dark',
};

async function loadGames(){
  const res = await fetch('games.json');
  games = await res.json();
  renderTags();
  renderStore();
  renderCart();
  applyTheme();
  document.getElementById('sort').value = state.sort;
}

// Tags (capsule) rendering
function renderTags(){
  const box = document.getElementById('genres');
  const cats = ['all', ...new Set(games.map(g=>g.category))];
  box.innerHTML = '';
  cats.forEach(c=>{
    const d = document.createElement('div');
    d.className = 'tag' + (state.category===c ? ' active' : '');
    d.textContent = c;
    d.onclick = ()=>{ state.category = c; renderTags(); renderStore(); };
    box.appendChild(d);
  });
}

// Store render with search and sort
function renderStore(){
  const store = document.getElementById('store');
  const q = document.getElementById('search') ? document.getElementById('search').value.trim().toLowerCase() : '';
  const sortVal = document.getElementById('sort') ? document.getElementById('sort').value : state.sort;
  state.sort = sortVal;
  localStorage.setItem('sort', state.sort);

  let list = [...games];
  if(state.category !== 'all') list = list.filter(g=>g.category===state.category);
  if(q) list = list.filter(g => (g.title+' '+(g.description||'')).toLowerCase().includes(q));

  if(sortVal==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(sortVal==='price-desc') list.sort((a,b)=>b.price-a.price);
  if(sortVal==='name') list.sort((a,b)=>a.title.localeCompare(b.title));
  if(sortVal==='popular') list.sort((a,b)=>b.popularity - a.popularity);

  store.innerHTML = '';
  list.forEach(g=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <div class="thumb" style="background-image:url('${g.thumb}')"></div>
      <div class="item-body">
        <div class="title">${g.title}</div>
        <div class="meta">${g.description}</div>
        <div class="price-row">
          <div class="price">${g.price} грн</div>
          <div>
            <button class="btn" onclick="addToCart(${g.id})">Додати</button>
          </div>
        </div>
      </div>
    `;
    store.appendChild(card);
  });
}

// CART functions
function addToCart(id){
  state.cart[id] = (state.cart[id]||0) + 1;
  saveCart(); renderCart();
}

function changeQty(id, delta){
  if(!state.cart[id]) return;
  state.cart[id] += delta;
  if(state.cart[id] <= 0) delete state.cart[id];
  saveCart(); renderCart();
}

function removeFromCart(id){
  delete state.cart[id];
  saveCart(); renderCart();
}

function saveCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); }
function loadCart(){ state.cart = JSON.parse(localStorage.getItem('cart')||'{}'); }

function renderCart(){
  const list = document.getElementById('cartList');
  const totalEl = document.getElementById('cartTotal');
  list.innerHTML = '';
  let total = 0;
  for(const [id,qty] of Object.entries(state.cart)){
    const g = games.find(x=>x.id==id);
    if(!g) continue;
    total += g.price * qty;
    const row = document.createElement('div'); row.className='cart-row';
    row.innerHTML = `
      <div>${g.title} × ${qty}</div>
      <div>
        <button class="btn ghost" onclick="changeQty(${id}, -1)">-</button>
        <button class="btn ghost" onclick="changeQty(${id}, 1)">+</button>
        <button class="btn ghost" onclick="removeFromCart(${id})">✖</button>
      </div>
      <div>${g.price * qty} грн</div>
    `;
    list.appendChild(row);
  }
  totalEl.textContent = total + ' грн';
}

// Checkout (creates order stored in localStorage)
document.getElementById('checkout').onclick = ()=>{
  if(!Object.keys(state.cart).length) return alert('Кошик порожній!');
  const orders = JSON.parse(localStorage.getItem('orders')||'[]');
  const items = JSON.parse(JSON.stringify(state.cart));
  const total = Object.entries(items).reduce((s,[id,qty])=>{
    const g = games.find(x=>x.id==id); return s + (g ? g.price * qty : 0);
  }, 0);
  orders.push({ id: Date.now(), items, total, status: 'new', date: new Date().toLocaleString() });
  localStorage.setItem('orders', JSON.stringify(orders));
  state.cart = {}; saveCart(); renderCart();
  alert('Замовлення створено!');
  // redirect to profile/orders optionally
  window.location.href = 'profile.html';
};

// Search & sort interactions
document.getElementById('search').oninput = renderStore;
document.getElementById('sort').onchange = renderStore;

// THEME
function applyTheme(){
  if(state.theme === 'light') document.body.classList.add('light'); else document.body.classList.remove('light');
  document.getElementById('themeToggle').textContent = state.theme === 'dark' ? '🌙' : '☀️';
}
document.getElementById('themeToggle').onclick = ()=>{
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  applyTheme();
};

// init
loadCart();
loadGames();
