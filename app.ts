import { conversations, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import { hydrateFiles } from "@grammyjs/files";
import { run } from "@grammyjs/runner";
import { FileAdapter } from '@grammyjs/storage-file';
import * as dotenv from 'dotenv';
import { Bot, Context, GrammyError, HttpError, session } from "grammy";
import labels from "./app/assets/labels";
import messages from "./app/assets/messages";
// import messages from "./app/assets/static/messages";
// import helperFunctions from './app/helperFunctionss/helperFunctions';
// import menu from "./app/keyboards/menu";
// import baseMenu from "./app/menus/baseMenu";
import deviceMenu from "./app/menus/deviceMenu";
// import main from "./app/menus/mainMenu";
import database from "./app/utils/database";
import joid from "./src/oid.json";
import mainCommands from "./app/commands/mainCommands";
import advancedCommands from "./app/commands/advancedCommands";
import deviceCommands from "./app/commands/deviceCommands";
import helperFunctions from "./app/utils/helperFunctions";
import mainMenu from "./app/keyboards/mainMenu";
import baseMenu from "./app/keyboards/baseMenu";
import messagesFunctions from "./app/utils/messagesFunctions";
import snmpFunctions from "./app/utils/snmpFunctions";

dotenv.config();
const token: string = helperFunctions.apptype() || "";
database();

interface MainContext extends Context {
    session: { [key: string]: any }; // Change the type to match your session data structure
}

const bot = new Bot<MainContext & ConversationFlavor>(token);
bot.api.config.use(hydrateFiles(bot.token));
const runner = run(bot);


bot.use(
    session({
        initial: () => ({
        }),
        storage: new FileAdapter({
            dirName: "data/sessions",
        }),
    })
);
bot.errorBoundary(
    (err) => console.error("Conversation threw an error!", err),
    conversations(),
    // createConversation(main.start),
    createConversation(mainCommands.main),
    // createConversation(main.regiser),
    createConversation(advancedCommands.additional),
    createConversation(advancedCommands.cidr_calc),
    createConversation(advancedCommands.p2p_calc),
    createConversation(advancedCommands.ping_device),
    createConversation(advancedCommands.massIncident),
    createConversation(deviceCommands.check_device),
    createConversation(deviceCommands.portInfo)
);

bot.command(["start", "st", "run"], async (ctx) => {
    const userInfo = JSON.stringify(ctx.message?.from, null, '\t');
    helperFunctions.setSessionData(ctx);
    try {
        // Interpolate the 'userInfo' variable into the message
        await ctx.reply(messagesFunctions.msgWelcome(userInfo));
        ctx.deleteMessage();
        await ctx.reply(messages.PleaceEnterKbMessage, {
            reply_markup: baseMenu.onEnter,
        });
    } catch (error) {
        console.error("Error while processing start command:", error);
        await ctx.reply("An error occurred while processing your request. Please try again later.");
    }
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

bot.command("test", async (ctx) => {
    // const verificationCodes = helperFunctions.generateVerificationCodes();
    // console.log(verificationCodes.codeA); // Example output: 1234
    // console.log(verificationCodes.codeB); // Example output: 5678
    // console.log(verificationCodes.jointValue); // Example output: 12345678
    const oid = joid.basic_oids.oid_model.toString()
    console.log(oid, typeof oid)

    const session = await snmpFunctions.getSingleOID('192.168.0.1', ".1.3.6.1.4.1", 'public')
    console.log(session)
});
// bot.on("message", (ctx) => ctx.reply("Got another message!"));

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
    // helperFunctions.setSessionData(ctx)
    await ctx.conversation.exit();
    await ctx.conversation.enter("additional");
})
bot.hears(labels.CIDRCalcLabel, async (ctx) => {
    ctx.deleteMessage()
    // helperFunctions.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("cidr_calc");
})

bot.hears(labels.P2PCalcLabel, async (ctx) => {
    ctx.deleteMessage()
    // helperFunctions.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("p2p_calc");
})
bot.hears(labels.PingDeviceLabel, async (ctx) => {
    ctx.deleteMessage()
    // helperFunctions.setSessionData(ctx)
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
    //     // logger.info(`ID: ${ctx.session.userId}(${ctx.session.userFirstName} ${ctx.session.userLastName}) ${messages.ErrorActionMessage} ${ctx.message.text}`)
    //     await ctx.reply(messages.ErrorNoAclMessage, { reply_markup: menu.main })
    // }
})
bot.hears(labels.CheckDeviceLabel, async (ctx) => {
    ctx.deleteMessage()
    // helperFunctions.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("check_device");
})
bot.hears(labels.PortInfoLabel, async (ctx) => {
    ctx.deleteMessage()
    // helperFunctions.setSessionData(ctx)
    await ctx.conversation.exit();

    await ctx.conversation.enter("portInfo");
})
bot.catch((err) => {
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
const stopRunner = () => {
    if (runner.isRunning()) {
        console.log(`${bot.botInfo.username} Stopped`);
        runner.stop();
    }
};

bot.command("back", async (ctx) => {
    // Reenter the previous conversation (start step in this case)
    await ctx.conversation.reenter("main");
});

process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
