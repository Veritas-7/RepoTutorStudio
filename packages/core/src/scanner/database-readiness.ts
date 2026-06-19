import type { DatabaseMigrationReadinessReport, DatabaseOrmReadinessReport, DatabaseReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

function firstMatch(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match?.[1] ?? null;
}

export async function buildDatabaseReadinessReport(walk: WalkResult): Promise<DatabaseReadinessReport> {
  const sourceFiles = await databaseSourceFiles(walk);
  const schemaFiles = databaseSchemaFiles(sourceFiles);
  const datasourceSignals = databaseDatasourceSignals(schemaFiles, sourceFiles);
  const migrationSignals = databaseMigrationSignals(sourceFiles);
  const clientSignals = databaseClientSignals(sourceFiles);
  const configSignals = databaseConfigSignals(sourceFiles);
  const modelSignals = databaseModelSignals(sourceFiles);
  const hasPrismaText = sourceFiles.length > 0;
  const hasSchema = schemaFiles.length > 0;
  const hasPrismaPackage = configSignals.some((item) => item.signal === "package-script" && item.readiness === "ready");
  const hasMigration = migrationSignals.some((item) => ["migrations-folder", "migration-sql", "migrate-dev", "migrate-deploy"].includes(item.signal) && item.readiness === "ready");
  const hasGenerate = clientSignals.some((item) => item.signal === "client-generation" && item.readiness === "ready");
  const hasDatabaseUrl = configSignals.some((item) => item.signal === "database-url" && item.readiness === "ready");
  const hasSeed = configSignals.some((item) => item.signal === "seed" && item.readiness === "ready");
  const hasClientUse = clientSignals.some((item) => item.signal === "prisma-client" && item.readiness === "ready");

  const riskQueue: DatabaseReadinessReport["riskQueue"] = [];
  if (hasPrismaPackage && !hasSchema) {
    riskQueue.push({
      priority: "high",
      action: "Add or locate a Prisma schema file before treating the database layer as documented.",
      why: "Prisma readiness starts with schema.prisma or an explicit schema path; package scripts alone do not show datasource, generator, or model shape.",
      relatedHref: "html/database-readiness.html"
    });
  }
  if (hasSchema && !hasDatabaseUrl) {
    riskQueue.push({
      priority: "high",
      action: "Document the datasource URL boundary through prisma.config, DATABASE_URL, or an env example.",
      why: "Prisma CLI commands and generated clients need a reproducible datasource configuration before learners can run validate, generate, or migrate safely.",
      relatedHref: "html/database-readiness.html"
    });
  }
  if (hasSchema && !hasGenerate) {
    riskQueue.push({
      priority: "high",
      action: "Add a Prisma Client generation command or explain how generation is triggered.",
      why: "The schema is not enough for application code; Prisma Client generation connects models to type-safe query code.",
      relatedHref: "html/database-readiness.html"
    });
  }
  if (hasSchema && !hasMigration) {
    riskQueue.push({
      priority: "medium",
      action: "Choose a migration path such as migrate dev/deploy or document intentional db push usage.",
      why: "Prisma distinguishes declarative migrations from db push prototyping; RepoTutor should show which path protects database drift.",
      relatedHref: "html/database-readiness.html"
    });
  }
  if (hasSchema && !hasClientUse) {
    riskQueue.push({
      priority: "medium",
      action: "Point learners to the runtime code that imports PrismaClient or a generated client output.",
      why: "Schema and migrations explain structure, but application learning needs to see where queries enter the runtime.",
      relatedHref: "html/database-readiness.html"
    });
  }
  if (hasSchema && !hasSeed) {
    riskQueue.push({
      priority: "low",
      action: "Add a seed command or sample data note when local learning depends on database content.",
      why: "A generated client can connect successfully while the learner still has no realistic data to inspect.",
      relatedHref: "html/database-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: hasPrismaText ? "Run Prisma commands on the original source tree before treating this report as database approval." : "If this repository later adds a database layer, rerun RepoTutor to populate Prisma readiness.",
    why: "RepoTutor records static database readiness only; it does not connect to databases, run migrations, introspect schemas, generate clients, or seed data.",
    relatedHref: "html/database-readiness.html"
  });

  return {
    summary: `Prisma식 database readiness report: schema ${schemaFiles.length}개, datasource signal ${datasourceSignals.length}개, migration signal ${migrationSignals.length}개, client signal ${clientSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Prisma schema datasource generator model migrate generate db push seed PrismaClient DATABASE_URL driver adapter migrations",
    schemaFiles,
    datasourceSignals,
    migrationSignals,
    clientSignals,
    configSignals,
    modelSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx prisma validate", purpose: "Validate Prisma schema syntax and datasource/generator configuration." },
      { command: "npx prisma format", purpose: "Format schema.prisma so models, relations, and attributes are easier to inspect." },
      { command: "npx prisma generate", purpose: "Generate Prisma Client from the schema before checking runtime query code." },
      { command: "npx prisma migrate dev", purpose: "Create and apply a development migration against a safe local database." },
      { command: "npx prisma migrate deploy", purpose: "Apply committed migrations in deployment or CI environments." },
      { command: "npx prisma db seed", purpose: "Load seed data when local learning or tests need realistic rows." },
      { command: "npx prisma studio", purpose: "Open a database GUI for manual inspection after the datasource is safe." }
    ],
    learnerNextSteps: [
      "Start with schema.prisma: confirm datasource provider, generator output, model count, IDs, relations, and indexes.",
      "Separate prototype db push workflows from committed migration workflows before changing shared databases.",
      "Trace PrismaClient imports or generated client output to see where application code begins database queries.",
      "RepoTutor does not run Prisma commands, connect to databases, or generate clients; run the recommended commands on the original source tree."
    ]
  };
}

type DatabaseSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function databaseSourceFiles(walk: WalkResult): Promise<DatabaseSourceFile[]> {
  const files: DatabaseSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !databaseInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!databasePathSignal(file.relPath) && !databaseContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function databaseInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(schema\.prisma|prisma\.config\.[cm]?[jt]s|package\.json|docker-compose\.ya?ml|compose\.ya?ml|\.env\.example|\.env\.sample|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(prisma|migrations|db|database|seed|seeds)\//i.test(filePath)
    || /\.(prisma|sql|[cm]?[jt]sx?|json|ya?ml|md)$/i.test(filePath);
}

function databasePathSignal(filePath: string): boolean {
  return /(schema\.prisma|prisma\.config|prisma\/|migrations\/|migration\.sql|seed|database|db\/|docker-compose|compose\.ya?ml|\.env\.example|\.env\.sample)/i.test(filePath);
}

function databaseContentSignal(text: string): boolean {
  return /PrismaClient|@prisma\/client|\bprisma\s+(validate|format|generate|migrate|db|studio)\b|schema\.prisma|datasource\s+\w+|generator\s+\w+|DATABASE_URL|provider\s*=|prisma\/config|defineConfig|migrations|seed/i.test(text);
}

function databaseSchemaFiles(sourceFiles: DatabaseSourceFile[]): DatabaseReadinessReport["schemaFiles"] {
  return sourceFiles
    .filter((source) => path.basename(source.filePath).toLowerCase() === "schema.prisma")
    .slice(0, 120)
    .map((source) => {
      const datasourceCount = countMatches(source.text, /\bdatasource\s+\w+\s*\{/g);
      const generatorCount = countMatches(source.text, /\bgenerator\s+\w+\s*\{/g);
      const modelCount = countMatches(source.text, /\bmodel\s+\w+\s*\{/g);
      const provider = normalizeDatabaseProvider(firstMatch(source.text, /provider\s*=\s*"([^"]+)"/i));
      return {
        filePath: source.filePath,
        provider,
        datasourceCount,
        generatorCount,
        modelCount,
        readiness: datasourceCount > 0 && generatorCount > 0 && modelCount > 0 ? "ready" : datasourceCount > 0 || generatorCount > 0 || modelCount > 0 ? "partial" : "missing",
        evidence: `${source.filePath} has ${datasourceCount} datasource block(s), ${generatorCount} generator block(s), and ${modelCount} model block(s).`,
        sourceHref: source.sourceHref
      };
    });
}

function databaseDatasourceSignals(schemaFiles: DatabaseReadinessReport["schemaFiles"], sourceFiles: DatabaseSourceFile[]): DatabaseReadinessReport["datasourceSignals"] {
  const providers: DatabaseReadinessReport["datasourceSignals"][number]["provider"][] = ["postgresql", "mysql", "sqlite", "sqlserver", "mongodb", "cockroachdb", "mariadb"];
  return providers.map((provider) => {
    const schema = schemaFiles.find((item) => item.provider === provider);
    const source = sourceFiles.find((item) => new RegExp(`provider\\s*=\\s*["']${provider}["']|${provider}`, "i").test(item.text));
    return {
      provider,
      readiness: schema ? "ready" : source ? "partial" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: schema ? `${schema.filePath} declares datasource provider ${provider}.` : source ? `${source.filePath} references ${provider}.` : `${provider} datasource evidence was not detected.`,
      relatedHref: schema?.sourceHref ?? source?.sourceHref ?? "html/database-readiness.html"
    };
  });
}

function databaseMigrationSignals(sourceFiles: DatabaseSourceFile[]): DatabaseReadinessReport["migrationSignals"] {
  const specs: Array<{ signal: DatabaseReadinessReport["migrationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "migrations-folder", pattern: /(^|\/)migrations\/|migrations\s*:/i, evidence: "migrations folder or configured migration path evidence was detected." },
    { signal: "migration-sql", pattern: /migration\.sql|CREATE TABLE|ALTER TABLE|DROP TABLE/i, evidence: "SQL migration file evidence was detected." },
    { signal: "migration-lock", pattern: /migration_lock\.toml/i, evidence: "Prisma migration lock evidence was detected." },
    { signal: "migrate-dev", pattern: /prisma\s+migrate\s+dev|migrate dev/i, evidence: "development migration command evidence was detected." },
    { signal: "migrate-deploy", pattern: /prisma\s+migrate\s+deploy|migrate deploy/i, evidence: "deployment migration command evidence was detected." },
    { signal: "db-push", pattern: /prisma\s+db\s+push|db push/i, evidence: "db push workflow evidence was detected." },
    { signal: "introspection", pattern: /prisma\s+db\s+pull|introspect|introspection/i, evidence: "database introspection evidence was detected." },
    { signal: "schema-drift", pattern: /schema drift|drift detected|database is out of sync|migrate diff/i, evidence: "schema drift detection evidence was detected." }
  ];
  return databaseSignalFromSpecs(sourceFiles, specs, "migration");
}

function databaseClientSignals(sourceFiles: DatabaseSourceFile[]): DatabaseReadinessReport["clientSignals"] {
  const specs: Array<{ signal: DatabaseReadinessReport["clientSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prisma-client", pattern: /PrismaClient|@prisma\/client|generated\/(?:prisma\/)?client/i, evidence: "PrismaClient runtime usage evidence was detected." },
    { signal: "client-generation", pattern: /prisma\s+generate|generator\s+client|generate"/i, evidence: "Prisma Client generation evidence was detected." },
    { signal: "custom-output", pattern: /output\s*=|generated\/client|generated\/prisma/i, evidence: "custom generated client output evidence was detected." },
    { signal: "prisma-client-js", pattern: /prisma-client-js|provider\s*=\s*"prisma-client-js"/i, evidence: "traditional prisma-client-js generator evidence was detected." },
    { signal: "driver-adapter", pattern: /adapter|@prisma\/adapter-|PrismaPg|driver adapter/i, evidence: "driver adapter evidence was detected." },
    { signal: "typed-query", pattern: /typedSql|typed-sql|queryRaw|executeRaw/i, evidence: "typed/raw query surface evidence was detected." },
    { signal: "studio", pattern: /prisma\s+studio|Prisma Studio|studio"/i, evidence: "Prisma Studio evidence was detected." }
  ];
  return databaseSignalFromSpecs(sourceFiles, specs, "client");
}

function databaseConfigSignals(sourceFiles: DatabaseSourceFile[]): DatabaseReadinessReport["configSignals"] {
  const specs: Array<{ signal: DatabaseReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prisma-config", pattern: /prisma\.config\.[cm]?[jt]s|defineConfig|prisma\/config/i, evidence: "prisma.config evidence was detected." },
    { signal: "database-url", pattern: /DATABASE_URL|datasource:\s*\{|env\(['"]DATABASE_URL|url\s*:\s*env/i, evidence: "database URL boundary evidence was detected." },
    { signal: "dotenv", pattern: /dotenv|@dotenvx|\.env/i, evidence: "dotenv loading or env example evidence was detected." },
    { signal: "seed", pattern: /prisma\s+db\s+seed|"seed"\s*:|seed\.([cm]?[jt]s|ts|js)|seed-data/i, evidence: "seed workflow evidence was detected." },
    { signal: "package-script", pattern: /"prisma"\s*:|"dbpush"\s*:|"generate"\s*:\s*"[^"]*prisma|@prisma\/client|\bprisma\b/i, evidence: "package Prisma dependency or script evidence was detected." },
    { signal: "docker-compose", pattern: /docker-compose|compose\.ya?ml|postgres:|mysql:|mariadb:|mongo:/i, evidence: "local database service evidence was detected." },
    { signal: "env-example", pattern: /\.env\.example|\.env\.sample|DATABASE_URL=/i, evidence: "env example evidence was detected." }
  ];
  return databaseSignalFromSpecs(sourceFiles, specs, "config");
}

function databaseModelSignals(sourceFiles: DatabaseSourceFile[]): DatabaseReadinessReport["modelSignals"] {
  const specs: Array<{ signal: DatabaseReadinessReport["modelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "model", pattern: /\bmodel\s+\w+\s*\{/i, evidence: "model block evidence was detected." },
    { signal: "relation", pattern: /@relation|\w+\s+\w+\[\]/i, evidence: "relation evidence was detected." },
    { signal: "id", pattern: /@id|@@id/i, evidence: "primary key evidence was detected." },
    { signal: "unique", pattern: /@unique|@@unique/i, evidence: "unique constraint evidence was detected." },
    { signal: "index", pattern: /@@index|@@fulltext|@@map/i, evidence: "index or mapped model evidence was detected." },
    { signal: "enum", pattern: /\benum\s+\w+\s*\{/i, evidence: "enum evidence was detected." },
    { signal: "native-type", pattern: /@db\./i, evidence: "native database type evidence was detected." },
    { signal: "default", pattern: /@default\(/i, evidence: "default value evidence was detected." },
    { signal: "map", pattern: /@map|@@map/i, evidence: "database mapping evidence was detected." }
  ];
  return databaseSignalFromSpecs(sourceFiles, specs, "model");
}

function databaseSignalFromSpecs<T extends { signal: string; pattern: RegExp; evidence: string }>(
  sourceFiles: DatabaseSourceFile[],
  specs: T[],
  label: string
): Array<{ signal: T["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/database-readiness.html"
    };
  });
}

function normalizeDatabaseProvider(value: string | null): DatabaseReadinessReport["schemaFiles"][number]["provider"] {
  const normalized = value?.toLowerCase();
  if (normalized === "postgresql" || normalized === "postgres") return "postgresql";
  if (normalized === "mysql") return "mysql";
  if (normalized === "sqlite") return "sqlite";
  if (normalized === "sqlserver" || normalized === "mssql") return "sqlserver";
  if (normalized === "mongodb" || normalized === "mongo") return "mongodb";
  if (normalized === "cockroachdb") return "cockroachdb";
  if (normalized === "mariadb") return "mariadb";
  return "unknown";
}

export async function buildDatabaseMigrationReadinessReport(walk: WalkResult): Promise<DatabaseMigrationReadinessReport> {
  const sourceFiles = await databaseMigrationReadinessSourceFiles(walk);
  const migrationSetups = databaseMigrationReadinessSetupRows(sourceFiles);
  const fileSignals = databaseMigrationReadinessFileSignals(sourceFiles);
  const lineageSignals = databaseMigrationReadinessLineageSignals(sourceFiles);
  const rollbackSignals = databaseMigrationReadinessRollbackSignals(sourceFiles);
  const validationSignals = databaseMigrationReadinessValidationSignals(sourceFiles);
  const configSignals = databaseMigrationReadinessConfigSignals(sourceFiles);
  const ciSignals = databaseMigrationReadinessCiSignals(sourceFiles);
  const packageSignals = databaseMigrationReadinessPackageSignals(sourceFiles);
  const hasMigration = migrationSetups.some((item) => item.readiness !== "missing") || fileSignals.some((item) => item.readiness === "ready");
  const hasLineage = lineageSignals.some((item) => item.readiness === "ready");
  const hasRollback = rollbackSignals.some((item) => item.readiness === "ready");
  const hasValidation = validationSignals.some((item) => item.readiness === "ready");
  const hasCi = ciSignals.some((item) => ["github-actions", "migration-command", "dry-run", "schema-drift"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: DatabaseMigrationReadinessReport["riskQueue"] = [];
  if (!hasMigration) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a versioned migration path before treating database schema changes as reproducible.",
      why: "Flyway, Liquibase, and Alembic-style workflows start with visible migration files, changelogs, or revision scripts.",
      relatedHref: "html/database-migration-readiness.html"
    });
  }
  if (hasMigration && !hasLineage) {
    riskQueue.push({
      priority: "high",
      action: "Record migration lineage through version prefixes, down_revision, checksum tables, or schema history.",
      why: "Migration files without ordering and applied-history evidence are hard to reason about during drift or rollback reviews.",
      relatedHref: "html/database-migration-readiness.html"
    });
  }
  if (hasMigration && !hasRollback) {
    riskQueue.push({
      priority: "medium",
      action: "Document rollback or restore policy for irreversible schema changes.",
      why: "Liquibase rollback blocks, Alembic downgrade functions, Flyway undo migrations, and Rails down/change paths make failure recovery visible.",
      relatedHref: "html/database-migration-readiness.html"
    });
  }
  if (hasMigration && !hasValidation) {
    riskQueue.push({
      priority: "high",
      action: "Add static validation or dry-run commands for migration review.",
      why: "Flyway validate/info, Liquibase status/updateSQL, and Alembic current/heads/check catch drift before changing a shared database.",
      relatedHref: "html/database-migration-readiness.html"
    });
  }
  if (hasMigration && !hasCi) {
    riskQueue.push({
      priority: "medium",
      action: "Wire migration validation, dry-run SQL, or drift checks into CI with explicit database service boundaries.",
      why: "Migration safety degrades when schema changes are only tested manually on a developer machine.",
      relatedHref: "html/database-migration-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run migration commands only in a trusted disposable database or reviewed CI job.",
    why: "RepoTutor records static migration readiness only; it does not connect to databases, run migrate, update, rollback, repair, or stamp commands.",
    relatedHref: "html/database-migration-readiness.html"
  });

  return {
    summary: `Database migration readiness report: setup ${migrationSetups.length}개, file signal ${fileSignals.filter((item) => item.readiness === "ready").length}개, lineage signal ${lineageSignals.filter((item) => item.readiness === "ready").length}개, validation signal ${validationSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Database migration readiness Flyway Liquibase Alembic versioned migrations changelog changeset revision down_revision upgrade downgrade rollback validate repair info status updateSQL current heads dry-run drift CI",
    migrationSetups,
    fileSignals,
    lineageSignals,
    rollbackSignals,
    validationSignals,
    configSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "flyway info -configFiles=flyway.conf", purpose: "Inspect Flyway migration history and pending versioned/repeatable migrations in a safe database." },
      { command: "flyway validate", purpose: "Validate Flyway resolved migrations against the schema history table before deployment." },
      { command: "liquibase status --verbose", purpose: "Review pending Liquibase changesets without applying them." },
      { command: "liquibase updateSQL", purpose: "Generate SQL for review instead of applying Liquibase changes immediately." },
      { command: "alembic current && alembic heads", purpose: "Compare applied Alembic revision state with available heads." },
      { command: "alembic revision --autogenerate -m \"check drift\" && git diff -- migrations", purpose: "Use Alembic autogenerate as a drift review against a disposable database." },
      { command: "rg \"flyway|liquibase|alembic|V[0-9]+__|databaseChangeLog|changeSet|down_revision|def downgrade|updateSQL|validate|repair\" .", purpose: "Locate static migration files, lineage, rollback, and validation evidence." }
    ],
    learnerNextSteps: [
      "먼저 migration file naming과 applied-history boundary를 분리하세요: Flyway version prefix, Liquibase DATABASECHANGELOG, Alembic down_revision/heads를 찾습니다.",
      "Rollback은 파일 존재와 별개입니다. Liquibase rollback block, Alembic downgrade, Flyway undo, Rails down/change 정책을 확인하세요.",
      "validate/info/status/updateSQL/current/heads 같은 dry-run 또는 drift review 명령이 CI에 있는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 migration, rollback, repair, stamp는 disposable DB 또는 검토된 CI에서만 실행해야 합니다."
    ]
  };
}

type DatabaseMigrationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function databaseMigrationReadinessSourceFiles(walk: WalkResult): Promise<DatabaseMigrationReadinessSourceFile[]> {
  const files: DatabaseMigrationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !databaseMigrationReadinessInspectablePath(file.relPath)) continue;
    const pathCandidate = databaseMigrationReadinessPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !databaseMigrationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function databaseMigrationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(flyway\.conf|flyway\.toml|liquibase\.properties|liquibase\.yaml|liquibase\.yml|liquibase\.json|liquibase\.xml|alembic\.ini|env\.py|package\.json|Gemfile|pyproject\.toml|requirements.*\.txt|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(db\/migrate|migrations?|versions|database\/changelog|changelogs?|liquibase|flyway|alembic|drizzle|prisma)(\/|\.|$)/i.test(filePath)
    || /\.(sql|xml|ya?ml|json|toml|ini|py|rb|[cm]?[jt]sx?|md)$/i.test(filePath);
}

function databaseMigrationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(db\/migrate|migrations?|versions|database\/changelog|changelogs?|liquibase|flyway|alembic|drizzle|prisma)(\/|\.|$)|(^|\/)(V[0-9][^/]*__.*\.sql|R__.*\.sql|U[0-9][^/]*__.*\.sql)|alembic\.ini|flyway\.(conf|toml)|liquibase\.properties/i.test(filePath);
}

function databaseMigrationReadinessContentSignal(text: string): boolean {
  return /(flyway|baselineOnMigrate|validateOnMigrate|cleanDisabled|outOfOrder|databaseChangeLog|changeSet|--liquibase formatted sql|preConditions|rollback|runOnChange|runAlways|tagDatabase|liquibase status|updateSQL|DATABASECHANGELOG|alembic|script_location|version_locations|down_revision|def upgrade|def downgrade|autogenerate|run_migrations_online|run_migrations_offline|drizzle-kit|rails db:migrate|ActiveRecord::Migration|prisma migrate|migrate deploy)/i.test(text);
}

function databaseMigrationReadinessSetupRows(sourceFiles: DatabaseMigrationReadinessSourceFile[]): DatabaseMigrationReadinessReport["migrationSetups"] {
  const rows: DatabaseMigrationReadinessReport["migrationSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const versionedCount = countMatches(haystack, /(^|\/)V[0-9][A-Za-z0-9_.-]*__[^/\s]+\.sql|versioned migration|create_table|ActiveRecord::Migration|prisma migrate|drizzle-kit (generate|migrate)/gi);
    const repeatableCount = countMatches(haystack, /(^|\/)R__[^/\s]+\.sql|repeatable migration|repeatableSqlMigrationPrefix/gi);
    const changelogCount = countMatches(haystack, /databaseChangeLog|--liquibase formatted sql|changelogFile|includeAll|include file|liquibase\.(properties|ya?ml|xml|json)/gi);
    const changesetCount = countMatches(haystack, /changeSet|--changeset|runOnChange|runAlways|preConditions|tagDatabase/gi);
    const revisionCount = countMatches(haystack, /revision\s*=|down_revision\s*=|def upgrade|def downgrade|script_location|version_locations|alembic revision|alembic upgrade/gi);
    const rollbackCount = countMatches(haystack, /rollback|def downgrade|(^|\/)U[0-9][A-Za-z0-9_.-]*__[^/\s]+\.sql|revert|down\s+do|def down|restore point|restore-point/gi);
    const validationCount = countMatches(haystack, /flyway (validate|info|repair)|validateOnMigrate|liquibase (status|updateSQL|validate|checks)|alembic (current|heads|check|history)|drizzle-kit check|migrate diff|schema drift|drift detected/gi);
    const ciCount = countMatches(haystack, /^\.github\/workflows\/|GitHub Actions|runs-on|pull_request|workflow_dispatch|services:|postgres:|mysql:|upload-artifact|environment:|manual approval|migration/gi);
    const totalSignals = versionedCount + repeatableCount + changelogCount + changesetCount + revisionCount + rollbackCount + validationCount + ciCount;
    if (totalSignals === 0 && !databaseMigrationReadinessPathSignal(source.filePath)) continue;
    const readiness = (versionedCount > 0 || changelogCount > 0 || revisionCount > 0) && validationCount > 0 && rollbackCount > 0
      ? "ready"
      : totalSignals > 0
        ? "partial"
        : "missing";
    rows.push({
      filePath: source.filePath,
      tool: databaseMigrationReadinessTool(source.filePath, source.text),
      versionedCount,
      repeatableCount,
      changelogCount,
      changesetCount,
      revisionCount,
      rollbackCount,
      validationCount,
      ciCount,
      readiness,
      evidence: `${source.filePath} contains ${totalSignals} database migration readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows.sort((a, b) => order[a.readiness] - order[b.readiness] || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function databaseMigrationReadinessTool(filePath: string, text: string): DatabaseMigrationReadinessReport["migrationSetups"][number]["tool"] {
  const haystack = `${filePath}\n${text}`;
  if (/flyway|(^|\/)V[0-9][^/]*__.*\.sql|(^|\/)R__.*\.sql|flyway\.(conf|toml)/i.test(haystack)) return "flyway";
  if (/liquibase|databaseChangeLog|changeSet|--liquibase formatted sql|DATABASECHANGELOG/i.test(haystack)) return "liquibase";
  if (/alembic|alembic\.ini|down_revision|def upgrade|def downgrade|script_location|version_locations/i.test(haystack)) return "alembic";
  if (/drizzle-kit|drizzle\/meta|_journal\.json|drizzle migrations/i.test(haystack)) return "drizzle";
  if (/ActiveRecord::Migration|rails db:migrate|db\/migrate/i.test(haystack)) return "rails";
  if (/prisma migrate|migration_lock\.toml|schema\.prisma/i.test(haystack)) return "prisma";
  if (/\.sql$|CREATE TABLE|ALTER TABLE|DROP TABLE/i.test(haystack)) return "sql";
  return databaseMigrationReadinessContentSignal(text) ? "custom" : "unknown";
}

function databaseMigrationReadinessFileSignals(sourceFiles: DatabaseMigrationReadinessSourceFile[]): DatabaseMigrationReadinessReport["fileSignals"] {
  const specs: Array<{ signal: DatabaseMigrationReadinessReport["fileSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "flyway-versioned", pattern: /(^|\/)V[0-9][A-Za-z0-9_.-]*__[^/\s]+\.sql|versioned migration/i, evidence: "Flyway versioned migration evidence was detected." },
    { signal: "flyway-repeatable", pattern: /(^|\/)R__[^/\s]+\.sql|repeatable migration/i, evidence: "Flyway repeatable migration evidence was detected." },
    { signal: "flyway-undo", pattern: /(^|\/)U[0-9][A-Za-z0-9_.-]*__[^/\s]+\.sql|undo migration/i, evidence: "Flyway undo migration evidence was detected." },
    { signal: "liquibase-changelog", pattern: /databaseChangeLog|changelogFile|includeAll|liquibase\.(properties|ya?ml|xml|json)/i, evidence: "Liquibase changelog evidence was detected." },
    { signal: "liquibase-formatted-sql", pattern: /--liquibase formatted sql|--changeset/i, evidence: "Liquibase formatted SQL evidence was detected." },
    { signal: "alembic-revision", pattern: /revision\s*=|down_revision\s*=|def upgrade|def downgrade|versions\/.+\.py/i, evidence: "Alembic revision evidence was detected." },
    { signal: "drizzle-migration", pattern: /drizzle-kit|drizzle\/meta|_journal\.json|sql.*breakpoint/i, evidence: "Drizzle migration evidence was detected." },
    { signal: "rails-migration", pattern: /ActiveRecord::Migration|db\/migrate|create_table|change_table|rails db:migrate/i, evidence: "Rails migration evidence was detected." },
    { signal: "sql-migration", pattern: /CREATE TABLE|ALTER TABLE|DROP TABLE|CREATE INDEX|ALTER INDEX/i, evidence: "SQL migration evidence was detected." }
  ];
  return databaseMigrationReadinessSignalFromSpecs(sourceFiles, specs, "file", "signal");
}

function databaseMigrationReadinessLineageSignals(sourceFiles: DatabaseMigrationReadinessSourceFile[]): DatabaseMigrationReadinessReport["lineageSignals"] {
  const specs: Array<{ signal: DatabaseMigrationReadinessReport["lineageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "version-prefix", pattern: /(^|\/)V[0-9][A-Za-z0-9_.-]*__|sqlMigrationPrefix|versioned/i, evidence: "version prefix evidence was detected." },
    { signal: "repeatable-prefix", pattern: /(^|\/)R__|repeatableSqlMigrationPrefix|repeatable migration/i, evidence: "repeatable migration prefix evidence was detected." },
    { signal: "down-revision", pattern: /down_revision\s*=|depends_on\s*=|branch_labels\s*=/i, evidence: "Alembic down_revision lineage evidence was detected." },
    { signal: "heads", pattern: /alembic heads|alembic current|head_revision|check_heads|Multiple heads/i, evidence: "Alembic head/current evidence was detected." },
    { signal: "branch-label", pattern: /branch_labels|branch label|branch-point|merge revision/i, evidence: "branch label or merge revision evidence was detected." },
    { signal: "timestamped-version", pattern: /20[0-9]{12,}|[0-9]{14}_[a-z0-9_]+|version\s*:\s*[0-9]{14}/i, evidence: "timestamped migration version evidence was detected." },
    { signal: "checksum", pattern: /checksum|MD5SUM|calculate-checksum|validCheckSum/i, evidence: "checksum evidence was detected." },
    { signal: "databasechangelog", pattern: /DATABASECHANGELOG|DATABASECHANGELOGLOCK/i, evidence: "Liquibase database changelog table evidence was detected." },
    { signal: "schema-history", pattern: /flyway_schema_history|schema history table|schemaHistory/i, evidence: "Flyway schema history evidence was detected." }
  ];
  return databaseMigrationReadinessSignalFromSpecs(sourceFiles, specs, "lineage", "signal");
}

function databaseMigrationReadinessRollbackSignals(sourceFiles: DatabaseMigrationReadinessSourceFile[]): DatabaseMigrationReadinessReport["rollbackSignals"] {
  const specs: Array<{ signal: DatabaseMigrationReadinessReport["rollbackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "liquibase-rollback", pattern: /<rollback>|rollback:|--rollback|rollbackSqlFile|rollback-one|future-rollback/i, evidence: "Liquibase rollback evidence was detected." },
    { signal: "alembic-downgrade", pattern: /def downgrade|alembic downgrade/i, evidence: "Alembic downgrade evidence was detected." },
    { signal: "flyway-undo", pattern: /(^|\/)U[0-9][A-Za-z0-9_.-]*__|flyway undo|undoSqlMigrationPrefix/i, evidence: "Flyway undo evidence was detected." },
    { signal: "rails-down-change", pattern: /def down|def change|reversible do|revert do|rails db:rollback/i, evidence: "Rails rollback/down evidence was detected." },
    { signal: "drizzle-down", pattern: /down.sql|drizzle.*rollback|migration down/i, evidence: "Drizzle down migration evidence was detected." },
    { signal: "transactional-ddl", pattern: /transactional|executeInTransaction|canExecuteInTransaction|disable_ddl_transaction/i, evidence: "transactional DDL evidence was detected." },
    { signal: "restore-point", pattern: /restore point|backup before migration|point-in-time recovery|PITR|snapshot before migration/i, evidence: "restore point evidence was detected." }
  ];
  return databaseMigrationReadinessSignalFromSpecs(sourceFiles, specs, "rollback", "signal");
}

function databaseMigrationReadinessValidationSignals(sourceFiles: DatabaseMigrationReadinessSourceFile[]): DatabaseMigrationReadinessReport["validationSignals"] {
  const specs: Array<{ signal: DatabaseMigrationReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "flyway-validate", pattern: /flyway validate|validateOnMigrate|DbValidate/i, evidence: "Flyway validate evidence was detected." },
    { signal: "flyway-repair", pattern: /flyway repair|DbRepair|repairResult/i, evidence: "Flyway repair evidence was detected." },
    { signal: "flyway-info", pattern: /flyway info|DbInfo|infoOfState/i, evidence: "Flyway info evidence was detected." },
    { signal: "liquibase-status", pattern: /liquibase status|StatusCommand|status --verbose/i, evidence: "Liquibase status evidence was detected." },
    { signal: "liquibase-update-sql", pattern: /updateSQL|update-sql|futureRollbackSQL|rollbackSQL/i, evidence: "Liquibase SQL dry-run evidence was detected." },
    { signal: "alembic-current", pattern: /alembic current|def current|command\.current|check_heads/i, evidence: "Alembic current evidence was detected." },
    { signal: "alembic-heads", pattern: /alembic heads|def heads|command\.heads|script\.get_heads/i, evidence: "Alembic heads evidence was detected." },
    { signal: "alembic-check", pattern: /alembic check|command\.check|pending upgrade ops/i, evidence: "Alembic check evidence was detected." },
    { signal: "drizzle-check", pattern: /drizzle-kit check|drizzle check|check migrations/i, evidence: "Drizzle migration check evidence was detected." }
  ];
  return databaseMigrationReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function databaseMigrationReadinessConfigSignals(sourceFiles: DatabaseMigrationReadinessSourceFile[]): DatabaseMigrationReadinessReport["configSignals"] {
  const specs: Array<{ signal: DatabaseMigrationReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "flyway-conf", pattern: /flyway\.conf|flyway\.url|flyway\.locations|flyway\.schemas/i, evidence: "flyway.conf evidence was detected." },
    { signal: "flyway-toml", pattern: /flyway\.toml|locations\s*=\s*\[|cleanDisabled|baselineOnMigrate/i, evidence: "flyway.toml evidence was detected." },
    { signal: "liquibase-properties", pattern: /liquibase\.properties|changelogFile|changeLogFile|liquibase\.command\./i, evidence: "Liquibase properties evidence was detected." },
    { signal: "alembic-ini", pattern: /alembic\.ini|\[alembic\]|sqlalchemy\.url/i, evidence: "alembic.ini evidence was detected." },
    { signal: "script-location", pattern: /script_location|scriptLocation/i, evidence: "Alembic script location evidence was detected." },
    { signal: "version-locations", pattern: /version_locations|recursive_version_locations/i, evidence: "Alembic version locations evidence was detected." },
    { signal: "database-url", pattern: /DATABASE_URL|JDBC_DATABASE_URL|sqlalchemy\.url|url\s*=|url:/i, evidence: "database URL config evidence was detected." },
    { signal: "migration-path", pattern: /locations\s*=|migrationsDir|migrations_folder|migrationsTable|migrations_path|db\/migrate/i, evidence: "migration path evidence was detected." },
    { signal: "placeholder", pattern: /placeholder|placeholders|changeLogParameters|\$\{[^}]+\}/i, evidence: "migration placeholder evidence was detected." },
    { signal: "contexts-labels", pattern: /contexts?|labels?|contextFilter|labelFilter/i, evidence: "Liquibase context/label evidence was detected." }
  ];
  return databaseMigrationReadinessSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function databaseMigrationReadinessCiSignals(sourceFiles: DatabaseMigrationReadinessSourceFile[]): DatabaseMigrationReadinessReport["ciSignals"] {
  const specs: Array<{ signal: DatabaseMigrationReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout|runs-on/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "migration-command", pattern: /flyway (migrate|validate|info)|liquibase (status|update|updateSQL|validate)|alembic (upgrade|current|heads|check)|rails db:migrate|drizzle-kit migrate|prisma migrate deploy/i, evidence: "CI migration command evidence was detected." },
    { signal: "dry-run", pattern: /updateSQL|--dry-run|migrate diff|plan only|dry run|futureRollbackSQL|alembic check/i, evidence: "dry-run migration evidence was detected." },
    { signal: "schema-drift", pattern: /schema drift|drift detected|migrate diff|autogenerate|pending upgrade ops|database is out of sync/i, evidence: "schema drift check evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|migration report|dry-run sql|updateSQL.*artifact|schema diff artifact/i, evidence: "migration artifact evidence was detected." },
    { signal: "database-service", pattern: /services:\s*|postgres:|mysql:|mariadb:|sqlite|docker compose|test database/i, evidence: "CI database service evidence was detected." },
    { signal: "manual-approval", pattern: /environment:|manual approval|workflow_dispatch|approval|protected environment/i, evidence: "manual approval evidence was detected." }
  ];
  return databaseMigrationReadinessSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function databaseMigrationReadinessPackageSignals(sourceFiles: DatabaseMigrationReadinessSourceFile[]): DatabaseMigrationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DatabaseMigrationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "flyway", pattern: /flyway-core|org\.flywaydb|flyway\/flyway|\bflyway\b/i, evidence: "Flyway package evidence was detected." },
    { signal: "liquibase", pattern: /liquibase-core|org\.liquibase|\bliquibase\b/i, evidence: "Liquibase package evidence was detected." },
    { signal: "alembic", pattern: /\balembic\b|sqlalchemy\[alembic\]/i, evidence: "Alembic package evidence was detected." },
    { signal: "drizzle-kit", pattern: /drizzle-kit|drizzle-orm/i, evidence: "Drizzle Kit package evidence was detected." },
    { signal: "typeorm", pattern: /typeorm|typeorm migration/i, evidence: "TypeORM migration package evidence was detected." },
    { signal: "knex", pattern: /\bknex\b|knexfile/i, evidence: "Knex migration package evidence was detected." },
    { signal: "sequelize", pattern: /\bsequelize\b|sequelize-cli|sequelize migration/i, evidence: "Sequelize migration package evidence was detected." },
    { signal: "rails", pattern: /activerecord|rails\b|ActiveRecord::Migration/i, evidence: "Rails migration package evidence was detected." },
    { signal: "prisma", pattern: /@prisma\/client|\bprisma\b|prisma migrate/i, evidence: "Prisma migration package evidence was detected." }
  ];
  return databaseMigrationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function databaseMigrationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DatabaseMigrationReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(haystack);
    });
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/database-migration-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDatabaseOrmReadinessReport(walk: WalkResult): Promise<DatabaseOrmReadinessReport> {
  const sourceFiles = await databaseOrmReadinessSourceFiles(walk);
  const ormSetups = databaseOrmReadinessSetupRows(sourceFiles);
  const entitySignals = databaseOrmReadinessEntitySignals(sourceFiles);
  const relationSignals = databaseOrmReadinessRelationSignals(sourceFiles);
  const repositorySignals = databaseOrmReadinessRepositorySignals(sourceFiles);
  const transactionSignals = databaseOrmReadinessTransactionSignals(sourceFiles);
  const loadingSignals = databaseOrmReadinessLoadingSignals(sourceFiles);
  const configSignals = databaseOrmReadinessConfigSignals(sourceFiles);
  const ciSignals = databaseOrmReadinessCiSignals(sourceFiles);
  const packageSignals = databaseOrmReadinessPackageSignals(sourceFiles);
  const hasOrm = ormSetups.some((item) => item.readiness !== "missing") || entitySignals.some((item) => item.readiness === "ready");
  const hasRelations = relationSignals.some((item) => item.readiness === "ready");
  const hasQueries = repositorySignals.some((item) => item.readiness === "ready");
  const hasTransactions = transactionSignals.some((item) => item.readiness === "ready");
  const hasConfig = configSignals.some((item) => item.readiness === "ready");
  const hasCi = ciSignals.some((item) => ["github-actions", "orm-command", "schema-sync-check", "migration-check"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: DatabaseOrmReadinessReport["riskQueue"] = [];
  if (!hasOrm) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document ORM model/entity definitions before treating database access as structured.",
      why: "TypeORM, Sequelize, and SQLAlchemy-style applications expose their data model through entities, models, declarative mappings, or equivalent table definitions.",
      relatedHref: "html/database-orm-readiness.html"
    });
  }
  if (hasOrm && !hasRelations) {
    riskQueue.push({
      priority: "medium",
      action: "Document relation ownership, foreign keys, joins, and cascade behavior for ORM models.",
      why: "ORM data loss and N+1 issues often start at unclear association, join table, or cascade boundaries.",
      relatedHref: "html/database-orm-readiness.html"
    });
  }
  if (hasOrm && !hasQueries) {
    riskQueue.push({
      priority: "medium",
      action: "Expose repository/session/query-builder usage so read/write paths can be reviewed.",
      why: "Static entity definitions are not enough to explain how code loads, filters, and persists records.",
      relatedHref: "html/database-orm-readiness.html"
    });
  }
  if (hasOrm && !hasTransactions) {
    riskQueue.push({
      priority: "high",
      action: "Add or document transaction and rollback boundaries around multi-record ORM writes.",
      why: "TypeORM QueryRunner/transaction, Sequelize transaction, and SQLAlchemy session.begin patterns make consistency boundaries visible.",
      relatedHref: "html/database-orm-readiness.html"
    });
  }
  if (hasOrm && !hasConfig) {
    riskQueue.push({
      priority: "medium",
      action: "Document ORM datasource, engine, pool, naming, and schema synchronization policy.",
      why: "Connection and synchronization defaults decide whether ORM metadata is safe in production or only suitable for local development.",
      relatedHref: "html/database-orm-readiness.html"
    });
  }
  if (hasOrm && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Add CI checks for ORM mapping, schema sync drift, or migration status against a disposable database.",
      why: "ORM metadata can compile while relationships, generated SQL, or schema drift still fail at runtime.",
      relatedHref: "html/database-orm-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run ORM validation only in a trusted disposable database or reviewed CI job.",
    why: "RepoTutor records static ORM readiness only; it does not connect to databases, instantiate engines, synchronize schemas, or execute application queries.",
    relatedHref: "html/database-orm-readiness.html"
  });

  return {
    summary: `Database ORM readiness report: setup ${ormSetups.length}개, entity signal ${entitySignals.filter((item) => item.readiness === "ready").length}개, relation signal ${relationSignals.filter((item) => item.readiness === "ready").length}개, transaction signal ${transactionSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Database ORM readiness TypeORM Sequelize SQLAlchemy entity model decorator relationship repository session query builder transaction eager loading migration synchronization CI",
    ormSetups,
    entitySignals,
    relationSignals,
    repositorySignals,
    transactionSignals,
    loadingSignals,
    configSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@Entity|Model.init|sequelize.define|DeclarativeBase|mapped_column|relationship\\(|getRepository|Session\\(\" .", purpose: "Locate static ORM entity, model, relation, repository, and session evidence." },
      { command: "rg \"transaction\\(|session.begin|rollback|isolationLevel|QueryRunner|createQueryRunner\" .", purpose: "Review ORM transaction and rollback boundaries before touching production data." },
      { command: "npx typeorm migration:show --dataSource src/data-source.ts", purpose: "Inspect TypeORM migration state in a configured disposable environment." },
      { command: "npx sequelize-cli db:migrate:status", purpose: "Inspect Sequelize migration state before synchronizing ORM models." },
      { command: "alembic current && alembic heads", purpose: "Compare SQLAlchemy/Alembic applied state with available ORM migration heads." }
    ],
    learnerNextSteps: [
      "먼저 ORM model/entity와 database migration을 분리해서 보세요. ORM decorator/model은 runtime mapping이고 migration은 schema-change history입니다.",
      "Relationship은 cardinality보다 ownership이 중요합니다. foreign key, join table, cascade, eager/lazy loading boundary를 확인하세요.",
      "Transaction은 query helper와 별개입니다. QueryRunner, sequelize.transaction, session.begin 같은 atomic boundary를 찾으세요.",
      "이 리포트는 정적 readiness입니다. synchronize, sync, migration status, mapper configuration은 disposable DB 또는 검토된 CI에서만 실행해야 합니다."
    ]
  };
}

type DatabaseOrmReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function databaseOrmReadinessSourceFiles(walk: WalkResult): Promise<DatabaseOrmReadinessSourceFile[]> {
  const files: DatabaseOrmReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !databaseOrmReadinessInspectablePath(file.relPath)) continue;
    const pathCandidate = databaseOrmReadinessPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !databaseOrmReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function databaseOrmReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements.*\.txt|Pipfile|Gemfile|schema\.prisma|data-source\.[cm]?[jt]s|ormconfig\.(json|js|ts)|sequelize\.(config|config\.[cm]?[jt]s)|alembic\.ini|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(entities?|models?|repositories?|database|datasource|data-source|sequelize|sqlalchemy|typeorm|prisma|drizzle|migrations?|alembic|db)(\/|\.|$)/i.test(filePath)
    || /\.(py|rb|[cm]?[jt]sx?|json|toml|ya?ml|sql|prisma|md)$/i.test(filePath);
}

function databaseOrmReadinessPathSignal(filePath: string): boolean {
  return /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(entities?|models?|repositories?|database|datasource|data-source|sequelize|sqlalchemy|typeorm|prisma|drizzle|migrations?|alembic|db)(\/|\.|$)|schema\.prisma|ormconfig|data-source\.[cm]?[jt]s|alembic\.ini/i.test(filePath);
}

function databaseOrmReadinessContentSignal(text: string): boolean {
  return /(@Entity|@Column|@ManyToOne|Repository<|DataSource|createQueryBuilder|QueryRunner|class\s+\w+\s+extends\s+Model|Model\.init|sequelize\.define|belongsTo|hasMany|DataTypes|sequelize\.transaction|DeclarativeBase|declarative_base|mapped_column|relationship\(|sessionmaker|Session\(|create_engine|joinedload|selectinload|schema\.prisma|drizzle-orm|ActiveRecord::Base|sequelize-cli|alembic current|prisma validate|drizzle-kit check|upload-artifact|services:\s*|runs-on)/i.test(text);
}

function databaseOrmReadinessSetupRows(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["ormSetups"] {
  const rows: DatabaseOrmReadinessReport["ormSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const entityCount = countMatches(haystack, /@(Entity|ViewEntity|Column|PrimaryGeneratedColumn)|class\s+\w+\s+extends\s+Model|Model\.init|sequelize\.define|DeclarativeBase|declarative_base|mapped_column|Column\(|class\s+\w+\(models\.Model\)|class\s+\w+\(ApplicationRecord\)|model\s+\w+\s+\{/gi);
    const relationCount = countMatches(haystack, /@(ManyToOne|OneToMany|OneToOne|ManyToMany|JoinColumn|JoinTable)|belongsTo|hasMany|hasOne|belongsToMany|relationship\(|ForeignKey|references:|back_populates|backref|cascade|belongs_to|has_many|has_one/gi);
    const repositoryCount = countMatches(haystack, /Repository<|getRepository|getRepositoryToken|EntityManager|manager\.find|\.repository|\.findOne|\.findAll|\.findByPk|session\.execute|session\.query|objects\.filter|ActiveRecord::Relation|createQueryBuilder/gi);
    const sessionCount = countMatches(haystack, /new DataSource|DataSource\(|new Sequelize|Sequelize\(|create_engine|Session\(|sessionmaker|db\.session|PrismaClient|ActiveRecord::Base\.establish_connection/gi);
    const queryCount = countMatches(haystack, /createQueryBuilder|select\(|where\(|\.findOne|\.findAll|\.findByPk|include:|joinedload|selectinload|sequelize\.query|session\.execute|raw\s*query|\$queryRaw/gi);
    const transactionCount = countMatches(haystack, /transaction\(|manager\.transaction|QueryRunner|createQueryRunner|sequelize\.transaction|session\.begin|rollback|commit|isolationLevel|isolation_level|ActiveRecord::Base\.transaction/gi);
    const migrationCount = countMatches(haystack, /migration|migrations|synchronize\s*:|sync\(|schema:sync|migration:run|alembic|db:migrate|prisma migrate|queryInterface\.createTable/gi);
    const ciCount = countMatches(haystack, /^\.github\/workflows\/|GitHub Actions|runs-on|pull_request|workflow_dispatch|services:|postgres:|mysql:|sqlite|upload-artifact|typeorm|sequelize|sqlalchemy|orm/gi);
    const totalSignals = entityCount + relationCount + repositoryCount + sessionCount + queryCount + transactionCount + migrationCount + ciCount;
    if (totalSignals === 0 && !databaseOrmReadinessPathSignal(source.filePath)) continue;
    const readiness = entityCount > 0 && relationCount > 0 && (repositoryCount > 0 || sessionCount > 0 || queryCount > 0) && transactionCount > 0
      ? "ready"
      : totalSignals > 0
        ? "partial"
        : "missing";
    rows.push({
      filePath: source.filePath,
      framework: databaseOrmReadinessFramework(source.filePath, source.text),
      entityCount,
      relationCount,
      repositoryCount,
      sessionCount,
      queryCount,
      transactionCount,
      migrationCount,
      ciCount,
      readiness,
      evidence: `${source.filePath} contains ${totalSignals} database ORM readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows.sort((a, b) => order[a.readiness] - order[b.readiness] || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function databaseOrmReadinessFramework(filePath: string, text: string): DatabaseOrmReadinessReport["ormSetups"][number]["framework"] {
  const haystack = `${filePath}\n${text}`;
  if (/typeorm|@Entity|DataSource|Repository<|QueryRunner|createQueryBuilder/i.test(haystack)) return "typeorm";
  if (/sequelize|class\s+\w+\s+extends\s+Model|Model\.init|sequelize\.define|DataTypes|belongsToMany/i.test(haystack)) return "sequelize";
  if (/sqlalchemy|DeclarativeBase|declarative_base|mapped_column|relationship\(|sessionmaker|create_engine/i.test(haystack)) return "sqlalchemy";
  if (/schema\.prisma|PrismaClient|prisma\./i.test(haystack)) return "prisma";
  if (/django\.db|models\.Model|objects\.filter/i.test(haystack)) return "django";
  if (/ActiveRecord::Base|ApplicationRecord|belongs_to|has_many|db:migrate/i.test(haystack)) return "rails";
  if (/drizzle-orm|pgTable|mysqlTable|sqliteTable/i.test(haystack)) return "drizzle";
  if (/\bknex\b|knexfile/i.test(haystack)) return "knex";
  return databaseOrmReadinessContentSignal(text) ? "unknown" : "unknown";
}

function databaseOrmReadinessEntitySignals(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["entitySignals"] {
  const specs: Array<{ signal: DatabaseOrmReadinessReport["entitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "typeorm-entity", pattern: /@Entity|@ViewEntity|@Column|PrimaryGeneratedColumn|EntitySchema/i, evidence: "TypeORM entity evidence was detected." },
    { signal: "sequelize-model", pattern: /class\s+\w+\s+extends\s+Model|Model\.init|sequelize\.define|DataTypes\./i, evidence: "Sequelize model evidence was detected." },
    { signal: "sqlalchemy-declarative", pattern: /DeclarativeBase|declarative_base|mapped_column|Column\(|__tablename__/i, evidence: "SQLAlchemy declarative mapping evidence was detected." },
    { signal: "prisma-model", pattern: /schema\.prisma|model\s+\w+\s+\{|@@map|@map/i, evidence: "Prisma model evidence was detected." },
    { signal: "django-model", pattern: /models\.Model|django\.db\.models|objects\s*=/i, evidence: "Django model evidence was detected." },
    { signal: "rails-model", pattern: /ApplicationRecord|ActiveRecord::Base|class\s+\w+\s+<\s+ApplicationRecord/i, evidence: "Rails Active Record model evidence was detected." },
    { signal: "drizzle-table", pattern: /pgTable|mysqlTable|sqliteTable|drizzle-orm/i, evidence: "Drizzle ORM table evidence was detected." }
  ];
  return databaseOrmReadinessSignalFromSpecs(sourceFiles, specs, "entity", "signal");
}

function databaseOrmReadinessRelationSignals(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["relationSignals"] {
  const specs: Array<{ signal: DatabaseOrmReadinessReport["relationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "typeorm-relations", pattern: /@(ManyToOne|OneToMany|OneToOne|ManyToMany|JoinColumn|JoinTable)/i, evidence: "TypeORM relation decorator evidence was detected." },
    { signal: "sequelize-associations", pattern: /belongsTo|hasMany|hasOne|belongsToMany|Associations/i, evidence: "Sequelize association evidence was detected." },
    { signal: "sqlalchemy-relationship", pattern: /relationship\(|back_populates|backref=/i, evidence: "SQLAlchemy relationship evidence was detected." },
    { signal: "prisma-relations", pattern: /@relation|fields:\s*\[|references:\s*\[/i, evidence: "Prisma relation evidence was detected." },
    { signal: "foreign-key", pattern: /ForeignKey|foreignKey|foreign_key|@JoinColumn|references:/i, evidence: "foreign key evidence was detected." },
    { signal: "join-table", pattern: /JoinTable|joinTable|through:|secondary=|junction table|belongsToMany/i, evidence: "join table evidence was detected." },
    { signal: "cascade", pattern: /cascade|onDelete|onUpdate|orphanedRowAction|delete-orphan/i, evidence: "cascade behavior evidence was detected." }
  ];
  return databaseOrmReadinessSignalFromSpecs(sourceFiles, specs, "relation", "signal");
}

function databaseOrmReadinessRepositorySignals(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["repositorySignals"] {
  const specs: Array<{ signal: DatabaseOrmReadinessReport["repositorySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "typeorm-repository", pattern: /Repository<|getRepository|getRepositoryToken|manager\.find|EntityManager/i, evidence: "TypeORM repository evidence was detected." },
    { signal: "sequelize-model-query", pattern: /\.findAll|\.findOne|\.findByPk|Model\.find|sequelize\.query/i, evidence: "Sequelize model query evidence was detected." },
    { signal: "sqlalchemy-session", pattern: /Session\(|sessionmaker|session\.execute|session\.query|scalars\(\)/i, evidence: "SQLAlchemy session evidence was detected." },
    { signal: "active-record-query", pattern: /objects\.filter|objects\.get|ActiveRecord::Relation|\.where\(|\.find_by/i, evidence: "Active Record style query evidence was detected." },
    { signal: "query-builder", pattern: /createQueryBuilder|queryBuilder|select\(|where\(|join\(/i, evidence: "query builder evidence was detected." },
    { signal: "raw-query", pattern: /raw\s*query|sequelize\.query|\$queryRaw|execute\(text\(|connection\.execute/i, evidence: "raw SQL query evidence was detected." }
  ];
  return databaseOrmReadinessSignalFromSpecs(sourceFiles, specs, "repository", "signal");
}

function databaseOrmReadinessTransactionSignals(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["transactionSignals"] {
  const specs: Array<{ signal: DatabaseOrmReadinessReport["transactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "typeorm-transaction", pattern: /manager\.transaction|DataSource\.transaction|QueryRunner|createQueryRunner/i, evidence: "TypeORM transaction evidence was detected." },
    { signal: "sequelize-transaction", pattern: /sequelize\.transaction|transaction\s*:\s*t|Transaction\.TYPES/i, evidence: "Sequelize transaction evidence was detected." },
    { signal: "sqlalchemy-session-begin", pattern: /session\.begin|Session\.begin|engine\.begin|with\s+Session/i, evidence: "SQLAlchemy session transaction evidence was detected." },
    { signal: "active-record-transaction", pattern: /ActiveRecord::Base\.transaction|\.transaction\s+do|transaction do/i, evidence: "Active Record transaction evidence was detected." },
    { signal: "rollback", pattern: /rollback|session\.rollback|queryRunner\.rollbackTransaction|transaction\.rollback/i, evidence: "rollback evidence was detected." },
    { signal: "isolation-level", pattern: /isolationLevel|isolation_level|READ COMMITTED|SERIALIZABLE|REPEATABLE READ/i, evidence: "transaction isolation evidence was detected." }
  ];
  return databaseOrmReadinessSignalFromSpecs(sourceFiles, specs, "transaction", "signal");
}

function databaseOrmReadinessLoadingSignals(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["loadingSignals"] {
  const specs: Array<{ signal: DatabaseOrmReadinessReport["loadingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "eager-loading", pattern: /eager:\s*true|eager loading|withGraphFetched|prefetch_related/i, evidence: "eager loading evidence was detected." },
    { signal: "lazy-loading", pattern: /lazy:\s*true|lazy loading|Promise<.+>|lazy=["']select/i, evidence: "lazy loading evidence was detected." },
    { signal: "joined-load", pattern: /joinedload|joined load|leftJoinAndSelect|innerJoinAndSelect/i, evidence: "joined loading evidence was detected." },
    { signal: "select-in-load", pattern: /selectinload|select in load|subqueryload/i, evidence: "select-in loading evidence was detected." },
    { signal: "include", pattern: /include:\s*\[|include:\s*\{|relations:\s*\[|attributes:\s*\[/i, evidence: "include/relations selection evidence was detected." },
    { signal: "relation-load-strategy", pattern: /relationLoadStrategy|loadRelationIds|loadRelationCountAndMap/i, evidence: "relation load strategy evidence was detected." }
  ];
  return databaseOrmReadinessSignalFromSpecs(sourceFiles, specs, "loading", "signal");
}

function databaseOrmReadinessConfigSignals(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["configSignals"] {
  const specs: Array<{ signal: DatabaseOrmReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "datasource-config", pattern: /new DataSource|DataSourceOptions|data-source\.[cm]?[jt]s|ormconfig/i, evidence: "TypeORM datasource config evidence was detected." },
    { signal: "sequelize-config", pattern: /new Sequelize|SequelizeModule|sequelize\.(config|rc)|config\/config\.(js|json|ts)/i, evidence: "Sequelize config evidence was detected." },
    { signal: "sqlalchemy-engine", pattern: /create_engine|async_engine_from_config|engine_from_config|sqlalchemy\.url/i, evidence: "SQLAlchemy engine config evidence was detected." },
    { signal: "database-url", pattern: /DATABASE_URL|DB_URL|POSTGRES_URL|MYSQL_URL|SQLALCHEMY_DATABASE_URI|url:\s*process\.env/i, evidence: "database URL evidence was detected." },
    { signal: "naming-strategy", pattern: /namingStrategy|underscored:|freezeTableName|naming_convention|schema_translate_map/i, evidence: "naming strategy evidence was detected." },
    { signal: "synchronization-policy", pattern: /synchronize\s*:|sync\(|schema:sync|dropSchema|migrationsRun|sequelize\.sync/i, evidence: "schema synchronization policy evidence was detected." },
    { signal: "connection-pool", pattern: /pool:\s*\{|pool_size|max_overflow|max\s*:\s*\d+|connectionLimit|pool_pre_ping/i, evidence: "connection pool evidence was detected." }
  ];
  return databaseOrmReadinessSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function databaseOrmReadinessCiSignals(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["ciSignals"] {
  const specs: Array<{ signal: DatabaseOrmReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout|runs-on/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "orm-command", pattern: /typeorm|sequelize-cli|sequelize db:|sqlalchemy|alembic|prisma|drizzle-kit|rails db|django.*manage\.py/i, evidence: "ORM command evidence was detected." },
    { signal: "schema-sync-check", pattern: /schema:sync|synchronize|sequelize sync|prisma validate|drizzle-kit check|mapper configuration|configure_mappers/i, evidence: "schema sync or mapper check evidence was detected." },
    { signal: "migration-check", pattern: /migration:show|migration:run|db:migrate:status|alembic current|alembic heads|prisma migrate status/i, evidence: "ORM migration check evidence was detected." },
    { signal: "database-service", pattern: /services:\s*|postgres:|mysql:|mariadb:|sqlite|docker compose|test database/i, evidence: "CI database service evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|orm report|schema report|migration report|sql report/i, evidence: "ORM artifact evidence was detected." }
  ];
  return databaseOrmReadinessSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function databaseOrmReadinessPackageSignals(sourceFiles: DatabaseOrmReadinessSourceFile[]): DatabaseOrmReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DatabaseOrmReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "typeorm", pattern: /\btypeorm\b|@nestjs\/typeorm/i, evidence: "TypeORM package evidence was detected." },
    { signal: "sequelize", pattern: /\bsequelize\b|@sequelize\/core|sequelize-typescript/i, evidence: "Sequelize package evidence was detected." },
    { signal: "sqlalchemy", pattern: /\bsqlalchemy\b|SQLAlchemy/i, evidence: "SQLAlchemy package evidence was detected." },
    { signal: "prisma", pattern: /@prisma\/client|\bprisma\b/i, evidence: "Prisma package evidence was detected." },
    { signal: "django", pattern: /\bdjango\b|django\.db/i, evidence: "Django package evidence was detected." },
    { signal: "rails", pattern: /\brails\b|activerecord|ActiveRecord::Base/i, evidence: "Rails Active Record package evidence was detected." },
    { signal: "drizzle-orm", pattern: /drizzle-orm|drizzle-kit/i, evidence: "Drizzle ORM package evidence was detected." },
    { signal: "knex", pattern: /\bknex\b|knexfile/i, evidence: "Knex package evidence was detected." },
    { signal: "objection", pattern: /\bobjection\b|Objection\.Model/i, evidence: "Objection.js package evidence was detected." }
  ];
  return databaseOrmReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function databaseOrmReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DatabaseOrmReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(haystack);
    });
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/database-orm-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
