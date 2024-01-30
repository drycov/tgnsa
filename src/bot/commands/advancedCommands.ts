import { type Conversation } from "@grammyjs/conversations";
import { Context, InputFile } from "grammy";
import * as path from "path";
import util from "util";
import labels from "../assets/labels";
import messages from "../assets/messages";
import { IpCheck, P2PCheck, SubnetCheck } from "../assets/regexp";
import baseUtil from "../base_util/baseUtil";
import MailTo from "../core/MailTo";
import advancedMenu from "../keyboards/advancedMenu";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
const config = require(configPath);
// import massData from "../core/massData";
import massData from "../data/massData";
import userData from "../data/userData";
import baseMenu from "../keyboards/baseMenu";
import MassIncidient from "../models/MassIncidient";
import helperFunctions from "../utils/helperFunctions";
import logger from "../utils/logger";
import messagesFunctions from "../utils/messagesFunctions";
import * as QRCode from 'qrcode';

// import fetch from 'node-fetch';

interface MyContext extends Context {
  session: { [key: string]: any }; // Change the type to match your session data structure
}
type MyConversation = Conversation<MyContext>;

const currentDate = new Date().toLocaleString("ru-RU");

const advancedCommands = {
  additional: async (_conversation: MyConversation, ctx: MyContext) => {
    ctx.session.currentCVid = "additional";
    ctx.session.previosCVid = "main";
    await ctx.reply(labels.AdvancedMenuLabel, {
      reply_markup: advancedMenu.additional,
    });
  },

  cidr_calc: async (
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> => {
    ctx.session.currentCVid = "cidr_calc";
    ctx.session.previosCVid = "additional";

    await ctx.reply(messages.EnterSubnetIpMessage, {
      reply_markup: {
        remove_keyboard: true,
      },
      parse_mode: "HTML",
    });

    const subnet = await conversation.form.text();
    if (!subnet || !SubnetCheck(subnet)) {
      await ctx.reply(messages.ErrorSubnetIpMessage, {
        reply_markup: baseMenu.inBack,
      });
      return;
    }

    const cidrData = baseUtil.subnetCalculate(subnet);
    await ctx.reply(
      `<b>Расчет IP-сети: <code>${subnet}</code></b>\n\n<pre>${cidrData}</pre>\n\n<i>Выполнено:  <code>${currentDate}</code></i>`,
      {
        reply_markup: baseMenu.inBack,
        parse_mode: "HTML",
      }
    );
  },

  p2p_calc: async (
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> => {
    ctx.session.currentCVid = "p2p_calc";
    ctx.session.previosCVid = "additional";

    await ctx.reply(messages.EnterSubnetP2PMessage, {
      reply_markup: {
        remove_keyboard: true,
      },
      parse_mode: "HTML",
    });

    const subnet = await conversation.form.text();
    if (!subnet || !P2PCheck(subnet)) {
      await ctx.reply(messages.ErrorSubnetP2PMessage, {
        reply_markup: baseMenu.inBack,
      });
      return;
    }

    const cidrData = baseUtil.p2pCalculate(subnet);
    await ctx.reply(
      `<b>Расчет P2P-пары: <code>${subnet}</code></b>\n\n<pre>${cidrData}</pre>\n\n<i>Выполнено:  <code>${currentDate}</code></i>`,
      {
        reply_markup: baseMenu.inBack,
        parse_mode: "HTML",
      }
    );
  },

  ping_device: async (
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> => {
    ctx.session.currentCVid = "ping_device";
    ctx.session.previosCVid = "additional";
    await ctx.reply(messages.EnterIpMessage, {
      reply_markup: {
        remove_keyboard: true,
      },
    });

    const host = await conversation.form.text();

    if (!host || !IpCheck(host)) {
      ctx.reply(messagesFunctions.msgReplyNoIp(ctx.message?.text), {
        reply_markup: baseMenu.inBack,
      });
      return;
    }

    const pingLog = await baseUtil
      .pingDeviceLog(host)
      .then((res) => res.output)
      .catch(() => null);
    if (pingLog) {
      await ctx.reply(
        util.format(
          "Проверка доступности устройства: <code>%s</code>\n<pre><code>%s</code></pre>\n\n<i>Выполнено:  <code>%s</code></i>",
          host,
          pingLog.toString(),
          currentDate
        ),
        {
          reply_markup: baseMenu.inBack,
          parse_mode: "HTML",
        }
      );
    } else {
      ctx.reply(messagesFunctions.msgNotAllowed(host), {
        reply_markup: baseMenu.inBack,
      });
    }
  },

  massIncident: async (
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> => {
    ctx.session.currentCVid = "massIncident";
    ctx.session.previosCVid = "additional";

    const user = await userData.getUserByTgId(ctx.session.userId);
    await ctx.reply(messages.MIIStationMessage, {
      reply_markup: baseMenu.inBack,
    });
    const station = await conversation.form.text();

    // Prompt the user for city input
    await ctx.reply(messages.MIICityMessage, {
      reply_markup: baseMenu.inBack,
    });
    const city = await conversation.form.text();

    // Prompt the user for cause input
    await ctx.reply(messages.MIICauseMessage, {
      reply_markup: baseMenu.inBack,
    });
    const cause = await conversation.form.text();

    // Prompt the user for address input
    await ctx.reply(messages.MIIAddresesMessage, {
      reply_markup: baseMenu.inBack,
    });
    const addr = await conversation.form.text();

    // Prompt the user for priority input
    await ctx.reply(messages.MIIPriorityMessage);
    const priority = await conversation.form.text();

    // Prompt the user for end time input
    await ctx.reply(messages.MIIEndTimeMessage, {
      reply_markup: baseMenu.inBack,
    });
    const me = await conversation.form.text();

    const d_t = new Date();
    const massStart = helperFunctions.HumanDate(d_t);

    const massIncData: MassIncidient = {
      station: station,
      city: city,
      addr: addr,
      commet: cause, // Здесь 0 - это ваше значение по умолчанию
      ts: massStart,
      te: me,
      from: user.firstName + " " + user.lastName + " (" + user.companyPost + ") ",
      phone: user.phoneNumber || "0",
      priority: priority,
    };
    const result = await massData.saveMassData(massIncData);
    const massInc = JSON.stringify(
      {
        mi_id: result,
        station: station,
        city: city,
        addr: addr,
        commet: cause,
        ts: massStart,
        te: me,
        from:
          user.firstName + " " + user.lastName + " (" + user.companyPost + ") ",
        phone: user.phoneNumber || "0",
        priority: priority,
      },
      null,
      "\t"
    );
    const template = await helperFunctions
      .generateEmailTemplate(massInc, "mass-template")
      .then((res) => {
        return res;
      });
    // await
    MailTo.sendEmailWithTemplate(
      template,
      config.mass_data.mii_dest,
      config.mass_data.mii_subject
    );
    let MImessage = util.format(`\n
<pre><code>Уведомления №: %s\nУведомляем Вас о следующей проблеме:%s на сетях станции: %s.\nВ связи с проблемой прошу не производить прием заявок из: %s по следующим адресам: %s

Проблема обнаружена в %s. 
Ориентировочное время устранения: %s

Информацию передал: %s
Контактный телефон: %s\n</code></pre>`,
      result, cause, station, city, addr, massStart, me, user.firstName + " " + user.lastName + " (" + user.companyPost + ") ", user.phoneNumber)
    await ctx.reply(
      "Запрос на массовый инцидент подан\n\n\n" +
      "со следующим содержимым: " + MImessage +
      `\n\n<i>Выполнено:  <code>${currentDate}</code></i>`,
      { reply_markup: baseMenu.inBack, parse_mode: "HTML" }
    );
  },

  apiTokenGen: async (conversation: MyConversation, ctx: MyContext): Promise<void> => {
    ctx.session.currentCVid = "api_token_gen";
    ctx.session.previosCVid = "main";
    const action = advancedCommands.apiTokenGen.name;

    await ctx.reply(messages.ApiCreateTokenMessage, {
      reply_markup: {
        remove_keyboard: true,
      },
    });

    const userId: string | undefined = ctx.from?.id?.toString();

    if (userId) {
      try {
        const user = await userData.getUserByTgId(userId);

        if (!user.apiToken || typeof user.apiToken === "undefined") {
          const secretKey = user.hash || await helperFunctions.hashUserId(user.verificationCode);
          const token = await helperFunctions.createJwtToken(user, secretKey);

          if (token) {
            const updatedUserData = {
              apiToken: token,
              hash: secretKey,
            };

            await userData.updateUser(user.tgId, updatedUserData);

            await advancedCommands.generateAndSendQRCode(token, ctx);

          }
        } else {
          const exp = await helperFunctions.checkJwtToken(user.apiToken, user.hash);

          if (exp.error === 'TokenExpiredError' || (exp.error && exp.error !== 'TokenExpiredError')) {
            const secretKey = user.hash || await helperFunctions.hashUserId(user.verificationCode);
            const token = await helperFunctions.createJwtToken(user, secretKey);

            if (token) {
              const updatedUserData = {
                apiToken: token,
                hash: secretKey,
              };

              await userData.updateUser(user.tgId, updatedUserData);

              await advancedCommands.generateAndSendQRCode(token, ctx);

            }
          } else {
            await advancedCommands.generateAndSendQRCode(user.apiToken, ctx);
          }
        }
      } catch (e: any) {
        const error = {
          date: currentDate,
          action,
          error: e.message as string,
        };
        logger.error(JSON.stringify(error));
        await ctx.reply(messagesFunctions.msgHandleError(JSON.stringify(error)), {
          reply_markup: baseMenu.inBack,
          parse_mode: "HTML",

        });
      }
    } else {
      ctx.reply(messagesFunctions.msgHandleError(), {
        reply_markup: baseMenu.inBack,
      });
    }
  },

  generateAndSendQRCode: async (text: string, ctx: MyContext): Promise<void> => {
    const action = advancedCommands.generateAndSendQRCode.name;
    try {
      // Генерация QR-кода
      const qrCode = await QRCode.toBuffer(text);

      // Отправка изображения в Telegram
      // const response = await fetch(qrCode);
      // const buffer = await response.buffer();

      // Отправка изображения в чат
      await ctx.replyWithPhoto(new InputFile(qrCode), {
        caption: util.format(
          "Ваш токен: <pre><code>%s</code></pre>\n\n<i>Выполнено:  <code>%s</code></i>",
          text,
          currentDate
        ), parse_mode: 'HTML', reply_markup: baseMenu.inBack,
      });
      //  bot.sendPhoto(chatId, buffer, { caption: 'QR Code' });
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      await ctx.reply(messagesFunctions.msgHandleError(JSON.stringify(error)), {
        reply_markup: baseMenu.inBack,
        parse_mode: "HTML",

      });
    }
  }

};

export default advancedCommands;