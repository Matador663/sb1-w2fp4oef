import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, Button, Searchbar, Menu, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Collaboration, TEAM_MEMBERS } from '../types';
import StatusBadge from '../components/StatusBadge';
import useSync from '../hooks/useSync';
import * as XLSX from 'xlsx';

const JobTrackingScreen = () => {
  const navigation = useNavigation();
  const [collaborations, setCollaborations, loading] = useSync<Collaboration>('collaborations');
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    brand: '',
    influencer: ''
  });
  
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [assignedMenuVisible, setAssignedMenuVisible] = useState(false);
  const [brandMenuVisible, setBrandMenuVisible] = useState(false);
  const [influencerMenuVisible, setInfluencerMenuVisible] = useState(false);
  
  const resetFilters = () => {
    setFilters({
      status: '',
      assignedTo: '',
      brand: '',
      influencer: ''
    });
    setSearchTerm('');
  };
  
  const exportToExcel = () => {
    try {
      // Create a worksheet from the filtered data
      const worksheet = XLSX.utils.json_to_sheet(
        filteredCollaborations.map(collab => ({
          Marka: collab.brand,
          Influencer: collab.influencer_name || '',
          Tarih: new Date(collab.date).toLocaleDateString('tr-TR'),
          'Ücret (₺)': collab.fee,
          'İşbirliği Sayısı': collab.collaboration_count,
          'Atanan Kişi': collab.assigned_to,
          Durum: collab.status
        }))
      );
      
      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'İşbirliği Listesi');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `İşbirliği_Listesi_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      Alert.alert('Başarılı', 'Excel dosyası başarıyla indirildi');
    } catch (error) {
      Alert.alert('Hata', 'Excel dosyası oluşturulurken bir hata oluştu');
    }
  };
  
  const filteredCollaborations = collaborations.filter(collab => {
    // Apply search term
    const matchesSearch = searchTerm === '' || 
      collab.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collab.influencer_name && collab.influencer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply filters
    const matchesStatus = filters.status === '' || collab.status === filters.status;
    const matchesAssignedTo = filters.assignedTo === '' || collab.assigned_to === filters.assignedTo;
    const matchesBrand = filters.brand === '' || collab.brand === filters.brand;
    const matchesInfluencer = filters.influencer === '' || collab.influencer_name === filters.influencer;
    
    return matchesSearch && matchesStatus && matchesAssignedTo && matchesBrand && matchesInfluencer;
  });
  
  // Get unique brands for filter dropdown
  const uniqueBrands = Array.from(new Set(collaborations.map(c => c.brand)));
  
  // Get unique influencers for filter dropdown
  const uniqueInfluencers = Array.from(new Set(collaborations.map(c => c.influencer_name).filter(Boolean)));
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }
  
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
            onPress={exportToExcel}
            style={styles.exportButton}
            icon="file-excel"
          >
            Excel'e Aktar
          </Button>
        </View>
      </View>
      
      {(filters.status || filters.assignedTo || filters.brand || filters.influencer) ? (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>Aktif Filtreler:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {filters.status && (
              <Chip 
                mode="outlined" 
                onClose={() => setFilters({...filters, status: ''})}
                style={styles.chip}
              >
                {filters.status}
              </Chip>
            )}
            {filters.assignedTo && (
              <Chip 
                mode="outlined" 
                onClose={() => setFilters({...filters, assignedTo: ''})}
                style={styles.chip}
              >
                {filters.assignedTo}
              </Chip>
            )}
            {filters.brand && (
              <Chip 
                mode="outlined" 
                onClose={() => setFilters({...filters, brand: ''})}
                style={styles.chip}
              >
                {filters.brand}
              </Chip>
            )}
            {filters.influencer && (
              <Chip 
                mode="outlined" 
                onClose={() => setFilters({...filters, influencer: ''})}
                style={styles.chip}
              >
                {filters.influencer}
              </Chip>
            )}
          </ScrollView>
        </View>
      ) : null}
      
      <ScrollView style={styles.content}>
        {filteredCollaborations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="file-search" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Filtrelere uygun sonuç bulunamadı.</Text>
            <Button 
              mode="outlined" 
              onPress={resetFilters}
              style={styles.resetButton}
            >
              Filtreleri Temizle
            </Button>
          </View>
        ) : (
          <>
            {filteredCollaborations.map((collab) => (
              <Card key={collab.id} style={styles.collaborationCard}>
                <Card.Content>
                  <View style={styles.collaborationHeader}>
                    <View>
                      <Text style={styles.brandText}>{collab.brand}</Text>
                      {collab.influencer_name && (
                        <TouchableOpacity 
                          onPress={() => collab.influencer_id && 
                            navigation.navigate('InfluencerProfile' as never, { id: collab.influencer_id } as never)
                          }
                          style={styles.influencerLink}
                        >
                          <Text style={styles.influencerText}>{collab.influencer_name}</Text>
                          <Icon name="link" size={14} color="#e11d48" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <StatusBadge status={collab.status} />
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  <View style={styles.collaborationDetails}>
                    <View style={styles.detailItem}>
                      <Icon name="calendar" size={16} color="#6b7280" style={styles.detailIcon} />
                      <Text style={styles.detailText}>
                        {new Date(collab.date).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Icon name="currency-try" size={16} color="#6b7280" style={styles.detailIcon} />
                      <Text style={styles.detailText}>
                        {collab.fee.toLocaleString('tr-TR')} ₺
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Icon name="repeat" size={16} color="#6b7280" style={styles.detailIcon} />
                      <Text style={styles.detailText}>
                        {collab.collaboration_count} işbirliği
                      </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Icon name="account" size={16} color="#6b7280" style={styles.detailIcon} />
                      <Text style={styles.detailText}>
                        {collab.assigned_to}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
            
            <Text style={styles.resultCount}>
              Toplam {filteredCollaborations.length} işbirliği gösteriliyor
            </Text>
          </>
        )}
      </ScrollView>
      
      {/* Filter Dialog */}
      <Menu
        visible={filterDialogVisible}
        onDismiss={() => setFilterDialogVisible(false)}
        style={styles.filterMenu}
        anchor={{ x: 0, y: 0 }}
      >
        <View style={styles.filterMenuContent}>
          <View style={styles.filterMenuHeader}>
            <Text style={styles.filterMenuTitle}>Filtreler</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetFiltersText}>Temizle</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Durum</Text>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setStatusMenuVisible(true)}
                  style={styles.filterSelectButton}
                >
                  {filters.status || 'Tümü'}
                </Button>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setFilters({...filters, status: ''});
                  setStatusMenuVisible(false);
                }} 
                title="Tümü" 
              />
              <Menu.Item 
                onPress={() => {
                  setFilters({...filters, status: 'Beklemede'});
                  setStatusMenuVisible(false);
                }} 
                title="Beklemede" 
              />
              <Menu.Item 
                onPress={() => {
                  setFilters({...filters, status: 'Onaylandı'});
                  setStatusMenuVisible(false);
                }} 
                title="Onaylandı" 
              />
              <Menu.Item 
                onPress={() => {
                  setFilters({...filters, status: 'Tamamlandı'});
                  setStatusMenuVisible(false);
                }} 
                title="Tamamlandı" 
              />
            </Menu>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Atanan Kişi</Text>
            <Menu
              visible={assignedMenuVisible}
              onDismiss={() => setAssignedMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setAssignedMenuVisible(true)}
                  style={styles.filterSelectButton}
                >
                  {filters.assignedTo || 'Tümü'}
                </Button>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setFilters({...filters, assignedTo: ''});
                  setAssignedMenuVisible(false);
                }} 
                title="Tümü" 
              />
              {TEAM_MEMBERS.map(member => (
                <Menu.Item 
                  key={member}
                  onPress={() => {
                    setFilters({...filters, assignedTo: member});
                    setAssignedMenuVisible(false);
                  }} 
                  title={member} 
                />
              ))}
            </Menu>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Marka</Text>
            <Menu
              visible={brandMenuVisible}
              onDismiss={() => setBrandMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setBrandMenuVisible(true)}
                  style={styles.filterSelectButton}
                >
                  {filters.brand || 'Tümü'}
                </Button>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setFilters({...filters, brand: ''});
                  setBrandMenuVisible(false);
                }} 
                title="Tümü" 
              />
              {uniqueBrands.map(brand => (
                <Menu.Item 
                  key={brand}
                  onPress={() => {
                    setFilters({...filters, brand});
                    setBrandMenuVisible(false);
                  }} 
                  title={brand} 
                />
              ))}
            </Menu>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Influencer</Text>
            <Menu
              visible={influencerMenuVisible}
              onDismiss={() => setInfluencerMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setInfluencerMenuVisible(true)}
                  style={styles.filterSelectButton}
                >
                  {filters.influencer || 'Tümü'}
                </Button>
              }
            >
              <Menu.Item 
                onPress={() => {
                  setFilters({...filters, influencer: ''});
                  setInfluencerMenuVisible(false);
                }} 
                title="Tümü" 
              />
              {uniqueInfluencers.map(influencer => (
                <Menu.Item 
                  key={influencer}
                  onPress={() => {
                    setFilters({...filters, influencer});
                    setInfluencerMenuVisible(false);
                  }} 
                  title={influencer || ''} 
                />
              ))}
            </Menu>
          </View>
          
          <Button 
            mode="contained" 
            onPress={() => setFilterDialogVisible(false)}
            style={styles.applyFiltersButton}
          >
            Filtreleri Uygula
          </Button>
        </View>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // gray-50
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  exportButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#16a34a', // green-600
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
  filtersScroll: {
    flex: 1,
  },
  chip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#6b7280', // gray-500
    textAlign: 'center',
  },
  resetButton: {
    borderColor: '#e11d48', // rose-600
    color: '#e11d48', // rose-600
  },
  collaborationCard: {
    marginBottom: 16,
  },
  collaborationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  influencerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  influencerText: {
    fontSize: 14,
    color: '#e11d48', // rose-600
    marginRight: 4,
  },
  divider: {
    marginBottom: 12,
  },
  collaborationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563', // gray-600
  },
  resultCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6b7280', // gray-500
    marginTop: 8,
    marginBottom: 24,
  },
  filterMenu: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  filterMenuContent: {
    padding: 16,
  },
  filterMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetFiltersText: {
    color: '#e11d48', // rose-600
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  filterSelectButton: {
    width: '100%',
  },
  applyFiltersButton: {
    marginTop: 8,
    backgroundColor: '#e11d48', // rose-600
  },
});

export default JobTrackingScreen;