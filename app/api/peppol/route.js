// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/peppol
// Génération de factures électroniques au format Peppol BIS 3.0 (UBL 2.1)
// Identifiant Peppol : 0208:1028230781
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, checkRole } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

const PEPPOL_ID = '0208:1028230781'; // Aureus IA SPRL

function genUBL(facture, supplier) {
  const id = facture.numero || `FAC-${Date.now()}`;
  const issueDate = (facture.created_at||new Date().toISOString()).slice(0,10);
  const dueDate = facture.echeance || issueDate;
  const montant = (facture.montant || 0).toFixed(2);
  const tva = ((facture.montant || 0) * 0.21).toFixed(2);
  const ttc = ((facture.montant || 0) * 1.21).toFixed(2);
  const clientPeppolId = facture.client_peppol_id || `0208:${(facture.client_vat||'').replace(/[^0-9]/g,'')}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">

  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${id}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:DueDate>${dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>

  <!-- Fournisseur — Aureus IA SPRL -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="0208">${PEPPOL_ID.split(':')[1]}</cbc:EndpointID>
      <cac:PartyName><cbc:Name>Aureus IA SPRL</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Place Marcel Broodthaers 8</cbc:StreetName>
        <cbc:CityName>Saint-Gilles</cbc:CityName>
        <cbc:PostalZone>1060</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>BE</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>BE1028230781</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>Aureus IA SPRL</cbc:RegistrationName>
        <cbc:CompanyID>1028230781</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Client -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:EndpointID schemeID="0208">${clientPeppolId.split(':')[1]||'0000000000'}</cbc:EndpointID>
      <cac:PartyName><cbc:Name>${facture.client_name||'Client'}</cbc:Name></cac:PartyName>
      ${facture.client_email?`<cac:Contact><cbc:ElectronicMail>${facture.client_email}</cbc:ElectronicMail></cac:Contact>`:''}
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Paiement -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount>
      <cbc:ID>BE60063428488290</cbc:ID>
      <cac:FinancialInstitutionBranch>
        <cbc:ID>GKCCBEBB</cbc:ID>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>

  <!-- TVA -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${tva}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="EUR">${montant}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="EUR">${tva}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>21</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Montants -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${montant}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${montant}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${ttc}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${ttc}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Ligne de facture -->
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${montant}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${facture.description||'Services Aureus Social Pro'}</cbc:Description>
      <cbc:Name>Services secrétariat social</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>21</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="EUR">${montant}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>

</Invoice>`;
}

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'export_compta'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id))
    return Response.json({ error: 'ID facture requis' }, { status: 400 });

  const { data: facture, error } = await db.from('factures').select('*').eq('id', id).single();
  if (error || !facture) return Response.json({ error: 'Facture introuvable' }, { status: 404 });

  const xml = genUBL(facture, {});
  const filename = `${facture.numero||'facture'}_peppol.xml`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'export_compta'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const { facture_id, client_peppol_id, client_vat } = await req.json();
  if (!facture_id) return Response.json({ error: 'facture_id requis' }, { status: 400 });

  const { data: facture } = await db.from('factures').select('*').eq('id', facture_id).single();
  if (!facture) return Response.json({ error: 'Facture introuvable' }, { status: 404 });

  const enriched = { ...facture, client_peppol_id, client_vat };
  const xml = genUBL(enriched, {});

  // Enregistrer le Peppol ID client si fourni
  if (client_peppol_id) {
    await db.from('factures').update({ client_peppol_id }).eq('id', facture_id).catch(()=>{});
  }

  return Response.json({
    ok: true,
    xml,
    filename: `${facture.numero}_peppol_BIS3.xml`,
    peppol_sender: PEPPOL_ID,
    note: 'Fichier prêt à soumettre via votre réseau Peppol Access Point (ex. Hermes, Mercurius)',
  });
}
