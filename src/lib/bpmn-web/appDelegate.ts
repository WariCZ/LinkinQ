import { Item, FLOW_ACTION, NODE_ACTION, IExecution, dateDiff } from ".";
import { DefaultAppDelegate } from ".";
import { AppServices } from "./appServices";
import { AppUtils } from "./appUtils";

// const Mailer = require("../userAccess/config/mail");

const fs = require("fs");

var seq = 1;

const MULTI_APP_SERVICES = false;

// const nodemailer = require("nodemailer");

// logger.info("appDelegate from ", __filename);

class MyAppDelegate extends DefaultAppDelegate {
  winSocket: any;
  appServices: any;
  appUtils;

  constructor(server: any) {
    super(server);
    this.appUtils = new AppUtils(server);
  }

  async getServicesProvider(context: any) {
    // for multiple appServices  -start
    if (MULTI_APP_SERVICES) {
      this.appServices = new Map();

      console.log("call services provider", context.instance.tenantId);
      const path = "./" + context.instance.tenantId + "_appServices";

      let instance = this.appServices.get(path);

      if (!instance) {
        const IMPORT = await import(path);
        const aClass = IMPORT.AppServices;
        instance = new aClass(this);
        this.appServices.set(path, instance);
        console.log("instance loaded", path, instance);
      }
      return instance;
      // for multiple appServices  -end
    } else {
      if (this.appServices == null) this.appServices = new AppServices(this);
      return this.appServices;
    }
  }
  /**
   * is fired on application startup
   **/
  async startUp(options: any) {
    await super.startUp(options);
    if (options["cron"] == false) {
      return;
    }

    console.log("Bpmn-web started");

    var query = { "items.status": "start" };
    var list = await this.server.dataStore.findItems(query);
    if (list.length > 0) {
      this.server.logger.log(
        "** There are " + list.length,
        " items that seems to be hung"
      );
      console.log(
        "** There are " + list.length,
        " items that seems to be hung"
      );
      list.forEach((it: any) => {
        console.log(
          `   item hung: '${it.elementId}' seq: ${it.seq} ${it.type} ${it.status} in process:'${it.processName}' - Instance id: '${it.instanceId}' `
        );
      });
    }

    var list = await this.server.dataStore.locker.list();

    let date = new Date();
    date.setDate(date.getDate() - 1);

    var list = await this.server.dataStore.locker.delete({
      time: { $lte: date },
    });

    if (list.length > 0) {
      console.log("Current locks ...", list.length);
      for (var i = 0; i < list.length; i++) {
        let item = list[i];
        console.log(
          "lock:",
          item.id,
          item.server,
          item.time,
          dateDiff(item.time)
        );
      }
    }
  }
  /**
   * sends emails is called by Notification class
   *
   * @param to
   * @param subject
   * @param text
   */

  async sendEmail(to: any, subject: any, text: any) {
    let emailMsg;
    if (process.env.EMAIL_ENABLE == "true") {
      // send mail with defined transport object
      // const transporter = nodemailer.createTransport({
      //   service: "gmail",
      //   auth: {
      //     user: process.env.SMTP_USER,
      //     pass: process.env.SMTP_PASSWORD,
      //   },
      // });

      // const info = await transporter.sendMail({
      //   from: process.env.EMAIL_FROM,
      //   to: to,
      //   subject: subject, //"Hello ?", // Subject line
      //   text: text, // plain text body
      //   html: text, //"<b>Hello world?</b>", // html body
      // });
      // emailMsg = info.messageId;
      // console.log("Message sent: %s", info.messageId);
      console.log("Message sent: %s");
    } else emailMsg = "email disabled by .env";

    let emailLog = process.env.EMAIL_LOG;
    if (emailLog && emailLog !== "") {
      let log = `\n\nto:${to}\n${subject}\n${text}\n${emailMsg}`;
      fs.appendFileSync(emailLog, log);
    }
    return emailMsg;
  }

  /* only for show 
    sendEmailSendGrid(to, msg, body) {

        console.log(`Sending email to ${to}`);

        const key = process.env.SENDGRID_API_KEY;

        if (key && (key != '')) {
            const sgMail = require('@sendgrid/mail')
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)

            const email = {
                to: to,
                from: 'ralphhanna@hotmail.com', // Change to your verified sender
                subject: msg,
                text: body,
                html: body
            }

            sgMail
                .send(email)
                .then((response) => {
                    this.server.logger.log('responseCode', response[0].statusCode)
                    this.server.logger.log('responseHeaders', response[0].headers)
                })
                .catch((error) => {
                    console.error('Email Error:' + error)
                })

        }
        else {
            console.log(`email is disabled`);
        }

    }
    */

  /**
   * is Called everytime a workflow is completed
   * @param execution
   */
  async executionEnded(execution: IExecution) {}
  async executionStarted(execution: IExecution) {
    await super.executionStarted(execution);
  }

  async executionEvent(context: any, event: any) {
    if (context.item) {
      //            console.log(`----->Event: '${event}' for ${context.item.element.type} '${context.item.element.id}' id: ${context.item.id}`);
      //            if (event == 'wait' && context.item.element.type == 'bpmn:UserTask')
      //                console.log(`----->Waiting for User Input for '${context.item.element.id}' id: ${context.item.id}`);
    }
    //       else
    //           console.log('----->All:' + event, context.definition.name);
  }
  async messageThrown(
    messageId: any,
    data: any,
    matchingQuery: any,
    item: Item
  ) {
    await super.messageThrown(messageId, data, matchingQuery, item);
  }
  async signalThrown(signalId: any, data: any, matchingQuery: any, item: Item) {
    await super.signalThrown(signalId, data, matchingQuery, item);
  }
  async serviceCalled(input: any, context: any) {
    this.server.logger.log("service called");
  }
}
class Utils {}
export { MyAppDelegate };
