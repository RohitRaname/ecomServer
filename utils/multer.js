/* eslint-disable camelcase */
const multer = require('multer');
const AppError = require('./AppError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image! Please upload only images', 400), false);
};

const upload = multer({
  limits: { fileSize: 5 * 1000 * 1000 }, // 5MB max file size
  storage: multerStorage,
  filter: multerFilter,
});




exports.singlePhoto = (field) => upload.single(field);
exports.singleFieldMultiplePhotos = (field, limit) =>
  upload.array(field, limit);

exports.uploadMultipleFieldPhotos = (field_and_limit) =>
  upload.fields(field_and_limit);

exports.convertFormDataIntoObj = (formData) => {
  const obj = {};
  Object.keys(formData).forEach((key) => {
    const breakKey = key.split('_');
    if (breakKey.length === 1) {
      obj[key] = formData[key];
      return;
    }

    if (!obj[breakKey[0]]) obj[breakKey[0]] = {};

    if(breakKey[2] ==="id") breakKey[2] ="_id"

    obj[breakKey[0]][breakKey[1] === '' ? breakKey[2] : breakKey[1]] =
      formData[key];
  });

  console.log(obj);

  return obj;
}; 
