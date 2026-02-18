import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getUtilisateurCourant,
  connecterUtilisateur,
  inscrireUtilisateur,
  deconnecterUtilisateur,
  securiserAdminAccount,
} from '../utils/storageHybrid'; // Changement vers storageHybrid

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    verifierSession();
  }, []);

  const verifierSession = async () => {
    // tenter une migration/sécurisation du compte admin legacy 'August'
    try { await securiserAdminAccount(); } catch {}
    try {
      const u = await getUtilisateurCourant();
      if (u) setUtilisateur(u);
    } catch {}
    finally { setChargement(false); }
  };

  const seConnecter = async (nom, mdp) => {
    const res = await connecterUtilisateur(nom, mdp);
    if (res.succes) setUtilisateur(res.utilisateur);
    return res;
  };

  const sInscrire = async (nom, mdp) => {
    const res = await inscrireUtilisateur(nom, mdp);
    if (res.succes) {
      const conn = await connecterUtilisateur(nom, mdp);
      if (conn.succes) setUtilisateur(conn.utilisateur);
    }
    return res;
  };

  const seDeconnecter = async () => {
    try {
      await deconnecterUtilisateur();
      setUtilisateur(null);
      return Promise.resolve();
    } catch (error) {
      setUtilisateur(null);
      return Promise.resolve();
    }
  };

  const rafraichirUtilisateur = async () => {
    const u = await getUtilisateurCourant();
    if (u) setUtilisateur(u);
  };

  return (
    <AuthContext.Provider value={{
      utilisateur, chargement,
      seConnecter, sInscrire, seDeconnecter, rafraichirUtilisateur,
      estConnecte: !!utilisateur,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth hors du AuthProvider');
  return ctx;
};

export default AuthContext;
