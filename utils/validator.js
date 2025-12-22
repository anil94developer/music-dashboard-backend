const apiResponse = require("../utils/apiResponses");
const crypto = require("crypto");
let validators = {};

validators.checkTypeNew = async (address) => {
    if (address.includes("@")) {
        let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!address.match(regexEmail)) {
            apiResponse.err("Invalid Email Address!!", 406);
        }
        return "emailId";
    } else if (/^[0-9]+$/.test(address)) {
        let regexMobile = /^([+]\d{2})?\d{10}$/;
        if (!address.match(regexMobile)) {
            apiResponse.err("Invalid Mobile Number!!", 406);
        }
        return "mobileNumber";
    }
};

validators.emailValidation = async (address) => {
    if (address == "") {
        // console.log("Field empty. Enter a valid email!");
    } else {
        // console.log(address);
        let regexEmail = /^[\w.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        // const isEmailValid = await validateEmail(address);
        if (!address.match(regexEmail)) {
            apiResponse.err(
                "Invalid Email Address!!",
                406
            );
        }
    }
};
validators.passwordValidation = async (pass) => {
    if (pass == "") {
        // console.log("Field empty. Enter a valid password!");
    } else {
        let regexPass =
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
        if (!pass.match(regexPass)) {
            apiResponse.err(
                "Invalid Password, Password should contain characters, number and special character.",
                406
            );
        }
    }
};

module.exports = validators