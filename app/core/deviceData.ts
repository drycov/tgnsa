import { result, zip } from 'underscore';
import util from "util";
import { PythonShell, Options } from 'python-shell';

import joid from "../../src/oid.json";
import labels from "../assets/labels";
import deviceArr from "../base_util/deviceArr";
import snmpFunctions from '../utils/snmpFunctions';
import helperFunctions from '../utils/helperFunctions';
import symbols from '../assets/symbols';
import messagesFunctions from '../utils/messagesFunctions';
import logger from '../utils/logger';

import { table, getBorderCharacters, TableUserConfig, BaseUserConfig, ColumnUserConfig, Indexable } from "table";

const currentDate = new Date().toLocaleString('ru-RU');
type OidLoaderType = {
    [key: string]: string;
};
type JoidType = {
    [key: string]: {
        [key: string]: string;
    };
};



const devicData = {
    processDDMInfo: async (
        host: string,
        portIfList: string[],
        portIfRange: string[],
        baseOidDDMRXPower: string,
        baseOidDDMTXPower: string,
        baseOidDDMTemperature: string,
        baseOidDDMVoltage: string,
        community: string,
        results: any[],
        unstandart?: boolean,
        eltex?: boolean,
        powerConverter?: (value: number) => number
    ) => {
        const action = devicData.processDDMInfo.name;
        let message = `{"date":"${currentDate}", "action":"${action}", `;
        message += util.format('"%s":"%s", ', "host", host)
        for (let i = 0; i < portIfList.length; i++) {
            let oidDDMRXPower = baseOidDDMRXPower;
            let oidDDMTXPower = baseOidDDMTXPower;
            let oidDDMTemperature = baseOidDDMTemperature;
            let oidDDMVoltage = baseOidDDMVoltage;

            oidDDMRXPower +=
                (unstandart !== undefined ? (unstandart ? portIfList[i] + '.9' : (eltex ? portIfList[i] + '.5.1.' : portIfList[i])) : portIfList[i]);
            oidDDMTXPower +=
                (unstandart !== undefined ? (unstandart ? portIfList[i] + '.8' : (eltex ? portIfList[i] + '.4.1.' : portIfList[i])) : portIfList[i]);
            oidDDMTemperature +=
                (unstandart !== undefined ? (unstandart ? portIfList[i] + '.5' : (eltex ? portIfList[i] + '.1.1.' : portIfList[i])) : + portIfList[i]);
            oidDDMVoltage +=
                (unstandart !== undefined ? (unstandart ? portIfList[i] + '.6' : (eltex ? portIfList[i] + '.2.1.' : portIfList[i])) : + portIfList[i]);


            const getDDMLevelRX = await snmpFunctions.getSingleOID(
                host, oidDDMRXPower,
                community
            );
            const getDDMLevelTX = await snmpFunctions.getSingleOID(
                host,
                oidDDMTXPower,
                community
            );
            const getDDMTemperature = await snmpFunctions.getSingleOID(
                host,
                oidDDMTemperature,
                community
            );
            const getDDMVoltage = await snmpFunctions.getSingleOID(
                host, oidDDMVoltage,
                community
            );
            if (getDDMLevelTX !== 'noSuchInstance' && getDDMLevelTX !== '  -' && getDDMLevelRX !== 'noSuchInstance' && getDDMLevelTX !== 'NULL' && getDDMLevelRX !== 'NULL' && (getDDMVoltage !== '0' && getDDMVoltage !== 0)) {
                let DDMLevelRX = !unstandart ? parseFloat(parseFloat(getDDMLevelRX).toFixed(2)) : parseFloat((parseFloat(getDDMLevelRX) / 1000).toFixed(2));
                let DDMLevelTX = !unstandart ? parseFloat(parseFloat(getDDMLevelTX).toFixed(2)) : parseFloat((parseFloat(getDDMLevelTX) / 1000).toFixed(2));
                let DDMVoltage = !unstandart ? parseFloat(parseFloat(getDDMVoltage).toFixed(2)) : parseFloat((parseFloat(getDDMVoltage) / 1000000).toFixed(2));
                let DDMTemperature = !unstandart ? parseFloat(parseFloat(getDDMTemperature).toFixed(2)) : parseFloat((parseFloat(getDDMTemperature)).toFixed(2));

                if (powerConverter) {
                    DDMLevelRX = powerConverter(DDMLevelRX);
                    DDMLevelTX = powerConverter(DDMLevelTX);
                }
                results.push([portIfRange[i], DDMLevelTX, DDMLevelTX, DDMTemperature, DDMVoltage]
                );
            }
        }
    },
    // processADSLnfo: async (
    //     host: string,
    //     portIfList: string[],
    //     portIfRange: string[],
    //     baseATUcSnrMarg: string,
    //     baseATUcAttun: string,
    //     baseATUcPower: string,
    //     baseATUcRate: string,
    //     baseATUrSnrMarg: string,
    //     baseATUrAttun: string,
    //     baseATUrPower: string,
    //     baseATUrRate: string,
    //     community: string,
    //     results: string[],
    //     unstandart?: boolean,
    //     powerConverter?: (value: number) => number
    // ) => {
    //     const action = devicData.processADSLnfo.name;
    //     let message = `{"date":"${currentDate}", "action":"${action}", `;
    //     message += util.format('"%s":"%s", ', "host", host)
    //     for (let i = 0; i < portIfList.length; i++) {
    //         let oidATUcSnrMarg = baseATUcSnrMarg;
    //         let oidATUcAttun = baseATUcAttun;
    //         let oidATUcPower = baseATUcPower;
    //         let oidATUcRate = baseATUcRate;
    //         let oidATUrSnrMarg = baseATUrSnrMarg;
    //         let oidATUrAttun = baseATUrAttun;
    //         let oidATUrPower = baseATUrPower;
    //         let oidATUrRate = baseATUrRate;

    //         oidATUcSnrMarg +=
    //             (unstandart !== undefined ? (unstandart ? portIfList[i] + '.9' : (portIfList[i] + '.5.1' : portIfList[i])) : portIfList[i]);
    //         oidATUcAttun +=
    //             (unstandart !== undefined ? (unstandart ? portIfList[i] + '.8' : (eltex ? portIfList[i] + '.4.1' : portIfList[i])) : portIfList[i]);
    //         oidATUcPower +=
    //             (unstandart !== undefined ? (unstandart ? portIfList[i] + '.5' : (eltex ? portIfList[i] + '.1.1' : portIfList[i])) : + portIfList[i]);
    //         oidATUcRate +=
    //             (unstandart !== undefined ? (unstandart ? portIfList[i] + '.6' : (eltex ? portIfList[i] + '.2.1' : portIfList[i])) : + portIfList[i]);


    //         const getDDMLevelRX = await snmpFunctions.getSingleOID(
    //             host, oidDDMRXPower,
    //             community
    //         );
    //         const getDDMLevelTX = await snmpFunctions.getSingleOID(
    //             host,
    //             oidDDMTXPower,
    //             community
    //         );
    //         const getDDMTemperature = await snmpFunctions.getSingleOID(
    //             host,
    //             oidDDMTemperature,
    //             community
    //         );
    //         const getDDMVoltage = await snmpFunctions.getSingleOID(
    //             host, oidDDMVoltage
    //             ,
    //             community
    //         );
    //         if (getDDMLevelTX !== 'noSuchInstance' && getDDMLevelRX !== 'noSuchInstance' && getDDMLevelTX !== 'NULL' && getDDMLevelRX !== 'NULL' && (getDDMVoltage !== '0' && getDDMVoltage !== 0)) {
    //             let DDMLevelRX = !unstandart ? parseFloat(getDDMLevelRX) : parseFloat((parseFloat(getDDMLevelRX) / 1000).toFixed(3));
    //             let DDMLevelTX = !unstandart ? parseFloat(getDDMLevelTX) : parseFloat((parseFloat(getDDMLevelTX) / 1000).toFixed(3));
    //             let DDMVoltage = !unstandart ? getDDMVoltage : parseFloat((parseFloat(getDDMVoltage) / 1000000).toFixed(3));

    //             if (powerConverter) {
    //                 DDMLevelRX = powerConverter(DDMLevelRX);
    //                 DDMLevelTX = powerConverter(DDMLevelTX);
    //             }
    //             message += `"status":"done"}`;
    //             logger.info(message);
    //             results.push(
    //                 `${portIfRange[i]} 🔺TX: ${DDMLevelTX} 🔻RX: ${DDMLevelRX} 🌡C:${getDDMTemperature} ⚡️V: ${DDMVoltage}`
    //             );
    //             logger.debug(results)
    //         }
    //     }
    // },
    getDDMInfo: async (host: string, community: string): Promise<string> => {
        const action = devicData.getDDMInfo.name;
        let message = `{"date":"${currentDate}", "action":"${action}", `;
        message += util.format('"%s":"%s", ', "host", host)

        try {
            const results: any[] = [];
            const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community);

            const model: any = deviceArr.FilterDeviceModel(dirty);
            const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);
            const aiflist = JSON.parse(JSON_aiflist);
            const portIfList = aiflist.interfaceList;
            const portIfRange = aiflist.interfaceRange;
            const ddm = aiflist.ddm;
            const fibers = aiflist.fibers;
            const columnConfig: Indexable<ColumnUserConfig> = [
                { width: 8, alignment: 'center' }, // IF
                { width: 6, alignment: 'center' },  // 🔺Tx
                { width: 6, alignment: 'center' },  // 🔻RX
                { width: 5, alignment: 'center' },  // 🌡C
                { width: 4, alignment: 'center' },  // ⚡️V
            ];

            const config: BaseUserConfig = {
                columns: columnConfig,
                columnDefault: {
                    paddingLeft: 0,
                    paddingRight: 0,
                    // width: 6,
                },
                border: getBorderCharacters(`ramac`)

            }

            if (ddm && fibers === 0) {
                // results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована`); 
                message += `"error":"ddm not supported"}`;
                logger.error(message);
                return `${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n`;

            } else {
                // const noDDMport = portIfList.length - fibers;
                // const DDMport = portIfList.length;

                const oidLoaderKey: keyof JoidType =
                    model.includes('SNR')
                        ? 'snr_oids'
                        : model.includes('Eltex')
                            ? 'eltex_oids'
                            : model.includes('DGS') || model.includes('DES')
                                ? 'dlink_oids'
                                : model.includes('SG200-26')
                                    ? 'cisco_oids'
                                    : '';

                if (oidLoaderKey === '') {
                    // results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n\n`);
                    message += `"error":"ddm not supported"}`;
                    logger.error(message);
                    return `${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n`;
                }
                const oidLoader: OidLoaderType = (joid as JoidType)[oidLoaderKey];
                results.push(['IF', '🔺Tx', '🔻RX', '🌡C', '⚡️V'],)
                // const oidLoader: OidLoaderType = joid[oidLoaderKey];

                if (model.includes('SNR')) {
                    await devicData.processDDMInfo(
                        host,
                        portIfList,
                        portIfRange,
                        oidLoader['snr_oid_DDMRXPower'],
                        oidLoader['snr_oid_DDMTXPower'],
                        oidLoader['snr_oid_DDMTemperature'],
                        oidLoader['snr_oid_DDMVoltage'],
                        community,
                        results
                    );
                } else if (model.includes('Eltex MES14') || model.includes('Eltex MES24') || model.includes('Eltex MES3708')) {
                    await devicData.processDDMInfo(
                        host,
                        portIfList,
                        portIfRange,
                        oidLoader['eltex_DDM_mes14_mes24_mes_3708'],
                        oidLoader['eltex_DDM_mes14_mes24_mes_3708'],
                        oidLoader['eltex_DDM_mes14_mes24_mes_3708'],
                        oidLoader['eltex_DDM_mes14_mes24_mes_3708'],
                        community,
                        results,
                        false,
                        true,
                        helperFunctions.mWtodBW
                    );
                } else if (model.includes('Eltex MES23') || model.includes('Eltex MES33') || model.includes('Eltex MES35') || model.includes('Eltex  MES53')) {
                    await devicData.processDDMInfo(
                        host,
                        portIfList,
                        portIfRange,
                        oidLoader['eltex_DDM_mes23_mes33_mes35_mes53'],
                        oidLoader['eltex_DDM_mes23_mes33_mes35_mes53'],
                        oidLoader['eltex_DDM_mes23_mes33_mes35_mes53'],
                        oidLoader['eltex_DDM_mes23_mes33_mes35_mes53'],
                        community,
                        results,
                        true
                    );
                }
                else if (model.includes("DGS-3620") || model.includes("DES-3200") || model.includes("DGS-3000")) {
                    await devicData.processDDMInfo(
                        host,
                        portIfList,
                        portIfRange,
                        oidLoader['dlink_dgs36xx_ses32xx_dgs_30xx_ddm_rx_power'],
                        oidLoader['dlink_dgs36xx_ses32xx_dgs_30xx_ddm_tx_power'],
                        oidLoader['dlink_dgs36xx_ses32xx_dgs_30xx_ddm_temperatura'],
                        oidLoader['dlink_dgs36xx_ses32xx_dgs_30xx_ddm_voltage'],
                        community,
                        results,
                    );
                } else if (model.includes("SG200-26")) {
                    await devicData.processDDMInfo(
                        host,
                        portIfList,
                        portIfRange,
                        oidLoader['cisco_DDM_S200'],
                        oidLoader['cisco_DDM_S200'],
                        oidLoader['cisco_DDM_S200'],
                        oidLoader['cisco_DDM_S200'],
                        community,
                        results,
                    );
                }
                const tab = table(results, config)
                return tab;
            }
        } catch (error) {
            message += `"error":"${error}"}`;
            logger.error(message);
            return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
        }
        return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    },

    getADSLLine: async (host: string, community: string): Promise<string> => {
        const action = devicData.getADSLLine.name;
        let message = `{"date":"${currentDate}", "action":"${action}", `;
        message += util.format('"%s":"%s", ', "host", host)

        try {
            const results: string[] = [];
            const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community);

            const model: any = deviceArr.FilterDeviceModel(dirty);
            const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);
            const aiflist = JSON.parse(JSON_aiflist);
            const portIfList = aiflist.interfaceList;
            const portIfRange = aiflist.interfaceRange;
            const ddm = aiflist.ddm;
            const fibers = aiflist.fibers;
        } catch (error) {
            message += `"error":"${error}"}`;
            logger.error(message);
            return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
        }
        return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    },

    getBasicInfo: async (host: string, community: any): Promise<string | false> => {
        let action = devicData.getBasicInfo.name;
        let message = util.format('{"date":"%s", "action":"%s", ', currentDate, action)
        message += util.format('"%s":"%s", ', "host", host)

        const result = util.format("%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее", symbols.SHORT)

        try {
            const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community)
                .then((res) => res)
                .catch((err) => err);

            const swSysName = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_sysname, community)
                .then((res) => res);

            const UpTime = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_uptime, community)
                .then((res) => res);
            const swModel = deviceArr.FilterDeviceModel(dirty);
            const swUpTime = helperFunctions.secToStr(UpTime);

            return util.format(
                "%s\n\n<i>Статус устройства:</i> <code>%s Доступен</code>\n<i>IP устройства: <code>%s</code></i>\n<i>Имя устройства:  <code>%s</code></i>\n<i>Модель устройства:  <code>%s</code></i>\n<i>Uptime:  <code>%s</code>( <code>%s</code>)</i>",
                labels.CheckDeviceLabel,
                symbols.OK_UP,
                host,
                swSysName,
                swModel,
                swUpTime,
                UpTime
            );
        } catch (error) {
            message += util.format('"%s":"%s"}', "error", error)
            logger.error(message);
            return result;
        }

    },
    getPortStatus: async (host: string, community: string): Promise<string> => {
        let action = devicData.getPortStatus.name;
        let message = util.format('{"date":"%s", "action":"%s", ', currentDate, action)
        message += util.format('"%s":"%s", ', "host", host)

        const result = util.format("%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее", symbols.SHORT)
        try {
            const results = []
            const dirty = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_model, community)
                .then((res) => {
                    return res;
                }).catch((error) => {
                    message += util.format('"%s":"%s"}', "error", error)
                    logger.error(message);
                    return error;
                });
            const model = deviceArr.FilterDeviceModel(dirty);
            const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model)
                .then((res) => {
                    return res
                })
            const aiflist = JSON.parse(JSON_aiflist)
            const portIfList = aiflist.interfaceList
            const portIfRange = aiflist.interfaceRange
            if (portIfList == "Server" && portIfRange == "Server") {
                const intRange = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifName, community)
                    .then((res) => {
                        return res
                    }, (error) => {
                        message += util.format('"%s":"%s"}', "error", error)
                        logger.error(message);
                    });
                const intList = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifIndex, community)
                    .then((res) => {
                        return res
                    }, (error) => {
                        message += util.format('"%s":"%s"}', "error", error)
                        logger.error(message);
                    });

                for (let ifId in zip(intList, intRange)) {
                    let intDescr = await snmpFunctions.getSingleOID(host, joid.linux_server.oid_ifDescr + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    if (intDescr == 'noSuchInstance' && intDescr == 'noSuchObject') {
                        intDescr = 'NaN'
                    } else {
                        intDescr = intDescr
                    }
                    const portOperStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_oper_ports + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    const portAdminStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_admin_ports + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    const get_inerrors = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_inerrors + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    // get_inerrors = parseInt(get_inerrors)
                    let operStatus
                    if (portOperStatus == "1") {
                        operStatus = symbols.OK_UP
                    } else if (portOperStatus == "2") {
                        operStatus = symbols.SHORT
                    } else {
                        operStatus = symbols.UNKNOWN
                    }
                    if (portAdminStatus == "2") {
                        operStatus = util.format('%s', symbols.NOCABLE)
                    }
                    if (parseInt(get_inerrors) == 0) {
                        results.push(util.format("<code>%s</code> %s | %s", intRange[ifId], operStatus, intDescr))
                    } else
                        if (parseInt(get_inerrors) > 0) {
                            results.push(util.format("<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |", intRange[ifId], operStatus, intDescr, get_inerrors, symbols.WarnEmo))
                        }
                }
            } else if (portIfList == "auto" && portIfRange == "auto") {
                const intRange = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifName, community)
                    .then((res) => {
                        return res
                    }, (error) => {
                        message += util.format('"%s":"%s"}', "error", error)
                        logger.error(message);
                    });
                const intList = await snmpFunctions.getMultiOID(host, joid.linux_server.oid_ifIndex, community)
                    .then((res) => {
                        return res
                    }, (error) => {
                        message += util.format('"%s":"%s"}', "error", error)
                        logger.error(message);
                    });

                for (let ifId in zip(intList, intRange)) {
                    let intDescr = await snmpFunctions.getSingleOID(host, joid.linux_server.oid_ifDescr + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    if (intDescr == 'noSuchInstance' && intDescr == 'noSuchObject') {
                        intDescr = 'NaN'
                    } else {
                        intDescr = intDescr
                    }
                    const portOperStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_oper_ports + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    const portAdminStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_admin_ports + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    const get_inerrors = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_inerrors + intList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    // get_inerrors = parseInt(get_inerrors)
                    let operStatus
                    if (portOperStatus == "1") {
                        operStatus = symbols.OK_UP
                    } else if (portOperStatus == "2") {
                        operStatus = symbols.SHORT
                    } else {
                        operStatus = symbols.UNKNOWN
                    }
                    if (portAdminStatus == "2") {
                        operStatus = util.format('%s', symbols.NOCABLE)
                    }
                    if (parseInt(get_inerrors) == 0) {
                        results.push(util.format("<code>%s</code> %s | %s", intRange[ifId], operStatus, intDescr))
                    } else
                        if (parseInt(get_inerrors) > 0) {
                            results.push(util.format("<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |", intRange[ifId], operStatus, intDescr, get_inerrors, symbols.WarnEmo))
                        }
                }
            } else {
                for (let ifId in zip(portIfList, portIfRange)) {
                    let intDescr = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_descr_ports + portIfList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    if (intDescr == 'noSuchInstance' && intDescr == 'noSuchObject') {
                        intDescr = 'NaN'
                    } else {
                        intDescr = intDescr
                    }
                    const portOperStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_oper_ports + portIfList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    const portAdminStatus = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_admin_ports + portIfList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    const get_inerrors = await snmpFunctions.getSingleOID(host, joid.basic_oids.oid_inerrors + portIfList[ifId], community)
                        .then((res) => {
                            return res
                        }, (error) => {
                            message += util.format('"%s":"%s"}', "error", error)
                            logger.error(message);
                        });
                    // get_inerrors = parseInt(get_inerrors)
                    let operStatus
                    if (portOperStatus == "1") {
                        operStatus = symbols.OK_UP
                    } else if (portOperStatus == "2") {
                        operStatus = symbols.SHORT
                    } else {
                        operStatus = symbols.UNKNOWN
                    }
                    if (portAdminStatus == "2") {
                        operStatus = util.format('%s', symbols.NOCABLE)
                    }
                    if (parseInt(get_inerrors) == 0) {
                        results.push(util.format("<code>%s</code> %s | %s", portIfRange[ifId], operStatus, intDescr))
                    } else
                        if (parseInt(get_inerrors) > 0) {
                            results.push(util.format("<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |", portIfRange[ifId], operStatus, intDescr, get_inerrors, symbols.WarnEmo))
                        }
                }
            }

            return (`${results.join('\n')}\n\nP.S. Состояния: ${symbols.OK_UP} - Линк есть, ${symbols.SHORT} - Линка нет, ${symbols.NOCABLE} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно \n`)
        } catch (e) {
            message += util.format('"%s":"%s"}', "error", e)
            logger.error(message);
            return result

        }
    },
    getVlanList: async (host: string, community: string) => {
        let action = devicData.getVlanList.name;
        let message = util.format('{"date":"%s", "action":"%s", ', currentDate, action)
        message += util.format('"%s":"%s", ', "host", host)

        let res: any[] = [];
        const columnConfig: Indexable<ColumnUserConfig> = [
            { width: 8, alignment: 'center' }, // IF
            { width: 6, alignment: 'center' },  // 🔺Tx
            { width: 6, alignment: 'center' },  // 🔻RX
            { width: 5, alignment: 'center' },  // 🌡C
            { width: 4, alignment: 'center' },  // ⚡️V
        ];

        const config: BaseUserConfig = {
            columnDefault: {
                paddingLeft: 0,
                paddingRight: 0,
                // width: 10,
            },
            border: getBorderCharacters(`ramac`)

        }
        const result = util.format("%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее", symbols.SHORT)
        try {
            // res.push(['VlanName', 'VlanId'],)

            const vlanName = await snmpFunctions.getMultiOID(host, joid.basic_oids.oid_vlan_list, community)
                .then((res) => {
                    return res;
                }).catch((err) => {
                    message += util.format('"%s":"%s"}', "error", err)
                    logger.error(message);
                    return err;
                });
            const vlanId = await snmpFunctions.getMultiOID(host, joid.basic_oids.oid_vlan_id, community)
                .then((res) => {
                    return res;
                }).catch((err) => {
                    message += util.format('"%s":"%s"}', "error", err)
                    logger.error(message);
                    return err;
                });
            if (!vlanName || !vlanId) {
                throw new Error(messagesFunctions.msgSNMPError(host));
            }
            for (let l in vlanName) {
                res.push(`VlanId: ${vlanId[l]} VlanName: ${vlanName[l]} `);
                // res.push([vlanName[l], vlanId[l]])
            }
            return res.join('\n');
        } catch (e) {
            message += util.format('"%s":"%s"}', "error", e)
            logger.error(message);
            return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
        }
    },
    runNetmikoScript: (): Promise<string> => {
        const options: Options = {
            mode: 'json',
            pythonOptions: ['-u'], // unbuffered output
            scriptPath: '/', // путь к файлу netmiko_script.py
        };

        return new Promise((resolve, reject) => {
            PythonShell.runString('ps.py', options).then(messages => {
                logger.info(messages);
            });
        })
    }
}

export default devicData;