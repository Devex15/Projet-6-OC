// Require sur express et autre dépendances 
const express = require('express');
const routerUser = express.Router();
const { registerUser, loginUser, updatePassword } = require('../controllers/userController');

// On définit les routes utilisateurs (Register et Login)
routerUser.post('/signup', registerUser);

routerUser.post('/login', loginUser);

module.exports = routerUser;
