import Notifier from "./../interfaces/notifier";
import nodemailer from "nodemailer";
import Email from "email-templates";
import config from "config";
import { SymbolEvent } from "./../models/symbolEvent";
import path from "path";
import { userDbPromise } from "../models/user";
import { ObjectId } from "mongodb";

/**
 * A notifier that sends emails.
 */
class Emailer implements Notifier {
  /**
   * The email client.
   */
  private email: Email;

  /**
   * Constructs [[email]].
   */
  public constructor() {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "coin.trend.notifier@gmail.com",
        pass: config.get("emailPassword")
      }
    });

    this.email = new Email({
      message: {
        from: "coin.trend.notifier@gmail.com"
      },
      send: false,
      transport,
      views: { root: path.join(__dirname, "/../templates") },
      preview: true
    });
  }

  /**
   * Sends an email to the event's subscribers.
   * @param symbolEvent The event to send an email about.
   */
  public notify(symbolEvent: SymbolEvent) {
    const template = symbolEvent.probability > 0 ? "up" : "down";
    const percentage = Math.abs(symbolEvent.probability) * 100;
    const symbolString = `${symbolEvent.cryptoSymbolInfo.baseAsset.name}${symbolEvent.cryptoSymbolInfo.quoteAsset.name}`;
    return Promise.all(
      symbolEvent
        .getSubscribers()
        .map(userId =>
          this.sendMail(userId, template, percentage, symbolString)
        )
    );
  }

  /**
   * Sends a custom email to the given user.
   * @param userId The hex string representation of the ObjectId of the user.
   * @param template The template of the email.
   * @param percentage The certainly the event is going to occur. Between 0 and 100.
   * @param symbolString The string representation of the crypto symbol.
   */
  private async sendMail(
    userId: string,
    template: "up" | "down",
    percentage: number,
    symbolString: string
  ) {
    const user = await (await userDbPromise).findById(
      ObjectId.createFromHexString(userId)
    );

    if (!user) return;

    return this.email.send({
      template,
      message: {
        to: user.email
      },
      locals: {
        username: user.username,
        percentage,
        symbolString
      }
    });
  }
}

export default new Emailer();
