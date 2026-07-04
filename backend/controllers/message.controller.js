import { conversationModel } from "../models/conversation.model.js";
import { userModel } from "../models/user.model.js";
import { messageModel } from "../models/message.model.js";

export const createMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const receiverId = req.params;
    const senderId = req.user.id;
    if (!conversation || !content)
      return res
        .status(401)
        .send({ message: "All fileds are required!", success: false });
    const checkExistingSession = await conversationModel.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });
  if(!checkExistingSession) return res.status(404).send({message:"No conversation found",success:false});
   const createMessage = await messageModel
  } catch (error) {}
};
