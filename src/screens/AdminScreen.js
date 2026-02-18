// 🔐 Faso Quiz - Écran Admin
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { 
  getTotalUsers, 
  getActiveUsers, 
  getRecentUsers,
  getUserFromFirebase 
} from '../services/firebaseService';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const AdminScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques
      const totalResult = await getTotalUsers();
      const activeResult = await getActiveUsers();
      const recentResult = await getRecentUsers(10);
      
      setStats({
        totalUsers: totalResult.success ? totalResult.count : 0,
        activeUsers: activeResult.success ? activeResult.count : 0,
        recentUsers: recentResult.success ? recentResult.data : []
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp?.toDate?.() || timestamp).toLocaleString('fr-FR');
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.jauneEtoile} />
        }
      >
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>🔐 Admin Dashboard</Text>
            <Text style={styles.subtitle}>Faso Quiz - Statistiques en temps réel</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color={COLORS.jauneEtoile} />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Utilisateurs</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="person" size={32} color={COLORS.vert} />
            <Text style={styles.statNumber}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Utilisateurs Actifs</Text>
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Utilisateurs Récents</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : stats.recentUsers.length === 0 ? (
            <Text style={styles.emptyText}>Aucun utilisateur récent</Text>
          ) : (
            stats.recentUsers.map((user, index) => (
              <View key={user.id || index} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Text style={styles.userAvatar}>{user.avatar || '👤'}</Text>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.nom}</Text>
                    <Text style={styles.userId}>ID: {user.id}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: user.isActive ? COLORS.vert : COLORS.rouge }]} />
                </View>
                
                <View style={styles.userDetails}>
                  <Text style={styles.userDetail}>
                    📅 Inscrit: {formatDate(user.createdAt)}
                  </Text>
                  <Text style={styles.userDetail}>
                    🔑 Dernière connexion: {formatDate(user.lastLoginAt)}
                  </Text>
                  <Text style={styles.userDetail}>
                    📊 Score: {user.meilleurScore || 0} pts
                  </Text>
                  <Text style={styles.userDetail}>
                    🎮 Parties: {user.nombrePartiesJouees || 0}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('UsersList')}>
            <Ionicons name="list" size={20} color="#fff" />
            <Text style={styles.actionText}>Voir tous les utilisateurs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('LogsList')}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.actionText}>Voir les logs d'activité</Text>
          </TouchableOpacity>
        </View>

        {/* Firebase Console Link */}
        <TouchableOpacity 
          style={styles.consoleButton}
          onPress={() => {
            // Ouvre Firebase Console dans le navigateur
            console.log('🔥 Ouverture Firebase Console: https://console.firebase.google.com');
            Linking.openURL('https://console.firebase.google.com');
          }}
        >
          <Ionicons name="link" size={20} color={COLORS.jauneEtoile} />
          <Text style={styles.consoleText}>🔥 Ouvrir Firebase Console</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, paddingTop: 50 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.xl 
  },
  backButton: { 
    marginRight: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  headerContent: { flex: 1 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  
  statsGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    borderRadius: RADIUS.lg, 
    padding: SPACING.lg, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  statNumber: { fontSize: 32, fontWeight: '900', color: COLORS.jauneEtoile, marginVertical: 8 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  
  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: SPACING.md },
  loadingText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: SPACING.lg },
  emptyText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: SPACING.lg },
  
  userCard: { 
    backgroundColor: 'rgba(255,255,255,0.06)', 
    borderRadius: RADIUS.lg, 
    padding: SPACING.md, 
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  userAvatar: { fontSize: 24, marginRight: SPACING.md },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  userId: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  userDetails: { paddingLeft: 36 },
  userDetail: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  
  actions: { gap: SPACING.md, marginBottom: SPACING.xl },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.rouge, 
    borderRadius: RADIUS.md, 
    padding: SPACING.md,
    gap: SPACING.md
  },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  
  consoleButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', 
    borderRadius: RADIUS.md, 
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.jauneEtoile,
    gap: SPACING.sm
  },
  consoleText: { color: COLORS.jauneEtoile, fontWeight: '600', fontSize: 14 },
});

export default AdminScreen;
