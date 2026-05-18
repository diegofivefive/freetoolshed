const SITE_NAME = "Free Tool Shed";
const SITE_URL = "https://freetoolshed.com";
const AUTHOR_NAME = "James Nicolaus";
const AUTHOR_ID = `${SITE_URL}/about#james-nicolaus`;
const ORG_ID = `${SITE_URL}#organization`;
const WEBSITE_ID = `${SITE_URL}#website`;

export const author = {
  name: AUTHOR_NAME,
  id: AUTHOR_ID,
  role: "Founder & Maintainer",
};

export const organization = {
  name: SITE_NAME,
  id: ORG_ID,
  url: SITE_URL,
};

export function generatePersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": AUTHOR_ID,
    name: AUTHOR_NAME,
    url: `${SITE_URL}/about`,
    jobTitle: "Founder & Maintainer",
    worksFor: { "@id": ORG_ID },
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    founder: { "@id": AUTHOR_ID },
    description:
      "Free browser-based tools that replace paid software. Ad-supported, no sign-up required.",
  };
}

export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": ORG_ID },
  };
}
