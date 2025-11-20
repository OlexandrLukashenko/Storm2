let games = [];
let cart = JSON.parse(localStorage.getItem('cart') || '{}');

async function loadGames() {
    const res = await fetch('games.json');
    games = await res.json();
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cartList');
    const totalEl = document.getElementById('cartTotal');

    list.innerHTML = '';
    let total = 0;

    for (const [id, qty] of Object.entries(cart)) {
        const g = games.find(x => x.id == id);
        if (!g) continue;

        total += g.price * qty;

        const row = document.createElement('div');
        row.className = 'cart-row';
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

function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    save();
}

function removeFromCart(id) {
    delete cart[id];
    save();
}

function save() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

document.getElementById('checkout').onclick = () => {
    if (!Object.keys(cart).length) return alert('Корзина пуста');

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const items = JSON.parse(JSON.stringify(cart));
    const total = Object.entries(items).reduce((sum, [id, qty]) => {
        const g = games.find(x => x.id == id);
        return sum + (g ? g.price * qty : 0);
    }, 0);

    orders.push({ id: Date.now(), items, total, date: new Date().toLocaleString() });
    localStorage.setItem('orders', JSON.stringify(orders));

    cart = {};
    save();

    alert("Заказ оформлен");
    window.location.href = "profile.html";
};

loadGames();
