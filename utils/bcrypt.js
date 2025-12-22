const bcrypt = require("bcrypt");

module.exports = {
    passwordEncryption(password) {
        return new Promise((resolve, Reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                resolve(hash)
            })
        })
    },
    passwordComparision(enteredPassword,servicePassword) {
        return new Promise((resolve, Reject) => {
            bcrypt.compare(enteredPassword, servicePassword, (err, same) => {
                resolve(same)
            })
        })
    },
}