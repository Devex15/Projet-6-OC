const multer = require('multer');
const sharp = require('sharp'); // Importer sharp pour la conversion d'image

// On configure les mime_types qui sont acceptés (type de fichier / extension)
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp', // Ajout de webp dans les types MIME
};

// On définit le dossier qui va accueillir les images
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // On s'assure que le fichier image aura un nom sans espace avec l'extension correcte
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype] || 'webp'; // Si le type MIME n'est pas dans la liste, on force 'webp'
    let timestamp = Math.floor(Date.now() / 1000);
    callback(null, name + timestamp + '.' + extension);
  }
});

// Initialisation de multer avec le stockage configuré
const upload = multer({ storage: storage }).single('image');

// Middleware de conversion d'image en webp après téléchargement
const convertToWebp = (req, res, next) => {
  const uploadedFilePath = req.file.path;

  // Utilisation de sharp pour convertir l'image en .webp
  sharp(uploadedFilePath)
    .webp() // Convertir l'image en format webp
    .toFile(uploadedFilePath.replace(/\.(jpg|jpeg|png|webp)$/, '.webp'), (err, info) => {
      if (err) {
        return res.status(500).send('Erreur de conversion en webp');
      }
      // Si la conversion réussit, on supprime l'ancien fichier
      fs.unlink(uploadedFilePath, (err) => {
        if (err) {
          console.log('Erreur lors de la suppression du fichier original', err);
        }
      });

      // Mettre à jour `req.file` avec le chemin du fichier converti
      req.file.path = uploadedFilePath.replace(/\.(jpg|jpeg|png|webp)$/, '.webp');
      next();
    });
};

module.exports = { upload, convertToWebp };
