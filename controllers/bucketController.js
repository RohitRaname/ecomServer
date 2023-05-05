/* eslint-disable camelcase */
const mongoose = require('mongoose');
const tryCatch = require('../utils/tryCatch');
// const UserActivity = require('../user/userActivityModel');
const {
  formatQueryIntoPipeline,
} = require('../utils/mongodbQueryConverter');
const send = require('../utils/sendJSON');

const getNewDocPageNumber = tryCatch(async (model, userId) => {
  const doc = await model
    .findOne({
      userId,
    })
    .sort({ page: -1 })
    .limit(1)
    .exec();
  if (!doc) return 0;
  return Number(doc.page) + 1;
});

exports.updateUserDoc = tryCatch(async (userId, query) => {
  await mongoose
    .model('user')
    .findOneAndUpdate({ _id: userId, ...query.filter }, { ...query.update })
    .exec();
});

// create new doc with empty list
exports.createNewList = tryCatch(
  async (model, userId, listName, item, updateUserOptions) => {
    const newPage = await getNewDocPageNumber(model, userId);

    // create list
    const docUpdate = await model.create({
      userId: userId,
      page: newPage,

      // wishlist need name,_id

      [listName]: item,
    });

    if (updateUserOptions.update)
      this.updateUserDoc(userId, updateUserOptions.query);
    return docUpdate[listName].slice(-1)[0];
  }
);

exports.itemExistInList = tryCatch(async (model, userId, listName, itemId) => {
  const item = await model
    .findOne({
      userId: userId,
      [listName]: { $gt: [] },

      [listName]: {
        $elemMatch: { _id: itemId },
      },
    })
    .exec();
  return item ? true : false;
});

exports.updateItemInList = tryCatch(
  async (model, userId, listName, itemId, updateItemQuery) =>
    await model
      .findOneAndUpdate(
        { [`${listName}._id`]: itemId, userId: userId },
        updateItemQuery,
        {
          new: true,
        }
      )
      .exec()
);

// add item to bucketList
exports.addItemToList = tryCatch(
  async (
    model,
    userId,
    listName,
    item, // {_id, or maybe name also}
    queryOptions, // {limit,checkItemExist,updateIfItemExist
    updateUserOptions // {update,query}
  ) => {
    if (
      queryOptions.checkItemExist &&
      (await this.itemExistInList(model, userId, listName, item._id))
    ) {
      console.log('item exist');
      if (queryOptions.updateIfItemExist) {
        console.log('update the existing item')
        await this.updateItemInList(
          model,
          userId,
          listName,
          item._id,
          queryOptions.updateIfItemExist
        );

        if (updateUserOptions.update) {
          this.updateUserDoc(userId, updateUserOptions.query);
        }
        return;
      }

      return new Error('item exist');
    }

    if (queryOptions.deleteItemExist)
      await this.removeItemFromList(model, userId, 'items', item._id, false);

    const filterQuery = {
      userId: userId,
      $expr: {
        $lt: [{ $size: `$${listName}` }, '$limit'],
      },
    };

    // insert doc
    const docUpdate = await model
      .findOneAndUpdate(
        filterQuery,
        {
          $push: { [listName]: item },
        },
        { new: true }
      )
      .exec();

    if (docUpdate) {
      const docInserted = docUpdate[listName].slice(-1)[0];
      if (updateUserOptions.update) {
        this.updateUserDoc(userId, updateUserOptions.query);
      }

      return docInserted;
    }

    // if list is full then new create new doc
    return await this.createNewList(
      model,
      userId,
      listName,
      item,
      updateUserOptions
    );
  }
);

exports.addItemsToList = tryCatch(
  async (
    model,
    userId,
    listName,
    items, // {_id, or maybe name also}
    queryOptions,
    updateUserOptions // {limit,checkItemExist,updateIfItemExist))
  ) => {
    const promises = items.map((item) =>
      this.addItemToList(
        model,
        userId,
        listName,
        item,
        queryOptions,
        updateUserOptions
      )
    );
    await Promise.all(promises);
  }
);

// remove one from list
exports.removeItemFromList = tryCatch(
  async (
    model,
    userId,
    listName,
    itemId, // {_id:item._id}
    updateUserOptions // {update,query}
  ) => {
    const docUpdate = await model
      .findOneAndUpdate(
        {
          userId: userId,
          [`${listName}._id`]: itemId,
        },
        {
          $pull: { [listName]: { _id: itemId } },
        },
        { new: true }
      )
      .exec();

    if (!docUpdate) return new Error('item-not-exist');

    if (docUpdate) {
      if (updateUserOptions.update)
        this.updateUserDoc(userId, updateUserOptions.query);

      // return docUpdate[listName].slice(-1)[0];
    }
  }
);

