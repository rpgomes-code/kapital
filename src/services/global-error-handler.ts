import * as Application from "expo-application";
import DeviceInfo from "expo-device";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";

// Original error handler
const originalHandler = ErrorUtils.getGlobalHandler();

// Error types we want to catch
type ErrorWithMessage = {
  message: string;
  stack?: string;
};

/**
 * Check if the error has a message property
 */
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

/**
 * Convert an unknown error to one with a message
 */
function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // Fallback in case there's an error stringifying the error
    return new Error(String(maybeError));
  }
}

/**
 * Save the error to a local log file
 */
async function saveErrorToLogFile(error: ErrorWithMessage): Promise<void> {
  try {
    // Create logs directory if it doesn't exist
    const logDir = `${FileSystem.documentDirectory}logs/`;
    const logDirInfo = await FileSystem.getInfoAsync(logDir);

    if (!logDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(logDir, { intermediates: true });
    }

    // Generate log file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logFilePath = `${logDir}error-${timestamp}.log`;

    // Get device info
    const deviceType = (await DeviceInfo.getDeviceTypeAsync()) || "unknown";
    const osVersion = DeviceInfo.osVersion || "unknown";
    const deviceName = `${Platform.OS} ${deviceType}`;

    // Log content
    const logContent = `
Timestamp: ${new Date().toISOString()}
App Version: ${Application.nativeApplicationVersion} (${
      Application.nativeBuildVersion
    })
Device: ${deviceName}
OS: ${Platform.OS} ${osVersion}

ERROR: ${error.message}
${error.stack ? `\nStack Trace:\n${error.stack}` : ""}
`;

    // Write error to log file
    await FileSystem.writeAsStringAsync(logFilePath, logContent);

    console.log(`Error saved to log file: ${logFilePath}`);
  } catch (e) {
    console.error("Failed to save error log:", e);
  }
}

/**
 * Initialize global error handler
 */
export function initializeErrorHandler(): void {
  // Set custom global error handler
  ErrorUtils.setGlobalHandler(async (error, isFatal) => {
    const errorWithMessage = toErrorWithMessage(error);

    // Log the error
    console.error(
      `GLOBAL ERROR HANDLER: ${isFatal ? "FATAL:" : ""} ${
        errorWithMessage.message
      }`,
      errorWithMessage.stack
    );

    // Save to log file
    await saveErrorToLogFile(errorWithMessage);

    // Show an alert for fatal errors
    if (isFatal) {
      Alert.alert(
        "Unexpected Error",
        "The application has encountered an unexpected error. Please restart the app and try again.",
        [{ text: "OK" }]
      );
    }

    // Call the original handler
    originalHandler(error, isFatal);
  });

  // Add a handler for unhandled promise rejections
  if (__DEV__) {
    // In development, let the dev tools handle promise rejections
    return;
  }

  // In production, catch unhandled promise rejections
  const rejectionTrackingOptions = {
    onUnhandled: (id: string, error: Error) => {
      console.error("Unhandled promise rejection with id:", id);
      ErrorUtils.getGlobalHandler()(error, false);
    },
    onHandled: () => {
      // Silence handled promise rejections
    },
  };

  // Enable promise rejection tracking
  require("promise/setimmediate/rejection-tracking").enable(
    rejectionTrackingOptions
  );
}

/**
 * Get error logs (useful for debugging and support)
 */
export async function getErrorLogs(): Promise<string[]> {
  try {
    const logDir = `${FileSystem.documentDirectory}logs/`;
    const logDirInfo = await FileSystem.getInfoAsync(logDir);

    if (!logDirInfo.exists) {
      return [];
    }

    const logFiles = await FileSystem.readDirectoryAsync(logDir);
    return logFiles.filter((file) => file.startsWith("error-"));
  } catch (e) {
    console.error("Failed to get error logs:", e);
    return [];
  }
}

/**
 * Read a specific error log file
 */
export async function readErrorLog(filename: string): Promise<string | null> {
  try {
    const logPath = `${FileSystem.documentDirectory}logs/${filename}`;
    const logInfo = await FileSystem.getInfoAsync(logPath);

    if (!logInfo.exists) {
      return null;
    }

    return await FileSystem.readAsStringAsync(logPath);
  } catch (e) {
    console.error("Failed to read error log:", e);
    return null;
  }
}

/**
 * Clear all error logs
 */
export async function clearErrorLogs(): Promise<boolean> {
  try {
    const logDir = `${FileSystem.documentDirectory}logs/`;
    const logDirInfo = await FileSystem.getInfoAsync(logDir);

    if (!logDirInfo.exists) {
      return true;
    }

    const logFiles = await FileSystem.readDirectoryAsync(logDir);

    for (const file of logFiles) {
      if (file.startsWith("error-")) {
        await FileSystem.deleteAsync(`${logDir}${file}`);
      }
    }

    return true;
  } catch (e) {
    console.error("Failed to clear error logs:", e);
    return false;
  }
}
