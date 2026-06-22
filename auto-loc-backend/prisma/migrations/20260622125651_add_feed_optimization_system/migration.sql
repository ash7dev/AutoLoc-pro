-- CreateTable
CREATE TABLE "vehicule_views" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "source" TEXT,
    "ville" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicule_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicule_clicks" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "source" TEXT,
    "actionType" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicule_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "ville" TEXT,
    "type" "TypeVehicule",
    "prixMin" DECIMAL(10,2),
    "prixMax" DECIMAL(10,2),
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "transmission" "Transmission",
    "carburant" "Carburant",
    "placesMin" INTEGER,
    "equipements" TEXT[],
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicule_metrics" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "vues30j" INTEGER NOT NULL DEFAULT 0,
    "clics30j" INTEGER NOT NULL DEFAULT 0,
    "tauxEngagement" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "scorePopularite" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "scoreQualite" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "scoreFraicheur" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "scoreGlobal" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "derniereMiseAJour" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicule_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "villesPreferes" TEXT[],
    "typesPreferes" "TypeVehicule"[],
    "budgetMoyen" DECIMAL(10,2),
    "transmissionPreferee" "Transmission",
    "carburantPrefere" "Carburant",
    "equipementsPreferes" TEXT[],
    "derniereMiseAJour" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicule_views_vehiculeId_creeLe_idx" ON "vehicule_views"("vehiculeId", "creeLe" DESC);

-- CreateIndex
CREATE INDEX "vehicule_views_userId_creeLe_idx" ON "vehicule_views"("userId", "creeLe" DESC);

-- CreateIndex
CREATE INDEX "vehicule_views_sessionId_creeLe_idx" ON "vehicule_views"("sessionId", "creeLe" DESC);

-- CreateIndex
CREATE INDEX "vehicule_views_source_idx" ON "vehicule_views"("source");

-- CreateIndex
CREATE INDEX "vehicule_clicks_vehiculeId_creeLe_idx" ON "vehicule_clicks"("vehiculeId", "creeLe" DESC);

-- CreateIndex
CREATE INDEX "vehicule_clicks_userId_creeLe_idx" ON "vehicule_clicks"("userId", "creeLe" DESC);

-- CreateIndex
CREATE INDEX "vehicule_clicks_actionType_idx" ON "vehicule_clicks"("actionType");

-- CreateIndex
CREATE INDEX "search_history_userId_creeLe_idx" ON "search_history"("userId", "creeLe" DESC);

-- CreateIndex
CREATE INDEX "search_history_sessionId_creeLe_idx" ON "search_history"("sessionId", "creeLe" DESC);

-- CreateIndex
CREATE INDEX "search_history_ville_creeLe_idx" ON "search_history"("ville", "creeLe" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "vehicule_metrics_vehiculeId_key" ON "vehicule_metrics"("vehiculeId");

-- CreateIndex
CREATE INDEX "vehicule_metrics_scoreGlobal_idx" ON "vehicule_metrics"("scoreGlobal" DESC);

-- CreateIndex
CREATE INDEX "vehicule_metrics_scorePopularite_idx" ON "vehicule_metrics"("scorePopularite" DESC);

-- CreateIndex
CREATE INDEX "vehicule_metrics_vehiculeId_idx" ON "vehicule_metrics"("vehiculeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "Vehicule_statut_totalLocations_note_creeLe_idx" ON "Vehicule"("statut", "totalLocations" DESC, "note" DESC, "creeLe" DESC);

-- CreateIndex
CREATE INDEX "Vehicule_statut_creeLe_idx" ON "Vehicule"("statut", "creeLe" DESC);

-- AddForeignKey
ALTER TABLE "vehicule_views" ADD CONSTRAINT "vehicule_views_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule_clicks" ADD CONSTRAINT "vehicule_clicks_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicule_metrics" ADD CONSTRAINT "vehicule_metrics_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
