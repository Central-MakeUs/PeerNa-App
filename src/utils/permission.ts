import {Platform} from 'react-native';
import {
  PERMISSIONS,
  check,
  checkMultiple,
  request,
  requestMultiple,
} from 'react-native-permissions';

export const checkAndRequestPhotosPermission = async () => {
  let hasPermission = false;

  if (Platform.OS === 'ios') {
    const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    hasPermission = status === 'granted';

    if (!hasPermission) {
      console.log('Requesting photo library permission for iOS');
      await requestPhotosPermission();
    }
    return hasPermission;
  } else if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const status = await checkMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      ]);
      hasPermission =
        status['android.permission.READ_MEDIA_IMAGES'] === 'granted' &&
        status['android.permission.READ_MEDIA_IMAGES'] === 'granted';

      if (!hasPermission) {
        await requestPhotosPermission();
      }
      return hasPermission;
    }

    // lower 33
    const status = await checkMultiple([
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    ]);
    hasPermission =
      status['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
      status['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted';

    if (!hasPermission) {
      await requestPhotosPermission();
    }
    return hasPermission;
  }
  return false;
};

export const requestPhotosPermission = async () => {
  if (Platform.OS === 'ios') {
    const response = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return response === 'granted';
  } else if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const status = await requestMultiple([
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      ]);

      return (
        status['android.permission.READ_MEDIA_IMAGES'] === 'granted' &&
        status['android.permission.READ_MEDIA_VIDEO']
      );
    }
    // lower 33
    const response = await requestMultiple([
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]);
    return (
      response['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted' &&
      response['android.permission.READ_EXTERNAL_STORAGE'] === 'granted'
    );
  }
};
