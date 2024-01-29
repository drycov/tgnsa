import { includes } from "underscore";
import baseUtil from "./baseUtil";

export default {
  FilterDeviceModel: (dirtyData: string) => {
    type ModelLookup = Record<string, string>;

    const models: ModelLookup = {
      "S2350": "Huawei S2350-28TP-EI-AC",
      "S2700-18TP-SI-AC": "Huawei S2700-18TP-SI-AC",
      "S2320": "Huawei S2320-28TP-EI-AC",
      "S5320-28TP-LI-AC": "Huawei S5320-28TP-LI-AC",
      "S5320-28P-LI-AC": "Huawei S5320-28P-LI-AC",
      "S6320-54C-EI-48S-AC": "Huawei S6320-54C-EI-48S-AC",
      "S5700-26X-SI-12S-AC": "Huawei S5700-26X-SI-12S-AC",
      "Huawei Integrated Access Software": "Huawei SmartAX MA5616",
      "DGS-3420-28SC": "Dlink DGS-3420-28SC",
      "DGS-3620-28SC": "Dlink DGS-3620-28SC",
      "MES2324FB": "Eltex MES2324FB",
      "MES2324P": "Eltex MES2324P",
      "MES3324F": "Eltex MES3324F",
      "MES3308F": "Eltex MES3308F",
      "MES3316F": "Eltex MES3316F",
      "MES2428": "Eltex MES2428",
      "ZXR10 2928": "ZTE 2928E",
      "DES-3200-26": "D-Link DES-3200-26",
      "DES-3200-10": "D-Link DES-3200-10",
      "DES-3200-28": "D-Link DES-3200-28",
      "DES-1228/ME": "D-Link DES-1228/ME",
      "DES-1210-28/ME/B2": "D-Link DES-1210-28/ME/B2",
      "DES-1210-28": "D-Link DES-1210-28",
      "DES-1210-28/ME/B3": "D-Link DES-1210-28/ME/B3",
      "DGS-3000-10TC": "D-Link DGS-3000-10T",
      "DGS-3000-26TC": "D-Link DGS-3000-26TC",
      "Tp-Link T2700G-28TQ": "Tp-Link T2700G-28TQ",
      "Tp-Link T2600G-28TS": "Tp-Link T2600G-28TS",
      "Tp-Link TL-SL2428": "Tp-Link TL-SL2428",
      "Tp-Link TL-1600G-52PS": "Tp-Link TL-1600G-52PS",
      "CRS326-24G-2S+": "Mikrotik CRS326",
      "CRS112": "Mikrotik CRS112",
      "RB2011LS": "Mikrotik RB2011LS",
      "RB760": "Mikrotik RB760iGS",
      "RB SXT": "MikroTik SXT SA5",
      "RB911G-5HPacD": "Mikrotik NetBox 5",
      "CSS326-24G-2S+": "Mikrotik CSS326",
      "SNR-S2962-24T": "SNR S2962-24T",
      "SNR-S2995G-24FX": "SNR S2995G",
      "SNR-S2985G-24T": "SNR S2985G 24T",
      "SNR-S2985G-8T": "SNR S2985G 8T",
      "SNR-S2982G-24TE": "SNR S2982G 24T",
      "IES-612": "ZyXEL IES-612",
      "IES1248": "ZyXEL IES1248-51",
      "ZyXEL IES-1000/SAM1008": "ZyXEL SAM1008",
      "SG200-26": "Cisco SG200-26",
      "LinkSys SPS 208G": "LinkSys SPS 208G",
      "ME360x_t": "Cisco IOS ME3600",
      "ASR901": "Cisco IOS ASR901",
      "ASR9K": "Cisco IOS ASR9001",
      "C2960": "Cisco C2960",
      "LPOS": "Sprinter TX TopGate E1",
      "Linux": "Linux Server"
    };

    // Поиск модели по ключам в "dirty data"
    const swModel = Object.keys(models).find(key => dirtyData.includes(key));

    return swModel ? models[swModel] : dirtyData;
  },
  ArrayInterfaceModel: async (model: any) => {
    // let ifRange, ifList, ifDDM, ifFibers;
    switch (model) {
      case "Huawei S6320-54C-EI-48S-AC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s6320_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_50p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 28,
        });
      case "Huawei S5320-36C-EI-28S-AC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s5320_36c_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_36p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 0,
        });
      case "Huawei S2350-28TP-EI-AC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s5320_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 0,
        });
      case "Huawei S2320-28TP-EI-AC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s5320_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 0,
        });
      case "Huawei S5320-28TP-LI-AC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s5320_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 0,
        });
      case "Huawei S5320-28P-LI-AC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s5320_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 0,
        });
      case "Huawei S2700-18TP-SI-AC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s2700_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_huawei2700",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "Huawei SmartAX MA5616":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s2700_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_huawei2700",
            "interfaceList"
          ),
          ddm: false,
          adsl: true,
          fibers: 2,
        });
      case "Tp-Link TL-1600G-52PS":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "tplink_interfaces52",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_TL_1600G",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 0,
        });
      case "Tp-Link T2600G-28TS":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s5320_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 0,
        });
      case "Tp-Link T2700G-28TQ":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "tplink_interfaces2",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 0,
        });
      case "Tp-Link TL-SL2428":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "tplink_interfaces2",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "Eltex MES2324FB":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 28,
        });
      case "Eltex MES2324P":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 4,
        });
      case "Eltex MES2324F":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 28,
        });
      case "Eltex MES2324":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 28,
        });
      case "Eltex MES2428":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "mes2428_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 4,
        });
      case "Eltex MES3308F":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "mes3308_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "eltex3308_list",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 12,
        });
      case "Eltex MES3316F":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "mes3316_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "eltex3316_list",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 16,
        });
      case "Eltex MES3324F":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "mes3324_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "eltex3324_list",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 28,
        });
      case "D-Link DES-1210-28":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "tplink_interfaces2c",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "Dlink DGS-3620-28SC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 28,
        });
      case "D-Link DES-3200-26":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "tplink_interfaces2c",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_26p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "D-Link DES-3200-10":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "interface_list_10p",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_10p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "D-Link DGS-3000-10T":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "interface_list_10p",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_10p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "D-Link DGS-3000-26TC":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "interface_list_26p",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_26p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "SNR S2962-24T":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 4,
        });
      case "SNR S2985G 24T":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 4,
        });
      case "SNR S2995G":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_28p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 28,
        });
      case "SNR S2985G 8T":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "eltex_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_10p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "Mikrotik CRS112":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "s2350_interfaces",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_12p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 4,
        });
      case "Mikrotik CRS326":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "mikrotic_CRS326_26p",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_26p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "Mikrotik CSS326":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "Mikrotik_CRS326_26p",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_26p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "Mikrotik RB2011LS":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "RB2011LS_interface_list",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_11p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 1,
        });
      case "Mikrotik RB760iGS":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "Mikrotik_CRS326_26p",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_8p",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 1,
        });
      case "ZyXEL IES-612":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "zyxel_interfaces_adsl_12_2",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_12p",
            "interfaceList"
          ),
          adsl: true,
          ddm: false,
          fibers: 0,
        });
      case "ZyXEL IES1248-51":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "zyxel_interfaces_adsl_48_2",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_50p",
            "interfaceList"
          ),
          ddm: false,
          adsl: true,
          fibers: 0,
        });
      case "ZYXEL SAM1008":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "zyxel_interfaces_shdsl_8_1",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "interface_list_9p",
            "interfaceList"
          ),
          adsl: true,
          ddm: false,
          fibers: 0,
        });
      case "Cisco SG200-26":
        return JSON.stringify({
          interfaceRange: baseUtil.InterfaceLoader(
            "SG200_interface_list_26p",
            "interfaceRange"
          ),
          interfaceList: baseUtil.InterfaceLoader(
            "cisco_list",
            "interfaceList"
          ),
          ddm: true,
          adsl: false,
          fibers: 2,
        });
      case "Linux Server":
        return JSON.stringify({
          interfaceRange: "server",
          interfaceList: "server",
          ddm: false,
          adsl: false,
          fibers: 0,
        });
      default:
        return JSON.stringify({
          interfaceRange: "auto",
          interfaceList: "auto",
          ddm: false,
          adsl: false,
          fibers: 0,
        });
    }
  },
};
