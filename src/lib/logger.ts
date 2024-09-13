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
  logger.log("error", error);
  res.status(code || 400).json({ error: userError || error });
};

export default logger;
