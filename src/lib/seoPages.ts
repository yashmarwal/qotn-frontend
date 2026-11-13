// Search-landing pages and the SEO text under the category pages.
// Titles omit " | QOTN": the root layout's title template adds it.
// Copy rule: only what the site already says (100% cotton, no blends, every batch tested and certified, made in India,
// free shipping above ₹1,499, COD on select pincodes, custom stitching on select products) and what the policy pages say.
// Print descriptions follow the product names: "batik look", "Ajrakh Print look", "block print look". No handloom claims.

import type { Metadata } from 'next';

export const SITE = 'https://www.qotn.in';
export const MIN_PAGE_PRODUCTS = 3; // a landing page with fewer products is kept out of search (noindex + no sitemap entry)

export interface Faq { q: string; a: string }
export interface Section { h2: string; body: string[] }
export interface Related { href: string; label: string }

export interface LandingConfig {
  path: string;
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  filter: (p: any) => boolean;
  sections: (ctx: { products: { price: number }[] }) => Section[];
  faqTitle: string;
  faqs: Faq[];
  related: Related[];
}

// ── Which live products belong on which page (the shop has no tags, so the product's own name decides) ──
const name = (p: any) => String(p?.name || '');
const inCategory = (p: any, c: string) => p?.category?.slug === c;
export const isKurtaSet = (p: any) => inCategory(p, 'women') && /\bkurta\b/i.test(name(p));
export const isKurti = (p: any) => inCategory(p, 'women') && /\bkurti\b/i.test(name(p));
export const isCottonSaree = (p: any) => inCategory(p, 'women') && /\bsaree\b/i.test(name(p));
export const isStripedMenShirt = (p: any) => inCategory(p, 'men') && /strip/i.test(name(p));

// ── Facts shared by the FAQs (kept in one place so they stay in step with the policy pages) ──
const CERTIFIED = 'Yes. Every QOTN piece is made from 100% pure cotton, with no polyester or other blends. We test every batch of fabric and certify it before it goes into production.';
const CARE = 'Wash in cold or lukewarm water with a gentle detergent and dry in the shade. Avoid the tumble dryer, as heat can shrink cotton. Each product page lists its care instructions.';
const SIZE = 'Use the QOTN size guide and compare it with a piece you already own. If you are between two sizes, we recommend choosing the larger size.';
const CUSTOM = 'Custom stitching is available on select products for ₹249, made to your measurements. It adds 3–5 business days to delivery, and custom stitched orders cannot be returned, so please check your measurements carefully.';
const SHIPPING = 'Orders above ₹1,499 ship free across India. Below that, standard shipping is ₹99. Delivery takes 5–7 business days, and cash on delivery is available on select pincodes with a ₹50 charge.';
const RETURNS = 'We accept returns only for items that arrive damaged or defective, and you need to contact us within 24 hours of delivery. Custom stitched orders cannot be returned. The details are on our return policy page.';

const underThousand = (products: { price: number }[]) => products.filter((p) => p.price < 100000).length;

export const KURTA_SETS: LandingConfig = {
  path: '/kurta-sets',
  title: 'Cotton Kurta Set for Women: Pure Cotton Sets',
  description: 'Buy pure cotton kurta sets for women: kurta palazzo sets and kurta sets with dupatta. 100% cotton, no blends. Free shipping above ₹1,499.',
  h1: 'Cotton Kurta Sets for Women',
  breadcrumb: 'Cotton Kurta Sets for Women',
  filter: isKurtaSet,
  sections: ({ products }) => {
    const n = underThousand(products);
    return [
      { h2: 'Kurta Palazzo Sets', body: ['A kurta palazzo set is one of the easiest outfits to wear, from busy weekdays to family functions. Our kurta and palazzo sets are cut from 100% cotton, so the fabric stays light and breathable through a long day.'] },
      { h2: 'Kurta Sets with Dupatta', body: ['If you want a complete look in one purchase, choose our Ajrakh-print look set, which comes as a kurta, pajama and dupatta.'] },
      { h2: 'Block Print & Ajrakh Print Kurta Sets', body: ['Our printed kurta sets include an Ajrakh-print look design and block-print style patterns. They are printed designs inspired by traditional looks, made in pure cotton with no blends.'] },
      ...(n > 0
        ? [{ h2: 'Kurta Sets Under ₹1,000', body: [`${n} of the kurta sets on this page are priced under ₹1,000, so a pure cotton set does not have to stretch your budget.`] }]
        : []),
      { h2: 'Custom Stitching Available', body: [CUSTOM] },
    ];
  },
  faqTitle: 'Kurta Set FAQs',
  faqs: [
    { q: 'Are your kurta sets 100% cotton?', a: CERTIFIED },
    { q: 'How do I wash a cotton kurta set?', a: CARE },
    { q: 'Which size should I choose?', a: SIZE },
    { q: 'Can I get a kurta set stitched to my measurements?', a: CUSTOM },
    { q: 'Is shipping free, and is cash on delivery available?', a: SHIPPING },
    { q: 'Can I return a kurta set?', a: RETURNS },
  ],
  related: [
    { href: '/kurtis', label: 'Cotton kurtis' },
    { href: '/co-ord-sets', label: 'Cotton co-ord sets' },
    { href: '/cotton-sarees', label: 'Cotton sarees' },
    { href: '/women', label: "Women's clothing" },
  ],
};

