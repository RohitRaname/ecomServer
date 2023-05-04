const mongoose = require('mongoose');

exports.add$toQuery = (query) => {
  let add$ToQueryObj = JSON.stringify(query);
  add$ToQueryObj = add$ToQueryObj.replace(
    // (/\bsmall\b/g, "test"
    /\b(gte|gt|lt|lte)\b/g,
    (match) => `$${match}`
  );

  return add$ToQueryObj;
};

const formatQuery = (query) => {
  let match, sort, project, unset, limit, skip;
  const queryObj = { ...query };

  if (Object.keys(queryObj).length === 0) return this;

  const nonFilter = ['page', 'limit', 'sort', 'fields', 'exclude'];

  nonFilter.forEach((el) => delete queryObj[el]);
  if (queryObj.q) delete queryObj.q;

  let add$ToQueryObj = queryObj;

  // match query
  add$ToQueryObj = JSON.stringify(queryObj);
  add$ToQueryObj = add$ToQueryObj.replace(
    // (/\bsmall\b/g, "test"
    /\b(gte|gt|lt|lte)\b/g,
    (match) => `$${match}`
  );
  match = JSON.parse(add$ToQueryObj);

  console.log('match', match);

  Object.keys(match).forEach((key) => {
    if (Number(match[key])) match[key] = Number(match[key]);
    else if (Object.keys(match[key]).length > 0) {
      const nestedObj = match[key];

      Object.keys(nestedObj).forEach((nestedKey) => {
        if (
          Number(nestedObj[nestedKey]) ||
          Number(nestedObj[nestedKey]) === 0
        ) {
          match[key][nestedKey] = Number(nestedObj[nestedKey]);
        }
      });
    }
  });
  Object.keys(match).forEach((key) => {
    const keys = Object.keys(match[key]);
    if (key === 'ts' && keys.length === 0) {
      match[key] = new Date(match[key]).toISOString();
    }

    (key.includes('ts') || key === 'ts') &&
      keys.length > 0 &&
      keys.forEach((nestedKey) => {
        match[key][nestedKey] = new Date(match[key][nestedKey]);
      });
  });

  // if (match.page) match.page = Number(match.page);

  // converting id into mongodb id
  Object.keys(match).forEach((key) => {
    if (key.toLowerCase().includes('id'))
      match[key] = new mongoose.Types.ObjectId(match[key]);
  });

  if (query.sort) {
    const sortStr = query.sort.split(',');
    sort = {};
    sortStr.forEach((el) => {
      sort[el.includes('-') ? el.slice(1) : el] = el.includes('-') ? -1 : 1;
    });
  }

  if (query.limit) {
    limit = Number(query.limit);
  }
  if (query.page) skip = Number(query.limit) * Number(query.page);

  if (query.fields) {
    const fieldStr = query.fields.split(',');
    project = {};
    fieldStr.forEach((el) => {
      project[el] = 1;
    });
  }

  if (query.exclude) {
    unset = query.exclude.split(',');
  }

  return { match, sort, skip, limit, project, unset };
};

// this function convert query into mongodb query
exports.formatQueryIntoMongodbFormat = (query) => formatQuery(query);

exports.formatQueryIntoPipeline = (
  query,
  optionalPipeline,
  ignoreQueryOperator
) => {
  const { match, sort, project, unset, limit, skip } = formatQuery(query);

  let formatPipeline = [
    match && Object.keys(match).length > 0 ? { $match: match } : null,
    sort ||
    (ignoreQueryOperator &&
      !ignoreQueryOperator.find((operator) => operator === 'sort'))
      ? { $sort: sort }
      : null,
    skip ||
    (ignoreQueryOperator &&
      !ignoreQueryOperator.find((operator) => operator === 'skip'))
      ? { $skip: skip }
      : null,
    limit ||
    (ignoreQueryOperator &&
      !ignoreQueryOperator.find((operator) => operator === 'limit'))
      ? { $limit: limit }
      : null,
    unset ? { $unset: unset } : null,
    project ? { $project: project } : null,
  ];

  // removing null values
  formatPipeline = formatPipeline.filter((el) => el);

  if (!optionalPipeline) return formatPipeline;

  formatPipeline.forEach((el) => optionalPipeline.push(el));
  return optionalPipeline;
};
