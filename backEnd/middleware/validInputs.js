const Joi = require('joi');

// Schéma de validation du user
const userSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(4).required()
});

exports.user = (req, res, next) => {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        return res.status(422).json({
            error: "Erreur lors de la tentative de connexion.",
            details: error.details.map((detail) => detail.message)
        });
    }
    next();
};

// Schéma de validation des données de la sauce
const sauceSchema = Joi.object({
    userId: Joi.string().trim().length(20).required(),
    name: Joi.string().trim().min(4).max(10).required(),
    description: Joi.string().trim().required(),
    manufacturer: Joi.string().trim().required(),
    mainPepper: Joi.string().trim().required(),
    imageUrl: Joi.string().trim().required(),
    heat: Joi.number().integer().min(1).max(10).required()
});

exports.sauce = (req, res, next) => {
    let sauce;

    if (req.file) {
        try {
            sauce = JSON.parse(req.file.buffer.toString());
        } catch (e) {
            return res.status(400).json({ error: "Format JSON invalide dans le fichier." });
        }
    } else {
        sauce = req.body;
    }

    const { error, value } = sauceSchema.validate(sauce);

    if (error) {
        return res.status(422).json({
            error: "Les données envoyées sont incorrectes.",
            details: error.details.map((detail) => detail.message)
        });
    }
    next();
};

// Schéma de validation de l'id
const idSchema = Joi.string().trim().length(20).required();

exports.id = (req, res, next) => {
    const { error, value } = idSchema.validate(req.params.id);
    if (error) {
        return res.status(422).json({
            error: "L'id de la sauce est invalide.",
            details: error.details.map((detail) => detail.message)
        });
    }
    next();
};

// Schéma de validation des likes
const likeSchema = Joi.object({
    userId: Joi.string().trim().length(20).required(),
    like: Joi.number().valid(-1, 0, 1).required()
});

exports.like = (req, res, next) => {
    const { error, value } = likeSchema.validate(req.body);
    if (error) {
        return res.status(422).json({
            error: "Les données saisies sont invalides.",
            details: error.details.map((detail) => detail.message)
        });
    }
    next();
};
