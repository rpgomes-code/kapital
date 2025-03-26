import React, { Component, ErrorInfo, ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { colors, spacing } from "../constants/theme";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text variant="heading" style={styles.title}>
            Something went wrong
          </Text>

          <Text variant="body" style={styles.message}>
            The app has encountered an unexpected error. This has been reported
            to our team.
          </Text>

          {this.state.error && (
            <View style={styles.errorDetails}>
              <Text variant="caption" style={styles.errorTitle}>
                Error details:
              </Text>
              <Text style={styles.errorMessage}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}

          <Button onPress={this.resetError} style={styles.button}>
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: "white",
  },
  title: {
    marginBottom: spacing.md,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: spacing.xl,
    color: colors.gray[600],
  },
  errorDetails: {
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    borderRadius: 8,
    width: "100%",
    marginBottom: spacing.xl,
  },
  errorTitle: {
    marginBottom: spacing.xs,
  },
  errorMessage: {
    color: colors.red[500],
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  button: {
    minWidth: 200,
  },
});

export default ErrorBoundary;
