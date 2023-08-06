import {
    type Conversation
} from "@grammyjs/conversations";
import { Context } from "grammy";
import deviceData from "../core/deviceData";
// import menu from "../keyboards/menu";

interface MyContext extends Context {
    session: { [key: string]: any }; // Change the type to match your session data structure
}
type MyConversation = Conversation<MyContext>;
export = {
    // check_device: async (conversation: MyConversation, ctx: MyContext) => {
    //     ctx.session.currentCVid = "check_device"
    //     ctx.session.previosCVid = "main"
    //     await ctx.reply(messages.EnterIpMessage, {
    //         reply_markup: menu.inBack,
    //     });
    //     const host = await conversation.form.text();
    //     if (host && IpCheck(host)) {
    //         const isAlive = await helper.isAlive(host).then((res) => {
    //             return (res)
    //         })
    //         if (isAlive) {
    //             const community = await helper.checkSNMP(host, config.snmp.community
    //             ).then(res => res)

    //             let devInfo = await deviceData.getBasicInfo(host, community,).then((res) => {
    //                 return res
    //             })
    //             if (devInfo != "false") {

    //                 await ctx.reply(devInfo + `\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`,
    //                     {
    //                         reply_markup: menu.checkDevice,
    //                         parse_mode: "HTML"
    //                     }
    //                 );
    //                 ctx.session.deviceHost = host.toString();
    //                 ctx.session.deviceCommunity = community.toString();
    //             }
    //         }
    //     }
    //     return
    // },
    // portInfo: async (conversation: MyConversation, ctx: CustomContext) => {
    //     ctx.session.currentCVid = "portInfo"
    //     ctx.session.previosCVid = "check_device"
    //     const host = ctx.session.deviceHost
    //     const community = ctx.session.deviceCommunity

    //     await ctx.reply('Проверка портов на устройстве: ' + host, {
    //         reply_markup: {
    //             remove_keyboard: true
    //         },
    //     });

    //     const portStatus = await deviceData.getPortStatus(host, community).then(status => {
    //         return status;
    //     });
    //     await ctx.reply(portStatus + `\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`, {
    //         reply_markup: menu.checkDevice,
    //         parse_mode: "HTML"
    //     })
    // }
}