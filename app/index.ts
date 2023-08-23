import { ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { hydrateFiles } from '@grammyjs/files';
import { FileAdapter } from '@grammyjs/storage-file';
import { Bot, Context, GrammyError, HttpError, session } from 'grammy';
import helperFunctions from './utils/helperFunctions';

import mainComands from './commands/mainCommands'
import advancedCommands from "./commands/advancedCommands";
import messagesFunctions from "./utils/messagesFunctions";
import labels from "./assets/labels";
import messages from "./assets/messages";
import baseMenu from "./keyboards/baseMenu";
import deviceCommands from "./commands/deviceCommands";
import { Options, PythonShell } from 'python-shell';
import deviceData from "./core/deviceData";
import { table, getBorderCharacters } from "table";
import config from "./config";
import os from "os"
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
        initial: () => ({
        }),
        storage: new FileAdapter({
            dirName: "sessions",
        }),
    })
);

bot.errorBoundary(
    (err) => console.error("Conversation threw an error!", err),
    conversations(),
    createConversation(mainComands.start),
    createConversation(mainComands.main),
    createConversation(advancedCommands.additional),
    createConversation(advancedCommands.cidr_calc),
    createConversation(advancedCommands.p2p_calc),
    createConversation(advancedCommands.ping_device),
    createConversation(advancedCommands.massIncident),
    createConversation(deviceCommands.check_device),
    createConversation(deviceCommands.portInfo),
    createConversation(deviceCommands.vlanList),
    createConversation(deviceCommands.ddmInfo)
);

bot.command(["start", "st", "run"], async (ctx) => {
    helperFunctions.setSessionData(ctx)
    const userInfo = JSON.stringify(ctx.message?.from, null, '\t');
    await ctx.reply(messagesFunctions.msgWelcome(userInfo));
    helperFunctions.delay(1000)
    ctx.deleteMessage();

    await ctx.conversation.exit();
    await ctx.conversation.enter("start")
});

const lov5Min = async () => {
    if (uptimeInSeconds < notificationInterval) {
        const adminUserId = config.defaultAdmin; 
        const userIsBot = await bot.api.getMe();
        const botUserName = userIsBot.username;
        const processInfo = {
            pid: process.pid,
            name: botUserName,
            startTime: new Date(Date.now() - uptimeInSeconds * 1000).toLocaleString(),
            user: os.userInfo().username,
        };
        const data = [
            ['Информация о процессе', ''],
            ['PID', processInfo.pid],
            ['Имя процесса', processInfo.name],
            ['Время запуска', processInfo.startTime],
            ['От кого запущен', processInfo.user],
          ];
        // const data = [
        //     ['PID', 'Name', 'Started', 'User'],
        //     [processInfo.pid, processInfo.name, processInfo.startTime, processInfo.user],
        // ];

        const tabConfig = {
            columnDefault: {
                paddingLeft: 0,
                paddingRight: 0,
            },
            border: getBorderCharacters(`void`)
        };

        const tab = table(data, tabConfig);
        const notificationText = `<pre>Процесс запущен, но время работы менее 5 минут.\n<code>${tab}</code></pre>`;
        bot.api.sendMessage(adminUserId, notificationText, { parse_mode: "HTML" });
    }
}
lov5Min();

// bot.command("test", async (ctx) => {
//     const options: Options = {
//         mode: 'text',
//         pythonOptions: ['-u'], // unbuffered output
//         scriptPath: '.', // путь к файлу netmiko_script.py
//     };
//     const res = await PythonShell.run('ps.py', options).then(res => { return res });
//     await ctx.reply(res.toString());
// });
// Gi1/0/1 🔺TX: -7.273 🔻RX: -9.447 🌡C:41 ⚡️V: 3.323
// Gi1/0/2 🔺TX: -7.049 🔻RX: -11.966 🌡C:40 ⚡️V: 3.324
// Gi1/0/5 🔺TX: -6.023 🔻RX: -7.706 🌡C:50 ⚡️V: 3.249
// Gi1/0/6 🔺TX: -4.506 🔻RX: -1.359 🌡C:27 ⚡️V: 3.3
// Te1/0/1 🔺TX: -7.078 🔻RX: -6.904 🌡C:39 ⚡️V: 3.318
// Te1/0/2 🔺TX: -6.026 🔻RX: -3.894 🌡C:39 ⚡️V: 3.345
// Te1/0/3 🔺TX: -7.043 🔻RX: -8.384 🌡C:44 ⚡️V: 3.329
// Te1/0/4 🔺TX: -5.966 🔻RX: -5.837 🌡C:36 ⚡️V: 3.356

