export interface Article {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date
  readTime: number; // minutes
  category: string;
  body: { heading?: string; text: string }[];
}

export const articles: Article[] = [
  {
    slug: 'how-to-care-for-cotton-clothing',
    title: 'How to Care for 100% Cotton Clothing',
    description:
      'Pure cotton is easy to care for if you know the basics. Learn how to wash, dry, and store your cotton garments so they stay soft and last for years.',
    publishedAt: '2025-10-01',
    readTime: 4,
    category: 'Care Guide',
    body: [
      {
        text: 'Pure cotton is one of the most breathable and comfortable fabrics on earth — but it does need a little attention to stay looking its best. A few simple habits will keep your QOTN pieces soft, vibrant, and intact for years.',
      },
      {
        heading: 'Washing',
        text: 'Always wash cotton in cold or lukewarm water (30°C max). Hot water causes cotton fibres to contract, which leads to shrinkage. Use a gentle detergent and a soft wash cycle. Turn the garment inside-out before washing to protect the outer surface and reduce friction on printed or dyed areas.',
      },
      {
        heading: 'Drying',
        text: 'Dry cotton in the shade. Direct sunlight bleaches natural cotton dyes over time — what looks dry in an hour costs you colour in a month. If using a dryer, choose the lowest heat setting. Slightly under-dry the garment and let it air-finish: this reduces wrinkling significantly.',
      },
      {
        heading: 'Ironing',
        text: 'Iron on medium-to-high heat while the fabric is still slightly damp. Cotton responds beautifully to ironing — the fibres lie flat and the garment looks crisp. Always iron the inside of printed sections to avoid flattening any texture or embroidery.',
      },
      {
        heading: 'Storing',
        text: 'Store cotton garments folded rather than hung to prevent shoulder distortion. Keep in a cool, dry drawer or shelf. Cedar balls or small sachets of dried neem leaves work well as natural pest repellents — avoid mothballs, which can leave a chemical odour on natural fibres.',
      },
      {
        heading: 'The First Wash',
        text: "Always wash a new cotton garment before wearing. This removes any residual dye, softens the fabric, and reveals its true drape. A slight softening of colour after the first wash is completely normal — it's simply the fabric settling into its natural state.",
      },
    ],
  },
  {
    slug: 'what-is-bci-cotton',
    title: 'What is BCI Cotton? Why QOTN Uses It',
    description:
      'BCI — Better Cotton Initiative — is the world\'s largest cotton sustainability programme. Here\'s what it means, why it matters, and why we source it.',
    publishedAt: '2025-10-15',
    readTime: 5,
    category: 'Sustainability',
    body: [
      {
        text: 'When you buy a QOTN garment, one of the first things you will notice is "BCI Cotton" on the label or product page. This is not just a marketing term — it is a certification that reflects how the cotton was grown, who grew it, and under what conditions.',
      },
      {
        heading: 'What is BCI?',
        text: 'The Better Cotton Initiative (BCI) is the world\'s largest cotton sustainability programme. Founded in 2005, it works directly with cotton farmers across India, Pakistan, China, Brazil, and other major growing regions to teach and incentivise more responsible farming practices.',
      },
      {
        heading: 'What does BCI certification require?',
        text: 'To qualify, farmers must demonstrate improvements across six areas: water use efficiency, care of soil health, reduction of pesticide and fertiliser use, preservation of natural habitats, care of fibre quality, and fair labour conditions for farm workers. BCI conducts on-farm training, audits, and continuous monitoring across all certified farms.',
      },
      {
        heading: 'Why it matters for India',
        text: 'India is the world\'s largest cotton producer, with millions of smallholder farmers growing it on small plots. Cotton cultivation in India historically used high amounts of water and chemical pesticides. BCI-trained Indian farmers have measurably reduced water consumption per kilogram of cotton by up to 20% and pesticide use by over 40% compared to conventional farming. This is a significant environmental win at scale.',
      },
      {
        heading: 'Why QOTN chose BCI',
        text: 'We chose BCI cotton because it is the most practical and rigorously monitored sustainability standard available for Indian cotton. It balances genuine environmental improvement with the economic reality of small-farm agriculture. We believe better sourcing begins upstream — before the loom, before the dye vat, at the soil itself.',
      },
      {
        heading: 'A note on "organic" cotton',
        text: 'You may wonder why we do not simply use organic cotton. Certified organic cotton is genuinely good — but it represents less than 1% of global cotton production and is significantly more expensive, putting it out of reach for most Indian households. BCI cotton reaches millions more farmers while delivering measurable sustainability gains. For us, impact at scale matters more than label perfection.',
      },
    ],
  },
  {
    slug: 'poplin-vs-voile-understanding-cotton-weaves',
    title: 'Poplin vs Voile: Understanding Cotton Weaves',
    description:
      'Not all cotton feels the same. The weave determines the drape, breathability, and weight of a fabric. Here\'s a plain-language guide to the main cotton weaves QOTN uses.',
    publishedAt: '2025-11-01',
    readTime: 6,
    category: 'Fabric Guide',
    body: [
      {
        text: 'Pure cotton can feel like crisp paper, feather-light chiffon, or dense canvas — all depending on how the threads are woven. Understanding the basic weave types helps you choose the right garment for the right occasion and season.',
      },
      {
        heading: 'Poplin',
        text: 'Poplin (also called Broadcloth in some markets) is a tight plain weave with a faint horizontal rib. It is smooth, slightly lustrous, and holds its shape well. QOTN uses poplin for shirts and kurtas that need a clean, structured drape. It is breathable enough for Indian summers yet smart enough for formal occasions. Thread count is typically 100–150 threads per inch.',
      },
      {
        heading: 'Voile',
        text: 'Voile is a lightweight, semi-sheer plain weave with a slightly open structure. It is the most breathable cotton fabric in our range — ideal for warm climates and summer dresses, dupattas, and tops. The open weave allows air to circulate freely. Because it is sheer, voile garments are often double-layered or lined for modesty.',
      },
      {
        heading: 'Cambric',
        text: 'Cambric is a closely woven, fine plain weave, softer and slightly heavier than voile but lighter than poplin. It has a dull, matte finish and a gentle drape that works beautifully for kurtas and loose trousers. It is the everyday workhorse of Indian cotton clothing and most forgiving after repeated washes.',
      },
      {
        heading: 'Mul Cotton',
        text: 'Mul (sometimes spelled Mull) is an ultra-fine, loosely woven fabric with a distinctive crinkled surface that becomes more pronounced after washing. It is exceptionally soft and light — worn close to the skin it feels like almost nothing. Mul is traditionally used for sarees and kurtas in Bengal and Rajasthan and is one of the most prized summer fabrics in India.',
      },
      {
        heading: 'How to choose',
        text: 'For formal occasions or if you prefer a structured silhouette: Poplin. For blazing summer heat or beachwear: Voile. For everyday comfortable wear: Cambric. For maximum softness and that handloom feeling: Mul. All four are 100% cotton — the weave simply determines how the cotton behaves on the body.',
      },
    ],
  },
  {
    slug: 'why-pure-cotton-is-better-than-blends',
    title: 'Why Pure Cotton is Better Than Blends',
    description:
      'Cotton-polyester blends are cheaper and easier to care for — but they come with real downsides. Here is why 100% pure cotton is worth the extra care.',
    publishedAt: '2025-11-15',
    readTime: 5,
    category: 'Why Cotton',
    body: [
      {
        text: 'Walk into any fast-fashion retailer and almost everything says "cotton" on the label — but look closely and it is "60% cotton, 40% polyester" or some variation. Blending cotton with synthetics is not inherently dishonest, but it does change what you are wearing in ways most people do not realise.',
      },
      {
        heading: 'Breathability',
        text: 'Pure cotton is naturally breathable because its fibres are hollow and absorb moisture. When you sweat, cotton wicks moisture away from your skin and releases it into the air. Polyester does the opposite — it traps moisture and heat against your body, which is why polyester-blend shirts feel sticky in Indian summers. Even a 20–30% polyester content noticeably reduces breathability.',
      },
      {
        heading: 'Skin comfort',
        text: 'Synthetic fibres have a slightly rough microstructure at the microscopic level. For most people this is imperceptible, but for those with sensitive skin or eczema, polyester blends can cause irritation, redness, and itching. Pure cotton is hypoallergenic and recommended by dermatologists for sensitive skin — including for infants and children.',
      },
      {
        heading: 'Microplastic pollution',
        text: 'Every time a polyester or polyester-blend garment is washed, it sheds thousands of microscopic plastic fibres (microplastics) into the water. These pass through wastewater treatment plants and enter rivers, oceans, and eventually the food chain. 100% cotton sheds only natural cellulose fibres, which biodegrade completely.',
      },
      {
        heading: 'Longevity and repairability',
        text: 'Pure cotton ages gracefully. It softens over time, takes on character, and — crucially — it can be repaired with needle and thread without the repair being obvious. Polyester blend fabrics pill, develop shiny patches at friction points, and resist invisible mending. A well-made pure cotton garment worn and washed regularly can last a decade. A blend will typically start visibly degrading within 18–24 months.',
      },
      {
        heading: 'The case for blends',
        text: 'To be fair: polyester blends do resist wrinkles better, dry faster, and are cheaper to produce. For activewear, performance fabrics, or items that need to hold a precise shape (like some trousers), blends have legitimate advantages. We are not anti-blend. We are pro-cotton — specifically for the kind of relaxed, everyday, close-to-the-skin clothing that QOTN makes.',
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
