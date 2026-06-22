import { userModel } from "../models/user.model.js";

export const userRegisterChecks = (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)  return res.status(401).send({ message: "All Fileds Are required!", success: false });
        const user = await userModel.findOne({ email });
        if (user) return res.status(409).send({ message: "User Already Exist.", success: false });
        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") return res.status(401).send({ message: "All filed must be string", success: false });
        if (name.trim().length < 3) return res.status(401).send({ message: "Name must be atleast 3 characters", success: false })
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).send({
            messgae: 'Invalid email format',
            success: false
        });
        if (password.length < 6) return res.status(400).send({ message: "Password must be at least 6 characters" });
        if (password.length > 12) return res.status(400).send({ message: "Too Long Password only 12 character Password allowed.", success: false });
        next();
    } catch (error) {
        console.log(error.message);
        res.status(401).send({ message: "Internal Server Error:", error })
    }
}

export const userLoginChecks = async (req,res,next) => {
    try {
         const {email,password} = req.body;
         if(!email || !password) return res.status(400).send({message:"All fields are required!",success:false});
         if(typeof email !== "string" || typeof password !== "string") return res.status(400).send({message: "All filed must be string", success:false})
            const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) return res.status(400).send({message:"Invalid Email Format",success:false});
         const user = await userModel.findOne({email});
         if(!user) return res.status(404).send({message:"User Not Found!",success:false});
         next();
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({message:"Internal Server Error",error});
    }
}