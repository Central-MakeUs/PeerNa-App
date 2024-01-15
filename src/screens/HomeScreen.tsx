import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

export default function HomeScreen() {
  const {top, bottom} = useSafeAreaInsets();
  const styles = createStyles(top, bottom);
  return (
    <View style={{...styles.container}}>
      <WebView source={{uri: 'http://localhost:5173'}} />
    </View>
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
