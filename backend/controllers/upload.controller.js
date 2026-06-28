import cloudinary from "../services/cloudinary.serivce.js";
import fs from "fs";
import { userModel } from "../models/user.model.js";

export const uploadFile = async (req, res) => {
  let filePath;
  try {
    const user = await userModel.findById(req.user.id);
   
    if (!req.file)
      return res
        .status(401)
        .send({ message: "File is required!", success: false });
    filePath = req.file.path;
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "uploads",
    });
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    user.profilePic = result.secure_url;
    await user.save();
    res.status(201).send({
      message: "File Uploaded Successfully!",
      result,
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log(error.message);
    res.status(500).send({
      message: "File Upload Failed!",
      error,
    });
  }
};
