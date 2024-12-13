const joi = require('@hapi/joi');

const userSchema = joi.object({
    email: joi.string().trim().email().required(),
    password : joi.string().trim().required()
});

exports.user = (req,res,next) => {
    const{error, value} = userSchema.validate(req.body)
    if (error) {
        res.status(422).json({error : "Erreur lors de la tentative de connection"})
    }
        else {
            next()
        }
}

const sauceSchema = joi.object({
    userId: joi.string().trim().required(), 
    name: joi.string().trim().min(4).required(), 
    description : joi.string().trim().required(),
    manufacturer: joi.string().trim().required(), 
    mainPepper: joi.string().trim().required(), 
    imageUrl: joi.string().trim().required(), 
    heat: joi.number().integer().min(1).max(10).required(), 
})

exports.sauce = (req, res, next) => {
    
}



