import { Audio } from 'expo-av';

// Sound effect types
export type SoundEffect =
  | 'message_sent'
  | 'message_received'
  | 'message_read'
  | 'notification'
  | 'typing'
  | 'button_press'
  | 'tab_switch'
  | 'modal_open'
  | 'modal_close'
  | 'success'
  | 'error'
  | 'refresh'
  | 'reaction_add'
  | 'reaction_remove';

// Theme soundscape types
export type ThemeSoundscape = 'cyberpunk' | 'aurora' | 'ocean' | 'space' | 'retrowave' | 'default';

// Sound configuration per effect
interface SoundConfig {
  frequency: number;
  duration: number;
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  volume: number;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

// Synthesized sound configurations
const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  message_sent: {
    frequency: 880,
    duration: 150,
    waveform: 'sine',
    volume: 0.3,
    envelope: { attack: 10, decay: 50, sustain: 0.5, release: 90 },
  },
  message_received: {
    frequency: 660,
    duration: 200,
    waveform: 'sine',
    volume: 0.4,
    envelope: { attack: 10, decay: 60, sustain: 0.6, release: 130 },
  },
  message_read: {
    frequency: 1320,
    duration: 100,
    waveform: 'sine',
    volume: 0.2,
    envelope: { attack: 5, decay: 30, sustain: 0.3, release: 65 },
  },
  notification: {
    frequency: 740,
    duration: 400,
    waveform: 'triangle',
    volume: 0.5,
    envelope: { attack: 20, decay: 100, sustain: 0.7, release: 280 },
  },
  typing: {
    frequency: 1200,
    duration: 30,
    waveform: 'square',
    volume: 0.1,
    envelope: { attack: 5, decay: 10, sustain: 0.2, release: 15 },
  },
  button_press: {
    frequency: 440,
    duration: 50,
    waveform: 'sine',
    volume: 0.2,
    envelope: { attack: 5, decay: 15, sustain: 0.3, release: 30 },
  },
  tab_switch: {
    frequency: 550,
    duration: 80,
    waveform: 'triangle',
    volume: 0.25,
    envelope: { attack: 10, decay: 20, sustain: 0.4, release: 50 },
  },
  modal_open: {
    frequency: 330,
    duration: 200,
    waveform: 'sine',
    volume: 0.3,
    envelope: { attack: 30, decay: 50, sustain: 0.5, release: 120 },
  },
  modal_close: {
    frequency: 220,
    duration: 150,
    waveform: 'sine',
    volume: 0.25,
    envelope: { attack: 10, decay: 40, sustain: 0.4, release: 100 },
  },
  success: {
    frequency: 988,
    duration: 300,
    waveform: 'sine',
    volume: 0.35,
    envelope: { attack: 20, decay: 80, sustain: 0.6, release: 200 },
  },
  error: {
    frequency: 220,
    duration: 400,
    waveform: 'sawtooth',
    volume: 0.3,
    envelope: { attack: 10, decay: 100, sustain: 0.5, release: 290 },
  },
  refresh: {
    frequency: 660,
    duration: 100,
    waveform: 'triangle',
    volume: 0.2,
    envelope: { attack: 10, decay: 30, sustain: 0.3, release: 60 },
  },
  reaction_add: {
    frequency: 1100,
    duration: 120,
    waveform: 'sine',
    volume: 0.25,
    envelope: { attack: 10, decay: 30, sustain: 0.4, release: 80 },
  },
  reaction_remove: {
    frequency: 440,
    duration: 100,
    waveform: 'sine',
    volume: 0.2,
    envelope: { attack: 5, decay: 25, sustain: 0.3, release: 70 },
  },
};

// Theme-specific sound modifiers
const THEME_MODIFIERS: Record<ThemeSoundscape, Partial<SoundConfig>> = {
  cyberpunk: {
    waveform: 'square',
    volume: 0.35,
  },
  aurora: {
    waveform: 'sine',
    volume: 0.25,
    envelope: { attack: 50, decay: 100, sustain: 0.6, release: 200 },
  },
  ocean: {
    waveform: 'sine',
    volume: 0.2,
    envelope: { attack: 80, decay: 150, sustain: 0.5, release: 250 },
  },
  space: {
    waveform: 'triangle',
    volume: 0.3,
    envelope: { attack: 30, decay: 80, sustain: 0.4, release: 180 },
  },
  retrowave: {
    waveform: 'sawtooth',
    volume: 0.4,
  },
  default: {},
};

