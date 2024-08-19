
const multer = require('multer');

// Define multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/productsImages');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


const productsUpload = upload.fields([
  { name: 'mainimage', maxCount: 1 },
  { name: 'sub_images1', maxCount: 1 },
  { name: 'sub_images2', maxCount: 1 }
]);

module.exports =productsUpload;

