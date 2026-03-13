const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'portfolio',
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      public_id: file.originalname.split('.')[0] + '-' + Date.now()
    };
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
