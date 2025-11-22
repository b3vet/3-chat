import { Audio } from 'expo-av';
import { Mic, Pause, Play, Send, Square, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { api, type VoiceNoteUploadResponse } from '@/services/api';

interface VoiceRecorderProps {
  onRecordingComplete: (media: VoiceNoteUploadResponse) => void;
  onCancel?: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulseScale = useSharedValue(1);
  const waveformHeight = useSharedValue(0.3);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant microphone permission to record voice notes.',
      );
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);

      // Start pulse animation
      pulseScale.value = withRepeat(
        withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );

      // Start waveform animation
      waveformHeight.value = withRepeat(
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );

      // Update duration
      durationInterval.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      cancelAnimation(pulseScale);
      cancelAnimation(waveformHeight);
      pulseScale.value = withSpring(1);
      waveformHeight.value = 0.3;

      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setRecordingUri(uri);
      setIsRecording(false);
      setIsPreviewing(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const cancelRecording = async () => {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }

    cancelAnimation(pulseScale);
    cancelAnimation(waveformHeight);

    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }

    setIsRecording(false);
    setIsPreviewing(false);
    setRecordingUri(null);
    setDuration(0);
    onCancel?.();
  };

  const playPreview = async () => {
    if (!recordingUri) return;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        },
      );

      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play preview:', error);
    }
  };

  const pausePreview = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const sendRecording = async () => {
    if (!recordingUri) return;

    setIsUploading(true);

    try {
      const filename = `voice_${Date.now()}.m4a`;
      const response = await api.uploadVoiceNote(
        {
          uri: recordingUri,
          name: filename,
          type: 'audio/m4a',
        },
        duration,
      );

      onRecordingComplete(response);
      setIsPreviewing(false);
      setRecordingUri(null);
      setDuration(0);
    } catch (error) {
      console.error('Failed to upload voice note:', error);
      Alert.alert('Upload Failed', 'Failed to send voice note. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const waveformStyle = useAnimatedStyle(() => ({
    height: `${waveformHeight.value * 100}%`,
  }));

  if (isPreviewing) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <Pressable style={styles.cancelButton} onPress={cancelRecording}>
            <X size={24} color="#ef4444" />
          </Pressable>

          <View style={styles.previewInfo}>
            <Pressable style={styles.playButton} onPress={isPlaying ? pausePreview : playPreview}>
              {isPlaying ? <Pause size={24} color="#fff" /> : <Play size={24} color="#fff" />}
            </Pressable>
            <Text style={styles.duration}>{formatDuration(duration)}</Text>
          </View>

          <Pressable
            style={[styles.sendButton, isUploading && styles.buttonDisabled]}
            onPress={sendRecording}
            disabled={isUploading}
          >
            <Send size={24} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.recordingContainer}>
        {isRecording && (
          <>
            <Pressable style={styles.cancelButton} onPress={cancelRecording}>
              <X size={24} color="#ef4444" />
            </Pressable>

            <View style={styles.waveformContainer}>
              {[...Array(5)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[styles.waveformBar, waveformStyle, { opacity: 0.5 + i * 0.1 }]}
                />
              ))}
            </View>

            <Text style={styles.duration}>{formatDuration(duration)}</Text>
          </>
        )}

        <Animated.View style={[styles.recordButtonOuter, isRecording && pulseStyle]}>
          <Pressable
            style={[styles.recordButton, isRecording && styles.recordingActive]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <Square size={24} color="#fff" fill="#fff" />
            ) : (
              <Mic size={28} color="#fff" />
            )}
          </Pressable>
        </Animated.View>

        {!isRecording && <Text style={styles.hintText}>Tap to record</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 8,
    paddingHorizontal: 12,
  },
  recordButtonOuter: {
    borderRadius: 32,
    padding: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#dc2626',
  },
  cancelButton: {
    padding: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  previewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginHorizontal: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duration: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#ef4444',
    borderRadius: 2,
  },
  hintText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
});

export default VoiceRecorder;
