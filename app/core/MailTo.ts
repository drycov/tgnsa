import nodemailer, { TransportOptions } from "nodemailer";
import config from '../config';


const sendEmailWithTemplate = async (renderedHtml: string, to: string, subject: string) => {

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
        const info = await transporter.sendMail(mailOptions).then((res) => { return res });
        // console.log('Email sent:', info.response);
        return info
    } catch (error) {
        console.error('Error sending email:', error);
        return error
    }
    // return info.messageId
}
export default { sendEmailWithTemplate }