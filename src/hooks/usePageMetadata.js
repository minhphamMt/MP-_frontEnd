import { useEffect } from "react";

const DEFAULT_TITLE = "Khoaluan Music";
const DEFAULT_DESCRIPTION =
  "Nghe nhac, kham pha bai hat, album, playlist va nghe si tren Khoaluan Music.";
const DEFAULT_TYPE = "website";

const META_TAGS = [
  { attr: "name", key: "description" },
  { attr: "property", key: "og:title" },
  { attr: "property", key: "og:description" },
  { attr: "property", key: "og:image" },
  { attr: "property", key: "og:url" },
  { attr: "property", key: "og:type" },
  { attr: "property", key: "og:site_name" },
  { attr: "name", key: "twitter:card" },
  { attr: "name", key: "twitter:title" },
  { attr: "name", key: "twitter:description" },
  { attr: "name", key: "twitter:image" },
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
  url,
  type = DEFAULT_TYPE,
} = {}) {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const resolvedTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    const resolvedDescription = description || DEFAULT_DESCRIPTION;
    const resolvedImage = toAbsoluteUrl(image || "");
    const resolvedUrl =
      toAbsoluteUrl(url || (typeof window !== "undefined" ? window.location.href : ""));
    const twitterCard = resolvedImage ? "summary_large_image" : "summary";

    const previousTitle = document.title;
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

    const metaValueMap = {
      description: resolvedDescription,
      "og:title": resolvedTitle,
      "og:description": resolvedDescription,
      "og:image": resolvedImage,
      "og:url": resolvedUrl,
      "og:type": type || DEFAULT_TYPE,
      "og:site_name": DEFAULT_TITLE,
      "twitter:card": twitterCard,
      "twitter:title": resolvedTitle,
      "twitter:description": resolvedDescription,
      "twitter:image": resolvedImage,
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

    return () => {
      document.title = previousTitle;

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
    };
  }, [description, image, title, type, url]);
}
