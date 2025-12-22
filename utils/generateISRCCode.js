const getNextGlobalCounter = require("./incrementGlobalCounter");

const generateGlobalISRCCode = async () => {
    const fixedPart = "INR2P"; // Fixed prefix for ISRC
    const year = new Date().getFullYear().toString().slice(-2); // Last two digits of the current year
    const incrementalValue = await getNextGlobalCounter(); // Get the next global counter value
    const paddedIncremental = String(incrementalValue).padStart(5, "0"); // Pad with leading zeroes (up to 5 digits)
    return `${fixedPart}${year}${paddedIncremental}`; // Combine all parts to form the ISRC code
};

module.exports = generateGlobalISRCCode;
