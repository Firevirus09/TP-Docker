# TP Docker : image multi-stage

Application web simple, un aide-mémoire interactif des commandes Docker, créée avec React et Vite. Son build produit des fichiers statiques, servis par Nginx depuis une image Docker multi-stage.

## Structure

```text
.
├── app/            # Sources de l'application (React + Vite)
├── preuves/        # Sorties de commandes et capture d'écran
├── Dockerfile      # Build multi-stage
├── compose.yaml    # Lancement en une commande
├── .dockerignore   # Fichiers exclus de l'image
└── .gitignore      # Fichiers exclus du dépôt
```

## L'image multi-stage

| Étape | Image de base | Rôle |
|---|---|---|
| `build` | `node:22-alpine` | Installe les dépendances avec `npm ci` et produit `dist/` |
| Finale | `nginxinc/nginx-unprivileged:1.28-alpine` | Sert uniquement le contenu de `dist/` |

- **Image légère :** Node, `node_modules` et les sources ne sont pas dans l'image finale.
- **Sans root :** Nginx tourne avec l'utilisateur `nginx` (uid 101) et écoute donc sur le port 8080.
- **Build reproductible :** les versions des images sont fixées (pas de `latest`) et `package-lock.json` verrouille les dépendances.
- **Cache efficace :** `package*.json` est copié avant le code, donc modifier le code ne relance pas l'installation des dépendances.

## Lancement

Prérequis : Docker (Docker Desktop ou Colima). Node n'est pas nécessaire sur le poste, car le build se fait dans l'image.

```bash
docker compose up -d --build
```

L'application est ensuite disponible sur <http://localhost:9090>. Grâce à `restart: unless-stopped` dans `compose.yaml`, elle redémarre automatiquement avec Docker.

Pour l'arrêter :

```bash
docker compose down
```

Sans Compose, l'équivalent est :

```bash
docker build -t memo-docker:1.0 .
docker run -d --name memo -p 9090:8080 --restart unless-stopped memo-docker:1.0
```

> Avec Colima, lancer `brew services start colima` une seule fois pour que Docker démarre à l'ouverture de session.

Les commandes `docker compose` se lancent depuis le dossier du projet :

```bash
cd "/Volumes/FireDisk/TP Docker"
```

## Dépannage

| Problème | Solution |
|---|---|
| `failed to connect to the docker API ... docker.sock` | Docker (Colima) n'est pas démarré : `colima start` |
| `Conflict. The container name "/memo" is already in use` | Un ancien conteneur existe : `docker rm -f memo`, puis relancer |
| `failed to xattr ... ._fichier: operation not permitted` | Fichiers macOS parasites : `find . -name '._*' -delete`, puis relancer |
| `port is already allocated` (9090) | Un autre conteneur utilise le port : `docker ps` pour le trouver, puis `docker stop <nom>` |
| La page ne s'affiche pas après un redémarrage du Mac | Attendre ~30 s que Colima démarre, puis vérifier avec `docker ps` |
| Le site n'affiche pas mes modifications | Reconstruire l'image : `docker compose up -d --build` |

## Tests

```bash
# Le conteneur tourne
docker ps --filter name=memo

# L'application répond (HTTP 200)
curl -i http://localhost:9090/

# Le conteneur ne tourne pas en root
docker exec memo id

# Node n'est pas dans l'image finale
docker exec memo sh -c "command -v node || echo node absent"
```

Dans le navigateur, la page affiche 6 commandes. Cocher une case met à jour le compteur `x / 6 commandes essayées`.

## Preuves de fonctionnement

| Fichier | Contenu |
|---|---|
| [`preuves/01-build.txt`](preuves/01-build.txt) | Sortie complète de `docker build` |
| [`preuves/02-tests.txt`](preuves/02-tests.txt) | Sorties des tests ci-dessus et test dans Chrome headless |

![Page servie par le conteneur, avec 2 cases cochées](preuves/page.png)