export const KURTIS: LandingConfig = {
  path: '/kurtis',
  title: 'Cotton Kurtis for Women: Halter, Flared & Side-Tie',
  description: 'Shop pure cotton kurtis for women: halter, flared and side-tie styles in soft 100% cotton. No blends, made in India. COD available.',
  h1: 'Cotton Kurtis for Women',
  breadcrumb: 'Cotton Kurtis for Women',
  filter: isKurti,
  sections: () => [
    { h2: 'Halter Neck Kurtis', body: ['Our halter neck kurti adds a stylish neckline to a breathable 100% cotton kurti, so it works for everyday wear as well as casual outings.'] },
    { h2: 'Flared Kurtis', body: ['Flared kurtis add movement and an easy fit. Our flared cotton kurtis come in a tree print and a geometric print, in soft cotton that falls neatly.'] },
    { h2: 'Side-Tie Kurtis', body: ['Side-tie kurtis have lace-up detailing at the waist that shapes the fit. We have floral side-tie kurtis in pure cotton, in blue and other prints.'] },
    { h2: 'Printed Cotton Kurtis', body: ['From floral to geometric, every printed kurti here is made from 100% cotton with no blends, so the print sits on a soft, breathable fabric.'] },
    { h2: 'How to Choose a Cotton Kurti', body: ['Pick the neckline and shape you like, then check the size guide. If you are between two sizes, we recommend the larger one for a relaxed fit. Wash cold to keep the fit and colour.'] },
  ],
  faqTitle: 'Cotton Kurti FAQs',
  faqs: [
    { q: 'Are your kurtis 100% pure cotton?', a: CERTIFIED },
    { q: 'What is the difference between a kurti and a kurta set?', a: 'A kurti is a single top-length garment, usually worn with leggings, pants or palazzos. A kurta set comes together as a matching outfit, such as a kurta with palazzo or pajama. You can browse both on QOTN.' },
    { q: 'Do cotton kurtis shrink?', a: 'Cotton can shrink in hot water or a hot dryer. ' + CARE },
    { q: 'Which size should I choose?', a: SIZE },
    { q: 'Is shipping free, and is cash on delivery available?', a: SHIPPING },
    { q: 'Can I return a kurti?', a: RETURNS },
  ],
  related: [
    { href: '/kurta-sets', label: 'Cotton kurta sets' },
    { href: '/co-ord-sets', label: 'Cotton co-ord sets' },
    { href: '/cotton-sarees', label: 'Cotton sarees' },
    { href: '/women', label: "Women's clothing" },
  ],
};

export const COTTON_SAREES: LandingConfig = {
  path: '/cotton-sarees',
  title: 'Pure Cotton Sarees for Women: Batik Print',
  description: 'Explore pure cotton sarees for women in batik-print designs. Light, breathable 100% cotton, made in India. Free shipping above ₹1,499.',
  h1: 'Cotton Sarees for Women',
  breadcrumb: 'Cotton Sarees for Women',
  filter: isCottonSaree,
  sections: () => [
    { h2: 'Batik Print Cotton Sarees', body: ['Our cotton sarees carry bold batik-look prints, in white and red, black floral and more. They are printed designs on 100% cotton fabric, with no blends.'] },
    { h2: 'Why Pure Cotton Sarees?', body: ['A pure cotton saree is light and breathable, which makes it comfortable for a full day of wear in warm weather. Cotton is also soft against the skin and easy to look after.'] },
    { h2: 'How to Style & Care for a Cotton Saree', body: ['Pair a printed cotton saree with a plain contrasting blouse and simple jewellery, and let the print do the work. To care for it, wash gently in cold water, dry in the shade, and iron on the reverse while the fabric is still slightly damp. Check the care label on your saree before washing.'] },
  ],
  faqTitle: 'Cotton Saree FAQs',
  faqs: [
    { q: 'Are these sarees pure cotton?', a: CERTIFIED },
    { q: 'Are the batik sarees hand-made?', a: 'Our sarees have batik-look prints on 100% cotton fabric. We describe them as batik-look prints, and we do not claim hand-batik or handloom craft.' },
    { q: 'Is a cotton saree good for summer?', a: 'Yes. Cotton is breathable and light, which is why it is a popular choice for warm weather and long days.' },
    { q: 'How do I wash a cotton saree?', a: CARE },
    { q: 'Is shipping free, and is cash on delivery available?', a: SHIPPING },
    { q: 'Can I return a saree?', a: RETURNS },
  ],
  related: [
    { href: '/kurta-sets', label: 'Cotton kurta sets' },
    { href: '/kurtis', label: 'Cotton kurtis' },
    { href: '/co-ord-sets', label: 'Cotton co-ord sets' },
    { href: '/women', label: "Women's clothing" },
  ],
};

