const multer = require('multer');
const path = require('path');

// Seuls les formats d'image autorisés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Multer – stockage direct sans conversion
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // Dossier de stockage
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const extension = MIME_TYPES[file.mimetype];
    const timestamp = Math.floor(Date.now() / 1000);
    const finalName = `${name}_${timestamp}.${extension}`;
    callback(null, finalName);
  }
});

const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new Error('Seuls les formats JPG, JPEG, PNG et WEBP sont autorisés.'));
  }
};

const upload = multer({ storage, fileFilter }).single('image');

module.exports = {
  upload,
};

