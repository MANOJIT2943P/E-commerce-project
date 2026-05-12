/**
 * Search merges DB hits with the Python recommender. Recommender _id values
 * often do not match MongoDB catalog ids after re-seeds. Resolve each
 * recommendation row to a catalog product when id or name matches dbList.
 */

const normName = (name) => (name || '').trim().toLowerCase();

export function mapRecommendRecordToProduct(rec, apiHost) {
  const host = (apiHost || '').replace(/\/$/, '');
  const mongoId = rec._id != null ? String(rec._id) : rec.id != null ? String(rec.id) : '';
  const uid = rec.uid != null ? String(rec.uid) : '';
  const price = typeof rec.price === 'number' ? rec.price : rec.original_price;
  const stock = typeof rec.stock === 'number' ? rec.stock : undefined;
  return {
    id: mongoId,
    name: rec.name,
    price,
    originalPrice: typeof rec.original_price === 'number' ? rec.original_price : price,
    rating: rec.rating,
    reviewCount: 0,
    inStock: typeof stock === 'number' ? stock > 0 : true,
    description: rec.description || '',
    category: rec.category || '',
    brand: rec.brand || '',
    images: [`${host}/images/${encodeURIComponent(uid || mongoId)}.jpg`],
  };
}

function resolveRecWithDb(rec, dbList) {
  const idStr = String(rec.id || '');
  if (idStr) {
    const byId = dbList.find((d) => String(d.id) === idStr);
    if (byId) return { ...byId };
  }
  const byName = dbList.find((d) => normName(d.name) === normName(rec.name));
  if (byName) return { ...byName };
  return rec;
}

/**
 * @param {Array} dbList - productService.searchProducts (mapped catalog products)
 * @param {Array} recResults - recommendService.getRecommendations raw rows
 * @param {string} apiHost - origin without trailing slash (e.g. http://localhost:5000)
 */
export function mergeSearchAndRecommendations(dbList, recResults, apiHost) {
  const db = Array.isArray(dbList) ? dbList : [];
  const recs = Array.isArray(recResults) ? recResults : [];
  const mappedRecs = recs.map((rec) => mapRecommendRecordToProduct(rec, apiHost));

  const seen = new Set();
  const combined = [];

  for (const p of mappedRecs) {
    const resolved = resolveRecWithDb(p, db);
    const key = String(resolved.id || '');
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(resolved);
    }
  }

  for (const p of db) {
    const key = String(p.id || '');
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(p);
    }
  }

  return combined;
}
