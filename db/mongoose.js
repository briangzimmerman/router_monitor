const mongoose = require('mongoose');
const config = require('../config.json');

mongoose.Promise = global.Promise;

if(config.is_testing) {
    mongoose.connect(config.development.MONGODB_URI);
} else {
    mongoose.connect(config.production.MONGODB_URI);
}

module.exports = {
    mongoose
};