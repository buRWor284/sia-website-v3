// Page-level JSON-LD for pages that have no bespoke schema of their own.
//
// The site-wide entity graph (Person, Organization, WebSite) lives in
// app/layout.tsx. This helper adds the per-page layer on top of it: one
// WebPage-type node plus a BreadcrumbList, both pointing back at the
// site-wide @ids so Google sees one connected graph rather than islands.
//
// Rule: name and description passed in here must match what the page shows
// (pass the page's own metadata values, do not retype them).

const ORIGIN = "https://www.syedirfanajmal.com";
const PERSON_ID = `${ORIGIN}/#person`;
const WEBSITE_ID = `${ORIGIN}/#website`;

export type Crumb = { name: string; path: string };

export type PageSchemaInput = {
  /** schema.org type of the page node, e.g. "WebPage", "ProfilePage", "CollectionPage", "ContactPage". */
  type?: string;
  /** Site-relative path, e.g. "/about". */
  path: string;
  name: string;
  description?: string;
  /** Trail AFTER Home, ending with this page. */
  crumbs: Crumb[];
  /** Extra properties merged into the page node (e.g. mainEntity). */
  page?: Record<string, unknown>;
  /** Extra nodes appended to the graph (e.g. a Service or ItemList). */
  extra?: Record<string, unknown>[];
};

export const personRef = { "@id": PERSON_ID };

export function buildPageSchema(input: PageSchemaInput) {
  const url = `${ORIGIN}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": input.type ?? "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: input.name,
        ...(input.description ? { description: input.description } : {}),
        isPartOf: { "@id": WEBSITE_ID },
        about: personRef,
        breadcrumb: { "@id": `${url}#breadcrumb` },
        ...(input.page ?? {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN },
          ...input.crumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 2,
            name: c.name,
            item: `${ORIGIN}${c.path}`,
          })),
        ],
      },
      ...(input.extra ?? []),
    ],
  };
}

/** Renders the schema as a server-rendered script tag. Safe in client components too. */
export function PageSchema(props: PageSchemaInput) {
  const json = JSON.stringify(buildPageSchema(props)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
