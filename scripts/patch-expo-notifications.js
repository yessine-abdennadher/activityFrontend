/**
 * patch-expo-notifications.js
 * Empêche le crash "Cannot find native module 'ExpoTopicSubscriptionModule'"
 * lors de l'exécution d'ActivityTN dans Expo Go sur Android.
 */

const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'build', 'TopicSubscriptionModule.android.js'),
  path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'src', 'TopicSubscriptionModule.android.ts'),
];

for (const filePath of targetFiles) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("requireNativeModule('ExpoTopicSubscriptionModule')") || content.includes("requireNativeModule<TopicSubscriptionModule>('ExpoTopicSubscriptionModule')")) {
      const isTs = filePath.endsWith('.ts');
      const safeContent = isTs
        ? `import { requireOptionalNativeModule } from 'expo-modules-core';\n\nimport type { TopicSubscriptionModule } from './TopicSubscriptionModule.types';\n\nconst fallback: TopicSubscriptionModule = {\n  addListener: () => {},\n  removeListeners: () => {},\n  subscribeToTopicAsync: () => Promise.resolve(null),\n  unsubscribeFromTopicAsync: () => Promise.resolve(null),\n} as any;\n\nexport default (requireOptionalNativeModule<TopicSubscriptionModule>('ExpoTopicSubscriptionModule') || fallback);\n`
        : `import { requireOptionalNativeModule } from 'expo-modules-core';\n\nconst fallback = {\n  addListener: () => {},\n  removeListeners: () => {},\n  subscribeToTopicAsync: () => Promise.resolve(null),\n  unsubscribeFromTopicAsync: () => Promise.resolve(null),\n};\n\nexport default requireOptionalNativeModule('ExpoTopicSubscriptionModule') || fallback;\n`;
      fs.writeFileSync(filePath, safeContent, 'utf8');
      console.log(`[Patch] ✅ ${path.basename(filePath)} sécurisé pour Expo Go.`);
    }
  }
}

// Empêche l'erreur ENOENT de Chrome DevTools / debugger-frontend lorsqu'il cherche fr.json
const debuggerLocalesDir = path.join(__dirname, '..', 'node_modules', '@react-native', 'debugger-frontend', 'dist', 'third-party', 'front_end', 'core', 'i18n', 'locales');
if (fs.existsSync(debuggerLocalesDir)) {
  const enJson = path.join(debuggerLocalesDir, 'en-US.json');
  if (fs.existsSync(enJson)) {
    const frJson = path.join(debuggerLocalesDir, 'fr.json');
    const frFrJson = path.join(debuggerLocalesDir, 'fr-FR.json');
    if (!fs.existsSync(frJson)) {
      fs.copyFileSync(enJson, frJson);
      console.log('[Patch] ✅ fr.json créé pour @react-native/debugger-frontend.');
    }
    if (!fs.existsSync(frFrJson)) {
      fs.copyFileSync(enJson, frFrJson);
      console.log('[Patch] ✅ fr-FR.json créé pour @react-native/debugger-frontend.');
    }
  }
}
