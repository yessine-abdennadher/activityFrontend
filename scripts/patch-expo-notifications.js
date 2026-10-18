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
