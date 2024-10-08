import winston from "winston";
import { Response } from "express";

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

// Přepis console.log
console.log = function (message) {
  logger.info(message);
};

// Přepis console.error
console.error = function (message) {
  logger.error(message);
};

// Přepis dalších funkcí dle potřeby (např. console.warn, console.debug)
console.warn = function (message) {
  logger.warn(message);
};

console.debug = function (message) {
  logger.debug(message);
};

export const apiError = ({
  error,
  code,
  userError,
  res,
}: {
  error: string;
  code?: number;
  userError?: string;
  res: Response;
}) => {
  logger.error(error);
  res.status(code || 400).json({ error: userError || error });
};

export default logger;
