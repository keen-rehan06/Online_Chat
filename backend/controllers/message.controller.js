// conversationId and content lo req body se and dono ki possiblities check karo
// conversation ki id se conversation model me check karo exist karta hai ky
//  wo populate ka thodha syntax
// message create karo
// conversation ke last message and lastmessageat dono ko update karo
// conversationid and sender populate kare ke dono ko response me bhjo

import { conversationModel } from "../models/conversation.model.js";
import { userModel } from "../models/user.model.js";
import {messageModel} from "../models/message.model.js"

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user.id;
    if (!conversationId || !content)
      return res
        .status(401)
        .send({ message: "All fields are required!", success: false });
    const conversation = await conversationModel.findById(conversationId);
    if (!conversation)
      return res
        .status(404)
        .send({ message: "Conversation Not Found", success: false });
    const isParticipant = conversation.participants.some((participant) => participant.toString() === userId.toString());
    if (!isParticipant)
      return res
        .status(401)
        .send({
          message: "You can't send message in these conversation!",
          success: false,
        });
    const message = await messageModel.create({
      conversationId: conversation._id,
      sender: userId,
      content,
    });
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();
    const populateMessage = await messageModel
      .findById(message._id)
      .populate("conversationId")
      .populate("sender", "name email profilePic");
    return res
      .status(200)
      .send({
        message: "Message Sent SuccessFully!",
        success: true,
        data: populateMessage,
      });
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return res
      .status(500)
      .send({ message: "Failed to Send Message!", success: false, error });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        message: "ConversationId not provided!",
        success: false,
      });
    }

    const messages = await messageModel
      .find({ conversationId: id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.status(404).send({
        message: "No messages found!",
        success: false,
      });
    }

    return res.status(200).send({
      message: "User messages fetched successfully",
      success: true,
      messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      message: "Failed to fetch messages!",
      success: false,
      error: error.message,
    });
  }
};