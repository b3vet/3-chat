import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { Download, Share2, X, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface MediaViewerProps {
  visible: boolean;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function MediaViewer({
  visible,
  mediaUrl,
  mediaType,
  onClose,
  onDownload,
  onShare,
}: MediaViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleClose = () => {
    // Reset transforms
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    onClose();
  };

  const zoomIn = () => {
    const newScale = Math.min(savedScale.value + 0.5, 4);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
  };

  const zoomOut = () => {
    const newScale = Math.max(savedScale.value - 0.5, 1);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
    if (newScale === 1) {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleClose}>
            <X size={24} color="#fff" />
          </Pressable>

          <View style={styles.headerActions}>
            {mediaType === 'image' && (
              <>
                <Pressable style={styles.headerButton} onPress={zoomOut}>
                  <ZoomOut size={24} color="#fff" />
                </Pressable>
                <Pressable style={styles.headerButton} onPress={zoomIn}>
                  <ZoomIn size={24} color="#fff" />
                </Pressable>
              </>
            )}
            {onShare && (
              <Pressable style={styles.headerButton} onPress={onShare}>
                <Share2 size={24} color="#fff" />
              </Pressable>
            )}
            {onDownload && (
              <Pressable style={styles.headerButton} onPress={onDownload}>
                <Download size={24} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>

        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.mediaContainer, animatedStyle]}>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
              </View>
            )}

            {mediaType === 'image' ? (
              <Image
                source={{ uri: mediaUrl }}
                style={styles.image}
                contentFit="contain"
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
              />
            ) : (
              <Video
                ref={videoRef}
                source={{ uri: mediaUrl }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
              />
            )}
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <Text style={styles.hintText}>
            {mediaType === 'image' ? 'Pinch to zoom • Double tap to zoom' : ''}
          </Text>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  hintText: {
    color: '#888',
    fontSize: 12,
  },
});

export default MediaViewer;
