import { z } from "zod";

export const DatabaseReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  schemaFiles: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["postgresql", "mysql", "sqlite", "sqlserver", "mongodb", "cockroachdb", "mariadb", "unknown"]),
    datasourceCount: z.number().int().nonnegative(),
    generatorCount: z.number().int().nonnegative(),
    modelCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  datasourceSignals: z.array(z.object({
    provider: z.enum(["postgresql", "mysql", "sqlite", "sqlserver", "mongodb", "cockroachdb", "mariadb", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  migrationSignals: z.array(z.object({
    signal: z.enum(["migrations-folder", "migration-sql", "migration-lock", "migrate-dev", "migrate-deploy", "db-push", "introspection", "schema-drift", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["prisma-client", "client-generation", "custom-output", "prisma-client-js", "driver-adapter", "typed-query", "studio", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["prisma-config", "database-url", "dotenv", "seed", "package-script", "docker-compose", "env-example", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["model", "relation", "id", "unique", "index", "enum", "native-type", "default", "map", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DatabaseMigrationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  migrationSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["flyway", "liquibase", "alembic", "drizzle", "rails", "prisma", "sql", "custom", "unknown"]),
    versionedCount: z.number().int().nonnegative(),
    repeatableCount: z.number().int().nonnegative(),
    changelogCount: z.number().int().nonnegative(),
    changesetCount: z.number().int().nonnegative(),
    revisionCount: z.number().int().nonnegative(),
    rollbackCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  fileSignals: z.array(z.object({
    signal: z.enum(["flyway-versioned", "flyway-repeatable", "flyway-undo", "liquibase-changelog", "liquibase-formatted-sql", "alembic-revision", "drizzle-migration", "rails-migration", "sql-migration", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lineageSignals: z.array(z.object({
    signal: z.enum(["version-prefix", "repeatable-prefix", "down-revision", "heads", "branch-label", "timestamped-version", "checksum", "databasechangelog", "schema-history", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rollbackSignals: z.array(z.object({
    signal: z.enum(["liquibase-rollback", "alembic-downgrade", "flyway-undo", "rails-down-change", "drizzle-down", "transactional-ddl", "restore-point", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["flyway-validate", "flyway-repair", "flyway-info", "liquibase-status", "liquibase-update-sql", "alembic-current", "alembic-heads", "alembic-check", "drizzle-check", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["flyway-conf", "flyway-toml", "liquibase-properties", "alembic-ini", "script-location", "version-locations", "database-url", "migration-path", "placeholder", "contexts-labels", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "migration-command", "dry-run", "schema-drift", "artifact-upload", "database-service", "manual-approval", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["flyway", "liquibase", "alembic", "drizzle-kit", "typeorm", "knex", "sequelize", "rails", "prisma", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DatabaseOrmReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  ormSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["typeorm", "sequelize", "sqlalchemy", "prisma", "django", "rails", "drizzle", "knex", "unknown"]),
    entityCount: z.number().int().nonnegative(),
    relationCount: z.number().int().nonnegative(),
    repositoryCount: z.number().int().nonnegative(),
    sessionCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    transactionCount: z.number().int().nonnegative(),
    migrationCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  entitySignals: z.array(z.object({
    signal: z.enum(["typeorm-entity", "sequelize-model", "sqlalchemy-declarative", "prisma-model", "django-model", "rails-model", "drizzle-table", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  relationSignals: z.array(z.object({
    signal: z.enum(["typeorm-relations", "sequelize-associations", "sqlalchemy-relationship", "prisma-relations", "foreign-key", "join-table", "cascade", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  repositorySignals: z.array(z.object({
    signal: z.enum(["typeorm-repository", "sequelize-model-query", "sqlalchemy-session", "active-record-query", "query-builder", "raw-query", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transactionSignals: z.array(z.object({
    signal: z.enum(["typeorm-transaction", "sequelize-transaction", "sqlalchemy-session-begin", "active-record-transaction", "rollback", "isolation-level", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loadingSignals: z.array(z.object({
    signal: z.enum(["eager-loading", "lazy-loading", "joined-load", "select-in-load", "include", "relation-load-strategy", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["datasource-config", "sequelize-config", "sqlalchemy-engine", "database-url", "naming-strategy", "synchronization-policy", "connection-pool", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "orm-command", "schema-sync-check", "migration-check", "database-service", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["typeorm", "sequelize", "sqlalchemy", "prisma", "django", "rails", "drizzle-orm", "knex", "objection", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataTransformationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  transformationSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["dbt", "sqlmesh", "dataform", "custom", "unknown"]),
    projectCount: z.number().int().nonnegative(),
    modelCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    macroCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    incrementalCount: z.number().int().nonnegative(),
    environmentCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["dbt", "sqlmesh", "dataform", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["dbt-model", "sqlmesh-model", "dataform-table", "sql-model", "python-model", "seed", "snapshot", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["ref", "source", "dependency", "declaration", "owner", "tag", "grain", "cron", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  incrementalitySignals: z.array(z.object({
    signal: z.enum(["materialized-incremental", "unique-key", "incremental-by-time-range", "scd-type-2", "pre-post-ops", "state-modified", "defer", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  environmentSignals: z.array(z.object({
    signal: z.enum(["target-profile", "sqlmesh-environment", "virtual-environment", "dataform-workflow-settings", "warehouse-engine", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  artifactSignals: z.array(z.object({
    signal: z.enum(["manifest", "run-results", "compiled-graph", "catalog", "snapshot", "state-sync", "compiled-sql", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["github-actions", "dbt-build", "dbt-compile", "dbt-ls", "sqlmesh-plan", "sqlmesh-test", "dataform-compile", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["dbt-core", "sqlmesh", "dataform-core", "dataform-cli", "sqlglot", "dbt-adapter", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataQualityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dataQualitySetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["great-expectations", "soda-core", "dbt", "deequ", "pandera", "custom", "unknown"]),
    suiteCount: z.number().int().nonnegative(),
    expectationCount: z.number().int().nonnegative(),
    checkpointCount: z.number().int().nonnegative(),
    scanCount: z.number().int().nonnegative(),
    schemaTestCount: z.number().int().nonnegative(),
    freshnessCount: z.number().int().nonnegative(),
    resultCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  expectationSignals: z.array(z.object({
    signal: z.enum(["expectation-suite", "validator", "checkpoint", "batch-request", "expect-column-values", "expect-table", "mostly", "result-format", "unexpected-rows", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sodaSignals: z.array(z.object({
    signal: z.enum(["sodacl", "checks-for", "row-count", "missing-count", "duplicate-count", "freshness", "fail-warn-threshold", "scan-command", "data-source", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dbtSignals: z.array(z.object({
    signal: z.enum(["data-tests", "schema-yml", "not-null", "unique", "accepted-values", "relationships", "source-freshness", "severity", "store-failures", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualityDimensionSignals: z.array(z.object({
    signal: z.enum(["completeness", "uniqueness", "validity", "freshness", "schema", "volume", "distribution", "anomaly", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resultSignals: z.array(z.object({
    signal: z.enum(["validation-result", "run-results", "failed-rows", "data-docs", "junit", "sarif", "artifact", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "quality-scan-command", "dbt-test-command", "gx-checkpoint-command", "soda-scan-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["great-expectations", "soda-core", "dbt-core", "dbt-expectations", "dbt-utils", "pandera", "deequ", "pydantic", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataLineageReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  lineageSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["openlineage", "marquez", "dbt", "airflow", "spark", "custom", "unknown"]),
    eventCount: z.number().int().nonnegative(),
    datasetCount: z.number().int().nonnegative(),
    jobCount: z.number().int().nonnegative(),
    runCount: z.number().int().nonnegative(),
    facetCount: z.number().int().nonnegative(),
    columnLineageCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["run-event", "event-type", "producer", "schema-url", "event-time", "run-id", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["namespace", "job-name", "run-id", "dataset-namespace", "dataset-name", "unique-id", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  datasetSignals: z.array(z.object({
    signal: z.enum(["input-dataset", "output-dataset", "dataset-version", "schema-facet", "column-lineage", "data-source", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  facetSignals: z.array(z.object({
    signal: z.enum([
      "run-nominal-time",
      "run-parent",
      "run-error-message",
      "job-source-code-location",
      "job-source-code",
      "job-sql",
      "job-ownership",
      "dataset-schema",
      "dataset-data-source",
      "dataset-lifecycle-state",
      "dataset-version",
      "dataset-column-lineage",
      "dataset-data-quality",
      "dataset-statistics",
      "custom-facet",
      "unknown"
    ]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dbtArtifactSignals: z.array(z.object({
    signal: z.enum(["manifest", "catalog", "run-results", "sources", "exposures", "metrics", "semantic-models", "parent-child-map", "depends-on", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["marquez-api", "lineage-events-table", "dataset-facets", "job-facets", "run-facets", "dataset-version", "job-version", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "dbt-docs-generate", "openlineage-command", "lineage-export", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["openlineage", "marquez", "dbt-core", "airflow-openlineage", "spark-openlineage", "sqlglot", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataCatalogReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  catalogSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["openmetadata", "datahub", "amundsen", "custom", "unknown"]),
    ingestionCount: z.number().int().nonnegative(),
    entityCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    ownershipCount: z.number().int().nonnegative(),
    glossaryCount: z.number().int().nonnegative(),
    tagCount: z.number().int().nonnegative(),
    lineageCount: z.number().int().nonnegative(),
    searchCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ingestionSignals: z.array(z.object({
    signal: z.enum(["source-config", "connector", "recipe", "workflow", "pipeline", "scheduler", "profiling", "usage", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entitySignals: z.array(z.object({
    signal: z.enum(["dataset", "table", "column", "dashboard", "chart", "data-job", "data-flow", "user", "team", "domain", "data-product", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entityMetadataSignals: z.array(z.object({
    signal: z.enum(["entity-id", "fully-qualified-name", "entity-reference", "entity-relationship", "relationship-type", "resource-href", "metadata-version", "audit-fields", "change-description", "soft-delete", "entity-status", "custom-extension", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["owner", "glossary-term", "tag", "classification", "policy", "domain", "stewardship", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  searchSignals: z.array(z.object({
    signal: z.enum(["elasticsearch", "opensearch", "semantic-search", "browse-paths", "search-index", "metadata-api", "mcp-search", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lineageSignals: z.array(z.object({
    signal: z.enum(["upstream-lineage", "column-lineage", "data-job-io", "query-lineage", "impact-analysis", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "catalog-ingestion-command", "metadata-test-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["openmetadata", "datahub", "amundsen", "elasticsearch", "opensearch", "neo4j", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DataAnnotationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  annotationSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["label-studio", "fiftyone", "argilla", "cvat", "labelbox", "custom", "unknown"]),
    projectCount: z.number().int().nonnegative(),
    taskCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    qualityCount: z.number().int().nonnegative(),
    prelabelCount: z.number().int().nonnegative(),
    reviewCount: z.number().int().nonnegative(),
    exportCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["label-studio", "fiftyone", "argilla", "cvat", "labelbox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  projectSignals: z.array(z.object({
    signal: z.enum(["project", "dataset", "workspace", "labeling-interface", "task-template", "guidelines", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  taskSignals: z.array(z.object({
    signal: z.enum(["task", "record", "sample", "import", "metadata", "assignment", "overlap", "bulk", "filter", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["label-config", "question", "choice", "taxonomy", "bounding-box", "segmentation", "span", "ranking", "rating", "text-response", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["annotate", "load-annotations", "submit-response", "draft", "review", "consensus", "ground-truth", "active-learning", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["inter-annotator-agreement", "consensus", "disagreement", "review-queue", "confidence-score", "evaluation", "validation", "metrics", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  prelabelSignals: z.array(z.object({
    signal: z.enum(["prediction", "suggestion", "model-assisted", "similarity", "embedding", "weak-supervision", "active-learning", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  exportSignals: z.array(z.object({
    signal: z.enum(["export", "json", "csv", "coco", "yolo", "fiftyone-dataset", "storage", "downstream", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "import-smoke-command", "export-smoke-command", "schema-check-command", "quality-check-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["label-studio", "fiftyone", "argilla", "cvat", "labelbox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LakehouseTableReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  lakehouseSetups: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["delta", "iceberg", "hudi", "custom", "unknown"]),
    tableCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    transactionCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    partitionCount: z.number().int().nonnegative(),
    mergeCount: z.number().int().nonnegative(),
    timeTravelCount: z.number().int().nonnegative(),
    maintenanceCount: z.number().int().nonnegative(),
    streamingCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  formatSignals: z.array(z.object({
    signal: z.enum(["delta-lake", "apache-iceberg", "apache-hudi", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tableSignals: z.array(z.object({
    signal: z.enum(["delta-table", "iceberg-table", "hudi-table", "catalog-table", "path-table", "managed-table", "external-table", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metadataSignals: z.array(z.object({
    signal: z.enum(["delta-log", "checkpoint", "protocol-version", "iceberg-metadata-json", "manifest-list", "manifest-file", "snapshot", "hudi-timeline", "commit-instant", "metadata-table", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["schema-evolution", "partition-spec", "partition-evolution", "generated-column", "constraints", "sort-order", "record-key", "precombine-key", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  writeSignals: z.array(z.object({
    signal: z.enum(["append", "merge-into", "upsert", "delete", "overwrite", "copy-on-write", "merge-on-read", "streaming-write", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timeTravelSignals: z.array(z.object({
    signal: z.enum(["version-as-of", "timestamp-as-of", "snapshot-id", "branch-or-tag", "restore", "rollback", "savepoint", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  maintenanceSignals: z.array(z.object({
    signal: z.enum(["vacuum", "optimize", "compaction", "clustering", "cleaner", "expire-snapshots", "rewrite-data-files", "remove-orphan-files", "manifest-rewrite", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  streamingSignals: z.array(z.object({
    signal: z.enum(["checkpoint-location", "change-data-feed", "incremental-query", "delta-streaming", "flink-sink", "kafka-connect", "deltastreamer", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "table-smoke-command", "merge-smoke-command", "maintenance-smoke-command", "streaming-smoke-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["delta-spark", "delta-rs", "iceberg", "iceberg-spark", "iceberg-flink", "hudi", "hudi-spark", "hudi-flink", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const FeatureStoreReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  featureStoreSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["feast", "feathr", "hopsworks", "custom", "unknown"]),
    definitionCount: z.number().int().nonnegative(),
    entityCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    offlineStoreCount: z.number().int().nonnegative(),
    onlineStoreCount: z.number().int().nonnegative(),
    materializationCount: z.number().int().nonnegative(),
    retrievalCount: z.number().int().nonnegative(),
    registryCount: z.number().int().nonnegative(),
    trainingDatasetCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  definitionSignals: z.array(z.object({
    signal: z.enum(["entity", "feature-view", "feature-service", "feature-anchor", "derived-feature", "feature-group", "schema-field", "transform", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sourceSignals: z.array(z.object({
    signal: z.enum(["batch-source", "stream-source", "request-source", "push-source", "data-source", "event-timestamp", "ttl", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["offline-store", "online-store", "registry", "provider", "redis", "spark", "snowflake", "bigquery", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  retrievalSignals: z.array(z.object({
    signal: z.enum(["historical-features", "online-features", "point-in-time", "training-dataset", "feature-join", "entity-df", "serving-api", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  materializationSignals: z.array(z.object({
    signal: z.enum(["materialize-command", "incremental-materialize", "scheduled-materialization", "streaming-ingestion", "sink", "feature-server", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "feature-store-apply-command", "materialization-command", "offline-online-test-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["feast", "feathr", "hopsworks", "redis", "spark", "kafka", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ModelRegistryReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  modelRegistrySetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["mlflow", "kubeflow", "bentoml", "custom", "unknown"]),
    registeredModelCount: z.number().int().nonnegative(),
    versionCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    aliasCount: z.number().int().nonnegative(),
    stageCount: z.number().int().nonnegative(),
    lineageCount: z.number().int().nonnegative(),
    signatureCount: z.number().int().nonnegative(),
    servingCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  registrationSignals: z.array(z.object({
    signal: z.enum(["registered-model", "model-version", "model-artifact", "model-uri", "model-store", "bento", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metadataSignals: z.array(z.object({
    signal: z.enum(["tag", "alias", "stage", "custom-property", "description", "metric", "signature", "input-example", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  artifactSignals: z.array(z.object({
    signal: z.enum(["artifact-uri", "model-uri", "download-uri", "container-image", "dockerfile", "bento-build", "package-config", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["create", "update", "search", "delete", "transition-stage", "approval", "promotion", "rollback", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  servingSignals: z.array(z.object({
    signal: z.enum(["inference-service", "serving-environment", "kserve", "model-server", "rest-api", "grpc", "bento-serve", "deployment", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lineageSignals: z.array(z.object({
    signal: z.enum(["run-link", "source-run", "model-version-lineage", "dataset-link", "evaluation-metric", "provenance", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "register-command", "model-test-command", "serving-smoke-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["mlflow", "kubeflow-model-registry", "bentoml", "kserve", "docker", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ExperimentTrackingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  experimentTrackingSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["mlflow", "wandb", "neptune", "custom", "unknown"]),
    experimentCount: z.number().int().nonnegative(),
    runCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    paramCount: z.number().int().nonnegative(),
    artifactCount: z.number().int().nonnegative(),
    datasetCount: z.number().int().nonnegative(),
    tagCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    sweepCount: z.number().int().nonnegative(),
    offlineSyncCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  runSignals: z.array(z.object({
    signal: z.enum(["experiment", "run", "run-id", "project", "entity", "tracking-uri", "resume", "offline", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loggingSignals: z.array(z.object({
    signal: z.enum(["metric", "param", "config", "summary", "artifact", "media", "table", "dataset", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metadataSignals: z.array(z.object({
    signal: z.enum(["tag", "note", "description", "source-code", "environment", "dependency", "git-commit", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  automationSignals: z.array(z.object({
    signal: z.enum(["autolog", "sweep", "hyperparameter-search", "callback", "report", "alert", "launch-job", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storageSignals: z.array(z.object({
    signal: z.enum(["tracking-server", "artifact-store", "workspace", "offline-sync", "local-cache", "remote-project", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "experiment-smoke-command", "metrics-assertion-command", "artifact-upload", "offline-sync-command", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["mlflow", "wandb", "neptune", "tensorboard", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ModelMonitoringReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  modelMonitoringSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["evidently", "whylogs", "nannyml", "custom", "unknown"]),
    referenceCount: z.number().int().nonnegative(),
    currentCount: z.number().int().nonnegative(),
    driftCount: z.number().int().nonnegative(),
    qualityCount: z.number().int().nonnegative(),
    performanceCount: z.number().int().nonnegative(),
    reportCount: z.number().int().nonnegative(),
    alertCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  datasetSignals: z.array(z.object({
    signal: z.enum(["reference-data", "current-data", "analysis-data", "column-schema", "prediction-column", "target-column", "segment", "timestamp", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  driftSignals: z.array(z.object({
    signal: z.enum(["data-drift", "prediction-drift", "target-drift", "concept-drift", "univariate-drift", "multivariate-drift", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qualitySignals: z.array(z.object({
    signal: z.enum(["missing-values", "outliers", "data-quality", "schema-validation", "constraints", "validators", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  performanceSignals: z.array(z.object({
    signal: z.enum(["classification", "regression", "estimated-performance", "realized-performance", "threshold", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reportingSignals: z.array(z.object({
    signal: z.enum(["report", "test-suite", "dashboard", "snapshot", "workspace", "export", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  alertSignals: z.array(z.object({
    signal: z.enum(["alert", "threshold", "notification", "monitor", "schedule", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "monitoring-smoke-command", "drift-test-command", "report-upload", "threshold-assertion-command", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["evidently", "whylogs", "whylabs", "nannyml", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ModelServingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  modelServingSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["kserve", "seldon", "triton", "bentoml", "custom", "unknown"]),
    inferenceServiceCount: z.number().int().nonnegative(),
    runtimeCount: z.number().int().nonnegative(),
    modelRepositoryCount: z.number().int().nonnegative(),
    protocolCount: z.number().int().nonnegative(),
    routingCount: z.number().int().nonnegative(),
    autoscalingCount: z.number().int().nonnegative(),
    healthCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["inference-service", "serving-runtime", "seldon-deployment", "triton-server", "model-repository", "custom-server", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["predictor", "transformer", "explainer", "backend", "model-format", "gpu", "batching", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  protocolSignals: z.array(z.object({
    signal: z.enum(["rest", "grpc", "v2-protocol", "http-health", "predict-endpoint", "metadata-endpoint", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  routingSignals: z.array(z.object({
    signal: z.enum(["canary", "traffic-split", "shadow", "inference-graph", "gateway", "load-balancing", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scalingSignals: z.array(z.object({
    signal: z.enum(["autoscaling", "min-replicas", "max-replicas", "scale-to-zero", "hpa", "concurrency", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  healthSignals: z.array(z.object({
    signal: z.enum(["readiness-probe", "liveness-probe", "startup-probe", "health-endpoint", "model-ready", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["cpu", "memory", "gpu", "node-selector", "tolerations", "service-account", "storage-uri", "secret", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metrics", "logging", "tracing", "prometheus", "access-log", "request-id", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "deploy-command", "inference-smoke-command", "health-check-command", "manifest-apply", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kserve", "seldon", "triton", "bentoml", "kubernetes", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ModelTrainingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  modelTrainingSetups: z.array(z.object({
    filePath: z.string(),
    tool: z.enum(["lightning", "accelerate", "ray", "custom", "unknown"]),
    trainerCount: z.number().int().nonnegative(),
    trainingLoopCount: z.number().int().nonnegative(),
    dataCount: z.number().int().nonnegative(),
    optimizerCount: z.number().int().nonnegative(),
    distributedCount: z.number().int().nonnegative(),
    acceleratorCount: z.number().int().nonnegative(),
    checkpointCount: z.number().int().nonnegative(),
    callbackCount: z.number().int().nonnegative(),
    metricCount: z.number().int().nonnegative(),
    configCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  loopSignals: z.array(z.object({
    signal: z.enum(["trainer", "train-loop", "fit", "training-step", "validation-step", "optimizer", "scheduler", "gradient-accumulation", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataSignals: z.array(z.object({
    signal: z.enum(["dataloader", "datamodule", "dataset-shard", "prepare-dataloader", "batch-size", "validation-loader", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  distributedSignals: z.array(z.object({
    signal: z.enum(["ddp", "fsdp", "deepspeed", "torchrun", "accelerate-launch", "ray-train", "multi-gpu", "multi-node", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  acceleratorSignals: z.array(z.object({
    signal: z.enum(["gpu", "tpu", "xla", "mixed-precision", "bf16", "fp16", "device-placement", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  checkpointSignals: z.array(z.object({
    signal: z.enum(["checkpoint", "resume", "save-state", "load-state", "artifact-storage", "best-model", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callbackSignals: z.array(z.object({
    signal: z.enum(["early-stopping", "lr-monitor", "model-summary", "progress-bar", "ray-report-callback", "custom-callback", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metric", "logger", "tensorboard", "wandb", "mlflow", "report", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["trainer-config", "scaling-config", "run-config", "project-config", "seed", "deterministic", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "training-smoke-command", "distributed-smoke-command", "checkpoint-assertion-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["lightning", "accelerate", "ray", "torch", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export type DatabaseReadinessReport = z.infer<typeof DatabaseReadinessReportSchema>;
export type DatabaseMigrationReadinessReport = z.infer<typeof DatabaseMigrationReadinessReportSchema>;
export type DatabaseOrmReadinessReport = z.infer<typeof DatabaseOrmReadinessReportSchema>;
export type DataTransformationReadinessReport = z.infer<typeof DataTransformationReadinessReportSchema>;
export type DataQualityReadinessReport = z.infer<typeof DataQualityReadinessReportSchema>;
export type DataLineageReadinessReport = z.infer<typeof DataLineageReadinessReportSchema>;
export type DataCatalogReadinessReport = z.infer<typeof DataCatalogReadinessReportSchema>;
export type DataAnnotationReadinessReport = z.infer<typeof DataAnnotationReadinessReportSchema>;
export type LakehouseTableReadinessReport = z.infer<typeof LakehouseTableReadinessReportSchema>;
export type FeatureStoreReadinessReport = z.infer<typeof FeatureStoreReadinessReportSchema>;
export type ModelRegistryReadinessReport = z.infer<typeof ModelRegistryReadinessReportSchema>;
export type ExperimentTrackingReadinessReport = z.infer<typeof ExperimentTrackingReadinessReportSchema>;
export type ModelMonitoringReadinessReport = z.infer<typeof ModelMonitoringReadinessReportSchema>;
export type ModelServingReadinessReport = z.infer<typeof ModelServingReadinessReportSchema>;
export type ModelTrainingReadinessReport = z.infer<typeof ModelTrainingReadinessReportSchema>;
