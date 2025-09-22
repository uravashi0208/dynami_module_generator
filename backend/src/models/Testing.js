const mongoose = require('mongoose');

const testingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Testing', testingSchema);