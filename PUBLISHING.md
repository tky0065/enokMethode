# Publishing Guide

This guide explains how to publish a new version of EnokMethod to npm.

## Prerequisites

1. **npm Account**: You must have an npm account with publish rights
2. **GitHub Access**: Push access to the repository
3. **npm Token**: Set up `NPM_TOKEN` secret in GitHub repository settings

## Publishing Process

### 1. Update Version

Update the version in `package.json`:

```bash
# For patch release (1.1.0 -> 1.1.1)
npm version patch

# For minor release (1.1.0 -> 1.2.0)
npm version minor

# For major release (1.1.0 -> 2.0.0)
npm version major
```

### 2. Update CHANGELOG.md

Add a new section for the version:

```markdown
## [1.2.0] - 2025-MM-DD

### Added

- New feature X
- New feature Y

### Changed

- Updated Z

### Fixed

- Bug fix A
```

### 3. Commit Changes

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to 1.2.0"
```

### 4. Create and Push Tag

```bash
# Create tag
git tag v1.2.0

# Push commits and tag
git push origin main
git push origin v1.2.0
```

### 5. Automatic Publication

Once the tag is pushed, GitHub Actions will automatically:

1. Run all tests
2. Publish to npm with provenance
3. Create a GitHub Release

### 6. Verify Publication

Check that the package was published:

```bash
npm view enokmethod version
```

Visit: https://www.npmjs.com/package/enokmethod

## Manual Publication (Emergency)

If automatic publication fails, you can publish manually:

```bash
# Login to npm
npm login

# Run tests
npm test

# Publish
npm publish --access public
```

## Rollback

If you need to rollback a version:

```bash
# Deprecate the bad version
npm deprecate enokmethod@1.2.0 "This version has critical bugs, use 1.1.0 instead"

# Or unpublish within 72 hours
npm unpublish enokmethod@1.2.0
```

## Version Strategy

- **Patch** (1.1.x): Bug fixes, documentation updates
- **Minor** (1.x.0): New features, non-breaking changes
- **Major** (x.0.0): Breaking changes

## Checklist Before Publishing

- [ ] All tests pass locally (`npm test`)
- [ ] CHANGELOG.md is updated
- [ ] Version number is correct in package.json
- [ ] README.md is up to date
- [ ] No uncommitted changes
- [ ] Branch is up to date with main

## Troubleshooting

### Publication Fails

1. Check GitHub Actions logs
2. Verify NPM_TOKEN secret is set
3. Ensure npm account has publish rights
4. Check if version already exists

### Tag Already Exists

```bash
# Delete local tag
git tag -d v1.2.0

# Delete remote tag
git push origin :refs/tags/v1.2.0

# Recreate tag
git tag v1.2.0
git push origin v1.2.0
```

## Post-Publication

1. Verify package on npm
2. Test installation: `npx enokmethod@latest --version`
3. Update GitHub Release notes if needed
4. Announce on social media/discussions
