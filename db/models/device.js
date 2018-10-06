const mongoose = require('mongoose');

let Device = mongoose.model('Device', {
    mac: {
        type: String,
        required: true,
        trim: true,
        minlength: 12,
        maxlength: 12,
        unique: true,
        uppercase: true
    },
    nickname: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlLength: 16
    }
});

module.exports = {
    Device
};