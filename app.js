require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const authRoutes = require('./routes/authRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const imageRoutes = require('./routes/imageRoutes');
const stateRoutes = require('./routes/stateRoutes');
const cityRoutes = require('./routes/cityRoutes');
const districtRoutes = require('./routes/districtRoutes');
const propertyTypeListingsRoutes = require('./routes/propertyTypeListingsRoutes');
const cors = require('cors');
const i18n = require('i18n');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 7000;

// Session setup
app.use(session({ secret: 'we-api', resave: false, saveUninitialized: true }));

// app.use(passport.initialize());
// app.use(passport.session());
app.use(express.json());

// Language
i18n.configure({
    locales: ['en', 'fr'],  // Add other languages as needed
    directory: path.join(__dirname,  'components','translations'),
    defaultLocale: 'en',
    objectNotation: true,
});
app.use(i18n.init);


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
app.use((req, res, next) => {
    const lang = req.body.lang || 'en';
    res.setLocale(lang);
    next();
});
app.use('/auth', authRoutes);
app.use('/api', agencyRoutes);
app.use('/api/images', imageRoutes); // Add image routes
app.use('/api/state', stateRoutes);
app.use('/api/city', cityRoutes);
app.use('/api/district', districtRoutes);
app.use('/api/property-type-listings', propertyTypeListingsRoutes);


// Home route
app.get('/', (req, res) => {
    res.send('Welcome to the Immofind API!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.BASE_URL}`);
});
