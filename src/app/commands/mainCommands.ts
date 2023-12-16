import { type Conversation } from "@grammyjs/conversations";
import util from "util";

import { Context } from "grammy";
import labels from "../assets/labels";
import {
  default as messageText,
  default as messages,
} from "../assets/messages";
import * as path from "path";

const configPath = path.join(__dirname, '../', '../', '../', `config.json`);

const config = require(configPath);
import access from "../core/access";
import userData from "../data/userData";
import baseMenu from "../keyboards/baseMenu";
import mainMenu from "../keyboards/mainMenu";
import helperFunctions from "../utils/helperFunctions";
import messagesFunctions from "../utils/messagesFunctions";
import logger from "../utils/logger";
import User from "../models/User";
interface MyContext extends Context {
  session: { [key: string]: any }; // Change the type to match your session data structure
}

type MyConversation = Conversation<MyContext>;
const currentDate = new Date().toLocaleString("ru-RU");

const mainCommands = {
  start: async (_conversation: MyConversation, ctx: MyContext) => {
    ctx.session.previosCVid = "start";
    ctx.session.currentCVid = "start";
    await ctx.reply(messageText.PleaceEnterKbMessage, {
      reply_markup: baseMenu.onEnter,
    });
  },
  main: async (conversation: MyConversation, ctx: MyContext) => {
    let action = mainCommands.main.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );

    ctx.session.previosCVid = "start";
    ctx.session.currentCVid = "main";
    let exist = await access.UserExist(ctx.session.userId);
    message += util.format('"%s":"%s", ', "id", ctx.message?.from.id);
    if (exist) {
      let status = await access.CheckUserStatus(ctx.session.userId);
      if (status) {
        let ua = await access.CheckAdminRole(ctx.session.userId);
        if (ua) {
          message += util.format('"%s":"%s"}', "info", "User logined is Admin");
          await ctx.reply("🤘🏻 " + labels.MainMenuLabel + " 🤘🏻", {
            reply_markup: mainMenu.admin,
          });
          logger.info(message);
        } else {
          await ctx.reply(labels.MainMenuLabel, {
            reply_markup: mainMenu.main,
          });
        }
      } else {
        ctx.reply(messagesFunctions.msgForbridedenUser(), {
          parse_mode: "HTML",
        });
        message += util.format('"%s":"%s"}', "error", "User forbridden");
        logger.error(message);
      }
    } else {
      try {
        let action = mainCommands.main.name;
        let messg = util.format(
          '{"date":"%s", "action":"%s", ',
          currentDate,
          action
        );
        messg += util.format('"%s":"%s", ', "id", ctx.message?.from.id);
        await ctx.reply(messages.MsgAddFirstName, {
          reply_markup: baseMenu.inBack,
        });
        const firstName = await conversation.form.text();
        await ctx.reply(messages.MsgAddLastName, {
          reply_markup: baseMenu.inBack,
        });
        const lastName = await conversation.form.text();
        await ctx.reply(messages.MsgAddСompanyPost, {
          reply_markup: baseMenu.inBack,
        });

        const companyPost = await conversation.form.text();
        await ctx.reply(messages.MsgAddpPhoneNumber, {
          reply_markup: baseMenu.sendContact,
        });
        const { message } = await conversation.waitFor("message");
        const phoneNumber = message.contact?.phone_number;
        await ctx.reply(messages.MsgAddEMail, {
          reply_markup: {
            remove_keyboard: true,
          },
        });
        const email = await conversation.form.text();
        const code = await helperFunctions
          .verifyEmail(email)
          .then((res) => res);
        const newUserInfo: User = {
          is_bot: ctx.message?.from.is_bot !== undefined ? ctx.message.from.is_bot : false,
          tgId: ctx.message?.from.id !== undefined ? ctx.message.from.id : 0, // Здесь 0 - это ваше значение по умолчанию
          firstName: firstName,
          lastName: lastName,
          companyPost: companyPost,
          phoneNumber: phoneNumber !== undefined ? phoneNumber : "null", // Здесь 0 - это ваше значение по умолчанию
          email: email,
          userVerified: false,
          verificationCode: code,
          username: ctx.message?.from.username !== undefined ? ctx.message?.from.username : `firstName lastName`, // Здесь 0 - это ваше значение по умолчанию
          isAdmin: false,
          userAllowed: false,
        };

        const result = await userData.saveUser(newUserInfo);
        const adminUid = await userData.getAdminsUsers();

        adminUid.forEach((res: {
          tgId: any; isAdmin: boolean; id: string | number
        }) => {
          try {
            if (res.isAdmin) {
              ctx.api.sendMessage(res.tgId, result);
              ctx.api.sendMessage(config.BotChatAdmin, result);
            }
          } catch (error) {
            ctx.api.sendMessage(config.defaultAdmin, result);
          }
        });
        delete ctx.session.conversation;
        messg += util.format('"%s":"%s",', "data", JSON.stringify(newUserInfo));
        messg += util.format('"%s":"%s"}', "info", "User aded on DB");
        logger.info(messg);
        // ctx.reply(newUserInfo)
        // await savedata.saveUser(newUserInfo, 'user').then((res) => { return res });
        ctx.reply(messages.UserSavedInDBMessage);
      } catch (error) {
        logger.error("Error during user registration:", error);
        ctx.reply(
          "An error occurred during registration. Please try again later."
        );
        message += util.format('"%s":"%s"}', "error", error);
        logger.error(message);
      }
    }
  },
};
export default mainCommands;
