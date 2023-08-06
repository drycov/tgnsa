import messagesData from "../assets/messages"
import util from 'util'
import symbols from '../assets/symbols'
import pjson from "../../package.json"
import config from '../config';

export default {
    msgWelcome: (ctx: any) => {
        const {
            id,
            first_name,
            last_name
        } = JSON.parse(ctx)
        return `${messagesData.WelcomeMessage} ${first_name} ${last_name}`
    },
    msgForbridedenUser: () => {
        return util.format(`<b>Ошибка %s </b> пользователь не <u>подтвержден</u> Администратором.\n<i>Пожалуйста свяжитесь с Админитратором:</i>`,
            symbols.CritEmo, config.vendor_info.botVendorContact
        )
    },
    msgInfo: (context: any) => {
        return `
    ❖ Имя бота : ${context.first_name}
    ❖ Адрес бота: @${context.username}
    ❖ Версия : ${pjson.version}
    ❖ Имя разработчика : ${config.vendor_info.botVendor}
    Контакты для связи
    📧  E-Mail: ${config.vendor_info.botVendorEMailContact}
    🕼   Telegram: ${config.vendor_info.botVendorContact}
    ✆  Watsapp: ${config.vendor_info.botVendorWContact}
    Лицензионное соглашение: ${pjson.license}
    `
    },
    msgReplyNoIp: (host: any) => {
        return `${symbols.WarnEmo} Это не IP: ${host}.\n Проверьте IP и повторите снова`
    },
    msgNotAllowed: (host: string) => {
        return `${host} ${symbols.DeadEmo} Устройство не на связи`
    },
    msgSNMPError: function (host: string) {
        return `${host} Устройство не поддерживает протокол SNMP V1/2c`
    }
}