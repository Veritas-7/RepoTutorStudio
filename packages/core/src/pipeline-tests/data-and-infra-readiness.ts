// biome-ignore-all lint/suspicious/noTemplateCurlyInString: test fixtures assert literal template syntax from source snapshots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "../index.js";

describe("RepoTutor core pipeline - data-and-infra-readiness", () => {
  it("detects test data readiness without running factory toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-test-data-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-test-data-source-"));
    await fs.mkdir(path.join(sourceRoot, "spec", "factories"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test", "fixtures"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "Gemfile"), [
      "source 'https://rubygems.org'",
      "gem 'factory_bot'",
      "gem 'factory_bot_rails'",
      "gem 'database_cleaner-active_record'"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "test-data-demo",
      version: "1.0.0",
      scripts: {
        test: "vitest run",
        "test:data": "node src/faker-data.ts",
        seed: "prisma db seed"
      },
      dependencies: {
        "@faker-js/faker": "^9.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = ['factory_boy', 'faker', 'pytest']"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "spec", "factories", "users.rb"), [
      "FactoryBot.define do",
      "  sequence(:email) { |n| \"person#{n}@example.com\" }",
      "  factory :user do",
      "    email",
      "    transient do",
      "      posts_count { 2 }",
      "    end",
      "    trait :admin do",
      "      role { 'admin' }",
      "    end",
      "    association :account",
      "    after(:create) do |user, evaluator|",
      "      create_list(:post, evaluator.posts_count, user: user)",
      "    end",
      "  end",
      "end",
      "FactoryBot.lint",
      "FactoryBot.rewind_sequences",
      "FactoryBot.build_stubbed(:user)",
      "FactoryBot.attributes_for(:user)",
      "FactoryBot.create(:user, :admin)"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "factories.py"), [
      "import factory",
      "from faker import Faker",
      "from factory import fuzzy",
      "",
      "fake = Faker('en_US')",
      "Faker.seed(123)",
      "factory.random.reseed_random(123)",
      "",
      "class AccountFactory(factory.Factory):",
      "    class Meta:",
      "        model = dict",
      "    id = factory.Sequence(lambda n: n)",
      "",
      "class UserFactory(factory.Factory):",
      "    class Meta:",
      "        model = dict",
      "    class Params:",
      "        admin = factory.Trait(role='admin')",
      "    account = factory.SubFactory(AccountFactory)",
      "    name = factory.Faker('name')",
      "    email = factory.LazyAttribute(lambda obj: fake.email())",
      "    score = fuzzy.FuzzyInteger(1, 10)",
      "    @factory.post_generation",
      "    def groups(self, create, extracted, **kwargs):",
      "        return extracted",
      "",
      "UserFactory.build()",
      "UserFactory.create_batch(2)",
      "UserFactory.reset_sequence()"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "faker-data.ts"), [
      "import { faker, Faker, en, ko, generateMersenne32Randomizer } from '@faker-js/faker';",
      "faker.seed(123);",
      "faker.setDefaultRefDate(new Date('2020-01-01'));",
      "const randomizer = generateMersenne32Randomizer();",
      "const localFaker = new Faker({ locale: [ko, en], randomizer });",
      "export const user = {",
      "  name: faker.person.fullName(),",
      "  email: faker.internet.email(),",
      "  createdAt: faker.date.past(),",
      "  localeName: localFaker.person.firstName(),",
      "  tag: faker.helpers.arrayElement(['red', 'blue'])",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "fixtures", "users.yml"), [
      "admin:",
      "  id: 1",
      "  email: admin@example.com"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "test-data.yml"), [
      "name: test-data",
      "on:",
      "  pull_request:",
      "jobs:",
      "  factory:",
      "    runs-on: ubuntu-latest",
      "    strategy:",
      "      matrix:",
      "        worker: [1, 2]",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: bundle exec rails runner 'FactoryBot.lint'",
      "      - run: pytest -q tests/factories.py --maxfail=1",
      "      - run: rails db:seed",
      "      - run: bundle exec rake db:test:prepare",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: factory-report",
      "          path: reports/testdata"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "test-data-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dataSetups: Array<{ filePath: string; ecosystem: string; factoryCount: number; sequenceCount: number; fakerCount: number; seedCount: number; lintCount: number; readiness: string }>;
      factorySignals: Array<{ signal: string; readiness: string }>;
      relationshipSignals: Array<{ signal: string; readiness: string }>;
      generationSignals: Array<{ signal: string; readiness: string }>;
      reproducibilitySignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Test data Factory Bot factory_boy Faker factories traits associations sequences seeds fixtures deterministic lint CI");
    expect(report.dataSetups.some((item) => item.ecosystem === "factory-bot" && item.readiness === "ready" && item.factoryCount > 0 && item.sequenceCount > 0 && item.lintCount > 0)).toBe(true);
    expect(report.dataSetups.some((item) => item.ecosystem === "factory-boy" && item.factoryCount > 0 && item.fakerCount > 0 && item.seedCount > 0)).toBe(true);
    expect(report.dataSetups.some((item) => item.ecosystem === "faker-js" && item.fakerCount > 0 && item.seedCount > 0)).toBe(true);
    expect(readySignals(report.factorySignals)).toEqual(expect.arrayContaining(["factory-bot-define", "factory-boy-class", "fixture-files", "seed-scripts"]));
    expect(readySignals(report.relationshipSignals)).toEqual(expect.arrayContaining(["traits", "associations", "subfactory", "transient", "post-generation", "callbacks"]));
    expect(readySignals(report.generationSignals)).toEqual(expect.arrayContaining(["sequence", "lazy-attribute", "faker-js", "faker-python", "fuzzy", "locale", "unique"]));
    expect(readySignals(report.reproducibilitySignals)).toEqual(expect.arrayContaining(["faker-seed", "sequence-reset", "factory-lint", "fixed-ref-date", "deterministic-fixtures", "database-cleaner"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["build", "create", "attributes-for", "build-stubbed", "create-batch", "fixture-load", "db-seed"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "factory-lint", "seed-script", "test-data-artifact", "database-reset", "parallel-workers"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["factory_bot", "factory_bot_rails", "factory_boy", "faker", "@faker-js/faker", "database_cleaner"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "bundle exec rails runner 'FactoryBot.lint'",
      "pytest -q tests/factories.py tests --maxfail=1"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "test-data-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "test-data-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "test-data-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects database migration readiness without running migration toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-db-migration-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-db-migration-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "main", "resources", "db", "migration"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "database", "changelog"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "alembic", "versions"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "drizzle", "meta"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "db", "migrate"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prisma", "migrations", "20260101010101_init"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "database-migration-demo",
      version: "1.0.0",
      scripts: {
        "flyway:info": "flyway info -configFiles=flyway.conf",
        "flyway:validate": "flyway validate",
        "flyway:repair": "flyway repair",
        "liquibase:status": "liquibase status --verbose",
        "liquibase:sql": "liquibase updateSQL",
        "alembic:state": "alembic current && alembic heads && alembic check",
        "drizzle:check": "drizzle-kit check",
        "prisma:deploy": "prisma migrate deploy",
        "rails:migrate": "rails db:migrate"
      },
      dependencies: {
        flyway: "^0.0.1",
        liquibase: "^4.0.0",
        alembic: "^1.0.0",
        "drizzle-kit": "^0.31.0",
        "drizzle-orm": "^0.44.0",
        typeorm: "^0.3.0",
        knex: "^3.0.0",
        sequelize: "^6.0.0",
        rails: "^7.0.0",
        prisma: "^6.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "flyway.conf"), [
      "flyway.url=jdbc:postgresql://localhost:5432/app",
      "flyway.locations=filesystem:src/main/resources/db/migration",
      "flyway.cleanDisabled=true",
      "flyway.baselineOnMigrate=true",
      "flyway.validateOnMigrate=true",
      "flyway.outOfOrder=false",
      "flyway.placeholders.app_user=app"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "flyway.toml"), [
      "locations = [\"filesystem:src/main/resources/db/migration\"]",
      "cleanDisabled = true",
      "baselineOnMigrate = true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "resources", "db", "migration", "V1__create_users.sql"), [
      "-- Flyway versioned migration, schema history table flyway_schema_history, restore point before migration",
      "CREATE TABLE users (id bigint primary key, email text not null);",
      "CREATE INDEX idx_users_email ON users(email);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "resources", "db", "migration", "R__refresh_user_view.sql"), [
      "-- repeatable migration",
      "CREATE OR REPLACE VIEW user_emails AS SELECT email FROM users;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "resources", "db", "migration", "U1__create_users.sql"), [
      "-- Flyway undo migration executeInTransaction=false",
      "DROP TABLE users;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "database", "changelog", "changelog.xml"), [
      "<databaseChangeLog xmlns=\"http://www.liquibase.org/xml/ns/dbchangelog\">",
      "  <changeSet id=\"1\" author=\"repo\" context=\"dev\" labels=\"core\" runOnChange=\"true\">",
      "    <preConditions onFail=\"MARK_RAN\" />",
      "    <createTable tableName=\"accounts\" />",
      "    <validCheckSum>ANY</validCheckSum>",
      "    <rollback><dropTable tableName=\"accounts\" /></rollback>",
      "  </changeSet>",
      "  <changeSet id=\"2\" author=\"repo\"><tagDatabase tag=\"v1\" /></changeSet>",
      "  <!-- DATABASECHANGELOG DATABASECHANGELOGLOCK calculate-checksum -->",
      "</databaseChangeLog>"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "database", "changelog", "formatted.sql"), [
      "--liquibase formatted sql",
      "--changeset repo:3 labels:reporting context:prod runAlways:true",
      "ALTER TABLE accounts ADD COLUMN status text;",
      "--rollback ALTER TABLE accounts DROP COLUMN status;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "liquibase.properties"), [
      "changeLogFile=database/changelog/changelog.xml",
      "url=jdbc:postgresql://localhost:5432/app",
      "contexts=dev,prod",
      "labels=core"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "alembic.ini"), [
      "[alembic]",
      "script_location = alembic",
      "version_locations = %(here)s/alembic/versions",
      "sqlalchemy.url = postgresql://localhost/app"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "alembic", "env.py"), [
      "from alembic import context",
      "def run_migrations_offline():",
      "    context.configure(url='postgresql://localhost/app')",
      "def run_migrations_online():",
      "    context.configure(compare_type=True)",
      "run_migrations_online()"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "alembic", "versions", "202601010101_add_accounts.py"), [
      "revision = '202601010101'",
      "down_revision = '202512312359'",
      "branch_labels = ('core',)",
      "depends_on = None",
      "def upgrade():",
      "    op.create_table('accounts')",
      "def downgrade():",
      "    op.drop_table('accounts')"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "drizzle", "0001_init.sql"), [
      "-- drizzle migration --> statement-breakpoint",
      "CREATE TABLE drizzle_users (id integer primary key);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "drizzle", "down.sql"), [
      "-- drizzle down migration",
      "DROP TABLE drizzle_users;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "drizzle", "meta", "_journal.json"), JSON.stringify({
      version: "7",
      dialect: "postgresql",
      entries: [{ idx: 0, version: "20260101010101", tag: "0001_init", when: 1767229261000 }]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "db", "migrate", "20260101010101_create_widgets.rb"), [
      "class CreateWidgets < ActiveRecord::Migration[7.1]",
      "  disable_ddl_transaction!",
      "  def change",
      "    create_table :widgets",
      "  end",
      "  def down",
      "    drop_table :widgets",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prisma", "migrations", "20260101010101_init", "migration.sql"), [
      "-- prisma migrate deploy, migrate diff, schema drift detected",
      "ALTER TABLE users ADD COLUMN name text;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "database-migrations.yml"), [
      "name: database-migrations",
      "on:",
      "  pull_request:",
      "  workflow_dispatch:",
      "jobs:",
      "  migrations:",
      "    runs-on: ubuntu-latest",
      "    environment: production",
      "    services:",
      "      postgres:",
      "        image: postgres:16",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: flyway info -configFiles=flyway.conf",
      "      - run: flyway validate",
      "      - run: flyway repair",
      "      - run: liquibase status --verbose",
      "      - run: liquibase updateSQL > migration-dry-run.sql",
      "      - run: alembic current && alembic heads && alembic check",
      "      - run: drizzle-kit check",
      "      - run: prisma migrate deploy",
      "      - run: rails db:migrate",
      "      - run: echo \"schema drift dry run manual approval\"",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: migration report",
      "          path: migration-dry-run.sql"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "database-migration-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      migrationSetups: Array<{ tool: string; readiness: string; versionedCount: number; changelogCount: number; revisionCount: number; rollbackCount: number; validationCount: number; ciCount: number }>;
      fileSignals: Array<{ signal: string; readiness: string }>;
      lineageSignals: Array<{ signal: string; readiness: string }>;
      rollbackSignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.migrationSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        versionedCount: totals.versionedCount + item.versionedCount,
        changelogCount: totals.changelogCount + item.changelogCount,
        revisionCount: totals.revisionCount + item.revisionCount,
        rollbackCount: totals.rollbackCount + item.rollbackCount,
        validationCount: totals.validationCount + item.validationCount,
        ciCount: totals.ciCount + item.ciCount
      }), { versionedCount: 0, changelogCount: 0, revisionCount: 0, rollbackCount: 0, validationCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Database migration readiness Flyway Liquibase Alembic versioned migrations changelog changeset revision down_revision upgrade downgrade rollback validate repair info status updateSQL current heads dry-run drift CI");
    expect(setupTotals("flyway")).toMatchObject({ versionedCount: expect.any(Number), rollbackCount: expect.any(Number), validationCount: expect.any(Number) });
    expect(setupTotals("flyway").versionedCount).toBeGreaterThan(0);
    expect(setupTotals("flyway").rollbackCount).toBeGreaterThan(0);
    expect(setupTotals("flyway").validationCount).toBeGreaterThan(0);
    expect(setupTotals("liquibase").changelogCount).toBeGreaterThan(0);
    expect(setupTotals("liquibase").rollbackCount).toBeGreaterThan(0);
    expect(setupTotals("alembic").revisionCount).toBeGreaterThan(0);
    expect(setupTotals("alembic").rollbackCount).toBeGreaterThan(0);
    expect(report.migrationSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.fileSignals)).toEqual(expect.arrayContaining(["flyway-versioned", "flyway-repeatable", "flyway-undo", "liquibase-changelog", "liquibase-formatted-sql", "alembic-revision", "drizzle-migration", "rails-migration", "sql-migration"]));
    expect(readySignals(report.lineageSignals)).toEqual(expect.arrayContaining(["version-prefix", "repeatable-prefix", "down-revision", "heads", "branch-label", "timestamped-version", "checksum", "databasechangelog", "schema-history"]));
    expect(readySignals(report.rollbackSignals)).toEqual(expect.arrayContaining(["liquibase-rollback", "alembic-downgrade", "flyway-undo", "rails-down-change", "drizzle-down", "transactional-ddl", "restore-point"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["flyway-validate", "flyway-repair", "flyway-info", "liquibase-status", "liquibase-update-sql", "alembic-current", "alembic-heads", "alembic-check", "drizzle-check"]));
    expect(readySignals(report.configSignals)).toEqual(expect.arrayContaining(["flyway-conf", "flyway-toml", "liquibase-properties", "alembic-ini", "script-location", "version-locations", "database-url", "migration-path", "placeholder", "contexts-labels"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "migration-command", "dry-run", "schema-drift", "artifact-upload", "database-service", "manual-approval"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["flyway", "liquibase", "alembic", "drizzle-kit", "typeorm", "knex", "sequelize", "rails", "prisma"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "flyway validate",
      "liquibase updateSQL",
      "alembic current && alembic heads"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "database-migration-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "database-migration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "database-migration-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects database ORM readiness without running ORM toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-db-orm-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-db-orm-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "entity"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "repository"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "models"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "db"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prisma"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "drizzle"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "models"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "typeorm:show": "typeorm migration:show --dataSource src/data-source.ts",
        "sequelize:migrate:status": "sequelize-cli db:migrate:status",
        "prisma:validate": "prisma validate",
        "drizzle:check": "drizzle-kit check"
      },
      dependencies: {
        typeorm: "^0.3.0",
        sequelize: "^6.0.0",
        "@sequelize/core": "^7.0.0",
        "@prisma/client": "^6.0.0",
        prisma: "^6.0.0",
        "drizzle-orm": "^0.44.0",
        "drizzle-kit": "^0.31.0",
        knex: "^3.0.0",
        objection: "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = [\"sqlalchemy\", \"django\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Gemfile"), [
      "gem 'rails'",
      "gem 'activerecord'"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "data-source.ts"), [
      "import { DataSource } from 'typeorm';",
      "export const AppDataSource = new DataSource({",
      "  type: 'postgres',",
      "  url: process.env.DATABASE_URL,",
      "  synchronize: false,",
      "  migrationsRun: true,",
      "  namingStrategy: new SnakeNamingStrategy(),",
      "  relationLoadStrategy: 'query',",
      "  poolSize: 5,",
      "  entities: ['src/entity/*.ts'],",
      "  migrations: ['src/migrations/*.ts']",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "entity", "User.ts"), [
      "import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, JoinTable, Index } from 'typeorm';",
      "@Entity()",
      "@Index(['email'], { unique: true })",
      "export class User {",
      "  @PrimaryGeneratedColumn() id!: number;",
      "  @Column() email!: string;",
      "  @ManyToOne(() => Team, team => team.users, { cascade: true, eager: true, onDelete: 'CASCADE' })",
      "  @JoinColumn() team!: Team;",
      "  @OneToMany(() => Post, post => post.user, { lazy: true })",
      "  @JoinTable() posts!: Promise<Post[]>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "repository", "user-repository.ts"), [
      "import { Repository } from 'typeorm';",
      "export async function loadUsers(dataSource: DataSource) {",
      "  const repo: Repository<User> = dataSource.getRepository(User);",
      "  const queryRunner = dataSource.createQueryRunner();",
      "  await queryRunner.startTransaction('READ COMMITTED');",
      "  try {",
      "    await dataSource.manager.transaction('SERIALIZABLE', async manager => manager.find(User));",
      "    return repo.createQueryBuilder('user').leftJoinAndSelect('user.posts', 'post').where('user.id = :id', { id: 1 }).getMany();",
      "  } catch (error) {",
      "    await queryRunner.rollbackTransaction();",
      "    throw error;",
      "  } finally {",
      "    await queryRunner.release();",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "models", "user.model.ts"), [
      "import { Model, DataTypes, Sequelize, Transaction } from 'sequelize';",
      "const sequelize = new Sequelize(process.env.DATABASE_URL!, { pool: { max: 5 }, define: { underscored: true, freezeTableName: true } });",
      "class User extends Model {}",
      "User.init({ email: DataTypes.STRING }, { sequelize, modelName: 'user', indexes: [{ fields: ['email'] }] });",
      "User.belongsTo(Team, { foreignKey: 'teamId', onDelete: 'CASCADE' });",
      "User.hasMany(Post);",
      "User.belongsToMany(Role, { through: 'user_roles' });",
      "await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE }, async t => {",
      "  await User.findAll({ include: [{ model: Post, attributes: ['id'] }], transaction: t });",
      "  await sequelize.query('select 1', { transaction: t });",
      "});",
      "await sequelize.sync({ alter: false });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "db", "models.py"), [
      "from sqlalchemy import ForeignKey, create_engine, select, text",
      "from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session, sessionmaker, joinedload, selectinload, configure_mappers",
      "from django.db import models",
      "class Base(DeclarativeBase): pass",
      "class User(Base):",
      "    __tablename__ = 'users'",
      "    id: Mapped[int] = mapped_column(primary_key=True)",
      "    team_id: Mapped[int] = mapped_column(ForeignKey('teams.id'))",
      "    posts = relationship('Post', back_populates='user', cascade='all, delete-orphan')",
      "engine = create_engine('postgresql://localhost/app', pool_pre_ping=True, pool_size=5, max_overflow=10, isolation_level='SERIALIZABLE')",
      "SessionLocal = sessionmaker(engine)",
      "with Session(engine) as session:",
      "    with session.begin():",
      "        session.execute(select(User).options(joinedload(User.posts), selectinload(User.tags)).where(User.id == 1)).scalars()",
      "    session.rollback()",
      "configure_mappers()",
      "class DWidget(models.Model):",
      "    name = models.CharField(max_length=50)"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prisma", "schema.prisma"), [
      "model User {",
      "  id Int @id @default(autoincrement())",
      "  teamId Int @map(\"team_id\")",
      "  team Team @relation(fields: [teamId], references: [id])",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "drizzle", "schema.ts"), [
      "import { pgTable, integer, text } from 'drizzle-orm/pg-core';",
      "export const users = pgTable('users', { id: integer('id').primaryKey(), email: text('email') });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "models", "widget.rb"), [
      "class Widget < ApplicationRecord",
      "  belongs_to :team",
      "  has_many :posts",
      "  def self.load",
      "    ActiveRecord::Base.transaction do",
      "      where(active: true).find_by(name: 'demo')",
      "    end",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "database-orm.yml"), [
      "name: database-orm",
      "on: [pull_request]",
      "jobs:",
      "  orm:",
      "    runs-on: ubuntu-latest",
      "    services:",
      "      postgres:",
      "        image: postgres:16",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run typeorm:show",
      "      - run: npx sequelize-cli db:migrate:status",
      "      - run: alembic current && alembic heads",
      "      - run: npx prisma validate",
      "      - run: npx drizzle-kit check",
      "      - run: python -c \"from sqlalchemy.orm import configure_mappers; configure_mappers()\"",
      "      - run: echo \"ORM schema sync check\"",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: orm report",
      "          path: orm-report.txt"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "database-orm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      ormSetups: Array<{ framework: string; entityCount: number; relationCount: number; repositoryCount: number; sessionCount: number; queryCount: number; transactionCount: number; ciCount: number }>;
      entitySignals: Array<{ signal: string; readiness: string }>;
      relationSignals: Array<{ signal: string; readiness: string }>;
      repositorySignals: Array<{ signal: string; readiness: string }>;
      transactionSignals: Array<{ signal: string; readiness: string }>;
      loadingSignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (framework: string) => report.ormSetups
      .filter((item) => item.framework === framework)
      .reduce((totals, item) => ({
        entityCount: totals.entityCount + item.entityCount,
        relationCount: totals.relationCount + item.relationCount,
        repositoryCount: totals.repositoryCount + item.repositoryCount,
        sessionCount: totals.sessionCount + item.sessionCount,
        queryCount: totals.queryCount + item.queryCount,
        transactionCount: totals.transactionCount + item.transactionCount,
        ciCount: totals.ciCount + item.ciCount
      }), { entityCount: 0, relationCount: 0, repositoryCount: 0, sessionCount: 0, queryCount: 0, transactionCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Database ORM readiness TypeORM Sequelize SQLAlchemy entity model decorator relationship repository session query builder transaction eager loading migration synchronization CI");
    expect(setupTotals("typeorm").entityCount).toBeGreaterThan(0);
    expect(setupTotals("typeorm").relationCount).toBeGreaterThan(0);
    expect(setupTotals("typeorm").transactionCount).toBeGreaterThan(0);
    expect(setupTotals("sequelize").entityCount).toBeGreaterThan(0);
    expect(setupTotals("sequelize").relationCount).toBeGreaterThan(0);
    expect(setupTotals("sequelize").transactionCount).toBeGreaterThan(0);
    expect(setupTotals("sqlalchemy").entityCount).toBeGreaterThan(0);
    expect(setupTotals("sqlalchemy").relationCount).toBeGreaterThan(0);
    expect(setupTotals("sqlalchemy").transactionCount).toBeGreaterThan(0);
    expect(report.ormSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.entitySignals)).toEqual(expect.arrayContaining(["typeorm-entity", "sequelize-model", "sqlalchemy-declarative", "prisma-model", "django-model", "rails-model", "drizzle-table"]));
    expect(readySignals(report.relationSignals)).toEqual(expect.arrayContaining(["typeorm-relations", "sequelize-associations", "sqlalchemy-relationship", "prisma-relations", "foreign-key", "join-table", "cascade"]));
    expect(readySignals(report.repositorySignals)).toEqual(expect.arrayContaining(["typeorm-repository", "sequelize-model-query", "sqlalchemy-session", "active-record-query", "query-builder", "raw-query"]));
    expect(readySignals(report.transactionSignals)).toEqual(expect.arrayContaining(["typeorm-transaction", "sequelize-transaction", "sqlalchemy-session-begin", "active-record-transaction", "rollback", "isolation-level"]));
    expect(readySignals(report.loadingSignals)).toEqual(expect.arrayContaining(["eager-loading", "lazy-loading", "joined-load", "select-in-load", "include", "relation-load-strategy"]));
    expect(readySignals(report.configSignals)).toEqual(expect.arrayContaining(["datasource-config", "sequelize-config", "sqlalchemy-engine", "database-url", "naming-strategy", "synchronization-policy", "connection-pool"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "orm-command", "schema-sync-check", "migration-check", "database-service", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["typeorm", "sequelize", "sqlalchemy", "prisma", "django", "rails", "drizzle-orm", "knex", "objection"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "npx typeorm migration:show --dataSource src/data-source.ts",
      "npx sequelize-cli db:migrate:status",
      "alembic current && alembic heads"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "database-orm-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "database-orm-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "database-orm-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects data transformation readiness without compiling SQL or mutating warehouses", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-transform-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-transform-source-"));
    await fs.mkdir(path.join(sourceRoot, "models", "staging"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "models", "marts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "macros"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "seeds"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "snapshots"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "sqlmesh", "models"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "sqlmesh", "audits"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "definitions"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "target"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "dbt:build": "dbt build --select state:modified+ --defer --state target/prod",
        "sqlmesh:plan": "sqlmesh plan prod --auto-apply",
        "dataform:compile": "dataform compile --json"
      },
      dependencies: {
        "dbt-core": "1.10.0",
        "dbt-snowflake": "1.10.0",
        sqlmesh: "0.200.0",
        "@dataform/core": "3.0.0",
        "@dataform/cli": "3.0.0",
        sqlglot: "26.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "dbt_project.yml"), [
      "name: analytics_transform",
      "profile: analytics_profile",
      "model-paths: [models]",
      "seed-paths: [seeds]",
      "snapshot-paths: [snapshots]",
      "macro-paths: [macros]",
      "models:",
      "  analytics_transform:",
      "    marts:",
      "      +materialized: incremental",
      "vars:",
      "  warehouse: snowflake"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "models", "staging", "stg_orders.sql"), [
      "{{ config(materialized='incremental', unique_key='order_id', tags=['daily'], meta={'owner':'analytics'}) }}",
      "select order_id, customer_id, amount, updated_at",
      "from {{ source('raw', 'orders') }}",
      "{% if is_incremental() %}",
      "where updated_at > (select max(updated_at) from {{ this }})",
      "{% endif %}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "models", "staging", "schema.yml"), [
      "version: 2",
      "sources:",
      "  - name: raw",
      "    tables:",
      "      - name: orders",
      "models:",
      "  - name: stg_orders",
      "    tests:",
      "      - not_null",
      "    columns:",
      "      - name: order_id",
      "        tests:",
      "          - unique",
      "      - name: customer_id",
      "        tests:",
      "          - relationships:",
      "              to: ref('dim_customers')",
      "              field: customer_id"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "macros", "generate_schema_name.sql"), [
      "{% macro generate_schema_name(custom_schema_name, node) %}",
      "  {{ target.schema }}_{{ custom_schema_name }}",
      "{% endmacro %}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "seeds", "country_codes.csv"), "country_code,country_name\nUS,United States\n");
    await fs.writeFile(path.join(sourceRoot, "snapshots", "orders_snapshot.sql"), [
      "{% snapshot orders_snapshot %}",
      "{{ config(target_schema='snapshots', unique_key='order_id', strategy='timestamp', updated_at='updated_at') }}",
      "select * from {{ source('raw', 'orders') }}",
      "{% endsnapshot %}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "selectors.yml"), [
      "selectors:",
      "  - name: changed",
      "    definition: state:modified+"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "sqlmesh", "models", "orders.sql"), [
      "MODEL (",
      "  name analytics.orders,",
      "  kind INCREMENTAL_BY_TIME_RANGE (",
      "    time_column ds",
      "  ),",
      "  cron '@daily',",
      "  grain order_id,",
      "  owner analytics,",
      "  tags ['daily']",
      ");",
      "SELECT * FROM raw.orders"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "sqlmesh", "models", "customers.py"), [
      "from sqlmesh import model",
      "@model(name='analytics.customers', kind='SCD_TYPE_2')",
      "def execute(context, **kwargs):",
      "    return context.fetchdf('select * from raw.customers')"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "sqlmesh", "audits", "order_amount.sql"), [
      "AUDIT (name assert_positive_amount);",
      "SELECT * FROM analytics.orders WHERE amount < 0;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "sqlmesh", "config.yaml"), [
      "gateways:",
      "  snowflake:",
      "    connection:",
      "      type: snowflake",
      "default_gateway: snowflake",
      "model_defaults:",
      "  dialect: snowflake",
      "plan:",
      "  environment: dev",
      "state_connection:",
      "  type: duckdb"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "workflow_settings.yaml"), [
      "defaultProject: analytics-project",
      "defaultDataset: analytics",
      "defaultAssertionDataset: analytics_assertions",
      "dataformCoreVersion: 3.0.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "dataform.json"), JSON.stringify({ warehouse: "bigquery", defaultSchema: "analytics" }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "definitions", "orders.sqlx"), [
      "config {",
      "  type: \"incremental\",",
      "  uniqueKey: [\"order_id\"],",
      "  protected: true,",
      "  hermetic: true,",
      "  tags: [\"daily\"],",
      "  dependencies: [\"raw_orders\"]",
      "}",
      "pre_operations { select 1; }",
      "post_operations { select 1; }",
      "select * from ${ref(\"raw_orders\")}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "definitions", "raw_orders.js"), "declare({ schema: 'raw', name: 'orders' });\n");
    await fs.writeFile(path.join(sourceRoot, "definitions", "assert_orders.sqlx"), [
      "config { type: \"assertion\" }",
      "select * from ${ref(\"orders\")} where amount < 0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "target", "manifest.json"), JSON.stringify({ nodes: {}, sources: {}, compiled_code: "select 1" }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "target", "run_results.json"), JSON.stringify({ results: [], elapsed_time: 0 }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "compiled_graph.json"), JSON.stringify({ compiled_graph: { tables: ["orders"] } }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "data-transformation.yml"), [
      "name: Data transformation",
      "on: [pull_request]",
      "jobs:",
      "  transform:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: dbt build --select state:modified+ --defer --state target/prod",
      "      - run: dbt compile",
      "      - run: dbt ls --output json",
      "      - run: sqlmesh plan prod --auto-apply",
      "      - run: sqlmesh test",
      "      - run: dataform compile --json",
      "      - run: dataform run",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: transformation artifacts",
      "          path: |",
      "            target/manifest.json",
      "            target/run_results.json",
      "            sqlmesh-plan.json",
      "            dataform-compiled-graph.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "data-transformation-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      transformationSetups: Array<{ tool: string; projectCount: number; modelCount: number; sourceCount: number; macroCount: number; testCount: number; incrementalCount: number; environmentCount: number; artifactCount: number; workflowCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      dependencySignals: Array<{ signal: string; readiness: string }>;
      incrementalitySignals: Array<{ signal: string; readiness: string }>;
      environmentSignals: Array<{ signal: string; readiness: string }>;
      artifactSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.transformationSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        projectCount: totals.projectCount + item.projectCount,
        modelCount: totals.modelCount + item.modelCount,
        sourceCount: totals.sourceCount + item.sourceCount,
        macroCount: totals.macroCount + item.macroCount,
        testCount: totals.testCount + item.testCount,
        incrementalCount: totals.incrementalCount + item.incrementalCount,
        environmentCount: totals.environmentCount + item.environmentCount,
        artifactCount: totals.artifactCount + item.artifactCount,
        workflowCount: totals.workflowCount + item.workflowCount
      }), { projectCount: 0, modelCount: 0, sourceCount: 0, macroCount: 0, testCount: 0, incrementalCount: 0, environmentCount: 0, artifactCount: 0, workflowCount: 0 });

    expect(report.sourcePattern).toBe("Data transformation readiness dbt SQLMesh Dataform dbt_project.yml models seeds snapshots macros ref source materialized incremental state defer sqlmesh MODEL AUDIT plan environment snapshot dataform workflow_settings definitions publish declare assert compile run");
    expect(setupTotals("dbt").projectCount).toBeGreaterThan(0);
    expect(setupTotals("dbt").modelCount).toBeGreaterThan(0);
    expect(setupTotals("dbt").sourceCount).toBeGreaterThan(0);
    expect(setupTotals("dbt").macroCount).toBeGreaterThan(0);
    expect(setupTotals("dbt").incrementalCount).toBeGreaterThan(0);
    expect(setupTotals("sqlmesh").modelCount).toBeGreaterThan(0);
    expect(setupTotals("sqlmesh").testCount).toBeGreaterThan(0);
    expect(setupTotals("sqlmesh").environmentCount).toBeGreaterThan(0);
    expect(setupTotals("sqlmesh").incrementalCount).toBeGreaterThan(0);
    expect(setupTotals("dataform").projectCount).toBeGreaterThan(0);
    expect(setupTotals("dataform").modelCount).toBeGreaterThan(0);
    expect(setupTotals("dataform").sourceCount).toBeGreaterThan(0);
    expect(setupTotals("dataform").testCount).toBeGreaterThan(0);
    expect(setupTotals("dataform").incrementalCount).toBeGreaterThan(0);
    expect(report.transformationSetups.some((item) => item.artifactCount > 0)).toBe(true);
    expect(report.transformationSetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["dbt", "sqlmesh", "dataform"]));
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining(["dbt-model", "sqlmesh-model", "dataform-table", "sql-model", "python-model", "seed", "snapshot"]));
    expect(readySignals(report.dependencySignals)).toEqual(expect.arrayContaining(["ref", "source", "dependency", "declaration", "owner", "tag", "grain", "cron"]));
    expect(readySignals(report.incrementalitySignals)).toEqual(expect.arrayContaining(["materialized-incremental", "unique-key", "incremental-by-time-range", "scd-type-2", "pre-post-ops", "state-modified", "defer"]));
    expect(readySignals(report.environmentSignals)).toEqual(expect.arrayContaining(["target-profile", "sqlmesh-environment", "virtual-environment", "dataform-workflow-settings", "warehouse-engine"]));
    expect(readySignals(report.artifactSignals)).toEqual(expect.arrayContaining(["manifest", "run-results", "compiled-graph", "snapshot", "state-sync", "compiled-sql"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["github-actions", "dbt-build", "dbt-compile", "dbt-ls", "sqlmesh-plan", "sqlmesh-test", "dataform-compile", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["dbt-core", "sqlmesh", "dataform-core", "dataform-cli", "sqlglot", "dbt-adapter"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"dbt_project.yml|models:|seeds:|snapshots:|macros:|ref\\(|source\\(\" .",
      "rg \"sqlmesh|MODEL \\(|model_kind|AUDIT \\(|sqlmesh plan|sqlmesh run|environment|snapshot\" .",
      "rg \"workflow_settings.yaml|dataform.json|definitions/|publish\\(|declare\\(|assert\\(|ref\\(|resolve\\(\" .",
      "rg \"dbt build|dbt compile|dbt ls|sqlmesh plan|sqlmesh test|dataform compile|dataform run|upload-artifact\" .github ."
    ]));
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records data transformation readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "data-transformation-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "data-transformation-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "data-transformation-readiness.html"))).resolves.toBeUndefined();
    const dataTransformationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-transformation-readiness.md"), "utf8");
    expect(dataTransformationMarkdown).toContain("Transformation Setups");
    expect(dataTransformationMarkdown).toContain("Incrementality Signals");
    expect(dataTransformationMarkdown).toContain("Workflow Signals");
    const dataTransformationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "data-transformation-readiness.html"), "utf8");
    expect(dataTransformationHtml).toContain("data-transformation-readiness-card");
    expect(dataTransformationHtml).toContain("data-source-pattern=\"DataTransformation\"");
    expect(dataTransformationHtml).toContain("RepoTutor records data transformation readiness only");
  });

  it("detects data quality readiness without running warehouse checks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-quality-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-quality-source-"));
    await fs.mkdir(path.join(sourceRoot, "great_expectations", "expectations"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "great_expectations", "checkpoints"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "soda"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "models", "staging"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "dbt-core": "1.10.0",
        "dbt-expectations": "0.10.0",
        "dbt-utils": "1.3.0",
        "great-expectations": "1.5.0",
        "soda-core": "3.5.0",
        pandera: "0.23.0",
        pydeequ: "1.4.0",
        pydantic: "2.11.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "great_expectations", "expectations", "orders_suite.json"), JSON.stringify({
      expectation_suite_name: "orders_suite",
      meta: {
        kind: "ExpectationSuite",
        result_format: {
          result_format: "COMPLETE",
          unexpected_index_column_names: ["order_id"]
        }
      },
      expectations: [
        { expectation_type: "expect_column_values_to_not_be_null", kwargs: { column: "customer_id", mostly: 0.99 } },
        { expectation_type: "expect_column_values_to_be_unique", kwargs: { column: "order_id" } },
        { expectation_type: "expect_column_values_to_be_between", kwargs: { column: "amount", min_value: 0, max_value: 10000 } },
        { expectation_type: "expect_column_values_to_be_in_set", kwargs: { column: "status", value_set: ["paid", "pending"] } },
        { expectation_type: "expect_table_row_count_to_be_between", kwargs: { min_value: 1, max_value: 100000 } }
      ]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "great_expectations", "checkpoints", "orders_checkpoint.yml"), [
      "name: orders_checkpoint",
      "class_name: Checkpoint",
      "config_version: 1.0",
      "validations:",
      "  - batch_request:",
      "      datasource_name: warehouse",
      "      data_asset_name: orders",
      "      class_name: BatchRequest",
      "    expectation_suite_name: orders_suite",
      "action_list:",
      "  - name: store_validation_result",
      "    action:",
      "      class_name: StoreValidationResultAction",
      "      ValidationResult: ExpectationSuiteValidationResult",
      "  - name: update_data_docs",
      "    action:",
      "      class_name: UpdateDataDocsAction",
      "result_format:",
      "  result_format: COMPLETE",
      "  unexpected_index_column_names: [order_id]",
      "unexpected_count: 0",
      "unexpected_list: []",
      "unexpected_index_list: []",
      "unexpected_index_query: select * from orders where status is null",
      "data docs: generated"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "soda", "checks.yml"), [
      "checks for orders:",
      "  - row_count between 1 and 100000:",
      "      fail: when outside range",
      "  - missing_count(customer_id) = 0",
      "  - duplicate_count(order_id) = 0",
      "  - freshness(order_loaded_at) < 1d:",
      "      warn: when > 12h",
      "  - schema:",
      "      warn: when required column missing",
      "  - invalid_count(status) = 0:",
      "      valid values: [paid, pending]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "models", "staging", "schema.yml"), [
      "version: 2",
      "sources:",
      "  - name: raw",
      "    freshness:",
      "      warn_after: {count: 12, period: hour}",
      "      error_after: {count: 24, period: hour}",
      "    loaded_at_field: order_loaded_at",
      "models:",
      "  - name: stg_orders",
      "    data_tests:",
      "      - dbt_expectations.expect_table_row_count_to_be_between:",
      "          min_value: 1",
      "          max_value: 100000",
      "    columns:",
      "      - name: order_id",
      "        tests:",
      "          - not_null",
      "          - unique",
      "      - name: status",
      "        tests:",
      "          - accepted_values:",
      "              values: [paid, pending]",
      "              severity: warn",
      "              warn_if: '>0'",
      "              error_if: '>10'",
      "              store_failures: true",
      "      - name: customer_id",
      "        tests:",
      "          - relationships:",
      "              to: ref('dim_customers')",
      "              field: customer_id"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "data-quality.yml"), [
      "name: Data quality",
      "on:",
      "  schedule:",
      "    - cron: '0 * * * *'",
      "jobs:",
      "  data-quality:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: dbt test --select state:modified+",
      "      - run: dbt source freshness",
      "      - run: gx checkpoint run orders_checkpoint",
      "      - run: soda scan -d warehouse -c configuration.yml soda/checks.yml",
      "      - run: echo 'data quality validation scan quality report junit sarif'",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: data quality report",
      "          path: |",
      "            target/run_results.json",
      "            great_expectations/uncommitted/data_docs",
      "            quality-report.sarif",
      "            junit.xml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "data-quality.md"), [
      "# Data quality",
      "Completeness, uniqueness, validity, freshness, schema, volume, distribution, and anomaly coverage are reviewed.",
      "validation_result, run_results, failed rows, failed_rows, data docs, JUnit, SARIF, and artifact upload are retained."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "data-quality-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dataQualitySetups: Array<{ tool: string; suiteCount: number; expectationCount: number; checkpointCount: number; scanCount: number; schemaTestCount: number; freshnessCount: number; resultCount: number; ciCount: number }>;
      expectationSignals: Array<{ signal: string; readiness: string }>;
      sodaSignals: Array<{ signal: string; readiness: string }>;
      dbtSignals: Array<{ signal: string; readiness: string }>;
      qualityDimensionSignals: Array<{ signal: string; readiness: string }>;
      resultSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.dataQualitySetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        suiteCount: totals.suiteCount + item.suiteCount,
        expectationCount: totals.expectationCount + item.expectationCount,
        checkpointCount: totals.checkpointCount + item.checkpointCount,
        scanCount: totals.scanCount + item.scanCount,
        schemaTestCount: totals.schemaTestCount + item.schemaTestCount,
        freshnessCount: totals.freshnessCount + item.freshnessCount,
        resultCount: totals.resultCount + item.resultCount,
        ciCount: totals.ciCount + item.ciCount
      }), { suiteCount: 0, expectationCount: 0, checkpointCount: 0, scanCount: 0, schemaTestCount: 0, freshnessCount: 0, resultCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Data quality readiness Great Expectations SodaCL Soda Core dbt data_tests schema.yml ExpectationSuite Checkpoint Validator BatchRequest expectations unexpected rows result_format checks for row_count missing_count duplicate_count freshness not_null unique accepted_values relationships severity store_failures CI");
    expect(setupTotals("great-expectations").suiteCount).toBeGreaterThan(0);
    expect(setupTotals("great-expectations").expectationCount).toBeGreaterThan(0);
    expect(setupTotals("great-expectations").checkpointCount).toBeGreaterThan(0);
    expect(setupTotals("soda-core").scanCount).toBeGreaterThan(0);
    expect(setupTotals("soda-core").freshnessCount).toBeGreaterThan(0);
    expect(setupTotals("dbt").schemaTestCount).toBeGreaterThan(0);
    expect(report.dataQualitySetups.some((item) => item.resultCount > 0)).toBe(true);
    expect(report.dataQualitySetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.expectationSignals)).toEqual(expect.arrayContaining(["expectation-suite", "checkpoint", "batch-request", "expect-column-values", "expect-table", "mostly", "result-format", "unexpected-rows"]));
    expect(readySignals(report.sodaSignals)).toEqual(expect.arrayContaining(["sodacl", "checks-for", "row-count", "missing-count", "duplicate-count", "freshness", "fail-warn-threshold", "scan-command", "data-source"]));
    expect(readySignals(report.dbtSignals)).toEqual(expect.arrayContaining(["data-tests", "schema-yml", "not-null", "unique", "accepted-values", "relationships", "source-freshness", "severity", "store-failures"]));
    expect(readySignals(report.qualityDimensionSignals)).toEqual(expect.arrayContaining(["completeness", "uniqueness", "validity", "freshness", "schema", "volume", "distribution", "anomaly"]));
    expect(readySignals(report.resultSignals)).toEqual(expect.arrayContaining(["validation-result", "run-results", "failed-rows", "data-docs", "junit", "sarif", "artifact"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "quality-scan-command", "dbt-test-command", "gx-checkpoint-command", "soda-scan-command", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["great-expectations", "soda-core", "dbt-core", "dbt-expectations", "dbt-utils", "pandera", "deequ", "pydantic"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"ExpectationSuite|Checkpoint|Validator|BatchRequest|expect_column_values|unexpected|result_format\" .",
      "rg \"checks for|SodaCL|row_count|missing_count|duplicate_count|freshness|fail|warn|threshold\" .",
      "dbt test --select state:modified+",
      "soda scan -d <data-source> -c configuration.yml checks.yml"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "data-quality-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "data-quality-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "data-quality-readiness.html"))).resolves.toBeUndefined();
    const dataQualityMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-quality-readiness.md"), "utf8");
    expect(dataQualityMarkdown).toContain("Great Expectations Signals");
    expect(dataQualityMarkdown).toContain("Soda Signals");
    expect(dataQualityMarkdown).toContain("dbt Signals");
    const dataQualityHtml = await fs.readFile(path.join(result.session.outputPaths.html, "data-quality-readiness.html"), "utf8");
    expect(dataQualityHtml).toContain("data-quality-readiness-card");
    expect(dataQualityHtml).toContain("data-source-pattern=\"DataQuality\"");
  });

  it("detects data lineage readiness without running lineage backends", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-lineage-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-lineage-source-"));
    await fs.mkdir(path.join(sourceRoot, "openlineage"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "marquez"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "dbt"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "apache-airflow-providers-openlineage": "2.8.0",
        "dbt-core": "1.10.0",
        marquez: "0.51.0",
        openlineage: "1.37.0",
        "openlineage-spark": "1.37.0",
        sqlglot: "26.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "openlineage", "orders-run-event.json"), JSON.stringify({
      eventType: "COMPLETE",
      eventTime: "2026-06-05T00:00:00Z",
      producer: "https://github.com/example/producer",
      schemaURL: "https://openlineage.io/spec/2-0-2/OpenLineage.json",
      run: {
        runId: "11111111-1111-4111-8111-111111111111",
        facets: {
          nominalTime: { _producer: "repo", _schemaURL: "https://openlineage.io/spec/facets/1-0-0/NominalTimeRunFacet.json" },
          parent: { run: { runId: "00000000-0000-4000-8000-000000000000" }, job: { namespace: "analytics", name: "daily_parent" } },
          errorMessage: { message: "upstream source was unavailable", programmingLanguage: "sql" }
        }
      },
      job: {
        namespace: "analytics",
        name: "daily_orders",
        jobName: "daily_orders",
        facets: {
          sourceCodeLocation: { type: "git", url: "https://github.com/example/repo/blob/main/models/orders.sql", repoUrl: "https://github.com/example/repo", path: "models/orders.sql", version: "abc123" },
          sourceCode: { language: "sql", sourceCode: "select order_id, customer_id from raw.orders" },
          sql: { query: "select order_id, customer_id from raw.orders" },
          jobType: { processingType: "BATCH", integration: "DBT", jobType: "QUERY" },
          ownership: { owners: [{ name: "analytics", type: "TEAM" }] },
          repo_customJobFacet: { _producer: "repo", _schemaURL: "https://example.com/RepoCustomJobFacet.json" }
        }
      },
      inputs: [
        {
          namespace: "warehouse",
          name: "raw.orders",
          facets: {
            schema: { fields: [{ name: "order_id", type: "string" }, { name: "customer_id", type: "string" }] },
            dataSource: { name: "warehouse", uri: "snowflake://account/db/schema" },
            datasetVersion: { datasetVersion: "raw-orders-v1" },
            dataQualityMetrics: { rowCount: 42, bytes: 1024 },
            dataQualityAssertions: { assertions: [{ assertion: "not_null_order_id", success: true }] },
            inputStatistics: { rowCount: 42, size: 1024 }
          }
        }
      ],
      outputs: [
        {
          namespace: "warehouse",
          name: "mart.orders",
          facets: {
            schema: { fields: [{ name: "order_id", type: "string" }, { name: "customer_id", type: "string" }] },
            columnLineage: {
              fields: {
                order_id: { inputFields: [{ namespace: "warehouse", name: "raw.orders", field: "order_id" }] },
                customer_id: { inputFields: [{ namespace: "warehouse", name: "raw.orders", field: "customer_id" }] }
              }
            },
            lifecycleStateChange: { lifecycleStateChange: "OVERWRITE" },
            outputStatistics: { rowCount: 42, size: 1024 }
          }
        }
      ],
      InputDataset: "raw.orders",
      OutputDataset: "mart.orders",
      LineageEvent: "RunEvent"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "marquez", "storage.sql"), [
      "-- Marquez receives OpenLineage via POST /lineage and LineageResource.",
      "create table lineage_events (run_uuid uuid, event_time timestamptz, job_name text, job_namespace text, event jsonb);",
      "create table dataset_facets (run_uuid uuid, lineage_event_time timestamptz, lineage_event_type varchar, facet jsonb);",
      "create table job_facets (run_uuid uuid, lineage_event_time timestamptz, lineage_event_type varchar, facet jsonb);",
      "create table run_facets (run_uuid uuid, lineage_event_time timestamptz, lineage_event_type varchar, facet jsonb);",
      "create table dataset_versions (dataset_uuid uuid, externalVersion text);",
      "create table job_versions (job_uuid uuid, version uuid);",
      "-- DatasetVersionRow JobVersionRow DatasetId DatasetName DatasetField field_mapping run_uuid"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "dbt", "manifest.json"), JSON.stringify({
      metadata: { dbt_schema_version: "https://schemas.getdbt.com/dbt/manifest/v12.json" },
      parent_map: { "model.analytics.stg_orders": ["source.analytics.raw.orders"] },
      child_map: { "source.analytics.raw.orders": ["model.analytics.stg_orders"] },
      nodes: {
        "model.analytics.stg_orders": {
          unique_id: "model.analytics.stg_orders",
          relation_name: "analytics.stg_orders",
          depends_on: { nodes: ["source.analytics.raw.orders"] },
          sources: ["source.analytics.raw.orders"],
          metrics: ["metric.analytics.order_count"],
          compiled_sql: "select * from {{ source('raw', 'orders') }}"
        }
      },
      sources: {
        "source.analytics.raw.orders": {
          unique_id: "source.analytics.raw.orders",
          relation_name: "raw.orders"
        }
      },
      exposures: { "exposure.analytics.dashboard": { unique_id: "exposure.analytics.dashboard" } },
      metrics: { "metric.analytics.order_count": { unique_id: "metric.analytics.order_count" } },
      semantic_models: { "semantic_model.analytics.orders": { unique_id: "semantic_model.analytics.orders" } },
      group_map: { analytics: ["model.analytics.stg_orders"] }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "dbt", "catalog.json"), JSON.stringify({
      nodes: {
        "model.analytics.stg_orders": {
          metadata: { type: "table", schema: "analytics", name: "stg_orders" },
          columns: { order_id: { type: "string" }, customer_id: { type: "string" } }
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "dbt", "run_results.json"), JSON.stringify({
      results: [{ unique_id: "model.analytics.stg_orders", status: "success", execution_time: 1.23 }]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "dbt", "sources.json"), JSON.stringify({
      results: [{ unique_id: "source.analytics.raw.orders", status: "pass", max_loaded_at: "2026-06-05T00:00:00Z" }]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "lineage.yml"), [
      "name: Data lineage",
      "on:",
      "  schedule:",
      "    - cron: '0 * * * *'",
      "jobs:",
      "  lineage:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: dbt docs generate",
      "      - run: dbt ls --output json",
      "      - run: echo 'openlineage dbt-ol send-events lineage backend'",
      "      - run: echo 'lineage export lineage.json'",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: lineage artifact",
      "          path: |",
      "            dbt/manifest.json",
      "            dbt/catalog.json",
      "            dbt/run_results.json",
      "            dbt/sources.json",
      "            lineage.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "data-lineage-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      lineageSetups: Array<{ tool: string; eventCount: number; datasetCount: number; jobCount: number; runCount: number; facetCount: number; columnLineageCount: number; artifactCount: number; ciCount: number }>;
      eventSignals: Array<{ signal: string; readiness: string }>;
      identitySignals: Array<{ signal: string; readiness: string }>;
      datasetSignals: Array<{ signal: string; readiness: string }>;
      facetSignals: Array<{ signal: string; readiness: string }>;
      dbtArtifactSignals: Array<{ signal: string; readiness: string }>;
      storageSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.lineageSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        eventCount: totals.eventCount + item.eventCount,
        datasetCount: totals.datasetCount + item.datasetCount,
        jobCount: totals.jobCount + item.jobCount,
        runCount: totals.runCount + item.runCount,
        facetCount: totals.facetCount + item.facetCount,
        columnLineageCount: totals.columnLineageCount + item.columnLineageCount,
        artifactCount: totals.artifactCount + item.artifactCount,
        ciCount: totals.ciCount + item.ciCount
      }), { eventCount: 0, datasetCount: 0, jobCount: 0, runCount: 0, facetCount: 0, columnLineageCount: 0, artifactCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Data lineage readiness OpenLineage Marquez dbt RunEvent LineageEvent eventType producer schemaURL namespace job run dataset input output facet RunFacet JobFacet DatasetFacet InputDatasetFacet OutputDatasetFacet nominalTime parent errorMessage sourceCodeLocation sourceCode sql ownership dataSource lifecycleStateChange columnLineage dataQualityMetrics dataQualityAssertions inputStatistics outputStatistics custom facet _schemaURL manifest.json catalog.json run_results.json parent_map child_map depends_on lineage_events dataset_facets job_facets run_facets CI");
    expect(setupTotals("openlineage").eventCount).toBeGreaterThan(0);
    expect(setupTotals("openlineage").datasetCount).toBeGreaterThan(0);
    expect(setupTotals("openlineage").columnLineageCount).toBeGreaterThan(0);
    expect(setupTotals("marquez").facetCount).toBeGreaterThan(0);
    expect(setupTotals("dbt").artifactCount).toBeGreaterThan(0);
    expect(report.lineageSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.eventSignals)).toEqual(expect.arrayContaining(["run-event", "event-type", "producer", "schema-url", "event-time", "run-id"]));
    expect(readySignals(report.identitySignals)).toEqual(expect.arrayContaining(["namespace", "job-name", "run-id", "dataset-namespace", "dataset-name", "unique-id"]));
    expect(readySignals(report.datasetSignals)).toEqual(expect.arrayContaining(["input-dataset", "output-dataset", "dataset-version", "schema-facet", "column-lineage", "data-source"]));
    expect(readySignals(report.facetSignals)).toEqual(expect.arrayContaining(["run-nominal-time", "run-parent", "run-error-message", "job-source-code-location", "job-source-code", "job-sql", "job-ownership", "dataset-schema", "dataset-data-source", "dataset-lifecycle-state", "dataset-version", "dataset-column-lineage", "dataset-data-quality", "dataset-statistics", "custom-facet"]));
    expect(readySignals(report.dbtArtifactSignals)).toEqual(expect.arrayContaining(["manifest", "catalog", "run-results", "sources", "exposures", "metrics", "semantic-models", "parent-child-map", "depends-on"]));
    expect(readySignals(report.storageSignals)).toEqual(expect.arrayContaining(["marquez-api", "lineage-events-table", "dataset-facets", "job-facets", "run-facets", "dataset-version", "job-version"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "dbt-docs-generate", "openlineage-command", "lineage-export", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["openlineage", "marquez", "dbt-core", "airflow-openlineage", "spark-openlineage", "sqlglot"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"RunEvent|LineageEvent|eventType|producer|schemaURL|runId|namespace\" .",
      "rg \"inputs|outputs|InputDataset|OutputDataset|columnLineage|inputFields|DatasetVersion\" .",
      "dbt docs generate && dbt ls --output json"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "data-lineage-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "data-lineage-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "data-lineage-readiness.html"))).resolves.toBeUndefined();
    const dataLineageMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-lineage-readiness.md"), "utf8");
    expect(dataLineageMarkdown).toContain("Event Signals");
    expect(dataLineageMarkdown).toContain("Facet Signals");
    expect(dataLineageMarkdown).toContain("dbt Artifact Signals");
    expect(dataLineageMarkdown).toContain("Storage Signals");
    const dataLineageHtml = await fs.readFile(path.join(result.session.outputPaths.html, "data-lineage-readiness.html"), "utf8");
    expect(dataLineageHtml).toContain("data-lineage-readiness-card");
    expect(dataLineageHtml).toContain("data-source-pattern=\"DataLineage\"");
  });

  it("detects data catalog readiness without running catalog backends", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-catalog-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-catalog-source-"));
    await fs.mkdir(path.join(sourceRoot, "openmetadata"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "datahub"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "amundsen"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "openmetadata-ingestion": "1.0.0",
        "acryl-datahub": "1.0.0",
        datahub: "1.0.0",
        "amundsen-frontend": "1.0.0",
        "amundsen-search": "1.0.0",
        "amundsen-metadata": "1.0.0",
        "amundsen-databuilder": "1.0.0",
        elasticsearch: "8.0.0",
        "opensearch-py": "2.0.0",
        neo4j: "5.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "openmetadata", "workflow.yml"), [
      "workflow: OpenMetadataWorkflowConfig",
      "sourceConfig:",
      "  config:",
      "    type: DatabaseMetadata",
      "    includeTables: true",
      "    includeGlossaryTerms: true",
      "    includeTags: true",
      "    includeDatabaseServices: true",
      "serviceConnection:",
      "  config:",
      "    DatabaseService: snowflake",
      "pipeline: IngestionPipeline",
      "pipelineType: PipelineType",
      "profiler: DatabaseServiceProfilerPipeline",
      "queryLineage: DatabaseServiceQueryLineagePipeline",
      "computeTableMetrics: true",
      "computeColumnMetrics: true",
      "processQueryLineage: true",
      "processViewLineage: true",
      "processStoredProcedureLineage: true",
      "supportsElasticSearchReindexingExtraction: true",
      "sourcePythonClass: metadata.ingestion.source.database.snowflake",
      "ingestionPipelineFQN: service.pipeline",
      "QueryUsage usageStats popular_tables",
      "Dataset Table Column Dashboard Chart DataJob DataFlow User Team Domain DataProduct",
      "Owner Ownership GlossaryTerm Glossary Tag Classification Policy steward",
      "SearchIndex search_metadata semantic_search ElasticSearch OpenSearch metadata API MCP",
      "upstreamLineage columnLineage query lineage impact analysis",
      "EntityReference EntityRelationship relationshipType fromEntity toEntity",
      "id fullyQualifiedName href version updatedAt updatedBy changeDescription deleted entityStatus extension customProperties"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "datahub", "recipe.yml"), [
      "recipe: datahub catalog recipe",
      "source:",
      "  type: snowflake",
      "  config:",
      "    profiling: enabled",
      "sink:",
      "  type: datahub-rest",
      "MetadataChangeProposal MetadataChangeEvent MetadataAspect DataHubGraph DataHubClient",
      "Dataset DatasetUrn schemaMetadata Column Dashboard Chart DataJob DataFlow CorpUser Team Domain DataProduct",
      "EntityReference EntityRelationship id fullyQualifiedName href version updatedAt updatedBy changeDescription deleted entityStatus extension customProperties",
      "Ownership Owner globalTags Tag GlossaryTerm Glossary browsePaths browsePath",
      "upstreamLineage columnLineage DataJobInputOutput query lineage impact analysis",
      "SearchIndex indexing metadata API"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "amundsen", "catalog.md"), [
      "# Amundsen catalog",
      "amundsen-databuilder builds metadata ingestion jobs with Airflow DAG scheduler support.",
      "SearchService serves a Restful API and uses Elasticsearch search index capabilities.",
      "MetadataService stores TableMetadata, Column, Dashboard, User, Owner, Badge, Tag, ResourceType metadata.",
      "Neo4j and gremlin backends support metadata graph storage, popular_tables, bookmark, and lineage views.",
      "Owner stewardship and Tag governance help users find catalog resources."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "catalog.yml"), [
      "name: Data catalog",
      "on:",
      "  schedule:",
      "    - cron: '0 4 * * *'",
      "jobs:",
      "  catalog:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: metadata ingest -c openmetadata/workflow.yml",
      "      - run: datahub ingest -c datahub/recipe.yml",
      "      - run: python -m databuilder.job.job",
      "      - run: pytest tests/metadata",
      "      - run: metadata test --report catalog-report.json",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: catalog metadata artifact",
      "          path: |",
      "            catalog-report.json",
      "            metadata-ingestion.log"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "data-catalog-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      catalogSetups: Array<{ tool: string; ingestionCount: number; entityCount: number; schemaCount: number; ownershipCount: number; glossaryCount: number; tagCount: number; lineageCount: number; searchCount: number; policyCount: number; ciCount: number }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      entitySignals: Array<{ signal: string; readiness: string }>;
      entityMetadataSignals: Array<{ signal: string; readiness: string }>;
      governanceSignals: Array<{ signal: string; readiness: string }>;
      searchSignals: Array<{ signal: string; readiness: string }>;
      lineageSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.catalogSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        ingestionCount: totals.ingestionCount + item.ingestionCount,
        entityCount: totals.entityCount + item.entityCount,
        schemaCount: totals.schemaCount + item.schemaCount,
        ownershipCount: totals.ownershipCount + item.ownershipCount,
        glossaryCount: totals.glossaryCount + item.glossaryCount,
        tagCount: totals.tagCount + item.tagCount,
        lineageCount: totals.lineageCount + item.lineageCount,
        searchCount: totals.searchCount + item.searchCount,
        policyCount: totals.policyCount + item.policyCount,
        ciCount: totals.ciCount + item.ciCount
      }), { ingestionCount: 0, entityCount: 0, schemaCount: 0, ownershipCount: 0, glossaryCount: 0, tagCount: 0, lineageCount: 0, searchCount: 0, policyCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Data catalog readiness OpenMetadata DataHub Amundsen metadata ingestion connector sourceConfig recipe workflow IngestionPipeline Dataset Table Column EntityReference EntityRelationship id fullyQualifiedName href version updatedAt updatedBy changeDescription deleted entityStatus extension customProperties GlossaryTerm Tag Owner Ownership Classification Domain DataProduct Search ElasticSearch OpenSearch semantic search browsePaths lineage upstreamLineage column lineage policy CI");
    expect(setupTotals("openmetadata").ingestionCount).toBeGreaterThan(0);
    expect(setupTotals("openmetadata").searchCount).toBeGreaterThan(0);
    expect(setupTotals("datahub").entityCount).toBeGreaterThan(0);
    expect(setupTotals("datahub").lineageCount).toBeGreaterThan(0);
    expect(setupTotals("amundsen").searchCount).toBeGreaterThan(0);
    expect(setupTotals("amundsen").ownershipCount).toBeGreaterThan(0);
    expect(report.catalogSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.ingestionSignals)).toEqual(expect.arrayContaining(["source-config", "connector", "recipe", "workflow", "pipeline", "scheduler", "profiling", "usage"]));
    expect(readySignals(report.entitySignals)).toEqual(expect.arrayContaining(["dataset", "table", "column", "dashboard", "chart", "data-job", "data-flow", "user", "team", "domain", "data-product"]));
    expect(readySignals(report.entityMetadataSignals)).toEqual(expect.arrayContaining(["entity-id", "fully-qualified-name", "entity-reference", "entity-relationship", "relationship-type", "resource-href", "metadata-version", "audit-fields", "change-description", "soft-delete", "entity-status", "custom-extension"]));
    expect(readySignals(report.governanceSignals)).toEqual(expect.arrayContaining(["owner", "glossary-term", "tag", "classification", "policy", "domain", "stewardship"]));
    expect(readySignals(report.searchSignals)).toEqual(expect.arrayContaining(["elasticsearch", "opensearch", "semantic-search", "browse-paths", "search-index", "metadata-api", "mcp-search"]));
    expect(readySignals(report.lineageSignals)).toEqual(expect.arrayContaining(["upstream-lineage", "column-lineage", "data-job-io", "query-lineage", "impact-analysis"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "catalog-ingestion-command", "metadata-test-command", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["openmetadata", "datahub", "amundsen", "elasticsearch", "opensearch", "neo4j"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"sourceConfig|serviceConnection|connector|recipe|IngestionPipeline|metadata ingestion\" .",
      "rg \"Dataset|Table|Column|Dashboard|Chart|DataJob|DataFlow|CorpUser|Team|Domain|DataProduct\" .",
      "rg \"upstreamLineage|columnLineage|DataJobInputOutput|query lineage|impact analysis\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "data-catalog-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "data-catalog-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "data-catalog-readiness.html"))).resolves.toBeUndefined();
    const dataCatalogMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-catalog-readiness.md"), "utf8");
    expect(dataCatalogMarkdown).toContain("Ingestion Signals");
    expect(dataCatalogMarkdown).toContain("Entity Metadata Signals");
    expect(dataCatalogMarkdown).toContain("Governance Signals");
    expect(dataCatalogMarkdown).toContain("Search Signals");
    const dataCatalogHtml = await fs.readFile(path.join(result.session.outputPaths.html, "data-catalog-readiness.html"), "utf8");
    expect(dataCatalogHtml).toContain("data-catalog-readiness-card");
    expect(dataCatalogHtml).toContain("data-source-pattern=\"DataCatalog\"");
  });

  it("detects data annotation readiness without running annotation tools or jobs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-annotation-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-annotation-source-"));
    await fs.mkdir(path.join(sourceRoot, "labelstudio"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "fiftyone"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "argilla"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"data-annotation-fixture\"",
      "description = \"Label Studio FiftyOne Argilla CVAT Labelbox custom annotation labeling workflow fixture\"",
      "dependencies = [\"label-studio\", \"fiftyone\", \"argilla\", \"cvat-sdk\", \"labelbox\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "labelstudio", "project.py"), [
      "from label_studio_sdk import Client",
      "LABEL_CONFIG = \"\"\"<View><Image name='image' value='$image'/><Choices name='label' toName='image'><Choice value='cat'/><Choice value='dog'/></Choices><RectangleLabels name='bbox' toName='image'><Label value='object'/></RectangleLabels><BrushLabels name='mask' toName='image'><Label value='foreground'/></BrushLabels><TextArea name='comment' toName='image'/></View>\"\"\"",
      "LABEL_CONFIG_XML = LABEL_CONFIG",
      "client = Client(url=\"http://localhost:8080\", api_key=\"token\")",
      "project = client.projects.create(title=\"image annotation project\", label_config=LABEL_CONFIG, show_collab_predictions=True, maximum_annotations=3)",
      "task_template = \"task template labeling interface guidelines metadata assignment overlap bulk\"",
      "tasks = [{\"data\": {\"image\": \"s3://bucket/cat.jpg\"}, \"metadata\": {\"split\": \"train\"}, \"predictions\": [{\"score\": 0.91, \"result\": []}]}]",
      "project.import_tasks(tasks)",
      "project.tasks.create(data=tasks[0][\"data\"], metadata=tasks[0][\"metadata\"])",
      "project.annotations.create(task_id=1, result=[], ground_truth=True, was_cancelled=False)",
      "project.predictions.create(task_id=1, result=[], score=0.91)",
      "stats = project.stats.total_agreement",
      "agreement_annotator = stats",
      "consensus = \"human consensus disagreement review queue ground_truth confidence validation metrics annotation-report downstream model training\"",
      "exported_json = project.export(format=\"JSON\")",
      "exported_csv = project.export(format=\"CSV\")",
      "exported_coco = project.export(format=\"COCO\")",
      "exported_yolo = project.export(format=\"YOLO\")",
      "export_storage = \"S3 export storage for downstream training dataset\"",
      "custom_annotation_workflow = \"annotator labeling workflow review queue submit response save as draft weak supervision active learning\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "fiftyone", "annotation.py"), [
      "import fiftyone as fo",
      "import fiftyone.brain as fob",
      "dataset = fo.Dataset(\"annotation-demo\")",
      "sample = fo.Sample(filepath=\"cat.jpg\")",
      "sample[\"ground_truth\"] = fo.Detections(detections=[])",
      "sample[\"predictions\"] = fo.Detections(detections=[])",
      "sample[\"metadata\"] = {\"assignment\": \"reviewer-a\", \"taxonomy\": \"animal\"}",
      "dataset.add_sample(sample)",
      "unique_view = dataset.match_tags(\"needs_annotation\")",
      "anno_key = \"labelstudio_round1\"",
      "unique_view.annotate(anno_key, label_field=\"ground_truth\", backend=\"labelstudio\", label_type=\"detections\", classes=[\"cat\", \"dog\"], launch_editor=False)",
      "dataset.load_annotations(anno_key)",
      "dataset.evaluate_detections(\"predictions\", gt_field=\"ground_truth\", eval_key=\"eval\")",
      "dataset.evaluate_classifications(\"predictions\", gt_field=\"ground_truth\", eval_key=\"class_eval\")",
      "fob.compute_similarity(dataset, brain_key=\"img_sim\", embeddings=\"embedding\")",
      "dataset.export(export_dir=\"exports/coco\", dataset_type=fo.types.COCODetectionDataset)",
      "dataset.export(export_dir=\"exports/yolo\", dataset_type=fo.types.YOLOv5Dataset)",
      "dataset.export(export_dir=\"exports/fiftyone\", dataset_type=fo.types.FiftyOneDataset)",
      "active learning unique sample similarity confidence metrics JSON CSV COCO YOLO FiftyOneDataset"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "argilla", "feedback.py"), [
      "import argilla as rg",
      "settings = rg.Settings(",
      "    fields=[rg.TextField(name=\"text\")],",
      "    questions=[rg.LabelQuestion(name=\"label\", labels=[\"good\", \"bad\"]), rg.MultiLabelQuestion(name=\"topics\", labels=[\"a\", \"b\"]), rg.RatingQuestion(name=\"rating\", values=[1, 2, 3]), rg.TextQuestion(name=\"comment\"), rg.RankingQuestion(name=\"rank\", values=[\"a\", \"b\"])],",
      "    guidelines=\"annotation guidelines with taxonomy span named entity token text response\"",
      ")",
      "dataset = rg.Dataset(name=\"feedback\", workspace=\"admin\", settings=settings)",
      "feedback = rg.FeedbackDataset(fields=[rg.TextField(name=\"text\")], questions=settings.questions, guidelines=\"feedback guidelines\")",
      "vectors = rg.VectorSettings(name=\"embedding\", dimensions=384)",
      "records = [rg.Record(fields={\"text\": \"example\"}, suggestions=[rg.Suggestion(question_name=\"label\", value=\"good\", score=0.93)], responses=[rg.Response(values={\"label\": {\"value\": \"good\"}}, status=\"submitted\")], vectors={\"embedding\": [0.1, 0.2]})]",
      "dataset.records.log(records)",
      "pending = dataset.records.filter_by(response_status=\"pending\")",
      "overlap = \"OverlapTaskDistributionModel strategy overlap min_submitted=2 response_status pending save as draft submit response review disagreement consensus\"",
      "weak_supervision = \"weak supervision suggestion model-assisted prelabel active learning\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "annotation.yml"), [
      "name: annotation",
      "on: [push]",
      "jobs:",
      "  annotation:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: python labelstudio/project.py --annotation-smoke --schema-check --import-smoke",
      "      - run: python fiftyone/annotation.py --import-smoke --export-smoke",
      "      - run: python argilla/feedback.py --quality-check --agreement",
      "      - run: pytest tests/annotation --schema-check --quality-check",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: annotation-report",
      "          path: |",
      "            annotation-report.json",
      "            exports/annotations.json",
      "            exports/coco",
      "            exports/yolo",
      "            agreement-report"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "data-annotation-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      annotationSetups: Array<{ tool: string; projectCount: number; taskCount: number; schemaCount: number; labelCount: number; workflowCount: number; qualityCount: number; prelabelCount: number; reviewCount: number; exportCount: number; ciCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      projectSignals: Array<{ signal: string; readiness: string }>;
      taskSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      qualitySignals: Array<{ signal: string; readiness: string }>;
      prelabelSignals: Array<{ signal: string; readiness: string }>;
      exportSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.annotationSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        projectCount: totals.projectCount + item.projectCount,
        taskCount: totals.taskCount + item.taskCount,
        schemaCount: totals.schemaCount + item.schemaCount,
        labelCount: totals.labelCount + item.labelCount,
        workflowCount: totals.workflowCount + item.workflowCount,
        qualityCount: totals.qualityCount + item.qualityCount,
        prelabelCount: totals.prelabelCount + item.prelabelCount,
        reviewCount: totals.reviewCount + item.reviewCount,
        exportCount: totals.exportCount + item.exportCount,
        ciCount: totals.ciCount + item.ciCount
      }), { projectCount: 0, taskCount: 0, schemaCount: 0, labelCount: 0, workflowCount: 0, qualityCount: 0, prelabelCount: 0, reviewCount: 0, exportCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Data annotation readiness Label Studio FiftyOne Argilla annotation labeling label_config annotate load_annotations FeedbackDataset questions suggestions responses agreement consensus review export CI");
    expect(setupTotals("label-studio").projectCount).toBeGreaterThan(0);
    expect(setupTotals("label-studio").workflowCount).toBeGreaterThan(0);
    expect(setupTotals("fiftyone").taskCount).toBeGreaterThan(0);
    expect(setupTotals("fiftyone").exportCount).toBeGreaterThan(0);
    expect(setupTotals("argilla").schemaCount).toBeGreaterThan(0);
    expect(setupTotals("argilla").prelabelCount).toBeGreaterThan(0);
    expect(report.annotationSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["label-studio", "fiftyone", "argilla", "cvat", "labelbox", "custom"]));
    expect(readySignals(report.projectSignals)).toEqual(expect.arrayContaining(["project", "dataset", "workspace", "labeling-interface", "task-template", "guidelines"]));
    expect(readySignals(report.taskSignals)).toEqual(expect.arrayContaining(["task", "record", "sample", "import", "metadata", "assignment", "overlap", "bulk", "filter"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["label-config", "question", "choice", "taxonomy", "bounding-box", "segmentation", "span", "ranking", "rating", "text-response"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["annotate", "load-annotations", "submit-response", "draft", "review", "consensus", "ground-truth", "active-learning"]));
    expect(readySignals(report.qualitySignals)).toEqual(expect.arrayContaining(["inter-annotator-agreement", "consensus", "disagreement", "review-queue", "confidence-score", "evaluation", "validation", "metrics"]));
    expect(readySignals(report.prelabelSignals)).toEqual(expect.arrayContaining(["prediction", "suggestion", "model-assisted", "similarity", "embedding", "weak-supervision", "active-learning"]));
    expect(readySignals(report.exportSignals)).toEqual(expect.arrayContaining(["export", "json", "csv", "coco", "yolo", "fiftyone-dataset", "storage", "downstream"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "import-smoke-command", "export-smoke-command", "schema-check-command", "quality-check-command", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["label-studio", "fiftyone", "argilla", "cvat", "labelbox", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"label_config|LabelInterface|annotate\\(|load_annotations|FeedbackDataset|rg\\.Dataset|LabelQuestion|TextQuestion\" .",
      "rg \"prediction|suggestion|show_collab_predictions|compute_similarity|embedding|weak supervision|active learning\" .",
      "rg \"export|load_annotations|dataset\\.export|COCO|YOLO|FiftyOneDataset|upload-artifact|annotation smoke\" .github workflows ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "data-annotation-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "data-annotation-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "data-annotation-readiness.html"))).resolves.toBeUndefined();
    const dataAnnotationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-annotation-readiness.md"), "utf8");
    expect(dataAnnotationMarkdown).toContain("Platform Signals");
    expect(dataAnnotationMarkdown).toContain("Quality Signals");
    expect(dataAnnotationMarkdown).toContain("Prelabel Signals");
    const dataAnnotationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "data-annotation-readiness.html"), "utf8");
    expect(dataAnnotationHtml).toContain("data-annotation-readiness-card");
    expect(dataAnnotationHtml).toContain("data-source-pattern=\"DataAnnotation\"");
  });

  it("detects lakehouse table readiness without running Spark, Flink, or table engines", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-lakehouse-table-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-lakehouse-table-source-"));
    await fs.mkdir(path.join(sourceRoot, "delta"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "iceberg"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "hudi"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"lakehouse-table-fixture\"",
      "description = \"Delta Lake Apache Iceberg Apache Hudi lakehouse table readiness fixture\"",
      "dependencies = [\"delta-spark\", \"deltalake\", \"pyiceberg\", \"apache-hudi\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "build.gradle"), [
      "dependencies {",
      "  implementation(\"io.delta:delta-core_2.12:2.4.0\")",
      "  implementation(\"org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.6.0\")",
      "  implementation(\"org.apache.iceberg:iceberg-flink-runtime:1.6.0\")",
      "  implementation(\"org.apache.hudi:hudi-spark3.5-bundle_2.12:0.15.0\")",
      "  implementation(\"org.apache.hudi:hudi-flink1.17-bundle:0.15.0\")",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "delta", "table.py"), [
      "from delta.tables import DeltaTable",
      "delta_table = DeltaTable.forPath(spark, \"s3://warehouse/sales\")",
      "spark.read.format(\"delta\").load(\"s3://warehouse/sales\")",
      "spark.sql(\"CREATE TABLE sales_delta USING delta LOCATION 's3://warehouse/sales'\")",
      "spark.sql(\"MERGE INTO delta.`s3://warehouse/sales` t USING updates s ON t.id = s.id WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *\")",
      "spark.sql(\"DELETE FROM delta.`s3://warehouse/sales` WHERE deleted = true\")",
      "spark.sql(\"RESTORE TABLE sales_delta TO VERSION AS OF 7\")",
      "spark.sql(\"SELECT * FROM sales_delta VERSION AS OF 7\")",
      "spark.sql(\"SELECT * FROM sales_delta TIMESTAMP AS OF '2026-01-01'\")",
      "spark.sql(\"VACUUM sales_delta RETAIN 168 HOURS\")",
      "spark.sql(\"OPTIMIZE sales_delta ZORDER BY (customer_id)\")",
      "spark.sql(\"GENERATE symlink_format_manifest FOR TABLE sales_delta\")",
      "history = spark.sql(\"DESCRIBE HISTORY sales_delta\")",
      "delta_table.upgradeTableProtocol(3, 7)",
      "schema_contract = \"schema evolution mergeSchema overwriteSchema generated column GENERATED ALWAYS constraints CHECK NOT NULL sort order partition evolution\"",
      "stream = spark.readStream.format(\"delta\").option(\"readChangeFeed\", \"true\").load(\"s3://warehouse/sales\")",
      "stream.writeStream.format(\"delta\").option(\"checkpointLocation\", \"s3://warehouse/checkpoints/sales\").start(\"s3://warehouse/sales\")",
      "_delta_log = \"_delta_log checkpoint protocol version Change Data Feed delta streaming append overwrite path table external table transaction log snapshot isolation\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "iceberg", "catalog.scala"), [
      "import org.apache.iceberg.{CatalogProperties, PartitionSpec, Schema, Snapshot, SnapshotRef, TableMetadata}",
      "import org.apache.iceberg.catalog.{Catalog, TableIdentifier}",
      "import org.apache.iceberg.hadoop.HadoopCatalog",
      "import org.apache.iceberg.hive.HiveCatalog",
      "import org.apache.iceberg.ManifestFile",
      "import org.apache.iceberg.DataFile",
      "import org.apache.iceberg.DeleteFile",
      "val catalog: Catalog = new HadoopCatalog()",
      "val hiveCatalog = new HiveCatalog()",
      "val glueCatalog = \"GlueCatalog NessieCatalog BigQueryMetastoreCatalog catalog table metastore branch tag SnapshotRef\"",
      "val spec = PartitionSpec.builderFor(new Schema()).identity(\"customer_id\").build()",
      "val table = catalog.loadTable(TableIdentifier.of(\"prod\", \"sales\"))",
      "val metadata: TableMetadata = TableMetadata.buildFrom(table.operations().current()).build()",
      "val snapshot: Snapshot = table.currentSnapshot()",
      "val manifest: ManifestFile = snapshot.allManifests(table.io()).get(0)",
      "val files = \"DataFile DeleteFile metadata.json manifest list manifest-file snapshot-id snapshot summary partition spec partition evolution sort order\"",
      "spark.sql(\"MERGE INTO prod.sales t USING updates s ON t.id = s.id WHEN MATCHED THEN UPDATE SET * WHEN NOT MATCHED THEN INSERT *\")",
      "spark.sql(\"SELECT * FROM prod.sales VERSION AS OF 12345\")",
      "spark.sql(\"SELECT * FROM prod.sales TIMESTAMP AS OF '2026-01-01'\")",
      "table.expireSnapshots().expireOlderThan(123L).commit()",
      "table.rewriteDataFiles().execute()",
      "table.newRewrite().rewriteManifests()",
      "val maintenance = \"expireSnapshots rewriteDataFiles remove_orphan_files removeOrphanFiles rewriteManifests manifest rewrite rollback RollbackToTimestamp SetCurrentSnapshot\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "hudi", "table.java"), [
      "import org.apache.hudi.table.HoodieTable;",
      "import org.apache.hudi.config.HoodieWriteConfig;",
      "import org.apache.hudi.common.table.HoodieTableMetaClient;",
      "import org.apache.hudi.common.table.timeline.HoodieTimeline;",
      "import org.apache.hudi.common.model.HoodieCommitMetadata;",
      "class HudiLakehouseFixture {",
      "  HoodieTable table;",
      "  HoodieWriteConfig writeConfig;",
      "  HoodieTableMetaClient metaClient;",
      "  HoodieTimeline timeline;",
      "  HoodieCommitMetadata commitMetadata;",
      "  String writer = \"hoodie.table.name=sales hoodie.datasource.write.recordkey.field=id hoodie.datasource.write.precombine.field=ts hoodie.datasource.write.partitionpath.field=dt\";",
      "  String tableType = \"COPY_ON_WRITE MERGE_ON_READ copy-on-write merge-on-read upsert insert_overwrite delete operation append overwrite\";",
      "  String metadata = \".hoodie HoodieTimeline HoodieActiveTimeline COMMIT_ACTION commit instant instant time metadata table HoodieTableMetadata HoodieBackedTableMetadata metadata index\";",
      "  String streaming = \"HoodieDeltaStreamer DeltaStreamer incremental query incremental read beginInstantTime checkpointLocation kafka-connect flink sink\";",
      "  String maintenance = \"Compaction compaction Clustering clustering Cleaner cleaner rollback savepoint time travel metadata table\";",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "lakehouse.yml"), [
      "name: lakehouse",
      "on: [push]",
      "jobs:",
      "  lakehouse:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: python delta/table.py --table-smoke --merge-smoke --streaming-smoke",
      "      - run: spark-submit iceberg/catalog.scala --table-smoke --maintenance-smoke --merge-smoke",
      "      - run: java HudiLakehouseFixture --streaming-smoke --maintenance-smoke",
      "      - run: pytest tests/lakehouse --table-smoke --merge-smoke --maintenance-smoke --streaming-smoke",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: lakehouse-report",
      "          path: |",
      "            lakehouse-report.json",
      "            _delta_log",
      "            metadata.json",
      "            .hoodie",
      "            manifest-list",
      "            table-report"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "lakehouse-table-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      lakehouseSetups: Array<{ format: string; tableCount: number; metadataCount: number; transactionCount: number; schemaCount: number; partitionCount: number; mergeCount: number; timeTravelCount: number; maintenanceCount: number; streamingCount: number; ciCount: number }>;
      formatSignals: Array<{ signal: string; readiness: string }>;
      tableSignals: Array<{ signal: string; readiness: string }>;
      metadataSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      writeSignals: Array<{ signal: string; readiness: string }>;
      timeTravelSignals: Array<{ signal: string; readiness: string }>;
      maintenanceSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (format: string) => report.lakehouseSetups
      .filter((item) => item.format === format)
      .reduce((totals, item) => ({
        tableCount: totals.tableCount + item.tableCount,
        metadataCount: totals.metadataCount + item.metadataCount,
        transactionCount: totals.transactionCount + item.transactionCount,
        schemaCount: totals.schemaCount + item.schemaCount,
        partitionCount: totals.partitionCount + item.partitionCount,
        mergeCount: totals.mergeCount + item.mergeCount,
        timeTravelCount: totals.timeTravelCount + item.timeTravelCount,
        maintenanceCount: totals.maintenanceCount + item.maintenanceCount,
        streamingCount: totals.streamingCount + item.streamingCount,
        ciCount: totals.ciCount + item.ciCount
      }), { tableCount: 0, metadataCount: 0, transactionCount: 0, schemaCount: 0, partitionCount: 0, mergeCount: 0, timeTravelCount: 0, maintenanceCount: 0, streamingCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Lakehouse table readiness Delta Lake Apache Iceberg Apache Hudi DeltaTable MERGE INTO VACUUM OPTIMIZE Change Data Feed _delta_log checkpoint Snapshot ManifestFile PartitionSpec DataFile DeleteFile Catalog metadata.json HoodieTable HoodieTimeline HoodieDeltaStreamer compaction clustering cleaner incremental query time travel CI");
    expect(setupTotals("delta").tableCount).toBeGreaterThan(0);
    expect(setupTotals("delta").streamingCount).toBeGreaterThan(0);
    expect(setupTotals("iceberg").metadataCount).toBeGreaterThan(0);
    expect(setupTotals("iceberg").maintenanceCount).toBeGreaterThan(0);
    expect(setupTotals("hudi").transactionCount).toBeGreaterThan(0);
    expect(setupTotals("hudi").timeTravelCount).toBeGreaterThan(0);
    expect(report.lakehouseSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.formatSignals)).toEqual(expect.arrayContaining(["delta-lake", "apache-iceberg", "apache-hudi", "custom"]));
    expect(readySignals(report.tableSignals)).toEqual(expect.arrayContaining(["delta-table", "iceberg-table", "hudi-table", "catalog-table", "path-table", "managed-table", "external-table"]));
    expect(readySignals(report.metadataSignals)).toEqual(expect.arrayContaining(["delta-log", "checkpoint", "protocol-version", "iceberg-metadata-json", "manifest-list", "manifest-file", "snapshot", "hudi-timeline", "commit-instant", "metadata-table"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["schema-evolution", "partition-spec", "partition-evolution", "generated-column", "constraints", "sort-order", "record-key", "precombine-key"]));
    expect(readySignals(report.writeSignals)).toEqual(expect.arrayContaining(["append", "merge-into", "upsert", "delete", "overwrite", "copy-on-write", "merge-on-read", "streaming-write"]));
    expect(readySignals(report.timeTravelSignals)).toEqual(expect.arrayContaining(["version-as-of", "timestamp-as-of", "snapshot-id", "branch-or-tag", "restore", "rollback", "savepoint"]));
    expect(readySignals(report.maintenanceSignals)).toEqual(expect.arrayContaining(["vacuum", "optimize", "compaction", "clustering", "cleaner", "expire-snapshots", "rewrite-data-files", "remove-orphan-files", "manifest-rewrite"]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining(["checkpoint-location", "change-data-feed", "incremental-query", "delta-streaming", "flink-sink", "kafka-connect", "deltastreamer"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "table-smoke-command", "merge-smoke-command", "maintenance-smoke-command", "streaming-smoke-command", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["delta-spark", "delta-rs", "iceberg", "iceberg-spark", "iceberg-flink", "hudi", "hudi-spark", "hudi-flink", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"DeltaTable|delta\\.\\`|_delta_log|MERGE INTO|VACUUM|OPTIMIZE|Change Data Feed\" .",
      "rg \"HoodieTable|HoodieWriteConfig|HoodieTimeline|HoodieDeltaStreamer|Compaction|Clustering|incremental query\" .",
      "rg \"expireSnapshots|rewriteDataFiles|remove_orphan_files|cleaner|rollback|savepoint|upload-artifact|table smoke\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "lakehouse-table-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "lakehouse-table-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "lakehouse-table-readiness.html"))).resolves.toBeUndefined();
    const lakehouseMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "lakehouse-table-readiness.md"), "utf8");
    expect(lakehouseMarkdown).toContain("Metadata Signals");
    expect(lakehouseMarkdown).toContain("Maintenance Signals");
    expect(lakehouseMarkdown).toContain("Streaming Signals");
    const lakehouseHtml = await fs.readFile(path.join(result.session.outputPaths.html, "lakehouse-table-readiness.html"), "utf8");
    expect(lakehouseHtml).toContain("lakehouse-table-readiness-card");
    expect(lakehouseHtml).toContain("data-source-pattern=\"LakehouseTable\"");
  });

  it("detects event stream readiness without running brokers or clients", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-event-stream-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-event-stream-source-"));
    await fs.mkdir(path.join(sourceRoot, "kafka"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "redpanda"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "pulsar"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        kafkajs: "^2.2.4",
        "@confluentinc/kafka-javascript": "^1.0.0",
        "pulsar-client": "^1.12.0",
        "@redpanda-data/console": "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "build.gradle"), [
      "dependencies {",
      "  implementation(\"org.apache.kafka:kafka-clients:4.0.0\")",
      "  implementation(\"org.apache.kafka:kafka-streams:4.0.0\")",
      "  implementation(\"org.apache.kafka:connect-api:4.0.0\")",
      "  implementation(\"org.apache.pulsar:pulsar-client:4.0.0\")",
      "  implementation(\"org.apache.pulsar:pulsar-broker:4.0.0\")",
      "  implementation(\"org.apache.pulsar:pulsar-functions:4.0.0\")",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "kafka", "orders-stream.java"), [
      "import org.apache.kafka.clients.admin.AdminClient;",
      "import org.apache.kafka.clients.admin.NewTopic;",
      "import org.apache.kafka.clients.consumer.ConsumerRebalanceListener;",
      "import org.apache.kafka.clients.consumer.KafkaConsumer;",
      "import org.apache.kafka.clients.producer.KafkaProducer;",
      "class OrdersStream {",
      "  String platform = \"Apache Kafka custom event stream\";",
      "  String broker = \"bootstrap.servers=broker:9092 advertised.listeners=SASL_SSL://broker:9093 KRaft\";",
      "  AdminClient adminClient;",
      "  NewTopic topic = new NewTopic(\"orders.events\", 12, (short) 3);",
      "  String topicPolicy = \"retention.ms=86400000 cleanup.policy=compact replication.factor=3 partitions=12\";",
      "  KafkaProducer<String, String> producer;",
      "  KafkaConsumer<String, String> consumer;",
      "  ConsumerRebalanceListener rebalanceListener;",
      "  String producerConfig = \"acks=all enable.idempotence=true transactional.id=orders-tx batch.size=32768 compression.type=zstd\";",
      "  String consumerConfig = \"consumer group group.id=orders commitSync commitAsync offset commit\";",
      "  String groupProtocol = \"group.protocol=consumer group.protocol=streams classic group protocol group coordinator __consumer_offsets auto.offset.reset=earliest enable.auto.commit=false isolation.level=read_committed partition assignment RangeAssignor CooperativeStickyAssignor rebalance metrics tasks-revoked-latency-avg tasks-assigned-latency-max\";",
      "  String schema = \"schema.registry.url Schema Registry Avro Protobuf JSONSchema compatibility BACKWARD schema evolution\";",
      "  String reliability = \"errors.deadletterqueue.topic.name=orders.dlq DLQ retry topic poison record exactly-once MirrorMaker geo-replication backpressure\";",
      "  String security = \"SASL_SSL SCRAM OAuth OAUTHBEARER TLS ACL authentication authorization certificate truststore keystore\";",
      "  String ops = \"metrics consumer lag quota rack.aware AdminClient topic create reassignment health-check\";",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "redpanda", "streaming-platform.yaml"), [
      "redpanda:",
      "  rpk topic create orders.events --partitions 12 --replicas 3",
      "  pandaproxy: true",
      "  schema_registry: true",
      "  retention.ms: 86400000",
      "  cleanup.policy: compact",
      "  consumer group recovery: offset commit",
      "  security: SASL TLS ACL authentication authorization",
      "  ops: metrics lag quota rack-awareness health-check"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pulsar", "orders-pulsar.java"), [
      "import org.apache.bookkeeper.client.BookKeeper;",
      "import org.apache.pulsar.client.api.DeadLetterPolicy;",
      "import org.apache.pulsar.client.api.PulsarClient;",
      "import org.apache.pulsar.client.api.Schema;",
      "import org.apache.pulsar.client.api.SubscriptionType;",
      "import org.apache.pulsar.client.api.schema.SchemaDefinition;",
      "class OrdersPulsar {",
      "  PulsarClient client = PulsarClient.builder().serviceUrl(\"pulsar+ssl://broker:6651\").build();",
      "  BookKeeper bookKeeper;",
      "  String topic = \"persistent://tenant/namespace/orders partitioned topic tenant namespace\";",
      "  Object producer = client.newProducer(Schema.AVRO(String.class)).topic(topic);",
      "  Object consumer = client.newConsumer(Schema.JSON(String.class)).topic(topic).subscriptionName(\"orders-sub\").subscriptionType(SubscriptionType.Shared);",
      "  DeadLetterPolicy dlq;",
      "  SchemaDefinition<String> schemaDefinition;",
      "  String handling = \"acknowledge acknowledgeAsync negativeAcknowledge retry topic compaction retention transaction authentication authorization TLS\";",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "stream-readiness.yml"), [
      "name: event stream smoke",
      "on: [push]",
      "jobs:",
      "  stream:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm stream --broker-smoke --producer-smoke --consumer-smoke --schema-smoke",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            event-stream-report.json",
      "            consumer-lag.json",
      "            schema-registry-check.json",
      "            dlq-report.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "event-stream-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      eventStreamSetups: Array<{ platform: string; brokerCount: number; topicCount: number; producerCount: number; consumerCount: number; groupCount: number; offsetCount: number; schemaCount: number; reliabilityCount: number; securityCount: number; opsCount: number; ciCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      brokerSignals: Array<{ signal: string; readiness: string }>;
      topicSignals: Array<{ signal: string; readiness: string }>;
      producerSignals: Array<{ signal: string; readiness: string }>;
      consumerSignals: Array<{ signal: string; readiness: string }>;
      groupProtocolSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      reliabilitySignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (platform: string) => report.eventStreamSetups
      .filter((item) => item.platform === platform)
      .reduce((totals, item) => ({
        brokerCount: totals.brokerCount + item.brokerCount,
        topicCount: totals.topicCount + item.topicCount,
        producerCount: totals.producerCount + item.producerCount,
        consumerCount: totals.consumerCount + item.consumerCount,
        groupCount: totals.groupCount + item.groupCount,
        offsetCount: totals.offsetCount + item.offsetCount,
        schemaCount: totals.schemaCount + item.schemaCount,
        reliabilityCount: totals.reliabilityCount + item.reliabilityCount,
        securityCount: totals.securityCount + item.securityCount,
        opsCount: totals.opsCount + item.opsCount,
        ciCount: totals.ciCount + item.ciCount
      }), { brokerCount: 0, topicCount: 0, producerCount: 0, consumerCount: 0, groupCount: 0, offsetCount: 0, schemaCount: 0, reliabilityCount: 0, securityCount: 0, opsCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Event stream readiness Apache Kafka Redpanda Apache Pulsar KafkaProducer KafkaConsumer AdminClient NewTopic consumer group group.protocol consumer streams classic group coordinator __consumer_offsets auto.offset.reset enable.auto.commit isolation.level partition assignment rebalance metrics offset commit rebalance schema registry DLQ retention compaction idempotence transactions ACL SASL PulsarClient SubscriptionType BookKeeper tenant namespace CI");
    expect(setupTotals("kafka").brokerCount).toBeGreaterThan(0);
    expect(setupTotals("kafka").topicCount).toBeGreaterThan(0);
    expect(setupTotals("kafka").producerCount).toBeGreaterThan(0);
    expect(setupTotals("kafka").consumerCount).toBeGreaterThan(0);
    expect(setupTotals("redpanda").opsCount).toBeGreaterThan(0);
    expect(setupTotals("pulsar").schemaCount).toBeGreaterThan(0);
    expect(report.eventStreamSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["apache-kafka", "redpanda", "apache-pulsar", "custom"]));
    expect(readySignals(report.brokerSignals)).toEqual(expect.arrayContaining(["broker", "bootstrap-server", "listener", "advertised-listener", "kraft", "bookkeeper", "broker-service", "proxy"]));
    expect(readySignals(report.topicSignals)).toEqual(expect.arrayContaining(["topic", "partition", "replication-factor", "retention", "compaction", "cleanup-policy", "partitioned-topic", "tenant-namespace"]));
    expect(readySignals(report.producerSignals)).toEqual(expect.arrayContaining(["kafka-producer", "pulsar-producer", "producer-config", "acks", "idempotence", "transactional-id", "batching", "compression"]));
    expect(readySignals(report.consumerSignals)).toEqual(expect.arrayContaining(["kafka-consumer", "pulsar-consumer", "consumer-group", "subscription", "offset-commit", "rebalance", "acknowledge", "negative-ack"]));
    expect(readySignals(report.groupProtocolSignals)).toEqual(expect.arrayContaining(["group-protocol-consumer", "group-protocol-streams", "classic-protocol", "group-coordinator", "consumer-offsets-topic", "auto-offset-reset", "auto-commit", "isolation-level", "partition-assignment", "rebalance-metrics"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["schema-registry", "avro", "protobuf", "json-schema", "schema-evolution", "compatibility", "schema-definition"]));
    expect(readySignals(report.reliabilitySignals)).toEqual(expect.arrayContaining(["dead-letter-queue", "retry-topic", "poison-record", "transaction", "exactly-once", "mirror-replication", "geo-replication", "backpressure"]));
    expect(readySignals(report.securitySignals)).toEqual(expect.arrayContaining(["sasl", "tls", "acl", "authentication", "authorization", "oauth", "scram", "certificates"]));
    expect(readySignals(report.opsSignals)).toEqual(expect.arrayContaining(["metrics", "lag-monitoring", "quota", "rack-awareness", "admin-client", "topic-create", "reassignment", "health-check"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "broker-smoke-command", "producer-smoke-command", "consumer-smoke-command", "schema-smoke-command", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["kafka-client", "kafka-streams", "kafka-connect", "redpanda", "pulsar-client", "pulsar-broker", "pulsar-functions", "custom"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"KafkaProducer|KafkaConsumer|AdminClient|NewTopic|bootstrap.servers|consumer group|commitSync|commitAsync\" .",
      "rg \"group\\.protocol|classic|consumer group protocol|streams group|group coordinator|__consumer_offsets|auto\\.offset\\.reset|enable\\.auto\\.commit|isolation\\.level|partition assignment|rebalance.*metrics\" .",
      "rg \"PulsarClient|newProducer|newConsumer|SubscriptionType|acknowledge|negativeAcknowledge|tenant|namespace\" .",
      "rg \"SASL|SCRAM|OAuth|TLS|ACL|authorization|authentication|quota|lag|rack.aware|upload-artifact|stream smoke\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "event-stream-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "event-stream-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "event-stream-readiness.html"))).resolves.toBeUndefined();
    const eventStreamMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "event-stream-readiness.md"), "utf8");
    expect(eventStreamMarkdown).toContain("Group Protocol Signals");
    expect(eventStreamMarkdown).toContain("Schema Signals");
    expect(eventStreamMarkdown).toContain("Reliability Signals");
    expect(eventStreamMarkdown).toContain("Ops Signals");
    const eventStreamHtml = await fs.readFile(path.join(result.session.outputPaths.html, "event-stream-readiness.html"), "utf8");
    expect(eventStreamHtml).toContain("event-stream-readiness-card");
    expect(eventStreamHtml).toContain("data-source-pattern=\"EventStream\"");
  });

  it("detects data connector readiness without creating connectors or running syncs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-connector-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-connector-source-"));
    await fs.mkdir(path.join(sourceRoot, "connect"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "debezium"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "airbyte"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "main", "java"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "connect:distributed": "connect-distributed.sh connect/connect-distributed.properties",
        "connect:register": "curl -X POST http://localhost:8083/connectors",
        "airbyte:check": "airbyte-api sources list",
        "airbyte:sync": "airbyte-api connections sync",
        "connector:report": "node scripts/connector-report.js"
      },
      dependencies: {
        "airbyte-api": "1.0.0",
        "airbyte-cdk": "1.0.0"
      },
      devDependencies: {
        "custom-connector-sdk": "0.1.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "build.gradle"), [
      "dependencies {",
      "  implementation(\"org.apache.kafka:connect-api:3.9.0\")",
      "  implementation(\"org.apache.kafka:connect-json:3.9.0\")",
      "  implementation(\"io.debezium:debezium-connector-postgres:3.0.0\")",
      "  implementation(\"io.debezium:debezium-connector-mysql:3.0.0\")",
      "  implementation(\"io.debezium:debezium-embedded:3.0.0\")",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "connect", "connect-distributed.properties"), [
      "bootstrap.servers=localhost:9092",
      "group.id=connect-cluster",
      "plugin.path=/usr/share/java,/opt/connectors",
      "key.converter=org.apache.kafka.connect.json.JsonConverter",
      "value.converter=org.apache.kafka.connect.json.JsonConverter",
      "offset.storage.topic=connect-offsets",
      "config.storage.topic=connect-configs",
      "status.storage.topic=connect-status"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "connect", "connect-standalone.properties"), [
      "bootstrap.servers=localhost:9092",
      "plugin.path=/usr/share/java,/opt/connectors",
      "key.converter=org.apache.kafka.connect.json.JsonConverter",
      "value.converter=org.apache.kafka.connect.json.JsonConverter",
      "offset.storage.file.filename=/tmp/connect.offsets"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "connect", "orders-source.properties"), [
      "name=orders-source",
      "connector.class=FileStreamSource",
      "tasks.max=2",
      "# connect-distributed worker configuration bootstrap.servers group.id plugin.path",
      "topics=orders.raw",
      "topics.regex=orders.*",
      "transforms=MakeMap,InsertSource,Route,Mask,Extract,Flattened",
      "transforms.MakeMap.type=org.apache.kafka.connect.transforms.HoistField$Value",
      "transforms.InsertSource.type=org.apache.kafka.connect.transforms.InsertField$Value",
      "transforms.Route.type=org.apache.kafka.connect.transforms.RegexRouter",
      "transforms.Mask.type=org.apache.kafka.connect.transforms.MaskField$Value",
      "transforms.Extract.type=org.apache.kafka.connect.transforms.ExtractField$Key",
      "transforms.Flattened.type=org.apache.kafka.connect.transforms.Flatten$Value",
      "predicates=IsOrders",
      "predicates.IsOrders.type=org.apache.kafka.connect.transforms.predicates.TopicNameMatches",
      "errors.deadletterqueue.topic.name=orders.dlq",
      "errors.tolerance=all"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "debezium", "postgres-source.json"), JSON.stringify({
      name: "orders-postgres-cdc",
      config: {
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "tasks.max": "1",
        "topic.prefix": "orders",
        "snapshot.mode": "initial",
        "schema.history.internal.kafka.topic": "schema-history.orders",
        "slot.name": "orders_slot",
        "publication.name": "orders_publication",
        "database.include.list": "orders",
        "table.include.list": "orders.public.order_events"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "airbyte", "connection.json"), JSON.stringify({
      sourceId: "src-orders",
      destinationId: "dst-warehouse",
      connectionId: "conn-orders",
      sourceDefinition: "postgres-source",
      destinationDefinition: "snowflake-destination",
      configuredCatalog: { streams: [{ name: "orders", syncMode: "incremental", cursor: ["updated_at"] }] },
      protocol: [
        "Airbyte Spec Airbyte Check Airbyte Discover Airbyte Read AirbyteCatalog ConfiguredAirbyteCatalog",
        "AirbyteStream ConfiguredAirbyteStream SyncMode DestinationSyncMode",
        "supported_sync_modes full_refresh incremental append_dedup overwrite",
        "primary_key cursor_field namespace json_schema",
        "AirbyteMessage AirbyteRecordMessage AirbyteStateMessage AirbyteTraceMessage AirbyteStreamStatus STREAM_STATUS"
      ].join(" "),
      syncMode: "incremental",
      cursor: "updated_at",
      state: { type: "AirbyteStateMessage", checkpoint: "2026-06-05T00:00:00Z" },
      checkpoint: true,
      checkpoint_target_interval_seconds: 300,
      normalization: "basic",
      dbt: "orders_dbt_project"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "ConnectorSmoke.java"), [
      "import io.debezium.engine.DebeziumEngine;",
      "import io.debezium.engine.format.Json;",
      "import org.apache.kafka.connect.source.SourceConnector;",
      "import org.apache.kafka.connect.sink.SinkConnector;",
      "class ConnectorSmoke {",
      "  SourceConnector sourceConnector;",
      "  SinkConnector sinkConnector;",
      "  DebeziumEngine<Json> embeddedEngine;",
      "  String custom = \"custom connector data connector CDC change data capture DebeziumEngine EmbeddedEngine connector sdk\";",
      "  String rest = \"Kafka Connect REST API GET /connectors POST /connectors PUT /connectors/{name}/pause PUT /connectors/{name}/resume POST /connectors/{name}/restart GET /connectors/{name}/status GET /connectors/{name}/tasks/{taskid}/status DELETE /connectors/{name}/offsets PATCH /connectors/{name}/offsets\";",
      "  String operations = \"connector status task status pause resume restart offset reset retry backoff health metrics JMX Prometheus monitoring\";",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docker-compose.yml"), [
      "services:",
      "  connect:",
      "    image: apache/kafka:latest",
      "    command: connect-distributed.sh /etc/kafka/connect-distributed.properties",
      "  airbyte:",
      "    image: airbyte/server:latest"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "data-connector.yml"), [
      "name: data connector readiness",
      "on: [push]",
      "jobs:",
      "  connector:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: connect-distributed.sh config/connect-distributed.properties",
      "      - run: connect-standalone.sh config/connect-standalone.properties connect/orders-source.properties",
      "      - run: curl -X POST http://localhost:8083/connectors",
      "      - run: curl -X GET http://localhost:8083/connectors/orders/status",
      "      - run: curl -X POST http://localhost:8083/connectors/orders/restart",
      "      - run: curl -X PATCH http://localhost:8083/connectors/orders/offsets",
      "      - run: curl -X POST https://api.airbyte.com/api/public/v1/sources",
      "      - run: Airflow Dagster Kestra orchestrate Airbyte syncs with docker compose",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            connector-readiness-report.json",
      "            connect-status.json",
      "            airbyte-sync-report.json",
      "            debezium-report.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "data-connector-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      connectorSetups: Array<{ platform: string; sourceCount: number; sinkCount: number; workerCount: number; configCount: number; offsetCount: number; stateCount: number; transformCount: number; errorCount: number; apiCount: number; workflowCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      connectorKindSignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      protocolSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      transformSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (platform: string) => report.connectorSetups
      .filter((item) => item.platform === platform)
      .reduce((totals, item) => ({
        sourceCount: totals.sourceCount + item.sourceCount,
        sinkCount: totals.sinkCount + item.sinkCount,
        workerCount: totals.workerCount + item.workerCount,
        configCount: totals.configCount + item.configCount,
        offsetCount: totals.offsetCount + item.offsetCount,
        stateCount: totals.stateCount + item.stateCount,
        transformCount: totals.transformCount + item.transformCount,
        errorCount: totals.errorCount + item.errorCount,
        apiCount: totals.apiCount + item.apiCount,
        workflowCount: totals.workflowCount + item.workflowCount
      }), { sourceCount: 0, sinkCount: 0, workerCount: 0, configCount: 0, offsetCount: 0, stateCount: 0, transformCount: 0, errorCount: 0, apiCount: 0, workflowCount: 0 });

    expect(report.sourcePattern).toBe("Data connector readiness Debezium Kafka Connect Airbyte Spec Check Discover Read AirbyteCatalog ConfiguredAirbyteCatalog AirbyteStream ConfiguredAirbyteStream SyncMode DestinationSyncMode primary_key cursor_field AirbyteRecordMessage AirbyteStateMessage AirbyteTraceMessage stream status SourceConnector SinkConnector connector.class tasks.max plugin.path transforms predicates offset.storage.topic status.storage.topic CDC snapshot schema history sync catalog state");
    expect(setupTotals("kafka-connect").sourceCount).toBeGreaterThan(0);
    expect(setupTotals("kafka-connect").workerCount).toBeGreaterThan(0);
    expect(setupTotals("debezium").configCount).toBeGreaterThan(0);
    expect(setupTotals("airbyte").stateCount).toBeGreaterThan(0);
    expect(report.connectorSetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["kafka-connect", "debezium", "airbyte", "custom"]));
    expect(readySignals(report.connectorKindSignals)).toEqual(expect.arrayContaining(["source-connector", "sink-connector", "cdc-connector", "elt-connection", "embedded-engine"]));
    expect(readySignals(report.configSignals)).toEqual(expect.arrayContaining(["connector-class", "tasks-max", "plugin-path", "converters", "topics", "topics-regex", "snapshot-mode", "schema-history", "database-include-list", "table-include-list", "slot-name", "publication-name", "source-definition", "destination-definition", "connection-id"]));
    expect(readySignals(report.protocolSignals)).toEqual(expect.arrayContaining(["spec", "check", "discover", "read", "airbyte-catalog", "configured-catalog", "airbyte-stream", "configured-stream", "sync-mode", "destination-sync-mode", "primary-key", "cursor-field", "record-message", "state-message", "trace-message", "stream-status"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["offset-storage-file", "offset-storage-topic", "config-storage-topic", "status-storage-topic", "airbyte-state", "cursor", "incremental-sync", "checkpoint"]));
    expect(readySignals(report.transformSignals)).toEqual(expect.arrayContaining(["smt-transform", "predicate", "regex-router", "mask-field", "extract-field", "hoist-field", "flatten", "normalization", "dbt"]));
    expect(readySignals(report.opsSignals)).toEqual(expect.arrayContaining(["rest-api", "connector-status", "task-status", "pause-resume", "restart", "offset-reset", "dead-letter-queue", "errors-tolerance", "retry", "health-metrics"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["connect-standalone", "connect-distributed", "curl-connectors", "airbyte-api", "orchestrator", "docker-compose", "github-actions", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["kafka-connect-api", "connect-json", "debezium-connector", "debezium-embedded", "airbyte-cdk", "airbyte-api", "custom"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"connector.class|tasks.max|plugin.path|connect-distributed|connect-standalone|/connectors\" .",
      "rg \"Spec|Check|Discover|Read|AirbyteCatalog|ConfiguredAirbyteCatalog|AirbyteRecordMessage|AirbyteStateMessage|AirbyteTraceMessage|supported_sync_modes|primary_key|cursor_field\" .",
      "rg \"Airbyte|sourceId|destinationId|connectionId|configuredCatalog|syncMode|cursor|state|checkpoint\" .",
      "rg \"errors.deadletterqueue|errors.tolerance|offset.storage|status.storage|config.storage|restart|pause|resume|tasks/.*/status|upload-artifact\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "data-connector-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "data-connector-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "data-connector-readiness.html"))).resolves.toBeUndefined();
    const dataConnectorMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-connector-readiness.md"), "utf8");
    expect(dataConnectorMarkdown).toContain("Config Signals");
    expect(dataConnectorMarkdown).toContain("Protocol Signals");
    expect(dataConnectorMarkdown).toContain("State Signals");
    expect(dataConnectorMarkdown).toContain("Transform Signals");
    const dataConnectorHtml = await fs.readFile(path.join(result.session.outputPaths.html, "data-connector-readiness.html"), "utf8");
    expect(dataConnectorHtml).toContain("data-connector-readiness-card");
    expect(dataConnectorHtml).toContain("data-source-pattern=\"DataConnector\"");
  });

  it("detects semantic layer readiness without compiling SQL or querying warehouses", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-semantic-layer-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-semantic-layer-source-"));
    await fs.mkdir(path.join(sourceRoot, "semantic"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "cube"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "mf:validate": "mf validate-configs",
        "mf:list": "mf list metrics && mf list dimensions --metrics transactions",
        "mf:query": "mf query --metrics transactions --group-by metric_time --order metric_time --explain --display-plans",
        "cube:dev": "cubejs dev",
        "semantic:report": "node scripts/semantic-layer-report.js"
      },
      dependencies: {
        "@cubejs-backend/server": "0.36.0",
        "@cubejs-client/core": "0.36.0",
        "cube": "0.36.0"
      },
      devDependencies: {
        "custom-semantic-layer-sdk": "0.1.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"semantic-layer-fixture\"",
      "dependencies = [\"metricflow\", \"dbt-metricflow\", \"dbt-semantic-interfaces\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "semantic", "transactions.yml"), [
      "semantic_models:",
      "  - name: transactions",
      "    defaults:",
      "      agg_time_dimension: metric_time",
      "    model: ref('transactions')",
      "    entities:",
      "      - name: transaction",
      "        type: primary",
      "      - name: customer",
      "        type: foreign",
      "      - name: order",
      "        type: unique",
      "    measures:",
      "      - name: transaction_amount",
      "        agg: SUM",
      "      - name: distinct_customers",
      "        agg: COUNT_DISTINCT",
      "      - name: is_paid",
      "        agg: SUM_BOOLEAN",
      "        expr: paid",
      "    dimensions:",
      "      - name: metric_time",
      "        type: time",
      "        type_params:",
      "          time_granularity: day",
      "      - name: customer_country",
      "        type: categorical",
      "        expr: country",
      "      - name: customer__customer_country",
      "        entity_path: customer"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "semantic", "metrics.yml"), [
      "metrics:",
      "  - name: transactions",
      "    type: SIMPLE",
      "    type_params:",
      "      measure: transaction_amount",
      "  - name: paid_ratio",
      "    type: ratio",
      "    type_params:",
      "      numerator: paid_transactions",
      "      denominator: transactions",
      "  - name: revenue_per_customer",
      "    type: derived",
      "    type_params:",
      "      expr: revenue / customers",
      "      metrics:",
      "        - name: transactions",
      "        - name: distinct_customers",
      "  - name: rolling_transactions",
      "    type: cumulative",
      "    type_params:",
      "      measure: transaction_amount",
      "      cumulative_type_params:",
      "        window: 7 days",
      "    filter: \"{{ Dimension('customer__customer_country') }} = 'US'\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "semantic", "saved_queries.yml"), [
      "saved_queries:",
      "  - name: daily_transactions_by_country",
      "    query_params:",
      "      metrics:",
      "        - transactions",
      "        - paid_ratio",
      "      group_by:",
      "        - TimeDimension('metric_time', 'day')",
      "        - Dimension('customer__customer_country')"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "cube", "orders.yml"), [
      "cubes:",
      "  - name: orders",
      "    sql_table: public.orders",
      "    measures:",
      "      - name: count",
      "        type: count",
      "      - name: revenue",
      "        type: sum",
      "        sql: amount",
      "    dimensions:",
      "      - name: created_at",
      "        type: time",
      "        sql: created_at",
      "      - name: status",
      "        type: string",
      "    joins:",
      "      - name: customers",
      "        relationship: many_to_one",
      "        sql_on: \"{CUBE}.customer_id = {customers}.id\"",
      "    pre_aggregations:",
      "      - name: orders_rollup",
      "        type: rollup",
      "        measures:",
      "          - CUBE.count",
      "        dimensions:",
      "          - CUBE.status",
      "        time_dimension: CUBE.created_at",
      "        granularity: day",
      "        refresh_key:",
      "          every: 1 hour",
      "        partition_granularity: month",
      "        incremental_refresh: true",
      "        description: Cube Store relational caching engine",
      "views:",
      "  - name: executive_orders",
      "    cubes:",
      "      - join_path: orders",
      "        includes:",
      "          - status",
      "          - revenue"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "cube", "security.yml"), [
      "access_policy:",
      "  - role: analyst",
      "    row_level_security: organization_id = securityContext.organizationId",
      "    member_security: hide_private_metrics",
      "securityContext:",
      "  organizationId: org_123",
      "query_rewrite: tenant_filter",
      "COMPILE_CONTEXT: tenant compile context"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "apis.ts"), [
      "export const semanticApiNotes = \"custom semantic layer analytics API with SQL API REST API GraphQL API /cubejs-api/v1/load /cubejs-api/v1/sql graphql endpoint\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "semantic-layer.yml"), [
      "name: semantic layer readiness",
      "on: [push]",
      "jobs:",
      "  semantic:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: mf tutorial",
      "      - run: mf validate-configs",
      "      - run: mf list metrics",
      "      - run: mf list dimensions --metrics transactions",
      "      - run: mf query --metrics transactions --group-by metric_time --order metric_time --explain --display-plans",
      "      - run: curl http://localhost:4000/cubejs-api/v1/load",
      "      - run: curl http://localhost:4000/cubejs-api/v1/sql",
      "      - run: echo 'SQL API REST API GraphQL API generated SQL display plans'",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            semantic-layer-report.json",
      "            metricflow-sql.sql",
      "            cube-pre-aggregations.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "semantic-layer-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      semanticLayerSetups: Array<{ platform: string; semanticModelCount: number; metricCount: number; measureCount: number; dimensionCount: number; entityCount: number; joinCount: number; savedQueryCount: number; apiCount: number; cacheCount: number; accessCount: number; workflowCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      metricSignals: Array<{ signal: string; readiness: string }>;
      dimensionSignals: Array<{ signal: string; readiness: string }>;
      entitySignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      cacheSignals: Array<{ signal: string; readiness: string }>;
      accessSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (platform: string) => report.semanticLayerSetups
      .filter((item) => item.platform === platform)
      .reduce((totals, item) => ({
        semanticModelCount: totals.semanticModelCount + item.semanticModelCount,
        metricCount: totals.metricCount + item.metricCount,
        measureCount: totals.measureCount + item.measureCount,
        dimensionCount: totals.dimensionCount + item.dimensionCount,
        entityCount: totals.entityCount + item.entityCount,
        joinCount: totals.joinCount + item.joinCount,
        savedQueryCount: totals.savedQueryCount + item.savedQueryCount,
        apiCount: totals.apiCount + item.apiCount,
        cacheCount: totals.cacheCount + item.cacheCount,
        accessCount: totals.accessCount + item.accessCount,
        workflowCount: totals.workflowCount + item.workflowCount
      }), { semanticModelCount: 0, metricCount: 0, measureCount: 0, dimensionCount: 0, entityCount: 0, joinCount: 0, savedQueryCount: 0, apiCount: 0, cacheCount: 0, accessCount: 0, workflowCount: 0 });

    expect(report.sourcePattern).toBe("Semantic layer readiness MetricFlow dbt Semantic Layer Cube semantic_models metrics measures dimensions entities saved_queries TimeDimension Dimension agg_time_dimension type_params ratio derived cumulative cubes joins pre_aggregations access_policy query_rewrite SQL REST GraphQL");
    expect(setupTotals("dbt-semantic-layer").semanticModelCount).toBeGreaterThan(0);
    expect(setupTotals("dbt-semantic-layer").metricCount + setupTotals("metricflow").metricCount).toBeGreaterThan(0);
    expect(setupTotals("cube").cacheCount).toBeGreaterThan(0);
    expect(setupTotals("cube").accessCount).toBeGreaterThan(0);
    expect(report.semanticLayerSetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["metricflow", "dbt-semantic-layer", "cube", "custom"]));
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining(["semantic-model", "cube", "view", "sql-table", "ref-model", "time-spine"]));
    expect(readySignals(report.metricSignals)).toEqual(expect.arrayContaining(["simple-metric", "ratio-metric", "derived-metric", "cumulative-metric", "filtered-metric", "measure"]));
    expect(readySignals(report.dimensionSignals)).toEqual(expect.arrayContaining(["time-dimension", "categorical-dimension", "dimension-reference", "entity-path", "granularity"]));
    expect(readySignals(report.entitySignals)).toEqual(expect.arrayContaining(["primary-entity", "foreign-entity", "unique-entity", "entity-relationship", "join"]));
    expect(readySignals(report.querySignals)).toEqual(expect.arrayContaining(["saved-query", "metricflow-query", "explain-sql", "display-plan", "sql-api", "rest-api", "graphql-api"]));
    expect(readySignals(report.cacheSignals)).toEqual(expect.arrayContaining(["pre-aggregation", "rollup", "refresh-key", "partition-granularity", "incremental-refresh", "cache-engine"]));
    expect(readySignals(report.accessSignals)).toEqual(expect.arrayContaining(["access-policy", "row-level-security", "member-security", "security-context", "query-rewrite", "compile-context"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["mf-tutorial", "validate-configs", "list-metrics", "list-dimensions", "query-command", "github-actions", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["metricflow", "dbt-metricflow", "dbt-semantic-interfaces", "cubejs-server", "cube-client", "cube"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"semantic_models:|metrics:|saved_queries:|MetricFlow|dbt-metricflow|dbt_semantic_interfaces\" .",
      "rg \"cubes:|joins:|pre_aggregations:|refresh_key|rollup|query_rewrite|COMPILE_CONTEXT|access_policy\" .",
      "rg \"mf validate-configs|mf list metrics|mf list dimensions|mf query|--explain|SQL API|REST API|GraphQL API|upload-artifact\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "semantic-layer-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "semantic-layer-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "semantic-layer-readiness.html"))).resolves.toBeUndefined();
    const semanticLayerMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "semantic-layer-readiness.md"), "utf8");
    expect(semanticLayerMarkdown).toContain("Metric Signals");
    expect(semanticLayerMarkdown).toContain("Query Signals");
    expect(semanticLayerMarkdown).toContain("Access Signals");
    const semanticLayerHtml = await fs.readFile(path.join(result.session.outputPaths.html, "semantic-layer-readiness.html"), "utf8");
    expect(semanticLayerHtml).toContain("semantic-layer-readiness-card");
    expect(semanticLayerHtml).toContain("data-source-pattern=\"SemanticLayer\"");
  });

  it("detects BI dashboard readiness without connecting to BI servers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-bi-dashboard-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-bi-dashboard-source-"));
    await fs.mkdir(path.join(sourceRoot, "metabase"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "superset"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "lightdash"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "embeds"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        metabase: "0.51.0",
        "apache-superset": "4.0.0",
        lightdash: "0.157.0",
        "@lightdash/sdk": "0.157.0",
        echarts: "5.5.0",
        "chart.js": "4.4.0"
      },
      scripts: {
        "dashboards:validate": "lightdash compile && superset import-dashboards -p superset/dashboard.yaml"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "metabase", "dashboard.json"), JSON.stringify({
      dashboard_id: 42,
      name: "Revenue dashboard",
      cards: [{
        card_id: 7,
        dataset_query: { type: "native", native: { query: "select sum(revenue) from orders", template_tags: { region: { type: "dimension", "widget-type": "category", field_filter: true } } } },
        visualization_settings: { graph: { dimensions: ["created_at"], metrics: ["revenue"] } },
        parameter_mappings: [{ parameter_id: "region", card_id: 7 }],
        collection_id: 3,
        enable_embedding: true,
        embedding_params: { region: "enabled" },
        public_uuid: "public-dashboard",
        cache_ttl: 3600
      }],
      parameters: [{ id: "region", type: "category", slug: "region" }],
      pulse: { channels: ["slack", "email"], schedule_type: "daily" },
      permissions: { collection: "view", roles: ["analyst"] }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "superset", "dashboard.yaml"), [
      "dashboard_title: Executive Revenue",
      "position_json: '{}'",
      "charts:",
      "  - slice_name: Revenue by Segment",
      "    viz_type: echarts_timeseries",
      "    datasource: orders__table",
      "    query_context: { datasource: orders, queries: [{ columns: [created_at], metrics: [sum__revenue] }] }",
      "native_filter_configuration:",
      "  - id: native_filter_region",
      "    type: filter_select",
      "    targets: [{ datasetId: 12, column: region }]",
      "metadata:",
      "  SQL Lab: true",
      "  row_level_security: enabled",
      "  roles: [Admin, Gamma]",
      "  cache_timeout: 300",
      "  embedded_dashboard: true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "lightdash", "lightdash.yml"), [
      "project: analytics",
      "explores:",
      "  orders:",
      "    label: Orders Explore",
      "    joins:",
      "      customers: { sql_on: '${orders.customer_id} = ${customers.id}' }",
      "    metrics:",
      "      total_revenue: { type: sum, sql: revenue }",
      "    dimensions:",
      "      region: { type: string, sql: region }",
      "dashboards:",
      "  executive_revenue:",
      "    tiles:",
      "      - savedChartUuid: revenue_by_region",
      "savedCharts:",
      "  revenue_by_region:",
      "    explore: orders",
      "spaces:",
      "  finance: { access: viewer }",
      "scheduled_delivery:",
      "  slack: '#finance'",
      "user_attributes:",
      "  region_access: required"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "embeds", "signed-embed.ts"), [
      "export const iframe = '<iframe src=\"/embed/dashboard/public-dashboard\"></iframe>';",
      "export const signedEmbed = { jwt: 'signed', publicLink: true, sdkEmbed: '@lightdash/sdk', embedConfig: { dashboardId: 42 } };"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "bi-dashboard.yml"), [
      "name: BI Dashboard Validation",
      "on: [push]",
      "jobs:",
      "  dashboards:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: metabase export dashboards --collection finance",
      "      - run: superset import-dashboards -p superset/dashboard.yaml",
      "      - run: lightdash validate && lightdash compile && lightdash dbt sync",
      "      - run: npm run visual-regression",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: bi-dashboard-artifacts",
      "          path: |",
      "            metabase/dashboard.json",
      "            superset/dashboard.yaml",
      "            lightdash/lightdash.yml"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "bi-dashboard-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dashboardSetups: Array<{ platform: string; dashboardCount: number; chartCount: number; queryCount: number; datasetCount: number; filterCount: number; permissionCount: number; embeddingCount: number; alertCount: number; cacheCount: number; workflowCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      dashboardSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      filterSignals: Array<{ signal: string; readiness: string }>;
      accessSignals: Array<{ signal: string; readiness: string }>;
      embeddingSignals: Array<{ signal: string; readiness: string }>;
      alertSignals: Array<{ signal: string; readiness: string }>;
      cacheSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (platform: string) => report.dashboardSetups
      .filter((item) => item.platform === platform)
      .reduce((totals, item) => ({
        dashboardCount: totals.dashboardCount + item.dashboardCount,
        chartCount: totals.chartCount + item.chartCount,
        queryCount: totals.queryCount + item.queryCount,
        datasetCount: totals.datasetCount + item.datasetCount,
        filterCount: totals.filterCount + item.filterCount,
        permissionCount: totals.permissionCount + item.permissionCount,
        embeddingCount: totals.embeddingCount + item.embeddingCount,
        alertCount: totals.alertCount + item.alertCount,
        cacheCount: totals.cacheCount + item.cacheCount,
        workflowCount: totals.workflowCount + item.workflowCount
      }), { dashboardCount: 0, chartCount: 0, queryCount: 0, datasetCount: 0, filterCount: 0, permissionCount: 0, embeddingCount: 0, alertCount: 0, cacheCount: 0, workflowCount: 0 });

    expect(report.sourcePattern).toBe("BI dashboard readiness Metabase Superset Lightdash dashboards cards charts queries datasets saved questions explores metrics semantic layer filters parameters drilldowns alerts subscriptions embedded analytics permissions roles row level security cache refresh SQL lab database connections");
    expect(setupTotals("metabase").dashboardCount).toBeGreaterThan(0);
    expect(setupTotals("metabase").queryCount).toBeGreaterThan(0);
    expect(setupTotals("metabase").embeddingCount).toBeGreaterThan(0);
    expect(setupTotals("superset").chartCount).toBeGreaterThan(0);
    expect(setupTotals("superset").datasetCount).toBeGreaterThan(0);
    expect(setupTotals("superset").permissionCount).toBeGreaterThan(0);
    expect(setupTotals("lightdash").dashboardCount).toBeGreaterThan(0);
    expect(setupTotals("lightdash").chartCount).toBeGreaterThan(0);
    expect(setupTotals("lightdash").alertCount).toBeGreaterThan(0);
    expect(report.dashboardSetups.some((item) => item.filterCount > 0)).toBe(true);
    expect(report.dashboardSetups.some((item) => item.cacheCount > 0)).toBe(true);
    expect(report.dashboardSetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["metabase", "superset", "lightdash", "custom"]));
    expect(readySignals(report.dashboardSignals)).toEqual(expect.arrayContaining(["dashboard", "card", "chart", "slice", "explore", "saved-question", "dashboard-config"]));
    expect(readySignals(report.querySignals)).toEqual(expect.arrayContaining(["sql-query", "native-query", "dataset", "semantic-model", "metric", "dimension", "join"]));
    expect(readySignals(report.filterSignals)).toEqual(expect.arrayContaining(["parameter", "filter", "field-filter", "dashboard-filter", "date-filter", "cross-filter", "drilldown"]));
    expect(readySignals(report.accessSignals)).toEqual(expect.arrayContaining(["role", "permission", "row-level-security", "collection-permission", "space-access", "embedding-secret"]));
    expect(readySignals(report.embeddingSignals)).toEqual(expect.arrayContaining(["iframe", "signed-embed", "public-link", "sdk-embed", "embed-config"]));
    expect(readySignals(report.alertSignals)).toEqual(expect.arrayContaining(["alert", "subscription", "pulse", "report-schedule", "slack-email"]));
    expect(readySignals(report.cacheSignals)).toEqual(expect.arrayContaining(["cache", "refresh", "ttl", "async-query", "result-cache", "precomputed"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["github-actions", "dashboard-export", "asset-import", "sql-validation", "dbt-sync", "visual-regression", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["metabase", "apache-superset", "lightdash", "echarts", "chartjs"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"metabase|dashboard|card|native_query|dataset_query|pulse|collection|field_filter\" .",
      "rg \"superset|Slice|Dashboard|SqlaTable|SQL Lab|RLS|row_level_security|ChartData\" .",
      "rg \"lightdash|explores|metrics|dimensions|Dashboard|SavedChart|Space|scheduled_delivery\" .",
      "rg \"embed|iframe|signed|public link|JWT|permissions|roles|row-level|collection\" .",
      "rg \"cache|refresh|ttl|async query|dashboard export|visual regression|upload-artifact\" .github ."
    ]));
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records BI dashboard readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "bi-dashboard-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "bi-dashboard-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "bi-dashboard-readiness.html"))).resolves.toBeUndefined();
    const biDashboardMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "bi-dashboard-readiness.md"), "utf8");
    expect(biDashboardMarkdown).toContain("Dashboard Setups");
    expect(biDashboardMarkdown).toContain("Embedding Signals");
    expect(biDashboardMarkdown).toContain("Workflow Signals");
    const biDashboardHtml = await fs.readFile(path.join(result.session.outputPaths.html, "bi-dashboard-readiness.html"), "utf8");
    expect(biDashboardHtml).toContain("bi-dashboard-readiness-card");
    expect(biDashboardHtml).toContain("data-source-pattern=\"BIDashboard\"");
    expect(biDashboardHtml).toContain("RepoTutor records BI dashboard readiness only");
  });

  it("detects schema registry readiness without starting registries or publishing modules", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-schema-registry-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-schema-registry-source-"));
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "apicurio"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "proto", "orders", "v1"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "schema:lint": "buf lint",
        "schema:breaking": "buf breaking --against '.git#branch=main'",
        "schema:generate": "buf generate",
        "schema:push": "buf push"
      },
      dependencies: {
        "@bufbuild/buf": "1.50.0",
        "@kafkajs/confluent-schema-registry": "3.8.0",
        "schema-registry-client": "1.0.0"
      },
      devDependencies: {
        "protoc-gen-go": "1.34.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "build.gradle"), [
      "dependencies {",
      "  implementation(\"io.confluent:kafka-schema-registry-client:7.8.0\")",
      "  implementation(\"io.confluent:kafka-avro-serializer:7.8.0\")",
      "  implementation(\"io.confluent:kafka-protobuf-serializer:7.8.0\")",
      "  implementation(\"io.confluent:kafka-json-schema-serializer:7.8.0\")",
      "  implementation(\"io.apicurio:apicurio-registry-client:3.0.0\")",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "schema-registry.properties"), [
      "listeners=http://0.0.0.0:8081",
      "kafkastore.bootstrap.servers=PLAINTEXT://localhost:9092",
      "kafkastore.topic=_schemas",
      "schema.registry.url=http://localhost:8081"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "OrdersSchemas.java"), [
      "import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;",
      "import io.confluent.kafka.schemaregistry.client.rest.entities.SchemaReference;",
      "import io.confluent.kafka.schemaregistry.client.rest.entities.requests.RegisterSchemaResponse;",
      "import io.confluent.kafka.serializers.KafkaAvroSerializer;",
      "import io.confluent.kafka.serializers.protobuf.KafkaProtobufSerializer;",
      "import io.confluent.kafka.serializers.json.KafkaJsonSchemaSerializer;",
      "class OrdersSchemas {",
      "  String registry = \"Confluent Schema Registry schema.registry.url SCHEMA_REGISTRY_URL /subjects/orders-value/versions /subjects/orders-key/versions /compatibility/subjects/orders-value/versions/latest schemas/ids/100\";",
      "  String identity = \"subject subjects subjectName TopicNameStrategy RecordNameStrategy SubjectNameStrategy schema ID schemaId RegisterSchemaResponse references SchemaReference\";",
      "  String formats = \"Avro Schema.AVRO .avsc Protobuf PROTOBUF proto3 .proto JSON Schema JSONSchema OpenAPI AsyncAPI\";",
      "  String compatibility = \"BACKWARD FORWARD FULL_TRANSITIVE TRANSITIVE NONE compatibility check testCompatibility schema-compatibility-check\";",
      "  Object avro = KafkaAvroSerializer.class;",
      "  Object protobuf = KafkaProtobufSerializer.class;",
      "  Object json = KafkaJsonSchemaSerializer.class;",
      "  RegisterSchemaResponse response;",
      "  SchemaReference reference;",
      "  void register(SchemaRegistryClient client) throws Exception { client.registerWithResponse(\"orders-value\", null, true); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "apicurio", "ccompat.md"), [
      "# Apicurio Registry ccompat",
      "Apicurio Registry exposes /apis/ccompat/v7 and /apis/ccompat/v8 for Confluent compatible clients.",
      "Group and artifact identity use /groups/ecommerce/artifacts with groupId and artifactId.",
      "Version IDs map to contentId and globalId, and rules include compatibility rule plus validity rule.",
      "Mode endpoints allow READWRITE, READONLY, and IMPORT for registry governance.",
      "artifactType JSON OPENAPI AsyncAPI contentId globalId artifactId groupId versionId"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "buf.yaml"), [
      "version: v2",
      "modules:",
      "  - path: proto",
      "    name: buf.build/acme/orders",
      "deps:",
      "  - buf.build/googleapis/googleapis",
      "lint:",
      "  use:",
      "    - STANDARD",
      "breaking:",
      "  use:",
      "    - FILE",
      "    - PACKAGE",
      "    - WIRE_JSON",
      "    - WIRE"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "buf.gen.yaml"), [
      "version: v2",
      "managed:",
      "  enabled: true",
      "plugins:",
      "  - remote: buf.build/protocolbuffers/go",
      "    out: gen/go"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "buf.lock"), [
      "version: v2",
      "deps:",
      "  - name: buf.build/googleapis/googleapis",
      "    commit: abcdef123456"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "proto", "orders", "v1", "orders.proto"), [
      "syntax = \"proto3\";",
      "package orders.v1;",
      "import \"google/protobuf/timestamp.proto\";",
      "message OrderPlaced { string order_id = 1; google.protobuf.Timestamp created_at = 2; }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "schema-registry.yml"), [
      "name: schema registry readiness",
      "on: [push]",
      "jobs:",
      "  schema:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: buf lint",
      "      - run: buf breaking --against '.git#branch=main'",
      "      - run: buf generate",
      "      - run: buf push",
      "      - run: schema-compatibility-check --subject orders-value --schema schemas/order.avsc",
      "      - run: curl -X POST http://localhost:8081/subjects/orders-value/versions",
      "      - run: curl -X POST http://localhost:8081/compatibility/subjects/orders-value/versions/latest",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            schema-registry-report.json",
      "            buf-breaking.json",
      "            compatibility-report.json",
      "            schema-readiness.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "schema-registry-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      registrySetups: Array<{ provider: string; subjectCount: number; artifactCount: number; versionCount: number; compatibilityCount: number; formatCount: number; referenceCount: number; configCount: number; governanceCount: number; workflowCount: number }>;
      registrySignals: Array<{ signal: string; readiness: string }>;
      schemaFormatSignals: Array<{ signal: string; readiness: string }>;
      identitySignals: Array<{ signal: string; readiness: string }>;
      compatibilitySignals: Array<{ signal: string; readiness: string }>;
      governanceSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (provider: string) => report.registrySetups
      .filter((item) => item.provider === provider)
      .reduce((totals, item) => ({
        subjectCount: totals.subjectCount + item.subjectCount,
        artifactCount: totals.artifactCount + item.artifactCount,
        versionCount: totals.versionCount + item.versionCount,
        compatibilityCount: totals.compatibilityCount + item.compatibilityCount,
        formatCount: totals.formatCount + item.formatCount,
        referenceCount: totals.referenceCount + item.referenceCount,
        configCount: totals.configCount + item.configCount,
        governanceCount: totals.governanceCount + item.governanceCount,
        workflowCount: totals.workflowCount + item.workflowCount
      }), { subjectCount: 0, artifactCount: 0, versionCount: 0, compatibilityCount: 0, formatCount: 0, referenceCount: 0, configCount: 0, governanceCount: 0, workflowCount: 0 });

    expect(report.sourcePattern).toBe("Schema registry readiness Confluent Apicurio Buf subject artifact version compatibility Avro Protobuf JSON Schema lint breaking generate push");
    expect(setupTotals("confluent").subjectCount).toBeGreaterThan(0);
    expect(setupTotals("apicurio").artifactCount).toBeGreaterThan(0);
    expect(setupTotals("buf").governanceCount).toBeGreaterThan(0);
    expect(report.registrySetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(readySignals(report.registrySignals)).toEqual(expect.arrayContaining(["confluent-schema-registry", "apicurio-registry", "buf-schema-registry", "schema-registry-url", "ccompat-api"]));
    expect(readySignals(report.schemaFormatSignals)).toEqual(expect.arrayContaining(["avro", "protobuf", "json-schema", "openapi", "asyncapi"]));
    expect(readySignals(report.identitySignals)).toEqual(expect.arrayContaining(["subject", "artifact-id", "group-id", "version", "schema-id", "content-id", "global-id", "references"]));
    expect(readySignals(report.compatibilitySignals)).toEqual(expect.arrayContaining(["backward", "forward", "full", "transitive", "none", "compatibility-check", "breaking-check"]));
    expect(readySignals(report.governanceSignals)).toEqual(expect.arrayContaining(["compatibility-rule", "validity-rule", "mode", "lint", "breaking-policy", "managed-mode", "dependency-lock"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["schema-register-command", "compatibility-command", "buf-lint", "buf-breaking", "buf-generate", "buf-push", "github-actions", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["schema-registry-client", "kafka-avro-serializer", "kafka-protobuf-serializer", "kafka-json-schema-serializer", "apicurio-client", "buf-cli", "protoc"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"schema.registry.url|Schema Registry|/subjects/.*/versions|/compatibility/subjects|schema-compatibility-check\" .",
      "rg \"buf.yaml|buf.gen.yaml|buf.lock|buf lint|buf breaking|buf generate|buf push|breaking:\" .",
      "rg \"KafkaAvroSerializer|KafkaProtobufSerializer|KafkaJsonSchemaSerializer|@bufbuild/buf|protoc|upload-artifact\" package.json pom.xml build.gradle .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "schema-registry-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "schema-registry-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "schema-registry-readiness.html"))).resolves.toBeUndefined();
    const schemaRegistryMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "schema-registry-readiness.md"), "utf8");
    expect(schemaRegistryMarkdown).toContain("Compatibility Signals");
    expect(schemaRegistryMarkdown).toContain("Governance Signals");
    const schemaRegistryHtml = await fs.readFile(path.join(result.session.outputPaths.html, "schema-registry-readiness.html"), "utf8");
    expect(schemaRegistryHtml).toContain("schema-registry-readiness-card");
    expect(schemaRegistryHtml).toContain("data-source-pattern=\"Schema Registry\"");
  });

  it("detects stream processing readiness without running Flink Beam or Spark jobs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-stream-processing-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-stream-processing-source-"));
    await fs.mkdir(path.join(sourceRoot, "flink"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "beam"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "spark"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "build.gradle"), [
      "dependencies {",
      "  implementation(\"org.apache.flink:flink-streaming-java:1.20.0\")",
      "  implementation(\"org.apache.flink:flink-connector-kafka:3.3.0\")",
      "  implementation(\"org.apache.beam:beam-sdks-java-core:2.60.0\")",
      "  implementation(\"org.apache.beam:beam-runners-flink-1.18:2.60.0\")",
      "  implementation(\"org.apache.beam:beam-runners-spark-3:2.60.0\")",
      "  implementation(\"org.apache.spark:spark-sql_2.13:4.0.0\")",
      "  implementation(\"org.apache.spark:spark-streaming_2.13:4.0.0\")",
      "  implementation(\"com.example:stream-processing-custom:1.0.0\")",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "flink", "orders-flink.java"), [
      "import org.apache.flink.api.common.eventtime.WatermarkStrategy;",
      "import org.apache.flink.api.common.restartstrategy.RestartStrategies;",
      "import org.apache.flink.contrib.streaming.state.RocksDBStateBackend;",
      "import org.apache.flink.streaming.api.CheckpointingMode;",
      "import org.apache.flink.streaming.api.datastream.DataStream;",
      "import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;",
      "import org.apache.flink.streaming.api.functions.KeyedProcessFunction;",
      "import org.apache.flink.streaming.api.functions.sink.TwoPhaseCommitSinkFunction;",
      "import org.apache.flink.streaming.api.functions.source.SourceFunction;",
      "import org.apache.flink.streaming.api.functions.windowing.ProcessWindowFunction;",
      "import org.apache.flink.streaming.api.windowing.assigners.EventTimeSessionWindows;",
      "import org.apache.flink.streaming.api.windowing.assigners.SlidingEventTimeWindows;",
      "import org.apache.flink.streaming.api.windowing.assigners.TumblingEventTimeWindows;",
      "import org.apache.flink.streaming.connectors.kafka.sink.KafkaSink;",
      "import org.apache.flink.streaming.connectors.kafka.source.KafkaSource;",
      "class OrdersFlinkJob {",
      "  StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();",
      "  DataStream<String> stream;",
      "  SourceFunction<String> customSource;",
      "  KafkaSource<String> kafkaSource;",
      "  KafkaSink<String> kafkaSink;",
      "  TwoPhaseCommitSinkFunction<String, String, String> twoPhaseCommitSink;",
      "  KeyedProcessFunction<String, String, String> keyedState;",
      "  String state = \"ValueState MapState TimerService onTimer StateTtlConfig ttl RocksDB state.backend=rocksdb\";",
      "  String checkpoints = \"enableCheckpointing checkpointing CheckpointingMode.EXACTLY_ONCE setCheckpointTimeout savepoint RestartStrategies checkpoint timeout\";",
      "  String transforms = \"stream.map(x -> x).flatMap(fn).filter(fn).keyBy(fn).aggregate(fn).join(stream)\";",
      "  String windows = \"TumblingEventTimeWindows SlidingEventTimeWindows EventTimeSessionWindows trigger allowed lateness late data\";",
      "  String watermarks = \"WatermarkStrategy event-time processing-time TimestampAssigner forBoundedOutOfOrderness withIdleness idle source\";",
      "  String sinks = \"FileSink JdbcSink DeliveryGuarantee.EXACTLY_ONCE exactly-once sink\";",
      "  String deployment = \"FlinkRunner flink run cluster submit Kubernetes YARN operator JobManager TaskManager\";",
      "  String monitoring = \"metrics backpressure checkpoint metrics lag job status alert\";",
      "  void execute() throws Exception { env.enableCheckpointing(1000); env.execute(\"orders-stream-job\"); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "beam", "orders-beam.java"), [
      "import org.apache.beam.runners.flink.FlinkRunner;",
      "import org.apache.beam.runners.spark.SparkRunner;",
      "import org.apache.beam.sdk.Pipeline;",
      "import org.apache.beam.sdk.transforms.DoFn;",
      "import org.apache.beam.sdk.transforms.GroupByKey;",
      "import org.apache.beam.sdk.transforms.ParDo;",
      "import org.apache.beam.sdk.transforms.windowing.AfterProcessingTime;",
      "import org.apache.beam.sdk.transforms.windowing.AfterWatermark;",
      "import org.apache.beam.sdk.transforms.windowing.FixedWindows;",
      "import org.apache.beam.sdk.transforms.windowing.Sessions;",
      "import org.apache.beam.sdk.transforms.windowing.SlidingWindows;",
      "import org.apache.beam.sdk.values.PCollection;",
      "class OrdersBeamPipeline {",
      "  Pipeline pipeline = Pipeline.create();",
      "  PCollection<String> rows;",
      "  DoFn<String, String> doFn;",
      "  String io = \"KafkaIO.read PubsubIO KinesisIO PulsarSource BigQueryIO.write TextIO.read TextIO.write\";",
      "  String transforms = \"ParDo DoFn GroupByKey Combine CoGroupByKey\";",
      "  String windows = \"Window.into FixedWindows SlidingWindows Sessions trigger AfterWatermark AfterProcessingTime AllowedLateness\";",
      "  String state = \"StateSpec TimerSpec RegisterProcessingTimeTimer\";",
      "  String runners = \"FlinkRunner SparkRunner runner\";",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "spark", "orders-spark.scala"), [
      "import org.apache.spark.sql.streaming.{OutputMode, StreamingQuery, StreamingQueryListener, Trigger}",
      "class OrdersSparkJob {",
      "  val read = spark.readStream.format(\"kafka\").option(\"subscribe\", \"orders\").load()",
      "  val files = spark.readStream.format(\"json\").load(\"/events\")",
      "  val socket = spark.readStream.format(\"socket\").load()",
      "  val enriched = read.withWatermark(\"event_time\", \"10 minutes\").select(\"*\").withColumn(\"x\", col(\"value\"))",
      "  val stateful = enriched.mapGroupsWithState(fn).flatMapGroupsWithState(fn)",
      "  val stateStore = \"stateStore StateStore mapGroupsWithState flatMapGroupsWithState\"",
      "  val query: StreamingQuery = enriched.writeStream.outputMode(OutputMode.Append()).foreachBatch((batch, id) => batch.write.format(\"jdbc\"))",
      "    .option(\"checkpointLocation\", \"/tmp/checkpoints/orders\").trigger(Trigger.ProcessingTime(\"10 seconds\")).start()",
      "  val listener = new StreamingQueryListener {}",
      "  val deployment = \"Spark Structured Streaming SparkRunner spark-submit Kubernetes operator SparkApplication\"",
      "  val monitoring = \"StreamingQueryListener inputRowsPerSecond processedRowsPerSecond query.status job status alert\"",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "stream-processing-plan.md"), [
      "# Custom stream processing",
      "A custom stream processor keeps stream processing readiness notes for sources, sinks, checkpoint recovery, and deployment."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "stream-processing-readiness.yml"), [
      "name: stream processing smoke",
      "on: [push]",
      "jobs:",
      "  stream-processing:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm stream-processing --stream-job-smoke --checkpoint-smoke --window-smoke --sink-smoke",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            stream-processing-report.json",
      "            checkpoint-recovery.json",
      "            window-lateness.json",
      "            sink-delivery.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "stream-processing-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      streamProcessingSetups: Array<{ engine: string; jobCount: number; sourceCount: number; transformCount: number; windowCount: number; watermarkCount: number; stateCount: number; checkpointCount: number; sinkCount: number; deploymentCount: number; monitoringCount: number; ciCount: number }>;
      engineSignals: Array<{ signal: string; readiness: string }>;
      jobSignals: Array<{ signal: string; readiness: string }>;
      sourceSignals: Array<{ signal: string; readiness: string }>;
      transformSignals: Array<{ signal: string; readiness: string }>;
      windowSignals: Array<{ signal: string; readiness: string }>;
      watermarkSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      checkpointSignals: Array<{ signal: string; readiness: string }>;
      sinkSignals: Array<{ signal: string; readiness: string }>;
      deploymentSignals: Array<{ signal: string; readiness: string }>;
      monitoringSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (engine: string) => report.streamProcessingSetups
      .filter((item) => item.engine === engine)
      .reduce((totals, item) => ({
        jobCount: totals.jobCount + item.jobCount,
        sourceCount: totals.sourceCount + item.sourceCount,
        transformCount: totals.transformCount + item.transformCount,
        windowCount: totals.windowCount + item.windowCount,
        watermarkCount: totals.watermarkCount + item.watermarkCount,
        stateCount: totals.stateCount + item.stateCount,
        checkpointCount: totals.checkpointCount + item.checkpointCount,
        sinkCount: totals.sinkCount + item.sinkCount,
        deploymentCount: totals.deploymentCount + item.deploymentCount,
        monitoringCount: totals.monitoringCount + item.monitoringCount,
        ciCount: totals.ciCount + item.ciCount
      }), { jobCount: 0, sourceCount: 0, transformCount: 0, windowCount: 0, watermarkCount: 0, stateCount: 0, checkpointCount: 0, sinkCount: 0, deploymentCount: 0, monitoringCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Stream processing readiness Apache Flink Apache Beam Spark Structured Streaming StreamExecutionEnvironment DataStream Pipeline PCollection readStream writeStream checkpointing savepoint state backend WatermarkStrategy window trigger exactly-once sink runner deployment metrics CI");
    expect(setupTotals("flink").jobCount).toBeGreaterThan(0);
    expect(setupTotals("flink").checkpointCount).toBeGreaterThan(0);
    expect(setupTotals("beam").windowCount).toBeGreaterThan(0);
    expect(setupTotals("spark").sinkCount).toBeGreaterThan(0);
    expect(report.streamProcessingSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.engineSignals)).toEqual(expect.arrayContaining(["apache-flink", "apache-beam", "spark-structured-streaming", "custom"]));
    expect(readySignals(report.jobSignals)).toEqual(expect.arrayContaining(["stream-execution-environment", "datastream", "beam-pipeline", "pcollection", "readstream", "writestream", "streaming-query", "runner"]));
    expect(readySignals(report.sourceSignals)).toEqual(expect.arrayContaining(["kafka-source", "file-source", "socket-source", "pubsub-source", "kinesis-source", "pulsar-source", "custom-source"]));
    expect(readySignals(report.transformSignals)).toEqual(expect.arrayContaining(["map", "flatmap", "filter", "keyby", "par-do", "group-by-key", "aggregation", "join"]));
    expect(readySignals(report.windowSignals)).toEqual(expect.arrayContaining(["tumbling-window", "sliding-window", "session-window", "fixed-window", "trigger", "allowed-lateness", "late-data"]));
    expect(readySignals(report.watermarkSignals)).toEqual(expect.arrayContaining(["watermark-strategy", "with-watermark", "event-time", "processing-time", "timestamp-assigner", "idle-source"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["keyed-state", "value-state", "map-state", "state-store", "rocksdb", "timer", "ttl", "map-groups-with-state"]));
    expect(readySignals(report.checkpointSignals)).toEqual(expect.arrayContaining(["checkpointing", "checkpoint-location", "savepoint", "restart-strategy", "exactly-once-mode", "checkpoint-timeout"]));
    expect(readySignals(report.sinkSignals)).toEqual(expect.arrayContaining(["kafka-sink", "file-sink", "jdbc-sink", "bigquery-sink", "foreach-batch", "two-phase-commit", "exactly-once-sink"]));
    expect(readySignals(report.deploymentSignals)).toEqual(expect.arrayContaining(["flink-runner", "spark-runner", "cluster-submit", "kubernetes", "yarn", "operator", "jobmanager", "taskmanager"]));
    expect(readySignals(report.monitoringSignals)).toEqual(expect.arrayContaining(["metrics", "backpressure", "checkpoint-metrics", "lag", "streaming-query-listener", "job-status", "alert"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "stream-job-smoke", "checkpoint-smoke", "window-smoke", "sink-smoke", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["flink-streaming", "flink-connector", "beam-sdk", "beam-runner", "spark-sql", "spark-streaming", "custom"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"StreamExecutionEnvironment|DataStream|env.execute|enableCheckpointing|CheckpointingMode|WatermarkStrategy|KafkaSource|KafkaSink\" .",
      "rg \"Pipeline|PCollection|ParDo|DoFn|GroupByKey|Window|FixedWindows|SlidingWindows|FlinkRunner|SparkRunner|KafkaIO|PubsubIO\" .",
      "rg \"stream-job-smoke|checkpoint-smoke|window-smoke|sink-smoke|upload-artifact|backpressure|checkpoint metrics\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "stream-processing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "stream-processing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "stream-processing-readiness.html"))).resolves.toBeUndefined();
    const streamProcessingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "stream-processing-readiness.md"), "utf8");
    expect(streamProcessingMarkdown).toContain("Watermark Signals");
    expect(streamProcessingMarkdown).toContain("Checkpoint Signals");
    expect(streamProcessingMarkdown).toContain("Sink Signals");
    const streamProcessingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "stream-processing-readiness.html"), "utf8");
    expect(streamProcessingHtml).toContain("stream-processing-readiness-card");
    expect(streamProcessingHtml).toContain("data-source-pattern=\"StreamProcessing\"");
  });

  it("detects pipeline orchestration readiness without running Airflow Dagster or Prefect", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-pipeline-orchestration-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-pipeline-orchestration-source-"));
    await fs.mkdir(path.join(sourceRoot, "airflow", "dags"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "dagster"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prefect"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = [",
      "  \"apache-airflow\",",
      "  \"apache-airflow-providers-openlineage\",",
      "  \"dagster\",",
      "  \"dagster-webserver\",",
      "  \"prefect\"",
      "]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "airflow", "dags", "orders_airflow.py"), [
      "from airflow import DAG",
      "from airflow.sdk import DAG as SdkDAG, dag as sdk_dag, task as sdk_task, task_group as sdk_task_group, setup, teardown, Param, Context, TriggerRule, Asset, get_current_context, chain",
      "from airflow.decorators import dag, task, task_group",
      "from airflow.operators.python import PythonOperator, BranchPythonOperator",
      "from airflow.operators.bash import BashOperator",
      "from airflow.sensors.external_task import ExternalTaskSensor",
      "from airflow.datasets import Dataset",
      "from airflow.models import XCom, DagRun",
      "from airflow.utils.task_group import TaskGroup",
      "from airflow.timetables.interval import CronDataIntervalTimetable",
      "default_args = {\"retries\": 3, \"retry_delay\": \"5m\", \"sla\": \"1h\", \"execution_timeout\": \"10m\", \"pool\": \"etl_pool\", \"queue\": \"etl\", \"idempotency\": \"orders\", \"depends_on_past\": False}",
      "@dag(schedule_interval=\"0 * * * *\", catchup=True, default_args=default_args)",
      "def decorated_orders():",
      "  @task",
      "  def extract_task():",
      "    return XCom",
      "  extract_task()",
      "@sdk_dag(schedule=Asset(\"s3://warehouse/orders\"), catchup=False, params={\"region\": Param(\"us\")})",
      "def sdk_orders(context: Context | None = None):",
      "  @setup",
      "  def prepare():",
      "    return get_current_context()",
      "  @sdk_task(trigger_rule=TriggerRule.ALL_DONE)",
      "  def load_sdk():",
      "    return context",
      "  @teardown",
      "  def cleanup():",
      "    return None",
      "  with sdk_task_group(\"sdk_group\"):",
      "    chain(prepare(), load_sdk(), cleanup())",
      "with DAG(\"orders_airflow\", schedule_interval=\"0 * * * *\", catchup=True, default_args=default_args, dagrun_timeout=\"2h\") as dag:",
      "  start = PythonOperator(task_id=\"extract\", python_callable=lambda: XCom)",
      "  transform = BashOperator(task_id=\"transform\", bash_command=\"echo transform\")",
      "  external = ExternalTaskSensor(task_id=\"wait_external\", external_dag_id=\"upstream\", external_task_id=\"done\")",
      "  ds = Dataset(\"s3://warehouse/orders\")",
      "  branch = BranchPythonOperator(task_id=\"branch\", python_callable=lambda: \"transform\")",
      "  with TaskGroup(\"load_group\") as load_group:",
      "    load = PythonOperator(task_id=\"load\", python_callable=lambda: DagRun)",
      "  start >> external >> branch >> transform >> load_group",
      "AIRFLOW_DEPLOYMENT = \"airflow scheduler airflow webserver airflow dags backfill CeleryExecutor KubernetesExecutor Docker Kubernetes Helm OpenLineage run history task logs metrics alerts timetable interval\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "dagster", "assets.py"), [
      "from dagster import Definitions, ScheduleDefinition, SensorDefinition, DailyPartitionsDefinition, DynamicPartitionsDefinition, StaticPartitionsDefinition, AssetMaterialization, AssetObservation, RetryPolicy, materialize, asset, job, op, graph",
      "@op(retry_policy=RetryPolicy(max_retries=3), pool=\"warehouse\")",
      "def extract_op():",
      "  return AssetObservation(asset_key=\"orders\")",
      "@job",
      "def orders_job():",
      "  extract_op()",
      "@graph",
      "def orders_graph():",
      "  extract_op()",
      "@asset(partitions_def=DailyPartitionsDefinition(start_date=\"2024-01-01\"), deps=[\"orders\"], backfill_policy=\"single_run\")",
      "def orders_asset():",
      "  return AssetMaterialization(asset_key=\"orders\")",
      "dynamic_partitions = DynamicPartitionsDefinition(name=\"regions\")",
      "static_partitions = StaticPartitionsDefinition([\"us\", \"eu\"])",
      "orders_schedule = ScheduleDefinition(job=orders_job, cron_schedule=\"0 * * * *\")",
      "orders_sensor = SensorDefinition(name=\"orders_sensor\", evaluation_fn=lambda _: None)",
      "defs = Definitions(assets=[orders_asset], jobs=[orders_job], schedules=[orders_schedule], sensors=[orders_sensor])",
      "DAGSTER_DEPLOYMENT = \"dagster-daemon dagster dev Docker Kubernetes Helm AssetObservation AssetMaterialization materialize BackfillPolicy asset backfill run history task logs metrics alerts OpenLineage dynamic partition add_dynamic_partitions DynamicOut dynamic mapping\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prefect", "flows.py"), [
      "from prefect import flow, task",
      "from prefect.deployments import Deployment",
      "from prefect.events import Event",
      "@task(retries=3, retry_delay_seconds=10, timeout_seconds=600)",
      "def extract(region: str):",
      "  return region",
      "@flow(name=\"orders-flow\", retries=2, timeout_seconds=1200, persist_result=True, result_storage=\"s3\")",
      "def orders_flow(region: str = \"us\"):",
      "  extract.submit(region)",
      "  extract.map([region])",
      "  child_flow.with_options(name=\"subflow\")()",
      "@flow",
      "def child_flow():",
      "  return \"subflow\"",
      "deployment = Deployment(name=\"orders-deployment\", work_pool_name=\"warehouse-pool\", work_queue_name=\"etl\", parameters={\"region\": \"us\"})",
      "orders_flow.serve(name=\"orders-serve\")",
      "PREFECT_DEPLOYMENT = \"prefect worker start --pool warehouse-pool work_pool work_queue EventTrigger Event automations result_storage serve Kubernetes Docker Helm flow run task run run history task logs metrics alerts idempotency parameter interval\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "pipeline-orchestration-readiness.yml"), [
      "name: pipeline orchestration smoke",
      "on: [push]",
      "jobs:",
      "  pipeline-orchestration:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm pipeline-orchestration --dag-parse-smoke --orchestration-unit-test --backfill-smoke",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            pipeline-orchestration-report.json",
      "            dag-parse.json",
      "            backfill-smoke.json",
      "            orchestration-unit-test.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "pipeline-orchestration-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      pipelineOrchestrationSetups: Array<{ orchestrator: string; dagCount: number; taskCount: number; scheduleCount: number; sensorCount: number; assetCount: number; partitionCount: number; retryCount: number; backfillCount: number; executorCount: number; deploymentCount: number; observabilityCount: number; ciCount: number }>;
      orchestratorSignals: Array<{ signal: string; readiness: string }>;
      authoringSignals: Array<{ signal: string; readiness: string }>;
      dagSignals: Array<{ signal: string; readiness: string }>;
      taskSignals: Array<{ signal: string; readiness: string }>;
      dependencySignals: Array<{ signal: string; readiness: string }>;
      scheduleSignals: Array<{ signal: string; readiness: string }>;
      sensorSignals: Array<{ signal: string; readiness: string }>;
      assetSignals: Array<{ signal: string; readiness: string }>;
      partitionSignals: Array<{ signal: string; readiness: string }>;
      reliabilitySignals: Array<{ signal: string; readiness: string }>;
      executorSignals: Array<{ signal: string; readiness: string }>;
      deploymentSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (orchestrator: string) => report.pipelineOrchestrationSetups
      .filter((item) => item.orchestrator === orchestrator)
      .reduce((totals, item) => ({
        dagCount: totals.dagCount + item.dagCount,
        taskCount: totals.taskCount + item.taskCount,
        scheduleCount: totals.scheduleCount + item.scheduleCount,
        sensorCount: totals.sensorCount + item.sensorCount,
        assetCount: totals.assetCount + item.assetCount,
        partitionCount: totals.partitionCount + item.partitionCount,
        retryCount: totals.retryCount + item.retryCount,
        backfillCount: totals.backfillCount + item.backfillCount,
        executorCount: totals.executorCount + item.executorCount,
        deploymentCount: totals.deploymentCount + item.deploymentCount,
        observabilityCount: totals.observabilityCount + item.observabilityCount,
        ciCount: totals.ciCount + item.ciCount
      }), { dagCount: 0, taskCount: 0, scheduleCount: 0, sensorCount: 0, assetCount: 0, partitionCount: 0, retryCount: 0, backfillCount: 0, executorCount: 0, deploymentCount: 0, observabilityCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Pipeline orchestration readiness Apache Airflow Dagster Prefect airflow.sdk stable authoring interface DAG dag task task_group setup teardown Param Context TriggerRule Asset flow asset sensor schedule backfill catchup partition retry SLA XCom executor worker deployment run history CI");
    expect(setupTotals("airflow").dagCount).toBeGreaterThan(0);
    expect(setupTotals("airflow").taskCount).toBeGreaterThan(0);
    expect(setupTotals("dagster").assetCount).toBeGreaterThan(0);
    expect(setupTotals("dagster").partitionCount).toBeGreaterThan(0);
    expect(setupTotals("prefect").taskCount).toBeGreaterThan(0);
    expect(setupTotals("prefect").deploymentCount).toBeGreaterThan(0);
    expect(report.pipelineOrchestrationSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.orchestratorSignals)).toEqual(expect.arrayContaining(["apache-airflow", "dagster", "prefect", "custom"]));
    expect(readySignals(report.authoringSignals)).toEqual(expect.arrayContaining(["airflow-sdk", "dag-decorator", "task-decorator", "asset-authoring", "task-group", "setup-teardown", "params", "context", "trigger-rule", "legacy-import"]));
    expect(readySignals(report.dagSignals)).toEqual(expect.arrayContaining(["airflow-dag", "dagster-job", "prefect-flow", "taskflow", "graph"]));
    expect(readySignals(report.taskSignals)).toEqual(expect.arrayContaining(["airflow-operator", "airflow-task", "dagster-op", "dagster-asset", "prefect-task", "mapped-task"]));
    expect(readySignals(report.dependencySignals)).toEqual(expect.arrayContaining(["task-dependency", "task-group", "branching", "dynamic-mapping", "subflow"]));
    expect(readySignals(report.scheduleSignals)).toEqual(expect.arrayContaining(["cron-schedule", "interval-schedule", "timetable", "schedule-definition", "catchup"]));
    expect(readySignals(report.sensorSignals)).toEqual(expect.arrayContaining(["airflow-sensor", "dagster-sensor", "prefect-event", "external-task", "dataset-trigger"]));
    expect(readySignals(report.assetSignals)).toEqual(expect.arrayContaining(["dagster-asset", "airflow-dataset", "prefect-result", "materialization", "lineage"]));
    expect(readySignals(report.partitionSignals)).toEqual(expect.arrayContaining(["dagster-partition", "dynamic-partition", "airflow-backfill-date", "prefect-parameter"]));
    expect(readySignals(report.reliabilitySignals)).toEqual(expect.arrayContaining(["retry-policy", "sla", "timeout", "pool-concurrency", "queue", "idempotency"]));
    expect(readySignals(report.executorSignals)).toEqual(expect.arrayContaining(["airflow-executor", "celery", "kubernetes-executor", "dagster-daemon", "prefect-worker", "work-pool"]));
    expect(readySignals(report.deploymentSignals)).toEqual(expect.arrayContaining(["airflow-deployment", "dagster-definitions", "prefect-deployment", "docker", "kubernetes", "helm"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["dag-run-history", "task-logs", "asset-observability", "metrics", "alerts", "openlineage"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "dag-parse-smoke", "orchestration-unit-test", "backfill-smoke", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["apache-airflow", "dagster", "prefect", "airflow-provider", "custom"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"airflow\\.sdk|from airflow import DAG|from airflow\\.decorators|@dag|@task|task_group|setup|teardown|Param|Context|TriggerRule|Asset|get_current_context|chain\" .",
      "rg \"DAG\\(|@dag|airflow.decorators|BaseOperator|PythonOperator|BashOperator|TaskGroup|XCom|Dataset|Sensor\" .",
      "rg \"dagster|@op|@job|@asset|Definitions|ScheduleDefinition|SensorDefinition|PartitionsDefinition|materialize\" .",
      "rg \"prefect|@flow|@task|Deployment|serve\\(|work_pool|work_queue|retries|retry_delay_seconds\" .",
      "rg \"dag-parse-smoke|orchestration-unit-test|backfill-smoke|upload-artifact|OpenLineage|run history|task logs|alerts\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "pipeline-orchestration-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "pipeline-orchestration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "pipeline-orchestration-readiness.html"))).resolves.toBeUndefined();
    const pipelineOrchestrationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "pipeline-orchestration-readiness.md"), "utf8");
    expect(pipelineOrchestrationMarkdown).toContain("Orchestrator Signals");
    expect(pipelineOrchestrationMarkdown).toContain("Authoring Signals");
    expect(pipelineOrchestrationMarkdown).toContain("Reliability Signals");
    expect(pipelineOrchestrationMarkdown).toContain("Executor Signals");
    const pipelineOrchestrationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "pipeline-orchestration-readiness.html"), "utf8");
    expect(pipelineOrchestrationHtml).toContain("pipeline-orchestration-readiness-card");
    expect(pipelineOrchestrationHtml).toContain("data-source-pattern=\"PipelineOrchestration\"");
  });

  it("detects service mesh readiness without running mesh control planes or cluster commands", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-service-mesh-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-service-mesh-source-"));
    await fs.mkdir(path.join(sourceRoot, "mesh", "istio"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "mesh", "linkerd"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "mesh", "consul"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "charts", "mesh"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        istio: "^1.24.0",
        linkerd2: "^2.17.0",
        consul: "^1.21.0",
        envoyproxy: "^1.33.0",
        "gateway-api": "^1.3.0"
      },
      scripts: {
        "mesh:lint": "istioctl analyze -A && linkerd check && consul validate",
        "mesh:proxy": "istioctl proxy-config clusters deploy/orders && consul envoy -bootstrap",
        "mesh:policy": "pnpm policy-smoke authn authz mtls smoke",
        "mesh:traffic": "pnpm traffic-smoke curl VirtualService HTTPRoute TrafficSplit route smoke"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "charts", "mesh", "Chart.yaml"), [
      "apiVersion: v2",
      "name: service-mesh-readiness",
      "description: Helm chart for Istio Linkerd Consul Envoy Gateway API readiness",
      "type: application",
      "version: 0.1.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "mesh", "istio", "routing.yaml"), [
      "apiVersion: install.istio.io/v1alpha1",
      "kind: IstioOperator",
      "spec:",
      "  meshConfig:",
      "    trustDomain: cluster.local",
      "    defaultConfig:",
      "      proxyMetadata:",
      "        ISTIO_META_DNS_CAPTURE: \"true\"",
      "  values:",
      "    cni:",
      "      enabled: true",
      "---",
      "apiVersion: networking.istio.io/v1beta1",
      "kind: Gateway",
      "metadata:",
      "  name: orders-ingress-gateway",
      "spec:",
      "  selector:",
      "    istio: ingress-gateway",
      "  servers:",
      "    - port:",
      "        number: 443",
      "        name: https",
      "        protocol: HTTPS",
      "---",
      "apiVersion: networking.istio.io/v1beta1",
      "kind: VirtualService",
      "metadata:",
      "  name: orders",
      "spec:",
      "  gateways: [orders-ingress-gateway]",
      "  http:",
      "    - route:",
      "        - destination: { host: orders, subset: v1 }",
      "          weight: 90",
      "        - destination: { host: orders, subset: v2 }",
      "          weight: 10",
      "      retries: { attempts: 3, perTryTimeout: 2s }",
      "      timeout: 10s",
      "      fault:",
      "        delay: { fixedDelay: 1s, percentage: { value: 1 } }",
      "        abort: { httpStatus: 503, percentage: { value: 1 } }",
      "---",
      "apiVersion: networking.istio.io/v1beta1",
      "kind: DestinationRule",
      "metadata:",
      "  name: orders",
      "spec:",
      "  host: orders",
      "  trafficPolicy:",
      "    tls: { mode: ISTIO_MUTUAL }",
      "    loadBalancer: { simple: LEAST_REQUEST }",
      "    connectionPool:",
      "      tcp: { maxConnections: 100 }",
      "      http: { http1MaxPendingRequests: 10, maxRequestsPerConnection: 20 }",
      "    outlierDetection:",
      "      consecutive5xxErrors: 3",
      "  subsets:",
      "    - name: v1",
      "    - name: v2",
      "---",
      "apiVersion: security.istio.io/v1beta1",
      "kind: PeerAuthentication",
      "metadata:",
      "  name: strict-mtls",
      "spec:",
      "  mtls: { mode: STRICT }",
      "---",
      "apiVersion: security.istio.io/v1beta1",
      "kind: PeerAuthentication",
      "metadata:",
      "  name: permissive-mtls",
      "spec:",
      "  mtls: { mode: PERMISSIVE }",
      "---",
      "apiVersion: security.istio.io/v1beta1",
      "kind: AuthorizationPolicy",
      "metadata:",
      "  name: orders-authz",
      "spec:",
      "  action: ALLOW",
      "---",
      "apiVersion: security.istio.io/v1beta1",
      "kind: RequestAuthentication",
      "metadata:",
      "  name: orders-jwt",
      "spec:",
      "  jwtRules:",
      "    - issuer: https://issuer.example",
      "      jwksUri: https://issuer.example/.well-known/jwks.json",
      "---",
      "apiVersion: networking.istio.io/v1beta1",
      "kind: ServiceEntry",
      "metadata:",
      "  name: partner-api",
      "spec:",
      "  hosts: [partner.example.com]",
      "---",
      "apiVersion: telemetry.istio.io/v1alpha1",
      "kind: Telemetry",
      "metadata:",
      "  name: orders-telemetry",
      "spec:",
      "  metrics:",
      "    - providers: [{ name: prometheus }]",
      "  tracing:",
      "    - providers: [{ name: OpenTelemetry }]",
      "  accessLogging:",
      "    - providers: [{ name: envoy-access-logs }]",
      "---",
      "apiVersion: networking.istio.io/v1beta1",
      "kind: EnvoyFilter",
      "metadata:",
      "  name: local-rate-limit",
      "spec:",
      "  configPatches:",
      "    - applyTo: HTTP_FILTER",
      "      patch: { operation: INSERT_BEFORE }",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1",
      "kind: GatewayClass",
      "metadata: { name: istio-gateway-class }",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1",
      "kind: HTTPRoute",
      "metadata: { name: orders-http-route }",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1",
      "kind: GRPCRoute",
      "metadata: { name: orders-grpc-route }",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1alpha2",
      "kind: TCPRoute",
      "metadata: { name: orders-tcp-route }",
      "---",
      "apiVersion: apiextensions.k8s.io/v1",
      "kind: CustomResourceDefinition",
      "metadata: { name: virtualservices.networking.istio.io }",
      "---",
      "apiVersion: v1",
      "kind: Pod",
      "metadata:",
      "  annotations:",
      "    sidecar.istio.io/inject: \"true\"",
      "spec:",
      "  containers:",
      "    - name: istio-proxy",
      "      image: envoyproxy/envoy:v1",
      "    - name: orders",
      "      image: orders:v1",
      "# istiod pilot-discovery xDS ADS CDS EDS RDS LDS SDS discovery service CRD crds",
      "# sidecar injection istio-cni CNI ambient ztunnel waypoint proxy container envoy sidecar",
      "# egress-gateway east-west-gateway mesh gateway api-gateway API Gateway Gateway API",
      "# mTLS STRICT PERMISSIVE SPIFFE spiffe://cluster.local/ns/default/sa/orders SVID identity workload identity TrustDomain",
      "# CA caBundle certificate authority root cert certificate rotation cert-manager SDS",
      "# metrics golden metrics tracing Jaeger Zipkin OpenTelemetry otel Prometheus access logs proxy logs",
      "# multi-cluster multicluster remote cluster east-west cluster link peering mesh federation"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "mesh", "linkerd", "policy.yaml"), [
      "apiVersion: v1",
      "kind: Namespace",
      "metadata:",
      "  name: orders",
      "  annotations:",
      "    linkerd.io/inject: enabled",
      "---",
      "apiVersion: policy.linkerd.io/v1beta1",
      "kind: ServerAuthorization",
      "metadata:",
      "  name: orders-server-authorization",
      "---",
      "apiVersion: policy.linkerd.io/v1alpha1",
      "kind: MeshTLSAuthentication",
      "metadata:",
      "  name: orders-mtls-authentication",
      "---",
      "apiVersion: policy.linkerd.io/v1alpha1",
      "kind: NetworkAuthentication",
      "metadata:",
      "  name: orders-network-authentication",
      "---",
      "apiVersion: split.smi-spec.io/v1alpha2",
      "kind: TrafficSplit",
      "metadata:",
      "  name: orders-split",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1",
      "kind: HTTPRoute",
      "metadata:",
      "  name: linkerd-http-route",
      "---",
      "apiVersion: linkerd.io/v1alpha2",
      "kind: ServiceProfile",
      "metadata:",
      "  name: orders.default.svc.cluster.local",
      "# Linkerd linkerd-proxy linkerd-proxy-injector proxy-injector sidecar injection linkerd inject",
      "# linkerd-identity linkerd-destination linkerd-policy linkerd-tap linkerd-viz linkerd control plane",
      "# linkerd check linkerd viz linkerd tap tap logs viz linkerd diagnostics",
      "# linkerd multicluster cluster link retryBudget golden metrics"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "mesh", "consul", "connect.hcl"), [
      "service {",
      "  name = \"orders\"",
      "  connect {",
      "    sidecar_service {",
      "      proxy {",
      "        config {",
      "          TransparentProxy = true",
      "        }",
      "      }",
      "    }",
      "  }",
      "}",
      "kind = \"service-defaults\"",
      "name = \"orders\"",
      "protocol = \"http\"",
      "kind = \"service-router\"",
      "routes = [{ match = { http = { path_prefix = \"/\" } }, destination = { service = \"orders\" } }]",
      "kind = \"service-splitter\"",
      "splits = [{ weight = 90, service = \"orders\" }, { weight = 10, service = \"orders-canary\" }]",
      "kind = \"service-resolver\"",
      "subsets = { v1 = { filter = \"Service.Meta.version == v1\" } }",
      "kind = \"proxy-defaults\"",
      "config { envoy_prometheus_bind_addr = \"0.0.0.0:9102\" }",
      "kind = \"ingress-gateway\"",
      "kind = \"terminating-gateway\"",
      "kind = \"mesh-gateway\"",
      "kind = \"service-intentions\"",
      "sources = [{ name = \"frontend\", action = \"allow\" }]",
      "# Consul Connect consul server consul-server consul agent intentions TrafficPermissions JWTProvider SamenessGroup sameness_group peering",
      "# Envoy xDS consul envoy PassiveHealthCheck Consecutive5xx circuit breaker rate limit quota"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "service-mesh-readiness.yml"), [
      "name: service mesh smoke",
      "on: [push]",
      "jobs:",
      "  service-mesh:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm mesh-lint && istioctl analyze -A && linkerd check && consul validate",
      "      - run: pnpm proxy-config-smoke && istioctl proxy-config clusters deploy/orders && linkerd diagnostics && consul config read -kind service-defaults -name orders",
      "      - run: pnpm policy-smoke authorization smoke intentions smoke mtls smoke authn authz",
      "      - run: pnpm traffic-smoke curl VirtualService HTTPRoute TrafficSplit route smoke",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            service-mesh-report.json",
      "            mesh-analysis.json",
      "            proxy-config.json",
      "            policy-smoke.json",
      "            traffic-smoke.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "service-mesh-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serviceMeshSetups: Array<{ mesh: string; controlPlaneCount: number; sidecarCount: number; gatewayCount: number; routeCount: number; trafficPolicyCount: number; securityPolicyCount: number; mtlsCount: number; identityCount: number; telemetryCount: number; resilienceCount: number; multiClusterCount: number; ciCount: number }>;
      meshSignals: Array<{ signal: string; readiness: string }>;
      controlPlaneSignals: Array<{ signal: string; readiness: string }>;
      injectionSignals: Array<{ signal: string; readiness: string }>;
      trafficSignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      mtlsSignals: Array<{ signal: string; readiness: string }>;
      resilienceSignals: Array<{ signal: string; readiness: string }>;
      gatewaySignals: Array<{ signal: string; readiness: string }>;
      telemetrySignals: Array<{ signal: string; readiness: string }>;
      multiclusterSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Service mesh readiness Istio Linkerd Consul Envoy Gateway API VirtualService DestinationRule Gateway Sidecar EnvoyFilter PeerAuthentication AuthorizationPolicy RequestAuthentication ServiceEntry HTTPRoute GRPCRoute TrafficSplit ServerAuthorization MeshTLSAuthentication service-defaults service-router service-splitter service-resolver proxy-defaults intentions mTLS SPIFFE telemetry proxy-config CI");
    expect(report.serviceMeshSetups.length).toBeGreaterThan(0);
    expect(report.serviceMeshSetups.map((item) => item.mesh)).toEqual(expect.arrayContaining(["istio", "linkerd", "consul"]));
    expect(report.serviceMeshSetups.some((item) => item.controlPlaneCount > 0 && item.sidecarCount > 0 && item.routeCount > 0 && item.securityPolicyCount > 0 && item.mtlsCount > 0)).toBe(true);
    expect(report.serviceMeshSetups.some((item) => item.gatewayCount > 0 && item.telemetryCount > 0 && item.resilienceCount > 0 && item.multiClusterCount > 0 && item.ciCount > 0)).toBe(true);
    expect(readySignals(report.meshSignals)).toEqual(expect.arrayContaining(["istio", "linkerd", "consul", "gateway-api", "envoy", "custom"]));
    expect(readySignals(report.controlPlaneSignals)).toEqual(expect.arrayContaining(["istiod", "linkerd-control-plane", "consul-server", "proxy-injector", "xds", "crds"]));
    expect(readySignals(report.injectionSignals)).toEqual(expect.arrayContaining(["sidecar-injection", "proxy-container", "transparent-proxy", "cni", "ambient", "waypoint"]));
    expect(readySignals(report.trafficSignals)).toEqual(expect.arrayContaining(["virtual-service", "destination-rule", "gateway-api-route", "traffic-split", "service-router", "service-splitter", "service-resolver", "service-defaults"]));
    expect(readySignals(report.securitySignals)).toEqual(expect.arrayContaining(["peer-authentication", "authorization-policy", "request-authentication", "server-authorization", "mesh-tls-authentication", "network-authentication", "intentions", "jwt-provider"]));
    expect(readySignals(report.mtlsSignals)).toEqual(expect.arrayContaining(["strict-mtls", "permissive-mtls", "spiffe", "identity", "ca", "certificate-rotation"]));
    expect(readySignals(report.resilienceSignals)).toEqual(expect.arrayContaining(["retry", "timeout", "circuit-breaker", "outlier-detection", "fault-injection", "rate-limit"]));
    expect(readySignals(report.gatewaySignals)).toEqual(expect.arrayContaining(["ingress-gateway", "egress-gateway", "mesh-gateway", "terminating-gateway", "api-gateway", "gateway-class"]));
    expect(readySignals(report.telemetrySignals)).toEqual(expect.arrayContaining(["telemetry-api", "metrics", "tracing", "access-logs", "prometheus", "tap", "viz"]));
    expect(readySignals(report.multiclusterSignals)).toEqual(expect.arrayContaining(["multi-cluster", "service-entry", "east-west-gateway", "cluster-link", "sameness-group", "peering"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "mesh-lint", "proxy-config-smoke", "policy-smoke", "traffic-smoke", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["istio", "linkerd", "consul", "envoy", "gateway-api", "helm-chart"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"VirtualService|DestinationRule|Gateway|Sidecar|EnvoyFilter|PeerAuthentication|AuthorizationPolicy|RequestAuthentication|ServiceEntry|Telemetry\" .",
      "rg \"linkerd.io|ServerAuthorization|MeshTLSAuthentication|NetworkAuthentication|HTTPRoute|GRPCRoute|TrafficSplit|ServiceProfile|linkerd inject|linkerd check|linkerd viz\" .",
      "rg \"service-defaults|service-router|service-splitter|service-resolver|proxy-defaults|ingress-gateway|terminating-gateway|mesh-gateway|sidecar_service|intentions|connect\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "service-mesh-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "service-mesh-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "service-mesh-readiness.html"))).resolves.toBeUndefined();
    const serviceMeshMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "service-mesh-readiness.md"), "utf8");
    expect(serviceMeshMarkdown).toContain("Mesh Signals");
    expect(serviceMeshMarkdown).toContain("Traffic Signals");
    expect(serviceMeshMarkdown).toContain("Security Signals");
    expect(serviceMeshMarkdown).toContain("mTLS Signals");
    const serviceMeshHtml = await fs.readFile(path.join(result.session.outputPaths.html, "service-mesh-readiness.html"), "utf8");
    expect(serviceMeshHtml).toContain("service-mesh-readiness-card");
    expect(serviceMeshHtml).toContain("data-source-pattern=\"ServiceMesh\"");
  });

  it("detects ingress controller readiness without running ingress controllers or cluster commands", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-ingress-controller-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-ingress-controller-source-"));
    await fs.mkdir(path.join(sourceRoot, "ingress-nginx"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "traefik"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "envoy-gateway"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "charts", "ingress"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "ingress-nginx": "^1.13.0",
        traefik: "^3.6.0",
        "envoy-gateway": "^1.6.0",
        "gateway-api": "^1.3.0",
        "cert-manager": "^1.16.0"
      },
      scripts: {
        "ingress:render": "helm template ingress ./charts/ingress",
        "ingress:validate": "kubeconform -summary manifests && kubectl apply --dry-run=server -f manifests",
        "ingress:lint": "kubectl ingress-nginx lint --all-namespaces --verbose",
        "ingress:smoke": "pnpm route-smoke curl Ingress HTTPRoute IngressRoute"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "charts", "ingress", "Chart.yaml"), [
      "apiVersion: v2",
      "name: ingress-controller-readiness",
      "description: Helm chart for ingress-nginx Traefik Envoy Gateway Gateway API cert-manager readiness",
      "type: application",
      "version: 0.1.0",
      "dependencies:",
      "  - name: ingress-nginx",
      "    repository: https://kubernetes.github.io/ingress-nginx",
      "    version: 4.13.0",
      "  - name: traefik",
      "    repository: https://traefik.github.io/charts",
      "    version: 36.3.0",
      "  - name: envoy-gateway",
      "    repository: oci://docker.io/envoyproxy",
      "    version: 1.6.0",
      "  - name: cert-manager",
      "    repository: https://charts.jetstack.io",
      "    version: 1.16.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "ingress-nginx", "app-ingress.yaml"), [
      "apiVersion: networking.k8s.io/v1",
      "kind: IngressClass",
      "metadata:",
      "  name: nginx",
      "  annotations:",
      "    ingressclass.kubernetes.io/is-default-class: \"true\"",
      "    kubernetes.io/ingress.class: nginx",
      "spec:",
      "  controller: k8s.io/ingress-nginx",
      "  parametersRef:",
      "    apiGroup: k8s.nginx.org",
      "    kind: IngressClassParameters",
      "    name: nginx-params",
      "# controllerClass default-class class-annotation parametersRef NGINX Ingress custom ingress controller",
      "---",
      "apiVersion: v1",
      "kind: Service",
      "metadata:",
      "  name: ingress-nginx-controller",
      "  annotations:",
      "    external-dns.alpha.kubernetes.io/hostname: app.example.com",
      "    service.beta.kubernetes.io/aws-load-balancer-type: nlb",
      "spec:",
      "  type: LoadBalancer",
      "  loadBalancerIP: 203.0.113.10",
      "  externalIPs: [203.0.113.11]",
      "  ports:",
      "    - port: 443",
      "      nodePort: 30443",
      "---",
      "apiVersion: v1",
      "kind: Service",
      "metadata:",
      "  name: ingress-nginx-nodeport",
      "spec:",
      "  type: NodePort",
      "  ports:",
      "    - port: 80",
      "      nodePort: 30080",
      "---",
      "apiVersion: networking.k8s.io/v1",
      "kind: Ingress",
      "metadata:",
      "  name: app",
      "  annotations:",
      "    nginx.ingress.kubernetes.io/rewrite-target: /",
      "    nginx.ingress.kubernetes.io/proxy-body-size: 8m",
      "    nginx.ingress.kubernetes.io/auth-url: https://auth.example.com/verify",
      "    nginx.ingress.kubernetes.io/enable-cors: \"true\"",
      "    nginx.ingress.kubernetes.io/limit-rps: \"20\"",
      "    nginx.ingress.kubernetes.io/limit-connections: \"4\"",
      "    nginx.ingress.kubernetes.io/configuration-snippet: modsecurity on;",
      "    nginx.ingress.kubernetes.io/canary: \"true\"",
      "    nginx.ingress.kubernetes.io/canary-weight: \"10\"",
      "    nginx.ingress.kubernetes.io/backend-protocol: HTTPS",
      "    external-dns.alpha.kubernetes.io/hostname: app.example.com",
      "    cert-manager.io/cluster-issuer: letsencrypt-prod",
      "    nginx.ingress.kubernetes.io/enable-modsecurity: \"true\"",
      "spec:",
      "  ingressClassName: nginx",
      "  rules:",
      "    - host: app.example.com",
      "      http:",
      "        paths:",
      "          - path: /",
      "            pathType: Prefix",
      "            backend:",
      "              service:",
      "                name: app",
      "                port: { number: 8443 }",
      "  tls:",
      "    - secretName: app-tls-secret",
      "      hosts: [app.example.com]",
      "status:",
      "  loadBalancer:",
      "    ingress:",
      "      - ip: 203.0.113.10",
      "---",
      "apiVersion: admissionregistration.k8s.io/v1",
      "kind: ValidatingWebhookConfiguration",
      "metadata:",
      "  name: ingress-nginx-admission",
      "---",
      "apiVersion: apiextensions.k8s.io/v1",
      "kind: CustomResourceDefinition",
      "metadata:",
      "  name: ingressclassparameters.k8s.nginx.org",
      "# kube-webhook-certgen admission controller validating webhook CustomResourceDefinition CRD",
      "# status update status publisher publish-status-address status.loadBalancer LoadBalancer Ingress",
      "# kubectl ingress-nginx lint ingress lint kubectl ingress-nginx backends certs conf ingresses logs",
      "# metrics Prometheus access logs tracing events dashboard WAF web application firewall ModSecurity",
      "# retry timeout healthCheck sticky affinity circuitBreaker weight: canary backend TLS backendProtocol: HTTPS"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "traefik", "route.yaml"), [
      "apiVersion: networking.k8s.io/v1",
      "kind: IngressClass",
      "metadata:",
      "  name: traefik",
      "spec:",
      "  controller: traefik.io/ingress-controller",
      "---",
      "apiVersion: traefik.io/v1alpha1",
      "kind: IngressRoute",
      "metadata:",
      "  name: app",
      "spec:",
      "  entryPoints: [websecure]",
      "  routes:",
      "    - match: Host(`app.example.com`) && PathPrefix(`/api`)",
      "      kind: Rule",
      "      middlewares:",
      "        - name: auth-chain",
      "      services:",
      "        - name: app-weighted",
      "          port: 80",
      "          weight: 90",
      "  tls:",
      "    secretName: app-traefik-tls",
      "    options:",
      "      name: modern-tls",
      "    store:",
      "      name: default",
      "---",
      "apiVersion: traefik.io/v1alpha1",
      "kind: Middleware",
      "metadata:",
      "  name: auth-chain",
      "spec:",
      "  forwardAuth:",
      "    address: https://auth.example.com",
      "  basicAuth:",
      "    secret: basic-auth",
      "  headers:",
      "    accessControlAllowMethods: [GET, POST, OPTIONS]",
      "    customRequestHeaders:",
      "      X-Forwarded-Proto: https",
      "  rateLimit:",
      "    average: 20",
      "  stripPrefix:",
      "    prefixes: [/api]",
      "  ipAllowList:",
      "    sourceRange: [10.0.0.0/8]",
      "---",
      "apiVersion: traefik.io/v1alpha1",
      "kind: TraefikService",
      "metadata:",
      "  name: app-weighted",
      "spec:",
      "  weighted:",
      "    services:",
      "      - name: app-v1",
      "        weight: 90",
      "      - name: app-v2",
      "        weight: 10",
      "    sticky:",
      "      cookie:",
      "        name: sticky-session",
      "  healthCheck:",
      "    path: /healthz",
      "---",
      "apiVersion: traefik.io/v1alpha1",
      "kind: TLSOption",
      "metadata: { name: modern-tls }",
      "---",
      "apiVersion: traefik.io/v1alpha1",
      "kind: TLSStore",
      "metadata: { name: default }",
      "---",
      "apiVersion: traefik.io/v1alpha1",
      "kind: ServersTransport",
      "metadata: { name: app-backend-tls }",
      "# certificatesResolvers ACME Let's Encrypt tlsChallenge httpChallenge acme.json",
      "# CORS headers forwardAuth basicAuth rateLimit IPAllowList retry timeout circuitBreaker dashboard accesslog access logs",
      "# prometheus metrics tracing OpenTelemetry events PassiveHealthCheck service.serverstransport backend TLS"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "envoy-gateway", "gateway.yaml"), [
      "apiVersion: gateway.networking.k8s.io/v1",
      "kind: GatewayClass",
      "metadata:",
      "  name: envoy-gateway-class",
      "spec:",
      "  controllerName: gateway.envoyproxy.io/gatewayclass-controller",
      "  parametersRef:",
      "    group: gateway.envoyproxy.io",
      "    kind: EnvoyProxy",
      "    name: edge-proxy",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1",
      "kind: Gateway",
      "metadata: { name: edge-gateway }",
      "spec:",
      "  gatewayClassName: envoy-gateway-class",
      "  listeners:",
      "    - name: https",
      "      protocol: HTTPS",
      "      port: 443",
      "      tls:",
      "        certificateRefs:",
      "          - name: edge-tls-secret",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1",
      "kind: HTTPRoute",
      "metadata: { name: app-http-route }",
      "spec:",
      "  hostnames: [app.example.com]",
      "  rules:",
      "    - matches:",
      "        - path: { type: PathPrefix, value: / }",
      "      backendRefs:",
      "        - name: app",
      "          port: 80",
      "          weight: 90",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1",
      "kind: GRPCRoute",
      "metadata: { name: app-grpc-route }",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1alpha2",
      "kind: TCPRoute",
      "metadata: { name: app-tcp-route }",
      "---",
      "apiVersion: gateway.envoyproxy.io/v1alpha1",
      "kind: BackendTrafficPolicy",
      "metadata: { name: app-backend-traffic }",
      "spec:",
      "  rateLimit: { global: { rules: [] } }",
      "  retry: { numRetries: 3 }",
      "  timeout: { http: { requestTimeout: 10s } }",
      "---",
      "apiVersion: gateway.envoyproxy.io/v1alpha1",
      "kind: ClientTrafficPolicy",
      "metadata: { name: app-client-traffic }",
      "---",
      "apiVersion: gateway.envoyproxy.io/v1alpha1",
      "kind: SecurityPolicy",
      "metadata: { name: app-security }",
      "spec:",
      "  oidc:",
      "    provider: { issuer: https://issuer.example.com }",
      "  jwt:",
      "    providers: [{ name: jwt-provider }]",
      "---",
      "apiVersion: gateway.envoyproxy.io/v1alpha1",
      "kind: EnvoyPatchPolicy",
      "metadata: { name: app-patch }",
      "---",
      "apiVersion: gateway.envoyproxy.io/v1alpha1",
      "kind: ExtensionPolicy",
      "metadata: { name: app-extension }",
      "---",
      "apiVersion: gateway.envoyproxy.io/v1alpha1",
      "kind: EnvoyProxy",
      "metadata: { name: edge-proxy }",
      "---",
      "apiVersion: gateway.networking.k8s.io/v1alpha3",
      "kind: BackendTLSPolicy",
      "metadata: { name: app-backend-tls }",
      "---",
      "apiVersion: cert-manager.io/v1",
      "kind: ClusterIssuer",
      "metadata: { name: letsencrypt-prod }",
      "spec:",
      "  acme:",
      "    server: https://acme-v02.api.letsencrypt.org/directory",
      "# Envoy Gateway Gateway API xDS Prometheus access logs tracing metrics dashboard events",
      "# LoadBalancer NodePort external-dns cert-manager ClusterIssuer ACME",
      "# OIDC JWT OAuth Authorization authPolicy IPAllowList allowlist denylist WAF",
      "# healthCheck PassiveHealthCheck circuitBreaker Consecutive5xx sticky sessionAffinity canary"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "ingress-controller-readiness.yml"), [
      "name: ingress controller smoke",
      "on: [push]",
      "jobs:",
      "  ingress-controller:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: helm template ingress ./charts/ingress && helm lint ./charts/ingress",
      "      - run: kubeconform -summary manifests && kubectl apply --dry-run=server -f manifests",
      "      - run: ingress-lint manifests && kubectl ingress-nginx lint --all-namespaces --verbose && gateway lint manifests",
      "      - run: pnpm route-smoke curl Ingress HTTPRoute IngressRoute && pnpm gateway-smoke",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            ingress-controller-report.json",
      "            ingress-analysis.json",
      "            route-smoke.json",
      "            gateway-smoke.json",
      "            admission-report.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "ingress-controller-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      ingressControllerSetups: Array<{ controller: string; controllerCount: number; ingressClassCount: number; routeCount: number; serviceExposureCount: number; tlsCount: number; middlewareCount: number; policyCount: number; loadBalancingCount: number; observabilityCount: number; admissionCount: number; ciCount: number }>;
      controllerSignals: Array<{ signal: string; readiness: string }>;
      ingressClassSignals: Array<{ signal: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      serviceExposureSignals: Array<{ signal: string; readiness: string }>;
      tlsSignals: Array<{ signal: string; readiness: string }>;
      middlewareSignals: Array<{ signal: string; readiness: string }>;
      policySignals: Array<{ signal: string; readiness: string }>;
      loadBalancingSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      admissionSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Ingress controller readiness ingress-nginx Traefik Envoy Gateway IngressClass IngressRoute Middleware GatewayClass Gateway HTTPRoute GRPCRoute BackendTrafficPolicy SecurityPolicy ClientTrafficPolicy TLSOption TLSStore LoadBalancer NodePort admission webhook cert-manager Prometheus access logs rate limit CI");
    expect(report.ingressControllerSetups.length).toBeGreaterThan(0);
    expect(report.ingressControllerSetups.map((item) => item.controller)).toEqual(expect.arrayContaining(["ingress-nginx", "traefik", "envoy-gateway"]));
    expect(report.ingressControllerSetups.some((item) => item.controllerCount > 0 && item.ingressClassCount > 0 && item.routeCount > 0 && item.serviceExposureCount > 0 && item.tlsCount > 0)).toBe(true);
    expect(report.ingressControllerSetups.some((item) => item.middlewareCount > 0 && item.policyCount > 0 && item.loadBalancingCount > 0 && item.observabilityCount > 0 && item.admissionCount > 0 && item.ciCount > 0)).toBe(true);
    expect(readySignals(report.controllerSignals)).toEqual(expect.arrayContaining(["ingress-nginx", "traefik", "envoy-gateway", "gateway-api", "nginx", "custom"]));
    expect(readySignals(report.ingressClassSignals)).toEqual(expect.arrayContaining(["ingress-class", "controller-class", "gateway-class", "default-class", "class-annotation", "parameters-ref"]));
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["kubernetes-ingress", "ingress-rule", "path-rule", "ingressroute", "httproute", "grpcroute", "tcproute", "tls-route"]));
    expect(readySignals(report.serviceExposureSignals)).toEqual(expect.arrayContaining(["loadbalancer-service", "nodeport-service", "external-ip", "external-dns", "ingress-status", "load-balancer-ip"]));
    expect(readySignals(report.tlsSignals)).toEqual(expect.arrayContaining(["tls-secret", "cert-manager", "cluster-issuer", "acme", "tls-option", "tls-store", "backend-tls"]));
    expect(readySignals(report.middlewareSignals)).toEqual(expect.arrayContaining(["traefik-middleware", "rewrite-target", "headers", "forward-auth", "rate-limit", "cors", "modsecurity", "waf"]));
    expect(readySignals(report.policySignals)).toEqual(expect.arrayContaining(["backend-traffic-policy", "client-traffic-policy", "security-policy", "envoy-patch-policy", "extension-policy", "ip-allowlist", "auth-policy"]));
    expect(readySignals(report.loadBalancingSignals)).toEqual(expect.arrayContaining(["service-weight", "sticky-session", "health-check", "circuit-breaker", "retry", "timeout", "canary"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["metrics", "prometheus", "access-logs", "tracing", "dashboard", "events", "kubectl-plugin"]));
    expect(readySignals(report.admissionSignals)).toEqual(expect.arrayContaining(["validating-webhook", "admission-controller", "webhook-certgen", "crd", "status-update", "lint"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "helm-template", "kubeconform", "kubectl-dry-run", "ingress-lint", "route-smoke", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["ingress-nginx", "traefik", "envoy-gateway", "gateway-api", "helm-chart", "cert-manager"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"IngressClass|kind: Ingress|ingressClassName|nginx.ingress.kubernetes.io|ingress-nginx\" .",
      "rg \"IngressRoute|Middleware|TraefikService|TLSOption|TLSStore|ServersTransport|entryPoints|certificatesResolvers\" .",
      "rg \"GatewayClass|Gateway|HTTPRoute|GRPCRoute|BackendTrafficPolicy|ClientTrafficPolicy|SecurityPolicy|EnvoyProxy\" .",
      "rg \"LoadBalancer|NodePort|external-dns|cert-manager|ClusterIssuer|ACME|Prometheus|access logs|rateLimit|modsecurity\" .",
      "rg \"helm template|kubeconform|kubectl.*dry-run|ingress lint|route-smoke|upload-artifact\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "ingress-controller-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "ingress-controller-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "ingress-controller-readiness.html"))).resolves.toBeUndefined();
    const ingressControllerMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "ingress-controller-readiness.md"), "utf8");
    expect(ingressControllerMarkdown).toContain("Controller Signals");
    expect(ingressControllerMarkdown).toContain("Route Signals");
    expect(ingressControllerMarkdown).toContain("Admission Signals");
    const ingressControllerHtml = await fs.readFile(path.join(result.session.outputPaths.html, "ingress-controller-readiness.html"), "utf8");
    expect(ingressControllerHtml).toContain("ingress-controller-readiness-card");
    expect(ingressControllerHtml).toContain("data-source-pattern=\"IngressController\"");
  });

  it("detects DNS readiness without querying resolvers or mutating DNS providers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dns-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dns-source-"));
    await fs.mkdir(path.join(sourceRoot, "external-dns"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "coredns"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "octodns"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "zones"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "external-dns": "^0.15.0",
        coredns: "^1.12.0",
        octodns: "^1.12.0",
        "octodns-route53": "^0.0.8",
        "octodns-cloudflare": "^0.0.6",
        "google-cloud-dns": "^1.0.0",
        "PowerDnsProvider": "^1.0.0"
      },
      scripts: {
        "dns:dry-run": "external-dns --source=service --source=ingress --source=gateway --source=crd --provider=aws --domain-filter=example.com --zone-id-filter=Z123 --registry=txt --txt-owner-id=cluster-a --policy=upsert-only --once --dry-run",
        "dns:plan": "octodns-sync --config-file=octodns/config.yaml # octodns plan provider plan",
        "dns:validate": "octodns-validate --config-file=octodns/config.yaml && coredns -conf coredns/Corefile -dns.port=1053",
        "dns:smoke": "dig app.example.com A +short && drill api.example.com && nslookup api.example.com"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "external-dns", "deployment.yaml"), [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata: { name: external-dns }",
      "spec:",
      "  template:",
      "    metadata:",
      "      annotations:",
      "        external-dns.kubernetes.io/hostname: app.example.com",
      "        external-dns.alpha.kubernetes.io/ttl: \"60\"",
      "        external-dns.alpha.kubernetes.io/internal-hostname: app.internal.example.com",
      "    spec:",
      "      containers:",
      "        - name: external-dns",
      "          args:",
      "            - --source=service",
      "            - --source=ingress",
      "            - --source=gateway",
      "            - --source=crd",
      "            - --source=node",
      "            - --source=endpointslice",
      "            - --provider=aws",
      "            - --provider=cloudflare",
      "            - --provider=azure",
      "            - --domain-filter=example.com",
      "            - --zone-id-filter=Z123",
      "            - --aws-zone-type=public",
      "            - --registry=txt",
      "            - --txt-owner-id=cluster-a",
      "            - --txt-prefix=%{record_type}-",
      "            - --txt-suffix=-owner",
      "            - --txt-encrypt-enabled",
      "            - --policy=sync",
      "            - --policy=upsert-only",
      "            - --dry-run",
      "            - --managed-record-types=A",
      "            - --managed-record-types=TXT",
      "---",
      "apiVersion: externaldns.k8s.io/v1alpha1",
      "kind: DNSEndpoint",
      "metadata: { name: app-record }",
      "---",
      "apiVersion: discovery.k8s.io/v1",
      "kind: EndpointSlice",
      "metadata: { name: app-slice }",
      "# Azure DNS AzureProvider Google Cloud DNS GoogleProvider CloudDNS custom DNS provider",
      "# public zone private zone split-horizon reverse zone SOA serial TXT registry migration shared zone deletion risk",
      "# metrics Prometheus logs errors health ready Kubernetes Events Normal UPDATE dig smoke"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "coredns", "Corefile"), [
      ".:53 {",
      "  errors",
      "  log",
      "  health :8080",
      "  ready",
      "  prometheus :9153",
      "  kubernetes cluster.local in-addr.arpa ip6.arpa {",
      "    pods insecure",
      "    fallthrough in-addr.arpa ip6.arpa",
      "  }",
      "  forward . 1.1.1.1 8.8.8.8",
      "  cache 30",
      "  rewrite name regex (.*)\\.svc\\.example\\.com {1}.default.svc.cluster.local",
      "  template IN A app.example.com { answer \"{{ .Name }} 60 IN A 192.0.2.10\" }",
      "  reload",
      "}",
      "example.org:1053 {",
      "  file /zones/example.org.zone",
      "  transfer to *",
      "  prometheus",
      "  errors",
      "  log",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "zones", "example.org.zone"), [
      "$ORIGIN example.org.",
      "@ 3600 IN SOA ns1.example.org. hostmaster.example.org. 2026060501 7200 3600 1209600 3600",
      "@ 3600 IN NS ns1.example.org.",
      "app 60 IN A 192.0.2.10",
      "app 60 IN AAAA 2001:db8::10",
      "api 60 IN CNAME app.example.org.",
      "@ 60 IN TXT \"owner=cluster-a\"",
      "@ 60 IN MX 10 mail.example.org.",
      "_sip._tcp 60 IN SRV 10 10 5060 sip.example.org.",
      "@ 60 IN CAA 0 issue \"letsencrypt.org\"",
      "alias 60 IN ALIAS app.example.org.",
      "10.2.0.192.in-addr.arpa. 60 IN PTR app.example.org."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "octodns", "config.yaml"), [
      "manager:",
      "  max_workers: 2",
      "processors:",
      "  keep_safe:",
      "    class: octodns.processor.filter.NameAllowlistFilter",
      "providers:",
      "  config:",
      "    class: octodns.provider.yaml.YamlProvider",
      "    directory: ./octodns",
      "  route53:",
      "    class: octodns_route53.Route53Provider",
      "  cloudflare:",
      "    class: octodns_cloudflare.CloudflareProvider",
      "  google:",
      "    class: octodns_googlecloud.GoogleCloudProvider # GoogleProvider google-cloud-dns",
      "zones:",
      "  example.com.:",
      "    sources:",
      "      - config",
      "    targets:",
      "      - route53",
      "      - cloudflare",
      "      - google",
      "  \"*.example.net.\":",
      "    sources: [config]",
      "    targets: [route53]",
      "# dynamic zone list_zones dynamic entry provider plan record validation"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "octodns", "example.com.yaml"), [
      "app:",
      "  type: A",
      "  value: 192.0.2.10",
      "app6:",
      "  type: AAAA",
      "  value: 2001:db8::10",
      "api:",
      "  type: CNAME",
      "  value: app.example.com.",
      "txt:",
      "  type: TXT",
      "  value: owner=cluster-a",
      "mail:",
      "  type: MX",
      "  values:",
      "    - preference: 10",
      "      exchange: mail.example.com.",
      "ns:",
      "  type: NS",
      "  values: [ns1.example.com.]",
      "_sip._tcp:",
      "  type: SRV",
      "  values:",
      "    - priority: 10",
      "      weight: 10",
      "      port: 5060",
      "      target: sip.example.com.",
      "caa:",
      "  type: CAA",
      "  value:",
      "    tag: issue",
      "    value: letsencrypt.org",
      "alias:",
      "  type: ALIAS",
      "  value: app.example.com.",
      "ptr:",
      "  type: PTR",
      "  value: app.example.com."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "dns-readiness.yml"), [
      "name: dns readiness",
      "on: [push]",
      "jobs:",
      "  dns:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: external-dns --source=service --once --dry-run",
      "      - run: octodns-validate --config-file=octodns/config.yaml",
      "      - run: octodns-sync --config-file=octodns/config.yaml",
      "      - run: coredns -conf coredns/Corefile -dns.port=1053",
      "      - run: dig app.example.com A +short && drill app.example.com && nslookup api.example.com # dns smoke",
      "      - run: provider-plan > dns-plan.json && echo '{}' > dns-readiness-report.json && echo '{}' > dig-smoke.json && echo '{}' > coredns-check.json",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            dns-readiness-report.json",
      "            dns-plan.json",
      "            dig-smoke.json",
      "            coredns-check.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "dns-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dnsSetups: Array<{ platform: string; sourceCount: number; providerCount: number; zoneCount: number; recordCount: number; ownershipCount: number; policyCount: number; coreDnsCount: number; automationCount: number; observabilityCount: number; ciCount: number }>;
      providerSignals: Array<{ signal: string; readiness: string }>;
      sourceSignals: Array<{ signal: string; readiness: string }>;
      zoneSignals: Array<{ signal: string; readiness: string }>;
      recordSignals: Array<{ signal: string; readiness: string }>;
      ownershipSignals: Array<{ signal: string; readiness: string }>;
      coreDnsSignals: Array<{ signal: string; readiness: string }>;
      automationSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("DNS readiness ExternalDNS CoreDNS octoDNS Route53 Cloudflare Google Cloud DNS Azure DNS source provider zone record TXT registry Corefile forward cache kubernetes plugin octodns-sync dry-run dig");
    expect(report.dnsSetups.length).toBeGreaterThan(0);
    expect(report.dnsSetups.map((item) => item.platform)).toEqual(expect.arrayContaining(["external-dns", "coredns", "octodns"]));
    expect(report.dnsSetups.some((item) => item.sourceCount > 0 && item.providerCount > 0 && item.zoneCount > 0 && item.recordCount > 0 && item.ownershipCount > 0 && item.policyCount > 0)).toBe(true);
    expect(report.dnsSetups.some((item) => item.coreDnsCount > 0 && item.automationCount > 0 && item.observabilityCount > 0 && item.ciCount > 0)).toBe(true);
    expect(readySignals(report.providerSignals)).toEqual(expect.arrayContaining(["external-dns", "route53", "cloudflare", "google-cloud-dns", "azure-dns", "octodns", "coredns", "custom"]));
    expect(readySignals(report.sourceSignals)).toEqual(expect.arrayContaining(["service", "ingress", "gateway", "dnsendpoint-crd", "endpoint-slice", "node", "file-zone", "yaml-provider", "dynamic-zone"]));
    expect(readySignals(report.zoneSignals)).toEqual(expect.arrayContaining(["domain-filter", "zone-id-filter", "managed-zone", "public-private-zone", "reverse-zone", "split-horizon", "soa-serial"]));
    expect(readySignals(report.recordSignals)).toEqual(expect.arrayContaining(["a", "aaaa", "cname", "txt", "mx", "ns", "srv", "caa", "alias", "ptr"]));
    expect(readySignals(report.ownershipSignals)).toEqual(expect.arrayContaining(["txt-registry", "txt-owner-id", "txt-prefix-suffix", "txt-encryption", "policy-sync", "upsert-only", "dry-run"]));
    expect(readySignals(report.coreDnsSignals)).toEqual(expect.arrayContaining(["corefile", "forward", "cache", "kubernetes-plugin", "rewrite", "template", "health", "ready", "prometheus", "reload"]));
    expect(readySignals(report.automationSignals)).toEqual(expect.arrayContaining(["octodns-sync", "octodns-plan", "providers-config", "sources-targets", "record-validation", "processors", "ci"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["metrics", "prometheus", "logs", "errors", "health", "ready", "events", "dig-smoke"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "external-dns-dry-run", "octodns-validate", "coredns-check", "dig-smoke", "artifact-upload", "provider-plan"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["external-dns", "coredns", "octodns", "route53", "cloudflare", "google-cloud-dns"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"external-dns|--source=|--provider=|--domain-filter|--txt-owner-id|--registry=txt|external-dns.kubernetes.io\" .",
      "rg \"Corefile|forward|cache|kubernetes|rewrite|template|health|ready|prometheus|reload|errors|log\" .",
      "rg \"octodns-sync|octodns-validate|YamlProvider|Route53Provider|CloudflareProvider|sources:|targets:|zones:\" .",
      "rg \"type: (A|AAAA|CNAME|TXT|MX|NS|SRV|CAA|ALIAS|PTR)|SOA|serial|split-horizon|public|private\" .",
      "rg \"dig |drill |nslookup|dns smoke|dns-plan|provider-plan|upload-artifact|dry-run\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "dns-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "dns-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "dns-readiness.html"))).resolves.toBeUndefined();
    const dnsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "dns-readiness.md"), "utf8");
    expect(dnsMarkdown).toContain("Provider Signals");
    expect(dnsMarkdown).toContain("CoreDNS Signals");
    expect(dnsMarkdown).toContain("Ownership Signals");
    const dnsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "dns-readiness.html"), "utf8");
    expect(dnsHtml).toContain("dns-readiness-card");
    expect(dnsHtml).toContain("data-source-pattern=\"DNS\"");
  });

  it("detects certificate readiness without requesting certificates or contacting CA servers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-certificate-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-certificate-source-"));
    await fs.mkdir(path.join(sourceRoot, "cert-manager"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "step-ca"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "certmagic"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "cert-manager": "^1.16.0",
        "github.com/smallstep/certificates": "^0.29.0",
        "github.com/caddyserver/certmagic": "^0.24.0",
        "github.com/go-acme/lego": "^4.20.0",
        "crypto/x509": "^1.0.0",
        openssl: "^3.0.0"
      },
      scripts: {
        "cert:render": "helm template cert-manager ./cert-manager && kubeconform -summary cert-manager",
        "cert:check": "cmctl check api && cmctl status certificate app-tls",
        "step:smoke": "step ca certificate app.example.com app.crt app.key && step ca renew app.crt app.key && step ca revoke app.crt",
        "certmagic:test": "go test ./... # certmagic test ManageSync"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "cert-manager", "certificates.yaml"), [
      "apiVersion: cert-manager.io/v1",
      "kind: ClusterIssuer",
      "metadata: { name: letsencrypt-prod }",
      "spec:",
      "  acme:",
      "    server: https://acme-v02.api.letsencrypt.org/directory",
      "    email: ops@example.com",
      "    externalAccountBinding:",
      "      keyID: eab-key",
      "    solvers:",
      "      - dns01:",
      "          cloudflare:",
      "            apiTokenSecretRef: { name: cloudflare-token, key: token }",
      "      - http01:",
      "          ingress: { class: nginx }",
      "      - tls-alpn-01: {}",
      "  ca: { secretName: root-ca }",
      "  selfSigned: {}",
      "  vault: { path: pki/sign/example-dot-com }",
      "---",
      "apiVersion: cert-manager.io/v1",
      "kind: Issuer",
      "metadata: { name: step-ca-issuer }",
      "spec: { external: { group: certmanager.step.sm, kind: StepIssuer, name: step-ca } }",
      "---",
      "apiVersion: cert-manager.io/v1",
      "kind: Certificate",
      "metadata: { name: app-tls }",
      "spec:",
      "  secretName: app-tls-secret",
      "  duration: 2160h",
      "  renewBefore: 360h",
      "  revisionHistoryLimit: 3",
      "  issuerRef: { name: letsencrypt-prod, kind: ClusterIssuer }",
      "  dnsNames: [app.example.com]",
      "  privateKey:",
      "    algorithm: ECDSA",
      "    size: 256",
      "    rotationPolicy: Always",
      "  keystores:",
      "    pkcs12: { create: true }",
      "    jks: { create: true }",
      "  status:",
      "    conditions:",
      "      - type: Ready",
      "        status: \"True\"",
      "        reason: CertificateReady",
      "---",
      "kind: CertificateRequest",
      "metadata: { name: app-tls-request }",
      "---",
      "kind: Order",
      "metadata: { name: app-order }",
      "---",
      "kind: Challenge",
      "metadata: { name: app-dns01 }",
      "---",
      "kind: CertificateSigningRequest",
      "metadata: { name: app-csr }",
      "---",
      "kind: Secret",
      "metadata: { name: app-tls-secret }",
      "data: { tls.crt: redacted, tls.key: redacted, ca.crt: redacted }",
      "---",
      "kind: Ingress",
      "metadata:",
      "  annotations:",
      "    cert-manager.io/cluster-issuer: letsencrypt-prod",
      "# DNS01 Self Check recursive nameserver --dns01-recursive-nameservers",
      "# cainjector inject-ca caBundle trust-manager root CA intermediate bootstrap install root",
      "# CRL OCSP revoke short-lived passive revocation must-staple",
      "# metrics Prometheus events logs health webhook readiness expiration alert approver-policy",
      "# github-actions helm template kubeconform cmctl step-ca smoke certmagic test upload-artifact certificate-readiness-report.json"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "step-ca", "ca-config.yaml"), [
      "step-ca:",
      "  provisioners:",
      "    - type: ACME",
      "      name: acme",
      "    - type: JWK",
      "      name: deployer",
      "    - type: OIDC",
      "      name: oidc",
      "  root: root certificate root CA",
      "  intermediate: online intermediate CA",
      "  database: postgres",
      "  authority:",
      "    claims:",
      "      defaultTLSCertDuration: 24h",
      "      maxTLSCertDuration: 24h",
      "  revocation: CRL OCSP revoke passive revocation short-lived certificates",
      "  bootstrap: step ca bootstrap",
      "  installRoot: step certificate install root",
      "  renew: step ca renew app.crt app.key",
      "  health: health ready metrics Prometheus Web Admin UI history issuance"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "certmagic", "automation.go"), [
      "package certs",
      "import (",
      "  \"crypto/x509\"",
      "  \"github.com/caddyserver/certmagic\"",
      ")",
      "func configure() {",
      "  _ = x509.Certificate{}",
      "  cfg := certmagic.NewDefault()",
      "  cfg.Storage = certmagic.FileStorage{Path: \"./certs\"}",
      "  cfg.OnDemand = &certmagic.OnDemandConfig{}",
      "  cfg.MustStaple = true",
      "  cfg.ManageSync(nil, []string{\"app.example.com\"})",
      "  cfg.ManageAsync(nil, []string{\"api.example.com\"})",
      "  // certificate cache certCache cacheCertificate OCSP OCSPCheckInterval issuer Storage ACME lego TLS-ALPN-01",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "certificate-readiness.yml"), [
      "name: certificate readiness",
      "on: [push]",
      "jobs:",
      "  certificates:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: helm template cert-manager ./cert-manager && helm lint ./cert-manager",
      "      - run: kubeconform -summary cert-manager && kubectl apply --dry-run=server -f cert-manager",
      "      - run: cmctl check api && cmctl status certificate app-tls && cmctl inspect secret app-tls-secret",
      "      - run: step ca certificate app.example.com app.crt app.key && step ca renew app.crt app.key && step ca revoke app.crt",
      "      - run: go test ./... # certmagic test",
      "      - run: openssl x509 -in app.crt -noout -dates && echo '{}' > certificate-readiness-report.json && echo '{}' > certificate-smoke.json && echo '{}' > issuer-check.json && echo '{}' > renewal-check.json",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            certificate-readiness-report.json",
      "            certificate-smoke.json",
      "            issuer-check.json",
      "            renewal-check.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "certificate-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      certificateSetups: Array<{ platform: string; resourceCount: number; issuerCount: number; challengeCount: number; renewalCount: number; secretCount: number; keyCount: number; trustCount: number; revocationCount: number; observabilityCount: number; ciCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      resourceSignals: Array<{ signal: string; readiness: string }>;
      issuerSignals: Array<{ signal: string; readiness: string }>;
      challengeSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      trustSignals: Array<{ signal: string; readiness: string }>;
      revocationSignals: Array<{ signal: string; readiness: string }>;
      automationSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Certificate readiness cert-manager step-ca CertMagic ACME Certificate Issuer ClusterIssuer CertificateRequest Order Challenge DNS01 HTTP01 TLS-ALPN renewBefore duration privateKey rotation Secret cainjector trust-manager root intermediate CRL OCSP cmctl step ca renew");
    expect(report.certificateSetups.length).toBeGreaterThan(0);
    expect(report.certificateSetups.map((item) => item.platform)).toEqual(expect.arrayContaining(["cert-manager", "step-ca", "certmagic"]));
    expect(report.certificateSetups.some((item) => item.resourceCount > 0 && item.issuerCount > 0 && item.challengeCount > 0 && item.renewalCount > 0 && item.secretCount > 0 && item.keyCount > 0)).toBe(true);
    expect(report.certificateSetups.some((item) => item.trustCount > 0 && item.revocationCount > 0 && item.observabilityCount > 0 && item.ciCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["cert-manager", "step-ca", "certmagic", "acme", "vault", "custom"]));
    expect(readySignals(report.resourceSignals)).toEqual(expect.arrayContaining(["certificate", "certificate-request", "issuer", "cluster-issuer", "order", "challenge", "csr", "secret", "ingress"]));
    expect(readySignals(report.issuerSignals)).toEqual(expect.arrayContaining(["acme", "ca", "self-signed", "vault", "step-ca", "lets-encrypt", "external"]));
    expect(readySignals(report.challengeSignals)).toEqual(expect.arrayContaining(["dns01", "http01", "tls-alpn-01", "solver", "eab", "self-check"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["duration", "renew-before", "revision-history", "private-key-rotation", "keystore", "status-conditions", "on-demand", "cache"]));
    expect(readySignals(report.trustSignals)).toEqual(expect.arrayContaining(["root-ca", "intermediate-ca", "ca-bundle", "cainjector", "trust-manager", "bootstrap", "install-root"]));
    expect(readySignals(report.revocationSignals)).toEqual(expect.arrayContaining(["crl", "ocsp", "revoke", "short-lived", "passive-revocation", "must-staple"]));
    expect(readySignals(report.automationSignals)).toEqual(expect.arrayContaining(["cmctl", "step-ca-renew", "certmagic-manage", "storage", "issuer-config", "solver-config", "policy"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["metrics", "prometheus", "events", "logs", "health", "webhook", "readiness", "expiration-alert"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "helm-template", "kubeconform", "cmctl-check", "step-ca-smoke", "certmagic-tests", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["cert-manager", "step-ca", "certmagic", "lego", "x509", "openssl"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"kind: (Certificate|CertificateRequest|Issuer|ClusterIssuer|Order|Challenge)|cert-manager.io|secretName|renewBefore|duration|privateKey\" .",
      "rg \"ACME|DNS01|HTTP01|TLS-ALPN-01|solver|challenge|externalAccountBinding|EAB|self check|nameservers\" .",
      "rg \"step-ca|step ca renew|provisioner|root certificate|intermediate|bootstrap|install root|revoke|CRL|OCSP\" .",
      "rg \"CertMagic|certmagic|OnDemand|storage|cache|OCSP|must-staple|ManageSync|ManageAsync|issuer\" .",
      "rg \"cmctl|helm template|kubeconform|certificate smoke|step-ca smoke|certmagic test|expiration|upload-artifact\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "certificate-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "certificate-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "certificate-readiness.html"))).resolves.toBeUndefined();
    const certificateMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "certificate-readiness.md"), "utf8");
    expect(certificateMarkdown).toContain("Issuer Signals");
    expect(certificateMarkdown).toContain("Lifecycle Signals");
    expect(certificateMarkdown).toContain("Trust Signals");
    const certificateHtml = await fs.readFile(path.join(result.session.outputPaths.html, "certificate-readiness.html"), "utf8");
    expect(certificateHtml).toContain("certificate-readiness-card");
    expect(certificateHtml).toContain("data-source-pattern=\"Certificate\"");
  });

  it("detects Helm readiness without rendering charts or contacting clusters", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-helm-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-helm-source-"));
    await fs.mkdir(path.join(sourceRoot, "charts", "app", "templates"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "charts", "app", "ci"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "charts", "library"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        helm: "^3.18.0",
        "chart-testing": "^3.14.0",
        "chart-releaser": "^1.7.0",
        "helm-docs": "^1.14.0",
        "helm-unittest": "^0.6.0",
        kubeconform: "^0.6.0"
      },
      scripts: {
        "helm:deps": "helm dependency build charts/app && helm dependency update charts/app",
        "helm:lint": "helm lint charts/app && helm template app charts/app --values charts/app/ci/prod-values.yaml --debug",
        "helm:dry-run": "helm install app charts/app --dry-run --atomic --wait && helm upgrade --install app charts/app --dry-run=server",
        "helm:release": "helm package charts/app --sign --keyring ./pubring.gpg && helm verify app-0.1.0.tgz && helm push app-0.1.0.tgz oci://registry.example.com/charts",
        "helm:ct": "ct lint --charts charts/app && ct install --charts charts/app && helm unittest charts/app"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "Chart.yaml"), [
      "apiVersion: v2",
      "name: app",
      "description: RepoTutor sample chart",
      "type: application",
      "version: 0.1.0",
      "appVersion: 1.0.0",
      "dependencies:",
      "  - name: redis",
      "    version: 18.0.0",
      "    repository: https://charts.bitnami.com/bitnami",
      "    condition: redis.enabled",
      "    alias: cache"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "Chart.lock"), [
      "dependencies:",
      "  - name: redis",
      "    version: 18.0.0",
      "    repository: https://charts.bitnami.com/bitnami",
      "digest: sha256:abc123",
      "generated: \"2026-06-05T00:00:00Z\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "values.yaml"), [
      "global:",
      "  imageRegistry: registry.example.com",
      "image:",
      "  repository: app",
      "  tag: stable",
      "redis:",
      "  enabled: true",
      "requiredEnv: production",
      "# default values default configuration required values must be set"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "values.schema.json"), JSON.stringify({
      $schema: "https://json-schema.org/schema#",
      type: "object",
      required: ["image"],
      properties: {
        image: { type: "object" }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "ci", "prod-values.yaml"), [
      "image:",
      "  tag: prod",
      "global:",
      "  environment: prod"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "templates", "_helpers.tpl"), [
      "{{- define \"app.name\" -}}",
      "{{- required \"name is required\" .Chart.Name -}}",
      "{{- end -}}",
      "{{- define \"app.render\" -}}",
      "{{- tpl .Values.extraTemplate . -}}",
      "{{- end -}}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "templates", "deployment.yaml"), [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata:",
      "  name: {{ include \"app.name\" . }}",
      "  annotations:",
      "    helm.sh/hook: pre-install,post-upgrade",
      "    helm.sh/hook-weight: \"1\"",
      "spec:",
      "  template:",
      "    spec:",
      "      containers:",
      "        - name: app",
      "          image: {{ .Values.global.imageRegistry }}/{{ .Values.image.repository }}:{{ .Values.image.tag }}",
      "{{- if .Capabilities.APIVersions.Has \"policy/v1/PodDisruptionBudget\" }}",
      "{{- $existing := lookup \"v1\" \"ConfigMap\" .Release.Namespace \"app-config\" }}",
      "{{- end }}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "library", "Chart.yaml"), [
      "apiVersion: v2",
      "name: app-library",
      "type: library",
      "version: 0.1.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "helm-readiness.yml"), [
      "name: helm readiness",
      "on: [push]",
      "jobs:",
      "  helm:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: helm dependency build charts/app && helm lint charts/app && helm template app charts/app --values charts/app/ci/prod-values.yaml > helm-template.yaml",
      "      - run: kubeconform -summary helm-template.yaml && helm install app charts/app --dry-run --atomic --wait && helm upgrade --install app charts/app --dry-run=server",
      "      - run: ct lint --charts charts/app && ct install --charts charts/app && helm unittest charts/app && helm test app && helm rollback app 1",
      "      - run: helm package charts/app --sign --keyring ./pubring.gpg && helm verify app-0.1.0.tgz && helm push app-0.1.0.tgz oci://registry.example.com/charts",
      "      - run: cr upload --owner Veritas-7 --git-repo charts --packages-with-index --skip-existing && cr index --owner Veritas-7 --git-repo charts --packages-with-index && helm repo index .",
      "      - run: echo '{}' > helm-readiness-report.json && echo '{}' > chart-report.json && echo '{}' > ct-report.json",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            helm-readiness-report.json",
      "            chart-report.json",
      "            ct-report.json",
      "            helm-template.yaml",
      "# Chart.yaml type: application values.yaml values.schema.json templates/ _helpers.tpl dependencies: repository: condition: alias:",
      "# chart-testing chart-releaser helm/chart-releaser-action provenance .prov sha256 digest OCI registry helm registry login"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "helm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      helmSetups: Array<{ chartType: string; chartCount: number; valuesCount: number; templateCount: number; dependencyCount: number; schemaCount: number; testCount: number; packagingCount: number; releaseCount: number; provenanceCount: number; ciCount: number }>;
      chartSignals: Array<{ signal: string; readiness: string }>;
      templateSignals: Array<{ signal: string; readiness: string }>;
      valuesSignals: Array<{ signal: string; readiness: string }>;
      dependencySignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      releaseSignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Helm readiness Chart.yaml values.yaml templates _helpers.tpl values.schema.json Chart.lock helm lint template install upgrade rollback test package push provenance chart-testing ct lint ct install chart-releaser cr upload cr index OCI kubeconform");
    expect(report.helmSetups.length).toBeGreaterThan(0);
    expect(report.helmSetups.map((item) => item.chartType)).toEqual(expect.arrayContaining(["application", "library"]));
    expect(report.helmSetups.some((item) => item.chartCount > 0 && item.valuesCount > 0 && item.templateCount > 0 && item.dependencyCount > 0 && item.schemaCount > 0)).toBe(true);
    expect(report.helmSetups.some((item) => item.testCount > 0 && item.packagingCount > 0 && item.releaseCount > 0 && item.provenanceCount > 0 && item.ciCount > 0)).toBe(true);
    expect(readySignals(report.chartSignals)).toEqual(expect.arrayContaining(["chart-yaml", "values", "templates", "helpers", "library-chart", "chart-lock"]));
    expect(readySignals(report.templateSignals)).toEqual(expect.arrayContaining(["helm-template", "include", "tpl", "lookup", "required", "capabilities", "hooks"]));
    expect(readySignals(report.valuesSignals)).toEqual(expect.arrayContaining(["values-schema", "global-values", "env-values", "required-values", "default-values"]));
    expect(readySignals(report.dependencySignals)).toEqual(expect.arrayContaining(["dependencies", "repository", "condition", "alias", "helm-dependency", "chart-lock"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["helm-lint", "helm-template", "dry-run", "kubeconform", "ct-lint", "ct-install", "helm-unittest"]));
    expect(readySignals(report.releaseSignals)).toEqual(expect.arrayContaining(["helm-upgrade", "helm-install", "helm-rollback", "helm-test", "chart-releaser", "oci-push", "repo-index"]));
    expect(readySignals(report.securitySignals)).toEqual(expect.arrayContaining(["provenance", "signing", "verify", "keyring", "digest", "oci-registry"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "chart-testing", "helm-lint", "helm-template", "kubeconform", "chart-releaser", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["helm", "chart-testing", "chart-releaser", "helm-docs", "helm-unittest", "kubeconform"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"Chart.yaml|type: library|values.yaml|values.schema.json|templates/|_helpers.tpl|Chart.lock\" .",
      "rg \"helm lint|helm template|helm install|helm upgrade|helm rollback|helm test|--dry-run|--atomic|--wait\" .",
      "rg \"ct lint|ct install|chart-testing|kubeconform|kubeval|helm unittest|helm-unittest\" .github .",
      "rg \"helm dependency (build|update)|dependencies:|repository:|condition:|alias:\" .",
      "rg \"helm package|--sign|--keyring|helm verify|\\.prov|helm push|oci://|cr upload|cr index|chart-releaser|helm repo index|upload-artifact\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "helm-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "helm-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "helm-readiness.html"))).resolves.toBeUndefined();
    const helmMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "helm-readiness.md"), "utf8");
    expect(helmMarkdown).toContain("Chart Signals");
    expect(helmMarkdown).toContain("Validation Signals");
    expect(helmMarkdown).toContain("Security Signals");
    const helmHtml = await fs.readFile(path.join(result.session.outputPaths.html, "helm-readiness.html"), "utf8");
    expect(helmHtml).toContain("helm-readiness-card");
    expect(helmHtml).toContain("data-source-pattern=\"Helm\"");
  });

  it("detects admission policy readiness without applying policies or contacting clusters", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-admission-policy-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-admission-policy-source-"));
    await fs.mkdir(path.join(sourceRoot, "policies", "kyverno"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "policies", "gatekeeper"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "policies", "native"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "policy:kyverno": "kyverno test policies && kyverno apply policies --resource resources/pod.yaml",
        "policy:gatekeeper": "gator test policies && gator verify policies",
        "policy:dry-run": "kubectl apply -f policies --dry-run=server && conftest test policies"
      },
      dependencies: {
        "@kubernetes/client-node": "latest",
        kyverno: "latest",
        gatekeeper: "latest",
        opa: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "policies", "kyverno", "cluster-policy.yaml"), [
      "apiVersion: kyverno.io/v1",
      "kind: ClusterPolicy",
      "metadata:",
      "  name: require-secure-images",
      "spec:",
      "  validationFailureAction: Enforce",
      "  background: true",
      "  generateSuccessEvents: true",
      "  rules:",
      "    - name: validate-labels",
      "      match:",
      "        resources:",
      "          kinds: [Pod]",
      "          namespaceSelector:",
      "            matchLabels:",
      "              team: platform",
      "          objectSelector:",
      "            matchLabels:",
      "              app: web",
      "      exclude:",
      "        resources:",
      "          namespaces: [kube-system]",
      "      validate:",
      "        message: labels are required",
      "        pattern:",
      "          metadata:",
      "            labels:",
      "              app: \"?*\"",
      "    - name: mutate-defaults",
      "      mutate:",
      "        patchStrategicMerge:",
      "          metadata:",
      "            labels:",
      "              admission: kyverno",
      "    - name: generate-network-policy",
      "      generate:",
      "        synchronize: true",
      "        data:",
      "          kind: NetworkPolicy",
      "    - name: verify-image-signature",
      "      verifyImages:",
      "        - imageReferences: [\"registry.example.com/*\"]",
      "          attestors:",
      "            - entries:",
      "                - keys:",
      "                    publicKeys: cosign.pub",
      "# validationFailureAction: Audit PolicyReport ClusterPolicyReport totalViolations status.violations metrics events",
      "# kyverno test policies && kyverno apply policies --resource resources/pod.yaml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "kyverno", "exception.yaml"), [
      "apiVersion: kyverno.io/v2",
      "kind: PolicyException",
      "metadata:",
      "  name: allow-break-glass",
      "spec:",
      "  exceptions:",
      "    - policyName: require-secure-images",
      "      ruleNames: [validate-labels]",
      "  match:",
      "    any:",
      "      - resources:",
      "          namespaces: [sandbox]",
      "# exemptions excludedUsers excludedGroups"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "gatekeeper", "required-labels.yaml"), [
      "apiVersion: templates.gatekeeper.sh/v1",
      "kind: ConstraintTemplate",
      "metadata:",
      "  name: k8srequiredlabels",
      "spec:",
      "  crd:",
      "    spec:",
      "      names:",
      "        kind: K8sRequiredLabels",
      "  targets:",
      "    - target: admission.k8s.gatekeeper.sh",
      "      rego: |",
      "        package k8srequiredlabels",
      "        violation[{\"msg\": msg}] {",
      "          msg := \"missing labels\"",
      "        }",
      "---",
      "apiVersion: constraints.gatekeeper.sh/v1beta1",
      "kind: K8sRequiredLabels",
      "metadata:",
      "  name: required-labels",
      "spec:",
      "  enforcementAction: dryrun",
      "  match:",
      "    kinds:",
      "      - apiGroups: [\"\"]",
      "        kinds: [\"Pod\"]",
      "# enforcementAction: warn audit-results audit-controller gator test gator verify"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "native", "validating-admission-policy.yaml"), [
      "apiVersion: admissionregistration.k8s.io/v1",
      "kind: ValidatingAdmissionPolicy",
      "metadata:",
      "  name: require-team-label",
      "spec:",
      "  matchConditions:",
      "    - name: not-system",
      "      expression: \"request.namespace != 'kube-system'\"",
      "  validations:",
      "    - expression: \"object.metadata.labels['team'] != ''\"",
      "      messageExpression: \"'team label required for ' + object.metadata.name\"",
      "  failurePolicy: Fail",
      "---",
      "apiVersion: admissionregistration.k8s.io/v1",
      "kind: ValidatingAdmissionPolicyBinding",
      "metadata:",
      "  name: require-team-label-binding",
      "spec:",
      "  policyName: require-team-label",
      "  validationActions: [Deny, Warn, Audit]",
      "  paramRef:",
      "    name: require-team-label-params",
      "---",
      "apiVersion: admissionregistration.k8s.io/v1alpha1",
      "kind: MutatingAdmissionPolicy",
      "metadata:",
      "  name: set-team-label",
      "spec:",
      "  matchConstraints:",
      "    resourceRules:",
      "      - apiGroups: [\"\"]",
      "        apiVersions: [v1]",
      "        operations: [CREATE, UPDATE]",
      "        resources: [pods]",
      "  mutations:",
      "    - patchType: JSONPatch",
      "      jsonPatch:",
      "        expression: \"[{ 'op': 'add', 'path': '/metadata/labels/team', 'value': 'platform' }]\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "native", "webhook.yaml"), [
      "apiVersion: admissionregistration.k8s.io/v1",
      "kind: ValidatingWebhookConfiguration",
      "metadata:",
      "  name: validation.example.com",
      "webhooks:",
      "  - name: validate.example.com",
      "    admissionReviewVersions: [v1, v1beta1]",
      "    failurePolicy: Ignore",
      "    clientConfig:",
      "      service:",
      "        namespace: admission-system",
      "        name: admission-webhook",
      "---",
      "apiVersion: admissionregistration.k8s.io/v1",
      "kind: MutatingWebhookConfiguration",
      "metadata:",
      "  name: mutation.example.com",
      "webhooks:",
      "  - name: mutate.example.com",
      "    admissionReviewVersions: [v1]",
      "    failurePolicy: Fail",
      "# kind: AdmissionReview apiserver_admission_webhook_rejection_count prometheus counter"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "admission-policy.yml"), [
      "name: admission policy readiness",
      "on: [push]",
      "jobs:",
      "  policy:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: kyverno test policies && kyverno apply policies --resource resources/pod.yaml --audit-warn",
      "      - run: gator test policies && gator verify policies && conftest test policies",
      "      - run: kubectl apply -f policies --dry-run=server && kubectl diff -f policies --server-side",
      "      - run: echo '{}' > admission-policy-readiness-report.json && echo '{}' > kyverno-report.json && echo '{}' > gator-report.json && echo '{}' > policy-report.json",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            admission-policy-readiness-report.json",
      "            kyverno-report.json",
      "            gator-report.json",
      "            policy-report.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "admission-policy-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      admissionSetups: Array<{ framework: string; policyCount: number; constraintCount: number; webhookCount: number; validationCount: number; mutationCount: number; exceptionCount: number; enforcementCount: number; testCount: number; observabilityCount: number; ciCount: number }>;
      controllerSignals: Array<{ signal: string; readiness: string }>;
      policySignals: Array<{ signal: string; readiness: string }>;
      ruleSignals: Array<{ signal: string; readiness: string }>;
      enforcementSignals: Array<{ signal: string; readiness: string }>;
      exceptionSignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Admission policy readiness Kyverno ClusterPolicy PolicyException validate mutate generate verifyImages validationFailureAction Gatekeeper ConstraintTemplate constraint enforcementAction audit warn dryrun gator ValidatingAdmissionPolicy MutatingAdmissionPolicy admissionReviewVersions failurePolicy matchConditions validationActions PolicyReport");
    expect(report.admissionSetups.length).toBeGreaterThan(0);
    expect(report.admissionSetups.map((item) => item.framework)).toEqual(expect.arrayContaining(["kyverno", "gatekeeper", "kubernetes-native", "webhook", "workflow"]));
    expect(report.admissionSetups.some((item) => item.policyCount > 0 && item.validationCount > 0 && item.mutationCount > 0 && item.exceptionCount > 0 && item.enforcementCount > 0)).toBe(true);
    expect(report.admissionSetups.some((item) => item.constraintCount > 0)).toBe(true);
    expect(report.admissionSetups.some((item) => item.webhookCount > 0)).toBe(true);
    expect(report.admissionSetups.some((item) => item.testCount > 0 && item.ciCount > 0)).toBe(true);
    expect(readySignals(report.controllerSignals)).toEqual(expect.arrayContaining(["kyverno", "gatekeeper", "validating-admission-policy", "mutating-admission-policy", "admission-webhook"]));
    expect(readySignals(report.policySignals)).toEqual(expect.arrayContaining(["cluster-policy", "policy", "constraint-template", "constraint", "validating-admission-policy", "policy-binding"]));
    expect(readySignals(report.ruleSignals)).toEqual(expect.arrayContaining(["validate", "mutate", "generate", "verify-images", "cel-expression", "rego-violation", "match-conditions"]));
    expect(readySignals(report.enforcementSignals)).toEqual(expect.arrayContaining(["enforce", "audit", "warn", "dryrun", "failure-policy-fail", "failure-policy-ignore", "validation-actions"]));
    expect(readySignals(report.exceptionSignals)).toEqual(expect.arrayContaining(["policy-exception", "namespace-selector", "object-selector", "match-exclude", "exemptions"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["kyverno-test", "kyverno-apply", "gator-test", "gator-verify", "conftest", "kubectl-dry-run"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["policy-report", "cluster-policy-report", "violations", "audit-results", "metrics", "events"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "artifact-upload", "kyverno-cli", "gator-cli", "kubectl"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["kyverno", "gatekeeper", "opa", "kubernetes-client"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"ClusterPolicy|PolicyException|validationFailureAction|verifyImages|kyverno (test|apply)\" .",
      "rg \"ConstraintTemplate|constraints\\.gatekeeper\\.sh|enforcementAction|violation\\[|gator (test|verify)\" .",
      "rg \"ValidatingAdmissionPolicy|MutatingAdmissionPolicy|validationActions|matchConditions|failurePolicy|admissionReviewVersions\" .",
      "rg \"PolicyReport|ClusterPolicyReport|totalViolations|audit-results|admission_webhook|upload-artifact\" .github .",
      "rg \"namespaceSelector|objectSelector|exclude:|match:|exemptions|PolicyException\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "admission-policy-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "admission-policy-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "admission-policy-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "admission-policy-readiness.md"), "utf8");
    expect(markdown).toContain("Controller Signals");
    expect(markdown).toContain("Enforcement Signals");
    expect(markdown).toContain("Observability Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "admission-policy-readiness.html"), "utf8");
    expect(html).toContain("admission-policy-readiness-card");
    expect(html).toContain("data-source-pattern=\"AdmissionPolicy\"");
  });

  it("detects SAST readiness without running analyzers or uploading findings", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-sast-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-sast-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "codeql", "custom"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "security", "semgrep"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "sast:semgrep": "semgrep ci --config security/semgrep --sarif --output reports/semgrep-results.sarif",
        "sast:snyk": "snyk code test --sarif-file-output reports/snyk-results.sarif",
        "sast:codeql": "codeql database analyze db .github/codeql/custom --format=sarif-latest --output=reports/codeql-results.sarif",
        "sast:sonar": "sonar-scanner -Dsonar.qualitygate.wait=true"
      },
      devDependencies: {
        semgrep: "^1.100.0",
        snyk: "^1.1290.0",
        "eslint-plugin-security": "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "security", "semgrep", "custom.yml"), [
      "rules:",
      "  - id: repo-tutor.detect-dangerous-eval",
      "    languages: [javascript, typescript, python, go]",
      "    severity: ERROR",
      "    message: Avoid dynamic eval in request handlers.",
      "    mode: taint",
      "    pattern-sources:",
      "      - pattern: req.body",
      "    pattern-sinks:",
      "      - pattern: eval($X)",
      "    patterns:",
      "      - pattern-either:",
      "          - pattern: eval($X)",
      "          - pattern-regex: dangerous_.*",
      "      - metavariable-regex:",
      "          metavariable: $X",
      "          regex: .+",
      "    paths:",
      "      include:",
      "        - src/",
      "      exclude:",
      "        - dist/",
      "        - generated/",
      "    metadata:",
      "      baseline-ref: origin/main",
      "      severity-threshold: HIGH",
      "      fail-threshold: medium"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".semgrepignore"), [
      "generated/",
      "dist/",
      "vendor/",
      "node_modules/",
      "nosemgrep suppressions are tracked in review"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "codeql", "codeql.yml"), [
      "name: repo-tutor-codeql",
      "paths:",
      "  - src",
      "  - packages/app",
      "paths-ignore:",
      "  - generated/**",
      "  - dist/**",
      "queries:",
      "  - uses: security-extended",
      "  - uses: security-and-quality",
      "  - uses: ./.github/codeql/custom",
      "packs:",
      "  - codeql/javascript-queries",
      "baseline-ref: origin/main",
      "monorepo packages/ projectBaseDir",
      "test-scope tests/ sonar.tests"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "codeql", "custom", "qlpack.yml"), [
      "name: repo-tutor/custom-queries",
      "version: 0.0.1",
      "dependencies:",
      "  codeql/javascript-all: \"*\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "codeql", "custom", "unsafe-eval.ql"), [
      "import javascript",
      "from CallExpr call",
      "where call.getCalleeName() = \"eval\"",
      "select call, \"Avoid eval in request handlers\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "sonar-project.properties"), [
      "sonar.projectKey=repo-tutor",
      "sonar.sources=src,packages/app",
      "sonar.tests=tests",
      "sonar.exclusions=generated/**,dist/**,vendor/**",
      "sonar.coverage.exclusions=**/*.generated.ts",
      "sonar.issue.ignore.multicriteria=e1",
      "sonar.qualitygate.wait=true",
      "quality gate fail-threshold severity-threshold new code baseline"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "sast.yml"), [
      "name: SAST",
      "on:",
      "  pull_request:",
      "  push:",
      "jobs:",
      "  sast:",
      "    runs-on: ubuntu-latest",
      "    strategy:",
      "      matrix:",
      "        language: [javascript-typescript, python, go]",
      "        project: [packages/app]",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: semgrep ci --config security/semgrep --sarif --output semgrep-results.sarif",
      "      - uses: github/codeql-action/init@v3",
      "        with:",
      "          languages: javascript-typescript, python, go",
      "          config-file: .github/codeql/codeql.yml",
      "          queries: security-extended,security-and-quality,./.github/codeql/custom",
      "      - uses: github/codeql-action/analyze@v3",
      "        with:",
      "          upload: false",
      "      - uses: github/codeql-action/upload-sarif@v3",
      "        with:",
      "          sarif_file: semgrep-results.sarif",
      "      - uses: SonarSource/sonarqube-scan-action@v5",
      "        with:",
      "          args: -Dsonar.qualitygate.wait=true -Dsonar.sources=src -Dsonar.exclusions=generated/**",
      "      - run: snyk code test --sarif-file-output snyk-results.sarif",
      "      - run: echo '{}' > sast-readiness-report.json && echo '{}' > semgrep-results.json && echo '<html>sonar report</html>' > sonar-report.html && echo '<testsuite />' > sast-junit.xml",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: sast-artifacts",
      "          path: |",
      "            sast-readiness-report.json",
      "            semgrep-results.sarif",
      "            snyk-results.sarif",
      "            sonar-report.html",
      "            sast-junit.xml",
      "            code-scanning.sarif",
      "      - run: echo 'diff-aware only_changed changed files quality gate code scanning security-events upload-artifact SARIF JSON JUnit HTML'"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "app.ts"), [
      "export function handler(req: { body: string }) {",
      "  // nosemgrep: repo-tutor.detect-dangerous-eval",
      "  return eval(req.body);",
      "}"
    ].join("\n"));

    const result = await runStudy({
      source: sourceRoot,
      sourceBaseDir: sourceRoot,
      studiesRoot,
      mode: "standard",
      level: "junior",
      enableCodex: false
    });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "sast-readiness-report.json"), "utf8")) as {
      sastSetups: Array<{ tool: string; readiness: string; ruleCount: number; queryCount: number; outputCount: number; ciCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      ruleSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      languageSignals: Array<{ signal: string; readiness: string }>;
      scopeSignals: Array<{ signal: string; readiness: string }>;
      baselineSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = (items: Array<{ signal: string; readiness: string }>) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sastSetups.map((item) => item.tool)).toEqual(expect.arrayContaining(["semgrep", "workflow", "codeql", "sonarqube", "package-script"]));
    expect(report.sastSetups.some((item) => item.tool === "semgrep" && item.ruleCount > 0)).toBe(true);
    expect(report.sastSetups.some((item) => item.readiness === "ready" && item.outputCount > 0 && item.ciCount > 0)).toBe(true);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["semgrep", "codeql", "sonarqube", "snyk-code", "eslint-security"]));
    expect(readySignals(report.ruleSignals)).toEqual(expect.arrayContaining(["semgrep-rule", "pattern", "pattern-either", "pattern-regex", "metavariable", "severity", "message", "taint-mode"]));
    expect(readySignals(report.querySignals)).toEqual(expect.arrayContaining(["codeql-query", "query-suite", "query-pack", "security-extended", "security-and-quality", "qlpack", "custom-query"]));
    expect(readySignals(report.languageSignals)).toEqual(expect.arrayContaining(["javascript-typescript", "python", "go", "multi-language"]));
    expect(readySignals(report.scopeSignals)).toEqual(expect.arrayContaining(["paths", "paths-ignore", "exclusions", "generated-code", "test-scope", "monorepo"]));
    expect(readySignals(report.baselineSignals)).toEqual(expect.arrayContaining(["baseline-ref", "diff-aware", "pr-scan", "fail-threshold", "severity-threshold", "quality-gate"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["sarif", "json", "junit", "html", "code-scanning", "artifact-upload"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "semgrep-ci", "codeql-init", "codeql-analyze", "sonar-scan-action", "snyk-code", "upload-sarif"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["semgrep", "codeql-action", "codeql-cli", "sonar-scanner", "sonarqube-scan-action", "snyk"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"semgrep ci|semgrep scan|p/ci|rules:|pattern-either|metavariable|mode: taint\" .",
      "rg \"github/codeql-action/(init|analyze)|codeql.yml|queries:|security-extended|security-and-quality|qlpack.yml|\\\\.ql\" .github .",
      "rg \"sonar-project.properties|sonar.sources|sonar.exclusions|sonar-scanner|SonarSource/sonarqube-scan-action|sonar.qualitygate.wait\" .",
      "rg \"snyk code test|SARIF|upload-sarif|code-scanning|upload-artifact|sast-readiness-report\" .github .",
      "rg \"nosemgrep|\\\\.semgrepignore|paths-ignore|baseline|severity|quality gate|fail-threshold\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "sast-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "sast-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "sast-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "sast-readiness.md"), "utf8");
    expect(markdown).toContain("Rule Signals");
    expect(markdown).toContain("Query Signals");
    expect(markdown).toContain("Output Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "sast-readiness.html"), "utf8");
    expect(html).toContain("sast-readiness-card");
    expect(html).toContain("data-source-pattern=\"SAST\"");
  });

  it("detects DAST readiness without launching browsers or sending HTTP traffic", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dast-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dast-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "security"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "securecodebox"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "dast:zap": "zap-baseline-scan.py -t $BASE_URL -r zap-baseline.html -J zap-baseline.json && zap-full-scan.py -t $TARGET_URL -z '-config ajaxSpider.browserId=firefox'",
        "dast:nuclei": "nuclei -dast -t nuclei-templates -w workflows -severity critical,high -tags cves,exposures -exclude-tags intrusive -rate-limit 10 -timeout 30 -c 5 -sarif-export nuclei.sarif -json-export nuclei.json",
        "dast:securecodebox": "kubectl apply -f security/securecodebox-scan.yaml",
        "dast:test": "playwright test tests/dast.spec.ts"
      },
      devDependencies: {
        "@playwright/test": "^1.50.0",
        nuclei: "^3.3.0",
        securecodebox: "^4.8.0",
        zaproxy: "^0.0.1"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "dast.yml"), [
      "name: DAST",
      "on:",
      "  pull_request:",
      "  schedule:",
      "    - cron: '0 3 * * 1'",
      "jobs:",
      "  dast:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      BASE_URL: https://staging.example.test",
      "      TARGET_URL: https://staging.example.test/app",
      "      URL_LIST: security/targets.txt",
      "      OPENAPI: openapi.yaml",
      "      ZAP_AUTH: context_file",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: zap-baseline-scan.py -t $BASE_URL -r zap-baseline.html -J zap-baseline.json",
      "      - run: zap-full-scan.py -t $TARGET_URL -z '-config ajaxSpider.browserId=firefox -config spider.maxDuration=10 -config ascan.policy=scan-policy.conf'",
      "      - run: zap-api-scan.py -t $OPENAPI -f openapi -r zap-api.html -J zap-api.json",
      "      - run: nuclei -dast -t nuclei-templates -w workflows -severity critical,high -tags cves,exposures -exclude-tags intrusive -rate-limit 10 -timeout 30 -c 5 -sarif-export nuclei.sarif -json-export nuclei.json",
      "      - run: kubectl apply -f security/securecodebox-scan.yaml",
      "      - run: echo '<testsuite />' > dast-junit.xml && echo '# DAST markdown report' > dast-report.md && echo '<html>DAST HTML</html>' > dast-report.html",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: dast-artifacts",
      "          path: |",
      "            zap-baseline.json",
      "            nuclei.json",
      "            nuclei.sarif",
      "            dast-junit.xml",
      "            dast-report.md",
      "            dast-report.html"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "security", "zap-baseline.conf"), [
      "# OWASP ZAP context auth policy report",
      "context = staging-login.context",
      "login_url = https://staging.example.test/login",
      "headers: Authorization: Bearer token",
      "cookies: session=example",
      "user: dast-user",
      "username = dast-user",
      "password = example",
      "spider ajaxSpider active scan scan-policy policy.conf baseline full scan fuzzing attack policy",
      "scope include staging.example.test exclude production.example.com allowlist staging.example.test",
      "timeout 30 concurrency 5 GET only safe methods follow-redirects sitemap.xml",
      "json-report sarif junit xml-report html-report markdown md-report artifact upload-artifact findings severity vulnerability"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "security", "nuclei-dast.yaml"), [
      "id: repo-tutor-nuclei-dast",
      "info:",
      "  name: RepoTutor DAST workflow",
      "  severity: high",
      "  tags: cves,exposures",
      "workflows:",
      "  - template: nuclei-templates/http/exposures.yaml",
      "exclude-tags:",
      "  - intrusive",
      "signature: required",
      "disable-unsigned: false",
      "headless: true",
      "interactsh: true",
      "rate-limit: 10",
      "timeout: 30",
      "concurrency: 5",
      "fuzzing payload attack nuclei -dast -sarif-export nuclei.sarif -json-export nuclei.json"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "security", "securecodebox-scan.yaml"), [
      "apiVersion: execution.securecodebox.io/v1",
      "kind: ScanType",
      "metadata:",
      "  name: zap-full-scan",
      "spec:",
      "  jobTemplate: secureCodeBox scheduledScan parser hook findings DefectDojo lurker",
      "  parameters:",
      "    - --target",
      "    - $(TARGET_URL)",
      "    - --active-scan",
      "---",
      "apiVersion: execution.securecodebox.io/v1",
      "kind: ScheduledScan",
      "metadata:",
      "  name: weekly-dast",
      "spec:",
      "  schedule: '0 3 * * 1'",
      "  scanSpec:",
      "    scanType: zap-full-scan"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "securecodebox", "ScanType.yaml"), [
      "apiVersion: execution.securecodebox.io/v1",
      "kind: ScanType",
      "metadata:",
      "  name: repo-tutor-securecodebox",
      "spec:",
      "  jobTemplate: secureCodeBox parser hook findings DefectDojo lurker",
      "  parameters:",
      "    - TARGET_URL",
      "    - active scan",
      "  schedule: '0 3 * * 1'",
      "  report: json html markdown"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "dast.spec.ts"), [
      "import { test, expect } from '@playwright/test';",
      "const target = process.env.TARGET_URL ?? 'https://staging.example.test';",
      "test('authorized DAST smoke target only', async ({ page, request }) => {",
      "  await page.goto(target);",
      "  const response = await request.get(`${target}/sitemap.xml`, { headers: { Authorization: 'Bearer token' } });",
      "  expect(response.ok()).toBeTruthy();",
      "});",
      "// BASE_URL TARGET_URL URL_LIST OPENAPI swagger graphql sitemap staging non-production headless browser"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "dast-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dastSetups: Array<{ tool: string; readiness: string; targetCount: number; crawlerCount: number; activeScanCount: number; authCount: number; templateCount: number; safetyCount: number; outputCount: number; ciCount: number; findingCount: number }>;
      targetSignals: Array<{ signal: string; readiness: string }>;
      scannerSignals: Array<{ signal: string; readiness: string }>;
      crawlSignals: Array<{ signal: string; readiness: string }>;
      activeScanSignals: Array<{ signal: string; readiness: string }>;
      authSignals: Array<{ signal: string; readiness: string }>;
      templateSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string }>;
    };
    const readySignals = (items: Array<{ signal: string; readiness: string }>) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("DAST readiness OWASP ZAP zap-baseline-scan zap-full-scan zap-api-scan spider ajaxSpider active scan context auth policy report nuclei -dast templates workflows severity rate-limit headless interactsh secureCodeBox ScanType parser hooks findings SARIF JUnit HTML");
    expect(report.dastSetups.length).toBeGreaterThan(0);
    expect(Array.from(new Set(report.dastSetups.map((item) => item.tool)))).toEqual(expect.arrayContaining(["workflow", "package-script", "zap", "nuclei", "securecodebox", "playwright"]));
    expect(report.dastSetups.some((item) => item.targetCount > 0 && item.crawlerCount > 0 && item.activeScanCount > 0 && item.authCount > 0 && item.safetyCount > 0 && item.outputCount > 0)).toBe(true);
    expect(report.dastSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(report.dastSetups.some((item) => item.findingCount > 0)).toBe(true);

    expect(readySignals(report.targetSignals)).toEqual(expect.arrayContaining(["base-url", "url-list", "openapi", "graphql", "swagger", "sitemap", "environment"]));
    expect(readySignals(report.scannerSignals)).toEqual(expect.arrayContaining(["zap", "nuclei", "securecodebox", "playwright"]));
    expect(readySignals(report.crawlSignals)).toEqual(expect.arrayContaining(["spider", "ajax-spider", "headless", "follow-redirects", "sitemap"]));
    expect(readySignals(report.activeScanSignals)).toEqual(expect.arrayContaining(["zap-active-scan", "nuclei-dast", "fuzzing", "attack-policy", "baseline", "full-scan"]));
    expect(readySignals(report.authSignals)).toEqual(expect.arrayContaining(["context", "login", "headers", "cookies", "token", "user"]));
    expect(readySignals(report.templateSignals)).toEqual(expect.arrayContaining(["nuclei-template", "workflow", "severity", "tags", "exclude", "signature"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["rate-limit", "scope", "timeout", "concurrency", "safe-methods", "allowlist"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["json", "sarif", "junit", "html", "markdown", "artifact-upload"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "scheduled-run", "pull-request", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["zap", "nuclei", "securecodebox", "playwright"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.some((item) => item.action.startsWith("Run OWASP ZAP, nuclei, secureCodeBox"))).toBe(true);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"zap-baseline-scan|zap-full-scan|zap-api-scan|ZAP_AUTH|ajaxSpider|active scan|scan-policy\" .",
      "rg \"nuclei .* -dast|-dast|nuclei-templates|-severity|-tags|-exclude-tags|-rate-limit|-sarif-export|-json-export\" .",
      "rg \"secureCodeBox|ScanType|parser|hook|finding|DefectDojo|lurker|scheduledScan\" .",
      "rg \"BASE_URL|TARGET_URL|URL_LIST|OPENAPI|swagger|sitemap|pull_request|schedule|upload-artifact\" .github ."
    ]);

    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "dast-readiness.md"), "utf8");
    expect(markdown).toContain("# DAST Readiness");
    expect(markdown).toContain("## Active Scan Signals");
    expect(markdown).toContain("## Safety Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "dast-readiness.html"), "utf8");
    expect(html).toContain("DAST Readiness");
    expect(html).toContain("dast-readiness-card");
    expect(html).toContain("data-source-pattern=\"DAST\"");
    expect(html).toContain("does not launch browsers");
  });

  it("detects dependency review readiness without calling external advisory or registry services", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dependency-review-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dependency-review-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "dependency-review.yml"), [
      "name: Dependency Review",
      "on:",
      "  pull_request:",
      "  schedule:",
      "    - cron: '0 6 * * 1'",
      "permissions:",
      "  contents: read",
      "  pull-requests: write",
      "  security-events: write",
      "jobs:",
      "  dependency-review:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - uses: actions/dependency-review-action@v5",
      "        with:",
      "          fail-on-severity: high",
      "          vulnerability-check: true",
      "          license-check: true",
      "          allow-licenses: MIT, Apache-2.0, BSD-3-Clause",
      "          deny-licenses: GPL-3.0, AGPL-3.0",
      "          allow-dependencies-licenses: pkg:npm/example@1.0.0=ISC",
      "          deny-packages: pkg:npm/left-pad",
      "          base-ref: ${{ github.event.pull_request.base.sha }}",
      "          head-ref: ${{ github.event.pull_request.head.sha }}",
      "          comment-summary-in-pr: always",
      "          retry-on-snapshot-warnings: true",
      "          retry-on-snapshot-warnings-timeout: 60",
      "          show-openssf-scorecard: true",
      "          warn-on-openssf-scorecard-level: 3",
      "      - run: osv-scanner scan source -r . --format=json --json --sarif --licenses --offline --download-offline-databases --allow-no-lockfiles --min-severity=5 --ignore-dev",
      "      - run: osv-scanner fix --min-severity=5 --ignore-dev -L package-lock.json",
      "      - run: echo '## Dependency Review summary' >> $GITHUB_STEP_SUMMARY && echo '{\"format\":\"json\"}' > dependency-review.json && echo '<html>report</html>' > dependency-review.html && echo '# markdown report' > dependency-review.md && touch dependency-review.sarif",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: dependency-review-artifacts",
      "          path: dependency-review.*"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "dependabot.yml"), [
      "version: 2",
      "registries:",
      "  npm-private:",
      "    type: npm-registry",
      "    url: https://registry.example.com",
      "updates:",
      "  - package-ecosystem: npm",
      "    directory: /",
      "    schedule:",
      "      interval: weekly",
      "    groups:",
      "      security-updates:",
      "        patterns: ['*']",
      "    allow:",
      "      - dependency-type: direct",
      "    ignore:",
      "      - dependency-name: left-pad",
      "    registries: ['npm-private']",
      "    open-pull-requests-limit: 5",
      "  - package-ecosystem: github-actions",
      "    directory: /",
      "    schedule:",
      "      interval: daily"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "osv-scanner.toml"), [
      "[IgnoredVulns]",
      "GHSA-xxxx-yyyy-zzzz = { reason = 'accepted risk for test fixture' }",
      "[PackageOverrides]",
      "'pkg:npm/example@1.0.0' = { license = 'MIT' }",
      "# OSV Scanner offline database, SPDX license scan, purl review, JSON SARIF HTML Markdown output"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "dependency:review": "osv-scanner scan source -r . --format=html --licenses --offline --download-offline-databases --allow-no-lockfiles --min-severity=5 --ignore-dev",
        "dependency:review:json": "osv-scanner --json --sarif --licenses package-lock.json"
      },
      devDependencies: {
        "osv-scanner": "^2.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "package-lock.json"), JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: {
            example: "1.0.0"
          }
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "docs", "dependency-review.md"), [
      "# Dependency Review Policy",
      "Dependency Review Action checks base/head compare, dependency graph snapshot warnings, PR summary comments, and dependency submission.",
      "Policy covers fail-on-severity, vulnerability-check, license-check, allow-licenses, deny-licenses, allow-dependencies-licenses, deny-packages, SPDX and purl review.",
      "OSV Scanner lockfile scan uses offline database, license scan, min severity, ignore dev dependencies, JSON, SARIF, HTML, and Markdown artifacts."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "dependency-review-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dependencyReviewSetups: Array<{ tool: string; readiness: string; reviewCount: number; vulnerabilityCount: number; licenseCount: number; packagePolicyCount: number; diffCount: number; snapshotCount: number; scorecardCount: number; outputCount: number; ciCount: number }>;
      reviewSignals: Array<{ signal: string; readiness: string }>;
      vulnerabilitySignals: Array<{ signal: string; readiness: string }>;
      licenseSignals: Array<{ signal: string; readiness: string }>;
      packagePolicySignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      scorecardSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string }>;
    };
    const readySignals = (items: Array<{ signal: string; readiness: string }>) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Dependency Review readiness actions/dependency-review-action fail-on-severity vulnerability-check license-check allow-licenses deny-licenses allow-dependencies-licenses deny-packages base-ref head-ref snapshot warnings OpenSSF scorecard Dependabot OSV Scanner lockfile license offline remediation PR summary artifact SARIF JSON HTML");
    expect(report.dependencyReviewSetups.length).toBeGreaterThan(0);
    expect(Array.from(new Set(report.dependencyReviewSetups.map((item) => item.tool)))).toEqual(expect.arrayContaining(["dependency-review-action", "dependabot", "osv-scanner", "package-script"]));
    expect(report.dependencyReviewSetups.some((item) => item.reviewCount > 0 && item.vulnerabilityCount > 0 && item.licenseCount > 0 && item.packagePolicyCount > 0 && item.diffCount > 0 && item.snapshotCount > 0 && item.scorecardCount > 0 && item.outputCount > 0 && item.ciCount > 0)).toBe(true);

    expect(readySignals(report.reviewSignals)).toEqual(expect.arrayContaining(["dependency-review-action", "dependency-graph", "dependency-submission", "base-head-compare", "snapshot-warning", "pr-summary", "pull-request"]));
    expect(readySignals(report.vulnerabilitySignals)).toEqual(expect.arrayContaining(["fail-on-severity", "vulnerability-check", "osv-scanner", "lockfile-scan", "min-severity", "ignore-dev", "offline-db"]));
    expect(readySignals(report.licenseSignals)).toEqual(expect.arrayContaining(["license-check", "allow-licenses", "deny-licenses", "allow-dependencies-licenses", "license-scan", "spdx"]));
    expect(readySignals(report.packagePolicySignals)).toEqual(expect.arrayContaining(["deny-packages", "allowlist", "ignore", "groups", "security-updates", "ecosystem-directory", "registries"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "pull-request", "permissions", "artifact-upload", "summary-comment", "scheduled-run"]));
    expect(readySignals(report.scorecardSignals)).toEqual(expect.arrayContaining(["show-openssf-scorecard", "warn-on-openssf-scorecard-level", "scorecard-api"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["summary", "pr-comment", "sarif", "json", "html", "markdown", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["dependency-review-action", "dependabot", "osv-scanner", "github-action"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.some((item) => item.action.startsWith("Run Dependency Review, Dependabot, OSV Scanner"))).toBe(true);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"actions/dependency-review-action|fail-on-severity|license-check|vulnerability-check|base-ref|head-ref|comment-summary-in-pr|retry-on-snapshot-warnings\" .github .",
      "rg \"allow-licenses|deny-licenses|allow-dependencies-licenses|deny-packages|SPDX|purl\" .github .",
      "rg \"osv-scanner|--licenses|--offline|--download-offline-databases|--allow-no-lockfiles|--format|--json|--sarif|--min-severity|--ignore-dev\" .",
      "rg \"dependabot.yml|package-ecosystem|directory|schedule|groups|ignore|allow|registries|open-pull-requests-limit|security-updates\" .github .",
      "rg \"permissions:|contents: read|pull-requests: write|security-events: write|upload-artifact|summary\" .github ."
    ]);

    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "dependency-review-readiness.md"), "utf8");
    expect(markdown).toContain("# Dependency Review Readiness");
    expect(markdown).toContain("## Vulnerability Signals");
    expect(markdown).toContain("## Package Policy Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "dependency-review-readiness.html"), "utf8");
    expect(html).toContain("Dependency Review Readiness");
    expect(html).toContain("dependency-review-readiness-card");
    expect(html).toContain("data-source-pattern=\"Dependency Review\"");
    expect(html).toContain("does not call GitHub APIs");
  });

  it("detects threat model readiness without executing modeling tools or rendering diagrams", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-threat-model-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-threat-model-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "security"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "threat:pytm": "python security/threat-model.py --dfd --seq --report docs/threat-model.md",
        "threat:threagile": "docker run --rm -v $(pwd):/app/work threagile/threagile --model /app/work/security/threagile.yaml --output /app/work/reports --report-pdf --generate-data-flow-diagram --generate-technical-assets-json",
        "threat:dragon": "node scripts/export-threat-dragon.js security/threat-dragon.json",
        "threat:diagram": "dot -Tpng reports/data-flow-diagram.dot -o reports/data-flow-diagram.png"
      },
      devDependencies: {
        "@owasp/threat-dragon": "^2.0.0",
        graphviz: "^0.0.9",
        pytm: "^1.3.1",
        threagile: "^1.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "threat-model.yml"), [
      "name: Threat Model",
      "on:",
      "  pull_request:",
      "  schedule:",
      "    - cron: '0 4 * * 1'",
      "jobs:",
      "  threat-model:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: python security/threat-model.py --dfd --seq --report docs/threat-model.md",
      "      - run: docker run --rm -v $(pwd):/app/work threagile/threagile --model /app/work/security/threagile.yaml --output /app/work/reports --report-pdf --generate-data-flow-diagram --generate-technical-assets-json",
      "      - run: dot -Tpng reports/data-flow-diagram.dot -o reports/data-flow-diagram.png",
      "      - run: echo '{\"report\":\"json\"}' > reports/threat-model.json && echo '# threat model markdown report' > reports/threat-model.md && touch reports/threat-model.pdf reports/risk.xlsx reports/data-flow-diagram.png",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: threat-model-artifacts",
      "          path: reports"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "security", "threat-model.py"), [
      "from pytm import TM, Actor, Server, Datastore, Dataflow, Boundary",
      "tm = TM('RepoTutor Threat Model')",
      "tm.description = 'open threat model with DFD and sequence diagram output'",
      "internet = Boundary('Internet trust boundary')",
      "user = Actor('User')",
      "web = Server('Web Process')",
      "db = Datastore('Database')",
      "user_to_web = Dataflow(user, web, 'HTTPS request data flow')",
      "web_to_db = Dataflow(web, db, 'SQL data flow')",
      "web.inBoundary = internet",
      "db.inBoundary = Boundary('Private trust boundary')",
      "# STRIDE Spoofing Tampering Repudiation Information Disclosure Denial of Service Elevation of Privilege",
      "# threat mitigation risk rating severity accepted risk false positive questions attack tree abuse case report json markdown pdf Graphviz"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "security", "threat-dragon.json"), JSON.stringify({
      otmVersion: "0.1",
      summary: {
        title: "RepoTutor Threat Dragon model",
        owner: "security"
      },
      detail: {
        diagrams: [
          {
            title: "Main Request Data Flow",
            diagramType: "STRIDE",
            diagramJson: {
              cells: [
                {
                  type: "tm.Actor",
                  outOfScope: false,
                  isInScope: true,
                  threats: [
                    { title: "Spoof account", type: "Spoofing", severity: "High", status: "Open", mitigation: "Use MFA." },
                    { title: "Tamper payload", type: "Tampering", severity: "Medium", status: "Mitigated", mitigation: "Sign payloads." },
                    { title: "Deny audit event", type: "Repudiation", severity: "Low", status: "Accepted Risk", mitigation: "Retain audit logs." },
                    { title: "Leak secret", type: "Information Disclosure", severity: "High", status: "False Positive", mitigation: "Encrypt secrets." },
                    { title: "Flood API", type: "Denial of Service", severity: "High", status: "Open", mitigation: "Rate limit requests." },
                    { title: "Escalate role", type: "Elevation of Privilege", severity: "Critical", status: "Open", mitigation: "Enforce RBAC." }
                  ]
                },
                {
                  type: "tm.Store",
                  storesCredentials: true,
                  hasOpenThreats: true
                },
                {
                  type: "tm.Flow",
                  labels: ["data flow", "trust boundary", "component", "attack tree", "abuse case"]
                }
              ]
            }
          }
        ]
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "security", "threagile.yaml"), [
      "threagile_version: 1.0.0",
      "title: RepoTutor Threagile Model",
      "scope: in-scope platform with out-of-scope production dependencies",
      "data_assets:",
      "  customer-data:",
      "    title: Customer Data",
      "    confidentiality: confidential",
      "technical_assets:",
      "  web-service:",
      "    title: Web Service technical asset",
      "    type: process",
      "    usage: business",
      "    data_assets_processed: [customer-data]",
      "    data_assets_stored: [customer-data]",
      "    communication_links:",
      "      database-link:",
      "        target: database",
      "        protocol: https",
      "        data_assets_sent: [customer-data]",
      "        data_assets_received: [customer-data]",
      "  database:",
      "    title: Database technical asset",
      "    type: database",
      "    out_of_scope: false",
      "trust_boundaries:",
      "  private-network:",
      "    title: Private Network trust boundary",
      "    type: network-cloud-provider",
      "    technical_assets_inside: [web-service, database]",
      "shared_runtime:",
      "  application-runtime:",
      "    title: Shared Runtime",
      "    technical_assets_running: [web-service]",
      "risk_tracking:",
      "  unencrypted-asset:",
      "    status: accepted risk",
      "    justification: false positive reviewed",
      "    checked_by: security",
      "    ticket: SEC-1",
      "questions:",
      "  q1:",
      "    question: Are mitigations complete?",
      "    answer: unanswered",
      "abuse_cases:",
      "  account-takeover:",
      "    description: attacker performs account takeover",
      "risk_rating: high",
      "risk_severity: critical",
      "mitigation: require encryption and monitoring",
      "report: json markdown pdf excel Graphviz data-flow-diagram attack tree STRIDE"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "threat-model.md"), [
      "# Threat Model Report",
      "Open threat model report with JSON, Markdown, PDF, Excel, and Graphviz diagram output.",
      "DFD data flow diagram sequence diagram trust boundary component attack tree abuse case.",
      "STRIDE Spoofing Tampering Repudiation Information Disclosure Denial of Service Elevation of Privilege.",
      "Mitigation, accepted risk, false positive, risk tracking, severity, risk rating, and unanswered questions are reviewed."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "threat-model-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      threatModelSetups: Array<{ tool: string; readiness: string; modelCount: number; assetCount: number; dataFlowCount: number; boundaryCount: number; threatCount: number; strideCount: number; mitigationCount: number; riskTrackingCount: number; outputCount: number; ciCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      diagramSignals: Array<{ signal: string; readiness: string }>;
      assetSignals: Array<{ signal: string; readiness: string }>;
      boundarySignals: Array<{ signal: string; readiness: string }>;
      threatSignals: Array<{ signal: string; readiness: string }>;
      riskSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string }>;
    };
    const readySignals = (items: Array<{ signal: string; readiness: string }>) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Threat model readiness pytm Threat Dragon Threagile open threat model STRIDE DFD data flow diagram trust boundary technical_assets data_assets communication_links risk_tracking abuse_cases mitigation report JSON Markdown PDF Graphviz");
    expect(report.threatModelSetups.length).toBeGreaterThan(0);
    expect(Array.from(new Set(report.threatModelSetups.map((item) => item.tool)))).toEqual(expect.arrayContaining(["workflow", "package-script", "pytm", "threat-dragon", "threagile"]));
    expect(report.threatModelSetups.some((item) => item.modelCount > 0 && item.assetCount > 0 && item.dataFlowCount > 0 && item.boundaryCount > 0 && item.threatCount > 0 && item.strideCount > 0 && item.mitigationCount > 0 && item.riskTrackingCount > 0 && item.outputCount > 0)).toBe(true);
    expect(report.threatModelSetups.some((item) => item.ciCount > 0)).toBe(true);

    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining(["pytm", "threat-dragon", "threagile", "open-threat-model", "json-model", "yaml-model", "python-model"]));
    expect(readySignals(report.diagramSignals)).toEqual(expect.arrayContaining(["dfd", "sequence", "data-flow-diagram", "attack-tree", "trust-boundary", "component"]));
    expect(readySignals(report.assetSignals)).toEqual(expect.arrayContaining(["actor", "process", "datastore", "technical-asset", "data-asset", "communication-link"]));
    expect(readySignals(report.boundarySignals)).toEqual(expect.arrayContaining(["trust-boundary", "out-of-scope", "scope", "shared-runtime", "in-scope"]));
    expect(readySignals(report.threatSignals)).toEqual(expect.arrayContaining(["stride", "spoofing", "tampering", "repudiation", "information-disclosure", "denial-of-service", "elevation-of-privilege", "abuse-case"]));
    expect(readySignals(report.riskSignals)).toEqual(expect.arrayContaining(["risk-rating", "severity", "mitigation", "risk-tracking", "accepted-risk", "false-positive", "questions"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["report", "json", "markdown", "pdf", "diagram-output", "excel", "artifact-upload"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "scheduled-run", "pull-request", "docker"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["pytm", "threat-dragon", "threagile", "graphviz"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.some((item) => item.action.startsWith("Run pytm, Threat Dragon, Threagile"))).toBe(true);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"pytm|TM\\(|Dataflow\\(|Boundary\\(|Actor\\(|Server\\(|Datastore\\(|Process\\(\" .",
      "rg \"Threat Dragon|open threat model|diagramType|diagramJson|threats|mitigation|STRIDE\" .",
      "rg \"threagile_version|technical_assets|data_assets|communication_links|trust_boundaries|risk_tracking|abuse_cases|questions\" .",
      "rg \"data-flow-diagram|attack tree|STRIDE|Spoofing|Tampering|Repudiation|Information Disclosure|Denial of Service|Elevation of Privilege\" .",
      "rg \"threat-model|threat model|upload-artifact|report|graphviz|docker run .*threagile|pytm .*report\" .github ."
    ]);

    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "threat-model-readiness.md"), "utf8");
    expect(markdown).toContain("# Threat Model Readiness");
    expect(markdown).toContain("## Boundary Signals");
    expect(markdown).toContain("## Threat Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "threat-model-readiness.html"), "utf8");
    expect(html).toContain("Threat Model Readiness");
    expect(html).toContain("threat-model-readiness-card");
    expect(html).toContain("data-source-pattern=\"Threat Model\"");
    expect(html).toContain("does not execute pytm");
  });

  it("detects API gateway readiness without starting gateways or proxying traffic", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-api-gateway-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-api-gateway-source-"));
    await fs.mkdir(path.join(sourceRoot, "gateway", "kong"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "gateway", "tyk"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "gateway", "krakend"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "infra"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "gateway:kong": "deck gateway validate && deck gateway diff && deck gateway sync && deck gateway dump",
        "gateway:tyk": "tyk sync --path gateway/tyk",
        "gateway:krakend": "krakend check -c gateway/krakend/krakend.json && krakend test-plugin -scm plugins/auth.so",
        "gateway:openapi": "redocly lint openapi.yaml"
      },
      dependencies: {
        "@aws-sdk/client-api-gateway": "latest",
        "@kong/deck": "latest",
        krakend: "latest",
        "github.com/luraproject/lura": "latest",
        tyk: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "gateway", "kong", "deck.yaml"), [
      "_format_version: '3.0'",
      "services:",
      "  - name: users-service",
      "    url: http://users.internal:8080",
      "    connect_timeout: 5000",
      "    read_timeout: 5000",
      "    write_timeout: 5000",
      "    routes:",
      "      - name: users-route",
      "        paths: ['/users']",
      "        methods: ['GET', 'POST']",
      "        hosts: ['api.example.com']",
      "        strip_path: true",
      "        preserve_host: true",
      "        plugins:",
      "          - name: key-auth",
      "          - name: jwt",
      "          - name: acl",
      "          - name: openid-connect",
      "          - name: rate-limiting",
      "          - name: request-transformer",
      "          - name: response-transformer",
      "          - name: cors",
      "          - name: proxy-cache",
      "          - name: prometheus",
      "upstreams:",
      "  - name: users-upstream",
      "    algorithm: round-robin",
      "    healthchecks:",
      "      active:",
      "        healthy:",
      "          interval: 5",
      "targets:",
      "  - target: users-1.internal:8080",
      "consumers:",
      "  - username: platform-client",
      "# Kong decK deck gateway validate deck gateway diff deck gateway sync deck gateway dump x-kong-upstream-status logs metrics"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "gateway", "tyk", "api.json"), JSON.stringify({
      name: "users-tyk-api",
      use_keyless: true,
      enable_jwt: true,
      jwt_default_policies: ["users-policy"],
      auth_configs: {
        authToken: { auth_header_name: "Authorization" }
      },
      proxy: {
        listen_path: "/tyk/users/",
        target_url: "http://users.internal:8080/",
        strip_listen_path: true
      },
      global_rate_limit: { rate: 100, per: 60 },
      disable_rate_limit: false,
      disable_quota: false,
      quota_max: 10000,
      custom_middleware: { pre: [{ name: "auth_middleware" }] },
      analytics_plugin: { enable: true },
      "x-tyk-api-gateway": {
        info: { name: "users-oas" },
        middleware: { global: { trafficLimit: { enabled: true } } }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "gateway", "krakend", "krakend.json"), JSON.stringify({
      version: 3,
      name: "users-krakend",
      extra_config: {
        "telemetry/logging": { level: "DEBUG" },
        "telemetry/metrics": { collection_time: "30s" },
        "telemetry/tracing": { provider: "OpenTelemetry", exporters: ["opencensus", "jaeger", "zipkin"] },
        "auth/client-credentials": { client_id: "gateway-client" },
        "plugin/http-server": { name: "auth-plugin" }
      },
      endpoints: [
        {
          endpoint: "/krakend/users/{id}",
          method: "GET",
          extra_config: {
            "qos/ratelimit/router": { max_rate: 100, capacity: 20 },
            "modifier/lua-endpoint": { pre: "lua_pre(request.load())" }
          },
          backend: [
            {
              host: ["http://users.internal:8080"],
              url_pattern: "/users/{id}",
              extra_config: {
                "qos/ratelimit/proxy": { max_rate: 50 },
                "qos/circuit-breaker": { interval: 60 },
                "modifier/lua-backend": { pre: "pre_backend(request.load())" },
                "modifier/cel": { request: "req" }
              }
            }
          ]
        }
      ]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "infra", "cloud-api-gateway.yaml"), [
      "Resources:",
      "  HttpApi:",
      "    Type: AWS::ApiGatewayV2::Api",
      "  RestApi:",
      "    Type: AWS::ApiGateway::RestApi",
      "# apigatewayv2 google_api_gateway azurerm_api_management reverse-proxy proxy_pass mTLS client certificate oauth2 throttle retry timeout"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "api-gateway.yml"), [
      "name: api gateway readiness",
      "on: [push]",
      "jobs:",
      "  gateway:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: deck gateway validate && deck gateway diff && deck gateway sync --select-tag ci && deck gateway dump",
      "      - run: tyk sync --path gateway/tyk",
      "      - run: krakend check -c gateway/krakend/krakend.json && krakend test-plugin -scm plugins/auth.so",
      "      - run: redocly lint openapi.yaml && docker-compose config && helm template gateway charts/gateway && kubectl apply --dry-run=server -f k8s/",
      "      - run: echo '{}' > api-gateway-readiness-report.json && echo '{}' > gateway-report.json && echo '{}' > deck-report.json && echo '{}' > krakend-report.json && echo '{}' > tyk-report.json",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          path: |",
      "            api-gateway-readiness-report.json",
      "            gateway-report.json",
      "            deck-report.json",
      "            krakend-report.json",
      "            tyk-report.json"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "api-gateway-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      apiGatewaySetups: Array<{ gateway: string; routeCount: number; upstreamCount: number; authCount: number; pluginCount: number; trafficPolicyCount: number; observabilityCount: number; validationCount: number; ciCount: number }>;
      gatewaySignals: Array<{ signal: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      upstreamSignals: Array<{ signal: string; readiness: string }>;
      authSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      trafficPolicySignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("API gateway readiness Kong Service Route Plugin Consumer Upstream Target key-auth jwt acl rate-limiting decK Tyk api_definition listen_path target_url auth_configs quota analytics KrakenD endpoint backend extra_config qos/ratelimit telemetry krakend check plugin");
    expect(report.apiGatewaySetups.length).toBeGreaterThan(0);
    expect(report.apiGatewaySetups.map((item) => item.gateway)).toEqual(expect.arrayContaining(["kong", "tyk", "krakend", "cloud-api-gateway", "workflow"]));
    expect(report.apiGatewaySetups.some((item) => item.routeCount > 0 && item.upstreamCount > 0 && item.authCount > 0 && item.pluginCount > 0 && item.trafficPolicyCount > 0)).toBe(true);
    expect(report.apiGatewaySetups.some((item) => item.validationCount > 0 && item.ciCount > 0)).toBe(true);
    expect(report.apiGatewaySetups.some((item) => item.observabilityCount > 0)).toBe(true);
    expect(readySignals(report.gatewaySignals)).toEqual(expect.arrayContaining(["kong", "tyk", "krakend", "cloud-api-gateway", "reverse-proxy"]));
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["service", "route", "endpoint", "listen-path", "path-method", "host", "strip-path"]));
    expect(readySignals(report.upstreamSignals)).toEqual(expect.arrayContaining(["upstream", "target", "backend", "host", "load-balancing", "health-check", "timeout", "circuit-breaker"]));
    expect(readySignals(report.authSignals)).toEqual(expect.arrayContaining(["key-auth", "jwt", "oauth2", "openid-connect", "acl", "mtls", "auth-configs", "keyless"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["plugin", "custom-middleware", "request-transformer", "response-transformer", "cors", "cache", "cel", "lua"]));
    expect(readySignals(report.trafficPolicySignals)).toEqual(expect.arrayContaining(["rate-limiting", "quota", "throttle", "retry", "timeout", "circuit-breaker", "proxy-cache"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["prometheus", "metrics", "analytics", "tracing", "logs", "health", "status"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["deck", "deck-sync", "tyk-sync", "krakend-check", "krakend-test-plugin", "gateway-tests", "openapi"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "artifact-upload", "docker-compose", "helm", "kubernetes"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["kong", "deck", "tyk", "krakend", "lura", "gateway-api"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"_format_version|services:|routes:|plugins:|consumers:|upstreams:|deck gateway\" .",
      "rg \"api_definition|x-tyk-api-gateway|listen_path|target_url|auth_configs|enable_jwt|global_rate_limit|quota\" .",
      "rg \"krakend|endpoints|endpoint|backend|extra_config|qos/ratelimit|telemetry/metrics|krakend check|test-plugin\" .",
      "rg \"key-auth|jwt|oauth2|openid-connect|acl|mtls|use_keyless|auth_configs|api_key\" .",
      "rg \"prometheus|metrics|analytics|tracing|OpenTelemetry|health|status|upload-artifact|api-gateway-readiness-report\" .github ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "api-gateway-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "api-gateway-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "api-gateway-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "api-gateway-readiness.md"), "utf8");
    expect(markdown).toContain("Gateway Signals");
    expect(markdown).toContain("Traffic Policy Signals");
    expect(markdown).toContain("Validation Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "api-gateway-readiness.html"), "utf8");
    expect(html).toContain("api-gateway-readiness-card");
    expect(html).toContain("data-source-pattern=\"ApiGateway\"");
  });

  it("detects feature store readiness without running feature store backends", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-feature-store-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-feature-store-source-"));
    await fs.mkdir(path.join(sourceRoot, "feast"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "feathr"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "hopsworks"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "feature_repo"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        feast: "^0.44.0",
        feathr: "^1.0.0",
        hopsworks: "^4.1.0",
        redis: "^5.0.0",
        pyspark: "^3.5.0",
        "kafka-python": "^2.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "feast", "feature_store.yaml"), [
      "project: repo_tutor",
      "registry: data/registry.db",
      "provider: local",
      "offline_store:",
      "  type: snowflake",
      "  warehouse: Spark",
      "  fallback: BigQuery",
      "online_store:",
      "  type: redis",
      "  connection_string: Redis localhost",
      "feature_server: true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "feast", "features.py"), [
      "from feast import FeatureStore, Entity, FeatureView, FeatureService, Field, RequestSource, PushSource",
      "from feast.infra.offline_stores.file_source import FileSource",
      "driver = Entity(name=\"driver\", join_keys=[\"driver_id\"])",
      "batch_source = FileSource(path=\"features.parquet\", event_timestamp_column=\"event_timestamp\")",
      "stream_source = PushSource(name=\"driver_push\", batch_source=batch_source)",
      "request_source = RequestSource(name=\"request\", schema=[Field(name=\"request_context\")])",
      "view = FeatureView(name=\"driver_stats\", entities=[driver], ttl=\"1d\", schema=[Field(name=\"conv_rate\")], source=batch_source)",
      "stream_view = StreamFeatureView(name=\"driver_stream\", entities=[driver], source=stream_source)",
      "derived = OnDemandFeatureView(name=\"derived_driver\", sources=[request_source], features=[Field(name=\"derived_score\")], transform=lambda inputs: inputs)",
      "service = FeatureService(name=\"driver_model\", features=[view, stream_view, derived])",
      "store = FeatureStore(repo_path=\".\")",
      "store.apply([driver, view, stream_view, derived, service])",
      "store.get_historical_features(entity_df=entity_df, features=[\"driver_stats:conv_rate\"]).to_df()",
      "store.get_online_features(features=[\"driver_stats:conv_rate\"], entity_rows=[{\"driver_id\": 1}]).to_dict()",
      "point-in-time correct training dataset entity_df",
      "feast apply",
      "feast materialize 2026-01-01T00:00:00 2026-01-02T00:00:00",
      "feast materialize-incremental 2026-01-02T00:00:00",
      "materialize_incremental",
      "feature server serving API"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "feathr", "features.py"), [
      "from feathr import FeatureAnchor, DerivedFeature, RedisSink, MaterializationSettings",
      "from feathr import SparkSqlSource, KafkaConfig, INPUT_CONTEXT, FeatureJoinJob, FeatureGenJob",
      "anchor = FeatureAnchor(name=\"user_anchor\", source=SparkSqlSource(name=\"batch_source\", event_timestamp_column=\"event_timestamp\"), features=[])",
      "stream = KafkaConfig(brokers=[\"localhost:9092\"], topics=[\"feature_events\"])",
      "derived = DerivedFeature(name=\"derived_user\", input_features=[INPUT_CONTEXT], transform=\"feature_transformation Spark SQL Aggregation\")",
      "sink = RedisSink(table_name=\"online_features\")",
      "settings = MaterializationSettings(sinks=[sink], schedule=\"0 * * * *\")",
      "registry = FeathrRegistry(feature_registry=\"feature_registry\")",
      "join_job = FeatureJoinJob(feature_anchor_list=[anchor], feature_list=[derived])",
      "gen_job = FeatureGenJob(output_path=\"training dataset\")",
      "client.materialize_features(settings)",
      "client.get_online_features(feature_table=\"driver\", key=[\"1\"])",
      "FeatureJoin point-in-time training dataset"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "hopsworks", "feature_store.md"), [
      "# Hopsworks Feature Store API",
      "FeatureGroup and Feature View assets define online feature and offline feature serving.",
      "FeatureGroup source data connector event_timestamp ttl schema fields.",
      "TrainingDataset generation supports point-in-time correct training data.",
      "feature group online feature offline feature serving API provenance lineage.",
      "offlineFeaturestoreDbName onlineFeaturestoreDbName registry metadata.",
      "Feature Store API materialization streaming ingestion and serving paths."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "feature-store.yml"), [
      "name: feature-store",
      "on: [push]",
      "jobs:",
      "  feature-store:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: feast apply",
      "      - run: feast materialize-incremental 2026-01-02T00:00:00",
      "      - run: python -c \"client.materialize_features(settings)\"",
      "      - run: pytest tests/feature_store",
      "      - run: python -c \"store.get_historical_features(entity_df=entity_df).to_df(); store.get_online_features(features=[], entity_rows=[])\"",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: feature-store-report",
      "          path: |",
      "            registry.db",
      "            feature-store-report.json",
      "            training-dataset"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "feature-store-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      featureStoreSetups: Array<{ tool: string; definitionCount: number; entityCount: number; sourceCount: number; offlineStoreCount: number; onlineStoreCount: number; materializationCount: number; retrievalCount: number; registryCount: number; trainingDatasetCount: number; ciCount: number }>;
      definitionSignals: Array<{ signal: string; readiness: string }>;
      sourceSignals: Array<{ signal: string; readiness: string }>;
      storageSignals: Array<{ signal: string; readiness: string }>;
      retrievalSignals: Array<{ signal: string; readiness: string }>;
      materializationSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.featureStoreSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        definitionCount: totals.definitionCount + item.definitionCount,
        entityCount: totals.entityCount + item.entityCount,
        sourceCount: totals.sourceCount + item.sourceCount,
        offlineStoreCount: totals.offlineStoreCount + item.offlineStoreCount,
        onlineStoreCount: totals.onlineStoreCount + item.onlineStoreCount,
        materializationCount: totals.materializationCount + item.materializationCount,
        retrievalCount: totals.retrievalCount + item.retrievalCount,
        registryCount: totals.registryCount + item.registryCount,
        trainingDatasetCount: totals.trainingDatasetCount + item.trainingDatasetCount,
        ciCount: totals.ciCount + item.ciCount
      }), { definitionCount: 0, entityCount: 0, sourceCount: 0, offlineStoreCount: 0, onlineStoreCount: 0, materializationCount: 0, retrievalCount: 0, registryCount: 0, trainingDatasetCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Feature store readiness Feast Feathr Hopsworks FeatureStore FeatureView Entity FeatureService FeatureAnchor DerivedFeature FeatureGroup offline store online store registry materialize materialize-incremental historical features online features point-in-time training dataset feature join Redis Spark Kafka CI");
    expect(setupTotals("feast").definitionCount).toBeGreaterThan(0);
    expect(setupTotals("feast").retrievalCount).toBeGreaterThan(0);
    expect(setupTotals("feathr").definitionCount).toBeGreaterThan(0);
    expect(setupTotals("feathr").materializationCount).toBeGreaterThan(0);
    expect(setupTotals("hopsworks").definitionCount).toBeGreaterThan(0);
    expect(setupTotals("hopsworks").trainingDatasetCount).toBeGreaterThan(0);
    expect(report.featureStoreSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.definitionSignals)).toEqual(expect.arrayContaining(["entity", "feature-view", "feature-service", "feature-anchor", "derived-feature", "feature-group", "schema-field", "transform"]));
    expect(readySignals(report.sourceSignals)).toEqual(expect.arrayContaining(["batch-source", "stream-source", "request-source", "push-source", "data-source", "event-timestamp", "ttl"]));
    expect(readySignals(report.storageSignals)).toEqual(expect.arrayContaining(["offline-store", "online-store", "registry", "provider", "redis", "spark", "snowflake", "bigquery"]));
    expect(readySignals(report.retrievalSignals)).toEqual(expect.arrayContaining(["historical-features", "online-features", "point-in-time", "training-dataset", "feature-join", "entity-df", "serving-api"]));
    expect(readySignals(report.materializationSignals)).toEqual(expect.arrayContaining(["materialize-command", "incremental-materialize", "scheduled-materialization", "streaming-ingestion", "sink", "feature-server"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "feature-store-apply-command", "materialization-command", "offline-online-test-command", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["feast", "feathr", "hopsworks", "redis", "spark", "kafka"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"FeatureStore|FeatureView|Entity|FeatureService|FeatureAnchor|DerivedFeature|FeatureGroup\" .",
      "rg \"offline_store|online_store|registry|provider|Redis|Spark|Snowflake|BigQuery\" .",
      "rg \"materialize|materialize-incremental|FeatureGenJob|FeatureJoinJob|feature server|upload-artifact\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "feature-store-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "feature-store-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "feature-store-readiness.html"))).resolves.toBeUndefined();
    const featureStoreMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "feature-store-readiness.md"), "utf8");
    expect(featureStoreMarkdown).toContain("Definition Signals");
    expect(featureStoreMarkdown).toContain("Storage Signals");
    expect(featureStoreMarkdown).toContain("Materialization Signals");
    const featureStoreHtml = await fs.readFile(path.join(result.session.outputPaths.html, "feature-store-readiness.html"), "utf8");
    expect(featureStoreHtml).toContain("feature-store-readiness-card");
    expect(featureStoreHtml).toContain("data-source-pattern=\"FeatureStore\"");
  });

  it("detects model registry readiness without running registry or serving backends", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-model-registry-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-model-registry-source-"));
    await fs.mkdir(path.join(sourceRoot, "mlflow"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "kubeflow"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "bentoml"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"model-registry-fixture\"",
      "description = \"MLflow Model Registry Kubeflow Model Registry BentoML static readiness fixture\"",
      "dependencies = [\"mlflow\", \"model-registry\", \"bentoml\", \"kserve\", \"docker\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "mlflow", "registry.py"), [
      "import mlflow",
      "from mlflow.tracking import MlflowClient",
      "from mlflow.models import infer_signature",
      "client = MlflowClient()",
      "client.create_registered_model(\"fraud_model\", description=\"registered model description\")",
      "result = mlflow.register_model(\"runs:/abc123/model\", \"fraud_model\")",
      "version = client.create_model_version(name=\"fraud_model\", source=\"runs:/abc123/model\", run_id=\"abc123\", tags={\"stage\": \"candidate\", \"dataset\": \"transactions\"})",
      "client.set_registered_model_alias(\"fraud_model\", \"champion\", version.version)",
      "client.transition_model_version_stage(\"fraud_model\", version.version, stage=\"Production\", archive_existing_versions=True)",
      "client.set_model_version_tag(\"fraud_model\", version.version, \"approval\", \"approved review validated champion promotion rollback previous version Archived\")",
      "client.search_registered_models(filter_string=\"name LIKE 'fraud%'\")",
      "client.search_model_versions(\"name='fraud_model'\")",
      "client.delete_model_version(\"fraud_model\", version.version)",
      "signature = infer_signature(input_example, predictions)",
      "model_uri = \"models:/fraud_model/Production\"",
      "artifact_uri = \"s3://registry/fraud_model/version/model.pkl\"",
      "source_run_id = \"abc123\"",
      "run_id = source_run_id",
      "evaluation_metric = {\"auc\": 0.93, \"f1\": 0.82}",
      "dataset = \"transactions_training\"",
      "provenance = \"training data lineage source run\"",
      "mlflow models serve -m models:/fraud_model/Production"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "kubeflow", "model_registry.md"), [
      "# Kubeflow Model Registry Service",
      "The REST API exposes RegisteredModel, ModelVersion, ModelArtifact, ServingEnvironment, and InferenceService resources.",
      "CreateRegisteredModel, CreateModelVersion, UpsertModelVersionArtifact, FindRegisteredModel, FindModelVersion, UpdateModelVersion, DeleteModelVersion.",
      "ModelArtifact uses ARTIFACT_URI and artifact URI; GetModelVersionDownloadUri returns a download URI.",
      "customProperties MetadataStringValue versionDescription versionScore metric description tag alias stage.",
      "EmitModelVersionLineage records model version lineage, dataset link, source run, evaluation metric, and provenance.",
      "ServingEnvironment and InferenceService connect model versions to KServe serving.kserve.io deployments.",
      "REST /api/model_registry/v1alpha3/registered_models and gRPC clients are documented."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "bentoml", "service.py"), [
      "import bentoml",
      "from bentoml.models import HuggingFaceModel",
      "@bentoml.service(resources={\"cpu\": \"2\"})",
      "class Summarization:",
      "    model_ref = HuggingFaceModel(\"openai-community/gpt2\")",
      "    stored_model = bentoml.models.get(\"summarizer:latest\")",
      "    @bentoml.api",
      "    def summarize(self, text: str) -> str:",
      "        return text",
      "Bento model store ModelStore Tag version bento tag",
      "Bento build artifact model URI Dockerfile docker build docker run container image",
      "bentoml build",
      "bentoml serve",
      "bentoml containerize summarization:latest",
      "bentoml deploy summarization:latest"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "bentoml", "bentofile.yaml"), [
      "service: service:Summarization",
      "python:",
      "  packages:",
      "    - bentoml",
      "    - transformers",
      "docker:",
      "  python_version: '3.11'"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "model-registry.yml"), [
      "name: model-registry",
      "on: [push]",
      "jobs:",
      "  model-registry:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: python mlflow/registry.py",
      "      - run: mlflow models serve -m models:/fraud_model/Production --no-conda",
      "      - run: bentoml build",
      "      - run: bentoml containerize summarization:latest",
      "      - run: pytest tests/model_registry",
      "      - run: curl http://localhost:3000/healthz",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: registry-report",
      "          path: |",
      "            registry-report.json",
      "            model-uri.txt",
      "            bento tag",
      "            container image"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "model-registry-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      modelRegistrySetups: Array<{ tool: string; registeredModelCount: number; versionCount: number; artifactCount: number; metadataCount: number; aliasCount: number; stageCount: number; lineageCount: number; signatureCount: number; servingCount: number; ciCount: number }>;
      registrationSignals: Array<{ signal: string; readiness: string }>;
      metadataSignals: Array<{ signal: string; readiness: string }>;
      artifactSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      servingSignals: Array<{ signal: string; readiness: string }>;
      lineageSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.modelRegistrySetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        registeredModelCount: totals.registeredModelCount + item.registeredModelCount,
        versionCount: totals.versionCount + item.versionCount,
        artifactCount: totals.artifactCount + item.artifactCount,
        metadataCount: totals.metadataCount + item.metadataCount,
        aliasCount: totals.aliasCount + item.aliasCount,
        stageCount: totals.stageCount + item.stageCount,
        lineageCount: totals.lineageCount + item.lineageCount,
        signatureCount: totals.signatureCount + item.signatureCount,
        servingCount: totals.servingCount + item.servingCount,
        ciCount: totals.ciCount + item.ciCount
      }), { registeredModelCount: 0, versionCount: 0, artifactCount: 0, metadataCount: 0, aliasCount: 0, stageCount: 0, lineageCount: 0, signatureCount: 0, servingCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Model registry readiness MLflow Kubeflow Model Registry BentoML RegisteredModel ModelVersion ModelArtifact model URI artifact URI alias stage tag signature input example lineage serving environment inference service KServe REST gRPC Bento build containerize CI");
    expect(setupTotals("mlflow").registeredModelCount).toBeGreaterThan(0);
    expect(setupTotals("mlflow").aliasCount).toBeGreaterThan(0);
    expect(setupTotals("kubeflow").registeredModelCount).toBeGreaterThan(0);
    expect(setupTotals("kubeflow").servingCount).toBeGreaterThan(0);
    expect(setupTotals("bentoml").artifactCount).toBeGreaterThan(0);
    expect(setupTotals("bentoml").servingCount).toBeGreaterThan(0);
    expect(report.modelRegistrySetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.registrationSignals)).toEqual(expect.arrayContaining(["registered-model", "model-version", "model-artifact", "model-uri", "model-store", "bento"]));
    expect(readySignals(report.metadataSignals)).toEqual(expect.arrayContaining(["tag", "alias", "stage", "custom-property", "description", "metric", "signature", "input-example"]));
    expect(readySignals(report.artifactSignals)).toEqual(expect.arrayContaining(["artifact-uri", "model-uri", "download-uri", "container-image", "dockerfile", "bento-build", "package-config"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["create", "update", "search", "delete", "transition-stage", "approval", "promotion", "rollback"]));
    expect(readySignals(report.servingSignals)).toEqual(expect.arrayContaining(["inference-service", "serving-environment", "kserve", "model-server", "rest-api", "grpc", "bento-serve", "deployment"]));
    expect(readySignals(report.lineageSignals)).toEqual(expect.arrayContaining(["run-link", "source-run", "model-version-lineage", "dataset-link", "evaluation-metric", "provenance"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "register-command", "model-test-command", "serving-smoke-command", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["mlflow", "kubeflow-model-registry", "bentoml", "kserve", "docker"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"RegisteredModel|registered_model|register_model|ModelVersion|model version\" .",
      "rg \"ModelArtifact|artifact_uri|model_uri|models:/|download URI|bentoml build|containerize\" .",
      "rg \"InferenceService|ServingEnvironment|KServe|REST|gRPC|bentoml serve|deployment\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "model-registry-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "model-registry-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "model-registry-readiness.html"))).resolves.toBeUndefined();
    const modelRegistryMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "model-registry-readiness.md"), "utf8");
    expect(modelRegistryMarkdown).toContain("Registration Signals");
    expect(modelRegistryMarkdown).toContain("Artifact Signals");
    expect(modelRegistryMarkdown).toContain("Serving Signals");
    const modelRegistryHtml = await fs.readFile(path.join(result.session.outputPaths.html, "model-registry-readiness.html"), "utf8");
    expect(modelRegistryHtml).toContain("model-registry-readiness-card");
    expect(modelRegistryHtml).toContain("data-source-pattern=\"ModelRegistry\"");
  });

  it("detects experiment tracking readiness without running tracking SDKs or sync commands", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-experiment-tracking-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-experiment-tracking-source-"));
    await fs.mkdir(path.join(sourceRoot, "mlflow"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "wandb"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "neptune"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"experiment-tracking-fixture\"",
      "description = \"MLflow Tracking Weights & Biases W&B Neptune experiment tracking static readiness fixture\"",
      "dependencies = [\"mlflow\", \"wandb\", \"neptune\", \"tensorboard\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "mlflow", "tracking.py"), [
      "import mlflow",
      "mlflow.set_tracking_uri(\"http://localhost:5000\")",
      "mlflow.set_experiment(experiment_name=\"fraud-baseline\")",
      "mlflow.sklearn.autolog(log_input_examples=True, log_model_signatures=True)",
      "callback = \"MLflowCallback TrainerCallback tracking callback\"",
      "with mlflow.start_run(run_name=\"candidate\", tags={\"stage\": \"candidate\", \"git_commit\": \"abc123\", \"environment\": \"ci\"}) as active_run:",
      "    run_id = active_run.info.run_id",
      "    experiment_id = active_run.info.experiment_id",
      "    mlflow.log_param(\"depth\", 6)",
      "    mlflow.log_params({\"learning_rate\": 0.03, \"seed\": 42})",
      "    mlflow.log_metric(\"auc\", 0.94)",
      "    mlflow.log_metrics({\"loss\": 0.1, \"f1\": 0.82})",
      "    mlflow.log_artifact(\"model.pkl\", artifact_path=\"models\")",
      "    mlflow.log_dict({\"summary\": \"best metric\", \"description\": \"source code dependencies requirements pip freeze\"}, \"summary.json\")",
      "    mlflow.log_table(dataframe, artifact_file=\"eval_table.json\")",
      "    mlflow.set_tag(\"source_code\", \"git diff saved\")",
      "    mlflow.set_tags({\"dataset\": \"transactions\", \"tracking-report\": \"tracking-report.json\"})",
      "    mlflow.log_input(dataset)",
      "artifact_uri = \"s3://artifact-store/mlruns/123\"",
      "tracking_server = \"MLFLOW_TRACKING_URI tracking server remote tracking artifact store\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "wandb", "train.py"), [
      "import wandb",
      "project = \"fraud-experiments\"",
      "entity = \"risk-team\"",
      "config = {\"epochs\": 5, \"lr\": 3e-4, \"hyperparameter_search\": \"hyperparameter search\"}",
      "with wandb.init(project=project, entity=entity, config=config, tags=[\"baseline\", \"offline\"], notes=\"experiment report note\", resume=\"allow\", mode=\"offline\", id=\"run-123\") as run:",
      "    run.log({\"accuracy\": 0.91, \"loss\": 0.12, \"metric\": \"auc\"})",
      "    run.summary[\"best_auc\"] = 0.91",
      "    artifact = wandb.Artifact(\"fraud-model\", type=\"model\")",
      "    table = wandb.Table(data=[[1, 0.91]], columns=[\"epoch\", \"auc\"])",
      "    image = wandb.Image(\"plot.png\")",
      "    run.log({\"table\": table, \"media\": image})",
      "    run.log_artifact(artifact)",
      "sweep_id = wandb.sweep({\"method\": \"bayes\", \"metric\": {\"name\": \"auc\"}}, project=project)",
      "wandb.agent(sweep_id, function=lambda: None)",
      "wandb.alert(title=\"training complete\", text=\"notification alert\")",
      "wandb.launch(job=\"train.py\", project=project)",
      "wandb sync wandb/offline-run-123"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "neptune", "train.py"), [
      "import neptune",
      "run = neptune.init_run(project=\"workspace/fraud\", tags=[\"candidate\"], mode=\"offline\", custom_run_id=\"NPT-123\")",
      "run[\"parameters/depth\"] = 6",
      "run[\"parameters/lr\"].assign(0.03)",
      "run[\"metrics/auc\"].append(0.95)",
      "run[\"metrics/loss\"].append(0.08)",
      "run[\"artifacts/model\"].upload(\"model.pkl\")",
      "run[\"dataset/files\"].track_files(\"data/*.parquet\")",
      "run[\"sys/tags\"].add([\"offline\", \"ci\"])",
      "run[\"description\"].assign(\"source code environment dependencies git_commit\")",
      "run.sync()",
      "run.stop()",
      "neptune sync neptune-offline workspace/fraud"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "experiment-tracking.yml"), [
      "name: experiment-tracking",
      "on: [push]",
      "jobs:",
      "  tracking:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: python mlflow/tracking.py",
      "      - run: python wandb/train.py",
      "      - run: python neptune/train.py",
      "      - run: pytest tests/experiment_tracking --metrics assertion",
      "      - run: jq '.auc > 0.9' metrics.json",
      "      - run: wandb sync wandb/offline-run-123",
      "      - run: neptune sync neptune-offline workspace/fraud",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: tracking-report",
      "          path: |",
      "            tracking-report.json",
      "            metrics.json",
      "            wandb-media",
      "            mlruns",
      "            neptune-offline"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "experiment-tracking-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      experimentTrackingSetups: Array<{ tool: string; experimentCount: number; runCount: number; metricCount: number; paramCount: number; artifactCount: number; datasetCount: number; tagCount: number; configCount: number; sweepCount: number; offlineSyncCount: number; ciCount: number }>;
      runSignals: Array<{ signal: string; readiness: string }>;
      loggingSignals: Array<{ signal: string; readiness: string }>;
      metadataSignals: Array<{ signal: string; readiness: string }>;
      automationSignals: Array<{ signal: string; readiness: string }>;
      storageSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.experimentTrackingSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        experimentCount: totals.experimentCount + item.experimentCount,
        runCount: totals.runCount + item.runCount,
        metricCount: totals.metricCount + item.metricCount,
        paramCount: totals.paramCount + item.paramCount,
        artifactCount: totals.artifactCount + item.artifactCount,
        datasetCount: totals.datasetCount + item.datasetCount,
        tagCount: totals.tagCount + item.tagCount,
        configCount: totals.configCount + item.configCount,
        sweepCount: totals.sweepCount + item.sweepCount,
        offlineSyncCount: totals.offlineSyncCount + item.offlineSyncCount,
        ciCount: totals.ciCount + item.ciCount
      }), { experimentCount: 0, runCount: 0, metricCount: 0, paramCount: 0, artifactCount: 0, datasetCount: 0, tagCount: 0, configCount: 0, sweepCount: 0, offlineSyncCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Experiment tracking readiness MLflow W&B Neptune experiment run metric param config summary artifact dataset tag tracking URI project entity sweep autolog offline sync report CI");
    expect(setupTotals("mlflow").experimentCount).toBeGreaterThan(0);
    expect(setupTotals("mlflow").metricCount).toBeGreaterThan(0);
    expect(setupTotals("wandb").runCount).toBeGreaterThan(0);
    expect(setupTotals("wandb").sweepCount).toBeGreaterThan(0);
    expect(setupTotals("neptune").artifactCount).toBeGreaterThan(0);
    expect(setupTotals("neptune").offlineSyncCount).toBeGreaterThan(0);
    expect(report.experimentTrackingSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.runSignals)).toEqual(expect.arrayContaining(["experiment", "run", "run-id", "project", "entity", "tracking-uri", "resume", "offline"]));
    expect(readySignals(report.loggingSignals)).toEqual(expect.arrayContaining(["metric", "param", "config", "summary", "artifact", "media", "table", "dataset"]));
    expect(readySignals(report.metadataSignals)).toEqual(expect.arrayContaining(["tag", "note", "description", "source-code", "environment", "dependency", "git-commit"]));
    expect(readySignals(report.automationSignals)).toEqual(expect.arrayContaining(["autolog", "sweep", "hyperparameter-search", "callback", "report", "alert", "launch-job"]));
    expect(readySignals(report.storageSignals)).toEqual(expect.arrayContaining(["tracking-server", "artifact-store", "workspace", "offline-sync", "local-cache", "remote-project"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "experiment-smoke-command", "metrics-assertion-command", "artifact-upload", "offline-sync-command"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["mlflow", "wandb", "neptune", "tensorboard", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"mlflow.set_experiment|mlflow.start_run|wandb.init|neptune.init_run|run_id|tracking_uri|project|entity\" .",
      "rg \"log_artifact|wandb.Artifact|wandb.Table|upload\\(|track_files|dataset|media|Image\" .",
      "rg \"wandb sync|neptune sync|offline|upload-artifact|tracking-report|metrics.json\" .github workflows ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "experiment-tracking-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "experiment-tracking-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "experiment-tracking-readiness.html"))).resolves.toBeUndefined();
    const experimentTrackingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "experiment-tracking-readiness.md"), "utf8");
    expect(experimentTrackingMarkdown).toContain("Run Signals");
    expect(experimentTrackingMarkdown).toContain("Automation Signals");
    expect(experimentTrackingMarkdown).toContain("Storage Signals");
    const experimentTrackingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "experiment-tracking-readiness.html"), "utf8");
    expect(experimentTrackingHtml).toContain("experiment-tracking-readiness-card");
    expect(experimentTrackingHtml).toContain("data-source-pattern=\"ExperimentTracking\"");
  });

  it("detects model monitoring readiness without running monitoring SDKs or drift jobs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-model-monitoring-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-model-monitoring-source-"));
    await fs.mkdir(path.join(sourceRoot, "evidently"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "whylogs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "nannyml"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"model-monitoring-fixture\"",
      "description = \"Evidently whylogs WhyLabs NannyML model monitoring static readiness fixture\"",
      "dependencies = [\"evidently\", \"whylogs\", \"whylabs-client\", \"nannyml\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "evidently", "monitoring.py"), [
      "from evidently import Report",
      "from evidently.presets import DataDriftPreset, DataQualityPreset, ClassificationPreset, RegressionPreset",
      "from evidently.legacy.metrics import DatasetDriftMetric",
      "from evidently.metrics import ColumnDriftMetric",
      "from evidently.test_suite import TestSuite",
      "from evidently.tests import DataDriftTestPreset",
      "reference_data = load_reference_data()",
      "current_data = load_current_data()",
      "prediction_column = \"prediction\"",
      "target_column = \"target\"",
      "timestamp_column = \"timestamp\"",
      "segments = current_data.groupby(\"segment\")",
      "report = Report([DataDriftPreset(), DataQualityPreset(), ClassificationPreset(), RegressionPreset(), DatasetDriftMetric(), ColumnDriftMetric(column_name=prediction_column)])",
      "snapshot = report.run(reference_data, current_data)",
      "test_suite = TestSuite(tests=[DataDriftTestPreset()])",
      "test_report = test_suite.run(reference_data=reference_data, current_data=current_data)",
      "workspace = \"monitoring workspace dashboard\"",
      "snapshot.json()",
      "snapshot.save_html(\"drift-report.html\")",
      "alert = \"alert threshold notification if failed test abnormal drift\"",
      "threshold_assertion = \"jq '.drift < 0.1' monitoring-report.json\"",
      "drift_comment = \"prediction drift target distribution target drift model output drift\"",
      "custom_monitor = \"model monitor dashboard snapshot export\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "whylogs", "profile.py"), [
      "import whylogs as why",
      "from whylogs.core import DatasetProfileView",
      "from whylogs.core.schema import DatasetSchema, ColumnSchema",
      "from whylogs.core.constraints import ConstraintsBuilder, MetricsSelector, Condition",
      "from whylogs.experimental.core.validators import Validator",
      "reference_df = load_reference_df()",
      "analysis_df = load_analysis_df()",
      "schema = DatasetSchema(types={\"prediction\": float, \"target\": int, \"timestamp\": str}, columns={\"segment\": ColumnSchema()})",
      "reference_profile = why.log(reference_df, schema=schema).profile().view()",
      "current_profile = why.log(analysis_df, schema=schema).profile().view()",
      "profile_view = DatasetProfileView.merge(reference_profile, current_profile)",
      "constraints = ConstraintsBuilder(profile_view)",
      "constraints.add_constraint(MetricsSelector.mean(\"prediction\") < 0.8)",
      "validator = Validator(name=\"missing values outlier schema validation data quality Condition\", conditions=[Condition()])",
      "writer = current_profile.writer(\"whylabs\")",
      "writer.write()",
      "reference_profile.writer(\"whylabs_reference\").write()",
      "drift = \"detect data drift concept drift training-serving skew model performance degradation missing values outliers\"",
      "profile_view.serialize()",
      "segment = \"segmentation partition chunk\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "nannyml", "monitor.py"), [
      "import nannyml as nml",
      "from nannyml.drift.univariate import UnivariateDriftCalculator",
      "from nannyml.drift.multivariate.data_reconstruction import DataReconstructionDriftCalculator",
      "from nannyml.performance_estimation.confidence_based import CBPE",
      "from nannyml.performance_estimation.direct_loss_estimation import DLE",
      "from nannyml.performance_calculation import PerformanceCalculator",
      "from nannyml.thresholds import ConstantThreshold, StandardDeviationThreshold",
      "reference = load_reference()",
      "analysis = load_analysis()",
      "feature_column_names = [\"age\", \"amount\"]",
      "y_pred = \"prediction\"",
      "y_pred_proba = \"prediction_score\"",
      "y_true = \"target\"",
      "timestamp_column_name = \"timestamp\"",
      "univariate = UnivariateDriftCalculator(column_names=feature_column_names, timestamp_column_name=timestamp_column_name, thresholds={\"amount\": ConstantThreshold(upper=0.2)})",
      "univariate.fit(reference)",
      "univariate_results = univariate.calculate(analysis)",
      "multivariate = DataReconstructionDriftCalculator(column_names=feature_column_names, chunk_size=500, threshold=StandardDeviationThreshold())",
      "multivariate.fit(reference)",
      "multivariate_results = multivariate.calculate(analysis)",
      "cbpe = CBPE(metrics=[\"roc_auc\", \"accuracy\", \"f1\"], y_pred_proba=y_pred_proba, y_pred=y_pred, y_true=y_true, problem_type=\"classification_binary\")",
      "cbpe.fit(reference)",
      "estimated_performance = cbpe.estimate(analysis)",
      "dle = DLE(metrics=[\"rmse\", \"mae\"], y_pred=y_pred, y_true=y_true, feature_column_names=feature_column_names)",
      "dle.fit(reference)",
      "estimated_regression = dle.estimate(analysis)",
      "realized = PerformanceCalculator(metrics=[\"roc_auc\", \"precision\", \"recall\"], y_pred=y_pred, y_true=y_true)",
      "realized_performance = realized.calculate(analysis)",
      "alerts = \"upper_threshold lower_threshold alert flag notification monitor schedule daily\"",
      "univariate_results.to_df().to_json(\"nannyml-results.json\")"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "model-monitoring.yml"), [
      "name: model-monitoring",
      "on: [push, schedule, workflow_dispatch]",
      "jobs:",
      "  monitoring:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: python evidently/monitoring.py",
      "      - run: python whylogs/profile.py",
      "      - run: python nannyml/monitor.py",
      "      - run: pytest tests/model_monitoring --drift-test",
      "      - run: jq '.drift < 0.1 and .threshold < 0.2' monitoring-report.json",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: monitoring-report",
      "          path: |",
      "            monitoring-report.json",
      "            drift-report.html",
      "            whylogs-profile.bin",
      "            nannyml-results"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "model-monitoring-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      modelMonitoringSetups: Array<{ tool: string; referenceCount: number; currentCount: number; driftCount: number; qualityCount: number; performanceCount: number; reportCount: number; alertCount: number; scheduleCount: number; ciCount: number }>;
      datasetSignals: Array<{ signal: string; readiness: string }>;
      driftSignals: Array<{ signal: string; readiness: string }>;
      qualitySignals: Array<{ signal: string; readiness: string }>;
      performanceSignals: Array<{ signal: string; readiness: string }>;
      reportingSignals: Array<{ signal: string; readiness: string }>;
      alertSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.modelMonitoringSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        referenceCount: totals.referenceCount + item.referenceCount,
        currentCount: totals.currentCount + item.currentCount,
        driftCount: totals.driftCount + item.driftCount,
        qualityCount: totals.qualityCount + item.qualityCount,
        performanceCount: totals.performanceCount + item.performanceCount,
        reportCount: totals.reportCount + item.reportCount,
        alertCount: totals.alertCount + item.alertCount,
        scheduleCount: totals.scheduleCount + item.scheduleCount,
        ciCount: totals.ciCount + item.ciCount
      }), { referenceCount: 0, currentCount: 0, driftCount: 0, qualityCount: 0, performanceCount: 0, reportCount: 0, alertCount: 0, scheduleCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Model monitoring readiness Evidently whylogs WhyLabs NannyML reference current analysis drift data quality performance report dashboard snapshot alert threshold CI");
    expect(setupTotals("evidently").driftCount).toBeGreaterThan(0);
    expect(setupTotals("evidently").reportCount).toBeGreaterThan(0);
    expect(setupTotals("whylogs").qualityCount).toBeGreaterThan(0);
    expect(setupTotals("whylogs").reportCount).toBeGreaterThan(0);
    expect(setupTotals("nannyml").performanceCount).toBeGreaterThan(0);
    expect(setupTotals("nannyml").alertCount).toBeGreaterThan(0);
    expect(report.modelMonitoringSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.datasetSignals)).toEqual(expect.arrayContaining(["reference-data", "current-data", "analysis-data", "column-schema", "prediction-column", "target-column", "segment", "timestamp"]));
    expect(readySignals(report.driftSignals)).toEqual(expect.arrayContaining(["data-drift", "prediction-drift", "target-drift", "concept-drift", "univariate-drift", "multivariate-drift"]));
    expect(readySignals(report.qualitySignals)).toEqual(expect.arrayContaining(["missing-values", "outliers", "data-quality", "schema-validation", "constraints", "validators"]));
    expect(readySignals(report.performanceSignals)).toEqual(expect.arrayContaining(["classification", "regression", "estimated-performance", "realized-performance", "threshold"]));
    expect(readySignals(report.reportingSignals)).toEqual(expect.arrayContaining(["report", "test-suite", "dashboard", "snapshot", "workspace", "export"]));
    expect(readySignals(report.alertSignals)).toEqual(expect.arrayContaining(["alert", "threshold", "notification", "monitor", "schedule"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "monitoring-smoke-command", "drift-test-command", "report-upload", "threshold-assertion-command"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["evidently", "whylogs", "whylabs", "nannyml", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"reference_data|current_data|analysis_df|reference period|prediction|target|timestamp|segment\" .",
      "rg \"DataDriftPreset|ColumnDriftMetric|UnivariateDriftCalculator|DataReconstructionDriftCalculator|target distribution|concept drift\" .",
      "rg \"monitoring-report|drift-report|snapshot|dashboard|upload-artifact|pytest .*drift|jq .*threshold\" .github workflows ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "model-monitoring-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "model-monitoring-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "model-monitoring-readiness.html"))).resolves.toBeUndefined();
    const modelMonitoringMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "model-monitoring-readiness.md"), "utf8");
    expect(modelMonitoringMarkdown).toContain("Dataset Signals");
    expect(modelMonitoringMarkdown).toContain("Drift Signals");
    expect(modelMonitoringMarkdown).toContain("Performance Signals");
    const modelMonitoringHtml = await fs.readFile(path.join(result.session.outputPaths.html, "model-monitoring-readiness.html"), "utf8");
    expect(modelMonitoringHtml).toContain("model-monitoring-readiness-card");
    expect(modelMonitoringHtml).toContain("data-source-pattern=\"ModelMonitoring\"");
  });

  it("detects model serving readiness without running inference services or smoke probes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-model-serving-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-model-serving-source-"));
    await fs.mkdir(path.join(sourceRoot, "kserve"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "seldon"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "triton", "model_repository", "fraud", "1"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"model-serving-fixture\"",
      "description = \"KServe Seldon Triton BentoML custom model server predict endpoint model serving static readiness fixture\"",
      "dependencies = [\"kserve\", \"seldon-core\", \"tritonclient[grpc]\", \"bentoml\", \"kubernetes\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "kserve", "inferenceservice.yaml"), [
      "apiVersion: serving.kserve.io/v1beta1",
      "kind: InferenceService",
      "metadata:",
      "  name: fraud",
      "  annotations:",
      "    autoscaling.knative.dev/minScale: \"1\"",
      "    autoscaling.knative.dev/maxScale: \"5\"",
      "    autoscaling.knative.dev/scale-to-zero: \"true\"",
      "    prometheus.io/scrape: \"true\"",
      "spec:",
      "  predictor:",
      "    minReplicas: 1",
      "    maxReplicas: 5",
      "    containerConcurrency: 8",
      "    scaleTarget: 16",
      "    serviceAccountName: fraud-serving",
      "    imagePullSecrets:",
      "      - name: registry-secret",
      "    nodeSelector:",
      "      accelerator: nvidia",
      "    tolerations:",
      "      - key: gpu",
      "        operator: Exists",
      "    model:",
      "      modelFormat:",
      "        name: sklearn",
      "      storageUri: s3://models/fraud",
      "      secretName: model-store-secret",
      "      protocolVersion: v2",
      "      resources:",
      "        requests:",
      "          cpu: \"1\"",
      "          memory: 2Gi",
      "          nvidia.com/gpu: \"1\"",
      "    readinessProbe:",
      "      httpGet:",
      "        path: /v2/health/ready",
      "        port: 8080",
      "    livenessProbe:",
      "      httpGet:",
      "        path: /health",
      "        port: 8080",
      "    startupProbe:",
      "      httpGet:",
      "        path: /healthz",
      "        port: 8080",
      "  transformer:",
      "    containers:",
      "      - image: fraud-transformer",
      "  explainer:",
      "    alibi:",
      "      type: AnchorTabular",
      "  canaryTrafficPercent: 20",
      "status:",
      "  conditions:",
      "    - type: ModelReady",
      "      status: \"True\"",
      "---",
      "apiVersion: serving.kserve.io/v1alpha1",
      "kind: ServingRuntime",
      "metadata:",
      "  name: fraud-runtime",
      "spec:",
      "  supportedModelFormats:",
      "    - name: sklearn",
      "  containers:",
      "    - image: kserve/sklearnserver:latest",
      "---",
      "apiVersion: serving.kserve.io/v1alpha1",
      "kind: ClusterServingRuntime",
      "metadata:",
      "  name: fraud-cluster-runtime"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "seldon", "deployment.yaml"), [
      "apiVersion: machinelearning.seldon.io/v1",
      "kind: SeldonDeployment",
      "metadata:",
      "  name: fraud-seldon",
      "spec:",
      "  predictors:",
      "    - name: default",
      "      replicas: 2",
      "      minReplicas: 1",
      "      maxReplicas: 4",
      "      traffic: 80",
      "      shadow: true",
      "      graph:",
      "        name: fraud-model",
      "        implementation: TRITON_SERVER",
      "        modelUri: gs://models/fraud",
      "        serviceType: MODEL",
      "        endpoint:",
      "          type: REST",
      "        children:",
      "          - name: fraud-transformer",
      "            implementation: MLSERVER",
      "      explainer:",
      "        type: anchor_tabular",
      "      componentSpecs:",
      "        - spec:",
      "            containers:",
      "              - name: fraud-model",
      "                resources:",
      "                  requests:",
      "                    cpu: \"500m\"",
      "                    memory: 1Gi",
      "                readinessProbe:",
      "                  httpGet:",
      "                    path: /health",
      "                    port: 9000",
      "                livenessProbe:",
      "                  httpGet:",
      "                    path: /health",
      "                    port: 9000",
      "  annotations:",
      "    autoscaling: HorizontalPodAutoscaler HPA autoscaling/v2",
      "    ambassador: gateway ambassador traffic split load balancing fallback",
      "    inferenceGraph: InferenceGraph"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "triton", "model_repository", "fraud", "config.pbtxt"), [
      "name: \"fraud\"",
      "platform: \"onnxruntime_onnx\"",
      "backend: \"onnxruntime\"",
      "max_batch_size: 32",
      "dynamic_batching { preferred_batch_size: [4, 8] }",
      "sequence_batching { max_sequence_idle_microseconds: 1000 }",
      "instance_group [ { kind: KIND_GPU count: 1 } ]",
      "input [ { name: \"features\" data_type: TYPE_FP32 dims: [8] } ]",
      "output [ { name: \"score\" data_type: TYPE_FP32 dims: [1] } ]",
      "ensemble_scheduling { step [ { model_name: \"fraud\" } ] }",
      "model_repository = \"/models\"",
      "TRITONSERVER_ServerInferAsync inference request ModelInfer",
      "REST HTTP /v2/models/fraud/infer /v2/models/fraud/metadata /metadata",
      "gRPC inference.GRPCInferenceService/ModelInfer grpc-port 8001",
      "metrics /metrics metrics-port prometheus logging tracing OpenTelemetry access log request id"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "model-serving.yml"), [
      "name: model-serving",
      "on: [push]",
      "jobs:",
      "  serving:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: kubectl apply -f kserve/inferenceservice.yaml",
      "      - run: helm upgrade --install seldon-core seldon-core-operator",
      "      - run: tritonserver --model-repository=/models --strict-model-config=true --model-control-mode=poll --http-port=8000 --grpc-port=8001 --metrics-port=8002",
      "      - run: curl -f http://localhost:8000/v2/health/ready",
      "      - run: curl -X POST http://localhost:8000/v2/models/fraud/infer",
      "      - run: curl -X POST http://localhost:8080/predict",
      "      - run: grpcurl localhost:8001 inference.GRPCInferenceService/ModelInfer",
      "      - run: kubectl rollout status inferenceservice/fraud",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: model-serving-report",
      "          path: |",
      "            serving-report.json",
      "            triton-logs",
      "            inference-report"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "model-serving-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      modelServingSetups: Array<{ tool: string; inferenceServiceCount: number; runtimeCount: number; modelRepositoryCount: number; protocolCount: number; routingCount: number; autoscalingCount: number; healthCount: number; resourceCount: number; observabilityCount: number; ciCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      protocolSignals: Array<{ signal: string; readiness: string }>;
      routingSignals: Array<{ signal: string; readiness: string }>;
      scalingSignals: Array<{ signal: string; readiness: string }>;
      healthSignals: Array<{ signal: string; readiness: string }>;
      resourceSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.modelServingSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        inferenceServiceCount: totals.inferenceServiceCount + item.inferenceServiceCount,
        runtimeCount: totals.runtimeCount + item.runtimeCount,
        modelRepositoryCount: totals.modelRepositoryCount + item.modelRepositoryCount,
        protocolCount: totals.protocolCount + item.protocolCount,
        routingCount: totals.routingCount + item.routingCount,
        autoscalingCount: totals.autoscalingCount + item.autoscalingCount,
        healthCount: totals.healthCount + item.healthCount,
        resourceCount: totals.resourceCount + item.resourceCount,
        observabilityCount: totals.observabilityCount + item.observabilityCount,
        ciCount: totals.ciCount + item.ciCount
      }), { inferenceServiceCount: 0, runtimeCount: 0, modelRepositoryCount: 0, protocolCount: 0, routingCount: 0, autoscalingCount: 0, healthCount: 0, resourceCount: 0, observabilityCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Model serving readiness KServe Seldon Triton InferenceService ServingRuntime SeldonDeployment tritonserver model repository REST gRPC autoscaling health probes routing CI");
    expect(setupTotals("kserve").inferenceServiceCount).toBeGreaterThan(0);
    expect(setupTotals("kserve").runtimeCount).toBeGreaterThan(0);
    expect(setupTotals("seldon").routingCount).toBeGreaterThan(0);
    expect(setupTotals("triton").protocolCount).toBeGreaterThan(0);
    expect(setupTotals("triton").observabilityCount).toBeGreaterThan(0);
    expect(report.modelServingSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["inference-service", "serving-runtime", "seldon-deployment", "triton-server", "model-repository", "custom-server"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["predictor", "transformer", "explainer", "backend", "model-format", "gpu", "batching"]));
    expect(readySignals(report.protocolSignals)).toEqual(expect.arrayContaining(["rest", "grpc", "v2-protocol", "http-health", "predict-endpoint", "metadata-endpoint"]));
    expect(readySignals(report.routingSignals)).toEqual(expect.arrayContaining(["canary", "traffic-split", "shadow", "inference-graph", "gateway", "load-balancing"]));
    expect(readySignals(report.scalingSignals)).toEqual(expect.arrayContaining(["autoscaling", "min-replicas", "max-replicas", "scale-to-zero", "hpa", "concurrency"]));
    expect(readySignals(report.healthSignals)).toEqual(expect.arrayContaining(["readiness-probe", "liveness-probe", "startup-probe", "health-endpoint", "model-ready"]));
    expect(readySignals(report.resourceSignals)).toEqual(expect.arrayContaining(["cpu", "memory", "gpu", "node-selector", "tolerations", "service-account", "storage-uri", "secret"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["metrics", "logging", "tracing", "prometheus", "access-log", "request-id"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "deploy-command", "inference-smoke-command", "health-check-command", "manifest-apply", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["kserve", "seldon", "triton", "bentoml", "kubernetes", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"InferenceService|ServingRuntime|SeldonDeployment|tritonserver|bentoml serve|model server\" .",
      "rg \"REST|gRPC|/v2/models|/predict|/metadata|protocolVersion\" .",
      "rg \"readinessProbe|livenessProbe|startupProbe|/health|ModelReady|curl .*predict|grpcurl|kubectl apply|upload-artifact\" .github workflows ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "model-serving-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "model-serving-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "model-serving-readiness.html"))).resolves.toBeUndefined();
    const modelServingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "model-serving-readiness.md"), "utf8");
    expect(modelServingMarkdown).toContain("Platform Signals");
    expect(modelServingMarkdown).toContain("Protocol Signals");
    expect(modelServingMarkdown).toContain("Health Signals");
    const modelServingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "model-serving-readiness.html"), "utf8");
    expect(modelServingHtml).toContain("model-serving-readiness-card");
    expect(modelServingHtml).toContain("data-source-pattern=\"ModelServing\"");
  });

  it("detects model training readiness without running training jobs or distributed launchers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-model-training-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-model-training-source-"));
    await fs.mkdir(path.join(sourceRoot, "lightning"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "accelerate"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "ray_train"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"fraud-training\"",
      "version = \"0.1.0\"",
      "description = \"custom training loop with Lightning, Accelerate, Ray Train, Torch, TensorBoard, W&B, and MLflow\"",
      "dependencies = [\"lightning\", \"accelerate\", \"ray[train]\", \"torch\", \"tensorboard\", \"wandb\", \"mlflow\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "lightning", "train.py"), [
      "import torch",
      "from torch.optim import Adam",
      "from torch.utils.data import DataLoader",
      "from lightning import LightningDataModule, LightningModule, Trainer, seed_everything",
      "from lightning.pytorch.callbacks import EarlyStopping, LearningRateMonitor, ModelCheckpoint, ModelSummary, TQDMProgressBar",
      "from lightning.pytorch.loggers import MLFlowLogger, TensorBoardLogger, WandbLogger",
      "",
      "class FraudModule(LightningModule):",
      "    def training_step(self, batch, batch_idx):",
      "        loss = torch.tensor(0.1)",
      "        self.log(\"train_loss\", loss)",
      "        return loss",
      "",
      "    def validation_step(self, batch, batch_idx):",
      "        val_loss = torch.tensor(0.2)",
      "        self.log(\"val_loss\", val_loss)",
      "        self.log(\"accuracy\", torch.tensor(0.9))",
      "",
      "    def configure_optimizers(self):",
      "        optimizer = Adam(self.parameters(), lr=1e-3)",
      "        lr_scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=1)",
      "        return {\"optimizer\": optimizer, \"lr_scheduler\": lr_scheduler}",
      "",
      "class FraudDataModule(LightningDataModule):",
      "    def train_dataloader(self):",
      "        return DataLoader([1, 2, 3], batch_size=32)",
      "",
      "    def val_dataloader(self):",
      "        return DataLoader([4, 5, 6], batch_size=32)",
      "",
      "seed_everything(42)",
      "model = FraudModule()",
      "dm = FraudDataModule()",
      "trainer = Trainer(",
      "    max_epochs=3,",
      "    max_steps=100,",
      "    accelerator=\"gpu\",",
      "    devices=2,",
      "    num_nodes=2,",
      "    strategy=\"ddp\",",
      "    precision=\"bf16-mixed\",",
      "    accumulate_grad_batches=4,",
      "    deterministic=True,",
      "    callbacks=[",
      "        ModelCheckpoint(monitor=\"val_loss\", save_top_k=1, dirpath=\"s3://training-artifacts/checkpoints\"),",
      "        EarlyStopping(monitor=\"val_loss\"),",
      "        LearningRateMonitor(),",
      "        ModelSummary(max_depth=-1),",
      "        TQDMProgressBar(),",
      "    ],",
      "    logger=[TensorBoardLogger(\"tb_logs\"), WandbLogger(project=\"fraud\"), MLFlowLogger(experiment_name=\"fraud\")],",
      "    fast_dev_run=False,",
      "    limit_train_batches=0.1,",
      ")",
      "trainer.fit(model, datamodule=dm)",
      "trainer.fit(model, datamodule=dm, ckpt_path=\"resume_from_checkpoint.ckpt\")",
      "best_model_path = trainer.checkpoint_callback.best_model_path",
      "# TPU XLA fp16 mixed precision multi-node custom trainer notes"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "accelerate", "train.py"), [
      "import torch",
      "from accelerate import Accelerator",
      "from accelerate.state import AcceleratorState, DistributedType",
      "from accelerate.utils import ProjectConfiguration, set_seed",
      "from torch.utils.data import DataLoader",
      "",
      "set_seed(7)",
      "accelerator = Accelerator(",
      "    mixed_precision=\"fp16\",",
      "    gradient_accumulation_steps=2,",
      "    device_placement=True,",
      "    log_with=[\"tensorboard\", \"wandb\"],",
      "    project_config=ProjectConfiguration(project_dir=\"runs\", logging_dir=\"logs\"),",
      ")",
      "state = AcceleratorState()",
      "distributed_type = DistributedType.MULTI_GPU",
      "train_dataloader = DataLoader([1, 2, 3], batch_size=8)",
      "eval_dataloader = DataLoader([4, 5, 6], batch_size=8)",
      "model = torch.nn.Linear(1, 1)",
      "optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)",
      "lr_scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=1)",
      "model, optimizer, train_dataloader, eval_dataloader, lr_scheduler = accelerator.prepare(model, optimizer, train_dataloader, eval_dataloader, lr_scheduler)",
      "for batch in train_dataloader:",
      "    with accelerator.accumulate(model):",
      "        loss = model(torch.tensor([[1.0]])).sum()",
      "        accelerator.backward(loss)",
      "        accelerator.log({\"loss\": loss})",
      "accelerator.save_state(\"checkpoint\")",
      "accelerator.load_state(\"checkpoint\")",
      "device = accelerator.device",
      "# accelerate launch --num_processes 4 train.py",
      "# DistributedType.XLA XLA bf16 TPU torchrun multi-node"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "ray_train", "train.py"), [
      "import ray.train",
      "from ray.train import Checkpoint, CheckpointConfig, FailureConfig, RunConfig, ScalingConfig",
      "from ray.train.torch import TorchTrainer",
      "from ray.train.lightning import RayDDPStrategy, RayDeepSpeedStrategy, RayFSDPStrategy, RayLightningEnvironment, RayTrainReportCallback, prepare_trainer",
      "",
      "def train_loop_per_worker(config):",
      "    shard = ray.train.get_dataset_shard(\"train\")",
      "    checkpoint = ray.train.get_checkpoint()",
      "    loss = 0.1",
      "    accuracy = 0.99",
      "    ray.train.report({\"loss\": loss, \"accuracy\": accuracy}, checkpoint=Checkpoint.from_directory(\"checkpoint\"))",
      "",
      "trainer = TorchTrainer(",
      "    train_loop_per_worker,",
      "    scaling_config=ScalingConfig(num_workers=2, use_gpu=True, resources_per_worker={\"GPU\": 1}),",
      "    run_config=RunConfig(",
      "        storage_path=\"s3://training-artifacts\",",
      "        checkpoint_config=CheckpointConfig(num_to_keep=2, checkpoint_score_attribute=\"val_loss\"),",
      "        failure_config=FailureConfig(max_failures=2),",
      "    ),",
      "    resume_from_checkpoint=Checkpoint.from_directory(\"checkpoint\"),",
      ")",
      "ray_ddp = RayDDPStrategy()",
      "ray_fsdp = RayFSDPStrategy()",
      "ray_deepspeed = RayDeepSpeedStrategy()",
      "ray_callback = RayTrainReportCallback()",
      "ray_env = RayLightningEnvironment()",
      "prepared = prepare_trainer(trainer)",
      "# ray train distributed smoke checkpoint assertion"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "model-training.yml"), [
      "name: model-training",
      "on: [push]",
      "jobs:",
      "  training:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: python lightning/train.py --fast-dev-run",
      "      - run: accelerate launch --num_processes 4 accelerate/train.py",
      "      - run: torchrun --nproc_per_node=2 lightning/train.py",
      "      - run: python ray_train/train.py --training-smoke",
      "      - run: pytest tests/training --checkpoint assertion",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: training-report",
      "          path: |",
      "            training-report.json",
      "            checkpoints",
      "            tensorboard",
      "            mlruns"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "model-training-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      modelTrainingSetups: Array<{ tool: string; trainerCount: number; trainingLoopCount: number; dataCount: number; optimizerCount: number; distributedCount: number; acceleratorCount: number; checkpointCount: number; callbackCount: number; metricCount: number; configCount: number; ciCount: number }>;
      loopSignals: Array<{ signal: string; readiness: string }>;
      dataSignals: Array<{ signal: string; readiness: string }>;
      distributedSignals: Array<{ signal: string; readiness: string }>;
      acceleratorSignals: Array<{ signal: string; readiness: string }>;
      checkpointSignals: Array<{ signal: string; readiness: string }>;
      callbackSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setupTotals = (tool: string) => report.modelTrainingSetups
      .filter((item) => item.tool === tool)
      .reduce((totals, item) => ({
        trainerCount: totals.trainerCount + item.trainerCount,
        trainingLoopCount: totals.trainingLoopCount + item.trainingLoopCount,
        dataCount: totals.dataCount + item.dataCount,
        optimizerCount: totals.optimizerCount + item.optimizerCount,
        distributedCount: totals.distributedCount + item.distributedCount,
        acceleratorCount: totals.acceleratorCount + item.acceleratorCount,
        checkpointCount: totals.checkpointCount + item.checkpointCount,
        callbackCount: totals.callbackCount + item.callbackCount,
        metricCount: totals.metricCount + item.metricCount,
        configCount: totals.configCount + item.configCount,
        ciCount: totals.ciCount + item.ciCount
      }), { trainerCount: 0, trainingLoopCount: 0, dataCount: 0, optimizerCount: 0, distributedCount: 0, acceleratorCount: 0, checkpointCount: 0, callbackCount: 0, metricCount: 0, configCount: 0, ciCount: 0 });

    expect(report.sourcePattern).toBe("Model training readiness Lightning Accelerate Ray Train Trainer LightningModule Accelerator TorchTrainer train loop checkpoint distributed precision callback metrics CI");
    expect(setupTotals("lightning").trainerCount).toBeGreaterThan(0);
    expect(setupTotals("lightning").checkpointCount).toBeGreaterThan(0);
    expect(setupTotals("accelerate").trainingLoopCount).toBeGreaterThan(0);
    expect(setupTotals("accelerate").acceleratorCount).toBeGreaterThan(0);
    expect(setupTotals("ray").distributedCount).toBeGreaterThan(0);
    expect(setupTotals("ray").checkpointCount).toBeGreaterThan(0);
    expect(report.modelTrainingSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.loopSignals)).toEqual(expect.arrayContaining(["trainer", "train-loop", "fit", "training-step", "validation-step", "optimizer", "scheduler", "gradient-accumulation"]));
    expect(readySignals(report.dataSignals)).toEqual(expect.arrayContaining(["dataloader", "datamodule", "dataset-shard", "prepare-dataloader", "batch-size", "validation-loader"]));
    expect(readySignals(report.distributedSignals)).toEqual(expect.arrayContaining(["ddp", "fsdp", "deepspeed", "torchrun", "accelerate-launch", "ray-train", "multi-gpu", "multi-node"]));
    expect(readySignals(report.acceleratorSignals)).toEqual(expect.arrayContaining(["gpu", "tpu", "xla", "mixed-precision", "bf16", "fp16", "device-placement"]));
    expect(readySignals(report.checkpointSignals)).toEqual(expect.arrayContaining(["checkpoint", "resume", "save-state", "load-state", "artifact-storage", "best-model"]));
    expect(readySignals(report.callbackSignals)).toEqual(expect.arrayContaining(["early-stopping", "lr-monitor", "model-summary", "progress-bar", "ray-report-callback", "custom-callback"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["metric", "logger", "tensorboard", "wandb", "mlflow", "report"]));
    expect(readySignals(report.configSignals)).toEqual(expect.arrayContaining(["trainer-config", "scaling-config", "run-config", "project-config", "seed", "deterministic"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "training-smoke-command", "distributed-smoke-command", "checkpoint-assertion-command", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["lightning", "accelerate", "ray", "torch", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      String.raw`rg "LightningModule|Trainer\(|Accelerator\(|TorchTrainer|train_loop_per_worker|training_step|fit\(" .`,
      "rg \"DDP|FSDP|DeepSpeed|torchrun|accelerate launch|ScalingConfig|num_workers|multi_gpu|multi-node\" .",
      "rg \"EarlyStopping|LearningRateMonitor|TensorBoardLogger|WandbLogger|MLFlowLogger|ray.train.report|upload-artifact|training smoke\" .github workflows ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "model-training-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "model-training-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "model-training-readiness.html"))).resolves.toBeUndefined();
    const modelTrainingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "model-training-readiness.md"), "utf8");
    expect(modelTrainingMarkdown).toContain("Loop Signals");
    expect(modelTrainingMarkdown).toContain("Distributed Signals");
    expect(modelTrainingMarkdown).toContain("Checkpoint Signals");
    const modelTrainingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "model-training-readiness.html"), "utf8");
    expect(modelTrainingHtml).toContain("model-training-readiness-card");
    expect(modelTrainingHtml).toContain("data-source-pattern=\"ModelTraining\"");
  });

  it("detects browser extension readiness without running extension toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-browser-extension-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-browser-extension-source-"));
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "popup"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "options"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "sidepanel"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "devtools"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "entrypoints", "newtab"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "contents"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "extension-demo",
      version: "1.0.0",
      scripts: {
        dev: "wxt dev --browser chrome",
        build: "wxt build --browser chrome",
        zip: "wxt zip --browser chrome",
        submit: "wxt submit --chrome-zip .output/extension.zip",
        "plasmo:dev": "plasmo dev",
        "plasmo:build": "plasmo build",
        "plasmo:package": "plasmo package",
        "plasmo:publish": "plasmo publish",
        "web-ext:build": "web-ext build",
        "web-ext:sign": "web-ext sign"
      },
      dependencies: {
        wxt: "^0.20.0",
        plasmo: "^0.90.0",
        "@crxjs/vite-plugin": "^2.0.0",
        "webextension-polyfill": "^0.12.0",
        "@plasmohq/messaging": "^0.7.0",
        "@plasmohq/storage": "^1.15.0"
      },
      devDependencies: {
        "@types/chrome": "^0.0.300",
        "chrome-types": "^0.1.300",
        "web-ext": "^8.0.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "manifest.json"), JSON.stringify({
      manifest_version: 3,
      name: "Extension Demo",
      version: "1.0.0",
      background: { service_worker: "entrypoints/background.ts", type: "module" },
      action: { default_popup: "entrypoints/popup/index.html" },
      options_page: "entrypoints/options/index.html",
      side_panel: { default_path: "entrypoints/sidepanel/index.html" },
      devtools_page: "entrypoints/devtools/index.html",
      chrome_url_overrides: { newtab: "entrypoints/newtab/index.html" },
      permissions: ["activeTab", "scripting", "storage", "declarativeNetRequest", "tabs"],
      host_permissions: ["https://*/*"],
      optional_permissions: ["cookies"],
      optional_host_permissions: ["https://example.com/*"],
      content_scripts: [{ matches: ["https://github.com/*"], js: ["contents/github.ts"] }],
      web_accessible_resources: [{ resources: ["assets/*"], matches: ["https://github.com/*"] }],
      content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" },
      declarative_net_request: { rule_resources: [{ id: "rules", enabled: true, path: "rules.json" }] }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "wxt.config.ts"), [
      "import { defineConfig } from 'wxt';",
      "export default defineConfig({",
      "  srcDir: '.',",
      "  outDir: '.output',",
      "  targetBrowsers: ['chrome', 'firefox', 'edge'],",
      "  manifest: { manifest_version: 3, name: 'Extension Demo', permissions: ['storage', 'scripting'], host_permissions: ['https://*/*'] },",
      "  zip: { artifactTemplate: '{{name}}-{{version}}-{{browser}}.zip' },",
      "  runner: { startUrls: ['https://github.com'] }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "plasmo.config.ts"), "export default { manifest: { host_permissions: ['https://*/*'], permissions: ['storage'] }, browser: 'chrome' };\n");
    await fs.writeFile(path.join(sourceRoot, "vite.config.ts"), [
      "import { defineConfig } from 'vite';",
      "import { crx, defineManifest } from '@crxjs/vite-plugin';",
      "const manifest = defineManifest({ manifest_version: 3, name: 'CRX Demo', version: '1.0.0', content_scripts: [{ matches: ['https://github.com/*'], js: ['contents/github.ts'] }] });",
      "export default defineConfig({ plugins: [crx({ manifest })] });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "background.ts"), [
      "import browser from 'webextension-polyfill';",
      "import { defineExtensionMessaging } from 'wxt/utils/messaging';",
      "import { Storage } from '@plasmohq/storage';",
      "const storage = new Storage();",
      "export const messaging = defineExtensionMessaging();",
      "chrome.runtime.onInstalled.addListener(() => chrome.storage.local.set({ ready: true }));",
      "chrome.runtime.onMessage.addListener((message, sender, sendResponse) => sendResponse({ ok: true }));",
      "chrome.runtime.onConnect.addListener((port) => port.postMessage({ connected: true }));",
      "chrome.tabs.sendMessage(1, { kind: 'ping' });",
      "browser.runtime.sendMessage({ kind: 'browser-runtime' });",
      "chrome.scripting.executeScript({ target: { tabId: 1 }, files: ['contents/github.js'] });",
      "chrome.declarativeNetRequest.updateDynamicRules({ addRules: [], removeRuleIds: [] });",
      "chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['DOM_PARSER'], justification: 'parse' });",
      "storage.set('mode', 'demo');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "contents", "github.ts"), [
      "import { sendToBackground } from '@plasmohq/messaging';",
      "chrome.runtime.sendMessage({ kind: 'content-ready' });",
      "sendToBackground({ name: 'content-ready', body: { url: location.href } });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "popup", "index.html"), "<main>Popup</main>\n");
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "options", "index.html"), "<main>Options</main>\n");
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "sidepanel", "index.html"), "<main>Side panel</main>\n");
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "devtools", "index.html"), "<main>Devtools</main>\n");
    await fs.writeFile(path.join(sourceRoot, "entrypoints", "newtab", "index.html"), "<main>New tab</main>\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "extension.yml"), [
      "name: browser-extension",
      "on: [push]",
      "jobs:",
      "  package:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: wxt build && wxt zip && wxt submit",
      "      - run: plasmo build && plasmo package && plasmo publish",
      "      - run: web-ext build && web-ext sign",
      "      - run: echo Chrome Web Store addons.mozilla.org Edge Add-ons Browser Platform Publisher AMO_JWT HMR hot reload extension zip",
      "      - uses: actions/upload-artifact@v4",
      "      - uses: softprops/action-gh-release@v2"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "browser-extension-readiness-report.json"), "utf8")) as {
      extensionSetups: Array<{ filePath: string; framework: string; manifestCount: number; entrypointCount: number; permissionCount: number; hostPermissionCount: number; messagingCount: number; storageCount: number; uiSurfaceCount: number; buildCount: number; publishCount: number }>;
      manifestSignals: Array<{ signal: string; readiness: string }>;
      entrypointSignals: Array<{ signal: string; readiness: string }>;
      permissionSignals: Array<{ signal: string; readiness: string }>;
      messagingSignals: Array<{ signal: string; readiness: string }>;
      buildSignals: Array<{ signal: string; readiness: string }>;
      publishSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const manifestSetup = report.extensionSetups.find((item) => item.filePath === "manifest.json");
    expect(report.extensionSetups.length).toBeGreaterThan(0);
    expect(manifestSetup?.framework).toBe("manifest");
    expect(manifestSetup?.manifestCount).toBeGreaterThan(0);
    expect(manifestSetup?.entrypointCount).toBeGreaterThan(0);
    expect(manifestSetup?.permissionCount).toBeGreaterThan(0);
    expect(manifestSetup?.hostPermissionCount).toBeGreaterThan(0);
    expect(report.extensionSetups.some((item) => item.framework === "wxt" && item.manifestCount > 0)).toBe(true);
    expect(report.extensionSetups.some((item) => item.framework === "plasmo" && item.permissionCount > 0)).toBe(true);
    expect(report.extensionSetups.some((item) => item.framework === "crxjs" && item.buildCount > 0)).toBe(true);
    expect(report.extensionSetups.some((item) => item.messagingCount > 0 && item.storageCount > 0)).toBe(true);
    expect(report.extensionSetups.some((item) => item.publishCount > 0)).toBe(true);
    expect(readySignals(report.manifestSignals)).toEqual(expect.arrayContaining(["manifest-v3", "manifest-json", "generated-manifest", "wxt-config", "plasmo-config", "crxjs-plugin", "browser-targets"]));
    expect(readySignals(report.entrypointSignals)).toEqual(expect.arrayContaining(["background", "service-worker", "content-script", "popup", "options", "side-panel", "devtools", "offscreen", "newtab"]));
    expect(readySignals(report.permissionSignals)).toEqual(expect.arrayContaining(["permissions", "host-permissions", "optional-permissions", "optional-host-permissions", "active-tab", "scripting", "storage", "declarative-net-request", "web-accessible-resources", "content-security-policy"]));
    expect(readySignals(report.messagingSignals)).toEqual(expect.arrayContaining(["chrome-runtime", "browser-runtime", "send-message", "runtime-connect", "tabs-message", "plasmo-messaging", "wxt-messaging", "webextension-polyfill"]));
    expect(readySignals(report.buildSignals)).toEqual(expect.arrayContaining(["wxt-build", "plasmo-build", "vite-crx", "web-ext", "zip-artifact", "watch-dev", "hmr", "typescript"]));
    expect(readySignals(report.publishSignals)).toEqual(expect.arrayContaining(["chrome-web-store", "firefox-addons", "edge-addons", "plasmo-bpp", "wxt-submit", "web-ext-sign", "release-action"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["wxt", "plasmo", "@crxjs/vite-plugin", "webextension-polyfill", "@types/chrome", "chrome-types", "web-ext", "extension-api"]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "browser-extension-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "browser-extension-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "browser-extension-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects t3-env framework readiness without executing validators", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-env-validation-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-env-validation-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "env"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "env-validation-demo",
      version: "1.0.0",
      scripts: {
        build: "next build",
        "env:check": "tsx src/env/core.ts"
      },
      dependencies: {
        "@t3-oss/env-core": "^0.13.0",
        "@t3-oss/env-nextjs": "^0.13.0",
        "@t3-oss/env-nuxt": "^0.13.0",
        astro: "^5.0.0",
        vite: "^7.0.0",
        zod: "^4.0.0",
        valibot: "^1.0.0",
        arktype: "^2.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "env", "core.ts"), [
      "import { createEnv } from '@t3-oss/env-core';",
      "import { z } from 'zod';",
      "const baseEnv = { shared: { NODE_ENV: z.enum(['development', 'test', 'production']) } };",
      "export const env = createEnv({",
      "  extends: [baseEnv],",
      "  server: { DATABASE_URL: z.string().url(), API_SECRET: z.string().min(1) },",
      "  clientPrefix: 'PUBLIC_',",
      "  client: { PUBLIC_API_URL: z.string().url() },",
      "  shared: { NODE_ENV: z.enum(['development', 'test', 'production']) },",
      "  runtimeEnvStrict: {",
      "    DATABASE_URL: process.env.DATABASE_URL,",
      "    API_SECRET: process.env.API_SECRET,",
      "    PUBLIC_API_URL: process.env.PUBLIC_API_URL,",
      "    NODE_ENV: process.env.NODE_ENV",
      "  },",
      "  isServer: typeof window === 'undefined',",
      "  emptyStringAsUndefined: true,",
      "  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',",
      "  onValidationError(error) { throw error; },",
      "  onInvalidAccess(variable) { throw new Error(`Invalid env access ${variable}`); }",
      "});",
      "// Standard Schema compatible validators can replace Zod here."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "env", "next.ts"), [
      "import { createEnv } from '@t3-oss/env-nextjs';",
      "import { z } from 'zod';",
      "export const nextEnv = createEnv({",
      "  server: { AUTH_SECRET: z.string().min(1) },",
      "  client: { NEXT_PUBLIC_GREETING: z.string() },",
      "  runtimeEnv: {",
      "    AUTH_SECRET: process.env.AUTH_SECRET,",
      "    NEXT_PUBLIC_GREETING: process.env.NEXT_PUBLIC_GREETING",
      "  }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "env", "nuxt.ts"), [
      "import { createEnv } from '@t3-oss/env-nuxt';",
      "import { string } from 'valibot';",
      "export const nuxtEnv = createEnv({",
      "  server: { NUXT_DATABASE_URL: string() },",
      "  client: { NUXT_PUBLIC_GREETING: string() }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "env", "astro.ts"), [
      "import { createEnv } from '@t3-oss/env-core';",
      "import { type } from 'arktype';",
      "export const astroEnv = createEnv({",
      "  clientPrefix: 'PUBLIC_',",
      "  client: { PUBLIC_API_URL: type('string.url'), VITE_FLAG: type('string') },",
      "  runtimeEnv: import.meta.env,",
      "  skipValidation: import.meta.env.SKIP_ENV_VALIDATION === 'true'",
      "});",
      "export const framework = 'Astro Vite';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "env", "dotenv.ts"), "import 'dotenv/config';\n");
    await fs.writeFile(path.join(sourceRoot, ".env.example"), [
      "DATABASE_URL=",
      "API_SECRET=",
      "PUBLIC_API_URL=",
      "NEXT_PUBLIC_GREETING=",
      "NUXT_PUBLIC_GREETING=",
      "VITE_FLAG=",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), "Required environment variables are validated during build and deployment. Do not expose server-side secrets to the client.\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "env-validation-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      boundarySignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toContain("@t3-oss/env-nextjs");
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["core-package", "nextjs-preset", "nuxt-preset", "astro-vite", "extends-env", "is-server-override", "standard-schema-adapter"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["process-env", "import-meta-env", "runtime-env", "runtime-env-strict", "dotenv-file"]));
    expect(readySignals(report.boundarySignals)).toEqual(expect.arrayContaining(["client-prefix", "next-public", "nuxt-public", "vite-public", "server-only", "invalid-access-guard"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["on-validation-error", "skip-validation", "empty-string-as-undefined"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@t3-oss/env-core", "@t3-oss/env-nextjs", "@t3-oss/env-nuxt", "zod", "valibot", "arktype"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@t3-oss/env-core") && item.command.includes("isServer"))).toBe(true);

    const envValidationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "env-validation-readiness.md"), "utf8");
    expect(envValidationMarkdown).toContain("## Framework Signals");
    expect(envValidationMarkdown).toContain("nextjs-preset");
    const envValidationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "env-validation-readiness.html"), "utf8");
    expect(envValidationHtml).toContain("Framework Signals");
    expect(envValidationHtml).toContain("astro-vite");
  }, 10_000);
});
