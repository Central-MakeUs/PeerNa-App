import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRef} from 'react';
import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import {LocalStorageKeys} from 'types/localStorage';
import {WebviewBridge} from 'utils/WebviewBridge';

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

    if (webviewRef.current) {
      WebviewBridge.postMessage(webviewRef.current, {
        type: 'init',
        data: {accessToken, refreshToken},
      });
    }
  };

  return (
    <KeyboardAvoidingView style={{...styles.webview}} behavior="padding">
      <View style={{...styles.container}}>
        <WebView
          ref={webviewRef}
          source={{uri: 'http://localhost:5173/'}}
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
