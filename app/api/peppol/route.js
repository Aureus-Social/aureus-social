// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/peppol
// Génération factures UBL 2.1 pour e-invoicing Peppol belge
// Peppol ID: 0208:1028230781 (BE KBO/BCE)
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

const PEPPOL_ID_AUREUS = '0208:1028230781';

function genUBL21(facture, seller, buyer) {
  const now = new Date();
  const dueDate = facture.echeance || new Date(now.getTime() + 30*24*60*60*1000).toISOString().slice(0,10);
  const issueDate = facture.created_at ? facture.created_at.slice(0,10) : now.toISOString().slice(0,10);
  const invoiceId = facture.numero || `FAC-${now.getFullYear()}-0001`;
  const montant = parseFloat(facture.montant || 0);
  const tva21 = Math.round(montant * 0.21 * 100) / 100;
  const totalTTC = Math.round((montant + tva21) * 100) / 100;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">

  <!-- ═══ En-tête ═══ -->
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${invoiceId}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:DueDate>${dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cbc:BuyerReference>${buyer.ref || invoiceId}</cbc:BuyerReference>

  <!-- ═══ Vendeur (Aureus IA SPRL) ═══ -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="0208">${PEPPOL_ID_AUREUS}</cbc:EndpointID>
      <cac:PartyName><cbc:Name>${seller.name || 'Aureus IA SPRL'}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${seller.street || 'Place Marcel Broodthaers 8'}</cbc:StreetName>
        <cbc:CityName>${seller.city || 'Saint-Gilles'}</cbc:CityName>
        <cbc:PostalZone>${seller.zip || '1060'}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>BE</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${seller.vat || 'BE1028230781'}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${seller.name || 'Aureus IA SPRL'}</cbc:RegistrationName>
        <cbc:CompanyID>${seller.bce || '1028230781'}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:ElectronicMail>${seller.email || 'info@aureus-ia.com'}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- ═══ Acheteur ═══ -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${buyer.peppol_id ? `<cbc:EndpointID schemeID="0208">${buyer.peppol_id}</cbc:EndpointID>` : ''}
      <cac:PartyName><cbc:Name>${buyer.name || facture.client_name || 'Client'}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${buyer.street || '—'}</cbc:StreetName>
        <cbc:CityName>${buyer.city || '—'}</cbc:CityName>
        <cac:Country><cbc:IdentificationCode>BE</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      ${buyer.vat ? `<cac:PartyTaxScheme><cbc:CompanyID>${buyer.vat}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme>` : ''}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${buyer.name || facture.client_name || 'Client'}</cbc:RegistrationName>
        ${buyer.bce ? `<cbc:CompanyID>${buyer.bce}</cbc:CompanyID>` : ''}
      </cac:PartyLegalEntity>
      <cac:Contact>
        ${facture.client_email ? `<cbc:ElectronicMail>${facture.client_email}</cbc:ElectronicMail>` : ''}
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- ═══ Paiement ═══ -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cbc:PaymentID>${invoiceId}</cbc:PaymentID>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${seller.iban || 'BE60063428488290'}</cbc:ID>
      <cac:FinancialInstitutionBranch>
        <cbc:ID>${seller.bic || 'GKCCBEBB'}</cbc:ID>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  <cac:PaymentTerms>
    <cbc:Note>Net 30 jours. Intérêts de retard 10%/an + indemnité forfaitaire 40€ (L. 02/08/2002).</cbc:Note>
  </cac:PaymentTerms>

  <!-- ═══ TVA ═══ -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${tva21.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="EUR">${montant.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="EUR">${tva21.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>21</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- ═══ Totaux ═══ -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${montant.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${montant.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${totalTTC.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${totalTTC.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- ═══ Lignes ═══ -->
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${montant.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${facture.description || 'Services de secrétariat social'}</cbc:Description>
      <cbc:Name>${facture.description || 'Services Aureus Social Pro'}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>21</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="EUR">${montant.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>

</Invoice>`;
}

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const factureId = searchParams.get('id');
  if (!factureId) return Response.json({ peppol_id: PEPPOL_ID_AUREUS, info: 'Passez ?id=<facture_id> pour générer un UBL 2.1' });
  if (!/^[0-9a-f-]{36}$/i.test(factureId)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  const { data: facture } = await db.from('factures').select('*').eq('id', factureId).single();
  if (!facture) return Response.json({ error: 'Facture introuvable' }, { status: 404 });
  const { data: co } = await db.from('clients').select('*').eq('created_by', u.id).single().catch(()=>({data:{}}));
  const seller = { name: co?.company_name || co?.name || 'Aureus IA SPRL', vat: 'BE1028230781', bce: '1028230781', street: 'Place Marcel Broodthaers 8', city: 'Saint-Gilles', zip: '1060', iban: 'BE60063428488290', bic: 'GKCCBEBB', email: 'info@aureus-ia.com' };
  const buyer = { name: facture.client_name, vat: null, bce: null, email: facture.client_email, peppol_id: null };
  const xml = genUBL21(facture, seller, buyer);
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Content-Disposition': `attachment; filename="peppol-${facture.numero}.xml"` } });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { facture, seller, buyer } = body;
  if (!facture?.montant) return Response.json({ error: 'facture.montant requis' }, { status: 400 });
  const xml = genUBL21(facture, seller||{}, buyer||{});
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
