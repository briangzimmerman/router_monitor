const mongoose = require('mongoose');

let Traffic = mongoose.model('Traffic', {
    mac: {
        type: String,
        reqiured: true,
        trim: true,
        maxlength: 16,
        minlength: 16,
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

module.export = {
    Traffic
};