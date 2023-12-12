import { Netmask } from "netmask";
import { platform } from "os";
import ping from "ping";

import * as path from 'path';
import * as fs from 'fs';
import util from "util";
import config from "../config";
// const Netmask = netmask.Netmask

export default {
  subnetCalculate: (host: any) => {
    // if (SubnetRegexp().test(host)) {
    let sc;
    sc = new Netmask(host);
    return util.format(
      "<b>Расчет IP-сети <code>%s</code></b>\n\nАдрес сети:<code>%s</code>\nМаска подсети: <code>%s</code>\nПервый хост: <code>%s</code>\nПоследний хост: <code>%s</code>\nХостов/Сетей: <code>%s</code>",
      host,
      sc.base,
      sc.mask,
      sc.first,
      sc.last,
      sc.size
    );
    // }
  },

  p2pCalculate: (host: any) => {
    // if (P2PSubnetRegexp().test(host)) {
    let sc;
    sc = new Netmask(host);
    return util.format(
      "<b>Расчет P2P-пары <code>%s</code></b>\n\nХост:  <code>%s</code> \nШлюз: <code>%s</code> \nМаска подсети: <code>%s</code>",
      host,
      sc.last,
      sc.first,
      sc.mask
    );
    // }
  },
  pingDeviceLog: async (host: any) => {
    let extra: any[] = [];
    const type = platform();
    if (type.includes("linux")) {
      extra = ["-c", config.pingDevice.count];
    } else if (type.includes("win32")) {
      extra = ["-n", config.pingDevice.count];
    }
    // console.log(extra)
    return ping.promise
      .probe(host, {
        extra: extra,
      })
      .then((res: any) => {
        // logger.info(res)
        return res;
      });
  },
  InterfaceLoader: (val: string, filename: string) => {
    // const srcPach = "./src";
    const filePath = path.join(__dirname, '../../', 'src');

    let rawdata: any = fs.readFileSync(`${filePath}/${filename}.json`);
    let json = JSON.parse(rawdata);
    const result: any[] = [];
    Object.keys(json).forEach((key) => {
      if (key === val) {
        result.push(json[key]);
      }
    });
    return result[0];
  },
};
