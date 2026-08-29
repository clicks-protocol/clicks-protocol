# Security Policy

## Supported Versions

The following versions of Clicks Protocol are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously at Clicks Protocol. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Disclose Publicly

Please **DO NOT** open a public issue or disclose the vulnerability publicly until we have had a chance to address it.

### 2. Contact Us Privately

Send an email to **security@clicksprotocol.xyz** with the following information:

- **Subject**: `[SECURITY] Brief description of the vulnerability`
- **Description**: Detailed description of the vulnerability
- **Impact**: What could an attacker do with this vulnerability?
- **Reproduction Steps**: Clear steps to reproduce the issue
- **Affected Versions**: Which versions are affected?
- **Suggested Fix** (optional): If you have a suggestion for fixing the issue

### 3. Response Timeline

We aim to respond to security reports within **48 hours** and will keep you updated on our progress:

- **Initial Response**: Within 48 hours
- **Assessment Complete**: Within 7 days
- **Fix Deployed**: Within 30 days (depending on severity)

### 4. Disclosure Policy

Once the vulnerability is fixed:

- We will credit you in our security acknowledgments (unless you prefer to remain anonymous)
- We will publish a security advisory detailing the issue and fix
- We will request a CVE identifier if appropriate

## Security Measures

### Smart Contract Security

- All smart contracts are audited by reputable third-party security firms
- Contracts use industry-standard security patterns (ReentrancyGuard, SafeMath, etc.)
- Admin functions are protected with multi-signature requirements
- Emergency pause functionality is implemented

### Operational Security

- Multi-signature wallets for all privileged operations
- Regular security reviews of infrastructure
- Encrypted backups and secure key management

## Verified Contract Addresses

All smart contracts are deployed on **Base Mainnet**:

| Contract | Address | Verified |
|----------|---------|----------|
| Clicks Core | `0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3` | :white_check_mark: |

Verify all contracts on [BaseScan](https://basescan.org/).

## Security Resources

- [Audit Reports](./audits/)
- [Bug Bounty Program](https://clicksprotocol.xyz/bug-bounty)
- [Security Documentation](https://docs.clicksprotocol.xyz/security)

## Security Acknowledgments

We thank the following security researchers who have responsibly disclosed vulnerabilities:

*No vulnerabilities have been reported yet. Be the first!*

---

Last updated: March 2025
