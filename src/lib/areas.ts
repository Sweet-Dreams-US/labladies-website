/**
 * Service-area pages: /areas and /areas/[slug].
 *
 * These exist for local search — someone types "mobile blood draw Coral
 * Springs", and a page about Coral Springs is what ranks. The risk is the
 * one Google names outright: "doorway pages", dozens of near-identical pages
 * with only the town swapped, which it demotes. So every town here carries
 * its own intro written about that town, and links to its real neighbours.
 *
 * House rules for this file:
 *  - Geography only. Neighbourhoods, roads, what's next door. Nothing
 *    invented: no named facilities, no "we serve X patients here", no claims
 *    about who Lab Ladies has visited.
 *  - Same content rules as the rest of the site: say what we do, never what
 *    we don't; no children.
 *  - Adding a town: add it here with a genuinely distinct `intro` and real
 *    `nearby` slugs. It appears in /areas, the sitemap, llms.txt and the
 *    structured data automatically.
 */

export type County = "Miami-Dade" | "Broward" | "Palm Beach";

export type Area = {
  slug: string;
  name: string;
  county: County;
  /** Two sentences, specific to this town. Never shared with another entry. */
  intro: string;
  /** Slugs of genuinely neighbouring towns in this list. */
  nearby: string[];
};

export const COUNTY_ORDER: County[] = ["Broward", "Miami-Dade", "Palm Beach"];

export const COUNTY_INTRO: Record<County, string> = {
  Broward:
    "Broward County is home base: Fort Lauderdale and the cities around it, from the beach condos along A1A to the western suburbs out toward the Everglades.",
  "Miami-Dade":
    "Across Miami-Dade, from the high-rises of Brickell and the barrier islands to the neighbourhoods of Kendall and Doral, a nurse comes to you so you don't have to face Miami traffic for a blood draw.",
  "Palm Beach":
    "Up the coast into Palm Beach County — Boca Raton, Delray, the Palm Beaches and beyond — including the many retirement and 55+ communities along the way.",
};

