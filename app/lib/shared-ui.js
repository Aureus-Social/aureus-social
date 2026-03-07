'use client';
export function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
export function B({children,onClick,style:s}){return <button onClick={onClick} style={{padding:'10px 20px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',...s}}>{children}</button>;}
export function I({label,type,value,onChange,style:st,options,placeholder,min,max,step,disabled,span}){
  const base={width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit',boxSizing:'border-box'};
  return <div style={{gridColumn:span?`span ${span}`:undefined,...st}}>
    {label&&<div style={{fontSize:10,color:'#5e5c56',marginBottom:3}}>{label}</div>}
    {options
      ?<select value={value||''} onChange={e=>onChange&&onChange(e.target.value)} disabled={disabled} style={base}>
        <option value="">— Choisir —</option>
        {options.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
      </select>
      :<input type={type||'text'} value={value??''} onChange={e=>onChange&&onChange(type==='number'?+e.target.value:e.target.value)}
        placeholder={placeholder} min={min} max={max} step={step} disabled={disabled} style={base}/>
    }
  </div>;
}
export function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}
export function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
export function SC({children}){return <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>{children}</div>;}
export const fmt=n=>new Intl.NumberFormat('fr-BE',{style:'currency',currency:'EUR'}).format(n||0);
export function Tbl({cols,data}){if(!data||!data.length)return <div style={{padding:16,textAlign:'center',color:'#5e5c56',fontSize:12}}>Aucune donnée</div>;return <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}><thead><tr>{cols.map(c=><th key={c.k} style={{padding:'8px 6px',textAlign:c.a||'left',color:'#c6a34e',borderBottom:'2px solid rgba(198,163,78,.2)',fontWeight:600,fontSize:10}}>{c.l}</th>)}</tr></thead><tbody>{data.map((row,i)=><tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>{cols.map(c=><td key={c.k} style={{padding:'6px',textAlign:c.a||'left'}}>{c.r?c.r(row):row[c.k]}</td>)}</tr>)}</tbody></table></div>;}
export const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
export const f0=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:0,maximumFractionDigits:0}).format(v||0);
