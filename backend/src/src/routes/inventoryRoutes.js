"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryController_1 = require("../controllers/inventoryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route('/').get(authMiddleware_1.protect, inventoryController_1.getItems).post(authMiddleware_1.protect, authMiddleware_1.admin, inventoryController_1.createItem);
router.route('/transaction').post(authMiddleware_1.protect, inventoryController_1.processTransaction);
exports.default = router;
//# sourceMappingURL=inventoryRoutes.js.map