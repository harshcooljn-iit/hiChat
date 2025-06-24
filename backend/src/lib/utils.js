import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "7d" // This token is valid for 7 days
    }); // Payload – Contains the claims or data (e.g., user ID, roles, expiration).

    res.cookie("jwt", token, { // sending a cookie in the response
        maxAge: 7 * 24 * 60 * 60 * 1000, // day to ms , so this cookie will be stored in the user's system for 7 days and then the user will have to login again
        httpOnly: true, // prevent XSS attacks (cross-site scripting) attacks
        sameSite: "strict", // prevent CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development", // because in the development mode we have http and in production mode we have https , s for secure 
    });

    return token;
};