// remove all items from all list
exports.removeAllItems = tryCatch(
  async (
    model,
    userId,
    listName,
    updateUserOptions // {update,query}
  ) => {
    const docUpdate = await model
      .updateMany(
        {
          userId: userId,
          [listName]: { $gt: [] },
        },
        {
          $set: { [listName]: [] },
        },
        { new: true }
      )
      .exec();

    if (!docUpdate) return 'item-not-exist';

    if (docUpdate) {
      if (updateUserOptions.update)
        this.updateUserDoc(userId, updateUserOptions.query);
    }

    return true;
  }
);
exports.removeGivenItems = tryCatch(
  async (model, userId, listName, itemIds) => {
    await model
      .updateMany(
        {
          userId: userId,
          [listName]: { $gt: [] },
        },
        {
          $pull: { [listName]: { _id: { $in: itemIds } } },
        },
        { new: true }
      )
      .exec();

    return true;
  }
);

// COUNT ----------------------------------------------
exports.getTotalItemsCount = tryCatch(async (model, userId, query) => {
  const { listName, filter } = query;

  let pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        ...((filter && filter.list) || {}),
      },
    },

    { $unwind: `$${listName}` },

    { $replaceWith: `$${listName}` },

    filter && filter.item
      ? {
          $match: filter.item,
        }
      : null,

    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },

    { $unset: '_id' },
  ];

  pipeline = pipeline.filter((el) => el);
  console.log(pipeline);
  //
  const list = await model.aggregate(pipeline).exec();

  return list.length === 0 ? 0 : list[0]['count'];
});

exports.getTotalPage = tryCatch(async (model, userId) => {
  const doc = await model
    .findOne({
      userId,
    })
    .sort({ page: -1 })
    .limit(1)
    .exec();
  if (!doc) return 0;
  return Number(doc.page);
});

exports.getEmbeddedItem =tryCatch(async (model, userId, listName,itemId,filter) => {
  let pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        [`${listName}._id}`]: itemId,
        ...filter
      },
    },

    { $unwind: `$${listName}` },

    { $replaceWith: `$${listName}` },

    { $match: { _id: new mongoose.Types.ObjectId(itemId) } },
  ];


  const item = await model.aggregate(pipeline).exec();

  return item[0];
});


// Filter Items ----------------------------------------
exports.getEmbeddedItems = tryCatch(async (model, userId, listName, query,filter={}) => {
  let pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        [listName]: { $gt: [] },
        ...filter
      },
    },

    { $unwind: `$${listName}` },

    { $replaceWith: `$${listName}` },

    { $match: { active: { $ne: false } } },

    // itemFilter && itemFilter ? { $match: itemFilter } : null,

    ...formatQueryIntoPipeline(query),

    // sort ? { $sort: { ts: sort.includes('-') ? -1 : 1 } } : null,

    // { $skip: Number(skip) || 0 },

    // { $limit: Number(limit) || 10 },

    // project
    //   ? {
    //       $project: project,
    //     }
    //   : null,
  ];

  pipeline = pipeline.filter((el) => el);
  console.log(pipeline);

  const items = await model.aggregate(pipeline).exec();

  return items;
});

exports.getRefItems = tryCatch(async (model, userId, query) => {
  const {
    listName,
    sort,
    page,
    limit,
    skip,
    project,
    directContainItems,
    lookup,
    replaceWith,
    set,
    unset,
  } = query;

  let pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        page: Number(page) || 0,
        [listName]: { $gt: [] },
      },
    },

    { $unwind: `$${listName}` },

    !directContainItems
      ? { $replaceWith: '$items' }
      : { $replaceWith: `$${listName}` },

    { $match: { active: { $ne: false } } },

    sort ? { $sort: { ts: sort.includes('-') ? -1 : 1 } } : null,

    { $skip: Number(skip) || 0 },

    { $limit: Number(limit) || 10 },

    {
      $lookup: lookup || {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'match',
      },
    },

    {
      $replaceWith: replaceWith || {
        $mergeObjects: ['$$ROOT', { $first: '$match' }],
      },
    },

    set ? { $set: set } : null,
    unset ? { $unset: unset } : null,

    project ? { $project: project } : null,
  ];

  pipeline = pipeline.filter((el) => el);

  const items = await model.aggregate(pipeline).exec();

  return items;
});

