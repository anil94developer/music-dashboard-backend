const mongoose = require("mongoose");

const globalCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: "GlobalISRC" }, // Unique ID for the global counter
    value: { type: Number, default: 0, required: true }, // Counter value (incremental number)
    updatedAt: { type: Date, default: Date.now } // Timestamp for the last update
});

// Create the model
const GlobalCounter = mongoose.model("GlobalCounter", globalCounterSchema);

module.exports = GlobalCounter;
