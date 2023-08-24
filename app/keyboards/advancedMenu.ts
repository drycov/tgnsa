import { Button } from "@loskir/grammy-markup";

import { Keyboard } from "grammy";
import labels from "../assets/labels";

export default {
  additional: new Keyboard([
    [Button.text(labels.CIDRCalcLabel), Button.text(labels.P2PCalcLabel)],
    [Button.text(labels.PingDeviceLabel), Button.text(labels.MIAllertLabel)],
    [Button.text(labels.DOFLabel), Button.text(labels.DSLabel)],
    [Button.text(labels.BackLabel)],
  ]).resized(),
};
