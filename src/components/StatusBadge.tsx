import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS } from '../types';

interface StatusBadgeProps {
  status: 'Beklemede' | 'Onaylandı' | 'Tamamlandı';
  size?: 'small' | 'medium';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const colors = STATUS_COLORS[status];
  
  return (
    <View style={[
      styles.badge, 
      { backgroundColor: colors.background },
      size === 'small' ? styles.badgeSmall : styles.badgeMedium
    ]}>
      <Text style={[
        styles.text, 
        { color: colors.text },
        size === 'small' ? styles.textSmall : styles.textMedium
      ]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '500',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  }
});

export default StatusBadge;