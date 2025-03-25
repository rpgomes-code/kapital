import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  // Request permission to send notifications
  async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return false;
      }

      return true;
    } else {
      console.log("Must use physical device for push notifications");
      return false;
    }
  }

  // Get the push token
  async getExpoPushToken() {
    if (!Device.isDevice) {
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  // Schedule a local notification for dividend
  async scheduleDividendNotification(
    stock: { symbol: string; shortName: string },
    exDate: string | Date,
    paymentDate: string | Date
  ) {
    try {
      const triggerDate = new Date(exDate);
      triggerDate.setDate(triggerDate.getDate() - 1); // Notify one day before ex-dividend date
      triggerDate.setHours(9, 0, 0); // At 9:00 AM

      // Calculate seconds from now until the notification time
      const secondsFromNow = Math.floor(
        (triggerDate.getTime() - Date.now()) / 1000
      );

      if (secondsFromNow <= 0) {
        console.log("Notification date has already passed");
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Dividend Alert: ${stock.symbol}`,
          body: `${
            stock.shortName
          } goes ex-dividend tomorrow. Payment date: ${new Date(
            paymentDate
          ).toLocaleDateString()}`,
          data: { stock: stock.symbol },
        },
        trigger: { seconds: secondsFromNow } as any,
      });

      return true;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return false;
    }
  }

  // Cancel all pending notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error("Error canceling notifications:", error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
