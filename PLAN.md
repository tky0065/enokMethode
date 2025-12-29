# Plan d'Implémentation : EnokMethod

Ce plan décrit les étapes pour construire les actifs, templates et outils nécessaires à la distribution et à l'utilisation de la méthode EnokMethod.

## Phase 1 : Fondation (Core Structure)

L'objectif est de créer les templates standards qui seront copiés dans chaque nouveau projet utilisant la méthode.

- [ ] **Créer la structure de répertoires**
    - Créer le dossier `.enokMethod/` à la racine.
    - Créer le dossier `.enokMethod/archive/` pour les specs terminées.
    - Créer le dossier `.enokMethod/templates/` pour stocker les modèles vierges.

- [ ] **Développer les Templates Piliers**
    - [ ] `templates/CONTEXT.md` : Le modèle de "Constitution" avec les sections pré-remplies (Tech Stack, Code Style, Workflow).
    - [ ] `templates/MEMORY.md` : Le modèle de "Mémoire" avec la structure (Active Tasks, Recent Decisions, Architecture State).
    - [ ] `templates/SPEC.md` : Le modèle pour `CURRENT_SPEC.md` (Objective, User Stories, Tech Impact, Acceptance Criteria).

## Phase 2 : Intégration des Outils (Tooling)

Rendre la méthode utilisable "out-of-the-box" pour les utilisateurs de Cursor et CLI.

- [ ] **Intégration Cursor**
    - [ ] Créer `.cursorrules` : Le prompt système qui force l'IA à lire `.enokMethod/CONTEXT.md` et à maintenir `.enokMethod/MEMORY.md`.
    - [ ] Définir les déclencheurs (triggers) pour la création de specs et de plans.

- [ ] **Support CLI / Universel (Scripts)**
    - [ ] Créer un dossier `scripts/`.
    - [ ] `scripts/init.sh` : Script pour initialiser la structure `.enokMethod` dans un nouveau projet.
    - [ ] `scripts/new-spec.sh` : Script pour générer une nouvelle spec à partir du template.
    - [ ] `scripts/archive-spec.sh` : Script pour déplacer `CURRENT_SPEC.md` vers `archive/` (Format: `YYYY-MM-DD_HH-mm-Name.md`) et mettre à jour `MEMORY.md`.

## Phase 3 : Intelligence (Prompts "Agents")

Définir les prompts systèmes pour les différents rôles, stockés dans `.enokMethod/prompts/` pour référence.

- [ ] **Prompt "Architecte"** : Pour transformer une idée brute en `CURRENT_SPEC.md`.
- [ ] **Prompt "Tech Lead"** : Pour transformer une spec en plan d'implémentation (Todo list).
- [ ] **Prompt "Developer"** : Pour l'exécution du code en respectant le contexte.

## Phase 4 : Documentation & Distribution

- [ ] **README.md** : Guide d'installation et d'utilisation ("Getting Started").
- [ ] **Exemple de Démonstration** : Appliquer la méthode à ce projet lui-même (Dogfooding).
