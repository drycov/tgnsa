export default {
  // port: 443,
  // sesionKey: 'Zero0One1Two2Three3Four4',
  defaultAdmin: 632646448,
  botTgID: 5493974365,
  // mongoURI: 'mongodb://127.0.0.1:27017',
  mongoURI:
    "mongodb+srv://ttc-ttcnsa:GJWPwBmlUJvc9S2S@cluster0.c48ewsz.mongodb.net",
  // defaultLanguage: "en",
  mongoOptions: {
    dbName: "ttcNSA",
  },
  vendor_info: {
    botVendor: "Denis Rykov",
    botVendorContact: "@Oritorius",
    botVendorEMailContact: "d.rykov@ttc.kz",
    botVendorWContact: "+7-705-155-7619",
  },
  pingDevice: {
    timeout: 10,
    interval: 2,
    count: 5,
  },
  smtp_client: {
    smtp_server: "smtp-mail.outlook.com",
    smtp_port: 587,
    smtp_user: "ttcnsb1@hotmail.com",
    smtp_pwd: "OSKQAZwsx2022*",
    smtp_from: "Transtelecom JSC Network Support BOT <ttcnsb1@hotmail.com>",
  },
  mass_data: {
    mii_dest: "d.rykov@ttc.kz",
    mii_subject: "Массовый инцидент",
  },
  snmp: {
    community: ["public", "atbu+1", "chinaPublic", "ChinaPublic", "public+"],
    rw_community: ["private"],
  },
};
