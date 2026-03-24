import type { Metadata } from "next";

const SITE_NAME = "Free Tool Shed";
const SITE_URL = "https://freetoolshed.com";

export function generateToolMetadata({
  name,
  description,
  slug,
  paidAlternative,
}: {
  name: string;
  description: string;
  slug: string;
  paidAlternative?: string;
}): Metadata {
  const title = `Free ${name} Online — No Sign Up | ${SITE_NAME}`;
  const metaDescription = paidAlternative
    ? `${description} A free alternative to ${paidAlternative}. No sign up required.`
    : `${description} No sign up required.`;

  return {
    title,
    description: metaDescription,
    openGraph: {
      title,
      description: metaDescription,
      url: `${SITE_URL}/tools/${slug}`,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
    },
    alternates: {
      canonical: `${SITE_URL}/tools/${slug}`,
    },
  };
}

export function generateToolJsonLd({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Free ${name}`,
    description,
    url: `${SITE_URL}/tools/${slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function generatePageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      type: "website",
    },
    alternates: {
      canonical: `${SITE_URL}${path}`,
    },
  };
}
