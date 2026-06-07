const API_URL = 'https://script.google.com/macros/s/AKfycbxG7h8D4_ff0TmzV_uBPfK7LxbzSM9RomOghN4MNwviGYbnj4QCCT-AnsdIKzlUk3de/exec';
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
        valorVista: parseFloat(item.ValorVista) || 0,
        valorParcelado: item.ValorParcelado ? parseFloat(item.ValorParcelado) : null,
        imagem: item.Imagem || ''
      }));
    } else {
      adminPresentes = [];
    }
  } catch (e) {
    setStatus('Erro ao carregar. Verifique sua conexão.');
    return;
  }
  renderizarLista();
  setStatus('Carregado com sucesso!');
  setTimeout(() => setStatus(''), 2000);
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
    const parcelado = item.valorParcelado ? ` | 3x R$ ${item.valorParcelado.toFixed(2)}` : '';
    const imgPreview = item.imagem
      ? `<img src="${item.imagem}" class="admin-thumb" onerror="this.style.display='none'">`
      : '<div class="admin-thumb admin-thumb-empty">&#9829;</div>';
    return `
      <div class="admin-item" data-id="${item.id}">
        ${imgPreview}
        <div class="admin-item-info">
          <div class="admin-item-nome">${item.nome}</div>
          <div class="admin-item-detalhes">${item.categoria} | R$ ${item.valorVista.toFixed(2)}${parcelado}</div>
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
  const item = {
    id: editId ? parseInt(editId) : (adminPresentes.length > 0 ? Math.max(...adminPresentes.map(p => p.id)) + 1 : 1),
    nome: document.getElementById('formNome').value.trim(),
    categoria: document.getElementById('formCategoria').value.trim(),
    valorVista: parseFloat(document.getElementById('formValorVista').value) || 0,
    valorParcelado: parseFloat(document.getElementById('formParcelas').value) || null,
    imagem: document.getElementById('formImagem').value.trim()
  };

  if (editId) {
    const idx = adminPresentes.findIndex(p => p.id === parseInt(editId));
    if (idx >= 0) adminPresentes[idx] = item;
  } else {
    adminPresentes.push(item);
  }

  cancelarEdicao();
  renderizarLista();
  setStatus(editId ? 'Item atualizado!' : 'Item adicionado!');
  setTimeout(() => setStatus(''), 2000);
}

function editarItem(idx) {
  const item = adminPresentes[idx];
  document.getElementById('editId').value = item.id;
  document.getElementById('formNome').value = item.nome;
  document.getElementById('formCategoria').value = item.categoria;
  document.getElementById('formValorVista').value = item.valorVista;
  document.getElementById('formParcelas').value = item.valorParcelado || '';
  document.getElementById('formImagem').value = item.imagem;
  document.getElementById('formTitulo').textContent = 'Editar Presente';
  document.getElementById('adminForm').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('formNome').focus();
}

function cancelarEdicao() {
  document.getElementById('editId').value = '';
  document.getElementById('formNome').value = '';
  document.getElementById('formCategoria').value = '';
  document.getElementById('formValorVista').value = '';
  document.getElementById('formParcelas').value = '';
  document.getElementById('formImagem').value = '';
  document.getElementById('formTitulo').textContent = 'Adicionar Novo Presente';
}

function excluirItem(idx) {
  if (!confirm(`Excluir "${adminPresentes[idx].nome}"?`)) return;
  adminPresentes.splice(idx, 1);
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
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        tipo: 'admin',
        senha: SENHA,
        acao: 'salvar',
        presentes: adminPresentes.map((p, idx) => ({
          id: idx + 1,
          categoria: p.categoria,
          nome: p.nome,
          valorVista: p.valorVista,
          valorParcelado: p.valorParcelado || '',
          imagem: p.imagem
        }))
      })
    });
    setStatus('Salvo com sucesso!');
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
