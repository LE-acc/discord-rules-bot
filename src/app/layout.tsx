import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'NutriAI — تتبّع التغذية بالذكاء الاصطناعي',
  description:
    'NutriAI: log meals by chat, photo, or voice. Understands Saudi & Gulf dialects, estimates calories & macros instantly, and coaches you like a real nutritionist.',
  applicationName: 'NutriAI',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NutriAI',
  },
  keywords: [
    'nutrition', 'تغذية', 'سعرات حرارية', 'AI nutrition', 'calorie tracker',
    'كبسة', 'بروتين', 'دايت', 'رجيم', 'Saudi food', 'macros',
  ],
  authors: [{ name: 'NutriAI' }],
  openGraph: {
    title: 'NutriAI — AI Nutrition Coach',
    description: 'Log meals by chat, photo, or voice. Understands Saudi dialects.',
    type: 'website',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#060a12' },
    { media: '(prefers-color-scheme: light)', color: '#f4f6f8' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('nutriai-store')||'{}');var st=(s&&s.state)||{};var t=st.theme||'dark';var l=st.locale||'ar';var d=document.documentElement;if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}d.classList.toggle('dark',t==='dark');d.setAttribute('lang',l);d.setAttribute('dir',l==='ar'?'rtl':'ltr');}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
