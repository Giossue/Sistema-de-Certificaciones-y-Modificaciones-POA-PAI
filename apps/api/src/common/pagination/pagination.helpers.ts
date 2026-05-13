type PaginationParams = {
  pageQuery?: string;
  pageSizeQuery?: string;
  maxPageSize?: number;
};

export function parsePagination(params: PaginationParams) {
  const page = Math.max(1, Number(params.pageQuery || 1));
  const pageSize = Math.min(params.maxPageSize ?? 200, Math.max(1, Number(params.pageSizeQuery || 10)));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function totalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
