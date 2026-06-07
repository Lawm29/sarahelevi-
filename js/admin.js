const API_URL = 'https://script.google.com/macros/s/AKfycbzPaziNkS56ZIUYNX0L1bx2bb8YfqBbo82qjbMD5v9ZFLkZyrOQZQs-DQbYJepsvlvY/exec';
const SENHA = 'sarahlevi2026';

let adminPresentes = [];
let logado = false;

/* ─── Login ─── */
function fazerLogin() {
  const input = document.getElementById('adminSenha');
  const erro = document.getElementById('adminErro');
  if (input.value === SENHA) {
    logado = true;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPainel').style.display = 'block';
    carregarAdmin();
  } else {
    erro.textContent = 'Senha incorreta';
    input.value = '';
    input.focus();
  }
}

document.getElementById('adminSenha').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') fazerLogin();
});

/* ─── Carregar Presentes ─── */
async function carregarAdmin() {
  setStatus('Carregando...');

  try {
    const res = await fetch(API_URL + '?action=getGifts');
    const data = await res.json();
    if (data.length > 0) {
      adminPresentes = data.map((item, idx) => ({
        id: parseInt(item.ID) || (idx + 1),
        categoria: item.Categoria || '',
        nome: item.Nome || '',
        valorVista: (item.ValorVista !== '' && item.ValorVista !== undefined && item.ValorVista !== null) ? parseFloat(item.ValorVista) : 0,
        imagem: item.Imagem || ''
      }));
    } else {
      carregarDeFallback();
    }
  } catch (e) {
    carregarDeFallback();
  }

  renderizarCategorias();
  renderizarLista();
  setStatus('Carregado com sucesso!');
  setTimeout(() => setStatus(''), 2000);
}

function carregarDeFallback() {
  if (typeof presentes !== 'undefined' && presentes.length > 0) {
    adminPresentes = presentes.map(p => ({
      id: p.id,
      categoria: p.categoria || '',
      nome: p.nome || '',
      valorVista: (p.valorVista !== undefined && p.valorVista !== null) ? p.valorVista : 0,
      imagem: p.imagem || ''
    }));
  } else {
    adminPresentes = [];
  }
}

/* ─── Categorias ─── */
function renderizarCategorias() {
  const cats = [...new Set(adminPresentes.map(p => p.categoria).filter(Boolean))];
  cats.sort();

  const sel = document.getElementById('formCategoriaSelect');
  sel.innerHTML = '<option value="">Selecione...</option>';
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
  const optNova = document.createElement('option');
  optNova.value = '__nova__';
  optNova.textContent = '+ Adicionar nova categoria';
  sel.appendChild(optNova);
}

function onCategoriaChange() {
  const sel = document.getElementById('formCategoriaSelect');
  const inputNova = document.getElementById('formCategoriaNova');
  if (sel.value === '__nova__') {
    inputNova.style.display = 'block';
    inputNova.focus();
  } else {
    inputNova.style.display = 'none';
    inputNova.value = '';
  }
}

function getCategoriaSelecionada() {
  const sel = document.getElementById('formCategoriaSelect');
  const inputNova = document.getElementById('formCategoriaNova');
  if (sel.value === '__nova__') {
    return inputNova.value.trim();
  }
  return sel.value;
}

/* ─── Renderizar Lista ─── */
function renderizarLista() {
  const container = document.getElementById('adminLista');
  document.getElementById('totalItens').textContent = adminPresentes.length;

  if (adminPresentes.length === 0) {
    container.innerHTML = '<p class="admin-vazio">Nenhum presente cadastrado.</p>';
    return;
  }

  container.innerHTML = adminPresentes.map((item, idx) => {
    const imgPreview = item.imagem
      ? `<img src="${item.imagem}" class="admin-thumb" onerror="this.outerHTML='<div class=\\'admin-thumb admin-thumb-empty\\'>&#9829;</div>'">`
      : '<div class="admin-thumb admin-thumb-empty">&#9829;</div>';
    return `
      <div class="admin-item" data-id="${item.id}">
        ${imgPreview}
        <div class="admin-item-info">
          <div class="admin-item-nome">${item.nome}</div>
          <div class="admin-item-detalhes">${item.categoria} | R$ ${item.valorVista.toFixed(2)}</div>
        </div>
        <div class="admin-item-botoes">
          <button onclick="moverItem(${idx}, -1)" title="Mover para cima" ${idx === 0 ? 'disabled' : ''}>&#9650;</button>
          <button onclick="moverItem(${idx}, 1)" title="Mover para baixo" ${idx === adminPresentes.length - 1 ? 'disabled' : ''}>&#9660;</button>
          <button onclick="editarItem(${idx})" title="Editar" class="admin-btn-editar">&#9998;</button>
          <button onclick="excluirItem(${idx})" title="Excluir" class="admin-btn-excluir">&#10005;</button>
        </div>
      </div>
    `;
  }).join('');
}

