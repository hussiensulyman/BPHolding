export type SeedProject = {
  id: string;
  slug: string;
  status: "ongoing" | "completed";
  sector: "commercial" | "residential" | "infrastructure";
  imagePath: string;
  title: {
    en: string;
    ar: string;
  };
  summary: {
    en: string;
    ar: string;
  };
};

export const SAMPLE_PROJECTS: SeedProject[] = [
  {
    id: "bp-tower-fitout",
    slug: "bp-tower-fitout",
    status: "ongoing",
    sector: "commercial",
    imagePath: "/portfolio/al-malqa/cover.jpg",
    title: {
      en: "Riyadh Commercial Tower Fit-Out",
      ar: "تشطيبات برج تجاري في الرياض",
    },
    summary: {
      en: "Integrated civil, MEP, and interior delivery for a premium office tower.",
      ar: "تنفيذ متكامل للأعمال المدنية والكهروميكانيكية والداخلية لبرج مكاتب متميز.",
    },
  },
  {
    id: "neom-housing-package",
    slug: "neom-housing-package",
    status: "ongoing",
    sector: "residential",
    imagePath: "/portfolio/al-yasmin/cover.jpg",
    title: {
      en: "NEOM Workforce Housing Package",
      ar: "حزمة إسكان القوى العاملة في نيوم",
    },
    summary: {
      en: "Rapid-delivery residential compounds with resilient infrastructure support.",
      ar: "مجمعات سكنية سريعة التنفيذ مع دعم بنية تحتية عالية الاعتمادية.",
    },
  },
  {
    id: "jeddah-logistics-revamp",
    slug: "jeddah-logistics-revamp",
    status: "completed",
    sector: "infrastructure",
    imagePath: "/portfolio/al-arid/cover.jpg",
    title: {
      en: "Jeddah Logistics Hub Revamp",
      ar: "تطوير مركز الخدمات اللوجستية في جدة",
    },
    summary: {
      en: "Renovation and utility modernization to increase throughput and safety.",
      ar: "إعادة تأهيل وتحديث للمرافق لرفع الطاقة التشغيلية ومعايير السلامة.",
    },
  },
];
