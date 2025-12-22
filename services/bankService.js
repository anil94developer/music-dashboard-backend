const R = require("../utils/responseHelper"); 
const bankModel =require('./../models/bankmodels')

const bank = {};

bank.addbank = async (req, res, next) => {
     
    const body = {
        ...req.body,           // Spread the existing keys from req.body
        userId: req.doc.userId // Add a new key `userId` from req.doc
    };
    try { 
        const result = await bankModel.addbank(body) 
        return R(res, true, "Add Successfully!!", result, 200)
    } catch (err) { 
        next(err)
    }
};
bank.bankDetails = async (req, res, next) => { 
    try { 
        const result = await bankModel.bankDetails(req.doc.userId) 
        return R(res, true, "Fetch Successfully!!", result, 200)
    } catch (err) { 
        next(err)
    }
};


module.exports = bank;



