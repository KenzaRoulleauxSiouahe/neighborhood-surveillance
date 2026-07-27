const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    zone: { 
        type: String,
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