const mongoose = require('mongoose');

const FormFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'date', 'select', 'boolean'], required: true },
  options: [{ type: String }],
  required: { type: Boolean, default: false }
});

const FormTableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  fields: [FormFieldSchema]
});

const formSchemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['trongtrot', 'channuoi', 'thuyssan', 'huuco', 'huuco_caytrong', 'huuco_channuoi', 'huuco_thuyssan', 'thongminh'],
    default: 'trongtrot'
  },
  tables: [FormTableSchema]
}, { timestamps: true });

const FormSchema = mongoose.model('FormSchema', formSchemaSchema);
module.exports = FormSchema;