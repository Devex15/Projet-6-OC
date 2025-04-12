    const Sauce = require('../models/modelSauce');
    const fs = require('fs');
    
    // Récupère toutes les sauces
    exports.getAllSauces = (req, res, next) => {
        console.log("🟡 Entrée dans getAllSauces");
        Sauce.find()
            .then(sauces => {
                console.log("🟢 Sauces récupérées :", sauces);
                res.status(200).json(sauces);
            })
            .catch(error => {
                console.error("🔴 Erreur dans getAllSauces :", error);
                res.status(404).json({ error });
            });
    };
    
    // Récupère une sauce précise
    exports.getOneSauce = (req, res, next) => {
        console.log("🟡 Récupération de la sauce avec l'id :", req.params.id);
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                console.log("🟢 Sauce trouvée :", sauce);
                res.status(200).json(sauce);
            })
            .catch(error => {
                console.error("🔴 Erreur lors de la récupération de la sauce :", error);
                res.status(404).json({ error });
            });
    };
    
    // Création d'une nouvelle sauce
    /* exports.createSauce = (req, res, next) => {
        console.log("🟡 Entrée dans createSauce");
        const sauceNew = JSON.parse(req.body.sauce);
        console.log("🟡 Données de la sauce reçues :", sauceNew);
        delete sauceNew._id;
        const sauce = new Sauce({
            ...sauceNew,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0
        });
        console.log("🟡 Nouvelle sauce créée :", sauce);
        sauce.save()
            .then(() => {
                console.log("🟢 Sauce enregistrée avec succès");
                res.status(201).json({ message: "L'enregistrement de la sauce s'est fait avec succès." });
            })
            .catch(error => {
                console.error("🔴 Erreur lors de l'enregistrement de la sauce :", error);
                res.status(400).json({ error });
            });
    }; */
    
    exports.createSauce = (req, res, next) => {
        try {
          const sauceData = JSON.parse(req.body.sauce);
      
          // Suppression de l'ID fourni par le client (sécurité)
          delete sauceData._id;
      
          const newSauce = new Sauce({
            ...sauceData,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: []
          });
      
          newSauce.save()
            .then(() => res.status(201).json({ message: 'Sauce créée avec succès.' }))
            .catch(error => {
              console.error("🔴 Erreur lors de l'enregistrement de la sauce :", error);
              res.status(400).json({ error });
            });
        } catch (error) {
          console.error("🔴 Erreur dans createSauce :", error);
          res.status(400).json({ message: "Requête invalide" });
        }
      };
      
    // Mise à jour d'une sauce
     exports.updateSauce = (req, res, next) => {
        if (req.file) {
            console.log("🟡 Mise à jour avec une nouvelle image pour la sauce :", req.params.id);
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    console.log("🟡 Sauce à mettre à jour :", sauce);
                    const imgName = sauce.imageUrl.split('/images/')[1];
                    console.log(imgName);
                    console.log(sauce);
                    fs.unlink(`images/${imgName}`, () => {
                        console.log("🟡 Image supprimée :", imgName);
                        const sauceUpdated = {
                            ...JSON.parse(req.body.sauce),
                            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                        };
                        Sauce.updateOne({ _id: req.params.id }, { ...sauceUpdated, _id: req.params.id })
                            .then(() => {
                                console.log("🟢 Sauce mise à jour avec nouvelle image");
                                res.status(200).json({ message: 'Sauce modifiée!' });
                            })
                            .catch(error => {
                                console.error("🔴 Erreur lors de la mise à jour de la sauce :", error);
                                res.status(400).json({ error });
                            });
                    });
                })
                .catch(error => {
                    console.error("🔴 Erreur lors de la recherche de la sauce :", error);
                    res.status(500).json({ error });
                });
        } else {
            console.log("🟡 Mise à jour sans nouvelle image pour la sauce :", req.params.id);
            const sauceObject = { ...req.body };
            Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                .then(() => {
                    console.log("🟢 Sauce mise à jour sans nouvelle image");
                    res.status(200).json({ message: 'La sauce a été modifiée avec succès.' });
                })
                .catch(error => {
                    console.error("🔴 Erreur lors de la mise à jour de la sauce :", error);
                    res.status(400).json({ error });
                });
        }
    }; 

    
    // Suppression d'une sauce
    exports.deleteSauce = (req, res, next) => {
        console.log("🟡 Suppression de la sauce :", req.params.id);
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                console.log("🟡 Sauce à supprimer :", sauce);
                const imgName = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${imgName}`, () => {
                    console.log("🟡 Image supprimée :", imgName);
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => {
                            console.log("🟢 Sauce supprimée avec succès");
                            res.status(200).json({ message: 'La sauce a été supprimée avec succès.' });
                        })
                        .catch(error => {
                            console.error("🔴 Erreur lors de la suppression de la sauce :", error);
                            res.status(400).json({ error });
                        });
                });
            })
            .catch(error => {
                console.error("🔴 Erreur lors de la recherche de la sauce pour suppression :", error);
                res.status(500).json({ error });
            });
    };
    
    // Gestion des likes et dislikes
    exports.likeSauce = (req, res, next) => {
        const userId = req.body.userId;
        const like = req.body.like;
        const sauceId = req.params.id;
        console.log(`🟡 Traitement du like pour la sauce ${sauceId} par l'utilisateur ${userId} avec like = ${like}`);
    
        Sauce.findOne({ _id: sauceId })
            .then(sauce => {
                console.log("🟡 Sauce trouvée pour le like :", sauce);
                const updatedValues = {
                    usersLiked: [...sauce.usersLiked],
                    usersDisliked: [...sauce.usersDisliked],
                    likes: 0,
                    dislikes: 0
                };
    
                switch (like) {
                    case 1:
                        if (!updatedValues.usersLiked.includes(userId)) {
                            updatedValues.usersLiked.push(userId);
                            console.log("🟢 Utilisateur ajouté aux likes");
                        }
                        break;
                    case -1:
                        if (!updatedValues.usersDisliked.includes(userId)) {
                            updatedValues.usersDisliked.push(userId);
                            console.log("🟢 Utilisateur ajouté aux dislikes");
                        }
                        break;
                    case 0:
                        if (updatedValues.usersLiked.includes(userId)) {
                            const index = updatedValues.usersLiked.indexOf(userId);
                            updatedValues.usersLiked.splice(index, 1);
                            console.log("🟡 Utilisateur retiré des likes");
                        } else if (updatedValues.usersDisliked.includes(userId)) {
                            const index = updatedValues.usersDisliked.indexOf(userId);
                            updatedValues.usersDisliked.splice(index, 1);
                            console.log("🟡 Utilisateur retiré des dislikes");
                        }
                        break;
                    default:
                        console.error("🔴 Action non valide");
                        return res.status(400).json({ message: "Action non valide." });
                }
    
                updatedValues.likes = updatedValues.usersLiked.length;
                updatedValues.dislikes = updatedValues.usersDisliked.length;
                console.log("🟡 Mise à jour des compteurs : likes =", updatedValues.likes, ", dislikes =", updatedValues.dislikes);
    
                Sauce.updateOne({ _id: sauceId }, updatedValues)
                    .then(() => {
                        console.log("🟢 Sauce notée avec succès");
                        res.status(200).json({ message: 'La sauce a été notée avec succès.' });
                    })
                    .catch(error => {
                        console.error("🔴 Erreur lors de la mise à jour du like :", error);
                        res.status(400).json({ error });
                    });
            })
            .catch(error => {
                console.error("🔴 Erreur lors de la recherche de la sauce pour le like :", error);
                res.status(500).json({ error });
            });
    };
    