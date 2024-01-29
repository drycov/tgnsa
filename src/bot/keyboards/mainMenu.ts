import { Button } from "@loskir/grammy-markup";

import { Keyboard } from "grammy";
import labels from "../assets/labels";

export default {
  admin: new Keyboard([
    [
      Button.text(labels.CheckDeviceLabel),
      Button.text(labels.AdvancedMenuLabel),
    ],
    [Button.text(labels.ApiTokenCreate)],

    [Button.text(labels.AdminLabel)],
    [Button.text(labels.ExitLabel)],
  ]).resized(),
  main: new Keyboard([
    [
      Button.text(labels.CheckDeviceLabel),
      Button.text(labels.AdvancedMenuLabel),
    ],
    [Button.text(labels.ApiTokenCreate)],

    [Button.text(labels.ExitLabel)],
  ]).resized(),
};
