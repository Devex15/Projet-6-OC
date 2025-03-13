const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // On vérifie la clé JWT_SECRET
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Le jeton est invalide' });
    }

    // On vérifie le token dans l'en-tête Authorization
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant ou mal formé' });
    }

    const token = authHeader.split(' ')[1];
//const token= req.session.token;

    try {
        // On vérifie le token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (req.body.userId && req.body.userId != verified.userId )  {
            console.log("mauvais user");
        } else {
            next();
        }
       
        /*req.user = verified; // Ajout des informations du token au req
        next(); // Passage au middleware suivant */
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Le token a expiré' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Le token est invalide' });
        }
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
