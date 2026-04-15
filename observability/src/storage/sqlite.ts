import fs from 'node:fs';
import path from 'node:path';

import { env } from '../config/env';

export interface StatementLike {
  run(...params: unknown[]): unknown;
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
}

export interface DatabaseLike {
  exec(sql: string): void;
  prepare(sql: string): StatementLike;
  close(): void;
}

type DatabaseSyncConstructor = new (filename: string) => DatabaseLike;

const { DatabaseSync } = require('node:sqlite') as {
  DatabaseSync: DatabaseSyncConstructor;
};

let dbInstance: DatabaseLike | null = null;

function resolveSchemaPath(): string {
  const candidates = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '../../src/storage/schema.sql'),
    path.resolve(process.cwd(), 'src/storage/schema.sql'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Could not locate storage/schema.sql');
}

export function getDb(): DatabaseLike {
  if (dbInstance) {
    return dbInstance;
  }

  fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });

  const db = new DatabaseSync(env.dbPath);
  db.exec(fs.readFileSync(resolveSchemaPath(), 'utf8'));
  dbInstance = db;

  return db;
}

export function closeDb(): void {
  if (!dbInstance) {
    return;
  }

  dbInstance.close();
  dbInstance = null;
}

export function withTransaction<T>(db: DatabaseLike, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
