import { Button } from "@loskir/grammy-markup";

import { Keyboard } from "grammy";
import labels from "../assets/labels";

export default {
  admin: new Keyboard([
    [
      Button.text(labels.CheckDeviceLabel),
      Button.text(labels.AdvancedMenuLabel),
    ],
    [Button.webApp(labels.AdminLabel, "https://91.185.2.210/")],
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
