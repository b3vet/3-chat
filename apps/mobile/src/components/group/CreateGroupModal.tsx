import { useSetAtom } from 'jotai';
import { Users, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, type Group as ApiGroup } from '@/services/api';
import { addGroupAtom } from '@/stores/chatStore';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (groupId: string) => void;
}

export function CreateGroupModal({ visible, onClose, onCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const addGroup = useSetAtom(addGroupAtom);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (name.length < 3) {
      Alert.alert('Error', 'Group name must be at least 3 characters');
      return;
    }

    setIsCreating(true);

    try {
      const response = await api.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      const group = (response as { group: ApiGroup }).group;
      addGroup({
        id: group.id,
        name: group.name,
        description: group.description,
        iconUrl: group.icon_url,
        creatorId: group.creator_id,
        memberCount: 1,
      });

      setName('');
      setDescription('');
      onClose();
      onCreated?.(group.id);
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View entering={SlideInDown.springify().damping(15)} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Group</Text>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#888" />
            </Pressable>
          </View>

          <View style={styles.iconContainer}>
            <View style={styles.groupIcon}>
              <Users size={40} color="#6366f1" />
            </View>
            <Text style={styles.iconHint}>Tap to add group icon</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Group Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter group name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                maxLength={50}
                autoFocus
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter group description (optional)"
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                maxLength={200}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.charCount}>{description.length}/200</Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.createButton,
              (!name.trim() || isCreating) && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Group</Text>
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  groupIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconHint: {
    color: '#888',
    fontSize: 12,
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
  },
  createButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGroupModal;
