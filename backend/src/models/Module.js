// models/Module.js
const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  dataType: { 
    type: String, 
    required: true,
    enum: ['String', 'Number', 'Boolean', 'Date', 'Array', 'ObjectId'] 
  },
  isRequired: { type: Boolean, default: false },
  isUnique: { type: Boolean, default: false },
  ref: { type: String, default: '' }
});

const moduleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-Z][a-zA-Z0-9]*$/.test(v);
      },
      message: 'Module name must start with a capital letter and contain only alphanumeric characters'
    }
  },
  fields: [fieldSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Module', moduleSchema);