import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import CustomAlert from './CustomAlert';
import LoadingSpinner from './LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/clerk-expo';

const SignOutButton = ({ style, textStyle, showIcon = true, onSignOut }) => {
  const { signOut } = useClerk();
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', showCancel: false });
  const [loading, setLoading] = useState(false);
  
  const showAlert = (title, message, type = 'info', showCancel = false) => {
    setAlert({ visible: true, title, message, type, showCancel });
  };
  
  const hideAlert = () => {
    setAlert({ visible: false, title: '', message: '', type: 'info', showCancel: false });
  };

  const handleSignOut = () => {
    showAlert('Sign Out', 'Are you sure you want to sign out?', 'warning', true);
  };
  
  const confirmSignOut = async () => {
    setLoading(true);
    // Close the confirmation dialog while processing
    hideAlert();
    try {
      await signOut();
      if (onSignOut) onSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      showAlert('Error', 'Could not sign out. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={[{
          backgroundColor: '#FF6F61',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          shadowColor: '#FF6F61',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }, style, loading && { opacity: 0.7 }]}
        onPress={handleSignOut}
        disabled={loading}
        accessibilityLabel="Sign out"
      >
        {loading ? (
          <LoadingSpinner size={18} color="#fff" />
        ) : (
          <>
            {showIcon && <Ionicons name="log-out-outline" size={18} color="#fff" style={{ marginRight: 8 }} />}
            <Text style={[{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
            }, textStyle]}>
              Sign Out
            </Text>
          </>
        )}
      </TouchableOpacity>
      
      <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type}
        onClose={hideAlert}
        showCancel={alert.showCancel}
        cancelText="Cancel"
        confirmText="Sign Out"
        onConfirm={alert.showCancel ? confirmSignOut : hideAlert}
      />
    </>
  );
};

export default SignOutButton;
