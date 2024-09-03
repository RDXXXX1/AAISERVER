// middleware/auth.js
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next(); // User is authenticated, proceed to the next middleware/route handler
    }
    res.status(401).json({ error: 'User not authenticated' }); // User is not authenticated
  };
  
  module.exports = ensureAuthenticated;