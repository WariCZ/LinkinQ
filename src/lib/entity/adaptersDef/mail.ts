import nodemailer from "nodemailer";

export class mailAdapter {
  transporter: any;
  name: string = "mailAdapter";
  status: number = 0; // 0 - not run; 1 - run
  constructor() {}

  init = (settings) => {
    this.transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure || false,
      ...(settings.account
        ? {
            auth: {
              user: settings.account,
              pass: settings.password,
            },
          }
        : {}),
      tls: {
        rejectUnauthorized:
          settings.ignoreCertificates === undefined
            ? true
            : settings.ignoreCertificates,
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Chyba při připojení k serveru:", error);
      } else {
        console.log("Připojení k serveru je úspěšné!");
        this.status = 1;
      }
    });
  };

  send = async (props) => {
    console.log("Email notification sended to: " + props?.to);
    if (props.method === "insert") {
      await this.transporter.sendMail({
        from: "jakub.vareka@physter.com",
        to: "jakub.vareka@gmail.com",
        subject: `Vytvoren task - ${props.data.caption}`,
        text: `Byl vytvoren task s popisem:  ${props.data.description}`,
      });
    }
  };
}
