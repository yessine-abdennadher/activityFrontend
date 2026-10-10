import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/AppPreferencesContext';
import {
  fetchPartnerMyActivities,
  createPartnerActivity,
  updatePartnerActivity,
  deletePartnerActivity,
} from '../services/partnerService';
import type {
  PartnerStats,
  PartnerActivityItem,
  PartnerActivityInput,
  AuthUser,
} from '../types';

interface PartnerDashboardScreenProps {
  currentUser: AuthUser | null;
  onBack: () => void;
}

export const PartnerDashboardScreen: React.FC<PartnerDashboardScreenProps> = ({
  currentUser,
  onBack,
}) => {
  const { isDark, theme } = usePreferences();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [stats, setStats] = useState<PartnerStats>({
    total: 0,
    approved: 0,
    pending: 0,
    totalReviews: 0,
    averageRating: 5.0,
  });
  const [activities, setActivities] = useState<PartnerActivityItem[]>([]);

  // Modal d'ajout / modification
  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PartnerActivityItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulaire
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('food');
  const [formCity, setFormCity] = useState(currentUser?.city || 'Sfax');
  const [formPrice, setFormPrice] = useState('25');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPhone, setFormPhone] = useState('+216 ');
  const [formWhatsapp, setFormWhatsapp] = useState('+216 ');
  const [formDescription, setFormDescription] = useState('');
  const [formHasAc, setFormHasAc] = useState(true);
  const [formHasPower, setFormHasPower] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await fetchPartnerMyActivities();
      setStats(res.stats);
      setActivities(res.activities);
    } catch (err: any) {
      console.error('[PartnerDashboard] Erreur chargement:', err.message);
      setErrorMessage(err.message || 'Impossible de charger vos données établissement.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onPullRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingActivity(null);
    setFormName('');
    setFormCategory('food');
    setFormCity(currentUser?.city || 'Sfax');
    setFormPrice('25');
    setFormImageUrl('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800');
    setFormPhone('+216 74 123 456');
    setFormWhatsapp('+216 98 123 456');
    setFormDescription('Découvrez nos spécialités gourmandes, cadre chaleureux et service soigné.');
    setFormHasAc(true);
    setFormHasPower(true);
    setModalVisible(true);
  };

  const openEditModal = (item: PartnerActivityItem) => {
    setEditingActivity(item);
    setFormName(item.name || '');
    setFormCategory(item.category || 'food');
    setFormCity(item.city || 'Sfax');
    setFormPrice(String(item.price || 0));
    setFormImageUrl(item.imageUrl || item.image || '');
    setFormPhone(item.phone || '');
    setFormWhatsapp(item.whatsapp || '');
    setFormDescription(item.description || '');
    setFormHasAc(Boolean(item.hasAirConditioning));
    setFormHasPower(Boolean(item.hasPowerBackup));
    setModalVisible(true);
  };

  const handleSaveActivity = async () => {
    if (!formName.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir le nom de votre offre ou activité.');
      return;
    }
    const parsedPrice = parseFloat(formPrice) || 0;

    const payload: PartnerActivityInput = {
      name: formName.trim(),
      category: formCategory,
      city: formCity.trim(),
      price: parsedPrice,
      imageUrl: formImageUrl.trim(),
      phone: formPhone.trim(),
      whatsapp: formWhatsapp.trim(),
      description: formDescription.trim(),
      hasAirConditioning: formHasAc,
      hasPowerBackup: formHasPower,
    };

    setSubmitting(true);
    try {
      if (editingActivity) {
        const updated = await updatePartnerActivity(editingActivity._id, payload);
        setActivities((prev) =>
          prev.map((a) => (a._id === editingActivity._id ? { ...a, ...updated } : a))
        );
        Alert.alert('Succès', 'Votre offre a été mise à jour.');
      } else {
        const created = await createPartnerActivity(payload);
        setActivities((prev) => [created, ...prev]);
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1,
        }));
        Alert.alert(
          'Offre enregistrée',
          'Votre offre a été soumise avec succès. Elle sera visible une fois modérée par nos équipes.'
        );
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Erreur', err.message || "Impossible d'enregistrer l'activité.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = (item: PartnerActivityItem) => {
    Alert.alert(
      'Confirmation de suppression',
      `Voulez-vous vraiment supprimer "${item.name}" de votre catalogue ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePartnerActivity(item._id);
              setActivities((prev) => prev.filter((a) => a._id !== item._id));
              setStats((prev) => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
                approved: item.isApproved ? Math.max(0, prev.approved - 1) : prev.approved,
                pending: !item.isApproved ? Math.max(0, prev.pending - 1) : prev.pending,
              }));
              Alert.alert('Succès', 'Offre supprimée avec succès.');
            } catch (err: any) {
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header Pro */}
      <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={theme.textMain} />
          </TouchableOpacity>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: theme.textMain }]} numberOfLines={1}>
                {currentUser?.establishmentName || 'Espace Partenaire Pro'}
              </Text>
              <View style={styles.partnerBadge}>
                <Ionicons name="briefcase" size={11} color="#FFFFFF" />
                <Text style={styles.partnerBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              {currentUser?.name} · {currentUser?.city || 'Tunisie'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.refreshIconButton, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          onPress={onPullRefresh}
        >
          <Ionicons name="refresh" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Chargement de vos offres & statistiques...
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.textMain }]}>Erreur</Text>
          <Text style={[styles.errorMessage, { color: theme.textMuted }]}>{errorMessage}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.primary }]}
            onPress={loadData}
          >
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onPullRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          {/* Banner Établissement (ex: Restaurant / Café / Loisir) */}
          <View
            style={[
              styles.establishmentHero,
              {
                backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
                borderColor: isDark ? '#4338CA' : '#C7D2FE',
              },
            ]}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroIconBox}>
                <Ionicons name="restaurant" size={26} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroEstablishmentName, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  {currentUser?.establishmentName || 'Mon Restaurant / Établissement'}
                </Text>
                <Text style={[styles.heroSub, { color: isDark ? '#C7D2FE' : '#4F46E5' }]}>
                  Gérez vos menus, offres spéciales et réservations directes sans commission.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addCtaButton}
              onPress={openCreateModal}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.addCtaText}>+ Nouvelle Offre / Activité</Text>
            </TouchableOpacity>
          </View>

          {/* Grille de KPI de l'établissement */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.kpiValue, { color: theme.textMain }]}>{stats.total}</Text>
              <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Offres Créées</Text>
              <Text style={[styles.kpiSub, { color: '#10B981' }]}>{stats.approved} en ligne</Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.kpiValue, { color: stats.pending > 0 ? '#F59E0B' : '#10B981' }]}>
                {stats.pending}
              </Text>
              <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>En Modération</Text>
              <Text style={[styles.kpiSub, { color: theme.textMuted }]}>Validation admin</Text>
            </View>

            <View style={[styles.kpiCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>★ {stats.averageRating}</Text>
              <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>Note Moyenne</Text>
              <Text style={[styles.kpiSub, { color: theme.textMuted }]}>{stats.totalReviews} avis clients</Text>
            </View>
          </View>

          {/* Liste des Activités du Partenaire */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              Catalogue de vos Offres ({activities.length})
            </Text>
          </View>

          {activities.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <Ionicons name="restaurant-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.textMain }]}>
                Aucune offre publiée pour le moment
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Ajoutez dès maintenant votre premier menu, plat vedette ou formule loisir pour attirer de nouveaux clients !
              </Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openCreateModal}>
                <Text style={styles.emptyAddBtnText}>Ajouter ma première offre</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activityList}>
              {activities.map((item) => {
                const imgUri = item.imageUrl || item.image;
                return (
                  <View
                    key={item._id}
                    style={[styles.activityCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
                  >
                    <View style={styles.activityCardTop}>
                      {imgUri ? (
                        <Image source={{ uri: imgUri }} style={styles.activityThumbnail as any} />
                      ) : (
                        <View style={[styles.thumbnailPlaceholder, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                          <Ionicons name="image-outline" size={24} color={theme.textMuted} />
                        </View>
                      )}

                      <View style={styles.activityCardInfo}>
                        <View style={styles.titleStatusRow}>
                          <Text style={[styles.activityName, { color: theme.textMain }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: item.isApproved ? '#DCFCE7' : '#FEF3C7' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: item.isApproved ? '#15803D' : '#B45309' },
                              ]}
                            >
                              {item.isApproved ? 'En ligne' : 'En attente'}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.activitySubText, { color: theme.textMuted }]}>
                          {item.city} · {item.category} · <Text style={{ color: theme.primary, fontWeight: '800' }}>{item.price} DT</Text>
                        </Text>

                        {/* Aménagements */}
                        <View style={styles.amenitiesRow}>
                          {item.hasAirConditioning && (
                            <View style={styles.amenityChip}>
                              <Text style={styles.amenityText}>❄️ Clim</Text>
                            </View>
                          )}
                          {item.hasPowerBackup && (
                            <View style={styles.amenityChip}>
                              <Text style={styles.amenityText}>⚡ Générateur</Text>
                            </View>
                          )}
                          <View style={styles.ratingChip}>
                            <Ionicons name="star" size={11} color="#F59E0B" />
                            <Text style={styles.ratingText}>{item.rating || 4.5} ({item.reviewsCount || 0})</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Actions de l'établissement */}
                    <View style={[styles.actionRow, { borderTopColor: theme.cardBorder }]}>
                      {item.phone && (
                        <View style={styles.contactPreview}>
                          <Ionicons name="call" size={13} color="#10B981" />
                          <Text style={[styles.contactText, { color: theme.textMuted }]}>{item.phone}</Text>
                        </View>
                      )}

                      <View style={styles.actionButtonsCol}>
                        <TouchableOpacity
                          style={[styles.editBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                          onPress={() => openEditModal(item)}
                        >
                          <Ionicons name="pencil" size={14} color={theme.textMain} />
                          <Text style={[styles.editBtnText, { color: theme.textMain }]}>Modifier</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.deleteBtn, { backgroundColor: '#FEF2F2' }]}
                          onPress={() => handleDeleteActivity(item)}
                        >
                          <Ionicons name="trash" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal d'Ajout / Modification d'une offre */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                {editingActivity ? "Modifier l'offre" : "Nouvelle Offre / Activité"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Nom */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Nom de l'offre ou du plat :</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
                placeholder="Ex: Menu Dégustation Fruits de Mer"
                placeholderTextColor={theme.textMuted}
                value={formName}
                onChangeText={setFormName}
              />

              {/* Catégorie */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Catégorie :</Text>
              <View style={styles.categoryRow}>
                {[
                  { key: 'food', label: '🍽️ Food & Restaurant' },
                  { key: 'fun', label: '🎳 Loisirs' },
                  { key: 'relax', label: '☕ Café & Détente' },
                  { key: 'outdoor', label: '🌿 Outdoor' },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[
                      styles.categoryChip,
                      formCategory === c.key
                        ? { backgroundColor: theme.primary }
                        : { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: theme.cardBorder, borderWidth: 1 },
                    ]}
                    onPress={() => setFormCategory(c.key)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: formCategory === c.key ? '#FFFFFF' : theme.textMain },
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Prix & Ville */}
              <View style={styles.rowTwoCols}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Prix par pers. (DT) :</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
                    keyboardType="numeric"
                    placeholder="Ex: 35"
                    placeholderTextColor={theme.textMuted}
                    value={formPrice}
                    onChangeText={setFormPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Ville :</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
                    placeholder="Sfax, Tunis..."
                    placeholderTextColor={theme.textMuted}
                    value={formCity}
                    onChangeText={setFormCity}
                  />
                </View>
              </View>

              {/* Contacts Directs */}
              <View style={styles.rowTwoCols}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Téléphone direct :</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
                    placeholder="+216 74 123 456"
                    placeholderTextColor={theme.textMuted}
                    value={formPhone}
                    onChangeText={setFormPhone}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>WhatsApp Réservation :</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
                    placeholder="+216 98 123 456"
                    placeholderTextColor={theme.textMuted}
                    value={formWhatsapp}
                    onChangeText={setFormWhatsapp}
                  />
                </View>
              </View>

              {/* Image URL */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Lien photo (URL Unsplash ou image) :</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
                placeholder="https://..."
                placeholderTextColor={theme.textMuted}
                value={formImageUrl}
                onChangeText={setFormImageUrl}
              />

              {/* Description */}
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Description de l'offre :</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: theme.textMain, borderColor: theme.cardBorder }]}
                multiline
                numberOfLines={3}
                placeholder="Décrivez votre menu, ambiance, horaires..."
                placeholderTextColor={theme.textMuted}
                value={formDescription}
                onChangeText={setFormDescription}
              />

              {/* Options & Confort */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.switchTitle, { color: theme.textMain }]}>❄️ Climatisation confirmée</Text>
                  <Text style={[styles.switchSub, { color: theme.textMuted }]}>Idéal par temps chaud</Text>
                </View>
                <Switch value={formHasAc} onValueChange={setFormHasAc} trackColor={{ false: '#CBD5E1', true: '#10B981' }} thumbColor="#FFFFFF" />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.switchTitle, { color: theme.textMain }]}>⚡ Groupe Électrogène (Power Backup)</Text>
                  <Text style={[styles.switchSub, { color: theme.textMuted }]}>Service assuré sans coupure</Text>
                </View>
                <Switch value={formHasPower} onValueChange={setFormHasPower} trackColor={{ false: '#CBD5E1', true: '#10B981' }} thumbColor="#FFFFFF" />
              </View>

              {/* Bouton de Soumission */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveActivity}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingActivity ? 'Enregistrer les modifications' : "Publier l'offre"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    maxWidth: 200,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  partnerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  establishmentHero: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEstablishmentName: {
    fontSize: 16,
    fontWeight: '900',
  },
  heroSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  addCtaButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  addCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyAddBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityCardTop: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  activityThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  activitySubText: {
    fontSize: 12,
    marginTop: 2,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  amenityChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  contactPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 11,
  },
  actionButtonsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  errorMessage: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
