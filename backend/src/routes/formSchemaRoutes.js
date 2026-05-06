const express = require('express');
const { createSchema, getSchemas, getSchemaById, deleteSchema, updateSchema } = require('../controllers/formSchemaController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').post(protect, admin, createSchema).get(protect, getSchemas);
router.route('/:id')
  .get(protect, getSchemaById)
  .put(protect, admin, updateSchema)
  .delete(protect, admin, deleteSchema);

module.exports = router;