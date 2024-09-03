// // const User = require('../models/User');

// // // Function to get the tokens used by the authenticated user
// // const getUserTokens = async (req, res) => {
// //   try {
// //     // Ensure the user is authenticated
// //     if (!req.isAuthenticated()) {
// //       return res.status(401).json({ error: 'User not authenticated' });
// //     }

// //     // Find the user by ID from the session
// //     const user = await User.findById(req.user._id);

// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }

// //     // Return the tokens used by the user
// //     res.status(200).json({ tokensUsed: user.tokensUsed });
// //   } catch (error) {
// //     console.error('Server error while fetching user tokens:', error);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // };

// // module.exports = { getUserTokens };





// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Function to get the tokens used by the authenticated user
// const getUserTokens = async (req, res) => {
//   try {
//     console.log("getUserToken is called");
//     // Extract the JWT token from the Authorization header
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ error: 'Token is missing' });
//     }

//     // Verify and decode the JWT token to get the user ID
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("my name is rd mishra",decoded.id);
//     const userId = decoded.id;

//     // Find the user by ID from the JWT token
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Return the tokens used by the user
//     res.status(200).json({ tokensUsed: user.tokensUsed });
//   } catch (error) {
//     console.error('Server error while fetching user tokens:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// module.exports = { getUserTokens };




const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Function to get the tokens used by the authenticated user
const getUserTokens = async (req, res) => {
  try {
    console.log("getUserToken is called");
    // Extract the JWT token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token is missing' });
    }

    // Verify and decode the JWT token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded User ID:", decoded.id);
    const userId = decoded.id;

    // Find the user by ID from the JWT token
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
       console.log(user.inputToken,user.outputToken,user.totalToken)
    // Return the tokens used by the user
    res.status(200).json({
      inputToken: user.inputToken,
      outputToken: user.outputToken,
      totalToken: user.totalToken
    });
  } catch (error) {
    console.error('Server error while fetching user tokens:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller function to save a document

const saveDocument = async (req, res) => {
  const { documentName, content, docId } = req.body;
  const userId = req.user.id; // Use userId from the authenticated user's request
  
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Empty document.' });
    }

    if (docId) {
      const doc = user.docs.id(docId);
      if (!doc) {
        user.docs.push({
          title: documentName,
          content: content,
          createdAt: new Date(),
        });
      } else {
        doc.title = documentName;
        doc.content = content;
        doc.createdAt = new Date();
      }
    } else {
      user.docs.push({
        title: documentName,
        content: content,
        createdAt: new Date(),
      });
    }

    await user.save();
    return res.status(200).json({ message: 'Document saved successfully.' });
  } catch (error) {
    console.error('Error saving document:', error);
    return res.status(500).json({ message: 'An error occurred while saving the document.' });
  }
};

// fetch documents using emails

const getDocumentsByUserId = async (req, res) => {
  const userId = req.user.id; // Use userId from the authenticated user's request

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ documents: user.docs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};

module.exports = { getUserTokens, saveDocument, getDocumentsByUserId };