// return user bucket doc
exports.getUserAllActivityDocs = tryCatch(async (userId, fields) => {
  const itemPipeline = (field) => [
    { $match: { [field]: { $gt: [] } } },

    { $project: { [field]: 1 } },

    { $unwind: `$${field}` },

    { $replaceWith: `$${field}` },
  ];

  const facetItemPipeline = {};

  fields.forEach((field) => {
    facetItemPipeline[field] = itemPipeline(field);
  });

  let pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $facet: facetItemPipeline,
    },
  ];

  pipeline = pipeline.filter((el) => el);

  const items = await UserActivity.aggregate(pipeline).exec();

  return items[0];
});

// ALL ITEMS
// exports.getAllEmbeddedItems = tryCatch(async (model, userId, query) => {
//   const { listName, sort, project, directContainItems } = query;

//   let pipeline = [
//     {
//       $match: {
//         userId: new mongoose.Types.ObjectId(userId),
//         [listName]: { $gt: [] },
//       },
//     },

//     { $unwind: `$${listName}` },

//     !directContainItems
//       ? { $replaceWith: '$items' }
//       : { $replaceWith: `$${listName}` },

//     { $match: { active: { $ne: false } } },

//     sort
//       ? {
//           $sort: {
//             [sort.includes('-') ? sort.slice(1) : sort]: sort.includes('-')
//               ? -1
//               : 1,
//           },
//         }
//       : null,

//     project ? { $project: project } : null,
//   ];

//   pipeline = pipeline.filter((el) => el);

//   const items = await model.aggregate(pipeline).exec();

//   return items;
// });
// exports.getRefAllItems = tryCatch(async (model, userId, query) => {
//   const {
//     listName,
//     sort,

//     project,
//     directContainItems,
//     lookup,
//     replaceWith,
//     unset,
//   } = query;

//   let pipeline = [
//     {
//       $match: {
//         userId: new mongoose.Types.ObjectId(userId),
//         [listName]: { $gt: [] },
//       },
//     },

//     { $unwind: `$${listName}` },

//     !directContainItems
//       ? { $replaceWith: '$items' }
//       : { $replaceWith: `$${listName}` },

//     { $match: { active: { $ne: false } } },

//     sort ? { $sort: { ts: sort.includes('-') ? -1 : 1 } } : null,

//     {
//       $lookup: lookup || {
//         from: 'products',
//         localField: '_id',
//         foreignField: '_id',
//         as: 'match',
//       },
//     },

//     {
//       $replaceWith: replaceWith || {
//         $mergeObjects: ['$$ROOT', { $first: '$match' }],
//       },
//     },

//     unset ? { $unset: unset } : null,

//     project ? { $project: project } : null,
//   ];

//   pipeline = pipeline.filter((el) => el);

//   const items = await model.aggregate(pipeline).exec();

//   return items;
// });

// Shortcut Function to add data to user------------------------------------
// exports.addItemToUser = tryCatch(async (userId, activityField, item) => {
//   await this.addItemToList(
//     UserActivity,
//     userId,
//     activityField,
//     item,
//     {
//       checkItemExist: false,
//       deleteItemExist: false,
//     },
//     {
      
//       update: false,
     
//     }
//   );
// });
// exports.removeItemFromUser = tryCatch(async (userId, activityField, itemId,) => {
//   await this.removeItemFromList(UserActivity, userId, activityField, itemId,   {
      
//     update: false ,
   
//   });
// });

// // embedded Options
// exports.getItemsFromUser = tryCatch(
//   async (userId, activityField, query) =>
//     await this.getEmbeddedItems(UserActivity, userId, activityField, query)
// );

// exports.userActivityController = (activityField, action, query,) =>
//   tryCatch(async (req, res, next) => {
//     const userId = req.user._id;
//     const itemId = req.params.id;
//     let result;

//     if (action === 'add-item')
//       result = await this.addItemToUser(
//         userId,
//         activityField,
//         Object.keys(req.body).length === 0 ? { _id: itemId } : req.body,
//       );

//     if (action === 'remove-item')
//       result = await this.removeItemFromUser(userId, activityField, itemId,);

//     if (action === 'get-items') {
//       result = await this.getItemsFromUser(userId, activityField, query);
//       result = { docs: result };
//     }

//     // item exist in user activity data
//     if (action === 'item-exist') {
//       result = await this.itemExistInList(
//         UserActivity,
//         userId,
//         activityField,
//         itemId
//       );
//       result = { itemExist: result };
//     }
//     return send(res, 200, 'req successful', result);
//   });
