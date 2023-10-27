export default function paginatedResponse({
  queryKey,
  queryResult,
  totalCount,
  page,
  limit,
}) {
  return {
    status: true,
    data: {
      [queryKey]: queryResult,
      page: Number(page),
      limit: limit,
      totalPageCount: Math.ceil(totalCount / limit),
      totalCount: totalCount,
    },
  };
}
