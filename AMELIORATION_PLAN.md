# 🚀 Plan d'Amélioration EnokMethod

> **Date de création**: 2025-12-29  
> **Version**: 1.0  
> **Statut**: En attente d'exécution

---

## 📊 Analyse du Projet

### Points Forts Actuels ✅

| Aspect                   | État                                             |
| ------------------------ | ------------------------------------------------ |
| **Vision claire**        | Excellent PRD avec philosophie bien définie      |
| **CLI fonctionnel**      | Commandes `init`, `spec`, `done` opérationnelles |
| **Multi-adaptateurs**    | Cursor, Claude, Gemini, Copilot, General         |
| **Auto-détection stack** | JS/TS, Python, Go, Java supportés                |
| **Templates structurés** | CONTEXT, MEMORY, SPEC bien pensés                |
| **Prompts agents**       | Architect, Tech-Lead, Developer                  |

### Points Faibles / Lacunes 🔴

| Aspect                            | Problème                            |
| --------------------------------- | ----------------------------------- |
| **Aucun test**                    | Pas de tests unitaires/intégrations |
| **Description package.json vide** | Métadonnées incomplètes             |
| **Pas de validation**             | Les templates ne sont pas validés   |
| **CLI basique**                   | Manque de commandes utiles          |
| **Pas de versionning sémantique** | Changelog absent                    |
| **Documentation technique**       | Pas de doc API / contribution       |
| **Expérience utilisateur**        | Pas de commande interactive         |

---

## Phase 1 : Fondations Solides (Qualité & Tests)

### 1.1 Tests Unitaires & Intégration

- [ ] Ajouter **Vitest** comme framework de test
- [ ] Tester `detector.js` (détection de stack)
- [ ] Tester toutes les commandes CLI (`init`, `spec`, `done`)
- [ ] Ajouter couverture de code (coverage)
- [ ] Créer des fixtures de test (projets exemples)
- [ ] Tests d'intégration end-to-end

**Fichiers à créer**:

- `tests/detector.test.js`
- `tests/commands/init.test.js`
- `tests/commands/spec.test.js`
- `tests/commands/done.test.js`
- `tests/fixtures/` (dossier avec projets de test)
- `vitest.config.js`

**Dépendances**:

```json
{
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
}
```

### 1.2 Amélioration du `package.json`

- [ ] Ajouter une description pertinente
- [ ] Ajouter des keywords pour npm search
- [ ] Ajouter `repository`, `bugs`, `homepage`
- [ ] Ajouter `engines` (version Node minimale)
- [ ] Ajouter `files` pour limiter ce qui est publié
- [ ] Ajouter scripts de test et lint

**Exemple de métadonnées**:

```json
{
    "description": "Context-First Spec-Driven Development for the AI Era",
    "keywords": ["ai", "development", "methodology", "spec-driven", "cursor", "claude"],
    "repository": {
        "type": "git",
        "url": "https://github.com/tky0065/enokMethode.git"
    },
    "bugs": {
        "url": "https://github.com/tky0065/enokMethode/issues"
    },
    "homepage": "https://github.com/tky0065/enokMethode#readme",
    "engines": {
        "node": ">=18.0.0"
    }
}
```

### 1.3 Linting & Formatting

- [ ] Ajouter **ESLint** avec config recommandée
- [ ] Ajouter **Prettier** pour le formatting
- [ ] Script `npm run lint` et `npm run format`
- [ ] Fichier `.eslintrc.json` avec règles
- [ ] Fichier `.prettierrc` avec config
- [ ] Fichier `.prettierignore`

**Dépendances**:

```json
{
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "eslint-config-prettier": "^9.0.0"
}
```

---

## Phase 2 : Nouvelles Fonctionnalités CLI

### 2.1 Commandes Utilitaires

- [ ] `enokmethod status` : Affiche l'état actuel (spec active, mémoire récente)
- [ ] `enokmethod list` : Liste les specs archivées
- [ ] `enokmethod context` : Affiche le CONTEXT.md formaté
- [ ] `enokmethod memory` : Affiche la MEMORY.md formatée
- [ ] `enokmethod validate` : Valide la structure `.enokMethod/`

**Détails des commandes**:

#### `enokmethod status`

Affiche:

- Spec active (si `CURRENT_SPEC.md` existe)
- Dernières entrées de MEMORY.md
- État de la stack (détectée vs configurée)
- Nombre de specs archivées

#### `enokmethod list`

Options:

