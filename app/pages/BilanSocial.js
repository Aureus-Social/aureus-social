'use client'
import { useState } from 'react'

const INITIAL_DATA = {
  annee: new Date().getFullYear() - 1,
  // Section 1 - Effectifs
  eff_debut_hommes_tplein: '', eff_debut_femmes_tplein: '',
  eff_debut_hommes_tpartiel: '', eff_debut_femmes_tpartiel: '',
  eff_fin_hommes_tplein: '', eff_fin_femmes_tplein: '',
  eff_fin_hommes_tpartiel: '', eff_fin_femmes_tpartiel: '',
  eff_moy_hommes: '', eff_moy_femmes: '',
  // Section 2 - Mouvements
  entrees_contrat_duree_indeterminee: '',
  entrees_contrat_duree_determinee: '',
  entrees_motifs_economiques: '',
  sorties_pension: '', sorties_prepension: '',
  sorties_licenciement: '', sorties_demission: '',
  sorties_fin_cdd: '', sorties_autres: '',
  // Section 3 - Formation
  form_nb_travailleurs_h: '', form_nb_travailleurs_f: '',
  form_heures_h: '', form_heures_f: '',
  form_cout_h: '', form_cout_f: '',
  form_initiatives_propres_h: '', form_initiatives_propres_f: '',
  form_conventions_sectorielles_h: '', form_conventions_sectorielles_f: '',
  // Section 4 - Avantages sociaux
  av_assurance_groupe: '', av_assurance_hospitalisation: '',
  av_cheques_repas: '', av_autres: '',
}

const SECTIONS = [
  {
    id:'effectifs', label:'Effectifs', icon:'👥',
    fields: [
      { id:'eff_debut_hommes_tplein', label:'Début période — Hommes temps plein (ETP)' },
      { id:'eff_debut_femmes_tplein', label:'Début période — Femmes temps plein (ETP)' },
      { id:'eff_debut_hommes_tpartiel', label:'Début période — Hommes temps partiel (ETP)' },
      { id:'eff_debut_femmes_tpartiel', label:'Début période — Femmes temps partiel (ETP)' },
      { id:'eff_fin_hommes_tplein', label:'Fin période — Hommes temps plein (ETP)' },
      { id:'eff_fin_femmes_tplein', label:'Fin période — Femmes temps plein (ETP)' },
      { id:'eff_fin_hommes_tpartiel', label:'Fin période — Hommes temps partiel (ETP)' },
      { id:'eff_fin_femmes_tpartiel', label:'Fin période — Femmes temps partiel (ETP)' },
      { id:'eff_moy_hommes', label:'Effectif moyen annuel — Hommes (ETP)' },
      { id:'eff_moy_femmes', label:'Effectif moyen annuel — Femmes (ETP)' },
    ]
  },
  {
    id:'mouvements', label:'Mouvements', icon:'🔄',
    fields: [
      { id:'entrees_contrat_duree_indeterminee', label:'Entrées — CDI' },
      { id:'entrees_contrat_duree_determinee', label:'Entrées — CDD' },
      { id:'entrees_motifs_economiques', label:'Entrées — Motifs économiques' },
      { id:'sorties_pension', label:'Sorties — Pension' },
      { id:'sorties_prepension', label:'Sorties — Prépension (RCC)' },
      { id:'sorties_licenciement', label:'Sorties — Licenciement' },
      { id:'sorties_demission', label:'Sorties — Démission' },
      { id:'sorties_fin_cdd', label:'Sorties — Fin CDD' },
      { id:'sorties_autres', label:'Sorties — Autres motifs' },
    ]
  },
  {
    id:'formation', label:'Formation', icon:'📚',
    fields: [
      { id:'form_nb_travailleurs_h', label:'Nb. travailleurs formés — Hommes' },
      { id:'form_nb_travailleurs_f', label:'Nb. travailleurs formés — Femmes' },
      { id:'form_heures_h', label:'Heures de formation — Hommes' },
      { id:'form_heures_f', label:'Heures de formation — Femmes' },
      { id:'form_cout_h', label:'Coût formation — Hommes (€)' },
      { id:'form_cout_f', label:'Coût formation — Femmes (€)' },
      { id:'form_initiatives_propres_h', label:'Initiatives propres — Hommes (h)' },
      { id:'form_initiatives_propres_f', label:'Initiatives propres — Femmes (h)' },
      { id:'form_conventions_sectorielles_h', label:'Conventions sectorielles — Hommes (h)' },
      { id:'form_conventions_sectorielles_f', label:'Conventions sectorielles — Femmes (h)' },
    ]
  },
  {
    id:'avantages', label:'Avantages sociaux', icon:'🎁',
    fields: [
      { id:'av_assurance_groupe', label:'Assurance groupe — Coût annuel (€)' },
      { id:'av_assurance_hospitalisation', label:'Assurance hospitalisation — Coût annuel (€)' },
      { id:'av_cheques_repas', label:'Chèques-repas — Coût employeur annuel (€)' },
      { id:'av_autres', label:'Autres avantages — Coût annuel (€)' },
    ]
  },
]

