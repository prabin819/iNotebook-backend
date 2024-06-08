const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/inotebook";

const connectToMongo =async () => {
    await mongoose.connect(mongoURI).then(console.log("mongoose connected"));
}

module.exports = connectToMongo;