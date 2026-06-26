import nodemailer from "nodemailer";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { error } from "console";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export const sendOtpOnMail = (otp, email,token) => {
  const emailTemplateSource = fs.readFileSync(
    path.join(_dirname, "template.hbs"),
    "utf-8",
  );
  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template({ token: encodeURIComponent(token) });

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.USER_MAIL_PASS,
    },
  });
  const mailOption = {
    from:process.env.USER_MAIL,
    to:email,
    subject: htmlToSend
  }
  transport.sendMail(mailOption,(err,res) => {
    if(err) throw new error(err);
    console.log("Email has been sent successFully!");
  })
};
