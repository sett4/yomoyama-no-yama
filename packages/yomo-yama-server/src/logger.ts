import { Express, Request, RequestHandler, Response } from "express"
import { createNamespace } from "cls-hooked"

type LogSeverity = "DEBUG" | "INFO" | "WARNING" | "ERROR"
type LogContext = Record<string, unknown>

const applicationNamespace = createNamespace("app-log-ctx")

export type AppLogger = {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      cause: normalizeValue((value as Error & { cause?: unknown }).cause),
    }
  }

  if (typeof value === "bigint") {
    return value.toString()
  }

  if (value && typeof value === "object") {
    try {
      JSON.stringify(value)
      return value
    } catch {
      return String(value)
    }
  }

  return value
}

function buildLogEntry(
  severity: LogSeverity,
  context: LogContext,
  args: unknown[]
) {
  const [first, ...rest] = args
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    severity,
    ...context,
  }

  if (first instanceof Error) {
    entry.message = first.message
    entry.error = normalizeValue(first)
  } else if (
    first &&
    typeof first === "object" &&
    !Array.isArray(first)
  ) {
    const payload = first as Record<string, unknown>
    const { message, ...metadata } = payload
    entry.message =
      typeof message === "string" ? message : JSON.stringify(normalizeValue(first))
    Object.assign(entry, normalizeValue(metadata))
  } else {
    entry.message =
      typeof first === "string"
        ? first
        : first === undefined
          ? ""
          : JSON.stringify(normalizeValue(first))
  }

  if (rest.length > 0) {
    entry.args = rest.map(normalizeValue)
  }

  return entry
}

function writeStructuredLog(
  severity: LogSeverity,
  context: LogContext,
  args: unknown[]
) {
  const entry = buildLogEntry(severity, context, args)
  const line = JSON.stringify(entry)

  if (severity === "ERROR" || severity === "WARNING") {
    console.error(line)
    return
  }

  console.info(line)
}

function createLogger(context: LogContext = {}): AppLogger {
  return {
    debug: (...args) => writeStructuredLog("DEBUG", context, args),
    info: (...args) => writeStructuredLog("INFO", context, args),
    warn: (...args) => writeStructuredLog("WARNING", context, args),
    error: (...args) => writeStructuredLog("ERROR", context, args),
  }
}

function getProjectId(): string | undefined {
  return process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
}

function getTraceContext(req: Request): LogContext {
  const traceHeader = req.header("X-Cloud-Trace-Context")
  const projectId = getProjectId()

  if (!traceHeader || !projectId) {
    return {}
  }

  const [tracePart] = traceHeader.split(";")
  const [traceId, spanId] = tracePart.split("/")
  if (!traceId) {
    return {}
  }

  return {
    "logging.googleapis.com/trace": `projects/${projectId}/traces/${traceId}`,
    ...(spanId ? { "logging.googleapis.com/spanId": spanId } : {}),
  }
}

function getRemoteIp(req: Request): string | undefined {
  const forwardedFor = req.header("X-Forwarded-For")
  return forwardedFor?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress
}

function getLatency(startedAt: bigint): string {
  const elapsedNanoseconds = process.hrtime.bigint() - startedAt
  const elapsedSeconds = Number(elapsedNanoseconds) / 1_000_000_000
  return `${elapsedSeconds.toFixed(3)}s`
}

function buildHttpRequest(req: Request, res: Response, startedAt: bigint) {
  return {
    requestMethod: req.method,
    requestUrl: req.originalUrl || req.url,
    status: res.statusCode,
    userAgent: req.header("User-Agent"),
    remoteIp: getRemoteIp(req),
    referer: req.header("Referer"),
    latency: getLatency(startedAt),
  }
}

const log = createLogger()

const useStructuredLogging = function (app: Express) {
  const attachContext: RequestHandler = (req, res, next) => {
    const startedAt = process.hrtime.bigint()

    applicationNamespace.run(() => {
      const logger = createLogger(getTraceContext(req))
      applicationNamespace.set("LOGGER", logger)

      res.on("finish", () => {
        logger.info({
          message: "request completed",
          httpRequest: buildHttpRequest(req, res, startedAt),
        })
      })

      next()
    })
  }

  app.use(attachContext)
}

const getLogger = (): AppLogger => {
  return applicationNamespace.get("LOGGER") || log
}

export { useStructuredLogging, log, getLogger }
