const mongoose = require('mongoose');

// On définit le schéma utilsateur
const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

// on exporte le modèle afin qu'il soit accessible dans d'autres fichiers
module.exports = mongoose.model('User', userSchema);
