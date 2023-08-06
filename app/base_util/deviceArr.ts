import baseUtil from "./baseUtil"

export = {
    FilterDeviceModel: (dirtyData: string) => {
        // console.log(dirtyData)
        var swModel
        if (dirtyData.includes("S2350")) {
            swModel = "Huawei S2350-28TP-EI-AC"
        } else if (dirtyData.includes("S2700-18TP-SI-AC")) {
            swModel = "Huawei S2700-18TP-SI-AC"
        } else if (dirtyData.includes("S2320")) {
            swModel = "Huawei S2320-28TP-EI-AC"
        } else if (dirtyData.includes("S5320-28TP-LI-AC")) {
            swModel = "Huawei S5320-28TP-LI-AC"
        } else if (dirtyData.includes("S5320-28P-LI-AC")) {
            swModel = "Huawei S5320-28P-LI-AC"
        } else if (dirtyData.includes("S6320-54C-EI-48S-AC")) {
            swModel = "Huawei S6320-54C-EI-48S-AC"
        } else if (dirtyData.includes("DGS-3420-28SC")) {
            swModel = "Dlink DGS-3420-28SC"
        } else if (dirtyData.includes("DGS-3620-28SC")) {
            swModel = "Dlink DGS-3620-28SC"
        } else if (dirtyData.includes("MES2324")) {
            if (dirtyData.includes("MES2324FB")) {
                swModel = "Eltex MES2324FB"
            } else if (dirtyData.includes("MES2324P")) {
                swModel = "Eltex MES2324P"
            }
        } else if (dirtyData.includes("MES3324F")) {
            swModel = "Eltex MES3324F"
        } else if (dirtyData.includes("MES3308F")) {
            swModel = "Eltex MES3308F"
        } else if (dirtyData.includes("MES3316F")) {
            swModel = "Eltex MES3316F"
        } else if (dirtyData.includes("MES2428")) {
            swModel = "Eltex MES2428"
        } else if (dirtyData.includes("ZXR10 2928")) {
            swModel = "ZTE 2928E"
        } else if (dirtyData.includes("DES-3200-26")) {
            swModel = "D-Link DES-3200-26"
        } else if (dirtyData.includes("DES-3200-10")) {
            swModel = "D-Link DES-3200-10"
        } else if (dirtyData.includes("DES-3200-28")) {
            swModel = "D-Link DES-3200-28"
        } else if (dirtyData.includes("DES-1228/ME")) {
            swModel = "D-Link DES-1228/ME"
        } else if (dirtyData.includes("DES-1210-28/ME/B2")) {
            swModel = "D-Link DES-1210-28/ME/B2"
        } else if (dirtyData.includes("DES-1210-28")) {
            swModel = "D-Link DES-1210-28"
        } else if (dirtyData.includes("DES-1210-28/ME/B3")) {
            swModel = "D-Link DES-1210-28/ME/B3"
        } else if (dirtyData.includes("DGS-3000-10TC")) {
            swModel = "D-Link DGS-3000-10T"
        } else if (dirtyData.includes("DGS-3000-26TC")) {
            swModel = "D-Link DGS-3000-26TC"
        } else if (dirtyData.includes("JetStream 24-Port Gigabit")) {
            if (dirtyData.includes("Stackable L2+ Managed Switch with 4 10G SFP+ Slots")) {
                swModel = "Tp-Link T2700G-28TQ"
            } else if (dirtyData.includes("L2 Managed Switch with 4 SFP Slots")) {
                swModel = "Tp-Link T2600G-28TS"
            } else if (dirtyData.includes("L2+ Managed Switch with 4 SFP Slots")) {
                swModel = "Tp-Link T2600G-28TS"
            }
        } else if (dirtyData.includes("24-Port 10/100Mbps + 4-Port Gigabit Smart Switch")) {
            swModel = "Tp-Link TL-SL2428"
        } else if (dirtyData.includes("JetStream 48-Port Gigabit Smart PoE Switch with 4 SFP Slots")) {
            swModel = "Tp-Link TL-1600G-52PS"
        } else if (dirtyData.includes("RouterOS")) {
            if (dirtyData.includes("CRS326-24G-2S+")) {
                swModel = "Mikrotik CRS326"
            } else if (dirtyData.includes("CRS112")) {
                swModel = "Mikrotik CRS112"
            } else if (dirtyData.includes("RB2011LS")) {
                swModel = "Mikrotik RB2011LS"
            } else if (dirtyData.includes("RB760")) {
                swModel = "Mikrotik RB760iGS"
            }
        } else if (dirtyData.includes("SwOS")) {
            if (dirtyData.includes("CSS326-24G-2S+")) {
                swModel = "Mikrotik CSS326"
            }
        } else if (dirtyData.includes("SNR")) {
            if (dirtyData.includes("SNR-S2962-24T")) {
                swModel = "SNR S2962-24T"
            } else if (dirtyData.includes("SNR-S2995G-24FX")) {
                swModel = "SNR S2995G"
            } else if (dirtyData.includes("SNR-S2985G-24T")) {
                swModel = "SNR S2985G 24T"
            } else if (dirtyData.includes("SNR-S2985G-8T")) {
                swModel = "SNR S2985G 8T"
            }
        } else if (dirtyData.includes("IES-612")) {
            swModel = "ZyXEL IES-612"
        } else if (dirtyData.includes("ZyXEL IES-1000/SAM1008")) {
            swModel = "ZyXEL SAM1008"
        } else if (dirtyData.includes("SG200-26")) {
            swModel = "Cisco SG200-26"
        } else if (dirtyData.includes("Linux")) {
            swModel = "Linux Server"
        } else {
            swModel = dirtyData
        }
        return swModel
    },
    ArrayInterfaceModel: async (model: any) => {
        // console.log(model)
        let ifRange, ifList, ifDDM, ifFibers
        switch (model) {
            case "Huawei S6320-54C-EI-48S-AC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s6320_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_50p", "interfaceList"),
                    ddm: true,
                    fibers: 28
                })
            case "Huawei S5320-36C-EI-28S-AC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s5320_36c_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_36p", "interfaceList"),
                    ddm: true,
                    fibers: 0
                })
            case "Huawei S2350-28TP-EI-AC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s5320_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 0
                })
            case "Huawei S2320-28TP-EI-AC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s5320_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 0
                })
            case "Huawei S5320-28TP-LI-AC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s5320_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 0
                })
            case "Huawei S5320-28P-LI-AC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s5320_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 0
                })
            case "Huawei S2700-18TP-SI-AC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s2700_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_huawei2700", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "Tp-Link TL-1600G-52PS":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("tplink_interfaces52", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_TL_1600G", "interfaceList"),
                    ddm: true,
                    fibers: 0
                })
            case "Tp-Link T2600G-28TS":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s5320_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 0
                })
            case "Tp-Link T2700G-28TQ":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("tplink_interfaces2", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 0
                })
            case "Tp-Link TL-SL2428":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("tplink_interfaces2", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "Eltex MES2324FB":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 28
                })
            case "Eltex MES2324P":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 4
                })
            case "Eltex MES2324F":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 28
                })
            case "Eltex MES2324":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 28
                })
            case "Eltex MES2428":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("mes2428_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 4
                })
            case "Eltex MES3308F":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("mes3308_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("eltex3308_list", "interfaceList"),
                    ddm: true,
                    fibers: 12
                })
            case "Eltex MES3316F":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("mes3316_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("eltex3316_list", "interfaceList"),
                    ddm: true,
                    fibers: 16
                })
            case "D-Link DES-1210-28":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("tplink_interfaces2c", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "Dlink DGS-3620-28SC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 28
                })
            case "D-Link DES-3200-26":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("tplink_interfaces2c", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_26p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "D-Link DES-3200-10":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("interface_list_10p", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_10p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "D-Link DGS-3000-10T":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("interface_list_10p", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_10p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "D-Link DGS-3000-26TC":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("interface_list_26p", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_26p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "SNR S2962-24T":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 4
                })
            case "SNR S2985G 24T":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 4
                })
            case "SNR S2995G":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_28p", "interfaceList"),
                    ddm: true,
                    fibers: 28
                })
            case "SNR S2985G 8T":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("eltex_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_10p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "Mikrotik CRS112":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("s2350_interfaces", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_12p", "interfaceList"),
                    ddm: true,
                    fibers: 4
                })
            case "Mikrotik CRS326":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("Mikrotik_CRS326_26p", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_26p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "Mikrotik CSS326":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("Mikrotik_CRS326_26p", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_26p", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "Mikrotik RB2011LS":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("RB2011LS_interface_list", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_11p", "interfaceList"),
                    ddm: true,
                    fibers: 1
                })
            case "Mikrotik RB760iGS":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("Mikrotik_CRS326_26p", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_8p", "interfaceList"),
                    ddm: true,
                    fibers: 1
                })
            case "ZyXEL IES-612":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("zyxel_interfaces_adsl_12_2", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_12p", "interfaceList"),
                    ddm: false,
                    fibers: 0
                })
            case "ZYXEL SAM1008":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("zyxel_interfaces_shdsl_8_1", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("interface_list_9p", "interfaceList"),
                    ddm: false,
                    fibers: 0
                })
            case "Cisco SG200-26":
                return JSON.stringify({
                    interfaceRange: baseUtil.InterfaceLoader("SG200_interface_list_26p", "interfaceRange"),
                    interfaceList: baseUtil.InterfaceLoader("cisco_list", "interfaceList"),
                    ddm: true,
                    fibers: 2
                })
            case "Linux Server":
                return JSON.stringify({
                    interfaceRange: "Server",
                    interfaceList: "Server",
                    ddm: false,
                    fibers: 0
                })
            default:
                return JSON.stringify({
                    interfaceRange: "auto",
                    interfaceList: "auto",
                    ddm: false,
                    fibers: 0
                })
        }
    }
}