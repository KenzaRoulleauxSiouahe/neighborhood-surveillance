const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    type: {
        type: String,
        required: true,
    },

    position: {
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
    },
});

module.exports = mongoose.model('Location', locationSchema);