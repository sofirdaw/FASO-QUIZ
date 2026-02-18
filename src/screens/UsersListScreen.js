// 👥 Faso Quiz - Liste complète des utilisateurs
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const UsersListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les utilisateurs depuis Firebase
      const usersRef = collection(db, 'utilisateurs');
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      const usersList = [];
      snapshot.forEach(doc => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filtrer les utilisateurs selon le texte de recherche
    const filtered = users.filter(user => 
      user.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.id?.includes(searchText)
    );
    setFilteredUsers(filtered);
  }, [searchText, users]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp?.toDate?.() || timestamp).toLocaleString('fr-FR');
  };

  const getUserStats = (user) => {
    return {
      score: user.meilleurScore || 0,
      parties: user.nombrePartiesJouees || 0,
      points: user.totalPoints || 0
    };
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0800', '#0D0D0D']} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>👥 Tous les Utilisateurs</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou ID..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste des utilisateurs */}
      <ScrollView 
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.jauneEtoile} />
        }
      >
        {loading ? (
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        ) : filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
        ) : (
          filteredUsers.map((user) => {
            const stats = getUserStats(user);
            return (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Text style={styles.userAvatar}>{user.avatar || '👤'}</Text>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.nom}</Text>
                    <Text style={styles.userId}>ID: {user.id}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: user.isActive ? COLORS.vert : COLORS.rouge }]} />
                </View>
                
                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="trophy" size={16} color={COLORS.jauneEtoile} />
                    <Text style={styles.statText}>{stats.score} pts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="game-controller" size={16} color={COLORS.rouge} />
                    <Text style={styles.statText}>{stats.parties} parties</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color={COLORS.vert} />
                    <Text style={styles.statText}>{stats.points} points</Text>
                  </View>
                </View>
                
                <View style={styles.userDetails}>
                  <Text style={styles.userDetail}>
                    📅 Inscrit: {formatDate(user.createdAt)}
                  </Text>
                  <Text style={styles.userDetail}>
                    🔑 Dernière connexion: {formatDate(user.lastLoginAt)}
                  </Text>
                  {user.lastLogoutAt && (
                    <Text style={styles.userDetail}>
                      🚪 Dernière déconnexion: {formatDate(user.lastLogoutAt)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
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
  
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    margin: SPACING.lg, 
    paddingHorizontal: SPACING.md, 
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  searchInput: { 
    flex: 1, 
    color: '#fff', 
    padding: SPACING.sm, 
    fontSize: 14 
  },
  
  statsContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  statsText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  
  list: { flex: 1, paddingHorizontal: SPACING.lg },
  loadingText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: SPACING.xl },
  emptyText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: SPACING.xl },
  
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
  
  userStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.md
  },
  statItem: { alignItems: 'center' },
  statText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  
  userDetails: { paddingTop: SPACING.sm },
  userDetail: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
});

export default UsersListScreen;
