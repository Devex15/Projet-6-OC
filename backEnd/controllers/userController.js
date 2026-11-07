const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/modelUser');

// ========================================
// INSCRIPTION D'UN UTILISATEUR
// ========================================

exports.registerUser = async (req, res) => {
    try {

        // Récupération des données validées par Joi
        const { email, password } = req.body;

        // Le mot de passe est haché
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création d'un nouvel utilisateur
        const newUser = new User({
            email: email,
            password: hashedPassword
        });

        // Sauvegarde de l'utilisateur dans MongoDB
        await newUser.save();

        return res.status(201).json({
            message: "Utilisateur enregistré avec succès !"
        });

    } catch (error) {

        // Gestion d'une adresse e-mail déjà utilisée
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Cette adresse e-mail est déjà utilisée."
            });
        }

        console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);

        return res.status(500).json({
            message: "Une erreur s'est produite. Veuillez réessayer plus tard."
        });
    }
};


// ========================================
// CONNEXION D'UN UTILISATEUR
// ========================================

exports.loginUser = async (req, res) => {
    try {

        // Récupération des données validées par Joi
        const { email, password } = req.body;

        // Recherche de l'utilisateur par son adresse e-mail
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({
                message: "Identifiant ou mot de passe incorrect."
            });
        }

        // Comparaison du mot de passe avec celui enregistré (haché)
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Identifiant ou mot de passe incorrect."
            });
        }

        // Vérification de la présence du secret JWT
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET non définie.");

            return res.status(500).json({
                message: "Erreur de configuration du serveur."
            });
        }

        // Génération du jeton JWT
        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Transmission du JWT au frontend Angular
        return res.status(200).json({
            message: "Connexion réussie !",
            token: token,
            userId: user._id
        });

    } catch (error) {

        console.error("Erreur lors de la connexion :", error);

        return res.status(500).json({
            message: "Une erreur s'est produite. Veuillez réessayer plus tard."
        });
    }
};
