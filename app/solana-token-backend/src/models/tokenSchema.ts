import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  mintAddress: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  tweetId: {
    type: String,
    required: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

export const Token = mongoose.model('Token', tokenSchema);
