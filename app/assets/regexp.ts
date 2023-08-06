// Фабрики регулярных выражений
const createRegExp = (pattern: string, flags: string = '') => new RegExp(pattern, flags);

const createBotnameRegexp = (botname: string) => createRegExp(`\\@${botname}\\s`);
const createSubstringReplacer = (botname: string) => (val: string) => val.trim().replace(createBotnameRegexp(botname), '');

const IpRegexp = createRegExp('^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)(\\.(?!$)|$)){4}$');
const SubnetRegexp = createRegExp('^((25[0-5]|(2[0-4]|1\d|\d)(\.(?!$)|$)){4})(?:\/([0-9]|[12][0-9]|3[0-2]))?$');
const P2PSubnetRegexp = createRegExp('^((25[0-5]|(2[0-4]|1\d|\d)(\.(?!$)|$)){4})(?:\/30)$');
const UserGrantRegexp = createRegExp("\\/enb_");
const UserRevokeRegexp = createRegExp("\\/dsb_");
const AdminGrantRegexp = createRegExp("\\/yadm_");
const AdminRevokeRegexp = createRegExp("\\/nadm_");
const UserInfoRegexp = createRegExp("\\/ui_");

const E_MailRegexp = createRegExp('[a-zA-Z0-9]+\\@[a-zA-Z0-9]+\\.[a-zA-Z]+');
const TTC_MailRegexp = createRegExp('[a-zA-Z0-9]+\\@ttc.kz');

// Функции проверки
const createCheckFunction = (regexp: RegExp) => (val: string) => regexp.test(val.trim());

const IpCheck = createCheckFunction(IpRegexp);
const SubnetCheck = createCheckFunction(SubnetRegexp);
const P2PCheck = createCheckFunction(P2PSubnetRegexp);
const E_MailCheck = createCheckFunction(E_MailRegexp);
const TTC_MailCheck = createCheckFunction(TTC_MailRegexp);

export {
    IpRegexp, SubnetRegexp, P2PSubnetRegexp,
    IpCheck, SubnetCheck, P2PCheck, E_MailCheck, TTC_MailCheck,
    createSubstringReplacer,
    UserGrantRegexp, UserRevokeRegexp,
    AdminGrantRegexp, AdminRevokeRegexp, UserInfoRegexp
};
