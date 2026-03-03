const fs=require('fs');
let c=fs.readFileSync('app/modules/SprintComponents.js','utf8');

const oldMod='const modules=[{k:"dashboard",l:"Dashboard"},{k:"paie",l:"Salaires & Calculs"},{k:"onss",l:"Declarations ONSS"},{k:"dimona",l:"Dimona IN/OUT"},{k:"contrats",l:"Contrats"},{k:"docs",l:"Documents juridiques"},{k:"export",l:"Export comptable"},{k:"config",l:"Configuration"},{k:"clients",l:"Gestion clients"},{k:"portail",l:"Portail client/employe"},{k:"audit",l:"Audit & Logs"},{k:"simulateurs",l:"Simulateurs & Comparateur"},{k:"commercial",l:"Page Commerciale & Prospects"}]';

const newMod='const modules=[{k:"_g1",l:"\\u25AB TABLEAU DE BORD",grp:true},{k:"dashboard",l:"Dashboard Principal"},{k:"commandcenter",l:"Command Center"},{k:"notifications",l:"Notifications & Alertes"},{k:"_g2",l:"\\u25AB GESTION RH & PAIE",grp:true},{k:"paie",l:"Salaires & Fiches de Paie"},{k:"employees",l:"Liste Employes"},{k:"onboarding",l:"Onboarding & Wizard"},{k:"proceduresrh",l:"Procedures RH (43)"},{k:"rh",l:"RH & Workflows"},{k:"absences",l:"Absences & Conges"},{k:"contrats",l:"Contrats & Documents"},{k:"docs",l:"Documents Juridiques"},{k:"primes",l:"Primes & Avantages (56)"},{k:"simulateurs",l:"Simulateurs & Comparateur"},{k:"portail",l:"Portail Employe/Client"},{k:"calendrier",l:"Calendrier Social"},{k:"vehicules",l:"Vehicules & ATN"},{k:"flexijobs",l:"Flexi-Jobs"},{k:"_g3",l:"\\u25AB DECLARATIONS & COMPTABILITE",grp:true},{k:"onss",l:"Declarations ONSS/DMFA"},{k:"dimona",l:"Dimona IN/OUT"},{k:"fiscal",l:"Precompte & Belcotax"},{k:"export",l:"Export Comptable"},{k:"facturation",l:"Facturation"},{k:"sepa",l:"SEPA & Paiements"},{k:"reporting",l:"Reporting & Analytics"},{k:"ged",l:"GED & Archives"},{k:"_g4",l:"\\u25AB ADMINISTRATION",grp:true},{k:"config",l:"Configuration"},{k:"clients",l:"Gestion Clients"},{k:"autopilot",l:"Autopilot & Mass Engine"},{k:"compliance",l:"Compliance & RGPD"},{k:"audit",l:"Audit & Logs"},{k:"integrations",l:"Integrations"},{k:"fiduciaire",l:"Hub Fiduciaire"},{k:"securite",l:"Securite & Monitoring"},{k:"commercial",l:"Page Commerciale & Prospects"}]';

if(!c.includes(oldMod)){console.log('ERROR: old modules not found');process.exit(1);}
c=c.replace(oldMod,newMod);
console.log('1/4 Modules replaced');

const pk=['dashboard','commandcenter','notifications','paie','employees','onboarding','proceduresrh','rh','absences','contrats','docs','primes','simulateurs','portail','calendrier','vehicules','flexijobs','onss','dimona','fiscal','export','facturation','sepa','reporting','ged','config','clients','autopilot','compliance','audit','integrations','fiduciaire','securite','commercial'];
function mp(trueK){return'{'+pk.map(k=>k+':'+(trueK.includes(k)?'true':'false')).join(',')+'}';}

const adminP=mp(pk);
const gestP=mp(pk.filter(k=>!['config','clients','autopilot','compliance','integrations','fiduciaire','securite','commercial'].includes(k)));
const clientP=mp(['dashboard','docs','portail']);
const empP=mp(['portail']);
const comptP=mp(['export','reporting','ged','fiscal','facturation']);
const commP=mp(['dashboard','simulateurs','commercial']);

