const validateInput = (input) => {
    // Regular expression for validating email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // Regular expression for validating mobile numbers (example for US numbers)
    // Adjust the regex for the specific mobile number format you want to support
    const mobileRegex = /^\d{10}$/;  // This regex matches a 10-digit number
  
    if (emailRegex.test(input)) {
      return 'emailId';
    } else if (mobileRegex.test(input)) {
      return 'mobileNumber';
    } else {
      return 'invalid';
    }
  };
  module.exports = validateInput