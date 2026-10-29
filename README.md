# FinanceFlow — Gestion Financière, Livret A & Prévisions

Application web moderne, réactive et sécurisée dédiée à la gestion de vos finances personnelles, au suivi de votre compte courant, de votre Livret A, de vos salaires, paiements, virements et projections d'épargne dans le temps.

---

## 🚀 Fonctionnalités Clés

### 1. Gestion des Comptes Bancaires
- **Compte Courant** : Suivi des opérations courantes, solde de départ paramétrable, calcul instantané du solde en temps réel.
- **Livret A** : Suivi de l'épargne de précaution, solde initial personnalisable, calcul automatique des intérêts annuels (taux paramétrable, 3.0% net par défaut).
- **Patrimoine Global** : Consolidation en direct de votre solde total.

### 2. Suivi des Opérations & Transactions
- **Salaires & Revenus** : Ajout facile de vos salaires nets, primes ou rentrées d'argent avec dates et catégories.
- **Paiements & Dépenses** : Saisie des dépenses du quotidien (loyer, courses, factures, loisirs...).
- **Virements vers Livret A** : Virement interne en un clic qui débite le compte courant et crédite automatiquement le Livret A.
- **Filtres et Recherche** : Tri par type (Salaires, Dépenses, Virements), par mois ou par mot-clé.

### 3. Graphiques Interactifs & Analyses
- **Courbe d'évolution temporelle** : Visualisez l'évolution conjointe de votre compte courant, de votre Livret A et de votre patrimoine global.
- **Comparatif mensuel** : Histogramme groupé comparant vos Revenus, vos Dépenses et votre Épargne virée chaque mois.
- **Répartition des dépenses** : Graphique en anneau (Donut) avec pourcentages par poste de dépense (Alimentation, Logement, Factures, Transports...).

### 4. Persistance des Données dans le Temps
- **Sauvegarde locale automatique** : Vos données sont conservées en local (`localStorage`) dans votre navigateur de manière totalement privée et confidentielle.
- **Export & Sauvegarde JSON** : Téléchargez votre historique complet en fichier `.json` en un clic.
- **Import JSON** : Restaurez vos données à tout moment sur n'importe quel ordinateur ou navigateur.
- **Bouton Réinitialiser** : Permet de recharger des données d'exemple réalistes si souhaité.

### 5. Prévisualisations & Simulateur Prévisionnel (« Et si... »)
- **Horizons temporels** : Projetez votre avenir financier sur 3 mois, 6 mois, 1 an, 2 ans ou 5 ans !
- **Calcul des intérêts composés du Livret A** : Visualisez l'argent généré passivement par votre épargne.
- **Alerte Trésorerie & Risque de découvert** : Identifie le point bas prévisionnel de votre compte courant et vous alerte si le solde risque de descendre sous votre seuil de sécurité.
- **Curseurs interactifs** : Simulez instantanément l'impact de l'augmentation de votre virement d'épargne, d'une hausse de salaire ou de dépenses imprévues.

### 6. Gestionnaire de Règles Récurrentes
- Paramétrez vos salaires mensuels, loyers, abonnements et virements automatiques pour alimenter précisément le moteur de simulation.

---

## 💻 Démarrage Rapide

Dans le terminal de votre projet, lancez :

```bash
# Lancer le serveur de développement
npm run dev
```

Puis ouvrez l'adresse indiquée (généralement **http://localhost:5173**) dans votre navigateur.

Pour générer une version de production :
```bash
npm run build
```

---

## 🛠️ Technologies Utilisées
- **React 18** avec **TypeScript**
- **Tailwind CSS** (design moderne, mode sombre soigné)
- **Recharts** (graphiques interactifs et animations fluides)
- **Lucide React** (icônes modernes)
- **Vite** (build ultra-rapide)
