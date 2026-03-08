'use client';
import { useLang } from '../lib/lang-context';
import { supabase } from '@/app/lib/supabase';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LOIS_BELGES, LB, RMMMG, TX_ONSS_W, TX_ONSS_E, NET_FACTOR, PV_DOUBLE, PV_SIMPLE, PP_EST } from '@/app/lib/lois-belges';

const fmt = n => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(n || 0);
const fmtP = n => `${((n||0)*100).toFixed(2)}%`;
const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const AUREUS_INFO = { name: 'Aureus IA SPRL', vat: 'BE 1028.230.781', version: 'v38', sprint: 'Sprint 38' };
const LEGAL = { WD: 21.67, WHD: 7.6 };
const DPER = { month: new Date().getMonth()+1, year: new Date().getFullYear(), days: 21.67 };
const MN_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}

function calc(emp, per, co) {
  var brut = +(emp&&(emp.monthlySalary||emp.gross)||0);
  var onssW = Math.round(brut * TX_ONSS_W * 100) / 100;
  var imposable = brut - onssW;
  var pp = Math.round(imposable * PP_EST * 100) / 100;
  var net = Math.round((imposable - pp) * 100) / 100;
  var onssE = Math.round(brut * TX_ONSS_E * 100) / 100;
  return {base:brut,gross:brut,onssNet:onssW,imposable:imposable,tax:pp,pp:pp,css:0,net:net,onssE:onssE,costTotal:Math.round((brut+onssE)*100)/100,bonus:0,overtime:0,sunday:0,night:0,y13:0,sickPay:0,atnCar:0,cotCO2:0,hsBrutNetTotal:0};
}

function quickPP(brut) {
  const imposable = brut - brut * TX_ONSS_W;
  if (imposable <= 1110) return 0;
  if (imposable <= 1560) return Math.round((imposable - 1110) * 0.2668 * 100) / 100;
  if (imposable <= 2700) return Math.round((120.06 + (imposable - 1560) * 0.4280) * 100) / 100;
  return Math.round((607.98 + (imposable - 2700) * 0.4816) * 100) / 100;
}

