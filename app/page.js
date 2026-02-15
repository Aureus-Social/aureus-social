'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace('/sprint11/landing'); }, []);
  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#c9a227',fontFamily:"'Outfit',sans-serif"}}>Chargement...</div>
    </div>
  );
}
