import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password"); // selecting all users except the user themselves $ne means not equal to
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar controller : ",error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getMessages = async (req, res) => {
    try {

        const { id: userToChatId } = req.params // since in the route we defined it as /:id , so we must extract using id , and then we rename it to userToChatId
        const myId = req.user._id; // this is the senderId , that is the user that is currently logged in and this user is making the request , so req.user._id 

        const messages = await Message.find({
            $or:[ // filter messages , choose only those messages that are between myId and userTochatId
                {senderId: myId, receiverId: userToChatId}, 
                {senderId: userToChatId, receiverId: myId},
            ]
        }).sort({createdAt: 1}); // this will sort the messages chronologically

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessages controller : ",error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const sendMessage = async (req, res) => { // the message can be both text or image or both
    try {
        const { text, image } = req.body; // since it is a post request , req.body contains the text and image
        const {id: receiverId} = req.params; // this user is the one we want to send the messages to
        const senderId = req.user._id; // this user is the currently logged in user , it comes from protectRoute auth middleware, by verifying jwt token

        let imageUrl;
        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId: senderId,
            receiverId: receiverId,
            text: text,
            image: imageUrl,
        });

        await newMessage.save();

        // todo : realtime functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId){ // if the user is online , only then we need to do it in real time
            io.to(receiverSocketId).emit("newMessage", newMessage); // we are only sending this message to the receiver by using .to() before .emit() instead of all users
        }
        
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller : ",error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
