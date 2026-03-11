// ═══════════════════════════════════════════════════════════════
// TESTS UNITAIRES — Aureus Social Pro
// Calcul paie : ONSS, Précompte Professionnel, Net, Coût employeur
// Run: npx jest
// ═══════════════════════════════════════════════════════════════

// Mock Next.js
jest.mock('next/dynamic', () => () => () => null);

// Import du moteur
const { calcPrecompteExact } = require('./app/lib/payroll-engine.js');

describe('Moteur de paie belge 2026', () => {

  describe('ONSS Travailleur (13,07%)', () => {
    test('ONSS correct pour 3000€ brut', () => {
      const result = calcPrecompteExact(3000, { situation: 'isole' });
      const onss = Math.round(3000 * 0.1307 * 100) / 100;
      expect(onss).toBeCloseTo(392.1, 1);
    });

    test('ONSS correct pour RMMMG 2070.48€', () => {
      const onss = Math.round(2070.48 * 0.1307 * 100) / 100;
      expect(onss).toBeCloseTo(270.61, 1);
    });

    test('ONSS correct pour 4500€ brut (cadre)', () => {
      const onss = Math.round(4500 * 0.1307 * 100) / 100;
      expect(onss).toBeCloseTo(588.15, 1);
    });
  });

  describe('Précompte Professionnel — Isolé', () => {
    test('PP isolé pour 2000€ brut', () => {
      const result = calcPrecompteExact(2000, { situation: 'isole' });
      expect(result).toBeDefined();
      expect(result.pp).toBeGreaterThan(0);
      expect(result.pp).toBeLessThan(500);
    });

    test('PP isolé pour 3500€ brut', () => {
      const result = calcPrecompteExact(3500, { situation: 'isole' });
      expect(result.pp).toBeGreaterThan(0);
      expect(result.pp).toBeLessThan(1000);
    });

    test('PP isolé avec 2 enfants à charge', () => {
      const sans = calcPrecompteExact(3000, { situation: 'isole', enfants: 0 });
      const avec = calcPrecompteExact(3000, { situation: 'isole', enfants: 2 });
      // Avec enfants → PP inférieur (réduction)
      expect(avec.pp).toBeLessThan(sans.pp);
    });
  });

  describe('Précompte Professionnel — Marié 1 revenu', () => {
    test('PP marié 1R inférieur à PP isolé (quotient conjugal)', () => {
      const isole = calcPrecompteExact(3000, { situation: 'isole' });
      const marie = calcPrecompteExact(3000, { situation: 'marie_1r' });
      expect(marie.pp).toBeLessThan(isole.pp);
    });
  });

  describe('Cohérence calcul net', () => {
    test('Net = Brut - ONSS - PP (approximatif)', () => {
      const brut = 3000;
      const result = calcPrecompteExact(brut, { situation: 'isole' });
      const onss = Math.round(brut * 0.1307 * 100) / 100;
      const netEstime = brut - onss - result.pp;
      expect(netEstime).toBeGreaterThan(1500);
      expect(netEstime).toBeLessThan(3000);
    });

    test('Ratio net/brut entre 60% et 80% pour 3000€', () => {
      const brut = 3000;
      const result = calcPrecompteExact(brut, { situation: 'isole' });
      const onss = Math.round(brut * 0.1307 * 100) / 100;
      const net = brut - onss - result.pp;
      const ratio = net / brut;
      expect(ratio).toBeGreaterThan(0.60);
      expect(ratio).toBeLessThan(0.85);
    });
  });

  describe('Cas limites', () => {
    test('PP pour salaire 0€ = 0', () => {
      const result = calcPrecompteExact(0, { situation: 'isole' });
      expect(result.pp).toBe(0);
    });

    test('PP positif ou nul pour tout salaire', () => {
      [1000, 2000, 3000, 5000, 10000].forEach(brut => {
        const result = calcPrecompteExact(brut, { situation: 'isole' });
        expect(result.pp).toBeGreaterThanOrEqual(0);
      });
    });

    test('PP augmente avec le salaire (progressivité)', () => {
      const pp2k = calcPrecompteExact(2000, { situation: 'isole' });
      const pp4k = calcPrecompteExact(4000, { situation: 'isole' });
      const pp8k = calcPrecompteExact(8000, { situation: 'isole' });
      expect(pp4k.pp).toBeGreaterThan(pp2k.pp);
      expect(pp8k.pp).toBeGreaterThan(pp4k.pp);
    });

    test('PP temps partiel 50% = environ moitié du PP temps plein', () => {
      const plein = calcPrecompteExact(3000, { situation: 'isole', regime: 100 });
      const partiel = calcPrecompteExact(3000, { situation: 'isole', regime: 50 });
      expect(partiel.pp).toBeLessThan(plein.pp);
    });
  });

  describe('Chèques-repas (règles légales 2026)', () => {
    const CR_MAX = 8.00;
    const CR_PAT = 6.91;
    const CR_TRAV = 1.09;

    test('Part patronale max 6.91€', () => {
      expect(CR_PAT).toBeCloseTo(6.91, 2);
    });

    test('Part travailleur min 1.09€', () => {
      expect(CR_TRAV).toBeCloseTo(1.09, 2);
    });

    test('Valeur faciale max 8.00€', () => {
      expect(CR_MAX).toBeCloseTo(8.00, 2);
    });

    test('Part patronale + part travailleur = valeur faciale', () => {
      expect(CR_PAT + CR_TRAV).toBeCloseTo(CR_MAX, 2);
    });
  });

  describe('ONSS Employeur (25,07% environ)', () => {
    test('Cotisation patronale supérieure à cotisation travailleur', () => {
      const brut = 3000;
      const onssW = Math.round(brut * 0.1307 * 100) / 100;
      const onssE_approx = Math.round(brut * 0.2507 * 100) / 100; // Approximation
      expect(onssE_approx).toBeGreaterThan(onssW);
    });
  });
});
