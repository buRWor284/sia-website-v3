import { getEpisodeBySlug } from "@/lib/podcast";

// PodcastEpisode + breadcrumb structured data per episode. Lives in the layout
// (which receives the route params) so the large page.tsx stays untouched.
const SITE = "https://www.syedirfanajmal.com";

export default async function PodcastEpisodeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ep = getEpisodeBySlug(slug);
  if (!ep) return <>{children}</>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PodcastEpisode",
        name: ep.title,
        url: `${SITE}/podcast/${slug}`,
        ...(ep.summary ? { description: ep.summary } : {}),
        ...(ep.publication_date ? { datePublished: ep.publication_date } : {}),
        ...(ep.featured_image_url ? { image: ep.featured_image_url } : {}),
        partOfSeries: {
          "@type": "PodcastSeries",
          name: "The SIA Business Podcast",
          url: `${SITE}/podcast`,
        },
        author: { "@type": "Person", name: "Syed Irfan Ajmal", url: SITE },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Podcast", item: `${SITE}/podcast` },
          { "@type": "ListItem", position: 3, name: ep.title, item: `${SITE}/podcast/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
