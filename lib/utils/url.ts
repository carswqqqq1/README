export function normalizeWebsiteUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProto).toString();
}
