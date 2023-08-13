import { Session } from 'snmp-native';
import util from 'util';
import joid from '../../src/oid.json';
import helperFunctions from './helperFunctions';
import messagesFunctions from './messagesFunctions';
const snmpFunctions = {
    getSingleOID: async (host: string, oid: string, community: string): Promise<any> => {
        const currentDate = helperFunctions.getHumanDate(new Date());
        let action = "";
        let message = util.format('{"date":"%s", "action":"%s", ',currentDate,action='getSingleOID')
        const session = new Session({
            host: host,
            community: community
        });
         message += util.format('"%s":"%s", ',"host",host)
        return new Promise((resolve, reject) => {
            session.get({ oid: oid }, (error, varbinds) => {
                if (!error) {
                    resolve(varbinds[0].value);
                } else {
                    message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                    reject(false);
                }
            });
        });
    },
    checkSNMP: async (host: string, communities: any): Promise<any> => {
        return new Promise(async (resolve) => {
            const currentDate = helperFunctions.getHumanDate(new Date());
            let action = "";
            let message = util.format('{"date":"%s", "action":"%s", ',currentDate,action='checkSNMP')
            message += util.format('"%s":"%s", ',"host",host)
            // Recursive function to try different communities
            async function tryCommunities(index: any) {
                if (index >= communities.length) {
                    // Tried all communities, device not reachable
                    resolve('public');
                    return;
                }
                const oid = joid.basic_oids.oid_sysObjectID;
                const community = communities[index].toString();
                try {
                    const session = await snmpFunctions.getSingleOID(host, oid, community);

                    if (session) {
                        message += util.format('"%s":"%s"}',"status",true)
                        console.info(message);
                        resolve(community);
                    } else {
                        // Try the next community
                        tryCommunities(index + 1);
                    }
                } catch (error) {
                    // Handle the error here, if needed
                    message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                    
                    // Try the next community
                    tryCommunities(index + 1);
                }
            }
            try {
                await tryCommunities(0); // Start trying communities from index 0
            } catch (error) {
                messagesFunctions.msgSNMPError(host)
                message += util.format('"%s":"%s"}',"error",error)
                console.error(message);
                // Handle the error here, if needed
            }
        });
    },
    getMultiOID: (host: string, oid: string, community: string): Promise<any> => {
        const currentDate = helperFunctions.getHumanDate(new Date());
        let action = "";
        let message = util.format('{"date":"%s", "action":"%s", ',currentDate,action='getMultiOID')
        message += util.format('"%s":"%s", ',"host",host)
        const session = new Session({
            host: host,
            community: community
        });
        message += util.format('"%s":"%s", ',"host",host)

        const result: any = [];
        return new Promise((resolve, reject) => {
            session.getSubtree({
                oid: oid
            }, (error, varbinds) => {
                if (error) {
                    message += util.format('"%s":"%s"}',"error",error)
                    console.error(message);
                    reject(true)
                } else {
                    varbinds.forEach((vb) => {
                        result.push(vb.value)
                    });
                    resolve(result)
                }
            })
        })
    }
}
export default snmpFunctions