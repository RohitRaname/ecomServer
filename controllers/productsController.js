/* eslint-disable camelcase */
const mongoose = require("mongoose");
const Product = require("../models/Product");
const catchAsync = require("../utils/catchAsync");
const tryCatch = require("../utils/tryCatch");
const send = require("../utils/sendJSON");
const Factory = require("./handleFactoryController");

const { formatQueryIntoPipeline } = require("../utils/mongodbQueryConverter");
const AppError = require("../utils/AppError");

const searchQuery = (title, returnStoredSource) => ({
  $search: {
    compound: {
      should: [
        {
          autocomplete: {
            path: "title",
            query: title,
            fuzzy: {
              prefixLength: 1,
            },
          },
        },
        {
          text: {
            path: "title",
            query: title,
            score: { boost: { value: 2 } },
          },
        },
      ],
      minimumShouldMatch: 1,
    },

    highlight: { path: "title" },
    returnStoredSource,
  },
});

// agg pipeline for search
exports.searchProductAggPipeline = (
  productTitle,
  page,
  limit,
  returnStoredSource
) => {
  let pipeline = [
    searchQuery(productTitle, returnStoredSource),

    { $skip: Number(page) * Number(limit) },

    limit ? { $limit: Number(limit) } : null,

    { $set: { highlights: { $meta: "searchHighlights" } } },

    {
      $set: {
        highlights: { $first: "$highlights.texts" },
      },
    },
  ];

  return pipeline.filter((el) => el);
};

exports.searchProducts = catchAsync(async (req, res) => {
  let products = await Product.aggregate(
    this.searchProductAggPipeline(req.query.q, 0, 10, true)
  );
  products = products.map((product) => ({
    title: product.title,
    highlights: product.highlights,
  }));

  return send(res, 200, "search-products", { docs: products });
});

// lets take it for cloth

exports.getProducts = catchAsync(async (req, res) => {
  const query = req.query;
  let { limit, page } = query;
  limit = Number(limit) || 10;
  page = Number(page) || 0;

  if (!query.sort) {
    query.sort = "-rating";
  }

  // lets check if what is category of products
  // price query

  const summaryStage = [
    ...formatQueryIntoPipeline(query, false, ["skip", "limit", "sort"]),

    { $count: "count" },

    {
      $set: {
        totalPage: { $ceil: { $divide: ["$count", Number(limit)] } },
      },
    },
  ];

  const docsStage = formatQueryIntoPipeline(query, [
    {
      $set: {
        image: { $first: "$images" },
      },
    },
    { $unset: ["images", "sizes"] },
  ]);

  let pipeline = [
    query.q && searchQuery(query.q, false),

    page === 0
      ? {
          $facet: {
            // total items count and total pages
            summary: summaryStage,

            categoryBySize: [
              {
                $group: {
                  _id: null,
                  values: { $addToSet: "$size" },
                },
              },

              { $unset: ["_id"] },
            ],
            categoryByColor: [
              { $project: { color: "$color" } },

              {
                $group: {
                  _id: null,
                  values: { $addToSet: "$color" },
                },
              },

              { $set: { color: "$_id" } },

              { $match: { color: { $ne: null } } },

              { $unset: ["_id"] },
            ],

            // products
            docs: docsStage,
          },
        }
      : {
          $facet: {
            summary: summaryStage,
            docs: docsStage,
          },
        },
  ];

  pipeline = pipeline.filter((stage) => stage);

  let agg = await Product.aggregate(pipeline);

  agg = agg[0];
  if (page === "0") {
    agg.categoryBySize = agg.categoryBySize[0].values;
    agg.categoryByRatings = [1, 2, 3, 4, 5];
    agg.price = ["lt-500", "500-1000", "1000-5000", "5000-10000"];
  }
  agg.summary = agg.summary[0];

  return send(res, 200, "products", agg);
});

// api means factory
exports.apiGetProduct = Factory.getOne(Product);
exports.apiGetProducts = Factory.getAll(Product);

// check if the product shopowner match with userId
exports.checkValidShopOwnerOfProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user._id;

  const isValidShopOwner = await Product.findOne({
    _id: productId,
    s_id: userId,
  });

  console.log('product',isValidShopOwner)

  if (!isValidShopOwner)
    return next(
      new AppError("You don't have permission to do this action", 400)
    );

  next();
});

exports.apiUpdateProduct = Factory.updateOne(Product);
exports.apiDeleteProduct = Factory.deleteOne(Product);
exports.apiCreateProduct = Factory.createOne(Product);
