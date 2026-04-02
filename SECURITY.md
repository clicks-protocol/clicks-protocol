# Security Policy

## Supported Versions

The following versions of Clicks Protocol are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Clicks Protocol seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do NOT:

- **Do not** open a public issue on GitHub
- **Do not** disclose the vulnerability publicly before a fix is released
- **Do not** exploit the vulnerability for any reason

### Please DO:

- **Do** report vulnerabilities privately to: **security@clicksprotocol.xyz**
- **Do** include as much detail as possible about the vulnerability
- **Do** include steps to reproduce the issue
- **Do** include any proof-of-concept code if available
- **Do** allow us reasonable time to address the issue before any public disclosure

## What to Expect

When you report a vulnerability:

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Investigation**: We will investigate and validate the vulnerability
3. **Updates**: We will provide updates on our progress at least every 7 days
4. **Resolution**: Once fixed, we will notify you and discuss public disclosure timing
5. **Recognition**: With your permission, we will credit you in our security advisories

## Security Measures

Clicks Protocol implements the following security measures:

### Smart Contract Security

- **Audits**: All contracts undergo professional third-party security audits
- **Formal Verification**: Critical functions use formal verification where applicable
- **Bug Bounty**: Active bug bounty program for white-hat hackers
- **Upgradeability**: Proxy pattern allows for security patches without data migration

### Operational Security

- **Multi-sig**: Critical operations require multi-signature authorization
- **Timelock**: Administrative actions have a mandatory delay period
- **Monitoring**: 24/7 on-chain monitoring for suspicious activity
- **Incident Response**: Documented incident response procedures

### Dependency Security

- **Dependency Scanning**: Automated scanning of all dependencies
- **Minimal Dependencies**: Core contracts minimize external dependencies
- **Version Pinning**: All dependencies are pinned to specific versions

## Smart Contract Addresses (Base Mainnet)

| Contract | Address | Verification |
|----------|---------|--------------|
| Clicks Router | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` | [Basescan](https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3) |

## Security Resources

- [Security Audit Reports](./docs/security-audit.md)
- [Exploit Test Cases](./docs/security-exploit-tests.md)
- [Vault Routing Architecture](./docs/vault-routing-architecture.md)

## Acknowledgments

We thank the following security researchers who have responsibly disclosed vulnerabilities:

*No disclosed vulnerabilities to date*

## License

This security policy is provided under the same license as the Clicks Protocol project (MIT License).