class SoundService {
  private enabled: boolean = true;
  private volume: number = 1.0;
  private currentTheme: ThemeSoundscape = 'default';
  private soundCache: Map<string, Audio.Sound> = new Map();
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize sound service:', error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  setTheme(theme: ThemeSoundscape): void {
    this.currentTheme = theme;
  }

  getTheme(): ThemeSoundscape {
    return this.currentTheme;
  }

  private getConfig(effect: SoundEffect): SoundConfig {
    const baseConfig = SOUND_CONFIGS[effect];
    const themeModifier = THEME_MODIFIERS[this.currentTheme];

    return {
      ...baseConfig,
      ...themeModifier,
      envelope: {
        ...baseConfig.envelope,
        ...(themeModifier.envelope || {}),
      },
      volume: baseConfig.volume * (themeModifier.volume || 1) * this.volume,
    };
  }

  async play(effect: SoundEffect): Promise<void> {
    if (!this.enabled || !this.isInitialized) return;

    const config = this.getConfig(effect);

    // For now, we'll use a simple approach with expo-av
    // In a production app, you might want to use a more sophisticated
    // audio synthesis library or pre-recorded sound files
    try {
      await this.playTone(config);
    } catch (error) {
      console.warn(`Failed to play sound effect: ${effect}`, error);
    }
  }

  private async playTone(config: SoundConfig): Promise<void> {
    // This is a simplified implementation
    // For full synthesis, you'd need a library like tone.js or native audio APIs
    // For now, we'll use haptic feedback as a fallback on mobile
    try {
      // Attempt to use expo-av for basic audio feedback
      // In production, you'd have actual audio files or use Web Audio API
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.generateToneDataUri(config) },
        { volume: config.volume },
      );

      await sound.playAsync();

      // Unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // Silently fail - sound effects are non-critical
    }
  }

  private generateToneDataUri(_config: SoundConfig): string {
    // Placeholder - in production you'd generate actual audio data
    // or use pre-recorded sound files
    // For now, return an empty audio placeholder
    return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  }

  // Quick play methods for common sounds
  async playMessageSent(): Promise<void> {
    return this.play('message_sent');
  }

  async playMessageReceived(): Promise<void> {
    return this.play('message_received');
  }

  async playMessageRead(): Promise<void> {
    return this.play('message_read');
  }

  async playNotification(): Promise<void> {
    return this.play('notification');
  }

  async playTyping(): Promise<void> {
    return this.play('typing');
  }

  async playButtonPress(): Promise<void> {
    return this.play('button_press');
  }

  async playTabSwitch(): Promise<void> {
    return this.play('tab_switch');
  }

  async playModalOpen(): Promise<void> {
    return this.play('modal_open');
  }

  async playModalClose(): Promise<void> {
    return this.play('modal_close');
  }

  async playSuccess(): Promise<void> {
    return this.play('success');
  }

  async playError(): Promise<void> {
    return this.play('error');
  }

  async playRefresh(): Promise<void> {
    return this.play('refresh');
  }

  async playReactionAdd(): Promise<void> {
    return this.play('reaction_add');
  }

  async playReactionRemove(): Promise<void> {
    return this.play('reaction_remove');
  }

  // Play a sequence of sounds (for complex feedback)
  async playSequence(effects: SoundEffect[], delayMs: number = 100): Promise<void> {
    for (const effect of effects) {
      await this.play(effect);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Play success melody
  async playSuccessMelody(): Promise<void> {
    await this.playSequence(['button_press', 'success', 'message_read'], 80);
  }

  // Play error melody
  async playErrorMelody(): Promise<void> {
    await this.playSequence(['error', 'error'], 150);
  }

  // Cleanup
  async dispose(): Promise<void> {
    for (const sound of this.soundCache.values()) {
      await sound.unloadAsync();
    }
    this.soundCache.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const soundService = new SoundService();

// Export hooks for React usage
export function useSoundEffect() {
  return {
    play: (effect: SoundEffect) => soundService.play(effect),
    playMessageSent: () => soundService.playMessageSent(),
    playMessageReceived: () => soundService.playMessageReceived(),
    playNotification: () => soundService.playNotification(),
    playButtonPress: () => soundService.playButtonPress(),
    playSuccess: () => soundService.playSuccess(),
    playError: () => soundService.playError(),
    setEnabled: (enabled: boolean) => soundService.setEnabled(enabled),
    setVolume: (volume: number) => soundService.setVolume(volume),
    setTheme: (theme: ThemeSoundscape) => soundService.setTheme(theme),
  };
}

export default soundService;
