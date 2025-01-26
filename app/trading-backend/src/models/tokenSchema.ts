import mongoose from 'mongoose';

// Token Schema
const tokenSchema = new mongoose.Schema({
  mintAddress: { 
    type: String, 
    required: true, 
    unique: true 
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