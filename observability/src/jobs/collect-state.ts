import { env } from '../config/env';
import { collectProtocolStateSnapshot } from '../collectors/contract-state';
import { insertProtocolStateSnapshot } from '../storage/queries';
import { closeDb, getDb } from '../storage/sqlite';

async function main(): Promise<void> {
  const db = getDb();
  const snapshot = await collectProtocolStateSnapshot({
    rpcUrl: env.baseRpcUrl,
  });

  insertProtocolStateSnapshot(db, snapshot);

  console.log(JSON.stringify(snapshot, null, 2));
  closeDb();
}

void main().catch((error) => {
  console.error(error);
  closeDb();
  process.exitCode = 1;
});
