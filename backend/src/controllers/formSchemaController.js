const FormSchema = require('../models/FormSchema');

const createSchema = async (req, res) => {
  try {
    const schema = new FormSchema(req.body);
    const createdSchema = await schema.save();
    res.status(201).json({ success: true, data: createdSchema });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSchemas = async (req, res) => {
  try {
    const schemas = await FormSchema.find({});
    res.json({ success: true, data: schemas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSchemaById = async (req, res) => {
  try {
    const schema = await FormSchema.findById(req.params.id);
    if (schema) {
      res.json({ success: true, data: schema });
    } else {
      res.status(404).json({ success: false, message: 'Schema not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSchema = async (req, res) => {
  try {
    const schema = await FormSchema.findByIdAndDelete(req.params.id);
    if (schema) {
      res.json({ success: true, message: 'Schema removed' });
    } else {
      res.status(404).json({ success: false, message: 'Schema not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSchema, getSchemas, getSchemaById, deleteSchema };