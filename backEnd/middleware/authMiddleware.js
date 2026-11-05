const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Sécurité serveur
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Serveur inaccessible' });
    }

    // 2. Extraction du token
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 3. Vérification du token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Protection contre l'usurpation d'identité
        if (req.body.userId && req.body.userId !== verified.userId)  {
            return res.status(403).json({ message: 'Impossible de satisfaire la requête' });
        }

        // 5. On injecte les infos du user dans l'objet req pour les routes suivantes
        req.user = verified; 
        
        // 6. On passe au middleware/contrôleur suivant
        next(); 
       
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Le token a expiré' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Le token est invalide' }); // 401 est plus standard pour un jeton invalide
        }
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
