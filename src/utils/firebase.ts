import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {PERMISSIONS, request} from 'react-native-permissions';
import WebView from 'react-native-webview';
import {LocalStorageKeys} from 'types/localStorage';
import {WebviewBridge} from 'utils/WebviewBridge';
//method was called to get FCM tiken for notification
export const getFcmToken = async () => {
  let token = null;
  await checkApplicationNotificationPermission();
  await registerAppWithFCM();

  try {
    const storageFcmToken = await AsyncStorage.getItem(
      LocalStorageKeys.FCM_TOKEN,
    );
    console.log(storageFcmToken);
    if (!storageFcmToken) {
      token = await messaging().getToken();

      await AsyncStorage.setItem(
        LocalStorageKeys.FCM_TOKEN,
        JSON.stringify(token),
      );
      console.log('getFcmToken-->', token);
    } else {
      console.log('storageFcmToken', storageFcmToken);
    }
  } catch (error) {
    console.log('getFcmToken Device Token error ', error);
  }
  return token;
};

//method was called on  user register with firebase FCM for notification
export async function registerAppWithFCM() {
  console.log(
    'registerAppWithFCM status',
    messaging().isDeviceRegisteredForRemoteMessages,
  );
  if (!messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging()
      .registerDeviceForRemoteMessages()
      .then(status => {
        console.log('registerDeviceForRemoteMessages status', status);
      })
      .catch(error => {
        console.log('registerDeviceForRemoteMessages error ', error);
      });
  }
}

//method was called on un register the user from firebase for stoping receiving notifications
export async function unRegisterAppWithFCM() {
  console.log(
    'unRegisterAppWithFCM status',
    messaging().isDeviceRegisteredForRemoteMessages,
  );

  if (messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging()
      .unregisterDeviceForRemoteMessages()
      .then(status => {
        console.log('unregisterDeviceForRemoteMessages status', status);
      })
      .catch(error => {
        console.log('unregisterDeviceForRemoteMessages error ', error);
      });
  }
  await messaging().deleteToken();
  console.log(
    'unRegisterAppWithFCM status',
    messaging().isDeviceRegisteredForRemoteMessages,
  );
}

export const checkApplicationNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
  request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
    .then(result => {
      console.log('POST_NOTIFICATIONS status:', result);
    })
    .catch(error => {
      console.log('POST_NOTIFICATIONS error ', error);
    });
};

//method was called to listener events from firebase for notification triger
export function registerListenerWithFCM(webview: WebView) {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('onMessage Received : ', JSON.stringify(remoteMessage));
    if (
      remoteMessage?.notification?.title &&
      remoteMessage?.notification?.body
    ) {
      WebviewBridge.postMessage(webview, {
        type: 'alarm',
        data: {
          title: remoteMessage?.notification?.title,
          body: remoteMessage?.notification?.body,
        },
      });
      onDisplayNotification(remoteMessage?.data);
    }
  });

  messaging().onNotificationOpenedApp(async remoteMessage => {
    console.log(
      'onNotificationOpenedApp Received',
      JSON.stringify(remoteMessage),
    );
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );

        WebviewBridge.postMessage(webview, {
          type: 'notification',
          data: {
            title: remoteMessage.notification?.title,
            body: remoteMessage.notification?.body,
          },
        });
      }
    });

  return unsubscribe;
}

//method was called to display notification
async function onDisplayNotification(data: any) {
  console.log('onDisplayNotification Adnan: ', JSON.stringify(data));
}
