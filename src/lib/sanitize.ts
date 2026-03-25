import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "b", "i", "ul", "ol", "li", "a", "span"];
const ALLOWED_ATTR = ["href", "target", "rel", "class"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OAU_EMAIL_REGEX = /^[^\s@]+@oauife\.edu\.ng$/i;

export function sanitizeHTML(html: string): string {
  if (typeof window === "undefined") return "";

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  });

  const container = document.createElement("div");
  container.innerHTML = sanitized;

  container.querySelectorAll("a").forEach((anchor) => {
    const href = sanitizeUrl(anchor.getAttribute("href") ?? "");

    if (!href) {
      anchor.removeAttribute("href");
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
      return;
    }

    anchor.setAttribute("href", href);
    anchor.setAttribute("rel", "noopener noreferrer nofollow");
    anchor.setAttribute("target", "_blank");
  });

  return container.innerHTML;
}

export function sanitizeText(text: string): string {
  if (typeof window === "undefined") return text.trim();

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
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
  const trimmed = url.trim();
  if (!isValidUrl(trimmed)) return "";
  return trimmed;
}

export function sanitizeImageUrl(url: string): string {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return "";

  try {
    const parsed = new URL(sanitized);
    if (parsed.pathname.toLowerCase().endsWith(".svg")) {
      return "";
    }
  } catch {
    return "";
  }

  return sanitized;
}

export function sanitizeEmailAddress(email: string): string {
  const normalized = sanitizeText(email).toLowerCase();
  return EMAIL_REGEX.test(normalized) ? normalized : "";
}

export function sanitizeOauEmailAddress(email: string): string {
  const normalized = sanitizeEmailAddress(email);
  return OAU_EMAIL_REGEX.test(normalized) ? normalized : "";
}