/* ─── Adicionar/Editar ─── */
function salvarItem(e) {
  e.preventDefault();
  const editId = document.getElementById('editId').value;
  const categoria = getCategoriaSelecionada();

  if (!categoria) {
    alert('Selecione ou adicione uma categoria.');
    return;
  }

  const item = {
    id: editId ? parseInt(editId) : (adminPresentes.length > 0 ? Math.max(...adminPresentes.map(p => p.id)) + 1 : 1),
    nome: document.getElementById('formNome').value.trim(),
    categoria: categoria,
    valorVista: parseFloat(document.getElementById('formValorVista').value) || 0,
    imagem: document.getElementById('formImagem').value.trim()
  };

  if (editId) {
    const idx = adminPresentes.findIndex(p => p.id === parseInt(editId));
    if (idx >= 0) adminPresentes[idx] = item;
  } else {
    adminPresentes.push(item);
  }

  cancelarEdicao();
  renderizarCategorias();
  renderizarLista();
  setStatus(editId ? 'Item atualizado!' : 'Item adicionado!');
  setTimeout(() => setStatus(''), 2000);
}

function editarItem(idx) {
  const item = adminPresentes[idx];
  document.getElementById('editId').value = item.id;
  document.getElementById('formNome').value = item.nome;
  document.getElementById('formValorVista').value = item.valorVista;
  document.getElementById('formImagem').value = item.imagem;

  const sel = document.getElementById('formCategoriaSelect');
  const inputNova = document.getElementById('formCategoriaNova');
  const cats = [...sel.options].map(o => o.value);
  if (cats.includes(item.categoria)) {
    sel.value = item.categoria;
    inputNova.style.display = 'none';
    inputNova.value = '';
  } else {
    sel.value = '__nova__';
    inputNova.style.display = 'block';
    inputNova.value = item.categoria;
  }

  document.getElementById('formTitulo').textContent = 'Editar Presente';
  document.getElementById('adminForm').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('formNome').focus();
}

function cancelarEdicao() {
  document.getElementById('editId').value = '';
  document.getElementById('formNome').value = '';
  document.getElementById('formCategoriaSelect').value = '';
  document.getElementById('formCategoriaNova').value = '';
  document.getElementById('formCategoriaNova').style.display = 'none';
  document.getElementById('formValorVista').value = '';
  document.getElementById('formImagem').value = '';
  document.getElementById('formTitulo').textContent = 'Adicionar Novo Presente';
}

function excluirItem(idx) {
  if (!confirm(`Excluir "${adminPresentes[idx].nome}"?`)) return;
  adminPresentes.splice(idx, 1);
  renderizarCategorias();
  renderizarLista();
  setStatus('Item removido!');
  setTimeout(() => setStatus(''), 2000);
}

/* ─── Mover (Reorder) ─── */
function moverItem(idx, direcao) {
  const novoIdx = idx + direcao;
  if (novoIdx < 0 || novoIdx >= adminPresentes.length) return;
  const temp = adminPresentes[idx];
  adminPresentes[idx] = adminPresentes[novoIdx];
  adminPresentes[novoIdx] = temp;
  renderizarLista();
}

/* ─── Salvar na Planilha ─── */
async function salvarTudo() {
  if (!confirm('Salvar todas as mudanças na planilha? Isso vai sobrescrever a lista atual.')) return;
  setStatus('Salvando na planilha...');

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        tipo: 'admin',
        senha: SENHA,
        acao: 'salvar',
        presentes: adminPresentes.map((p, idx) => ({
          id: idx + 1,
          categoria: p.categoria,
          nome: p.nome,
          valorVista: p.valorVista,
          imagem: p.imagem
        }))
      })
    });
    const result = await res.json();
    if (result.ok) {
      setStatus('Salvo com sucesso! (' + result.count + ' itens)');
    } else {
      setStatus('Erro: ' + (result.erro || 'Resposta inválida'));
    }
    setTimeout(() => setStatus(''), 3000);
  } catch (e) {
    setStatus('Erro ao salvar. Tente novamente.');
  }
}

/* ─── Status ─── */
function setStatus(msg) {
  document.getElementById('adminStatus').textContent = msg;
  document.getElementById('adminStatus').classList.toggle('show', msg !== '');
}
