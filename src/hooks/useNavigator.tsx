import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'types/navigator';

const useNavigator = () => {
  const stackNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return {stackNavigation};
};

export default useNavigator;
