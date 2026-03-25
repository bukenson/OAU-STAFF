type StaffIdentity = {
  id?: string | null;
  name?: string | null;
};

function slugifyPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getNameParts(fullName?: string | null) {
  const normalized = (fullName ?? "").trim().replace(/\s+/g, " ");

  if (!normalized) {
    return {
      surname: "staff",
      firstName: "profile",
      middleName: "profile",
    };
  }

  if (normalized.includes(",")) {
    const [rawSurname, remainder = ""] = normalized.split(",", 2);
    const tokens = remainder.trim().split(/\s+/).filter(Boolean);

    return {
      surname: slugifyPart(rawSurname) || "staff",
      firstName: slugifyPart(tokens[0] ?? "profile") || "profile",
      middleName: slugifyPart(tokens[1] ?? "profile") || "profile",
    };
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);

  return {
    surname: slugifyPart(tokens[0] ?? "staff") || "staff",
    firstName: slugifyPart(tokens[1] ?? tokens[0] ?? "profile") || "profile",
    middleName: slugifyPart(tokens[2] ?? "profile") || "profile",
  };
}

export function getStaffProfileSlug(fullName?: string | null): string {
  const { surname, firstName, middleName } = getNameParts(fullName);
  return `${surname}/${firstName}/${middleName}`;
}

export function getStaffProfilePath(staff: StaffIdentity): string {
  if (!staff.id) return "/staff";

  return `/staff/${getStaffProfileSlug(staff.name)}`;
}

export function getStaffIdFromProfileSlug(slug?: string): string | null {
  if (!slug) return null;

  if (UUID_REGEX.test(slug)) return slug;

  const separatorIndex = slug.lastIndexOf("--");
  if (separatorIndex === -1) return null;

  const idPart = slug.slice(separatorIndex + 2);
  return UUID_REGEX.test(idPart) ? idPart : null;
}
