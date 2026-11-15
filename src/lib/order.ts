// Shape of a `projects` collection entry, as far as ordering needs it.
interface Entry {
  id: string;
  data: { order: number; featured: boolean };
}

/** Sorts projects by `order`. Throws unless exactly one is featured and no two share an order. */
export function sortProjects<T extends Entry>(entries: T[]): T[] {
  const sorted = [...entries].sort((a, b) => a.data.order - b.data.order);
  const featured = sorted.filter((e) => e.data.featured).map((e) => e.id);
  if (featured.length !== 1) {
    throw new Error(`Exactly one project must be featured; found ${featured.length} (${featured.join(', ') || 'none'})`);
  }
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].data.order === sorted[i - 1].data.order) {
      throw new Error(`${sorted[i - 1].id} and ${sorted[i].id} share order ${sorted[i].data.order}`);
    }
  }
  return sorted;
}

/** Previous and next project in `order`, wrapping at both ends. */
export function neighbours<T extends Entry>(sorted: T[], id: string): { prev: T; next: T } {
  const i = sorted.findIndex((e) => e.id === id);
  if (i === -1) throw new Error(`Unknown project: ${id}`);
  const n = sorted.length;
  return { prev: sorted[(i - 1 + n) % n], next: sorted[(i + 1) % n] };
}
