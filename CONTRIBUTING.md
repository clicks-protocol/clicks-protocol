# Contributing to Clicks Protocol

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/clicks-protocol.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Pull Requests

- Keep PRs focused on a single change
- Include tests for new functionality
- Make sure all existing tests pass (`npx hardhat test`)
- Write clear commit messages

## Issues

- Use GitHub Issues for bug reports and feature requests
- Include steps to reproduce for bugs
- Check existing issues before opening a new one

## Code Style

- Solidity: follow the existing contract patterns, Solidity ^0.8.20
- TypeScript: use the project's existing ESLint/Prettier config
- Keep functions small and well-documented

## Security

If you find a security vulnerability, please email security@clicksprotocol.xyz instead of opening a public issue.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
