export const site = {
  name: "Lab Ladies, LLC",
  shortName: "Lab Ladies",
  tagline: "We Come to You!",
  longTagline:
    "Experienced Nurses. Experienced Laboratory Leadership. Exceptional Mobile Diagnostic Services.",
  url: "https://labladies.net",
  phone: "954-605-3725",
  phoneHref: "tel:+19546053725",
  smsHref: "sms:+19546053725",
  fax: "561-461-6207",
  email: "labladies2026@gmail.com",
  emailHref: "mailto:labladies2026@gmail.com",
  areas: ["Palm Beach County", "Broward County", "South Florida"],
  travelNote: "Travel fee may apply.",
  /** Replace with the live Google Business Profile review link when available. */
  googleReviewUrl: "https://www.google.com/search?q=Lab+Ladies+LLC+mobile+lab+South+Florida",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pcr-testing", label: "PCR Testing" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;

export const whyChooseUs = [
  "Nurse-Owned and Operated",
  "Experienced Registered Nursing Team",
  "Experienced Laboratory Supervisor",
  "More than 30 Years of Geriatric Nursing Experience",
  "Concierge Mobile Laboratory Collection",
  "Compassionate, Personalized Care",
  "Early Morning Fasting Appointments",
  "Evening & Weekend Availability (when available)",
  "Difficult Blood Draw Specialists",
  "Advanced PCR Diagnostic Collection",
  "Physician Communication",
  "Prompt Specimen Transport to Accredited Reference Laboratories",
] as const;

export const specializedServices = [
  "Advanced Urine PCR Collection",
  "Diaper Swab PCR Collection for Eligible Incontinent Patients",
  "Difficult Blood Draw Specialists",
  "Mobile Laboratory Collection in ALFs & Independent Living Communities",
  "Advanced Respiratory, Wound & GI PCR Collection",
  "Concierge Mobile Diagnostic Services for Older Adults",
] as const;

/** Individuals who use the service. Organizations live in `partners`. */
export const whoWeServe = [
  "Older adults",
  "Concierge medical patients",
  "Caregivers",
  "Individuals with mobility challenges",
  "Individuals recovering from illness or surgery",
  "Seasonal residents",
  "Busy professionals",
  "People who prefer privacy and convenience",
] as const;

export const partners = [
  {
    title: "Concierge Medical Practices & Doctor Offices",
    icon: "provider" as const,
    points: [
      "Fast Mobile Lab Services",
      "Home-Bound Patient Services",
      "Specimen Collection & Transport",
    ],
  },
  {
    title: "Senior Living & Rehab Communities",
    icon: "home" as const,
    points: [
      "Routine Blood Draws",
      "On-Call Testing Services",
      "Respiratory Testing (COVID, Flu, RSV)",
    ],
  },
  {
    title: "Colleges & Universities",
    icon: "school" as const,
    points: [
      "Confidential Health Screenings",
      "Convenient On-Campus Testing",
      "Drug Testing Services",
    ],
  },
  {
    title: "Med Spas & Gyms",
    icon: "spa" as const,
    points: [
      "On-Site Client Collections",
      "Wellness & Performance Panels",
      "Discreet, Professional Service",
    ],
  },
  {
    title: "Medical Courier Services",
    icon: "courier" as const,
    points: [
      "Hire Us for Contracted Pickups",
      "Specimen Transport to Reference Laboratories",
      "Reliable Chain-of-Custody Handling",
    ],
  },
] as const;

export const appointmentWindows = [
  "After Hours",
  "Late Evenings",
  "Early Mornings",
  "Weekend Hours",
] as const;

export const services = [
  {
    slug: "lab-tests",
    title: "All Lab Tests",
    summary: "Results within 24-48 hours.",
    body: "Routine and comprehensive laboratory panels collected wherever you are — at home, at the office, or in a senior living community. Specimens are transported promptly to accredited reference laboratories, and we follow through until the ordering physician has the results.",
    points: [
      "Routine and comprehensive blood panels",
      "Early morning fasting appointments",
      "Difficult blood draw specialists",
      "Prompt transport to accredited reference laboratories",
    ],
  },
  {
    slug: "culture-sensitivity",
    title: "Culture & Sensitivity Testing",
    summary: "Urine, stool, wounds and more.",
    body: "Culture and sensitivity collection performed by an experienced nursing team that understands laboratory handling requirements — helping protect specimen integrity from the moment of collection.",
    points: [
      "Urine cultures",
      "Stool collection",
      "Wound cultures",
      "Laboratory-approved handling and transport",
    ],
  },
  {
    slug: "pcr-testing",
    title: "Advanced PCR Testing",
    summary: "Our specialty. Rapid, often same-day results.",
    body: "PCR molecular diagnostics are what set Lab Ladies apart. We collect for advanced respiratory, urine, wound and GI PCR testing, including specialized collection methods for patients who cannot provide a clean-catch specimen.",
    points: [
      "Urine PCR — including complicated UTIs",
      "Respiratory PCR — Flu / COVID / RSV / Strep and more",
      "Wound PCR",
      "GI PCR — including C. diff",
    ],
    href: "/pcr-testing",
  },
  {
    slug: "drug-testing",
    title: "Drug Testing",
    summary: "For campuses, clinics and organizations.",
    body: "Confidential drug screen collection performed on site — for colleges and universities, clinical monitoring, and organizations that need testing done where their people already are.",
    points: [
      "On-site collections",
      "On-campus collections",
      "Confidential and respectful process",
    ],
  },
  {
    slug: "std-rapid-testing",
    title: "STD Rapid Testing",
    summary: "Private and discreet.",
    body: "Rapid testing collection handled with complete privacy and professionalism, in the comfort of your own home.",
    points: ["Discreet, private collection", "Fast turnaround", "Self-pay — no physician order needed"],
  },
  {
    slug: "gender-reveal",
    title: "Gender Reveal DNA Testing",
    summary: "Find out early, from the comfort of home.",
    body: "A simple blood collection for early gender DNA testing — performed at your home by an experienced Registered Nurse, so you can skip the lab waiting room entirely.",
    points: [
      "Collected at home by an RN",
      "Self-pay — no physician order needed",
      "Discreet and comfortable",
    ],
  },
] as const;

export const pricing = {
  headline: "Simple, transparent, self-pay pricing.",
  policies: [
    {
      title: "Self-Pay — No Physician Order Needed",
      body: "Many of our tests are available self-pay, which means you can request testing yourself without an order from a doctor. Just call us and we will walk you through what is available.",
    },
    {
      title: "We Do Not Bill Insurance",
      body: "Lab Ladies does not bill insurance for our services. Our mobile collection fee is paid directly to us. The laboratory that performs your testing handles its own billing separately.",
    },
    {
      title: "Travel Fee",
      body: "A travel fee may apply depending on your location within Palm Beach and Broward County. We will always confirm any travel fee with you before your appointment — no surprises.",
    },
  ],
  /** Set `price` to a string (e.g. "$75") once the client confirms rates. */
  rows: [
    { service: "Mobile blood draw / specimen collection", price: null },
    { service: "All lab tests (routine & comprehensive panels)", price: null },
    { service: "Culture & sensitivity testing", price: null },
    { service: "Advanced PCR testing", price: null },
    { service: "Drug testing", price: null },
    { service: "STD rapid testing", price: null },
    { service: "Gender reveal DNA testing", price: null },
    { service: "Medical courier / contracted pickups", price: null },
  ] as { service: string; price: string | null }[],
};
