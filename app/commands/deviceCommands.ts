import {
    type Conversation
} from "@grammyjs/conversations";
import { Context } from "grammy";
import util from "util";
import messages from "../assets/messages";
import { IpCheck } from "../assets/regexp";
import config from "../config";
import deviceData from "../core/deviceData";
import baseMenu from "../keyboards/baseMenu";
import deviceMenu from "../keyboards/deviceMenu";
import helperFunctions from "../utils/helperFunctions";
import snmpFunctions from "../utils/snmpFunctions";

interface MyContext extends Context {
    session: { [key: string]: any }; // Change the type to match your session data structure
}
type MyConversation = Conversation<MyContext>;
const currentDate = helperFunctions.getHumanDate(new Date());

const deviceCommands = {
    check_device: async (conversation: MyConversation, ctx: MyContext) => {
        let action = deviceCommands.check_device.name;
        let message = util.format('{"date":"%s", "%s":%s","%s":"%s", ',currentDate,"action",action,"userId",ctx.session.userId)
        ctx.session.currentCVid = "check_device";
        ctx.session.previosCVid = "main";
        
        await ctx.reply(messages.EnterIpMessage, {
            reply_markup: baseMenu.inBack,
        });

        ctx = await conversation.wait();
        const host = ctx.message?.text;
        message += util.format('"%s": "%s", ',action='host',host)
        if (host) {
            const ifTru = IpCheck(host)
            message +=  util.format('%s: "%s", ',action='Ip_check',ifTru)
            // console.log(message)
            if (ifTru) {
                const isAlive = await helperFunctions.isAlive(host).then((res) => {
                    return (res)
                })
                message += util.format('"%s": "%s"}',action='isAlive',isAlive)
                // console.log(message)
                if (isAlive) {
                    const community = await snmpFunctions.checkSNMP(host, config.snmp.community
                    ).then(res => res)

                    ctx.session.snmpCommunity = community;
                    ctx.session.deviceHost = host.toString();

                    const devInfo = await deviceData.getBasicInfo(host, community);
                    if (devInfo !== "false") {
                        await ctx.reply(
                            devInfo + `\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`,
                            {
                                reply_markup: deviceMenu.checkDevice,
                                parse_mode: "HTML",
                            }
                        ).catch(helperFunctions.noop);
                        console.log(message)
                        return
                    } else {
                        ctx.reply(messages.ErroMessage + "\n" + messages.ErrorSNMPMessage, {
                            parse_mode: "HTML",
                        }).catch(helperFunctions.noop);
                        message += util.format('}')
                        console.log(message)
                        return
                    }
                }
            }
        } else {
            // Handle invalid IP address
            ctx.reply(
                messages.ErroMessage + "\n",
                {
                    parse_mode: "HTML",
                    reply_markup: baseMenu.inBack,
                }
            ).catch(helperFunctions.noop);
            message += util.format('}')
            console.log(message)
            return
        }
        console.log(message)
        return
    },
    portInfo: async (conversation: MyConversation, ctx: MyContext) => {
        ctx.session.currentCVid = "check_device";
        ctx.session.previosCVid = "main";
        const host = ctx.session.deviceHost
        const community = ctx.session.snmpCommunity

        await ctx.reply('Проверка портов на устройстве: ' + host, {
            reply_markup: {
                remove_keyboard: true
            },
        });

        const portStatus = await deviceData.getPortStatus(host, community).then(status => {
            return status;
        });
        await ctx.reply(portStatus + `\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`, {
            reply_markup: deviceMenu.checkDevice,
            parse_mode: "HTML"
        })
    },
    vlanList: async (conversation: MyConversation, ctx: MyContext) => {
        ctx.session.currentCVid = "check_device";
        ctx.session.previosCVid = "main";
        const host = ctx.session.deviceHost
        const community = ctx.session.snmpCommunity

        await ctx.reply('Список VLAN на устройстве: ' + host, {
            reply_markup: {
                remove_keyboard: true
            },
        });

        const vlanListResult = await deviceData.getVlanList(host, community).then(status => {
            return status;
        });

        await ctx.reply(vlanListResult + `\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`, {
            reply_markup: deviceMenu.checkDevice,
            parse_mode: "HTML"
        });
    },
    ddmInfo: async (conveconversation: MyConversation, ctx: MyContext) => {
        ctx.session.currentCVid = "check_device";
        ctx.session.previosCVid = "main";
        const host = ctx.session.deviceHost
        const community = ctx.session.snmpCommunity

        await ctx.reply('Уровень оптического сигнала на устройстве: ' + host, {
            reply_markup: {
                remove_keyboard: true
            },
        })
        const DDMInfo = await deviceData.getDDMInfo(host, community).then((res) => res)
        await ctx.reply(DDMInfo + `\n\n<i>Выполнено:  <code>${new Date().toLocaleString()}</code></i>`, {
            reply_markup: deviceMenu.checkDevice,
            parse_mode: "HTML"
        })
    }

}
export default deviceCommands