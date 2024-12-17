// On récupère toutes les sauces 

exports.getAllSauces = (req,res, next) => {
    sauce.find()  // Définis sans paramètre : va rechercher toutes les sauces
    // si une sauce est trouvée : .then , status 200 et on renvoie la sauce
    .then (sauces => res.status(200).json(sauces))
    // ou error  : .catch erreur 404 et renvoie l'erreur
    .catch(res.status(404).json({error}))
}

exports.getOneSauce = (req, res , next) => {
    //.findOne : méthode mongoose qui permet de rechercher dans la databank un éléments pércis
    //  _id ; id générérique , on recherche dans l'entête de la requête le id de la sauce
    sauce.findOne({_id: req.params.id}) 
    .then(sauce => res.status(200).json(sauce)) // Si trouvé status 200 et on affaiche
    .catch(error => res.status(404).json({error})) // sinon statut 404 et on affiche l'erreur
}