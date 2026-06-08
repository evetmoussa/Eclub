// image-fallback.ts — shared image helpers for admin pages.
//
// The backend stores image paths that may be:
//   • a full URL        e.g. https://images.unsplash.com/...   → used as-is
//   • a local path      e.g. /images/padel_academy.webp        → used if the file
//     exists under public/, otherwise it 404s and we fall back to a default.
//
// These helpers guarantee a card/avatar is never blank or broken.

/** Generic neutral cover used when an offer/academy image is missing. */
export const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600';

/** Neutral avatar used when a trainer/member photo is missing. */
export const DEFAULT_AVATAR =
  'https://i.pravatar.cc/200?img=68';

/**
 * Build a CSS background-image value with a default layered underneath.
 * CSS paints layers front-to-back, so the real image shows on top and the
 * default shows through if the real one 404s. Empty value → default only.
 */
export function coverBackground(raw: string | null | undefined, fallbackUrl = DEFAULT_COVER): string {
  const fallback = `url('${fallbackUrl}')`;
  const url = (raw ?? '').trim();
  return url ? `url('${url}'), ${fallback}` : fallback;
}

/**
 * (error) handler for <img>. On a load failure, swap the src to the default
 * once (guarded so a broken default can't loop).
 */
export function onImgError(evt: Event, fallbackUrl = DEFAULT_AVATAR): void {
  const img = evt.target as HTMLImageElement;
  if (img.dataset['fallbackApplied']) return;
  img.dataset['fallbackApplied'] = '1';
  img.src = fallbackUrl;
}
