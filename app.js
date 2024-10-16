require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const authRoutes = require('./routes/authRoutes');
const agencyRoutes = require('./routes/agencyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Session setup
app.use(session({ secret: 'we-api', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

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

// Use auth routes
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
