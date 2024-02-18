import {RouteProp, useRoute} from '@react-navigation/native';
import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {RootStackParamList} from 'types/navigator';

export default function DeepLinkScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'DeepLink'>>();
  const {uri} = route.params;
  const styles = createStyles();

  return (
    <KeyboardAvoidingView style={{...styles.webview}} behavior="padding">
      <View style={{...styles.container}}>
        <WebView
          source={{
            uri: uri,
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
