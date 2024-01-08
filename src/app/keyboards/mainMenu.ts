import { Button } from "@loskir/grammy-markup";

import { Keyboard } from "grammy";
import labels from "../assets/labels";

export default {
  admin: new Keyboard([
    [
      Button.text(labels.CheckDeviceLabel),
      Button.text(labels.AdvancedMenuLabel),
    ],
    [Button.webApp(labels.AdminLabel, "http://tgnsa.ru:3000/")],
    [Button.text(labels.ExitLabel)],
  ]).resized(),
  main: new Keyboard([
    [
      Button.text(labels.CheckDeviceLabel),
      Button.text(labels.AdvancedMenuLabel),
    ],
    [Button.text(labels.ExitLabel)],
  ]).resized(),
};