c=c.replace(/id:"admin",name:"Administrateur",desc:"Acces total",color:"#c6a34e",perms:\{[^}]+\}/,'id:"admin",name:"Administrateur",desc:"Acces total",color:"#c6a34e",perms:'+adminP);
c=c.replace(/id:"gestionnaire",name:"Gestionnaire",desc:"Clients assignes",color:"#60a5fa",perms:\{[^}]+\}/,'id:"gestionnaire",name:"Gestionnaire",desc:"Clients assignes",color:"#60a5fa",perms:'+gestP);
c=c.replace(/id:"client",name:"Client",desc:"Ses fiches et documents",color:"#a78bfa",perms:\{[^}]+\}/,'id:"client",name:"Client",desc:"Ses fiches et documents",color:"#a78bfa",perms:'+clientP);
c=c.replace(/id:"employe",name:"Employe",desc:"Sa fiche de paie et conges",color:"#22c55e",perms:\{[^}]+\}/,'id:"employe",name:"Employe",desc:"Sa fiche de paie et conges",color:"#22c55e",perms:'+empP);
c=c.replace(/id:"comptable",name:"Comptable externe",desc:"Exports comptables uniquement",color:"#fb923c",perms:\{[^}]+\}/,'id:"comptable",name:"Comptable externe",desc:"Exports comptables uniquement",color:"#fb923c",perms:'+comptP);
c=c.replace(/id:"commercial",name:"Commercial",desc:"Simulateurs et prospects uniquement",color:"#f97316",perms:\{[^}]+\}/,'id:"commercial",name:"Commercial",desc:"Simulateurs et prospects uniquement",color:"#f97316",perms:'+commP);
console.log('2/4 Perms replaced');

const oldBody='{m.l}</td>{roles.map(r=><td key={r.id} style={{padding:"8px",textAlign:"center"}}><button onClick={()=>togglePerm(r.id,m.k)} style={{width:28,height:28,borderRadius:6,border:"none",cursor:"pointer",fontSize:14,background:r.perms[m.k]?"rgba(34,197,94,.15)":"rgba(239,68,68,.08)",color:r.perms[m.k]?"#22c55e":"#ef4444"}}>{r.perms[m.k]?"\\u2713":"\\u2717"}</button></td>)}</tr>)';
const newBody='{m.l}</td>{!m.grp&&roles.map(r=><td key={r.id} style={{padding:"6px 8px",textAlign:"center"}}><button onClick={()=>togglePerm(r.id,m.k)} style={{width:24,height:24,borderRadius:5,border:"none",cursor:"pointer",fontSize:12,background:r.perms[m.k]?"rgba(34,197,94,.15)":"rgba(239,68,68,.08)",color:r.perms[m.k]?"#22c55e":"#ef4444"}}>{r.perms[m.k]?"\\u2713":"\\u2717"}</button></td>)}</tr>)';

if(c.includes(oldBody)){c=c.replace(oldBody,newBody);console.log('3/4 Table body replaced');}
else{console.log('3/4 WARN: table body not found');}

const oldRow='modules.map(m=><tr key={m.k} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}><td style={{padding:"8px",color:"#e8e6e0",fontWeight:500}}>';
const newRow='modules.map(m=><tr key={m.k} style={{borderBottom:m.grp?"2px solid rgba(198,163,78,.15)":"1px solid rgba(255,255,255,.03)",background:m.grp?"rgba(198,163,78,.03)":"transparent"}}><td colSpan={m.grp?roles.length+1:1} style={{padding:m.grp?"10px 8px 4px":"6px 8px",color:m.grp?"#c6a34e":"#e8e6e0",fontWeight:m.grp?700:500,fontSize:11,letterSpacing:m.grp?1:0}}>';

if(c.includes(oldRow)){c=c.replace(oldRow,newRow);console.log('4/4 Row rendering replaced');}
else{console.log('4/4 WARN: row not found');}

fs.writeFileSync('app/modules/SprintComponents.js',c,'utf8');
console.log('DONE - 34 permissions, 4 groups');
