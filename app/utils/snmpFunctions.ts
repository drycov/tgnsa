import { Session } from 'snmp-native';
import joid from '../../src/oid.json'
import messagesFunctions from './messagesFunctions';
const snmpFunctions = {
    getSingleOID: async (host: string, oid: string, community: string): Promise<any> => {
        const session = new Session({
            host: host,
            community: community
        });

        return new Promise((resolve, reject) => {
            session.get({ oid: oid }, (error, varbinds) => {
                if (!error) {
                    resolve(varbinds[0].value);
                } else {
                    reject(false);
                }
            });
        });
    },
    checkSNMP: async (host: string, communities: any): Promise<any> => {
        return new Promise(async (resolve) => {
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
                        resolve(community);
                    } else {
                        // Try the next community
                        tryCommunities(index + 1);
                    }
                } catch (error) {
                    // Handle the error here, if needed
                    console.error('Error:', error);
                    // Try the next community
                    tryCommunities(index + 1);
                }
            }

            try {
                await tryCommunities(0); // Start trying communities from index 0
            } catch (error) {
                messagesFunctions.msgSNMPError(host)
                console.error('Error in tryCommunities:', error);
                // Handle the error here, if needed
            }
        });
    },
    getMultiOID: (host: string, oid: string, community: string): Promise<any> => {
        const session = new Session({
            host: host,
            community: community
        });
        const result: any = [];
        return new Promise((resolve, reject) => {
            session.getSubtree({
                oid: oid
            }, (error, varbinds) => {
                if (error) {
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