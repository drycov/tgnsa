import {
  ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { hydrateFiles } from "@grammyjs/files";
import { FileAdapter } from "@grammyjs/storage-file";
import { Bot, BotError, Context, GrammyError, HttpError, NextFunction, session } from "grammy";
import helperFunctions from "./utils/helperFunctions";

import os from "os";
import * as path from "path";
import util from "util";
import labels from "./assets/labels";
import messages from "./assets/messages";
import advancedCommands from "./commands/advancedCommands";
import deviceCommands from "./commands/deviceCommands";
import mainComands from "./commands/mainCommands";
const configPath = path.join(__dirname, '../', '../', `config.json`);
const config = require(configPath);

import baseMenu from "./keyboards/baseMenu";
import messagesFunctions from "./utils/messagesFunctions";
import userData from "./data/userData";
import logger from "./utils/logger";

const token = helperFunctions.apptype() || "";
interface MainContext extends Context {
  session: { [key: string]: any }; // Change the type to match your session data structure
}
const uptimeInSeconds = process.uptime();
const notificationInterval = 5 * 60; // 5 минут в секундах

const bot = new Bot<MainContext & ConversationFlavor>(token);

bot.api.config.use(hydrateFiles(bot.token));
bot.use(
  session({
    initial: () => ({}),
    storage: new FileAdapter({
      dirName: "sessions",
    }),
  })
);

/**App Conversations Error handler*/
bot.errorBoundary(boundaryHandler
).use(conversations(),
  createConversation(mainComands.start),
  createConversation(mainComands.main),
  createConversation(advancedCommands.additional),
  createConversation(advancedCommands.cidr_calc),
  createConversation(advancedCommands.p2p_calc),
  createConversation(advancedCommands.ping_device),
  createConversation(advancedCommands.massIncident),
  createConversation(advancedCommands.apiTokenGen),
  createConversation(deviceCommands.check_device),
  createConversation(deviceCommands.portInfo),
  createConversation(deviceCommands.vlanList),
  createConversation(deviceCommands.ddmInfo),
  createConversation(deviceCommands.cableMetr),
  createConversation(deviceCommands.lldpData));


/**App Start Notification */
async function sendUptimeNotification() {
  if (uptimeInSeconds < notificationInterval) {
    const adminUserId = config.BotChatAdmin;
    const userIsBot = await bot.api.getMe();
    const botUserName = userIsBot.username;
    const processInfo = {
      pid: process.pid,
      name: botUserName,
      startTime: new Date(Date.now() - uptimeInSeconds * 1000),
      user: os.userInfo().username,
    };
    const appName = util.format(
      "PID Name: %s\nStart time: %s\nPID User:%s",
      processInfo.name.toString(),
      `${processInfo.startTime.toLocaleDateString(
        "ru-RU"
      )} ${processInfo.startTime.toLocaleTimeString("ru-RU")}`,
      processInfo.user.toString()
    );
    const notificationText = `Процесс запущен:<code>${processInfo.pid.toString()}</code> но время работы менее 5 минут.\n\n<pre><code>${appName}</code></pre>`;
    bot.api.sendMessage(
      adminUserId,
      notificationText +
      `\n\n<i>Выполнено:  <code>${new Date().toLocaleString(
        "ru-RU"
      )}</code></i>`,
      { parse_mode: "HTML" }
    );
  }
}
if (process.env.APP_TYPE != "DEV") {
  sendUptimeNotification();
}

/**App commands */
bot.command(["start", "st", "run"], async (ctx) => {
  helperFunctions.setSessionData(ctx);
  const userInfo = JSON.stringify(ctx.message?.from, null, "\t");
  const gc = await ctx.getChat().then((res) => { return res }).catch((err) => { return err })
  if (gc.type !== "supergroup" && gc.type !== "group" && gc.type !== "channel") {
    await ctx.reply(messagesFunctions.msgWelcome(userInfo));
    helperFunctions.delay(1000);
    ctx.deleteMessage();
    await ctx.conversation.exit();
    await ctx.conversation.enter("start");
  }
});

/**App callbackQuery */
bot.callbackQuery("back", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.conversation.enter(ctx.session.previosCVid);
});
bot.callbackQuery("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.conversation.enter("main");
});
bot.callbackQuery("inContinue", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.conversation.enter("main");
});
bot.callbackQuery(/^add_\d+$/, async (ctx) => {
  await ctx.conversation.exit();
  const data = ctx.callbackQuery.data;
  const regex = /^add_(\d+)$/;
  const match = regex.exec(data);
  let id = ''
  if (match) {
    id = match[1];
    const updatedUserData = {
      userAllowed: true,
    };
    await userData.updateUser(id, updatedUserData);

    bot.api.sendMessage(id, util.format(
      "%s\n\n<i>Выполнено:  <code>%s</code></i>",
      messages.UserAllowedInDBMessage,
      helperFunctions.currentDate
    ), { parse_mode: 'HTML', reply_markup: baseMenu.inBack, })
    await ctx.reply(messages.UserAddSuccessMessage, {
      reply_markup: {
        remove_keyboard: true,
      },
    });
  } else {
    const error = {
      date: helperFunctions.currentDate,
      action: data,
      error: "string is not match template"
    };
    logger.error(JSON.stringify(error));
    await ctx.reply(messagesFunctions.msgHandleError(JSON.stringify(error)), {
      reply_markup: baseMenu.inBack,
      parse_mode: "HTML",

    });
  }
});

