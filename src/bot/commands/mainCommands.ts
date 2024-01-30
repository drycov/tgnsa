import { type Conversation } from "@grammyjs/conversations";
import util from "util";

import Table from "cli-table3";
import { Context } from "grammy";
import * as path from "path";
import labels from "../assets/labels";
import {
  default as messageText,
  default as messages,
} from "../assets/messages";
import symbols from "../assets/symbols";
import access from "../core/access";
import userData from "../data/userData";
import baseMenu from "../keyboards/baseMenu";
import mainMenu from "../keyboards/mainMenu";
import User from "../models/User";
import helperFunctions from "../utils/helperFunctions";
import logger from "../utils/logger";
import messagesFunctions from "../utils/messagesFunctions";

const configPath = path.join(__dirname, '../', '../', '../', `config.json`);

const config = require(configPath);
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
    }).catch(helperFunctions.noop);
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
    let code = '';
    let exp;
    message += util.format('"%s":"%s", ', "id", ctx.message?.from.id);
    if (exist) {
      const user = await userData.getUserByTgId(ctx.session.userId).then((res) => { return res });

      let status = await access.CheckUserStatus(ctx.session.userId);
      if (status) {
        if (user.apiToken != '' || typeof user.apiToken != "undefined") {
          exp = await helperFunctions.checkJwtToken(user.apiToken, user.hash).then((res) => { return res })
          if (exp.error === 'TokenExpiredError') {
            ctx.reply(`${messagesFunctions.msgApiTokenHandleError(exp.expiration)}\n\n<i>Выполнено:  <code>${currentDate}</code></i>`, {
              parse_mode: "HTML",
            }).catch(helperFunctions.noop);
          } else if (exp.error && exp.error !== 'TokenExpiredError') {
            ctx.reply(`${messagesFunctions.msgApiTokenHandleError()}\n\n<i>Выполнено:  <code>${currentDate}</code></i>`, {
              parse_mode: "HTML",
            }).catch(helperFunctions.noop);
          }
        }
        let ua = await access.CheckAdminRole(ctx.session.userId);
        if (ua) {
          message += util.format('"%s":"%s"}', "info", "User logined is Admin");
          await ctx.reply("🤘🏻 " + labels.MainMenuLabel + " 🤘🏻", {
            reply_markup: mainMenu.admin,
          }).catch(helperFunctions.noop);
          logger.info(message);
        } else {
          await ctx.reply(labels.MainMenuLabel, {
            reply_markup: mainMenu.main,
          }).catch(helperFunctions.noop);
        }
      } else {
        ctx.reply(messagesFunctions.msgForbridedenUser(), {
          parse_mode: "HTML",
        }).catch(helperFunctions.noop);
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
        }).catch(helperFunctions.noop);
        const firstName = await conversation.form.text();
        await ctx.reply(messages.MsgAddLastName, {
          reply_markup: baseMenu.inBack,
        }).catch(helperFunctions.noop);
        const lastName = await conversation.form.text();
        await ctx.reply(messages.MsgAddСompanyPost, {
          reply_markup: baseMenu.inBack,
        }).catch(helperFunctions.noop);

        const companyPost = await conversation.form.text();
        await ctx.reply(messages.MsgAddpPhoneNumber, {
          reply_markup: baseMenu.sendContact,
        }).catch(helperFunctions.noop);
        const { message } = await conversation.waitFor("message");
        const phoneNumber = message.contact?.phone_number;
        await ctx.reply(messages.MsgAddEMail, {
          reply_markup: {
            remove_keyboard: true,
          },
        }).catch(helperFunctions.noop);
        const email = await conversation.form.text();
        code = await helperFunctions
          .verifyEmail(email)
          .then((res) => res);
        const newUserInfo: User = {
          ttc_id: '5',
          station: "2",
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
          apiToken: "",
          hash: await helperFunctions.hashUserId(code)
        };

        const table = new Table({
          chars: {
            'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
            'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
            'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
            'right': '', 'right-mid': '', 'middle': ' '
          },
          style: { 'padding-left': 0, 'padding-right': 0 },
          wordWrap: true,
          wrapOnWordBoundary: true,
        });


        const result = await userData.saveUser(newUserInfo);
        table.push(
          ['ID In DB', result],
          ['Telegarm ID', newUserInfo.tgId],
          ['Username', newUserInfo.username],
          ['First Name', newUserInfo.firstName],
          ['Last Name', newUserInfo.lastName],
          ['Company post', newUserInfo.companyPost],
          ['Phone', newUserInfo.phoneNumber],
          ['E-Mail', newUserInfo.email],
          ['Verified', newUserInfo.userVerified ? symbols.OK_UP : symbols.OKEY],
          ['Token', newUserInfo.apiToken == ' ' ? symbols.ShootDown : symbols.OKEY]

        );

        const userProfile = table.toString().replace(/\x1B\[[0-9;]*m/g, '');
        const adminUid = await userData.getAdminsUsers();
        if (adminUid.length != 0) {
          adminUid.forEach(async (res: {
            tgId: any; isAdmin: boolean; id: string | number
          }) => {
            if (res.isAdmin) {
              const gc = await ctx.api.getChat(res.tgId).then((res) => { return res }).catch((err) => { return err })
              if (gc.error_code != 400) {
                ctx.api.sendMessage(res.tgId, `<pre>${userProfile}</pre>`, {
                  parse_mode: "HTML",
                }).catch(helperFunctions.noop);
              } else {
                ctx.api.sendMessage(config.BotChatAdmin, `<pre>${userProfile}</pre>`, {
                  parse_mode: "HTML",
                }).catch(helperFunctions.noop);
              }
            }
            const message = {
              date: currentDate,
              action,
              status: "done",
            };

            logger.info(JSON.stringify(message));
          });
        } else {
          try {
            ctx.api.sendMessage(config.BotChatAdmin, `<pre>${userProfile}</pre>`, {
              parse_mode: "HTML",
            }).catch(helperFunctions.noop);
          } catch (e: any) {
            const error = {
              date: currentDate,
              action,
              error: e.message as string,
            };
            logger.error(JSON.stringify(error));
            ctx.api.sendMessage(config.defaultAdmin, `<pre>${userProfile}</pre>`, {
              parse_mode: "HTML",
            }).catch(helperFunctions.noop);
          }
        }
        delete ctx.session.conversation;
        const mes = {
          date: currentDate,
          action,
          status: "done",
        };

        logger.info(JSON.stringify(mes));
        ctx.reply(messages.UserSavedInDBMessage);
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
  
        }).catch(helperFunctions.noop);
      }
    }
  },
};
export default mainCommands;
