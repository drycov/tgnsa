import { ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { hydrateFiles } from '@grammyjs/files';
import { FileAdapter } from '@grammyjs/storage-file';
import { Bot, Context, session } from 'grammy';
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

const token = helperFunctions.apptype() || "";
interface MainContext extends Context {
    session: { [key: string]: any }; // Change the type to match your session data structure
}

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

bot.command("test", async (ctx) => {
    const options: Options = {
        mode: 'text',
        pythonOptions: ['-u'], // unbuffered output
        scriptPath: '.', // путь к файлу netmiko_script.py
    };
    const res = await PythonShell.run('ps.py', options).then(res => { return res });
    await ctx.reply(res.toString());
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
export default bot
