import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; // .jwt because we defined the cookie that way in generatetoken function in utils.js
        // Note that we have used cookieParser() middleware in our index.js file , so this cookie will be parsed automatically and then we can extract .jwt
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No auth token found" });
        }

        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password"); // This userId is actually user._id , that we named as userId in generateToken function

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware: ",error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
