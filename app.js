require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const authRoutes = require('./routes/authRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 7000;

// Session setup
app.use(session({ secret: 'we-api', resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.json());
/*
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { profile, accessToken });
}));

// Passport configuration for Facebook
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { profile, accessToken });
}));

// Passport configuration for Google
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
*/
// Use auth routes

app.use(cors({
    origin: ['http://localhost:3000','http://localhost:5000'], // Adjust this to match your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Methods'], // Add necessary headers
}));


// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*"); // Replace with your frontend URL
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     res.header("Accept", "*/*");
//     res.header("Content-Type", "application/json");
//     next();
// });

app.use('/auth', authRoutes);
app.use('/api', agencyRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to the Google and Facebook Login API!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BASE_URL}`);
});
