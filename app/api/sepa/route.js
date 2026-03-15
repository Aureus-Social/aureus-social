import { checkRole } from '@/app/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';
const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;

function genSEPA(emps, co, period) {
  const now = new Date();
  const msgId = `AUREUS-${now.getTime()}`;
  const execDate = now.toISOString().split('T')[0];
  const totalAmount = emps.reduce((a, e) => a + (e.net || 0), 0).toFixed(2);
  const transactions = emps.map((e, i) => `
    <CdtTrfTxInf>
      <PmtId><EndToEndId>SAL-${period}-${String(i+1).padStart(3,'0')}</EndToEndId></PmtId>
      <Amt><InstdAmt Ccy="EUR">${(e.net||0).toFixed(2)}</InstdAmt></Amt>
      <Cdtr><Nm>${(e.first||e.fn||'')} ${(e.last||e.ln||'')}</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>${(e.iban||'').replace(/\s/g,'')}</IBAN></Id></CdtrAcct>
      <RmtInf><Ustrd>Salaire ${period} - ${(e.first||e.fn||'')} ${(e.last||e.ln||'')}</Ustrd></RmtInf>
    </CdtTrfTxInf>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${now.toISOString()}</CreDtTm>
      <NbOfTxs>${emps.length}</NbOfTxs>
      <CtrlSum>${totalAmount}</CtrlSum>
      <InitgPty><Nm>${co?.name||'Aureus'}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>BATCH-${msgId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxs>${emps.length}</NbOfTxs>
      <CtrlSum>${totalAmount}</CtrlSum>
      <PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf>
      <ReqdExctnDt>${execDate}</ReqdExctnDt>
      <Dbtr><Nm>${co?.name||'Aureus'}</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>${(co?.iban||'').replace(/\s/g,'')}</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BIC>${co?.bic||'GEBABEBB'}</BIC></FinInstnId></DbtrAgt>
      ${transactions}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
}

export async function POST(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'sepa'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const db = sb();
  const body = await req.json();
  const { emps, co, period } = body;
  if (!emps?.length) return Response.json({ error: 'Aucun employé' }, { status: 400 });
  const missingIBAN = emps.filter(e => !e.iban);
  if (missingIBAN.length) return Response.json({ error: `IBAN manquant pour : ${missingIBAN.map(e=>`${e.first||''} ${e.last||''}`).join(', ')}`, missingIBAN }, { status: 422 });
  const xml = genSEPA(emps, co, period || new Date().toISOString().slice(0,7));
  const total = emps.reduce((a, e) => a + (e.net || 0), 0);
  if (db) await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'GENERATE_SEPA', table_name: 'fiches_paie', created_at: new Date().toISOString(), details: { period, count: emps.length, total } }]);
  return Response.json({ ok: true, xml, filename: `sepa_${period||'current'}_${emps.length}tx.xml`, total, count: emps.length });
}
