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



