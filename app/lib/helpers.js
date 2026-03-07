// ═══ AUREUS SOCIAL PRO — Helpers partagés ═══
"use client";
import { LOIS_BELGES, LB, TX_ONSS_W, TX_ONSS_E, NET_FACTOR, PP_EST, PV_SIMPLE, PV_DOUBLE, RMMMG, CR_PAT, CR_MAX } from './lois-belges';
export { LOIS_BELGES, LB, TX_ONSS_W, TX_ONSS_E, NET_FACTOR, PP_EST, PV_SIMPLE, PV_DOUBLE, RMMMG, CR_PAT, CR_MAX };

export const LEGAL = { WD: 21.67, WHD: 7.6 };
export const DPER = { month: new Date().getMonth()+1, year: new Date().getFullYear(), days: 21.67 };

export function calc(emp, per, co) {
  const brut = +(emp&&(emp.monthlySalary||emp.gross||emp.brut)||0);
  const onssW = Math.round(brut * TX_ONSS_W * 100) / 100;
  const imposable = brut - onssW;
  const pp = Math.round(imposable * PP_EST * 100) / 100;
  const net = Math.round((imposable - pp) * 100) / 100;
  const onssE = Math.round(brut * TX_ONSS_E * 100) / 100;
  return {base:brut,gross:brut,onssNet:onssW,imposable,tax:pp,pp,css:0,net,onssE,costTotal:Math.round((brut+onssE)*100)/100,bonus:0,overtime:0,y13:0,sickPay:0};
}

export function quickPP(brut) {
  const imposable = brut - brut * TX_ONSS_W;
  if (imposable <= 1110) return 0;
  if (imposable <= 1560) return Math.round((imposable - 1110) * 0.2668 * 100) / 100;
  if (imposable <= 2700) return Math.round((120.06 + (imposable - 1560) * 0.4280) * 100) / 100;
  return Math.round((607.98 + (imposable - 2700) * 0.4816) * 100) / 100;
}

export function quickNet(brut) { return Math.round((brut||0) * NET_FACTOR * 100) / 100; }

export const fmt = v => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(v || 0);
export const f2 = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0);
export const f0 = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 0 }).format(v || 0);

export function PH({title, sub}) {
  return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;
}

export function C({children, style, title, sub}) {
  return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>
    {title&&<div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:sub?2:12}}>{title}</div>}
    {sub&&<div style={{fontSize:10,color:'#888',marginBottom:12}}>{sub}</div>}
    {children}
  </div>;
}

export function ST({children}) {
  return <div style={{fontSize:12,fontWeight:700,color:'#c6a34e',letterSpacing:'.3px',marginBottom:10,textTransform:'uppercase'}}>{children}</div>;
}

export function Tbl({cols, data}) {
  if (!data||!data.length) return <div style={{padding:16,textAlign:'center',color:'#5e5c56',fontSize:12}}>Aucune donnée</div>;
  return <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
    <thead><tr>{cols.map(c=><th key={c.k} style={{padding:'8px 6px',textAlign:c.a||'left',color:'#c6a34e',borderBottom:'2px solid rgba(198,163,78,.2)',fontWeight:600,fontSize:10}}>{c.l}</th>)}</tr></thead>
    <tbody>{data.map((row,i)=><tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>{cols.map(c=><td key={c.k} style={{padding:'6px',textAlign:c.a||'left'}}>{c.r?c.r(row):row[c.k]}</td>)}</tr>)}</tbody>
  </table></div>;
}

export const obf = {
  maskNISS: (n) => n ? String(n).replace(/(\d{2})\.?(\d{2})\.?(\d{2})-?(\d{3})-?(\d{2})/, '$1.$2.$3-***-**') : '—',
  maskIBAN: (i) => i ? String(i).replace(/(.{4})(.+)(.{4})/, '$1 **** **** $3') : '—',
};
