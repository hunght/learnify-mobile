import * as Sentry from "@sentry/react-native";

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
    Sentry.addBreadcrumb({
      category: "debug",
      message,
      level: "debug",
      data: context,
    });
  },

  info(message: string, context?: LogContext) {
    if (isDev) {
      console.info(formatMessage("info", message, context));
    }
    Sentry.addBreadcrumb({
      category: "info",
      message,
      level: "info",
      data: context,
    });
  },

  warn(message: string, context?: LogContext) {
    if (isDev) {
      console.warn(formatMessage("warn", message, context));
    }
    Sentry.addBreadcrumb({
      category: "warning",
      message,
      level: "warning",
      data: context,
    });
  },

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (isDev) {
      console.error(formatMessage("error", message, context), error);
    }

    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: { message, ...context },
      });
    } else {
      Sentry.captureMessage(message, {
        level: "error",
        extra: { error, ...context },
      });
    }
  },

  navigation(from: string | undefined, to: string, params?: Record<string, unknown>) {
    if (isDev) {
      console.info(formatMessage("info", `Navigation: ${from ?? "initial"} → ${to}`, params));
    }
    Sentry.addBreadcrumb({
      category: "navigation",
      message: `${from ?? "initial"} → ${to}`,
      level: "info",
      data: params,
    });
  },

  setUser(user: { id: string; email?: string; username?: string } | null) {
    Sentry.setUser(user);
  },

  setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  },

  setContext(name: string, context: LogContext) {
    Sentry.setContext(name, context);
  },
};
