import { PersonRole } from "../types";

export const ROLE_LABELS: Record<PersonRole, string> = {
  khadem: "خادم",
  khadema: "خادمة",
  makhdoom: "مخدوم",
  makhdooma: "مخدومة"
};

export const ROLE_OPTIONS: { value: PersonRole; label: string }[] = [
  { value: "makhdoom", label: "مخدوم (ولد)" },
  { value: "makhdooma", label: "مخدومة (بنت)" },
  { value: "khadem", label: "خادم" },
  { value: "khadema", label: "خادمة" }
];

export function isServantRole(role?: PersonRole | string): boolean {
  return role === "khadem" || role === "khadema";
}

export function isMaleRole(role?: PersonRole | string): boolean {
  return role === "khadem" || role === "makhdoom";
}

export function roleLabel(role?: PersonRole | string): string {
  if (!role) return "";
  return ROLE_LABELS[role as PersonRole] || String(role);
}
