"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const journalController_1 = require("../controllers/journalController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route('/').post(authMiddleware_1.protect, journalController_1.createJournal).get(authMiddleware_1.protect, journalController_1.getJournals);
router.route('/qr/:qrCode').get(journalController_1.getJournalByQr); // Public endpoint for trace
router.route('/:id').put(authMiddleware_1.protect, journalController_1.updateJournal);
exports.default = router;
//# sourceMappingURL=journalRoutes.js.map