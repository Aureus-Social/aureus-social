'use client';
// ═══════════════════════════════════════════════════════════════
// PORTAIL EMPLOYÉ SELF-SERVICE — Aureus Social Pro
// Vue personnelle : fiches de paie, contrats, absences, documents
// Auth Supabase → liaison automatique par email
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo, useEffect } from 'react';
import { C, fmt, f2 } from '@/app/lib/helpers';
import { supabase } from '@/app/lib/supabase';

const GOLD='#c6a34e',GREEN='#22c55e',BLUE='#60a5fa',RED='#ef4444',PURPLE='#a78bfa';

function Badge({c,bg,children}){
  return <span style={{fontSize:9,padding:'2px 7px',borderRadius:5,fontWeight:700,background:bg||`${c}18`,color:c||GOLD}}>{children}</span>;
}

function StatCard({icon,label,value,sub,color}){
  return (
    <div style={{background:'linear-gradient(145deg,#0e1220,#131829)',border:'1px solid rgba(139,115,60,.12)',borderRadius:12,padding:'18px 16px'}}>
      <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:color||GOLD}}>{value}</div>
      {sub && <div style={{fontSize:10,color:'#5e5c56',marginTop:4}}>{sub}</div>}
    </div>
  );
}

export default function PortailEmploye({s, d}) {
  s = s||{emps:[],pays:[],co:{},dims:[]};
  const [selectedEmpId, setSelectedEmpId] = useState((s.emps||[])[0]?.id||'');
  const [tab, setTab] = useState('fiches');
  const [docFilter, setDocFilter] = useState('all');
  const [authEmail, setAuthEmail] = useState(null);
  const [linkedEmp, setLinkedEmp] = useState(null);

  // ── Liaison auth Supabase → employé par email ──
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setAuthEmail(user.email);
          // Chercher l'employé avec cet email
          const found = (s.emps || []).find(e =>
            (e.email || '').toLowerCase() === user.email.toLowerCase()
          );
          if (found) {
            setLinkedEmp(found);
            setSelectedEmpId(found.id);
          }
        }
      } catch(e) {}
    })();
  }, [s.emps]);

  const emp = useMemo(() => (s.emps||[]).find(e=>e.id===selectedEmpId)||(s.emps||[])[0], [selectedEmpId, s.emps]);
  const myFiches = useMemo(() => (s.pays||[]).filter(p=>p.empId===emp?.id||p.employee_id===emp?.id).sort((a,b)=>new Date(b.at||b.created_at||0)-new Date(a.at||a.created_at||0)), [emp, s.pays]);
  const myDimonas = useMemo(() => (s.dims||[]).filter(d=>d.niss===emp?.niss), [emp, s.dims]);

  const totalBrut = myFiches.reduce((a,p)=>a+(p.gross||p.brut||0),0);
  const totalNet  = myFiches.reduce((a,p)=>a+(p.net||0),0);
  const totalONSS = myFiches.reduce((a,p)=>a+(p.onssNet||p.onss||0),0);
  const avgNet    = myFiches.length ? totalNet/myFiches.length : 0;

  const MN = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const now = new Date();

  const TABS = [
    {id:'fiches',   icon:'💰', label:'Fiches de paie'},
    {id:'contrat',  icon:'📝', label:'Mon contrat'},
    {id:'absences', icon:'📅', label:'Absences & congés'},
    {id:'docs',     icon:'📁', label:'Mes documents'},
    {id:'dimona',   icon:'📡', label:'Dimona'},
    {id:'rgpd',     icon:'🔐', label:'Mes droits RGPD'},
  ];

  // ── Contenu de l'onglet ──
  const renderTab = () => {
    switch(tab) {
      case 'fiches': return (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
            <StatCard icon='💰' label='Fiches de paie' value={myFiches.length} sub={`${myFiches.length} période(s)`} color={GOLD}/>
            <StatCard icon='📊' label='Brut total' value={fmt(totalBrut)} sub={`Moy: ${fmt(myFiches.length?totalBrut/myFiches.length:0)}/mois`} color={BLUE}/>
            <StatCard icon='💚' label='Net total reçu' value={fmt(totalNet)} sub={`Moy: ${fmt(avgNet)}/mois`} color={GREEN}/>
            <StatCard icon='🏛' label='ONSS total' value={fmt(totalONSS)} sub={`13,07% du brut`} color={PURPLE}/>
          </div>
          {myFiches.length === 0
            ? <div style={{padding:40,textAlign:'center',color:'#5e5c56',border:'1px dashed rgba(198,163,78,.1)',borderRadius:12}}>Aucune fiche de paie disponible</div>
            : <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {myFiches.map((f,i) => {
                  const d = new Date(f.at||f.created_at||0);
                  const period = f.period || `${MN[d.getMonth()]} ${d.getFullYear()}`;
                  return (
                    <div key={f.id||i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:'rgba(255,255,255,.02)',border:'1px solid rgba(139,115,60,.1)',borderRadius:10}}>
                      <div style={{width:36,height:36,borderRadius:8,background:`${GOLD}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>💰</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{period}</div>
                        <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>
                          Brut: {fmt(f.gross||f.brut||0)} · ONSS: -{fmt(f.onssNet||f.onss||0)} · PP: -{fmt(f.pp||0)}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:16,fontWeight:700,color:GREEN}}>{fmt(f.net||0)}</div>
                        <Badge c={GREEN}>Net</Badge>
                      </div>
                      <button onClick={()=>{
                        const csv = `Période;Brut;ONSS;PP;Net\n${period};${f.gross||0};${f.onssNet||0};${f.pp||0};${f.net||0}`;
                        const blob = new Blob(['\uFEFF'+csv],{type:'text/csv'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href=url; a.download=`fiche_${period.replace(' ','_')}.csv`; a.click();
                        URL.revokeObjectURL(url);
                      }} style={{padding:'6px 12px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:GOLD,fontSize:10,cursor:'pointer',fontWeight:600}}>📥 CSV</button>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      );

      case 'contrat': return (
        <div>
          {!emp ? <div style={{padding:40,textAlign:'center',color:'#5e5c56'}}>Sélectionnez un employé</div> : (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {/* Identité */}
              <C style={{padding:'20px 22px'}}>
                <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14,borderBottom:'1px solid rgba(198,163,78,.1)',paddingBottom:8}}>👤 Identité</div>
                {[
                  ['Nom complet', `${emp.first||''} ${emp.last||''}`.trim()||'—'],
                  ['NISS', emp.niss||'⚠️ Manquant'],
                  ['Email', emp.email||'—'],
                  ['Téléphone', emp.phone||'—'],
                  ['IBAN', emp.iban ? `****${emp.iban.slice(-4)}` : '⚠️ Manquant'],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <span style={{fontSize:11,color:'#5e5c56'}}>{k}</span>
                    <span style={{fontSize:11,color:'#d4d0c8',fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </C>
              {/* Contrat */}
              <C style={{padding:'20px 22px'}}>
                <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14,borderBottom:'1px solid rgba(198,163,78,.1)',paddingBottom:8}}>📝 Contrat</div>
                {[
                  ['Type', emp.contractType||emp.contract||'CDI'],
                  ['Statut', emp.statut||'Employé'],
                  ['Commission paritaire', `CP ${emp.cp||'200'}`],
                  ['Régime', `${emp.regime||100}%`],
                  ['Brut mensuel', fmt(emp.monthlySalary||0)],
                  ['Fonction', emp.fonction||emp.jobTitle||'—'],
                  ['Date entrée', emp.startDate||emp.startD||'—'],
                  ['Date sortie', emp.endDate||emp.endD||'—'],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <span style={{fontSize:11,color:'#5e5c56'}}>{k}</span>
                    <span style={{fontSize:11,color:'#d4d0c8',fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </C>
              {/* Avantages */}
              <C style={{padding:'20px 22px',gridColumn:'1/-1'}}>
                <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14,borderBottom:'1px solid rgba(198,163,78,.1)',paddingBottom:8}}>🎁 Avantages extra-légaux</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {emp.chequesRepas && <Badge c={GREEN} bg='rgba(34,197,94,.1)'>🍽️ Chèques-repas {emp.chequesRepasVal||8}€/j</Badge>}
                  {emp.ecocheques && <Badge c={BLUE} bg='rgba(96,165,250,.1)'>🌱 Éco-chèques {emp.ecochequesVal||250}€/an</Badge>}
                  {emp.voiture && <Badge c={PURPLE} bg='rgba(167,139,250,.1)'>🚗 Voiture société</Badge>}
                  {emp.gsm && <Badge c={GOLD}>📱 GSM</Badge>}
                  {emp.laptop && <Badge c='#fb923c' bg='rgba(251,146,60,.1)'>💻 Laptop</Badge>}
                  {emp.assuranceGrouppe && <Badge c='#f472b6' bg='rgba(244,114,182,.1)'>🏥 Assurance groupe</Badge>}
                  {!emp.chequesRepas && !emp.ecocheques && !emp.voiture && <span style={{fontSize:11,color:'#5e5c56'}}>Aucun avantage encodé</span>}
                </div>
              </C>
            </div>
          )}
        </div>
      );

      case 'absences': return (
        <div>
          <C style={{padding:'20px 22px',marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>📅 Solde congés estimé 2026</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {[
                {label:'Congé légal', value:'20j', sub:'4 semaines (employés)', color:GREEN},
                {label:'Jours fériés', value:'10j', sub:'Belge 2026', color:BLUE},
                {label:'Crédit-temps', value:emp?.creditTemps||'—', sub:'Selon CCT', color:PURPLE},
                {label:'Maladie', value:'30j', sub:'Salaire garanti', color:'#fb923c'},
              ].map(s=>(
                <div key={s.label} style={{padding:'14px 12px',background:'rgba(255,255,255,.02)',border:`1px solid ${s.color}20`,borderRadius:10,textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:700,color:s.color,marginBottom:4}}>{s.value}</div>
                  <div style={{fontSize:11,color:'#d4d0c8',fontWeight:600,marginBottom:2}}>{s.label}</div>
                  <div style={{fontSize:9,color:'#5e5c56'}}>{s.sub}</div>
                </div>
              ))}
            </div>
          </C>
          <C style={{padding:'20px 22px'}}>
            <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>📆 Jours fériés belges 2026</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
              {[
                ['01/01','Jour de l\'an'],['06/04','Lundi de Pâques'],['01/05','Fête du Travail'],
                ['14/05','Ascension'],['25/05','Lundi de Pentecôte'],['11/07','Fête de la Communauté flamande (Flandre)'],
                ['21/07','Fête Nationale'],['15/08','Assomption'],['01/11','Toussaint'],
                ['11/11','Armistice'],['25/12','Noël'],
              ].map(([d,n])=>(
                <div key={d} style={{display:'flex',gap:10,padding:'8px 10px',background:'rgba(255,255,255,.02)',borderRadius:7,border:'1px solid rgba(255,255,255,.04)'}}>
                  <span style={{fontSize:10,fontWeight:700,color:GOLD,minWidth:40}}>{d}</span>
                  <span style={{fontSize:10,color:'#d4d0c8'}}>{n}</span>
                </div>
              ))}
            </div>
          </C>
        </div>
      );

      case 'docs': return (
        <div>
          <C style={{padding:'20px 22px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:GOLD}}>📁 Mes documents</div>
              <div style={{display:'flex',gap:6}}>
                {['all','contrat','paie','admin'].map(f=>(
                  <button key={f} onClick={()=>setDocFilter(f)} style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${docFilter===f?GOLD:'rgba(198,163,78,.15)'}`,background:docFilter===f?`${GOLD}15`:'transparent',color:docFilter===f?GOLD:'#5e5c56',fontSize:10,cursor:'pointer',fontWeight:600}}>
                    {f==='all'?'Tous':f==='contrat'?'Contrats':f==='paie'?'Paie':'Admin'}
                  </button>
                ))}
              </div>
            </div>
            {(() => {
              // Documents réels : fiches de paie depuis s.pays + docs fixes RH
              const MN = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
              const payslipDocs = myFiches.map(f => {
                const d = new Date(f.at||f.created_at||0);
                const period = f.period || `${MN[d.getMonth()]} ${d.getFullYear()}`;
                return {
                  icon:'💰', name:`Fiche de paie — ${period}`, date: d.toLocaleDateString('fr-BE'),
                  type:'paie', empId: f.empId||f.employee_id,
                  onDownload: () => {
                    const csv = `Période;Brut;ONSS;PP;Net\n${period};${f.gross||0};${f.onssNet||0};${f.pp||0};${f.net||0}`;
                    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href=url; a.download=`fiche_${period.replace(' ','_')}.csv`; a.click();
                    URL.revokeObjectURL(url);
                  }
                };
              });
              const adminDocs = [
                {icon:'📝', name:'Contrat de travail', date: emp?.startDate||emp?.startD||'—', type:'contrat'},
                {icon:'📋', name:'Règlement de travail', date:'01/01/2026', type:'admin'},
                {icon:'🆔', name:'Annexe RGPD Art.13', date: emp?.startDate||emp?.startD||'—', type:'admin'},
                ...(emp?.chequesRepas ? [{icon:'🍽️', name:'Convention chèques-repas', date:'01/01/2026', type:'admin'}] : []),
                ...(emp?.voiture ? [{icon:'🚗', name:'Avenant voiture de société + ATN', date: emp?.startDate||'—', type:'contrat'}] : []),
                ...(emp?.nonConc ? [{icon:'🔒', name:'Clause de non-concurrence', date: emp?.startDate||'—', type:'contrat'}] : []),
              ];
              const allDocs = [...payslipDocs, ...adminDocs].filter(doc=>docFilter==='all'||doc.type===docFilter);
              if (allDocs.length === 0) return (
                <div style={{padding:30,textAlign:'center',color:'#5e5c56',border:'1px dashed rgba(198,163,78,.1)',borderRadius:10}}>
                  Aucun document disponible
                  {docFilter !== 'all' && <div style={{fontSize:10,marginTop:6}}>Changer le filtre pour voir tous les documents</div>}
                </div>
              );
              return (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {allDocs.map((doc,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'rgba(255,255,255,.02)',border:'1px solid rgba(139,115,60,.08)',borderRadius:9}}>
                      <span style={{fontSize:18}}>{doc.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:500,color:'#e8e6e0'}}>{doc.name}</div>
                        <div style={{fontSize:9,color:'#5e5c56',marginTop:2}}>{doc.date}</div>
                      </div>
                      <Badge c={doc.type==='contrat'?BLUE:doc.type==='paie'?GREEN:GOLD}>{doc.type}</Badge>
                      {doc.onDownload
                        ? <button onClick={doc.onDownload} style={{padding:'5px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'transparent',color:GOLD,fontSize:9,cursor:'pointer',fontWeight:600}}>📥 CSV</button>
                        : <button onClick={()=>window.open(`mailto:info@aureus-ia.com?subject=Document ${doc.name}&body=Bonjour,%0A%0AJe demande le document suivant : ${doc.name}%0A%0ACordialement`)} style={{padding:'5px 10px',borderRadius:6,border:'1px solid rgba(96,165,250,.2)',background:'transparent',color:BLUE,fontSize:9,cursor:'pointer',fontWeight:600}}>📧 Demander</button>
                      }
                    </div>
                  ))}
                  <div style={{padding:'10px 12px',background:'rgba(96,165,250,.04)',borderRadius:8,border:'1px solid rgba(96,165,250,.1)',fontSize:10,color:'#5e5c56',marginTop:4}}>
                    💡 Pour télécharger un document officiel, contactez votre gestionnaire de paie à <a href="mailto:info@aureus-ia.com" style={{color:GOLD}}>info@aureus-ia.com</a>
                  </div>
                </div>
              );
            })()}
          </C>
        </div>
      );

      case 'dimona': return (
        <div>
          <C style={{padding:'20px 22px'}}>
            <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>📡 Historique Dimona</div>
            {myDimonas.length === 0
              ? <div style={{padding:30,textAlign:'center',color:'#5e5c56',border:'1px dashed rgba(198,163,78,.1)',borderRadius:10}}>Aucune déclaration Dimona trouvée</div>
              : myDimonas.map((dim,i)=>(
                  <div key={i} style={{display:'flex',gap:12,padding:'12px 14px',marginBottom:6,background:'rgba(255,255,255,.02)',border:'1px solid rgba(139,115,60,.08)',borderRadius:9}}>
                    <span style={{fontSize:14}}>{dim.action==='IN'?'📥':dim.action==='OUT'?'📤':'🔄'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{dim.action} — {dim.startDate||dim.date||'—'}</div>
                      <div style={{fontSize:9,color:'#5e5c56'}}>Réf: {dim.ref||dim.id||'—'}</div>
                    </div>
                    <Badge c={dim.status==='ACCEPTED'||dim.status==='submitted'?GREEN:RED}>{dim.status||'—'}</Badge>
                  </div>
                ))
            }
          </C>
        </div>
      );

      case 'rgpd': return (
        <div>
          <C style={{padding:'20px 22px',marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:4}}>🔐 Mes droits RGPD (Art. 15 à 20)</div>
            <div style={{fontSize:11,color:'#5e5c56',marginBottom:16}}>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles traitées par Aureus IA SPRL.</div>
            {[
              {icon:'👁️', art:'Art. 15', title:'Droit d\'accès', desc:'Obtenir une copie de toutes vos données personnelles traitées.', action:'Exporter mes données', color:'rgba(59,130,246,.15)', border:'rgba(59,130,246,.3)'},
              {icon:'✏️', art:'Art. 16', title:'Droit de rectification', desc:'Corriger des données inexactes ou incomplètes vous concernant.', action:'Demander une rectification', color:'rgba(234,179,8,.1)', border:'rgba(234,179,8,.25)'},
              {icon:'🗑️', art:'Art. 17', title:'Droit à l\'effacement', desc:'Demander la suppression de vos données (sous réserve obligations légales).', action:'Demander l\'effacement', color:'rgba(239,68,68,.1)', border:'rgba(239,68,68,.25)'},
              {icon:'📦', art:'Art. 20', title:'Droit à la portabilité', desc:'Recevoir vos données dans un format structuré et lisible par machine (JSON).', action:'Télécharger JSON', color:'rgba(34,197,94,.1)', border:'rgba(34,197,94,.25)'},
              {icon:'🚫', art:'Art. 21', title:'Droit d\'opposition', desc:'Vous opposer au traitement de vos données à des fins de prospection.', action:'Exercer ce droit', color:'rgba(168,85,247,.1)', border:'rgba(168,85,247,.25)'},
              {icon:'⏸️', art:'Art. 18', title:'Droit à la limitation', desc:'Demander la suspension temporaire du traitement de vos données.', action:'Demander la limitation', color:'rgba(249,115,22,.1)', border:'rgba(249,115,22,.25)'},
            ].map((r,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:r.color,border:`1px solid ${r.border}`,borderRadius:10,marginBottom:8}}>
                <span style={{fontSize:20,flexShrink:0}}>{r.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:2}}>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:GOLD}}>{r.art}</span>
                    <span style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{r.title}</span>
                  </div>
                  <div style={{fontSize:11,color:'#5e5c56'}}>{r.desc}</div>
                </div>
                <button
                  onClick={()=>window.open('mailto:info@aureus-ia.com?subject=RGPD '+r.art+' — '+r.title+'&body=Bonjour,%0A%0AJe souhaite exercer mon '+r.title.toLowerCase()+'.%0A%0ACordialement')}
                  style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${r.border}`,background:'transparent',color:'#e8e6e0',fontSize:10,cursor:'pointer',fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>
                  {r.action} →
                </button>
              </div>
            ))}
          </C>
          <C style={{padding:'16px 22px'}}>
            <div style={{fontSize:11,color:'#5e5c56',lineHeight:1.7}}>
              📬 <strong style={{color:GOLD}}>Contact DPO</strong> : <a href="mailto:info@aureus-ia.com" style={{color:GOLD}}>info@aureus-ia.com</a> — Réponse sous 30 jours (Art. 12 RGPD)<br/>
              🏛️ <strong style={{color:'#e8e6e0'}}>Réclamation APD</strong> : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" style={{color:'rgba(255,255,255,.4)'}}>autoriteprotectiondonnees.be ↗</a><br/>
              🔒 Responsable du traitement : Aureus IA SPRL · BCE BE 1028.230.781 · Saint-Gilles, Bruxelles
            </div>
          </C>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#e8e6e0',margin:0}}>Mon Espace Employé</h1>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:4}}>Portail self-service — {s.co?.name||'—'}</div>
        </div>
        {/* Sélecteur employé (admin uniquement) */}
        {(s.emps||[]).length > 1 && (
          <select value={selectedEmpId} onChange={e=>setSelectedEmpId(e.target.value)}
            style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'#0e1220',color:'#d4d0c8',fontSize:12,cursor:'pointer'}}>
            {(s.emps||[]).map(e=>(
              <option key={e.id} value={e.id}>{e.first||''} {e.last||''}</option>
            ))}
          </select>
        )}
      </div>

      {/* Profil employé */}
      {emp && (
        <div style={{display:'flex',alignItems:'center',gap:16,padding:'16px 20px',marginBottom:20,background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.15)',borderRadius:12}}>
          <div style={{width:48,height:48,borderRadius:12,background:`${GOLD}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700,color:GOLD}}>
            {(emp.first||'?')[0]}{(emp.last||'')[0]}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:'#e8e6e0'}}>{emp.first||''} {emp.last||''}</div>
            <div style={{fontSize:10,color:'#5e5c56',marginTop:3}}>{emp.fonction||emp.jobTitle||'—'} · CP {emp.cp||'200'} · {emp.statut||'Employé'}</div>
          </div>
          <div style={{display:'flex',gap:6}}>
            <Badge c={emp.status==='sorti'?RED:GREEN}>{emp.status==='sorti'?'SORTI':'ACTIF'}</Badge>
            <Badge c={BLUE}>{emp.contractType||emp.contract||'CDI'}</Badge>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:18,borderBottom:'1px solid rgba(198,163,78,.08)',paddingBottom:2}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'8px 14px',borderRadius:'7px 7px 0 0',border:'none',background:tab===t.id?'rgba(198,163,78,.1)':'transparent',color:tab===t.id?GOLD:'#5e5c56',fontSize:11,cursor:'pointer',fontWeight:tab===t.id?700:400,borderBottom:tab===t.id?`2px solid ${GOLD}`:'2px solid transparent'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}
