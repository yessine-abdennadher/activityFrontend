import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScrollableModal } from '../ui/ScrollableModal';
import { uploadImage } from '../../services/uploadService';
import type { ThemeColors } from '../../theme/theme';
import type {
  PartnerActivityItem,
  ActivityMenuSectionInput,
  ActivityMenuItemInput,
} from '../../types';

interface PartnerMenuModalProps {
  visible: boolean;
  activity: PartnerActivityItem | null;
  theme: ThemeColors;
  isDark: boolean;
  onClose: () => void;
  onSaveMenu: (
    activityId: string,
    menuImageUrl?: string,
    menuUrl?: string,
    sections?: ActivityMenuSectionInput[]
  ) => Promise<void>;
}

export const PartnerMenuModal: React.FC<PartnerMenuModalProps> = ({
  visible,
  activity,
  theme,
  isDark,
  onClose,
  onSaveMenu,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'qrcode'>('text');
  const [menuImageUrl, setMenuImageUrl] = useState<string>('');
  const [sections, setSections] = useState<ActivityMenuSectionInput[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Champs de saisie pour ajouter un plat
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Saisie pour nouvelle catégorie
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');

  useEffect(() => {
    if (activity) {
      setMenuImageUrl(activity.menuImageUrl || '');

      // Initialiser les sections existantes
      if (activity.menu?.sections && activity.menu.sections.length > 0) {
        setSections(activity.menu.sections);
        setSelectedSectionId(activity.menu.sections[0].id);
      } else {
        setSections([]);
        setSelectedSectionId('');
      }
    }
  }, [activity, visible]);

  if (!activity) return null;

  // Lien officiel Hamla pour le menu digital
  const hamlaMenuUrl = `https://hamla.tn/m/${activity._id}`;
  // QR code officiel haute résolution
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
    hamlaMenuUrl
  )}&margin=15`;

  // Ajouter une nouvelle catégorie
  const handleAddCategory = () => {
    const title = newCategoryTitle.trim();
    if (!title) {
      Alert.alert('Attention', 'Veuillez saisir le nom de la catégorie (ex: Desserts, Pâtes).');
      return;
    }
    const newSec: ActivityMenuSectionInput = {
      id: `sec-${Date.now()}`,
      title,
      items: [],
    };
    setSections((prev) => [...prev, newSec]);
    setSelectedSectionId(newSec.id);
    setNewCategoryTitle('');
    setShowAddCategory(false);
  };

  // Supprimer une catégorie
  const handleDeleteCategory = (secId: string) => {
    Alert.alert('Suppression', 'Voulez-vous vraiment supprimer cette catégorie et ses plats ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          setSections((prev) => {
            const next = prev.filter((s) => s.id !== secId);
            if (selectedSectionId === secId && next.length > 0) {
              setSelectedSectionId(next[0].id);
            }
            return next;
          });
        },
      },
    ]);
  };

  // Ajouter un plat dans la catégorie sélectionnée
  const handleAddItem = () => {
    const name = newItemName.trim();
    const priceNum = parseFloat(newItemPrice.replace(',', '.'));

    if (!name) {
      Alert.alert('Nom requis', 'Veuillez entrer le nom du plat ou de la boisson.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Prix invalide', 'Veuillez entrer un prix valide en DT (ex: 7.5).');
      return;
    }

    const newItem: ActivityMenuItemInput = {
      id: `item-${Date.now()}`,
      name,
      price: priceNum,
    };

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === selectedSectionId) {
          return {
            ...sec,
            items: [...sec.items, newItem],
          };
        }
        return sec;
      })
    );

    setNewItemName('');
    setNewItemPrice('');
  };

  // Supprimer un plat
  const handleDeleteItem = (secId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            items: sec.items.filter((i) => i.id !== itemId),
          };
        }
        return sec;
      })
    );
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l’accès à vos photos pour sélectionner la photo de la carte du menu.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingImage(true);
        const uploadRes = await uploadImage(result.assets[0].uri);
        setMenuImageUrl(uploadRes.url);
        Alert.alert('Photo chargée', 'Photo de votre carte chargée. N’oubliez pas d’enregistrer.');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de charger l’image du menu.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveMenu(activity._id, menuImageUrl.trim() || undefined, hamlaMenuUrl, sections);
      Alert.alert('Succès', 'Votre menu Hamla a été enregistré et mis en ligne avec succès.');
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d’enregistrer le menu.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareMenu = async () => {
    try {
      await Share.share({
        title: `Menu de ${activity.name}`,
        message: `Consultez la carte & menu de ${activity.name} sur Hamla : ${hamlaMenuUrl}`,
        url: hamlaMenuUrl,
      });
    } catch (err: any) {
      Alert.alert('Partage', err.message);
    }
  };

  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  return (
    <ScrollableModal
      visible={visible}
      onClose={onClose}
      theme={theme}
      height="92%"
    >
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="restaurant" size={22} color="#4F46E5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.textMain }]}>Gestion du Menu Digital</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>
              {activity.name} · {activity.city}
            </Text>
          </View>
        </View>

        {/* Sélecteur des 3 Onglets : 1. Écrire Plats | 2. Photo Carte | 3. QR Code */}
        <View style={[styles.tabSelector, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'text' && [styles.tabBtnActive, { backgroundColor: theme.cardBg }],
            ]}
            onPress={() => setActiveTab('text')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="create-outline"
              size={15}
              color={activeTab === 'text' ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'text' ? theme.textMain : theme.textMuted },
                activeTab === 'text' && styles.tabBtnTextActive,
              ]}
            >
              Écrire Plats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'photo' && [styles.tabBtnActive, { backgroundColor: theme.cardBg }],
            ]}
            onPress={() => setActiveTab('photo')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="image-outline"
              size={15}
              color={activeTab === 'photo' ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'photo' ? theme.textMain : theme.textMuted },
                activeTab === 'photo' && styles.tabBtnTextActive,
              ]}
            >
              Photo Carte
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'qrcode' && [styles.tabBtnActive, { backgroundColor: theme.cardBg }],
            ]}
            onPress={() => setActiveTab('qrcode')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="qr-code-outline"
              size={15}
              color={activeTab === 'qrcode' ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'qrcode' ? theme.textMain : theme.textMuted },
                activeTab === 'qrcode' && styles.tabBtnTextActive,
              ]}
            >
              QR Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            ONGLET 1 : ÉCRIRE LES PLATS EN 2 COLONNES (NOM ET PRIX)
            ========================================================================= */}
        {activeTab === 'text' && (
          <View style={styles.tabContent}>
            {/* Barre des Catégories Horizontale */}
            <View style={styles.categoriesBarHeader}>
              <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                Catégories du menu :
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddCategory(!showAddCategory)}
                style={styles.addCategoryBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={16} color="#4F46E5" />
                <Text style={styles.addCategoryBtnText}>+ Catégorie</Text>
              </TouchableOpacity>
            </View>

            {/* Input d'ajout rapide de catégorie */}
            {showAddCategory && (
              <View style={[styles.inlineAddRow, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <TextInput
                  style={[styles.inlineInput, { color: theme.textMain }]}
                  placeholder="Ex: Pizzas, Desserts, Entrées..."
                  placeholderTextColor={theme.textMuted}
                  value={newCategoryTitle}
                  onChangeText={setNewCategoryTitle}
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.inlineConfirmBtn, { backgroundColor: '#4F46E5' }]}
                  onPress={handleAddCategory}
                >
                  <Text style={styles.inlineConfirmBtnText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Onglets des catégories sous forme de capsules */}
            <View style={styles.categoriesCapsulesRow}>
              {sections.map((sec) => {
                const isSelected = sec.id === selectedSectionId;
                return (
                  <TouchableOpacity
                    key={sec.id}
                    style={[
                      styles.categoryCapsule,
                      {
                        backgroundColor: isSelected
                          ? '#4F46E5'
                          : isDark
                          ? '#1E293B'
                          : '#F1F5F9',
                        borderColor: isSelected ? '#4F46E5' : theme.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedSectionId(sec.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryCapsuleText,
                        { color: isSelected ? '#FFFFFF' : theme.textMain },
                      ]}
                    >
                      {sec.title} ({sec.items.length})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tableau 2 Colonnes des Plats pour la catégorie sélectionnée */}
            {currentSection ? (
              <View style={[styles.tableContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={[styles.tableHeaderRow, { borderBottomColor: theme.cardBorder }]}>
                  <Text style={[styles.colHeaderTitle, { color: theme.textMuted, flex: 1 }]}>
                    Plat / Boisson ({currentSection.title})
                  </Text>
                  <Text style={[styles.colHeaderPrice, { color: theme.textMuted }]}>Prix (DT)</Text>
                  <View style={{ width: 28 }} />
                </View>

                {currentSection.items.length === 0 ? (
                  <View style={styles.emptyItemsNotice}>
                    <Text style={[styles.emptyItemsText, { color: theme.textMuted }]}>
                      Aucun article dans cette catégorie. Ajoutez votre premier article ci-dessous :
                    </Text>
                  </View>
                ) : (
                  currentSection.items.map((item) => (
                    <View
                      key={item.id}
                      style={[styles.tableDataRow, { borderBottomColor: theme.cardBorder }]}
                    >
                      <Text style={[styles.itemTextName, { color: theme.textMain }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemTextPrice}>
                        {item.price.toFixed(1)} DT
                      </Text>
                      <TouchableOpacity
                        style={styles.deleteItemBtn}
                        onPress={() => handleDeleteItem(currentSection.id, item.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="trash-outline" size={15} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                {/* Formulaire d'ajout rapide de plat (2 Colonnes : Nom + Prix) */}
                <View style={[styles.addItemRow, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                  <TextInput
                    style={[
                      styles.inputItemName,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        borderColor: theme.cardBorder,
                        color: theme.textMain,
                      },
                    ]}
                    placeholder="Nom du plat / formule"
                    placeholderTextColor={theme.textMuted}
                    value={newItemName}
                    onChangeText={setNewItemName}
                  />

                  <TextInput
                    style={[
                      styles.inputItemPrice,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        borderColor: theme.cardBorder,
                        color: theme.textMain,
                      },
                    ]}
                    placeholder="Prix"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    value={newItemPrice}
                    onChangeText={setNewItemPrice}
                  />

                  <TouchableOpacity
                    style={[styles.addItemConfirmBtn, { backgroundColor: '#4F46E5' }]}
                    onPress={handleAddItem}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.emptyPhotoBox,
                  { backgroundColor: isDark ? '#1E1B4B20' : '#EEF2FF', borderColor: '#C7D2FE' },
                ]}
              >
                <Ionicons name="restaurant-outline" size={38} color="#4F46E5" />
                <Text style={[styles.emptyPhotoTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  Votre menu est vide
                </Text>
                <Text style={[styles.emptyPhotoSub, { color: isDark ? '#C7D2FE' : '#64748B' }]}>
                  Cliquez sur "+ Catégorie" ci-dessus pour créer votre première rubrique (ex: Plats, Boissons, Formules, Tarifs).
                </Text>
                <TouchableOpacity
                  style={[styles.uploadBtn, { backgroundColor: '#4F46E5', marginTop: 10 }]}
                  onPress={() => setShowAddCategory(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle" size={17} color="#FFFFFF" />
                  <Text style={styles.uploadBtnText}>Créer ma première catégorie</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Option pour supprimer la catégorie entière */}
            {currentSection && sections.length > 1 && (
              <TouchableOpacity
                style={styles.deleteSecBtn}
                onPress={() => handleDeleteCategory(currentSection.id)}
              >
                <Ionicons name="trash-outline" size={13} color="#EF4444" />
                <Text style={styles.deleteSecBtnText}>
                  Supprimer la catégorie "{currentSection.title}"
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* =========================================================================
            ONGLET 2 : PHOTO DE LA CARTE DES PRIX
            ========================================================================= */}
        {activeTab === 'photo' && (
          <View style={styles.tabContent}>
            {menuImageUrl ? (
              <View style={[styles.previewBox, { borderColor: theme.cardBorder }]}>
                <Image source={{ uri: menuImageUrl }} style={styles.menuImage} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.deletePhotoBtn}
                  onPress={() => setMenuImageUrl('')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.deletePhotoBtnText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.emptyPhotoBox,
                  { backgroundColor: isDark ? '#1E1B4B20' : '#EEF2FF', borderColor: '#C7D2FE' },
                ]}
              >
                <Ionicons name="camera-outline" size={44} color="#4F46E5" />
                <Text style={[styles.emptyPhotoTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  Aucune photo de carte
                </Text>
                <Text style={[styles.emptyPhotoSub, { color: isDark ? '#C7D2FE' : '#64748B' }]}>
                  Prenez en photo votre carte papier ou ardoise pour l’afficher aux clients.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: '#4F46E5' }]}
              onPress={handlePickImage}
              disabled={uploadingImage}
              activeOpacity={0.8}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.uploadBtnText}>
                    {menuImageUrl ? 'Remplacer la photo du menu' : 'Prendre / Choisir la photo du menu'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* =========================================================================
            ONGLET 3 : CHEVALET QR CODE OFFICIEL HAMLA
            ========================================================================= */}
        {activeTab === 'qrcode' && (
          <View style={styles.tabContent}>
            <View style={[styles.qrStandCard, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
              <View style={styles.qrHeader}>
                <View style={styles.qrLogoBadge}>
                  <Ionicons name="flash" size={14} color="#FFFFFF" />
                  <Text style={styles.qrLogoText}>Hamla</Text>
                </View>
                <Text style={styles.qrScanTitle}>Scannez pour voir la carte</Text>
                <Text style={styles.qrRestoName} numberOfLines={1}>
                  {activity.name}
                </Text>
              </View>

              <View style={styles.qrImageWrapper}>
                <Image source={{ uri: qrCodeImageUrl }} style={styles.qrImage} />
              </View>

              <Text style={styles.qrFootnote}>Menu digitalisé en direct sur hamla.tn</Text>
            </View>

            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: '#4F46E5' }]}
              onPress={handleShareMenu}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Partager le lien du Menu</Text>
            </TouchableOpacity>

            <Text style={[styles.qrHint, { color: theme.textMuted }]}>
              Imprimez ce chevalet pour le poser sur vos tables de restaurant. Vos clients scannent et découvrent tous vos plats écrits et photos !
            </Text>
          </View>
        )}

        {/* Bouton d'Enregistrement Global */}
        <View style={[styles.bottomBar, { borderTopColor: theme.cardBorder }]}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Enregistrer le Menu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollableModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tabSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    fontWeight: '800',
  },
  tabContent: {
    gap: 12,
  },
  categoriesBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addCategoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  inlineAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 10,
  },
  inlineInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  inlineConfirmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inlineConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  categoriesCapsulesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryCapsule: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryCapsuleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tableContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  colHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  colHeaderPrice: {
    fontSize: 11,
    fontWeight: '700',
    width: 65,
    textAlign: 'right',
  },
  emptyItemsNotice: {
    padding: 16,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemTextName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  itemTextPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    width: 65,
    textAlign: 'right',
  },
  deleteItemBtn: {
    width: 28,
    alignItems: 'flex-end',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  inputItemName: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  inputItemPrice: {
    width: 65,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  addItemConfirmBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSecBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  deleteSecBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  previewBox: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
  },
  menuImage: {
    width: '100%',
    height: '100%',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deletePhotoBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyPhotoBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  emptyPhotoTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyPhotoSub: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  qrStandCard: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  qrHeader: {
    alignItems: 'center',
    gap: 3,
    marginBottom: 10,
  },
  qrLogoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  qrLogoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  qrScanTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  qrRestoName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  qrImageWrapper: {
    width: 170,
    height: 170,
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrFootnote: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '600',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  qrHint: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  bottomBar: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