- `--limit <n>` : Limite le nombre de résultats
- `--format <json|table>` : Format de sortie
- `--search <term>` : Recherche dans les noms

#### `enokmethod validate`

Vérifie:

- Présence de `.enokMethod/`
- Présence de CONTEXT.md, MEMORY.md
- Validité du format des fichiers
- Cohérence des références

### 2.2 Mode Interactif

- [ ] Ajouter **inquirer** pour un mode interactif
- [ ] `enokmethod init --interactive` : Guide l'utilisateur pas à pas
- [ ] `enokmethod spec` (sans titre) : Demande le titre interactivement
- [ ] `enokmethod wizard` : Assistant complet de création de projet

**Dépendances**:

```json
{
    "inquirer": "^9.0.0"
}
```

**Exemple de workflow interactif**:

```
? Quel est le nom de votre projet? › my-app
? Quel type de projet? › Next.js / FastAPI / Flutter / Autre
? Quelle base de données? › PostgreSQL / MongoDB / Supabase / Aucune
? Voulez-vous activer les tests? › Oui / Non
```

### 2.3 Amélioration de `init`

- [ ] Option `--force` pour réinitialiser
- [ ] Option `--template <preset>` (nextjs, fastapi, etc.)
- [ ] Génération automatique de `.gitignore` adapté
- [ ] Option `--dry-run` pour prévisualiser
- [ ] Backup automatique si `.enokMethod/` existe déjà

**Nouveaux templates `.gitignore`**:

- Template pour Next.js
- Template pour Python
- Template pour Go
- Template générique

---

## Phase 3 : Enrichissement des Templates ## PAS DE ADR OU terme de metier ca vas complexier la methode pour rien

### 3.1 Nouveaux Templates

- [ ] **DECISIONS.md** : Log des décisions d'architecture (ADR - Architecture Decision Records)
- [ ] **GLOSSARY.md** : Termes métier du projet
- [ ] **PROMPTS_CUSTOM.md** : Prompts personnalisés par projet

**Structure DECISIONS.md**:

```markdown
# Architecture Decision Records

## ADR-001: [Titre de la décision]

- **Date**: YYYY-MM-DD
- **Statut**: Accepté / Rejeté / Déprécié
- **Contexte**: Pourquoi cette décision était nécessaire
- **Décision**: Ce qui a été décidé
- **Conséquences**: Impact de cette décision
```

**Structure GLOSSARY.md**:

```markdown
# Glossaire du Projet

## Termes Métier

- **Terme 1**: Définition
- **Terme 2**: Définition

## Termes Techniques

- **Pattern X**: Explication
```

### 3.2 Presets par Stack

- [ ] Preset **Next.js** (avec structure recommandée)
- [ ] Preset **FastAPI** (architecture Python)
- [ ] Preset **Flutter** (mobile)
- [ ] Preset **Monorepo** (pnpm/turborepo)

**Chaque preset inclut**:

- CONTEXT.md pré-rempli avec la stack
- Structure de dossiers recommandée
- Conventions de nommage spécifiques
- Exemples de SPEC.md adaptés

**Fichiers à créer**:

- `.enokMethod/presets/nextjs.json`
- `.enokMethod/presets/fastapi.json`
- `.enokMethod/presets/flutter.json`
- `.enokMethod/presets/monorepo.json`

### 3.3 Amélioration des Prompts Agents

- [ ] Prompt **QA/Reviewer** : Pour la review de code
- [ ] Prompt **Documenter** : Pour générer la documentation
- [ ] Prompt **Debugger** : Spécialisé débogage

**Nouveaux fichiers**:

- `.enokMethod/prompts/reviewer.md`
- `.enokMethod/prompts/documenter.md`
- `.enokMethod/prompts/debugger.md`

**Prompt Reviewer**:

```markdown
# Role: Senior Code Reviewer

Your goal is to review code changes against the CURRENT_SPEC.md.

## Checklist:

- [ ] Code follows conventions in CONTEXT.md
- [ ] All acceptance criteria are met
- [ ] No security vulnerabilities
- [ ] Performance considerations
- [ ] Tests are present and passing
```

---

## Phase 4 : Intégrations Avancées

### 4.1 Support Windsurf (IDE Codeium)

- [ ] Créer adapter `--adapter windsurf`
- [ ] Template `.windsurfrules` équivalent
- [ ] Documentation spécifique Windsurf

**Fichier à créer**:

- `.enokMethod/templates/windsurfrules`

