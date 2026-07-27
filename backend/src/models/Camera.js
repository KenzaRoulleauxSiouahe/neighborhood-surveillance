const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    location: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        default: null
    },

    active: {
        type: Boolean,
        default: false,
    },

    range: {
        type: Number,
        default: 1,
    },
});

module.exports = mongoose.model("Camera", cameraSchema);