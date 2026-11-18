import Reactotron from 'reactotron-react-native';
import { NativeModules, Platform } from 'react-native';

if (__DEV__) {
  // Détecter l'hôte pour Expo (émulateur, Wi-Fi local ou physique)
  let host = 'localhost';
  if (Platform.OS === 'android') {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      host = scriptURL.split('://')[1].split(':')[0];
    }
  }

  Reactotron.configure({
    name: 'Hamla Mobile',
    host: host || 'localhost',
  })
    .useReactNative({
      networking: {
        ignoreUrls: /symbolicate/,
      },
    })
    .connect();

  Reactotron.clear?.();
}

export default Reactotron;
