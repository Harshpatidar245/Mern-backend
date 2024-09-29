const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Map, of: Number },
});

module.exports = mongoose.model('Cart', CartSchema);
