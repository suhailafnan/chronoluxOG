const nodemailer = require('nodemailer');
const mailSender = async (email, title, body) => {
  try {
   
    // Create a Transporter to send emails
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      service:"gmail",
      auth: {
        user:process.env.MAIL_SENDER,
        pass:process.env.PASSWORD_SECRET,
      }
    });
  
    // Send emails to users
    let info = await transporter.sendMail({
      from: process.env.MAIL_SENDER,
      to: email,
      subject: title,
      html: body,
    });
   // console.log("Email info: ", info);
    // return info;
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = mailSender;