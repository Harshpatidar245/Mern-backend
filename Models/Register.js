const mongoose = require('mongoose')

const RegisterSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    confirmpassword: String
})
const RegisterModel = mongoose.model('signup', RegisterSchema);
module.exports = RegisterModel;