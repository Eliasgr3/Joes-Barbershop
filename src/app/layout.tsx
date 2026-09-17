import type { Metadata } from 'next';
import { Inter, Roboto_Condensed } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const robotoCondensed = Roboto_Condensed({
  variable: '--font-roboto-condensed',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

export const metadata: Metadata = {
  title: "Joe's Barbershop — Κουρείο στον Χολαργό",
  description:
    'Κουρείο στον Χολαργό, Υμηττού 1. Κούρεμα, γένια και περιποίηση για άνδρες κάθε ηλικίας. Κλείσε ραντεβού online.',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HairSalon',
  name: "Joe's Barbershop",
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Υμηττού 1',
    addressLocality: 'Χολαργός',
    addressRegion: 'Αττική',
    postalCode: '15561',
    addressCountry: 'GR',
  },
  telephone: '+302106525504',
  priceRange: '€',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '73' },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Saturday'],
      opens: '09:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '11:00',
      closes: '20:00',
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="el" className={`${inter.variable} ${robotoCondensed.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
