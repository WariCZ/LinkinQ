import winston from "winston";
import { Response } from "express";
import { parse, stringify } from "flatted";

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message}`;
});

//
const logger = winston.createLogger({
  level: "debug", //"info", // Nastavte požadovanou úroveň logování
  format: combine(timestamp({ format: "DD.MM.YYYY HH:mm:ss,SSS" }), myFormat),
  transports: [
    new winston.transports.Console(), // Logování do konzole
    // new winston.transports.File({ filename: "app.log" }), // Logování do souboru
  ],
});

const printArgv = (argv: any) => {
  return argv.map((a: any) => {
    if (typeof a == "object") {
      return JSON.stringify(parse(stringify(a)));
    } else {
      return a;
    }
  });
};
// Přepis console.log
console.log = function (...argv) {
  logger.info(printArgv(argv));
};

// Přepis console.error
console.error = function (...argv) {
  logger.error(printArgv(argv));
};

// Přepis dalších funkcí dle potřeby (např. console.warn, console.debug)
console.warn = function (...argv) {
  logger.warn(printArgv(argv));
};

console.debug = function (...argv) {
  logger.debug(printArgv(argv));
};

export const apiError = ({
  error,
  type,
  code,
  userError,
  res,
}: {
  error: string;
  type?: "debug" | "error" | "warn";
  code?: number;
  userError?: string;
  res: Response;
}) => {
  if (type == "debug") {
    logger.debug(error);
  } else if (type == "warn") {
    logger.warn(error);
  } else {
    logger.error(error);
  }
  res.status(code || 400).json({ error: userError || error });
};

export default logger;
