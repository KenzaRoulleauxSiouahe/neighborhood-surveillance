const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    house: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    role:{
        type: String,
        required: true,
    },

    isCultMember: {
        type: Boolean,
        default: false
    }
});

module .exports = mongoose.model('Resident', residentSchema);