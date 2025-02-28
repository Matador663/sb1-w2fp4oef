import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StatusBadge from './StatusBadge';
import { Influencer } from '../types';

interface InfluencerCardProps {
  influencer: Influencer;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const InfluencerCard: React.FC<InfluencerCardProps> = ({ 
  influencer, 
  onPress, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          {influencer.image ? (
            <Image 
              source={{ uri: influencer.image }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="account" size={24} color="#e11d48" />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.name}>{influencer.name}</Text>
            <Text style={styles.brand}>{influencer.brand}</Text>
          </View>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>İşbirliği Sayısı</Text>
            <Text style={styles.statValue}>{influencer.collaboration_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Ücret</Text>
            <Text style={styles.statValue}>{influencer.fee.toLocaleString('tr-TR')} ₺</Text>
          </View>
          <View style={styles.statItem}>
            <StatusBadge status={influencer.status} />
          </View>
        </View>
        
        {influencer.category && (
          <View style={styles.categoryContainer}>
            <View style={styles.category}>
              <Text style={styles.categoryText}>{influencer.category}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Icon name="eye" size={16} color="#e11d48" />
            <Text style={[styles.actionText, styles.viewText]}>Profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Icon name="pencil" size={16} color="#2563eb" />
            <Text style={[styles.actionText, styles.editText]}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Icon name="delete" size={16} color="#dc2626" />
            <Text style={[styles.actionText, styles.deleteText]}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fecdd3', // rose-200
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  brand: {
    fontSize: 14,
    color: '#6b7280', // gray-500
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280', // gray-500
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937', // gray-800
  },
  categoryContainer: {
    marginBottom: 16,
  },
  category: {
    backgroundColor: '#fecdd3', // rose-200
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#9f1239', // rose-800
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6', // gray-100
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  viewText: {
    color: '#e11d48', // rose-600
  },
  editText: {
    color: '#2563eb', // blue-600
  },
  deleteText: {
    color: '#dc2626', // red-600
  },
});

export default InfluencerCard;