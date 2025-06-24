import express from "express";
import { login, logout, signup, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile",protectRoute, updateProfile); // Allow the user to update their profile, we also build a protectRoute middleware , which will authenticate the user before allowing updateProfile

router.get("/check", protectRoute, checkAuth);

export default router;
