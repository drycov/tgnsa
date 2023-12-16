import { Session } from "snmp-native";
import util from "util";
import joid from "../../src/oid.json";
import logger from "./logger";
import messagesFunctions from "./messagesFunctions";
import * as path from "path";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
const config = require(configPath);

const currentDate = new Date().toLocaleString("ru-RU");
const snmpFunctions = {
  getSingleOID: async (
    host: string,
    oid: any,
    community: string
  ): Promise<any> => {
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
    return new Promise((resolve, reject) => {
      session.get({ oid: oid }, (error, varbinds) => {
        if (!error) {
          resolve(varbinds[0].value);
        } else {
          message += util.format('"%s":"%s"}', "error", error);
          logger.error(message);
          reject(false);
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
          message += util.format('"%s":"%s"}', "error", error);
          logger.error(message);
        }
      });
    } catch (error) {
      message += util.format('"%s":"%s"}', "error", error);
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
        } catch (error) {
          // Handle the error here, if needed
          message += util.format('"%s":"%s"}', "error", error);
          logger.error(message);

          // Try the next community
          tryCommunities(index + 1);
        }
      }
      try {
        await tryCommunities(0); // Start trying communities from index 0
      } catch (error) {
        messagesFunctions.msgSNMPError(host);
        message += util.format('"%s":"%s"}', "error", error);
        logger.error(message);
        // Handle the error here, if needed
      }
    });
  },
  getMultiOID: (host: string, oid: string, community: string): Promise<any> => {
    let action = snmpFunctions.getMultiOID.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    message += util.format('"%s":"%s", ', "host", host);
    const session = new Session({
      host: host,
      community: community,
    });
    message += util.format('"%s":"%s", ', "host", host);

    const result: any = [];
    return new Promise((resolve, reject) => {
      session.getSubtree(
        {
          oid: oid,
        },
        (error, varbinds) => {
          if (error) {
            message += util.format('"%s":"%s"}', "error", error);
            logger.error(message);
            reject(true);
          } else {
            varbinds.forEach((vb) => {
              result.push(vb.value);
            });
            resolve(result);
          }
        }
      );
    });
  },
  setSnmpOID: (
    host: string,
    // community: string,
    oid: string,
    value: string | number
  ): boolean => {
    let action = snmpFunctions.setSnmpOID.name;
    let message = util.format(
      '{"date":"%s", "action":"%s", ',
      currentDate,
      action
    );
    const community = config.snmp.rw_community[0];
    const session = new Session({
      host: host,
      community: community,
    });
    message += util.format('"%s":"%s", ', "host", host);
    try {
      session.set({ oid, type: 2, value });
      console.log("SNMP SET successful");

      return true;
    } catch (error) {
      console.error("SNMP SET error:", error);
      return false;
    } finally {
      session.close();
    }
  },
};
export default snmpFunctions;
