import { userModel } from "../models/user.model.js";

export const getMe = async (req,res) => {
  try {
    const user = await userModel.findById(req.user.id);
    return res.status(200).send({data:user});
  } catch (error) {
    return res.status(500).send({message:error.message,success:false});
  }
}

export const UpdateUserProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found", success: false });
    }

    if (name === undefined && bio === undefined) {
      return res
        .status(400)
        .send({ message: "Nothing to update", success: false });
    }

    if (name !== undefined) {
      if (name.trim() === "") {
        return res
          .status(400)
          .send({ message: "Name cannot be empty", success: false });
      }
      user.name = name;
    }

    if (bio !== undefined) {
      if (bio.length > 100) {
        return res
          .status(400)
          .send({ message: "Too Long Bio", success: false });
      }
      user.bio = bio;
    }

    await user.save();

    const newUser = await userModel
      .findById(user._id)
      .select("-password -refreshToken");

    return res.status(200).send({
      message: "User Update Profile!",
      success: true,
      data: newUser,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      message: "User Failed To Update Profile!",
      success: false,
      error,
    });
  }
};