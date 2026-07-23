#!/bin/bash

# ============================================================================
# Script d'initialisation du projet AutoLoc Mobile
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Initialisation du projet AutoLoc Mobile..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# 0. Ajouter Flutter au PATH
# ============================================================================
export PATH="$HOME/development/flutter/bin:$PATH"

# ============================================================================
# 1. Vérifier que Flutter est installé
# ============================================================================
echo -e "${BLUE}📱 Vérification de Flutter...${NC}"
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}❌ Flutter n'est pas installé${NC}"
    echo -e "${YELLOW}Chemin recherché: $HOME/flutter/bin${NC}"
    exit 1
fi

flutter --version
echo ""

# ============================================================================
# 2. Créer le projet Flutter (dossiers natifs iOS/Android)
# ============================================================================
echo -e "${BLUE}📦 Création du projet Flutter...${NC}"
echo "Cela va créer les dossiers iOS et Android (nos fichiers lib/ ne seront pas touchés)"
echo ""

# Créer le projet avec l'organisation AutoLoc et nom de package valide
flutter create . --org com.autoloc --platforms=ios,android --project-name auto_loc_mobile

echo -e "${GREEN}✅ Projet Flutter créé${NC}"
echo ""

# ============================================================================
# 3. Installer les dépendances
# ============================================================================
echo -e "${BLUE}📥 Installation des dépendances...${NC}"
flutter pub get

echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# ============================================================================
# 4. Générer les fichiers freezed
# ============================================================================
echo -e "${BLUE}🔨 Génération des fichiers freezed...${NC}"
echo "Cela peut prendre quelques minutes..."
echo ""

flutter pub run build_runner build --delete-conflicting-outputs

echo -e "${GREEN}✅ Fichiers freezed générés${NC}"
echo ""

# ============================================================================
# 5. Vérifier la configuration
# ============================================================================
echo -e "${BLUE}🔍 Vérification de la configuration...${NC}"
flutter doctor

echo ""
echo -e "${GREEN}✅ Configuration vérifiée${NC}"
echo ""

# ============================================================================
# 6. Résumé
# ============================================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║    ✅  Projet AutoLoc Mobile initialisé avec succès !     ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📱 Pour lancer l'application :${NC}"
echo ""
echo "   ${BLUE}flutter run${NC}"
echo ""
echo -e "${YELLOW}🔧 Configuration serveur (lib/main.dart):${NC}"
echo ""
echo "   Local:  ${BLUE}const environment = EnvDev();${NC}"
echo "   Render: ${BLUE}const environment = EnvProd();${NC}"
echo ""
echo -e "${YELLOW}📚 Documentation :${NC}"
echo ""
echo "   - CONFIGURATION.md                    → Guide environnements"
echo "   - ARCHITECTURE_STATE_MANAGEMENT.md    → Guide Riverpod"
echo "   - PROGRESSION.md                      → Progression du projet"
echo ""
echo -e "${GREEN}Bon développement ! 🚀${NC}"
echo ""
