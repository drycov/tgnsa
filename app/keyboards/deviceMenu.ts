import { Button } from "@loskir/grammy-markup";

import { Keyboard } from "grammy";

import labels from "../assets/labels";
export default {
  checkDevice: new Keyboard([
    [Button.text(labels.PortInfoLabel), Button.text(labels.VlanListLabel)],
    [Button.text(labels.DDMInfoLabel)],
    [Button.text(labels.BackLabel)],
  ]).resized(),
};