export default function BilanSocial({ state, dispatch }) {
  const [data, setData] = useState(INITIAL_DATA)
  const [sectionActive, setSectionActive] = useState('effectifs')
  const [preview, setPreview] = useState(false)

  const s = { background:'#0a0a0a', color:'#f1f5f9', minHeight:'100vh', padding:'24px', fontFamily:'Inter,system-ui,sans-serif' }
  const btn = (v='primary') => ({ background:v==='primary'?'#8b5cf6':v==='ghost'?'transparent':'#1f2937', color:v==='primary'?'#fff':'#f1f5f9', border:v==='ghost'?'1px solid #374151':'none', borderRadius:8, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontSize:13 })
  const input = { background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:8, padding:'9px 13px', color:'#f1f5f9', fontSize:13, boxSizing:'border-box', width:'100%' }
  const lbl = { display:'block', fontSize:12, color:'#6b7280', marginBottom:4, fontWeight:500 }

  const sec = SECTIONS.find(s => s.id === sectionActive)

  // Calculs automatiques
  const effFinTotal = (parseFloat(data.eff_fin_hommes_tplein)||0)+(parseFloat(data.eff_fin_femmes_tplein)||0)+(parseFloat(data.eff_fin_hommes_tpartiel)||0)+(parseFloat(data.eff_fin_femmes_tpartiel)||0)
  const effMoyTotal = (parseFloat(data.eff_moy_hommes)||0)+(parseFloat(data.eff_moy_femmes)||0)
  const entreesTotal = (parseFloat(data.entrees_contrat_duree_indeterminee)||0)+(parseFloat(data.entrees_contrat_duree_determinee)||0)
  const sortiesTotal = ['sorties_pension','sorties_prepension','sorties_licenciement','sorties_demission','sorties_fin_cdd','sorties_autres'].reduce((a,k)=>a+(parseFloat(data[k])||0),0)
  const formTotalH = (parseFloat(data.form_heures_h)||0)
  const formTotalF = (parseFloat(data.form_heures_f)||0)
  const formCoutTotal = (parseFloat(data.form_cout_h)||0)+(parseFloat(data.form_cout_f)||0)
  const avTotal = (parseFloat(data.av_assurance_groupe)||0)+(parseFloat(data.av_assurance_hospitalisation)||0)+(parseFloat(data.av_cheques_repas)||0)+(parseFloat(data.av_autres)||0)

  function generateReport() {
    const txt = `BILAN SOCIAL ${data.annee}
Aureus IA SPRL — BCE 1028.230.781
Généré le ${new Date().toLocaleDateString('fr-BE')}
${'═'.repeat(60)}

1. EFFECTIFS
${'─'.repeat(40)}
ETP fin période         : ${effFinTotal.toFixed(1)}
ETP moyen annuel        : ${effMoyTotal.toFixed(1)}
  dont hommes           : ${parseFloat(data.eff_moy_hommes||0).toFixed(1)} ETP
  dont femmes           : ${parseFloat(data.eff_moy_femmes||0).toFixed(1)} ETP

2. MOUVEMENTS DU PERSONNEL
${'─'.repeat(40)}
Entrées totales         : ${entreesTotal}
  CDI                   : ${data.entrees_contrat_duree_indeterminee||0}
  CDD                   : ${data.entrees_contrat_duree_determinee||0}
Sorties totales         : ${sortiesTotal}
  Licenciements         : ${data.sorties_licenciement||0}
  Démissions            : ${data.sorties_demission||0}
  Fins CDD              : ${data.sorties_fin_cdd||0}
  Pensions              : ${data.sorties_pension||0}

3. FORMATION PROFESSIONNELLE
${'─'.repeat(40)}
Travailleurs formés     : ${(parseFloat(data.form_nb_travailleurs_h||0)+parseFloat(data.form_nb_travailleurs_f||0))}
  Hommes                : ${data.form_nb_travailleurs_h||0}
  Femmes                : ${data.form_nb_travailleurs_f||0}
Heures formation totales: ${(formTotalH+formTotalF).toFixed(0)} h
  Hommes                : ${formTotalH.toFixed(0)} h
  Femmes                : ${formTotalF.toFixed(0)} h
Coût total formation    : ${formCoutTotal.toLocaleString('fr-BE',{minimumFractionDigits:2})} €

4. AVANTAGES SOCIAUX
${'─'.repeat(40)}
Assurance groupe        : ${parseFloat(data.av_assurance_groupe||0).toLocaleString('fr-BE',{minimumFractionDigits:2})} €
Ass. hospitalisation    : ${parseFloat(data.av_assurance_hospitalisation||0).toLocaleString('fr-BE',{minimumFractionDigits:2})} €
Chèques-repas           : ${parseFloat(data.av_cheques_repas||0).toLocaleString('fr-BE',{minimumFractionDigits:2})} €
Autres avantages        : ${parseFloat(data.av_autres||0).toLocaleString('fr-BE',{minimumFractionDigits:2})} €
TOTAL avantages         : ${avTotal.toLocaleString('fr-BE',{minimumFractionDigits:2})} €
${'═'.repeat(60)}
Aureus Social Pro — Aureus IA SPRL`
    return txt
  }

  function download() {
    const blob = new Blob([generateReport()], { type:'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`BilanSocial_${data.annee}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  // Complétion
  const allFields = SECTIONS.flatMap(s=>s.fields)
  const filled = allFields.filter(f=>data[f.id]).length
  const pct = Math.round(filled/allFields.length*100)

  return (
    <div style={s}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:28 }}>📋</span>
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Bilan Social</h1>
              <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Rapport annuel obligatoire — SPF Emploi / banque nationale</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ fontSize:12, color:'#6b7280' }}>{pct}% complété</div>
            <div style={{ width:120, height:6, background:'#1f2937', borderRadius:4 }}>
              <div style={{ width:`${pct}%`, height:'100%', background:'#8b5cf6', borderRadius:4, transition:'width .3s' }} />
            </div>
            <select style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 12px', color:'#f1f5f9', fontSize:13 }} value={data.annee} onChange={e=>setData(p=>({...p,annee:e.target.value}))}>
              {[2025,2024,2023,2022].map(y=><option key={y}>{y}</option>)}
            </select>
            <button onClick={download} style={btn('primary')}>⬇ Exporter</button>
          </div>
        </div>
        {/* Résumé KPIs */}
        <div style={{ display:'flex', gap:12, marginTop:16 }}>
          {[
            { label:'ETP fin période', val:effFinTotal||'—', color:'#8b5cf6' },
            { label:'Entrées', val:entreesTotal||'—', color:'#10b981' },
            { label:'Sorties', val:sortiesTotal||'—', color:'#f87171' },
            { label:'Heures formation', val:(formTotalH+formTotalF).toFixed(0)+'h'||'—', color:'#f59e0b' },
            { label:'Coût avantages', val:avTotal?avTotal.toLocaleString('fr-BE',{minimumFractionDigits:2})+' €':'—', color:'#06b6d4' },
          ].map(st=>(
            <div key={st.label} style={{ background:'#111', border:'1px solid #222', borderRadius:10, padding:'10px 16px', flex:1 }}>
              <div style={{ fontSize:18, fontWeight:700, color:st.color }}>{st.val}</div>
              <div style={{ fontSize:11, color:'#6b7280' }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:20 }}>
        {/* Sidebar sections */}
        <div style={{ width:200, flexShrink:0 }}>
          {SECTIONS.map(section=>{
            const filled = section.fields.filter(f=>data[f.id]).length
            const total = section.fields.length
            return (
              <div key={section.id} onClick={()=>setSectionActive(section.id)} style={{ background:sectionActive===section.id?'#1f2937':'#111', border:`1px solid ${sectionActive===section.id?'#8b5cf6':'#1e1e1e'}`, borderRadius:10, padding:'12px 16px', marginBottom:8, cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span>{section.icon}</span>
                  <span style={{ fontWeight:600, fontSize:13 }}>{section.label}</span>
                </div>
                <div style={{ marginTop:6, fontSize:11, color:'#6b7280' }}>{filled}/{total} champs</div>
                <div style={{ marginTop:4, height:3, background:'#2a2a2a', borderRadius:2 }}>
                  <div style={{ width:`${filled/total*100}%`, height:'100%', background:'#8b5cf6', borderRadius:2 }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Formulaire section active */}
        <div style={{ flex:1, background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
            <span style={{ fontSize:22 }}>{sec.icon}</span>
            <h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>{sec.label}</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {sec.fields.map(f => (
              <div key={f.id}>
                <label style={lbl}>{f.label}</label>
                <input type="number" step="any" style={input} value={data[f.id]} onChange={e=>setData(p=>({...p,[f.id]:e.target.value}))} placeholder="0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
