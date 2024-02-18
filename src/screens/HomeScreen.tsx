import AsyncStorage from '@react-native-async-storage/async-storage';
import useNavigator from 'hooks/useNavigator';
import {useCallback, useEffect, useRef} from 'react';
import {
  Alert,
  BackHandler,
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

  const backPress = useCallback(() => {
    if (webviewRef.current) {
      webviewRef.current.goBack();
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backPress);
    };
  }, [backPress]);

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

  const navigator = useNavigator();
  const handleShouldStartLoadWithRequest = (event: WebViewNavigation) => {
    console.log(event.url);
    if (event.url.includes('notion')) {
      navigator.stackNavigation.push('DeepLink');
      return false;
    }
    if (event.url.startsWith('http') || event.url.startsWith('https')) {
      return true;
    } else if (Platform.OS === 'android' && event.url.startsWith('intent')) {
      // intent: 부분 잘라서 kakaolink:// 로 시작
      Linking.openURL(event.url.substring(7));
      return false;
    } else {
      if (event.url.startsWith('kakaolink')) {
        Linking.openURL(event.url).catch(() => {
          Alert.alert(
            'error',
            '앱 실행이 실패했습니다. 설치가 되어있지 않은 경우 설치하기 버튼을 눌러주세요.',
          );
        });
        return false;
      }
    }
    return false;
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
    <KeyboardAvoidingView
      style={{...styles.webview}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{...styles.container}}>
        <WebView
          ref={webviewRef}
          source={{
            uri: 'https://www.peerna.me',
          }}
          originWhitelist={['intent', 'http', 'https', 'kakaolink']}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onMessage={WebviewBridge.onMessage}
          onLoad={handleLoad}
          scrollEnabled={false}
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
