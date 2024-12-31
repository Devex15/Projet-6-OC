// On récupère toutes les sauces 

exports.getAllSauces = (req,res, next) => {
    sauce.find()  // Définis sans paramètre : va rechercher toutes les sauces
    // si une sauce est trouvée : .then , status 200 et on renvoie la sauce
    .then (sauces => res.status(200).json(sauces))
    // ou error  : .catch erreur 404 et renvoie l'erreur
    .catch(res.status(404).json({error}))
}

exports.getOneSauce = (req, res, next) => {
    //.findOne : méthode mongoose qui permet de rechercher dans la databank un éléments pércis
    //  _id ; id générique , on recherche dans l'entête de la requête le id de la sauce
    sauce.findOne({_id: req.params.id}) 
    .then(sauce => res.status(200).json(sauce)) // Si trouvé status 200 et on affiche
    .catch(error => res.status(404).json({error})) // sinon statut 404 et on affiche l'erreur
}

exports.createSauce = (req, res, next) => {
// On extrait la sauce proposée par l'utilisateur et on la convertit en JS ( JSON.pars () )
    const sauceNew = JSON.parse(req.body.sauce) ;

    // On supprime l'id généré par la base Mongodb afin d'éviter les conflits ultérieurs possibles 
    delete sauceNew._id;

    // On crée la nouvelle sauce dans la base de données grâce à new : 
    const sauce = new sauce ({
        ... sauceNew, // ... : spread permet d'extraire les propriétés de l'objet sauce
        // et de lui ajouter de nouvelles propriétés:
        // L'URl de la nouvelle image est construit dynamiquement : re.protocol : soit http soit https ; req.get.host : l'url host de la sauce
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });

 // On save la sauce dans la base de données
 sauce.save()

 // On gère la réponse et les erreurs
 .then (() => res.status(201).JSON({message:"L'enregistrement de la sauce s'est fait avec succès."}))
 .catch(error => {res.status(400).JSON({error})
 })
}

exports.updateSauce = (req, res, next) =>{
    // Si une image est attachée au fichier proposée par l'utilisateur
    if (req.file) {
        // On cherche l'id  sauce dans la base de données qui corresponde l'id de la sauce à modifier.
        sauce.findOne({_id: req.params._id })
        const imgeName = sauce.imageUrl.split('/images/')[1];

        // On supprime l'image correspondant à l'url
        fs.unlink(`images/${imgeName}`), () => {
            // on crée la nouvelle image
            const sauceUpdated = {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.fileName}`
            };
            // On update la sauce en question avec la fonction .updateOne()
            Sauce.updateOne({ _id: req.params.id }, { ...sauceUpdated, _id: req.params.id })

            // On renvoie une réponse à l'utilisateur en gérant les les erreurs :
            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
            .catch(error => res.status(400).json({ error }));

            }

    
            } else {
                // les données sont récupérées directement du corps de la requête:
                const sauceObject = { ...req.body };

                // On update la sauce dans la base de données :
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                // On gère la réponse utilisateur et les erreurs :
                .then(() => res.status(200).json({ message: 'La sauce a été modifiée avec succcès.' }))
                .catch(error => res.status(400).json({ error }));
            }
        }

exports.deleteSauce = (req, res, next) =>{
    // On cherche la sauce que le client veut supprimer
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            //On cherche l'url de l'image de la sauce à supprimer et on supprime l'image (fs.unlink)
            const imgName = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${imgName}`, () => {
                // On supprime la sauce liée à l'id proposé par l'utilisateur et on gère les erreurs. 
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'La sauce a été supprimée avec succès.'}))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));
    };

    // Gestion des likes et des dislikes
    exports.likeSauce = (req, res, next) => {
        //On récupère les infos nécessaires au traitement de la delande de l'utilisateur ( userId ; like et l'id de la sauce)
        const userId = req.body.userId;
        const like = req.body.like;
        const sauceId = req.params.id;
        // On cherche la sauce concernée 
        Sauce.findOne({ _id: sauceId })
            .then(sauce => {
                // On crée un objet JS avec les nouvelles valeurs à maj
                const updatedValues = {
                    usersLiked: sauce.usersLiked,
                    usersDisliked: sauce.usersDisliked,
                    likes: 0,
                    dislikes: 0
                }
                // On gère les différents cas de figure
                // sauce liké
                switch (like) {
                    case 1:  
                    // On push l'id de l'utlisateur dans le tableau JS
                        updatedValues.usersLiked.push(userId); 
                        break;
                    // sauce dislikée
                    case -1:
                    // On push l'id de l'utilisateur 
                        updatedValues.usersDisliked.push(userId);
                        break;
                    // On annule le like ou le dislike
                    case 0:  
                        if (updatedValues.usersLiked.includes(userId)) {
                            // si on annule le like
                            const index = updatedValues.usersLiked.indexOf(userId);
                            newValues.usersLiked.splice(index, 1);
                        } else {
                            // si on annule le dislike
                            const index = updatedValues.usersDisliked.indexOf(userId);
                            updatedValues.usersDisliked.splice(index, 1);
                        }
                        break;
                };
                // On détermine le nombre de like et de dislike avec la longueur de l'objet
                updatedValues.likes = updatedValues.usersLiked.length;
                updatedValues.dislikes = updatedValues.usersDisliked.length;
                // On met à jour de la sauce avec les nouvelles valeurs
                Sauce.updateOne({ _id: sauceId }, updatedValues )
                    .then(() => res.status(200).json({ message: 'La sauce a été notée avec succès.' }))
                    .catch(error => res.status(400).json({ error }))  
            })
            .catch(error => res.status(500).json({ error }));
    }
    



