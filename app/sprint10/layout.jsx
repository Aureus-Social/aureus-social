'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../responsive.css';

const NAV_ITEMS = [
  {href:'/sprint10/dashboard',label:'Dashboard',icon:'D'},
  {href:'/sprint10/clients',label:'Clients',icon:'C'},
  {href:'/sprint10/travailleurs',label:'Travailleurs',icon:'T'},
  {href:'/sprint10/paie',label:'Paie',icon:'P'},
  {href:'/sprint10/fiche-pdf',label:'Fiche PDF',icon:'F'},
  {href:'/sprint10/notifications',label:'Alertes',icon:'!'},
  {href:'/sprint9',label:'Sprint 9',icon:'9'},
];

export default function Sprint10Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/sprint10/auth') return <>{children}</>;

  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',fontFamily:"'Outfit',system-ui,sans-serif"}}>
      {/* Mobile header */}
      <div style={{display:'none',background:'#0d1117',borderBottom:'1px solid #1e293b',padding:'10px 16px',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:150}} className="asp-nav-mobile">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,borderRadius:6,background:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#0a0e1a'}}>A</div>
          <span style={{fontWeight:700,fontSize:14,color:'#f1f5f9'}}>Aureus Social Pro</span>
        </div>
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:'none',border:'1px solid #1e293b',color:'#e2e8f0',padding:'6px 12px',borderRadius:6,fontSize:18,cursor:'pointer',lineHeight:1}}>
          {menuOpen ? 'X' : '='}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:200,display:'flex'}}>
          <div style={{width:260,background:'#0d1117',borderRight:'1px solid #1e293b',padding:'20px 0',overflowY:'auto'}}>
            <div style={{padding:'0 16px 16px',borderBottom:'1px solid #1e293b',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:32,height:32,borderRadius:6,background:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#0a0e1a'}}>A</div>
                <span style={{fontWeight:700,fontSize:15,color:'#f1f5f9'}}>Menu</span>
              </div>
            </div>
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)}>
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',color:active?'#c9a227':'#94a3b8',background:active?'rgba(201,162,39,0.1)':'transparent',borderLeft:active?'3px solid #c9a227':'3px solid transparent',fontSize:14,fontWeight:active?600:400,textDecoration:'none',cursor:'pointer'}}>
                    <span style={{width:28,height:28,borderRadius:6,background:active?'#c9a227':'#1e293b',color:active?'#0a0e1a':'#64748b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>{item.icon}</span>
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
          <div style={{flex:1,background:'rgba(0,0,0,0.5)'}} onClick={()=>setMenuOpen(false)} />
        </div>
      )}

      {children}

      {/* Mobile bottom navigation */}
      <div style={{display:'none',position:'fixed',bottom:0,left:0,right:0,background:'#0d1117',borderTop:'1px solid #1e293b',padding:'8px 0',zIndex:100}} className="asp-nav-mobile">
        <div style={{display:'flex',justifyContent:'space-around'}}>
          {NAV_ITEMS.slice(0, 5).map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{textDecoration:'none'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'4px 8px'}}>
                  <div style={{width:28,height:28,borderRadius:6,background:active?'#c9a227':'transparent',color:active?'#0a0e1a':'#64748b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>{item.icon}</div>
                  <span style={{fontSize:9,color:active?'#c9a227':'#64748b',fontWeight:active?600:400}}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
