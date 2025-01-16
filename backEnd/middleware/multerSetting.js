const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

// On configure les MIME types autorisés (extension ddes images : .jpg ; .webp ; ...)
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// On configure la stockage des images par multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Dossier cible des fichiers
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split('.')[0]; // On supprime l'extension originale
    const extension = MIME_TYPES[file.mimetype] || 'webp'; // On "force" le .webp si MIME inconnu
    const timestamp = Math.floor(Date.now() / 1000);
    callback(null, `${name}_${timestamp}.${extension}`);
  },
});

// Fonction de validation du fichier avec multer
const fileFilter = (req, file, callback) => {
  if (!MIME_TYPES[file.mimetype]) {
    return callback(new Error('Le format de l image ne convient pas. '), false);
  }
  callback(null, true);
};

// On initialise multer
const upload = multer({ 
  storage, 
  fileFilter 
}).single('image');

// On définit un middleware afin de  convertir les images en webp
const convertToWebp = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier n a été téléchargé');
  }

  const uploadedFilePath = req.file.path;
  const newFilePath = uploadedFilePath.replace(/\.(jpg|jpeg|png|webp)$/, '.webp');

  sharp(uploadedFilePath)
    .webp()
    .toFile(newFilePath, (err, info) => {
      if (err) {
        console.error('Erreur lors de la conversion avec sharp :', err);
        return res.status(500).send('Erreur de conversion en webp');
      }

      // On supprime l'ancien fichier après conversion
      fs.unlink(uploadedFilePath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression du fichier original :', err);
        }
      });

      // On met à jour les informations dans req.file
      req.file.path = newFilePath;
      req.file.filename = newFilePath.split('/').pop();

      next();
    });
};

// On crée un module qui regroupe les deux middleware upload et convertToWebp et l'exporte : 
const multerSettings = {
  upload,
  convertToWebp,
};

module.exports = multerSettings;
