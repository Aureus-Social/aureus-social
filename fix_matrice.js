const fs=require('fs');
let c=fs.readFileSync('app/modules/SprintComponents.js','utf8');
const s=c.indexOf('const modules=[');
const e=c.indexOf('];',s)+2;
const old=c.substring(s,e);
console.log('Found old modules:',old.length,'chars');

const nw='const modules=['
+'{k:"_g1",l:"\\u25AB TABLEAU DE BORD",grp:true},'
+'{k:"dashboard",l:"Dashboard Principal"},'
+'{k:"commandcenter",l:"Command Center"},'
+'{k:"notifications",l:"Notifications"},'
+'{k:"_g2",l:"\\u25AB GESTION RH \\u0026 PAIE",grp:true},'
+'{k:"paie",l:"Salaires \\u0026 Fiches de Paie"},'
+'{k:"employees",l:"Liste Employes"},'
+'{k:"onboarding",l:"Onboarding"},'
+'{k:"proceduresrh",l:"Procedures RH (43)"},'
+'{k:"rh",l:"RH \\u0026 Workflows"},'
+'{k:"absences",l:"Absences \\u0026 Conges"},'
+'{k:"contrats",l:"Contrats \\u0026 Documents"},'
+'{k:"docs",l:"Documents Juridiques"},'
+'{k:"primes",l:"Primes \\u0026 Avantages (56)"},'
+'{k:"simulateurs",l:"Simulateurs \\u0026 Comparateur"},'
+'{k:"portail",l:"Portail Employe/Client"},'
+'{k:"calendrier",l:"Calendrier Social"},'
+'{k:"vehicules",l:"Vehicules \\u0026 ATN"},'
+'{k:"flexijobs",l:"Flexi-Jobs"},'
+'{k:"_g3",l:"\\u25AB DECLARATIONS \\u0026 COMPTA",grp:true},'
+'{k:"onss",l:"Declarations ONSS/DMFA"},'
+'{k:"dimona",l:"Dimona IN/OUT"},'
+'{k:"fiscal",l:"Precompte \\u0026 Belcotax"},'
+'{k:"export",l:"Export Comptable"},'
+'{k:"facturation",l:"Facturation"},'
+'{k:"sepa",l:"SEPA \\u0026 Paiements"},'
+'{k:"reporting",l:"Reporting \\u0026 Analytics"},'
+'{k:"ged",l:"GED \\u0026 Archives"},'
+'{k:"_g4",l:"\\u25AB ADMINISTRATION",grp:true},'
+'{k:"config",l:"Configuration"},'
+'{k:"clients",l:"Gestion Clients"},'
+'{k:"autopilot",l:"Autopilot"},'
+'{k:"compliance",l:"Compliance \\u0026 RGPD"},'
+'{k:"audit",l:"Audit \\u0026 Logs"},'
+'{k:"integrations",l:"Integrations"},'
+'{k:"fiduciaire",l:"Hub Fiduciaire"},'
+'{k:"securite",l:"Securite \\u0026 Monitoring"},'
+'{k:"commercial",l:"Page Commerciale"}'
+']';

c=c.replace(old,nw);
console.log('1/4 Modules replaced');

// Update perms
const pk=['dashboard','commandcenter','notifications','paie','employees','onboarding','proceduresrh','rh','absences','contrats','docs','primes','simulateurs','portail','calendrier','vehicules','flexijobs','onss','dimona','fiscal','export','facturation','sepa','reporting','ged','config','clients','autopilot','compliance','audit','integrations','fiduciaire','securite','commercial'];
function mp(t){return'{'+pk.map(k=>k+':'+(t.includes(k)?'true':'false')).join(',')+'}';}

c=c.replace(/id:"admin",name:"Administrateur",desc:"Acces total",color:"#c6a34e",perms:\{[^}]+\}/,'id:"admin",name:"Administrateur",desc:"Acces total",color:"#c6a34e",perms:'+mp(pk));
c=c.replace(/id:"gestionnaire",name:"Gestionnaire",desc:"Clients assignes",color:"#60a5fa",perms:\{[^}]+\}/,'id:"gestionnaire",name:"Gestionnaire",desc:"Clients assignes",color:"#60a5fa",perms:'+mp(pk.filter(k=>!['config','clients','autopilot','compliance','integrations','fiduciaire','securite','commercial'].includes(k))));
c=c.replace(/id:"client",name:"Client",desc:"Ses fiches et documents",color:"#a78bfa",perms:\{[^}]+\}/,'id:"client",name:"Client",desc:"Ses fiches et documents",color:"#a78bfa",perms:'+mp(['dashboard','docs','portail']));
c=c.replace(/id:"employe",name:"Employe",desc:"Sa fiche de paie et conges",color:"#22c55e",perms:\{[^}]+\}/,'id:"employe",name:"Employe",desc:"Sa fiche de paie et conges",color:"#22c55e",perms:'+mp(['portail']));
c=c.replace(/id:"comptable",name:"Comptable externe",desc:"Exports comptables uniquement",color:"#fb923c",perms:\{[^}]+\}/,'id:"comptable",name:"Comptable externe",desc:"Exports comptables uniquement",color:"#fb923c",perms:'+mp(['export','reporting','ged','fiscal','facturation']));
c=c.replace(/id:"commercial",name:"Commercial",desc:"Simulateurs et prospects uniquement",color:"#f97316",perms:\{[^}]+\}/,'id:"commercial",name:"Commercial",desc:"Simulateurs et prospects uniquement",color:"#f97316",perms:'+mp(['dashboard','simulateurs','commercial']));
console.log('2/4 Perms replaced');

// Row rendering
let oldR='modules.map(m=><tr key={m.k} style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}><td style={{padding:"8px",color:"#e8e6e0",fontWeight:500}}>';
let newR='modules.map(m=><tr key={m.k} style={{borderBottom:m.grp?"2px solid rgba(198,163,78,.15)":"1px solid rgba(255,255,255,.03)",background:m.grp?"rgba(198,163,78,.03)":"transparent"}}><td colSpan={m.grp?roles.length+1:1} style={{padding:m.grp?"10px 8px 4px":"6px 8px",color:m.grp?"#c6a34e":"#e8e6e0",fontWeight:m.grp?700:500,fontSize:11,letterSpacing:m.grp?1:0}}>';
if(c.includes(oldR)){c=c.replace(oldR,newR);console.log('3/4 Row replaced');}else{console.log('3/4 SKIP');}

// Buttons
let oldB='{m.l}</td>{roles.map(r=><td key={r.id} style={{padding:"8px",textAlign:"center"}}><button onClick={()=>togglePerm(r.id,m.k)} style={{width:28,height:28,borderRadius:6,border:"none",cursor:"pointer",fontSize:14';
let newB='{m.l}</td>{!m.grp&&roles.map(r=><td key={r.id} style={{padding:"6px 8px",textAlign:"center"}}><button onClick={()=>togglePerm(r.id,m.k)} style={{width:24,height:24,borderRadius:5,border:"none",cursor:"pointer",fontSize:12';
if(c.includes(oldB)){c=c.replace(oldB,newB);console.log('4/4 Buttons replaced');}else{console.log('4/4 SKIP');}

fs.writeFileSync('app/modules/SprintComponents.js',c,'utf8');
console.log('DONE - 34 permissions, 4 groupes');
