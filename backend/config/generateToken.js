import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1d"});
}

export const generateAccessToken = (user) => {
    return jwt.sign({id:user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"10s"})
}

export const generateRefreshToken = (user) => {
    return jwt.sign({id:user._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})
} 