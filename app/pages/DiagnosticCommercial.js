'use client';
import { useLang } from '../lib/lang-context';
import { useState } from 'react';
export default function DiagnosticCommercial({s,d}) {
  const { t, lang } = useLang();
  return <div style={{padding:40}}>
    <div style={{fontSize:19,fontWeight:800,color:'#c6a34e',marginBottom:8}}>DiagnosticCommercial</div>
    <div style={{fontSize:12,color:'#5e5c56'}}>Module en cours de migration</div>
  </div>;
}
