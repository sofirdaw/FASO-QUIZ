// 📊 Faso Quiz - Logs d'activité
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const LogsListScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, connexions, deconnexions, premium

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      // Récupérer les logs de statistiques
      const logsRef = collection(db, 'statistiques');
      let q = query(logsRef, orderBy('timestamp', 'desc'), limit(200));
      
      // Filtrer par type si nécessaire
      if (filter !== 'all') {
        const actionMap = {
          connexions: 'CONNEXION',
          deconnexions: 'DECONNEXION',
          premium: 'PREMIUM_ACTIVÉ',
          inscription: 'INSCRIPTION'
        };
        if (actionMap[filter]) {
          q = query(logsRef, where('action', '==', actionMap[filter]), orderBy('timestamp', 'desc'), limit(200));
        }
      }
      
      const snapshot = await getDocs(q);
      
      const logsList = [];
      snapshot.forEach(doc => {
        logsList.push({ id: doc.id, ...doc.data() });
      });
      
      setLogs(logsList);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp?.toDate?.() || timestamp).toLocaleString('fr-FR');
  };

  const getActionIcon = (action) => {
    const iconMap = {
      'INSCRIPTION': 'person-add',
      'CONNEXION': 'log-in',
      'DECONNEXION': 'log-out',
      'PREMIUM_ACTIVÉ': 'star',
      'PREMIUM_EXPIRÉ': 'star-outline',
      'PARTIE_TERMINÉE': 'game-controller',
      'CLASSEMENT_MIS_A_JOUR': 'trophy'
    };
    return iconMap[action] || 'document-text';
  };

  const getActionColor = (action) => {
    const colorMap = {
      'INSCRIPTION': COLORS.vert,
      'CONNEXION': COLORS.jauneEtoile,
      'DECONNEXION': COLORS.rouge,
      'PREMIUM_ACTIVÉ': '#FFD700',
      'PREMIUM_EXPIRÉ': '#FFA500',
      'PARTIE_TERMINÉE': COLORS.rouge,
      'CLASSEMENT_MIS_A_JOUR': COLORS.vert
    };
    return colorMap[action] || 'rgba(255,255,255,0.6)';
  };

  const getActionLabel = (action) => {
    const labelMap = {
      'INSCRIPTION': 'Nouvelle inscription',
      'CONNEXION': 'Connexion utilisateur',
      'DECONNEXION': 'Déconnexion utilisateur',
      'PREMIUM_ACTIVÉ': 'Premium activé',
      'PREMIUM_EXPIRÉ': 'Premium expiré',
      'PARTIE_TERMINÉE': 'Partie terminée',
      'CLASSEMENT_MIS_A_JOUR': 'Classement mis à jour'
    };
    return labelMap[action] || action;
  };

  const filters = [
    { key: 'all', label: 'Tous', icon: 'list' },
    { key: 'connexions', label: 'Connexions', icon: 'log-in' },
    { key: 'deconnexions', label: 'Déconnexions', icon: 'log-out' },
    { key: 'premium', label: 'Premium', icon: 'star' },
    { key: 'inscription', label: 'Inscriptions', icon: 'person-add' }
  ];

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>📊 Logs d'Activité</Text>
      </View>

      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
            onPress={() => setFilter(f.key)}
          >
            <Ionicons 
              name={f.icon} 
              size={16} 
              color={filter === f.key ? '#000' : 'rgba(255,255,255,0.6)'} 
            />
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {logs.length} log{logs.length > 1 ? 's' : ''} trouvé{logs.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste des logs */}
      <ScrollView 
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.jauneEtoile} />
        }
      >
        {loading ? (
          <Text style={styles.loadingText}>Chargement des logs...</Text>
        ) : logs.length === 0 ? (
          <Text style={styles.emptyText}>Aucun log trouvé</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={styles.logAction}>
                  <Ionicons 
                    name={getActionIcon(log.action)} 
                    size={20} 
                    color={getActionColor(log.action)} 
                  />
                  <Text style={[styles.logActionText, { color: getActionColor(log.action) }]}>
                    {getActionLabel(log.action)}
                  </Text>
                </View>
                <Text style={styles.logTime}>{formatDate(log.timestamp)}</Text>
              </View>
              
              <View style={styles.logDetails}>
                <Text style={styles.logUserId}>Utilisateur: {log.userId}</Text>
                
                {log.details && Object.keys(log.details).length > 0 && (
                  <View style={styles.logExtraDetails}>
                    {Object.entries(log.details).map(([key, value]) => (
                      <Text key={key} style={styles.logDetail}>
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SPACING.lg, 
    paddingTop: 50 
  },
  backButton: { marginRight: SPACING.md },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  
  filtersContainer: { 
    paddingHorizontal: SPACING.lg, 
    marginBottom: SPACING.md 
  },
  filterButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm, 
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  filterButtonActive: { 
    backgroundColor: COLORS.jauneEtoile,
    borderColor: COLORS.jauneEtoile
  },
  filterText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontSize: 12, 
    marginLeft: 4,
    fontWeight: '600'
  },
  filterTextActive: { 
    color: '#000' 
  },
  
  statsContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  statsText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  
  list: { flex: 1, paddingHorizontal: SPACING.lg },
  loadingText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: SPACING.xl },
  emptyText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: SPACING.xl },
  
  logCard: { 
    backgroundColor: 'rgba(255,255,255,0.06)', 
    borderRadius: RADIUS.lg, 
    padding: SPACING.md, 
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  logHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.sm 
  },
  logAction: { flexDirection: 'row', alignItems: 'center' },
  logActionText: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
  logTime: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  
  logDetails: { paddingTop: SPACING.sm },
  logUserId: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  logExtraDetails: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.sm, padding: SPACING.sm },
  logDetail: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
});

export default LogsListScreen;
