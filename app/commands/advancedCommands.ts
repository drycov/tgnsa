import {
    type Conversation
} from "@grammyjs/conversations";
import { Context } from "grammy";
import util from 'util';
import labels from '../assets/labels';
import messages from "../assets/messages";
import advancedMenu from "../keyboards/advancedMenu";
import config from "../config";
import { SubnetCheck, P2PCheck, IpCheck } from "../assets/regexp";
import baseUtil from "../base_util/baseUtil";
import MailTo from "../core/MailTo";
import massData from "../core/massData";
import userData from "../data/userData";
import baseMenu from "../keyboards/baseMenu";
import messagesFunctions from "../utils/messagesFunctions";
import helperFunctions from "../utils/helperFunctions";
interface MyContext extends Context {
    session: { [key: string]: any }; // Change the type to match your session data structure
}
type MyConversation = Conversation<MyContext>;


export default {
    additional: async (conversation: MyConversation, ctx: MyContext) => {
        ctx.session.currentCVid = "additional"
        ctx.session.previosCVid = "main"
        await ctx.reply(labels.AdvancedMenuLabel, {
            reply_markup: advancedMenu.additional,
        });

    },
    cidr_calc: async (conversation: MyConversation, ctx: MyContext): Promise<void> => {
        ctx.session.currentCVid = "cidr_calc";
        ctx.session.previosCVid = "additional"

        await ctx.reply(messages.EnterSubnetIpMessage, {
            reply_markup: {
                remove_keyboard: true
            },
            parse_mode: "HTML"
        });

        const subnet = await conversation.form.text();
        if (!subnet || !SubnetCheck(subnet)) {
            await ctx.reply(messages.ErrorSubnetIpMessage, {
                reply_markup: baseMenu.inBack
            });
            return;
        }

        const cidrData = baseUtil.subnetCalculate(subnet);
        await ctx.reply(`${cidrData}\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`, {
            reply_markup: baseMenu.inBack,
            parse_mode: "HTML"
        });
    },
    p2p_calc: async (conversation: MyConversation, ctx: MyContext): Promise<void> => {
        ctx.session.currentCVid = "p2p_calc";
        ctx.session.previosCVid = "additional"

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
        await ctx.reply(`${cidrData}\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`, {
            reply_markup: baseMenu.inBack,
            parse_mode: "HTML",
        });
    },
    ping_device: async (conversation: MyConversation, ctx: MyContext): Promise<void> => {
        ctx.session.currentCVid = "ping_device";
        ctx.session.previosCVid = "additional"
        await ctx.reply(messages.EnterIpMessage, {
            reply_markup: {
                remove_keyboard: true,
            },
        });

        const host = await conversation.form.text();

        if (!host || !IpCheck(host)) {
            ctx.reply(messagesFunctions.msgReplyNoIp(ctx.message?.text), {
                reply_markup: baseMenu.inBack,
            })
            return;
        }

        const pingLog = await baseUtil.pingDeviceLog(host).then((res) => res.output).catch(() => null);
        if (pingLog) {
            await ctx.reply(util.format("%s\n<code>%s</code>\n\n<i>Выполнено:  <code>%s</code></i>",
                labels.PingDeviceLabel, pingLog.toString(), new Date().toLocaleString()), {
                reply_markup: baseMenu.inBack,
                parse_mode: "HTML",
            })
        } else {
            ctx.reply(messagesFunctions.msgNotAllowed(host), {
                reply_markup: baseMenu.inBack,
            })
        }
    },



    massIncident: async (conversation: MyConversation, ctx: MyContext): Promise<void> => {
        ctx.session.currentCVid = "massIncident";
        ctx.session.previosCVid = "additional";

        const user = await userData.getUserDataByTgId(ctx.session.userId);
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
        // generateNextMiId
        const id = await massData.generateNextMiId().then((res) => res)
        const massInc = JSON.stringify({
            _id: id,
            station: station,
            city: city,
            addr: addr,
            commet: cause,
            ts: massStart,
            te: me,
            from: user.firstName + ' ' + user.lastName + ' (' + user.deportament + ') ',
            phone: user.phoneNuber || "0",
            priority: priority
        }, null, '\t');

        const template = await helperFunctions.generateEmailTemplate(massInc, 'mass-template').then((res) => { return res })
        // await 
        MailTo.sendEmailWithTemplate(template, config.mass_data.mii_dest, config.mass_data.mii_subject);

        // const miData = MailTo.msgToSupport(JSON.stringify(massInc, null, '\t'));

        await ctx.reply(
            "Запрос на массовый инцидент подан\n\n\n" + "miData" + `\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`,
            { reply_markup: baseMenu.inBack, parse_mode: "HTML" }
        );
    },


}