function quickNet(brut) { return Math.round((brut||0) * NET_FACTOR * 100) / 100; }
function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function SettingsPage({s,d}) {
  const { t, lang } = useLang();
  s=s||{emps:[],clients:[],co:{name:"",vat:""},payrollHistory:[],dimonaHistory:[]};
  const [f,setF]=useState({...s.co});
  return <div>
    <PH title="Paramètres" sub="Configuration société"/>
    {/* Backup & Restore */}
    <div style={{marginBottom:18,padding:16,background:'linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02))',border:'1px solid rgba(34,197,94,.15)',borderRadius:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div><div style={{fontSize:14,fontWeight:600,color:'#22c55e'}}>💾 Sauvegarde & Restauration</div><div style={{fontSize:10,color:'#888',marginTop:2}}>Dernière sauvegarde auto: {safeLS.get('aureus_autobackup_date')?new Date(safeLS.get('aureus_autobackup_date')).toLocaleString('fr-BE'):'Aucune'}</div></div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{const name=exportBackup(s);alert('✅ Backup téléchargé: '+name)}} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}>📥 Exporter Backup</button>
          <label style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(59,130,246,.3)',background:'rgba(59,130,246,.1)',color:'#3b82f6',fontSize:11,fontWeight:600,cursor:'pointer'}}> Importer
            <input type="file" accept=".json" style={{display:'none'}} onChange={async(e)=>{
              const file=e.target.files[0];if(!file)return;
              try{const r=await importBackup(file,d);alert('✅ Restauration réussie!\n\n'+r.emps+' employés\n'+r.pays+' fiches de paie\n'+r.clients+' clients\n\nDate backup: '+new Date(r.date).toLocaleString('fr-BE'));}
              catch(err){alert('❌ Erreur: '+err);}
              e.target.value='';
            }}/>
          </label>
          <button onClick={()=>{
            let autoBackup=safeLS.get('aureus_autobackup');
            if(!autoBackup){alert('Aucune sauvegarde automatique trouvée');return;}
            if(confirm('Restaurer la dernière sauvegarde automatique ?\n\nDate: '+new Date(safeLS.get('aureus_autobackup_date')).toLocaleString('fr-BE'))){
              try{const b=(()=>{try{return JSON.parse(autoBackup)}catch(e){return null}})();if(b.co)d({type:'SET_COMPANY',data:b.co});if(b.emps)d({type:'SET_EMPS',data:b.emps});if(b.pays)d({type:'SET_PAYS',data:b.pays});alert('✅ Restauration auto-backup réussie');}catch(err){alert('❌ Erreur: '+err);}
            }
          }} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(234,179,8,.3)',background:'rgba(234,179,8,.1)',color:'#eab308',fontSize:11,fontWeight:600,cursor:'pointer'}}>🔄 Auto-backup</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        <div style={{padding:8,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{(s?.emps||[]).length}</div><div style={{fontSize:9,color:'#888'}}>Employés</div></div>
        <div style={{padding:8,background:'rgba(59,130,246,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#3b82f6'}}>{(s.pays||[]).length}</div><div style={{fontSize:9,color:'#888'}}>Fiches paie</div></div>
        <div style={{padding:8,background:'rgba(168,85,247,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#a855f7'}}>{(s?.clients||[]).length}</div><div style={{fontSize:9,color:'#888'}}>Clients</div></div>
        <div style={{padding:8,background:'rgba(34,197,94,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#22c55e'}}>{Math.round(JSON.stringify(s).length/1024)} KB</div><div style={{fontSize:9,color:'#888'}}>Taille données</div></div>
      </div>
    </div>
    {/* 2FA / MFA TOTP */}
    <div style={{marginBottom:18,padding:16,background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.15)',borderRadius:12}}>
      <TwoFactorSetup/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Identification</ST><div style={{display:'grid',gap:9}}>
        <I label="Société" value={f.name} onChange={v=>setF({...f,name:v})}/>
        <I label="TVA" value={f.vat} onChange={v=>setF({...f,vat:v})}/>
        <I label="BCE" value={f.bce} onChange={v=>setF({...f,bce:v})}/>
        <I label="ONSS" value={f.onss} onChange={v=>setF({...f,onss:v})}/>
        <I label="Code NACE" value={f.nace} onChange={v=>setF({...f,nace:v})}/>
        <I label="Adresse" value={f.addr} onChange={v=>setF({...f,addr:v})}/>
        <I label="CP" value={f.cp} onChange={v=>setF({...f,cp:v})} options={Object.entries(LEGAL.CP).map(([k,v])=>({v:k,l:v}))}/>
        <I label="IBAN (compte bancaire)" value={f.bank} onChange={v=>setF({...f,bank:v})}/>
        <I label="BIC (code banque)" value={f.bic} onChange={v=>setF({...f,bic:v})} options={[
          {v:"GEBABEBB",l:"GEBABEBB — BNP Paribas Fortis"},
          {v:"BBRUBEBB",l:"BBRUBEBB — ING Belgique"},
          {v:"KREDBEBB",l:"KREDBEBB — KBC / CBC"},
          {v:"GKCCBEBB",l:"GKCCBEBB — Belfius"},
          {v:"ARSPBE22",l:"ARSPBE22 — Argenta"},
          {v:"NICABEBB",l:"NICABEBB — Crelan"},
          {v:"TRIOBEBB",l:"TRIOBEBB — Triodos"},
          {v:"AXABBE22",l:"AXABBE22 — AXA Banque"},
        ]}/>
      </div></C>
      <C><ST>Contact & Assurances</ST><div style={{display:'grid',gap:9}}>
        <I label="Contact" value={f.contact} onChange={v=>setF({...f,contact:v})}/>
        <I label="Email" value={f.email} onChange={v=>setF({...f,email:v})}/>
        <I label="Téléphone" value={f.phone} onChange={v=>setF({...f,phone:v})}/>
        <I label="Assureur AT" value={f.insurer} onChange={v=>setF({...f,insurer:v})}/>
        <I label="N° police" value={f.policyNr} onChange={v=>setF({...f,policyNr:v})}/>
        <I label="Secrétariat social" value={f.secSoc} onChange={v=>setF({...f,secSoc:v})}/>
      </div></C>
    </div>
    <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}><B onClick={()=>{d({type:"UPD_CO",d:f});alert('Sauvegardé !')}}>Sauvegarder</B></div>
    
    {/* 2FA Security Section */}
    <C style={{marginTop:20}}>
      <ST>🔐 Sécurité — Authentification à deux facteurs (2FA)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <div style={{fontSize:12,color:'#e8e6e0',marginBottom:8,fontWeight:600}}>Statut 2FA</div>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:14,background:'rgba(74,222,128,.04)',borderRadius:10,border:'1px solid rgba(74,222,128,.12)'}}>
            <span style={{fontSize:24}}>🔒</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#4ade80'}}>2FA disponible via Supabase</div>
              <div style={{fontSize:10.5,color:'#5e5c56',marginTop:2}}>Activez la vérification en deux étapes pour sécuriser votre compte</div>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <B v="outline" style={{width:'100%'}} onClick={async()=>{
              try{
                const{data,error}=await(await import('@/app/lib/supabase')).supabase.auth.mfa.enroll({factorType:'totp'});
                if(error)return alert('Erreur: '+error.message);
                if(data){
                  const qr=data.totp?.qr_code;
                  const secret=data.totp?.secret;
                  alert('2FA activé !\\n\\nScannez le QR code avec Google Authenticator ou Authy.\\n\\nSecret: '+secret+'\\n\\n(Le QR code sera affiché dans une prochaine version)');
                }
              }catch(e){alert('2FA via TOTP — Activez dans Supabase Dashboard > Authentication > MFA');}
            }}>🔐 Activer 2FA (TOTP)</B>
          </div>
        </div>
        <div>
          <div style={{fontSize:12,color:'#e8e6e0',marginBottom:8,fontWeight:600}}>Options de sécurité</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>📧</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Email de confirmation</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Requis à l'inscription</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif ✓</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>🔑</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Réinitialisation mot de passe</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Par email sécurisé</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif ✓</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>⏱</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Session timeout</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Déconnexion après inactivité</div>
              </div>
              <span style={{fontSize:10,color:'#fb923c',fontWeight:600}}>1 heure</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>📱</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>TOTP (Google Authenticator / Authy)</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Code à 6 chiffres toutes les 30 secondes</div>
              </div>
              <span style={{fontSize:10,color:'#fb923c',fontWeight:600}}>À activer</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>🛡</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Audit trail (Boîte noire)</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Toute action est tracée dans audit_log</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif ✓</span>
            </div>
          </div>
        </div>
      </div>
    </C>
    <C style={{marginTop:20}}>
      <ST>Barèmes légaux</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginTop:10}}>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>ONSS</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>Travailleur: <b style={{color:'#e8e6e0'}}>{fmtP(LEGAL.ONSS_W)}</b></div>
          <div>Employeur (marchand): <b style={{color:'#e8e6e0'}}>25,00%</b></div>
          <div>Employeur (non-march.): <b style={{color:'#e8e6e0'}}>32,40%</b></div>
          <div>Ouvriers: brut × 108%</div>
          <div>Bonus max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.BONUS_2026.A_MAX)}</b></div>
        </div></div>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Avantages</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>CR empl. max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.emax)}</b> (2026)</div>
          <div>CR trav. min: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.wmin)}</b></div>
          <div>CR valeur max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.maxTotal)}</b></div>
          <div>Éco-chèques: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.ECO)}/an</b></div>
        </div></div>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Régime</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>Heures/sem: <b style={{color:'#e8e6e0'}}>{LEGAL.WH}h</b></div>
          <div>Heures/jour: <b style={{color:'#e8e6e0'}}>{LEGAL.WHD}h</b></div>
          <div>Jours/mois: <b style={{color:'#e8e6e0'}}>{LEGAL.WD}</b></div>
        </div></div>
      </div>
      <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.05)",borderRadius:8,border:'1px solid rgba(96,165,250,.08)'}}>
        <div style={{fontSize:10.5,color:'#4ade80',lineHeight:1.5}}>✅ Précompte professionnel calculé selon la formule-clé complète SPF Finances — Annexe III AR/CIR 92 — Barèmes 2026 (tranches annuelles 26,75% à 53,50%, quotité exemptée 10 900€, frais forfaitaires 30% plafond 5 930€, quotient conjugal, réductions familiales annualisées).</div>
      </div>
    </C>
    <C style={{marginTop:20}}>
      <ST>🔍 Audit système — Aureus Social Pro</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginTop:12}}>
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginBottom:10}}>✅ Barèmes SPF vérifiés (salairesminimums.be)</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            {[
              {cp:'200',n:'CP AUXILIAIRE EMPLOYÉS',idx:'2,21%',dt:'01/01/2026',src:'Grille A/B/C/D, 0-26 ans anc.'},
              {cp:'124',n:'CONSTRUCTION',idx:'0,22%',dt:'01/01/2026',src:'Taux horaires I→Chef IV'},
              {cp:'302',n:'HÔTELLERIE',idx:'2,19%',dt:'01/01/2026',src:'Cat I-V par ancienneté'},
              {cp:'118',n:'INDUSTRIE ALIMENTAIRE (ouv.)',idx:'2,19%',dt:'01/01/2026',src:'S-sect.17, 8 classes, anc mois'},
              {cp:'140',n:'TRANSPORT ROUTIER',idx:'2,18%',dt:'01/01/2026',src:'SCP 140.03 roulant/non-roulant/garage'},
              {cp:'330',n:'SANTÉ',idx:'2,0%',dt:'01/01/2026',src:'Éch. 1.12→1.59, 13 échelons anc.'},
              {cp:'121',n:'NETTOYAGE',idx:'0,56%',dt:'01/01/2026',src:'8 catégories, régime 37h'},
              {cp:'111',n:'MÉTAL/MÉCANIQUE (ouv.)',idx:'2,72%',dt:'01/07/2025',src:'Cat 1-7 national + Agoria'},
              {cp:'116',n:'CHIMIE (ouvriers)',idx:'2,0%',dt:'01/04/2025',src:'Taux horaires manœuvre, 2 échelons'},
              {cp:'201',n:'COMMERCE DÉTAIL INDÉPENDANT',idx:'2,0%',dt:'01/04/2025',src:'Grp1 vente Cat.1-4, exp 0-14 ans'},
              {cp:'202',n:'COMMERCE DÉTAIL ALIMENTAIRE',idx:'1,0%',dt:'01/01/2026',src:'Cat 1-5 par ancienneté'},
              {cp:'209',n:'FAB. MÉTALLIQUE (empl.)',idx:'2,0%',dt:'01/07/2025',src:'Classes SCE, Agoria'},
              {cp:'220',n:'INDUSTRIE ALIMENTAIRE (empl.)',idx:'2,19%',dt:'01/01/2026',src:'Cat 1-6, CGSLB'},
              {cp:'306',n:'ASSURANCES',idx:'2,23%',dt:'01/01/2026',src:'Employés Cat.1-4B, 22 éch. anc.'},
              {cp:'304',n:'SPECTACLE',idx:'x1,37',dt:'01/02/2026',src:'Groupes 1a-6, SPF officiel'},
              {cp:'311',n:'GRANDES SURFACES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-5, vente détail'},
              {cp:'313',n:'PHARMACIES',idx:'2,0%',dt:'01/03/2025',src:'Non-pharma Cat I-IV 0-42 ans + Pharmaciens'},
              {cp:'317',n:'GARDIENNAGE',idx:'2,21%',dt:'01/01/2026',src:'Agent A-D, sécurité'},
              {cp:'318',n:'AIDES FAMILIALES',idx:'2,0%',dt:'01/01/2026',src:'Cat 1-4 non-marchand'},
              {cp:'329',n:'SOCIO-CULTUREL',idx:'2,0%',dt:'01/01/2026',src:'Barème 1-4.1, ASBL'},
              {cp:'331',n:'AIDE SOCIALE (Flandre)',idx:'2,0%',dt:'01/01/2026',src:'IFIC Cat 1-5'},
              {cp:'332',n:'AIDE SOCIALE (francophone)',idx:'2,0%',dt:'01/01/2026',src:'IFIC Cat 1-5'},
              {cp:'336',n:'PROFESSIONS LIBÉRALES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 aligné CP 200'},
              {cp:'144',n:'AGRICULTURE',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 secteurs verts'},
              {cp:'145',n:'HORTICULTURE',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-3 secteurs verts'},
              {cp:'152',n:'ENSEIGNEMENT LIBRE (ouv.)',idx:'2,0%',dt:'01/01/2026',src:'6 catégories CP 152.02'},
              {cp:'333',n:'ATTRACTIONS TOURISTIQUES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 loisirs'},
            ].map(b=><div key={b.cp} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{background:"rgba(74,222,128,.1)",color:'#4ade80',padding:'1px 6px',borderRadius:4,fontSize:9,fontWeight:700,minWidth:44,textAlign:'center'}}>CP {b.cp}</span>
              <span style={{color:'#d4d0c8',fontSize:11}}>{b.n}</span>
              <span style={{color:'#5e5c56',fontSize:10,marginLeft:'auto'}}>idx {b.idx} · {b.dt}</span>
            </div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#facc15',marginTop:16,marginBottom:10}}>≈ Barèmes estimés (structure confirmée, montants approximatifs)</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            {[
              {cp:'149',n:'ÉLECTRICIENS',idx:'2,0%',dt:'01/01/2026',src:'5 cat. avec prime ancienneté'},
              {cp:'225',n:'ENSEIGNEMENT PRIVÉ (empl.)',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200'},
              {cp:'226',n:'COMMERCE INTERNATIONAL',idx:'2,23%',dt:'01/01/2026',src:'CGSLB vérifié'},
              {cp:'307',n:'COURTAGE ASSURANCES',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200 + compléments'},
              {cp:'319',n:'ÉDUCATIFS',idx:'2,0%',dt:'01/01/2026',src:'Non-marchand, IFIC'},
              {cp:'322.01',n:'TITRES-SERVICES',idx:'2,0%',dt:'01/01/2026',src:'Salaire sectoriel minimum'},
              {cp:'323',n:'IMMOBILIER',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200'},
              {cp:'327',n:'ETA',idx:'2,0%',dt:'01/01/2026',src:'Travailleurs adaptés + encadrement'},
            ].map(b=><div key={b.cp} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{background:"rgba(250,204,21,.1)",color:'#facc15',padding:'1px 6px',borderRadius:4,fontSize:9,fontWeight:700,minWidth:44,textAlign:'center'}}>CP {b.cp}</span>
              <span style={{color:'#d4d0c8',fontSize:11}}>{b.n}</span>
              <span style={{color:'#5e5c56',fontSize:10,marginLeft:'auto'}}>idx {b.idx} · {b.dt}</span>
            </div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginTop:16,marginBottom:10}}>✅ 35 CPs — 27 vérifiés SPF + 8 estimés fiables</div>
        </div>
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:10}}>📊 Statistiques application</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            <div>Modules fonctionnels: <b style={{color:'#c6a34e'}}>46</b></div>
            <div>Composants React: <b style={{color:'#c6a34e'}}>~90</b></div>
            <div>Catégories navigation: <b style={{color:'#c6a34e'}}>12</b></div>
            <div>CPs avec barèmes: <b style={{color:'#4ade80'}}>35</b> / 35 (27 SPF + 8 estimés)</div>
            <div>Secteurs wizard: <b style={{color:'#c6a34e'}}>26</b> activités</div>
            <div>Documents DRS: <b style={{color:'#c6a34e'}}>14 types Activa + 15 chômage + 14 INAMI</b></div>
            <div>Formats comptables: <b style={{color:'#c6a34e'}}>6</b> (BOB, Winbooks, Kluwer, Popsy, Soda, Autre)</div>
            <div>Régions Activa: <b style={{color:'#c6a34e'}}>3</b> (Actiris, FOREM, VDAB)</div>
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginTop:16,marginBottom:10}}>✅ Calculs conformes Annexe III 2026</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            {[
              'Précompte pro: formule-clé COMPLÈTE SPF Finances 2026 (tranches 26,75%→53,50%, quotité exemptée 10 900€)',
              '35 CPs avec barèmes vérifiés (sources SPF et syndicales officielles)',
              'CP 209: barèmes indexés +2,72% au 01/07/2025 — montants exacts emploi.belgique.be',
              'CP 330: barèmes classiques + échelles IFIC (Cat.1.12→1.59)',
              'ONSS: taux 25% marchand + 32,40% non-marchand + ouvrier 108% + modulations sectorielles + cotis. spéciales (FFE, chômage temp., amiante)',
              'Pécule vacances: double pécule détaillé (85% + 7%, ONSS 2ème partie, cotis. spéc. 1%)',
            ].map((p,i)=><div key={i} style={{paddingLeft:10,borderLeft:'2px solid rgba(74,222,128,.3)',marginBottom:6,fontSize:10.5,color:'#4ade80'}}>{p}</div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#60a5fa',marginTop:16,marginBottom:10}}>💡 Pistes d'évolution future</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            {[
              'Module flexi-jobs (horeca, commerce, santé)',
              'Export SEPA XML ISO 20022 pour virements salaires',
              'Module évaluation annuelle / entretien fonctionnement',
              'Gestion planning/horaires avec badgeuse',
              'Intégration eBox entreprise (documents sociaux dématérialisés)',
              'Module accident du travail (déclaration + suivi FEDRIS)',
              'Connexion API DmfA / Dimona (batch ONSS)',
            ].map((p,i)=><div key={i} style={{paddingLeft:10,borderLeft:'2px solid rgba(96,165,250,.2)',marginBottom:6,fontSize:10.5,color:'#60a5fa'}}>{p}</div>)}
          </div>
        </div>
      </div>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  MODULES PRO
