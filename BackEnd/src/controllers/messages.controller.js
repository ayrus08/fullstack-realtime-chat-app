import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import { getRecieverSocketId } from "../lib/socket.js";
import { io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: myId } }).select(
      "-password"
    );

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("error in getUsersForSidebar controller : ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const personId = req.params.id;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          recieverId: personId,
        },
        {
          senderId: personId,
          recieverId: myId,
        },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessages controller : ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const myId = req.user._id;
    const recieverId = req.params.id;

    let imageURL;

    if (image) {
      //upload img to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURL = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: myId,
      recieverId: recieverId,
      text,
      image: imageURL,
    });

    await newMessage.save();

    //todo  realtime functionality with socket.io
    const recieverSocketId = getRecieverSocketId(recieverId);
    console.log("recieverskt id  = ", recieverSocketId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessages controller : ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
