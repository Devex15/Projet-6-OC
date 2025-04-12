/*
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Seuls les formats d'image autorisés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Nom de fichier final → nom_sans_espace_timestamp.webp
const generateFileName = (originalName) => {
  const name = originalName.split(' ').join('_').split('.')[0];
  const timestamp = Math.floor(Date.now() / 1000);
  return `${name}_${timestamp}.webp`;
};

// Multer – stockage temporaire, l'image sera supprimée après conversion
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // dossier temporaire pour les originaux
  },
  filename: (req, file, callback) => {
    const originalName = file.originalname;
    const extension = MIME_TYPES[file.mimetype];
    if (!extension) return callback(new Error("Type de fichier non autorisé"));
    const tempName = `${path.parse(originalName).name}_${Date.now()}.${extension}`;
    callback(null, tempName);
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

// Conversion vers .webp + suppression de l'originale
const convertToWebp = async (req, res, next) => {
  if (!req.file) return next();

  const inputPath = req.file.path;
  const outputName = generateFileName(req.file.originalname);
  const outputPath = path.join('images', outputName);

  try {
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Supprimer le fichier original temporaire
    fs.unlink(inputPath, (err) => {
      if (err) console.warn("⚠️ Impossible de supprimer le fichier temporaire :", err.message);
    });

    // Mise à jour de req.file pour le contrôleur
    req.file.filename = outputName;
    req.file.path = outputPath;

    next();
  } catch (error) {
    console.error("🔴 Erreur lors de la conversion en WebP :", error);
    return res.status(500).json({ message: "Erreur lors du traitement de l'image." });
  }
};

module.exports = {
  upload,
  convertToWebp
};
*/

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

