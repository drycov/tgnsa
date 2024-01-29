import nodemailer, { TransportOptions } from "nodemailer";
import * as path from "path";
import logger from "../utils/logger";
import helperFunctions from "../utils/helperFunctions";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
const config = require(configPath);

const sendEmailWithTemplate = async (
  renderedHtml: string,
  to: string,
  subject: string
) => {

  const transporter = nodemailer.createTransport({
    host: config.smtp_client.smtp_server, // Replace with your SMTP host
    port: config.smtp_client.smtp_port, // Replace with your SMTP port (usually 587 or 465 for SSL)
    secure: false, // Set to true if using SSL (e.g., port 465), false otherwise
    auth: {
      user: config.smtp_client.smtp_user, // Replace with your email address
      pass: config.smtp_client.smtp_pwd, // Replace with your email password
    },
  } as TransportOptions);

  const mailOptions: nodemailer.SendMailOptions = {
    from: config.smtp_client.smtp_from, // Replace with the sender's email address
    to: to, // Replace with the recipient's email address
    subject: subject, // Replace with the email subject
    html: renderedHtml, // The rendered HTML content from the template
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions).then((res) => {
      return res;
    });
    return info;
  } catch (e:any) {
    const error = {
      date: helperFunctions.currentDate,
      // action,
      error: e.message as string,
    };
    logger.error(JSON.stringify(error));
    return e;
  }
  // return info.messageId
};
export default { sendEmailWithTemplate };
