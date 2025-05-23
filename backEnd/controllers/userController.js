const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/modelUser'); // On importer le modèle modelsUsers

// On crée la fonction afin d'enregistrer un utilisateur
exports.registerUser = async (req, res) => {
    console.log('stringTest2');
    try { 
        const { email, password } = req.body;
        console.log(email);
        
        // Le mot de passe est hâché:
        const hashedPassword = await bcrypt.hash(password, 10);

        // On crée un nouvel utilisateur:
        const newUser = new User({
            email: email,
            password: hashedPassword
        });

        // On sauvegarde l'utilisateur dans la base de données:
        await newUser.save();

        res.status(201).json({ message: "Utilisateur enregistré avec succès !" });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
        res.status(500).json({ message: "Une erreur s'est produite. Veuillez réessayer plus tard." });
    }
};

// On crée une fonction pour connecter un utilisateur:
exports.loginUser = async (req, res) => {
    try {
        console.log('test login1')
        const { email, password } = req.body;
        console.log('test login2')
        // On vérifie que les champs nécessaires sont fournis:
        if (!email || !password) {
            return res.status(400).json({ message: "Veuillez fournir une adresse e-mail et un mot de passe." });
        }
        console.log('test login4')
        // On définit une régex pour valider l'adresse e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // On vérifie si l'adresse e-mail respecte la régex
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Veuillez fournir une adresse e-mail valide." });
        }

        // On recherche l'utilisateur par son adresse e-mail:
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ message: "Désolé, la combinaison identifiant et mot de passe est incorrecte." });
        }

        // On compare le mot de passe avec celui enregistré (haché):
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Désolé, la combinaison identifiant et mot de passe est incorrecte." });
        }

        // On génère un jeton JWT:
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET, // La clé secrète est cachée.
            { expiresIn: '1h' }
        );
console.log(token);

req.session.token= token; 

        res.status(200).json({
             message: "Connexion réussie !",
            token: token,
            userId: user._id
        });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Une erreur s'est produite. Veuillez réessayer plus tard." });
    }
};
