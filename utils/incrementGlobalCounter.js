const GlobalCounter = require("../models/isrcmodel");

const getNextGlobalCounter = async () => {
    try {
        // Atomically increment the counter by 1
        const result = await GlobalCounter.findOneAndUpdate(
            { _id: "GlobalISRC" }, // Identifier for the global counter
            { 
                $inc: { value: 1 }, // Increment the counter value
                $set: { updatedAt: new Date() } // Update the timestamp
            },
            { new: true, upsert: true } // Return updated document, create if not exists
        );

        return result.value; // Return the updated counter value
    } catch (error) {
        console.error("Error updating global counter:", error);
        throw new Error("Failed to update global counter");
    }
};

module.exports = getNextGlobalCounter;
