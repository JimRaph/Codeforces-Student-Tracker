
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

//  Parses pagination parameters from the request query.
//  Ensures the page number is at least 1 and page size is
//   between 1 and MAX_PAGE_SIZE.

function parsePaginationParams(req) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  return { page, pageSize };
}

function parseStudentFilter(req) {
  const filter = {};
  if (req.query.filter) {
    const regex = new RegExp(req.query.filter, 'i');
    filter.$or = [
      { name: regex },
      { email: regex },
      { codeforces_handle: regex }
    ];
  }
  return filter;
}

// module.exports = { parsePaginationParams, parseStudentFilter };
export { parsePaginationParams, parseStudentFilter }