// Выполнено:  23.08.2023, 12:51:27


bot.command("test", async (ctx) => {
    const data = [
        ['IF', '🔺Tx', '🔻RX', '🌡C', '⚡️V'],
        ['3', '-7.27', '-9.44', '41', '3.32'],
        ['2', '-7.27', '-9.44', '41', '3.32'],
        ['20', '-7.27', '-9.44', '41', '3.32'],
        ['25', '-7.27', '-9.44', '41', '3.32'],
        ['26', '-7.27', '-9.44', '41', '3.32']

    ];

    const config = {
        columnDefault: {
            paddingLeft: 0,
            paddingRight: 0,
            width: 5,
        },
        border: getBorderCharacters(`ramac`)

    }
    const tab = table(data, config)
    // const oid = joid.basic_oids.oid_model.toString()
    // console.log(oid, typeof oid)

    // const session = await snmpFunctions.getSingleOID('192.168.0.1', ".1.3.6.1.4.1", 'public')
    // console.log(session)
    ctx.reply(`<pre><code>${tab}</code></pre>`, { parse_mode: "HTML" })
});
bot.callbackQuery("back", async (ctx) => {
    await ctx.conversation.exit();
    await ctx.conversation.enter(ctx.session.previosCVid);
});
bot.callbackQuery("cancel", async (ctx) => {
    await ctx.conversation.exit();
    await ctx.conversation.enter("main")
});
bot.callbackQuery("inContinue", async (ctx) => {
    await ctx.conversation.exit();
    await ctx.conversation.enter("main")
});
bot.hears(labels.EnterLabel, async (ctx) => {
    ctx.deleteMessage()
    helperFunctions.setSessionData(ctx)
    await ctx.conversation.enter("main");
})

bot.hears(labels.ExitLabel, async (ctx) => {
    ctx.deleteMessage()
    await ctx.reply(messages.GoodbayMessage, {
        reply_markup: {
            remove_keyboard: true
        },
    });
    await ctx.conversation.exit();
    await ctx.reply(messages.PleaceEnterMessage, {
        reply_markup: baseMenu.onEnter,
    });
});
bot.hears(labels.BackLabel, async (ctx) => {
    ctx.deleteMessage()
    await ctx.conversation.exit();
    await ctx.conversation.enter(ctx.session.previosCVid)
})
bot.hears(labels.AdvancedMenuLabel, async (ctx) => {
    ctx.deleteMessage()
    // helper.setSessionData(ctx)
    await ctx.conversation.exit();
    await ctx.conversation.enter("additional");
})
bot.hears(labels.CIDRCalcLabel, async (ctx) => {
    ctx.deleteMessage()
    // helper.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("cidr_calc");
})

bot.hears(labels.P2PCalcLabel, async (ctx) => {
    ctx.deleteMessage()
    // helper.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("p2p_calc");
})
bot.hears(labels.PingDeviceLabel, async (ctx) => {
    ctx.deleteMessage()
    // helper.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("ping_device");
})
bot.hears(labels.MIAllertLabel, async (ctx) => {
    ctx.deleteMessage()
    // let ua = await access.CheckAdminRole(ctx.message?.from.id)
    // if (ua) {
    await ctx.conversation.exit();

    await ctx.conversation.enter("massIncident");
    // } else {
    //     // logger.info(`ID: ${ctx.session.userId}(${ctx.session.userFirstName} ${ctx.session.userLastName}) ${messagesData.ErrorActionMessage} ${ctx.message.text}`)
    //     await ctx.reply(messagesData.ErrorNoAclMessage, { reply_markup: menu.main })
    // }
})
bot.hears(labels.CheckDeviceLabel, async (ctx) => {
    ctx.deleteMessage()
    // helper.setSessionData(ctx)
    await ctx.conversation.exit();
    await ctx.conversation.enter("check_device");
})
bot.hears(labels.PortInfoLabel, async (ctx) => {
    ctx.deleteMessage()
    // helper.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("portInfo");
})
bot.hears(labels.VlanListLabel, async (ctx) => {
    ctx.deleteMessage()
    // helper.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("vlanList");
})
bot.hears(labels.DDMInfoLabel, async (ctx) => {
    ctx.deleteMessage()
    // helper.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("ddmInfo");
})
bot.catch((err: any) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});
export default bot
