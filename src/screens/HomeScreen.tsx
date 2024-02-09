import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useRef} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView, {WebViewNavigation} from 'react-native-webview';
import {LocalStorageKeys} from 'types/localStorage';
import {WebviewBridge} from 'utils/WebviewBridge';
import {getFcmToken, registerListenerWithFCM} from 'utils/firebase';

export default function HomeScreen() {
  const webviewRef = useRef<WebView | null>(null);
  const {top, bottom} = useSafeAreaInsets();
  const styles = createStyles(top, bottom);

  const handleLoad = async () => {
    const accessToken = await AsyncStorage.getItem(
      LocalStorageKeys.ACCESS_TOKEN,
    );

    const refreshToken = await AsyncStorage.getItem(
      LocalStorageKeys.REFRESH_TOKEN,
    );

    const fcmToken = await AsyncStorage.getItem(LocalStorageKeys.FCM_TOKEN);

    if (webviewRef.current) {
      WebviewBridge.postMessage(webviewRef.current, {
        type: 'init',
        data: {
          accessToken,
          refreshToken,
          fcmToken,
        },
      });
    }
  };

  const handleShouldStartLoadWithRequest = (event: WebViewNavigation) => {
    if (event.url.startsWith('http') || event.url.startsWith('https')) {
      return true;
    } else if (Platform.OS === 'android' && event.url.startsWith('intent')) {
      // substring(7)
      Linking.openURL(event.url).catch((err: any) => {
        Alert.alert(
          'error',
          '앱 실행이 실패했습니다. 설치가 되어있지 않은 경우 설치하기 버튼을 눌러주세요.',
        );
        console.log(err);
      });

      return false;
    } else {
      Linking.openURL(event.url).catch((err: any) => {
        Alert.alert(
          'error',
          '앱 실행이 실패했습니다. 설치가 되어있지 않은 경우 설치하기 버튼을 눌러주세요.',
        );
        console.log(err);
      });
      return false;
    }
  };

  useEffect(() => {
    getFcmToken();
  }, []);

  useEffect(() => {
    if (webviewRef.current) {
      const unsubscribe = registerListenerWithFCM(webviewRef.current);
      console.log(unsubscribe);
      return unsubscribe;
    }
  }, []);

  return (
    <KeyboardAvoidingView style={{...styles.webview}} behavior="padding">
      <View style={{...styles.container}}>
        <WebView
          ref={webviewRef}
          source={{
            uri: 'https://74c8-58-76-161-229.ngrok-free.app/developer',
          }}
          originWhitelist={['intent', 'http', 'https', 'kakaolink']}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onMessage={WebviewBridge.onMessage}
          onLoad={handleLoad}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (top: number, bottom: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: top,
      paddingBottom: bottom / 2,
      backgroundColor: '#fff',
    },
    webview: {flex: 1},
  });
