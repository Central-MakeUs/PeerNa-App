import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {LocalStorageKeys} from 'types/localStorage';
// TODO postmessage를 보냄.
// message를 수신해야 함.
// 그에 따른 메서드를 정의

export class WebviewBridge {
  static onMessage(event: WebViewMessageEvent) {
    // TODO 에러바운더리 적용 필요함.
    try {
      const message: WebviewOnMessageResponseType = JSON.parse(
        event.nativeEvent.data,
      );

      console.log(message);

      switch (message.type) {
        case 'login':
          WebviewBridge.login(message.data);
          break;
        case 'alarm':
          WebviewBridge.alarm(message.data);
          break;
        default:
          console.warn('Unhandled message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing message data:', error);
    }
  }

  static postMessage(
    webviewRef: WebView,
    data: {
      type: string;
      data: any;
    },
  ) {
    const message = JSON.stringify(data);
    webviewRef.postMessage(message);
  }

  private static async login(data: any) {
    await AsyncStorage.setItem(
      LocalStorageKeys.ACCESS_TOKEN,
      JSON.stringify(data.accessToken),
    );

    await AsyncStorage.setItem(
      LocalStorageKeys.REFRESH_TOKEN,
      JSON.stringify(data.refreshToken),
    );

    const hasFcmToken = await AsyncStorage.getItem(LocalStorageKeys.FCM_TOKEN);
    if (!hasFcmToken) {
      const fcmToken = await messaging().getToken();

      await AsyncStorage.setItem(
        LocalStorageKeys.FCM_TOKEN,
        JSON.stringify(fcmToken),
      );
    }
  }

  private static alarm(data: any) {
    console.log('Alarm method called with data:', data);
  }
}

type WebviewOnMessageResponseType = {
  type: string;
  data: any;
};
