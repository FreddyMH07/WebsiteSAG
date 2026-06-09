// ─── Brand & Images ───────────────────────────────────────────────────────────
export const sagAssets = {
  logo: '/assets/sag/brand/logo-ptsag.png',
  logoTransparent: '/assets/sag/brand/logo-sag-transparent.png',
  heroPlantation: '/assets/sag/hero/sawit-plantation.webp',
  pal: '/assets/sag/hero/pt-pal-estate.webp',
  gbp: '/assets/sag/doc-profiles/company-profile-gbp-new-2/company-profile-gbp-new-2-image1.webp',
  gbp2: '/assets/sag/doc-profiles/company-profile-gbp-new-2/company-profile-gbp-new-2-image2.webp',
  director: '/assets/sag/sections/director.webp',
  about: '/assets/sag/sections/about-us.webp',
  agronomy: '/assets/sag/sections/agronomi.webp',
  office: '/assets/sag/sections/office-front.webp',
  team: '/assets/sag/sections/team-seragam.webp',
  gatheringWide: '/assets/sag/activities/family-business-gathering-wide.webp',
  gatheringClose: '/assets/sag/activities/family-business-gathering-close.webp',
  ubmMou: '/assets/sag/activities/ubm-mou-signing.webp',
  gatheringCulture: '/assets/sag/culture/gathering.webp',
  eplantTraining: '/assets/sag/digital/eplant-training-field-team.webp',
  map: '/assets/sag/maps/peta-indonesia.webp',
  hsbs: '/assets/sag/units/hsbs.webp',
};

// ─── Company Stats (real data dari sahabatagro.co.id) ─────────────────────────
export const companyStats = [
  { value: '2017', label: 'Berdiri Sejak', labelEn: 'Founded Since' },
  { value: '4+', label: 'Entitas Bisnis', labelEn: 'Business Entities' },
  { value: '2500+', label: 'Hektare Lahan', labelEn: 'Hectares of Land' },
  { value: '400+', label: 'Karyawan', labelEn: 'Employees' },
];

// ─── Vision & Mission ─────────────────────────────────────────────────────────
export const companyVision = {
  id: 'Menjadi perusahaan agribisnis modern terkemuka di Indonesia yang memberikan nilai ekonomi optimal sebagai mitra pembangunan berkelanjutan.',
  en: 'To be a leading modern agribusiness company in Indonesia delivering optimal economic value as a sustainable development partner.',
};

export const companyMission = [
  {
    id: 'Menyediakan produk agribisnis berkualitas tinggi yang memenuhi standar internasional.',
    en: 'Provide high-quality agribusiness products that meet international standards.',
  },
  {
    id: 'Membangun kemitraan yang saling menguntungkan dengan petani plasma dan mitra usaha.',
    en: 'Foster mutually beneficial partnerships with smallholder farmers and business partners.',
  },
  {
    id: 'Mengembangkan kapabilitas organisasi yang andal dan berdaya saing tinggi.',
    en: 'Build reliable and highly competitive organizational capabilities.',
  },
  {
    id: 'Mengembangkan sumber daya manusia yang terampil dan berkomitmen.',
    en: 'Develop skilled and committed human resources.',
  },
];

export const coreValues = [
  {
    letter: 'S',
    name: 'Synergy',
    nameId: 'Sinergi',
    desc: 'Kolaborasi, saling mendukung, menghormati, dan melengkapi antarunit bisnis.',
    descEn: 'Collaboration, mutual support, respect, trust, and complementarity across business units.',
  },
  {
    letter: 'A',
    name: 'Achievement',
    nameId: 'Prestasi',
    desc: 'Ketangguhan, growth mindset, ketekunan, dan kontribusi terukur pada kemajuan perusahaan.',
    descEn: 'Resilience, growth mindset, perseverance, and measurable contribution to company progress.',
  },
  {
    letter: 'G',
    name: 'Governance',
    nameId: 'Tata Kelola',
    desc: 'Transparansi, akuntabilitas, responsivitas, stabilitas, keadilan, inklusivitas, dan partisipasi.',
    descEn: 'Transparency, accountability, responsiveness, stability, equity, inclusiveness, and participation.',
  },
];

