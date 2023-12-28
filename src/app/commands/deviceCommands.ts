import { type Conversation } from "@grammyjs/conversations";
import { Context, InputFile } from "grammy";
import util from "util";
import * as fs from "fs";
import * as path from "path";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
const config = require(configPath);

import messages from "../assets/messages";
import { IpCheck } from "../assets/regexp";
// import config from "../config";

import deviceData from "../core/deviceData";
import baseMenu from "../keyboards/baseMenu";
import deviceMenu from "../keyboards/deviceMenu";
import helperFunctions from "../utils/helperFunctions";
import logger from "../utils/logger";
import snmpFunctions from "../utils/snmpFunctions";
import symbols from "../assets/symbols";

interface MyContext extends Context {
  session: { [key: string]: any }; // Change the type to match your session data structure
}
type MyConversation = Conversation<MyContext>;
const currentDate = new Date().toLocaleString("ru-RU");

const deviceCommands = {
  check_device: async (conversation: MyConversation, ctx: MyContext) => {
    let action = deviceCommands.check_device.name;
    let message = util.format(
      '{"date":"%s", "%s":%s","%s":"%s", ',
      currentDate,
      "action",
      action,
      "userId",
      ctx.session.userId
    );
    ctx.session.currentCVid = "check_device";
    ctx.session.previosCVid = "main";

    await ctx.reply(messages.EnterIpMessage, {
      reply_markup: baseMenu.inBack,
    });

    ctx = await conversation.wait();
    const host = ctx.message?.text;
    message += util.format('"%s": "%s", ', (action = "host"), host);
    if (host) {
      const ifTru = IpCheck(host);
      message += util.format('%s: "%s", ', (action = "Ip_check"), ifTru);
      if (ifTru) {
        const isAlive = await helperFunctions.isAlive(host).then((res) => {
          return res;
        });
        message += util.format('"%s": "%s"}', (action = "isAlive"), isAlive);
        if (isAlive) {
          const community = await snmpFunctions
            .checkSNMP(host, config.snmp.community)
            .then((res) => res);

          ctx.session.snmpCommunity = community;
          ctx.session.deviceHost = host.toString();

          const devInfo = await deviceData.getBasicInfo(host, community);
          if (devInfo !== "false") {
            await ctx
              .reply(
                devInfo + `\n\n<i>Выполнено:  <code>${currentDate}</code></i>`,
                {
                  reply_markup: deviceMenu.checkDevice,
                  parse_mode: "HTML",
                }
              )
              .catch(helperFunctions.noop);
            logger.info(message);
            return;
          } else {
            ctx
              .reply(messages.ErroMessage + "\n" + messages.ErrorSNMPMessage, {
                parse_mode: "HTML",
              })
              .catch(helperFunctions.noop);
            message += util.format("}");
            logger.info(message);
            return;
          }
        }
      }
    } else {
      // Handle invalid IP address
      ctx
        .reply(messages.ErroMessage + "\n", {
          parse_mode: "HTML",
          reply_markup: baseMenu.inBack,
        })
        .catch(helperFunctions.noop);
      message += util.format("}");
      logger.info(message);
      return;
    }
    logger.info(message);
    return;
  },
  portInfo: async (_conversation: MyConversation, ctx: MyContext) => {
    ctx.session.currentCVid = "check_device";
    ctx.session.previosCVid = "main";
    const host = ctx.session.deviceHost;
    const community = ctx.session.snmpCommunity;

    await ctx.reply("Проверка портов на устройстве: " + host, {
      reply_markup: {
        remove_keyboard: true,
      },
    });

    const portStatus = await deviceData
      .getPortStatus(host, community)
      .then((status) => {
        return status;
      });
    const stateInfo = `P.S. Состояния: ${symbols.OK_UP} - Линк есть, ${symbols.OKEY} - Линка нет, ${symbols.AdminDownEmo} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно`;
    try {
      await ctx.reply(`Состояние портов на устройстве: ${host}\n` +
        ` <pre>${portStatus} \n\n ${stateInfo}</pre> \n\n<i>Выполнено:  <code>${currentDate}</code></i>`,
        {
          reply_markup: deviceMenu.checkDevice,
          parse_mode: "HTML",
        }
      );
    } catch (e) {
      await ctx.reply(messages.ErroMessage + "\n", {
        reply_markup: baseMenu.inBack,
      });
    }

  },
  vlanList: async (_conversation: MyConversation, ctx: MyContext) => {
    ctx.session.currentCVid = "check_device";
    ctx.session.previosCVid = "main";
    const host = ctx.session.deviceHost;
    const community = ctx.session.snmpCommunity;

    await ctx.reply("Вывод списка VLAN на устройстве: " + host, {
      reply_markup: {
        remove_keyboard: true,
      },
    });

    const vlanListResult = await deviceData
      .getVlanList(host, community)
      .then((status) => {
        return status;
      });
    let mes =
      `VLAN to: <code>${host}</code> \n <pre>${vlanListResult}</pre>` +
      `\n\n<i>Выполнено:  <code>${currentDate}</code></i>`;
    logger.info(vlanListResult.length);
    logger.info(mes.length);
    try {
      await ctx.reply(mes, {
        reply_markup: deviceMenu.checkDevice,
        parse_mode: "HTML",
      });
    } catch (e) {
      await ctx.reply(messages.ErroMessage + "\n", {
        reply_markup: baseMenu.inBack,
      });
    }
  },
  ddmInfo: async (_conveconversation: MyConversation, ctx: MyContext) => {
    ctx.session.currentCVid = "check_device";
    ctx.session.previosCVid = "main";
    const host = ctx.session.deviceHost;
    const community = ctx.session.snmpCommunity;
    const action = deviceCommands.ddmInfo.name;


    await ctx.reply("Вывод уровня оптического сигнала/ADSL на устройстве: " + host, {
      reply_markup: {
        remove_keyboard: true,
      },
    });
    const DDMInfo = await deviceData
      .getDDMInfo(host, community)
      .then((res) => res);
    if (DDMInfo.length > 4096) {
      try {
        const tempFilePath = path.join('./', 'sessions', 'tempFile.txt');
        const tempFilePNGPath = path.join('./', 'sessions', `${action}_${host}.png`);
        fs.writeFileSync(tempFilePath, `Уровень оптического сигнала/ADSL на устройстве: ${host}\n${DDMInfo}` +
          `\nВыполнено:  ${currentDate}`);
        // const fileStream = fs.createReadStream(tempFilePath);
        helperFunctions.textToPNG(tempFilePath, tempFilePNGPath)

        await ctx.replyWithDocument(
          new InputFile(tempFilePNGPath), {
          caption: `Уровень оптического сигнала/ADSL на устройстве: <code>${host}</code>\n` + `\n<i>Выполнено:  <code>${currentDate}</code></i>`, reply_markup: deviceMenu.checkDevice,
          parse_mode: "HTML",
        });
        fs.unlinkSync(tempFilePNGPath);
        fs.unlinkSync(tempFilePath);

      } catch (error) {
        console.error('Ошибка отправки файла:', error);
      }
    } else {
      await ctx.reply(
        `Уровень оптического сигнала/ADSL на устройстве: <code>${host}</code>\n<pre>${DDMInfo}</pre>` +
        `\n<i>Выполнено:  <code>${currentDate}</code></i>`,
        {
          reply_markup: deviceMenu.checkDevice,
          parse_mode: "HTML",
        }
      );
    }
  },
  cableMetr: async (_conversation: MyConversation, ctx: MyContext) => {
    ctx.session.currentCVid = "cableMetr";
    ctx.session.previosCVid = "main";
    const host = ctx.session.deviceHost;
    const community = ctx.session.snmpCommunity;
    await ctx.reply("Измерение длинны кабеля на устройстве(по отключенным портам): " + host, {
      reply_markup: {
        remove_keyboard: true,
      },
    });
    const cableLengths = await deviceData
      .getCableLength(host, community)
      .then((status) => {
        return status;
      });

    const stateInfo = `P.S. Состояния:\n ${symbols.OK_UP} - ОК, ${symbols.NOCABLE} - Обрыв,\n ${symbols.ABNORMAL} - Ненормальный, ${symbols.SHORT} - Короткое\n ${symbols.OK_UP} - Линк есть, ${symbols.OKEY} - Линка нет,\n ${symbols.AdminDownEmo} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно`;
    try {
      await ctx.reply(`Длинна кабелей на устройстве: ${host}\n` +
        ` <pre>${cableLengths} \n\n ${stateInfo}</pre> \n\n<i>Выполнено:  <code>${currentDate}</code></i>`,
        {
          reply_markup: deviceMenu.checkDevice,
          parse_mode: "HTML",
        }
      );
    } catch (e) {
      await ctx.reply(messages.ErroMessage + "\n", {
        reply_markup: baseMenu.inBack,
      });
    }
  },
};
export default deviceCommands;
