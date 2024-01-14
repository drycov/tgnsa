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
import deviceArr from "../base_util/deviceArr";
import joid from "../../src/oid.json";


interface MyContext extends Context {
  session: { [key: string]: any }; // Change the type to match your session data structure
}
type MyConversation = Conversation<MyContext>;
const currentDate = new Date().toLocaleString("ru-RU");

const deviceCommands = {
  check_device: async (conversation: MyConversation, ctx: MyContext) => {
    const action = deviceCommands.check_device.name;
    ctx.session.currentCVid = "check_device";
    ctx.session.previosCVid = "main";

    await ctx.reply(messages.EnterIpMessage, {
      reply_markup: baseMenu.inBack,
    });

    ctx = await conversation.wait();
    const host = ctx.message?.text;

    if (!host || !IpCheck(host)) {
      // Handle invalid IP address
      ctx.reply(messages.ErroMessage + "\n", {
        parse_mode: "HTML",
        reply_markup: baseMenu.inBack,
      }).catch(helperFunctions.noop);
    } else {
      const isAlive = await helperFunctions.isAlive(host);

      if (isAlive) {
        const community = await snmpFunctions.checkSNMP(host, config.snmp.community);
        ctx.session.snmpCommunity = community;
        ctx.session.deviceHost = host.toString();

        const devInfo = await deviceData.getBasicInfo(host, community);

        if (devInfo !== "false") {
          await ctx.reply(devInfo + `\n\n<i>Выполнено:  <code>${currentDate}</code></i>`, {
            reply_markup: deviceMenu.checkDevice,
            parse_mode: "HTML",
          }).catch(helperFunctions.noop);
        } else {
          ctx.reply(messages.ErroMessage + "\n" + messages.ErrorSNMPMessage, {
            parse_mode: "HTML",
          }).catch(helperFunctions.noop);
        }
      }
    }

    const message = {
      date: currentDate,
      action,
      userId: ctx.session.userId,
      status: "done",
    };

    logger.info(JSON.stringify(message));
  },

  portInfo: async (_conversation: MyConversation, ctx: MyContext) => {
    ctx.session.currentCVid = "check_device";
    ctx.session.previosCVid = "main";
    const host = ctx.session.deviceHost;
    const community = ctx.session.snmpCommunity;
    let action = deviceCommands.portInfo.name;
    await ctx.reply(`Проверка портов на устройстве:  <code>${host}</code>`, {
      reply_markup: {
        remove_keyboard: true,
      },
      parse_mode: "HTML",
    });

    const portStatus = await deviceData
      .getPortStatus(host, community)
      .then((status) => {
        return status;
      });
    const stateInfo = `P.S. Состояния: ${symbols.OK_UP} - Линк есть, ${symbols.OKEY} - Линка нет, ${symbols.AdminDownEmo} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно`;
    try {
      const message = {
        date: currentDate,
        action,
        userId: ctx.session.userId,
        status: "done",
      };

      logger.info(JSON.stringify(message));
      await ctx.reply(`Состояние портов на устройстве:  <code>${host}</code>\n` +
        ` <pre>${portStatus} \n\n ${stateInfo}</pre> \n\n<i>Выполнено:  <code>${currentDate}</code></i>`,
        {
          reply_markup: deviceMenu.checkDevice,
          parse_mode: "HTML",
        }
      );
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        userId: ctx.session.userId,
        error: e.message as string,
      };

      logger.error(JSON.stringify(error));
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
    let action = deviceCommands.vlanList.name;
    await ctx.reply(`Вывод списка VLAN на устройстве:   <code>${host}</code>`, {
      reply_markup: {
        remove_keyboard: true,
      },
      parse_mode: "HTML",

    });

    const vlanListResult = await deviceData
      .getVlanList(host, community)
      .then((status) => {
        return status;
      });
    let res =
      `VLAN to: <code>${host}</code> \n <pre>${vlanListResult}</pre>` +
      `\n\n<i>Выполнено:  <code>${currentDate}</code></i>`;
    try {
      const message = {
        date: currentDate,
        action,
        userId: ctx.session.userId,
        status: "done",
      };

      logger.info(JSON.stringify(message));
      await ctx.reply(res, {
        reply_markup: deviceMenu.checkDevice,
        parse_mode: "HTML",
      });
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        userId: ctx.session.userId,
        error: e.message as string,
      };

      logger.error(JSON.stringify(error));
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
    // let message = util.format(
    //   '{"date":"%s", "%s":%s","%s":"%s", ',
    //   currentDate,
    //   "action",
    //   action,
    //   "userId",
    //   ctx.session.userId
    // );

    await ctx.reply(`Вывод уровня оптического сигнала/ADSL на устройстве: <code>${host}</code>`, {
      reply_markup: {
        remove_keyboard: true,
      },
      parse_mode: "HTML",

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
        const message = {
          date: currentDate,
          action,
          userId: ctx.session.userId,
          status: "done",
        };

        logger.info(JSON.stringify(message));
      } catch (e: any) {
        const error = {
          date: currentDate,
          action,
          userId: ctx.session.userId,
          error: e.message as string,
        };

        logger.error(JSON.stringify(error));
        await ctx.reply(messages.ErroMessage + "\n", {
          reply_markup: baseMenu.inBack,
        });
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
      const message = {
        date: currentDate,
        action,
        userId: ctx.session.userId,
        status: "done",
      };

      logger.info(JSON.stringify(message));
    }
  },
  cableMetr: async (_conversation: MyConversation, ctx: MyContext) => {
    ctx.session.currentCVid = "cableMetr";
    ctx.session.previosCVid = "main";
    const host = ctx.session.deviceHost;
    const community = ctx.session.snmpCommunity;
    const action = deviceCommands.cableMetr.name;
    await ctx.reply(`Измерение длинны кабеля на устройстве(по отключенным портам):  <code>${host}</code>`, {
      reply_markup: {
        remove_keyboard: true,
      },
      parse_mode: "HTML",
    });
    const cableLengths = await deviceData
      .getCableLength(host, community)
      .then((status) => {
        return status;
      });

    const stateInfo = `P.S. Состояния:\n ${symbols.OK_UP} - ОК, ${symbols.NOCABLE} - Обрыв,\n ${symbols.ABNORMAL} - Ненормальный, ${symbols.SHORT} - Короткое\n ${symbols.OK_UP} - Линк есть, ${symbols.OKEY} - Линка нет,\n ${symbols.AdminDownEmo} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно`;
    try {
      await ctx.reply(`Длинна кабелей на устройстве:  <code>${host}</code>\n` +
        ` <pre>${cableLengths} \n\n ${stateInfo}</pre> \n\n<i>Выполнено:  <code>${currentDate}</code></i>`,
        {
          reply_markup: deviceMenu.checkDevice,
          parse_mode: "HTML",
        }
      );
      const message = {
        date: currentDate,
        action,
        userId: ctx.session.userId,
        status: "done",
      };

      logger.info(JSON.stringify(message));
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        userId: ctx.session.userId,
        error: e.message as string,
      };

      logger.error(JSON.stringify(error));
      await ctx.reply(messages.ErroMessage + "\n", {
        reply_markup: baseMenu.inBack,
        parse_mode: "HTML",

      });
    }
  },
  lldpData: async (_conversation: MyConversation, ctx: MyContext) => {
    ctx.session.currentCVid = "check_device";
    ctx.session.previosCVid = "main";
    const host = ctx.session.deviceHost;
    const community = ctx.session.snmpCommunity;
    const action = deviceCommands.ddmInfo.name;
    const currentDate = new Date().toLocaleString("ru-RU");
    try {
      const lldpData = await deviceData.getLLDPdata(joid.lldp_oids.lldpRemSysName, joid.lldp_oids.lldpRemSysDesc, joid.lldp_oids.lldpRemPortId, host, community);
      await ctx.reply(`LLDP соседство: \n   <pre>${lldpData}</pre>\n\n<i>Выполнено:  <code>${currentDate}</code></i>`, {
        parse_mode: "HTML",
      });
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  }

};
export default deviceCommands;
