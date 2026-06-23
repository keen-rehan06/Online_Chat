import { userModel } from "../models/user.model.js";
import {sessionModel} from "../models/session.model.js";
import bcrypt from "bcrypt";
import {generateAccessToken, generateRefreshToken, generateToken} from "../config/generateToken.js"
import { verifyEmail } from "../emails/verifyEmail.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
      try {
    const { name, username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      username,
      email,
      password: hash,
    });
    const token = generateToken(user);
    verifyEmail(token, email);
    user.token = token;
    await user.save();
    const newCreatedUser = await userModel
      .findById(user._id)
      .select("-password -token");
    res.cookie("token", token);
    console.log(user);
    res
      .status(201)
      .send({
        message: "user created successfully!",
        success: true,
        data: newCreatedUser,
      });
  } catch (error) {
    console.log(error.message)
    res.status(500).send({ message: "Register failed:", error });
  }
}

export const verifyUser = async(req,res) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).send({message:"Authorization token is missing or invalid",success:false});
        }
        const token = authHeader.split("")[1];
        let decoded;
        try {
            decoded = jwt.verify(token,process.env.JWT_SECRET);
        } catch (error) {
            console.log(error.message)
            return res.status(401).send({message:error,success:false});
        }
        const user = await userModel.findById(decoded._id);
        if(!user) return res.status(404).send({message:"User Not Found!",success:false});
        user.isVerified = true;
        await user.save();
        return res.status(200).send({message:"User Verified SuccessFully!",success:true}); 
    } catch (error) {
        console.log(error.message);
        return res.status(401).send({message:"Verification Failed",success:false,error});
    }
}

export const loginUser = async(req,res) => {
    try {
        const {email,password} = req.body;
    const user = await userModel.findOne({email});
    const comparePassword = bcrypt.compare(password,user.password);
    if(!comparePassword) return res.status(400).send({message:"Incorrect Password"});
    const existingSession = await sessionModel.findOne({userId:user._id});
    if(existingSession) {
        await sessionModel.deleteOne({userId:user._id});
    }
    await sessionModel.create({userId:user._id});
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.isLoggedIn = true;
    user.token = null; 
    user.refreshToken = refreshToken;
    await user.save();
    const newUser = await userModel.findById(user._id).select("-password -refreshToken");
    return res.status(200).send({message:"Login SuccessFully!",success:false,data:newUser})
    } catch (error) {
        console.log(error.message);
        return res.status(401).send(401).send({message:"Login Failed!",error})
    }
} 

export const logoutUser = async(req,res) => {
    try {
        const userId = req.user.id;
        await sessionModel.deleteMany({userId});
        await userModel.findByIdAndUpdate(userId,{isLoggedIn:false});
        res.status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .send({message:"Logout SuccessFully!",sucess:false})
    } catch (error) {
        return res.status(401).send({message:"Logout Failed!",success:false});
    }
}