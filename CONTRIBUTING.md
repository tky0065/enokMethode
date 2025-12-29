# Contributing to EnokMethod

Thank you for your interest in contributing to EnokMethod! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Development Setup

1. **Fork the repository**

    ```bash
    # Click the "Fork" button on GitHub
    ```

2. **Clone your fork**

    ```bash
    git clone https://github.com/YOUR_USERNAME/enokMethode.git
    cd enokMethode
    ```

3. **Install dependencies**

    ```bash
    npm install
    ```

4. **Run tests**
    ```bash
    npm test
    ```

## 🧪 Testing

We use Vitest for testing. Please ensure all tests pass before submitting a PR.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Place tests in the `tests/` directory
- Name test files with `.test.js` extension
- Aim for >80% code coverage
- Test both happy paths and edge cases

## 📝 Code Style

We use ESLint and Prettier for code formatting.

```bash
# Check formatting
npm run format:check

# Auto-fix formatting
npm run format

# Lint code
npm run lint
```

### Code Conventions

- Use `const` by default, `let` when necessary, never `var`
- Prefer arrow functions
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## 🔀 Pull Request Process

1. **Create a feature branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Make your changes**
    - Write clean, tested code
    - Follow the code style guidelines
    - Update documentation if needed

3. **Commit your changes**

    We follow [Conventional Commits](https://www.conventionalcommits.org/):

    ```bash
    git commit -m "feat: add new command for listing specs"
    git commit -m "fix: resolve issue with spec archiving"
    git commit -m "docs: update README with new examples"
    ```

    Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

4. **Push to your fork**

    ```bash
    git push origin feature/your-feature-name
    ```

5. **Open a Pull Request**
    - Provide a clear description of the changes
    - Reference any related issues
    - Ensure CI checks pass

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the bug
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, Node version, npm version
- **Logs**: Any relevant error messages or logs

## 💡 Suggesting Features

We welcome feature suggestions! Please:

- Check if the feature has already been suggested
- Provide a clear use case
- Explain how it aligns with EnokMethod's philosophy
- Consider implementation complexity

## 📚 Documentation

- Update README.md for user-facing changes
- Update JSDoc comments for API changes
- Add examples when introducing new features
- Keep documentation clear and concise

## 🎯 Project Philosophy

EnokMethod is built on these principles:

1. **Simplicity**: Keep it minimal and focused
2. **Context Efficiency**: Optimize for AI context management
3. **Developer-First**: Prioritize developer experience
4. **Fluidity**: Smooth transitions between idea and code

Please keep these principles in mind when contributing.

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/tky0065/enokMethode/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tky0065/enokMethode/discussions)

## 📜 Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community.

## 🙏 Thank You

Your contributions make EnokMethod better for everyone. Thank you for taking the time to contribute!
