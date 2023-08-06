import {
    Button, IButton
} from "@loskir/grammy-markup";

import { InlineKeyboard, Keyboard } from "grammy";
import labels from "../assets/labels";

export default {
    onEnter: new Keyboard([[Button.text(labels.EnterLabel)],
    ]).resized().selected(),
    inBack: new InlineKeyboard([[
        IButton.text(labels.BackLabel, 'back')
    ]]),
    sendContact: new Keyboard([[Button.requestContact(labels.SendContactLabel)],
    ]).resized().selected(),
}