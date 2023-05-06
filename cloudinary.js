const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: "dkecnfqi2",
  api_key: "174464971282656",
  api_secret: "qw2K7vSn8MlUBWOoIeld6Ew50V8",
  secure: true,
});
const uploadImage = async () => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options = {
    public_id: `users/rohit`,
  };

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload("rohit.jpg", options);
    return result.public_id;
  } catch (error) {}
};

uploadImage();
