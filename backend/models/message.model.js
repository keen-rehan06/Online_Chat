import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    consversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    content: [
      {
        type: String,
        required: true,
        required: true,
        index: true,
      },
    ],
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "document"],
      default: "text",
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
  },
);
