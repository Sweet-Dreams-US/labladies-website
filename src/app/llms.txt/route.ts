import { areasByCounty } from "@/lib/areas";
import { sortedPosts } from "@/lib/blog";
import { getSiteSettings } from "@/lib/settings";
import { appointmentWindows, nav, services, site, whoWeServe } from "@/lib/site";

/**
 * /llms.txt — a plain summary of the business for AI assistants.
 *
 * On the 14 Sep call the promise was that "the AIs" would be able to read
 * the site well. They can parse the HTML, but a short, factual document at a
 * known address is the difference between an assistant answering "who does
 * mobile blood draws in Boca?" with Lab Ladies' real details and guessing.
 *
 * Built from the same data as the pages, so it can't drift from them. Same
 * content rules as everywhere: say what the business does, never what it
 * doesn't; nothing about what a result means.
 */
// Cached like the pages, and expired by the same tag when Michelle saves her
// Google links, so this file never disagrees with the site.
export const revalidate = 3600;

export async function GET() {
  const settings = await getSiteSettings();
  const pageLine = (href: string, label: string) =>
    `- [${label}](${site.url}${href === "/" ? "" : href})`;

  const body = `# ${site.name}

> Nurse-owned concierge mobile laboratory service across ${site.areaLong}, South Florida — Fort Lauderdale, Miami, Boca Raton and the towns around them. A registered nurse comes to the patient — at home, in a medical office, or in a senior living community — to collect blood and other specimens, then transports them to an accredited reference laboratory.

## Contact

- Phone / text: ${site.phone}
- Fax: ${site.fax}
- Email: ${site.email}
- Service area: ${site.areas.join(", ")}. ${site.travelNote}
- Website: ${site.url}
${settings.google_business_url ? `- Google Business Profile: ${settings.google_business_url}\n` : ""}${settings.google_review_url ? `- Leave a Google review: ${settings.google_review_url}\n` : ""}
The fastest way to book is a phone call or text.

## Services

${services.map((s) => `- **${s.title}** — ${s.summary}`).join("\n")}
- **Medical courier** — contracted specimen pickups and transport to reference laboratories.

## Appointments

${appointmentWindows.map((w) => `- ${w}`).join("\n")}

Early morning fasting appointments are standard. Evenings and weekends are available when scheduling allows.

## Who it serves

${whoWeServe.map((w) => `- ${w}`).join("\n")}
- Senior living and rehab communities, concierge medical practices, colleges and universities, med spas and gyms

## Towns served

${areasByCounty()
  .map(
    ({ county, areas }) =>
      `### ${county} County\n\n${areas.map((a) => `- [${a.name}](${site.url}/areas/${a.slug})`).join("\n")}`,
  )
  .join("\n\n")}

Not an exhaustive list — call to check an address that isn't here.

## Payment

- Many tests are available self-pay, which means no physician order is needed.
- Lab Ladies does not bill insurance. The mobile collection fee is paid directly to Lab Ladies; the laboratory that performs the testing bills separately.
- Accepted: cash, check, credit card.

## Pages

${nav.map((n) => pageLine(n.href, n.label)).join("\n")}
${pageLine("/areas", "Service Areas")}
${pageLine("/privacy", "Privacy Policy")}

## Articles

${sortedPosts.map((p) => `- [${p.title}](${site.url}/blog/${p.slug}): ${p.description}`).join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
