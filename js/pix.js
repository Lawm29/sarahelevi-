function crc16(payload) {
  const polynomial = 0x1021;
  let result = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    result ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      result = (result & 0x8000) ? ((result << 1) ^ polynomial) : (result << 1);
      result &= 0xFFFF;
    }
  }
  return result.toString(16).toUpperCase().padStart(4, '0');
}

function addId(id, value) {
  const content = String(value);
  const len = String(content.length).padStart(2, '0');
  return id + len + content;
}

function gerarPayloadPix(chave, valor, nome, cidade) {
  let payload = '';

  payload += addId('00', '01');

  const gui = 'BR.GOV.BCB.PIX';
  const merchantAccount = addId('00', gui) + addId('01', chave);
  payload += addId('26', merchantAccount);

  payload += addId('52', '0000');
  payload += addId('53', '986');

  if (valor > 0) {
    payload += addId('54', valor.toFixed(2));
  }

  payload += addId('58', 'BR');
  payload += addId('59', nome.toUpperCase().substring(0, 25));
  payload += addId('60', cidade.toUpperCase().substring(0, 15));
  payload += addId('62', addId('05', '***'));

  payload += '6304';
  payload += crc16(payload);

  return payload;
}

function copiarChavePix() {
  const input = document.getElementById('pix-copia-cola');
  if (!input) return;
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.getElementById('btn-copiar');
    const original = btn.textContent;
    btn.textContent = 'Copiado!';
    setTimeout(() => { btn.textContent = original; }, 2000);
  });
}

function gerarQRCode(elementId, payload) {
  const container = document.getElementById(elementId);
  container.innerHTML = '';
  new QRCode(container, {
    text: payload,
    width: 300,
    height: 300,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });
}