/**App command hears */
bot.hears(labels.EnterLabel, async (ctx) => {
  ctx.deleteMessage();
  helperFunctions.setSessionData(ctx);
  await ctx.conversation.enter("main");
});
bot.hears(labels.ExitLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.reply(messages.GoodbayMessage, {
    reply_markup: {
      remove_keyboard: true,
    },
  });
  await ctx.conversation.exit();
  await ctx.reply(messages.PleaceEnterMessage, {
    reply_markup: baseMenu.onEnter,
  });
});
bot.hears(labels.BackLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();
  await ctx.conversation.enter(ctx.session.previosCVid);
});
bot.hears(labels.AdvancedMenuLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();
  await ctx.conversation.enter("additional");
});
bot.hears(labels.CIDRCalcLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();

  await ctx.conversation.enter("cidr_calc");
});

bot.hears(labels.P2PCalcLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();

  await ctx.conversation.enter("p2p_calc");
});
bot.hears(labels.PingDeviceLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();

  await ctx.conversation.enter("ping_device");
});
bot.hears(labels.MIAllertLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();
  await ctx.conversation.enter("massIncident");
});
bot.hears(labels.CheckDeviceLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();
  await ctx.conversation.enter("check_device");
});
bot.hears(labels.PortInfoLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();

  await ctx.conversation.enter("portInfo");
});
bot.hears(labels.VlanListLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();

  await ctx.conversation.enter("vlanList");
});
bot.hears(labels.DDMInfoLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();

  await ctx.conversation.enter("ddmInfo");
});
bot.hears(labels.DeviceLLDPLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();

  await ctx.conversation.enter("lldpData");
});
bot.hears(labels.CabelLengthLabel, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();

  await ctx.conversation.enter("cableMetr");
});

bot.hears(labels.ApiTokenCreate, async (ctx) => {
  ctx.deleteMessage();
  await ctx.conversation.exit();
  await ctx.conversation.enter("apiTokenGen");

})


async function boundaryHandler(err: BotError, next: NextFunction) {
  console.error("Conversation threw an error!", err),
    /*
     * You could call `next` if you want to run
     * the middleware at C in case of an error:
     */
    await next()
}

/**Error Handler */
bot.catch((err: any) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:",e.message as string);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e.message as string);
  } else if (e instanceof BotError) {
    console.error("Error in request:",  e.message as string);
  } else {
    console.error("Unknown error:",  e.message as string);
  }
});


export default bot;
