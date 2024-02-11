import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';

export default function DeepLinkScreen() {
  const styles = createStyles();

  return (
    <KeyboardAvoidingView style={{...styles.webview}} behavior="padding">
      <View style={{...styles.container}}>
        <WebView
          source={{
            uri: 'https://peerna.notion.site/89daac4cb26342d5a4b6e3d660b22b5c',
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    webview: {flex: 1},
  });
