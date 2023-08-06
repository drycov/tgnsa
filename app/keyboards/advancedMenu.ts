import {
    Button, IButton
} from "@loskir/grammy-markup";

import { InlineKeyboard, Keyboard } from "grammy";
import labels from "../assets/labels";

export = {
    additional: new Keyboard([[Button.text(labels.CIDRCalcLabel), Button.text(labels.P2PCalcLabel)], [Button.text(labels.PingDeviceLabel), Button.text(labels.MIAllertLabel)], [Button.text(labels.BackLabel)]]).resized(),

}