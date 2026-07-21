# Receipt V2 Privacy and Disclosure Model

## Status

Repository-stage design. Receipt V2 is not an onchain receipt contract and does not yet implement encrypted or selective disclosure.

## Default rule

Store the minimum evidence required to verify settlement. Public proof should contain hashes and non-sensitive chain references. Commercial context, authorization records and delivery evidence remain offchain unless their owner explicitly authorizes disclosure.

## Field classes

### Public or independently observable

- schema identifier
- receipt ID
- chain ID
- transaction hash and block number after confirmation
- asset address
- settlement state
- policy version hash
- witness state names without private evidence payloads

### Hash by default

- exact policy definition
- request and quote
- delivery evidence
- commercial terms
- acceptance or dispute evidence
- external payment metadata

### Private by default

- raw authorization documents
- customer or counterparty identity
- API credentials and wallet secrets
- invoices and non-public prices
- internal budgets
- complete delivery artifacts
- personal data

## Disclosure authorization

Receipt V2 currently records hashes and references only. Any future disclosure mechanism must require explicit authorization from the evidence owner, define the recipient and purpose, bind the disclosed object to its recorded hash, and produce a new disclosure event. A generic possession of a receipt is not disclosure authorization.

## Verification boundaries

- A valid receipt hash proves object integrity only.
- A chain transaction proves inclusion and execution status only.
- A payment proof does not prove delivery, acceptance or commercial intent.
- A policy hash does not prove that the signer understood the policy.
- Conflicting witnesses move the settlement to `disputed`.
- Missing RPC data never proves that a transfer was not submitted.

## Prohibited claims until implemented

- selective disclosure is live
- private receipt fields are encrypted by Clicks
- full receipts are stored onchain
- delivery is independently verified by Clicks
- a receipt alone resolves disputes

## Future work

The next privacy phase may add encrypted evidence envelopes, owner-scoped disclosure grants and optional ERC-8004 attestations containing only schema references and hashes. It requires a separate security and privacy review before release.