export const STRIPED_SHIRTS: LandingConfig = {
  path: '/men/striped-shirts',
  title: 'Striped Cotton Shirts for Men | Pure Cotton',
  description: 'Shop striped shirts for men in 100% pure cotton: blue, navy, orange and more. Breathable, no blends, made in India.',
  h1: 'Striped Cotton Shirts for Men',
  breadcrumb: 'Striped Cotton Shirts for Men',
  filter: isStripedMenShirt,
  sections: () => [
    { h2: 'Blue, Navy & Orange Stripes', body: ['Our striped shirts come in blue, navy and orange, so you can pick a calm everyday stripe or a bolder one for the weekend. Every shirt is made from 100% cotton.'] },
    { h2: 'Why a Pure Cotton Striped Shirt?', body: ['Cotton is breathable and soft, which makes a striped shirt comfortable from the office to an evening out. There are no blends, so it also irons and washes the way cotton should.'] },
  ],
  faqTitle: 'Striped Shirt FAQs',
  faqs: [
    { q: 'Are your striped shirts 100% cotton?', a: CERTIFIED },
    { q: 'How do I wash a striped cotton shirt?', a: CARE },
    { q: 'Which size should I choose?', a: SIZE },
    { q: 'Is shipping free, and is cash on delivery available?', a: SHIPPING },
  ],
  related: [
    { href: '/men', label: "Men's cotton shirts" },
    { href: '/blog/floral-vs-striped-shirts-for-men', label: 'Floral vs striped shirts: styling guide' },
  ],
};

export const COORD_SETS: Omit<LandingConfig, 'filter'> = {
  path: '/co-ord-sets',
  title: 'Cotton Co-ord Sets for Women & Kids',
  description: 'Matching pure cotton co-ord sets for women and kids in floral and printed designs. 100% cotton, no blends. Free shipping above ₹1,499.',
  h1: 'Cotton Co-ord Sets',
  breadcrumb: 'Cotton Co-ord Sets',
  sections: () => [
    { h2: 'Floral Cotton Co-ord Sets for Women', body: ['Our women\'s co-ord sets come in pink, olive and purple florals, matched as a top and bottom set in 100% cotton, so you get an easy, put-together outfit in one go.'] },
    { h2: "Kids' Co-ord Sets", body: ["Kids' co-ord sets are made from the same pure cotton, with no blends, so they stay soft and breathable for play and for school holidays."] },
    { h2: 'How to Style a Co-ord Set', body: ['Wear the set together for a matched look, or split it: pair the top with jeans and the bottom with a plain tee. Keep accessories simple so the print stays the star.'] },
  ],
  faqTitle: 'Co-ord Set FAQs',
  faqs: [
    { q: 'Are your co-ord sets 100% cotton?', a: CERTIFIED },
    { q: 'How do I wash a cotton co-ord set?', a: CARE },
    { q: 'Which size should I choose?', a: SIZE },
    { q: 'Is shipping free, and is cash on delivery available?', a: SHIPPING },
  ],
  related: [
    { href: '/kurta-sets', label: 'Cotton kurta sets' },
    { href: '/women', label: "Women's clothing" },
    { href: '/kids', label: "Kids' clothing" },
    { href: '/size-guide', label: 'Size guide' },
  ],
};

// ── Text under the existing /women, /men and /kids pages ──
export const CATEGORY_PAGES: Record<
  'men' | 'women' | 'kids',
  { title: string; description: string; h1: string; sections: Section[]; faqTitle?: string; faqs?: Faq[]; related: Related[] }
