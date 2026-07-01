import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true },
);

export const conversationModel = new mongoose.model("conversation",conversationSchema);