export const areas: Area[] = [
  // ------------------------------------------------------------- Broward
  {
    slug: "fort-lauderdale",
    name: "Fort Lauderdale",
    county: "Broward",
    intro:
      "From the high-rises along Las Olas and the beachfront condos on A1A to the neighbourhoods west of US-1, we bring the lab to Fort Lauderdale homes, offices and senior communities. Skip the drive and the waiting room — the draw happens where you already are.",
    nearby: ["wilton-manors", "oakland-park", "lauderdale-by-the-sea", "plantation", "davie", "hollywood"],
  },
  {
    slug: "hollywood",
    name: "Hollywood",
    county: "Broward",
    intro:
      "Whether you're near the Broadwalk, downtown on Hollywood Boulevard or out west past I-95, we come to your door in Hollywood. Early fasting appointments mean you can eat breakfast at your usual time.",
    nearby: ["hallandale-beach", "pembroke-pines", "davie", "fort-lauderdale", "miramar"],
  },
  {
    slug: "hallandale-beach",
    name: "Hallandale Beach",
    county: "Broward",
    intro:
      "Hallandale Beach sits right on the Broward–Miami-Dade line, and a lot of its condo towers are full of residents who would rather not drive for lab work. We collect in your own apartment, on your schedule.",
    nearby: ["hollywood", "aventura", "sunny-isles-beach", "miramar"],
  },
  {
    slug: "pembroke-pines",
    name: "Pembroke Pines",
    county: "Broward",
    intro:
      "Pembroke Pines stretches from I-75 out toward the Everglades, with a large number of 55+ communities in between. We come to you there, so a routine blood draw doesn't mean a trip across town.",
    nearby: ["miramar", "hollywood", "davie", "weston"],
  },
  {
    slug: "miramar",
    name: "Miramar",
    county: "Broward",
    intro:
      "In Miramar, between the Turnpike and the western edge of the county, we collect at your home or office so lab work fits around your day instead of the other way round.",
    nearby: ["pembroke-pines", "hollywood", "hallandale-beach", "weston"],
  },
  {
    slug: "weston",
    name: "Weston",
    county: "Broward",
    intro:
      "Weston's quiet, gated neighbourhoods are a long way from most patient service centers. A nurse comes to you instead — including early-morning fasting draws before the day gets going.",
    nearby: ["davie", "pembroke-pines", "sunrise", "plantation"],
  },
  {
    slug: "davie",
    name: "Davie",
    county: "Broward",
    intro:
      "From the horse country west of University Drive to the college area around Nova Southeastern, we bring mobile lab collection to Davie homes and offices.",
    nearby: ["plantation", "weston", "fort-lauderdale", "hollywood", "pembroke-pines"],
  },
  {
    slug: "plantation",
    name: "Plantation",
    county: "Broward",
    intro:
      "In Plantation, between Broward Boulevard and Sunrise, we collect at home, at the office or in your assisted-living apartment — no waiting room, no parking lot.",
    nearby: ["sunrise", "davie", "fort-lauderdale", "lauderhill"],
  },
  {
    slug: "sunrise",
    name: "Sunrise",
    county: "Broward",
    intro:
      "Sunrise has some of Broward's largest 55+ communities. We come to residents there directly, so a lab order doesn't turn into an outing.",
    nearby: ["plantation", "tamarac", "lauderhill", "weston"],
  },
  {
    slug: "lauderhill",
    name: "Lauderhill",
    county: "Broward",
    intro:
      "In Lauderhill, north of Broward Boulevard and west of the Turnpike, we collect specimens at home and deliver them straight to an accredited reference laboratory.",
    nearby: ["plantation", "sunrise", "tamarac", "fort-lauderdale"],
  },
  {
    slug: "tamarac",
    name: "Tamarac",
    county: "Broward",
    intro:
      "Tamarac is one of Broward's most retirement-heavy cities, and it's exactly who mobile collection is for. We come to your condo or villa, and we're used to difficult draws.",
    nearby: ["sunrise", "lauderhill", "margate", "coral-springs"],
  },
  {
    slug: "coral-springs",
    name: "Coral Springs",
    county: "Broward",
    intro:
      "Coral Springs, up in northwest Broward, is a long way from a crowded lab. We bring blood draws and PCR collection to your home there instead.",
    nearby: ["parkland", "coconut-creek", "margate", "tamarac"],
  },
  {
    slug: "parkland",
    name: "Parkland",
    county: "Broward",
    intro:
      "In Parkland, at the northwest corner of the county, a nurse comes to your home — an easy alternative to driving south for routine lab work.",
    nearby: ["coral-springs", "coconut-creek", "boca-raton"],
  },
  {
    slug: "coconut-creek",
    name: "Coconut Creek",
    county: "Broward",
    intro:
      "Coconut Creek's 55+ and retirement communities are a big part of who we see in north Broward. We collect in your own home, with nothing to arrange but the time.",
    nearby: ["margate", "coral-springs", "parkland", "deerfield-beach", "pompano-beach"],
  },
  {
    slug: "margate",
    name: "Margate",
    county: "Broward",
    intro:
      "In Margate, between Coral Springs and Pompano Beach, we come to you for blood draws, cultures and PCR collection — at home or in your senior community.",
    nearby: ["coconut-creek", "tamarac", "coral-springs", "pompano-beach"],
  },
  {
    slug: "pompano-beach",
    name: "Pompano Beach",
    county: "Broward",
    intro:
      "From the oceanfront condos east of the Intracoastal to the neighbourhoods off Atlantic Boulevard, we bring the lab to Pompano Beach residents.",
    nearby: ["lighthouse-point", "deerfield-beach", "lauderdale-by-the-sea", "margate", "coconut-creek"],
  },
  {
    slug: "deerfield-beach",
    name: "Deerfield Beach",
    county: "Broward",
    intro:
      "Deerfield Beach sits on the Palm Beach County line, with some of South Florida's largest retirement communities. We come straight to you there.",
    nearby: ["pompano-beach", "boca-raton", "lighthouse-point", "coconut-creek"],
  },
  {
    slug: "lighthouse-point",
    name: "Lighthouse Point",
    county: "Broward",
    intro:
      "Lighthouse Point is small, residential and quiet — and the nearest lab isn't. We collect at your home instead.",
    nearby: ["pompano-beach", "deerfield-beach"],
  },
  {
    slug: "lauderdale-by-the-sea",
    name: "Lauderdale-by-the-Sea",
    county: "Broward",
    intro:
      "In Lauderdale-by-the-Sea, between Fort Lauderdale and Pompano on A1A, we come to your condo or cottage for your lab work.",
    nearby: ["fort-lauderdale", "pompano-beach", "oakland-park"],
  },
  {
    slug: "wilton-manors",
    name: "Wilton Manors",
    county: "Broward",
    intro:
      "Wilton Manors, just north of downtown Fort Lauderdale, is compact — but getting to a lab still means parking, waiting and driving back. We come to you instead.",
    nearby: ["fort-lauderdale", "oakland-park"],
  },
  {
    slug: "oakland-park",
    name: "Oakland Park",
    county: "Broward",
    intro:
      "In Oakland Park, between Fort Lauderdale and Pompano, we collect at home, at work or in your assisted-living community.",
    nearby: ["wilton-manors", "fort-lauderdale", "lauderdale-by-the-sea"],
  },

  // ---------------------------------------------------------- Miami-Dade
  {
    slug: "miami",
    name: "Miami",
    county: "Miami-Dade",
    intro:
      "From Brickell and downtown to Coconut Grove and Little Havana, getting across Miami for a blood draw can take longer than the draw. We come to your home, office or building instead.",
    nearby: ["coral-gables", "miami-beach", "key-biscayne", "doral", "north-miami-beach"],
  },
  {
    slug: "miami-beach",
    name: "Miami Beach",
    county: "Miami-Dade",
    intro:
      "From South Beach to North Beach, parking is the hardest part of any appointment on Miami Beach. We come up to your apartment, so you don't have to leave it.",
    nearby: ["miami", "bal-harbour", "sunny-isles-beach"],
  },
  {
    slug: "aventura",
    name: "Aventura",
    county: "Miami-Dade",
    intro:
      "Aventura's condo towers are home to many residents who would rather not drive to a lab. We collect in your own apartment, early enough for fasting draws.",
    nearby: ["sunny-isles-beach", "north-miami-beach", "hallandale-beach", "bal-harbour"],
  },
  {
    slug: "sunny-isles-beach",
    name: "Sunny Isles Beach",
    county: "Miami-Dade",
    intro:
      "On the Sunny Isles strip between the ocean and the Intracoastal, we come to your condo for blood draws and PCR collection.",
    nearby: ["aventura", "bal-harbour", "north-miami-beach", "hallandale-beach"],
  },
  {
    slug: "bal-harbour",
    name: "Bal Harbour",
    county: "Miami-Dade",
    intro:
      "In Bal Harbour and neighbouring Surfside, we bring concierge lab collection to your door, handled discreetly and on your schedule.",
    nearby: ["sunny-isles-beach", "miami-beach", "aventura"],
  },
  {
    slug: "north-miami-beach",
    name: "North Miami Beach",
    county: "Miami-Dade",
    intro:
      "In North Miami Beach, along the Biscayne corridor and west of it, we collect at home so lab work doesn't mean a trip down I-95.",
    nearby: ["aventura", "sunny-isles-beach", "miami"],
  },
  {
    slug: "coral-gables",
    name: "Coral Gables",
    county: "Miami-Dade",
    intro:
      "Coral Gables' tree-lined streets and historic homes are made for staying in. We come to you there, whether it's a routine panel or a PCR collection.",
    nearby: ["miami", "pinecrest", "kendall", "key-biscayne"],
  },
  {
    slug: "pinecrest",
    name: "Pinecrest",
    county: "Miami-Dade",
    intro:
      "In Pinecrest, just south of Coral Gables, a nurse comes to your home — no fighting US-1 traffic for a blood draw.",
    nearby: ["coral-gables", "kendall"],
  },
  {
    slug: "kendall",
    name: "Kendall",
    county: "Miami-Dade",
    intro:
      "Kendall covers a lot of ground west of US-1. Wherever you are in it, we come to your home or office for mobile lab collection.",
    nearby: ["pinecrest", "coral-gables", "doral"],
  },
  {
    slug: "doral",
    name: "Doral",
    county: "Miami-Dade",
    intro:
      "In Doral, west of the airport, we collect at home or at work — useful for busy professionals as much as for older adults.",
    nearby: ["miami", "kendall", "coral-gables"],
  },
  {
    slug: "key-biscayne",
    name: "Key Biscayne",
    county: "Miami-Dade",
    intro:
      "Key Biscayne is one causeway away from everything, and that causeway is the problem. We come across it so you don't have to.",
    nearby: ["miami", "coral-gables"],
  },

  // ----------------------------------------------------------- Palm Beach
  {
    slug: "boca-raton",
    name: "Boca Raton",
    county: "Palm Beach",
    intro:
      "From the beachside condos east of the Intracoastal to the gated communities out west, Boca Raton is where many of our clients live. We come to your home and handle the whole collection there.",
    nearby: ["highland-beach", "delray-beach", "deerfield-beach", "parkland"],
  },
  {
    slug: "highland-beach",
    name: "Highland Beach",
    county: "Palm Beach",
    intro:
      "Highland Beach is a thin strip of oceanfront condos between Boca and Delray. We come up to your unit for blood draws and PCR collection.",
    nearby: ["boca-raton", "delray-beach"],
  },
  {
    slug: "delray-beach",
    name: "Delray Beach",
    county: "Palm Beach",
    intro:
      "From Atlantic Avenue to the large 55+ communities west of I-95, we bring mobile lab services to Delray Beach homes.",
    nearby: ["boca-raton", "boynton-beach", "highland-beach"],
  },
  {
    slug: "boynton-beach",
    name: "Boynton Beach",
    county: "Palm Beach",
    intro:
      "Boynton Beach has many retirement communities out west along the Turnpike corridor. We come to you there for routine and specialty collections.",
    nearby: ["delray-beach", "lake-worth-beach", "wellington"],
  },
  {
    slug: "lake-worth-beach",
    name: "Lake Worth Beach",
    county: "Palm Beach",
    intro:
      "In Lake Worth Beach and the neighbourhoods around it, we collect at home and take the specimen straight to the laboratory.",
    nearby: ["boynton-beach", "west-palm-beach", "wellington"],
  },
  {
    slug: "wellington",
    name: "Wellington",
    county: "Palm Beach",
    intro:
      "Wellington, out west among the equestrian estates, is a long drive from most labs. A nurse comes to your home instead.",
    nearby: ["west-palm-beach", "lake-worth-beach", "boynton-beach"],
  },
  {
    slug: "west-palm-beach",
    name: "West Palm Beach",
    county: "Palm Beach",
    intro:
      "From downtown West Palm and the waterfront to the neighbourhoods off Okeechobee Boulevard, we come to your home or office for lab collection.",
    nearby: ["palm-beach", "lake-worth-beach", "wellington", "palm-beach-gardens"],
  },
  {
    slug: "palm-beach",
    name: "Palm Beach",
    county: "Palm Beach",
    intro:
      "On the island of Palm Beach, concierge lab collection is exactly what it sounds like: a registered nurse comes to your residence, on your time.",
    nearby: ["west-palm-beach", "palm-beach-gardens"],
  },
  {
    slug: "palm-beach-gardens",
    name: "Palm Beach Gardens",
    county: "Palm Beach",
    intro:
      "In Palm Beach Gardens and its golf communities, we collect at home so you can keep your tee time.",
    nearby: ["jupiter", "west-palm-beach", "palm-beach"],
  },
  {
    slug: "jupiter",
    name: "Jupiter",
    county: "Palm Beach",
    intro:
      "Jupiter is the northern edge of where we go, and we're glad to make the trip. Call to confirm scheduling and any travel fee for your address.",
    nearby: ["palm-beach-gardens"],
  },
];

export const getArea = (slug: string) => areas.find((a) => a.slug === slug) ?? null;

export const areasByCounty = () =>
  COUNTY_ORDER.map((county) => ({
    county,
    areas: areas.filter((a) => a.county === county).sort((a, b) => a.name.localeCompare(b.name)),
  }));
