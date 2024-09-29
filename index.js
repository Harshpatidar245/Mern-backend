const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RegisterModel = require('./Models/Register');
const CartModel = require('./Models/CartModel'); // Create this model
const WishlistModel = require('./Models/WishlistModel'); // Create this model

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_jwt_secret_key';

mongoose.connect('mongodb://localhost:27017/GOJO-Shop', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Signup Route
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;
    try {
        const existingUser = await RegisterModel.findOne({ email });
        if (existingUser) {
            return res.json({ message: 'Already have an account' });
        }
        if (password !== confirmpassword) {
            return res.json({ message: 'Passwords do not match' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await RegisterModel.create({ name, email, password: hashedPassword });
        res.json({ message: 'User created successfully', user, redirect: '/login' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await RegisterModel.findOne({ email });
        if (!user) {
            return res.status(400).json('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json('Incorrect password');
        }
        const payload = { id: user.id, name: user.name };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, redirect: '/userdata' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json('Unauthorized');
    }
};

// Cart Routes
app.post('/cart', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { cartItems } = req.body;
    try {
        let cart = await CartModel.findOne({ userId });
        if (cart) {
            cart.items = cartItems;
        } else {
            cart = new CartModel({ userId, items: cartItems });
        }
        await cart.save();
        res.status(200).json({ message: 'Cart saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/cart', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const cart = await CartModel.findOne({ userId });
        res.status(200).json(cart ? cart.items : {});
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Wishlist Routes
app.post('/wishlist', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { wishlist } = req.body;
    try {
        let wish = await WishlistModel.findOne({ userId });
        if (wish) {
            wish.items = wishlist;
        } else {
            wish = new WishlistModel({ userId, items: wishlist });
        }
        await wish.save();
        res.status(200).json({ message: 'Wishlist saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/wishlist', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const wishlist = await WishlistModel.findOne({ userId });
        res.status(200).json(wishlist ? wishlist.items : []);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
