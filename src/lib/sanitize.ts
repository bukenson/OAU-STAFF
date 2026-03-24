import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "b", "i", "ul", "ol", "li", "a", "span"];
const ALLOWED_ATTR = ["href", "target", "rel", "class"];

export function sanitizeHTML(html: string): string {
  if (typeof window === "undefined") return html;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  });
}

export function sanitizeText(text: string): string {
  if (typeof window === "undefined") return text;
  
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  if (!isValidUrl(url)) return "";
  return url;
}
