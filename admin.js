/* Admin: Add, Edit, Delete games. Uses games.json fetched and allows download of updated JSON */
let gamesData = [];

async function loadGames(){
  const res = await fetch('games.json');
  gamesData = await res.json();
  renderList();
}

function renderList(){
  const list = document.getElementById('list');
  list.innerHTML = '';
  gamesData.forEach(g=>{
    const row = document.createElement('div'); row.className = 'game-row';
    row.innerHTML = `
      <img src="${g.thumb}" alt="thumb">
      <div style="flex:1">
        <b>${g.title}</b><br><small>${g.category} • ${g.price} грн</small>
      </div>
      <div>
        <button class="btn" onclick="editGame(${g.id})">Редагувати</button>
        <button class="btn ghost" onclick="deleteGame(${g.id})">Видалити</button>
      </div>
    `;
    list.appendChild(row);
  });
}

function clearForm(){
  document.getElementById('title').value='';
  document.getElementById('price').value='';
  document.getElementById('thumb').value='';
  document.getElementById('category').value='';
  document.getElementById('desc').value='';
  document.getElementById('save').dataset.editId='';
}

function editGame(id){
  const g = gamesData.find(x=>x.id==id);
  if(!g) return alert('Не знайдено');
  document.getElementById('title').value = g.title;
  document.getElementById('price').value = g.price;
  document.getElementById('thumb').value = g.thumb;
  document.getElementById('category').value = g.category;
  document.getElementById('desc').value = g.description;
  document.getElementById('save').dataset.editId = id;
  window.scrollTo({top:0,behavior:'smooth'});
}

function deleteGame(id){
  if(!confirm('Видалити гру?')) return;
  gamesData = gamesData.filter(x=>x.id!=id);
  renderList();
  downloadJSON();
}

document.getElementById('save').onclick = ()=>{
  const title = document.getElementById('title').value.trim();
  const price = parseInt(document.getElementById('price').value||0,10);
  const thumb = document.getElementById('thumb').value.trim();
  const category = document.getElementById('category').value.trim() || 'Other';
  const desc = document.getElementById('desc').value.trim();
  if(!title) return alert('Вкажіть назву');

  const editId = document.getElementById('save').dataset.editId;
  if(editId){
    const g = gamesData.find(x=>x.id==editId);
    if(g){
      g.title = title; g.price = price; g.thumb = thumb; g.category = category; g.description = desc;
    }
  } else {
    gamesData.push({ id: Date.now(), title, price, thumb, category, description: desc, popularity: 50 });
  }
  renderList();
  downloadJSON();
  clearForm();
};

document.getElementById('clear').onclick = clearForm;

function downloadJSON(){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(gamesData,null,2)],{type:'application/json'}));
  a.download = 'games.json';
  a.click();
}

loadGames();