### 4.2 Support Aider (CLI AI)

- [ ] Créer adapter `--adapter aider`
- [ ] Fichier `.aider.conf.yaml` avec conventions
- [ ] Documentation spécifique Aider

**Fichier à créer**:

- `.enokMethod/templates/aider.conf.yaml`

### 4.3 Intégration Git

- [ ] `enokmethod commit` : Commit automatique avec message basé sur la spec
- [ ] Hook pre-commit pour valider la structure
- [ ] Génération automatique de changelog
- [ ] `enokmethod release` : Prépare une release

**Commande `enokmethod commit`**:

- Lit CURRENT_SPEC.md
- Génère un message de commit conventionnel
- Propose le message à l'utilisateur
- Commit avec le message validé

**Format de commit**:

```
feat(spec-name): Brief description

- Requirement 1 completed
- Requirement 2 completed

Closes: CURRENT_SPEC.md
```

---

## Phase 5 : Distribution & Communauté

### 5.1 Publication npm

- [ ] Publier sur npm : `npm publish`
- [ ] Ajouter badge npm dans README
- [ ] Ajouter badge de tests (CI)
- [ ] Ajouter badge de couverture
- [ ] Configurer npm provenance

**Badges à ajouter au README**:

```markdown
[![npm version](https://badge.fury.io/js/enokmethod.svg)](https://www.npmjs.com/package/enokmethod)
[![Tests](https://github.com/tky0065/enokMethode/workflows/Tests/badge.svg)](https://github.com/tky0065/enokMethode/actions)
[![Coverage](https://codecov.io/gh/tky0065/enokMethode/branch/main/graph/badge.svg)](https://codecov.io/gh/tky0065/enokMethode)
```

### 5.2 GitHub Actions CI/CD

- [ ] Workflow de tests automatiques
- [ ] Publication automatique sur tag
- [ ] Vérification des PR
- [ ] Analyse de code (CodeQL)
- [ ] Vérification des dépendances (Dependabot)

**Fichiers à créer**:

- `.github/workflows/test.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/codeql.yml`
- `.github/dependabot.yml`

**Exemple workflow test.yml**:

```yaml
name: Tests
on: [push, pull_request]
jobs:
    test:
        runs-on: ubuntu-latest
        strategy:
            matrix:
                node-version: [18, 20, 22]
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: ${{ matrix.node-version }}
            - run: npm ci
            - run: npm test
            - run: npm run lint
```

### 5.3 Documentation Enrichie

- [ ] Guide de contribution `CONTRIBUTING.md`
- [ ] Code de conduite `CODE_OF_CONDUCT.md`
- [ ] Changelog `CHANGELOG.md`
- [ ] Site de documentation (Docusaurus/VitePress)
- [ ] Exemples d'utilisation dans `examples/`

**Fichiers à créer**:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `CHANGELOG.md`
- `examples/nextjs-example/`
- `examples/fastapi-example/`
- `docs/` (site de documentation)

**Structure CONTRIBUTING.md**:

```markdown
# Contributing to EnokMethod

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Run tests: `npm test`

## Pull Request Process

1. Update tests
2. Update documentation
3. Follow conventional commits
4. Ensure CI passes
```

---

## Phase 6 : Fonctionnalités Avancées (Vision Long Terme)

### 6.1 Analyse de Complexité

- [ ] Estimation du temps par spec basée sur l'historique
- [ ] Métriques de productivité
- [ ] Rapport de vélocité
- [ ] Détection de patterns récurrents

**Commandes**:

- `enokmethod stats` : Statistiques globales
- `enokmethod estimate <spec>` : Estimation de temps
- `enokmethod report` : Génère un rapport de productivité

**Métriques collectées**:

- Temps moyen par spec
- Nombre de specs par semaine
- Complexité moyenne (lignes de code modifiées)
- Taux de réussite (specs complétées vs abandonnées)

**Fichier de données**:

- `.enokMethod/analytics.json` (local, non versionné)

---

## 📋 Priorités Recommandées

