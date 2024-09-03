




const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const promptRoutes = require('./routes/promptRoutes');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
const app = express();


// CORS setup with credentials
app.use(cors({
  origin: 'https://aif-gold.vercel.app',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));


const mongoURI=process.env.MONGO_URI;
mongoose.connect(mongoURI,{
useNewUrlParser:true,
useUnifiedTopology:true
}).then(()=>console.log('MongoDb connceted')).catch(err=>console.error('MongoDb connection error',err));


app.use(express.json()); // For parsing application/json


// Google OAuth endpoint
app.get('/auth/google', (req, res) => {
  const redirect_uri = encodeURIComponent('https://aaiserver.onrender.com/auth/google/callback');
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const scope = encodeURIComponent('profile email');
  const response_type = 'code';
  const google_auth_url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&response_type=${response_type}`;

  res.redirect(google_auth_url);
});

// Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  const redirect_uri = 'https://aaiserver.onrender.com/auth/google/callback';
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;

  try {
    // Exchange the code for an access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code'
    });

    const accessToken = tokenResponse.data.access_token;

    // Retrieve user information
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const { id, email, name, picture } = userResponse.data;

    let user = await User.findOne({ googleId: id });
    if (!user) {
      user = new User({
        googleId: id,
        email: email,
        displayName: name,
        picture: picture,
        tokensUsed: 0
      });
      await user.save();
      console.log('New user created:', user);
    } else {
      console.log('User exists:', user);
    }

    // Generate JWT
    const tokenPayload = { id: user.id };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '14d' });

    // Redirect to frontend with the token
    res.redirect(`https://aif-gold.vercel.app/?token=${token}`);
  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    res.redirect('/login-failed');
  }
});

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token is not valid' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Token is missing' });
  }
};

// Protect your API routes with the authenticateJWT middleware
app.use('/api', authenticateJWT, promptRoutes);
app.use('/api', authenticateJWT, userRoutes);

// Endpoint to get user data
app.get('/api/user', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json({
        name: user.displayName || user.email,
        picture: user.picture || 'default-avatar-url',
        email: user.email,
        googleId: user.googleId
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
