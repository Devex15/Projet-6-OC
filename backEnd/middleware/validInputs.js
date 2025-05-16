const Joi = require('joi');

// Schéma de validation du user
const userSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(4).required()
});

exports.user = (req, res, next) => {
    console.log("🟢 user - Données reçues :", req.body);

    const { error, value } = userSchema.validate(req.body);
    
    if (error) {
        console.error("🔴 user - Erreur de validation :", error.details.map((detail) => detail.message));
        return res.status(422).json({
            error: "Erreur lors de la tentative de connexion.",
            details: error.details.map((detail) => detail.message)
        });
    }

    console.log("🟢 user - Données validées :", value);
    next();
};

// Schéma de validation des données de la sauce
const sauceSchema = Joi.object({
    userId: Joi.string().trim().length(24).required(),
    name: Joi.string().trim().min(4).max(10).required(),
    description: Joi.string().trim().required(),
    manufacturer: Joi.string().trim().required(),
    mainPepper: Joi.string().trim().required(),
    imageUrl: Joi.string().uri().optional(),
    heat: Joi.number().integer().min(1).max(10).required()
});

exports.sauce = (req, res, next) => {
    let sauce;
    
    console.log("🟢 sauce - Requête reçue. Fichier présent :", !!req.file);

    if (req.file) {
        try {
            // Si un fichier est envoyé, les données sont dans req.body et non req.file.buffer
            sauce = JSON.parse(req.body.sauce); 
            console.log("🟢 sauce - Données extraites du body :", sauce);
        } catch (e) {
            console.error("🔴 sauce - Erreur JSON dans req.body.sauce :", e.message);
            return res.status(400).json({ error: "Format JSON invalide dans le body." });
        }

        // **Ajout du champ imageUrl**
        sauce.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        console.log("🟢 sauce - Ajout du champ imageUrl :", sauce.imageUrl);
        
    } else {
        sauce = req.body;
        console.log("🟢 sauce - Données reçues (body) :", sauce);
    }

    const { error, value } = sauceSchema.validate(sauce);

    if (error) {
        console.error("🔴 sauce - Erreur de validation :", error.details.map((detail) => detail.message));
        return res.status(422).json({
            error: "Les données envoyées sont incorrectes.",
            details: error.details.map((detail) => detail.message)
        });
    }

    console.log("🟢 sauce - Données validées :", value);
    next();
};


// Schéma de validation de l'id
const idSchema = Joi.string().trim().length(24).required();

exports.id = (req, res, next) => {
    console.log("🟢 id - ID reçu :", req.params.id);

    const { error, value } = idSchema.validate(req.params.id);
    
    if (error) {
        console.error("🔴 id - ID invalide :", error.details.map((detail) => detail.message));
        return res.status(422).json({
            error: "L'id de la sauce est invalide.",
            details: error.details.map((detail) => detail.message)
        });
    }

    console.log("🟢 id - ID validé :", value);
    next();
};

// Schéma de validation des likes
const likeSchema = Joi.object({
    userId: Joi.string().trim().length(24).required(),
    like: Joi.number().valid(-1, 0, 1).required()
});

exports.like = (req, res, next) => {
    console.log("🟢 like - Données reçues :", req.body);

    const { error, value } = likeSchema.validate(req.body);
    
    if (error) {
        console.error("🔴 like - Erreur de validation :", error.details.map((detail) => detail.message));
        return res.status(422).json({
            error: "Les données saisies sont invalides.",
            details: error.details.map((detail) => detail.message)
        });
    }

    console.log("🟢 like - Données validées :", value);
    next();
};