> = {
  men: {
    title: 'Cotton Shirts for Men: Printed & Striped',
    description: 'Shop pure cotton shirts for men: printed, striped and block-print styles in 100% cotton. No blends, made in India. Free shipping above ₹1,499.',
    h1: 'Cotton Shirts for Men',
    sections: [
      { h2: 'Striped Cotton Shirts', body: ['Our striped shirts come in blue, navy and orange, in breathable 100% cotton. See the full range on our striped cotton shirts page.'] },
      { h2: 'Printed & Floral Cotton Shirts', body: ['From geometric and abstract prints to a blue elephant print and a floral, our printed shirts are made from pure cotton with no blends, so the prints sit on soft, breathable fabric.'] },
      { h2: 'Full Sleeve Cotton Shirts', body: ['Many of our men\'s shirts are full sleeve, including a block-print look shirt, and they are stitched in Jaipur, Rajasthan.'] },
    ],
    faqTitle: 'Cotton Shirt Fit & Care FAQs',
    faqs: [
      { q: 'Are your men\'s shirts 100% cotton?', a: CERTIFIED },
      { q: 'Which size should I choose?', a: SIZE },
      { q: 'How do I wash a cotton shirt?', a: CARE },
      { q: 'Is shipping free, and is cash on delivery available?', a: SHIPPING },
      { q: 'Can I return a shirt?', a: RETURNS },
    ],
    related: [
      { href: '/men/striped-shirts', label: 'Striped cotton shirts' },
      { href: '/women', label: "Women's clothing" },
      { href: '/kids', label: "Kids' clothing" },
    ],
  },
  women: {
    title: "Women's Cotton Kurta Sets, Kurtis & Co-ord Sets",
    description: "Shop women's 100% pure cotton kurta sets, kurtis, co-ord sets and sarees. No blends. Made in India. Free shipping above ₹1,499.",
    h1: "Women's Pure Cotton Clothing",
    sections: [
      {
        h2: "Shop women's pure cotton clothing by type",
        body: [
          "Every piece in our women's range is made from 100% pure cotton, with no polyester or other blends. Browse kurta sets for a complete matching outfit, kurtis in halter, flared and side-tie styles, co-ord sets in floral prints, and batik-look cotton sarees.",
          'Cotton is light and breathable, which suits Indian weather, and it only gets softer with proper care. Every batch of fabric is tested and certified before it goes into production, and our clothes are stitched in Jaipur, Rajasthan. Orders above ₹1,499 ship free across India, cash on delivery is available on select pincodes, and custom stitching is offered on select products.',
        ],
      },
    ],
    related: [
      { href: '/kurta-sets', label: 'Cotton kurta sets' },
      { href: '/kurtis', label: 'Cotton kurtis' },
      { href: '/cotton-sarees', label: 'Cotton sarees' },
      { href: '/co-ord-sets', label: 'Cotton co-ord sets' },
    ],
  },
  kids: {
    title: "Kids' Pure Cotton Clothing: Co-ord & Kurta Sets",
    description: 'Soft, breathable 100% cotton clothing for kids: co-ord sets, kurta pajama sets, short sets and dresses. No blends. Free shipping above ₹1,499.',
    h1: "Kids' Pure Cotton Clothing",
    sections: [
      { h2: "Kids' Co-ord Sets", body: ["Matching cotton co-ord sets in floral and striped designs, made from 100% cotton with no blends. See all of them on our co-ord sets page."] },
      { h2: 'Kurta Pajama & Kurta Short Sets', body: ['Our kurta pajama and kurta short sets are made for festive days and family occasions, in the same pure cotton as the rest of the range.'] },
      { h2: "Kids' Cotton Dresses", body: ['A floral cotton A-line dress for girls, light and easy to wear. Like everything at QOTN, it is 100% cotton.'] },
      { h2: "Why Cotton Is Best for Kids' Skin", body: ['Cotton is soft and breathable, which is why many parents choose it for children who run, play and sweat. With no polyester or other blends, a QOTN piece is simply cotton: soft, light, and easy to wash.'] },
    ],
    faqTitle: "Kids' Cotton Clothing FAQs",
    faqs: [
      { q: "Is QOTN's kids' clothing 100% cotton?", a: CERTIFIED },
      { q: 'How do I choose the right size for my child?', a: SIZE + ' Children grow quickly, so a little room helps.' },
      { q: 'How do I wash kids\' cotton clothes?', a: CARE },
      { q: 'Is shipping free, and is cash on delivery available?', a: SHIPPING },
    ],
    related: [
      { href: '/co-ord-sets', label: 'Cotton co-ord sets' },
      { href: '/men', label: "Men's clothing" },
      { href: '/women', label: "Women's clothing" },
    ],
  },
};

/** Page metadata for a landing page: page-specific title, description, canonical, Open Graph and Twitter. noindex while it has too few products. */
export function landingMetadata(cfg: { path: string; title: string; description: string }, tooFew: boolean): Metadata {
  const url = `${SITE}${cfg.path}`;
  return {
    title: cfg.title,
    description: cfg.description,
    alternates: { canonical: url },
    ...(tooFew ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: cfg.title,
      description: cfg.description,
      url,
      images: [{ url: `${SITE}/og-image.png`, width: 1200, height: 630, alt: 'QOTN — Pure Cotton. Nothing Else.' }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@shopqotn',
      title: cfg.title,
      description: cfg.description,
      images: [{ url: `${SITE}/twitter-card.png`, alt: 'QOTN — Pure Cotton. Nothing Else.' }],
    },
  };
}
