/**
 * Query & Pagination Helper Utilities for WPVCP Backend
 * Standardizes pagination, multi-column search, and safe sorting across all controllers.
 */

function parsePagination(query = {}, defaultLimit = 10, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10);
  const limit = Math.min(maxLimit, Math.max(1, requestedLimit || defaultLimit));
  const offset = (page - 1) * limit;

  // Check if pagination was explicitly requested or default
  const isExplicit = query.page !== undefined || query.limit !== undefined;

  return { page, limit, offset, isExplicit };
}

function buildPaginationResponse(data = [], totalCount = 0, page = 1, limit = 10) {
  const totalItems = Math.max(0, parseInt(totalCount, 10) || 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    success: true,
    count: data.length,
    total: totalItems,
    pagination: {
      page,
      limit,
      total: totalItems,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    data
  };
}

function buildOrderBy(sortBy, allowedSortMap = {}, defaultSort = 'id DESC') {
  if (sortBy && allowedSortMap[sortBy]) {
    return ` ORDER BY ${allowedSortMap[sortBy]}`;
  }
  return ` ORDER BY ${defaultSort}`;
}

function buildSearchClause(searchQuery, searchColumns = []) {
  if (!searchQuery || typeof searchQuery !== 'string' || !searchQuery.trim() || searchColumns.length === 0) {
    return { clause: '', params: [] };
  }

  const term = `%${searchQuery.trim()}%`;
  const conditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
  const clause = ` AND (${conditions})`;
  const params = searchColumns.map(() => term);

  return { clause, params };
}

module.exports = {
  parsePagination,
  buildPaginationResponse,
  buildOrderBy,
  buildSearchClause
};
