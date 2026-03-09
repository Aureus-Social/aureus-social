export const metadata = {
  title: 'Aureus Social Pro — Secrétariat social numérique belge',
  description: 'Logiciel de gestion de paie et secrétariat social belge. Dimona automatique, DmfA XML, Belcotax, 166 commissions paritaires. Remplacez SD Worx, Securex ou Partena.',
  keywords: 'secrétariat social belge, logiciel paie belgique, Dimona, DmfA, Belcotax, ONSS, commission paritaire, SD Worx alternative, Securex alternative',
  authors: [{ name: 'Aureus IA SPRL' }],
  creator: 'Aureus IA SPRL',
  publisher: 'Aureus IA SPRL',
  metadataBase: new URL('https://app.aureussocial.be'),
  alternates: {
    canonical: '/vitrine',
    languages: {
      'fr-BE': '/vitrine?lang=fr',
      'nl-BE': '/vitrine?lang=nl',
      'en': '/vitrine?lang=en',
      'de': '/vitrine?lang=de',
    },
  },
  openGraph: {
    title: 'Aureus Social Pro — Secrétariat social numérique belge',
    description: 'Dimona automatique, DmfA XML, Belcotax, 166 CP. Remplacez SD Worx ou Securex.',
    url: 'https://app.aureussocial.be/vitrine',
    siteName: 'Aureus Social Pro',
    locale: 'fr_BE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Aureus Social Pro' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aureus Social Pro — Secrétariat social numérique belge',
    description: 'Dimona automatique, DmfA XML, Belcotax, 166 CP.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function VitrineLayout({ children }) {
  return children;
}
