import util from "util";
import pjson from "../../../package.json";
import messagesData from "../assets/messages";
import symbols from "../assets/symbols";
import config from "../config";
import helperFunctions from "./helperFunctions";
const currentDate = new Date().toLocaleString("ru-RU");

export default {
  msgWelcome: (ctx: any) => {
    const { first_name, last_name } = JSON.parse(ctx);
    return `${messagesData.WelcomeMessage} ${first_name} ${last_name}`;
  },
  msgForbridedenUser: () => {
    return util.format(
      `<b>Ошибка %s</b> пользователь не <u>подтвержден</u> Администратором.\n<i>Пожалуйста свяжитесь с Админитратором:</i>`,
      symbols.ErrorEmo,
      config.vendor_info.botVendorContact
    );
  },

  msgHandleError: (msg: string | undefined = undefined) => {
    return util.format(
      `<b>Ошибка %s</b> <pre>%s</pre><i>Пожалуйста свяжитесь с Админитратором:</i>%s\n\n<i>Выполнено:  <code>%s</code></i>`,
      symbols.ErrorEmo,
      msg === undefined ? 'Во время выполнения функции произошла ошибка' : msg,
      config.vendor_info.botVendorContact,
      currentDate
    );
  },

  msgApiTokenHandleError: (expired: string | undefined = undefined) => {
    if (expired === undefined) {
      // Handle the case where expired is undefined
      return util.format(
        `<b>Ошибка %s</b> <pre> Ваш токен является не актуальным.</pre><i>Пожалуйста обновите токен</i>`,
        symbols.ErrorEmo
      );
    }

    const timestamp: number = parseInt(expired, 10);

    if (isNaN(timestamp)) {
      // Handle the case where expired is not a valid number
      return util.format(
        `<b>Ошибка %s</b> <pre> Время действия токена не является числом.</pre><i>Пожалуйста обновите токен</i>`,
        symbols.ErrorEmo
      );
    }

    const dateObject: Date = new Date(timestamp * 1000);

    return util.format(
      `<b>Ошибка %s</b> <pre> Время действия токена истекло: %s</pre><i>Пожалуйста обновите токен</i>`,
      symbols.ErrorEmo,
      helperFunctions.get2DigDate(dateObject)
    );
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
    `;
  },
  msgReplyNoIp: (host: any) => {
    return `${symbols.WarnEmo} Это не IP: ${host}.\n Проверьте IP и повторите снова`;
  },
  msgNotAllowed: (host: string) => {
    return `${host} ${symbols.DeadEmo} Устройство не на связи`;
  },
  msgSNMPError: function (host: string) {
    return `${host} Устройство не поддерживает протокол SNMP V1/2c`;
  },
};
