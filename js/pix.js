function hex(val, len) {
  return val.toString(16).toUpperCase().padStart(len, '0');
}

function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0x8408;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return (crc ^ 0xFFFF) >>> 0;
}

function addId(id, value) {
  const content = String(value);
  const len = String(content.length).padStart(2, '0');
  return id + len + content;
}

function gerarPayloadPix(chave, valor, nome, cidade) {
  let payload = '000201';

  const gui = 'BR.GOV.BCB.PIX';
  const chaveField = addId('01', chave);
  const merchantAccount = addId('00', gui) + chaveField;
  payload += addId('26', merchantAccount);

  payload += '52482900';
  payload += '5303986';

  const valorStr = valor.toFixed(2);
  payload += addId('54', valorStr);

  payload += '5802BR';

  const nomeLimpo = nome.toUpperCase().substring(0, 25);
  payload += addId('59', nomeLimpo);

  const cidadeLimpa = cidade.toUpperCase().substring(0, 15);
  payload += addId('60', cidadeLimpa);

  payload += addId('62', addId('05', 'QR'));

  payload += '6304';

  const crc = crc16(payload);
  payload += hex(crc, 4);

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
    width: 220,
    height: 220,
    colorDark: '#3a2a1a',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.L
  });
}
