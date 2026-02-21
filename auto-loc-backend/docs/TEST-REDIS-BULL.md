# Test manuel — Redis et Bull (queues)

## Prérequis

- `.env` configuré avec `REDIS_URL` (ex. Upstash : `rediss://default:xxx@xxx.upstash.io:6379`).
- Backend installé : `npm install` à la racine du backend.

## 1. Démarrer l’application

```bash
cd apps/auto-loc-backend
npm run start:dev
```

**Vérifications au démarrage :**

- Dans la console vous devez voir :
  - `✅ Redis connected to <host>` (ex. `ample-treefrog-35102.upstash.io`)
  - `✅ Bull queues ready (reservation-jobs, notification-jobs)`
- Si Redis ou Bull échouent : message d’erreur `[Redis] error: ...` ou `[Bull] queues connection error: ...` et retry automatique (3 tentatives, backoff exponentiel).

## 2. Tester Redis (cache / verrous)

Option 1 : endpoint de health (à ajouter dans un `HealthController` ou module health) qui appelle `RedisService.ping()` et retourne 200 si `PONG`.

Option 2 : test rapide dans un script ou via NestJS REPL / endpoint temporaire :

```ts
// Dans un controller ou service injectant RedisService
const pong = await this.redisService.ping();  // 'PONG'
await this.redisService.set('test-key', 'hello', 60);
const value = await this.redisService.get('test-key');  // 'hello'
const ok = await this.redisService.setNX('lock:test', '1', 10);  // true si créé
const ok2 = await this.redisService.setNX('lock:test', '2', 10); // false (déjà existant)
await this.redisService.del('test-key');
```

## 3. Tester les queues Bull

**Planifier une expiration de réservation (délai 30 s pour test) :**

```ts
// Dans un controller ou service injectant QueueService
const jobId = await this.queueService.scheduleReservationExpiry(
  'reservation-uuid-test',
  30_000,
);
// Si paiement reçu avant : annuler le job
await this.queueService.cancelJob(jobId);
```

**Envoyer une notification :**

```ts
await this.queueService.sendNotification({
  type: 'email',
  email: 'test@example.com',
  subject: 'Test',
  body: 'Hello',
});
```

**Vérifier dans Redis (optionnel) :**

- Avec Upstash Console ou `redis-cli` : clés `bull:reservation-jobs:*` et `bull:notification-jobs:*` après avoir ajouté des jobs.

## 4. Arrêt propre (graceful shutdown)

À l’arrêt de l’app (Ctrl+C), les queues Bull et le client Redis se ferment proprement (`onModuleDestroy`). Aucune action manuelle requise.

## 5. En cas d’échec

- **Redis ne se connecte pas** : vérifier `REDIS_URL` (schéma `rediss://` pour TLS), firewall, quota Upstash.
- **Bull ne démarre pas** : Bull utilise la même `REDIS_URL` ; si Redis fonctionne, vérifier les logs Bull et la version de `ioredis` / `bull` compatible avec votre Redis (ex. Upstash).
