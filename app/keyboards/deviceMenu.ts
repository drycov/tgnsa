import {
    Button, IButton
} from "@loskir/grammy-markup";

import { InlineKeyboard, Keyboard } from "grammy";

import labels from "../assets/labels";
export = {
    checkDevice: new Keyboard([[Button.text(labels.PortInfoLabel), Button.text(labels.VlanListLabel)], [Button.text(labels.DDMInfoLabel)], [Button.text(labels.BackLabel)]])
        .resized()
}