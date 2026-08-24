const express = require('express');
const {
  listPlantingRegions,
  getPlantingRegion,
  savePlantingRegion,
  deletePlantingRegion,
  getInspectionDossier,
} = require('../controllers/plantingRegionController');
const { protect, htxOrAdmin } = require('../middlewares/authMiddleware');
const PlantingRegion = require('../models/PlantingRegion');

const router = express.Router();

// ── Farmer-accessible: GET own parcel only ──────────────────────────────────
router.get('/my-parcel', protect, async (req, res) => {
  try {
    const code = req.user?.plantingRegionCode;
    if (!code) {
      return res.json({ success: true, data: null, message: 'Tài khoản chưa được gán vùng trồng.' });
    }
    const region = await PlantingRegion.findOne({ code }).lean();
    return res.json({ success: true, data: region || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Authenticated users (Farmer, HTX, Admin) ────────────────────────────────
router.get('/', protect, listPlantingRegions);

// ── HTX / Admin only for management ─────────────────────────────────────────
router.post('/', protect, htxOrAdmin, savePlantingRegion);
router.get('/:id/dossier', protect, htxOrAdmin, getInspectionDossier);

router.route('/:id')
  .get(protect, getPlantingRegion)
  .put(protect, htxOrAdmin, savePlantingRegion)
  .delete(protect, htxOrAdmin, deletePlantingRegion);

module.exports = router;
