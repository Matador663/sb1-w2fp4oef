import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, Button, Divider, Menu, TextInput, FAB, Dialog, Portal } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Influencer, Collaboration, TEAM_MEMBERS, CATEGORIES, STATUS_COLORS } from '../types';
import StatusBadge from '../components/StatusBadge';
import useSync from '../hooks/useSync';

const InfluencerProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  
  const [influencers, setInfluencers, loadingInfluencers] = useSync<Influencer>('influencers');
  const [allCollaborations, setAllCollaborations, loadingCollaborations] = useSync<Collaboration>('collaborations');
  
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  
  // For editing collaborations
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Collaboration | null>(null);
  
  // For editing category
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState<boolean>(false);
  
  // For adding new collaboration
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newCollaboration, setNewCollaboration] = useState<Omit<Collaboration, 'id'>>({
    brand: '',
    date: new Date().toISOString().split('T')[0],
    fee: 0,
    collaboration_count: 1,
    assigned_to: TEAM_MEMBERS[0],
    status: 'Beklemede'
  });
  
  // For collaboration dialogs
  const [editDialogVisible, setEditDialogVisible] = useState<boolean>(false);
  const [addDialogVisible, setAddDialogVisible] = useState<boolean>(false);
  const [editStatusMenuVisible, setEditStatusMenuVisible] = useState<boolean>(false);
  const [editAssignedMenuVisible, setEditAssignedMenuVisible] = useState<boolean>(false);
  const [addStatusMenuVisible, setAddStatusMenuVisible] = useState<boolean>(false);
  const [addAssignedMenuVisible, setAddAssignedMenuVisible] = useState<boolean>(false);

  useEffect(() => {
    if (influencers.length > 0 && id) {
      const foundInfluencer = influencers.find((inf: Influencer) => inf.id === id);
      
      if (foundInfluencer) {
        setInfluencer(foundInfluencer);
        setSelectedCategory(foundInfluencer.category || '');
        
        // Filter collaborations for this influencer
        const influencerCollaborations = allCollaborations.filter(
          (collab: Collaboration) => collab.influencer_id === id
        );
        setCollaborations(influencerCollaborations);
      } else {
        Alert.alert('Hata', 'Influencer bulunamadı');
        navigation.goBack();
      }
    }
  }, [id, influencers, allCollaborations, navigation]);

  const handleEditClick = (collab: Collaboration) => {
    setEditingId(collab.id);
    setEditForm({ ...collab });
    setEditDialogVisible(true);
  };

  const handleEditChange = (field: string, value: string | number) => {
    if (!editForm) return;
    
    setEditForm({
      ...editForm,
      [field]: field === 'fee' || field === 'collaboration_count' ? Number(value) : value
    });
  };

  const handleEditSave = async () => {
    if (!editForm) return;
    
    try {
      // Update in all collaborations
      const updatedCollaborations = allCollaborations.map(c => 
        c.id === editForm.id ? editForm : c
      );
      
      // Update through sync hook
      await setAllCollaborations(updatedCollaborations);
      
      // Update local state
      setCollaborations(collaborations.map(c => 
        c.id === editForm.id ? editForm : c
      ));
      
      setEditingId(null);
      setEditForm(null);
      setEditDialogVisible(false);
      
      Alert.alert('Başarılı', 'İşbirliği başarıyla güncellendi');
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleNewCollabChange = (field: string, value: string | number) => {
    setNewCollaboration({
      ...newCollaboration,
      [field]: field === 'fee' || field === 'collaboration_count' ? Number(value) : value
    });
  };

  const handleAddCollaboration = async () => {
    if (!influencer) return;
    
    try {
      // Generate new ID
      const newId = (allCollaborations.length + 1).toString();
      
      // Create new collaboration
      const newCollab = {
        id: newId,
        ...newCollaboration,
        influencer_id: influencer.id,
        influencer_name: influencer.name
      };
      
      // Update all collaborations through sync hook
      await setAllCollaborations([...allCollaborations, newCollab]);
      
      // Update local state
      setCollaborations([...collaborations, newCollab]);
      
      // Reset form
      setIsAddingNew(false);
      setAddDialogVisible(false);
      setNewCollaboration({
        brand: '',
        date: new Date().toISOString().split('T')[0],
        fee: 0,
        collaboration_count: 1,
        assigned_to: TEAM_MEMBERS[0],
        status: 'Beklemede'
      });
      
      // Update influencer collaboration count
      if (influencer) {
        const updatedInfluencer = {
          ...influencer,
          collaboration_count: influencer.collaboration_count + 1
        };
        
        // Update local state
        setInfluencer(updatedInfluencer);
        
        // Update in all influencers through sync hook
        const updatedInfluencers = influencers.map((inf: Influencer) => 
          inf.id === influencer.id ? updatedInfluencer : inf
        );
        
        await setInfluencers(updatedInfluencers);
      }
      
      Alert.alert('Başarılı', 'Yeni işbirliği başarıyla eklendi');
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDeleteCollaboration = (id: string) => {
    Alert.alert(
      'İşbirliği Sil',
      'Bu işbirliğini silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Update all collaborations through sync hook
              const updatedCollaborations = allCollaborations.filter(c => c.id !== id);
              await setAllCollaborations(updatedCollaborations);
              
              // Update local state
              const filteredCollaborations = collaborations.filter(c => c.id !== id);
              setCollaborations(filteredCollaborations);
              
              // Update influencer collaboration count
              if (influencer) {
                const updatedInfluencer = {
                  ...influencer,
                  collaboration_count: Math.max(0, influencer.collaboration_count - 1)
                };
                
                // Update local state
                setInfluencer(updatedInfluencer);
                
                // Update in all influencers through sync hook
                const updatedInfluencers = influencers.map((inf: Influencer) => 
                  inf.id === influencer.id ? updatedInfluencer : inf
                );
                
                await setInfluencers(updatedInfluencers);
              }
              
              Alert.alert('Başarılı', 'İşbirliği başarıyla silindi');
            } catch (error) {
              Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
          }
        }
      ]
    );
  };

  const saveCategory = async () => {
    if (influencer) {
      try {
        const updatedInfluencer = {
          ...influencer,
          category: selectedCategory
        };
        
        // Update local state
        setInfluencer(updatedInfluencer);
        
        // Update in all influencers through sync hook
        const updatedInfluencers = influencers.map((inf: Influencer) => 
          inf.id === influencer.id ? updatedInfluencer : inf
        );
        
        await setInfluencers(updatedInfluencers);
        
        setIsEditingCategory(false);
        Alert.alert('Başarılı', 'Kategori başarıyla güncellendi');
      } catch (error) {
        Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const openContactMethod = (type: string, value: string) => {
    let url = '';
    
    switch (type) {
      case 'phone':
        url = `tel:${value}`;
        break;
      case 'email':
        url = `mailto:${value}`;
        break;
      case 'instagram':
        url = `https://instagram.com/${value}`;
        break;
      case 'tiktok':
        url = `https://tiktok.com/@${value}`;
        break;
    }
    
    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Hata', `${url} açılamıyor`);
        }
      });
    }
  };

  if (loadingInfluencers || loadingCollaborations) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!influencer) {
    return (
      <View style={styles.errorContainer}>
        <Text>Influencer bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          <View style={styles.profileContainer}>
            {influencer.image ? (
              <View style={styles.avatarContainer}>
                <img 
                  src={influencer.image} 
                  alt={influencer.name} 
                  style={styles.avatar}
                />
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account" size={64} color="#e11d48" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{influencer.name}</Text>
              <Text style={styles.brand}>{influencer.brand}</Text>
              
              <View style={styles.categoryContainer}>
                <Icon name="tag" size={16} color="#e11d48" style={styles.categoryIcon} />
                
                {isEditingCategory ? (
                  <View style={styles.categoryEditContainer}>
                    <Menu
                      visible={categoryMenuVisible}
                      onDismiss={() => setCategoryMenuVisible(false)}
                      anchor={
                        <Button 
                          mode="outlined" 
                          onPress={() => setCategoryMenuVisible(true)}
                          style={styles.categoryButton}
                          labelStyle={styles.categoryButtonLabel}
                        >
                          {selectedCategory || 'Kategori Seçin'}
                        </Button>
                      }
                    >
                      {CATEGORIES.map(category => (
                        <Menu.Item 
                          key={category}
                          onPress={() => {
                            setSelectedCategory(category);
                            setCategoryMenuVisible(false);
                          }} 
                          title={category} 
                        />
                      ))}
                    </Menu>
                    <View style={styles.categoryActions}>
                      <TouchableOpacity onPress={saveCategory} style={styles.categoryAction}>
                        <Icon name="check" size={20} color="#16a34a" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => {
                          setIsEditingCategory(false);
                          setSelectedCategory(influencer.category || '');
                        }} 
                        style={styles.categoryAction}
                      >
                        <Icon name="close" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.categoryDisplay}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {influencer.category || 'Kategori Yok'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setIsEditingCategory(true)}
                      style={styles.editCategoryButton}
                    >
                      <Icon name="pencil" size={16} color="#2563eb" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
        
        <Card style={styles.contactCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
            <View style={styles.contactGrid}>
              {influencer.phone && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => openContactMethod('phone', influencer.phone!)}
                >
                  <Icon name="phone" size={20} color="#e11d48" style={styles.contactIcon} />
                  <Text style={styles.contactText}>{influencer.phone}</Text>
                </TouchableOpacity>
              )}
              
              {influencer.email && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => openContactMethod('email', influencer.email!)}
                >
                  <Icon name="email" size={20} color="#e11d48" style={styles.contactIcon} />
                  <Text style={styles.contactText}>{influencer.email}</Text>
                </TouchableOpacity>
              )}
              
              {influencer.instagram && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => openContactMethod('instagram', influencer.instagram!)}
                >
                  <Icon name="instagram" size={20} color="#e11d48" style={styles.contactIcon} />
                  <Text style={styles.contactText}>@{influencer.instagram}</Text>
                </TouchableOpacity>
              )}
              
              {influencer.tiktok && (
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => openContactMethod('tiktok', influencer.tiktok!)}
                >
                  <Icon name="music-note" size={20} color="#e11d48" style={styles.contactIcon} />
                  <Text style={styles.contactText}>@{influencer.tiktok}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIcon, styles.collaborationIcon]}>
                <Icon name="chart-bar" size={24} color="#e11d48" />
              </View>
              <View>
                <Text style={styles.statLabel}>İşbirliği Sayısı</Text>
                <Text style={styles.statValue}>{influencer.collaboration_count}</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIcon, styles.feeIcon]}>
                <Icon name="currency-try" size={24} color="#16a34a" />
              </View>
              <View>
                <Text style={styles.statLabel}>Ücret</Text>
                <Text style={styles.statValue}>{influencer.fee.toLocaleString('tr-TR')} ₺</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIcon, styles.statusIcon]}>
                <Icon name="calendar" size={24} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.statLabel}>Durum</Text>
                <StatusBadge status={influencer.status} />
              </View>
            </Card.Content>
          </Card>
        </View>
        
        <Card style={styles.collaborationsCard}>
          <Card.Content>
            <View style={styles.collaborationsHeader}>
              <Text style={styles.sectionTitle}>İşbirliği Geçmişi</Text>
              <Button 
                mode="contained" 
                onPress={() => {
                  setAddDialogVisible(true);
                  setIsAddingNew(true);
                }}
                style={styles.addButton}
                icon="plus"
              >
                Yeni Ekle
              </Button>
            </View>
            
            {collaborations.length === 0 ? (
              <View style={styles.emptyCollaborations}>
                <Text style={styles.emptyText}>Henüz işbirliği kaydı bulunmamaktadır.</Text>
              </View>
            ) : (
              collaborations.map((collab) => (
                <Card key={collab.id} style={styles.collaborationItem}>
                  <Card.Content>
                    <View style={styles.collaborationHeader}>
                      <Text style={styles.collaborationBrand}>{collab.brand}</Text>
                      <StatusBadge status={collab.status} size="small" />
                    </View>
                    
                    <View style={styles.collaborationDetails}>
                      <View style={styles.collaborationDetail}>
                        <Icon name="calendar" size={16} color="#6b7280" style={styles.detailIcon} />
                        <Text style={styles.detailText}>
                          {new Date(collab.date).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                      
                      <View style={styles.collaborationDetail}>
                        <Icon name="currency-try" size={16} color="#6b7280" style={styles.detailIcon} />
                        <Text style={styles.detailText}>
                          {collab.fee.toLocaleString('tr-TR')} ₺
                        </Text>
                      </View>
                      
                      <View style={styles.collaborationDetail}>
                        <Icon name="account" size={16} color="#6b7280" style={styles.detailIcon} />
                        <Text style={styles.detailText}>
                          {collab.assigned_to}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.collaborationActions}>
                      <TouchableOpacity 
                        style={styles.collaborationAction}
                        onPress={() => handleEditClick(collab)}
                      >
                        <Icon name="pencil" size={16} color="#2563eb" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.collaborationAction}
                        onPress={() => handleDeleteCollaboration(collab.id)}
                      >
                        <Icon name="delete" size={16} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      <FAB
        style={styles.editFab}
        icon="pencil"
        onPress={() => navigation.navigate('InfluencerForm' as never, { id: influencer.id } as never)}
        color="#ffffff"
      />
      
      {/* Edit Collaboration Dialog */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>İşbirliği Düzenle</Dialog.Title>
          <Dialog.Content>
            {editForm && (
              <View>
                <TextInput
                  label="Marka"
                  value={editForm.brand}
                  onChangeText={(text) => handleEditChange('brand', text)}
                  mode="outlined"
                  style={styles.dialogInput}
                />
                
                <TextInput
                  label="Tarih"
                  value={editForm.date}
                  onChangeText={(text) => handleEditChange('date', text)}
                  mode="outlined"
                  style={styles.dialogInput}
                />
                
                <TextInput
                  label="Ücret (₺)"
                  value={editForm.fee.toString()}
                  onChangeText={(text) => handleEditChange('fee', text)}
                  mode="outlined"
                  style={styles.dialogInput}
                  keyboardType="numeric"
                />
                
                <TextInput
                  label="İşbirliği Sayısı"
                  value={editForm.collaboration_count.toString()}
                  onChangeText={(text) => handleEditChange('collaboration_count', text)}
                  mode="outlined"
                  style={styles.dialogInput}
                  keyboardType="numeric"
                />
                
                <View style={styles.menuContainer}>
                  <Text style={styles.menuLabel}>Atanan Kişi</Text>
                  <Menu
                    visible={editAssignedMenuVisible}
                    onDismiss={() => setEditAssignedMenuVisible(false)}
                    anchor={
                      <Button 
                        mode="outlined" 
                        onPress={() => setEditAssignedMenuVisible(true)}
                        style={styles.menuButton}
                      >
                        {editForm.assigned_to}
                      </Button>
                    }
                  >
                    {TEAM_MEMBERS.map(member => (
                      <Menu.Item 
                        key={member}
                        onPress={() => {
                          handleEditChange('assigned_to', member);
                          setEditAssignedMenuVisible(false);
                        }} 
                        title={member} 
                      />
                    ))}
                  </Menu>
                </View>
                
                <View style={styles.menuContainer}>
                  <Text style={styles.menuLabel}>Durum</Text>
                  <Menu
                    visible={editStatusMenuVisible}
                    onDismiss={() => setEditStatusMenuVisible(false)}
                    anchor={
                      <Button 
                        mode="outlined" 
                        onPress={() => setEditStatusMenuVisible(true)}
                        style={styles.menuButton}
                      >
                        {editForm.status}
                      </Button>
                    }
                  >
                    <Menu.Item 
                      onPress={() => {
                        handleEditChange('status', 'Beklemede');
                        setEditStatusMenuVisible(false);
                      }} 
                      title="Beklemede" 
                    />
                    <Menu.Item 
                      onPress={() => {
                        handleEditChange('status', 'Onaylandı');
                        setEditStatusMenuVisible(false);
                      }} 
                      title="Onaylandı" 
                    />
                    <Menu.Item 
                      onPress={() => {
                        handleEditChange('status', 'Tamamlandı');
                        setEditStatusMenuVisible(false);
                      }} 
                      title="Tamamlandı" 
                    />
                  </Menu>
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>İptal</Button>
            <Button onPress={handleEditSave}>Kaydet</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Add Collaboration Dialog */}
      <Portal>
        <Dialog visible={addDialogVisible} onDismiss={() => setAddDialogVisible(false)}>
          <Dialog.Title>Yeni İşbirliği Ekle</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Marka"
              value={newCollaboration.brand}
              onChangeText={(text) => handleNewCollabChange('brand', text)}
              mode="outlined"
              style={styles.dialogInput}
            />
            
            <TextInput
              label="Tarih"
              value={newCollaboration.date}
              onChangeText={(text) => handleNewCollabChange('date', text)}
              mode="outlined"
              style={styles.dialogInput}
            />
            
            <TextInput
              label="Ücret (₺)"
              value={newCollaboration.fee.toString()}
              onChangeText={(text) => handleNewCollabChange('fee', text)}
              mode="outlined"
              style={styles.dialogInput}
              keyboardType="numeric"
            />
            
            <TextInput
              label="İşbirliği Sayısı"
              value={newCollaboration.collaboration_count.toString()}
              onChangeText={(text) => handleNewCollabChange('collaboration_count', text)}
              mode="outlined"
              style={styles.dialogInput}
              keyboardType="numeric"
            />
            
            <View style={styles.menuContainer}>
              <Text style={styles.menuLabel}>Atanan Kişi</Text>
              <Menu
                visible={addAssignedMenuVisible}
                onDismiss={() => setAddAssignedMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setAddAssignedMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {newCollaboration.assigned_to}
                  </Button>
                }
              >
                {TEAM_MEMBERS.map(member => (
                  <Menu.Item 
                    key={member}
                    onPress={() => {
                      handleNewCollabChange('assigned_to', member);
                      setAddAssignedMenuVisible(false);
                    }} 
                    title={member} 
                  />
                ))}
              </Menu>
            </View>
            
            <View style={styles.menuContainer}>
              <Text style={styles.menuLabel}>Durum</Text>
              <Menu
                visible={addStatusMenuVisible}
                onDismiss={() => setAddStatusMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setAddStatusMenuVisible(true)}
                    style={styles.menuButton}
                  >
                    {newCollaboration.status}
                  </Button>
                }
              >
                <Menu.Item 
                  onPress={() => {
                    handleNewCollabChange('status', 'Beklemede');
                    setAddStatusMenuVisible(false);
                  }} 
                  title="Beklemede" 
                />
                <Menu.Item 
                  onPress={() => {
                    handleNewCollabChange('status', 'Onaylandı');
                    setAddStatusMenuVisible(false);
                  }} 
                  title="Onaylandı" 
                />
                <Menu.Item 
                  onPress={() => {
                    handleNewCollabChange('status', 'Tamamlandı');
                    setAddStatusMenuVisible(false);
                  }} 
                  title="Tamamlandı" 
                />
              </Menu>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddDialogVisible(false)}>İptal</Button>
            <Button onPress={handleAddCollaboration}>Ekle</Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    position: 'relative',
    marginBottom: 16,
  },
  headerBackground: {
    height: 120,
    backgroundColor: '#e11d48', // rose-600
  },
  profileContainer: {
    flexDirection: 'row',
    marginTop: -60,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fecdd3', // rose-200
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  profileInfo: {
    marginLeft: 16,
    marginTop: 60,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  brand: {
    fontSize: 16,
    color: '#6b7280', // gray-500
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryButton: {
    flex: 1,
    height: 36,
  },
  categoryButtonLabel: {
    fontSize: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  categoryAction: {
    marginHorizontal: 4,
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#fecdd3', // rose-200
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#9f1239', // rose-800
  },
  editCategoryButton: {
    marginLeft: 8,
  },
  contactCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937', // gray-800
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#4b5563', // gray-600
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom:  16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  collaborationIcon: {
    backgroundColor: '#fecdd3', // rose-200
  },
  feeIcon: {
    backgroundColor: '#dcfce7', // green-100
  },
  statusIcon: {
    backgroundColor: '#dbeafe', // blue-100
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280', // gray-500
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
    textAlign: 'center',
  },
  collaborationsCard: {
    margin: 16,
    marginTop: 0,
  },
  collaborationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#16a34a', // green-600
  },
  emptyCollaborations: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280', // gray-500
    textAlign: 'center',
  },
  collaborationItem: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e11d48', // rose-600
  },
  collaborationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collaborationBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  collaborationDetails: {
    marginBottom: 8,
  },
  collaborationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563', // gray-600
  },
  collaborationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6', // gray-100
    paddingTop: 8,
  },
  collaborationAction: {
    marginLeft: 16,
    padding: 4,
  },
  editFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#e11d48', // rose-600
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  menuContainer: {
    marginBottom: 16,
  },
  menuLabel: {
    fontSize: 12,
    color: '#6b7280', // gray-500
    marginBottom: 4,
    marginLeft: 4,
  },
  menuButton: {
    width: '100%',
    justifyContent: 'flex-start',
  },
});

export default InfluencerProfileScreen;