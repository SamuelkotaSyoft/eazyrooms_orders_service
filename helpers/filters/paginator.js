export default function paginatior(requestData) {
  let pageData = { page: null, limit: null, skip: 0 };
  if (requestData.page && requestData.limit) {
    pageData.page = parseInt(requestData.page);
    pageData.limit = parseInt(requestData.limit);
    pageData.skip = (pageData.page - 1) * pageData.limit;
  }
  return pageData;
}
