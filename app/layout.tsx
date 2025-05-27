import type { Metadata } from 'next';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext'; // Adjust path if needed

// export const metadata: Metadata = { // Metadata can also be localized if needed
// title: 'Cuedu',
// description: 'AI-powered multilingual math learning',
// };

export default function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = useMessages();

  return (
    <html lang={locale}>
      <body>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <NextIntlClientProvider locale={locale} messages={messages}>
            {/* You might want to add a global loading indicator here based on AuthContext's loading state */}
            {children}
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
