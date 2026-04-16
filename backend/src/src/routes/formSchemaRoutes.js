"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const formSchemaController_1 = require("../controllers/formSchemaController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.route('/').post(authMiddleware_1.protect, authMiddleware_1.admin, formSchemaController_1.createSchema).get(authMiddleware_1.protect, formSchemaController_1.getSchemas);
router.route('/:id').get(authMiddleware_1.protect, formSchemaController_1.getSchemaById).delete(authMiddleware_1.protect, authMiddleware_1.admin, formSchemaController_1.deleteSchema);
exports.default = router;
//# sourceMappingURL=formSchemaRoutes.js.map