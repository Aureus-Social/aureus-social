"use client";
import { useLang } from '../lib/lang-context';
import React from 'react';
import LoisWrapped from './lois';

export function DashDelegation({s,d}){
  return <LoisWrapped s={s} d={d} tab="seuilssociaux" />;
}

export function TableauSeuils({s,d}){
  return <LoisWrapped s={s} d={d} tab="seuilssociaux" />;
}

export default function SeuilsSociauxPage({s, d}) {
  return <LoisWrapped s={s} d={d} tab="seuilssociaux" />;
}
