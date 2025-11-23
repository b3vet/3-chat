import { type HapticType, hapticsService } from './haptics';
import { type SoundEffect, soundService, type ThemeSoundscape } from './sound';

// Combined feedback types
export type FeedbackEvent =
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
  | 'reaction_remove'
  | 'long_press'
  | 'swipe'
  | 'pull_to_refresh';

// Feedback configuration
interface FeedbackConfig {
  sound?: SoundEffect;
  haptic?: HapticType;
}

const FEEDBACK_MAP: Record<FeedbackEvent, FeedbackConfig> = {
  message_sent: { sound: 'message_sent', haptic: 'light' },
  message_received: { sound: 'message_received', haptic: 'medium' },
  message_read: { sound: 'message_read', haptic: 'light' },
  notification: { sound: 'notification', haptic: 'heavy' },
  typing: { sound: 'typing', haptic: 'light' },
  button_press: { sound: 'button_press', haptic: 'light' },
  tab_switch: { sound: 'tab_switch', haptic: 'selection' },
  modal_open: { sound: 'modal_open', haptic: 'medium' },
  modal_close: { sound: 'modal_close', haptic: 'light' },
  success: { sound: 'success', haptic: 'success' },
  error: { sound: 'error', haptic: 'error' },
  refresh: { sound: 'refresh', haptic: 'light' },
  reaction_add: { sound: 'reaction_add', haptic: 'light' },
  reaction_remove: { sound: 'reaction_remove', haptic: 'selection' },
  long_press: { haptic: 'medium' },
  swipe: { haptic: 'selection' },
  pull_to_refresh: { haptic: 'medium' },
};

interface FeedbackOptions {
  soundEnabled?: boolean;
  hapticEnabled?: boolean;
  soundVolume?: number;
  theme?: ThemeSoundscape;
}

class FeedbackService {
  private soundEnabled: boolean = true;
  private hapticEnabled: boolean = true;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await soundService.initialize();
    this.isInitialized = true;
  }

  configure(options: FeedbackOptions): void {
    if (options.soundEnabled !== undefined) {
      this.soundEnabled = options.soundEnabled;
      soundService.setEnabled(options.soundEnabled);
    }
    if (options.hapticEnabled !== undefined) {
      this.hapticEnabled = options.hapticEnabled;
      hapticsService.setEnabled(options.hapticEnabled);
    }
    if (options.soundVolume !== undefined) {
      soundService.setVolume(options.soundVolume);
    }
    if (options.theme !== undefined) {
      soundService.setTheme(options.theme);
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    soundService.setEnabled(enabled);
  }

  setHapticEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
    hapticsService.setEnabled(enabled);
  }

  setSoundVolume(volume: number): void {
    soundService.setVolume(volume);
  }

  setTheme(theme: ThemeSoundscape): void {
    soundService.setTheme(theme);
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  isHapticEnabled(): boolean {
    return this.hapticEnabled;
  }

  async trigger(event: FeedbackEvent): Promise<void> {
    const config = FEEDBACK_MAP[event];

    const promises: Promise<void>[] = [];

    if (config.sound && this.soundEnabled) {
      promises.push(soundService.play(config.sound));
    }

    if (config.haptic && this.hapticEnabled) {
      promises.push(hapticsService.trigger(config.haptic));
    }

    await Promise.all(promises);
  }

  // Quick methods for common events
  async messageSent(): Promise<void> {
    return this.trigger('message_sent');
  }

  async messageReceived(): Promise<void> {
    return this.trigger('message_received');
  }

  async messageRead(): Promise<void> {
    return this.trigger('message_read');
  }

  async notification(): Promise<void> {
    return this.trigger('notification');
  }

  async typing(): Promise<void> {
    return this.trigger('typing');
  }

  async buttonPress(): Promise<void> {
    return this.trigger('button_press');
  }

  async tabSwitch(): Promise<void> {
    return this.trigger('tab_switch');
  }

  async modalOpen(): Promise<void> {
    return this.trigger('modal_open');
  }

  async modalClose(): Promise<void> {
    return this.trigger('modal_close');
  }

  async success(): Promise<void> {
    return this.trigger('success');
  }

  async error(): Promise<void> {
    return this.trigger('error');
  }

  async refresh(): Promise<void> {
    return this.trigger('refresh');
  }

  async reactionAdd(): Promise<void> {
    return this.trigger('reaction_add');
  }

  async reactionRemove(): Promise<void> {
    return this.trigger('reaction_remove');
  }

  async longPress(): Promise<void> {
    return this.trigger('long_press');
  }

  async swipe(): Promise<void> {
    return this.trigger('swipe');
  }

  async pullToRefresh(): Promise<void> {
    return this.trigger('pull_to_refresh');
  }

  // Special patterns
  async celebrationFeedback(): Promise<void> {
    await this.trigger('success');
    await soundService.playSuccessMelody();
    await hapticsService.celebrationPattern();
  }

  async errorFeedback(): Promise<void> {
    await this.trigger('error');
    await hapticsService.errorPattern();
  }

  // Cleanup
  async dispose(): Promise<void> {
    await soundService.dispose();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();

// Export hook for React usage
export function useFeedback() {
  return {
    trigger: (event: FeedbackEvent) => feedbackService.trigger(event),
    messageSent: () => feedbackService.messageSent(),
    messageReceived: () => feedbackService.messageReceived(),
    notification: () => feedbackService.notification(),
    buttonPress: () => feedbackService.buttonPress(),
    tabSwitch: () => feedbackService.tabSwitch(),
    success: () => feedbackService.success(),
    error: () => feedbackService.error(),
    longPress: () => feedbackService.longPress(),
    configure: (options: FeedbackOptions) => feedbackService.configure(options),
    setSoundEnabled: (enabled: boolean) => feedbackService.setSoundEnabled(enabled),
    setHapticEnabled: (enabled: boolean) => feedbackService.setHapticEnabled(enabled),
    setTheme: (theme: ThemeSoundscape) => feedbackService.setTheme(theme),
  };
}

export default feedbackService;
