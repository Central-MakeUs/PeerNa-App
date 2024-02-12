import {Platform} from 'react-native';
import {PERMISSIONS, check, request} from 'react-native-permissions';

export const checkAndRequestPhotosPermission = async () => {
  let hasPermission = false;

  if (Platform.OS === 'ios') {
    const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    hasPermission = status === 'granted';

    if (!hasPermission) {
      console.log('Requesting photo library permission for iOS');
      await requestPhotosPermission(); // 이미 정의된 권한 요청 함수를 호출
    }
  } else if (Platform.OS === 'android') {
    const status = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    hasPermission = status === 'granted';
    // hasPermission = status;
    // if (!hasPermission) {
    //   console.log('Requesting storage permission for Android');
    //   await requestPhotosPermission(); // 이미 정의된 권한 요청 함수를 호출
    // }
  }

  return hasPermission;
};

export const requestPhotosPermission = async () => {
  if (Platform.OS === 'ios') {
    const response = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return response === 'granted';
  } else if (Platform.OS === 'android') {
    const response = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    return response === 'granted';
  }
};
