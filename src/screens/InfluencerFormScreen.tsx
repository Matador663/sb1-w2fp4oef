import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, Appbar, Menu, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Influencer, CATEGORIES } from '../types';
import useSync from '../hooks/useSync';

const InfluencerFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const isEditMode = !!id;

  const [influencers, setInfluencers, loading] = useSync<Influencer>('influencers');
  const [collaborations, setCollaborations] = useSync<any>('collaborations');

  const [formData, setFormData] = useState<Influencer>({
    name: '',
    brand: '',
    fee: 0,
    status: 'Beklemede',
    collaboration_count: 0,
    image: '',
    category: '',
    phone: '',
    email: '',
    instagram: '',
    tiktok: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState<boolean>(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState<boolean>(false);

  useEffect(() => {
    if (isEditMode && influencers.length > 0) {
      const influencer = influencers.find((inf: Influencer) => inf.id === id);
      
      if (influencer) {
        setFormData(influencer);
      } else {
        Alert.alert('Hata', 'Influencer bulunamadı');
        navigation.goBack();
      }
    }
  }, [id, isEditMode, influencers, navigation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'İsim alanı zorunludur';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Marka alanı zorunludur';
    }
    
    if (formData.fee < 0) {
      newErrors.fee = 'Ücret 0 veya daha büyük olmalıdır';
    }
    
    if (formData.collaboration_count < 0) {
      newErrors.collaboration_count = 'İşbirliği sayısı 0 veya daha büyük olmalıdır';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (formData.image && !/^https?:\/\/.+/.test(formData.image)) {
      newErrors.image = 'Geçerli bir URL giriniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditMode) {
        // Update existing influencer
        const updatedInfluencers = influencers.map((inf: Influencer) => 
          inf.id === id ? { ...formData } : inf
        );
        
        // Update state and sync
        await setInfluencers(updatedInfluencers);
        
        // Update collaborations with new influencer name if it changed
        const updatedCollaborations = collaborations.map((collab: any) => {
          if (collab.influencer_id === id) {
            return {
              ...collab,
              influencer_name: formData.name
            };
          }
          return collab;
        });
        
        await setCollaborations(updatedCollaborations);
      } else {
        // Add new influencer with generated ID
        const newId = (influencers.length + 1).toString();
        const newInfluencer = {
          ...formData,
          id: newId,
          created_at: new Date()
        };
        
        await setInfluencers([...influencers, newInfluencer]);
      }
      
      Alert.alert(
        'Başarılı',
        isEditMode ? 'Influencer başarıyla güncellendi' : 'Yeni influencer başarıyla eklendi',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditMode ? 'Influencer Düzenle' : 'Yeni Influencer Ekle'} />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <TextInput
          label="İsim"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          mode="outlined"
          style={styles.input}
          error={!!errors.name}
        />
        {errors.name && <HelperText type="error">{errors.name}</HelperText>}
        
        <TextInput
          label="Marka"
          value={formData.brand}
          onChangeText={(text) => setFormData({ ...formData, brand: text })}
          mode="outlined"
          style={styles.input}
          error={!!errors.brand}
        />
        {errors.brand && <HelperText type="error">{errors.brand}</HelperText>}
        
        <TextInput
          label="Ücret (₺)"
          value={formData.fee.toString()}
          onChangeText={(text) => setFormData({ ...formData, fee: Number(text) || 0 })}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.fee}
        />
        {errors.fee && <HelperText type="error">{errors.fee}</HelperText>}
        
        <View style={styles.menuContainer}>
          <Text style={styles.menuLabel}>Durum</Text>
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setStatusMenuVisible(true)}
                style={styles.menuButton}
              >
                {formData.status}
              </Button>
            }
          >
            <Menu.Item 
              onPress={() => {
                setFormData({ ...formData, status: 'Beklemede' });
                setStatusMenuVisible(false);
              }} 
              title="Beklemede" 
            />
            <Menu.Item 
              onPress={() => {
                setFormData({ ...formData, status: 'Onaylandı' });
                setStatusMenuVisible(false);
              }} 
              title="Onaylandı" 
            />
            <Menu.Item 
              onPress={() => {
                setFormData({ ...formData, status: 'Tamamlandı' });
                setStatusMenuVisible(false);
              }} 
              title="Tamamlandı" 
            />
          </Menu>
        </View>
        
        <TextInput
          label="İşbirliği Sayısı"
          value={formData.collaboration_count.toString()}
          onChangeText={(text) => setFormData({ ...formData, collaboration_count: Number(text) || 0 })}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.collaboration_count}
        />
        {errors.collaboration_count && <HelperText type="error">{errors.collaboration_count}</HelperText>}
        
        <View style={styles.menuContainer}>
          <Text style={styles.menuLabel}>Kategori</Text>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setCategoryMenuVisible(true)}
                style={styles.menuButton}
              >
                {formData.category || 'Kategori Seçin'}
              </Button>
            }
          >
            {CATEGORIES.map(category => (
              <Menu.Item 
                key={category}
                onPress={() => {
                  setFormData({ ...formData, category });
                  setCategoryMenuVisible(false);
                }} 
                title={category} 
              />
            ))}
          </Menu>
        </View>
        
        <TextInput
          label="Telefon Numarası"
          value={formData.phone || ''}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="+90 555 123 4567"
        />
        
        <TextInput
          label="E-posta Adresi"
          value={formData.email || ''}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          placeholder="ornek@email.com"
          error={!!errors.email}
        />
        {errors.email && <HelperText type="error">{errors.email}</HelperText>}
        
        <TextInput
          label="Instagram Kullanıcı Adı"
          value={formData.instagram || ''}
          onChangeText={(text) => setFormData({ ...formData, instagram: text })}
          mode="outlined"
          style={styles.input}
          placeholder="kullaniciadi"
        />
        
        <TextInput
          label="TikTok Kullanıcı Adı"
          value={formData.tiktok || ''}
          onChangeText={(text) => setFormData({ ...formData, tiktok: text })}
          mode="outlined"
          style={styles.input}
          placeholder="kullaniciadi"
        />
        
        <TextInput
          label="Profil Resmi URL (Opsiyonel)"
          value={formData.image || ''}
          onChangeText={(text) => setFormData({ ...formData, image: text })}
          mode="outlined"
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          error={!!errors.image}
        />
        {errors.image && <HelperText type="error">{errors.image}</HelperText>}
        
        {formData.image && (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.previewLabel}>Profil Resmi Önizleme</Text>
            <View style={styles.imageWrapper}>
              <View style={styles.imagePreview}>
                <img 
                  src={formData.image} 
                  alt="Profil Önizleme" 
                  style={styles.previewImage}
                />
              </View>
            </View>
          </View>
        )}
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={submitting}
          disabled={submitting}
        >
          {isEditMode ? 'Güncelle' : 'Kaydet'}
        </Button>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
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
  imagePreviewContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  imageWrapper: {
    alignItems: 'flex-start',
  },
  imagePreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb', // gray-200
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#e11d48', // rose-600
    paddingVertical: 6,
  },
});

export default InfluencerFormScreen;