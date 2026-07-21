import { keccak256, toUtf8Bytes } from 'ethers';
import type { SettlementReceiptV2 } from './receipts';
import { verifySettlementReceiptV2 } from './receipts';
import { assertSettlementTransition } from './settlement-state';

export interface SettlementLedgerEntry {
  sequence: number;
  recordedAt: string;
  previousEntryHash: string | null;
  entryHash: string;
  receipt: SettlementReceiptV2;
}

function ledgerEntryHash(
  sequence: number,
  recordedAt: string,
  previousEntryHash: string | null,
  receiptId: string,
): string {
  return keccak256(toUtf8Bytes(JSON.stringify({ sequence, recordedAt, previousEntryHash, receiptId })));
}

export class SettlementReceiptLedger {
  private readonly entries: SettlementLedgerEntry[];

  constructor(entries: SettlementLedgerEntry[] = []) {
    this.entries = entries.map((entry) => structuredClone(entry));
    if (!this.verify()) throw new Error('Invalid settlement ledger');
  }

  append(receipt: SettlementReceiptV2, recordedAt = new Date().toISOString()): SettlementLedgerEntry {
    if (!verifySettlementReceiptV2(receipt)) throw new Error('Invalid settlement receipt hash');
    const sameReceipt = this.entries.find((entry) => entry.receipt.receiptId === receipt.receiptId);
    if (sameReceipt) throw new Error(`Duplicate settlement receipt: ${receipt.receiptId}`);

    const sameIdempotencyKey = [...this.entries].reverse().find(
      (entry) => entry.receipt.idempotencyKey === receipt.idempotencyKey,
    );
    if (sameIdempotencyKey) {
      const previous = sameIdempotencyKey.receipt;
      const sameEconomicEvent = previous.businessEventId === receipt.businessEventId
        && previous.agent.toLowerCase() === receipt.agent.toLowerCase()
        && previous.asset.toLowerCase() === receipt.asset.toLowerCase()
        && previous.grossAmount === receipt.grossAmount
        && previous.requestHash === receipt.requestHash;
      if (!sameEconomicEvent) {
        throw new Error(`Idempotency conflict: ${receipt.idempotencyKey}`);
      }
      if (previous.execution.state !== receipt.execution.state) {
        assertSettlementTransition(previous.execution.state, receipt.execution.state);
      }
    }

    const previous = this.entries.at(-1);
    const sequence = this.entries.length;
    const previousEntryHash = previous?.entryHash ?? null;
    const entry: SettlementLedgerEntry = {
      sequence,
      recordedAt,
      previousEntryHash,
      entryHash: ledgerEntryHash(sequence, recordedAt, previousEntryHash, receipt.receiptId),
      receipt: structuredClone(receipt),
    };
    this.entries.push(entry);
    return structuredClone(entry);
  }

  getTrail(id: string): SettlementLedgerEntry[] {
    return this.entries
      .filter((entry) => entry.receipt.receiptId === id
        || entry.receipt.idempotencyKey === id
        || entry.receipt.businessEventId === id
        || entry.receipt.settlementReference === id)
      .map((entry) => structuredClone(entry));
  }

  export(): SettlementLedgerEntry[] {
    return this.entries.map((entry) => structuredClone(entry));
  }

  verify(): boolean {
    const receiptIds = new Set<string>();
    const latestByIdempotencyKey = new Map<string, SettlementReceiptV2>();
    for (let index = 0; index < this.entries.length; index += 1) {
      const entry = this.entries[index];
      const expectedPrevious = index === 0 ? null : this.entries[index - 1].entryHash;
      if (entry.sequence !== index || entry.previousEntryHash !== expectedPrevious) return false;
      if (!verifySettlementReceiptV2(entry.receipt)) return false;
      if (entry.entryHash !== ledgerEntryHash(index, entry.recordedAt, expectedPrevious, entry.receipt.receiptId)) return false;
      if (receiptIds.has(entry.receipt.receiptId)) return false;
      receiptIds.add(entry.receipt.receiptId);

      const previous = latestByIdempotencyKey.get(entry.receipt.idempotencyKey);
      if (previous) {
        const sameEconomicEvent = previous.businessEventId === entry.receipt.businessEventId
          && previous.agent.toLowerCase() === entry.receipt.agent.toLowerCase()
          && previous.asset.toLowerCase() === entry.receipt.asset.toLowerCase()
          && previous.grossAmount === entry.receipt.grossAmount
          && previous.requestHash === entry.receipt.requestHash;
        if (!sameEconomicEvent) return false;
        if (previous.execution.state !== entry.receipt.execution.state) {
          try {
            assertSettlementTransition(previous.execution.state, entry.receipt.execution.state);
          } catch {
            return false;
          }
        }
      }
      latestByIdempotencyKey.set(entry.receipt.idempotencyKey, entry.receipt);
    }
    return true;
  }
}
