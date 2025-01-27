import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  creator: {
    type: String,
    required: true,
  },
  mintAddress: { 
    type: String, 
    required: false, 
    unique: true 
  },
  secretKey: {
    type: String,
    required: false,
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
  imageUrl: {
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
