type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const isDev = __DEV__;

function formatMessage(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (isDev) {
      console.debug(formatMessage("debug", message, context));
    }
  },

  info(message: string, context?: LogContext) {
    if (isDev) {
      console.info(formatMessage("info", message, context));
    }
  },

  warn(message: string, context?: LogContext) {
    if (isDev) {
      console.warn(formatMessage("warn", message, context));
    }
  },

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (isDev) {
      console.error(formatMessage("error", message, context), error);
    }
  },

  navigation(from: string | undefined, to: string, params?: Record<string, unknown>) {
    if (isDev) {
      console.info(formatMessage("info", `Navigation: ${from ?? "initial"} → ${to}`, params));
    }
  },

  setUser(_user: { id: string; email?: string; username?: string } | null) {},

  setTag(_key: string, _value: string) {},

  setContext(_name: string, _context: LogContext) {},
};
