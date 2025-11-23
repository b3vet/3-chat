import { Image } from 'expo-image';
import * as ExpoImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { api, type MediaUploadResponse } from '@/services/api';

interface ImagePickerProps {
  onImageSelected: (media: MediaUploadResponse) => void;
  onCancel?: () => void;
  maxImages?: number;
}

export function ImagePicker({ onImageSelected, onCancel, maxImages = 1 }: ImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ExpoImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and media library permissions to use this feature.',
      );
      return false;
    }
    return true;
  };

  const pickImage = async (useCamera: boolean) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const options: ExpoImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: maxImages > 1,
      selectionLimit: maxImages,
    };

    let result: ExpoImagePicker.ImagePickerResult;

    if (useCamera) {
      result = await ExpoImagePicker.launchCameraAsync(options);
    } else {
      result = await ExpoImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets.length > 0) {
      await handleImageUpload(result.assets);
    }
  };

  const handleImageUpload = async (assets: ExpoImagePicker.ImagePickerAsset[]) => {
    setIsUploading(true);

    try {
      for (const asset of assets) {
        const filename = asset.uri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const response = await api.uploadMedia({
          uri: asset.uri,
          name: filename,
          type,
        });

        setSelectedImages((prev) => [...prev, response.url]);
        onImageSelected(response);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.optionButton}
          onPress={() => pickImage(true)}
          disabled={isUploading}
        >
          <Camera size={28} color="#6366f1" />
          <Text style={styles.optionText}>Camera</Text>
        </Pressable>

        <Pressable
          style={styles.optionButton}
          onPress={() => pickImage(false)}
          disabled={isUploading}
        >
          <ImageIcon size={28} color="#6366f1" />
          <Text style={styles.optionText}>Gallery</Text>
        </Pressable>

        {onCancel && (
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <X size={24} color="#888" />
          </Pressable>
        )}
      </View>

      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}

      {selectedImages.length > 0 && (
        <Animated.View entering={FadeIn} style={styles.previewContainer}>
          {selectedImages.map((uri, index) => (
            <Animated.View key={uri} entering={ZoomIn} style={styles.previewImageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />
              <Pressable style={styles.removeButton} onPress={() => removeImage(index)}>
                <X size={16} color="#fff" />
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    alignItems: 'center',
  },
  optionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    minWidth: 100,
  },
  optionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  cancelButton: {
    position: 'absolute',
    right: 0,
    top: -8,
    padding: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  previewImageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
});

export default ImagePicker;
