import * as Haptics from 'expo-haptics';

// Haptic feedback types
export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

class HapticsService {
  private enabled: boolean = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async trigger(type: HapticType = 'light'): Promise<void> {
    if (!this.enabled) return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
      }
    } catch {
      // Silently fail - haptics might not be available on all devices
    }
  }

  // Quick methods for common interactions
  async light(): Promise<void> {
    return this.trigger('light');
  }

  async medium(): Promise<void> {
    return this.trigger('medium');
  }

  async heavy(): Promise<void> {
    return this.trigger('heavy');
  }

  async success(): Promise<void> {
    return this.trigger('success');
  }

  async warning(): Promise<void> {
    return this.trigger('warning');
  }

  async error(): Promise<void> {
    return this.trigger('error');
  }

  async selection(): Promise<void> {
    return this.trigger('selection');
  }

  // Message-specific haptics
  async messageSent(): Promise<void> {
    return this.trigger('light');
  }

  async messageReceived(): Promise<void> {
    return this.trigger('medium');
  }

  async notification(): Promise<void> {
    return this.trigger('heavy');
  }

  async buttonPress(): Promise<void> {
    return this.trigger('light');
  }

  async tabSwitch(): Promise<void> {
    return this.trigger('selection');
  }

  async longPress(): Promise<void> {
    return this.trigger('medium');
  }

  async reactionAdd(): Promise<void> {
    return this.trigger('light');
  }

  // Pattern haptics for special events
  async celebrationPattern(): Promise<void> {
    if (!this.enabled) return;

    await this.trigger('success');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await this.trigger('light');
    await new Promise((resolve) => setTimeout(resolve, 50));
    await this.trigger('light');
  }

  async errorPattern(): Promise<void> {
    if (!this.enabled) return;

    await this.trigger('error');
    await new Promise((resolve) => setTimeout(resolve, 150));
    await this.trigger('medium');
  }

  async typingPattern(): Promise<void> {
    if (!this.enabled) return;

    await this.trigger('light');
  }
}

// Export singleton instance
export const hapticsService = new HapticsService();

// Export hook for React usage
export function useHaptics() {
  return {
    trigger: (type: HapticType) => hapticsService.trigger(type),
    light: () => hapticsService.light(),
    medium: () => hapticsService.medium(),
    heavy: () => hapticsService.heavy(),
    success: () => hapticsService.success(),
    warning: () => hapticsService.warning(),
    error: () => hapticsService.error(),
    selection: () => hapticsService.selection(),
    messageSent: () => hapticsService.messageSent(),
    messageReceived: () => hapticsService.messageReceived(),
    buttonPress: () => hapticsService.buttonPress(),
    tabSwitch: () => hapticsService.tabSwitch(),
    setEnabled: (enabled: boolean) => hapticsService.setEnabled(enabled),
  };
}

export default hapticsService;
