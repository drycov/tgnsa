import * as dotenv from "dotenv";
import ejs from "ejs";
import fs from "fs";
import { Context } from "grammy";
import ping from "ping";

import MailTo from "../core/MailTo";

dotenv.config();
// type MyContext = Context & ConversationFlavor;
interface MyContext extends Context {
  session: { [key: string]: any }; // Change the type to match your session data structure
}

// const statusMapping: { [key: string]: string } = {
//   "0": "NO",
//   "1": "YES",
//   "3": "VACATION",
//   да: "YES",
// };
const helperFunctions = {
  delay: (ms: any) => {
    new Promise((resolve) => setTimeout(resolve, ms));
  },
  noop: () => {},

  apptype: () => {
    let token;
    if (process.env.APP_TYPE == "DEV") {
      token = "" || process.env.DEV_TOKEN;
    } else {
      token = "" || process.env.PROD_TOKEN;
    }
    return token;
  },

  setSessionData: (ctx: MyContext) => {
    ctx.session.userId = ctx.message?.from.id;
    ctx.session.userFirstName = ctx.message?.from.first_name;
    ctx.session.userLastName = ctx.message?.from.last_name;
  },
  HumanDate: (date: any) => {
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);
    let hour = date.getHours();
    let minute = date.getMinutes();
    let seconds = date.getSeconds();
    return (
      year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + seconds
    );
  },
  getHumanDate: (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    };

    return date.toLocaleString(undefined, options);
  },
  secToStr: (uptime: any) => {
    const totalSeconds = uptime / 100;
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${days.toString().padStart(2, "0")} дней ${hours
      .toString()
      .padStart(2, "0")} часов ${minutes
      .toString()
      .padStart(2, "0")} минут ${seconds.toString().padStart(2, "0")} секунд`;
  },
  generateEmailTemplate: async (mailData: string, template: string) => {
    // Read the HTML template file
    const htmlTemplate = fs.readFileSync("./src/" + template + ".ejs", "utf-8");

    // Compile the template with EJS
    const compiledTemplate = ejs.compile(htmlTemplate);
    console.log(mailData);
    const mailDataObj = JSON.parse(mailData);
    // Render the template with data (replace "<%= ... %>" placeholders)
    const renderedHtml = compiledTemplate(mailDataObj);

    // Call the function to send the email with the rendered HTML template
    // await sendEmailWithTemplate(renderedHtml);
    return renderedHtml;
  },
  generateVerificationCode: (length = 6) => {
    const characters = "0123456789";
    let code = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }

    return code;
  },
  verifyEmail: async (email: any): Promise<string> => {
    // Generate the verification code
    const verificationCode = helperFunctions.generateVerificationCode(6);

    // Prepare the confirmation email
    const confirmMail = JSON.stringify(
      {
        text: `Пожалуйста введите данный код:${verificationCode}. Для подтверждения корпоративной почты!`,
      },
      null,
      "\t"
    );

    const template = await helperFunctions.generateEmailTemplate(
      confirmMail,
      "confirm-template"
    );

    // Replace 'email' with the user's email address
    // const email = 'user@example.com';

    // Send the confirmation email
    MailTo.sendEmailWithTemplate(template, email, "Верификация почты");

    // // Wait for the user to enter the verification code
    // await ctx.reply("Пожалуйста, введите код подтверждения, отправленный на вашу почту:", {
    //     reply_markup: menu.inBack,
    // });

    // const enteredCode = await conversation.form.text();

    // Check if the entered code matches the generated code
    // const isCodeValid = enteredCode === verificationCode;

    // Return the verification result (true if the code is valid, false otherwise)
    return verificationCode;
  },
  generateVerificationCodes: () => {
    // Generate two random numbers between 1000 and 9999
    const codeA = Math.floor(Math.random() * 90) + 10;
    const codeB = Math.floor(Math.random() * 900000) + 100000;

    // Concatenate the two codes
    // const jointValue = Number(`${codeA}${codeB}`);
    const jointValue = codeA * codeB;

    // Return an object containing both codes and their joint value
    return {
      codeA,
      codeB,
      jointValue,
    };
  },
  isAlive: async (host: any) => {
    return new Promise((resolve) => {
      ping.sys.probe(host, (isAlive) => {
        if (isAlive !== null) {
          resolve(isAlive);
        } else {
          resolve(false); // You might want to handle null value as unreachable
        }
      });
    });
  },
  mWtodBW: (val: number) => {
    const mW = val;
    const dBm = Math.log10(mW);
    const dBW = dBm * 10 - 30;
    return parseFloat(dBW.toFixed(2));
  },
  parseReport: (report: string): any[] => {
    const regex = /\((\d+), (\d+)\)\s+(\w+)\s+(\d+)/g;
    const extractedValues: any[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(report)) !== null) {
      const cablePair = `${match[1]}, ${match[2]}`;
      const cableStatus = match[3];
      const cableLength = parseInt(match[4]);

      extractedValues.push({
        cablePair,
        cableStatus,
        cableLength,
      });
    }

    return extractedValues;
  },
  parseCableLengthReport: (report: string) => {
    const lines = report.split("\n");

    const interfaceName = lines[0].trim();
    const cablePairs: string[] = [];
    const cableStatus: string[] = [];
    const cableLengths: number[] = [];
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [pair, status, length] = line.split(/\s+/);
        cablePairs.push(pair);
        cableStatus.push(status);
        cableLengths.push(parseInt(length));
      }
    }

    return {
      interfaceName,
      cablePairs,
      cableStatus,
      cableLengths,
    };
  },
};

export default helperFunctions;
