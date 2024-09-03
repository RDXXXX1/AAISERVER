// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   googleId: { type: String, required: true, unique: true },
//   email: { type: String, unique: true, sparse: true }, 
//   displayName: { type: String }, 
//   picture: { type: String } 
// });

// module.exports = mongoose.model('User', UserSchema);



// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   googleId: { type: String, required: true, unique: true },
//   email: { type: String, unique: true, sparse: true },
//   displayName: { type: String },
//   picture: { type: String },
//   tokensUsed: { type: Number, default: 0 } // Add this field
// });

// module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  displayName: { type: String },
  picture: { type: String },
 
  docs: [
    {
      title: { type: String, required: true },
      content: { type: String},
      createdAt: { type: Date, default: Date.now }
    }
  ],
  inputToken:{type:Number,default:0},
  outputToken:{type:Number,default:0}, 
  totalToken: { type: Number, default: 0 } // Add this field
});

module.exports = mongoose.model('User', UserSchema);

