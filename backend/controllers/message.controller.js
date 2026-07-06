import { conversationModel } from "../models/conversation.model.js";
import { userModel } from "../models/user.model.js";
import { messageModel } from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user.id;
    if (!conversationId || !content)
      return res
        .status(401)
        .send({ message: "All fileds are required!", success: false });
    const conversation = await conversationModel.findById(conversationId);
    if (!conversation)
      return res
        .status(404)
        .send({ message: "Conversation Not Found!", success: false });
    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId.toString(),
    );
    if (!isParticipant)
      return res
        .status(401)
        .send({ message: "You can't send message in these conversation!" });
    const message = await messageModel.create({
      consversationId: conversation._id,
      sender: userId,
      content: content.trim(),
    });
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();
    const populateMessage = await messageModel
      .findById(message._id)
      .populate("consversationId")
      .populate("sender", "name profilePic")

      return res.status(200).send({message:"Message Sent SuccessFully!",success:true,data:populateMessage});
  } catch (error) {
    console.log(error.message)
    return res.status(500).send({message:"Failed to Send Message!",success:false,error});
  }
};
