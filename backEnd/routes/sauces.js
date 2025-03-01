const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const multer = require('../middleware/multerSetting');
const sauceCtrl = require('../controllers/sauceController');
const validate = require('../middleware/validInputs');


router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, validate.id, sauceCtrl.getOneSauce);
console.log("route1");
router.post('/', auth, multer.upload, validate.sauce, sauceCtrl.createSauce);
router.put('/:id', auth, multer.upload, multer.convertToWebp, validate.id, validate.sauce, sauceCtrl.updateSauce);
router.delete('/:id', auth, validate.id, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, validate.id, validate.like, sauceCtrl.likeSauce);


module.exports = router;