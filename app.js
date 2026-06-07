const PIX_CHAVE = '40007982860';
const PIX_NOME = 'Sarah & Levi';
const PIX_CIDADE = 'Sao Paulo';

let cart = [];
let qrCodeInstance = null;

/* ─── Countdown ─── */
function atualizarCountdown() {
  const target = new Date('2026-08-28T15:30:00-03:00');
  const diff = target - new Date();
  if (diff <= 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('days').textContent = String(d).padStart(2, '0');
  document.getElementById('hours').textContent = String(h).padStart(2, '0');
  document.getElementById('minutes').textContent = String(m).padStart(2, '0');
  document.getElementById('seconds').textContent = String(s).padStart(2, '0');
}
setInterval(atualizarCountdown, 1000);
atualizarCountdown();

/* ─── Navegação ─── */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section, .hero');

function atualizarNav() {
  let current = 'home';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    const bottom = top + sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) {
      current = sec.id;
    }
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 60);
}

window.addEventListener('scroll', atualizarNav);

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('navLinks').classList.remove('open');
    }
  });
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

/* ─── Lista de Presentes ─── */
function carregarCategorias() {
  const cats = [...new Set(presentes.map(p => p.categoria))];
  const sel = document.getElementById('filtroCategoria');
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

function renderizarPresentes(categoria) {
  const grid = document.getElementById('giftsGrid');
  const filtro = presentes.filter(p => categoria === 'todas' || p.categoria === categoria);
  grid.innerHTML = filtro.map(p => {
    const parcelado = p.valorParcelado
      ? `<div class="preco-parcela">3x de <span>R$ ${p.valorParcelado.toFixed(2)}</span></div>`
      : '';
    const noCarrinho = cart.some(c => c.id === p.id);
    return `
      <div class="gift-card">
        <div class="categoria">${p.categoria}</div>
        <div class="nome">${p.nome}</div>
        <div class="precos">
          ${parcelado}
          <div class="preco-vista"><span class="label">ou R$ à vista</span> R$ ${p.valorVista.toFixed(2)}</div>
        </div>
        <button class="btn-gift" onclick="adicionarAoCarrinho(${p.id})" ${noCarrinho ? 'disabled' : ''}>
          ${noCarrinho ? 'No carrinho' : 'Presentear'}
        </button>
      </div>
    `;
  }).join('');
}

document.getElementById('filtroCategoria').addEventListener('change', function() {
  renderizarPresentes(this.value);
});

/* ─── Carrinho ─── */
function adicionarAoCarrinho(id) {
  if (cart.length >= 3) {
    alert('Você pode escolher até 3 presentes por compra.');
    return;
  }
  const item = presentes.find(p => p.id === id);
  if (!item || cart.some(c => c.id === id)) return;
  cart.push(item);
  atualizarCarrinho();
  renderizarPresentes(document.getElementById('filtroCategoria').value);
  abrirModalCarrinho();
}

function removerDoCarrinho(id) {
  cart = cart.filter(c => c.id !== id);
  atualizarCarrinho();
  renderizarPresentes(document.getElementById('filtroCategoria').value);
  atualizarConteudoModal();
}

function atualizarCarrinho() {
  const count = cart.length;
  document.getElementById('cartCount').textContent = count;
  const badge = document.getElementById('cartBadge');
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
}

function atualizarConteudoModal() {
  const container = document.getElementById('cartContent');
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">Seu carrinho está vazio</div>';
    return;
  }
  const total = cart.reduce((s, i) => s + i.valorVista, 0);
  container.innerHTML = `
    <ul class="cart-items">
      ${cart.map(item => `
        <li class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-nome">${item.nome}</div>
            <div class="cart-item-valor">R$ ${item.valorVista.toFixed(2)}</div>
          </div>
          <button class="cart-item-remove" onclick="removerDoCarrinho(${item.id})">&times;</button>
        </li>
      `).join('')}
    </ul>
    <div class="cart-total">
      <span>Total</span>
      <span>R$ ${total.toFixed(2)}</span>
    </div>
    <div class="cart-actions">
      <button class="btn-continuar" onclick="fecharModalCarrinho()">Adicionar mais itens</button>
      <button class="btn-checkout" onclick="irParaCheckout()">Finalizar compra</button>
    </div>
  `;
}

/* ─── Modal Carrinho ─── */
function abrirModalCarrinho() {
  atualizarConteudoModal();
  document.getElementById('cartModal').classList.add('open');
}

function fecharModalCarrinho() {
  document.getElementById('cartModal').classList.remove('open');
}

document.getElementById('cartLink').addEventListener('click', abrirModalCarrinho);

document.getElementById('cartModal').addEventListener('click', function(e) {
  if (e.target === this) fecharModalCarrinho();
});

/* ─── Checkout ─── */
function irParaCheckout() {
  if (cart.length === 0) return;
  fecharModalCarrinho();
  document.getElementById('presentes').style.display = 'none';
  document.getElementById('checkout').style.display = 'block';
  document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });

  const total = cart.reduce((s, i) => s + i.valorVista, 0);
  document.getElementById('checkoutTotalValor').textContent = `R$ ${total.toFixed(2)}`;

  const resumo = document.getElementById('checkoutResumo');
  resumo.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <span>${item.nome}</span>
      <span>R$ ${item.valorVista.toFixed(2)}</span>
    </div>
  `).join('');

  gerarPix(total);
}

function gerarPix(valor) {
  const container = document.getElementById('pix-qrcode');
  container.innerHTML = '';

  const payload = gerarPayloadPix(PIX_CHAVE, valor, PIX_NOME, PIX_CIDADE);

  document.getElementById('pix-copia-cola').value = payload;

  if (qrCodeInstance) qrCodeInstance.clear();
  qrCodeInstance = new QRCode(container, {
    text: payload,
    width: 220,
    height: 220,
    colorDark: '#3a2a1a',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });
}

function fecharCheckout() {
  document.getElementById('checkout').style.display = 'none';
  document.getElementById('presentes').style.display = 'block';
  cart = [];
  atualizarCarrinho();
  renderizarPresentes(document.getElementById('filtroCategoria').value);
}

/* ─── RSVP ─── */
function enviarRSVP() {
  const nome = document.getElementById('rsvpNome').value.trim();
  if (!nome) {
    alert('Por favor, informe seu nome.');
    return;
  }
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpSuccess').style.display = 'block';
}

/* ─── Init ─── */
carregarCategorias();
renderizarPresentes('todas');
atualizarCarrinho();
