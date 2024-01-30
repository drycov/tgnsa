import * as path from "path";
import { Session } from "snmp-native";
import util from "util";
import joid from "../../src/oid.json";
import helperFunctions from "./helperFunctions";
import logger from "./logger";
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
      timeouts: [5000]

    });
    const messageWithHost = message + util.format('"%s":"%s", ', "host", host);
    let action = snmpFunctions.getSingleOID.name;

    return new Promise((resolve, reject) => {
      session.get({ oid: oid }, (e, results) => {
        if (!e) {
          const value = results[0].value;
          session.close(); // Закрыть сессию после успешного выполнения
          resolve(value);
        } else {
          session.close(); // Закрыть сессию в случае ошибки
          const error = {
            date: helperFunctions.currentDate,
            action: action,
            host: host,
            oid: oid,
            error: e.message as string,
          };
          logger.error(JSON.stringify(error));
          resolve(false);

          reject(e);

        }
      });
    });
  },


  getSyncSingleOID: (host: string, oid: any, community: string): any => {
    let action = snmpFunctions.getSyncSingleOID.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    const session = new Session({
      host: host,
      community: community,
      timeouts: [5000]
    });
    message += util.format('"%s":"%s", ', "host", host);
    try {
      session.get({ oid: oid }, (e, varbinds) => {
        if (!e) {
          return varbinds[0].value;
        } else {
          const error = {
            date: helperFunctions.currentDate,
            action: action,
            host: host,
            oid: oid,
            error: e.message as string,
          };
          logger.error(JSON.stringify(error));
        }
      });
    } catch (e: any) {
      const error = {
        date: helperFunctions.currentDate,
        host: host,
        error: e.message as string,
      };
      logger.error(JSON.stringify(error));
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
            community,
          );

          if (session) {
            resolve(community);
          } else {
            // Try the next community
            tryCommunities(index + 1);
          }
        } catch (e: any) {
          const error = {
            date: helperFunctions.currentDate,
            // action,
            error: e.message as string,
          };
          logger.error(JSON.stringify(error));
          // Handle the error here, if needed
          // Try the next community
          tryCommunities(index + 1);
        }
      }
      try {
        await tryCommunities(0); // Start trying communities from index 0
      } catch (e: any) {
        const error = {
          date: helperFunctions.currentDate,
          // action,
          error: e.message as string,
        };
        logger.error(JSON.stringify(error));
        // Handle the error here, if needed
      }
    });
  },
  getMultiOID: (host: string, oid: string, community: string): Promise<any> => {
    // let message = util.format('{"date":"%s", "action":"%s", ', currentDate, action);
    // message += util.format('"%s":"%s", ', "host", host);

    const session = new Session({
      host: host,
      community: community,
      timeouts: [5000]
    });

    return new Promise((resolve, reject) => {
      const action = snmpFunctions.getMultiOID.name;
      session.getSubtree({ oid: oid }, (e, varbinds) => {
        if (e) {
          session.close(); // Закрыть сессию в случае 
          const error = {
            date: helperFunctions.currentDate,
            action,
            oid: oid,
            error: e.message as string,
          };
          logger.error(JSON.stringify(error));
          console.log(e)
          resolve(false);
          reject(e);
        } else {
          const result = varbinds.map((vb) => vb.value);
          session.close(); // Закрыть сессию после успешного выполнения
          resolve(result);
        }
      });
    });
  },
  getMultiOIDValue: (host: string, oid: string, community: string): Promise<any> => {
    // let message = util.format('{"date":"%s", "action":"%s", ', currentDate, action);
    // message += util.format('"%s":"%s", ', "host", host);

    const session = new Session({
      host: host,
      community: community,
      timeouts: [5000]

    });
    return new Promise((resolve, reject) => {
      const action = snmpFunctions.getMultiOID.name;

      let results: any[] = [];
      session.getSubtree({ oid: oid }, (e, varbinds) => {
        if (e) {
          session.close(); // Закрыть сессию в случае 
          const error = {
            date: helperFunctions.currentDate,
            action,
            oid: oid,
            error: e.message as string,
          };
          logger.error(JSON.stringify(error));
          resolve(false);
          reject(e);
        } else {
          varbinds.forEach((vb) => {
            results.push({ oid: vb.oid, value: vb.value });
          });
          const message = {
            date: currentDate,
            action,
            host: host,
            status: "done",
          };
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
    const community = config.snmp.rw_community[0];
    const session = new Session({
      host: host,
      community: community,
      timeouts: [5000]

    });

    return new Promise((resolve, reject) => {
      let action = snmpFunctions.setSnmpOID.name;

      session.set({ oid, type: 2, value }, (e, varbinds) => {
        if (!e) {
          const result = varbinds[0].value;
          resolve(result);
        } else {
          session.close(); // Закрыть сессию в случае ошибки
          const error = {
            date: helperFunctions.currentDate,
            action,
            oid: oid,
            error: e.message as string,
          };
          logger.error(JSON.stringify(error));
          reject(e);
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
