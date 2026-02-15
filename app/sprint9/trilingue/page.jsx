'use client';
import { useState } from 'react';

const TERMS = {
  salaire_brut:{fr:'Salaire brut',nl:'Brutoloon',de:'Bruttogehalt',en:'Gross salary'},
  salaire_net:{fr:'Salaire net',nl:'Nettoloon',de:'Nettogehalt',en:'Net salary'},
  onss:{fr:'ONSS',nl:'RSZ',de:'LSS',en:'NSSO'},
  precompte:{fr:'Precompte professionnel',nl:'Bedrijfsvoorheffing',de:'Berufssteuervorabzug',en:'Professional withholding tax'},
  cotisation:{fr:'Cotisation sociale',nl:'Sociale bijdrage',de:'Sozialbeitrag',en:'Social contribution'},
  employeur:{fr:'Employeur',nl:'Werkgever',de:'Arbeitgeber',en:'Employer'},
  travailleur:{fr:'Travailleur',nl:'Werknemer',de:'Arbeitnehmer',en:'Employee'},
  contrat:{fr:'Contrat de travail',nl:'Arbeidsovereenkomst',de:'Arbeitsvertrag',en:'Employment contract'},
  dimona:{fr:'Declaration Dimona',nl:'Dimona-aangifte',de:'Dimona-Meldung',en:'Dimona declaration'},
  dmfa:{fr:'Declaration DmfA',nl:'DmfA-aangifte',de:'DmfA-Meldung',en:'DmfA declaration'},
  pecule:{fr:'Pecule de vacances',nl:'Vakantiegeld',de:'Urlaubsgeld',en:'Holiday pay'},
  preavis:{fr:'Preavis',nl:'Opzegging',de:'Kundigung',en:'Notice period'},
  licenciement:{fr:'Licenciement',nl:'Ontslag',de:'Entlassung',en:'Dismissal'},
  commission:{fr:'Commission paritaire',nl:'Paritair comite',de:'Paritatisches Komitee',en:'Joint committee'},
  fiche_paie:{fr:'Fiche de paie',nl:'Loonfiche',de:'Gehaltsabrechnung',en:'Payslip'},
  jours_feries:{fr:'Jours feries',nl:'Feestdagen',de:'Feiertage',en:'Public holidays'},
  conge:{fr:'Conge',nl:'Verlof',de:'Urlaub',en:'Leave'},
  maladie:{fr:'Maladie',nl:'Ziekte',de:'Krankheit',en:'Illness'},
  accident:{fr:'Accident de travail',nl:'Arbeidsongeval',de:'Arbeitsunfall',en:'Work accident'},
  indexation:{fr:'Indexation',nl:'Indexering',de:'Indexierung',en:'Indexation'},
};

export default function TrilinguePage() {
  const [search,setSearch]=useState('');const [lang,setLang]=useState('nl');
  const filtered=Object.entries(TERMS).filter(([k,v])=>!search||Object.values(v).some(t=>t.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <h1>Glossaire Trilingue</h1>
      <p>Terminologie sociale en FR / NL / DE / EN — {Object.keys(TERMS).length} termes</p>
      <div style={{display:'flex',gap:16,marginBottom:24}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un terme..." style={{width:400}}/>
        <div style={{display:'flex',gap:4}}>
          {[{k:'nl',l:'NL'},{k:'de',l:'DE'},{k:'en',l:'EN'}].map(l=>(
            <button key={l.k} onClick={()=>setLang(l.k)} style={{background:lang===l.k?'#c9a227':'#1e293b',color:lang===l.k?'#0a0e1a':'#94a3b8',border:'none',padding:'8px 16px',borderRadius:6,fontWeight:600,cursor:'pointer'}}>{l.l}</button>
          ))}
        </div>
      </div>
      <table><thead><tr><th>Francais</th><th>{lang==='nl'?'Nederlands':lang==='de'?'Deutsch':'English'}</th></tr></thead>
      <tbody>{filtered.map(([k,v])=>(
        <tr key={k}><td style={{fontWeight:600,color:'#c9a227'}}>{v.fr}</td><td>{v[lang]}</td></tr>
      ))}</tbody></table>
    </div>
  );
}