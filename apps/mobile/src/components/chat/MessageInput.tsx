import { Mic, Paperclip, Send } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onAttachPress?: () => void;
  onVoicePress?: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MessageInput = memo(function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  onAttachPress,
  onVoicePress,
  disabled,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const sendButtonScale = useSharedValue(1);

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(sendButtonScale.value, { damping: 15 }) }],
  }));

  const handleTextChange = useCallback(
    (text: string) => {
      const wasEmpty = message.length === 0;
      const isEmpty = text.length === 0;

      setMessage(text);

      if (wasEmpty && !isEmpty) {
        onTypingStart?.();
      } else if (!wasEmpty && isEmpty) {
        onTypingStop?.();
      }
    },
    [message.length, onTypingStart, onTypingStop],
  );

  const handleSend = useCallback(() => {
    if (!message.trim() || disabled) return;

    sendButtonScale.value = 0.8;
    setTimeout(() => {
      sendButtonScale.value = 1;
    }, 100);

    onSend(message.trim());
    setMessage('');
    onTypingStop?.();
  }, [message, disabled, sendButtonScale, onSend, onTypingStop]);

  const hasText = message.trim().length > 0;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.attachButton}
        onPress={onAttachPress}
        disabled={disabled}
        hitSlop={8}
      >
        <Paperclip size={22} color="#888" />
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Message"
        placeholderTextColor="#666"
        value={message}
        onChangeText={handleTextChange}
        multiline
        maxLength={4000}
        editable={!disabled}
      />

      {hasText ? (
        <AnimatedPressable
          style={[styles.sendButton, sendButtonStyle]}
          onPress={handleSend}
          disabled={disabled}
          hitSlop={8}
        >
          <Send size={22} color="#fff" />
        </AnimatedPressable>
      ) : (
        <Pressable style={styles.micButton} onPress={onVoicePress} disabled={disabled} hitSlop={8}>
          <Mic size={22} color="#888" />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#000',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    padding: 8,
  },
});

export default MessageInput;
