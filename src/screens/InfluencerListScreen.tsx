import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Searchbar, Button, FAB, Portal, Dialog, Paragraph, Chip, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Influencer, CATEGORIES } from '../types';
import InfluencerCard from '../components/InfluencerCard';
import useSync from '../hooks/useSync';

const InfluencerListScreen = () => {
  const navigation = useNavigation();
  const [influencers, setInfluencers, loading] = useSync<Influencer>('influencers');
  const [collaborations, setCollaborations] = useSync<any>('collaborations');
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });
  
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);
  
  const handleDelete = (id: string) => {
    Alert.alert(
      'Influencer Sil',
      'Bu influencer\'ı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => {
            const updatedInfluencers = influencers.filter(influencer => influencer.id !== id);
            setInfluencers(updatedInfluencers);
            
            // Also remove collaborations for this influencer
            const updatedCollaborations = collaborations.filter((collab: any) => collab.influencer_id !== id);
            setCollaborations(updatedCollaborations);
          }
        }
      ]
    );
  };
  
  const resetFilters = () => {
    setFilters({
      category: '',
      status: ''
    });
    setSearchTerm('');
    setFilterDialogVisible(false);
  };
  
  const filteredInfluencers = influencers.filter(influencer => {
    // Apply search term
    const matchesSearch = searchTerm === '' || 
      influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (influencer.category && influencer.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply filters
    const matchesCategory = filters.category === '' || influencer.category === filters.category;
    const matchesStatus = filters.status === '' || influencer.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const renderItem = ({ item }: { item: Influencer }) => (
    <InfluencerCard
      influencer={item}
      onPress={() => navigation.navigate('InfluencerProfile' as never, { id: item.id } as never)}
      onEdit={() => navigation.navigate('InfluencerForm' as never, { id: item.id } as never)}
      onDelete={() => handleDelete(item.id!)}
    />
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Ara..."
          onChangeText={setSearchTerm}
          value={searchTerm}
          style={styles.searchBar}
          iconColor="#e11d48"
        />
        <View style={styles.headerButtons}>
          <Button 
            mode="contained-tonal" 
            onPress={() => setFilterDialogVisible(true)}
            style={styles.filterButton}
            icon="filter-variant"
          >
            Filtrele
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('JobTracking' as never)}
            style={styles.jobButton}
            icon="briefcase"
          >
            İş Takibi
          </Button>
        </View>
      </View>
      
      {filters.category || filters.status ? (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>Aktif Filtreler:</Text>
          <View style={styles.chipContainer}>
            {filters.category && (
              <Chip 
                mode="outlined" 
                onClose={() => setFilters({...filters, category: ''})}
                style={styles.chip}
              >
                {filters.category}
              </Chip>
            )}
            {filters.status && (
              <Chip 
                mode="outlined" 
                onClose={() => setFilters({...filters, status: ''})}
                style={styles.chip}
              >
                {filters.status}
              </Chip>
            )}
          </View>
        </View>
      ) : null}
      
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text>Yükleniyor...</Text>
        </View>
      ) : filteredInfluencers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-off" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>Filtrelere uygun influencer bulunamadı.</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('InfluencerForm' as never)}
            style={styles.addButton}
            icon="plus"
          >
            Influencer Ekle
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredInfluencers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.list}
        />
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('InfluencerForm' as never)}
        color="#ffffff"
      />
      
      <Portal>
        <Dialog visible={filterDialogVisible} onDismiss={() => setFilterDialogVisible(false)}>
          <Dialog.Title>Filtreler</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.filterLabel}>Kategori</Text>
            <View style={styles.categoryFilters}>
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  filters.category === '' && styles.selectedCategory
                ]}
                onPress={() => setFilters({...filters, category: ''})}
              >
                <Text style={filters.category === '' ? styles.selectedCategoryText : styles.categoryItemText}>
                  Tümü
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryItem,
                    filters.category === category && styles.selectedCategory
                  ]}
                  onPress={() => setFilters({...filters, category})}
                >
                  <Text style={filters.category === category ? styles.selectedCategoryText : styles.categoryItemText}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.filterLabel}>Durum</Text>
            <View style={styles.statusFilters}>
              <TouchableOpacity
                style={[
                  styles.statusItem,
                  filters.status === '' && styles.selectedStatus
                ]}
                onPress={() => setFilters({...filters, status: ''})}
              >
                <Text style={filters.status === '' ? styles.selectedStatusText : styles.statusItemText}>
                  Tümü
                </Text>
              </TouchableOpacity>
              {['Beklemede', 'Onaylandı', 'Tamamlandı'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusItem,
                    filters.status === status && styles.selectedStatus
                  ]}
                  onPress={() => setFilters({...filters, status: status as any})}
                >
                  <Text style={filters.status === status ? styles.selectedStatusText : styles.statusItemText}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={resetFilters}>Temizle</Button>
            <Button onPress={() => setFilterDialogVisible(false)}>Tamam</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // gray-50
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // gray-100
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: '#f9fafb', // gray-50
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    marginRight: 8,
  },
  jobButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#e11d48', // rose-600
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#6b7280', // gray-500
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#e11d48', // rose-600
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#e11d48', // rose-600
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // gray-100
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#6b7280', // gray-500
    marginRight: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  categoryFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6', // gray-100
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#fecdd3', // rose-200
  },
  categoryItemText: {
    fontSize: 14,
    color: '#4b5563', // gray-600
  },
  selectedCategoryText: {
    fontSize: 14,
    color: '#9f1239', // rose-800
    fontWeight: '500',
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6', // gray-100
    marginRight: 8,
    marginBottom: 8,
  },
  selectedStatus: {
    backgroundColor: '#fecdd3', // rose-200
  },
  statusItemText: {
    fontSize: 14,
    color: '#4b5563', // gray-600
  },
  selectedStatusText: {
    fontSize: 14,
    color: '#9f1239', // rose-800
    fontWeight: '500',
   },
});

export default InfluencerListScreen;