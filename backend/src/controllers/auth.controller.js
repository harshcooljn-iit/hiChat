import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    // SIGN UP LOGIC/FLOW

    // Fetch user credentials 
    const {fullName, email, password} = req.body;  // get all of this from the front end form
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    try {

        if (!fullName || !email || !password){
            res.status(400).json({ message: "All fields are required" });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        if (password.length < 6){
            return res.status(400).json({ message: "Password must be atleast 6 characters" });
        }

        const user = await User.findOne({email});
        if (user) return res.status(400).json({ message: "Email already exists" });
        
        // hash password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        // create the user
        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword,
        });

        if (newUser){
            // generate jwt token
            generateToken(newUser._id, res); // MongoDB automatically adds a _id parameter for each entry
            await newUser.save(); // this will save the user into the mongoDB database
            
            res.status(201).json({ // returning the user details in the response, for future use in the frontend
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

        } else{
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error){
        console.log("Error in sign-up controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
    // LOGIN Logic
    const {email, password} = req.body
    try{
        const user = await User.findOne({email});
        if (!user){
            return res.status(400).json({message:"Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            createdAt: user.createdAt,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logout = (req, res) => {
    // To logout the user we should just clear the cookie which has the jwt token
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({"message": "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if (!profilePic){
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url }, 
            { new: true }); // this new: true , returns the update user to const updatedUser

        res.status(200).json(updatedUser); // sending the user details in the response for future use in the frontend

    } catch (error) {
        console.log("error in updateProfile controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
