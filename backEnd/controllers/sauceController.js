const Sauce = require('../models/modelSauce');
const path = require('path');
const fs = require('fs').promises;
    
// Récupère toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => {
            /*console.log("🟢 Sauces récupérées :", sauces); */
            res.status(200).json(sauces);
        })
        .catch(error => {
            console.error("🔴 Erreur dans getAllSauces :", error);
            res.status(500).json({ message: "Erreur serveur lors de votre demande" });
        });
};

// Récupère une sauce précise
exports.getOneSauce = (req, res, next) => {
    /* console.log(
        "Récupération de la sauce avec l'id :",
         req.params.id
     ); */

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // Vérifier si une sauce a été trouvée
            if (!sauce) {
                return res.status(404).json({
                     message: "Sauce non trouvée"
                });
            }

            // Si la sauce existe, la renvoyer au client
            console.log("Sauce trouvée :", sauce);
            res.status(200).json(sauce);
        })
        
        .catch(error => {
            console.error(
                "Erreur lors de la récupération de la sauce :",
                error
            );

            res.status(500).json({
                message: "Erreur serveur"
            });
        });
    };
 
// Creation d'une nouvelle sauce 
exports.createSauce = async (req, res, next) => {
    try {
        // 1. Transformer le JSON reçu en objet JavaScript
        const sauceData = JSON.parse(req.body.sauce);
    
        // 2. Supprimer l'identifiant fourni par le client
        delete sauceData._id;
    
        // 3. Construire le document Mongoose
        const newSauce = new Sauce({
            ...sauceData,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: []
        });
    
        // 4. Enregistrer la sauce dans MongoDB
        await newSauce.save();
    
        // 5. Envoyer la réponse après la réussite de l'enregistrement
        res.status(201).json({
            message: 'Sauce créée avec succès.'
        });
    
    } catch (error) {
        console.error("Erreur dans createSauce :", error);
    
        res.status(400).json({
            message: "Requête invalide"
        });
    }
};
    

// Mise à jour d'une sauce
exports.updateSauce = async (req, res, next) => {
    try {
        // 1. Recherche de la sauce existante
        const sauce = await Sauce.findOne({ _id: req.params.id });
        console.log("Utilisateur authentifié :", req.user);

        if (!sauce) {
            return res.status(404).json({
                message: 'Sauce non trouvée.'
            });
        }

        // 2. Vérification que l'utilisateur est bien propriétaire de la sauce
        if (sauce.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: 'Requête non autorisée.'
            });
        }

        let sauceObject = {};

        // 3. Si une nouvelle image a été envoyée
        if (req.file) {

            console.log(
                "🟡 Mise à jour avec une nouvelle image pour la sauce :",
                req.params.id
            );

            // Récupération du nom de l'ancienne image
            const imgName = sauce.imageUrl.split('/images/')[1];

            // Préparation des nouvelles données
            sauceObject = {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            };

            // On empêche le client de modifier ces propriétés
            delete sauceObject._id;
            delete sauceObject.userId;

            // Mise à jour de MongoDB
            await Sauce.updateOne(
                { _id: req.params.id },
                {
                    ...sauceObject,
                    _id: req.params.id
                }
            );

            // Une fois MongoDB mise à jour,
            // on supprime l'ancienne image
            try {
                const imagePath = path.join(__dirname, '../images', imgName);

                await fs.unlink(imagePath);
            
                console.log(
                    "🟢 Ancienne image supprimée :",
                    imgName
                );

            } catch (unlinkError) {
                console.error(
                    "🔴 Erreur lors de la suppression de l'ancienne image :",
                    unlinkError
                );
            }

        } else {

            // 4. Mise à jour sans nouvelle image
            console.log(
                "🟡 Mise à jour sans nouvelle image pour la sauce :",
                req.params.id
            );

            sauceObject = {
                ...req.body
            };

            // Le client ne peut pas modifier ces propriétés
            delete sauceObject._id;
            delete sauceObject.userId;
            delete sauceObject.imageUrl;

            // Mise à jour de MongoDB
            await Sauce.updateOne(
                { _id: req.params.id },
                {
                    ...sauceObject,
                    _id: req.params.id
                }
            );
        }

        // 5. Réponse envoyée au client
        console.log("🟢 Sauce mise à jour avec succès !");

        return res.status(200).json({
            message: 'La sauce a été modifiée avec succès.'
        });

    } catch (error) {

        console.error(
            "🔴 Erreur globale dans updateSauce :",
            error
        );

        return res.status(500).json({
            message:"Sauce non modifiée. Veuillez réessayer."
        });
    }
};

