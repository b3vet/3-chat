import { type AuroraTheme, auroraTheme } from './aurora';
import { type CyberpunkTheme, cyberpunkTheme } from './cyberpunk';
import { type OceanTheme, oceanTheme } from './ocean';
import { type RetrowaveTheme, retrowaveTheme } from './retrowave';
import { type SpaceTheme, spaceTheme } from './space';

export type ThemeName = 'cyberpunk' | 'aurora' | 'ocean' | 'space' | 'retrowave';

export type CustomTheme = CyberpunkTheme | AuroraTheme | OceanTheme | SpaceTheme | RetrowaveTheme;

export const themes: Record<ThemeName, CustomTheme> = {
  cyberpunk: cyberpunkTheme,
  aurora: auroraTheme,
  ocean: oceanTheme,
  space: spaceTheme,
  retrowave: retrowaveTheme,
};

export const getTheme = (name: ThemeName): CustomTheme => {
  return themes[name] || themes.cyberpunk;
};

export const themeList = Object.entries(themes).map(([key, theme]) => ({
  id: key as ThemeName,
  name: theme.displayName,
  preview: {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    background: theme.colors.background,
  },
}));

export { cyberpunkTheme, auroraTheme, oceanTheme, spaceTheme, retrowaveTheme };

export type { CyberpunkTheme, AuroraTheme, OceanTheme, SpaceTheme, RetrowaveTheme };
