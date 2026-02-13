export const metadata = {
  title: 'Aureus Social Pro — Gestion de Paie Belge',
  description: 'Logiciel professionnel de gestion de paie et secrétariat social pour la Belgique — Aureus IA SPRL',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
