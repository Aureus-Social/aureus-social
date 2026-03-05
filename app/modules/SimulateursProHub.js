'use client';
export default function SimulateursProHub({ s, d }) {
  return (
    <div style={{padding:40}}>
      <div style={{fontSize:22,fontWeight:800,color:'#c6a34e',marginBottom:8}}>Simulateurs Pro</div>
      <div style={{fontSize:13,color:'#9e9b93',marginBottom:24}}>41 simulateurs interactifs — fiscalité belge, paie, RH, international, sectoriel</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {[
          {cat:'💼 Paie Avancés',n:6,items:'Indépendant, Dirigeant, Flexi-Job, Étudiant, CCT 90, Cafétéria'},
          {cat:'🌍 International',n:7,items:'Détachement A1, Impatriation, Succursale, Filiales UE, Split Payroll, Frontalier, Hors-UE'},
          {cat:'🏦 Fiscaux & Patrimoine',n:11,items:'IPP, ISOC, Opti Rémunération, ATN, Droits Auteur, Warrants, Réserve Liquidation, Holding...'},
          {cat:'👥 RH & Organisation',n:6,items:'Masse salariale, Indexation, Bradford, Restructuration, Crédit-temps, RCC'},
          {cat:'🔮 What-If',n:6,items:'Changement CP, Employé→Indépendant, Succursale, Fusion, TT Transfrontalier, Augmentation'},
          {cat:'🏭 Sectoriels',n:5,items:'Horeca CP 302, Construction CP 124, Transport CP 140, Soins CP 330, Intérimaire CP 322'},
        ].map((c,i)=>(
          <div key={i} style={{background:'rgba(198,163,78,.02)',borderRadius:14,border:'1px solid rgba(198,163,78,.06)',overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(198,163,78,.08)',background:'rgba(198,163,78,.03)'}}>
              <div style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>{c.cat}</div>
              <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{c.n} simulateurs</div>
            </div>
            <div style={{padding:'12px 18px',fontSize:11,color:'#9e9b93',lineHeight:1.6}}>{c.items}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:24,padding:16,background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.1)',fontSize:12,color:'#c6a34e',textAlign:'center'}}>
        Module en cours d'intégration — Les simulateurs seront activés prochainement.
      </div>
    </div>
  );
}
