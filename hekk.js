const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
const Dress = require("./models/Dress"); // Import the User model defined with userSchema
// define route to handle user uploads
app.post("/users/dress", upload.single("image"), (req, res) => {
  const { s_id, name, description, price, quantity } = req.body;
  //only store the path of the image
  const imagePath = path.join(__dirname, "uploads", req.file.filename);

  const dress = new Dress({
    s_id,
    name,
    description,
    price,
    quantity,
    imagePath,
  }); // Create a new Dress object using the uploaded data

  dress
    .save() // Save the dress object to the database
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    });
});

app.get("/users/dress", (req, res) => {
  Dress.find()
    .then((dresses) => {
      res.status(200).json({ success: true, dresses: dresses });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    });
});
