const {
  AndroidConfig,
  withAndroidStyles,
  withGradleProperties,
} = require('expo/config-plugins');

module.exports = function withReleaseOptimizations(config) {
  config = withAndroidStyles(config, (cfg) => {
    cfg.modResults = AndroidConfig.Styles.assignStylesValue(cfg.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: 'android:forceDarkAllowed',
      value: 'false',
      targetApi: '29',
    });
    return cfg;
  });

  return withGradleProperties(config, (config) => {
    const setProp = (key, value) => {
      const idx = config.modResults.findIndex(
        (item) => item.type === 'property' && item.key === key
      );
      if (idx !== -1) {
        config.modResults[idx].value = value;
      } else {
        config.modResults.push({ type: 'property', key, value });
      }
    };

    // Enable R8 code & resource shrinking for Google Play release builds
    setProp('android.enableMinifyInReleaseBuilds', 'true');
    setProp('android.enableProguardInReleaseBuilds', 'true');
    setProp('android.enableShrinkResourcesInReleaseBuilds', 'true');

    // Target physical Android devices (ARM 32-bit & 64-bit) to speed up NDK C++ builds
    setProp('reactNativeArchitectures', 'armeabi-v7a,arm64-v8a');

    return config;
  });
};