// ─── Business Units (real data) ───────────────────────────────────────────────
export const businessUnits = [
  {
    name: 'PT Pematang Agri Lestari',
    shortName: 'PAL',
    type: 'Palm Plantation',
    typeId: 'Perkebunan Kelapa Sawit',
    region: 'Mesuji, Lampung',
    area: '1.775 Ha',
    asset: sagAssets.pal,
  },
  {
    name: 'PT Lambang Sawit Perkasa',
    shortName: 'LSP',
    type: 'Palm Plantation',
    typeId: 'Perkebunan Kelapa Sawit',
    region: 'Lampung / Jambi',
    area: '1.194 Ha',
    asset: sagAssets.heroPlantation,
  },
  {
    name: 'PT Hasil Sawit Bina Sejahtera',
    shortName: 'HSBS',
    type: 'Palm Plantation',
    typeId: 'Perkebunan Kelapa Sawit',
    region: 'Belitung Timur',
    area: '946 Ha',
    asset: sagAssets.hsbs,
  },
  {
    name: 'PT Garuda Bumi Perkasa',
    shortName: 'GBP',
    type: 'Palm Oil Mill',
    typeId: 'Pabrik Pengolahan CPO',
    region: 'Mesuji, Lampung',
    area: 'Integrated Mill',
    asset: sagAssets.gbp,
  },
] as const;

// ─── Benefits / Why Join ──────────────────────────────────────────────────────
export const benefits = [
  {
    icon: '🌿',
    title: 'Lingkungan Agribisnis Nyata',
    titleEn: 'Real Agribusiness Environment',
    desc: 'Bekerja langsung di ekosistem perkebunan & pabrik kelapa sawit terintegrasi.',
    descEn: 'Work directly in an integrated palm plantation & mill ecosystem.',
  },
  {
    icon: '📈',
    title: 'Pertumbuhan Karir',
    titleEn: 'Career Growth',
    desc: 'Jalur karir yang jelas dengan evaluasi berkala dan kesempatan rotasi lintas entitas.',
    descEn: 'Clear career paths with regular reviews and cross-entity rotation opportunities.',
  },
  {
    icon: '💡',
    title: 'Inovasi Digital',
    titleEn: 'Digital Innovation',
    desc: 'Terlibat langsung dalam proyek HRIS, ePlantation, Middleware Timbangan, dan AutoML.',
    descEn: 'Directly involved in HRIS, ePlantation, Weighbridge Middleware, and AutoML projects.',
  },
  {
    icon: '🤝',
    title: 'Budaya Kolaboratif',
    titleEn: 'Collaborative Culture',
    desc: 'Nilai SAG (Synergy, Achievement, Governance) diterapkan nyata dalam kerja tim.',
    descEn: 'SAG values (Synergy, Achievement, Governance) applied in real teamwork.',
  },
  {
    icon: '🏥',
    title: 'Benefit Kompetitif',
    titleEn: 'Competitive Benefits',
    desc: 'BPJS Kesehatan & Ketenagakerjaan, THR, tunjangan, dan program pelatihan.',
    descEn: 'Health & employment BPJS, holiday allowance, benefits, and training programs.',
  },
  {
    icon: '🌏',
    title: 'Dampak Nyata',
    titleEn: 'Real Impact',
    desc: 'Berkontribusi pada ketahanan pangan dan agribisnis berkelanjutan di Indonesia.',
    descEn: 'Contribute to food security and sustainable agribusiness across Indonesia.',
  },
];

// ─── Departments & Employment Types ──────────────────────────────────────────
export const careerDepartments = [
  'Finance & Accounting',
  'Tax',
  'Internal Audit',
  'Purchasing',
  'Marketing',
  'Sales',
  'IT',
  'HRD',
  'Corporate Planning',
  'Agronomy',
  'Internship',
];

export const employmentTypes = ['Full Time', 'Contract', 'Internship', 'Freelance'];

// ─── Contact Info (real data) ─────────────────────────────────────────────────
export const contactInfo = {
  address: 'JL Sunter Agung Podomoro No.9-10 Blok N 2, RT.10/RW.11, Sunter Agung, Kec. Tj. Priok, Jakarta Utara 14350',
  addressShort: 'Sunter Agung, Jakarta Utara 14350',
  phone: '+62 21 2188 2445',
  email: 'admin.it@sahabatagro.co.id',
  emailHr: 'hr@sahabatagro.co.id',
  maps: 'https://www.google.com/maps/search/?api=1&query=JL+Sunter+Agung+Podomoro+No.9-10+Blok+N+2+Sunter+Agung+Jakarta+Utara+14350',
  linkedin: 'https://www.linkedin.com/company/sahabat-agro-group/',
  website: 'https://sahabatagro.co.id',
  tagline: 'From Plantation to Production',
};
