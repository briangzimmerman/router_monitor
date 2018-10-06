const mongoose = require('mongoose');

let Device = mongoose.model('Device', {
    mac: {
        type: String,
        required: true,
        trim: true,
        minlength: 16,
        maxlLength: 16,
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