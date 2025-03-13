const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
require('dotenv').config(); // On charge les variables d'environnement.

const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/users');

// On se connecte à la base de données:
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('La connexion à MongoDB réussie !'))
    .catch((err) => console.error('La connexion à MongoDB échouée !', err));

// on initialise l'application Express:
const app = express();

/**
 * MIDDLEWARES
 */
// Configuration des en-têtes CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.AUTHORIZED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// On utilise le middleware pour parser le corps des requêtes en JSON
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'monSuperSecret', // Clé secrète pour signer la session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettre `true` si en HTTPS
}));

app.use((req, res, next) => {
    console.log('🔍 Requête reçue :', req.method, req.url);
    console.log('🛠️ Headers:', req.headers);
    if (req.headers.authorization) {
        console.log('✅ Token reçu :', req.headers.authorization);
    } else {
        console.log('❌ Aucun token reçu');
    }
    next();
});

//====================================
// DEFINITION DES ROUTES DU PROJET
 //===================================
// Définition de la route afin de  servir des fichiers statiques (ex : images)
app.use('/images', express.static(path.join(__dirname, 'images')));
console.log('app1');
// Routes API
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
 
//=================================
// GESTION DES ERREURS GLOBALES
//===============================

app.use((err, req, res, next) => {
    console.error('Erreur :', err);
    res.status(err.status || 500).json({ message: err.message || 'Erreur serveur' });
});


module.exports = app;
