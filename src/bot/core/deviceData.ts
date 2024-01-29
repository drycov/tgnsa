import * as path from "path";
import { Options, PythonShell } from "python-shell";
import { zip } from "underscore";
import util from "util";
import joid from "../../src/oid.json";
import labels from "../assets/labels";
import symbols from "../assets/symbols";
import deviceArr from "../base_util/deviceArr";
import helperFunctions from "../utils/helperFunctions";
import logger from "../utils/logger";
import messagesFunctions from "../utils/messagesFunctions";
import snmpFunctions from "../utils/snmpFunctions";
// import config from "../config";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);

const config = require(configPath);

const currentDate = new Date().toLocaleString("ru-RU");
type OidLoaderType = {
  [key: string]: string;
};
type JoidType = {
  [key: string]: {
    [key: string]: string;
  };
};

const devicData = {

  walkOidValue: async (oid: string, host: string, community: string) => {
    try {
      return await snmpFunctions.getMultiOIDValue(host, oid, community);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
  getOidValue: async (oid: string, host: string, community: string) => {
    try {
      return await snmpFunctions.getSingleOID(host, oid, community);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
  walkOidOnlyValue: async (oid: string, host: string, community: string) => {
    try {
      return await snmpFunctions.getMultiOID(host, oid, community);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
  getOidOnlyValue: async (oid: string, host: string, community: string) => {
    try {
      return await snmpFunctions.getSingleOID(host, oid, community);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
  processPortStatus: async (
    host: string,
    portIfList: string[],
    portIfRange: string[],
    community: string,
    results: any[],
    model?: string | undefined,

  ) => {
    const action = devicData.processPortStatus.name;
    let message = `{"date":"${currentDate}", "action":"${action}", `;
    message += util.format('"%s":"%s", ', "host", host);

    let descrOid = model?.includes("IES-612") || model?.includes("IES1248-51") || model?.includes("SAM1008") ? joid.AAM1212_oid.subrPortName : joid.basic_oids.oid_descr_ports;

    try {
      for (let i = 0; i < portIfList.length; i++) {
        const testIntDescr = await devicData.getOidValue(
          descrOid + portIfList[i], host, community
        );
        if (
          config.excludedSubstrings.some((substring: any) => portIfRange[i].includes(substring))
          || /^\d+$/.test(portIfRange[i])
          || /[a-zA-Z]+[0-9]\/[0-9]\/[0-9]\/[0-9]\./g.test(portIfRange[i])
          || portIfRange[i].includes('.ServiceInstance')
          || portIfRange[i].includes('noSuchInstance')
          || portIfRange[i].includes("E1")
          || portIfRange[i].includes("AUX")
          || portIfRange[i].includes(`${testIntDescr}.`) // ИЛИ если строка НЕ содержит только цифры
        ) {
          continue; // Пропускаем эту итерацию, если строка содержит исключенные подстроки или не содержит только цифры
        }
        const intDescr = await devicData.getOidValue(
          descrOid + portIfList[i], host, community
        );
        const portOperStatus = await devicData.getOidValue(
          joid.basic_oids.oid_oper_ports + portIfList[i], host, community
        );
        const portAdminStatus = await devicData.getOidValue(
          joid.basic_oids.oid_admin_ports + portIfList[i], host, community
        );
        const get_inerrors = await devicData.getOidValue(
          joid.basic_oids.oid_inerrors + portIfList[i], host, community
        );
        if (!portIfRange[i].includes("port")) {
          if ((portIfRange[i].includes("Po") || portIfRange[i].includes("po") || portIfRange[i].includes("ControlEthernet") || portIfRange[i].includes("Port"))) {
            continue;
          }
        }


        let operStatus;
        switch (portOperStatus) {
          case 1:
            operStatus = symbols.OK_UP
            break;
          case 2:
            operStatus = symbols.OKEY;
            break;
          default:
            operStatus = symbols.UNKNOWN;
            break;
        }
        if (portAdminStatus == "2") {
          operStatus = util.format("%s", symbols.AdminDownEmo);
        }

        let fixIntDescr = intDescr;
        let fixIntName = portIfRange[i];
        let fixInErrors = get_inerrors;

        if (portIfRange[i].includes("Huawei")) {
          fixIntName = await devicData.getOidValue(joid.linux_server.oid_ifName + '.' + portIfList[i], host, community);
        }
        if (intDescr == "noSuchInstance" || intDescr == "noSuchObject") {
          fixIntDescr = " ";
        }
        if (parseInt(get_inerrors) == 0 || get_inerrors == "noSuchInstance" || get_inerrors == "noSuchObject") {
          fixInErrors = " ";
        }

        results.push([
          operStatus,
          fixIntName,
          fixInErrors,
          fixIntDescr

        ]);
      }

      message += `"status":"done"}`;
      logger.info(message);

    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }

  },
  processVlan: async (host: string, community: string, results: any[]) => {
    let action = devicData.processVlan.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);
    const vlanName = await snmpFunctions
      .getMultiOID(host, joid.basic_oids.oid_vlan_list, community)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        message += util.format('"%s":"%s"}', "error", err);
        logger.error(message);
        return err;
      });
    const vlanId = await snmpFunctions
      .getMultiOID(host, joid.basic_oids.oid_vlan_id, community)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        message += util.format('"%s":"%s"}', "error", err);
        logger.error(message);
        return err;
      });
    if (!vlanName || !vlanId) {
      throw new Error(messagesFunctions.msgSNMPError(host));
    }
    for (let l in vlanName) {
      results.push([
        vlanId[l],
        vlanName[l]
      ]);        // res.push([vlanName[l], vlanId[l]])
    }
  },
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
    message += util.format('"%s":"%s", ', "host", host);
    try {
      for (let i = 0; i < portIfList.length; i++) {
        let oidDDMRXPower = baseOidDDMRXPower;
        let oidDDMTXPower = baseOidDDMTXPower;
        let oidDDMTemperature = baseOidDDMTemperature;
        let oidDDMVoltage = baseOidDDMVoltage;

        oidDDMRXPower +=
          unstandart !== undefined
            ? unstandart
              ? portIfList[i] + ".9"
              : eltex
                ? portIfList[i] + ".5.1."
                : portIfList[i]
            : portIfList[i];
        oidDDMTXPower +=
          unstandart !== undefined
            ? unstandart
              ? portIfList[i] + ".8"
              : eltex
                ? portIfList[i] + ".4.1."
                : portIfList[i]
            : portIfList[i];
        oidDDMTemperature +=
          unstandart !== undefined
            ? unstandart
              ? portIfList[i] + ".5"
              : eltex
                ? portIfList[i] + ".1.1."
                : portIfList[i]
            : +portIfList[i];
        oidDDMVoltage +=
          unstandart !== undefined
            ? unstandart
              ? portIfList[i] + ".6"
              : eltex
                ? portIfList[i] + ".2.1."
                : portIfList[i]
            : +portIfList[i];

        const getDDMLevelRX = await snmpFunctions.getSingleOID(
          host,
          oidDDMRXPower,
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
          host,
          oidDDMVoltage,
          community
        );

        if (
          getDDMLevelTX !== "noSuchInstance" &&
          getDDMLevelTX !== "  -" &&
          getDDMLevelRX !== "noSuchInstance" &&
          getDDMLevelTX !== "NULL" &&
          getDDMLevelRX !== "NULL" &&
          getDDMVoltage !== "0" &&
          getDDMVoltage !== 0
        ) {
          console.log({getDDMLevelRX,getDDMLevelTX,getDDMTemperature,getDDMVoltage})

          let DDMLevelRX = !unstandart
            ? parseFloat(parseFloat(getDDMLevelRX).toFixed(2))
            : parseFloat((parseFloat(getDDMLevelRX) / 1000).toFixed(2));
          let DDMLevelTX = !unstandart
            ? parseFloat(parseFloat(getDDMLevelTX).toFixed(2))
            : parseFloat((parseFloat(getDDMLevelTX) / 1000).toFixed(2));
          let DDMVoltage = !unstandart
            ? parseFloat(parseFloat(getDDMVoltage).toFixed(2))
            : parseFloat((parseFloat(getDDMVoltage) / 1000000).toFixed(2));
          let DDMTemperature = !unstandart
            ? parseFloat(parseFloat(getDDMTemperature).toFixed(2))
            : parseFloat(parseFloat(getDDMTemperature).toFixed(2));

          if (powerConverter) {
            DDMLevelRX = powerConverter(DDMLevelRX);
            DDMLevelTX = powerConverter(DDMLevelTX);
          }

          console.log({DDMLevelRX,DDMLevelTX,DDMVoltage,DDMTemperature})

          results.push([
            portIfRange[i],
            DDMLevelTX,
            DDMLevelRX,
            DDMTemperature,
            DDMVoltage,
          ]);
        }
      }
      message += `"status":"done"}`;
      logger.info(message);
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },

  processADSLInfo: async (
    host: string,
    portIfList: string[],
    portIfRange: string[],
    community: string,
    results: any[],
    unstandart?: boolean,
    powerConverter?: (value: number) => number
  ) => {
    const action = devicData.processADSLInfo.name;
    let message = `{"date":"${currentDate}", "action":"${action}", `;
    message += util.format('"%s":"%s", ', "host", host);

    try {
      for (let i = 0; i < portIfList.length; i++) {
        if (
          config.excludedSubstrings.some((substring: any) => portIfRange[i].includes(substring)) || /^\d+$/.test(portIfRange[i]) || portIfRange[i].includes('enet') || portIfRange[i].includes('ethernet') // ИЛИ если строка НЕ содержит только цифры
        ) {
          continue; // Пропускаем эту итерацию, если строка содержит исключенные подстроки или не содержит только цифры
        }

        const oidATUcSnrMarg = joid.adsl_oid.adslAtucCurrSnrMgn + portIfList[i];
        const oidATUcAttun = joid.adsl_oid.adslAtucCurrAtn + portIfList[i];
        const oidATUcPower = joid.adsl_oid.adslAtucCurrOutputPwr + portIfList[i];
        const oidATUcRate = joid.adsl_oid.adslAtucCurrAttainableRate + portIfList[i];
        const oidATUcCrRate = joid.adsl_oid.adslAtucChanCurrTxRate + portIfList[i];

        const oidATUrSnrMarg = joid.adsl_oid.adslAturCurrSnrMgn + portIfList[i];
        const oidATUrAttun = joid.adsl_oid.adslAturCurrAtn + portIfList[i];
        const oidATUrPower = joid.adsl_oid.adslAturCurrOutputPwr + portIfList[i];
        const oidATUrRate = joid.adsl_oid.adslAturCurrAttainableRate + portIfList[i];
        const oidATUrCrRate = joid.adsl_oid.adslAturChanCurrTxRate + portIfList[i];

        const getATUcSnrMarg = await snmpFunctions.getSingleOID(host, oidATUcSnrMarg, community);
        const getATUcAttun = await snmpFunctions.getSingleOID(host, oidATUcAttun, community);
        const getATUcPower = await snmpFunctions.getSingleOID(host, oidATUcPower, community);
        const getATUcRate = await snmpFunctions.getSingleOID(host, oidATUcRate, community);
        const getATUcCrRate = await snmpFunctions.getSingleOID(host, oidATUcCrRate, community);

        const getATUrSnrMarg = await snmpFunctions.getSingleOID(host, oidATUrSnrMarg, community);
        const getATUrAttun = await snmpFunctions.getSingleOID(host, oidATUrAttun, community);
        const getATUrPower = await snmpFunctions.getSingleOID(host, oidATUrPower, community);
        const getATUrRate = await snmpFunctions.getSingleOID(host, oidATUrRate, community);
        const getATUrCrRate = await snmpFunctions.getSingleOID(host, oidATUrCrRate, community);

        const portOperStatus = await devicData.getOidValue(
          joid.basic_oids.oid_oper_ports + portIfList[i], host, community
        );
        const portAdminStatus = await devicData.getOidValue(
          joid.basic_oids.oid_admin_ports + portIfList[i], host, community
        );

        let SnrMargRX = !unstandart
          ? parseFloat(parseFloat(getATUcSnrMarg).toFixed(2))
          : parseFloat((parseFloat(getATUcSnrMarg) / 10).toFixed(2));
        let SnrMargTX = !unstandart
          ? parseFloat(parseFloat(getATUrSnrMarg).toFixed(2))
          : parseFloat((parseFloat(getATUrSnrMarg) / 10).toFixed(2));
        let AttRX = !unstandart
          ? parseFloat(parseFloat(getATUcAttun).toFixed(2))
          : parseFloat((parseFloat(getATUcAttun) / 10).toFixed(2));
        let AttTX = !unstandart
          ? parseFloat(parseFloat(getATUrAttun).toFixed(2))
          : parseFloat((parseFloat(getATUrAttun) / 10).toFixed(2));
        let PowerLevelRX = !unstandart
          ? parseFloat(parseFloat(getATUcPower).toFixed(2))
          : parseFloat((parseFloat(getATUcPower) / 10).toFixed(2));
        let PowerLevelTX = !unstandart
          ? parseFloat(parseFloat(getATUrPower).toFixed(2))
          : parseFloat((parseFloat(getATUrPower) / 10).toFixed(2));

        if (powerConverter) {
          SnrMargRX = powerConverter(SnrMargRX);
          SnrMargTX = powerConverter(SnrMargTX);
          AttRX = powerConverter(AttRX);
          AttTX = powerConverter(AttTX);
          PowerLevelRX = powerConverter(PowerLevelRX);
          PowerLevelTX = powerConverter(PowerLevelTX);
        }



        let fixIntName = portIfRange[i];
        if (portIfRange[i].includes("Huawei")) {
          fixIntName = await devicData.getOidValue(joid.linux_server.oid_ifName + '.' + portIfList[i], host, community);
        }
        let snr = `${SnrMargRX}/${SnrMargTX}`
        let att = `${AttRX}/${AttTX}`
        let pwr = `${PowerLevelRX}/${PowerLevelTX}`
        let maxRate = `${getATUcRate / 1000}/${getATUrRate / 1000}`
        let curRate = `${getATUcCrRate / 1000}/${getATUrCrRate / 1000}`

        switch (portOperStatus) {
          case 1:
            snr = snr
            att = att
            pwr = pwr
            maxRate = maxRate
            curRate = curRate
            break;
          case 2:
            snr = "-/-"
            att = "-/-"
            pwr = "-/-"
            maxRate = "-/-"
            curRate = "-/-"
            break;
          default:
            snr = "-/-"
            att = "-/-"
            pwr = "-/-"
            maxRate = "-/-"
            curRate = "-/-"

            break;
        }
        if (portAdminStatus == "2") {
          snr = "-/-"
          att = "-/-"
          pwr = "-/-"
          maxRate = "-/-"
          curRate = "-/-"

        }

        results.push([
          fixIntName,
          snr,
          att,
          pwr,
          curRate,
          maxRate
        ]);



      }
      message += `"status":"done"}`;
      logger.info(message);
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },

  processCableLengthInfoEltex: async (
    host: string,
    portIfList: string[],
    portIfRange: string[],
    community: string,
    vctOID: string,
    vctOIDRes: string,
    results: any[],
    write: boolean = true,
  ) => {
    const action = devicData.processCableLengthInfo.name;
    let message = `{"date":"${currentDate}", "action":"${action}", `;
    message += util.format('"%s":"%s", ', "host", host);
    const list = portIfList;
    const range = portIfRange;
    try {
      for (let ifId in zip(list, range)) {
        if (
          config.excludedSubstrings.some((substring: any) => range[ifId].includes(substring)) || /^\d+$/.test(range[ifId])  // ИЛИ если строка НЕ содержит только цифры
        ) {
          continue; // Пропускаем эту итерацию, если строка содержит исключенные подстроки или не содержит только цифры
        }
        const portOperStatus = await devicData.getOidValue(
          joid.basic_oids.oid_oper_ports + list[ifId], host, community
        );
        const portAdminStatus = await devicData.getOidValue(
          joid.basic_oids.oid_admin_ports + list[ifId], host, community
        );
        if (
          portOperStatus == "2" ||
          (portOperStatus == "2" && portAdminStatus == "2")
        ) {
          let vtc_res = [];
          let vtc_r;
          if (write) {
            const set = snmpFunctions.setSnmpOID(
              host,
              vctOID + list[ifId],
              1
            ).then((res) => {
              return res;
            });
            if (await set) {
              const length = await snmpFunctions.getSingleOID(
                host,
                vctOIDRes + list[ifId],
                community
              );
              vtc_r = helperFunctions.parseReport(length);
              if (vtc_r.length == 0) {
                continue;
              }
              if (length) {
                for (let i = 0; i < Math.min(5, vtc_r.length); i++) {

                  // for (let i = 0; i < vtc_r.length; i++) {
                  vtc_res.push([vtc_r[i].cableLength,
                  vtc_r[i].cableStatus]
                  );
                }
              }
            }
          }

          let fixIntName = range[ifId];
          if (range[ifId].includes("Huawei")) {
            fixIntName = await devicData.getOidValue(joid.linux_server.oid_ifName + '.' + list[ifId], host, community);
          }

          let operStatus;
          switch (portOperStatus) {
            case 1:
              operStatus = symbols.OK_UP
              break;
            case 2:
              operStatus = symbols.OKEY;
              break;
            default:
              operStatus = symbols.UNKNOWN;
              break;
          }
          if (portAdminStatus == "2") {
            operStatus = util.format("%s", symbols.AdminDownEmo);
          }

          results.push([
            fixIntName, operStatus, vtc_res[1], vtc_res[2], vtc_res[3], vtc_res[4]]
          );
        }
      }
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },

  processCableLengthInfo: async (
    host: string,
    portIfList: string[],
    portIfRange: string[],
    community: string,
    vctOID: string,
    vctOIDRes: string,
    results: any[],
    write: boolean = true,
  ) => {
    const action = devicData.processCableLengthInfo.name;
    let message = `{"date":"${currentDate}", "action":"${action}", `;
    message += util.format('"%s":"%s", ', "host", host);
    try {
      const zipArray = zip(portIfList, portIfRange);
      for (const [ifId] of zipArray.entries()) {
        if (
          config.excludedSubstrings.some((substring: any) => portIfRange[ifId].includes(substring)) || /^\d+$/.test(portIfRange[ifId])  // ИЛИ если строка НЕ содержит только цифры
        ) {
          continue;
        }

        const portOperStatus = await devicData.getOidValue(joid.basic_oids.oid_oper_ports + portIfList[ifId], host, community);
        const portAdminStatus = await devicData.getOidValue(joid.basic_oids.oid_admin_ports + portIfList[ifId], host, community);
        if (
          portOperStatus == "2" ||
          (portOperStatus == "2" && portAdminStatus == "2")
        ) {

          const vtc_res = [];
          if (write) {
            if (await snmpFunctions.setSnmpOID(host, vctOID + portIfList[ifId], 1)) {
              let length = await snmpFunctions.getSingleOID(
                host,
                vctOIDRes + portIfList[ifId],
                community
              );
              if (
                length.length == 0) {
                continue;
              }
              if (length) {
                let parsedReport = helperFunctions.parseReport(length);
                vtc_res.push(...parsedReport.slice(0, 4)); // Добавление первых 4 элементов напрямую
              }
            }
          }

          let fixIntName = portIfRange[ifId];
          if (portIfRange[ifId].includes("Huawei")) {
            fixIntName = await devicData.getOidValue(joid.linux_server.oid_ifName + '.' + portIfList[ifId], host, community);
          }

          let operStatus;
          switch (portOperStatus) {
            case 1:
              operStatus = symbols.OK_UP
              break;
            case 2:
              operStatus = symbols.OKEY;
              break;
            default:
              operStatus = symbols.UNKNOWN;
              break;
          }
          if (portAdminStatus == "2") {
            operStatus = util.format("%s", symbols.AdminDownEmo);
          }

          results.push([
            fixIntName,
            operStatus,
            ...(vtc_res.length >= 1 ? [util.format(`%s %s`, helperFunctions.cablePairStatusIconizer(vtc_res[0].cableStatus), vtc_res[0].cableLength)] : ["NaN"]),
            ...(vtc_res.length >= 2 ? [util.format(`%s %s`, helperFunctions.cablePairStatusIconizer(vtc_res[1].cableStatus), vtc_res[1].cableLength)] : ["NaN"]),
            ...(vtc_res.length >= 3 ? [util.format(`%s %s`, helperFunctions.cablePairStatusIconizer(vtc_res[2].cableStatus), vtc_res[2].cableLength)] : ["NaN"]),
            ...(vtc_res.length >= 4 ? [util.format(`%s %s`, helperFunctions.cablePairStatusIconizer(vtc_res[3].cableStatus), vtc_res[3].cableLength)] : ["NaN"]),
          ]);
        }
      }

    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return JSON.stringify(error);
    }
    return results;
  },

  getDDMInfo: async (host: string, community: string): Promise<string> => {
    const action = devicData.getDDMInfo.name;
    let message = `{"date":"${currentDate}", "action":"${action}", `;
    message += util.format('"%s":"%s", ', "host", host);

    try {
      const results: any[] = [];
      const dirty = await snmpFunctions.getSingleOID(
        host,
        joid.basic_oids.oid_model,
        community
      );

      const model: any = deviceArr.FilterDeviceModel(dirty);
      const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);
      const aiflist = JSON.parse(JSON_aiflist);
      // const portIfList = aiflist.interfaceList;
      // const portIfRange = aiflist.interfaceRange;

      const intRange = await devicData.walkOidOnlyValue(joid.basic_oids.oid_port_name, host, community);
      const intList = await devicData.walkOidOnlyValue(joid.basic_oids.oid_ifIndex, host, community);

      const list = intList;
      const range = intRange;


      const ddm = aiflist.ddm;
      const adsl = aiflist.adsl;
      const fibers = aiflist.fibers;

      if (ddm && fibers === 0) {
        // results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована`);
        const error = {
          date: currentDate,
          action,
          error: "ddm not supported",
        };
        logger.error(JSON.stringify(error));
        return JSON.stringify(error);
      } else if (adsl) {

        await devicData.processADSLInfo(
          host,
          list,
          range,
          community,
          results,
          true,
        );
        return helperFunctions.tableFormattedOutput(results, ["IF", "SNR", "Attn", "Pwr", "Curr.Rate", "Max.Rate"])

      } else {
        const oidLoaderKey: keyof JoidType = model.includes("SNR")
          ? "snr_oids"
          : model.includes("Eltex")
            ? "eltex_oids"
            : model.includes("DGS") || model.includes("DES")
              ? "dlink_oids"
              : model.includes("SG200-26")
                ? "cisco_oids"
                : model.includes("IOS") ? "ios_oids" : "";

        if (oidLoaderKey === "") {
          const error = {
            date: currentDate,
            action,
            error: "ddm not supported",
          };
          logger.error(JSON.stringify(error));
          return JSON.stringify(error);
        }
        const oidLoader: OidLoaderType = (joid as JoidType)[oidLoaderKey];

        // const oidLoader: OidLoaderType = joid[oidLoaderKey];

        if (model.includes("SNR")) {
          await devicData.processDDMInfo(
            host,
            list,
            range,
            oidLoader["snr_oid_DDMRXPower"],
            oidLoader["snr_oid_DDMTXPower"],
            oidLoader["snr_oid_DDMTemperature"],
            oidLoader["snr_oid_DDMVoltage"],
            community,
            results
          );
        } else if (
          model.includes("Eltex MES14") ||
          model.includes("Eltex MES24") ||
          model.includes("Eltex MES3708")
        ) {
          await devicData.processDDMInfo(
            host,
            list,
            range,
            oidLoader["eltex_DDM_mes14_mes24_mes_3708"],
            oidLoader["eltex_DDM_mes14_mes24_mes_3708"],
            oidLoader["eltex_DDM_mes14_mes24_mes_3708"],
            oidLoader["eltex_DDM_mes14_mes24_mes_3708"],
            community,
            results,
            false,
            true,
            helperFunctions.mWtodBW
          );
        } else if (
          model.includes("Eltex MES23") ||
          model.includes("Eltex MES33") ||
          model.includes("Eltex MES35") ||
          model.includes("Eltex  MES53")
        ) {
          await devicData.processDDMInfo(
            host,
            list,
            range,
            oidLoader["eltex_DDM_mes23_mes33_mes35_mes53"],
            oidLoader["eltex_DDM_mes23_mes33_mes35_mes53"],
            oidLoader["eltex_DDM_mes23_mes33_mes35_mes53"],
            oidLoader["eltex_DDM_mes23_mes33_mes35_mes53"],
            community,
            results,
            true
          );
        } else if (
          model.includes("DGS-3620") ||
          model.includes("DES-3200") ||
          model.includes("DGS-3000")
        ) {
          await devicData.processDDMInfo(
            host,
            list,
            range,
            oidLoader["dlink_dgs36xx_ses32xx_dgs_30xx_ddm_rx_power"],
            oidLoader["dlink_dgs36xx_ses32xx_dgs_30xx_ddm_tx_power"],
            oidLoader["dlink_dgs36xx_ses32xx_dgs_30xx_ddm_temperatura"],
            oidLoader["dlink_dgs36xx_ses32xx_dgs_30xx_ddm_voltage"],
            community,
            results
          );
        } else if (model.includes("SG200-26")) {
          await devicData.processDDMInfo(
            host,
            list,
            range,
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            community,
            results,
            true
          );
        }
        return helperFunctions.tableFormattedOutput(results, ["IF", "Tx", "RX", "°C", "V"])
      }
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message,
      };
      logger.error(JSON.stringify(error));
      return JSON.stringify(error);
    }
  },

  getBasicInfo: async (
    host: string,
    community: any
  ): Promise<string | false> => {
    let action = devicData.getBasicInfo.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);

    try {
      const dirty = await snmpFunctions
        .getSingleOID(host, joid.basic_oids.oid_model, community)
        .then((res) => res)
        .catch((err) => err);

      const swSysName = await snmpFunctions
        .getSingleOID(host, joid.basic_oids.oid_sysname, community)
        .then((res) => res);

      const UpTime = await snmpFunctions
        .getSingleOID(host, joid.basic_oids.oid_uptime, community)
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
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },

  getPortStatus: async (host: string, community: string): Promise<string> => {
    let action = devicData.getPortStatus.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);

    try {
      const results: any[] = [];

      const modelValue = await devicData.getOidValue(joid.basic_oids.oid_model, host, community);
      const model = deviceArr.FilterDeviceModel(modelValue);
      const intRange = await devicData.walkOidOnlyValue(joid.basic_oids.oid_port_name, host, community);
      const intList = await devicData.walkOidOnlyValue(joid.basic_oids.oid_ifIndex, host, community);

      const list = intList;
      const range = intRange;
      await devicData.processPortStatus(host, list, range, community, results, model)
      return helperFunctions.tableFormattedOutput(results, ["St.", "IF", "Errors", "Descripion"])
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return JSON.stringify(error);
    }
  },

  getVlanList: async (host: string, community: string) => {
    let action = devicData.getVlanList.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);

    let results: any[] = [];

    try {
      await devicData.processVlan(host, community, results,)
      const message = {
        date: currentDate,
        action,
        status: "done",
      };

      logger.info(JSON.stringify(message));
      return helperFunctions.tableFormattedOutput(results, ["Vlan ID", "Vlan NAME"])
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return JSON.stringify(error);
    }
  },

  getCableLength: async (host: string, community: string) => {
    let action = devicData.getVlanList.name;

    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);

    try {
      const results: any[] = [];
      const modelValue = await snmpFunctions.getSingleOID(
        host,
        joid.basic_oids.oid_model,
        community
      );

      const intRange = await devicData.walkOidOnlyValue(joid.basic_oids.oid_port_name, host, community);
      const intList = await devicData.walkOidOnlyValue(joid.basic_oids.oid_ifIndex, host, community);
      const model = deviceArr.FilterDeviceModel(modelValue);

      const list = intList;
      const range = intRange;

      if (model && model.includes("SNR")) {

        await devicData.processCableLengthInfo(host,
          list,
          range,
          community,
          joid.snr_oids.snr_oid_vct,
          joid.snr_oids.snr_oid_vct_res, results, true)

        return helperFunctions.tableFormattedOutput(results, ["IF", "St.", "1,2", "3,6", "4,5", "7,8"])
      } else if (model && model.includes("MES2428")) {
        for (let ifId in zip(list, range)) {
          if (
            config.excludedSubstrings.some((substring: any) => range[ifId].includes(substring)) || /^\d+$/.test(range[ifId])  // ИЛИ если строка НЕ содержит только цифры
          ) {
            continue; // Пропускаем эту итерацию, если строка содержит исключенные подстроки или не содержит только цифры
          }
          const portOperStatus = await devicData.getOidValue(
            joid.basic_oids.oid_oper_ports + list[ifId], host, community
          );
          const portAdminStatus = await devicData.getOidValue(
            joid.basic_oids.oid_admin_ports + list[ifId], host, community
          );

          if (
            portOperStatus == "2" ||
            (portOperStatus == "2" && portAdminStatus == "2")
          ) { }
        }
      } else {
        const resultMessage = `Коммутатор не поддерживает кабельную диагностику`;
        return resultMessage;
      }
    } catch (e: any) {
      const error = {
        date: currentDate,
        action,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
      return JSON.stringify(error);
    }
  },
  getLLDPdata: async (oidRemSysName: string, oidRemSysModel: string, oidRemIfName: string, ipAddress: string, community: string) => {
    let action = devicData.getLLDPdata.name;

    try {
      const [resRemSysName, resRemSysModel, resRemSysIfName, resLocalSysName, resLocalModel] = await Promise.all([
        devicData.walkOidValue(oidRemSysName, ipAddress, community),
        devicData.walkOidValue(oidRemSysModel, ipAddress, community),
        devicData.walkOidValue(oidRemIfName, ipAddress, community),
        devicData.getOidValue(joid.basic_oids.oid_sysname, ipAddress, community),
        devicData.getOidValue(joid.basic_oids.oid_model, ipAddress, community),
      ]);

      const resLocalSysModel = deviceArr.FilterDeviceModel(resLocalModel);

      const parsedIfName = await Promise.all(resRemSysIfName.map(async (item: any) => {
        const regex = /(\d+)(?=,\d+$)/;
        const oidString = item.oid.join(',');
        const match = oidString.match(regex);
        const extractedNumber = match ? match[0] : null;
        const ifName = await devicData.getOidValue(joid.linux_server.oid_ifName + '.' + extractedNumber, ipAddress, community);
        return ifName;
      }));

      const connections = parsedIfName.map((localIfName: string, index: number) => ([
        localIfName,
        resRemSysIfName[index].value,
        resRemSysName[index].value,
        deviceArr.FilterDeviceModel(resRemSysModel[index].value)

      ]));

      const dataArray = [
        ipAddress,
        resLocalSysName,
        resLocalSysModel,
        connections,
      ];


      const message = {
        date: currentDate,
        action,
        status: "done",
      };

      logger.info(JSON.stringify(message));
      return helperFunctions.generateLLDPTable(dataArray);
      // return JSON.stringify(dataArray, null, "\t");
    } catch (e: any) {
      const errorMessage = util.format(
        "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
        symbols.SHORT
      );
      logger.error(e.message as string);
      return errorMessage;
    }
  },

  runNetmikoScript: (arg: any[]): Promise<any> => {
    const options: Options = {
      mode: "text",
      pythonOptions: ["-u"], // unbuffered output
      scriptPath: "./python", // путь к файлу netmiko_script.py
      args: arg
    };


    return new Promise((resolve) => {
      PythonShell.run('ps.py', options).then(messages => {
        // results is an array consisting of messages collected during execution
        resolve(messages);
      });
    });
  },

};

export default devicData;
