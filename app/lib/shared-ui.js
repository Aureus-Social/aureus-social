'use client';
export function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
export function B({children,onClick,style:s}){return <button onClick={onClick} style={{padding:'10px 20px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',...s}}>{children}</button>;}
export function I({children}){return <span style={{fontSize:11,color:'#9e9b93'}}>{children}</span>;}
export function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}
export function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
export function SC({children}){return <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>{children}</div>;}
export const fmt=n=>new Intl.NumberFormat('fr-BE',{style:'currency',currency:'EUR'}).format(n||0);
