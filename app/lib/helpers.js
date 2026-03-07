// ═══ AUREUS SOCIAL PRO — Helpers partagés ═══
"use client";
import { LOIS_BELGES, LB, TX_ONSS_W, TX_ONSS_E, NET_FACTOR, PP_EST, PV_SIMPLE, PV_DOUBLE, RMMMG, CR_PAT, CR_MAX } from './lois-belges';
import { C, B, I, ST, PH, SC, fmt, Tbl, f2, f0 } from './shared-ui';

export { LOIS_BELGES, LB, TX_ONSS_W, TX_ONSS_E, NET_FACTOR, PP_EST, PV_SIMPLE, PV_DOUBLE, RMMMG, CR_PAT, CR_MAX };
export { C, B, I, ST, PH, SC, fmt, Tbl, f2, f0 };

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

export const obf = {
  maskNISS: (n) => n ? String(n).replace(/(\d{2})\.?(\d{2})\.?(\d{2})-?(\d{3})-?(\d{2})/, '$1.$2.$3-***-**') : '—',
  maskIBAN: (i) => i ? String(i).replace(/(.{4})(.+)(.{4})/, '$1 **** **** $3') : '—',
};
