
import { Nunito } from "next/font/google";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Locale, NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { routing } from "~/i18n/routing";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';

import Providers from "./provider";
import "./globals.css";

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  props: Omit<LayoutProps<'/[locale]'>, 'children'>
) {
  const { locale } = await props.params;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: 'LocaleLayout'
  });

  return {
    title: t('title')
  };
}

export default async function LocaleLayout({
  children,
  params
}: LayoutProps<'/[locale]'>) {

  const { locale } = await params;
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body
        className={`${nunito.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Providers>
              {children}
            </Providers>
          </ThemeProvider>
        </NextIntlClientProvider>
        <GoogleAnalytics gaId="G-STACADEMY26" />
        <Script id="heatmap-analytics" strategy="afterInteractive">
          {`console.log("Heatmap initialized in privacy-mode.");`}
        </Script>
      </body>
    </html>
  );
}
