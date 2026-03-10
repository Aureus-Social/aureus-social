export const metadata = {
  title: 'Aureus Social Pro — Gestion de Paie Belge',
  description: 'Secrétariat social digital pour PME belges',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter',system-ui,sans-serif", background: '#0c0b09', color: '#e8e6e0', minHeight: '100vh' }}>
        <style>{`
          input, select, textarea {
            color: #e8e6e0 !important;
            background-color: #1e1c18 !important;
            border: 1px solid #3a3830 !important;
          }
          input::placeholder, textarea::placeholder {
            color: #6b6860 !important;
          }
          input[type="range"], input[type="checkbox"], input[type="radio"] {
            background-color: transparent !important;
            border: none !important;
          }
          select option {
            color: #e8e6e0 !important;
            background-color: #1e1c18 !important;
          }
          /* Zones à fond clair — texte forcé en noir */
          [data-payslip], [data-payslip] * {
            color: #1a1a18 !important;
          }
          [data-payslip] input, [data-payslip] select, [data-payslip] textarea {
            color: #111 !important;
            background-color: #fff !important;
          }
          /* Toute zone à fond clair — texte noir automatique */
          *[style*="background:#f"],
          *[style*="background: #f"],
          *[style*="background: white"],
          *[style*="background:white"],
          *[style*="background:#fffef9"],
          *[style*="background: #fffef9"],
          *[style*="background:#f5f4ef"],
          *[style*="background: #f5f4ef"],
          *[style*="background:rgba(255,255,255"],
          *[style*="background: rgba(255,255,255"] {
            color: #1a1a18 !important;
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
