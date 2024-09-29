const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: [Number], default: [] },
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
