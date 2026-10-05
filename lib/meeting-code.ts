const CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export const createMeetingCode = () => {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
  return `${code.slice(0, 3)}-${code.slice(3, 7)}-${code.slice(7)}`;
};

export const getMeetingIdFromInput = (input: string) => {
  const value = input.trim();
  if (!value) return null;

  let candidate = value;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const match = url.pathname.match(/^\/meeting\/([^/]+)\/?$/i);
      if (!match) return null;
      candidate = decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  } else if (value.includes("/")) {
    const match = value.match(/^\/?meeting\/([^/?#]+)\/?$/i);
    if (!match) return null;
    try {
      candidate = decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }

  const normalized = candidate.replace(/\s+/g, "").toLowerCase();
  if (!/^[a-z0-9_-]{1,64}$/.test(normalized)) return null;
  return normalized;
};
