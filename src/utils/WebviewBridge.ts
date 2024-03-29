import AsyncStorage from '@react-native-async-storage/async-storage';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import WebView, {WebViewMessageEvent} from 'react-native-webview';
import {LocalStorageKeys} from 'types/localStorage';
import {checkAndRequestPhotosPermission} from 'utils/permission';
// TODO postmessage를 보냄.
// message를 수신해야 함.
// 그에 따른 메서드를 정의

export class WebviewBridge {
  static webview: WebView<{}>;
  static onMessage(event: WebViewMessageEvent) {
    // TODO 에러바운더리 적용 필요함.
    try {
      const message: WebviewOnMessageResponseType = JSON.parse(
        event.nativeEvent.data,
      );

      switch (message.type) {
        case 'login':
          WebviewBridge.login(message.data);
          break;
        case 'alarm':
          WebviewBridge.alarm(message.data);
          break;
        case 'card-image':
          WebviewBridge.saveCard(message.data);
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
    this.webview = webviewRef;
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

  private static saveCard(data: any) {
    const saveImageToGallery = async (base64Image: string) => {
      try {
        // `base64Image`는 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...' 형식의 문자열입니다.
        checkAndRequestPhotosPermission().then(
          async (hasPermission: boolean) => {
            if (hasPermission) {
              try {
                if (Platform.OS === 'android') {
                  const imageData = base64Image.split(';base64,').pop();
                  const filePath = `${
                    RNFS.CachesDirectoryPath
                  }/temp_image_${new Date().getTime()}.jpg`;
                  await RNFS.writeFile(filePath, imageData!, 'base64');
                  await CameraRoll.saveAsset(`file://${filePath}`, {
                    type: 'photo',
                  });
                } else {
                  await CameraRoll.saveAsset(base64Image);
                }
              } catch (error) {
                console.log(error);
              }
              WebviewBridge.postMessage(this.webview, {
                type: 'save-card',
                data: true,
              });
            }
          },
        );
      } catch (error) {
        console.error('Error saving image to gallery', error);
      }
    };

    saveImageToGallery(data);
  }
}

type WebviewOnMessageResponseType = {
  type: string;
  data: any;
};
