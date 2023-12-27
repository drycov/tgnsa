import { Options, PythonShell } from "python-shell";
import { zip } from "underscore";
import util from "util";
import * as path from "path";
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

import {
  BaseUserConfig,
  ColumnUserConfig,
  Indexable,
  getBorderCharacters,
  table,
} from "table";

import Table from "cli-table3";

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
          results.push([
            portIfRange[i],
            DDMLevelTX,
            DDMLevelTX,
            DDMTemperature,
            DDMVoltage,
          ]);
        }
      }
      message += `"status":"done"}`;
      logger.info(message);
      console.log(results)
    } catch (error) {
      message += `"error":"${error}"}`;
      logger.error(message);
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
    const getOidValue = async (oid: string) => {
      try {
        return await snmpFunctions.getSingleOID(host, oid, community);
      } catch (error) {
        logger.error(error);
        return error;
      }
    };
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

        const portOperStatus = await getOidValue(
          joid.basic_oids.oid_oper_ports + portIfList[i]
        );
        const portAdminStatus = await getOidValue(
          joid.basic_oids.oid_admin_ports + portIfList[i]
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
          fixIntName = await getOidValue(joid.linux_server.oid_ifName + '.' + portIfList[i]);
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
    } catch (error) {
      message += `"error":"${error}"}`;
      logger.error(message);
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },
  processCableLengthInfo1: async (
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
    const getOidValue = async (oid: string) => {
      try {
        return await snmpFunctions.getSingleOID(host, oid, community);
      } catch (error) {
        logger.error(error);
        return error;
      }
    };
    const list = portIfList;
    const range = portIfRange;
    try {
      for (let ifId in zip(list, range)) {
        if (
          config.excludedSubstrings.some((substring: any) => range[ifId].includes(substring)) || /^\d+$/.test(range[ifId])  // ИЛИ если строка НЕ содержит только цифры
        ) {
          continue; // Пропускаем эту итерацию, если строка содержит исключенные подстроки или не содержит только цифры
        }
        const portOperStatus = await getOidValue(
          joid.basic_oids.oid_oper_ports + list[ifId]
        );
        const portAdminStatus = await getOidValue(
          joid.basic_oids.oid_admin_ports + list[ifId]
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
            console.log(set)
            if (await set) {
              const length = await snmpFunctions.getSingleOID(
                host,
                vctOIDRes + list[ifId],
                community
              );
              console.log('test length', length);
              vtc_r = helperFunctions.parseReport(length);
              console.log(helperFunctions.parseCableLengthReport(length));
              console.log("parse_log", vtc_r)
              if (vtc_r.length == 0) {
                continue;
              }
              console.log(vtc_r.length)
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
            fixIntName = await getOidValue(joid.linux_server.oid_ifName + '.' + list[ifId]);
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
          console.log(results)
        }
      }
    } catch (error) {
      message += `"error":"${error}"}`;
      logger.error(message);
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

    const getOidValue = async (oid: string) => {
      try {
        return await snmpFunctions.getSingleOID(host, oid, community);
      } catch (error) {
        logger.error(error);
        return error;
      }
    };

    try {
      const zipArray = zip(portIfList, portIfRange);
      for (const [ifId] of zipArray.entries()) {
        if (
          config.excludedSubstrings.some((substring: any) => portIfRange[ifId].includes(substring)) || /^\d+$/.test(portIfRange[ifId])  // ИЛИ если строка НЕ содержит только цифры
        ) {
          continue;
        }

        const portOperStatus = await getOidValue(joid.basic_oids.oid_oper_ports + portIfList[ifId]);
        const portAdminStatus = await getOidValue(joid.basic_oids.oid_admin_ports + portIfList[ifId]);
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
            fixIntName = await getOidValue(joid.linux_server.oid_ifName + '.' + portIfList[ifId]);
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

    } catch (error) {
      message += `"error":"${error}"}`;
      logger.error(message);
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
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
      const portIfList = aiflist.interfaceList;
      const portIfRange = aiflist.interfaceRange;

      const walkOidValue = async (oid: string) => {
        try {
          return await snmpFunctions.getMultiOID(host, oid, community);
        } catch (error) {
          logger.error(error);
          return error;
        }
      };
      const intRange = await walkOidValue(joid.basic_oids.oid_port_name);
      const intList = await walkOidValue(joid.basic_oids.oid_ifIndex);

      const list = intList;
      const range = intRange;

      const ddm = aiflist.ddm;
      const adsl = aiflist.adsl;
      const fibers = aiflist.fibers;
      let table3 = new Table({
        head: ["IF", "🔺Tx", "🔻RX", "🌡C", "⚡️V"],
        chars: {
          'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
          , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
          , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
          , 'right': '', 'right-mid': '', 'middle': ' '
        },
        style: { 'padding-left': 0, 'padding-right': 0 }
      });

      const columnConfig: Indexable<ColumnUserConfig> = [
        { width: 8, alignment: "center" }, // IF
        { width: 6, alignment: "center" }, // 🔺Tx
        { width: 6, alignment: "center" }, // 🔻RX
        { width: 5, alignment: "center" }, // 🌡C
        { width: 4, alignment: "center" }, // ⚡️V
      ];

      const config: BaseUserConfig = {
        columns: columnConfig,
        columnDefault: {
          paddingLeft: 0,
          paddingRight: 0,
          // width: 6,
        },
        border: getBorderCharacters(`ramac`),
      };

      if (ddm && fibers === 0) {
        // results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована`);
        message += `"error":"ddm not supported"}`;
        logger.error(message);
        return `${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n`;
      } else if (adsl) {
        const list = intList;
        const range = intRange;
        let tableAdsl = new Table({
          head: ["IF", "SNR", "Attn", "Pwr", "Curr.Rate","Max.Rate"],
          chars: {
            'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
            , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
            , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
            , 'right': '', 'right-mid': '', 'middle': ' '
          },
          style: { 'padding-left': 0, 'padding-right': 0 }
        });

        const oidLoader: OidLoaderType = (joid as JoidType)["adsl_oid"];

        await devicData.processADSLInfo(
          host,
          list,
          range,
          community,
          results,
          true,
        );
        const headers: string[] = results.shift(); // Уточнение типа для заголовков

        const convertedData = results.map((row: (string | number)[]) => {
          const obj: { [key: string]: string | number } = {}; // Уточнение типа для объекта
          headers.forEach((header: string, index: number) => { // Использование явных типов для header и index
            obj[header] = row[index];
          });
          return obj;
        });


        convertedData.forEach(obj => {
          const row = headers.map(header => obj[header]);
          tableAdsl.push(row);
        });
        return tableAdsl.toString().replace(/\x1B\[[0-9;]*m/g, '');
      } else {
        // const noDDMport = portIfList.length - fibers;
        // const DDMport = portIfList.length;

        const oidLoaderKey: keyof JoidType = model.includes("SNR")
          ? "snr_oids"
          : model.includes("Eltex")
            ? "eltex_oids"
            : model.includes("DGS") || model.includes("DES")
              ? "dlink_oids"
              : model.includes("SG200-26")
                ? "cisco_oids"
                : "";

        if (oidLoaderKey === "") {
          // results.push(`${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n\n`);
          message += `"error":"ddm not supported"}`;
          logger.error(message);
          return `${symbols.WarnEmo} Функция DDM не поддерживается или не реализована\n`;
        }
        const oidLoader: OidLoaderType = (joid as JoidType)[oidLoaderKey];

        // const oidLoader: OidLoaderType = joid[oidLoaderKey];

        if (model.includes("SNR")) {
          await devicData.processDDMInfo(
            host,
            portIfList,
            portIfRange,
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
            portIfList,
            portIfRange,
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
            portIfList,
            portIfRange,
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
            portIfList,
            portIfRange,
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
            portIfList,
            portIfRange,
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            oidLoader["cisco_DDM_S200"],
            community,
            results
          );
        }
        const headers: string[] = results.shift(); // Уточнение типа для заголовков

        const convertedData = results.map((row: (string | number)[]) => {
          const obj: { [key: string]: string | number } = {}; // Уточнение типа для объекта
          headers.forEach((header: string, index: number) => { // Использование явных типов для header и index
            obj[header] = row[index];
          });
          return obj;
        });


        convertedData.forEach(obj => {
          const row = headers.map(header => obj[header]);
          table3.push(row);
        });
        return table3.toString().replace(/\x1B\[[0-9;]*m/g, '');
        // const tab = table(results, config);
        // return tab;
      }
    } catch (error) {
      message += `"error":"${error}"}`;
      logger.error(message);
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
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

    const result = util.format(
      "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
      symbols.SHORT
    );

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
    } catch (error) {
      message += util.format('"%s":"%s"}', "error", error);
      logger.error(message);
      return result;
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
      const results = [];
      const getOidValue = async (oid: string) => {
        try {
          return await snmpFunctions.getSingleOID(host, oid, community);
        } catch (error) {
          logger.error(error);
          return error;
        }
      };

      const walkOidValue = async (oid: string) => {
        try {
          return await snmpFunctions.getMultiOID(host, oid, community);
        } catch (error) {
          logger.error(error);
          return error;
        }
      };
      const modelValue = await getOidValue(joid.basic_oids.oid_model);
      const model = deviceArr.FilterDeviceModel(modelValue);

      const JSON_aiflist = await deviceArr.ArrayInterfaceModel(model);
      let descrOid = model?.includes("IES-612") || model?.includes("IES1248-51") || model?.includes("SAM1008") ? joid.AAM1212_oid.subrPortName : joid.basic_oids.oid_descr_ports;
      const aiflist = JSON.parse(JSON_aiflist);

      const { interfaceList: portIfList, interfaceRange: portIfRange } =
        aiflist;

      const intRange = await walkOidValue(joid.basic_oids.oid_port_name);
      const intList = await walkOidValue(joid.basic_oids.oid_ifIndex);

      const list = intList;
      const range = intRange;

      for (let ifId in zip(list, range)) {
        if (
          config.excludedSubstrings.some((substring: any) => range[ifId].includes(substring)) || /^\d+$/.test(range[ifId])  // ИЛИ если строка НЕ содержит только цифры
        ) {
          continue; // Пропускаем эту итерацию, если строка содержит исключенные подстроки или не содержит только цифры
        }
        const intDescr = await getOidValue(
          descrOid + list[ifId]
        );
        const portOperStatus = await getOidValue(
          joid.basic_oids.oid_oper_ports + list[ifId]
        );
        const portAdminStatus = await getOidValue(
          joid.basic_oids.oid_admin_ports + list[ifId]
        );
        const get_inerrors = await getOidValue(
          joid.basic_oids.oid_inerrors + list[ifId]
        );

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
        let fixIntName = range[ifId];
        if (range[ifId].includes("Huawei")) {
          fixIntName = await getOidValue(joid.linux_server.oid_ifName + '.' + list[ifId]);
        }
        if (intDescr == "noSuchInstance" || intDescr == "noSuchObject") {
          fixIntDescr = "";
        }

        if (parseInt(get_inerrors) == 0) {
          results.push(
            util.format(
              "<code>%s</code> %s | %s",
              fixIntName,
              // range[ifId],
              operStatus,
              fixIntDescr
            )
          );
        } else if (parseInt(get_inerrors) > 0) {
          results.push(
            util.format(
              "<code>%s</code> %s | %s | <i>Ошибки: %s</i> | %s |",
              fixIntName,
              // range[ifId],
              operStatus,
              fixIntDescr,
              get_inerrors,
              symbols.WarnEmo
            )
          );
        }
      }

      const stateInfo = `P.S. Состояния: ${symbols.OK_UP} - Линк есть, ${symbols.OKEY} - Линка нет, ${symbols.AdminDownEmo} - Порт выключен, ${symbols.UNKNOWN} - Неизвестно`;
      const resultMessage = `${results.join("\n")}\n\n${stateInfo}\n`;
      return resultMessage;
    } catch (e) {
      message += util.format('"%s":"%s"}', "error", e);
      logger.error(e);
      return util.format(
        "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
        symbols.SHORT
      );
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

    let res: any[] = [];

    try {
      // res.push(['VlanName', 'VlanId'],)

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
        res.push(`VlanId: ${vlanId[l]} VlanName: ${vlanName[l]} `);
        // res.push([vlanName[l], vlanId[l]])
      }
      return res.join("\n");
    } catch (e) {
      message += util.format('"%s":"%s"}', "error", e);
      logger.error(message);
      return `${symbols.SHORT} Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее`;
    }
  },
  getCableLength: async (host: string, community: string) => {
    try {
      const results: any[] = [];
      const modelValue = await snmpFunctions.getSingleOID(
        host,
        joid.basic_oids.oid_model,
        community
      );
      const walkOidValue = async (oid: string) => {
        try {
          return await snmpFunctions.getMultiOID(host, oid, community);
        } catch (error) {
          logger.error(error);
          return error;
        }
      };
      const getOidValue = async (oid: string) => {
        try {
          return await snmpFunctions.getSingleOID(host, oid, community);
        } catch (error) {
          logger.error(error);
          return error;
        }
      };
      const intRange = await walkOidValue(joid.basic_oids.oid_port_name);
      const intList = await walkOidValue(joid.basic_oids.oid_ifIndex);
      const model = deviceArr.FilterDeviceModel(modelValue);

      const list = intList;
      const range = intRange;
      let table3 = new Table({
        head: ["IF", "Sta", "1,2", "3,6", "4,5", "7,8"],
        chars: {
          'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
          , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
          , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
          , 'right': '', 'right-mid': '', 'middle': ' '
        },
        style: { 'padding-left': 0, 'padding-right': 0 }
      });
      if (model && model.includes("SNR")) {

        await devicData.processCableLengthInfo(host,
          list,
          range,
          community,
          joid.snr_oids.snr_oid_vct,
          joid.snr_oids.snr_oid_vct_res, results, true)

        const headers: string[] = results.shift(); // Уточнение типа для заголовков

        const convertedData = results.map((row: (string | number)[]) => {
          const obj: { [key: string]: string | number } = {}; // Уточнение типа для объекта
          headers.forEach((header: string, index: number) => { // Использование явных типов для header и index
            obj[header] = row[index];
          });
          return obj;
        });


        convertedData.forEach(obj => {
          const row = headers.map(header => obj[header]);
          table3.push(row);
        });
        return table3.toString().replace(/\x1B\[[0-9;]*m/g, '');
      } else if (model && model.includes("MES2428")) {
        for (let ifId in zip(list, range)) {
          if (
            config.excludedSubstrings.some((substring: any) => range[ifId].includes(substring)) || /^\d+$/.test(range[ifId])  // ИЛИ если строка НЕ содержит только цифры
          ) {
            continue; // Пропускаем эту итерацию, если строка содержит исключенные подстроки или не содержит только цифры
          }
          const portOperStatus = await getOidValue(
            joid.basic_oids.oid_oper_ports + list[ifId]
          );
          const portAdminStatus = await getOidValue(
            joid.basic_oids.oid_admin_ports + list[ifId]
          );

          if (
            portOperStatus == "2" ||
            (portOperStatus == "2" && portAdminStatus == "2")
          ) { }
        }
      }

      else {
        const resultMessage = `Коммутатор не поддерживает кабельную диагностику`;
        return resultMessage;
      }
    } catch (error) {
      const errorMessage = util.format(
        "%s Устройство не на связи или при выполнении задачи произошла ошибка! Попробуйте позднее",
        symbols.SHORT
      );
      logger.error(error);
      return errorMessage;
    }
  },

  runNetmikoScript: (): Promise<string> => {
    const options: Options = {
      mode: "json",
      pythonOptions: ["-u"], // unbuffered output
      scriptPath: "/", // путь к файлу netmiko_script.py
    };

    return new Promise(() => {
      PythonShell.runString("ps.py", options).then((messages) => {
        logger.info(messages);
      });
    });
  },
};

export default devicData;
