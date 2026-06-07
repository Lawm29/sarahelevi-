// ============================================================
// Google Apps Script — Deploy no Apps Script (script.google.com)
// Copie TODO este código e cole no editor do Apps Script
// ============================================================

const SPREADSHEET_ID = '1Q7v3DSDyIY3eh14HkX44wsLIdeLQRXQMbIuKc0rWbyE';
const ADMIN_SENHA = 'sarahlevi2026';
const EMAIL_REMETENTE = 'sarahlevi.casamento@gmail.com'; // Trocar quando criar o email

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

    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: 'Tipo inválido' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getRsvps') {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    const rows = sheet.getDataRange().getValues();
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
    const result = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ erro: 'Ação inválida' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── RSVP ───
function handleRSVP(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
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
        subject: 'Confirmação Recebida! — Casamento Sarah & Levi',
        htmlBody: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;text-align:center;">
            <h2 style="color:#5c4033;">Obrigado, ${nomeCompleto}!</h2>
            <p>Recebemos sua confirmação com muita alegria.</p>
            <p>Aguardo você no dia <strong>28 de agosto de 2026</strong>!</p>
            <p style="color:#999;margin-top:40px;">Com amor,<br>Sarah & Levi</p>
          </div>
        `
      });
    } else {
      MailApp.sendEmail({
        to: data.email,
        from: EMAIL_REMETENTE,
        subject: 'Sua resposta foi registrada — Casamento Sarah & Levi',
        htmlBody: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;text-align:center;">
            <h2 style="color:#5c4033;">Obrigado, ${nomeCompleto}!</h2>
            <p>Entendemos que não será possível estar presente.</p>
            <p>Sinta-se no coração da celebração de qualquer forma!</p>
            <p style="color:#999;margin-top:40px;">Com amor,<br>Sarah & Levi</p>
          </div>
        `
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

  return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: 'Ação desconhecida' }))
    .setMimeType(ContentService.MimeType.JSON);
}
