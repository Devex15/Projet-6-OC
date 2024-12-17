const joi = require('@hapi/joi');

// On définie le schéma de validation du user avec joi 
const userSchema = joi.object({
    email: joi.string().trim().email().required(),
    password : joi.string().trim().min(4).required()
});

// on exporte le middleware user ( exports.user) qui gère la validation des inputs user
exports.user = (req,res,next) => {
    const{error, value} = userSchema.validate(req.body)
    if (error) {

        // renvoie d'une erreur 422 : la réquête est reçue et comprise mais les données sont invalides
        res.status(422).json({error : "Erreur lors de la tentative de connection"})
       } 
        else {
            next()
        }
}

// On définie le schéma de validation joi des données de la sauce : 
const sauceSchema = joi.object({
    userId: joi.string().trim().length(20).required(), 
    name: joi.string().trim().min(4).max(10).required(), 
    description : joi.string().trim().required(),
    manufacturer: joi.string().trim().required(), 
    mainPepper: joi.string().trim().required(), 
    imageUrl: joi.string().trim().required(), 
    heat: joi.number().integer().min(1).max(10).required(), 
})

// on exporte le middleware de validation des sauce 

exports.sauce = (req, res, next) => {
    // on définie la variable sauce qui va contenir les infos envoyées par l'utilisateur 
    let sauce;

    // Deux cas possible : ou un fichier est attaché au corps de la requête ou pas 
   
    // Si un fichier est attaché au corps de la réquête :
    if (req.file) {
        // On transforme en objet javascript le file de la requête . sauce va contenir ce file
        sauce = JSON.parse(req.file.sauce)
    }

    // cas sans fichier attaché:
    else {
        sauce = req.body
    }

    // On cherche à valider les données envoyées par l'utilisateur 
    const {error, value} = sauceSchema.validate(sauce)

    // Si il y a une erreur : Staus 422 : la réquête est comrise et reçue mais les données sont invalides 
    if (error) {
        res.status(422).json({error: "Les données envoyées sont incorrectes."})
    }

    else{
        next()
    }
}

// On définie le schéma de validation de l'id avec joi
const idSchema = joi.string().trim().length(20).required();

// On exporte la fonction de validation de l'id 
exports.id = (req,res,next) => {
    const {error, value} = idSchema.validate(req.params.id);
    if (error) {
        res.status(422).json({error: "L'id de la sauce est invalide."})
    }
    else {
        next()
    }
}

// Schéma de Validation des likes 
const likeSchema = joi.object({
    userId : joi.string().trim().length(20).required(),
    like : joi.valid(-1, 0, 1).required()}
)

//on exporte le middleware du like des sauces 
exports.like = (req, res, next) => {
    const{error, value} = likeSchema.validate(req.body);
    if (error) {
        res.status(422).json({error: "Les données saisies sont invalides."})
    }
    else
    {
        next()
    }
}



