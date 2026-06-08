const express = require('express');
const {
  listPlantingRegions,
  getPlantingRegion,
  savePlantingRegion,
  deletePlantingRegion,
  getInspectionDossier,
} = require('../controllers/plantingRegionController');
const { protect, htxOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, htxOrAdmin);

router.route('/')
  .get(listPlantingRegions)
  .post(savePlantingRegion);

router.get('/:id/dossier', getInspectionDossier);

router.route('/:id')
  .get(getPlantingRegion)
  .put(savePlantingRegion)
  .delete(deletePlantingRegion);

module.exports = router;
