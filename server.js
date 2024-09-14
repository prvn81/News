const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: 'expressjs',
    resave: false,
    saveUninitialized: true
}));


mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String
    });
const User = mongoose.model('User', userSchema);


app.post('/signup', async (req, res) => {
    const { fname, lname, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const newUser = new User({ fname, lname, email, password });
        await newUser.save();
        req.session.user = { email }; 
        res.status(201).json({ msg: 'Account created successfully' });
        }
        catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ msg: 'Server error' });
        }
        });

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        req.session.user = { email }; 
        res.status(200).json({ msg: 'Login successful' });
        } 
        catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: 'Server error' });
       }
       });


app.get('/isLoggedIn', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ loggedIn: true });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
