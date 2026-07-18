async function fetchNotes(){
  const res = await fetch('/api/notes.php');
  return res.json();
}

function renderNotes(notes){
  const ul = document.getElementById('noteList');
  ul.innerHTML = '';
  notes.forEach(n=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.content)}</p><small>${n.id}</small> <button data-id="${n.id}" class="del">Hapus</button>`;
    ul.appendChild(li);
  });
}

function escapeHtml(s){
  return String(s).replace(/[&"'<>]/g, c=>({
    '&':'&amp;','"':'&quot;',"'":"&#39;",'<':'&lt;','>':'&gt;'
  }[c]));
}

async function loadAndRender(){
  const notes = await fetchNotes();
  renderNotes(notes);
}

document.getElementById('noteForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  if(!title || !content) return;
  await fetch('/api/notes.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,content})});
  document.getElementById('title').value='';
  document.getElementById('content').value='';
  loadAndRender();
});

document.getElementById('noteList').addEventListener('click', async (e)=>{
  if(e.target.classList.contains('del')){
    const id = e.target.dataset.id;
    await fetch('/api/notes.php?id='+encodeURIComponent(id),{method:'DELETE'});
    loadAndRender();
  }
});

document.getElementById('calcBtn').addEventListener('click', ()=>{
  const expr = document.getElementById('expr').value;
  try{
    // simple and limited evaluator
    const fn = new Function('return ('+expr+');');
    const v = fn();
    document.getElementById('result').textContent = String(v);
  }catch(err){
    document.getElementById('result').textContent = 'Error: '+err.message;
  }
});

// init
loadAndRender();
