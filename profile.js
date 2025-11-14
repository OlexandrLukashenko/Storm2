const user = JSON.parse(localStorage.getItem('user')||'{"username":"Гість","email":""}');
document.getElementById('username').value = user.username || '';
document.getElementById('email').value = user.email || '';

document.getElementById('saveProfile').onclick = ()=>{
  user.username = document.getElementById('username').value;
  user.email = document.getElementById('email').value;
  localStorage.setItem('user', JSON.stringify(user));
  alert('Профіль збережено');
};

document.getElementById('logoutBtn').onclick = ()=>{
  localStorage.removeItem('user');
  location.href = 'index.html';
};

// Render orders
const ordersList = document.getElementById('ordersList');
const orders = JSON.parse(localStorage.getItem('orders')||'[]');
if(orders.length===0) ordersList.innerHTML = '<div class="empty">Замовлень ще немає</div>';
orders.forEach(o=>{
  const div = document.createElement('div'); div.className='order';
  const items = Object.entries(o.items).map(([id,qty])=>{
    const g = JSON.parse(localStorage.getItem('games_cache')||'[]').find(x=>x.id==id);
    const title = g ? g.title : ('#'+id);
    return `<div class="item-row"><div>${title} × ${qty}</div><div>${(g?g.price*qty:0)} грн</div></div>`;
  }).join('');
  div.innerHTML = `<div class="meta">Замовлення #${o.id} • ${o.date}</div><div class="items">${items}</div><div>Всього: ${o.total} грн</div>`;
  ordersList.appendChild(div);
});
