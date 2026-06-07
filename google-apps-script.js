const SPREADSHEET_ID = '1Q7v3DSDyIY3eh14HkX44wsLIdeLQRXQMbIuKc0rWbyE';
const ADMIN_SENHA = 'sarahlevi2026';
const EMAIL_REMETENTE = 'sarahlevi.casamento@gmail.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.tipo === 'rsvp') {
      return handleRSVP(data);
    }

    if (data.tipo === 'presente') {
      return handlePurchase(data);
    }

    if (data.tipo === 'admin') {
      return handleAdmin(data);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: 'Tipo invalido' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getRsvps') {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('RSVP');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const headers = rows[0];
    const result = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getGifts') {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Presentes');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const headers = rows[0];
    const allRows = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    const seen = {};
    const result = [];
    allRows.forEach(item => {
      const id = String(item.ID || '').trim();
      if (id && seen[id]) return;
      if (id) seen[id] = true;
      result.push(item);
    });
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ erro: 'Acao invalida' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── RSVP ───
function handleRSVP(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('RSVP');
  if (!sheet) {
    sheet = ss.insertSheet('RSVP');
    sheet.appendRow(['Data', 'Nome', 'Email', 'Confirmacao', 'Mensagem']);
  }

  const nomeCompleto = (data.nome || '').trim();

  sheet.appendRow([
    new Date(),
    nomeCompleto,
    data.email || '',
    data.confirmacao || '',
    data.mensagem || ''
  ]);

  try {
    if (data.confirmacao === 'Aceito com alegria') {
      MailApp.sendEmail({
        to: data.email,
        from: EMAIL_REMETENTE,
        subject: 'Casamento Sarah & Levi — Presença Confirmada!',
        htmlBody: '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;text-align:center;padding:20px;">' +
          '<h2 style="color:#5c4033;">Olá, ' + nomeCompleto + '!</h2>' +
          '<p style="font-size:15px;line-height:1.8;color:#3a2a1a;">Estamos passando para dizer que a sua presença no nosso casamento é um presente que aguardamos com muito carinho. Nossa história, que começou em 2022, foi escrita com a ajuda de muitas orações e, ter você ao nosso lado para celebrar o dia em que nos tornaremos \'um só\', torna tudo ainda mais especial. Estamos contando os dias para compartilhar essa alegria com você!</p>' +
          '<p style="color:#999;margin-top:40px;">Com amor,<br>Sarah & Levi</p>' +
          '</div>'
      });
    } else {
      MailApp.sendEmail({
        to: data.email,
        from: EMAIL_REMETENTE,
        subject: 'Casamento Sarah & Levi — Sua Resposta',
        htmlBody: '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;text-align:center;padding:20px;">' +
          '<h2 style="color:#5c4033;">Querido(a), ' + nomeCompleto + '</h2>' +
          '<p style="font-size:15px;line-height:1.8;color:#3a2a1a;">Recebemos a notícia de que você não poderá estar conosco no dia do nosso casamento e, embora sintamos muito a sua falta, entendemos perfeitamente. Saiba que você é uma pessoa muito querida em nossa jornada. Desde o início, nossa história foi abençoada e construída sobre fundamentos sólidos, e ter pessoas como você torcendo por nós de onde estiver é um privilégio. Esperamos poder celebrar essa nova fase com você pessoalmente em uma oportunidade próxima!</p>' +
          '<p style="color:#999;margin-top:40px;">Com amor,<br>Sarah & Levi</p>' +
          '</div>'
      });
    }
  } catch (err) {
    // Falha no email — não impede o salvamento
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Compras ───
function handlePurchase(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Compras');
  if (!sheet) {
    sheet = ss.insertSheet('Compras');
    sheet.appendRow(['Data', 'Comprador', 'PresenteID', 'Presente', 'Mensagem']);
  }

  const items = data.itens || [];
  items.forEach(item => {
    sheet.appendRow([
      new Date(),
      data.comprador || '',
      item.id || '',
      item.nome || '',
      item.mensagem || ''
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Admin CRUD ───
function handleAdmin(data) {
  if (data.senha !== ADMIN_SENHA) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: 'Senha incorreta' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Presentes');
  if (!sheet) {
    sheet = ss.insertSheet('Presentes');
    sheet.appendRow(['ID', 'Categoria', 'Nome', 'ValorVista', 'Imagem']);
  }

  if (data.acao === 'salvar') {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }

    const presentes = data.presentes || [];
    presentes.forEach(p => {
      sheet.appendRow([
        p.id || '',
        p.categoria || '',
        p.nome || '',
        p.valorVista || 0,
        p.imagem || ''
      ]);
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true, count: presentes.length }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: 'Acao desconhecida' }))
    .setMimeType(ContentService.MimeType.JSON);
}
