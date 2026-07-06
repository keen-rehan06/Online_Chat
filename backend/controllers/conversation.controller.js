import { userModel } from "../models/user.model.js";
import { conversationModel } from "../models/conversation.model.js";
import { messageModel } from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;
    if (!receiverId)
      return res
        .status(404)
        .send({ message: "Reciver Need to Send Message", success: false });
    if (!senderId)
      return res
        .status(400)
        .send({ message: "Please! login First", success: false });
    const receiver = await userModel.findById(receiverId);
    if (!receiver) {
      return res.status(400).send({
        message: "Receiver Not Found!",
        success: false,
      });
    }
    if (receiverId === senderId)
      return res.status(401).send({
        message: "You can not create your own conversation!",
        success: false,
      });
    const checkConversation = await conversationModel.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });
    if (checkConversation)
      return res.status(200).send({
        message: "Conversation Found!",
        conversation: checkConversation,
        success: true,
      });
    const newConversation = await conversationModel.create({
      participants: [senderId, receiverId],
    });
    res.status(201).send({
      message: "New Conversation Created!",
      success: true,
      data: newConversation,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      message: "Failed to create Conversation",
      details: error,
      success: false,
    });
  }
};

// find the conversation and populate participants
// check conversation length is 0
// rather give conversations

export const showConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const findConversations = await conversationModel
      .find({ participants: userId })
      .populate("participants", "name email profilePic");
    if (!findConversations)
      return res
        .status(200)
        .send({ message: "No conversation Found!", success: false, data: [] });

    return res
      .status(200)
      .send({
        message: `User ${findConversation.length === 1 ? "Conversation" : "Conversations"}`,
        success: true,
        conversation: findConversations,
      });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Failed To Find Conversation!", success: false, error });
  }
};
