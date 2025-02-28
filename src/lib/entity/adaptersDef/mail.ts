import { Knex } from "knex";
import _, { before } from "lodash";
import nodemailer from "nodemailer";
import { Sql } from "../sql";
import { EntitySchema } from "../types";
import { FormFieldType } from "../../../client/types/DynamicForm/types";

export class mailAdapter {
  transporter: any;
  name: string = "mailAdapter";
  status: number = 0; // 0 - not run; 1 - run
  db: Knex<any, unknown[]>;
  schema: EntitySchema;
  static form: FormFieldType[] = [
    {
      type: "text",
      field: "host",
      required: true,
      label: "Host",
    },
    {
      type: "text",
      field: "port",
      required: true,
      label: "Port",
    },
    {
      type: "text",
      field: "login",
      label: "Login",
    },
    {
      type: "text",
      field: "password",
      label: "Password",
    },
    {
      type: "checkbox",
      field: "ignoreCertificates",
      label: "Ignore certificate",
    },
  ];

  constructor({
    db,
    schema,
  }: {
    db: Knex<any, unknown[]>;
    schema: EntitySchema;
  }) {
    this.db = db;
    this.schema = schema;
  }

  init = (settings, cb) => {
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
        cb(true);
      }
    });
  };

  extractKeys = (input: string): string[] => {
    const regex = /\${{\s*([a-zA-Z0-9._]+)\s*}}/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
      matches.push(match[1].trim());
    }

    return matches;
  };

  replaceKeys = (input: string, data: Record<string, any>): string => {
    return input.replace(/\${{\s*([a-zA-Z0-9._]+)\s*}}/g, (a, key: string) => {
      const trimmedKey = key.trim();
      const value = _.get(data, trimmedKey);
      return value !== undefined ? value || "" : `\${{${trimmedKey}}}`;
    });
  };

  send = async (props) => {
    console.log("Email notification sended to: " + props?.to);

    const ntfs = await this.db("notifications")
      .setUser({ id: 1 })
      .select("*")
      .where({
        method: props.method,
        entity: props.entity,
        active: true,
      });

    for (const ntf of ntfs) {
      const fields = [
        ...this.extractKeys(ntf.subject),
        ...this.extractKeys(ntf.text),
      ];

      if (fields.length > 0) {
        var sql = new Sql({
          db: this.db,
          schema: this.schema,
          user: { id: 1 } as any,
        });

        const data = await sql.select({
          entity: ntf.entity,
          fields,
          where: {
            ...ntf.filter,
            id: props.data.id,
          },
        });

        if (data.length > 0) {
          if (ntf.subject) ntf.subject = this.replaceKeys(ntf.subject, data[0]);
          if (ntf.text) ntf.text = this.replaceKeys(ntf.text, data[0]);

          await this.transporter.sendMail({
            from: "linkinq@physter.com",
            to: "jakub.vareka@gmail.com",
            subject: ntf.subject,
            text: ntf.text,
          });
        }
      }
    }
  };
}
