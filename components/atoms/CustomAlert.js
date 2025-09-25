import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/typography';
import { shadow } from '../../theme/shadows';

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  onClose,
  onConfirm,
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel'
}) {
  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return '#FF9800';
      default: return colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, shadow.modal]}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.gradient}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={getIcon()} 
                size={48} 
                color={getColor()} 
              />
            </View>
            
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            <View style={styles.buttonContainer}>
              {showCancel && (
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton, { backgroundColor: getColor() }]} 
                onPress={onConfirm || onClose}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: fontSizes.md,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
