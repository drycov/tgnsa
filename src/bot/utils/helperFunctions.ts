import { createCanvas } from 'canvas';
import Table from "cli-table3";
import * as dotenv from "dotenv";
import ejs from "ejs";
import * as fs from 'fs';
import { Context } from "grammy";
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import ping from "ping";
import symbols from "../assets/symbols";
import MailTo from "../core/MailTo";
import { db } from "./firebaseConfig";
import logger from "./logger";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
dotenv.config();

interface MyContext extends Context {
  session: { [key: string]: any };
}

interface TelegramCommand {
  command: string;
  ipAddress: string;
  port: number;
}

interface CommandParams {
  [key: string]: string;
}

const helperFunctions = {
  delay: async (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  currentDate: new Date().toLocaleString("ru-RU"),

  getTextDimensions: (text: string, font: string) => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    return ctx.measureText(text);
  },

  textToPNG: async (inputFilePath: string, outputFilePath: string) => {
    const action = helperFunctions.monitorFirestoreChanges.name;

    try {
      const textContent = fs.readFileSync(inputFilePath, 'utf-8');
      const lines = textContent.split('\n');
      const font = '12px Arial';
      const lineHeight = 20;

      let maxWidth = 0;
      lines.forEach(line => {
        const dimensions = helperFunctions.getTextDimensions(line, font);
        maxWidth = Math.max(maxWidth, dimensions.width);
      });

      const canvas = createCanvas(maxWidth + 20, (lines.length - 4) * lineHeight + 20);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = font;

      let yPos = lineHeight;
      lines.forEach(line => {
        if (!line.includes('|--------|---------|---------|---------|----------|')) {
          ctx.fillText(line, 10, yPos);
          yPos += lineHeight;
        }
      });

      const trimmedCanvas = createCanvas(maxWidth + 20, yPos);
      const trimmedCtx = trimmedCanvas.getContext('2d');
      trimmedCtx.drawImage(canvas, 0, 0, trimmedCanvas.width, trimmedCanvas.height, 0, 0, trimmedCanvas.width, trimmedCanvas.height);

      const buffer = trimmedCanvas.toBuffer('image/png');
      fs.writeFileSync(outputFilePath, buffer);
      const message = {
        date: helperFunctions.currentDate,
        action,
        pid: process.pid,
        status: `Изображение успешно сохранено ${outputFilePath}`,
      };
      logger.info(JSON.stringify(message));
    } catch (e: any) {
      const error = {
        date: helperFunctions.currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
    }
  },

  noop: () => { },

  apptype: () => {
    const token = process.env.APP_TYPE === "DEV" ? process.env.DEV_TOKEN || "" : process.env.PROD_TOKEN || "";
    return token;
  },

  setSessionData: (ctx: MyContext) => {
    ctx.session.userId = ctx.message?.from.id;
    ctx.session.userFirstName = ctx.message?.from.first_name;
    ctx.session.userLastName = ctx.message?.from.last_name;
  },

  HumanDate: (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return date.toLocaleString("ru-RU", options);
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
    return date.toLocaleString("ru-RU", options);
  },

  get2DigDate: (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    return date.toLocaleString("ru-RU", options);

  },

  secToStr: (uptime: number) => {
    const totalSeconds = uptime / 100;
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${days.toString().padStart(2, "0")} дней ${hours.toString().padStart(2, "0")} часов ${minutes.toString().padStart(2, "0")} минут ${seconds.toString().padStart(2, "0")} секунд`;
  },

  generateEmailTemplate: async (mailData: string, template: string) => {
    const filePath = path.join(__dirname, '../../', 'src', `${template}.ejs`);
    const htmlTemplate = fs.readFileSync(filePath, "utf-8");
    const compiledTemplate = ejs.compile(htmlTemplate);
    const mailDataObj = JSON.parse(mailData);
    const renderedHtml = compiledTemplate(mailDataObj);
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

  verifyEmail: async (email: string): Promise<string> => {
    const verificationCode = helperFunctions.generateVerificationCode(6);
    const confirmMail = JSON.stringify({ text: `Пожалуйста введите данный код:${verificationCode}. Для подтверждения корпоративной почты!` }, null, "\t");
    const template = await helperFunctions.generateEmailTemplate(confirmMail, "confirm-template");
    MailTo.sendEmailWithTemplate(template, email, "Верификация почты");
    return verificationCode;
  },

  generateVerificationCodes: () => {
    const codeA = Math.floor(Math.random() * 90) + 10;
    const codeB = Math.floor(Math.random() * 900000) + 100000;
    const jointValue = codeA * codeB;
    return { codeA, codeB, jointValue };
  },

  isAlive: async (host: string) => {
    return new Promise(resolve => {
      ping.sys.probe(host, isAlive => {
        if (isAlive !== null) {
          resolve(isAlive);
        } else {
          resolve(false);
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
      extractedValues.push({ cablePair, cableStatus, cableLength });
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
    return { interfaceName, cablePairs, cableStatus, cableLengths };
  },

  saveConfigToFirestore: async () => {
    const action = helperFunctions.saveConfigToFirestore.name;
    try {
      const configData = require(configPath);
      const configDocRef = db.collection('configs').doc('mainConfig');
      const docSnapshot = await configDocRef.get();
      if (!docSnapshot.exists) {
        await configDocRef.set(configData);
        const message = {
          date: helperFunctions.currentDate,
          action,
          pid: process.pid,
          status: "Данные из /config.json сохранены в Firestore",
        };
        logger.info(JSON.stringify(message));
      }
    } catch (e: any) {
      const error = {
        date: helperFunctions.currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
    }
  },

  monitorFirestoreChanges: () => {
    const action = helperFunctions.monitorFirestoreChanges.name;

    try {
      const configDocRef = db.collection('configs').doc('mainConfig');
      configDocRef.onSnapshot(docSnapshot => {
        if (docSnapshot.exists) {
          const configDataFromFirestore = docSnapshot.data();
          fs.writeFileSync(configPath, JSON.stringify(configDataFromFirestore, null, 2));
          const message = {
            date: helperFunctions.currentDate,
            action,
            pid: process.pid,
            status: "Файл /config.json обновлен данными из Firestore",
          };
          logger.info(JSON.stringify(message));
        }
      });
    } catch (e: any) {
      const error = {
        date: helperFunctions.currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
    }
  },

  cablePairStatusIconizer: (cableStatus: string) => {
    switch (cableStatus) {
      case "open":
        return symbols.NOCABLE;
      case "abnormal":
        return symbols.ABNORMAL;
      case "short":
        return symbols.SHORT;
      case "well":
        return symbols.OK_UP;
      default:
        return symbols.UNKNOWN;
    }
  },

  tableFormattedOutput: (results: any[], head?: string[]) => {
    const table = new Table({
      head: head,
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
        'right': '', 'right-mid': '', 'middle': ' '
      },
      colAligns: ['center'],
      style: { 'padding-left': 0, 'padding-right': 0 },
      wordWrap: true,
      wrapOnWordBoundary: true,
    });
    results.forEach(row => table.push(row));

    const tableString = table.toString().replace(/\x1B\[[0-9;]*m/g, '');
    return tableString;
  },

  memberPorts: (inputString: string): string => {
    const hexToBin: Record<string, string> = {
      '0': '0000', '1': '0001', '2': '0010', '3': '0011',
      '4': '0100', '5': '0101', '6': '0110', '7': '0111',
      '8': '1000', '9': '1001', 'A': '1010', 'B': '1011',
      'C': '1100', 'D': '1101', 'E': '1110', 'F': '1111',
    };

    return inputString.split('').map(char => hexToBin[char.toUpperCase()] || char).join('');
  },

  parseTelegramCommand(text: string) {
    const parts = text.trim().split(' ');
    console.log(text);

    if (parts.length >= 3 && parts[0].startsWith('/')) {
      const command = parts[0];
      const params: { [key: string]: string } = {};

      for (let i = 1; i < parts.length; i++) {
        const key = String(i - 1); // Преобразование числового индекса в строку
        const value = parts[i];

        if (key && value) {
          params[key] = value;
        }
      }

      return { command, params };
    }

    return null;
  },
  generateLLDPTable: (data: any[]) => {
    const table = new Table({
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
        'right': '', 'right-mid': '', 'middle': ' '
      },
      colAligns: ['center'],
      style: { 'padding-left': 0, 'padding-right': 0 },
      wordWrap: true,
      wrapOnWordBoundary: true,
    });

    const [ip, deviceName, deviceModel, connections] = data;

    table.push([{ colSpan: 4, content: `${ip} ${deviceName} ${deviceModel}` }]);
    table.push(['Loccal Port', 'Remote Port', 'Remote Device', 'Remote Model']);

    for (const connection of connections) {
      const [port, connectedPort, connectedDevice, connectedModel,] = connection;
      table.push([port, connectedPort, connectedDevice, connectedModel]);
    }

    const tableString = table.toString().replace(/\x1B\[[0-9;]*m/g, '');
    return tableString;
  },
  hashUserId: async (confirmCode: string): Promise<string> => {
    logger.info(confirmCode)

    const bcrypt = await import('bcrypt-ts');
    const saltRounds = 10; // Количество раундов для соли (можете изменить по необходимости)
    const hashedUserId = await bcrypt.hash(confirmCode, saltRounds);
    logger.info(hashedUserId)

    return hashedUserId;
  },

  createJwtToken: async (data: {
    tgId: string;
    isAdmin: boolean;
    userAllowed: boolean;
    email: string;
    userVerified: boolean;
    verificationCode: string;
  }, secretKey: string): Promise<string> => {
    const { tgId, isAdmin, userAllowed, email, userVerified, verificationCode } = data;

    // // Проверка наличия необходимых свойств
    // if (!tgId || !isAdmin || !userAllowed || !email || !userVerified || !verificationCode) {
    //   console.log({ tgId, isAdmin, userAllowed, email, userVerified, verificationCode })
    //   throw new Error('Invalid data provided for creating JWT token');
    // }

    const payload = {
      tgId,
      isAdmin,
      userAllowed,
      email,
      userVerified
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: '42d' });
    return token;
  },
  // checkJwtToken: async (token: string, secretKey: string): Promise<boolean|string> => {
  //   const decodedToken = jwt.decode(token) as jwt.JwtPayload;
  //   return new Promise<boolean|string>((resolve, reject) => {
  //     jwt.verify(token, secretKey, (err, decoded) => {
  //       if (err) {
  //         resolve(err.name,decodedToken.exp?.toString);
  //       } else {
  //         resolve(true,decodedToken.exp?.toString);
  //       }
  //     });
  //   });
  // }

  checkJwtToken: async (token: string, secretKey: string): Promise<{ isValid: boolean, expiration?: string, error?: string | undefined }> => {
    const action = helperFunctions.monitorFirestoreChanges.name;

    try {
      const decodedToken = jwt.verify(token, secretKey) as jwt.JwtPayload;

      return {
        isValid: true,
        expiration: decodedToken.exp?.toString(),
      };
    } catch (e: any) {
      const error = {
        date: helperFunctions.currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return {
        isValid: false,
        error: (e as { name: string }).name,
        expiration: (jwt.decode(token) as jwt.JwtPayload)?.exp?.toString(),
      };
    }
  }
};

export default helperFunctions;