| Priorité       | Phase                          | Effort | Impact     | Estimation |
| -------------- | ------------------------------ | ------ | ---------- | ---------- |
| 🔴 **HAUTE**   | Phase 1.1 (Tests)              | Moyen  | Très élevé | 2-3 jours  |
| 🔴 **HAUTE**   | Phase 1.2 (package.json)       | Faible | Élevé      | 1 heure    |
| 🔴 **HAUTE**   | Phase 2.1 (Status/Validate)    | Faible | Élevé      | 1 jour     |
| 🟡 **MOYENNE** | Phase 1.3 (Linting)            | Faible | Moyen      | 2 heures   |
| 🟡 **MOYENNE** | Phase 2.2 (Interactif)         | Moyen  | Moyen      | 1-2 jours  |
| 🟡 **MOYENNE** | Phase 5.2 (CI/CD)              | Moyen  | Élevé      | 1 jour     |
| 🟡 **MOYENNE** | Phase 5.3 (Documentation)      | Moyen  | Élevé      | 2 jours    |
| 🟢 **BASSE**   | Phase 3.1 (Nouveaux templates) | Faible | Moyen      | 1 jour     |
| 🟢 **BASSE**   | Phase 3.2 (Presets)            | Moyen  | Moyen      | 2 jours    |
| 🟢 **BASSE**   | Phase 3.3 (Nouveaux prompts)   | Faible | Moyen      | 1 jour     |
| 🟢 **BASSE**   | Phase 4.1 (Windsurf)           | Faible | Faible     | 2 heures   |
| 🟢 **BASSE**   | Phase 4.2 (Aider)              | Faible | Faible     | 2 heures   |
| 🟢 **BASSE**   | Phase 4.3 (Git integration)    | Moyen  | Moyen      | 1-2 jours  |
| ⚪ **FUTUR**   | Phase 6.1 (Analytics)          | Élevé  | Moyen      | 3-4 jours  |

---

## 🎯 Roadmap Suggérée

### Sprint 1 (Semaine 1) - Fondations

- ✅ Phase 1.2 : Amélioration package.json
- ✅ Phase 1.3 : Linting & Formatting
- ✅ Phase 1.1 : Tests (début)

### Sprint 2 (Semaine 2) - Tests & Validation

- ✅ Phase 1.1 : Tests (fin)
- ✅ Phase 2.1 : Commandes utilitaires
- ✅ Phase 5.2 : CI/CD

### Sprint 3 (Semaine 3) - Expérience Utilisateur

- ✅ Phase 2.2 : Mode interactif
- ✅ Phase 2.3 : Amélioration init
- ✅ Phase 3.1 : Nouveaux templates

### Sprint 4 (Semaine 4) - Enrichissement

- ✅ Phase 3.2 : Presets par stack
- ✅ Phase 3.3 : Nouveaux prompts
- ✅ Phase 5.3 : Documentation

### Sprint 5 (Semaine 5) - Intégrations

- ✅ Phase 4.1 : Windsurf
- ✅ Phase 4.2 : Aider
- ✅ Phase 4.3 : Git integration
- ✅ Phase 5.1 : Publication npm

### Sprint 6+ (Futur) - Avancé

- ✅ Phase 6.1 : Analytics

---

## 📝 Notes d'Implémentation

### Compatibilité

- Maintenir la compatibilité avec Node.js 18+
- Tester sur macOS, Linux, Windows
- Support des shells : bash, zsh, fish

### Performance

- Garder le CLI rapide (< 100ms pour les commandes simples)
- Lazy loading des dépendances lourdes
- Cache pour la détection de stack

### Sécurité

- Validation des entrées utilisateur
- Pas d'exécution de code arbitraire
- Sanitization des noms de fichiers

### Extensibilité

- Architecture modulaire
- API pour plugins tiers
- Hooks pour personnalisation

---

## ✅ Critères de Succès

### Phase 1

- [ ] Couverture de tests > 80%
- [ ] Zéro erreur ESLint
- [ ] Package.json complet et valide

### Phase 2

- [ ] Toutes les commandes utilitaires fonctionnelles
- [ ] Mode interactif testé et documenté

### Phase 3

- [ ] Au moins 3 presets disponibles
- [ ] Tous les nouveaux templates documentés

### Phase 4

- [ ] Support de 2+ nouveaux IDE/outils
- [ ] Intégration Git fonctionnelle

### Phase 5

- [ ] Package publié sur npm
- [ ] CI/CD opérationnel
- [ ] Documentation complète

### Phase 6

- [ ] Analytics fonctionnels
- [ ] Rapports générés correctement

---

## 🔄 Processus de Mise à Jour

Ce plan sera mis à jour régulièrement :

- ✅ Marquer les tâches complétées
- 📝 Ajouter des notes d'implémentation
- 🔄 Ajuster les priorités selon les retours
- 📊 Tracker le progrès global

**Dernière mise à jour**: 2025-12-29
