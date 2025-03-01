// Require sur express et autre dépendances 
const express = require('express');
const routerUser = express.Router();
const { registerUser, loginUser, updatePassword } = require('../controllers/userController');
//const { verifyToken } = require('../middleware/authMiddleware');
console.log('userroutes 1');
// On définit les routes utilisateurs (Register et Login)
routerUser.post('/signup', registerUser);

routerUser.post('/login', loginUser);
// router.put('/password', verifyToken, updatePassword);   -> Inutile : sera fait dans la fonction login

module.exports = routerUser;
