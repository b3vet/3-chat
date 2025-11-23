import { Image } from 'expo-image';
import {
  Download,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Play,
  X,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface FileAttachmentProps {
  url: string;
  thumbUrl?: string | null;
  filename: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'voice_note' | string;
  contentType?: string;
  duration?: number | null;
  onPress?: () => void;
  onRemove?: () => void;
  onDownload?: () => void;
  compact?: boolean;
}

export function FileAttachment({
  url,
  thumbUrl,
  filename,
  fileType,
  duration,
  onPress,
  onRemove,
  onDownload,
  compact = false,
}: FileAttachmentProps) {
  const getFileIcon = () => {
    switch (fileType) {
      case 'image':
        return <FileImage size={compact ? 20 : 24} color="#6366f1" />;
      case 'video':
        return <FileVideo size={compact ? 20 : 24} color="#22c55e" />;
      case 'audio':
      case 'voice_note':
        return <FileAudio size={compact ? 20 : 24} color="#f59e0b" />;
      case 'document':
        return <FileText size={compact ? 20 : 24} color="#3b82f6" />;
      default:
        return <File size={compact ? 20 : 24} color="#888" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const truncateFilename = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop() || '';
    const base = name.slice(0, maxLength - ext.length - 4);
    return `${base}...${ext}`;
  };

  // Image/Video thumbnail preview
  if ((fileType === 'image' || fileType === 'video') && (thumbUrl || url)) {
    return (
      <Animated.View
        entering={ZoomIn}
        style={[styles.container, compact && styles.containerCompact]}
      >
        <Pressable onPress={onPress} style={styles.thumbnailContainer}>
          <Image
            source={{ uri: thumbUrl || url }}
            style={[styles.thumbnail, compact && styles.thumbnailCompact]}
            contentFit="cover"
          />

          {fileType === 'video' && (
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Play size={24} color="#fff" fill="#fff" />
              </View>
            </View>
          )}

          {onRemove && (
            <Pressable style={styles.removeButton} onPress={onRemove}>
              <X size={16} color="#fff" />
            </Pressable>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // Audio/Voice note player
  if (fileType === 'audio' || fileType === 'voice_note') {
    return (
      <Animated.View
        entering={FadeIn}
        style={[styles.audioContainer, compact && styles.audioContainerCompact]}
      >
        <Pressable onPress={onPress} style={styles.audioContent}>
          <View style={styles.audioIcon}>{getFileIcon()}</View>
          <View style={styles.audioInfo}>
            <Text style={styles.audioTitle} numberOfLines={1}>
              {fileType === 'voice_note' ? 'Voice message' : truncateFilename(filename)}
            </Text>
            {duration && <Text style={styles.audioDuration}>{formatDuration(duration)}</Text>}
          </View>
        </Pressable>

        {onRemove && (
          <Pressable style={styles.audioRemove} onPress={onRemove}>
            <X size={18} color="#888" />
          </Pressable>
        )}
      </Animated.View>
    );
  }

  // Document/File attachment
  return (
    <Animated.View
      entering={FadeIn}
      style={[styles.fileContainer, compact && styles.fileContainerCompact]}
    >
      <Pressable onPress={onPress} style={styles.fileContent}>
        <View style={styles.fileIcon}>{getFileIcon()}</View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {truncateFilename(filename)}
          </Text>
          <Text style={styles.fileType}>{fileType.toUpperCase()}</Text>
        </View>
      </Pressable>

      <View style={styles.fileActions}>
        {onDownload && (
          <Pressable style={styles.actionButton} onPress={onDownload}>
            <Download size={18} color="#6366f1" />
          </Pressable>
        )}
        {onRemove && (
          <Pressable style={styles.actionButton} onPress={onRemove}>
            <X size={18} color="#ef4444" />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  containerCompact: {
    width: 80,
    height: 80,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  thumbnailCompact: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  audioContainerCompact: {
    padding: 8,
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  audioIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  audioDuration: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  audioRemove: {
    padding: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  fileContainerCompact: {
    padding: 8,
  },
  fileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fileType: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});

export default FileAttachment;
