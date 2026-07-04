import { conversationModel } from "../models/conversation.model.js";
import { userModel } from "../models/user.model.js";

export const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;
    if (senderId === receiverId)
      return res.status(400).send({
        message: "You can not create your own conversation",
        success: false,
      });
    if (!receiverId)
      return res
        .status(400)
        .send({ message: "Please Select User to Send Data", success: false });
    const user = await userModel.findById(receiverId);
    if (!user)
      return res
        .status(404)
        .send({ message: "User Not Found", success: false });
    const existingConversation = await conversationModel.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });
    if (existingConversation) {
      return res.status(200).send({
        message: "Conversation Found",
        success: true,
        existingConversation,
      });
    }
    const newConversation = await conversationModel.create({
      participants: [senderId, receiverId],
    });
    return res.status(201).json({
      message: "New Conversation Created!",
      success: true,
      conversation: newConversation,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      details: error,
      success: false,
    });
  }
};

export const showConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const findConversation = await conversationModel
      .find({
        participants: userId,
      })
      .populate("participants", "name email profilePic bio");
    if (findConversation.length === 0)
      return res
        .status(200)
        .send({
          message: "No Conversation Found!",
          success: false,
          conversation: [],
        });
    return res
      .status(200)
      .send({
        message: `User ${findConversation.length === 1 ? "Conversation" : "Conversations"}`,
        findConversation,
      });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Failed To Find Conversation!", success: false, error });
  }
};
