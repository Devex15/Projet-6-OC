const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// On définit le schéma utilisateur
const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

// on exporte le modèle afin qu'il soit accessible dans d'autres fichiers
module.exports = mongoose.model('User', userSchema);
