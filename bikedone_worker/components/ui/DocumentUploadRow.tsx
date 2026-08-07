import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface DocumentUploadRowProps {
  title: string;
  uploaded: boolean;
  onToggleUpload: () => void;
  avatarUri?: string | null;
}

export const DocumentUploadRow: React.FC<DocumentUploadRowProps> = ({
  title,
  uploaded,
  onToggleUpload,
  avatarUri,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {uploaded ? (
        <View style={styles.uploadedState}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
          ) : null}
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          </View>
          <TouchableOpacity onPress={onToggleUpload} style={styles.reuploadBtn}>
            <Ionicons name="create-outline" size={18} color={Colors.gray500} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleUpload}
          style={styles.uploadBtn}
        >
          <Text style={styles.uploadBtnText}>Upload</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.cardBackground,
    marginBottom: 12,
  },
  leftCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  uploadBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  uploadedState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPreview: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  successBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reuploadBtn: {
    padding: 4,
  },
});
