import { Session } from "snmp-native";
import util from "util";
import joid from "../../src/oid.json";
import logger from "./logger";
import messagesFunctions from "./messagesFunctions";
import * as path from "path";
import { zip } from "underscore";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
const config = require(configPath);

const currentDate = new Date().toLocaleString("ru-RU");
const snmpFunctions = {
  getSingleOID: async (
    host: string,
    oid: any,
    community: string
  ): Promise<any> => {
    const message = util.format('{"date":"%s", "action":"%s", ', currentDate, snmpFunctions.getSingleOID.name);
    const session = new Session({
      host: host,
      community: community,
    });
    const messageWithHost = message + util.format('"%s":"%s", ', "host", host);

    return new Promise((resolve, reject) => {
      session.get({ oid: oid }, (error, results) => {
        if (!error) {
          const value = results[0].value;
          session.close(); // Закрыть сессию после успешного выполнения
          resolve(value);
        } else {
          const errorMessage = messageWithHost + util.format('"%s":"%s"}', "error", error.message);
          logger.error(errorMessage);
          session.close(); // Закрыть сессию в случае ошибки
          resolve(false);

          reject(error);
        }
      });
    });
  },


  getSyncSingleOID: (host: string, oid: any, community: string): any => {
    let action = snmpFunctions.getSingleOID.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    const session = new Session({
      host: host,
      community: community,
    });
    message += util.format('"%s":"%s", ', "host", host);
    try {
      session.get({ oid: oid }, (error, varbinds) => {
        if (!error) {
          return varbinds[0].value;
        } else {
          message += util.format('"%s":"%s"}', "error", error.message);
          logger.error(message);
        }
      });
    } catch (error:any) {
      message += util.format('"%s":"%s"}', "error", error.message);
      logger.error(message);
    }
  },
  checkSNMP: async (host: string, communities: any): Promise<any> => {
    return new Promise(async (resolve) => {
      let action = snmpFunctions.checkSNMP.name;
      let message = util.format(
        '{"date":"%s", "action":"%s", ',
        currentDate,
        action
      );
      message += util.format('"%s":"%s", ', "host", host);
      // Recursive function to try different communities
      async function tryCommunities(index: any) {
        if (index >= communities.length) {
          // Tried all communities, device not reachable
          resolve("public");
          return;
        }
        const oid = joid.basic_oids.oid_sysObjectID;
        const community = communities[index].toString();
        try {
          const session = await snmpFunctions.getSingleOID(
            host,
            oid,
            community
          );

          if (session) {
            message += util.format('"%s":"%s"}', "status", true);
            logger.info(message);
            resolve(community);
          } else {
            // Try the next community
            tryCommunities(index + 1);
          }
        } catch (error:any) {
          // Handle the error here, if needed
          message += util.format('"%s":"%s"}', "error", error.message);
          logger.error(message);

          // Try the next community
          tryCommunities(index + 1);
        }
      }
      try {
        await tryCommunities(0); // Start trying communities from index 0
      } catch (error:any) {
        messagesFunctions.msgSNMPError(host);
        message += util.format('"%s":"%s"}', "error", error.message);
        logger.error(message);
        // Handle the error here, if needed
      }
    });
  },
  getMultiOID: (host: string, oid: string, community: string): Promise<any> => {
    const action = snmpFunctions.getMultiOID.name;
    let message = util.format('{"date":"%s", "action":"%s", ', currentDate, action);
    message += util.format('"%s":"%s", ', "host", host);

    const session = new Session({
      host: host,
      community: community,
    });

    return new Promise((resolve, reject) => {
      session.getSubtree({ oid: oid }, (error, varbinds) => {
        if (error) {
          message += util.format('"%s":"%s"}', "error", error);
          logger.error(message);
          session.close(); // Закрыть сессию в случае 
          resolve(false);
          reject(error);
        } else {
          const result = varbinds.map((vb) => vb.value);
          session.close(); // Закрыть сессию после успешного выполнения
          resolve(result);
        }
      });
    });
  },
  getMultiOIDValue: (host: string, oid: string, community: string): Promise<any> => {
    const action = snmpFunctions.getMultiOID.name;
    let message = util.format('{"date":"%s", "action":"%s", ', currentDate, action);
    message += util.format('"%s":"%s", ', "host", host);

    const session = new Session({
      host: host,
      community: community,
    });
    return new Promise((resolve, reject) => {
      let results: any[] = [];
      session.getSubtree({ oid: oid }, (error, varbinds) => {
        if (error) {
          message += util.format('"%s":"%s"}', "error", error.message);
          logger.error(message);
          session.close(); // Закрыть сессию в случае 
          resolve(false);
          reject(error);
        } else {
          varbinds.forEach((vb) => {
            results.push({ oid: vb.oid, value: vb.value });
          });
          
          session.close();
          resolve(results);
        }
      });
    });
  },

  setSnmpOID: async (
    host: string,
    // community: string,
    oid: string,
    value: string | number
  ): Promise<any> => {
    let action = snmpFunctions.setSnmpOID.name;
    let message = util.format('{"date":"%s", "action":"%s", ', currentDate, action);
    const community = config.snmp.rw_community[0];
    const session = new Session({
      host: host,
      community: community,
    });
    message += util.format('"%s":"%s", ', "host", host);
  
    return new Promise((resolve, reject) => {
      session.set({ oid, type: 2, value }, (error, varbinds) => {
        if (!error) {
          const result = varbinds[0].value;
          resolve(result);
        } else {
          message += util.format('"%s":"%s"}', "error", error.message);
          logger.error(message);
          session.close(); // Закрыть сессию в случае ошибки
          reject(error);
          return; // Прервать выполнение функции после reject
        }
      });
    })
    .finally(() => {
      session.close(); // Закрыть сессию после завершения
    });
  },
  
};
export default snmpFunctions;
