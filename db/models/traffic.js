const mongoose = require('mongoose');

let Traffic = mongoose.model('Traffic', {
    mac: {
        type: String,
        reqiured: true,
        trim: true,
        maxlength: 12,
        minlength: 12,
        uppercase: true
    },
    date: {
        type: Date,
        required: true
    },
    bytes: {
        type: Number,
        required: true,
        min: 0
    }
});

module.exports = {
    Traffic
};