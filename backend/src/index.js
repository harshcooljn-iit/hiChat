import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
// Route imports
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app,server } from "./lib/socket.js";


dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// Middlewares should come first
app.use(express.json()); // this is a middleware, that allows us to extract data in json format , like in authcontroller we destructure the user credentials
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
// After the middlewares we can load the routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("/*", (req, res)=>{
        try {
            res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
        } catch (err) {
            console.error("Wildcard route error:", err);
            next(err);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
    connectDB();
});
