import {
    type Conversation
} from "@grammyjs/conversations";
import { Context } from "grammy";
import labels from "../assets/labels";
import { default as messageText, default as messages } from "../assets/messages";
import config from "../config";
import access from "../core/access";
import userData from "../data/userData";
import baseMenu from "../keyboards/baseMenu";
import mainMenu from "../keyboards/mainMenu";
import helperFunctions from "../utils/helperFunctions";
import messagesFunctions from "../utils/messagesFunctions";
interface MyContext extends Context {
    session: { [key: string]: any }; // Change the type to match your session data structure
}

type MyConversation = Conversation<MyContext>;

export default {
    start: async (conversation: MyConversation, ctx: MyContext) => {
        ctx.session.previosCVid = "start";
        ctx.session.currentCVid = "start"
        await ctx.reply(messageText.PleaceEnterKbMessage, {
            reply_markup: baseMenu.onEnter,
        });
    },
    main: async (conversation: MyConversation, ctx: MyContext) => {
        ctx.session.previosCVid = "start";
        ctx.session.currentCVid = "main"
        let exist = await access.UserExist(ctx.session.userId)
        if (exist) {
            let status = await access.CheckUserStatus(ctx.session.userId)
            if (status) {
                let ua = await access.CheckAdminRole(ctx.session.userId)
                if (ua) {
                    await ctx.reply('🤘🏻 ' + labels.MainMenuLabel + ' 🤘🏻', {
                        reply_markup: mainMenu.admin,
                    });
                } else {
                    await ctx.reply(labels.MainMenuLabel,
                        {
                            reply_markup: mainMenu.main,
                        });
                }
            } else {
                ctx.reply(messagesFunctions.msgForbridedenUser(),
                    {
                        parse_mode: "HTML"
                    })
            }
        } else {
            try {

                await ctx.reply(messages.MsgAddFirstName, {
                    reply_markup: baseMenu.inBack,
                });
                const firstName = await conversation.form.text();
                await ctx.reply(messages.MsgAddLastName, {
                    reply_markup: baseMenu.inBack,
                });
                const lastName = await conversation.form.text();
                await ctx.reply(messages.MsgAddСompanyPost, {
                    reply_markup: baseMenu.inBack,
                });

                const companyPost = await conversation.form.text();
                await ctx.reply(messages.MsgAddpPhoneNumber, {
                    reply_markup: baseMenu.sendContact,
                });
                const { message } = await conversation.waitFor("message");
                const phoneNumber = message.contact?.phone_number;
                await ctx.reply(messages.MsgAddEMail, {
                    reply_markup: {
                        remove_keyboard: true,
                    },
                });
                const email = await conversation.form.text();
                const code = await helperFunctions.verifyEmail(email).then(res => res)
                const newUserInfo = JSON.stringify({
                    // _id: ctx.message?.from.id,
                    is_bot: ctx.message?.from.is_bot,
                    tgId: ctx.message?.from.id,
                    firstName: firstName,
                    lastName: lastName,
                    companyPost: companyPost,
                    phoneNumber: phoneNumber,
                    email: email,
                    userVerified: false,
                    verificationCode: code,
                    // deportament: deportament,
                    // country: country,
                    username: ctx.message?.from.username,
                    isAdmin: false,
                    userAllowed: false
                }, null, '\t');
                const adminUid = await userData.getAdminsUsers().then(res => res)
                console.log(adminUid)
                await userData.saveUser(newUserInfo).then((result) => {
                    adminUid.forEach((res: { isAdmin: any; id: string | number; }) => {
                        if (res.isAdmin) {
                            ctx.api.sendMessage(res.id, result)
                        } else {
                            ctx.api.sendMessage(config.defaultAdmin, result)
                        }
                    })
                })
                delete ctx.session.conversation;

                // ctx.reply(newUserInfo)
                // await savedata.saveUser(newUserInfo, 'user').then((res) => { return res });
                ctx.reply(messages.UserSavedInDBMessage)
            } catch (error) {
                console.error("Error during user registration:", error);
                ctx.reply("An error occurred during registration. Please try again later.");
            }
        }
    }
}