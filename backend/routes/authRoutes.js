import express from "express";
import { getMe, signup, login, forgotPassword, resetPassword, editProfile }  from "../controllers/authController.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/profile", protect, editProfile); //patch and put both are used to update the data but put is used to update the whole data and patch is used to update the specific data

export default router;
