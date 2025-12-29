# PRD: EnokMethod - Context-First Spec-Driven Development

## 1. Vision & Philosophie
**EnokMethod** est une méthodologie de développement logiciel "AI-Native" conçue pour maximiser l'efficacité de la collaboration Homme-IA. Contrairement aux méthodes existantes qui sont soit trop rigides (BMAD), soit trop verbeuses (SpecKit), EnokMethod se concentre sur la **fluidité** et l'**énergie du contexte**.

### Le Concept clé : "L'Énergie du Contexte"
Dans un environnement LLM, le contexte est une ressource finie et coûteuse (en tokens et en "attention" du modèle).
*   **Trop de contexte** = Hallucinations, perte de focus, coûts élevés.
*   **Pas assez de contexte** = Code générique, erreurs d'intégration.
*   **EnokMethod** optimise cette énergie en injectant le *Just-in-Time Context* (Contexte Juste-à-Temps) : uniquement les informations nécessaires à l'instant T de la tâche.

---

## 2. Objectifs
1.  **Simplicité Radicale :** Réduire le boilerplate. Pas de configuration complexe de 50 agents. Un workflow linéaire et clair.
2.  **Optimisation "Context-Aware" :** Chaque étape nettoie le contexte avant de passer à la suivante.
3.  **Fluidité :** Transition sans friction entre l'idée (Spec) et le code (Implémentation).
4.  **Complétude :** Couvrir tout le cycle : Configuration -> Spec -> Plan -> Code -> Vérification -> Documentation.

---

## 3. Architecture de la Méthode

La méthode repose sur 3 piliers (fichiers) essentiels situés dans un dossier `.enokMethod/` :

1.  **`CONTEXT.md` (La Constitution) :** La vérité immuable du projet (Tech Stack, Conventions, Règles d'Or). C'est l'ancrage.
2.  **`MEMORY.md` (Le Cerveau Dynamique) :** L'état actuel du projet. Ce qui a été fait, ce qui est en cours, les décisions techniques récentes. Ce fichier est mis à jour *automatiquement* par l'IA à chaque étape.
3.  **`CURRENT_SPEC.md` (Le Focus) :** La spécification active de la fonctionnalité en cours de développement. Une fois terminée, elle est archivée.

---

## 4. Workflow (Le Cycle Enok)

Le cycle de développement se divise en 5 phases fluides :

### Phase 1 : Initialisation & Constitution (Setup)
*   **Action :** Créer `.enokMethod/CONTEXT.md`.
*   **Contenu :** Définir la stack (ex: Next.js, Python), les outils de linting, et les règles de style.
*   **Objectif :** L'IA ne doit jamais "deviner" la stack.

### Phase 2 : Spécification Atomique (Spec)
*   **Input :** Idée brute de l'utilisateur (vocal ou texte).
*   **Processus IA :**
    1.  L'IA analyse l'idée par rapport au `CONTEXT.md`.
    2.  L'IA pose des questions de clarification (si nécessaire).
    3.  L'IA rédige une `CURRENT_SPEC.md` standardisée (User Story, Critères d'acceptation, Impact technique).
*   **Règle d'or :** Une spec ne doit pas dépasser une fonctionnalité isolable ("Atomic Spec").

### Phase 3 : Planification Contextuelle (Plan)
*   **Input :** `CURRENT_SPEC.md` + `MEMORY.md`.
*   **Processus IA :**
    1.  L'IA génère un plan d'implémentation (Liste de tâches/todos).
    2.  L'IA identifie les fichiers existants à modifier (via `search`).
    3.  L'IA prépare le "Context Pack" : la liste précise des fichiers nécessaires pour cette tâche.

### Phase 4 : Implémentation Fluide (Code)
*   **Mode :** Itératif (TDD - Test Driven Development recommandé).
*   **Boucle d'exécution :**
    1.  **Lecture :** Charger le "Context Pack".
    2.  **Écriture :** Générer le code et les tests.
    3.  **Vérification :** Lancer les tests / commandes de build.
    4.  **Correction :** Si erreur, l'IA analyse l'erreur avec le contexte réduit à l'erreur.
    5.  **Commit :** Si succès, validation.

### Phase 5 : Synthèse & Mémoire (Loop)
*   **Action :** Une fois la spec terminée.
*   **Processus IA :**
    1.  Mise à jour de `MEMORY.md` avec la nouvelle fonctionnalité.
    2.  Archivage de `CURRENT_SPEC.md` dans `.enokMethod/archive/`.
    3.  Mise à jour de la documentation utilisateur si nécessaire.
    4.  Prêt pour la prochaine spec.

---

## 5. Comparaison Concurrentielle

| Feature | BMAD Method | SpecKit | Auto-Claude | **EnokMethod** |
| :--- | :--- | :--- | :--- | :--- |
| **Structure** | Très complexe (21 agents) | Verbeuse (Constitution, Plan, Tasks...) | Scripting CLI | **Épurée (3 fichiers clés)** |
| **Gestion Contexte** | Sharding complexe | Manuel | Basé sur les fichiers ouverts | **Dynamique ("Energy efficient")** |
| **Approche** | Enterprise-grade | Document-heavy | Automation-first | **Developer-First & Fluid** |
| **Complexité** | Haute | Moyenne | Basse | **Minimale** |

---

## 7. Stratégie d'Implémentation Multi-Outils (Agents & Commandes)

L'EnokMethod est agnostique, mais son exécution s'adapte à l'outil de l'utilisateur. Nous définissons des **"Kits d'Intégration"** pour chaque outil majeur.

### A. Cursor (L'expérience intégrée)
*   **Mécanisme :** Utilisation du fichier `.cursorrules`.
*   **Fonctionnement :** Le fichier `.cursorrules` agit comme un "Méta-Agent" permanent. Il force l'IA de Cursor à toujours vérifier `.enokMethod/CONTEXT.md` et à mettre à jour `.enokMethod/MEMORY.md` après chaque modification majeure.
*   **Commandes :** Pas de commandes CLI, mais des instructions en langage naturel dans le chat (ex: "Nouvelle spec", "Planifie cette spec").

### B. CLI (Claude Code, Gemini, OpenAI)
*   **Mécanisme :** Scripts d'alias ou `Makefile`.
*   **Fonctionnement :** On injecte le contexte manuellement ou via script au début de la session.
*   **Agents (Prompts Spécialisés) :**
    1.  **`agent:spec`** : "Agis comme un Product Manager Technique. Lis `CONTEXT.md`. Analyse la demande..."
    2.  **`agent:plan`** : "Agis comme un Tech Lead. Lis `CURRENT_SPEC.md` et `MEMORY.md`. Génère le plan..."
    3.  **`agent:code`** : "Agis comme un Senior Dev. Exécute le plan..."

### C. GitHub Copilot
*   **Mécanisme :** Fichier `.github/copilot-instructions.md` (si supporté) ou instructions de workspace.
*   **Fonctionnement :** On guide Copilot pour qu'il utilise la structure de dossier `.enokMethod/` comme source de vérité.

---

## 8. Prochaines Étapes (Roadmap)
1.  Créer le template `.enokMethod/CONTEXT.md`.
2.  Créer le prompt "Architecte" pour transformer une idée en `CURRENT_SPEC.md`.
3.  Créer le prompt "Développeur" qui consomme la spec et met à jour la `MEMORY.md`.
