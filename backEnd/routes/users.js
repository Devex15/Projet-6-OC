const express = require('express');
const routerUser = express.Router();

const { registerUser, loginUser } = require('../controllers/userController');
const userValidation = require('../middleware/validInputs');

// Inscription : validation puis contrôleur
routerUser.post('/signup', userValidation.user, registerUser);

// Connexion : validation puis contrôleur
routerUser.post('/login', userValidation.user, loginUser);

module.exports = routerUser;

