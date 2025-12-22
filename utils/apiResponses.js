const createError = require('http-errors');
responses = {}


responses.err = (msg, status) => {
    // console.log("❌ RESPOONSE ERROR:", msg, status)
    let err = createError(status, msg);
    return err;
};


module.exports = responses;