// Suppression d'une sauce 
exports.deleteSauce = async (req, res, next) => {

    console.log("🟡 Tentative de suppression de la sauce :", req.params.id);

    try {
        // 1. Trouver la sauce
        const sauce = await Sauce.findOne({ _id: req.params.id });

        // 2. Vérifier que la sauce existe
        if (!sauce) {
            return res.status(404).json({
                message: 'Sauce non trouvée.'
            });
        }

        // 3. Vérifier que l'utilisateur est bien propriétaire
        if (sauce.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: 'Action impossible.'
            });
        }

        // 4. Extraire le nom de l'image
        const imgName = sauce.imageUrl.split('/images/')[1];

        // 5. Construire le chemin absolu de l'image
        const imagePath = path.join(__dirname, '../images', imgName);

        // 6. Supprimer l'image du serveur
        await fs.unlink(imagePath);

        console.log("🟢 Image supprimée :", imgName);

        // 7. Supprimer la sauce de MongoDB
        await Sauce.deleteOne({ _id: req.params.id });

        console.log("🟢 Sauce supprimée avec succès");

        return res.status(200).json({
            message: 'La sauce a été supprimée avec succès.'
        });

    } catch (error) {
        console.error("🔴 Erreur lors de la suppression :", error);

        return res.status(500).json({
            message: "La sauce n'a pas été supprimée."
        });
    }
};
 
// Gestion des likes et dislikes
exports.likeSauce = async (req, res) => {

    // 1. Récupération de l'utilisateur authentifié
    // L'identifiant provient du JWT vérifié par le middleware.
    /* userId évalue req.user : S'il est présent const userId = req.user.userID ( userId qui vient du JWT)
      si pas de req.user, le JS s'arrête */
    const userId = req.user && req.user.userId;

    // 2. Récupération des données de la requête
    const like = req.body.like;
    const sauceId = req.params.id;

    // 3. Vérification de l'identifiant utilisateur
    if (typeof userId !== 'string' || !userId) {
        return res.status(401).json({
            message: "Utilisateur non authentifié."
        });
    }

    // 4. Vérification de la valeur du vote
    if (!Number.isInteger(like) || ![-1, 0, 1].includes(like)) {
        return res.status(400).json({
            message: "Action non valide."
        });
    }

    try {
        // 5. Recherche de la sauce dans MongoDB
        const sauce = await Sauce.findById(sauceId);

        // 6. Vérification de l'existence de la sauce
        if (!sauce) {
            return res.status(404).json({
                message: "Sauce non trouvée."
            });
        }

        // 7. Copie des tableaux et conversion des identifiants en chaînes
        const usersLiked = (sauce.usersLiked || [])
            .map(id => String(id));

        const usersDisliked = (sauce.usersDisliked || [])
            .map(id => String(id));

        // 8. Application du vote
        switch (like) {

            case 1:
                // L'utilisateur aime la sauce.
                // On retire d'abord son éventuel dislike.
                const indexDislike = usersDisliked.indexOf(userId);

                if (indexDislike !== -1) {
                    usersDisliked.splice(indexDislike, 1);
                }

                // On ajoute le like si l'utilisateur ne l'a pas déjà donné.
                if (!usersLiked.includes(userId)) {
                    usersLiked.push(userId);
                }
                break;

            case -1:
                // L'utilisateur n'aime pas la sauce.
                // On retire d'abord son éventuel like.
                const indexLike = usersLiked.indexOf(userId);

                if (indexLike !== -1) {
                    usersLiked.splice(indexLike, 1);
                }

                // On ajoute le dislike si nécessaire.
                if (!usersDisliked.includes(userId)) {
                    usersDisliked.push(userId);
                }
                break;

            case 0:
                // L'utilisateur annule son vote.
                // On le retire des deux tableaux.
                const indexLikeToRemove = usersLiked.indexOf(userId);

                if (indexLikeToRemove !== -1) {
                    usersLiked.splice(indexLikeToRemove, 1);
                }

                const indexDislikeToRemove = usersDisliked.indexOf(userId);

                if (indexDislikeToRemove !== -1) {
                    usersDisliked.splice(indexDislikeToRemove, 1);
                }
                break;
        }

        // 9. Recalcul des compteurs à partir des tableaux
        const updatedValues = {
            usersLiked,
            usersDisliked,
            likes: usersLiked.length,
            dislikes: usersDisliked.length
        };

        // 10. Enregistrement des modifications dans MongoDB
        const result = await Sauce.updateOne(
            { _id: sauceId },
            { $set: updatedValues }
        );

        // 11. Vérification de la mise à jour
        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Sauce non trouvée."
            });
        }

        // 12. Confirmation au client
        return res.status(200).json({
            message: "La sauce a été notée avec succès."
        });

    } catch (error) {
        console.error(
            "Erreur lors du traitement du vote :",
            error
        );

        // Identifiant de sauce incompatible avec le format attendu
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "Identifiant de sauce invalide."
            });
        }

        // Autre erreur interne
        return res.status(500).json({
            message: "Une erreur interne est survenue."
        });
    }
};