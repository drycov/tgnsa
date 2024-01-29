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
import joid from "../src/oid.json";
import labels from "./assets/labels";
import messages from "./assets/messages";
import advancedCommands from "./commands/advancedCommands";
import deviceCommands from "./commands/deviceCommands";
import mainComands from "./commands/mainCommands";
const configPath = path.join(__dirname, '../', '../', `config.json`);
const config = require(configPath);

import baseMenu from "./keyboards/baseMenu";
import messagesFunctions from "./utils/messagesFunctions";

import deviceArr from "./base_util/deviceArr";
import logger from "./utils/logger";
import snmpFunctions from "./utils/snmpFunctions";
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
// bot.command("test", async (ctx) => {
//   ctx.deleteMessage();
//   helperFunctions.setSessionData(ctx);
//   if (ctx.message && ctx.message.text) {
//     const data = helperFunctions.parseTelegramCommand(ctx.message.text);
//    const res = await devicData.runNetmikoScript([data?.ipAddress, "public", joid.basic_oids.dot1qVlanStaticEgressPorts + data?.vlan, joid.basic_oids.dot1qVlanStaticUntaggedPorts + data?.vlan,joid.basic_oids.dot1qVlanForbiddenEgressPorts + data?.vlan]).then((res) => { return res });
//    await ctx.reply(res);
//     // Здесь можно использовать полученные данные из data
//   }

// });

bot.command("test", async (ctx) => {
  ctx.deleteMessage();
  helperFunctions.setSessionData(ctx);

  const walkOidValue = async (oid: string, host: string, community: string) => {
    try {
      return await snmpFunctions.getMultiOIDValue(host, oid, community);
    } catch (error) {
      logger.error(error);
      return error;
    }
  };

  const getOidValue = async (oid: string, host: string, community: string) => {
    try {
      return await snmpFunctions.getSingleOID(host, oid, community);
    } catch (error) {
      logger.error(error);
      return error;
    }
  };

  if (ctx.message && ctx.message.text) {
    const data = helperFunctions.parseTelegramCommand(ctx.message.text);

    if (data) {
      const lldpData = async (oidRemSysName: string, oidRemSysModel: string, oidRemIfName: string, ipAddress: string, community: string) => {
        try {
          const resRemSysName = await walkOidValue(oidRemSysName, ipAddress, community);
          const resRemSysModel = await walkOidValue(oidRemSysModel, ipAddress, community);
          const resRemSysIfName = await walkOidValue(oidRemIfName, ipAddress, community);
          const resLocalSysName = await getOidValue(joid.basic_oids.oid_sysname, ipAddress, community);
          const resLocalModel = await getOidValue(joid.basic_oids.oid_model, ipAddress, community);
          const resLocalSysModel = deviceArr.FilterDeviceModel(resLocalModel);

          const parsedIfName = await Promise.all(resRemSysIfName.map(async (item: any) => {
            const regex = /(\d+)(?=,\d+$)/;
            const oidString = item.oid.join(',');
            const match = oidString.match(regex);
            const extractedNumber = match ? match[0] : null;
            const ifName = await getOidValue(joid.linux_server.oid_ifName + '.' + extractedNumber, ipAddress, community);
            return ifName;
          }));

          const connections = parsedIfName.map((localIfName: string, index: number) => ({
            localIfName,
            remSysName: resRemSysName[index].value,
            remModel: deviceArr.FilterDeviceModel(resRemSysModel[index].value),
            remIfName: resRemSysIfName[index].value
          }));

          const dataArray = {
            localIP: ipAddress,
            localSysName: resLocalSysName,
            localModel: resLocalSysModel,
            connections,
          };

          return JSON.stringify(dataArray, null, "\t");
        } catch (error) {
          logger.error(error);
          return error;
        }
      };

      const res = await lldpData('.1.0.8802.1.1.2.1.4.1.1.9', '.1.0.8802.1.1.2.1.4.1.1.10', '.1.0.8802.1.1.2.1.4.1.1.7', data?.ipAddress, "public");
      console.log(res);


      await ctx.reply(`<pre>${res}</pre>`, {
        parse_mode: "HTML",
      });
    }
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
// bot.callbackQuery(/\d+/, async (ctx) => {
//   // Изменено регулярное выражение для чисел
//   const optionValue = parseInt(ctx.callbackQuery.data);
//   // Преобразование строки в число
//   // Выполните нужные действия на основе значения опции (optionValue)
//   ctx.reply(`Выбрана проверка порта с идексом ${optionValue}`);
//   await ctx.answerCallbackQuery(
//     `Выбрана проверка порта с идексом ${optionValue}`
//   );
// });
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
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();
  await ctx.conversation.enter("additional");
});
bot.hears(labels.CIDRCalcLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();

  await ctx.conversation.enter("cidr_calc");
});

bot.hears(labels.P2PCalcLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();

  await ctx.conversation.enter("p2p_calc");
});
bot.hears(labels.PingDeviceLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();

  await ctx.conversation.enter("ping_device");
});
bot.hears(labels.MIAllertLabel, async (ctx) => {
  ctx.deleteMessage();
  // let ua = await access.CheckAdminRole(ctx.message?.from.id)
  // if (ua) {
  await ctx.conversation.exit();

  await ctx.conversation.enter("massIncident");
  // } else {
  //     // logger.info(`ID: ${ctx.session.userId}(${ctx.session.userFirstName} ${ctx.session.userLastName}) ${messagesData.ErrorActionMessage} ${ctx.message.text}`)
  //     await ctx.reply(messagesData.ErrorNoAclMessage, { reply_markup: menu.main })
  // }
});
bot.hears(labels.CheckDeviceLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();
  await ctx.conversation.enter("check_device");
});
bot.hears(labels.PortInfoLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();

  await ctx.conversation.enter("portInfo");
});
bot.hears(labels.VlanListLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();

  await ctx.conversation.enter("vlanList");
});
bot.hears(labels.DDMInfoLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();

  await ctx.conversation.enter("ddmInfo");
});
bot.hears(labels.DeviceLLDPLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();

  await ctx.conversation.enter("lldpData");
});
bot.hears(labels.CabelLengthLabel, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
  await ctx.conversation.exit();

  await ctx.conversation.enter("cableMetr");
});

bot.hears(labels.ApiTokenCreate, async (ctx) => {
  ctx.deleteMessage();
  // helper.setSessionData(ctx)
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
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else if (e instanceof BotError) {
    console.error("Error in request:", e);
  } else {
    console.error("Unknown error:", e);
  }
});


export default bot;
