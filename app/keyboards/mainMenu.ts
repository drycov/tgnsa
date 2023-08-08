import {
    Button, IButton
} from "@loskir/grammy-markup";

import { InlineKeyboard, Keyboard } from "grammy";
import labels from "../assets/labels";

export = {
    admin: new Keyboard([[Button.text(labels.CheckDeviceLabel),
    Button.text(labels.AdvancedMenuLabel)],
    [Button.webApp(labels.AdminLabel,"https://webadmin.vercel.app/")],
    [Button.text(labels.ExitLabel)],
    ]).resized(),
    main: new Keyboard([[Button.text(labels.CheckDeviceLabel),
    Button.text(labels.AdvancedMenuLabel)],
    [Button.text(labels.ExitLabel)],
    ]).resized(),
}