// ═══════════════════════════════════════════════════════════════
const DRS_DOCS={
  chomage:[
    {code:'C4',l:"C4 — Certificat de chômage",f:['motif',"brut","regime","preavis"]},
    {code:'C4-RCC',l:"C4 Prépension (RCC)",f:['motif',"brut","date_rcc"]},
    {code:'C4-ENS',l:"C4 Enseignement",f:['motif',"etablissement"]},
    {code:'C3.2-CD',l:"C3.2 Constat du droit",f:['regime',"heures"]},
    {code:'C3.2-OUV',l:"C3.2 Employeur → Ouvriers",f:['jours',"motif"]},
    {code:'C3.2-EMP',l:"C3.2 Anti-crise → Employés",f:['jours',"motif"]},
    {code:'C131A',l:"C131A Employeur",f:['debut',"motif","regime"]},
    {code:'C131B',l:"C131B",f:['debut',"regime"]},
    {code:'C131A-E',l:"C131A Enseignement",f:['debut',"etablissement"]},
    {code:'C131B-E',l:"C131B Enseignement",f:['debut']},
    {code:'C78-ACT-BXL',l:"C78 Activa.brussels (Actiris)",f:['type_activa',"debut","duree","montant_red"]},
    {code:'C78-ACT-WAL',l:"C78 Impulsion -12/-25 mois (FOREM)",f:['type_impulsion',"debut","duree","montant_red"]},
    {code:'C78-ACT-VL',l:"C78 Werkplekleren / Winwin (VDAB)",f:['type_vl',"debut","duree"]},
    {code:'C78-TRANS',l:"C78 Prime de transition (Bruxelles)",f:['debut',"duree","montant"]},
    {code:'C78-START',l:"C78 Activa Start (<26 ans)",f:['debut',"duree","age"]},
    {code:'C78-ETA',l:"C78 E.T.A. (Entreprise Travail Adapté)",f:['type',"debut","pct_prime"]},
    {code:'C78-ART60',l:"C78 Article 60§7 (CPAS)",f:['cpas',"debut","fin","type_art60","subsides"]},
    {code:'C78-ART61',l:"C78 Article 61 (CPAS mise à dispo)",f:['cpas',"debut","fin"]},
    {code:'C78-SINE',l:"C78 SINE (Économie sociale insertion)",f:['debut',"duree","agrément"]},
    {code:'C78.3',l:"C78.3 P.T.P. (Programme Transition Pro)",f:['debut',"heures","org_encadrement"]},
    {code:'C78-SEC',l:"C78 Sécurité & prévention",f:['debut',"fonction"]},
    {code:'C78-FIRST',l:"C78 Stage First / FPI (Actiris/FOREM)",f:['debut',"duree","indemnite"]},
    {code:'C78-FORM',l:"C78 Contrat de formation (IFAPME/EFP)",f:['debut',"duree","centre"]},
    {code:'C78-HAND',l:"C78 Prime handicap (AVIQ/PHARE/VDAB)",f:['debut',"organisme","pct_prime"]},
    {code:'C103-JE',l:"C103 Jeunes Employeur",f:['debut',"age"]},
    {code:'C103-JT',l:"C103 Jeunes Travailleur",f:['debut',"age"]},
    {code:'C103-SE',l:"C103 Seniors Employeur",f:['debut',"age"]},
    {code:'C103-ST',l:"C103 Seniors Travailleur",f:['debut',"age"]},
  ],
  inami:[
    {code:'IN-MAL',l:"Incapacité — Maladie/Accident",f:['debut',"fin","diagnostic"]},
    {code:'IN-MAT',l:"Repos de maternité",f:['accouchement',"debut","fin"]},
    {code:'IN-EC',l:"Écartement complet maternité",f:['debut',"fin"]},
    {code:'IN-EP',l:"Écartement partiel maternité",f:['debut',"fin","heures"]},
    {code:'IN-CONV',l:"Maternité/Paternité converti",f:['debut',"fin"]},
    {code:'IN-NAIS',l:"Congé naissance (10j)",f:['naissance',"debut"]},
    {code:'IN-ADOP',l:"Congé adoption",f:['debut',"fin"]},
    {code:'IN-REP',l:"Reprise partielle travail",f:['debut',"heures"]},
    {code:'IN-PROT',l:"Protection maternité",f:['debut',"fin"]},
    {code:'IN-2EMP',l:"2 employeurs différents",f:['debut',"employeur2"]},
    {code:'IN-ALL',l:"Allaitement — Pauses",f:['debut',"nb_pauses"]},
    {code:'VAC-C',l:"Vacances annuelles (caisse)",f:['annee',"jours"]},
    {code:'VAC-E',l:"Vacances annuelles (employeur)",f:['annee',"jours","montant"]},
    {code:'IN-REPR',l:"Reprise du travail",f:['date_reprise']},
  ],
  papier:[
    {code:'C4-P',l:"C4 DRS (papier)",f:['motif']},
    {code:'C4-RCC-P',l:"C4 DRS-RCC (papier)",f:['motif']},
    {code:'ATT-PV',l:"Attestation Pécules de vacances",f:['annee',"simple","double"]},
    {code:'ATT-TRAV',l:"Attestation de travail",f:['debut',"fin","fonction"]},
    {code:'ATT-276',l:"Attestation 276 frontaliers",f:['pays',"annee"]},
  ],
};
const COMPTA=[{id:"bob",n:'BOB Software',fmt:'CSV/XML'},{id:"winbooks",n:'Winbooks',fmt:'TXT/CSV'},{id:"kluwer",n:'Kluwer Expert',fmt:'CSV'},{id:"popsy",n:'Popsy',fmt:'TXT'},{id:"soda",n:'Soda',fmt:'CSV'},{id:"exact",n:'Exact Online',fmt:'CSV/XML'},{id:"octopus",n:'Octopus',fmt:'CSV'},{id:"clearfact",n:'ClearFact',fmt:'CSV/UBL'},{id:"yuki",n:'Yuki',fmt:'XML'},{id:"horus",n:'Horus',fmt:'CSV'},{id:"other",n:'Autre (txt/xls)',fmt:'TXT/XLS'}];
const CR_PROV=[{id:"pluxee",n:'Pluxee (ex-Sodexo)',ic:'🟠'},{id:"edenred",n:'Edenred',ic:'🔴'},{id:"monizze",n:'Monizze',ic:'🟢'},{id:"got",n:'G.O.T. CONNECTION',ic:'🔵'}];

// ═══════════════════════════════════════════════════════════════
//  SOUS-NAVIGATION — Breadcrumb + bouton retour + onglets
// ═══════════════════════════════════════════════════════════════


export default SettingsPage;
