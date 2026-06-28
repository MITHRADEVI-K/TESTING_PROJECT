export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getStarRating(score) {
  const stars = Math.max(1, Math.min(5, Math.round(score / 20)));
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}
