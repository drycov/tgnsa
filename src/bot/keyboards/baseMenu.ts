import { InlineKeyboard, Keyboard } from "grammy";
import labels from "../assets/labels";

export default {
  onEnter: new Keyboard().text(labels.EnterLabel).resized().persistent(true).placeholder(labels.EnterLabel),
  inBack: new InlineKeyboard().text(labels.BackLabel, "back"),
  sendContact: new Keyboard().requestContact(labels.SendContactLabel).resized().persistent(true).placeholder(labels.SendContactLabel),
  verifyUser: (tgId: number) => { return new InlineKeyboard().text(`${labels.UserAllowLabel} ${tgId}`, `add_${tgId}`) }
};
