import {v2 as cloudinary} from "cloudinary";
configDotenv({path:"./.env"});
import { configDotenv } from "dotenv";

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export default cloudinary;