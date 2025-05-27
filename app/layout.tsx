import type { Metadata } from 'next';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import './globals.css';

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
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
