import {Platform} from 'react-native';
import {PERMISSIONS, check, request} from 'react-native-permissions';

export const checkAndRequestPhotosPermission = async () => {
  let hasPermission = false;

  if (Platform.OS === 'ios') {
    const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    hasPermission = status === 'granted';

    if (!hasPermission) {
      console.log('Requesting photo library permission for iOS');
      await requestPhotosPermission();
    }
  } else if (Platform.OS === 'android') {
    const status = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);

    hasPermission = status === 'granted';

    if (!hasPermission) {
      await requestPhotosPermission();
    }
  }

  return hasPermission;
};

export const requestPhotosPermission = async () => {
  if (Platform.OS === 'ios') {
    const response = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return response === 'granted';
  } else if (Platform.OS === 'android') {
    const response = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    return response === 'granted';
  }
};
