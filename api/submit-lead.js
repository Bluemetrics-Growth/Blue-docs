// Provedores de e-mail gratuitos / pessoais / descartáveis — não são domínios corporativos.
// Leads com esses domínios são bloqueados no cadastro.
const BLOCKED_EMAIL_DOMAINS = new Set([
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft
  'hotmail.com', 'hotmail.com.br', 'outlook.com', 'outlook.com.br', 'live.com',
  'live.com.br', 'msn.com', 'passport.com',
  // Yahoo
  'yahoo.com', 'yahoo.com.br', 'ymail.com', 'rocketmail.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // AOL / Verizon
  'aol.com', 'aol.com.br',
  // Provedores brasileiros
  'bol.com.br', 'uol.com.br', 'uol.com', 'terra.com.br', 'terra.com',
  'ig.com.br', 'globo.com', 'globomail.com', 'r7.com', 'oi.com.br',
  'zipmail.com.br', 'click21.com.br', 'pop.com.br', 'superig.com.br',
  'bemol.com.br', 'ibest.com.br',
  // Outros provedores gratuitos
  'protonmail.com', 'proton.me', 'pm.me', 'tutanota.com', 'tuta.io',
  'gmx.com', 'gmx.net', 'mail.com', 'zoho.com', 'zohomail.com',
  'yandex.com', 'yandex.ru', 'inbox.com', 'fastmail.com', 'hey.com',
  // Descartáveis / temporários
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', '10minutemail.com',
  'temp-mail.org', 'tempmail.com', 'trashmail.com', 'yopmail.com', 'getnada.com',
  'sharklasers.com', 'throwawaymail.com', 'maildrop.cc', 'dispostable.com',
  'mailnesia.com', 'fakeinbox.com', 'emailondeck.com', 'moakt.com',
]);

function extractEmailDomain(email) {
  if (typeof email !== 'string') return '';
  const at = email.lastIndexOf('@');
  if (at === -1) return '';
  return email.slice(at + 1).trim().toLowerCase();
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    nome, email, telefone, cargo, empresa, site, segmento, funcionarios, documentos, receita,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  } = req.body || {};

  if (!nome || !email || !empresa) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Bloqueia domínios não corporativos (gmail, yahoo, hotmail, descartáveis, etc.)
  const emailDomain = extractEmailDomain(email);
  if (!emailDomain || BLOCKED_EMAIL_DOMAINS.has(emailDomain)) {
    console.warn('[submit-lead] Blocked non-corporate email domain:', emailDomain || '(invalid)');
    return res.status(422).json({
      error: 'corporate_email_required',
      message: 'Por favor, utilize um e-mail corporativo. Não aceitamos e-mails pessoais (Gmail, Yahoo, Hotmail, etc.).',
    });
  }

  const token = process.env.HUBSPOT_TOKEN;
  if (!token) return res.status(500).json({ error: 'HubSpot token not configured' });

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const parts = nome.trim().split(' ');
  const firstname = parts[0];
  const lastname = parts.slice(1).join(' ') || '';

  let contactId, companyId;

  // 1. Create Contact — core fields only (guaranteed safe)
  const coreProps = {
    firstname, lastname, email,
    phone: telefone,
    jobtitle: cargo,
    company: empresa,
  };

  const contactRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ properties: coreProps }),
  });

  if (contactRes.status === 409) {
    // Contact already exists — get ID
    const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
        properties: ['hs_object_id'],
      }),
    });
    const searchData = await searchRes.json();
    contactId = searchData.results?.[0]?.id;
  } else if (contactRes.ok) {
    contactId = (await contactRes.json()).id;
  } else {
    const err = await contactRes.text().catch(() => '');
    console.error('[submit-lead] Contact creation failed:', contactRes.status, err);
  }

  // 2. PATCH extended properties (legal basis, WhatsApp, UTMs)
  //    Runs after create/lookup so contact always exists first
  if (contactId) {
    const extendedProps = {
      // LGPD: interesse legítimo — lead cadastrado na landing page
      hs_legal_basis: 'Legitimate interest – prospect/lead',
      // Número de telefone do WhatsApp
      numero_de_telefone_do_whatsapp: telefone,
      // UTM → propriedades de origem do HubSpot
      ...(utm_source   && { hs_analytics_source: utm_source }),
      ...(utm_medium   && { origem: utm_medium }),
      ...(utm_campaign && { hs_analytics_source_data_1: utm_campaign }),
      ...(utm_content  && { hs_analytics_source_data_2: utm_content }),
      ...(utm_term && !utm_content && { hs_analytics_source_data_2: utm_term }),
    };

    const patchRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ properties: extendedProps }),
    });

    if (!patchRes.ok) {
      const err = await patchRes.text().catch(() => '');
      console.error('[submit-lead] Contact PATCH failed:', patchRes.status, err);
    }
  }

  // 3. Create Company
  const companyProps = { name: empresa, industry: segmento };
  if (site) companyProps.website = site;

  const companyRes = await fetch('https://api.hubapi.com/crm/v3/objects/companies', {
    method: 'POST',
    headers,
    body: JSON.stringify({ properties: companyProps }),
  });
  if (companyRes.ok) companyId = (await companyRes.json()).id;

  // 4. Create Deal with associations
  const associations = [];
  if (contactId) associations.push({ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] });
  if (companyId) associations.push({ to: { id: companyId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }] });

  const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      properties: {
        dealname: `${empresa} - BlueDocs`,
        pipeline: '894815044',
        dealstage: '1352162349',
        origem_do_negocio: 'Bluemetrics',
        segmento_da_empresa: segmento,
        cargo,
        n_de_funcionarios: funcionarios,
        selecione_documentos_criticosmes: documentos,
        receita_anual: receita,
        description: [
          utm_source   ? `Fonte: ${utm_source}`     : null,
          utm_medium   ? `Mídia: ${utm_medium}`      : null,
          utm_campaign ? `Campanha: ${utm_campaign}` : null,
          utm_term     ? `Conjunto: ${utm_term}`     : null,
          utm_content  ? `Anúncio: ${utm_content}`   : null,
        ].filter(Boolean).join(' | ') || undefined,
      },
      associations,
    }),
  });

  if (!dealRes.ok) {
    const err = await dealRes.text();
    console.error('Deal creation failed:', err);
    return res.status(500).json({ error: 'Failed to create deal' });
  }

  return res.status(200).json({ success: true });
}
