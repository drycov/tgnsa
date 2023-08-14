import labelsData from "./labels"
import symbolsData from "./symbols"
export default {
    WelcomeMessage: symbolsData.HiEmo + "Добрый день!",
    GoodbayMessage: symbolsData.HiEmo + "Удачного дня!",
    JustTextMessage: symbolsData.CritEmo + " Не найдено. Проверть ввод или введите команду /help ",
    UserAccessDenied: "В качестве информации просьба указывать ФИО и должность",
    HelpMessage: "<b>" + symbolsData.UserEmo + "Команды пользователя</b>\n<i><code>\/help</code> - вызвать это сообщение</i>\n<i><code>\/start</code> - запуск сервиса</i>\n<i><code>\/info</code> - информация о сервисе</i>\n<i><s><code>\/descr</code> - описание функционала сервиса\n<code>\/admins</code> - контакты Администраторов сервиса</s></i>",
    DescriptionMessagec: `Бот создан для автоматизации процессов ТТС.\nЗдесь вы можете проверить состояние оборудование доступа\nВ данный момент бот находиться нв стадии разработки.\nДоступна только функция проверки статуса портов`,

    //access
    RegisterMessage: symbolsData.HiEmo + "Добрый день! Для работы с ситемой Введите ваш корпоративный E-Mail",
    PleaceEnterMessage: symbolsData.LockerEmo + " Пожалуйста войдите",
    AccessDeniedMessage: symbolsData.LockerEmo + " Доступ запрещен, пожалуйста обратитесь для доступа к администратору: ",
    PleaceEnterKbMessage: `Для начала работы нажмите кнопку ${labelsData.EnterLabel}`,
    UserSavedInDBMessage: `${symbolsData.OkEmo} Вы добавлены в базу. ${symbolsData.SandTimeEmo} Ожидайте одобрения Администратором`,

    //ip
    EnterIpMessage: "Введите IP-адрес адрес устройства ",
    EnterSubnetP2PMessage: "Введите IP-адрес в формате <i><code>A.B.C.D/Mask(30)</code></i>",
    EnterSubnetIpMessage: "Введите IP-адрес в формате <i><code>A.B.C.D/Mask(0-32)</code></i>)",
    //Error Messages
    ErrorSubnetIpMessage: `${symbolsData.SHORT} Это не CIDR\n Укажите IP в формате A.B.C.D / Mask(0 - 32) и повторите снова`,
    ErrorSubnetP2PMessage: `${symbolsData.SHORT} Это не P2P\n Укажите IP в формате A.B.C.D / Mask(30) и повторите снова`,
    ErrorNoAclMessage: `${symbolsData.WarnEmo} Нет прав`,
    ErrorActionMessage: "Нет прав для доступа в меню:",
    ErrorNoAclRuleMessage: "Нет прав для ",
    ErroMessage: `<b>${symbolsData.CritEmo} Произошла ошибка, попробуйте позднее!!!</b>`,
    ErrorSNMPMessage: `<b>${symbolsData.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка!</b>\n<i>Попробуйте позднее.</i>\n<code>Возможно у сервиса нет прав на опрос оборудования или значение SNMP readonly Community не равно public.\nПроверьте логи и настройку на оборудовании и исправьте согласно рекомендации!</code>`,
    //port
    PortLegendMessage: "Включен:" + symbolsData.UpEmo + " Отключен:" + symbolsData.DownEmo + " Выключен:" + symbolsData.ShootDown + " Не опр.: " + symbolsData.UnknEmo,

    //admin
    UserAddSuccessMessage: symbolsData.OkEmo + " Пользователь добавлен",
    UserRemoveSuccessMessage: symbolsData.OkEmo + " Пользователь удален",
    AdminHelpMessage: `<b> ${symbolsData.TechnologyEmo} Команды Администратора</b>\n<i><code>\/log</code> - выгрузка логов сервиса</i>\n<i><code>\/si</code> - cлужебная информация о сервисе</i>\n<i><code>\/enb_"ID"</code> - подвердить доступ для пользователя с "ID"</i>\n<i><code>\/dsb_"ID"</code> - подвердить доступ для пользователя с "ID"</i>\n<i><code>\/yadm_"ID"</code> - Предоставить доступ администратора</i>\n<i><code>\/nadm_"ID"</code> - Отозвать доступ администратора</i>\n<i><code>\/ui_"ID"</code> - Профиль пользователя c "ID"</i>`,

    //mass incidient form messages
    MIIStationMessage: `Введите название станции(й): `,
    MIICityMessage: `Введите название города(ов): `,
    MIIAddresesMessage: `Введите адрес(а): `,
    MIICauseMessage: `Введите причину: `,
    MIIFromMessage: `Введите Должность, Фамилию, Имя`,
    MIIPhoneMessage: `Введите контактный телефон: `,
    MIIPriorityMessage: `Введите приоритет: `,
    MIIEndTimeMessage: `Введите ориентировочное время завершения массового инцидента: `,

    //user register form messages
    MsgAddFirstName: `Введите Имя`,
    MsgAddLastName: `Введите фамилию`,
    MsgAddСompanyPost: `Введите должность`,
    MsgAddpPhoneNumber: `Введите контактный телефон`,
    MsgAddEMail: `Введите вашу корпоративную почту`,
    MsgAddDeportament: `Введите филиал`,
    MsgAddCountry: `Введите участок обслуживания`,
    //users menagement

    //mass mailing form messages
    MsgMMTitle: `Введите тему:`,
    MsgMMMessage: `Введите ваше сообщение:`,
    MsgMMOnlyAdmins: `Только для админов?`,
    MsgMMPriority: `Выберите приоритет`,
    MsgMMFilials: `Выберите филиал`,
    MsgMMCause: `Введите причину: `,
    MsgMMFromBot: `Рассылка от имени бота?`,

}