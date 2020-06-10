import * as winston from "winston"

function initLogger(stage: string): winston.Logger {
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: "winston-lambda" },
    transports: new winston.transports.Console(),
  })

  // 検証環境の場合、loggingをdebugレベルまで上げる
  if (stage !== "production") {
    // clear()をする事によって、createLoggerの際に指定したtransportsの設定を消せる
    logger.clear()
    logger.add(
      new winston.transports.Console({
        level: "debug",
      })
    )
  }

  return logger
}
const stage = process.env.NODE_ENV || "development"
export const logger = initLogger(stage)
