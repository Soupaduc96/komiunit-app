import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '@/constants/theme';

export interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  editable?: boolean;
  uploading?: boolean;
  onPress?: () => void;
  isDark?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 80,
  editable = false,
  uploading = false,
  onPress,
  isDark = false,
}) => {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('')
    : '?';

  const styles = StyleSheet.create({
    wrapper: {
      position: 'relative',
      alignSelf: 'center',
    },
    circle: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    initials: {
      color: 'white',
      fontWeight: '700',
      fontSize: size * 0.36,
    },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: size * 0.32,
      height: size * 0.32,
      borderRadius: (size * 0.32) / 2,
      backgroundColor: '#007AFF',
      borderWidth: 2,
      borderColor: isDark ? Colors.dark.background : Colors.light.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editBadgeText: {
      fontSize: size * 0.15,
      color: 'white',
    },
    uploadOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      borderRadius: size / 2,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const inner = (
    <View style={styles.circle}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.initials}>{initials}</Text>
      )}
      {uploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator color="white" size="small" />
        </View>
      )}
    </View>
  );

  if (!editable) return <View style={styles.wrapper}>{inner}</View>;

  return (
    <Pressable
      style={styles.wrapper}
      onPress={onPress}
      disabled={uploading}
      android_ripple={null}
    >
      {inner}
      {!uploading && (
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>✎</Text>
        </View>
      )}
    </Pressable>
  );
};
