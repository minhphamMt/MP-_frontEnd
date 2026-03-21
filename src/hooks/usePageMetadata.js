import { useEffect, useId } from "react";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_OG_LOCALE,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE,
  SITE_NAME,
} from "../utils/seo";

const DEFAULT_TITLE = SITE_NAME;
const DEFAULT_DESCRIPTION = DEFAULT_SITE_DESCRIPTION;
const DEFAULT_IMAGE = DEFAULT_SOCIAL_IMAGE;
const DEFAULT_TYPE = "website";
const DEFAULT_ROBOTS = "index, follow";

const META_TAGS = [
  { attr: "name", key: "description" },
  { attr: "name", key: "robots" },
  { attr: "name", key: "googlebot" },
  { attr: "name", key: "keywords" },
  { attr: "property", key: "og:title" },
  { attr: "property", key: "og:description" },
  { attr: "property", key: "og:image" },
  { attr: "property", key: "og:url" },
  { attr: "property", key: "og:type" },
  { attr: "property", key: "og:site_name" },
  { attr: "property", key: "og:locale" },
  { attr: "name", key: "twitter:card" },
  { attr: "name", key: "twitter:title" },
  { attr: "name", key: "twitter:description" },
  { attr: "name", key: "twitter:image" },
  { attr: "name", key: "twitter:image:alt" },
];

const toAbsoluteUrl = (value = "") => {
  if (!value || typeof window === "undefined") return value || "";
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value, window.location.origin).toString();
};

const ensureMetaTag = (attr, key) => {
  const selector = `meta[${attr}="${key}"]`;
  let element = document.head.querySelector(selector);
  let created = false;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
    created = true;
  }

  return { element, created };
};

const ensureCanonicalLink = () => {
  let element = document.head.querySelector('link[rel="canonical"]');
  let created = false;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
    created = true;
  }

  return { element, created };
};

export default function usePageMetadata({
  title,
  description,
  image,
  imageAlt,
  keywords,
  robots = DEFAULT_ROBOTS,
  url,
  type = DEFAULT_TYPE,
  locale = DEFAULT_OG_LOCALE,
  language = DEFAULT_LANGUAGE,
  jsonLd,
} = {}) {
  const jsonLdOwnerId = useId();

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const resolvedTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    const resolvedDescription = description || DEFAULT_DESCRIPTION;
    const resolvedImage = toAbsoluteUrl(image || DEFAULT_IMAGE);
    const resolvedUrl =
      toAbsoluteUrl(url || (typeof window !== "undefined" ? window.location.href : ""));
    const twitterCard = resolvedImage ? "summary_large_image" : "summary";
    const resolvedKeywords = Array.isArray(keywords)
      ? keywords.filter(Boolean).join(", ")
      : keywords || "";
    const normalizedJsonLd = Array.isArray(jsonLd)
      ? jsonLd.filter(Boolean)
      : jsonLd
        ? [jsonLd]
        : [];

    const previousTitle = document.title;
    const previousLanguage = document.documentElement.getAttribute("lang");
    const previousMeta = META_TAGS.map(({ attr, key }) => {
      const { element, created } = ensureMetaTag(attr, key);
      return {
        attr,
        key,
        element,
        created,
        previousContent: element.getAttribute("content"),
      };
    });
    const { element: canonicalLink, created: canonicalCreated } = ensureCanonicalLink();
    const previousCanonical = canonicalLink.getAttribute("href");

    document.title = resolvedTitle;
    if (language) {
      document.documentElement.setAttribute("lang", language);
    }

    const metaValueMap = {
      description: resolvedDescription,
      robots: robots || DEFAULT_ROBOTS,
      googlebot: robots || DEFAULT_ROBOTS,
      keywords: resolvedKeywords,
      "og:title": resolvedTitle,
      "og:description": resolvedDescription,
      "og:image": resolvedImage,
      "og:url": resolvedUrl,
      "og:type": type || DEFAULT_TYPE,
      "og:site_name": DEFAULT_TITLE,
      "og:locale": locale || DEFAULT_OG_LOCALE,
      "twitter:card": twitterCard,
      "twitter:title": resolvedTitle,
      "twitter:description": resolvedDescription,
      "twitter:image": resolvedImage,
      "twitter:image:alt": imageAlt || resolvedTitle,
    };

    previousMeta.forEach(({ element, key }) => {
      const nextValue = metaValueMap[key] || "";
      if (nextValue) {
        element.setAttribute("content", nextValue);
      } else {
        element.removeAttribute("content");
      }
    });

    if (resolvedUrl) {
      canonicalLink.setAttribute("href", resolvedUrl);
    } else {
      canonicalLink.removeAttribute("href");
    }

    const createdScripts = normalizedJsonLd.map((entry, index) => {
      const script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-seo-owner", jsonLdOwnerId);
      script.setAttribute("data-seo-index", `${index}`);
      script.textContent = JSON.stringify(entry);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      document.title = previousTitle;
      if (previousLanguage) {
        document.documentElement.setAttribute("lang", previousLanguage);
      } else {
        document.documentElement.removeAttribute("lang");
      }

      previousMeta.forEach(({ element, created, previousContent }) => {
        if (created) {
          element.remove();
          return;
        }

        if (previousContent === null || previousContent === undefined) {
          element.removeAttribute("content");
          return;
        }

        element.setAttribute("content", previousContent);
      });

      if (canonicalCreated) {
        canonicalLink.remove();
      } else if (previousCanonical) {
        canonicalLink.setAttribute("href", previousCanonical);
      } else {
        canonicalLink.removeAttribute("href");
      }

      createdScripts.forEach((script) => script.remove());
    };
  }, [
    description,
    image,
    imageAlt,
    jsonLd,
    keywords,
    language,
    locale,
    robots,
    title,
    type,
    url,
  ]);
}
