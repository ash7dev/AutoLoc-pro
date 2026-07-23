# Plan d'action – Développement de l'application mobile AutoLoc (Flutter)

## Objectif

Avant de commencer le développement, mon objectif est de définir toute l'architecture fonctionnelle de l'application afin d'éviter de développer au hasard. Je veux connaître précisément les écrans à réaliser, leur chronologie, les composants réutilisables, les différents flux utilisateurs ainsi que l'architecture générale de l'application.

Le but est de construire une application propre, évolutive et facilement maintenable.

---

# I. Définition du parcours utilisateur (User Flow)

## 1. Splash Screen

Au lancement de l'application :

- Affichage du logo AutoLoc
- Vérification de la session utilisateur
- Chargement des données essentielles
- Redirection automatique

---

## 2. Onboarding

L'onboarding ne sera affiché qu'une seule fois après l'installation.

Je privilégie un onboarding en **3 étapes maximum** :

### Découvrir

> Louez une voiture partout au Sénégal en toute simplicité.
> 

### Réserver

> Réservez votre véhicule en quelques minutes.
> 

### Confiance

> Paiement sécurisé • Contrat automatique • Véhicules vérifiés.
> 

CTA :

**Commencer**

---

## 3. Gestion intelligente des permissions

Je ne souhaite pas demander toutes les permissions dès le premier lancement.

Les permissions seront demandées uniquement lorsqu'elles apportent une valeur immédiate à l'utilisateur.

Exemple :

### Localisation

Demandée lorsque l'utilisateur souhaite rechercher des véhicules proches de lui.

### Notifications

Demandées lors de la première réservation ou lorsqu'une notification devient réellement utile.

Cette approche améliore considérablement le taux d'acceptation.

---

## 4. Authentification

Je ne souhaite pas imposer une connexion dès l'ouverture de l'application.

L'utilisateur pourra :

- Explorer les annonces
- Rechercher des véhicules
- Consulter les détails

La connexion ne sera demandée que lorsqu'il souhaitera :

- Réserver un véhicule
- Accéder à son espace personnel
- Publier une annonce
- Modifier son profil
- Effectuer une action nécessitant une authentification

L'objectif est de réduire la friction et d'améliorer le taux de conversion.

---

## 5. Tutoriel interactif

Lors de la première utilisation, quelques bulles d'aide guideront l'utilisateur :

- Comment rechercher un véhicule
- Comment utiliser les filtres
- Comment réserver
- Où retrouver ses réservations

Ces tutoriels ne seront affichés qu'une seule fois.

---

# II. Architecture des rôles

Une seule application Flutter.

Le comportement changera uniquement selon le rôle de l'utilisateur.

```
Application

↓

Utilisateur connecté

↓

Role

↓

Tenant (Locataire)

ou

↓

Owner (Propriétaire)
```

Cette approche permet de partager la majorité des composants tout en conservant deux expériences adaptées.

---

# III. Organisation des écrans

## Écrans communs

- Splash
- Onboarding
- Authentification
- OTP
- Mot de passe oublié
- Notifications
- Support
- Profil
- Paramètres
- Centre d'aide
- Erreur réseau
- Maintenance
- Hors connexion

---

## Parcours Locataire (Tenant)

Navigation principale :

- Accueil
- Explorer
- Mes réservations
- Paramètres

Écrans principaux :

- Accueil
- Explorer
- Recherche
- Résultats
- Filtres
- Détail d'une annonce
- Réservation
- Paiement
- Contrat
- Mes réservations
- Détail d'une réservation
- Profil
- Création d'un ticket de support

---

### Parcours Propriétaire (Owner)

### Navigation principale

- Dashboard
- Flotte
- Réservations
- **Wallet**
- Paramètres

### Écrans principaux

- Dashboard
- Gestion de la flotte
- Création d'annonce
- Modification d'annonce
- Détail d'une annonce
- Réservations reçues
- Détail d'une réservation
- Contrat
- **Wallet**
- **Historique des revenus**
- **Historique des transactions**
- **Demande de retrait**
- **Suivi des retraits (En attente, Validé, Refusé)**
- Revenus
- Statistiques

