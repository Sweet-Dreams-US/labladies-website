import { site } from "./site";

/**
 * The blog.
 *
 * Michelle asked on the call to be found when someone searches "mobile
 * phlebotomist" — this is the half of that which isn't metadata. Posts go out
 * roughly every other week and exist to answer the questions people actually
 * type before they call, which is also what makes them worth reading.
 *
 * Posts are typed data rather than a CMS, matching the rest of the site: all
 * copy lives in source. To add one, append an entry — `date` drives ordering
 * and the sitemap, and the slug is the URL.
 *
 * House rules, same as everywhere else on this site: say what Lab Ladies
 * does, never what it doesn't; no children or pediatric copy; no claim about
 * a result or a diagnosis; no naming third-party laboratories as partners.
 */

export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "list"; items: string[] }
  | { t: "quote"; text: string };

export type Post = {
  slug: string;
  title: string;
  /** Meta description and the card blurb — keep under about 160 characters. */
  description: string;
  /** ISO date. Drives ordering and <time>. */
  date: string;
  /** Shown above the title. One or two words. */
  category: string;
  readMinutes: number;
  body: Block[];
  /** Rendered as an FAQPage schema block as well as on the page. */
  faq?: { q: string; a: string }[];
};

export const posts: Post[] = [
  {
    slug: "what-is-a-mobile-phlebotomist",
    title: "What Is a Mobile Phlebotomist, and How Does a Home Blood Draw Work?",
    description:
      "A mobile phlebotomist comes to you to collect blood and other specimens. Here is how a home visit actually goes, start to finish.",
    date: "2026-09-22",
    category: "Getting started",
    readMinutes: 4,
    body: [
      {
        t: "p",
        text: "A phlebotomist is the person who draws your blood. A mobile phlebotomist does the same job, except they come to you — your living room, your office, your apartment in a senior living community — instead of you sitting in a waiting room.",
      },
      {
        t: "p",
        text: "For a lot of people that difference is the whole thing. If getting to a lab means arranging a ride, waiting in a chair you cannot get comfortable in, and losing a morning, a visit at home is not a luxury. It is the difference between having the blood work done and putting it off again.",
      },
      { t: "h2", text: "What actually happens at the visit" },
      {
        t: "p",
        text: "A home draw is shorter than most people expect. The whole visit usually runs fifteen to twenty minutes, and most of that is paperwork and conversation rather than the draw itself.",
      },
      {
        t: "list",
        items: [
          "We confirm who you are and what has been ordered, and check any fasting instructions.",
          "You sit somewhere comfortable with an arm supported — your own chair is usually better than anything in a lab.",
          "The draw itself takes under a minute for most panels.",
          "Tubes are labelled in front of you, then packed for transport at the temperature the laboratory requires.",
          "We tell you what happens next and roughly when to expect to hear something.",
        ],
      },
      { t: "h2", text: "Where the specimen goes afterwards" },
      {
        t: "p",
        text: "This is the part people rarely think about, and it matters more than the draw. A specimen that sits too long, or travels at the wrong temperature, can be rejected by the laboratory — which means a second visit and a second needle.",
      },
      {
        t: "p",
        text: "Collection is only half the job. Handling and prompt transport to an accredited reference laboratory is the other half, and it is the half that comes from knowing how laboratories work from the inside.",
      },
      { t: "h2", text: "Do you need a doctor's order?" },
      {
        t: "p",
        text: "Sometimes. Many tests are ordered by your physician or nurse practitioner, and we collect against that order and make sure the results get back to them. Others are available self-pay, which means you can request them yourself without an order from a doctor. If you are not sure which applies to what you want, call and ask — it is a short conversation.",
      },
    ],
    faq: [
      {
        q: "How long does a mobile blood draw take?",
        a: "Most home visits run fifteen to twenty minutes from knock to goodbye. The draw itself is usually under a minute.",
      },
      {
        q: "Do I need a doctor's order for a mobile blood draw?",
        a: "Not always. Many tests are available self-pay with no physician order needed. Others are collected against an order from your physician or nurse practitioner. Call and we will tell you which applies.",
      },
      {
        q: "Does Lab Ladies bill insurance?",
        a: "No. Lab Ladies does not bill insurance for the mobile collection — that fee is paid directly to us. The laboratory that performs the testing handles its own billing separately.",
      },
    ],
  },
  {
    slug: "home-blood-draw-palm-beach-broward",
    title: "Getting Blood Work Done at Home in Palm Beach and Broward County",
    description:
      "How mobile lab collection works across Palm Beach and Broward County — service area, appointment windows, travel fees and what to have ready.",
    date: "2026-09-08",
    category: "Local",
    readMinutes: 3,
    body: [
      {
        t: "p",
        text: "South Florida is a hard place to get to a lab appointment. Traffic on I-95 does not care that your draw is at eight. Parking at a medical plaza is its own errand. And if you are a seasonal resident, you may not have a car here at all.",
      },
      {
        t: "p",
        text: `Lab Ladies covers ${site.areas.slice(0, 2).join(" and ")} — homes, offices, senior living communities and rehab facilities.`,
      },
      { t: "h2", text: "Appointment windows" },
      {
        t: "p",
        text: "Fasting draws are the reason early mornings exist. If you have been told not to eat after midnight, the last thing you need is a ten-thirty appointment. Early morning fasting appointments are a standing part of what we do, and evenings and weekends are available when we have them.",
      },
      { t: "h2", text: "What to have ready" },
      {
        t: "list",
        items: [
          "The order from your physician or nurse practitioner, if there is one.",
          "A photo ID.",
          "Any fasting instructions you were given, and when you last ate.",
          "A list of medications, if the order mentions timing around a dose.",
          "Water — being well hydrated genuinely makes a draw easier, unless you were told otherwise.",
        ],
      },
      { t: "h2", text: "About the travel fee" },
      {
        t: "p",
        text: "A travel fee may apply depending on where you are in the two counties. It is confirmed with you before the appointment, every time. Nobody should find out what a visit costs after the visit.",
      },
    ],
    faq: [
      {
        q: "What areas does Lab Ladies cover?",
        a: "Palm Beach County and Broward County in South Florida, including homes, offices, senior living communities and rehab facilities.",
      },
      {
        q: "Can I get an early morning fasting appointment?",
        a: "Yes. Early morning fasting appointments are a standing part of the service, and evening and weekend times are available when we have them.",
      },
    ],
  },
  {
    slug: "urine-pcr-testing-explained",
    title: "Urine PCR Testing: Why It Finds Things a Standard Culture Can Miss",
    description:
      "PCR looks for the genetic signature of an organism rather than waiting for it to grow. Here is what that changes for complicated urinary tract infections.",
    date: "2026-08-25",
    category: "PCR testing",
    readMinutes: 5,
    body: [
      {
        t: "p",
        text: "A standard urine culture works by growing whatever is in the sample and seeing what turns up. It is a good test and it has been the backbone of urinary diagnostics for decades. It also has a known blind spot: it can only find organisms that grow well in a dish, quickly, and on their own.",
      },
      {
        t: "p",
        text: "PCR takes a different route. Instead of growing the organism, it looks for its genetic signature directly. Nothing has to survive a trip or thrive on a plate to be detected.",
      },
      { t: "h2", text: "Where that difference shows up" },
      {
        t: "list",
        items: [
          "Infections with more than one organism, where a culture may report only whichever grew fastest.",
          "Organisms that are slow-growing or difficult to culture at all.",
          "Samples taken after antibiotics have already started, when a culture may come back showing nothing.",
          "Recurring symptoms with repeatedly negative cultures — a frustrating and common pattern.",
        ],
      },
      { t: "h2", text: "Why it comes up so often with older adults" },
      {
        t: "p",
        text: "Urinary tract infections present differently later in life. Instead of the textbook burning and urgency, it can look like sudden confusion, a fall, or a change in behaviour that families describe as the person simply not being themselves. By the time anyone thinks to test, the picture can already be complicated.",
      },
      {
        t: "p",
        text: "That is exactly the situation where a negative culture is least reassuring and where a more sensitive method earns its place.",
      },
      { t: "h2", text: "The collection problem, and what we do about it" },
      {
        t: "p",
        text: "A clean-catch sample assumes someone can follow a multi-step process standing at a sink. For a patient with dementia, limited mobility, or incontinence, that assumption quietly fails — and the test simply does not get done.",
      },
      {
        t: "p",
        text: "For eligible incontinent patients, a diaper swab collection can be an option when appropriate and in accordance with the performing laboratory's collection protocols. It is worth asking about, because the alternative is usually no sample at all.",
      },
      {
        t: "quote",
        text: "The best test in the world does nothing if the sample never gets collected.",
      },
      { t: "h2", text: "What PCR does not do" },
      {
        t: "p",
        text: "PCR is a collection and laboratory method, not a diagnosis. What the results mean, and what to do about them, is a conversation between you and the practitioner who ordered the test. Our job is to collect the specimen properly, get it to the laboratory intact, and make sure the ordering practitioner receives the results.",
      },
    ],
    faq: [
      {
        q: "What is urine PCR testing?",
        a: "PCR is a molecular method that detects the genetic material of an organism directly, rather than waiting for it to grow in culture. It can identify organisms that are slow-growing, present alongside others, or suppressed by antibiotics already started.",
      },
      {
        q: "Can a urine PCR sample be collected from an incontinent patient?",
        a: "For eligible patients, a diaper swab collection can be an option when appropriate and in accordance with the performing laboratory's collection protocols. Call to ask whether it fits your situation.",
      },
    ],
  },
  {
    slug: "difficult-blood-draws",
    title: "Difficult Blood Draws: What Makes a Vein Hard to Find",
    description:
      "If you have been told you are a hard stick, it is not your fault and it is not random. Here is what makes a draw difficult and what helps.",
    date: "2026-08-11",
    category: "What to expect",
    readMinutes: 4,
    body: [
      {
        t: "p",
        text: "Some people get through a blood draw without noticing. Others have a history of three attempts, two bruises and an apology. If you are in the second group, you already know it, and you have probably started warning people before they get the tourniquet out.",
      },
      {
        t: "p",
        text: "You are not imagining it, and it is not something you are doing wrong.",
      },
      { t: "h2", text: "What actually makes a draw hard" },
      {
        t: "list",
        items: [
          "Veins that roll — they move aside under the needle instead of staying put.",
          "Small or deep veins that cannot be felt easily from the surface.",
          "Fragile vein walls, which become more common with age and with some medications.",
          "Dehydration, which reduces blood volume and makes veins harder to find. This one is often fixable.",
          "Scarring from frequent draws, which is why long-term patients often get harder to stick over time.",
          "Cold hands and arms, which make surface veins contract.",
        ],
      },
      { t: "h2", text: "What helps" },
      {
        t: "p",
        text: "Most of the things that make a difficult draw easier are unglamorous. Drink water beforehand unless you have been told not to. Keep the arm warm. Sit somewhere you can actually relax, with the arm supported rather than held up in the air.",
      },
      {
        t: "p",
        text: "That last one is an underrated advantage of being drawn at home. A person sitting in their own chair, warm, unhurried, with no queue behind them, is a materially easier draw than the same person perched on a stool at the end of a long morning.",
      },
      { t: "h2", text: "Say something first" },
      {
        t: "p",
        text: "If previous draws have gone badly, lead with it. Tell us which arm has worked before, which site someone found last time, and whether you have a history of feeling faint. None of that is complaining — it is useful information, and it changes how the draw is approached.",
      },
      {
        t: "p",
        text: "An experienced nursing team with decades of geriatric practice has seen the difficult version of this many times. It is a large part of why people call us specifically.",
      },
    ],
    faq: [
      {
        q: "What should I do before a blood draw if I am a hard stick?",
        a: "Drink water beforehand unless you have been told not to, keep your arms warm, and tell the person drawing which arm and site have worked before. Being warm, hydrated and relaxed makes a real difference.",
      },
    ],
  },
  {
    slug: "lab-work-in-senior-living-communities",
    title: "How Lab Work Gets Done in Senior Living Communities",
    description:
      "What mobile lab collection looks like inside an ALF or independent living community, for families and for the staff coordinating it.",
    date: "2026-07-28",
    category: "Senior living",
    readMinutes: 4,
    body: [
      {
        t: "p",
        text: "Moving a resident out of a community for a blood draw is a bigger operation than it sounds. Transport has to be arranged. Someone may need to go along. A resident with dementia may be unsettled for the rest of the day by the trip itself, long after the draw is forgotten.",
      },
      {
        t: "p",
        text: "Collecting on site removes all of that. The resident stays in their own room, in their own routine.",
      },
      { t: "h2", text: "What it looks like in practice" },
      {
        t: "list",
        items: [
          "Routine draws scheduled around the community's day rather than against it.",
          "On-call testing when something changes and nobody wants to wait until next week.",
          "Respiratory testing — including COVID, flu and RSV collection — without moving a resident who may be contagious through a shared building.",
          "Advanced PCR collection, including for residents who cannot provide a clean-catch specimen.",
        ],
      },
      { t: "h2", text: "For families" },
      {
        t: "p",
        text: "You do not have to be the one who coordinates it, and you do not have to take a morning off to drive. If you are the family member who ends up managing everything medical from another state, this is one thing that can come off your list.",
      },
      { t: "h2", text: "For community staff" },
      {
        t: "p",
        text: "We work with the ordering practitioner directly and follow through until they have what they need. The results go where they are supposed to go. That follow-through is tracked deliberately rather than left to memory, because a result that came back and then sat somewhere is the same as no result at all.",
      },
      {
        t: "p",
        text: "Lab Ladies is nurse-owned, with an experienced laboratory supervisor and more than thirty years of geriatric nursing behind it. The people who show up understand both halves of the job.",
      },
    ],
    faq: [
      {
        q: "Can Lab Ladies collect lab work inside an assisted living facility?",
        a: "Yes. Mobile collection in ALFs, independent living and rehab communities is a core part of the service, including routine draws, on-call testing and respiratory testing.",
      },
      {
        q: "Who receives the results?",
        a: "The practitioner who ordered the test. Where Lab Ladies is responsible for forwarding results, that hand-off is tracked until it is confirmed.",
      },
    ],
  },
];

export const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const getPost = (slug: string) => posts.find((p) => p.slug === slug) ?? null;

export const formatPostDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
