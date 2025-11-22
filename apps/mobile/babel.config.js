module.exports = (api) => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './src/themes/tamagui/tamagui.config.ts',
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