---

# IV. Design System

Avant de développer les écrans, je souhaite créer un véritable Design System.

Les composants devront être totalement réutilisables.

Exemples :

## Boutons

- PrimaryButton
- SecondaryButton
- DangerButton

## Cartes

- VehicleCard
- BookingCard
- OwnerVehicleCard

## Widgets

- SearchBar
- BottomNavigation
- TopBar
- StatusBadge
- Avatar
- Rating
- PriceWidget
- CalendarWidget
- SectionTitle

## États

- Loading
- Skeleton
- EmptyState
- ErrorState
- OfflineState

L'objectif est d'obtenir une interface cohérente sur toute l'application.

---

# V. Composants métiers

Quelques composants importants :

- Card d'annonce
- Card réservation
- Card véhicule
- Modal KYC
- Modal permis
- Modal CNI
- Modal selfie
- Auth Request
- Contrat PDF
- Timeline de réservation
- Statut de réservation
- Barre de recherche
- Filtres
- Calendrier
- **Wallet Balance Card**
- **Transaction Card**
- **Withdrawal Card**
- **Withdrawal Status Badge**

Tous ces composants devront être réutilisables.

---

# VI. Gestion des états

Chaque écran devra gérer les différents cas possibles.

Par exemple :

## Loading

Affichage de Skeletons.

## Success

Affichage normal des données.

## Empty

Aucune donnée disponible.

## Error

Erreur réseau ou erreur serveur.

## Offline

Connexion Internet indisponible.

Aucun écran ne devra gérer uniquement le cas "Success".

---

# VII. Architecture Flutter

Je souhaite partir sur une architecture Feature First.

```
lib/

core/

design_system/

shared/

navigation/

services/

features/

home/

explore/

booking/

vehicle/

tenant/

owner/

profile/

support/

settings/
```

Chaque Feature contiendra :

```
presentation/

widgets/

controllers/

repositories/

models/

services/
```

Cette organisation permettra de maintenir facilement l'application à long terme.

---

# VIII. Ordre de développement

Je ne développerai pas les écrans dans leur ordre d'apparition mais selon leur importance.

## Phase 1

Fondations

- Architecture
- Navigation
- Thème
- Design System
- Composants
- Réseau
- Gestion d'état

---

## Phase 2

Navigation publique

- Splash
- Onboarding
- Accueil
- Explorer
- Détail d'annonce

L'utilisateur peut déjà parcourir toute la plateforme.

---

## Phase 3

Authentification

- Connexion
- Inscription
- OTP
- Gestion de session

---

## Phase 4

Réservation

- Création
- Paiement
- Contrat
- Mes réservations
- Détail réservation

---

## Phase 5

### Espace propriétaire

- Dashboard
- Flotte
- Création d'annonce
- Modification
- Réservations
- Contrats
- **Wallet**
- **Historique des revenus**
- **Historique des transactions**
- **Demande de retrait**
- **Suivi des retraits**
- Revenus

---

---

## Phase 6

Finalisation

- Support
- Profil
- Paramètres
- Notifications
- Optimisations
- États Offline
- Gestion des erreurs
- Animations
- Tutoriels

---

# IX. Vision générale

Mon objectif n'est pas simplement de créer une application Flutter qui fonctionne.

Je veux construire une application qui respecte les standards des grandes plateformes comme Airbnb, Uber ou Yango :

- architecture propre et évolutive ;
- composants réutilisables ;
- expérience utilisateur fluide ;
- parcours utilisateur optimisé pour la conversion ;
- maintenance facilitée grâce à une organisation claire du projet.

Chaque décision de développement devra privilégier la réutilisabilité, la cohérence visuelle, la performance et l'évolutivité afin de faire d'AutoLoc une application robuste et professionnelle dès son MVP.