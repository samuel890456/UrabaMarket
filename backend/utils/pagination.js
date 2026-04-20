const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(query) {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  let limit = parseInt(String(query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  limit = Math.min(Math.max(1, limit), MAX_LIMIT);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function paginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0
  };
}
