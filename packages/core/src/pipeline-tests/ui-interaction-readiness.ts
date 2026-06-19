// biome-ignore-all lint/suspicious/noTemplateCurlyInString: test fixtures assert literal template syntax from source snapshots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "../index.js";

const fixtureRoot = path.resolve("packages/core/tests/fixtures/simple-ts-app");

describe("RepoTutor core pipeline - ui-interaction-readiness", () => {
  it("detects authorization readiness patterns without executing policy engines", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-authorization-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-authorization-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "authz"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "policies"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "authz:scan": "rg \"OpenFGA|newEnforcer|AbilityBuilder|Polar|allow|OPA|Rego\" src policies",
        "authz:test": "vitest run authorization.policy.test.ts"
      },
      dependencies: {
        "@openfga/sdk": "latest",
        "openfga": "latest",
        "casbin": "latest",
        "casl": "latest",
        "@casl/ability": "latest",
        "oso": "latest",
        "opa": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "authz", "openfga.ts"), [
      "import { OpenFgaClient, type AuthorizationModel, type TupleKey } from '@openfga/sdk';",
      "const openfga = new OpenFgaClient({ apiUrl: 'https://authz.example.test' });",
      "export const authorizationModel: AuthorizationModel = {",
      "  schema_version: '1.1',",
      "  type_definitions: [{ type: 'user' }, { type: 'group', relations: { member: { this: {} } } }, { type: 'organization', relations: { admin: { this: {} }, member: { this: {} } } }, { type: 'tenant', relations: { owner: { this: {} } } }, { type: 'document', relations: { owner: { this: {} }, viewer: { union: { child: [] } }, editor: { this: {} } } } }]",
      "};",
      "export const relationshipTuples: TupleKey[] = [",
      "  { user: 'user:*', relation: 'viewer', object: 'document:public' },",
      "  { user: 'group:eng#member', relation: 'editor', object: 'document:roadmap' },",
      "  { user: 'organization:veritas#member', relation: 'viewer', object: 'repository:repotutor' }",
      "];",
      "export async function canCheck(actor: string, action: 'read' | 'write' | 'delete' | 'manage', resource: string, tenantId: string, ownerId: string) {",
      "  const resourceAction = `${resource}:${action}`;",
      "  const allowed = await openfga.check({ user: actor, relation: action === 'read' ? 'viewer' : 'editor', object: resource });",
      "  const decisionLog = { actor, action, resource, tenantId, ownerId, resourceAction, serviceAccount: 'service-account:indexer', anonymous: 'anonymous', auditLog: true };",
      "  if (!allowed.allowed) throw new Error(`deny-by-default AccessDenied authorization decision ${JSON.stringify(decisionLog)}`);",
      "  return allowed;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "authz", "casbin.ts"), [
      "import { newEnforcer } from 'casbin';",
      "export async function authorizeWithCasbin(user: string, obj: string, act: string, domain: string) {",
      "  const enforcer = await newEnforcer('model.conf', 'policy.csv');",
      "  const model = '[request_definition] r = sub, obj, act [policy_definition] p = sub, obj, act [role_definition] g = _, _ [matchers] m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act';",
      "  const policy = 'p, role:admin, repository:repotutor, read\\ng, alice, role:admin';",
      "  const rbac = 'RBAC ABAC ACL permissions roles group tenant domain subject object action';",
      "  const allowed = await enforcer.enforce(user, obj, act);",
      "  if (!allowed) return false;",
      "  return { allowed, model, policy, rbac, domain };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "authz", "casl.ts"), [
      "import { AbilityBuilder, ForbiddenError, createMongoAbility, defineAbility } from '@casl/ability';",
      "export const ability = defineAbility((can, cannot) => {",
      "  can('read', 'Document');",
      "  can('manage', 'Document', { owner: 'user-1', tenant: 'tenant-1', organization: 'org-1' });",
      "  can(['update', 'delete'], ['Project', 'Record'], { owner: 'user-1' });",
      "  cannot('delete', 'Document', { locked: true });",
      "});",
      "export function assertUiAbility(subject: unknown) {",
      "  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);",
      "  can('read', 'field');",
      "  cannot('delete', 'collection');",
      "  const built = build();",
      "  ForbiddenError.from(built).throwUnlessCan('read', subject as never);",
      "  return built.can('read', subject as never);",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "authorization.polar"), [
      "resource Repository {",
      "  roles = ['reader', 'writer', 'admin'];",
      "  permissions = ['pull', 'push', 'delete'];",
      "  'pull' if 'reader';",
      "  'push' if 'writer';",
      "  'writer' if 'admin';",
      "}",
      "allow(actor, action, resource) if has_permission(actor, action, resource);",
      "has_permission(actor, 'push', repo: Repository) if has_role(actor, 'writer', repo);",
      "allow_field(actor, 'read', resource, field) if field = 'title';",
      "allow_request(actor, request) if actor.is_admin = true;",
      "# Oso Polar actor action resource authorize is_allowed authorized_actions authorized_resources RBAC ReBAC"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "authz.rego"), [
      "package authz",
      "default allow := false",
      "allow if { input.actor.role == \"admin\" }",
      "deny contains msg if { not allow; msg := \"deny by default\" }",
      "# OPA Rego opa test policy decision output"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "policies", "authorization.md"), [
      "# Authorization governance",
      "Use least privilege, separation of duties, audit log, permission review, policy versioning, migration, decision log, and break-glass emergency access.",
      "Route protection uses middleware and guard checks; resolver protection checks field and collection resources.",
      "Authorization unit test fixture table test negative test policy test e2e test type test coverage includes expect allowed false and 403 forbidden deny cases."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "authorization-readiness-report.json"), "utf8")) as {
      authorizationSetups: Array<{ filePath: string; framework: string; modelCount: number; relationCount: number; roleCount: number; permissionCount: number; resourceCount: number; actionCount: number; guardCount: number; middlewareCount: number; ownershipCount: number; testCount: number; readiness: string }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      enforcementSignals: Array<{ signal: string; readiness: string }>;
      identitySignals: Array<{ signal: string; readiness: string }>;
      resourceSignals: Array<{ signal: string; readiness: string }>;
      governanceSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.authorizationSetups.length).toBeGreaterThan(0);
    expect(report.authorizationSetups.some((item) => item.framework === "openfga")).toBe(true);
    expect(report.authorizationSetups.some((item) => item.framework === "casbin")).toBe(true);
    expect(report.authorizationSetups.some((item) => item.framework === "casl")).toBe(true);
    expect(report.authorizationSetups.some((item) => item.framework === "oso")).toBe(true);
    expect(report.authorizationSetups.some((item) => item.framework === "opa")).toBe(true);
    const openfgaSetup = report.authorizationSetups.find((item) => item.filePath === "src/authz/openfga.ts");
    expect(openfgaSetup?.modelCount).toBeGreaterThan(0);
    expect(openfgaSetup?.relationCount).toBeGreaterThan(0);
    expect(openfgaSetup?.permissionCount).toBeGreaterThan(0);
    expect(openfgaSetup?.resourceCount).toBeGreaterThan(0);
    expect(openfgaSetup?.actionCount).toBeGreaterThan(0);
    expect(openfgaSetup?.guardCount).toBeGreaterThan(0);
    expect(openfgaSetup?.ownershipCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.modelSignals, ["rbac", "abac", "rebac", "acl", "relationship-tuples", "policy-file", "subject-object-action", "resource-action"]);
    expectReady(report.enforcementSignals, ["guard", "middleware", "can-check", "authorize-call", "deny-by-default", "route-protection", "resolver-protection", "ui-ability"]);
    expectReady(report.identitySignals, ["user", "role", "group", "tenant", "organization", "service-account", "owner", "anonymous"]);
    expectReady(report.resourceSignals, ["document", "project", "repository", "organization", "tenant", "record", "field", "collection"]);
    expectReady(report.governanceSignals, ["least-privilege", "separation-of-duties", "audit-log", "permission-review", "policy-versioning", "migration", "decision-log", "break-glass"]);
    expectReady(report.testSignals, ["unit-test", "fixture", "table-test", "negative-test", "policy-test", "e2e-test", "type-test"]);
    expectReady(report.packageSignals, ["@openfga/sdk", "openfga", "casbin", "casl", "@casl/ability", "oso", "opa", "custom"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "authorization-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "authorization-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects object storage readiness patterns without contacting object storage", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-object-storage-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-object-storage-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "storage"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "storage:scan": "tsx src/storage/s3.ts"
      },
      dependencies: {
        "@aws-sdk/client-s3": "latest",
        "@aws-sdk/lib-storage": "latest",
        "@aws-sdk/s3-presigned-post": "latest",
        "@aws-sdk/s3-request-presigner": "latest",
        "@azure/storage-blob": "latest",
        "@google-cloud/storage": "latest",
        "@supabase/supabase-js": "latest",
        minio: "latest",
        wrangler: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "boto3",
      "minio",
      "google-cloud-storage",
      "azure-storage-blob",
      "supabase"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "storage", "s3.ts"), [
      "import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, CopyObjectCommand, PutBucketPolicyCommand, PutBucketCorsCommand } from \"@aws-sdk/client-s3\";",
      "import { Upload } from \"@aws-sdk/lib-storage\";",
      "import { getSignedUrl } from \"@aws-sdk/s3-request-presigner\";",
      "import { createPresignedPost } from \"@aws-sdk/s3-presigned-post\";",
      "",
      "const client = new S3Client({",
      "  region: process.env.AWS_REGION,",
      "  endpoint: process.env.S3_ENDPOINT,",
      "  forcePathStyle: true,",
      "  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },",
      "  requestHandler: { requestTimeout: 2000 },",
      "  maxAttempts: 3",
      "});",
      "const Bucket = process.env.UPLOAD_BUCKET || \"app-private-bucket\";",
      "await client.send(new PutObjectCommand({ Bucket, Key: \"avatars/u1.png\", Body: \"demo\", Metadata: { owner: \"u1\" }, Tagging: \"purpose=avatar\", ContentType: \"image/png\", CacheControl: \"public, max-age=60\", ACL: \"private\", ServerSideEncryption: \"aws:kms\", SSEKMSKeyId: process.env.KMS_KEY_ID, ChecksumSHA256: \"abc\", ContentMD5: \"abc\" }));",
      "await new Upload({ client, params: { Bucket, Key: \"multipart/video.mp4\", Body: \"demo\", Metadata: { kind: \"multipart\" } } }).done();",
      "await client.send(new GetObjectCommand({ Bucket, Key: \"avatars/u1.png\" }));",
      "await client.send(new ListObjectsV2Command({ Bucket, Prefix: \"avatars/\" }));",
      "await client.send(new CopyObjectCommand({ Bucket, CopySource: `${Bucket}/avatars/u1.png`, Key: \"archive/u1.png\" }));",
      "await client.send(new DeleteObjectCommand({ Bucket, Key: \"old/u1.png\" }));",
      "const signedUrl = await getSignedUrl(client, new GetObjectCommand({ Bucket, Key: \"avatars/u1.png\" }));",
      "await createPresignedPost(client, { Bucket, Key: \"browser/${filename}\", Conditions: [{ acl: \"private\" }], Fields: { ContentType: \"image/png\" } });",
      "await client.send(new PutBucketPolicyCommand({ Bucket, Policy: JSON.stringify({ Statement: [{ Effect: \"Allow\", Principal: \"*\", Action: [\"s3:GetObject\", \"s3:PutObject\", \"s3:ListBucket\"], Resource: [\"arn:aws:s3:::app-private-bucket/*\"] }] }) }));",
      "await client.send(new PutBucketCorsCommand({ Bucket, CORSConfiguration: { CORSRules: [{ AllowedMethods: [\"GET\", \"PUT\"], AllowedOrigins: [\"https://app.example.com\"] }] } }));",
      "export const s3Readiness = \"S3-compatible versioning lifecycle retention object lock replication checksum ETag retry least-privilege encryption SSE KMS virus scan malware scan health metrics backup restore migration event notification queue CDN cache public private RBAC IAM\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "storage", "minio.js"), [
      "import Minio from \"minio\";",
      "",
      "const minio = new Minio.Client({ endPoint: process.env.MINIO_ENDPOINT, port: 9000, useSSL: true, accessKey: process.env.MINIO_ACCESS_KEY, secretKey: process.env.MINIO_SECRET_KEY });",
      "await minio.makeBucket(\"media\", \"us-east-1\");",
      "await minio.putObject(\"media\", \"uploads/u1.txt\", \"demo\", { contentType: \"text/plain\", metadata: \"owner=u1\" });",
      "await minio.getObject(\"media\", \"uploads/u1.txt\");",
      "minio.listObjectsV2(\"media\", \"uploads/\", true);",
      "await minio.removeObject(\"media\", \"old/u1.txt\");",
      "await minio.presignedGetObject(\"media\", \"uploads/u1.txt\", 60);",
      "await minio.setBucketPolicy(\"media\", JSON.stringify({ Statement: [{ Effect: \"Allow\", Action: [\"s3:GetObject\"] }] }));",
      "await minio.setBucketNotification(\"media\", { QueueConfigurations: [{ Events: [\"s3:ObjectCreated:*\"], QueueArn: \"arn:sqs:storage-events\" }] });",
      "await minio.bucketExists(\"media\");",
      "await minio.statObject(\"media\", \"uploads/u1.txt\");",
      "export const minioOps = \"health metrics backup restore migration event notification queue mirror cache retention replication\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "storage", "supabase.ts"), [
      "import { createClient } from \"@supabase/supabase-js\";",
      "",
      "const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);",
      "await supabase.storage.createBucket(\"avatars\", { public: false, fileSizeLimit: 1024 * 1024 });",
      "await supabase.storage.from(\"avatars\").upload(\"users/u1.png\", new Blob(), { cacheControl: \"3600\", contentType: \"image/png\", upsert: true });",
      "await supabase.storage.from(\"avatars\").download(\"users/u1.png\");",
      "await supabase.storage.from(\"avatars\").list(\"users\", { limit: 100, offset: 0 });",
      "await supabase.storage.from(\"avatars\").remove([\"users/old.png\"]);",
      "await supabase.storage.from(\"avatars\").createSignedUrl(\"users/u1.png\", 60);",
      "supabase.storage.from(\"avatars\").getPublicUrl(\"users/u1.png\");",
      "export const supabasePolicies = \"RLS row level security create policy storage.objects auth.uid RBAC public URL private bucket policy CORS CDN cache\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "object-storage.yaml"), [
      "storage:",
      "  storageS3Bucket: app-private-bucket",
      "  storageS3Endpoint: https://minio.local",
      "  storageS3ForcePathStyle: true",
      "  storageS3Region: us-east-1",
      "  storageS3ClientTimeout: 2000",
      "  versioning: enabled",
      "  lifecycle: expire-temp-after-7-days",
      "  retention: governance",
      "  object_lock: enabled",
      "  replication: cross-region",
      "  checksum: sha256",
      "  encryption: SSE KMS",
      "  event_notifications:",
      "    queue: storage-events",
      "  backup: daily mirror",
      "  restore: tested",
      "  migration: s3-to-r2",
      "  metrics: prometheus",
      "  health: headBucket",
      "  cdn_cache: cache-control"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "wrangler.toml"), [
      "name = \"storage-fixture\"",
      "r2_buckets = [{ binding = \"ASSETS\", bucket_name = \"assets-private\" }]",
      "queues.producers = [{ binding = \"STORAGE_EVENTS\", queue = \"storage-events\" }]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "object-storage.yml"), [
      "name: object-storage",
      "on:",
      "  pull_request:",
      "jobs:",
      "  static-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: echo \"Object storage readiness S3 MinIO R2 Supabase Storage buckets regions endpoints path-style credentials PutObject GetObject ListObjects DeleteObject CopyObject multipart upload download metadata tags presigned URL signed URL policy ACL CORS RLS RBAC versioning lifecycle retention object lock replication checksum ETag SSE KMS encryption event notifications queues CDN cache health metrics backup restore migration static only\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "object-storage-readiness-report.json"), "utf8")) as {
      storageSetups: Array<{ filePath: string; platform: string; bucketCount: number; clientCount: number; uploadCount: number; downloadCount: number; listCount: number; deleteCount: number; presignCount: number; opsCount: number }>;
      bucketSignals: Array<{ signal: string; readiness: string }>;
      clientSignals: Array<{ signal: string; readiness: string }>;
      objectSignals: Array<{ signal: string; readiness: string }>;
      accessSignals: Array<{ signal: string; readiness: string }>;
      reliabilitySignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.storageSetups.length).toBeGreaterThan(0);
    expect(report.storageSetups.some((item) => item.platform === "s3")).toBe(true);
    expect(report.storageSetups.some((item) => item.platform === "minio")).toBe(true);
    expect(report.storageSetups.some((item) => item.platform === "supabase-storage")).toBe(true);
    expect(report.storageSetups.some((item) => item.platform === "r2")).toBe(true);
    const s3Setup = report.storageSetups.find((item) => item.filePath === "src/storage/s3.ts");
    expect(s3Setup?.bucketCount).toBeGreaterThan(0);
    expect(s3Setup?.clientCount).toBeGreaterThan(0);
    expect(s3Setup?.uploadCount).toBeGreaterThan(0);
    expect(s3Setup?.downloadCount).toBeGreaterThan(0);
    expect(s3Setup?.listCount).toBeGreaterThan(0);
    expect(s3Setup?.deleteCount).toBeGreaterThan(0);
    expect(s3Setup?.presignCount).toBeGreaterThan(0);
    expect(s3Setup?.opsCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.bucketSignals, ["bucket", "region", "endpoint", "path-style", "public-private", "namespace"]);
    expectReady(report.clientSignals, ["s3-client", "minio-client", "r2-client", "gcs-client", "azure-blob-client", "supabase-storage-client", "credentials", "timeout"]);
    expectReady(report.objectSignals, ["put-object", "upload", "multipart", "get-object", "download", "list-objects", "delete-object", "copy-object", "metadata"]);
    expectReady(report.accessSignals, ["signed-url", "presigned-post", "public-url", "policy", "acl", "cors", "rbac", "rls"]);
    expectReady(report.reliabilitySignals, ["versioning", "lifecycle", "retention", "object-lock", "replication", "checksum", "etag", "retry"]);
    expectReady(report.securitySignals, ["sse", "kms", "encryption", "secret-key", "least-privilege", "scan"]);
    expectReady(report.opsSignals, ["health", "metrics", "backup", "restore", "migration", "event-notification", "queue", "cdn-cache"]);
    expectReady(report.packageSignals, ["aws-sdk-s3", "lib-storage", "minio", "supabase-storage", "gcs", "azure-blob", "r2", "s3-compatible"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "object-storage-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "object-storage-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects backup readiness patterns without running backup tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-backup-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-backup-source-"));
    await fs.mkdir(path.join(sourceRoot, "k8s"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "scripts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Backup readiness fixture",
      "This repo keeps a restore runbook for disaster recovery and point-in-time WAL recovery.",
      "Use velero backup create app-manual --include-namespaces app --wait.",
      "Use velero backup describe app-manual and velero backup logs app-manual.",
      "Use velero restore create --from-backup app-nightly --wait and velero restore describe app-restore.",
      "Use litestream replicate, litestream restore, and litestream databases.",
      "Use restic backup, restic snapshots, restic restore, restic forget --prune, and restic check --read-data.",
      "Restore drill validates target directory and checksum integrity."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "velero.yaml"), [
      "apiVersion: velero.io/v1",
      "kind: Backup",
      "metadata:",
      "  name: app-nightly",
      "spec:",
      "  includedNamespaces:",
      "    - app",
      "  excludedNamespaces:",
      "    - kube-system",
      "  ttl: 720h0m0s",
      "  storageLocation: default",
      "  volumeSnapshotLocations:",
      "    - aws",
      "  snapshotVolumes: true",
      "  defaultVolumesToFsBackup: true",
      "---",
      "apiVersion: velero.io/v1",
      "kind: Schedule",
      "metadata:",
      "  name: app-daily",
      "spec:",
      "  schedule: \"0 2 * * *\"",
      "  template:",
      "    includedNamespaces:",
      "      - app",
      "    ttl: 168h0m0s",
      "---",
      "apiVersion: velero.io/v1",
      "kind: Restore",
      "metadata:",
      "  name: app-restore",
      "spec:",
      "  backupName: app-nightly",
      "  includedNamespaces:",
      "    - app",
      "---",
      "apiVersion: velero.io/v1",
      "kind: BackupStorageLocation",
      "metadata:",
      "  name: default",
      "spec:",
      "  provider: aws",
      "  objectStorage:",
      "    bucket: app-backups",
      "    prefix: velero",
      "  config:",
      "    region: us-east-1",
      "---",
      "apiVersion: velero.io/v1",
      "kind: VolumeSnapshotLocation",
      "metadata:",
      "  name: aws",
      "spec:",
      "  provider: aws"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "litestream.yml"), [
      "dbs:",
      "  - path: /var/lib/app/app.db",
      "    replicas:",
      "      - url: s3://app-backups/sqlite/app",
      "        retention: 720h",
      "      - url: gcs://app-backups/sqlite/app",
      "      - url: abs://app-backups/sqlite/app",
      "    snapshot:",
      "      interval: 1h",
      "      retention: 168h"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "scripts", "backup.sh"), [
      "#!/usr/bin/env sh",
      "set -eu",
      "export RESTIC_REPOSITORY=s3:s3.amazonaws.com/app-backups/restic",
      "export RESTIC_PASSWORD_FILE=/run/secrets/restic-password",
      "restic init || true",
      "restic backup /var/lib/app --tag app --exclude /var/lib/app/tmp",
      "restic snapshots --group-by host,paths,tags",
      "restic forget --keep-daily 7 --keep-weekly 4 --prune",
      "restic check --read-data-subset=5%",
      "velero backup create app-manual --include-namespaces app --wait",
      "velero backup describe app-manual",
      "velero backup logs app-manual",
      "litestream databases -config litestream.yml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "restore.md"), [
      "# Restore drill",
      "point-in-time WAL recovery and integrity validation",
      "- velero restore create --from-backup app-nightly --wait",
      "- velero restore describe app-restore",
      "- litestream restore -o /var/lib/app/app.db s3://app-backups/sqlite/app",
      "- restic restore latest --target /restore/app",
      "- restic check --read-data"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "backup.yml"), [
      "name: backup",
      "on:",
      "  workflow_dispatch:",
      "  schedule:",
      "    - cron: \"0 2 * * *\"",
      "jobs:",
      "  backup:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: ./scripts/backup.sh"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({ scripts: { "backup:check": "restic check && velero backup get && litestream databases" } }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "backup-readiness-report.json"), "utf8")) as {
      backupSetups: Array<{ filePath: string; tool: string; backupCount: number; restoreCount: number; scheduleCount: number; storageCount: number; retentionCount: number; verificationCount: number }>;
      veleroSignals: Array<{ signal: string; readiness: string }>;
      litestreamSignals: Array<{ signal: string; readiness: string }>;
      resticSignals: Array<{ signal: string; readiness: string }>;
      restoreDrillSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const veleroSetup = report.backupSetups.find((item) => item.filePath === "k8s/velero.yaml");
    const resticSetup = report.backupSetups.find((item) => item.filePath === "scripts/backup.sh");
    expect(report.backupSetups.length).toBeGreaterThan(0);
    expect(veleroSetup?.tool).toBe("velero");
    expect(veleroSetup?.backupCount).toBeGreaterThan(0);
    expect(veleroSetup?.restoreCount).toBeGreaterThan(0);
    expect(veleroSetup?.scheduleCount).toBeGreaterThan(0);
    expect(veleroSetup?.storageCount).toBeGreaterThan(0);
    expect(resticSetup?.tool).toBe("hybrid");
    expect(resticSetup?.verificationCount).toBeGreaterThan(0);
    for (const signal of ["backup", "schedule", "restore", "backup-storage-location", "volume-snapshot-location", "included-namespaces", "excluded-namespaces", "ttl", "storage-location", "volume-snapshot", "fs-backup", "backup-describe", "backup-logs", "restore-describe"]) {
      expect(report.veleroSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["config", "db-path", "replica-url", "s3", "gcs", "azure", "snapshot-interval", "snapshot-retention", "replicate-command", "restore-command", "database-command"]) {
      expect(report.litestreamSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["repository", "password-file", "init", "backup-command", "snapshots-command", "restore-command", "forget-prune", "check", "tags", "exclude", "read-data"]) {
      expect(report.resticSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["restore-runbook", "restore-command", "point-in-time", "wait", "describe", "logs", "integrity-check", "read-data", "target-path"]) {
      expect(report.restoreDrillSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["retention-policy", "encrypted-secret", "namespace-scope", "storage-location", "snapshot-location", "verification-check", "prune-policy", "restore-drill", "external-repository"]) {
      expect(report.safetySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["velero", "litestream", "restic", "backup-script", "cron", "workflow"]) {
      expect(report.packageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "backup-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "backup-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects notebook readiness without executing notebooks or renderers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-notebook-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-notebook-source-"));
    await fs.mkdir(path.join(sourceRoot, "notebooks"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "marimo"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "reports"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "notebooks", "analysis.ipynb"), JSON.stringify({
      cells: [
        { cell_type: "markdown", source: ["# Revenue analysis\n", "Binder launch notes"] },
        {
          cell_type: "code",
          execution_count: 1,
          metadata: { tags: ["parameters"] },
          source: ["import ipywidgets as widgets\n", "from IPython.display import display\n", "display(widgets.IntSlider(value=5))\n"],
          outputs: [{ output_type: "execute_result", data: { "text/plain": "IntSlider(value=5)" } }]
        }
      ],
      metadata: {
        kernelspec: { name: "python3", display_name: "Python 3" },
        language_info: { name: "python", version: "3.12" },
        jupytext: { formats: "ipynb,py:percent" }
      },
      nbformat: 4,
      nbformat_minor: 5
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "marimo", "app.py"), [
      "import marimo",
      "app = marimo.App(width=\"medium\")",
      "",
      "@app.cell",
      "def _():",
      "    import marimo as mo",
      "    slider = mo.ui.slider(0, 10, value=3)",
      "    mo.md(f\"## Reactive notebook {slider.value}\")",
      "    return mo, slider",
      "",
      "@app.cell",
      "def _(slider):",
      "    import polars as pl",
      "    return pl.DataFrame({\"value\": [slider.value]})",
      "",
      "if __name__ == \"__main__\":",
      "    app.run()"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "_quarto.yml"), [
      "project:",
      "  type: website",
      "execute:",
      "  freeze: auto",
      "  cache: true",
      "jupyter: python3",
      "format:",
      "  html:",
      "    toc: true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "reports", "analysis.qmd"), [
      "---",
      "title: Notebook report",
      "format: html",
      "execute:",
      "  echo: true",
      "  freeze: auto",
      "jupyter: python3",
      "---",
      "",
      "```{python}",
      "import pandas as pd",
      "pd.DataFrame({'x': [1, 2]}).plot()",
      "```"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = [\"notebook\", \"jupyterlab\", \"nbconvert\", \"nbformat\", \"papermill\", \"jupytext\", \"marimo\", \"quarto\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "notebooks.yml"), [
      "name: notebooks",
      "on: [push]",
      "jobs:",
      "  render:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: jupyter nbconvert --execute --to html notebooks/analysis.ipynb",
      "      - run: papermill notebooks/analysis.ipynb output.ipynb",
      "      - run: marimo export html marimo/app.py -o marimo.html",
      "      - run: quarto render reports/analysis.qmd",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: notebook-html",
      "          path: '*.html'"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "notebook-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      notebookSetups: Array<{ filePath: string; platform: string; cellCount: number; codeCellCount: number; outputCount: number; readiness: string }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      fileSignals: Array<{ signal: string; readiness: string }>;
      kernelSignals: Array<{ signal: string; readiness: string }>;
      executionSignals: Array<{ signal: string; readiness: string }>;
      dependencySignals: Array<{ signal: string; readiness: string }>;
      interactivitySignals: Array<{ signal: string; readiness: string }>;
      exportSignals: Array<{ signal: string; readiness: string }>;
      reproducibilitySignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Notebook readiness Jupyter ipynb nbformat kernelspec nbconvert papermill jupytext Binder marimo @app.cell mo.ui mo.md Quarto qmd render execute freeze cache outputs widgets exports");
    expect(report.notebookSetups.some((item) => item.filePath === "notebooks/analysis.ipynb" && item.platform === "jupyter" && item.cellCount >= 2 && item.outputCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.notebookSetups.some((item) => item.filePath === "marimo/app.py" && item.platform === "marimo" && item.codeCellCount > 0)).toBe(true);
    expect(report.notebookSetups.some((item) => item.filePath === "reports/analysis.qmd" && item.platform === "quarto" && item.codeCellCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["jupyter", "marimo", "quarto"]));
    expect(readySignals(report.fileSignals)).toEqual(expect.arrayContaining(["ipynb", "marimo-py", "qmd", "quarto-project"]));
    expect(readySignals(report.kernelSignals)).toEqual(expect.arrayContaining(["kernelspec", "language-info", "jupyter-kernel"]));
    expect(readySignals(report.executionSignals)).toEqual(expect.arrayContaining(["execute-count", "nbconvert-execute", "papermill", "quarto-execute", "marimo-run"]));
    expect(readySignals(report.dependencySignals)).toEqual(expect.arrayContaining(["notebook", "jupyterlab", "nbconvert", "nbformat", "papermill", "jupytext", "marimo", "quarto"]));
    expect(readySignals(report.interactivitySignals)).toEqual(expect.arrayContaining(["ipywidgets", "display", "marimo-ui", "marimo-markdown"]));
    expect(readySignals(report.exportSignals)).toEqual(expect.arrayContaining(["html-export", "nbconvert", "marimo-export", "quarto-render", "artifact-upload"]));
    expect(readySignals(report.reproducibilitySignals)).toEqual(expect.arrayContaining(["jupytext", "binder", "freeze", "cache", "parameters", "outputs"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["github-actions", "nbconvert", "papermill", "marimo-export", "quarto-render", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["notebook", "jupyterlab", "nbconvert", "nbformat", "papermill", "jupytext", "marimo", "quarto"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("nbconvert"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records notebook readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "notebook-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "notebook-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "notebook-readiness.html"))).resolves.toBeUndefined();
    const notebookMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "notebook-readiness.md"), "utf8");
    expect(notebookMarkdown).toContain("Notebook Readiness");
    expect(notebookMarkdown).toContain("Jupyter");
    const notebookHtml = await fs.readFile(path.join(result.session.outputPaths.html, "notebook-readiness.html"), "utf8");
    expect(notebookHtml).toContain("notebook-readiness-card");
    expect(notebookHtml).toContain("data-source-pattern=\"Notebook\"");
    expect(notebookHtml).toContain("RepoTutor records notebook readiness only");
  });

  it("detects markdown code rendering readiness without rendering markdown or highlighting code", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-markdown-code-rendering-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-markdown-code-rendering-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "react-markdown-viewer.tsx"), [
      "import Markdown, { MarkdownHooks } from 'react-markdown';",
      "import remarkGfm from 'remark-gfm';",
      "import rehypeRaw from 'rehype-raw';",
      "import rehypeSanitize from 'rehype-sanitize';",
      "",
      "const allowedElements = ['pre', 'code', 'a', 'table'];",
      "const disallowedElements = ['script', 'iframe'];",
      "const urlTransform = (url: string) => url.startsWith('javascript:') ? '' : url;",
      "",
      "export function MarkdownCodeViewer({ body }: { body: string }) {",
      "  return (",
      "    <Markdown",
      "      remarkPlugins={[remarkGfm]}",
      "      rehypePlugins={[rehypeRaw, rehypeSanitize]}",
      "      allowedElements={allowedElements}",
      "      disallowedElements={disallowedElements}",
      "      skipHtml",
      "      urlTransform={urlTransform}",
      "      components={{",
      "        pre(props) { return <pre aria-label=\"code block wrapper\" {...props} />; },",
      "        code({ className, children, ...props }) {",
      "          const match = /language-(\\w+)/.exec(className || '');",
      "          return <code aria-label={`code block ${match?.[1] ?? 'text'}`} tabIndex={0} className={className} {...props}>{children}</code>;",
      "        }",
      "      }}",
      "    >{body}</Markdown>",
      "  );",
      "}",
      "",
      "export function HookedMarkdown({ body }: { body: string }) {",
      "  return <MarkdownHooks remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{body}</MarkdownHooks>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "shiki-highlighter.ts"), [
      "import { bundledLanguages, bundledThemes, codeToHtml, codeToTokens, createHighlighter } from 'shiki';",
      "import { transformerNotationDiff, transformerNotationFocus, transformerNotationHighlight } from '@shikijs/transformers';",
      "",
      "const transformers = [transformerNotationDiff(), transformerNotationHighlight(), transformerNotationFocus()];",
      "export async function renderWithShiki(source: string) {",
      "  const html = await codeToHtml(source, { lang: 'typescript', theme: 'github-dark', transformers });",
      "  const highlighter = await createHighlighter({ themes: ['github-dark', 'github-light'], langs: ['typescript', 'tsx', 'markdown'] });",
      "  const tokens = await codeToTokens(source, { lang: 'typescript', theme: 'github-dark' });",
      "  return { html, tokens, themed: highlighter.codeToHtml(source, { lang: 'tsx', theme: 'github-light' }), bundledLanguages, bundledThemes };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "prism-renderer.ts"), [
      "import Prism from 'prismjs';",
      "import 'prismjs/components/prism-typescript';",
      "import 'prismjs/plugins/line-numbers/prism-line-numbers';",
      "import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard';",
      "import 'prismjs/plugins/toolbar/prism-toolbar';",
      "",
      "export function prismRender(code: string, element: HTMLElement) {",
      "  element.className = 'language-typescript line-numbers';",
      "  const html = Prism.highlight(code, Prism.languages.typescript, 'typescript');",
      "  Prism.highlightElement(element);",
      "  Prism.highlightAll();",
      "  const token = new Prism.Token('keyword', 'const', undefined, 'const x = 1');",
      "  return { html, token, stringified: Prism.Token.stringify(token, 'typescript') };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "markdown-code-rendering.spec.ts"), [
      "import { getByLabelText, getByText } from '@testing-library/dom';",
      "import { describe, expect, it } from 'vitest';",
      "",
      "describe('markdown code rendering contracts', () => {",
      "  it('captures sanitized code-block DOM contracts without rendering markdown or highlighting code', () => {",
      "    const host = document.createElement('section');",
      "    host.innerHTML = '<pre><code class=\"language-ts\" aria-label=\"code block\" tabindex=\"0\">const safe = true</code></pre>';",
      "    document.body.append(host);",
      "    const malicious = '<script>alert(\"xss\")</script>';",
      "    const policy = ['rehypeSanitize', 'skipHtml', 'urlTransform', 'xss', malicious].join(':');",
      "    expect(getByLabelText(document.body, 'code block')).toBeTruthy();",
      "    expect(getByText(document.body, 'const safe = true')).toBeTruthy();",
      "    expect(policy).toContain('rehypeSanitize');",
      "    expect(policy).toMatchInlineSnapshot('\"rehypeSanitize:skipHtml:urlTransform:xss:<script>alert(\\\\\"xss\\\\\")</script>\"');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest markdown-code-rendering.spec.ts",
        "test:e2e": "playwright test markdown-code-rendering.spec.ts"
      },
      dependencies: {
        react: "^19.0.0",
        "react-markdown": "^10.0.0",
        "remark-gfm": "^4.0.0",
        "rehype-raw": "^7.0.0",
        "rehype-sanitize": "^6.0.0",
        shiki: "^3.0.0",
        "@shikijs/transformers": "^3.0.0",
        prismjs: "^1.30.0",
        "@mdx-js/react": "^3.0.0"
      },
      devDependencies: {
        "@testing-library/dom": "^10.4.0",
        vitest: "^3.0.0",
        playwright: "^1.50.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "markdown-code-rendering.yml"), [
      "name: markdown-code-rendering",
      "on: [push]",
      "jobs:",
      "  static-markdown-code-rendering:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest markdown-code-rendering.spec.ts",
      "      - run: npx playwright test markdown-code-rendering.spec.ts",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: markdown-code-rendering-traces",
      "          path: reports/markdown-code-rendering"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "markdown-code-rendering-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      markdownCodeRenderingSetups: Array<{ filePath: string; platform: string; rendererCount: number; parserCount: number; highlightCount: number; pluginCount: number; securityCount: number; themeCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      rendererSignals: Array<{ signal: string; readiness: string }>;
      parserSignals: Array<{ signal: string; readiness: string }>;
      highlightSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      themeSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Markdown code rendering readiness react-markdown components remarkPlugins rehypePlugins Shiki codeToHtml createHighlighter Prism highlight language classes tests");
    expect(report.markdownCodeRenderingSetups.some((item) => item.filePath === "src/react-markdown-viewer.tsx" && item.platform === "react-markdown" && item.rendererCount > 0 && item.parserCount > 0 && item.securityCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.markdownCodeRenderingSetups.some((item) => item.filePath === "src/shiki-highlighter.ts" && item.platform === "shiki" && item.highlightCount > 0 && item.pluginCount > 0 && item.themeCount > 0)).toBe(true);
    expect(report.markdownCodeRenderingSetups.some((item) => item.filePath === "src/prism-renderer.ts" && item.platform === "prism" && item.highlightCount > 0 && item.pluginCount > 0)).toBe(true);
    expect(readySignals(report.rendererSignals)).toEqual(expect.arrayContaining(["react-markdown", "markdown-hooks", "components-map", "code-component", "pre-code"]));
    expect(readySignals(report.parserSignals)).toEqual(expect.arrayContaining(["remark-plugins", "remark-gfm", "remark-rehype", "rehype-plugins", "rehype-raw"]));
    expect(readySignals(report.highlightSignals)).toEqual(expect.arrayContaining(["shiki-code-to-html", "create-highlighter", "code-to-tokens", "prism-highlight", "highlight-element", "language-class"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["rehype-sanitize", "transformers", "line-numbers", "copy-to-clipboard", "toolbar"]));
    expect(readySignals(report.securitySignals)).toEqual(expect.arrayContaining(["skip-html", "allowed-elements", "disallowed-elements", "url-transform", "rehype-sanitize", "raw-html-risk", "xss"]));
    expect(readySignals(report.themeSignals)).toEqual(expect.arrayContaining(["theme", "themes", "bundled-themes", "langs", "bundled-languages"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["pre-code", "aria-label", "tabindex", "keyboard", "copy-button"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "testing-library", "snapshot-test", "security-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["react-markdown", "remark-gfm", "rehype-raw", "rehype-sanitize", "shiki", "@shikijs/transformers", "prismjs", "@mdx-js/react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("react-markdown"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records markdown/code rendering readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "markdown-code-rendering-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "markdown-code-rendering-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "markdown-code-rendering-readiness.html"))).resolves.toBeUndefined();
    const markdownCodeMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "markdown-code-rendering-readiness.md"), "utf8");
    expect(markdownCodeMarkdown).toContain("Markdown Code Rendering Readiness");
    expect(markdownCodeMarkdown).toContain("react-markdown");
    const markdownCodeHtml = await fs.readFile(path.join(result.session.outputPaths.html, "markdown-code-rendering-readiness.html"), "utf8");
    expect(markdownCodeHtml).toContain("markdown-code-rendering-readiness-card");
    expect(markdownCodeHtml).toContain("data-source-pattern=\"Markdown Code Rendering\"");
    expect(markdownCodeHtml).toContain("RepoTutor records markdown/code rendering readiness only");
  });

  it("detects map visualization readiness without opening canvases or fetching tiles", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-map-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-map-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "data"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "maplibre.ts"), [
      "import maplibregl from 'maplibre-gl';",
      "import 'maplibre-gl/dist/maplibre-gl.css';",
      "const map = new maplibregl.Map({",
      "  container: 'map',",
      "  style: 'https://demotiles.maplibre.org/style.json',",
      "  center: [127.0276, 37.4979],",
      "  zoom: 12,",
      "  bounds: [[126.9, 37.4], [127.1, 37.6]]",
      "});",
      "map.addControl(new maplibregl.NavigationControl(), 'top-right');",
      "map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: true }));",
      "map.on('load', () => {",
      "  map.addSource('districts', { type: 'geojson', data: '/data/districts.geojson' });",
      "  map.addLayer({ id: 'district-fill', type: 'fill', source: 'districts', paint: { 'fill-color': '#2463eb', 'fill-opacity': 0.4 } });",
      "  map.addLayer({ id: 'district-label', type: 'symbol', source: 'districts', layout: { 'text-field': ['get', 'name'] } });",
      "});",
      "new maplibregl.Marker().setLngLat([127.0276, 37.4979]).setPopup(new maplibregl.Popup().setText('Gangnam')).addTo(map);",
      "map.fitBounds([[126.9, 37.4], [127.1, 37.6]]);",
      "map.on('click', 'district-fill', event => console.log(event.features?.[0]?.properties));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "leaflet.js"), [
      "import L from 'leaflet';",
      "const leafletMap = L.map('leaflet-map').setView([37.5665, 126.9780], 11);",
      "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(leafletMap);",
      "const station = L.marker([37.5665, 126.9780]).bindPopup('Seoul City Hall').addTo(leafletMap);",
      "const parks = L.geoJSON({ type: 'FeatureCollection', features: [] }).addTo(leafletMap);",
      "L.control.layers({ OSM: leafletMap }, { Parks: parks, Station: station }).addTo(leafletMap);",
      "leafletMap.fitBounds([[37.45, 126.8], [37.7, 127.2]]);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "deck-map.tsx"), [
      "import {Deck, MapView} from '@deck.gl/core';",
      "import {DeckGL} from '@deck.gl/react';",
      "import {GeoJsonLayer, ScatterplotLayer, ArcLayer, PathLayer, PolygonLayer, TextLayer, IconLayer} from '@deck.gl/layers';",
      "import {TileLayer, MVTLayer, TerrainLayer} from '@deck.gl/geo-layers';",
      "import {HeatmapLayer, HexagonLayer, GridLayer, ScreenGridLayer} from '@deck.gl/aggregation-layers';",
      "import {DataFilterExtension, BrushingExtension, PathStyleExtension, MaskExtension} from '@deck.gl/extensions';",
      "import {MapboxOverlay} from '@deck.gl/mapbox';",
      "import {GoogleMapsOverlay} from '@deck.gl/google-maps';",
      "import {DeckLayer, DeckRenderer} from '@deck.gl/arcgis';",
      "import {FullscreenWidget, ZoomWidget, CompassWidget, ScreenshotWidget, PopupWidget} from '@deck.gl/widgets';",
      "import {testLayer, SnapshotTestRunner, InteractionTestRunner} from '@deck.gl/test-utils';",
      "const deck = new Deck({",
      "  canvas: 'deck-canvas',",
      "  views: [new MapView({ id: 'main-map', repeat: true })],",
      "  initialViewState: { longitude: 127.0276, latitude: 37.4979, zoom: 11, pitch: 35, bearing: 20 },",
      "  viewState: { longitude: 127.0276, latitude: 37.4979, zoom: 11 },",
      "  onViewStateChange: ({viewState}) => console.log(viewState),",
      "  controller: true,",
      "  layerFilter: ({layer, viewport, isPicking}) => viewport.id === 'main-map' && (!isPicking || layer.id !== 'labels'),",
      "  getTooltip: ({object}) => object && object.name,",
      "  widgets: [new FullscreenWidget(), new ZoomWidget(), new CompassWidget(), new ScreenshotWidget(), new PopupWidget()],",
      "  layers: [",
      "    new GeoJsonLayer({ id: 'districts', data: '/data/districts.geojson', pickable: true, stroked: true, filled: true, onHover: info => console.log(info.object), onClick: info => console.log(info.coordinate), extensions: [new DataFilterExtension(), new BrushingExtension(), new PathStyleExtension({dash: true}), new MaskExtension()] }),",
      "    new ScatterplotLayer({ id: 'stations', data: [{ position: [127.0276, 37.4979] }], getPosition: d => d.position, getRadius: 120 }),",
      "    new ArcLayer({ id: 'arc', data: [], getSourcePosition: d => d.from, getTargetPosition: d => d.to }),",
      "    new PathLayer({ id: 'paths', data: [], getPath: d => d.path }),",
      "    new PolygonLayer({ id: 'polygons', data: [], getPolygon: d => d.polygon }),",
      "    new TextLayer({ id: 'labels', data: [], getText: d => d.name, getPosition: d => d.position }),",
      "    new IconLayer({ id: 'icons', data: [], getIcon: d => 'marker', getPosition: d => d.position }),",
      "    new TileLayer({ id: 'tiles', data: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', minZoom: 0, maxZoom: 19 }),",
      "    new MVTLayer({ id: 'mvt', data: 'https://example.com/{z}/{x}/{y}.mvt' }),",
      "    new TerrainLayer({ id: 'terrain', elevationData: '/terrain.png', texture: '/terrain.jpg' }),",
      "    new HeatmapLayer({ id: 'heatmap', data: [], getPosition: d => d.position }),",
      "    new HexagonLayer({ id: 'hex', data: [], getPosition: d => d.position }),",
      "    new GridLayer({ id: 'grid', data: [], getPosition: d => d.position }),",
      "    new ScreenGridLayer({ id: 'screen-grid', data: [], getPosition: d => d.position })",
      "  ]",
      "});",
      "deck.pickObject({ x: 10, y: 10 });",
      "deck.setProps({ viewState: { longitude: 127.0, latitude: 37.5, zoom: 12 } });",
      "const overlay = new MapboxOverlay({ interleaved: true, layers: [] });",
      "const googleOverlay = new GoogleMapsOverlay({ layers: [] });",
      "const arcgisLayer = new DeckLayer();",
      "const arcgisRenderer = new DeckRenderer();",
      "testLayer({ Layer: GeoJsonLayer, testCases: [] });",
      "new SnapshotTestRunner({ props: { layers: [] } });",
      "new InteractionTestRunner({ events: [] });",
      "export function MapDeck() { return <DeckGL controller initialViewState={{longitude: 127, latitude: 37, zoom: 10}} layers={[]} />; }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "data", "districts.geojson"), JSON.stringify({ type: "FeatureCollection", features: [{ type: "Feature", properties: { name: "Gangnam" }, geometry: { type: "Point", coordinates: [127.0276, 37.4979] } }] }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "maplibre-gl": "^5.0.0",
        leaflet: "^2.0.0",
        "deck.gl": "^9.0.0",
        "@deck.gl/core": "^9.0.0",
        "@deck.gl/layers": "^9.0.0",
        "@deck.gl/geo-layers": "^9.0.0",
        "@deck.gl/aggregation-layers": "^9.0.0",
        "@deck.gl/extensions": "^9.0.0",
        "@deck.gl/react": "^9.0.0",
        "@deck.gl/mapbox": "^9.0.0",
        "@deck.gl/google-maps": "^9.0.0",
        "@deck.gl/arcgis": "^9.0.0",
        "@deck.gl/widgets": "^9.0.0",
        "@deck.gl/test-utils": "^9.0.0",
        "react-map-gl": "^8.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "maps.yml"), [
      "name: maps",
      "on: [push]",
      "jobs:",
      "  static-map-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npx eslint src/maplibre.ts src/leaflet.js src/deck-map.tsx",
      "      - run: npx playwright test map.spec.ts --grep @map",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: map-screenshots",
      "          path: reports/maps"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "map-visualization-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      mapSetups: Array<{ filePath: string; platform: string; mapCount: number; layerCount: number; tileCount: number; viewportCount: number; readiness: string }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      containerSignals: Array<{ signal: string; readiness: string }>;
      tileSignals: Array<{ signal: string; readiness: string }>;
      layerSignals: Array<{ signal: string; readiness: string }>;
      deckGlSignals: Array<{ signal: string; readiness: string }>;
      dataSignals: Array<{ signal: string; readiness: string }>;
      viewportSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      controlSignals: Array<{ signal: string; readiness: string }>;
      styleSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Map visualization readiness MapLibre maplibregl Leaflet L.map deck.gl Deck DeckGL MapView layer catalog picking tooltip layerFilter overlays widgets test-utils tileLayer addLayer addSource GeoJSON marker popup viewport bounds controls tokens");
    expect(report.mapSetups.some((item) => item.filePath === "src/maplibre.ts" && item.platform === "maplibre" && item.layerCount >= 2 && item.tileCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.mapSetups.some((item) => item.filePath === "src/leaflet.js" && item.platform === "leaflet" && item.mapCount > 0 && item.tileCount > 0)).toBe(true);
    expect(report.mapSetups.some((item) => item.filePath === "src/deck-map.tsx" && item.platform === "deck-gl" && item.layerCount >= 3 && item.viewportCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["maplibre", "leaflet", "deck-gl"]));
    expect(readySignals(report.containerSignals)).toEqual(expect.arrayContaining(["container", "canvas", "map-div"]));
    expect(readySignals(report.tileSignals)).toEqual(expect.arrayContaining(["tile-url", "vector-tile", "raster-tile"]));
    expect(readySignals(report.layerSignals)).toEqual(expect.arrayContaining(["geojson-layer", "marker-layer", "symbol-layer", "deck-layer"]));
    expect(readySignals(report.deckGlSignals)).toEqual(expect.arrayContaining(["deck-instance", "deckgl-react", "map-view", "initial-view-state", "controlled-view-state", "controller", "picking", "tooltip", "layer-filter", "geojson-layer", "scatterplot-layer", "arc-layer", "path-layer", "polygon-layer", "text-layer", "icon-layer", "tile-layer", "mvt-layer", "terrain-layer", "heatmap-layer", "hexagon-layer", "grid-layer", "screen-grid-layer", "data-filter-extension", "brushing-extension", "path-style-extension", "mask-extension", "mapbox-overlay", "google-maps-overlay", "arcgis-overlay", "widgets", "test-utils"]));
    expect(readySignals(report.dataSignals)).toEqual(expect.arrayContaining(["geojson", "coordinates", "feature-properties"]));
    expect(readySignals(report.viewportSignals)).toEqual(expect.arrayContaining(["center-zoom", "bounds", "deck-view-state"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["click", "hover-pick", "popup"]));
    expect(readySignals(report.controlSignals)).toEqual(expect.arrayContaining(["navigation", "geolocation", "layer-control"]));
    expect(readySignals(report.styleSignals)).toEqual(expect.arrayContaining(["style-json", "paint-layout", "attribution"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["github-actions", "playwright", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["maplibre-gl", "leaflet", "deck.gl", "@deck.gl/core", "@deck.gl/layers"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("maplibregl"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records map visualization readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "map-visualization-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "map-visualization-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "map-visualization-readiness.html"))).resolves.toBeUndefined();
    const mapMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "map-visualization-readiness.md"), "utf8");
    expect(mapMarkdown).toContain("Map Visualization Readiness");
    expect(mapMarkdown).toContain("MapLibre");
    expect(mapMarkdown).toContain("## deck.gl Signals");
    const mapHtml = await fs.readFile(path.join(result.session.outputPaths.html, "map-visualization-readiness.html"), "utf8");
    expect(mapHtml).toContain("map-visualization-readiness-card");
    expect(mapHtml).toContain("data-source-pattern=\"Map Visualization\"");
    expect(mapHtml).toContain("deck.gl Signals");
    expect(mapHtml).toContain("RepoTutor records map visualization readiness only");
  });

  it("detects realtime media readiness without joining rooms or requesting devices", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-realtime-media-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-realtime-media-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "server"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "livekit-room.ts"), [
      "import { Room, RoomEvent, Track, VideoPresets, createLocalTracks } from 'livekit-client';",
      "const room = new Room({ adaptiveStream: true, dynacast: true, videoCaptureDefaults: { resolution: VideoPresets.h720.resolution }, e2ee: { keyProvider } });",
      "room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => attachRemoteTrack(track, participant.identity));",
      "room.on(RoomEvent.TrackUnsubscribed, detachRemoteTrack);",
      "room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => reportQuality(quality, participant?.identity));",
      "room.on(RoomEvent.MediaDevicesError, error => reportDeviceError(error));",
      "room.on(RoomEvent.AudioPlaybackStatusChanged, () => room.startAudio());",
      "await room.connect(import.meta.env.VITE_LIVEKIT_URL, token, { autoSubscribe: true });",
      "await room.localParticipant.setCameraEnabled(true);",
      "await room.localParticipant.setMicrophoneEnabled(true);",
      "await room.localParticipant.setScreenShareEnabled(true);",
      "const tracks = await createLocalTracks({ audio: true, video: true });",
      "await room.localParticipant.publishTrack(tracks[0].mediaStreamTrack, { source: Track.Source.Camera, simulcast: true });",
      "await room.localParticipant.publishDataTrack({ name: 'whiteboard-events' });",
      "room.localParticipant.registerRpcMethod('ping', async () => 'pong');",
      "await room.localParticipant.performRpc({ destinationIdentity: 'bob', method: 'ping', payload: 'hello' });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "server", "mediasoup.ts"), [
      "import * as mediasoup from 'mediasoup';",
      "const worker = await mediasoup.createWorker({ rtcMinPort: 40000, rtcMaxPort: 49999 });",
      "const router = await worker.createRouter({ mediaCodecs: [{ kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 }, { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }] });",
      "const webRtcTransport = await router.createWebRtcTransport({",
      "  listenInfos: [{ protocol: 'udp', ip: '0.0.0.0', announcedAddress: 'media.example.com' }],",
      "  enableUdp: true, enableTcp: true, preferUdp: true, enableSctp: true, numSctpStreams: { OS: 1024, MIS: 1024 }",
      "});",
      "const plainTransport = await router.createPlainTransport({ listenInfo: { protocol: 'udp', ip: '127.0.0.1' } });",
      "const pipeTransport = await router.createPipeTransport({ listenInfo: { protocol: 'udp', ip: '127.0.0.1' } });",
      "const directTransport = await router.createDirectTransport();",
      "const activeSpeakerObserver = await router.createActiveSpeakerObserver();",
      "const audioLevelObserver = await router.createAudioLevelObserver({ maxEntries: 5 });",
      "await webRtcTransport.connect({ dtlsParameters });",
      "if (!router.canConsume({ producerId, rtpCapabilities })) throw new Error('missing rtpCapabilities');",
      "const producer = await webRtcTransport.produce({ kind: 'video', rtpParameters, appData: { simulcast: true, svc: true } });",
      "const consumer = await webRtcTransport.consume({ producerId: producer.id, rtpCapabilities, paused: false });",
      "const dataProducer = await webRtcTransport.produceData({ sctpStreamParameters, label: 'chat' });",
      "const dataConsumer = await webRtcTransport.consumeData({ dataProducerId: dataProducer.id });",
      "producer.on('transportclose', () => console.log('transport closed'));",
      "consumer.on('producerclose', () => console.log('producer closed'));",
      "await webRtcTransport.enableTraceEvent(['bwe', 'probation']);",
      "producer.on('score', score => console.log(score));",
      "consumer.on('trace', trace => console.log(trace));",
      "const stats = await webRtcTransport.getStats();",
      "console.log(router.rtpCapabilities, plainTransport.id, pipeTransport.id, directTransport.id, activeSpeakerObserver.id, audioLevelObserver.id, webRtcTransport.iceParameters, webRtcTransport.iceCandidates, webRtcTransport.dtlsParameters, stats, consumer.id, dataConsumer.id);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "peerjs-call.ts"), [
      "import { Peer } from 'peerjs';",
      "const peer = new Peer('alice', {",
      "  host: 'peer.example.com', secure: true,",
      "  config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'turn:turn.example.com', username: 'turn-user', credential: 'turn-pass' }] }",
      "});",
      "peer.on('connection', conn => conn.on('data', data => console.log(data)));",
      "const rawChannel = new RTCPeerConnection().createDataChannel('telemetry');",
      "rawChannel.send('ready');",
      "const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });",
      "const call = peer.call('bob', stream, { metadata: { roomId: 'demo-room' } });",
      "call.on('stream', remoteStream => { document.querySelector('video')!.srcObject = remoteStream; });",
      "peer.on('call', incoming => { incoming.answer(stream); incoming.on('stream', renderRemoteStream); });",
      "peer.on('disconnected', () => peer.reconnect());"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "livekit-client": "^2.0.0",
        mediasoup: "^3.0.0",
        "mediasoup-client": "^3.0.0",
        peerjs: "^1.5.0",
        "webrtc-adapter": "^9.0.0"
      },
      devDependencies: {
        "@playwright/test": "^1.60.0",
        browserstack: "^1.6.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "media.yml"), [
      "name: realtime-media",
      "on: [push]",
      "jobs:",
      "  media-smoke:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npx playwright test realtime-media.spec.ts --grep @media",
      "      - run: npm run browserstack:media",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: media-call-report",
      "          path: reports/realtime-media"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "realtime-media-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      mediaSetups: Array<{ filePath: string; platform: string; roomCount: number; mediaTrackCount: number; transportCount: number; iceCount: number; readiness: string }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      roomSignals: Array<{ signal: string; readiness: string }>;
      deviceSignals: Array<{ signal: string; readiness: string }>;
      trackSignals: Array<{ signal: string; readiness: string }>;
      transportSignals: Array<{ signal: string; readiness: string }>;
      sfuSignals: Array<{ signal: string; readiness: string }>;
      dataChannelSignals: Array<{ signal: string; readiness: string }>;
      qualitySignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Realtime media readiness WebRTC LiveKit Room mediasoup WebRtcTransport PeerJS getUserMedia MediaStream Track publish subscribe ICE DTLS RTP capabilities mediaCodecs Producer Consumer PlainTransport PipeTransport DirectTransport SCTP observer score trace data channel E2EE");
    expect(report.mediaSetups.some((item) => item.filePath === "src/livekit-room.ts" && item.platform === "livekit" && item.mediaTrackCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.mediaSetups.some((item) => item.filePath === "server/mediasoup.ts" && item.platform === "mediasoup" && item.transportCount > 0 && item.iceCount > 0)).toBe(true);
    expect(report.mediaSetups.some((item) => item.filePath === "src/peerjs-call.ts" && item.platform === "peerjs" && item.roomCount > 0 && item.mediaTrackCount > 0)).toBe(true);
    expect(readySignals(report.platformSignals)).toEqual(expect.arrayContaining(["livekit", "mediasoup", "peerjs"]));
    expect(readySignals(report.roomSignals)).toEqual(expect.arrayContaining(["room", "participant", "peer", "sfu-router", "call"]));
    expect(readySignals(report.deviceSignals)).toEqual(expect.arrayContaining(["get-user-media", "camera", "microphone", "screen-share", "autoplay"]));
    expect(readySignals(report.trackSignals)).toEqual(expect.arrayContaining(["local-track", "remote-track", "publish-track", "subscribe-track", "media-stream", "simulcast"]));
    expect(readySignals(report.transportSignals)).toEqual(expect.arrayContaining(["ice", "dtls", "stun-turn", "webrtc-transport", "send-transport", "recv-transport"]));
    expect(readySignals(report.sfuSignals)).toEqual(expect.arrayContaining(["rtp-capabilities", "media-codecs", "producer-consumer", "plain-transport", "pipe-transport", "direct-transport", "sctp", "active-speaker-observer", "audio-level-observer", "score-trace", "transport-close"]));
    expect(readySignals(report.dataChannelSignals)).toEqual(expect.arrayContaining(["data-channel", "data-track", "peer-data-connection", "rpc"]));
    expect(readySignals(report.qualitySignals)).toEqual(expect.arrayContaining(["adaptive-stream", "dynacast", "connection-quality", "stats", "reconnect"]));
    expect(readySignals(report.securitySignals)).toEqual(expect.arrayContaining(["token", "e2ee", "permission", "secure-peer-server"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["playwright", "browserstack", "media-e2e", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["livekit-client", "mediasoup", "mediasoup-client", "peerjs", "webrtc-adapter"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("getUserMedia"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records realtime media readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "realtime-media-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "realtime-media-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "realtime-media-readiness.html"))).resolves.toBeUndefined();
    const mediaMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "realtime-media-readiness.md"), "utf8");
    expect(mediaMarkdown).toContain("Realtime Media Readiness");
    expect(mediaMarkdown).toContain("SFU Signals");
    expect(mediaMarkdown).toContain("LiveKit");
    const mediaHtml = await fs.readFile(path.join(result.session.outputPaths.html, "realtime-media-readiness.html"), "utf8");
    expect(mediaHtml).toContain("realtime-media-readiness-card");
    expect(mediaHtml).toContain("data-source-pattern=\"Realtime Media\"");
    expect(mediaHtml).toContain("RepoTutor records realtime media readiness only");
  });

  it("detects terminal UI readiness without entering raw mode or running TUI programs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-terminal-ui-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-terminal-ui-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "cmd", "dashboard"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "ink-app.tsx"), [
      "import React, {useState} from 'react';",
      "import {render, Box, Text, Static, Transform, useInput, useApp, useStdin, useStdout, useFocus, useFocusManager} from 'ink';",
      "export function App() {",
      "  const [selected, setSelected] = useState(0);",
      "  const {exit} = useApp();",
      "  const {stdin, isRawModeSupported, setRawMode} = useStdin();",
      "  const {stdout, write} = useStdout();",
      "  const {focusNext} = useFocusManager();",
      "  const {isFocused} = useFocus({id: 'menu'});",
      "  const cursorLabel = process.stdout.isTTY ? 'cursor tty' : 'cursor pipe';",
      "  useInput((input, key) => {",
      "    if (key.upArrow) setSelected(index => Math.max(0, index - 1));",
      "    if (key.downArrow) setSelected(index => index + 1);",
      "    if (key.tab) focusNext();",
      "    if (input === 'q' || key.escape) exit();",
      "  });",
      "  return <Box flexDirection=\"column\" borderStyle=\"round\" width={60}>",
      "    <Text color=\"cyan\" bold>Repo status</Text>",
      "    <Static items={[\"loaded\"]}>{item => <Text key={item}>{item}</Text>}</Static>",
      "    <Transform transform={line => line.toUpperCase()}><Text>{isFocused ? 'focused' : 'blurred'} {selected}</Text></Transform>",
      "    <Text>{cursorLabel} {String(Boolean(stdin && stdout && write && isRawModeSupported && setRawMode))}</Text>",
      "  </Box>;",
      "}",
      "render(<App />, {exitOnCtrlC: true});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "cmd", "dashboard", "main.go"), [
      "package main",
      "import (",
      "  tea \"github.com/charmbracelet/bubbletea\"",
      "  \"github.com/charmbracelet/bubbles/list\"",
      "  \"github.com/charmbracelet/bubbles/spinner\"",
      "  \"github.com/charmbracelet/lipgloss\"",
      ")",
      "type model struct { width int; height int; list list.Model; spinner spinner.Model }",
      "func (m model) Init() tea.Cmd { return tea.Batch(m.spinner.Tick, tea.Tick(1000000, func(t time.Time) tea.Msg { return t })) }",
      "func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {",
      "  switch msg := msg.(type) {",
      "  case tea.KeyMsg:",
      "    switch msg.String() { case \"q\", \"ctrl+c\", \"esc\": return m, tea.Quit }",
      "  case tea.WindowSizeMsg:",
      "    m.width = msg.Width; m.height = msg.Height",
      "  case tea.MouseMsg:",
      "    return m, tea.Printf(\"mouse %d %d\", msg.X, msg.Y)",
      "  }",
      "  var cmd tea.Cmd; m.list, cmd = m.list.Update(msg); return m, tea.Sequence(cmd)",
      "}",
      "func (m model) View() string { return lipgloss.NewStyle().Width(m.width).Render(m.list.View() + m.spinner.View()) }",
      "func main() { tea.NewProgram(model{}, tea.WithAltScreen(), tea.WithMouseCellMotion()).Run() }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "blessed-dashboard.js"), [
      "const blessed = require('blessed');",
      "const screen = blessed.screen({ smartCSR: true, fullUnicode: true, title: 'RepoTutor dashboard' });",
      "const box = blessed.box({ top: 0, left: 0, width: '50%', height: '50%', tags: true, border: { type: 'line' }, mouse: true, keys: true });",
      "const list = blessed.list({ parent: screen, keys: true, mouse: true, vi: true, items: ['one', 'two'] });",
      "const form = blessed.form({ parent: screen, keys: true, mouse: true });",
      "box.setContent('{center}{bold}Status{/bold}{/center}');",
      "box.key(['enter', 'space'], () => { box.setContent('updated'); screen.render(); });",
      "box.on('click', mouse => { box.setContent(`clicked ${mouse.x}`); screen.render(); });",
      "box.on('mouseover', mouse => { box.setContent(`hover ${mouse.x}`); screen.render(); });",
      "screen.append(box);",
      "box.focus();",
      "screen.key(['escape', 'q', 'C-c'], () => process.exit(0));",
      "screen.on('resize', () => screen.render());",
      "screen.render();",
      "screen.screenshot();",
      "module.exports = {screen, box, list, form};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "terminal-ui.test.tsx"), [
      "import React from 'react';",
      "import {render} from 'ink-testing-library';",
      "import {App} from '../src/ink-app';",
      "test('renders terminal UI snapshot', () => {",
      "  const {lastFrame, stdin} = render(<App />);",
      "  stdin.write('q');",
      "  expect(lastFrame()).toContain('Repo status');",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        ink: "^6.0.0",
        react: "^19.0.0",
        blessed: "^0.1.81",
        "ansi-escapes": "^7.0.0",
        chalk: "^5.0.0"
      },
      devDependencies: {
        "ink-testing-library": "^4.0.0",
        vitest: "^3.0.0",
        tsx: "^4.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/tui",
      "go 1.24",
      "require (",
      "  github.com/charmbracelet/bubbletea v1.3.0",
      "  github.com/charmbracelet/bubbles v0.21.0",
      "  github.com/charmbracelet/lipgloss v1.1.0",
      ")"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "terminal-ui.yml"), [
      "name: terminal-ui",
      "on: [push]",
      "jobs:",
      "  static-terminal-ui:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest terminal-ui.test.tsx",
      "      - run: go test ./...",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: terminal-ui-snapshots",
      "          path: reports/terminal-ui"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "terminal-ui-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      terminalSetups: Array<{ filePath: string; platform: string; renderCount: number; inputCount: number; layoutCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      screenSignals: Array<{ signal: string; readiness: string }>;
      layoutSignals: Array<{ signal: string; readiness: string }>;
      inputSignals: Array<{ signal: string; readiness: string }>;
      focusSignals: Array<{ signal: string; readiness: string }>;
      mouseSignals: Array<{ signal: string; readiness: string }>;
      renderSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Terminal UI readiness Ink Box Text useInput Bubble Tea Model Init Update View tea.NewProgram Blessed screen box key mouse render");
    expect(report.terminalSetups.some((item) => item.filePath === "src/ink-app.tsx" && item.platform === "ink" && item.renderCount > 0 && item.inputCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.terminalSetups.some((item) => item.filePath === "cmd/dashboard/main.go" && item.platform === "bubbletea" && item.renderCount > 0 && item.inputCount > 0)).toBe(true);
    expect(report.terminalSetups.some((item) => item.filePath === "src/blessed-dashboard.js" && item.platform === "blessed" && item.layoutCount > 0 && item.inputCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["ink", "bubbletea", "blessed"]));
    expect(readySignals(report.screenSignals)).toEqual(expect.arrayContaining(["screen", "program", "alt-screen", "raw-mode", "tty"]));
    expect(readySignals(report.layoutSignals)).toEqual(expect.arrayContaining(["box", "text", "list", "form", "style", "border"]));
    expect(readySignals(report.inputSignals)).toEqual(expect.arrayContaining(["keyboard", "use-input", "key-msg", "keypress", "stdin"]));
    expect(readySignals(report.focusSignals)).toEqual(expect.arrayContaining(["focus", "focus-manager", "cursor", "selection"]));
    expect(readySignals(report.mouseSignals)).toEqual(expect.arrayContaining(["mouse", "click", "hover"]));
    expect(readySignals(report.renderSignals)).toEqual(expect.arrayContaining(["render", "view", "static-output", "transform", "ansi"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["init", "update", "exit", "resize", "tick", "batch-sequence"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["ink-testing-library", "go-test", "snapshot", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["ink", "blessed", "bubbletea", "bubbles", "lipgloss"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("useInput"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records terminal UI readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "terminal-ui-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "terminal-ui-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "terminal-ui-readiness.html"))).resolves.toBeUndefined();
    const terminalMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "terminal-ui-readiness.md"), "utf8");
    expect(terminalMarkdown).toContain("Terminal UI Readiness");
    expect(terminalMarkdown).toContain("Ink");
    const terminalHtml = await fs.readFile(path.join(result.session.outputPaths.html, "terminal-ui-readiness.html"), "utf8");
    expect(terminalHtml).toContain("terminal-ui-readiness-card");
    expect(terminalHtml).toContain("data-source-pattern=\"Terminal UI\"");
    expect(terminalHtml).toContain("RepoTutor records terminal UI readiness only");
  });

  it("detects state machine readiness without interpreting or sending runtime events", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-state-machine-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-state-machine-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "checkout-machine.ts"), [
      "import { assign, createActor, fromPromise, setup } from 'xstate';",
      "",
      "type CheckoutContext = { total: number; receipt?: string };",
      "type CheckoutEvent = { type: 'START' } | { type: 'UPDATE'; total: number } | { type: 'SUBMIT' };",
      "",
      "export const checkoutMachine = setup({",
      "  types: {} as { context: CheckoutContext; events: CheckoutEvent },",
      "  actions: {",
      "    rememberTotal: assign({ total: ({ event }) => event.type === 'UPDATE' ? event.total : 0 }),",
      "    rememberReceipt: assign({ receipt: ({ event }) => event.type === 'xstate.done.actor.submitOrder' ? event.output.id : undefined })",
      "  },",
      "  guards: {",
      "    canSubmit: ({ context }) => context.total > 0",
      "  },",
      "  actors: {",
      "    submitOrder: fromPromise(async ({ input }) => ({ id: `receipt-${input.total}` }))",
      "  }",
      "}).createMachine({",
      "  id: 'checkout',",
      "  initial: 'idle',",
      "  context: { total: 0 },",
      "  states: {",
      "    idle: { on: { START: { target: 'editing' } } },",
      "    editing: {",
      "      on: {",
      "        UPDATE: { actions: 'rememberTotal' },",
      "        SUBMIT: { guard: 'canSubmit', target: 'submitting' }",
      "      },",
      "      always: [{ guard: 'canSubmit', target: 'review' }]",
      "    },",
      "    review: { on: { SUBMIT: { target: 'submitting' } } },",
      "    submitting: {",
      "      invoke: {",
      "        id: 'submitOrder',",
      "        src: 'submitOrder',",
      "        input: ({ context }) => ({ total: context.total }),",
      "        onDone: { target: 'complete', actions: 'rememberReceipt' },",
      "        onError: { target: 'failed' }",
      "      }",
      "    },",
      "    failed: { on: { START: 'editing' } },",
      "    complete: { type: 'final' }",
      "  }",
      "});",
      "",
      "const actor = createActor(checkoutMachine);",
      "actor.subscribe((snapshot) => snapshot.matches('complete'));",
      "actor.start();",
      "actor.send({ type: 'START' });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "robot-flow.js"), [
      "import { createMachine, guard, immediate, interpret, invoke, reduce, state, transition } from 'robot3';",
      "",
      "const loadUsers = async () => [{ id: 'ada' }];",
      "const canRetry = (ctx) => ctx.retries < 2;",
      "",
      "export const userMachine = createMachine({",
      "  idle: state(transition('fetch', 'loading')),",
      "  loading: invoke(loadUsers,",
      "    transition('done', 'loaded', reduce((ctx, ev) => ({ ...ctx, users: ev.data }))),",
      "    transition('error', 'failed', reduce((ctx) => ({ ...ctx, retries: ctx.retries + 1 })))",
      "  ),",
      "  failed: state(immediate('idle', guard(canRetry))),",
      "  loaded: state(transition('reset', 'idle'))",
      "}, () => ({ users: [], retries: 0 }));",
      "",
      "const service = interpret(userMachine, (service) => service.machine);",
      "service.send('fetch');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "zag-toggle.tsx"), [
      "import { createMachine } from '@zag-js/core';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "import * as toggle from '@zag-js/toggle';",
      "",
      "export const panelMachine = createMachine({",
      "  id: 'panel',",
      "  initial: 'closed',",
      "  context: { count: 0 },",
      "  computed: { canOpen: ({ context }) => context.count >= 0 },",
      "  watch: { count: ['trackCount'] },",
      "  states: {",
      "    closed: {",
      "      entry: ['onClosed'],",
      "      on: { OPEN: { target: 'open', actions: ['increment'] } }",
      "    },",
      "    open: {",
      "      effects: ['syncFocus'],",
      "      exit: ['onExit'],",
      "      on: { CLOSE: 'closed', TOGGLE: { target: 'closed', guard: 'canClose' } }",
      "    }",
      "  }",
      "});",
      "",
      "export function ToggleButton() {",
      "  const service = useMachine(toggle.machine({ id: 'toggle' }));",
      "  const api = toggle.connect(service, normalizeProps);",
      "  return <button {...api.getRootProps()}>{api.pressed ? 'On' : 'Off'}</button>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "state-machine.test.ts"), [
      "import { describe, expect, it } from 'vitest';",
      "import { createActor } from 'xstate';",
      "import { checkoutMachine } from '../src/checkout-machine';",
      "",
      "describe('checkout machine', () => {",
      "  it('transitions through start and submit events', () => {",
      "    const actor = createActor(checkoutMachine);",
      "    actor.start();",
      "    actor.send({ type: 'START' });",
      "    expect(actor.getSnapshot().matches('editing')).toBe(true);",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest state-machine.test.ts"
      },
      dependencies: {
        xstate: "^5.24.0",
        robot3: "^1.2.0",
        "@zag-js/core": "^1.29.0",
        "@zag-js/react": "^1.29.0",
        "@zag-js/toggle": "^1.29.0",
        react: "^19.0.0"
      },
      devDependencies: {
        vitest: "^3.0.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "state-machine.yml"), [
      "name: state-machine",
      "on: [push]",
      "jobs:",
      "  static-state-machine:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest state-machine.test.ts",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: state-machine-traces",
      "          path: reports/state-machine"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "state-machine-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      stateMachineSetups: Array<{ filePath: string; platform: string; stateCount: number; transitionCount: number; guardCount: number; actorCount: number; invokeCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      transitionSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actorSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      eventSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("State machine readiness XState createMachine setup createActor Robot state transition interpret Zag createMachine connect states on actions guards");
    expect(report.stateMachineSetups.some((item) => item.filePath === "src/checkout-machine.ts" && item.platform === "xstate" && item.stateCount > 0 && item.transitionCount > 0 && item.actorCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.stateMachineSetups.some((item) => item.filePath === "src/robot-flow.js" && item.platform === "robot" && item.transitionCount > 0 && item.guardCount > 0 && item.invokeCount > 0)).toBe(true);
    expect(report.stateMachineSetups.some((item) => item.filePath === "src/zag-toggle.tsx" && item.platform === "zag" && item.stateCount > 0 && item.transitionCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["xstate", "robot", "zag"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["initial", "states", "final", "computed", "watch"]));
    expect(readySignals(report.transitionSignals)).toEqual(expect.arrayContaining(["on", "target", "always", "immediate", "transition"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["assign", "actions", "reduce", "entry", "exit"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["guard", "guards", "can-guard"]));
    expect(readySignals(report.actorSignals)).toEqual(expect.arrayContaining(["create-actor", "interpret", "invoke", "from-promise", "service"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["context", "snapshot", "matches", "computed", "watch"]));
    expect(readySignals(report.eventSignals)).toEqual(expect.arrayContaining(["send", "subscribe", "event-type", "on-done", "on-error"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["xstate", "robot3", "@zag-js/core", "@zag-js/react", "@zag-js/toggle"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("createMachine"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records state machine readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "state-machine-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "state-machine-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "state-machine-readiness.html"))).resolves.toBeUndefined();
    const stateMachineMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "state-machine-readiness.md"), "utf8");
    expect(stateMachineMarkdown).toContain("State Machine Readiness");
    expect(stateMachineMarkdown).toContain("XState");
    const stateMachineHtml = await fs.readFile(path.join(result.session.outputPaths.html, "state-machine-readiness.html"), "utf8");
    expect(stateMachineHtml).toContain("state-machine-readiness-card");
    expect(stateMachineHtml).toContain("data-source-pattern=\"State Machine\"");
    expect(stateMachineHtml).toContain("RepoTutor records state machine readiness only");
  });

  it("detects animation readiness without starting timelines or reading live frames", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-animation-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-animation-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "motion-card.tsx"), [
      "import { AnimatePresence, motion, useAnimate, useAnimationControls, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';",
      "",
      "const cardVariants = {",
      "  hidden: { opacity: 0, y: 24 },",
      "  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 20, duration: 0.4, ease: 'linear', staggerChildren: 0.08 } }",
      "};",
      "",
      "export function MotionCard({ open }: { open: boolean }) {",
      "  const shouldReduceMotion = useReducedMotion();",
      "  const controls = useAnimationControls();",
      "  const [scope, animate] = useAnimate();",
      "  const x = useMotionValue(0);",
      "  const springX = useSpring(x, { stiffness: 220, damping: 24 });",
      "  const opacity = useTransform(springX, [0, 100], [0.2, 1]);",
      "  const inView = useInView(scope);",
      "  void animate;",
      "  void controls;",
      "  void shouldReduceMotion;",
      "  void inView;",
      "  return <AnimatePresence mode=\"wait\">{open && <motion.div ref={scope} layout layoutId=\"card\" initial=\"hidden\" animate=\"visible\" exit=\"hidden\" variants={cardVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3, delay: 0.05 }} style={{ opacity, x: springX, willChange: 'transform, opacity' }} />}</AnimatePresence>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "spring-panel.tsx"), [
      "import { Controller, SpringValue, animated, config, useSpring, useSprings, useTrail, useTransition } from '@react-spring/web';",
      "",
      "export function SpringPanel({ items }: { items: string[] }) {",
      "  const [style, api] = useSpring(() => ({ from: { opacity: 0 }, to: { opacity: 1 }, config: config.gentle }));",
      "  const springs = useSprings(items.length, items.map((_, index) => ({ from: { y: 16 }, to: { y: 0 }, delay: index * 30 })));",
      "  const trail = useTrail(items.length, { from: { scale: 0.95 }, to: { scale: 1 }, trail: 80 });",
      "  const transitions = useTransition(items, { from: { opacity: 0 }, enter: { opacity: 1 }, leave: { opacity: 0 }, config: { tension: 210, friction: 20 } });",
      "  const controller = new Controller({ opacity: 0 });",
      "  const value = new SpringValue(0);",
      "  api.start({ opacity: 1 });",
      "  void springs;",
      "  void trail;",
      "  void transitions;",
      "  void controller;",
      "  void value;",
      "  return <animated.div style={style}>{items.join(',')}</animated.div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "gsap-timeline.js"), [
      "import { gsap } from 'gsap';",
      "import { ScrollTrigger } from 'gsap/ScrollTrigger';",
      "",
      "gsap.registerPlugin(ScrollTrigger);",
      "",
      "export function buildHeroTimeline(node) {",
      "  gsap.set(node, { opacity: 0, y: 16 });",
      "  const timeline = gsap.timeline({ defaults: { duration: 0.4, ease: 'power2.out' }, repeat: 1, yoyo: true });",
      "  timeline.from(node, { opacity: 0 }).to(node, { opacity: 1, stagger: 0.05 }).fromTo(node, { scale: 0.96 }, { scale: 1 });",
      "  ScrollTrigger.create({ trigger: node, animation: timeline, scrub: true });",
      "  gsap.killTweensOf(node);",
      "  return timeline;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "animation.spec.ts"), [
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('animation traces', () => {",
      "  it('captures deterministic frame evidence without live timeline playback', () => {",
      "    vi.useFakeTimers();",
      "    window.matchMedia('(prefers-reduced-motion: reduce)');",
      "    requestAnimationFrame(() => undefined);",
      "    document.createElement('div').getAnimations();",
      "    vi.advanceTimersByTime(160);",
      "    expect(true).toBe(true);",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest animation.spec.ts",
        "test:visual": "playwright test animation.spec.ts"
      },
      dependencies: {
        motion: "^12.0.0",
        "framer-motion": "^12.0.0",
        "@react-spring/web": "^10.0.0",
        gsap: "^3.13.0",
        react: "^19.0.0"
      },
      devDependencies: {
        vitest: "^3.0.0",
        playwright: "^1.50.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "animation.yml"), [
      "name: animation",
      "on: [push]",
      "jobs:",
      "  static-animation:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest animation.spec.ts",
      "      - run: npx playwright test animation.spec.ts",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: animation-traces",
      "          path: reports/animation"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "animation-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      animationSetups: Array<{ filePath: string; platform: string; componentCount: number; timelineCount: number; springCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      librarySignals: Array<{ signal: string; readiness: string }>;
      declarationSignals: Array<{ signal: string; readiness: string }>;
      timingSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      layoutSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Animation readiness Motion animate AnimatePresence variants React Spring useSpring animated GSAP timeline ScrollTrigger reduced motion frame tests");
    expect(report.animationSetups.some((item) => item.filePath === "src/motion-card.tsx" && item.platform === "motion" && item.componentCount > 0 && item.springCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.animationSetups.some((item) => item.filePath === "src/spring-panel.tsx" && item.platform === "react-spring" && item.componentCount > 0 && item.springCount > 0)).toBe(true);
    expect(report.animationSetups.some((item) => item.filePath === "src/gsap-timeline.js" && item.platform === "gsap" && item.timelineCount > 0)).toBe(true);
    expect(readySignals(report.librarySignals)).toEqual(expect.arrayContaining(["motion", "framer-motion", "react-spring", "gsap"]));
    expect(readySignals(report.declarationSignals)).toEqual(expect.arrayContaining(["motion-component", "animate-prop", "variants", "transition", "timeline"]));
    expect(readySignals(report.timingSignals)).toEqual(expect.arrayContaining(["duration", "delay", "ease", "spring-config", "stagger", "repeat", "yoyo"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["while-hover", "while-tap", "scroll-trigger", "in-view"]));
    expect(readySignals(report.layoutSignals)).toEqual(expect.arrayContaining(["layout", "layout-id", "animate-presence", "exit"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["reduced-motion", "prefers-reduced-motion", "will-change"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["controls", "motion-value", "animation-frame", "get-animations", "kill"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "fake-timers", "frame-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["motion", "framer-motion", "@react-spring/web", "gsap"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("AnimatePresence"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records animation readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "animation-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "animation-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "animation-readiness.html"))).resolves.toBeUndefined();
    const animationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "animation-readiness.md"), "utf8");
    expect(animationMarkdown).toContain("Animation Readiness");
    expect(animationMarkdown).toContain("Motion");
    const animationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "animation-readiness.html"), "utf8");
    expect(animationHtml).toContain("animation-readiness-card");
    expect(animationHtml).toContain("data-source-pattern=\"Animation\"");
    expect(animationHtml).toContain("RepoTutor records animation readiness only");
  });

  it("detects drag and drop readiness without dispatching pointer or drop events", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dnd-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dnd-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "dnd-kit-board.tsx"), [
      "import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';",
      "import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';",
      "import { CSS } from '@dnd-kit/utilities';",
      "",
      "function Card({ id }: { id: string }) {",
      "  const draggable = useDraggable({ id });",
      "  const sortable = useSortable({ id });",
      "  return <button ref={draggable.setNodeRef} aria-describedby=\"dnd-instructions\" style={{ transform: CSS.Transform.toString(sortable.transform) }}>{id}</button>;",
      "}",
      "",
      "export function Board({ items }: { items: string[] }) {",
      "  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));",
      "  const droppable = useDroppable({ id: 'lane' });",
      "  const screenReaderInstructions = { draggable: 'Press space to lift, arrows to move, space to drop.' };",
      "  return <DndContext sensors={sensors} collisionDetection={closestCenter} screenReaderInstructions={screenReaderInstructions} onDragEnd={(event) => arrayMove(items, event.active.data.current?.sortable.index ?? 0, event.over?.data.current?.sortable.index ?? 0)}><SortableContext items={items} strategy={verticalListSortingStrategy}><section ref={droppable.setNodeRef}>{items.map((id) => <Card key={id} id={id} />)}</section></SortableContext><DragOverlay>{items[0]}</DragOverlay><p id=\"dnd-instructions\" aria-live=\"polite\">Keyboard drag enabled</p></DndContext>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "react-dnd-card.tsx"), [
      "import { DndProvider, useDrag, useDragLayer, useDrop } from 'react-dnd';",
      "import { HTML5Backend } from 'react-dnd-html5-backend';",
      "import { TouchBackend } from 'react-dnd-touch-backend';",
      "",
      "export function ReactDndCard({ touch }: { touch: boolean }) {",
      "  const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({ type: 'CARD', item: { id: 'card' }, collect: (monitor) => ({ isDragging: monitor.isDragging() }) }));",
      "  const [{ canDrop }, dropRef] = useDrop(() => ({ accept: 'CARD', canDrop: () => true, hover: () => undefined, drop: () => ({ lane: 'done' }), collect: (monitor) => ({ canDrop: monitor.canDrop() }) }));",
      "  const layer = useDragLayer((monitor) => ({ item: monitor.getItem(), offset: monitor.getSourceClientOffset() }));",
      "  void previewRef;",
      "  void layer;",
      "  return <DndProvider backend={touch ? TouchBackend : HTML5Backend}><div ref={dropRef} data-can-drop={canDrop}><button ref={dragRef} aria-grabbed={isDragging}>Drag card</button></div></DndProvider>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "sortable-list.js"), [
      "import Sortable from 'sortablejs';",
      "",
      "export function bindSortable(list, store) {",
      "  return Sortable.create(list, {",
      "    group: 'cards',",
      "    animation: 150,",
      "    handle: '.handle',",
      "    filter: '.disabled',",
      "    ghostClass: 'sortable-ghost',",
      "    chosenClass: 'sortable-chosen',",
      "    dragClass: 'sortable-drag',",
      "    swapThreshold: 0.65,",
      "    fallbackOnBody: true,",
      "    store: { get: () => store.get('order'), set: (sortable) => store.set('order', sortable.toArray()) },",
      "    onMove: () => true,",
      "    onEnd: (event) => store.set('end', event.newIndex),",
      "    onUpdate: (event) => store.set('update', event.oldIndex)",
      "  });",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "dnd.spec.ts"), [
      "import { fireEvent } from '@testing-library/dom';",
      "import { describe, expect, it } from 'vitest';",
      "import { TestBackend } from 'react-dnd-test-backend';",
      "",
      "describe('drag and drop traces', () => {",
      "  it('captures deterministic drag contracts without live browser playback', () => {",
      "    const item = document.createElement('button');",
      "    const target = document.createElement('div');",
      "    item.draggable = true;",
      "    fireEvent.pointerDown(item);",
      "    fireEvent.dragStart(item, { dataTransfer: new DataTransfer() });",
      "    fireEvent.keyDown(item, { key: ' ' });",
      "    fireEvent.drop(target);",
      "    void TestBackend;",
      "    expect(item.draggable).toBe(true);",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest dnd.spec.ts",
        "test:e2e": "playwright test dnd.spec.ts"
      },
      dependencies: {
        "@dnd-kit/core": "^6.3.1",
        "@dnd-kit/sortable": "^10.0.0",
        "@dnd-kit/utilities": "^3.2.2",
        "react-dnd": "^16.0.1",
        "react-dnd-html5-backend": "^16.0.1",
        "react-dnd-touch-backend": "^16.0.1",
        "react-dnd-test-backend": "^16.0.1",
        sortablejs: "^1.15.6",
        react: "^19.0.0"
      },
      devDependencies: {
        "@testing-library/dom": "^10.4.0",
        vitest: "^3.0.0",
        playwright: "^1.50.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "dnd.yml"), [
      "name: dnd",
      "on: [push]",
      "jobs:",
      "  static-dnd:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest dnd.spec.ts",
      "      - run: npx playwright test dnd.spec.ts",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: dnd-traces",
      "          path: reports/dnd"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "drag-and-drop-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dragAndDropSetups: Array<{ filePath: string; platform: string; providerCount: number; draggableCount: number; droppableCount: number; sortableCount: number; sensorCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      librarySignals: Array<{ signal: string; readiness: string }>;
      providerSignals: Array<{ signal: string; readiness: string }>;
      sensorSignals: Array<{ signal: string; readiness: string }>;
      draggableSignals: Array<{ signal: string; readiness: string }>;
      droppableSignals: Array<{ signal: string; readiness: string }>;
      sortableSignals: Array<{ signal: string; readiness: string }>;
      feedbackSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Drag and drop readiness DnD Kit DndContext useDraggable useDroppable React DnD DndProvider useDrag useDrop SortableJS onEnd keyboard tests");
    expect(report.dragAndDropSetups.some((item) => item.filePath === "src/dnd-kit-board.tsx" && item.platform === "dnd-kit" && item.providerCount > 0 && item.draggableCount > 0 && item.droppableCount > 0 && item.sortableCount > 0 && item.sensorCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.dragAndDropSetups.some((item) => item.filePath === "src/react-dnd-card.tsx" && item.platform === "react-dnd" && item.providerCount > 0 && item.draggableCount > 0 && item.droppableCount > 0)).toBe(true);
    expect(report.dragAndDropSetups.some((item) => item.filePath === "src/sortable-list.js" && item.platform === "sortablejs" && item.sortableCount > 0)).toBe(true);
    expect(readySignals(report.librarySignals)).toEqual(expect.arrayContaining(["dnd-kit", "react-dnd", "sortablejs"]));
    expect(readySignals(report.providerSignals)).toEqual(expect.arrayContaining(["dnd-context", "dnd-provider", "backend"]));
    expect(readySignals(report.sensorSignals)).toEqual(expect.arrayContaining(["pointer-sensor", "keyboard-sensor", "touch-backend", "test-backend"]));
    expect(readySignals(report.draggableSignals)).toEqual(expect.arrayContaining(["use-draggable", "use-drag", "drag-ref", "dragstart"]));
    expect(readySignals(report.droppableSignals)).toEqual(expect.arrayContaining(["use-droppable", "use-drop", "drop-ref", "drop-handler"]));
    expect(readySignals(report.sortableSignals)).toEqual(expect.arrayContaining(["sortable-context", "use-sortable", "array-move", "sortable-create", "on-end"]));
    expect(readySignals(report.feedbackSignals)).toEqual(expect.arrayContaining(["drag-overlay", "ghost-class", "chosen-class", "drag-class", "monitor", "collect"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["keyboard", "screen-reader-instructions", "aria-live", "aria-grabbed", "handle"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "testing-library", "pointer-event", "drag-event", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@dnd-kit/core", "@dnd-kit/sortable", "react-dnd", "react-dnd-html5-backend", "react-dnd-test-backend", "sortablejs"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("DndContext"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records drag-and-drop readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "drag-and-drop-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "drag-and-drop-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "drag-and-drop-readiness.html"))).resolves.toBeUndefined();
    const dndMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "drag-and-drop-readiness.md"), "utf8");
    expect(dndMarkdown).toContain("Drag And Drop Readiness");
    expect(dndMarkdown).toContain("DnD Kit");
    const dndHtml = await fs.readFile(path.join(result.session.outputPaths.html, "drag-and-drop-readiness.html"), "utf8");
    expect(dndHtml).toContain("drag-and-drop-readiness-card");
    expect(dndHtml).toContain("data-source-pattern=\"Drag and Drop\"");
    expect(dndHtml).toContain("RepoTutor records drag-and-drop readiness only");
  });

  it("detects rich text editor readiness without mounting editors or mutating documents", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-editor-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-editor-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "tiptap-editor.tsx"), [
      "import { BubbleMenu, EditorContent, FloatingMenu, useEditor, useEditorState } from '@tiptap/react';",
      "import StarterKit from '@tiptap/starter-kit';",
      "import Link from '@tiptap/extension-link';",
      "import Placeholder from '@tiptap/extension-placeholder';",
      "import Collaboration from '@tiptap/extension-collaboration';",
      "import { Mark, Node } from '@tiptap/core';",
      "import * as Y from 'yjs';",
      "",
      "const ydoc = new Y.Doc();",
      "const awareness = { clientID: 1 };",
      "",
      "export function TiptapEditor({ content }: { content: string }) {",
      "  const editor = useEditor({",
      "    extensions: [",
      "      StarterKit.configure({ history: false }),",
      "      Link.configure({ openOnClick: false, autolink: true }),",
      "      Placeholder.configure({ placeholder: 'Write a lesson...' }),",
      "      Collaboration.configure({ document: ydoc, field: 'body' }),",
      "      Node.create({ name: 'callout' }),",
      "      Mark.create({ name: 'highlight' })",
      "    ],",
      "    content,",
      "    editorProps: { attributes: { role: 'textbox', 'aria-label': 'Rich text editor' } },",
      "    onUpdate: ({ editor }) => editor.getJSON()",
      "  });",
      "  const state = useEditorState({ editor, selector: ({ editor }) => ({ canBold: editor.can().chain().focus().toggleBold().run(), json: editor.getJSON(), html: editor.getHTML() }) });",
      "  if (!editor) return null;",
      "  editor.chain().focus().toggleBold().toggleItalic().toggleStrike().toggleBulletList().toggleCode().setLink({ href: 'https://example.com' }).run();",
      "  editor.commands.setContent(content);",
      "  void state;",
      "  void awareness;",
      "  return <><EditorContent editor={editor} /><BubbleMenu editor={editor}>format</BubbleMenu><FloatingMenu editor={editor}>insert</FloatingMenu></>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "prosemirror-setup.ts"), [
      "import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model';",
      "import { EditorState, Plugin, Transaction } from 'prosemirror-state';",
      "import { EditorView, Decoration, DecorationSet } from 'prosemirror-view';",
      "import { keymap } from 'prosemirror-keymap';",
      "import { inputRules } from 'prosemirror-inputrules';",
      "import { history, undo, redo } from 'prosemirror-history';",
      "import { exampleSetup } from 'prosemirror-example-setup';",
      "import { schema as basicSchema } from 'prosemirror-schema-basic';",
      "",
      "export function mountProseMirror(place: HTMLElement, doc: HTMLElement) {",
      "  const schema = new Schema({ nodes: basicSchema.spec.nodes, marks: basicSchema.spec.marks });",
      "  const parsed = DOMParser.fromSchema(schema).parse(doc);",
      "  const plugins = [",
      "    keymap({ 'Mod-z': undo, 'Mod-y': redo }),",
      "    inputRules({ rules: [] }),",
      "    history(),",
      "    ...exampleSetup({ schema }),",
      "    new Plugin({ props: { decorations: () => DecorationSet.create(parsed, [Decoration.inline(0, 1, { class: 'selection' })]) } })",
      "  ];",
      "  const state = EditorState.create({ doc: parsed, schema, plugins });",
      "  const view = new EditorView(place, {",
      "    state,",
      "    dispatchTransaction(transaction: Transaction) {",
      "      const nextState = view.state.apply(transaction);",
      "      view.updateState(nextState);",
      "    },",
      "    attributes: { role: 'textbox', 'aria-label': 'ProseMirror editor' }",
      "  });",
      "  DOMSerializer.fromSchema(schema).serializeFragment(view.state.doc.content);",
      "  return view;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "lexical-composer.tsx"), [
      "import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';",
      "import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';",
      "import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';",
      "import { CodeHighlightPlugin } from '@lexical/react/LexicalCodeHighlightPlugin';",
      "import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';",
      "import { LexicalComposer } from '@lexical/react/LexicalComposer';",
      "import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';",
      "import { ContentEditable } from '@lexical/react/LexicalContentEditable';",
      "import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';",
      "import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';",
      "import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';",
      "import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';",
      "import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';",
      "import { ListPlugin } from '@lexical/react/LexicalListPlugin';",
      "import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';",
      "import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';",
      "import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';",
      "import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';",
      "import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';",
      "import { TablePlugin } from '@lexical/react/LexicalTablePlugin';",
      "import { TreeView } from '@lexical/react/LexicalTreeView';",
      "import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';",
      "import { mergeRegister } from '@lexical/utils';",
      "import * as Y from 'yjs';",
      "import { $addUpdateTag, $createParagraphNode, $createTextNode, $getRoot, $getSelection, $hasUpdateTag, $isRangeSelection, $setSelection, COMMAND_PRIORITY_EDITOR, DecoratorNode, ElementNode, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, GridSelection, HISTORY_PUSH_TAG, KEY_ENTER_COMMAND, LineBreakNode, NodeSelection, ParagraphNode, PASTE_TAG, RangeSelection, RootNode, SELECTION_CHANGE_COMMAND, SerializedEditorState, SKIP_DOM_SELECTION_TAG, SKIP_SCROLL_INTO_VIEW_TAG, TextNode, createCommand, createEditor } from 'lexical';",
      "import FloatingTextFormatToolbarPlugin from './FloatingTextFormatToolbarPlugin';",
      "",
      "const INSERT_CALLOUT_COMMAND = createCommand<string>('INSERT_CALLOUT_COMMAND');",
      "const editor = createEditor({ namespace: 'RepoTutorVanillaLexical', theme: { paragraph: 'paragraph' }, nodes: [TextNode, ParagraphNode, LineBreakNode, RootNode], onError(error: Error) { throw error; }, editable: true });",
      "const ydoc = new Y.Doc();",
      "editor.update(() => {",
      "  const root = $getRoot();",
      "  const paragraph = $createParagraphNode();",
      "  paragraph.append($createTextNode('Study Lexical'));",
      "  root.append(paragraph);",
      "  $addUpdateTag(HISTORY_PUSH_TAG);",
      "  $addUpdateTag(PASTE_TAG);",
      "  $addUpdateTag(SKIP_DOM_SELECTION_TAG);",
      "  $addUpdateTag(SKIP_SCROLL_INTO_VIEW_TAG);",
      "  const selection = $getSelection();",
      "  if ($isRangeSelection(selection)) $setSelection(selection);",
      "  void $hasUpdateTag(HISTORY_PUSH_TAG);",
      "});",
      "editor.read(() => $getRoot().getTextContent());",
      "const state = editor.getEditorState();",
      "const serialized: SerializedEditorState = state.toJSON();",
      "const parsed = editor.parseEditorState(JSON.stringify(serialized));",
      "editor.setEditorState(parsed);",
      "editor.setEditable(false);",
      "const cleanup = mergeRegister(",
      "  editor.registerCommand(INSERT_CALLOUT_COMMAND, () => true, COMMAND_PRIORITY_EDITOR),",
      "  editor.registerCommand(FORMAT_TEXT_COMMAND, () => true, COMMAND_PRIORITY_EDITOR),",
      "  editor.registerCommand(FORMAT_ELEMENT_COMMAND, () => true, COMMAND_PRIORITY_EDITOR),",
      "  editor.registerCommand(KEY_ENTER_COMMAND, () => true, COMMAND_PRIORITY_EDITOR),",
      "  editor.registerCommand(SELECTION_CHANGE_COMMAND, () => true, COMMAND_PRIORITY_EDITOR),",
      "  editor.registerUpdateListener(({ editorState, tags }) => editorState.read(() => tags.has('study'))),",
      "  editor.registerTextContentListener((text) => text.length),",
      "  editor.registerMutationListener(TextNode, (nodes) => nodes.size),",
      "  editor.registerRootListener((rootElement) => rootElement?.setAttribute('data-editor', 'true')),",
      "  editor.registerDecoratorListener((decorators) => Object.keys(decorators))",
      ");",
      "const html = $generateHtmlFromNodes(editor);",
      "const dom = new DOMParser().parseFromString(html, 'text/html');",
      "const domNodes = $generateNodesFromDOM(editor, dom);",
      "class MentionNode extends DecoratorNode<JSX.Element> { decorate() { return <span />; } static getType() { return 'mention'; } static clone(node: MentionNode) { return new MentionNode(node.__key); } }",
      "class BlockNode extends ElementNode {}",
      "const range = {} as RangeSelection;",
      "const nodeSelection = {} as NodeSelection;",
      "const gridSelection = {} as GridSelection;",
      "",
      "function ToolbarPlugin() {",
      "  const [editor] = useLexicalComposerContext();",
      "  editor.update(() => {",
      "    const root = $getRoot();",
      "    const selection = $getSelection();",
      "    void root;",
      "    void selection;",
      "  });",
      "  editor.registerCommand(INSERT_CALLOUT_COMMAND, () => true, COMMAND_PRIORITY_EDITOR);",
      "  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');",
      "  return null;",
      "}",
      "",
      "export function LexicalEditor() {",
      "  const initialConfig = { namespace: 'RepoTutorRichText', theme: { paragraph: 'paragraph' }, nodes: [TextNode, ElementNode, DecoratorNode, MentionNode, BlockNode], onError(error: Error) { throw error; }, editable: true };",
      "  return <LexicalComposer initialConfig={initialConfig}><LexicalNestedComposer initialEditor={editor}><ToolbarPlugin /><RichTextPlugin contentEditable={<ContentEditable role=\"textbox\" aria-label=\"Lexical editor\" />} placeholder={<span>Write a note</span>} ErrorBoundary={LexicalErrorBoundary} /><PlainTextPlugin contentEditable={<ContentEditable />} placeholder={null} ErrorBoundary={LexicalErrorBoundary} /><HistoryPlugin /><OnChangePlugin onChange={(editorState) => editorState.toJSON()} /><AutoFocusPlugin /><ListPlugin /><CheckListPlugin /><LinkPlugin /><AutoLinkPlugin matchers={[]} /><TablePlugin /><MarkdownShortcutPlugin /><CodeHighlightPlugin /><HashtagPlugin /><CollaborationPlugin id=\"study\" providerFactory={() => ({}) as never} shouldBootstrap={true} /><TreeView editor={editor} treeTypeButtonClassName=\"tree\" timeTravelButtonClassName=\"time\" timeTravelPanelSliderClassName=\"slider\" timeTravelPanelButtonClassName=\"button\" timeTravelPanelClassName=\"panel\" viewClassName=\"view\" /><DraggableBlockPlugin_EXPERIMENTAL anchorElem={document.body} /><FloatingTextFormatToolbarPlugin editor={editor} /></LexicalNestedComposer></LexicalComposer>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "rich-text-editor.spec.ts"), [
      "import { fireEvent, getByRole } from '@testing-library/dom';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { createEditor } from 'lexical';",
      "import { EditorState } from 'prosemirror-state';",
      "",
      "describe('rich text editor contracts', () => {",
      "  it('captures deterministic keyboard and input contracts without mounting app editors', async () => {",
      "    const host = document.createElement('div');",
      "    host.setAttribute('contenteditable', 'true');",
      "    host.setAttribute('role', 'textbox');",
      "    host.setAttribute('aria-label', 'Rich text editor');",
      "    document.body.append(host);",
      "    await userEvent.keyboard('{Control>}b{/Control}');",
      "    fireEvent.input(host, { inputType: 'formatBold', data: 'hello' });",
      "    document.execCommand?.('bold');",
      "    void createEditor;",
      "    void EditorState;",
      "    expect(getByRole(document.body, 'textbox')).toBe(host);",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest rich-text-editor.spec.ts",
        "test:e2e": "playwright test rich-text-editor.spec.ts"
      },
      dependencies: {
        "@tiptap/core": "^2.11.5",
        "@tiptap/react": "^2.11.5",
        "@tiptap/starter-kit": "^2.11.5",
        "@tiptap/extension-link": "^2.11.5",
        "@tiptap/extension-placeholder": "^2.11.5",
        "@tiptap/extension-collaboration": "^2.11.5",
        "prosemirror-model": "^1.24.1",
        "prosemirror-state": "^1.4.3",
        "prosemirror-view": "^1.38.1",
        "prosemirror-keymap": "^1.2.3",
        "prosemirror-inputrules": "^1.4.0",
        "prosemirror-history": "^1.4.1",
        "prosemirror-example-setup": "^1.2.3",
        "prosemirror-schema-basic": "^1.2.3",
        lexical: "^0.27.2",
        "@lexical/code": "^0.27.2",
        "@lexical/hashtag": "^0.27.2",
        "@lexical/html": "^0.27.2",
        "@lexical/link": "^0.27.2",
        "@lexical/list": "^0.27.2",
        "@lexical/markdown": "^0.27.2",
        "@lexical/react": "^0.27.2",
        "@lexical/table": "^0.27.2",
        "@lexical/utils": "^0.27.2",
        "@lexical/yjs": "^0.27.2",
        react: "^19.0.0",
        yjs: "^13.6.27"
      },
      devDependencies: {
        "@testing-library/dom": "^10.4.0",
        "@testing-library/user-event": "^14.6.1",
        vitest: "^3.0.0",
        playwright: "^1.50.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "rich-text-editor.yml"), [
      "name: rich-text-editor",
      "on: [push]",
      "jobs:",
      "  static-rich-text-editor:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest rich-text-editor.spec.ts",
      "      - run: npx playwright test rich-text-editor.spec.ts",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: rich-text-editor-traces",
      "          path: reports/rich-text-editor"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "rich-text-editor-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      richTextEditorSetups: Array<{ filePath: string; platform: string; schemaCount: number; renderCount: number; commandCount: number; stateCount: number; extensionCount: number; collaborationCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      renderSignals: Array<{ signal: string; readiness: string }>;
      commandSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      extensionSignals: Array<{ signal: string; readiness: string }>;
      collaborationSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      lexicalSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Rich text editor readiness Tiptap useEditor EditorContent ProseMirror EditorState EditorView LexicalComposer RichTextPlugin ContentEditable initialConfig namespace theme nodes onError PlainTextPlugin HistoryPlugin OnChangePlugin AutoFocusPlugin LexicalErrorBoundary editor.update editor.read registerCommand createCommand COMMAND_PRIORITY $getRoot $getSelection $isRangeSelection $createTextNode $generateHtmlFromNodes MarkdownShortcutPlugin ListPlugin LinkPlugin TablePlugin CollaborationPlugin Yjs mergeRegister createEditor commands keyboard tests");
    expect(report.richTextEditorSetups.some((item) => item.filePath === "src/tiptap-editor.tsx" && item.platform === "tiptap" && item.renderCount > 0 && item.commandCount > 0 && item.stateCount > 0 && item.extensionCount > 0 && item.collaborationCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.richTextEditorSetups.some((item) => item.filePath === "src/prosemirror-setup.ts" && item.platform === "prosemirror" && item.schemaCount > 0 && item.renderCount > 0 && item.commandCount > 0 && item.stateCount > 0 && item.extensionCount > 0)).toBe(true);
    expect(report.richTextEditorSetups.some((item) => item.filePath === "src/lexical-composer.tsx" && item.platform === "lexical" && item.renderCount > 0 && item.commandCount > 0 && item.stateCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["tiptap", "prosemirror", "lexical"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["starter-kit", "schema", "node", "mark", "nodes"]));
    expect(readySignals(report.renderSignals)).toEqual(expect.arrayContaining(["editor-content", "editor-view", "contenteditable", "rich-text-plugin"]));
    expect(readySignals(report.commandSignals)).toEqual(expect.arrayContaining(["chain", "commands", "dispatch-command", "format-text", "keymap"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["editor-state", "transaction", "update", "selection", "json-html"]));
    expect(readySignals(report.extensionSignals)).toEqual(expect.arrayContaining(["extension-create", "node-create", "mark-create", "plugin", "history"]));
    expect(readySignals(report.collaborationSignals)).toEqual(expect.arrayContaining(["collaboration", "awareness", "yjs"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-textbox", "aria-label", "keyboard", "placeholder"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "testing-library", "keyboard-test", "input-test", "artifact-upload"]));
    expect(readySignals(report.lexicalSignals)).toEqual(expect.arrayContaining(["composer", "composer-context", "initial-config", "namespace", "theme", "nodes-registration", "on-error", "rich-text-plugin", "plain-text-plugin", "content-editable", "error-boundary", "history-plugin", "on-change-plugin", "autofocus-plugin", "nested-composer", "editor-update", "editor-read", "editor-state", "parse-editor-state", "serialized-editor-state", "editable-state", "dispatch-command", "register-command", "create-command", "command-priority", "format-text-command", "format-element-command", "key-command", "selection-change-command", "update-listener", "text-content-listener", "mutation-listener", "root-listener", "decorator-listener", "root-node", "selection-api", "range-selection", "node-selection", "grid-selection", "text-node", "element-node", "decorator-node", "paragraph-node", "line-break-node", "html-import-export", "markdown-shortcut", "list-plugin", "link-plugin", "check-list-plugin", "table-plugin", "code-highlight-plugin", "hashtag-plugin", "auto-link-plugin", "collaboration-plugin", "yjs-collab", "update-tags", "merge-register", "create-editor", "tree-view", "draggable-block", "floating-toolbar"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@tiptap/react", "@tiptap/starter-kit", "prosemirror-state", "prosemirror-view", "lexical", "@lexical/react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("LexicalComposer"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records rich text editor readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "rich-text-editor-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "rich-text-editor-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "rich-text-editor-readiness.html"))).resolves.toBeUndefined();
    const editorMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "rich-text-editor-readiness.md"), "utf8");
    expect(editorMarkdown).toContain("Rich Text Editor Readiness");
    expect(editorMarkdown).toContain("Tiptap");
    expect(editorMarkdown).toContain("Lexical Signals");
    const editorHtml = await fs.readFile(path.join(result.session.outputPaths.html, "rich-text-editor-readiness.html"), "utf8");
    expect(editorHtml).toContain("rich-text-editor-readiness-card");
    expect(editorHtml).toContain("Lexical Signals");
    expect(editorHtml).toContain("data-source-pattern=\"Rich Text Editor\"");
    expect(editorHtml).toContain("RepoTutor records rich text editor readiness only");
  });

  it("detects command palette readiness without opening palettes or dispatching keyboard events", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-command-palette-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-command-palette-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "cmdk-palette.tsx"), [
      "import { Command, useCommandState } from 'cmdk';",
      "import { useEffect, useState } from 'react';",
      "",
      "export function CmdkPalette() {",
      "  const [open, setOpen] = useState(false);",
      "  const [search, setSearch] = useState('');",
      "  const selected = useCommandState((state) => state.value);",
      "  useEffect(() => {",
      "    const onKeyDown = (event: KeyboardEvent) => {",
      "      if (event.keyCode === 229) return;",
      "      if (event.key === 'k' && event.metaKey) setOpen((value) => !value);",
      "      if (event.key === 'Escape') setOpen(false);",
      "      if (event.key === 'Enter') console.info(selected);",
      "    };",
      "    window.addEventListener('keydown', onKeyDown);",
      "    return () => window.removeEventListener('keydown', onKeyDown);",
      "  }, [selected]);",
      "  return (",
      "    <Command.Dialog open={open} onOpenChange={setOpen} label=\"Command palette\" loop shouldFilter filter={(value, query, keywords) => value.includes(query) || keywords?.includes(query)} role=\"combobox\" aria-label=\"Command palette\" aria-activedescendant=\"open-file\">",
      "      <Command.Input value={search} onValueChange={setSearch} placeholder=\"Search commands...\" />",
      "      <Command.List>",
      "        <Command.Empty>No results</Command.Empty>",
      "        <Command.Group heading=\"Navigation\" forceMount>",
      "          <Command.Item value=\"open-file\" keywords={[\"file\", \"jump\"]} onSelect={() => setOpen(false)}>Open file</Command.Item>",
      "          <Command.Item value=\"disabled-command\" disabled>Disabled</Command.Item>",
      "        </Command.Group>",
      "      </Command.List>",
      "    </Command.Dialog>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "algolia-autocomplete.ts"), [
      "import { autocomplete } from '@algolia/autocomplete-js';",
      "import { createAutocomplete } from '@algolia/autocomplete-core';",
      "import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';",
      "import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';",
      "",
      "const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({ key: 'recent-commands' });",
      "const querySuggestionsPlugin = createQuerySuggestionsPlugin({ searchClient: {} as never, indexName: 'commands_query_suggestions' });",
      "",
      "export const search = autocomplete({",
      "  container: '#autocomplete',",
      "  placeholder: 'Search commands',",
      "  openOnFocus: true,",
      "  detachedMediaQuery: '',",
      "  plugins: [recentSearchesPlugin, querySuggestionsPlugin],",
      "  insights: true,",
      "  getSources({ query }) {",
      "    return [{",
      "      sourceId: 'commands',",
      "      getItems() { return [{ label: query || 'Open file', url: '/files' }]; },",
      "      getItemUrl({ item }) { return item.url; },",
      "      onSelect({ item, setQuery }) { setQuery(item.label); },",
      "      templates: {",
      "        item({ item }) { return item.label; },",
      "        noResults() { return 'No results'; }",
      "      }",
      "    }];",
      "  },",
      "  onSubmit({ state }) { console.info(state.query); },",
      "  onStateChange({ state }) { console.info(state.collections.length); },",
      "  renderer: { createElement: () => null, Fragment: 'fragment', render: () => null },",
      "  render({ children }, root) { void children; void root; },",
      "  renderNoResults({ state }) { return state.query; }",
      "});",
      "",
      "export const api = createAutocomplete({",
      "  id: 'command-search',",
      "  getSources({ query }) { return [{ sourceId: 'commands', getItems: () => [query] }]; }",
      "});",
      "api.getInputProps({ inputElement: document.createElement('input') });",
      "api.getItemProps({ item: { label: 'Open file' }, source: { sourceId: 'commands' } as never });",
      "api.getMenuProps({});",
      "api.getPanelProps({});",
      "api.setQuery('open');",
      "api.refresh();",
      "api.update({ placeholder: 'Find command' });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "downshift-combobox.tsx"), [
      "import { Downshift, stateChangeTypes, useCombobox } from 'downshift';",
      "",
      "const items = ['Open file', 'Go to lesson', 'Run quiz'];",
      "",
      "export function DownshiftCombobox() {",
      "  const combobox = useCombobox({",
      "    items,",
      "    itemToString: (item) => item ?? '',",
      "    inputValue: '',",
      "    selectedItem: items[0],",
      "    highlightedIndex: 0,",
      "    stateReducer(state, actionAndChanges) {",
      "      if (actionAndChanges.type === stateChangeTypes.InputKeyDownEnter) return { ...actionAndChanges.changes, isOpen: false };",
      "      return actionAndChanges.changes;",
      "    },",
      "    onInputValueChange({ inputValue }) { console.info(inputValue); },",
      "    onSelectedItemChange({ selectedItem }) { console.info(selectedItem); }",
      "  });",
      "  const { getInputProps, getMenuProps, getItemProps, getToggleButtonProps, isOpen, highlightedIndex, selectedItem, inputValue } = combobox;",
      "  return <div><input {...getInputProps({ 'aria-label': 'Command search', role: 'combobox' })} /><button {...getToggleButtonProps()}>toggle</button><ul {...getMenuProps()}>{isOpen && items.map((item, index) => <li key={item} {...getItemProps({ item, index })}>{item}</li>)}</ul><span>{highlightedIndex}:{selectedItem}:{inputValue}</span></div>;",
      "}",
      "",
      "export function LegacyDownshift() {",
      "  return <Downshift itemToString={(item) => item ?? ''}>{({ getInputProps, getMenuProps, getItemProps, highlightedIndex, selectedItem, inputValue, isOpen }) => <div><input {...getInputProps({ role: 'combobox', 'aria-label': 'Legacy command search' })} /><ul {...getMenuProps()}>{isOpen && items.map((item, index) => <li key={item} {...getItemProps({ item, index })}>{item}</li>)}</ul><span>{highlightedIndex}:{selectedItem}:{inputValue}</span></div>}</Downshift>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "command-palette.spec.ts"), [
      "import { fireEvent, getByRole, queryAllByRole } from '@testing-library/dom';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "",
      "describe('command palette contracts', () => {",
      "  it('captures deterministic keyboard and aria contracts without opening real palettes', async () => {",
      "    const input = document.createElement('input');",
      "    input.setAttribute('role', 'combobox');",
      "    input.setAttribute('aria-expanded', 'true');",
      "    input.setAttribute('aria-controls', 'command-list');",
      "    input.setAttribute('aria-activedescendant', 'open-file');",
      "    input.setAttribute('aria-autocomplete', 'list');",
      "    const list = document.createElement('ul');",
      "    list.id = 'command-list';",
      "    list.setAttribute('role', 'listbox');",
      "    const option = document.createElement('li');",
      "    option.id = 'open-file';",
      "    option.setAttribute('role', 'option');",
      "    option.setAttribute('aria-selected', 'true');",
      "    list.append(option);",
      "    document.body.append(input, list);",
      "    fireEvent.keyDown(input, { key: 'ArrowDown' });",
      "    fireEvent.keyDown(input, { key: 'ArrowUp' });",
      "    fireEvent.keyDown(input, { key: 'Enter' });",
      "    fireEvent.keyDown(input, { key: 'Escape' });",
      "    await userEvent.keyboard('{Meta>}k{/Meta}');",
      "    expect(getByRole(document.body, 'combobox')).toBe(input);",
      "    expect(queryAllByRole(document.body, 'option')).toHaveLength(1);",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest command-palette.spec.ts",
        "test:e2e": "playwright test command-palette.spec.ts"
      },
      dependencies: {
        cmdk: "^1.0.0",
        "@algolia/autocomplete-js": "^1.17.7",
        "@algolia/autocomplete-core": "^1.17.7",
        "@algolia/autocomplete-plugin-recent-searches": "^1.17.7",
        "@algolia/autocomplete-plugin-query-suggestions": "^1.17.7",
        downshift: "^9.0.9",
        react: "^19.0.0"
      },
      devDependencies: {
        "@testing-library/dom": "^10.4.0",
        "@testing-library/user-event": "^14.6.1",
        vitest: "^3.0.0",
        playwright: "^1.50.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "command-palette.yml"), [
      "name: command-palette",
      "on: [push]",
      "jobs:",
      "  static-command-palette:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest command-palette.spec.ts",
      "      - run: npx playwright test command-palette.spec.ts",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: command-palette-traces",
      "          path: reports/command-palette"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "command-palette-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      commandPaletteSetups: Array<{ filePath: string; platform: string; inputCount: number; resultCount: number; selectionCount: number; filterCount: number; stateCount: number; pluginCount: number; accessibilityCount: number; keyboardCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      inputSignals: Array<{ signal: string; readiness: string }>;
      resultSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      filterSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      keyboardSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Command palette readiness cmdk Command.Input Command.Item Algolia autocomplete getSources Downshift useCombobox keyboard aria tests");
    expect(report.commandPaletteSetups.some((item) => item.filePath === "src/cmdk-palette.tsx" && item.platform === "cmdk" && item.inputCount > 0 && item.resultCount > 0 && item.selectionCount > 0 && item.filterCount > 0 && item.stateCount > 0 && item.accessibilityCount > 0 && item.keyboardCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.commandPaletteSetups.some((item) => item.filePath === "src/algolia-autocomplete.ts" && item.platform === "algolia-autocomplete" && item.inputCount > 0 && item.resultCount > 0 && item.selectionCount > 0 && item.filterCount > 0 && item.stateCount > 0 && item.pluginCount > 0)).toBe(true);
    expect(report.commandPaletteSetups.some((item) => item.filePath === "src/downshift-combobox.tsx" && item.platform === "downshift" && item.inputCount > 0 && item.resultCount > 0 && item.selectionCount > 0 && item.stateCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["cmdk", "algolia-autocomplete", "downshift"]));
    expect(readySignals(report.inputSignals)).toEqual(expect.arrayContaining(["command-input", "get-input-props", "placeholder", "open-on-focus"]));
    expect(readySignals(report.resultSignals)).toEqual(expect.arrayContaining(["command-list", "command-item", "command-group", "get-sources", "get-items", "get-menu-props", "get-item-props"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["on-select", "selected-item", "highlighted-index", "set-query", "value"]));
    expect(readySignals(report.filterSignals)).toEqual(expect.arrayContaining(["filter", "keywords", "should-filter", "query", "state-reducer"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["search", "input-value", "is-open", "on-state-change", "refresh-update"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["recent-searches", "query-suggestions", "plugins", "insights"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["combobox", "listbox", "option", "aria-activedescendant", "aria-expanded", "aria-controls"]));
    expect(readySignals(report.keyboardSignals)).toEqual(expect.arrayContaining(["arrow-down", "arrow-up", "enter", "escape", "meta-k", "ime-guard"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "testing-library", "keyboard-test", "role-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["cmdk", "@algolia/autocomplete-js", "@algolia/autocomplete-core", "downshift"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("Command.Input"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records command palette readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "command-palette-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "command-palette-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "command-palette-readiness.html"))).resolves.toBeUndefined();
    const paletteMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "command-palette-readiness.md"), "utf8");
    expect(paletteMarkdown).toContain("Command Palette Readiness");
    expect(paletteMarkdown).toContain("cmdk");
    const paletteHtml = await fs.readFile(path.join(result.session.outputPaths.html, "command-palette-readiness.html"), "utf8");
    expect(paletteHtml).toContain("command-palette-readiness-card");
    expect(paletteHtml).toContain("data-source-pattern=\"Command Palette\"");
    expect(paletteHtml).toContain("RepoTutor records command palette readiness only");
  });

  it("detects guided tour readiness without starting tours or mutating overlays", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-guided-tour-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-guided-tour-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), "# Guided tour fixture\n");
    await fs.writeFile(path.join(sourceRoot, "src", "react-joyride-tour.tsx"), [
      "import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from 'react-joyride';",
      "import { useState } from 'react';",
      "const steps: Step[] = [",
      "  { target: '#lesson-nav', content: 'Open lesson navigation', title: 'Lesson map', placement: 'bottom', disableBeacon: true, spotlightClicks: true },",
      "  { target: '#study-card', content: 'Inspect study cards', title: 'Study card', placement: 'right', spotlightClicks: false }",
      "];",
      "export function LessonJoyrideTour() {",
      "  const [run, setRun] = useState(true);",
      "  const [stepIndex, setStepIndex] = useState(0);",
      "  const handleCallback = (data: CallBackProps) => {",
      "    if (data.type === EVENTS.STEP_AFTER && data.action === ACTIONS.NEXT) setStepIndex(data.index + 1);",
      "    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) { setRun(false); localStorage.setItem('tour-progress', data.status); }",
      "  };",
      "  return <Joyride steps={steps} run={run} stepIndex={stepIndex} continuous showProgress showSkipButton scrollToFirstStep disableOverlayClose callback={handleCallback} styles={{ options: { zIndex: 10000 } }} locale={{ back: 'Back', close: 'Close', last: 'Done', next: 'Next', skip: 'Skip' }} />;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "shepherd-tour.ts"), [
      "import Shepherd from 'shepherd.js';",
      "import 'shepherd.js/dist/css/shepherd.css';",
      "export const tour = new Shepherd.Tour({",
      "  useModalOverlay: true,",
      "  defaultStepOptions: { classes: 'shepherd-theme-custom', scrollTo: true, modalOverlayOpeningPadding: 8, cancelIcon: { enabled: true } }",
      "});",
      "tour.addStep({",
      "  id: 'lesson-step',",
      "  title: 'Lesson',",
      "  text: 'Trace the current lesson boundary',",
      "  attachTo: { element: '#lesson-card', on: 'bottom' },",
      "  buttons: [{ text: 'Back', action: tour.back }, { text: 'Next', action: tour.next }],",
      "  beforeShowPromise: () => Promise.resolve(),",
      "  advanceOn: { selector: '#lesson-card', event: 'click' },",
      "  highlightClass: 'tour-highlight'",
      "});",
      "tour.on('start', () => window.dispatchEvent(new CustomEvent('tour-start')));",
      "tour.on('show', () => window.dispatchEvent(new CustomEvent('tour-show')));",
      "tour.on('complete', () => window.dispatchEvent(new CustomEvent('tour-complete')));",
      "tour.on('cancel', () => window.dispatchEvent(new CustomEvent('tour-cancel')));",
      "export const controls = { start: () => tour.start(), next: () => tour.next(), back: () => tour.back(), complete: () => tour.complete(), cancel: () => tour.cancel() };"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "driver-tour.ts"), [
      "import { driver } from 'driver.js';",
      "import 'driver.js/dist/driver.css';",
      "export const driverObj = driver({",
      "  showProgress: true,",
      "  allowClose: false,",
      "  overlayClickBehavior: 'nextStep',",
      "  stagePadding: 10,",
      "  stageRadius: 6,",
      "  popoverClass: 'repotutor-driver-popover',",
      "  disableActiveInteraction: true,",
      "  smoothScroll: true,",
      "  onNextClick: () => localStorage.setItem('tour-progress', 'next'),",
      "  onPrevClick: () => localStorage.setItem('tour-progress', 'prev'),",
      "  onCloseClick: () => localStorage.setItem('tour-progress', 'close'),",
      "  onDeselected: () => localStorage.setItem('tour-progress', 'deselected'),",
      "  onPopoverRender: () => document.body.classList.add('tour-popover-rendered'),",
      "  steps: [{",
      "    element: '#study-index',",
      "    popover: { title: 'Study index', description: 'Use the index to jump between concepts', side: 'right', align: 'start', showButtons: ['next', 'previous', 'close'], onNextClick: () => localStorage.setItem('tour-progress', 'popover-next') }",
      "  }]",
      "});",
      "driverObj.setConfig({ stageRadius: 4 });",
      "driverObj.setSteps([{ element: '#summary', popover: { title: 'Summary', description: 'Review outcomes' } }]);",
      "driverObj.highlight({ element: '#summary', popover: { title: 'Highlight', description: 'One-off highlight' } });",
      "driverObj.drive(0);",
      "driverObj.getActiveElement();",
      "driverObj.destroy();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "guided-tour.spec.ts"), [
      "import { describe, expect, it } from 'vitest';",
      "import { fireEvent, getByRole } from '@testing-library/dom';",
      "describe('guided tour accessibility shell', () => {",
      "  it('keeps dialog labels, controls, escape handling, focus trap, tab order, and a11y audit markers visible', () => {",
      "    document.body.innerHTML = '<section><h2 id=\"tour-title\">Guided tour</h2><p id=\"tour-body\">Step details</p><div role=\"dialog\" aria-label=\"Guided tour\" aria-labelledby=\"tour-title\" aria-describedby=\"tour-body\" aria-controls=\"lesson-card\" data-shepherd-step-id=\"lesson-step\"><button>Back</button><button>Next</button><button aria-label=\"Close tour\">Close</button></div><div id=\"lesson-card\" tabindex=\"0\">Lesson card</div></section>';",
      "    const dialog = getByRole(document.body, 'dialog');",
      "    dialog.setAttribute('data-focus-trap', 'focusTrap enabled');",
      "    dialog.setAttribute('data-tab-order', 'tab-order back next close');",
      "    fireEvent.keyDown(dialog, { key: 'Escape' });",
      "    expect(dialog.getAttribute('aria-describedby')).toBe('tour-body');",
      "    expect(dialog.outerHTML).toContain('a11y');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest guided-tour.spec.ts",
        "test:e2e": "playwright test guided-tour.spec.ts",
        "test:cy": "cypress run --spec test/guided-tour.spec.ts"
      },
      dependencies: {
        "react-joyride": "^2.9.3",
        "shepherd.js": "^13.0.0",
        "react-shepherd": "^4.0.0",
        "driver.js": "^1.3.1",
        react: "^19.0.0"
      },
      devDependencies: {
        "@testing-library/dom": "^10.4.0",
        vitest: "^3.0.0",
        playwright: "^1.50.0",
        cypress: "^14.0.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "guided-tour.yml"), [
      "name: guided-tour",
      "on: [push]",
      "jobs:",
      "  static-guided-tour:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest guided-tour.spec.ts",
      "      - run: npx playwright test guided-tour.spec.ts",
      "      - run: npx cypress run --spec test/guided-tour.spec.ts",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: guided-tour-traces",
      "          path: reports/guided-tour"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "guided-tour-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      guidedTourSetups: Array<{ filePath: string; platform: string; stepCount: number; targetCount: number; navigationCount: number; overlayCount: number; callbackCount: number; accessibilityCount: number; stateCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      stepSignals: Array<{ signal: string; readiness: string }>;
      targetSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      overlaySignals: Array<{ signal: string; readiness: string }>;
      callbackSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Guided tour readiness React Joyride Shepherd.js driver.js steps target attachTo popover overlay progress callbacks accessibility tests");
    expect(report.guidedTourSetups.some((item) => item.filePath === "src/react-joyride-tour.tsx" && item.platform === "react-joyride" && item.stepCount > 0 && item.targetCount > 0 && item.navigationCount > 0 && item.overlayCount > 0 && item.callbackCount > 0 && item.accessibilityCount > 0 && item.stateCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.guidedTourSetups.some((item) => item.filePath === "src/shepherd-tour.ts" && item.platform === "shepherd" && item.stepCount > 0 && item.targetCount > 0 && item.navigationCount > 0 && item.overlayCount > 0 && item.callbackCount > 0)).toBe(true);
    expect(report.guidedTourSetups.some((item) => item.filePath === "src/driver-tour.ts" && item.platform === "driver-js" && item.stepCount > 0 && item.targetCount > 0 && item.navigationCount > 0 && item.overlayCount > 0 && item.callbackCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["react-joyride", "shepherd", "driver-js"]));
    expect(readySignals(report.stepSignals)).toEqual(expect.arrayContaining(["steps-array", "step-object", "title", "content-text", "placement", "popover"]));
    expect(readySignals(report.targetSignals)).toEqual(expect.arrayContaining(["target", "attach-to", "element", "selector", "highlight", "spotlight"]));
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["start", "next", "back-prev", "skip-cancel-close", "complete", "progress", "continuous"]));
    expect(readySignals(report.overlaySignals)).toEqual(expect.arrayContaining(["modal-overlay", "spotlight", "stage-padding", "stage-radius", "popover-class", "styles", "scroll"]));
    expect(readySignals(report.callbackSignals)).toEqual(expect.arrayContaining(["callback", "on-event", "on-next-click", "on-prev-click", "on-close-click", "before-show", "analytics-event"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["dialog-role", "aria-label", "aria-labelledby", "aria-describedby", "aria-controls", "focus-trap", "keyboard-escape", "tab-order"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["run", "step-index", "status", "lifecycle", "controlled-mode", "set-steps", "local-storage-progress"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "a11y-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["react-joyride", "shepherd.js", "react-shepherd", "driver.js"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("react-joyride"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records guided tour readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "guided-tour-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "guided-tour-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "guided-tour-readiness.html"))).resolves.toBeUndefined();
    const guidedTourMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "guided-tour-readiness.md"), "utf8");
    expect(guidedTourMarkdown).toContain("Guided Tour Readiness");
    expect(guidedTourMarkdown).toContain("react-joyride");
    const guidedTourHtml = await fs.readFile(path.join(result.session.outputPaths.html, "guided-tour-readiness.html"), "utf8");
    expect(guidedTourHtml).toContain("guided-tour-readiness-card");
    expect(guidedTourHtml).toContain("data-source-pattern=\"Guided Tour\"");
    expect(guidedTourHtml).toContain("RepoTutor records guided tour readiness only");
  });

  it("detects Zag tour state machine readiness without running tours", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-tour-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-tour-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-tour.tsx"), [
      "import * as tour from '@zag-js/tour';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "const tourStateEvidence = 'tourInactive running resolving scrolling waiting active STEP.CHANGED STEP.ROUTE TARGET.RESOLVED TARGET.NOT_FOUND SCROLL.END STEPS.SET STEP.SET STEP.NEXT STEP.PREV DISMISS SKIP START';",
      "const tourEffectEvidence = 'waitForTarget waitForTargetTimeout waitForScrollEnd trackBoundarySize trapFocus trackPlacement trackDismissableBranch trackInteractOutside trackEscapeKeydown cleanupAll cleanupStepEffect syncTargetAttrsFromContext performStepTransition executeStepEffect createEffectUtilities MutationObserver scrollIntoView visualViewport resize getPlacement currentPlacement popperStyles getAnchorRect targetRect boundarySize spotlightOffset spotlightRadius getClipPath _internalChange';",
      "const tourDomEvidence = 'getPositionerId getContentId getTitleId getDescriptionId getArrowId getBackdropId getContentEl getPositionerEl getBackdropEl syncZIndex raf( getComputedStyle';",
      "const tourApiSurfaceEvidence = 'open: open totalSteps stepIndex step, hasNextStep hasPrevStep firstStep lastStep addStep removeStep updateStep setSteps setStep start isValidStep isCurrentStep next() prev() getProgressPercent getProgressText getBackdropProps getSpotlightProps getProgressTextProps getPositionerProps getArrowProps getArrowTipProps getContentProps getTitleProps getDescriptionProps getCloseTriggerProps getActionTriggerProps keyboardNavigation data-state data-type data-placement data-side aria-modal aria-live aria-atomic aria-labelledby aria-describedby data-step StepActionMap actionMap';",
      "void tourStateEvidence;",
      "void tourEffectEvidence;",
      "void tourDomEvidence;",
      "void tourApiSurfaceEvidence;",
      "export function ZagTourDemo() {",
      "  const service = useMachine(tour.machine, {",
      "    id: 'study-tour',",
      "    preventInteraction: true,",
      "    closeOnInteractOutside: true,",
      "    closeOnEscape: true,",
      "    keyboardNavigation: true,",
      "    spotlightOffset: { x: 10, y: 10 },",
      "    spotlightRadius: 4,",
      "    translations: { nextStep: 'next step', prevStep: 'previous step', close: 'close tour', skip: 'skip tour', progressText: ({ current, total }) => `${current + 1} of ${total}` },",
      "    steps: [",
      "      { id: 'intro', type: 'tooltip', target: () => document.querySelector('#intro') as HTMLElement | null, title: 'Intro', description: 'Start here', placement: 'bottom-start', offset: { mainAxis: 12 }, backdrop: true, arrow: true, actions: [{ label: 'Next', action: 'next' }, { label: 'Dismiss', action: 'dismiss' }] },",
      "      { id: 'details', type: 'dialog', title: 'Details', description: 'Review details', placement: 'center', backdrop: true, actions: [{ label: 'Previous', action: 'prev' }, { label: 'Skip', action: 'skip' }] },",
      "      { id: 'wait-for-save', type: 'wait', title: 'Wait', description: 'Wait for the target', target: () => document.querySelector('[data-save-ready]') as HTMLElement | null, effect({ show, update, next, goto, dismiss, target }) { update({ meta: { waited: true } }); target?.(); show(); goto('outro'); next(); dismiss(); return () => undefined; } },",
      "      { id: 'outro', type: 'floating', title: 'Done', description: 'Finish', placement: 'top-end', actions: [{ label: 'Custom', action: ({ next, prev, dismiss, skip, goto }) => { prev(); next(); goto('intro'); skip(); dismiss(); } }] }",
      "    ],",
      "    stepId: 'intro',",
      "    onStepChange(details) { console.log(details.stepId, details.stepIndex, details.totalSteps, details.complete, details.progress); },",
      "    onStepsChange(details) { console.log(details.steps.length); },",
      "    onStatusChange(details) { console.log(details.status, details.stepId, details.stepIndex); },",
      "    onFocusOutside(event) { event.preventDefault(); },",
      "    onPointerDownOutside(event) { event.preventDefault(); },",
      "    onInteractOutside(event) { event.preventDefault(); }",
      "  });",
      "  const api = tour.connect(service, normalizeProps);",
      "  api.addStep({ id: 'extra', type: 'tooltip', target: () => document.querySelector('#extra') as HTMLElement | null, title: 'Extra', description: 'More', placement: 'right' });",
      "  api.removeStep('extra');",
      "  api.updateStep('intro', { placement: 'bottom-end' });",
      "  api.setSteps([]);",
      "  api.setStep('intro');",
      "  api.start('intro');",
      "  api.isValidStep('intro');",
      "  api.isCurrentStep('intro');",
      "  api.next();",
      "  api.prev();",
      "  api.getProgressPercent();",
      "  api.getProgressText();",
      "  return (",
      "    <div>",
      "      <div id=\"intro\" data-tour-highlighted=\"\" inert=\"\">Intro target</div>",
      "      <div {...api.getBackdropProps()} data-state={api.open ? 'open' : 'closed'} data-type={api.step?.type} style={{ clipPath: 'path(M0,0)' }} />",
      "      <div {...api.getSpotlightProps()} />",
      "      <div {...api.getPositionerProps()} data-placement=\"bottom-start\" data-side=\"bottom\">",
      "        <div {...api.getArrowProps()}><div {...api.getArrowTipProps()} /></div>",
      "        <section {...api.getContentProps()} role=\"alertdialog\" aria-modal=\"true\" aria-live=\"polite\" aria-atomic=\"true\" aria-labelledby=\"tour-title-study-tour\" aria-describedby=\"tour-desc-study-tour\" tabIndex={-1} data-step=\"intro\" data-type=\"tooltip\" onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Escape') event.preventDefault(); }}>",
      "          <h2 {...api.getTitleProps()}>Tour title</h2>",
      "          <p {...api.getDescriptionProps()}>Tour description</p>",
      "          <span {...api.getProgressTextProps()}>{api.getProgressText()}</span>",
      "          <button {...api.getCloseTriggerProps()}>Close</button>",
      "          <button {...api.getActionTriggerProps({ action: { label: 'Next', action: 'next', attrs: { 'data-action': 'next' } } })}>Next</button>",
      "          <button {...api.getActionTriggerProps({ action: { label: 'Previous', action: 'prev' } })}>Prev</button>",
      "          <button {...api.getActionTriggerProps({ action: { label: 'Dismiss', action: 'dismiss' } })}>Dismiss</button>",
      "          <button {...api.getActionTriggerProps({ action: { label: 'Custom', action: ({ goto }) => goto('outro') } } })}>Custom</button>",
      "        </section>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "zag-tour.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "import { axe } from 'vitest-axe';",
      "import { ZagTourDemo } from '../src/zag-tour';",
      "describe('zag tour readiness markers', () => {",
      "  it('keeps state machine contracts visible without live navigation', async () => {",
      "    vi.useFakeTimers();",
      "    const rendered = render(<ZagTourDemo />);",
      "    expect(await axe(rendered.container)).toHaveNoViolations();",
      "    expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-live', 'polite');",
      "    await userEvent.keyboard('{ArrowRight}{ArrowLeft}{Escape}');",
      "    vi.advanceTimersByTime(100);",
      "    vi.advanceTimersByTime(3000);",
      "    expect(rendered.container.innerHTML).toContain('data-tour-highlighted');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "zag-tour.yml"), [
      "name: zag tour",
      "on: [push]",
      "jobs:",
      "  static-zag-tour:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest zag-tour.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: zag-tour-traces",
      "          path: test-results/zag-tour"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/tour": "latest",
        "@zag-js/react": "latest",
        "@zag-js/focus-trap": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/interact-outside": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/utils": "latest",
        react: "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest",
        "vitest-axe": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "guided-tour-readiness-report.json"), "utf8")) as {
      guidedTourSetups: Array<{ filePath: string; platform: string; stepCount: number; targetCount: number; navigationCount: number; overlayCount: number; callbackCount: number; accessibilityCount: number; stateCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      stepSignals: Array<{ signal: string; readiness: string }>;
      targetSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      overlaySignals: Array<{ signal: string; readiness: string }>;
      callbackSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      targetResolutionSignals: Array<{ signal: string; readiness: string }>;
      positioningSignals: Array<{ signal: string; readiness: string }>;
      spotlightSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.guidedTourSetups.some((item) => item.filePath === "src/zag-tour.tsx" && item.platform === "zag-tour" && item.stepCount > 0 && item.targetCount > 0 && item.navigationCount > 0 && item.overlayCount > 0 && item.callbackCount > 0 && item.accessibilityCount > 0 && item.stateCount > 0 && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-tour"]));
    expect(readySignals(report.stepSignals)).toEqual(expect.arrayContaining(["steps-array", "step-object", "title", "content-text", "placement", "popover", "step-type-tooltip", "step-type-dialog", "step-type-wait", "step-type-floating", "step-effect"]));
    expect(readySignals(report.targetSignals)).toEqual(expect.arrayContaining(["target", "highlight", "spotlight", "resolved-target", "target-rect", "boundary-size"]));
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["start", "next", "back-prev", "skip-cancel-close", "complete", "progress", "goto"]));
    expect(readySignals(report.overlaySignals)).toEqual(expect.arrayContaining(["spotlight", "stage-radius", "scroll", "backdrop", "clip-path"]));
    expect(readySignals(report.callbackSignals)).toEqual(expect.arrayContaining(["analytics-event", "status-change", "step-change", "steps-change", "interact-outside"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["dialog-role", "aria-label", "aria-labelledby", "aria-describedby", "focus-trap", "keyboard-escape", "aria-modal", "aria-live", "tabindex"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["step-index", "status", "controlled-mode", "set-steps", "open-tag", "closed-tag", "internal-change"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["tour-inactive", "running", "resolving", "scrolling", "waiting", "active", "step-route", "step-changed", "target-resolved", "target-not-found", "scroll-end"]));
    expect(readySignals(report.targetResolutionSignals)).toEqual(expect.arrayContaining(["target-function", "resolved-target", "mutation-observer", "wait-for-target", "wait-for-target-timeout", "target-cleanup", "data-tour-highlighted", "prevent-interaction-inert"]));
    expect(readySignals(report.positioningSignals)).toEqual(expect.arrayContaining(["get-placement", "current-placement", "placement-side", "popper-styles", "positioner", "arrow", "arrow-tip", "anchor-rect", "spotlight-offset"]));
    expect(readySignals(report.spotlightSignals)).toEqual(expect.arrayContaining(["backdrop", "spotlight", "clip-path", "target-rect", "boundary-size", "spotlight-radius", "visual-viewport"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-boundary-size", "track-placement", "track-dismissable-branch", "track-interact-outside", "track-escape-keydown", "trap-focus", "wait-for-scroll-end", "cleanup-all", "cleanup-step-effect"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["add-step", "remove-step", "update-step", "set-step", "start", "next", "prev", "dismiss", "skip", "goto", "progress-percent", "progress-text", "action-trigger"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["positioner-id", "content-id", "title-id", "description-id", "arrow-id", "backdrop-id", "content-el", "positioner-el", "backdrop-el", "sync-z-index", "raf", "computed-style"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["open", "total-steps", "step-index", "step-api", "next-step-state", "prev-step-state", "first-step-state", "last-step-state", "add-step-api", "remove-step-api", "update-step-api", "set-steps-api", "set-step-api", "start-api", "valid-step-api", "current-step-api", "next-api", "prev-api", "progress-percent-api", "progress-text-api", "backdrop-props", "spotlight-props", "progress-text-props", "positioner-props", "arrow-props", "arrow-tip-props", "content-props", "title-props", "description-props", "close-trigger-props", "action-trigger-props", "keyboard-navigation", "data-state", "data-type", "data-placement", "data-side", "aria-modal", "aria-live", "aria-atomic", "aria-labelledby", "aria-describedby", "data-step", "action-map"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "a11y-test", "fake-timers", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/tour", "@zag-js/focus-trap", "@zag-js/popper", "@zag-js/dismissable", "@zag-js/interact-outside", "@zag-js/dom-query", "@zag-js/anatomy", "@zag-js/core", "@zag-js/utils", "react"]));
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records guided tour readiness only"))).toBe(true);
    const guidedTourMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "guided-tour-readiness.md"), "utf8");
    expect(guidedTourMarkdown).toContain("Machine Signals");
    expect(guidedTourMarkdown).toContain("API Signals");
    expect(guidedTourMarkdown).toContain("@zag-js/tour");
    const guidedTourHtml = await fs.readFile(path.join(result.session.outputPaths.html, "guided-tour-readiness.html"), "utf8");
    expect(guidedTourHtml).toContain("Machine Signals");
    expect(guidedTourHtml).toContain("API Signals");
    expect(guidedTourHtml).toContain("@zag-js/tour");
    expect(guidedTourHtml).toContain("RepoTutor records guided tour readiness only");
  });

  it("detects data table readiness without mounting grids or mutating rows", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-table-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-data-table-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), "# Data table fixture\n");
    await fs.writeFile(path.join(sourceRoot, "src", "tanstack-table.tsx"), [
      "import { flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, createColumnHelper, type ColumnDef, type PaginationState, type RowSelectionState, type SortingState } from '@tanstack/react-table';",
      "import { useVirtualizer } from '@tanstack/react-virtual';",
      "import { useMemo, useState } from 'react';",
      "type Person = { id: string; firstName: string; age: number; status: string };",
      "const columnHelper = createColumnHelper<Person>();",
      "const columns: ColumnDef<Person>[] = [",
      "  columnHelper.accessor('firstName', { header: 'First name', cell: (info) => info.getValue(), size: 180 }),",
      "  { accessorKey: 'age', header: 'Age', cell: (info) => info.getValue(), enableSorting: true, enableColumnFilter: true }",
      "];",
      "export function TanStackPeopleTable({ data }: { data: Person[] }) {",
      "  const [sorting, setSorting] = useState<SortingState>([]);",
      "  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});",
      "  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });",
      "  const [columnVisibility, setColumnVisibility] = useState({});",
      "  const [columnPinning, setColumnPinning] = useState({ left: ['firstName'] });",
      "  const table = useReactTable({ data, columns, state: { sorting, rowSelection, pagination, columnVisibility, columnPinning }, onSortingChange: setSorting, onRowSelectionChange: setRowSelection, onPaginationChange: setPagination, onColumnVisibilityChange: setColumnVisibility, onColumnPinningChange: setColumnPinning, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), getGroupedRowModel: getGroupedRowModel(), getExpandedRowModel: getExpandedRowModel(), enableRowSelection: true });",
      "  const rowVirtualizer = useVirtualizer({ count: table.getRowModel().rows.length, getScrollElement: () => document.querySelector('[data-table-viewport]'), estimateSize: () => 44 });",
      "  return <table role=\"grid\" aria-rowcount={data.length} aria-colcount={columns.length}><thead>{table.getHeaderGroups().map((headerGroup) => <tr role=\"row\" key={headerGroup.id}>{headerGroup.headers.map((header) => <th role=\"columnheader\" aria-sort=\"ascending\" key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody data-table-viewport>{rowVirtualizer.getVirtualItems().map((virtualRow) => table.getRowModel().rows[virtualRow.index]).map((row) => <tr role=\"row\" aria-rowindex={row.index + 1} key={row.id}>{row.getVisibleCells().map((cell) => <td role=\"gridcell\" aria-colindex={cell.column.getIndex() + 1} key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "ag-grid-table.tsx"), [
      "import { useMemo, useRef, useState } from 'react';",
      "import { AgGridReact } from 'ag-grid-react';",
      "import type { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';",
      "type Row = { id: string; name: string; total: number; region: string };",
      "const columnDefs: ColDef<Row>[] = [",
      "  { field: 'name', headerName: 'Name', sortable: true, filter: true, editable: true, cellRenderer: (params) => params.value },",
      "  { field: 'total', valueGetter: (params) => params.data?.total, valueFormatter: (params) => `$${params.value}`, cellEditor: 'agNumberCellEditor' }",
      "];",
      "export function AgGridOrders({ rowData }: { rowData: Row[] }) {",
      "  const gridRef = useRef<AgGridReact<Row>>(null);",
      "  const [selectedRows, setSelectedRows] = useState<Row[]>([]);",
      "  const defaultColDef = useMemo<ColDef<Row>>(() => ({ sortable: true, filter: true, resizable: true, editable: true }), []);",
      "  const gridOptions = useMemo<GridOptions<Row>>(() => ({ columnDefs, rowData, defaultColDef, rowSelection: { mode: 'multiRow' }, pagination: true, paginationPageSize: 25, rowModelType: 'serverSide', domLayout: 'normal', suppressRowVirtualisation: false, onSelectionChanged: (event) => setSelectedRows(event.api.getSelectedRows()), onGridReady: (event: GridReadyEvent<Row>) => event.api.setGridOption('rowData', rowData) }), [defaultColDef, rowData]);",
      "  return <AgGridReact ref={gridRef} {...gridOptions} aria-label=\"Orders grid\" />;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "react-data-grid-table.tsx"), [
      "import { useMemo, useState } from 'react';",
      "import DataGrid, { SelectColumn, TreeDataGrid, renderTextEditor, type Column, type SortColumn } from 'react-data-grid';",
      "type Row = { id: string; title: string; count: number; parentId?: string };",
      "const columns: readonly Column<Row>[] = [SelectColumn, { key: 'title', name: 'Title', sortable: true, resizable: true, renderCell: ({ row }) => row.title, renderEditCell: renderTextEditor }, { key: 'count', name: 'Count', sortable: true }];",
      "function rowKeyGetter(row: Row) { return row.id; }",
      "function rowGrouper(rows: readonly Row[], columnKey: string) { return Object.groupBy(rows, (row) => String(row[columnKey as keyof Row])); }",
      "export function ReactDataGridIssues({ initialRows }: { initialRows: Row[] }) {",
      "  const [rows, setRows] = useState(initialRows);",
      "  const [selectedRows, setSelectedRows] = useState(() => new Set<string>());",
      "  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);",
      "  const groupBy = useMemo(() => ['parentId'], []);",
      "  const sortedRows = useMemo(() => rows.toSorted((a, b) => a.title.localeCompare(b.title)), [rows, sortColumns]);",
      "  return <><DataGrid aria-label=\"Issues grid\" rowKeyGetter={rowKeyGetter} columns={columns} rows={sortedRows} onRowsChange={setRows} selectedRows={selectedRows} onSelectedRowsChange={setSelectedRows} sortColumns={sortColumns} onSortColumnsChange={setSortColumns} defaultColumnOptions={{ sortable: true, resizable: true }} enableVirtualization rowHeight={36} /><TreeDataGrid columns={columns} rows={rows} rowKeyGetter={rowKeyGetter} groupBy={groupBy} rowGrouper={rowGrouper} /></>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "data-table.spec.ts"), [
      "import { describe, expect, it } from 'vitest';",
      "import { fireEvent, getByRole, queryAllByRole } from '@testing-library/dom';",
      "describe('data table accessibility shell', () => {",
      "  it('keeps grid roles, aria indices, sort state, keyboard navigation, and role tests visible', () => {",
      "    document.body.innerHTML = '<table role=\"grid\" aria-label=\"Revenue table\" aria-rowcount=\"2\" aria-colcount=\"2\"><thead><tr role=\"row\" aria-rowindex=\"1\"><th role=\"columnheader\" aria-colindex=\"1\" aria-sort=\"ascending\">Name</th><th role=\"columnheader\" aria-colindex=\"2\">Total</th></tr></thead><tbody><tr role=\"row\" aria-rowindex=\"2\"><td role=\"gridcell\" aria-colindex=\"1\">Ada</td><td role=\"gridcell\" aria-colindex=\"2\">10</td></tr></tbody></table>';",
      "    const grid = getByRole(document.body, 'grid');",
      "    fireEvent.keyDown(grid, { key: 'ArrowDown' });",
      "    fireEvent.keyDown(grid, { key: 'Enter' });",
      "    expect(queryAllByRole(document.body, 'row')).toHaveLength(2);",
      "    expect(getByRole(document.body, 'columnheader', { name: 'Name' }).getAttribute('aria-sort')).toBe('ascending');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest data-table.spec.ts",
        "test:e2e": "playwright test data-table.spec.ts",
        "test:cy": "cypress run --spec test/data-table.spec.ts"
      },
      dependencies: {
        "@tanstack/react-table": "^8.21.3",
        "@tanstack/react-virtual": "^3.13.12",
        "ag-grid-react": "^34.3.1",
        "ag-grid-community": "^34.3.1",
        "react-data-grid": "^7.0.0",
        react: "^19.0.0"
      },
      devDependencies: {
        "@testing-library/dom": "^10.4.0",
        vitest: "^3.0.0",
        playwright: "^1.50.0",
        cypress: "^14.0.0",
        typescript: "^5.8.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "data-table.yml"), [
      "name: data-table",
      "on: [push]",
      "jobs:",
      "  static-data-table:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest data-table.spec.ts",
      "      - run: npx playwright test data-table.spec.ts",
      "      - run: npx cypress run --spec test/data-table.spec.ts",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: data-table-traces",
      "          path: reports/data-table"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "data-table-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dataTableSetups: Array<{ filePath: string; platform: string; columnCount: number; rowCount: number; sortCount: number; filterCount: number; paginationCount: number; virtualizationCount: number; selectionCount: number; editingCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      columnSignals: Array<{ signal: string; readiness: string }>;
      rowModelSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      virtualizationSignals: Array<{ signal: string; readiness: string }>;
      editingSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Data table readiness TanStack Table AG Grid React Data Grid columns rows sorting filtering pagination virtualization selection editing accessibility tests");
    expect(report.dataTableSetups.some((item) => item.filePath === "src/tanstack-table.tsx" && item.platform === "tanstack-table" && item.columnCount > 0 && item.rowCount > 0 && item.sortCount > 0 && item.filterCount > 0 && item.paginationCount > 0 && item.virtualizationCount > 0 && item.selectionCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(report.dataTableSetups.some((item) => item.filePath === "src/ag-grid-table.tsx" && item.platform === "ag-grid" && item.columnCount > 0 && item.rowCount > 0 && item.sortCount > 0 && item.filterCount > 0 && item.paginationCount > 0 && item.selectionCount > 0 && item.editingCount > 0)).toBe(true);
    expect(report.dataTableSetups.some((item) => item.filePath === "src/react-data-grid-table.tsx" && item.platform === "react-data-grid" && item.columnCount > 0 && item.rowCount > 0 && item.sortCount > 0 && item.virtualizationCount > 0 && item.selectionCount > 0 && item.editingCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["tanstack-table", "ag-grid", "react-data-grid"]));
    expect(readySignals(report.columnSignals)).toEqual(expect.arrayContaining(["column-defs", "column-helper", "accessor-key", "cell-renderer", "header", "column-visibility", "column-pinning", "column-sizing"]));
    expect(readySignals(report.rowModelSignals)).toEqual(expect.arrayContaining(["core-row-model", "sorted-row-model", "filtered-row-model", "pagination-row-model", "grouped-row-model", "expanded-row-model", "row-data"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["sorting", "filtering", "pagination", "row-selection", "column-reorder", "row-expansion", "faceting"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["controlled-state", "on-state-change", "row-selection-state", "sorting-state", "pagination-state", "rows-change"]));
    expect(readySignals(report.virtualizationSignals)).toEqual(expect.arrayContaining(["use-virtualizer", "enable-virtualization", "virtual-rows", "viewport", "row-height"]));
    expect(readySignals(report.editingSignals)).toEqual(expect.arrayContaining(["editable", "cell-editor", "render-edit-cell", "on-rows-change", "value-getter", "value-formatter"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["grid-role", "row-role", "columnheader-role", "gridcell-role", "aria-rowcount", "aria-colcount", "aria-rowindex", "aria-colindex", "aria-sort", "keyboard-navigation"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@tanstack/react-table", "@tanstack/react-virtual", "ag-grid-react", "ag-grid-community", "react-data-grid"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@tanstack/react-table"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records data table readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "data-table-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "data-table-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "data-table-readiness.html"))).resolves.toBeUndefined();
    const dataTableMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-table-readiness.md"), "utf8");
    expect(dataTableMarkdown).toContain("Data Table Readiness");
    expect(dataTableMarkdown).toContain("@tanstack/react-table");
    const dataTableHtml = await fs.readFile(path.join(result.session.outputPaths.html, "data-table-readiness.html"), "utf8");
    expect(dataTableHtml).toContain("data-table-readiness-card");
    expect(dataTableHtml).toContain("data-source-pattern=\"Data Table\"");
    expect(dataTableHtml).toContain("RepoTutor records data table readiness only");
  });

  it("detects calendar readiness without rendering calendars or mutating dates", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-calendar-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-calendar-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "fullcalendar-schedule.tsx"), [
      "import FullCalendar from '@fullcalendar/react';",
      "import dayGridPlugin from '@fullcalendar/daygrid';",
      "import timeGridPlugin from '@fullcalendar/timegrid';",
      "import interactionPlugin from '@fullcalendar/interaction';",
      "import listPlugin from '@fullcalendar/list';",
      "import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';",
      "const events = [{ id: 'demo', title: 'Planning', start: '2026-06-05T09:00:00', end: '2026-06-05T10:00:00', resourceId: 'room-a' }];",
      "const resources = [{ id: 'room-a', title: 'Room A' }];",
      "export function OpsCalendar() {",
      "  return <FullCalendar aria-label=\"Operations calendar\" plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, resourceTimeGridPlugin]} initialView=\"timeGridWeek\" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek,resourceTimeGridDay' }} events={events} eventSources={[{ events }]} resources={resources} resourceAreaHeaderContent=\"Rooms\" selectable selectMirror editable droppable timeZone=\"Asia/Seoul\" locale=\"ko\" slotDuration=\"00:30:00\" validRange={{ start: '2026-01-01', end: '2026-12-31' }} eventClick={(info) => info.event.id} dateClick={(info) => info.dateStr} select={(info) => info.startStr} eventDrop={(info) => info.event.id} eventResize={(info) => info.endDelta} eventContent={(arg) => <strong>{arg.event.title}</strong>} eventClassNames={() => ['tracked-event']} viewDidMount={(arg) => arg.view.type} />;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "react-big-calendar-schedule.tsx"), [
      "import moment from 'moment';",
      "import { Calendar, Views, dateFnsLocalizer, dayjsLocalizer, globalizeLocalizer, momentLocalizer } from 'react-big-calendar';",
      "import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';",
      "import 'react-big-calendar/lib/css/react-big-calendar.css';",
      "import 'react-big-calendar/lib/sass/styles.scss';",
      "const localizer = momentLocalizer(moment);",
      "const dndLocalizer = dateFnsLocalizer({ format: () => '', parse: () => new Date(), startOfWeek: () => 1, getDay: (date) => date.getDay(), locales: {} });",
      "const globalizer = globalizeLocalizer({ formatDate: () => '' });",
      "const dayjs = { extend: () => undefined };",
      "const dayjsReady = dayjsLocalizer(dayjs);",
      "const DnDCalendar = withDragAndDrop(Calendar);",
      "const events = [{ id: 1, title: 'Review', start: new Date(), end: new Date(), resourceId: 'team-a', allDay: false }];",
      "const resources = [{ id: 'team-a', title: 'Team A' }];",
      "export function TeamCalendar() {",
      "  return <DnDCalendar aria-label=\"Team calendar\" localizer={localizer} culture=\"ko\" events={events} resources={resources} resourceAccessor=\"resourceId\" resourceIdAccessor=\"id\" resourceTitleAccessor=\"title\" startAccessor=\"start\" endAccessor=\"end\" titleAccessor=\"title\" tooltipAccessor=\"title\" allDayAccessor=\"allDay\" defaultDate={new Date('2026-06-05')} defaultView={Views.WEEK} view={Views.WEEK} views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]} selectable popup popupOffset={{ x: 10, y: 10 }} toolbar formats={{ dayFormat: 'EEE d' }} messages={{ today: 'Today', previous: 'Back', next: 'Next' }} components={{ event: ({ title }) => <span>{title}</span> }} eventPropGetter={() => ({ className: 'event' })} slotPropGetter={() => ({ className: 'slot' })} dayPropGetter={() => ({ className: 'day' })} drilldownView={Views.DAY} getDrilldownView={() => Views.DAY} onDrillDown={(date, view) => view} showMultiDayTimes step={30} timeslots={2} onSelectEvent={(event) => event.id} onSelectSlot={(slot) => slot.start} onNavigate={(date) => date.toISOString()} onView={(view) => view} onEventDrop={({ event }) => event.id} onEventResize={({ event }) => event.id} draggableAccessor={() => true} resizable dayLayoutAlgorithm=\"no-overlap\" min={new Date('2026-06-05T08:00:00')} max={new Date('2026-06-05T18:00:00')} scrollToTime={new Date('2026-06-05T09:00:00')} />;",
      "}",
      "void dndLocalizer;",
      "void globalizer;",
      "void dayjsReady;"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "day-picker-calendar.tsx"), [
      "import { useState } from 'react';",
      "import { type DateRange, type Matcher, DayPicker } from 'react-day-picker';",
      "export function BookingDatePicker() {",
      "  const [range, setRange] = useState<DateRange | undefined>({ from: new Date('2026-06-05'), to: new Date('2026-06-07') });",
      "  const disabled: Matcher[] = [{ before: new Date('2026-01-01') }, { after: new Date('2026-12-31') }, { dayOfWeek: [0] }];",
      "  return <section aria-label=\"Booking calendar\"><DayPicker mode=\"range\" selected={range} onSelect={setRange} disabled={disabled} modifiers={{ booked: [new Date('2026-06-10')] }} modifiersClassNames={{ booked: 'is-booked' }} captionLayout=\"dropdown\" navLayout=\"after\" numberOfMonths={2} startMonth={new Date('2026-01-01')} endMonth={new Date('2026-12-01')} weekStartsOn={1} ISOWeek timeZone=\"Asia/Seoul\" required showOutsideDays showWeekNumber footer=\"Select arrival and departure\" labels={{ labelDayButton: (date) => `Choose ${date.toDateString()}` }} />;</section>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "test", "calendar.spec.tsx"), [
      "import { render, screen, fireEvent } from '@testing-library/react';",
      "import { describe, expect, it } from 'vitest';",
      "import { BookingDatePicker } from '../src/day-picker-calendar';",
      "describe('calendar accessibility and keyboard behavior', () => {",
      "  it('keeps calendar roles and navigation keyboard reachable', () => {",
      "    render(<BookingDatePicker />);",
      "    expect(screen.getByLabelText(/booking calendar/i)).toBeTruthy();",
      "    expect(screen.getByRole('grid')).toBeTruthy();",
      "    expect(screen.getByRole('button', { name: /next/i })).toBeTruthy();",
      "    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });",
      "  });",
      "});"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "calendar.yml"), [
      "name: calendar",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest run test/calendar.spec.tsx",
      "      - run: pnpm playwright test calendar.spec.tsx",
      "      - run: pnpm cypress run --spec test/calendar.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: calendar-traces",
      "          path: reports/calendar"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@fullcalendar/core": "latest",
        "@fullcalendar/daygrid": "latest",
        "@fullcalendar/interaction": "latest",
        "@fullcalendar/list": "latest",
        "@fullcalendar/react": "latest",
        "@fullcalendar/resource-timegrid": "latest",
        "@fullcalendar/timegrid": "latest",
        "date-fns": "latest",
        "dayjs": "latest",
        "globalize": "latest",
        "moment": "latest",
        "react": "latest",
        "react-big-calendar": "latest",
        "react-day-picker": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@types/react": "latest",
        "cypress": "latest",
        "playwright": "latest",
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "calendar-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      calendarSetups: Array<{ filePath: string; platform: string; viewCount: number; eventCount: number; selectionCount: number; navigationCount: number; localizationCount: number; resourceCount: number; dragDropCount: number; rangeCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      viewSignals: Array<{ signal: string; readiness: string }>;
      eventSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      localizationSignals: Array<{ signal: string; readiness: string }>;
      resourceSignals: Array<{ signal: string; readiness: string }>;
      dragDropSignals: Array<{ signal: string; readiness: string }>;
      rangeConstraintSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      reactBigCalendarSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Calendar readiness FullCalendar react-big-calendar React DayPicker events views selection navigation localization resources drag drop date ranges accessibility tests localizer accessors components getters popup drilldown DnD addon");
    expect(report.calendarSetups.some((item) => item.filePath === "src/fullcalendar-schedule.tsx" && item.platform === "fullcalendar" && item.viewCount > 0 && item.eventCount > 0 && item.selectionCount > 0 && item.navigationCount > 0 && item.localizationCount > 0 && item.resourceCount > 0 && item.dragDropCount > 0 && item.rangeCount > 0)).toBe(true);
    expect(report.calendarSetups.some((item) => item.filePath === "src/react-big-calendar-schedule.tsx" && item.platform === "react-big-calendar" && item.viewCount > 0 && item.eventCount > 0 && item.selectionCount > 0 && item.navigationCount > 0 && item.localizationCount > 0 && item.resourceCount > 0 && item.dragDropCount > 0 && item.rangeCount > 0)).toBe(true);
    expect(report.calendarSetups.some((item) => item.filePath === "src/day-picker-calendar.tsx" && item.platform === "react-day-picker" && item.viewCount > 0 && item.selectionCount > 0 && item.navigationCount > 0 && item.localizationCount > 0 && item.rangeCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["fullcalendar", "react-big-calendar", "react-day-picker"]));
    expect(readySignals(report.viewSignals)).toEqual(expect.arrayContaining(["initial-view", "day-grid", "time-grid", "list-view", "month-view", "week-view", "agenda-view", "number-of-months"]));
    expect(readySignals(report.eventSignals)).toEqual(expect.arrayContaining(["events", "event-click", "date-click", "event-content", "event-class-names", "event-source", "event-accessors"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["selectable", "select-callback", "on-select-slot", "on-select-event", "selected-date", "on-select-date", "selection-mode"]));
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["header-toolbar", "toolbar", "today-button", "prev-next", "default-date", "date-range-navigation", "caption-layout", "nav-layout"]));
    expect(readySignals(report.localizationSignals)).toEqual(expect.arrayContaining(["time-zone", "locale", "localizer", "moment-localizer", "date-fns-localizer", "week-starts-on", "formats-messages"]));
    expect(readySignals(report.resourceSignals)).toEqual(expect.arrayContaining(["resources", "resource-accessor", "resource-id", "resource-title", "resource-time-grid"]));
    expect(readySignals(report.dragDropSignals)).toEqual(expect.arrayContaining(["interaction-plugin", "editable-events", "event-drop", "event-resize", "with-drag-and-drop", "draggable-accessor"]));
    expect(readySignals(report.rangeConstraintSignals)).toEqual(expect.arrayContaining(["valid-range", "min-max-time", "disabled-dates", "date-range", "start-end-month", "modifiers", "matcher"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["calendar-label", "grid-role", "aria-label", "keyboard-navigation", "button-labels", "focus-management"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "timezone-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@fullcalendar/react", "@fullcalendar/core", "react-big-calendar", "react-day-picker", "date-fns"]));
    expect(readySignals(report.reactBigCalendarSignals)).toEqual(expect.arrayContaining(["calendar-component", "localizer-required", "moment-localizer", "globalize-localizer", "date-fns-localizer", "dayjs-localizer", "views-constant", "controlled-view", "default-view", "event-accessors", "tooltip-accessor", "all-day-accessor", "resource-accessors", "selectable-slots", "on-navigate", "on-view", "components-override", "event-prop-getter", "slot-prop-getter", "day-prop-getter", "formats", "messages", "popup", "drilldown", "show-multi-day-times", "time-bounds", "step-timeslots", "dnd-addon", "on-event-drop", "on-event-resize", "draggable-accessor", "resizable", "css-import", "sass-styles", "localizer-tests"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("FullCalendar"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records calendar readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "calendar-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "calendar-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "calendar-readiness.html"))).resolves.toBeUndefined();
    const calendarMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "calendar-readiness.md"), "utf8");
    expect(calendarMarkdown).toContain("Calendar Readiness");
    expect(calendarMarkdown).toContain("@fullcalendar/react");
    expect(calendarMarkdown).toContain("react-big-calendar Signals");
    const calendarHtml = await fs.readFile(path.join(result.session.outputPaths.html, "calendar-readiness.html"), "utf8");
    expect(calendarHtml).toContain("calendar-readiness-card");
    expect(calendarHtml).toContain("data-source-pattern=\"Calendar\"");
    expect(calendarHtml).toContain("RepoTutor records calendar readiness only");
    expect(calendarHtml).toContain("react-big-calendar Signals");
  });

  it("detects dialog readiness without opening portals or moving focus", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dialog-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dialog-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "radix-dialog.tsx"), [
      "import { useRef, useState } from 'react';",
      "import * as Dialog from '@radix-ui/react-dialog';",
      "import * as AlertDialog from '@radix-ui/react-alert-dialog';",
      "export function RadixSettingsDialog() {",
      "  const [open, setOpen] = useState(false);",
      "  const closeRef = useRef<HTMLButtonElement>(null);",
      "  return <Dialog.Root open={open} defaultOpen={false} onOpenChange={setOpen} modal>",
      "    <Dialog.Trigger aria-label=\"Open settings dialog\">Settings</Dialog.Trigger>",
      "    <Dialog.Portal forceMount>",
      "      <Dialog.Overlay className=\"fixed inset-0\" data-state={open ? 'open' : 'closed'} />",
      "      <Dialog.Content aria-label=\"Settings dialog\" onOpenAutoFocus={(event) => closeRef.current?.focus()} onCloseAutoFocus={(event) => event.preventDefault()}>",
      "        <Dialog.Title>Settings</Dialog.Title>",
      "        <Dialog.Description>Change workspace preferences</Dialog.Description>",
      "        <Dialog.Close ref={closeRef} aria-label=\"Close settings dialog\">Close</Dialog.Close>",
      "      </Dialog.Content>",
      "    </Dialog.Portal>",
      "    <AlertDialog.Root>",
      "      <AlertDialog.Trigger>Delete workspace</AlertDialog.Trigger>",
      "      <AlertDialog.Portal><AlertDialog.Overlay /><AlertDialog.Content role=\"alertdialog\"><AlertDialog.Title>Confirm delete</AlertDialog.Title><AlertDialog.Description>This cannot be undone</AlertDialog.Description><AlertDialog.Cancel>Cancel</AlertDialog.Cancel><AlertDialog.Action>Delete</AlertDialog.Action></AlertDialog.Content></AlertDialog.Portal>",
      "    </AlertDialog.Root>",
      "  </Dialog.Root>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "headlessui-dialog.tsx"), [
      "import { Fragment, useRef, useState } from 'react';",
      "import { CloseButton, Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition } from '@headlessui/react';",
      "export function HeadlessBillingDialog() {",
      "  const [open, setOpen] = useState(true);",
      "  const initialFocus = useRef<HTMLButtonElement>(null);",
      "  return <Transition show={open} as={Fragment}>",
      "    <Dialog open={open} onClose={setOpen} initialFocus={initialFocus} autoFocus role=\"alertdialog\" static transition>",
      "      <Transition.Child as={Fragment} enter=\"ease-out duration-200\" leave=\"ease-in duration-150\">",
      "        <DialogBackdrop className=\"fixed inset-0 bg-black/40\" />",
      "      </Transition.Child>",
      "      <DialogPanel aria-label=\"Billing confirmation\" className=\"panel\">",
      "        <DialogTitle>Confirm billing change</DialogTitle>",
      "        <Description>Review invoice changes before continuing</Description>",
      "        <CloseButton ref={initialFocus} aria-label=\"Close billing dialog\">Cancel</CloseButton>",
      "      </DialogPanel>",
      "    </Dialog>",
      "  </Transition>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "ariakit-dialog.tsx"), [
      "import { useRef } from 'react';",
      "import { Dialog, DialogDescription, DialogDisclosure, DialogDismiss, DialogHeading, DialogProvider, useDialogStore } from '@ariakit/react';",
      "export function AriakitCommandDialog() {",
      "  const initialFocus = useRef<HTMLInputElement>(null);",
      "  const finalFocus = useRef<HTMLButtonElement>(null);",
      "  const store = useDialogStore({ defaultOpen: false });",
      "  return <DialogProvider store={store}>",
      "    <DialogDisclosure ref={finalFocus}>Open command dialog</DialogDisclosure>",
      "    <Dialog store={store} modal portal backdrop hideOnEscape hideOnInteractOutside preventBodyScroll autoFocusOnShow autoFocusOnHide initialFocus={initialFocus} finalFocus={finalFocus} aria-label=\"Command dialog\">",
      "      <DialogHeading>Command dialog</DialogHeading>",
      "      <DialogDescription>Choose the next command</DialogDescription>",
      "      <input ref={initialFocus} aria-label=\"Command search\" />",
      "      <DialogDismiss aria-label=\"Dismiss command dialog\">Dismiss</DialogDismiss>",
      "    </Dialog>",
      "  </DialogProvider>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "test", "dialog.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { HeadlessBillingDialog } from '../src/headlessui-dialog';",
      "describe('dialog accessibility and focus behavior', () => {",
      "  it('keeps role, labels, escape, and tab flow testable', async () => {",
      "    render(<HeadlessBillingDialog />);",
      "    expect(screen.getByRole('alertdialog')).toBeTruthy();",
      "    expect(screen.getByLabelText(/billing confirmation/i)).toBeTruthy();",
      "    await userEvent.keyboard('{Tab}{Escape}');",
      "    expect(document.activeElement).toBeTruthy();",
      "  });",
      "});"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "dialog.yml"), [
      "name: dialog",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest run test/dialog.spec.tsx",
      "      - run: pnpm playwright test dialog.spec.tsx",
      "      - run: pnpm cypress run --spec test/dialog.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: dialog-traces",
      "          path: reports/dialog"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@ariakit/react": "latest",
        "@headlessui/react": "latest",
        "@radix-ui/react-alert-dialog": "latest",
        "@radix-ui/react-dialog": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "@types/react": "latest",
        "cypress": "latest",
        "playwright": "latest",
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "dialog-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      dialogSetups: Array<{ filePath: string; framework: string; triggerCount: number; portalCount: number; overlayCount: number; contentCount: number; titleDescriptionCount: number; stateCount: number; focusCount: number; dismissCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      focusSignals: Array<{ signal: string; readiness: string }>;
      dismissalSignals: Array<{ signal: string; readiness: string }>;
      portalOverlaySignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      animationSignals: Array<{ signal: string; readiness: string }>;
      implementationSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Dialog readiness Radix Dialog Headless UI Dialog FocusTrap internals Ariakit Dialog portal overlay focus trap focus lock hidden guards tab direction dismiss accessibility server handoff root containers inert stack top layer scroll lock disappear tests");
    expect(report.dialogSetups.some((item) => item.filePath === "src/radix-dialog.tsx" && item.framework === "radix-dialog" && item.triggerCount > 0 && item.portalCount > 0 && item.overlayCount > 0 && item.contentCount > 0 && item.titleDescriptionCount > 0 && item.stateCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.dialogSetups.some((item) => item.filePath === "src/headlessui-dialog.tsx" && item.framework === "headlessui-dialog" && item.portalCount > 0 && item.overlayCount > 0 && item.contentCount > 0 && item.titleDescriptionCount > 0 && item.stateCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.dialogSetups.some((item) => item.filePath === "src/ariakit-dialog.tsx" && item.framework === "ariakit-dialog" && item.triggerCount > 0 && item.portalCount > 0 && item.overlayCount > 0 && item.contentCount > 0 && item.titleDescriptionCount > 0 && item.stateCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-dialog", "radix-alert-dialog", "headlessui-dialog", "ariakit-dialog"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "trigger", "portal", "overlay", "content", "title", "description", "close", "panel", "backdrop"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["open-prop", "default-open", "on-open-change", "on-close", "dialog-provider", "dialog-store", "controlled-state", "transition-state"]));
    expect(readySignals(report.focusSignals)).toEqual(expect.arrayContaining(["focus-scope", "focus-trap", "initial-focus", "restore-focus", "auto-focus", "final-focus", "tab-lock", "inert-others"]));
    expect(readySignals(report.dismissalSignals)).toEqual(expect.arrayContaining(["dismissable-layer", "outside-click", "escape-key", "close-button", "dialog-dismiss", "hide-on-escape", "hide-on-interact-outside", "on-dismiss"]));
    expect(readySignals(report.portalOverlaySignals)).toEqual(expect.arrayContaining(["portal", "portal-group", "force-portal-root", "remove-scroll", "scroll-lock", "backdrop", "overlay", "modal"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-dialog", "role-alertdialog", "aria-modal", "aria-labelledby", "aria-describedby", "aria-label", "title-required", "description-warning"]));
    expect(readySignals(report.animationSignals)).toEqual(expect.arrayContaining(["transition", "transition-child", "data-state", "force-mount", "open-closed-state", "mounted-state"]));
    expect(readySignals(report.implementationSignals)).toEqual(expect.arrayContaining(["outside-click", "escape-close", "scroll-lock", "auto-focus", "initial-focus", "transition-wrapper", "render-strategy-static"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "role-test", "keyboard-test", "focus-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-dialog", "@radix-ui/react-alert-dialog", "@headlessui/react", "@ariakit/react", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-dialog"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records dialog readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "dialog-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "dialog-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "dialog-readiness.html"))).resolves.toBeUndefined();
    const dialogMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "dialog-readiness.md"), "utf8");
    expect(dialogMarkdown).toContain("Dialog Readiness");
    expect(dialogMarkdown).toContain("Implementation Signals");
    expect(dialogMarkdown).toContain("@radix-ui/react-dialog");
    const dialogHtml = await fs.readFile(path.join(result.session.outputPaths.html, "dialog-readiness.html"), "utf8");
    expect(dialogHtml).toContain("dialog-readiness-card");
    expect(dialogHtml).toContain("data-source-pattern=\"Dialog\"");
    expect(dialogHtml).toContain("Implementation Signals");
    expect(dialogHtml).toContain("RepoTutor records dialog readiness only");
  });

  it("detects Headless UI dialog implementation details without opening portals", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dialog-headlessui-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-dialog-headlessui-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headlessui-dialog-internals.tsx"), [
      "import { useEffect, useReducer, useRef, useState } from 'react';",
      "import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition } from '@headlessui/react';",
      "import { FocusTrap, FocusTrapFeatures } from '../focus-trap/focus-trap';",
      "import { ForcePortalRoot } from '../portal-force-root';",
      "import { Portal, PortalGroup, useNestedPortals } from '../portal/portal';",
      "import { useEscape } from '../hooks/use-escape';",
      "import { useInertOthers } from '../hooks/use-inert-others';",
      "import { useOnDisappear } from '../hooks/use-on-disappear';",
      "import { useOutsideClick } from '../hooks/use-outside-click';",
      "import { useRootContainers, useMainTreeNode, MainTreeProvider } from '../hooks/use-root-containers';",
      "import { useScrollLock } from '../hooks/use-scroll-lock';",
      "import { useServerHandoffComplete } from '../hooks/use-server-handoff-complete';",
      "import { CloseProvider } from '../internal/close-provider';",
      "import { ResetOpenClosedProvider, State, useOpenClosed } from '../internal/open-closed';",
      "import { stackMachines } from '../machines/stack-machine';",
      "export function HeadlessUiDialogImplementationFixture() {",
      "  const [open, setOpen] = useState(true);",
      "  const titleId = useRef<string | null>(null);",
      "  const panelRef = useRef<HTMLElement | null>(null);",
      "  const [portals, PortalWrapper] = useNestedPortals();",
      "  const mainTreeNode = useMainTreeNode();",
      "  const { resolveContainers } = useRootContainers({ mainTreeNode, portals, defaultContainers: [{ get current() { return panelRef.current } }] });",
      "  const openClosedState = useOpenClosed();",
      "  const isClosing = openClosedState !== null ? (openClosedState & State.Closing) === State.Closing : false;",
      "  const ready = useServerHandoffComplete();",
      "  useInertOthers(ready && open && !isClosing, { allowed: () => [panelRef.current?.closest('[data-headlessui-portal]') ?? null], disallowed: () => [mainTreeNode?.closest('body > *:not(#headlessui-portal-root)') ?? null] });",
      "  const stackMachine = stackMachines.get(null);",
      "  useEffect(() => { stackMachine.actions.push('billing-dialog'); return () => stackMachine.actions.pop('billing-dialog'); }, [stackMachine]);",
      "  const isTopLayer = stackMachine.selectors.isTop({} as never, 'billing-dialog');",
      "  useOutsideClick(isTopLayer, resolveContainers, (event) => { event.preventDefault(); setOpen(false); });",
      "  useEscape(isTopLayer, document.defaultView, (event) => { event.preventDefault(); event.stopPropagation(); if (document.activeElement && 'blur' in document.activeElement) document.activeElement.blur(); setOpen(false); });",
      "  useScrollLock(open && !isClosing, document, resolveContainers);",
      "  useOnDisappear(open, panelRef, () => setOpen(false));",
      "  let focusTrapFeatures = FocusTrapFeatures.RestoreFocus | FocusTrapFeatures.TabLock | FocusTrapFeatures.AutoFocus | FocusTrapFeatures.InitialFocus;",
      "  const role = 'alertdialog';",
      "  const invalidRoleFallback = role === 'dialog' || role === 'alertdialog' ? role : 'dialog';",
      "  const setTitleId = (id: string | null) => { titleId.current = id; };",
      "  useEffect(() => { setTitleId('billing-title'); return () => setTitleId(null); }, []);",
      "  useReducer((state, action) => ({ ...state, titleId: action.id }), { titleId: null });",
      "  return <MainTreeProvider><ResetOpenClosedProvider><ForcePortalRoot force={true}><Portal><PortalGroup target={panelRef}><ForcePortalRoot force={false}><PortalWrapper><FocusTrap initialFocusFallback={panelRef} containers={resolveContainers} features={focusTrapFeatures}><CloseProvider value={() => setOpen(false)}><Transition show={open} transition unmount><Dialog open={open} onClose={setOpen} role={invalidRoleFallback} aria-modal={open ? true : undefined} aria-labelledby={titleId.current ?? undefined} aria-describedby=\"billing-description\" tabIndex={-1}><DialogBackdrop aria-hidden=\"true\" /><DialogPanel ref={panelRef as never} onClick={(event) => event.stopPropagation()}><DialogTitle id=\"billing-title\">Billing</DialogTitle></DialogPanel></Dialog></Transition></CloseProvider></FocusTrap></PortalWrapper></ForcePortalRoot></PortalGroup></Portal></ForcePortalRoot></ResetOpenClosedProvider></MainTreeProvider>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "dialog-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      implementationSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.implementationSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Headless UI");
    expect(readySignals).toEqual(expect.arrayContaining([
      "server-handoff",
      "nested-portals",
      "root-containers",
      "main-tree-provider",
      "inert-others",
      "stack-machine",
      "top-layer",
      "outside-click",
      "escape-close",
      "escape-blur-active-element",
      "scroll-lock",
      "disappear-close",
      "focus-trap-features",
      "restore-focus",
      "tab-lock",
      "auto-focus",
      "initial-focus",
      "force-portal-root",
      "portal-group",
      "close-provider",
      "open-closed-context",
      "closing-state",
      "role-validation",
      "aria-modal-open",
      "aria-labelledby",
      "aria-describedby",
      "tab-index-minus-one",
      "panel-stop-propagation",
      "backdrop-aria-hidden",
      "title-registration",
      "transition-wrapper"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "dialog-readiness.md"), "utf8");
    expect(markdown).toContain("## Implementation Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "dialog-readiness.html"), "utf8");
    expect(html).toContain("Implementation Signals");
  });

  it("detects Headless UI focus trap implementation details without moving focus", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-focus-trap-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-focus-trap-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headlessui-focus-trap-internals.tsx"), [
      "import { useRef } from 'react';",
      "import { Dialog } from '@headlessui/react';",
      "import { FocusTrap, FocusTrapFeatures } from '../focus-trap/focus-trap';",
      "import { Hidden, HiddenFeatures } from '../internal/hidden';",
      "import { history } from '../utils/active-element-history';",
      "import { Focus, FocusResult, focusElement, focusIn } from '../utils/focus-management';",
      "import { microTask } from '../utils/micro-task';",
      "import { isActiveElement } from '../utils/owner';",
      "import { useDisposables } from '../hooks/use-disposables';",
      "import { useEventListener } from '../hooks/use-event-listener';",
      "import { useIsTopLayer } from '../hooks/use-is-top-layer';",
      "import { useOwnerDocument } from '../hooks/use-owner';",
      "import { useServerHandoffComplete } from '../hooks/use-server-handoff-complete';",
      "import { useSyncRefs } from '../hooks/use-sync-refs';",
      "import { useTabDirection } from '../hooks/use-tab-direction';",
      "import { useWatch } from '../hooks/use-watch';",
      "export function HeadlessUiFocusTrapImplementationFixture() {",
      "  const container = useRef<HTMLElement | null>(null);",
      "  const initialFocus = useRef<HTMLElement | null>(null);",
      "  const initialFocusFallback = useRef<HTMLElement | null>(null);",
      "  const previousActiveElement = useRef<HTMLOrSVGElement | null>(null);",
      "  const containers = { current: new Set([container]) };",
      "  const focusTrapRef = useSyncRefs(container);",
      "  const ownerDocument = useOwnerDocument(container.current);",
      "  const ready = useServerHandoffComplete();",
      "  const direction = useTabDirection();",
      "  const disposables = useDisposables();",
      "  const recentlyUsedTabKey = useRef(false);",
      "  const features = ready ? FocusTrapFeatures.InitialFocus | FocusTrapFeatures.TabLock | FocusTrapFeatures.FocusLock | FocusTrapFeatures.RestoreFocus | FocusTrapFeatures.AutoFocus : FocusTrapFeatures.None;",
      "  const enumProof = [FocusTrapFeatures.None, FocusTrapFeatures.InitialFocus, FocusTrapFeatures.TabLock, FocusTrapFeatures.FocusLock, FocusTrapFeatures.RestoreFocus, FocusTrapFeatures.AutoFocus];",
      "  const allContainers = resolveContainers(containers);",
      "  const tabLockEnabled = useIsTopLayer(Boolean(features & FocusTrapFeatures.TabLock), 'focus-trap#tab-lock');",
      "  useRestoreFocus(features, { ownerDocument });",
      "  useInitialFocus(features, { ownerDocument, container, initialFocus, initialFocusFallback });",
      "  useFocusLock(features, { ownerDocument, container, containers, previousActiveElement });",
      "  useWatch(() => { if (features === FocusTrapFeatures.None) return; microTask(() => focusIn(container.current!, Focus.First | Focus.AutoFocus)); }, [features]);",
      "  useEventListener(ownerDocument?.defaultView, 'focus', (event) => { if (!contains(allContainers, event.target as Element)) { event.preventDefault(); event.stopPropagation(); focusElement(previousActiveElement.current); } }, true);",
      "  function handleFocus(e: React.FocusEvent) { microTask(() => { focusIn(container.current!, Focus.First); focusIn(container.current!, Focus.Last); focusIn(container.current!, Focus.Next | Focus.WrapAround); focusIn(container.current!, Focus.Previous | Focus.WrapAround); }); }",
      "  function handleKeyDown(e: KeyboardEvent) { if (e.key === 'Tab') { recentlyUsedTabKey.current = true; disposables.requestAnimationFrame(() => { recentlyUsedTabKey.current = false; }); } }",
      "  function handleBlur(e: React.FocusEvent) { if (!(features & FocusTrapFeatures.FocusLock)) return; if ((e.relatedTarget as HTMLElement).dataset.headlessuiFocusGuard === 'true') return; if (recentlyUsedTabKey.current) focusIn(container.current!, Focus.Next | Focus.WrapAround, { relativeTo: e.target as HTMLElement }); else focusElement(e.target as HTMLElement); }",
      "  const restoreHistory = history.slice().find((item) => item != null && item.isConnected) ?? null;",
      "  const activeBody = isActiveElement(ownerDocument?.body);",
      "  const objectAssignProof = Object.assign(FocusTrapRoot, { features: FocusTrapFeatures });",
      "  return <Dialog open={true} onClose={() => undefined}><FocusTrap ref={focusTrapRef} initialFocus={initialFocus} initialFocusFallback={initialFocusFallback} containers={containers} features={features}><Hidden as=\"button\" data-headlessui-focus-guard onFocus={handleFocus} features={HiddenFeatures.Focusable} /><div ref={container as never} onKeyDown={handleKeyDown as never} onBlur={handleBlur}>{String(tabLockEnabled)} {String(enumProof.length)} {String(FocusResult.Error)} {String(direction.current)} {String(restoreHistory)} {String(activeBody)} {String(objectAssignProof.features)}</div></FocusTrap></Dialog>;",
      "}",
      "function resolveContainers(containers?: { current: Set<React.MutableRefObject<Element | null>> }) { return new Set(Array.from(containers?.current ?? []).map((container) => container.current).filter(Boolean) as Element[]); }",
      "function useRestoreFocus(features: FocusTrapFeatures, _options: { ownerDocument: Document | null }) { return features & FocusTrapFeatures.RestoreFocus; }",
      "function useInitialFocus(features: FocusTrapFeatures, _options: unknown) { return features & FocusTrapFeatures.InitialFocus; }",
      "function useFocusLock(features: FocusTrapFeatures, _options: unknown) { return features & FocusTrapFeatures.FocusLock; }",
      "const FocusTrapRoot = FocusTrap;"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "dialog-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      implementationSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.implementationSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Dialog readiness Radix Dialog Headless UI Dialog FocusTrap internals Ariakit Dialog portal overlay focus trap focus lock hidden guards tab direction dismiss accessibility server handoff root containers inert stack top layer scroll lock disappear tests");
    expect(readySignals).toEqual(expect.arrayContaining([
      "focus-trap-none",
      "focus-lock",
      "focus-trap-props",
      "resolve-containers",
      "sync-refs",
      "owner-document",
      "restore-element-history",
      "restore-focus-hook",
      "initial-focus-hook",
      "initial-focus-fallback",
      "focus-lock-hook",
      "tab-direction",
      "hidden-focus-guards",
      "focus-guard-dataset",
      "focusable-hidden",
      "microtask-focus",
      "focus-in-first-last",
      "focus-next-previous-wrap",
      "recent-tab-key",
      "disposables-raf",
      "blur-focus-lock",
      "event-listener",
      "contains-containers",
      "focus-trap-object-assign"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "dialog-readiness.md"), "utf8");
    expect(markdown).toContain("Implementation Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "dialog-readiness.html"), "utf8");
    expect(html).toContain("Implementation Signals");
  });

  it("detects popover and tooltip readiness without opening floating surfaces", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-popover-tooltip-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-popover-tooltip-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "radix-popover-tooltip.tsx"), [
      "import { useRef, useState } from 'react';",
      "import * as Popover from '@radix-ui/react-popover';",
      "import * as Tooltip from '@radix-ui/react-tooltip';",
      "import * as HoverCard from '@radix-ui/react-hover-card';",
      "export function RadixFloatingSurfaces() {",
      "  const [open, setOpen] = useState(false);",
      "  const closeRef = useRef<HTMLButtonElement>(null);",
      "  return <Tooltip.Provider delayDuration={150} skipDelayDuration={50} disableHoverableContent>",
      "    <Popover.Root open={open} defaultOpen={false} onOpenChange={setOpen} modal>",
      "      <Popover.Trigger aria-expanded={open} aria-controls=\"profile-popover\">Profile</Popover.Trigger>",
      "      <Popover.Anchor />",
      "      <Popover.Portal forceMount>",
      "        <Popover.Content id=\"profile-popover\" role=\"dialog\" aria-label=\"Profile popover\" side=\"bottom\" align=\"start\" sideOffset={8} collisionBoundary={document.body} avoidCollisions onOpenAutoFocus={(event) => closeRef.current?.focus()} onCloseAutoFocus={(event) => event.preventDefault()}>",
      "          <Popover.Arrow />",
      "          <Popover.Close ref={closeRef} aria-label=\"Close profile popover\">Close</Popover.Close>",
      "        </Popover.Content>",
      "      </Popover.Portal>",
      "    </Popover.Root>",
      "    <Tooltip.Root open={open} defaultOpen={false} onOpenChange={setOpen} delayDuration={100}>",
      "      <Tooltip.Trigger aria-describedby=\"help-tip\">Help</Tooltip.Trigger>",
      "      <Tooltip.Portal><Tooltip.Content id=\"help-tip\" role=\"tooltip\" side=\"top\" align=\"center\" sideOffset={4} avoidCollisions><Tooltip.Arrow />Helpful tip</Tooltip.Content></Tooltip.Portal>",
      "    </Tooltip.Root>",
      "    <HoverCard.Root openDelay={200} closeDelay={120} onOpenChange={setOpen}>",
      "      <HoverCard.Trigger>Owner</HoverCard.Trigger>",
      "      <HoverCard.Portal><HoverCard.Content side=\"right\" align=\"start\" sideOffset={6} onEscapeKeyDown={() => setOpen(false)} onPointerDownOutside={() => setOpen(false)}><HoverCard.Arrow />Owner summary</HoverCard.Content></HoverCard.Portal>",
      "    </HoverCard.Root>",
      "  </Tooltip.Provider>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "floating-ui-popover.tsx"), [
      "import { useRef, useState } from 'react';",
      "import { FloatingArrow, FloatingFocusManager, FloatingOverlay, FloatingPortal, arrow, autoUpdate, flip, offset, safePolygon, shift, useClick, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole } from '@floating-ui/react';",
      "export function FloatingUiHelp() {",
      "  const [open, setOpen] = useState(false);",
      "  const arrowRef = useRef(null);",
      "  const { refs, floatingStyles, context } = useFloating({ open, onOpenChange: setOpen, placement: 'bottom-start', whileElementsMounted: autoUpdate, middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })] });",
      "  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useHover(context, { handleClose: safePolygon(), delay: { open: 200, close: 100 } }), useFocus(context), useDismiss(context, { escapeKey: true, outsidePress: true }), useRole(context, { role: 'tooltip' })]);",
      "  return <>",
      "    <button ref={refs.setReference} aria-expanded={open} aria-controls=\"floating-help\" {...getReferenceProps()}>Floating help</button>",
      "    {open && <FloatingPortal><FloatingOverlay lockScroll><FloatingFocusManager context={context} modal={false} returnFocus initialFocus={-1}><div id=\"floating-help\" ref={refs.setFloating} style={floatingStyles} aria-label=\"Floating help\" {...getFloatingProps()}><FloatingArrow ref={arrowRef} context={context} />Floating content</div></FloatingFocusManager></FloatingOverlay></FloatingPortal>}",
      "  </>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "ariakit-popover-tooltip.tsx"), [
      "import { Popover, PopoverAnchor, PopoverArrow, PopoverDescription, PopoverDisclosure, PopoverDismiss, PopoverHeading, PopoverProvider, Tooltip, TooltipAnchor, TooltipArrow, TooltipProvider, Hovercard, HovercardAnchor, HovercardArrow, HovercardDisclosure, HovercardDismiss, HovercardProvider, useHovercardStore, usePopoverStore, useTooltipStore } from '@ariakit/react';",
      "export function AriakitFloatingSurfaces() {",
      "  const popover = usePopoverStore({ defaultOpen: false, placement: 'bottom-start' });",
      "  const tooltip = useTooltipStore({ placement: 'top' });",
      "  const hovercard = useHovercardStore({ placement: 'right-start' });",
      "  return <PopoverProvider store={popover}>",
      "    <PopoverAnchor>Profile anchor</PopoverAnchor>",
      "    <PopoverDisclosure>Open profile popover</PopoverDisclosure>",
      "    <Popover store={popover} portal modal={false} gutter={8} shift={4} flip hideOnEscape hideOnInteractOutside initialFocus autoFocusOnShow autoFocusOnHide aria-label=\"Ariakit profile popover\">",
      "      <PopoverHeading>Profile</PopoverHeading><PopoverDescription>Profile controls</PopoverDescription><PopoverDismiss>Done</PopoverDismiss><PopoverArrow />",
      "    </Popover>",
      "    <TooltipProvider store={tooltip} timeout={250}><TooltipAnchor>Need help?</TooltipAnchor><Tooltip role=\"tooltip\"><TooltipArrow />Helpful hint</Tooltip></TooltipProvider>",
      "    <HovercardProvider store={hovercard}><HovercardAnchor>Owner</HovercardAnchor><HovercardDisclosure>Owner card</HovercardDisclosure><Hovercard><HovercardDismiss>Close</HovercardDismiss><HovercardArrow />Owner details</Hovercard></HovercardProvider>",
      "  </PopoverProvider>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "test", "popover-tooltip.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { FloatingUiHelp } from '../src/floating-ui-popover';",
      "describe('popover and tooltip accessibility behavior', () => {",
      "  it('keeps roles, labels, hover, keyboard, and focus behavior testable', async () => {",
      "    render(<FloatingUiHelp />);",
      "    await userEvent.hover(screen.getByRole('button', { name: /floating help/i }));",
      "    await userEvent.keyboard('{Tab}{Escape}');",
      "    expect(screen.getByLabelText(/floating help/i)).toBeTruthy();",
      "    expect(screen.queryByRole('tooltip')).toBeTruthy();",
      "    expect(document.activeElement).toBeTruthy();",
      "  });",
      "});"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "popover-tooltip.yml"), [
      "name: popover tooltip",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest run test/popover-tooltip.spec.tsx",
      "      - run: pnpm playwright test popover-tooltip.spec.tsx",
      "      - run: pnpm cypress run --spec test/popover-tooltip.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: popover-tooltip-traces",
      "          path: reports/popover-tooltip"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@ariakit/react": "latest",
        "@floating-ui/react": "latest",
        "@floating-ui/react-dom": "latest",
        "@radix-ui/react-hover-card": "latest",
        "@radix-ui/react-popover": "latest",
        "@radix-ui/react-tooltip": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "@types/react": "latest",
        "cypress": "latest",
        "playwright": "latest",
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "popover-tooltip-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      popoverTooltipSetups: Array<{ filePath: string; framework: string; triggerCount: number; anchorCount: number; portalCount: number; contentCount: number; positionCount: number; interactionCount: number; dismissCount: number; focusCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      positioningSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      dismissalSignals: Array<{ signal: string; readiness: string }>;
      focusSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      portalSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Popover/tooltip readiness Radix Popover Radix Tooltip Headless UI Popover machine sentinels portalled focus Floating UI Ariakit Popover Tooltip portal positioning hover focus dismissal accessibility tests");
    expect(report.popoverTooltipSetups.some((item) => item.filePath === "src/radix-popover-tooltip.tsx" && item.framework === "radix-popover" && item.triggerCount > 0 && item.anchorCount > 0 && item.portalCount > 0 && item.contentCount > 0 && item.positionCount > 0 && item.interactionCount > 0 && item.dismissCount > 0 && item.focusCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.popoverTooltipSetups.some((item) => item.filePath === "src/floating-ui-popover.tsx" && item.framework === "floating-ui" && item.triggerCount > 0 && item.portalCount > 0 && item.contentCount > 0 && item.positionCount > 0 && item.interactionCount > 0 && item.dismissCount > 0 && item.focusCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.popoverTooltipSetups.some((item) => item.filePath === "src/ariakit-popover-tooltip.tsx" && item.framework === "ariakit-popover" && item.triggerCount > 0 && item.anchorCount > 0 && item.portalCount > 0 && item.contentCount > 0 && item.positionCount > 0 && item.interactionCount > 0 && item.dismissCount > 0 && item.focusCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-popover", "radix-tooltip", "radix-hover-card", "floating-ui", "ariakit-popover", "ariakit-tooltip", "ariakit-hovercard"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "provider", "trigger", "anchor", "portal", "content", "arrow", "dismiss", "heading", "description"]));
    expect(readySignals(report.positioningSignals)).toEqual(expect.arrayContaining(["use-floating", "popper", "side-offset", "align", "placement", "offset", "flip", "shift", "arrow-middleware", "auto-update", "collision-boundary"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["click", "hover", "focus", "safe-polygon", "delay-duration", "open-prop", "on-open-change", "controlled-state"]));
    expect(readySignals(report.dismissalSignals)).toEqual(expect.arrayContaining(["dismissable-layer", "use-dismiss", "escape-key", "outside-click", "popover-dismiss", "hide-on-escape", "hide-on-interact-outside"]));
    expect(readySignals(report.focusSignals)).toEqual(expect.arrayContaining(["focus-scope", "floating-focus-manager", "initial-focus", "return-focus", "modal-focus", "tab-index"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-tooltip", "role-dialog", "aria-describedby", "aria-labelledby", "aria-label", "aria-expanded", "aria-controls", "keyboard-navigation"]));
    expect(readySignals(report.portalSignals)).toEqual(expect.arrayContaining(["portal", "floating-portal", "force-mount", "mounted-state", "overlay"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "hover-test", "keyboard-test", "role-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-popover", "@radix-ui/react-tooltip", "@radix-ui/react-hover-card", "@floating-ui/react", "@floating-ui/react-dom", "@ariakit/react", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@floating-ui/react"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records popover/tooltip readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "popover-tooltip-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "popover-tooltip-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "popover-tooltip-readiness.html"))).resolves.toBeUndefined();
    const popoverMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "popover-tooltip-readiness.md"), "utf8");
    expect(popoverMarkdown).toContain("Popover Tooltip Readiness");
    expect(popoverMarkdown).toContain("@floating-ui/react");
    const popoverHtml = await fs.readFile(path.join(result.session.outputPaths.html, "popover-tooltip-readiness.html"), "utf8");
    expect(popoverHtml).toContain("popover-tooltip-readiness-card");
    expect(popoverHtml).toContain("data-source-pattern=\"PopoverTooltip\"");
    expect(popoverHtml).toContain("RepoTutor records popover/tooltip readiness only");
  });

  it("detects Headless UI popover implementation details without opening floating surfaces", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-popover-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-popover-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headlessui-popover-internals.tsx"), [
      "import { Popover, PopoverButton, PopoverPanel, PopoverBackdrop } from '@headlessui/react';",
      "import { PopoverContext, usePopoverMachine, usePopoverMachineContext } from './popover-machine-glue';",
      "import { PopoverMachine, PopoverStates, ActionTypes } from './popover-machine';",
      "import { stackMachines } from './stack-machine';",
      "import { FloatingProvider, useFloatingReference, useFloatingPanel, useFloatingPanelProps, useResolvedAnchor } from './floating';",
      "import { MainTreeProvider, useMainTreeNode, useRootContainers, useOwnerDocument, useRootDocument, useNestedPortals, Portal, Hidden, HiddenFeatures } from './headless-internals';",
      "import { CloseProvider, OpenClosedProvider, ResetOpenClosedProvider, State, transitionDataAttributes, useTransition, useOutsideClick, useOnDisappear, useScrollLock, useFocusRing, useHover, useActivePress, useTabDirection, microTask, focusIn, Focus, FocusResult, getFocusableElements, getActiveElement, getRootNode, getOwnerDocument, isFocusableElement, FocusableMode, Keys } from './headless-internals';",
      "export function HeadlessPopoverInternals({ focus = true, modal = true, disabled = false }) {",
      "  const machine = usePopoverMachine({ id: 'headlessui-popover', __demoMode: false });",
      "  const context = usePopoverMachineContext('Popover.Panel');",
      "  const popover = PopoverMachine.new({ id: 'headlessui-popover-machine', __demoMode: true });",
      "  const stack = stackMachines.get(null);",
      "  stack.actions.push(machine.state.id);",
      "  stack.actions.pop(machine.state.id);",
      "  machine.send({ type: ActionTypes.OpenPopover });",
      "  machine.send({ type: ActionTypes.ClosePopover });",
      "  const refocusableClose = machine.actions.refocusableClose;",
      "  const isPortalled = machine.selectors.isPortalled(machine.state);",
      "  const ownerDocument = getOwnerDocument(machine.state.button);",
      "  const elements = getFocusableElements(ownerDocument);",
      "  const rootDocument = useRootDocument(machine.state.button);",
      "  const groupContext = { closeOthers: (buttonId) => machine.actions.close(), isFocusWithinPopoverGroup: () => false };",
      "  groupContext.closeOthers(machine.state.buttonId);",
      "  const [portals, PortalWrapper] = useNestedPortals();",
      "  const mainTreeNode = useMainTreeNode(machine.state.button);",
      "  const root = useRootContainers({ mainTreeNode, portals, defaultContainers: [{ get current() { return machine.state.button; } }, { get current() { return machine.state.panel; } }] });",
      "  useOutsideClick(machine.state.popoverState === PopoverStates.Open, root.resolveContainers, (event, target) => { machine.actions.close(); if (!isFocusableElement(target, FocusableMode.Loose)) { event.preventDefault(); machine.state.button?.focus(); } });",
      "  const buttonRef = useFloatingReference();",
      "  const anchor = useResolvedAnchor({ to: 'bottom start' });",
      "  const [floatingRef, style] = useFloatingPanel(anchor);",
      "  const getFloatingPanelProps = useFloatingPanelProps();",
      "  const { isFocusVisible: focusVisible, focusProps } = useFocusRing({ autoFocus: true });",
      "  const { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled });",
      "  const { pressed: active, pressProps } = useActivePress({ disabled });",
      "  const uniqueIdentifier = Symbol();",
      "  machine.state.buttons.current.push(uniqueIdentifier);",
      "  if (machine.state.buttons.current.length > 1) console.warn('only 1 <Popover.Button /> is supported');",
      "  if (context && machine.state.popoverState === PopoverStates.Open) { machine.actions.close(); machine.state.button?.focus(); }",
      "  const onButtonKeyDown = (event) => {",
      "    if (event.key === Keys.Space || event.key === Keys.Enter) { event.preventDefault(); event.stopPropagation(); machine.state.popoverState === PopoverStates.Closed ? machine.actions.open() : machine.actions.close(); }",
      "    if (event.key === Keys.Escape) { event.preventDefault(); event.stopPropagation(); machine.actions.close(); }",
      "  };",
      "  const onButtonKeyUp = (event) => { if (event.key === Keys.Space) event.preventDefault(); };",
      "  const sentinelId = 'headlessui-focus-sentinel';",
      "  const direction = useTabDirection();",
      "  const focusPanel = () => { const result = focusIn(machine.state.panel, Focus.First); if (result === FocusResult.Error) focusIn(elements, Focus.Next, { relativeTo: machine.state.button }); };",
      "  microTask(focusPanel);",
      "  const [backdropVisible, backdropTransition] = useTransition(true, machine.state.panel, machine.state.popoverState === PopoverStates.Open);",
      "  const [panelVisible, panelTransition] = useTransition(true, machine.state.panel, machine.state.popoverState === PopoverStates.Open);",
      "  useOnDisappear(panelVisible, machine.state.button, machine.actions.close);",
      "  useScrollLock(modal && panelVisible, ownerDocument);",
      "  if (machine.state.popoverState === PopoverStates.Closed) machine.actions.setPanel(null);",
      "  const onPanelBlur = (event) => { if (!machine.state.panel?.contains(event.relatedTarget)) machine.actions.close(); };",
      "  const beforePanelSentinel = machine.state.beforePanelSentinel;",
      "  const afterPanelSentinel = machine.state.afterPanelSentinel;",
      "  const afterButtonSentinel = machine.state.afterButtonSentinel;",
      "  const cssVar = { '--button-width': 'var(--button-width)' };",
      "  return (",
      "    <MainTreeProvider node={mainTreeNode}>",
      "      <FloatingProvider>",
      "        <PopoverContext.Provider value={machine}>",
      "          <CloseProvider value={refocusableClose}>",
      "            <OpenClosedProvider value={machine.state.popoverState === PopoverStates.Open ? State.Open : State.Closed}>",
      "              <Popover as=\"div\">",
      "                <PopoverButton ref={buttonRef} aria-expanded={machine.state.popoverState === PopoverStates.Open} aria-controls={machine.state.panelId} onKeyDown={onButtonKeyDown} onKeyUp={onButtonKeyUp} onMouseDown={(event) => event.preventDefault()} data-hover={hover} data-focus={focusVisible} data-active={active}>Account</PopoverButton>",
      "                {isPortalled && <Hidden id={sentinelId} ref={afterButtonSentinel} features={HiddenFeatures.Focusable} data-headlessui-focus-guard as=\"button\" type=\"button\" onFocus={focusPanel} />}",
      "                <PopoverBackdrop aria-hidden=\"true\" onClick={() => machine.actions.close()} {...transitionDataAttributes(backdropTransition)} />",
      "                <ResetOpenClosedProvider>",
      "                  <Portal enabled={panelVisible} ownerDocument={ownerDocument}>",
      "                    <Hidden ref={beforePanelSentinel} features={HiddenFeatures.Focusable} data-headlessui-focus-guard as=\"button\" type=\"button\" onFocus={focusPanel} />",
      "                    <PopoverPanel ref={floatingRef} anchor=\"bottom\" portal modal={modal} focus={focus} tabIndex={-1} style={{ ...style, ...cssVar }} onBlur={onPanelBlur} {...getFloatingPanelProps()} {...transitionDataAttributes(panelTransition)}>Details</PopoverPanel>",
      "                    <Hidden ref={afterPanelSentinel} features={HiddenFeatures.Focusable} data-headlessui-focus-guard as=\"button\" type=\"button\" onFocus={focusPanel} />",
      "                  </Portal>",
      "                </ResetOpenClosedProvider>",
      "              </Popover>",
      "            </OpenClosedProvider>",
      "          </CloseProvider>",
      "        </PopoverContext.Provider>",
      "      </FloatingProvider>",
      "    </MainTreeProvider>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "popover-tooltip-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      implementationSignals: Array<{ signal: string; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Headless UI Popover machine");
    expect(readySignals(report.frameworkSignals)).toContain("headless-popover");
    expect(readySignals(report.packageSignals)).toContain("@headlessui/react");
    expect(readySignals(report.implementationSignals)).toEqual(expect.arrayContaining(["popover-machine", "machine-context", "demo-mode-open", "stack-machine", "action-open-close", "refocusable-close", "portalled-selector", "owner-document-focusables", "root-document", "group-close-others", "nested-portals", "root-containers", "main-tree-provider", "close-provider", "open-closed-provider", "focus-out-close", "outside-click-close", "outside-click-refocus", "floating-provider", "floating-reference", "button-unique-identifier", "single-button-warning", "keyboard-toggle", "keyboard-escape-close", "space-keyup-prevent-default", "active-press", "focus-ring", "hover-state", "focus-guard-sentinels", "hidden-focus-sentinel", "tab-direction", "focus-in-panel", "microtask-focus", "backdrop-transition", "backdrop-aria-hidden", "panel-anchor", "floating-panel", "portal-owner-document", "transition-data", "disappear-close", "scroll-lock-modal", "panel-unlink-on-unmount", "panel-blur-close", "reset-open-closed-provider", "portal-enabled-visible-static", "button-width-css-var"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "popover-tooltip-readiness.md"), "utf8");
    expect(markdown).toContain("## Implementation Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "popover-tooltip-readiness.html"), "utf8");
    expect(html).toContain("Implementation Signals");
  });

  it("detects menu and dropdown readiness without opening menu surfaces", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-menu-dropdown-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-menu-dropdown-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "radix-menu-dropdown.tsx"), [
      "import { useState } from 'react';",
      "import * as DropdownMenu from '@radix-ui/react-dropdown-menu';",
      "import * as ContextMenu from '@radix-ui/react-context-menu';",
      "import * as Menubar from '@radix-ui/react-menubar';",
      "import * as NavigationMenu from '@radix-ui/react-navigation-menu';",
      "export function RadixMenus() {",
      "  const [open, setOpen] = useState(false);",
      "  const [checked, setChecked] = useState(false);",
      "  const [value, setValue] = useState('left');",
      "  return <>",
      "    <DropdownMenu.Root open={open} defaultOpen={false} onOpenChange={setOpen} modal>",
      "      <DropdownMenu.Trigger aria-haspopup=\"menu\" aria-expanded={open} aria-controls=\"account-menu\">Account</DropdownMenu.Trigger>",
      "      <DropdownMenu.Portal forceMount>",
      "        <DropdownMenu.Content id=\"account-menu\" role=\"menu\" side=\"bottom\" align=\"end\" sideOffset={8} collisionBoundary={document.body} avoidCollisions data-state={open ? 'open' : 'closed'}>",
      "          <DropdownMenu.Label>Account actions</DropdownMenu.Label>",
      "          <DropdownMenu.Group><DropdownMenu.Item role=\"menuitem\" data-highlighted>Profile</DropdownMenu.Item><DropdownMenu.Separator /></DropdownMenu.Group>",
      "          <DropdownMenu.CheckboxItem checked={checked} onCheckedChange={setChecked} aria-checked={checked}><DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>Email updates</DropdownMenu.CheckboxItem>",
      "          <DropdownMenu.RadioGroup value={value} onValueChange={setValue}><DropdownMenu.RadioItem value=\"left\"><DropdownMenu.ItemIndicator />Left</DropdownMenu.RadioItem></DropdownMenu.RadioGroup>",
      "          <DropdownMenu.Sub><DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger><DropdownMenu.Portal><DropdownMenu.SubContent sideOffset={4}><DropdownMenu.Item>Archive</DropdownMenu.Item><DropdownMenu.Arrow /></DropdownMenu.SubContent></DropdownMenu.Portal></DropdownMenu.Sub>",
      "        </DropdownMenu.Content>",
      "      </DropdownMenu.Portal>",
      "    </DropdownMenu.Root>",
      "    <ContextMenu.Root onOpenChange={setOpen}><ContextMenu.Trigger onContextMenu={(event) => event.preventDefault()}>Open context menu</ContextMenu.Trigger><ContextMenu.Portal><ContextMenu.Content role=\"menu\"><ContextMenu.Item>Copy</ContextMenu.Item><ContextMenu.Arrow /></ContextMenu.Content></ContextMenu.Portal></ContextMenu.Root>",
      "    <Menubar.Root value={value} onValueChange={setValue}><Menubar.Menu value=\"file\"><Menubar.Trigger>File</Menubar.Trigger><Menubar.Portal><Menubar.Content><Menubar.Item>New</Menubar.Item><Menubar.CheckboxItem checked={checked}>Pinned</Menubar.CheckboxItem><Menubar.RadioGroup value={value}><Menubar.RadioItem value=\"left\">Left</Menubar.RadioItem></Menubar.RadioGroup></Menubar.Content></Menubar.Portal></Menubar.Menu></Menubar.Root>",
      "    <NavigationMenu.Root value={value} onValueChange={setValue}><NavigationMenu.List><NavigationMenu.Item><NavigationMenu.Trigger aria-controls=\"nav-products\">Products</NavigationMenu.Trigger><NavigationMenu.Content id=\"nav-products\"><NavigationMenu.Link active href=\"/docs\">Docs</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item><NavigationMenu.Indicator /><NavigationMenu.Viewport /></NavigationMenu.List></NavigationMenu.Root>",
      "  </>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "headless-menu-listbox.tsx"), [
      "import { Combobox, Listbox, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';",
      "export function HeadlessMenus({ people, selected, setSelected }) {",
      "  return <>",
      "    <Menu as=\"div\"><MenuButton aria-haspopup=\"menu\" aria-expanded=\"false\">Actions</MenuButton><MenuItems anchor=\"bottom end\" static data-headlessui-state=\"open\"><MenuItem disabled>{({ active, close }) => <button role=\"menuitem\" data-headlessui-state={active ? 'active' : ''} onClick={() => close()}>Archive</button>}</MenuItem></MenuItems></Menu>",
      "    <Listbox value={selected} onChange={setSelected} multiple by=\"id\" disabled={false}><Listbox.Button aria-controls=\"people-listbox\">Assignee</Listbox.Button><Listbox.Options id=\"people-listbox\" role=\"listbox\"><Listbox.Option value={people[0]}>{({ selected, active }) => <span role=\"option\" aria-selected={selected} data-headlessui-state={active ? 'active' : ''}>Ada</span>}</Listbox.Option></Listbox.Options></Listbox>",
      "    <Combobox value={selected} onChange={setSelected} immediate virtual={{ options: people }} nullable><Combobox.Input aria-activedescendant=\"person-1\" displayValue={(person) => person.name} /><Combobox.Button>Search</Combobox.Button><Combobox.Options><Combobox.Option value={people[0]}>Ada</Combobox.Option></Combobox.Options></Combobox>",
      "  </>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "ariakit-menu-select.tsx"), [
      "import { Combobox, ComboboxItem, ComboboxProvider, Menu, MenuArrow, MenuButton, MenuButtonArrow, MenuHeading, MenuItem, MenuItemCheckbox, MenuItemRadio, MenuProvider, MenuSeparator, Select, SelectItem, SelectItemCheck, SelectProvider, useComboboxStore, useMenuStore, useSelectStore } from '@ariakit/react';",
      "export function AriakitMenus() {",
      "  const menu = useMenuStore({ defaultOpen: false, placement: 'bottom-start' });",
      "  const select = useSelectStore({ defaultValue: 'one', placement: 'bottom' });",
      "  const combobox = useComboboxStore({ defaultValue: '', placement: 'bottom-start' });",
      "  return <MenuProvider store={menu}>",
      "    <MenuButton aria-haspopup=\"menu\" aria-expanded={menu.useState('open')}><MenuButtonArrow />Open menu</MenuButton>",
      "    <Menu store={menu} portal gutter={8} shift={4} flip hideOnEscape hideOnInteractOutside aria-labelledby=\"menu-title\"><MenuHeading id=\"menu-title\">Project actions</MenuHeading><MenuItem>Rename</MenuItem><MenuItemCheckbox checked>Watched</MenuItemCheckbox><MenuItemRadio name=\"density\" value=\"compact\">Compact</MenuItemRadio><MenuSeparator /><MenuArrow /></Menu>",
      "    <SelectProvider store={select}><Select aria-label=\"Plan\"><SelectItem value=\"one\"><SelectItemCheck />One</SelectItem><SelectItem value=\"two\">Two</SelectItem></Select></SelectProvider>",
      "    <ComboboxProvider store={combobox}><Combobox aria-activedescendant=\"combo-one\" aria-controls=\"combo-list\" /><ComboboxItem id=\"combo-one\" value=\"one\">One</ComboboxItem></ComboboxProvider>",
      "  </MenuProvider>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "test", "menu-dropdown.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { RadixMenus } from '../src/radix-menu-dropdown';",
      "describe('menu and dropdown accessibility behavior', () => {",
      "  it('keeps roles, pointer, keyboard, and selection behavior testable', async () => {",
      "    render(<RadixMenus />);",
      "    await userEvent.click(screen.getByRole('button', { name: /account/i }));",
      "    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByText(/open context menu/i) });",
      "    await userEvent.keyboard('{ArrowDown}{Enter}{Escape}{Tab}');",
      "    expect(screen.getByRole('menu')).toBeTruthy();",
      "    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeTruthy();",
      "  });",
      "});"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "menu-dropdown.yml"), [
      "name: menu dropdown",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest run test/menu-dropdown.spec.tsx",
      "      - run: pnpm playwright test menu-dropdown.spec.tsx",
      "      - run: pnpm cypress run --spec test/menu-dropdown.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: menu-dropdown-traces",
      "          path: reports/menu-dropdown"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@ariakit/react": "latest",
        "@headlessui/react": "latest",
        "@radix-ui/react-context-menu": "latest",
        "@radix-ui/react-dropdown-menu": "latest",
        "@radix-ui/react-menubar": "latest",
        "@radix-ui/react-navigation-menu": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "@types/react": "latest",
        "cypress": "latest",
        "playwright": "latest",
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "menu-dropdown-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      menuDropdownSetups: Array<{ filePath: string; framework: string; triggerCount: number; contentCount: number; itemCount: number; selectionCount: number; positioningCount: number; interactionCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      positioningSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Menu/dropdown readiness Radix DropdownMenu ContextMenu Menubar NavigationMenu Headless UI Menu machine stack top layer floating typeahead Listbox Combobox Ariakit Menu Select Combobox keyboard selection accessibility tests");
    expect(report.menuDropdownSetups.some((item) => item.filePath === "src/radix-menu-dropdown.tsx" && item.framework === "radix-dropdown-menu" && item.triggerCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.selectionCount > 0 && item.positioningCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.menuDropdownSetups.some((item) => item.filePath === "src/headless-menu-listbox.tsx" && item.framework === "headless-menu" && item.triggerCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.selectionCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.menuDropdownSetups.some((item) => item.filePath === "src/ariakit-menu-select.tsx" && item.framework === "ariakit-menu" && item.triggerCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.selectionCount > 0 && item.positioningCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-dropdown-menu", "radix-context-menu", "radix-menubar", "radix-navigation-menu", "headless-menu", "headless-listbox", "headless-combobox", "ariakit-menu", "ariakit-select", "ariakit-combobox"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "trigger-button", "portal", "content", "item", "group", "label", "separator", "checkbox-item", "radio-item", "indicator", "submenu", "arrow", "viewport"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["value-prop", "on-value-change", "checked-state", "on-checked-change", "radio-group", "selected-state", "multiple-selection"]));
    expect(readySignals(report.positioningSignals)).toEqual(expect.arrayContaining(["side", "align", "side-offset", "collision-boundary", "popper", "anchor", "viewport", "floating-panel"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["click", "context-menu", "hover", "typeahead", "roving-focus", "keyboard-navigation", "escape-key", "outside-click", "tab-close"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-menu", "role-menuitem", "role-listbox", "role-option", "aria-haspopup", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-labelledby", "aria-selected", "aria-checked"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["open-prop", "default-open", "on-open-change", "disabled", "data-state", "data-highlighted", "data-disabled"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "pointer-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-dropdown-menu", "@radix-ui/react-context-menu", "@radix-ui/react-menubar", "@radix-ui/react-navigation-menu", "@headlessui/react", "@ariakit/react", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-dropdown-menu"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records menu/dropdown readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "menu-dropdown-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "menu-dropdown-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "menu-dropdown-readiness.html"))).resolves.toBeUndefined();
    const menuMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "menu-dropdown-readiness.md"), "utf8");
    expect(menuMarkdown).toContain("Menu Dropdown Readiness");
    expect(menuMarkdown).toContain("@headlessui/react");
    const menuHtml = await fs.readFile(path.join(result.session.outputPaths.html, "menu-dropdown-readiness.html"), "utf8");
    expect(menuHtml).toContain("menu-dropdown-readiness-card");
    expect(menuHtml).toContain("data-source-pattern=\"MenuDropdown\"");
    expect(menuHtml).toContain("RepoTutor records menu/dropdown readiness only");
  });

  it("detects Headless UI menu implementation details without opening menus", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-menu-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-menu-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headlessui-menu-internals.tsx"), [
      "import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';",
      "import { useMenuMachine, useMenuMachineContext } from './menu-machine-glue';",
      "import { MenuMachine, ActionTypes, ActivationTrigger, Focus } from './menu-machine';",
      "import { stackMachines, StackActionTypes } from './stack-machine';",
      "import { FloatingProvider, useFloatingReference, useFloatingReferenceProps, useFloatingPanel, useFloatingPanelProps } from './floating';",
      "import { OpenClosedProvider, State } from './open-closed';",
      "import { Keys, useOutsideClick, useQuickRelease, useHandleToggle, useActivePress, useOnDisappear, useScrollLock, useInertOthers, useTreeWalker, useDisposables, useTextValue, useTrackedPointer, restoreFocusIfNecessary, focusFrom, sortByDomNode, detectMovement } from './headless-internals';",
      "export function HeadlessMenuInternals({ disabled = false }) {",
      "  const machine = useMenuMachine({ id: 'headlessui-menu' });",
      "  const context = useMenuMachineContext('Menu.Items');",
      "  const stack = stackMachines.get(null);",
      "  stack.on(StackActionTypes.Push, (state) => stack.selectors.isTop(state, machine.state.id));",
      "  const buttonRef = useFloatingReference();",
      "  const buttonProps = useFloatingReferenceProps();",
      "  const itemsRef = useFloatingPanel();",
      "  const itemsProps = useFloatingPanelProps();",
      "  const portalOwnerDocument = itemsRef.current?.ownerDocument;",
      "  const transitionDataAttributes = { 'data-enter': true };",
      "  useOutsideClick(true, [buttonRef, itemsRef], () => { machine.send({ type: ActionTypes.CloseMenu }); machine.state.buttonElement?.focus(); });",
      "  useQuickRelease((event) => event.key === Keys.Space);",
      "  useHandleToggle(() => machine.send({ type: ActionTypes.OpenMenu, focus: Focus.First }));",
      "  useActivePress(buttonRef, () => machine.send({ type: ActionTypes.OpenMenu, focus: Focus.First, trigger: ActivationTrigger.Pointer }));",
      "  useOnDisappear(itemsRef, () => machine.send({ type: ActionTypes.CloseMenu }));",
      "  useScrollLock(machine.state.menuState === State.Open, portalOwnerDocument);",
      "  useInertOthers(machine.state.menuState === State.Open, { allowed: () => [buttonRef.current, itemsRef.current] });",
      "  useTreeWalker({ container: itemsRef.current, accept(node) { return node.getAttribute('role') === 'none'; } });",
      "  useDisposables().setTimeout(() => machine.send({ type: ActionTypes.ClearSearch }), 350);",
      "  const textValue = useTextValue(itemsRef);",
      "  const pointer = useTrackedPointer();",
      "  if (machine.selectors.didButtonMove(machine.state)) machine.send({ type: ActionTypes.MarkButtonAsMoved });",
      "  detectMovement(machine.state.buttonElement, machine.state.buttonPositionState, () => machine.send({ type: ActionTypes.MarkButtonAsMoved }));",
      "  machine.actions.registerItem('profile', { current: { disabled, get textValue() { return textValue(); } } });",
      "  machine.actions.unregisterItem('profile');",
      "  machine.send({ type: ActionTypes.RegisterItems, items: [] });",
      "  machine.send({ type: ActionTypes.UnregisterItems, items: [] });",
      "  machine.send({ type: ActionTypes.SortItems, sort: sortByDomNode });",
      "  machine.send({ type: ActionTypes.Search, value: 'p' });",
      "  itemsRef.current?.focus();",
      "  itemsRef.current?.scrollIntoView({ block: 'nearest' });",
      "  if (disabled) machine.send({ type: ActionTypes.GoToItem, focus: Focus.Nothing });",
      "  if (pointer.wasMoved({})) machine.send({ type: ActionTypes.GoToItem, focus: Focus.Specific, id: 'profile', trigger: ActivationTrigger.Pointer });",
      "  const onKeyDown = (event) => {",
      "    if (event.key === Keys.Space) event.preventDefault();",
      "    if (event.key === Keys.Enter) { machine.state.items[machine.state.activeItemIndex]?.dataRef.current.domRef.current?.click(); machine.send({ type: ActionTypes.CloseMenu }); restoreFocusIfNecessary(machine.state.buttonElement); }",
      "    if (event.key === Keys.ArrowDown) machine.send({ type: ActionTypes.GoToItem, focus: Focus.Next });",
      "    if (event.key === Keys.ArrowUp) machine.send({ type: ActionTypes.GoToItem, focus: Focus.Previous });",
      "    if (event.key === Keys.Home) machine.send({ type: ActionTypes.GoToItem, focus: Focus.First });",
      "    if (event.key === Keys.End) machine.send({ type: ActionTypes.GoToItem, focus: Focus.Last });",
      "    if (event.key === Keys.Escape) { machine.send({ type: ActionTypes.CloseMenu }); machine.state.buttonElement?.focus(); }",
      "    if (event.key === Keys.Tab) { machine.send({ type: ActionTypes.CloseMenu }); focusFrom(machine.state.itemsElement, event.shiftKey ? 'previous' : 'next'); }",
      "  };",
      "  return (",
      "    <FloatingProvider>",
      "      <OpenClosedProvider value={machine.state.menuState === State.Open ? State.Open : State.Closed}>",
      "        <Menu as=\"div\" onKeyDown={onKeyDown}>",
      "          <MenuButton {...buttonProps} aria-haspopup=\"menu\" aria-controls=\"account-menu\" aria-expanded={machine.state.menuState === State.Open}>Account</MenuButton>",
      "          <MenuItems {...itemsProps} id=\"account-menu\" anchor=\"bottom\" role=\"menu\" tabIndex={machine.state.menuState === State.Open ? 0 : undefined} aria-activedescendant={machine.selectors.activeDescendantId(machine.state)} {...transitionDataAttributes}>",
      "            <MenuItem role=\"menuitem\" aria-disabled={disabled ? true : undefined} data-focus=\"true\">Profile</MenuItem>",
      "          </MenuItems>",
      "        </Menu>",
      "      </OpenClosedProvider>",
      "    </FloatingProvider>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "menu-dropdown-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      implementationSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.implementationSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Headless UI Menu machine");
    expect(readySignals).toEqual(expect.arrayContaining(["menu-machine", "machine-context", "stack-machine", "top-layer", "outside-click-close", "button-refocus", "floating-provider", "open-closed-provider", "button-floating-reference", "button-keyboard-open", "quick-release", "handle-toggle", "pointer-open-trigger", "active-press", "items-floating-panel", "portal-owner-document", "scroll-lock", "inert-others", "typeahead-search", "register-items", "unregister-items", "sort-items", "scroll-into-view", "text-value", "pointer-tracking", "item-role-menuitem", "aria-disabled"]));
    const menuMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "menu-dropdown-readiness.md"), "utf8");
    expect(menuMarkdown).toContain("Implementation Signals");
    const menuHtml = await fs.readFile(path.join(result.session.outputPaths.html, "menu-dropdown-readiness.html"), "utf8");
    expect(menuHtml).toContain("Implementation Signals");
  });

  it("detects toast and snackbar readiness without displaying transient notifications", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-toast-snackbar-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-toast-snackbar-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "radix-toast.tsx"), [
      "import * as Toast from '@radix-ui/react-toast';",
      "import { useState } from 'react';",
      "export function RadixToastDemo() {",
      "  const [open, setOpen] = useState(false);",
      "  return (",
      "    <Toast.Provider duration={5000} swipeDirection=\"right\" swipeThreshold={32}>",
      "      <button onClick={() => setOpen(true)}>Show toast</button>",
      "      <Toast.Root open={open} defaultOpen={false} onOpenChange={setOpen} duration={8000} type=\"foreground\" onEscapeKeyDown={() => setOpen(false)} onSwipeStart={() => {}} onSwipeMove={() => {}} onSwipeCancel={() => {}} onSwipeEnd={() => setOpen(false)} data-state={open ? 'open' : 'closed'}>",
      "        <Toast.Title>Saved</Toast.Title>",
      "        <Toast.Description>Workspace preferences were saved.</Toast.Description>",
      "        <Toast.Action altText=\"Undo save\" onClick={() => setOpen(false)}>Undo</Toast.Action>",
      "        <Toast.Close aria-label=\"Close toast\">Dismiss</Toast.Close>",
      "      </Toast.Root>",
      "      <Toast.Viewport label=\"Notifications\" hotkey={['altKey', 'KeyT']} role=\"region\" aria-live=\"polite\" />",
      "    </Toast.Provider>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "sonner-hot-toast.tsx"), [
      "import { Toaster, toast } from 'sonner';",
      "import { Toaster as HotToaster, ToastBar, toast as hotToast } from 'react-hot-toast';",
      "export function ToastLibraries() {",
      "  const notify = () => {",
      "    toast.success('Saved', { id: 'saved', description: 'Profile saved', duration: 5000, position: 'top-right', action: { label: 'Undo', onClick: () => toast.dismiss('saved') }, closeButton: true, dismissible: true, richColors: true, classNames: { toast: 'toast', actionButton: 'action' } });",
      "    toast.error('Failed', { cancel: { label: 'Close', onClick: () => toast.dismiss() } });",
      "    toast.loading('Uploading', { unstyled: false });",
      "    toast.promise(Promise.resolve('ok'), { loading: 'Loading', success: 'Done', error: 'Failed' });",
      "    toast.custom((id) => <button role=\"status\" aria-live=\"polite\" onClick={() => toast.dismiss(id)}>Custom toast</button>);",
      "    hotToast.success('Hot saved', { duration: 4000, position: 'bottom-center', ariaProps: { role: 'status', 'aria-live': 'polite' } });",
      "    hotToast.error('Hot failed');",
      "    hotToast.loading('Hot loading');",
      "    hotToast.promise(Promise.resolve(), { loading: 'Loading', success: 'Done', error: 'Error' });",
      "    hotToast.dismiss();",
      "    hotToast.remove();",
      "  };",
      "  return (",
      "    <>",
      "      <button onClick={notify}>Notify</button>",
      "      <Toaster position=\"top-right\" richColors closeButton visibleToasts={3} duration={5000} expand pauseWhenPageIsHidden toastOptions={{ closeButton: true, unstyled: false, classNames: { toast: 'sonner-toast' }, actionButtonStyle: { color: 'blue' } }} />",
      "      <HotToaster position=\"bottom-center\" reverseOrder gutter={8} toastOptions={{ duration: 4000, success: { icon: '✓' }, error: { icon: '!' }, loading: { ariaProps: { role: 'status', 'aria-live': 'polite' } } }}>{(t) => <ToastBar toast={t} position={t.position || 'bottom-center'} style={{ opacity: t.pausedAt ? 0.8 : 1 }} />}</HotToaster>",
      "    </>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "notistack-snackbar.tsx"), [
      "import { SnackbarContent, SnackbarProvider, closeSnackbar, enqueueSnackbar } from 'notistack';",
      "export function NotistackDemo() {",
      "  const show = () => {",
      "    const key = enqueueSnackbar('Saved', { variant: 'success', persist: true, preventDuplicate: true, autoHideDuration: 6000, anchorOrigin: { vertical: 'top', horizontal: 'right' }, action: (snackbarId) => <button aria-label=\"Close snackbar\" onClick={() => closeSnackbar(snackbarId)}>Close</button>, content: (snackbarId, message) => <SnackbarContent role=\"status\" aria-live=\"polite\" aria-atomic=\"true\">{message}<button onClick={() => closeSnackbar(snackbarId)}>Undo</button></SnackbarContent> });",
      "    enqueueSnackbar('Warning', { variant: 'warning', TransitionComponent: undefined, hideIconVariant: false });",
      "    closeSnackbar(key);",
      "  };",
      "  return (",
      "    <SnackbarProvider maxSnack={3} preventDuplicate autoHideDuration={5000} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} variant=\"info\" persist={false} action={(key) => <button onClick={() => closeSnackbar(key)}>Dismiss</button>} Components={{ success: SnackbarContent }} iconVariant={{ success: <span>ok</span>, error: <span>err</span> }}>",
      "      <button onClick={show}>Show snackbar</button>",
      "    </SnackbarProvider>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "test", "toast-snackbar.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "import { RadixToastDemo } from '../src/radix-toast';",
      "describe('toast and snackbar behavior', () => {",
      "  it('keeps roles, timers, close actions, and interactions testable', async () => {",
      "    vi.useFakeTimers();",
      "    render(<RadixToastDemo />);",
      "    await userEvent.click(screen.getByRole('button', { name: /show toast/i }));",
      "    await userEvent.keyboard('{Escape}');",
      "    vi.advanceTimersByTime(5000);",
      "    expect(screen.getByRole('region', { name: /notifications/i })).toBeTruthy();",
      "    expect(screen.getByLabelText(/close toast/i)).toBeTruthy();",
      "    vi.useRealTimers();",
      "  });",
      "});"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "toast-snackbar.yml"), [
      "name: toast snackbar",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest run test/toast-snackbar.spec.tsx",
      "      - run: pnpm playwright test toast-snackbar.spec.tsx",
      "      - run: pnpm cypress run --spec test/toast-snackbar.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: toast-snackbar-traces",
      "          path: reports/toast-snackbar"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@mui/material": "latest",
        "@radix-ui/react-toast": "latest",
        "notistack": "latest",
        "react": "latest",
        "react-hot-toast": "latest",
        "sonner": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "@types/react": "latest",
        "cypress": "latest",
        "playwright": "latest",
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "toast-snackbar-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      toastSnackbarSetups: Array<{ filePath: string; framework: string; providerCount: number; viewportCount: number; toastCount: number; titleDescriptionCount: number; actionCount: number; closeCount: number; variantCount: number; lifecycleCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      variantSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      stylingSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Toast/snackbar readiness Radix Toast Sonner React Hot Toast Notistack Zag toast provider viewport lifecycle action close accessibility timer swipe queue live region machine store group API tests");
    expect(report.toastSnackbarSetups.some((item) => item.filePath === "src/radix-toast.tsx" && item.framework === "radix-toast" && item.providerCount > 0 && item.viewportCount > 0 && item.toastCount > 0 && item.titleDescriptionCount > 0 && item.actionCount > 0 && item.closeCount > 0 && item.lifecycleCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.toastSnackbarSetups.some((item) => item.filePath === "src/sonner-hot-toast.tsx" && item.framework === "sonner" && item.providerCount > 0 && item.toastCount > 0 && item.actionCount > 0 && item.closeCount > 0 && item.variantCount > 0 && item.lifecycleCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.toastSnackbarSetups.some((item) => item.filePath === "src/notistack-snackbar.tsx" && item.framework === "notistack" && item.providerCount > 0 && item.toastCount > 0 && item.actionCount > 0 && item.closeCount > 0 && item.variantCount > 0 && item.lifecycleCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-toast", "sonner", "react-hot-toast", "notistack", "mui-snackbar"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["provider", "toaster", "viewport", "root", "title", "description", "action", "close", "icon", "portal-container"]));
    expect(readySignals(report.variantSignals)).toEqual(expect.arrayContaining(["success", "error", "warning", "info", "loading", "promise", "custom", "rich-colors"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["open-state", "duration", "auto-dismiss", "dismiss", "remove", "pause-resume", "queue-limit", "prevent-duplicate", "persist"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["swipe", "keyboard-shortcut", "escape-key", "click-away", "action-button", "close-button", "hover-pause"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-status", "aria-live", "aria-atomic", "region-label", "alt-text", "close-label", "focus-visible"]));
    expect(readySignals(report.stylingSignals)).toEqual(expect.arrayContaining(["position", "offset", "transition", "swipe-direction", "theme", "unstyled", "class-names", "data-state"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "timer-test", "role-test", "interaction-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-toast", "sonner", "react-hot-toast", "notistack", "@mui/material", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-toast"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records toast/snackbar readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "toast-snackbar-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "toast-snackbar-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "toast-snackbar-readiness.html"))).resolves.toBeUndefined();
    const toastMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "toast-snackbar-readiness.md"), "utf8");
    expect(toastMarkdown).toContain("Toast Snackbar Readiness");
    expect(toastMarkdown).toContain("react-hot-toast");
    const toastHtml = await fs.readFile(path.join(result.session.outputPaths.html, "toast-snackbar-readiness.html"), "utf8");
    expect(toastHtml).toContain("toast-snackbar-readiness-card");
    expect(toastHtml).toContain("data-source-pattern=\"ToastSnackbar\"");
    expect(toastHtml).toContain("RepoTutor records toast/snackbar readiness only");
  });

  it("detects Zag toast implementation details without displaying transient notifications", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-toast-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-toast-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "zag-toast-internals.ts"), [
      "import { createMachine, setup } from '@zag-js/core';",
      "import { addDomEvent, AnimationFrame, dataAttr, raf } from '@zag-js/dom-query';",
      "import { trackDismissableBranch } from '@zag-js/dismissable';",
      "import { createToastStore, groupConnect, groupMachine, machine } from '@zag-js/toast';",
      "import { getGhostAfterStyle, getGhostBeforeStyle, getGroupPlacementStyle, getPlacementStyle, getToastDuration } from '@zag-js/toast';",
      "import { ensureProps, runIfFn, setRafTimeout, uuid, warn } from '@zag-js/utils';",
      "import type { NormalizeProps, PropTypes } from '@zag-js/types';",
      "const toast = createMachine({",
      "  initialState: () => 'visible',",
      "  states: { 'visible:updating': {}, 'visible:persist': {}, visible: {}, dismissing: {}, unmounted: {} },",
      "  computed: { zIndex: () => 1, height: () => 48, heightIndex: () => 0, frontmost: () => true, heightBefore: () => 0, shouldPersist: () => true },",
      "  effects: ['waitForDuration', 'waitForRemoveDelay', 'waitForNextTick', 'trackHeight'],",
      "  actions: ['setMounted', 'measureHeight', 'setCloseTimer', 'resetCloseTimer', 'syncRemainingTime', 'notifyParentToRemove', 'invokeOnDismiss', 'invokeOnUnmount', 'invokeOnVisible']",
      "});",
      "const machineProof = machine; const groupMachineProof = groupMachine; const setupProof = setup;",
      "const timers = [setRafTimeout(() => send({ type: 'DISMISS', src: 'timer' }), getToastDuration(5000, 'success')), setRafTimeout(() => send({ type: 'REMOVE', src: 'timer' }), removeDelay), setRafTimeout(() => send({ type: 'SHOW', src: 'timer' }), 0)];",
      "raf(() => { const rootEl = dom.getRootEl(scope); const observer = new MutationObserver(syncHeight); observer.observe(rootEl, { childList: true, subtree: true, characterData: true }); });",
      "queueMicrotask(() => { const rootEl = dom.getRootEl(scope); context.set('initialHeight', rootEl.getBoundingClientRect().height); });",
      "prop('onStatusChange')?.({ status: 'visible' }); prop('onStatusChange')?.({ status: 'dismissing', src: event.src }); prop('onStatusChange')?.({ status: 'unmounted' });",
      "const store = createToastStore({ placement: 'bottom', overlap: false, max: 24, gap: 16, offsets: '1rem', hotkey: ['altKey', 'KeyT'], removeDelay: 200, pauseOnPageIdle: true });",
      "const priorities = { error: [1, 2], warning: [3, 6], loading: [4, 5], success: [5, 7], info: [6, 8] };",
      "const sorted = sortToastsByPriority(toastQueue); const id = `toast:${uuid()}`; const dismissedToasts = new Set<string>(); const visibleToasts = store.getVisibleToasts();",
      "store.create({ title: 'Saved', type: 'success', action: { label: 'Undo' } }); store.update(id, { type: 'info' }); store.remove(id); store.dismiss(id); store.pause(id); store.resume(id); store.expand(); store.collapse();",
      "const promiseToast = store.promise(Promise.resolve(new Response()), { loading: { title: 'Loading' }, success: (response) => ({ title: 'Done' }), error: (error) => ({ title: 'Failed' }), finally: () => undefined }); promiseToast?.unwrap(); warn('[zag-js > toast] toaster.promise() requires at least a loading option'); runIfFn(() => Promise.resolve());",
      "const group = groupMachine; const groupService = { context, prop, send, refs, computed };",
      "subscribeToStore({ context, prop }); trackHotKeyPress({ prop, send }); trackDocumentVisibility({ prop, send, scope });",
      "trackDismissableBranch(() => dom.getRegionEl(scope, placement), { defer: true }); addDomEvent(document, 'keydown', handleKeyDown, { capture: true }); addDomEvent(scope.getDoc(), 'visibilitychange', handleVisibility);",
      "send({ type: 'DOC.HOTKEY' }); send({ type: 'REGION.POINTER_ENTER', placement }); send({ type: 'REGION.POINTER_LEAVE', placement }); send({ type: 'REGION.FOCUS', target: event.relatedTarget }); send({ type: 'REGION.BLUR' }); send({ type: 'REGION.OVERLAP' }); send({ type: 'REGION.STACK' });",
      "refs.get('ignoreMouseTimer').request(); refs.get('ignoreMouseTimer').cancel(); refs.set('lastFocusedEl', event.target); refs.get('lastFocusedEl')?.focus({ preventScroll: true });",
      "const api = connect(service, normalize); const groupApi = groupConnect(groupService, normalize);",
      "api.getRootProps(); api.getGhostBeforeProps(); api.getGhostAfterProps(); api.getTitleProps(); api.getDescriptionProps(); api.getActionTriggerProps(); api.getCloseTriggerProps();",
      "groupApi.getGroupProps({ label: 'Notifications' }); groupApi.subscribe((toasts) => toasts);",
      "normalize.element({ role: 'status', 'aria-atomic': 'true', 'aria-describedby': dom.getDescriptionId(scope), 'aria-labelledby': dom.getTitleId(scope), tabIndex: 0, 'data-state': visible ? 'open' : 'closed', 'data-type': type, 'data-placement': placement, 'data-mounted': dataAttr(mounted), 'data-paused': dataAttr(paused), 'data-first': dataAttr(frontmost), 'data-sibling': dataAttr(!frontmost), 'data-stack': dataAttr(stacked), 'data-overlap': dataAttr(!stacked), style: getPlacementStyle(service, visible), onKeyDown(event) { if (event.key == 'Escape') send({ type: 'DISMISS', src: 'keyboard' }); } });",
      "normalize.element({ role: 'region', 'aria-label': 'Notifications, bottom (alt+T)', 'aria-live': 'polite', 'aria-relevant': 'additions text', 'aria-atomic': 'false', style: getGroupPlacementStyle(service, placement), onMouseEnter() {}, onMouseMove() {}, onMouseLeave() {}, onFocus() {}, onBlur() {} });",
      "getGhostBeforeStyle(service, visible); getGhostAfterStyle();",
      "function sortToastsByPriority(toastQueue) { return toastQueue.sort((a, b) => a.priority - b.priority); }"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/core": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/toast": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "toast-snackbar-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      toastSnackbarSetups: Array<{ filePath: string; framework: string; lifecycleCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      storeSignals: Array<{ signal: string; readiness: string }>;
      groupSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Toast/snackbar readiness Radix Toast Sonner React Hot Toast Notistack Zag toast provider viewport lifecycle action close accessibility timer swipe queue live region machine store group API tests");
    expect(report.toastSnackbarSetups.some((item) => item.filePath === "src/zag-toast-internals.ts" && item.framework === "zag-toast" && item.lifecycleCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-toast"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining([
      "toast-machine",
      "group-machine",
      "visible-state",
      "visible-persist-state",
      "visible-updating-state",
      "dismissing-state",
      "unmounted-state",
      "computed-z-index",
      "computed-height",
      "computed-frontmost",
      "computed-should-persist",
      "wait-for-duration",
      "wait-for-remove-delay",
      "wait-for-next-tick",
      "track-height",
      "mutation-observer",
      "queue-microtask-measure",
      "status-change-callback"
    ]));
    expect(readySignals(report.storeSignals)).toEqual(expect.arrayContaining([
      "create-toast-store",
      "priority-sorting",
      "queue-max",
      "toast-create-update",
      "dismissed-set",
      "visible-toasts",
      "promise-unwrap",
      "http-response-error",
      "pause-resume-messages",
      "expand-collapse"
    ]));
    expect(readySignals(report.groupSignals)).toEqual(expect.arrayContaining([
      "subscribe-to-store",
      "document-visibility",
      "hotkey-focus-region",
      "dismissable-branch",
      "stack-overlap-states",
      "pointer-enter-leave",
      "focus-blur-region",
      "ignore-mouse-timer",
      "restore-last-focus",
      "region-live-props"
    ]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining([
      "root-props",
      "ghost-before-after",
      "title-description-props",
      "action-trigger",
      "close-trigger",
      "placement-style",
      "toast-data-attrs",
      "keyboard-dismiss",
      "group-props",
      "group-subscribe"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/toast", "@zag-js/core", "@zag-js/dom-query", "@zag-js/dismissable", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "toast-snackbar-readiness.md"), "utf8");
    expect(markdown).toContain("Machine Signals");
    expect(markdown).toContain("Store Signals");
    expect(markdown).toContain("Group Signals");
    expect(markdown).toContain("API Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "toast-snackbar-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("Store Signals");
    expect(html).toContain("Group Signals");
    expect(html).toContain("API Signals");
  });

  it("detects tabs accordion and disclosure readiness without switching UI state", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tabs-accordion-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tabs-accordion-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "radix-tabs-accordion.tsx"), [
      "import * as Accordion from '@radix-ui/react-accordion';",
      "import * as Collapsible from '@radix-ui/react-collapsible';",
      "import * as Tabs from '@radix-ui/react-tabs';",
      "import { useState } from 'react';",
      "export function RadixTabsAccordionDemo() {",
      "  const [tab, setTab] = useState('overview');",
      "  const [open, setOpen] = useState(false);",
      "  return (",
      "    <section>",
      "      <Tabs.Root value={tab} defaultValue=\"overview\" onValueChange={setTab} orientation=\"vertical\" dir=\"rtl\" activationMode=\"manual\" data-orientation=\"vertical\">",
      "        <Tabs.List aria-label=\"Project sections\">",
      "          <Tabs.Trigger value=\"overview\" data-state={tab === 'overview' ? 'active' : 'inactive'}>Overview</Tabs.Trigger>",
      "          <Tabs.Trigger value=\"details\" disabled aria-disabled=\"true\">Details</Tabs.Trigger>",
      "        </Tabs.List>",
      "        <Tabs.Content value=\"overview\" forceMount role=\"tabpanel\" aria-labelledby=\"overview-tab\">Overview panel</Tabs.Content>",
      "        <Tabs.Content value=\"details\" role=\"tabpanel\">Details panel</Tabs.Content>",
      "      </Tabs.Root>",
      "      <Accordion.Root type=\"multiple\" defaultValue={['a']} value={['a']} onValueChange={() => {}} orientation=\"horizontal\" collapsible>",
      "        <Accordion.Item value=\"a\" data-state=\"open\">",
      "          <Accordion.Header>",
      "            <Accordion.Trigger aria-controls=\"panel-a\" aria-expanded=\"true\">Section A</Accordion.Trigger>",
      "          </Accordion.Header>",
      "          <Accordion.Content id=\"panel-a\" forceMount>Panel A</Accordion.Content>",
      "        </Accordion.Item>",
      "      </Accordion.Root>",
      "      <Collapsible.Root open={open} defaultOpen={false} onOpenChange={setOpen} data-state={open ? 'open' : 'closed'}>",
      "        <Collapsible.Trigger aria-controls=\"advanced-panel\" aria-expanded={open}>Advanced</Collapsible.Trigger>",
      "        <Collapsible.Content id=\"advanced-panel\" forceMount>Advanced content</Collapsible.Content>",
      "      </Collapsible.Root>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "headless-tabs-disclosure.tsx"), [
      "import { Disclosure, DisclosureButton, DisclosurePanel, Tab } from '@headlessui/react';",
      "import { useState } from 'react';",
      "export function HeadlessTabsDisclosureDemo() {",
      "  const [selectedIndex, setSelectedIndex] = useState(0);",
      "  return (",
      "    <Tab.Group selectedIndex={selectedIndex} defaultIndex={0} onChange={setSelectedIndex} manual vertical>",
      "      <Tab.List aria-label=\"Headless tabs\">",
      "        <Tab>{({ selected }) => <button aria-selected={selected}>Summary</button>}</Tab>",
      "        <Tab disabled>Disabled</Tab>",
      "      </Tab.List>",
      "      <Tab.Panels>",
      "        <Tab.Panel data-headlessui-state=\"selected\">Summary panel</Tab.Panel>",
      "        <Tab.Panel>Disabled panel</Tab.Panel>",
      "      </Tab.Panels>",
      "      <Disclosure defaultOpen>",
      "        {({ open }) => (",
      "          <>",
      "            <Disclosure.Button aria-expanded={open}>Legacy disclosure</Disclosure.Button>",
      "            <Disclosure.Panel static>Legacy panel</Disclosure.Panel>",
      "            <DisclosureButton aria-controls=\"headless-panel\">Modern disclosure</DisclosureButton>",
      "            <DisclosurePanel id=\"headless-panel\" transition data-open={open}>Modern panel</DisclosurePanel>",
      "          </>",
      "        )}",
      "      </Disclosure>",
      "    </Tab.Group>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "ariakit-tabs-disclosure.tsx"), [
      "import * as Ariakit from '@ariakit/react';",
      "import { useState } from 'react';",
      "export function AriakitTabsDisclosureDemo() {",
      "  const [selectedId, setSelectedId] = useState('overview');",
      "  const [open, setOpen] = useState(false);",
      "  return (",
      "    <Ariakit.TabProvider selectedId={selectedId} defaultSelectedId=\"overview\" setSelectedId={setSelectedId} orientation=\"horizontal\">",
      "      <Ariakit.TabList aria-label=\"Ariakit tabs\">",
      "        <Ariakit.Tab id=\"overview\" aria-controls=\"overview-panel\">Overview</Ariakit.Tab>",
      "        <Ariakit.Tab id=\"settings\" disabled accessibleWhenDisabled>Settings</Ariakit.Tab>",
      "      </Ariakit.TabList>",
      "      <Ariakit.TabPanel tabId=\"overview\" id=\"overview-panel\" unmountOnHide scrollRestoration>Overview panel</Ariakit.TabPanel>",
      "      <Ariakit.TabPanel tabId=\"settings\">Settings panel</Ariakit.TabPanel>",
      "      <Ariakit.DisclosureProvider open={open} defaultOpen setOpen={setOpen}>",
      "        <Ariakit.Disclosure aria-controls=\"ariakit-disclosure\" aria-expanded={open}>Toggle</Ariakit.Disclosure>",
      "        <Ariakit.DisclosureContent id=\"ariakit-disclosure\" unmountOnHide alwaysVisible data-open={open}>Content</Ariakit.DisclosureContent>",
      "      </Ariakit.DisclosureProvider>",
      "    </Ariakit.TabProvider>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "test", "tabs-accordion.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { RadixTabsAccordionDemo } from '../src/radix-tabs-accordion';",
      "describe('tabs accordion disclosure behavior', () => {",
      "  it('keeps roles keyboard navigation and ARIA attributes testable', async () => {",
      "    render(<RadixTabsAccordionDemo />);",
      "    expect(screen.getByRole('tablist', { name: /project sections/i })).toBeTruthy();",
      "    await userEvent.keyboard('{ArrowDown}{Home}{End}{Tab}');",
      "    await userEvent.click(screen.getByRole('button', { name: /advanced/i }));",
      "    expect(screen.getByRole('tabpanel', { name: /overview/i })).toBeTruthy();",
      "    expect(screen.getByRole('button', { name: /section a/i })).toHaveAttribute('aria-expanded', 'true');",
      "  });",
      "});"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "tabs-accordion.yml"), [
      "name: tabs accordion",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest run test/tabs-accordion.spec.tsx",
      "      - run: pnpm playwright test tabs-accordion.spec.tsx",
      "      - run: pnpm cypress run --spec test/tabs-accordion.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: tabs-accordion-traces",
      "          path: reports/tabs-accordion"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@ariakit/react": "latest",
        "@headlessui/react": "latest",
        "@radix-ui/react-accordion": "latest",
        "@radix-ui/react-collapsible": "latest",
        "@radix-ui/react-tabs": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "@types/react": "latest",
        "cypress": "latest",
        "playwright": "latest",
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tabs-accordion-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      tabsAccordionSetups: Array<{ filePath: string; framework: string; rootCount: number; listCount: number; triggerCount: number; contentCount: number; itemCount: number; panelCount: number; stateCount: number; keyboardCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      orientationSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Tabs/accordion readiness Radix Tabs Accordion Collapsible Headless UI Tab Disclosure internals Ariakit Tab Disclosure Zag Accordion machine DOM API keyboard orientation controlled state accessibility tests");
    expect(report.tabsAccordionSetups.some((item) => item.filePath === "src/radix-tabs-accordion.tsx" && item.framework === "radix" && item.rootCount > 0 && item.listCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.panelCount > 0 && item.stateCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.tabsAccordionSetups.some((item) => item.filePath === "src/headless-tabs-disclosure.tsx" && item.framework === "headless-ui" && item.rootCount > 0 && item.listCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.panelCount > 0 && item.stateCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.tabsAccordionSetups.some((item) => item.filePath === "src/ariakit-tabs-disclosure.tsx" && item.framework === "ariakit" && item.rootCount > 0 && item.listCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.panelCount > 0 && item.stateCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-tabs", "radix-accordion", "radix-collapsible", "headless-tabs", "headless-disclosure", "ariakit-tabs", "ariakit-disclosure"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "list", "trigger", "content", "item", "header", "panel", "provider", "disclosure-button", "disclosure-panel"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["controlled-value", "default-value", "selected-index", "selected-id", "open-state", "default-open", "on-change", "data-state", "force-mount", "unmount-on-hide"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["keyboard-navigation", "arrow-keys", "home-end", "tab-key", "click", "manual-activation", "automatic-activation", "roving-focus", "disabled-item"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-tablist", "role-tab", "role-tabpanel", "aria-selected", "aria-controls", "aria-expanded", "aria-orientation", "aria-label", "focus-management"]));
    expect(readySignals(report.orientationSignals)).toEqual(expect.arrayContaining(["horizontal", "vertical", "activation-mode", "dir", "rtl", "collapsible", "multiple"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "user-event", "role-test", "keyboard-test", "attribute-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-tabs", "@radix-ui/react-accordion", "@radix-ui/react-collapsible", "@headlessui/react", "@ariakit/react", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-tabs"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records tabs/accordion/disclosure readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "tabs-accordion-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "tabs-accordion-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "tabs-accordion-readiness.html"))).resolves.toBeUndefined();
    const tabsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tabs-accordion-readiness.md"), "utf8");
    expect(tabsMarkdown).toContain("Tabs Accordion Readiness");
    expect(tabsMarkdown).toContain("@headlessui/react");
    const tabsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "tabs-accordion-readiness.html"), "utf8");
    expect(tabsHtml).toContain("tabs-accordion-readiness-card");
    expect(tabsHtml).toContain("data-source-pattern=\"TabsAccordion\"");
    expect(tabsHtml).toContain("RepoTutor records tabs/accordion/disclosure readiness only");
  });

  it("detects Zag accordion readiness without expanding panels", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-accordion-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-accordion-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "zag-accordion.tsx"), [
      "import * as accordion from '@zag-js/accordion';",
      "import { anatomy } from '@zag-js/anatomy';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "import { createMachine } from '@zag-js/core';",
      "import { dataAttr, isSafari } from '@zag-js/dom-query';",
      "import type { PropTypes } from '@zag-js/types';",
      "import { getEventKey } from '@zag-js/utils';",
      "import { useId } from 'react';",
      "export function ZagAccordionReadiness() {",
      "  const service = useMachine(accordion.machine({",
      "    id: useId(),",
      "    defaultValue: ['overview'],",
      "    value: ['overview'],",
      "    multiple: true,",
      "    collapsible: true,",
      "    orientation: 'vertical',",
      "    onValueChange(details) { console.log(details.value); },",
      "    onFocusChange(details) { console.log(details.focusedValue); }",
      "  }));",
      "  const api = accordion.connect(service, normalizeProps);",
      "  const rootProps = api.getRootProps();",
      "  const itemState = api.getItemState({ value: 'overview' });",
      "  const itemProps = api.getItemProps({ value: 'overview' });",
      "  const contentProps = api.getItemContentProps({ value: 'overview' });",
      "  const indicatorProps = api.getItemIndicatorProps({ value: 'overview' });",
      "  const triggerProps = api.getItemTriggerProps({ value: 'overview' });",
      "  api.setValue(['overview']);",
      "  return <div {...rootProps} data-orientation=\"vertical\" data-zag-root=\"accordion\">",
      "    <div {...itemProps} data-state={itemState.expanded ? 'open' : 'closed'} data-focus={dataAttr(itemState.focused)} data-disabled={dataAttr(itemState.disabled)} data-orientation=\"vertical\">",
      "      <button {...triggerProps} data-ownedby=\"accordion:item\" data-controls=\"accordion:content\" aria-controls=\"accordion:content\" aria-expanded={itemState.expanded} onFocus={triggerProps.onFocus} onBlur={triggerProps.onBlur} onClick={triggerProps.onClick} onKeyDown={triggerProps.onKeyDown}>Overview</button>",
      "      <span {...indicatorProps} aria-hidden=\"true\" />",
      "      <section {...contentProps} role=\"region\" aria-labelledby=\"accordion:trigger\" hidden={!itemState.expanded}>Overview panel</section>",
      "    </div>",
      "  </div>;",
      "}",
      "export const zagAccordionMachineEvidence = {",
      "  createMachine,",
      "  initial: 'idle',",
      "  states: { idle: { on: { 'VALUE.SET': 'setValue', 'TRIGGER.FOCUS': 'setFocusedValue', 'TRIGGER.CLICK': ['expand', 'collapse'], 'TRIGGER.BLUR': 'clearFocusedValue', 'GOTO.NEXT': 'focusNextTrigger', 'GOTO.PREV': 'focusPrevTrigger', 'GOTO.FIRST': 'focusFirstTrigger', 'GOTO.LAST': 'focusLastTrigger' } } },",
      "  guards: ['canToggle', 'isExpanded'],",
      "  actions: ['collapse', 'expand', 'focusFirstTrigger', 'focusLastTrigger', 'focusNextTrigger', 'focusPrevTrigger', 'setFocusedValue', 'clearFocusedValue'],",
      "  context: ['focusedValue', 'value'],",
      "  computed: ['isHorizontal']",
      "};",
      "export const zagAccordionDomEvidence = {",
      "  getRootId: 'accordion:root',",
      "  getItemId: 'accordion:item:overview',",
      "  getItemContentId: 'accordion:content:overview',",
      "  getItemTriggerId: 'accordion:trigger:overview',",
      "  getRootEl: '[data-scope=accordion][data-part=root]',",
      "  getTriggerEls: '[data-part=item-trigger]',",
      "  getFirstTriggerEl: 'first trigger',",
      "  getLastTriggerEl: 'last trigger',",
      "  getNextTriggerEl: 'next trigger',",
      "  getPrevTriggerEl: 'previous trigger'",
      "};",
      "export const zagAccordionApiEvidence = {",
      "  focusedValue: 'overview',",
      "  value: ['overview'],",
      "  setValue: apiSetValue => apiSetValue(['overview']),",
      "  getItemState: 'item state api',",
      "  getRootProps: 'root props api',",
      "  getItemProps: 'item props api',",
      "  getItemContentProps: 'item content props api',",
      "  getItemIndicatorProps: 'item indicator props api',",
      "  getItemTriggerProps: 'item trigger props api',",
      "  role: 'region',",
      "  ariaLabelledby: 'aria-labelledby',",
      "  ariaHidden: 'aria-hidden',",
      "  ariaControls: 'aria-controls',",
      "  ariaExpanded: 'aria-expanded',",
      "  dataControls: 'data-controls',",
      "  dataOwnedby: 'data-ownedby',",
      "  hiddenContent: 'hidden',",
      "  onFocus: 'TRIGGER.FOCUS',",
      "  onBlur: 'TRIGGER.BLUR',",
      "  onClick: 'TRIGGER.CLICK',",
      "  onKeyDown: getEventKey({ key: 'Home' }, { orientation: 'vertical' }),",
      "  arrowKeyMap: ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'],",
      "  homeEndKeyMap: ['Home', 'End'],",
      "  safariFocusFix: isSafari()",
      "};"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/accordion": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      },
      devDependencies: {
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tabs-accordion-readiness-report.json"), "utf8")) as {
      tabsAccordionSetups: Array<{ filePath: string; framework: string; rootCount: number; triggerCount: number; contentCount: number; itemCount: number; stateCount: number; keyboardCount: number; accessibilityCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.tabsAccordionSetups.some((item) => item.filePath === "src/zag-accordion.tsx" && item.framework === "zag-accordion" && item.rootCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.stateCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-accordion"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "focused-state", "value-set-event", "trigger-focus-event", "trigger-click-event", "goto-next-prev", "goto-first-last", "trigger-blur-event", "can-toggle-guard", "is-expanded-guard", "collapse-action", "expand-action", "focus-trigger-actions", "focused-value", "bindable-value", "computed-horizontal"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "item-id", "item-content-id", "item-trigger-id", "root-el", "trigger-elements", "first-last-trigger", "next-prev-trigger", "data-ownedby", "data-controls", "data-state", "data-focus", "data-disabled", "data-orientation"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["focused-value-api", "value-api", "set-value-api", "item-state-api", "root-props", "item-props", "item-content-props", "item-indicator-props", "item-trigger-props", "region-role", "aria-labelledby", "aria-hidden", "aria-controls", "aria-expanded", "data-controls", "data-ownedby", "hidden-content", "trigger-focus-handler", "trigger-blur-handler", "trigger-click-handler", "trigger-keydown-handler", "arrow-key-map", "home-end-key-map", "safari-focus-fix"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/accordion", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const tabsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tabs-accordion-readiness.md"), "utf8");
    expect(tabsMarkdown).toContain("Machine Signals");
    expect(tabsMarkdown).toContain("DOM Signals");
    expect(tabsMarkdown).toContain("API Signals");
    expect(tabsMarkdown).toContain("@zag-js/accordion");
    const tabsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "tabs-accordion-readiness.html"), "utf8");
    expect(tabsHtml).toContain("Machine Signals");
    expect(tabsHtml).toContain("DOM Signals");
    expect(tabsHtml).toContain("API Signals");
    expect(tabsHtml).toContain("@zag-js/accordion");
  });

  it("detects Headless UI tabs and disclosure implementation details without switching UI state", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-tabs-disclosure-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-tabs-disclosure-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headless-tabs-disclosure-internals.tsx"), [
      "import { Disclosure, DisclosureButton, DisclosurePanel, Tab } from '@headlessui/react';",
      "import { createContext, useReducer, useRef, useState } from 'react';",
      "import { useFocusRing } from '@react-aria/focus';",
      "import { useHover } from '@react-aria/interactions';",
      "import { useActivePress } from '../../hooks/use-active-press';",
      "import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect';",
      "import { useLatestValue } from '../../hooks/use-latest-value';",
      "import { useResolveButtonType } from '../../hooks/use-resolve-button-type';",
      "import { useSyncRefs } from '../../hooks/use-sync-refs';",
      "import { FocusSentinel } from '../../internal/focus-sentinel';",
      "import { Hidden } from '../../internal/hidden';",
      "import { CloseProvider } from '../../internal/close-provider';",
      "import { OpenClosedProvider, ResetOpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed';",
      "import { transitionDataAttributes, useTransition } from '../../hooks/use-transition';",
      "import { Focus, FocusResult, focusIn, sortByDomNode } from '../../utils/focus-management';",
      "import { microTask } from '../../utils/micro-task';",
      "import { getOwnerDocument } from '../../utils/owner';",
      "import { startTransition } from '../../utils/start-transition';",
      "import { StableCollection, useStableCollectionIndex } from '../../utils/stable-collection';",
      "import { Keys } from '../keyboard';",
      "enum DisclosureStates { Open, Closed }",
      "enum ActionTypes { SetSelectedIndex, RegisterTab, UnregisterTab, RegisterPanel, UnregisterPanel, ToggleDisclosure, CloseDisclosure, SetButtonId, SetPanelId, SetButtonElement, SetPanelElement }",
      "const TabsDataContext = createContext(null);",
      "const TabsActionsContext = createContext(null);",
      "const DisclosureContext = createContext(null);",
      "const DisclosureAPIContext = createContext(null);",
      "const DisclosurePanelContext = createContext(null);",
      "function headlessTabsDisclosureInternals() {",
      "  const info = useLatestValue({ isControlled: true });",
      "  const [state, dispatch] = useReducer((current, action) => current, { info, selectedIndex: 0, tabs: [], panels: [], disclosureState: DisclosureStates.Open });",
      "  const [tabElement, setTabElement] = useState(null);",
      "  const internalTabRef = useRef(null);",
      "  const internalPanelRef = useRef(null);",
      "  const internalDisclosureRef = useRef(null);",
      "  const tabRef = useSyncRefs(internalTabRef, setTabElement);",
      "  const sortedTabs = sortByDomNode(state.tabs, (tab) => tab.current);",
      "  const sortedPanels = sortByDomNode(state.panels, (panel) => panel.current);",
      "  const myTabIndex = useStableCollectionIndex('tabs');",
      "  const myPanelIndex = useStableCollectionIndex('panels');",
      "  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.RegisterTab, tab: internalTabRef }), [internalTabRef]);",
      "  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.RegisterPanel, panel: internalPanelRef }), [internalPanelRef]);",
      "  const orientation = 'vertical';",
      "  const activation = 'manual';",
      "  const autoActivation = 'auto';",
      "  const activateUsing = (cb) => cb() === FocusResult.Success && autoActivation === 'auto';",
      "  const keyMap = [Keys.Home, Keys.PageUp, Keys.End, Keys.PageDown, Keys.ArrowUp, Keys.ArrowDown, Keys.ArrowLeft, Keys.ArrowRight, Keys.Space, Keys.Enter];",
      "  const focusResult = focusIn(sortedTabs, Focus.First | Focus.Last | Focus.Previous | Focus.Next | Focus.WrapAround);",
      "  const handleMouseDown = (event) => event.preventDefault();",
      "  const ready = useRef(false);",
      "  const handleSelection = () => { if (ready.current) return; ready.current = true; internalTabRef.current?.focus({ preventScroll: true }); microTask(() => { ready.current = false; }); };",
      "  const hiddenPanel = <Hidden aria-hidden=\"true\" ref={internalPanelRef} id=\"headlessui-tabs-panel-1\" role=\"tabpanel\" aria-labelledby=\"headlessui-tabs-tab-1\" tabIndex={-1} />;",
      "  const tabProps = { ref: tabRef, id: 'headlessui-tabs-tab-1', role: 'tab', type: useResolveButtonType({}, tabElement), 'aria-controls': 'headlessui-tabs-panel-1', 'aria-selected': true, tabIndex: 0, onKeyDown: keyMap, onMouseDown: handleMouseDown, onClick: handleSelection };",
      "  const panelProps = { ref: internalPanelRef, id: 'headlessui-tabs-panel-1', role: 'tabpanel', 'aria-labelledby': 'headlessui-tabs-tab-1', tabIndex: myPanelIndex === 0 ? 0 : -1 };",
      "  const focusSentinel = <FocusSentinel onFocus={() => internalTabRef.current?.focus()} />;",
      "  const stableCollection = <StableCollection>{focusSentinel}{hiddenPanel}</StableCollection>;",
      "  const close = (focusableElement) => { dispatch({ type: ActionTypes.CloseDisclosure }); const ownerDocument = getOwnerDocument(internalDisclosureRef.current); const restoreElement = focusableElement ?? ownerDocument?.getElementById('headlessui-disclosure-button-1'); restoreElement?.focus(); };",
      "  const usesOpenClosedState = useOpenClosed();",
      "  const [visible, transitionData] = useTransition(true, internalPanelRef.current, usesOpenClosedState !== null ? (usesOpenClosedState & State.Open) === State.Open : state.disclosureState === DisclosureStates.Open);",
      "  startTransition(() => dispatch({ type: ActionTypes.SetPanelElement, element: internalPanelRef.current }));",
      "  const disclosureButtonProps = { id: 'headlessui-disclosure-button-1', type: useResolveButtonType({}, null), 'aria-expanded': true, 'aria-controls': 'headlessui-disclosure-panel-1', disabled: undefined, onKeyDown: [Keys.Space, Keys.Enter], onKeyUp: Keys.Space, onClick: ActionTypes.ToggleDisclosure };",
      "  const disclosurePanelProps = { id: 'headlessui-disclosure-panel-1', ...transitionDataAttributes(transitionData) };",
      "  const withinPanel = DisclosurePanelContext !== null && state.panelId === 'headlessui-disclosure-panel-1';",
      "  const focusRing = useFocusRing({ autoFocus: true });",
      "  const hover = useHover({ isDisabled: false });",
      "  const activePress = useActivePress({ disabled: false });",
      "  const providers = <DisclosureContext.Provider value={[state, dispatch]}><DisclosureAPIContext.Provider value={{ close }}><CloseProvider value={close}><OpenClosedProvider value={State.Open}><ResetOpenClosedProvider>{stableCollection}</ResetOpenClosedProvider></OpenClosedProvider></CloseProvider></DisclosureAPIContext.Provider></DisclosureContext.Provider>;",
      "  return { providers, tabProps, panelProps, disclosureButtonProps, disclosurePanelProps, focusResult, activateUsing, sortedPanels, orientation, activation, myTabIndex, withinPanel, focusRing, hover, activePress, Disclosure, DisclosureButton, DisclosurePanel, Tab };",
      "}",
      "export const objectAssignEvidence = { Tab: Object.assign(Tab, { Group: Tab.Group, List: Tab.List, Panels: Tab.Panels, Panel: Tab.Panel }), Disclosure: Object.assign(Disclosure, { Button: DisclosureButton, Panel: DisclosurePanel }) };"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "@react-aria/focus": "latest",
        "@react-aria/interactions": "latest",
        "react": "latest"
      },
      devDependencies: {
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tabs-accordion-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      tabsAccordionSetups: Array<{ filePath: string; framework: string; rootCount: number; listCount: number; triggerCount: number; contentCount: number; panelCount: number; stateCount: number; keyboardCount: number; accessibilityCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      implementationSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Tabs/accordion readiness Radix Tabs Accordion Collapsible Headless UI Tab Disclosure internals Ariakit Tab Disclosure Zag Accordion machine DOM API keyboard orientation controlled state accessibility tests");
    expect(report.tabsAccordionSetups.some((item) => item.filePath === "src/headless-tabs-disclosure-internals.tsx" && item.framework === "headless-ui" && item.rootCount > 0 && item.listCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.panelCount > 0 && item.stateCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["headless-tabs", "headless-disclosure"]));
    expect(readySignals(report.implementationSignals)).toEqual(expect.arrayContaining([
      "tabs-data-context",
      "tabs-actions-context",
      "tabs-controlled-info",
      "tabs-register-tab",
      "tabs-register-panel",
      "tabs-dom-sort",
      "tabs-focus-sentinel",
      "tabs-stable-collection",
      "tabs-stable-index",
      "tabs-iso-effect",
      "tabs-latest-value",
      "tabs-auto-activation",
      "tabs-manual-activation",
      "tabs-keyboard-map",
      "tabs-focus-in",
      "tabs-mousedown-prevent-default",
      "tabs-click-selection",
      "tabs-microtask-ready",
      "tabs-hidden-panel",
      "tabs-object-assign",
      "disclosure-context",
      "disclosure-api-context",
      "disclosure-panel-context",
      "disclosure-reducer",
      "disclosure-default-open",
      "disclosure-close-refocus",
      "disclosure-open-closed-provider",
      "disclosure-close-provider",
      "disclosure-button-id",
      "disclosure-panel-id",
      "disclosure-within-panel",
      "disclosure-space-enter-toggle",
      "disclosure-keyup-prevent-default",
      "disclosure-disabled-guard",
      "disclosure-button-type",
      "disclosure-focus-ring",
      "disclosure-hover-state",
      "disclosure-active-press",
      "disclosure-transition",
      "disclosure-reset-open-closed",
      "disclosure-start-transition",
      "disclosure-object-assign"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@headlessui/react", "react"]));
    const tabsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tabs-accordion-readiness.md"), "utf8");
    expect(tabsMarkdown).toContain("Implementation Signals");
    expect(tabsMarkdown).toContain("tabs-data-context");
    expect(tabsMarkdown).toContain("disclosure-close-refocus");
    const tabsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "tabs-accordion-readiness.html"), "utf8");
    expect(tabsHtml).toContain("Implementation Signals");
    expect(tabsHtml).toContain("tabs-data-context");
    expect(tabsHtml).toContain("disclosure-close-refocus");
  });

  it("detects checkbox radio and switch readiness without toggling controls", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-checkbox-radio-switch-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-checkbox-radio-switch-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "radix-checkbox-radio-switch.tsx"), [
      "import * as Checkbox from '@radix-ui/react-checkbox';",
      "import * as RadioGroup from '@radix-ui/react-radio-group';",
      "import * as Switch from '@radix-ui/react-switch';",
      "import { useState } from 'react';",
      "export function RadixSelectionControls() {",
      "  const [checked, setChecked] = useState<boolean | 'indeterminate'>('indeterminate');",
      "  const [radio, setRadio] = useState('email');",
      "  const [enabled, setEnabled] = useState(false);",
      "  return (",
      "    <form id=\"preferences\">",
      "      <Checkbox.Root name=\"terms\" form=\"preferences\" required checked={checked} defaultChecked=\"indeterminate\" onCheckedChange={setChecked} disabled={false} aria-label=\"Accept terms\" data-state={checked === true ? 'checked' : 'indeterminate'}>",
      "        <Checkbox.Indicator forceMount>check</Checkbox.Indicator>",
      "      </Checkbox.Root>",
      "      <RadioGroup.Root name=\"contact\" form=\"preferences\" value={radio} defaultValue=\"email\" onValueChange={setRadio} orientation=\"horizontal\" rovingFocus disabled={false} required>",
      "        <RadioGroup.Item value=\"email\" aria-label=\"Email\" data-state={radio === 'email' ? 'checked' : 'unchecked'}>",
      "          <RadioGroup.Indicator forceMount />",
      "        </RadioGroup.Item>",
      "        <RadioGroup.Item value=\"sms\" aria-label=\"SMS\" disabled>",
      "          <RadioGroup.Indicator />",
      "        </RadioGroup.Item>",
      "      </RadioGroup.Root>",
      "      <Switch.Root name=\"alerts\" form=\"preferences\" checked={enabled} defaultChecked={false} onCheckedChange={setEnabled} required aria-label=\"Enable alerts\" data-state={enabled ? 'checked' : 'unchecked'}>",
      "        <Switch.Thumb />",
      "      </Switch.Root>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "headless-checkbox-radio-switch.tsx"), [
      "import { Checkbox, Description, Field, Label, RadioGroup, Switch } from '@headlessui/react';",
      "import { useState } from 'react';",
      "export function HeadlessSelectionControls() {",
      "  const [checked, setChecked] = useState(false);",
      "  const [radio, setRadio] = useState('weekly');",
      "  const [enabled, setEnabled] = useState(true);",
      "  return (",
      "    <Field disabled={false}>",
      "      <Label id=\"newsletter-label\">Newsletter</Label>",
      "      <Description id=\"newsletter-description\">Choose communication preferences</Description>",
      "      <Checkbox name=\"newsletter\" form=\"preferences\" checked={checked} defaultChecked={false} indeterminate={false} onChange={setChecked} aria-labelledby=\"newsletter-label\" aria-describedby=\"newsletter-description\" data-headlessui-state={checked ? 'checked' : 'unchecked'} />",
      "      <RadioGroup value={radio} defaultValue=\"weekly\" onChange={setRadio} disabled={false} aria-label=\"Frequency\">",
      "        <RadioGroup.Label>Frequency</RadioGroup.Label>",
      "        <RadioGroup.Option value=\"weekly\" disabled={false}>Weekly</RadioGroup.Option>",
      "        <RadioGroup.Option value=\"daily\" disabled>Daily</RadioGroup.Option>",
      "      </RadioGroup>",
      "      <Switch.Group>",
      "        <Switch.Label>Enable alerts</Switch.Label>",
      "        <Switch checked={enabled} defaultChecked onChange={setEnabled} name=\"alerts\" form=\"preferences\" aria-label=\"Enable alerts\" />",
      "        <Switch.Description>Uses role switch with aria-checked.</Switch.Description>",
      "      </Switch.Group>",
      "    </Field>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "src", "ariakit-checkbox-radio.tsx"), [
      "import * as Ariakit from '@ariakit/react';",
      "export function AriakitSelectionControls() {",
      "  const checkbox = Ariakit.useCheckboxStore({ defaultValue: ['email'] });",
      "  return (",
      "    <Ariakit.CheckboxProvider defaultValue={['email']} setValue={() => {}}>",
      "      <Ariakit.Checkbox store={checkbox} name=\"channels\" value=\"email\" aria-label=\"Email channel\" render={<button />} />",
      "      <Ariakit.CheckboxCheck store={checkbox} checked />",
      "      <Ariakit.RadioProvider defaultValue=\"email\" setValue={() => {}}>",
      "        <Ariakit.RadioGroup aria-label=\"Contact method\">",
      "          <Ariakit.Radio value=\"email\" aria-label=\"Email\" />",
      "          <Ariakit.Radio value=\"sms\" disabled aria-label=\"SMS\" />",
      "        </Ariakit.RadioGroup>",
      "      </Ariakit.RadioProvider>",
      "      <Ariakit.MenuButton aria-label=\"Filter channels\">Filter</Ariakit.MenuButton>",
      "      <Ariakit.Menu>",
      "        <Ariakit.MenuItemCheckbox name=\"channels\" value=\"email\" checked>Menu email</Ariakit.MenuItemCheckbox>",
      "        <Ariakit.MenuItemRadio name=\"channel\" value=\"sms\" defaultChecked>Menu sms</Ariakit.MenuItemRadio>",
      "      </Ariakit.Menu>",
      "    </Ariakit.CheckboxProvider>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "test", "checkbox-radio-switch.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { RadixSelectionControls } from '../src/radix-checkbox-radio-switch';",
      "describe('checkbox radio switch behavior', () => {",
      "  it('keeps roles keyboard toggles and attributes testable', async () => {",
      "    render(<RadixSelectionControls />);",
      "    expect(screen.getByRole('checkbox', { name: /accept terms/i })).toHaveAttribute('aria-checked', 'mixed');",
      "    expect(screen.getByRole('radio', { name: /email/i })).toHaveAttribute('aria-checked', 'true');",
      "    expect(screen.getByRole('switch', { name: /enable alerts/i })).toHaveAttribute('aria-checked', 'false');",
      "    await userEvent.keyboard('{Space}{ArrowRight}{ArrowLeft}{Tab}');",
      "    await userEvent.click(screen.getByRole('switch', { name: /enable alerts/i }));",
      "  });",
      "});"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "checkbox-radio-switch.yml"), [
      "name: checkbox radio switch",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest run test/checkbox-radio-switch.spec.tsx",
      "      - run: pnpm playwright test checkbox-radio-switch.spec.tsx",
      "      - run: pnpm cypress run --spec test/checkbox-radio-switch.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: checkbox-radio-switch-traces",
      "          path: reports/checkbox-radio-switch"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@ariakit/react": "latest",
        "@headlessui/react": "latest",
        "@radix-ui/react-checkbox": "latest",
        "@radix-ui/react-radio-group": "latest",
        "@radix-ui/react-switch": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "@types/react": "latest",
        "cypress": "latest",
        "playwright": "latest",
        "typescript": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "checkbox-radio-switch-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      checkboxRadioSwitchSetups: Array<{ filePath: string; framework: string; checkboxCount: number; radioCount: number; switchCount: number; providerCount: number; itemCount: number; indicatorCount: number; stateCount: number; formCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      controlSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Checkbox/radio/switch readiness Radix Checkbox RadioGroup Switch Headless UI Checkbox RadioGroup Switch controllable comparator option registration form fields labels keyboard focus Ariakit Checkbox Radio checked defaultChecked indeterminate aria-checked form tests");
    expect(report.checkboxRadioSwitchSetups.some((item) => item.filePath === "src/radix-checkbox-radio-switch.tsx" && item.framework === "radix" && item.checkboxCount > 0 && item.radioCount > 0 && item.switchCount > 0 && item.itemCount > 0 && item.indicatorCount > 0 && item.stateCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.checkboxRadioSwitchSetups.some((item) => item.filePath === "src/headless-checkbox-radio-switch.tsx" && item.framework === "headless-ui" && item.checkboxCount > 0 && item.radioCount > 0 && item.switchCount > 0 && item.providerCount > 0 && item.stateCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.checkboxRadioSwitchSetups.some((item) => item.filePath === "src/ariakit-checkbox-radio.tsx" && item.framework === "ariakit" && item.checkboxCount > 0 && item.radioCount > 0 && item.providerCount > 0 && item.itemCount > 0 && item.stateCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-checkbox", "radix-radio-group", "radix-switch", "headless-checkbox", "headless-radio-group", "headless-switch", "ariakit-checkbox", "ariakit-radio"]));
    expect(readySignals(report.controlSignals)).toEqual(expect.arrayContaining(["checkbox", "radio-group", "switch", "menu-checkbox", "menu-radio"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "provider", "group", "item", "indicator", "thumb", "label", "description", "hidden-input"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["checked", "default-checked", "on-checked-change", "on-change", "value", "default-value", "set-value", "indeterminate", "data-state"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["name", "form", "required", "disabled", "hidden-input", "field", "value"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["click", "keyboard", "space-key", "arrow-keys", "roving-focus", "focus", "disabled-control"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-checkbox", "role-radio", "role-switch", "aria-checked", "aria-label", "aria-labelledby", "aria-describedby", "focus-management"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "playwright", "cypress", "testing-library", "user-event", "role-test", "keyboard-test", "attribute-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-checkbox", "@radix-ui/react-radio-group", "@radix-ui/react-switch", "@headlessui/react", "@ariakit/react", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-checkbox"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records checkbox/radio/switch readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "checkbox-radio-switch-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "checkbox-radio-switch-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "checkbox-radio-switch-readiness.html"))).resolves.toBeUndefined();
    const controlsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "checkbox-radio-switch-readiness.md"), "utf8");
    expect(controlsMarkdown).toContain("Checkbox Radio Switch Readiness");
    expect(controlsMarkdown).toContain("@headlessui/react");
    const controlsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "checkbox-radio-switch-readiness.html"), "utf8");
    expect(controlsHtml).toContain("checkbox-radio-switch-readiness-card");
    expect(controlsHtml).toContain("data-source-pattern=\"CheckboxRadioSwitch\"");
    expect(controlsHtml).toContain("RepoTutor records checkbox/radio/switch readiness only");
  });

  it("detects Headless UI switch implementation details without toggling controls", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-switch-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-switch-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headlessui-switch-internals.tsx"), [
      "import { Switch, SwitchGroup, SwitchLabel, SwitchDescription } from '@headlessui/react';",
      "import { useControllable, useDefaultValue, useDisposables, useEvent, useId, useResolveButtonType, useSlot, useSyncRefs, useDisabled, useProvidedId, FormFields, useFocusRing, useHover, useActivePress, useLabelledBy, useDescribedBy, useLabels, useDescriptions, attemptSubmit, isDisabledReactIssue7711, Keys } from './headless-internals';",
      "const GroupContext = createContext(null);",
      "export function HeadlessSwitchInternals({ checked: controlledChecked, defaultChecked: _defaultChecked = false, onChange: controlledOnChange, name = 'notifications', value = 'on', form = 'settings', autoFocus = true, disabled = false }) {",
      "  const internalId = useId();",
      "  const providedId = useProvidedId();",
      "  const providedDisabled = useDisabled();",
      "  const id = providedId || `headlessui-switch-${internalId}`;",
      "  const [switchElement, setSwitchElement] = useState(null);",
      "  const [labelledby, LabelProvider] = useLabels();",
      "  const [describedby, DescriptionProvider] = useDescriptions();",
      "  const groupContext = useMemo(() => ({ switch: switchElement, setSwitch: setSwitchElement }), [switchElement]);",
      "  const switchRef = useSyncRefs(setSwitchElement, groupContext.setSwitch);",
      "  const defaultChecked = useDefaultValue(_defaultChecked);",
      "  const [checked, onChange] = useControllable(controlledChecked, controlledOnChange, defaultChecked ?? false);",
      "  const d = useDisposables();",
      "  const [changing, setChanging] = useState(false);",
      "  const toggle = useEvent(() => { setChanging(true); onChange?.(!checked); d.nextFrame(() => setChanging(false)); });",
      "  const handleClick = useEvent((event) => { if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault(); event.preventDefault(); toggle(); });",
      "  const handleKeyUp = useEvent((event) => { if (event.key === Keys.Space) { event.preventDefault(); toggle(); } else if (event.key === Keys.Enter) { attemptSubmit(event.currentTarget); } });",
      "  const handleKeyPress = useEvent((event) => event.preventDefault());",
      "  const labelledBy = useLabelledBy();",
      "  const describedBy = useDescribedBy();",
      "  const { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus });",
      "  const { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled || providedDisabled });",
      "  const { pressed: active, pressProps } = useActivePress({ disabled });",
      "  const slot = useSlot({ checked, disabled, hover, focus, active, autofocus: autoFocus, changing });",
      "  const type = useResolveButtonType({}, switchElement);",
      "  const reset = useCallback(() => { if (defaultChecked === undefined) return; return onChange?.(defaultChecked); }, [onChange, defaultChecked]);",
      "  return (",
      "    <DescriptionProvider name=\"Switch.Description\" value={describedby}>",
      "      <LabelProvider name=\"Switch.Label\" value={labelledby} props={{ htmlFor: groupContext.switch?.id, onClick(event) { event.preventDefault(); switchElement?.click(); switchElement?.focus({ preventScroll: true }); } }}>",
      "        <GroupContext.Provider value={groupContext}>",
      "          <SwitchGroup>",
      "            <SwitchLabel>Notifications</SwitchLabel>",
      "            <SwitchDescription>Receive product updates</SwitchDescription>",
      "            {name != null && <FormFields disabled={disabled} data={{ [name]: value || 'on' }} overrides={{ type: 'checkbox', checked }} form={form} onReset={reset} />}",
      "            <Switch ref={switchRef} id={id} role=\"switch\" type={type} tabIndex={0} aria-checked={checked} aria-labelledby={labelledBy} aria-describedby={describedBy} disabled={disabled || undefined} autoFocus={autoFocus} onClick={handleClick} onKeyUp={handleKeyUp} onKeyPress={handleKeyPress} data-changing={changing} data-focus={focus} data-hover={hover} data-active={active}>Enabled</Switch>",
      "          </SwitchGroup>",
      "        </GroupContext.Provider>",
      "      </LabelProvider>",
      "    </DescriptionProvider>",
      "  );",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "checkbox-radio-switch-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      implementationSignals: Array<{ signal: string; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Headless UI Checkbox RadioGroup Switch controllable");
    expect(readySignals(report.frameworkSignals)).toContain("headless-switch");
    expect(readySignals(report.implementationSignals)).toEqual(expect.arrayContaining(["group-context", "label-provider", "description-provider", "label-click-focus", "provided-id", "provided-disabled", "controllable-value", "default-value-hook", "sync-refs", "group-set-switch", "disposables-next-frame", "changing-state", "toggle-onchange", "disabled-react-issue", "click-prevent-default", "space-toggle", "enter-attempt-submit", "keypress-prevent-default", "labelled-by", "described-by", "focus-ring", "hover-state", "active-press", "slot-state", "role-switch", "aria-checked", "aria-labelledby", "aria-describedby", "resolve-button-type", "tab-index-normalize", "form-fields", "hidden-checkbox-override", "form-reset"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "checkbox-radio-switch-readiness.md"), "utf8");
    expect(markdown).toContain("## Implementation Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "checkbox-radio-switch-readiness.html"), "utf8");
    expect(html).toContain("Implementation Signals");
  });

  it("detects Headless UI checkbox and radio group implementation details without toggling controls", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-checkbox-radio-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-checkbox-radio-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headless-checkbox-radio-internals.tsx"), [
      "import { Checkbox, Radio, RadioGroup, RadioGroupDescription, RadioGroupLabel, RadioGroupOption } from '@headlessui/react';",
      "import { createContext, useCallback, useMemo, useReducer, useRef } from 'react';",
      "import { useByComparator, useControllable, useDefaultValue, useDisposables, useEvent, useFocusRing, useHover, useId, useIsoMorphicEffect, useLatestValue, useSlot, useSyncRefs, useDisabled, useProvidedId, FormFields, useLabelledBy, useDescribedBy, useLabels, useDescriptions, attemptSubmit, isActiveElement, isDisabledReactIssue7711, Focus, FocusResult, focusIn, sortByDomNode, Keys } from './headless-internals';",
      "enum ActionTypes { RegisterOption, UnregisterOption }",
      "const RadioGroupDataContext = createContext(null);",
      "const RadioGroupActionsContext = createContext(null);",
      "const reducers = { [ActionTypes.RegisterOption](state, action) { return { ...state, options: sortByDomNode([...state.options, { id: action.id, element: action.element, propsRef: action.propsRef }], (option) => option.element.current) }; }, [ActionTypes.UnregisterOption](state, action) { return { ...state, options: state.options.filter((radio) => radio.id !== action.id) }; } };",
      "export function HeadlessCheckboxRadioInternals({ checked: controlledChecked, defaultChecked: _defaultChecked = false, value: controlledValue, defaultValue: _defaultValue = 'email', onChange: controlledOnChange, name = 'preferences', form = 'settings' }) {",
      "  const internalId = useId();",
      "  const providedId = useProvidedId();",
      "  const providedDisabled = useDisabled();",
      "  const checkboxId = providedId || `headlessui-checkbox-${internalId}`;",
      "  const radioGroupId = `headlessui-radiogroup-${internalId}`;",
      "  const radioId = providedId || `headlessui-radio-${internalId}`;",
      "  const [labelledby, LabelProvider] = useLabels();",
      "  const [describedby, DescriptionProvider] = useDescriptions();",
      "  const labelledBy = useLabelledBy();",
      "  const describedBy = useDescribedBy();",
      "  const checkboxDefaultChecked = useDefaultValue(_defaultChecked);",
      "  const [checked, setChecked] = useControllable(controlledChecked, controlledOnChange, checkboxDefaultChecked ?? false);",
      "  const d = useDisposables();",
      "  const toggle = useEvent(() => { setChecked?.(!checked); d.nextFrame(() => {}); });",
      "  const checkboxClick = useEvent((event) => { if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault(); event.preventDefault(); toggle(); });",
      "  const checkboxKeyUp = useEvent((event) => { if (event.key === Keys.Space) { event.preventDefault(); toggle(); } else if (event.key === Keys.Enter) { attemptSubmit(event.currentTarget); } });",
      "  const checkboxSlot = useSlot({ checked, disabled: providedDisabled, hover: false, focus: false, active: false, indeterminate: true, changing: false, autofocus: true });",
      "  const resetCheckbox = useCallback(() => { if (checkboxDefaultChecked === undefined) return; return setChecked?.(checkboxDefaultChecked); }, [setChecked, checkboxDefaultChecked]);",
      "  const checkboxProps = { id: checkboxId, role: 'checkbox', 'aria-checked': true ? 'mixed' : checked ? 'true' : 'false', 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, 'aria-disabled': providedDisabled ? true : undefined, indeterminate: 'true', tabIndex: 0, onClick: checkboxClick, onKeyUp: checkboxKeyUp };",
      "  const compare = useByComparator((a, z) => a.id === z.id);",
      "  const [state, dispatch] = useReducer((current, action) => reducers[action.type](current, action), { options: [] });",
      "  const options = state.options;",
      "  const defaultValue = useDefaultValue(_defaultValue);",
      "  const [value, setValue] = useControllable(controlledValue, controlledOnChange, defaultValue);",
      "  const firstOption = useMemo(() => options.find((option) => option.propsRef.current.disabled === false), [options]);",
      "  const containsCheckedOption = useMemo(() => options.some((option) => compare(option.propsRef.current.value, value)), [options, value]);",
      "  const triggerChange = useEvent((nextValue) => { if (providedDisabled) return false; if (compare(nextValue, value)) return false; const nextOption = options.find((option) => compare(option.propsRef.current.value, nextValue))?.propsRef.current; if (nextOption?.disabled) return false; setValue?.(nextValue); return true; });",
      "  const internalRadioGroupRef = useRef(null);",
      "  const radioGroupRef = useSyncRefs(internalRadioGroupRef);",
      "  const internalRadioRef = useRef(null);",
      "  const radioRef = useSyncRefs(internalRadioRef);",
      "  const propsRef = useLatestValue({ value, disabled: false });",
      "  const registerOption = useEvent((option) => { dispatch({ type: ActionTypes.RegisterOption, ...option }); return () => dispatch({ type: ActionTypes.UnregisterOption, id: option.id }); });",
      "  useIsoMorphicEffect(() => registerOption({ id: radioId, element: internalRadioRef, propsRef }), [radioId, internalRadioRef, propsRef]);",
      "  const handleKeyDown = useEvent((event) => { const all = options.filter((option) => option.propsRef.current.disabled === false).map((radio) => radio.element.current); switch (event.key) { case Keys.Enter: attemptSubmit(event.currentTarget); break; case Keys.ArrowLeft: case Keys.ArrowUp: event.preventDefault(); event.stopPropagation(); if (focusIn(all, Focus.Previous | Focus.WrapAround) === FocusResult.Success) { const activeOption = options.find((option) => isActiveElement(option.element.current)); if (activeOption) triggerChange(activeOption.propsRef.current.value); } break; case Keys.ArrowRight: case Keys.ArrowDown: event.preventDefault(); event.stopPropagation(); if (focusIn(all, Focus.Next | Focus.WrapAround) === FocusResult.Success) { const activeOption = options.find((option) => isActiveElement(option.element.current)); if (activeOption) triggerChange(activeOption.propsRef.current.value); } break; case Keys.Space: event.preventDefault(); event.stopPropagation(); { const activeOption = options.find((option) => isActiveElement(option.element.current)); if (activeOption) triggerChange(activeOption.propsRef.current.value); } break; } });",
      "  const radioGroupData = useMemo(() => ({ value, firstOption, containsCheckedOption, disabled: providedDisabled, compare, tabIndex: 0, ...state }), [value, firstOption, containsCheckedOption, providedDisabled, compare, state]);",
      "  const radioGroupActions = useMemo(() => ({ registerOption, change: triggerChange }), [registerOption, triggerChange]);",
      "  const { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: true });",
      "  const { isHovered: hover, hoverProps } = useHover({ isDisabled: false });",
      "  const radioClick = useEvent((event) => { if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault(); if (!triggerChange(value)) return; internalRadioRef.current?.focus(); });",
      "  const isFirstOption = radioGroupData.firstOption?.id === radioId;",
      "  const checkedRadio = radioGroupData.compare(radioGroupData.value, value);",
      "  const radioProps = { ref: radioRef, id: radioId, role: 'radio', 'aria-checked': checkedRadio ? 'true' : 'false', 'aria-labelledby': labelledby, 'aria-describedby': describedby, 'aria-disabled': providedDisabled ? true : undefined, tabIndex: (() => { if (providedDisabled) return -1; if (checkedRadio) return radioGroupData.tabIndex; if (!radioGroupData.containsCheckedOption && isFirstOption) return radioGroupData.tabIndex; return -1; })(), onClick: radioClick };",
      "  const radioSlot = useSlot({ checked: checkedRadio, disabled: providedDisabled, hover, focus, autofocus: true });",
      "  const resetRadio = useCallback(() => { if (defaultValue === undefined) return; return triggerChange(defaultValue); }, [triggerChange, defaultValue]);",
      "  return (",
      "    <DescriptionProvider name=\"RadioGroup.Description\">",
      "      <LabelProvider name=\"RadioGroup.Label\">",
      "        <RadioGroupActionsContext.Provider value={radioGroupActions}>",
      "          <RadioGroupDataContext.Provider value={radioGroupData}>",
      "            <FormFields disabled={providedDisabled} data={{ [name]: value || 'on' }} overrides={{ type: 'radio', checked: value != null }} form={form} onReset={resetRadio} />",
      "            <FormFields disabled={providedDisabled} data={{ [name]: 'on' }} overrides={{ type: 'checkbox', checked }} form={form} onReset={resetCheckbox} />",
      "            <div ref={radioGroupRef} id={radioGroupId} role=\"radiogroup\" aria-labelledby={labelledby} aria-describedby={describedby} onKeyDown={handleKeyDown}>",
      "              <Checkbox {...checkboxProps}>{checkboxSlot.checked}</Checkbox>",
      "              <RadioGroup value={value} onChange={setValue} by={compare} name={name} form={form}><Radio {...radioProps}>{radioSlot.checked}</Radio><RadioGroupOption value=\"email\" /><RadioGroupLabel>Email</RadioGroupLabel><RadioGroupDescription>Primary</RadioGroupDescription></RadioGroup>",
      "            </div>",
      "          </RadioGroupDataContext.Provider>",
      "        </RadioGroupActionsContext.Provider>",
      "      </LabelProvider>",
      "    </DescriptionProvider>",
      "  );",
      "}",
      "export const radioObjectAssignEvidence = Object.assign(RadioGroup, { Option: RadioGroupOption, Radio, Label: RadioGroupLabel, Description: RadioGroupDescription });"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "checkbox-radio-switch-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      implementationSignals: Array<{ signal: string; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Checkbox/radio/switch readiness Radix Checkbox RadioGroup Switch Headless UI Checkbox RadioGroup Switch controllable comparator option registration form fields labels keyboard focus Ariakit Checkbox Radio checked defaultChecked indeterminate aria-checked form tests");
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["headless-checkbox", "headless-radio-group"]));
    expect(readySignals(report.implementationSignals)).toEqual(expect.arrayContaining([
      "checkbox-indeterminate",
      "checkbox-mixed-aria",
      "checkbox-form-value-on",
      "radio-data-context",
      "radio-actions-context",
      "radio-register-option",
      "radio-unregister-option",
      "radio-comparator",
      "radio-first-option",
      "radio-contains-checked-option",
      "radio-trigger-change",
      "radio-keydown-arrow-focus",
      "radio-enter-submit",
      "radio-space-change",
      "radio-group-role",
      "radio-hidden-field-override",
      "radio-option-tab-index",
      "radio-option-focus-after-change",
      "radio-label-description-providers",
      "radio-object-assign-subcomponents"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "checkbox-radio-switch-readiness.md"), "utf8");
    expect(markdown).toContain("checkbox-indeterminate");
    expect(markdown).toContain("radio-register-option");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "checkbox-radio-switch-readiness.html"), "utf8");
    expect(html).toContain("checkbox-indeterminate");
    expect(html).toContain("radio-register-option");
  });

  it("detects slider and progress readiness without changing values", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-slider-progress-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-slider-progress-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "radix-slider-progress.tsx"), [
      "import * as React from 'react';",
      "import * as Slider from '@radix-ui/react-slider';",
      "import * as Progress from '@radix-ui/react-progress';",
      "export function RadixSliderProgressControls() {",
      "  const [value, setValue] = React.useState([25, 75]);",
      "  const uploadValue = value[0];",
      "  return (",
      "    <form id=\"settings\">",
      "      <Slider.Root name=\"volume\" form=\"settings\" value={value} defaultValue={[25, 75]} min={0} max={100} step={5} minStepsBetweenThumbs={2} orientation=\"horizontal\" dir=\"ltr\" inverted={false} disabled={false} onValueChange={setValue} onValueCommit={() => {}} aria-label=\"Volume range\">",
      "        <Slider.Track data-orientation=\"horizontal\">",
      "          <Slider.Range />",
      "          <Slider.Thumb aria-label=\"Minimum volume\" />",
      "          <Slider.Thumb aria-label=\"Maximum volume\" />",
      "        </Slider.Track>",
      "      </Slider.Root>",
      "      <Slider.Root name=\"brightness\" form=\"settings\" defaultValue={[50]} min={0} max={100} step={10} orientation=\"vertical\" inverted aria-label=\"Brightness\">",
      "        <Slider.Track data-orientation=\"vertical\">",
      "          <Slider.Range />",
      "          <Slider.Thumb aria-label=\"Brightness\" />",
      "        </Slider.Track>",
      "      </Slider.Root>",
      "      <Progress.Root value={uploadValue} max={100} getValueLabel={(current, max) => `${current} of ${max}`} aria-label=\"Upload progress\">",
      "        <Progress.Indicator data-state={uploadValue === 100 ? 'complete' : 'loading'} data-value={uploadValue} data-max={100} />",
      "      </Progress.Root>",
      "      <Progress.Root value={null} max={100} aria-valuetext=\"Loading progress\">",
      "        <Progress.Indicator data-state=\"indeterminate\" />",
      "      </Progress.Root>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-range-progress.tsx"), [
      "export function NativeRangeProgress() {",
      "  return (",
      "    <div>",
      "      <input type=\"range\" min={0} max={10} step={1} defaultValue={5} name=\"score\" form=\"settings\" aria-label=\"Score\" onChange={() => {}} disabled={false} />",
      "      <progress max={10} value={5} aria-label=\"Native progress\">5</progress>",
      "      <div role=\"slider\" aria-valuenow={5} aria-valuemin={0} aria-valuemax={10} aria-orientation=\"horizontal\" tabIndex={0} data-state=\"ready\" />",
      "      <div role=\"progressbar\" aria-valuenow={5} aria-valuemin={0} aria-valuemax={10} aria-valuetext=\"half done\" />",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "slider-progress.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativeRangeProgress } from '../src/native-range-progress';",
      "describe('slider progress behavior', () => {",
      "  it('keeps value roles keyboard and attributes testable', async () => {",
      "    render(<NativeRangeProgress />);",
      "    expect(screen.getByRole('slider', { name: /score/i })).toHaveAttribute('min', '0');",
      "    expect(screen.getByRole('progressbar', { name: /native progress/i })).toHaveAttribute('value', '5');",
      "    await userEvent.keyboard('{Home}{End}{ArrowRight}{ArrowLeft}{PageUp}{PageDown}');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "slider-progress.yml"), [
      "name: slider progress",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- slider-progress",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: slider-progress-traces",
      "          path: test-results/slider-progress"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@radix-ui/react-slider": "latest",
        "@radix-ui/react-progress": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "slider-progress-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      sliderProgressSetups: Array<{ filePath: string; framework: string; sliderCount: number; progressCount: number; trackCount: number; rangeCount: number; thumbCount: number; indicatorCount: number; valueCount: number; keyboardCount: number; orientationCount: number; formCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      orientationSignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Slider/progress readiness Radix Slider Progress Zag progress native input range progressbar value min max step orientation aria-valuenow form tests");
    expect(report.sliderProgressSetups.some((item) => item.filePath === "src/radix-slider-progress.tsx" && item.framework === "radix-slider" && item.sliderCount > 0 && item.progressCount > 0 && item.trackCount > 0 && item.rangeCount > 0 && item.thumbCount > 0 && item.indicatorCount > 0 && item.valueCount > 0 && item.orientationCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.sliderProgressSetups.some((item) => item.filePath === "src/native-range-progress.tsx" && item.framework === "native" && item.sliderCount > 0 && item.progressCount > 0 && item.valueCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-slider", "radix-progress", "native-range", "native-progress"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "track", "range", "thumb", "indicator", "provider", "bubble-input"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "min", "max", "step", "percentage", "indeterminate", "data-state", "data-value"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pointer", "keyboard", "home-end", "arrow-keys", "page-keys", "disabled"]));
    expect(readySignals(report.orientationSignals)).toEqual(expect.arrayContaining(["horizontal", "vertical", "inverted", "rtl-dir"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["name", "form", "bubble-input", "input-range", "value"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-slider", "role-progressbar", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-orientation", "aria-label"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-slider", "@radix-ui/react-progress", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-slider"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records slider/progress readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "slider-progress-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "slider-progress-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "slider-progress-readiness.html"))).resolves.toBeUndefined();
    const sliderMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "slider-progress-readiness.md"), "utf8");
    expect(sliderMarkdown).toContain("Slider Progress Readiness");
    expect(sliderMarkdown).toContain("@radix-ui/react-slider");
    const sliderHtml = await fs.readFile(path.join(result.session.outputPaths.html, "slider-progress-readiness.html"), "utf8");
    expect(sliderHtml).toContain("slider-progress-readiness-card");
    expect(sliderHtml).toContain("data-source-pattern=\"SliderProgress\"");
    expect(sliderHtml).toContain("RepoTutor records slider/progress readiness only");
  });

  it("detects Zag progress readiness without changing values", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-progress-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-progress-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-progress.tsx"), [
      "import * as progress from '@zag-js/progress';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "const progressApiSurfaceEvidence = 'value valueAsString min max percent percentAsString indeterminate setValue setToMax setToMin getRootProps getLabelProps getValueTextProps getTrackProps getRangeProps getViewProps getCircleProps getCircleTrackProps getCircleRangeProps role: \"progressbar\" data-max data-value data-state data-orientation aria-valuemin aria-valuemax aria-valuenow aria-label aria-live --percent --radius --circumference strokeDasharray strokeDashoffset hidden: props.state';",
      "void progressApiSurfaceEvidence;",
      "export function ZagProgressStatus() {",
      "  const service = useMachine(progress.machine, {",
      "    id: 'upload-progress',",
      "    value: 40,",
      "    defaultValue: 50,",
      "    min: 0,",
      "    max: 100,",
      "    orientation: 'vertical',",
      "    locale: 'en-US',",
      "    formatOptions: { style: 'percent' },",
      "    translations: { value: ({ value, percent, formatter }) => value === null ? 'loading...' : formatter.format(percent / 100) },",
      "    onValueChange(details) { void details.value; }",
      "  });",
      "  const api = progress.connect(service, normalizeProps);",
      "  return (",
      "    <section {...api.getRootProps()}>",
      "      <span {...api.getLabelProps()}>Upload</span>",
      "      <div {...api.getTrackProps()}><div {...api.getRangeProps()} /></div>",
      "      <svg {...api.getCircleProps()}>",
      "        <circle {...api.getCircleTrackProps()} />",
      "        <circle {...api.getCircleRangeProps()} />",
      "      </svg>",
      "      <output {...api.getValueTextProps()}>{api.valueAsString}</output>",
      "      <span {...api.getViewProps({ state: 'loading' })}>Loading</span>",
      "      <span {...api.getViewProps({ state: 'complete' })}>Complete</span>",
      "      <button type=\"button\" onClick={() => api.setToMin()}>Minimum</button>",
      "      <button type=\"button\" onClick={() => api.setValue(null)}>Indeterminate</button>",
      "      <button type=\"button\" onClick={() => api.setToMax()}>Complete</button>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "zag-progress.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import { describe, expect, it } from 'vitest';",
      "import { ZagProgressStatus } from '../src/zag-progress';",
      "describe('zag progress static contract', () => {",
      "  it('renders progress landmarks for assertions', () => {",
      "    render(<ZagProgressStatus />);",
      "    expect(screen.getByText('Upload')).toBeTruthy();",
      "    expect(screen.getByText('Loading')).toBeTruthy();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/progress": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "slider-progress-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      sliderProgressSetups: Array<{ filePath: string; framework: string; progressCount: number; trackCount: number; rangeCount: number; indicatorCount: number; valueCount: number; orientationCount: number; accessibilityCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      circleSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sliderProgressSetups.some((item) => item.filePath === "src/zag-progress.tsx" && item.framework === "zag-progress" && item.progressCount > 0 && item.trackCount > 0 && item.rangeCount > 0 && item.indicatorCount > 0 && item.valueCount > 0 && item.orientationCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-progress"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "track", "range", "label", "value-text", "view", "circle", "circle-track", "circle-range"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "min", "max", "percentage", "indeterminate", "data-state", "data-value", "value-as-string", "set-value"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-progressbar", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-label", "aria-live"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "value-set-event", "set-value-action", "validate-context-action", "bindable-value"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-indeterminate", "percent", "formatter", "is-horizontal", "progress-state"]));
    expect(readySignals(report.circleSignals)).toEqual(expect.arrayContaining(["circle-root", "circle-track", "circle-range", "dasharray", "dashoffset", "rotate"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "track-id", "label-id", "circle-id", "data-max", "data-value", "data-state", "data-orientation"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["value-api", "value-as-string-api", "min-api", "max-api", "percent-api", "percent-as-string-api", "indeterminate-api", "set-value-api", "set-to-max-api", "set-to-min-api", "root-props", "label-props", "value-text-props", "track-props", "range-props", "view-props", "circle-props", "circle-track-props", "circle-range-props", "progressbar-role", "data-max", "data-value", "data-state", "data-orientation", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-label", "aria-live", "percent-css-var", "circle-css-vars", "circle-dasharray", "circle-dashoffset", "view-hidden-state"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/progress", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/progress"))).toBe(true);
    const sliderMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "slider-progress-readiness.md"), "utf8");
    expect(sliderMarkdown).toContain("Machine Signals");
    expect(sliderMarkdown).toContain("API Signals");
    expect(sliderMarkdown).toContain("@zag-js/progress");
    const sliderHtml = await fs.readFile(path.join(result.session.outputPaths.html, "slider-progress-readiness.html"), "utf8");
    expect(sliderHtml).toContain("Machine Signals");
    expect(sliderHtml).toContain("API Signals");
    expect(sliderHtml).toContain("@zag-js/progress");
  });

  it("detects select combobox and listbox readiness without changing values", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-select-combobox-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-select-combobox-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "radix-select.tsx"), [
      "import * as Select from '@radix-ui/react-select';",
      "export function RadixSelectExample() {",
      "  return (",
      "    <form id=\"profile-form\">",
      "      <Select.Root name=\"timezone\" defaultValue=\"utc\" required onValueChange={() => {}}>",
      "        <Select.Trigger aria-label=\"Timezone\">",
      "          <Select.Value placeholder=\"Choose timezone\" />",
      "          <Select.Icon />",
      "        </Select.Trigger>",
      "        <Select.Portal>",
      "          <Select.Content position=\"popper\" sideOffset={4}>",
      "            <Select.Viewport>",
      "              <Select.Group>",
      "                <Select.Label>Common</Select.Label>",
      "                <Select.Item value=\"utc\" disabled={false}>",
      "                  <Select.ItemText>UTC</Select.ItemText>",
      "                  <Select.ItemIndicator />",
      "                </Select.Item>",
      "              </Select.Group>",
      "            </Select.Viewport>",
      "          </Select.Content>",
      "        </Select.Portal>",
      "      </Select.Root>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "headless-combobox-listbox.tsx"), [
      "import { Combobox, Listbox, Select } from '@headlessui/react';",
      "const people = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Linus', disabled: true }];",
      "export function HeadlessChoices({ value, setValue }: { value: typeof people[number]; setValue: (value: typeof people[number]) => void }) {",
      "  return (",
      "    <div>",
      "      <Combobox value={value} defaultValue={people[0]} onChange={setValue} multiple={false} nullable by=\"id\" disabled={false}>",
      "        <Combobox.Label>Person</Combobox.Label>",
      "        <Combobox.Input aria-label=\"Search people\" displayValue={(person: typeof people[number]) => person?.name ?? ''} onChange={() => {}} />",
      "        <Combobox.Button />",
      "        <Combobox.Options anchor=\"bottom\" modal={false}>",
      "          {people.map((person) => <Combobox.Option key={person.id} value={person} disabled={person.disabled}>{person.name}</Combobox.Option>)}",
      "        </Combobox.Options>",
      "      </Combobox>",
      "      <Listbox value={value} defaultValue={people[0]} onChange={setValue} multiple horizontal name=\"person\">",
      "        <Listbox.Button aria-label=\"Selected person\" />",
      "        <Listbox.Options>",
      "          <Listbox.Option value={people[0]}>Ada</Listbox.Option>",
      "        </Listbox.Options>",
      "      </Listbox>",
      "      <Select name=\"native-headless\" defaultValue=\"ada\" aria-label=\"Native person\"><option value=\"ada\">Ada</option></Select>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "ariakit-select-combobox.tsx"), [
      "import { Combobox, ComboboxCancel, ComboboxItem, ComboboxItemCheck, ComboboxItemValue, ComboboxPopover, ComboboxProvider, Select, SelectItem, SelectItemCheck, SelectLabel, SelectPopover, SelectProvider } from '@ariakit/react';",
      "export function AriakitChoices() {",
      "  return (",
      "    <div>",
      "      <ComboboxProvider defaultValue=\"Ada\" setValueOnChange showOnKeyPress autoComplete=\"both\">",
      "        <Combobox aria-label=\"Search user\" />",
      "        <ComboboxCancel />",
      "        <ComboboxPopover sameWidth gutter={4}>",
      "          <ComboboxItem value=\"Ada\"><ComboboxItemCheck /><ComboboxItemValue /></ComboboxItem>",
      "        </ComboboxPopover>",
      "      </ComboboxProvider>",
      "      <SelectProvider defaultValue=\"Ada\" setValue={() => {}}>",
      "        <SelectLabel>Person</SelectLabel>",
      "        <Select aria-label=\"Choose person\" />",
      "        <SelectPopover gutter={4}>",
      "          <SelectItem value=\"Ada\"><SelectItemCheck /></SelectItem>",
      "        </SelectPopover>",
      "      </SelectProvider>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "select-combobox.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { RadixSelectExample } from '../src/radix-select';",
      "describe('select combobox readiness', () => {",
      "  it('keeps roles keyboard and attributes testable', async () => {",
      "    render(<RadixSelectExample />);",
      "    expect(screen.getByRole('combobox', { name: /timezone/i })).toHaveAttribute('aria-expanded', 'false');",
      "    await userEvent.keyboard('{ArrowDown}{ArrowUp}{Home}{End}{Enter}{Escape}');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "select-combobox.yml"), [
      "name: select combobox",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- select-combobox",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: select-combobox-traces",
      "          path: test-results/select-combobox"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@ariakit/react": "latest",
        "@headlessui/react": "latest",
        "@radix-ui/react-select": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "select-combobox-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      selectComboboxSetups: Array<{ filePath: string; framework: string; selectCount: number; comboboxCount: number; listboxCount: number; triggerCount: number; inputCount: number; optionsCount: number; optionCount: number; valueCount: number; portalPopoverCount: number; formCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Select/combobox/listbox readiness Radix Select Headless UI Combobox Listbox Ariakit Select Combobox Listbox Combobox machine Listbox machine virtualizer input display value IME immediate stack top layer typeahead form fields floating portal option registration value option aria-activedescendant form tests");
    expect(report.selectComboboxSetups.some((item) => item.filePath === "src/radix-select.tsx" && item.framework === "radix-select" && item.selectCount > 0 && item.triggerCount > 0 && item.optionsCount > 0 && item.optionCount > 0 && item.valueCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.selectComboboxSetups.some((item) => item.filePath === "src/headless-combobox-listbox.tsx" && item.framework === "headlessui" && item.comboboxCount > 0 && item.listboxCount > 0 && item.inputCount > 0 && item.optionsCount > 0 && item.optionCount > 0 && item.valueCount > 0 && item.formCount > 0)).toBe(true);
    expect(report.selectComboboxSetups.some((item) => item.filePath === "src/ariakit-select-combobox.tsx" && item.framework === "ariakit" && item.selectCount > 0 && item.comboboxCount > 0 && item.inputCount > 0 && item.optionsCount > 0 && item.optionCount > 0 && item.portalPopoverCount > 0 && item.valueCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-select", "headlessui-combobox", "headlessui-listbox", "headlessui-select", "ariakit-combobox", "ariakit-select"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root-provider", "trigger-button", "input", "value-display", "options-list", "option-item", "portal-popover", "label", "indicator-check", "cancel-clear"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["value", "default-value", "on-change", "on-value-change", "multiple", "nullable", "active-option", "selected-option", "disabled-option", "data-state"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["keyboard", "arrow-keys", "home-end", "enter", "escape", "pointer", "typeahead", "focus-management", "virtual-or-filtered"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-combobox", "role-listbox", "role-option", "aria-expanded", "aria-controls", "aria-selected", "aria-activedescendant", "aria-autocomplete", "aria-label"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["name", "form", "required", "native-select", "hidden-select", "value"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-select", "@headlessui/react", "@ariakit/react", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-select"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records select/combobox/listbox readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "select-combobox-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "select-combobox-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "select-combobox-readiness.html"))).resolves.toBeUndefined();
    const selectMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "select-combobox-readiness.md"), "utf8");
    expect(selectMarkdown).toContain("Select Combobox Readiness");
    expect(selectMarkdown).toContain("Implementation Signals");
    expect(selectMarkdown).toContain("@radix-ui/react-select");
    const selectHtml = await fs.readFile(path.join(result.session.outputPaths.html, "select-combobox-readiness.html"), "utf8");
    expect(selectHtml).toContain("select-combobox-readiness-card");
    expect(selectHtml).toContain("data-source-pattern=\"SelectCombobox\"");
    expect(selectHtml).toContain("Implementation Signals");
    expect(selectHtml).toContain("RepoTutor records select/combobox/listbox readiness only");
  });

  it("detects Headless UI listbox implementation details without opening options", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headlessui-listbox-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headlessui-listbox-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headlessui-listbox-internals.tsx"), [
      "import { useCallback, useEffect, useMemo, useRef, useState } from 'react';",
      "import { flushSync } from 'react-dom';",
      "import { Listbox } from '@headlessui/react';",
      "import { useActivePress } from '../hooks/use-active-press';",
      "import { useByComparator } from '../hooks/use-by-comparator';",
      "import { useControllable } from '../hooks/use-controllable';",
      "import { useDefaultValue } from '../hooks/use-default-value';",
      "import { useDisposables } from '../hooks/use-disposables';",
      "import { useElementSize } from '../hooks/use-element-size';",
      "import { useHandleToggle } from '../hooks/use-handle-toggle';",
      "import { useInertOthers } from '../hooks/use-inert-others';",
      "import { useIsoMorphicEffect } from '../hooks/use-iso-morphic-effect';",
      "import { useOnDisappear } from '../hooks/use-on-disappear';",
      "import { useOutsideClick } from '../hooks/use-outside-click';",
      "import { useQuickRelease } from '../hooks/use-quick-release';",
      "import { useScrollLock } from '../hooks/use-scroll-lock';",
      "import { useTextValue } from '../hooks/use-text-value';",
      "import { useTrackedPointer } from '../hooks/use-tracked-pointer';",
      "import { transitionDataAttributes, useTransition } from '../hooks/use-transition';",
      "import { FloatingProvider, useFloatingPanel, useFloatingPanelProps, useFloatingReference, useFloatingReferenceProps, useResolvedAnchor } from '../internal/floating';",
      "import { FormFields } from '../internal/form-fields';",
      "import { useFrozenData } from '../internal/frozen';",
      "import { OpenClosedProvider, State, useOpenClosed } from '../internal/open-closed';",
      "import { stackMachines } from '../machines/stack-machine';",
      "import { useSlice } from '../react-glue';",
      "import { Focus, calculateActiveIndex } from '../utils/calculate-active-index';",
      "import { detectMovement, ElementPositionState } from '../utils/element-movement';",
      "import { focusFrom, isFocusableElement, FocusableMode } from '../utils/focus-management';",
      "import { attemptSubmit } from '../utils/form';",
      "import { Keys } from '../components/keyboard';",
      "import { ListboxContext, useListboxMachine, useListboxMachineContext } from '../components/listbox/listbox-machine-glue';",
      "import { ActionTypes, ActivationTrigger, ListboxStates, ValueMode } from '../components/listbox/listbox-machine';",
      "export function HeadlessUiListboxImplementationFixture() {",
      "  const options = [{ id: 'ada', name: 'Ada', disabled: false }, { id: 'linus', name: 'Linus', disabled: true }];",
      "  const [controlledValue, controlledOnChange] = useState(options[0]);",
      "  const defaultValue = useDefaultValue(options[0]);",
      "  const [value, theirOnChange] = useControllable(controlledValue, controlledOnChange, defaultValue);",
      "  const compare = useByComparator('id');",
      "  const machine = useListboxMachine({ id: 'people', __demoMode: false });",
      "  const listRef = useRef(new Map<string, HTMLElement | null>());",
      "  const data = { value, disabled: false, invalid: false, mode: ValueMode.Multi, orientation: 'horizontal' as const, onChange: theirOnChange, compare, isSelected: (item: unknown) => compare(value, item), optionsPropsRef: useRef({ static: false, hold: false }), listRef };",
      "  useIsoMorphicEffect(() => { machine.state.dataRef.current = data; }, [data]);",
      "  const listboxState = useSlice(machine, (state) => state.listboxState);",
      "  const stackMachine = stackMachines.get(null);",
      "  const isTopLayer = useSlice(stackMachine, useCallback((state) => stackMachine.selectors.isTop(state, 'people'), [stackMachine]));",
      "  const buttonElement = useSlice(machine, (state) => state.buttonElement);",
      "  const optionsElement = useSlice(machine, (state) => state.optionsElement);",
      "  useOutsideClick(isTopLayer, [buttonElement, optionsElement], (event, target) => { machine.send({ type: ActionTypes.CloseListbox }); if (!isFocusableElement(target, FocusableMode.Loose)) { event.preventDefault(); buttonElement?.focus(); } });",
      "  const reset = useCallback(() => defaultValue === undefined ? undefined : theirOnChange?.(defaultValue), [defaultValue, theirOnChange]);",
      "  const [labelledby, LabelProvider] = [buttonElement?.id, ({ children }: { children: unknown }) => children];",
      "  const openClosedValue = listboxState === ListboxStates.Open ? State.Open : State.Closed;",
      "  useQuickRelease(listboxState === ListboxStates.Open, { trigger: buttonElement, close: machine.actions.closeListbox, select: machine.actions.selectActiveOption });",
      "  const toggleProps = useHandleToggle((event) => { if (machine.state.listboxState === ListboxStates.Open) { flushSync(() => machine.actions.closeListbox()); machine.state.buttonElement?.focus({ preventScroll: true }); } else { event.preventDefault(); machine.actions.openListbox({ focus: Focus.Nothing }); } });",
      "  const handleButtonKeyDown = (event: KeyboardEvent) => { if (event.key === Keys.Enter) attemptSubmit(event.currentTarget as HTMLElement); if (event.key === Keys.ArrowDown) machine.actions.openListbox({ focus: data.value ? Focus.Nothing : Focus.First }); if (event.key === Keys.ArrowUp) machine.actions.openListbox({ focus: data.value ? Focus.Nothing : Focus.Last }); };",
      "  useActivePress({ disabled: false });",
      "  useFloatingReference();",
      "  useFloatingReferenceProps();",
      "  const anchor = useResolvedAnchor({ to: 'bottom selection' });",
      "  const portal = true;",
      "  const portalEnabled = portal ? true : false;",
      "  const [floatingRef, style] = useFloatingPanel({ ...anchor, inner: { listRef, index: 0 } });",
      "  const getFloatingPanelProps = useFloatingPanelProps();",
      "  const [localOptionsElement, setLocalOptionsElement] = useState<HTMLElement | null>(null);",
      "  const usesOpenClosedState = useOpenClosed();",
      "  const [visible, transitionData] = useTransition(true, localOptionsElement, usesOpenClosedState !== null ? (usesOpenClosedState & State.Open) === State.Open : listboxState === ListboxStates.Open);",
      "  useOnDisappear(visible, buttonElement, machine.actions.closeListbox);",
      "  useScrollLock(listboxState === ListboxStates.Open, document);",
      "  useInertOthers(listboxState === ListboxStates.Open, { allowed: () => [buttonElement, optionsElement] });",
      "  const frozenValue = useFrozenData(machine.selectors.hasFrozenValue(machine.state), data.value);",
      "  const searchDisposables = useDisposables();",
      "  const handleOptionsKeyDown = (event: KeyboardEvent) => { searchDisposables.dispose(); if (event.key === Keys.Enter) { event.preventDefault(); event.stopPropagation(); machine.actions.selectActiveOption(); } if (event.key === Keys.ArrowDown) machine.actions.goToOption({ focus: Focus.Next }); if (event.key === Keys.ArrowUp) machine.actions.goToOption({ focus: Focus.Previous }); if (event.key === Keys.Home) machine.actions.goToOption({ focus: Focus.First }); if (event.key === Keys.End) machine.actions.goToOption({ focus: Focus.Last }); if (event.key === Keys.Escape) { flushSync(() => machine.actions.closeListbox()); machine.state.buttonElement?.focus({ preventScroll: true }); } if (event.key === Keys.Tab) { flushSync(() => machine.actions.closeListbox()); focusFrom(machine.state.buttonElement!, Focus.Next); } if (event.key.length === 1) { machine.actions.search(event.key); searchDisposables.setTimeout(() => machine.actions.clearSearch(), 350); } };",
      "  const activeDescendant = machine.selectors.activeDescendantId(machine.state);",
      "  const optionRef = useRef<HTMLElement | null>(null);",
      "  const textValue = useTextValue(optionRef);",
      "  const pointer = useTrackedPointer();",
      "  useEffect(() => { machine.actions.registerOption('ada', { current: { disabled: false, value: options[0], domRef: optionRef, textValue } }); return () => machine.actions.unregisterOption('ada'); }, [textValue]);",
      "  useEffect(() => { optionRef.current?.scrollIntoView?.({ block: 'nearest' }); calculateActiveIndex({ focus: Focus.Next }, { resolveItems: () => [], resolveActiveIndex: () => null, resolveId: () => 'id', resolveDisabled: () => false }); detectMovement(buttonElement!, ElementPositionState.Idle, () => machine.send({ type: ActionTypes.MarkButtonAsMoved })); }, [buttonElement]);",
      "  const dataFocus = { 'data-focus': machine.selectors.isActive(machine.state, 'ada'), focus: machine.selectors.isActive(machine.state, 'ada') };",
      "  const optionProps = { role: 'option', tabIndex: -1, 'aria-disabled': false, 'aria-selected': machine.selectors.isActive(machine.state, 'ada'), onClick: () => machine.actions.selectOption(options[0]), onFocus: () => machine.actions.goToOption({ focus: Focus.Specific, id: 'ada' }), onPointerEnter: (event: PointerEvent) => pointer.update(event), onPointerMove: (event: PointerEvent) => pointer.wasMoved(event) && machine.actions.goToOption({ focus: Focus.Specific, id: 'ada' }, ActivationTrigger.Pointer), onPointerLeave: (event: PointerEvent) => pointer.wasMoved(event) && machine.actions.goToOption({ focus: Focus.Nothing }) };",
      "  return <FloatingProvider><ListboxContext.Provider value={machine}><LabelProvider><OpenClosedProvider value={openClosedValue}>{'person' && <FormFields disabled={false} data={{ person: value }} form=\"profile\" onReset={reset} />}<Listbox value={value} onChange={theirOnChange} multiple name=\"person\"><Listbox.Button aria-haspopup=\"listbox\" aria-controls={optionsElement?.id} aria-expanded={listboxState === ListboxStates.Open} aria-labelledby={labelledby} onKeyDown={handleButtonKeyDown as never} {...toggleProps}>Person</Listbox.Button><Listbox.Options data-portal-enabled={portalEnabled} ref={floatingRef as never} role=\"listbox\" aria-activedescendant={activeDescendant} aria-multiselectable aria-orientation=\"horizontal\" tabIndex={listboxState === ListboxStates.Open ? 0 : undefined} style={{ ...style, '--button-width': useElementSize(visible, buttonElement, true).width }} onKeyDown={handleOptionsKeyDown as never} {...getFloatingPanelProps()} {...transitionDataAttributes(transitionData)}><Listbox.Option value={options[0]} {...optionProps} {...dataFocus}>Ada {String(frozenValue)}</Listbox.Option></Listbox.Options></Listbox></OpenClosedProvider></LabelProvider></ListboxContext.Provider></FloatingProvider>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "select-combobox-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      implementationSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.implementationSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Listbox machine");
    expect(readySignals).toEqual(expect.arrayContaining([
      "controllable-value",
      "default-value-hook",
      "comparator",
      "listbox-machine",
      "data-ref-sync",
      "slice-state",
      "stack-machine",
      "top-layer",
      "outside-click-close",
      "refocus-button",
      "label-provider",
      "form-fields",
      "open-closed-provider",
      "floating-provider",
      "quick-release",
      "active-press",
      "floating-reference",
      "handle-toggle",
      "keyboard-open",
      "attempt-submit",
      "aria-haspopup-listbox",
      "button-aria-expanded",
      "button-aria-controls",
      "options-anchor",
      "portal-enabled",
      "transition-data",
      "disappear-close",
      "scroll-lock",
      "inert-others",
      "frozen-value",
      "active-descendant",
      "multiselectable",
      "orientation",
      "open-tab-index",
      "typeahead-search",
      "search-timeout",
      "select-active-option",
      "focus-next-prev",
      "focus-first-last",
      "tab-close-focus-next",
      "register-option",
      "unregister-option",
      "scroll-into-view",
      "pointer-tracking",
      "option-role",
      "aria-selected",
      "data-focus"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "select-combobox-readiness.md"), "utf8");
    expect(markdown).toContain("## Implementation Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "select-combobox-readiness.html"), "utf8");
    expect(html).toContain("Implementation Signals");
  });

  it("detects Headless UI combobox implementation details without opening options", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headlessui-combobox-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headlessui-combobox-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "src", "headlessui-combobox-internals.tsx"), [
      "import { useCallback, useMemo, useRef, useState } from 'react';",
      "import { flushSync } from 'react-dom';",
      "import { Combobox } from '@headlessui/react';",
      "import { Virtualizer, useVirtualizer } from '@tanstack/react-virtual';",
      "import { useActivePress } from '../hooks/use-active-press';",
      "import { useByComparator } from '../hooks/use-by-comparator';",
      "import { useControllable } from '../hooks/use-controllable';",
      "import { useDefaultValue } from '../hooks/use-default-value';",
      "import { useDisposables } from '../hooks/use-disposables';",
      "import { useElementSize } from '../hooks/use-element-size';",
      "import { useHandleToggle } from '../hooks/use-handle-toggle';",
      "import { useInertOthers } from '../hooks/use-inert-others';",
      "import { useIsoMorphicEffect } from '../hooks/use-iso-morphic-effect';",
      "import { useOnDisappear } from '../hooks/use-on-disappear';",
      "import { useOutsideClick } from '../hooks/use-outside-click';",
      "import { useQuickRelease } from '../hooks/use-quick-release';",
      "import { useRefocusableInput } from '../hooks/use-refocusable-input';",
      "import { useScrollLock } from '../hooks/use-scroll-lock';",
      "import { useTrackedPointer } from '../hooks/use-tracked-pointer';",
      "import { transitionDataAttributes, useTransition } from '../hooks/use-transition';",
      "import { useTreeWalker } from '../hooks/use-tree-walker';",
      "import { useWatch } from '../hooks/use-watch';",
      "import { FloatingProvider, useFloatingPanel, useFloatingPanelProps, useFloatingReference, useResolvedAnchor } from '../internal/floating';",
      "import { FormFields } from '../internal/form-fields';",
      "import { Frozen, useFrozenData } from '../internal/frozen';",
      "import { OpenClosedProvider, State, useOpenClosed } from '../internal/open-closed';",
      "import { stackMachines } from '../machines/stack-machine';",
      "import { useSlice } from '../react-glue';",
      "import { Focus } from '../utils/calculate-active-index';",
      "import { detectMovement, ElementPositionState } from '../utils/element-movement';",
      "import { Keys } from '../components/keyboard';",
      "import { MouseButton } from '../components/mouse';",
      "import { ComboboxContext, useComboboxMachine, useComboboxMachineContext } from '../components/combobox/combobox-machine-glue';",
      "import { ActionTypes, ActivationTrigger, ComboboxState, ValueMode } from '../components/combobox/combobox-machine';",
      "export function HeadlessUiComboboxImplementationFixture() {",
      "  const options = [{ id: 'ada', name: 'Ada', disabled: false }, { id: 'linus', name: 'Linus', disabled: true }];",
      "  const [controlledValue, controlledOnChange] = useState(options[0]);",
      "  const defaultValue = useDefaultValue(options[0]);",
      "  const [value, theirOnChange] = useControllable(controlledValue, controlledOnChange, defaultValue);",
      "  const compare = useByComparator('id');",
      "  const machine = useComboboxMachine({ id: 'people', virtual: { options, disabled: (item) => item.disabled }, __demoMode: false });",
      "  const virtualizer: Virtualizer<HTMLElement, Element> = useVirtualizer({ count: options.length, estimateSize: () => 40, getScrollElement: () => machine.state.optionsElement, overscan: 12, scrollPaddingStart: 4, scrollPaddingEnd: 4 });",
      "  const inputRef = useRef<HTMLInputElement | null>(null);",
      "  const buttonRef = useRef<HTMLButtonElement | null>(null);",
      "  const optionRef = useRef<HTMLElement | null>(null);",
      "  const optionsPropsRef = useRef({ static: false, hold: false });",
      "  const data = { value, defaultValue, disabled: false, invalid: false, mode: ValueMode.Single, immediate: true, virtual: machine.state.virtual, calculateIndex: (item: unknown) => options.findIndex((other) => compare(other, item)), compare, isSelected: (item: unknown) => compare(value, item), onChange: theirOnChange, optionsPropsRef, __demoMode: false };",
      "  useIsoMorphicEffect(() => { machine.state.dataRef.current = data; machine.send({ type: ActionTypes.UpdateVirtualConfiguration, options, disabled: (item) => item.disabled }); }, [data]);",
      "  const [comboboxState, inputElement, buttonElement, optionsElement] = useSlice(machine, (state) => [state.comboboxState, state.inputElement, state.buttonElement, state.optionsElement]);",
      "  const stackMachine = stackMachines.get(null);",
      "  const isTopLayer = useSlice(stackMachine, useCallback((state) => stackMachine.selectors.isTop(state, 'people'), [stackMachine]));",
      "  useOutsideClick(isTopLayer, [buttonElement, inputElement, optionsElement], () => machine.actions.closeCombobox());",
      "  const reset = useCallback(() => defaultValue === undefined ? undefined : theirOnChange?.(defaultValue), [defaultValue, theirOnChange]);",
      "  const currentDisplayValue = useMemo(() => typeof value === 'object' ? value?.name ?? '' : '', [value]);",
      "  useWatch(([displayValue, state], [oldDisplayValue, oldState]) => { if (machine.state.isTyping) return; const input = inputRef.current; if (!input) return; if (oldState === ComboboxState.Open && state === ComboboxState.Closed) input.value = displayValue; if (displayValue !== oldDisplayValue) input.value = displayValue; input.setSelectionRange(input.value.length, input.value.length); }, [currentDisplayValue, comboboxState]);",
      "  useWatch(([state], [oldState]) => { if (state === ComboboxState.Open && oldState === ComboboxState.Closed) { const input = inputRef.current; if (!input) return; const currentValue = input.value; input.value = ''; input.value = currentValue; } }, [comboboxState]);",
      "  const isComposing = useRef(false);",
      "  const handleCompositionStart = () => { isComposing.current = true; };",
      "  const handleCompositionEnd = () => { useDisposables().nextFrame(() => { isComposing.current = false; }); };",
      "  const clear = () => { machine.actions.onChange(null); machine.actions.goToOption({ focus: Focus.Nothing }); };",
      "  const handleInputKeyDown = (event: KeyboardEvent) => { machine.actions.setIsTyping(true); if (event.key === Keys.Enter && !isComposing.current) { machine.actions.selectActiveOption(); machine.actions.closeCombobox(); } if (event.key === Keys.ArrowDown) machine.actions.goToOption({ focus: Focus.Next }); if (event.key === Keys.ArrowUp) machine.actions.goToOption({ focus: Focus.Previous }); if (event.key === Keys.Home) machine.actions.goToOption({ focus: Focus.First }); if (event.key === Keys.End) machine.actions.goToOption({ focus: Focus.Last }); if (event.key === Keys.PageUp) machine.actions.goToOption({ focus: Focus.First }); if (event.key === Keys.PageDown) machine.actions.goToOption({ focus: Focus.Last }); if (event.key === Keys.Escape) { if (data.value === null) clear(); machine.actions.closeCombobox(); } if (event.key === Keys.Tab && machine.state.activationTrigger !== ActivationTrigger.Focus) { machine.actions.selectActiveOption(); machine.actions.closeCombobox(); } };",
      "  const handleInputChange = (event: { target: { value: string } }) => { if (event.target.value === '') clear(); machine.actions.openCombobox(); };",
      "  const handleInputFocus = () => { if (!data.immediate) return; useDisposables().microTask(() => { flushSync(() => machine.actions.openCombobox()); machine.actions.setActivationTrigger(ActivationTrigger.Focus); }); };",
      "  machine.send({ type: ActionTypes.DefaultToFirstOption, value: true });",
      "  const refocusInput = useRefocusableInput(inputElement);",
      "  const enableQuickRelease = comboboxState === ComboboxState.Open;",
      "  useQuickRelease(enableQuickRelease, { trigger: buttonElement, close: machine.actions.closeCombobox, select: machine.actions.selectActiveOption });",
      "  useActivePress({ disabled: false });",
      "  const toggleProps = useHandleToggle(() => { comboboxState === ComboboxState.Open ? machine.actions.closeCombobox() : machine.actions.openCombobox(); refocusInput(); });",
      "  useFloatingReference();",
      "  const anchor = useResolvedAnchor({ to: 'bottom start' });",
      "  const [floatingRef, style] = useFloatingPanel(anchor);",
      "  const getFloatingPanelProps = useFloatingPanelProps();",
      "  const portalOwnerDocument = inputElement?.ownerDocument || buttonElement?.ownerDocument;",
      "  const [localOptionsElement, setLocalOptionsElement] = useState<HTMLElement | null>(null);",
      "  const usesOpenClosedState = useOpenClosed();",
      "  const [visible, transitionData] = useTransition(true, localOptionsElement, usesOpenClosedState !== null ? (usesOpenClosedState & State.Open) === State.Open : comboboxState === ComboboxState.Open);",
      "  useOnDisappear(visible, inputElement, machine.actions.closeCombobox);",
      "  useScrollLock(true && comboboxState === ComboboxState.Open, document);",
      "  useInertOthers(true && comboboxState === ComboboxState.Open, { allowed: () => [inputElement, buttonElement, optionsElement] });",
      "  const didInputMove = useSlice(machine, machine.selectors.didInputMove);",
      "  useTreeWalker(comboboxState === ComboboxState.Open, { container: optionsElement, accept: (node) => node.getAttribute('role') === 'option' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT, walk: (node) => node.setAttribute('role', 'none') });",
      "  const frozenValue = useFrozenData(visible && comboboxState === ComboboxState.Closed, data.value);",
      "  const frozenOptions = useFrozenData(visible && comboboxState === ComboboxState.Closed, data.virtual?.options);",
      "  const pointer = useTrackedPointer();",
      "  useIsoMorphicEffect(() => machine.actions.registerOption('ada', { current: { disabled: false, value: options[0], domRef: optionRef, order: 0 } }), [optionRef]);",
      "  useIsoMorphicEffect(() => { if (machine.selectors.shouldScrollIntoView(machine.state, options[0], 'ada')) optionRef.current?.scrollIntoView?.({ block: 'nearest' }); detectMovement(inputElement!, ElementPositionState.Idle, () => machine.send({ type: ActionTypes.MarkInputAsMoved })); virtualizer.scrollToIndex(machine.selectors.activeOptionIndex(machine.state) ?? 0); }, [inputElement]);",
      "  const activeDescendant = machine.selectors.activeDescendantId(machine.state);",
      "  const optionProps = { role: 'option', tabIndex: -1, 'aria-disabled': false, 'aria-selected': data.isSelected(options[0]), onMouseDown: (event: MouseEvent) => { event.preventDefault(); if (event.button !== MouseButton.Left) return; machine.actions.onChange(options[0]); requestAnimationFrame(() => refocusInput()); machine.actions.closeCombobox(); }, onFocus: () => machine.actions.goToOption({ focus: Focus.Specific, idx: 0 }), onPointerEnter: (event: PointerEvent) => pointer.update(event), onPointerMove: (event: PointerEvent) => pointer.wasMoved(event) && machine.actions.goToOption({ focus: Focus.Specific, idx: 0 }, ActivationTrigger.Pointer), onPointerLeave: (event: PointerEvent) => pointer.wasMoved(event) && machine.actions.goToOption({ focus: Focus.Nothing }) };",
      "  return <FloatingProvider><ComboboxContext.Provider value={machine}><OpenClosedProvider value={comboboxState === ComboboxState.Open ? State.Open : State.Closed}>{'person' && <FormFields disabled={false} data={{ person: value }} form=\"profile\" onReset={reset} />}<Combobox value={value} onChange={theirOnChange} name=\"person\" immediate virtual={{ options, disabled: (item) => item.disabled }}><Combobox.Input ref={(node) => { inputRef.current = node; machine.actions.setInputElement(node); }} displayValue={(item) => item?.name ?? ''} role=\"combobox\" aria-controls={optionsElement?.id} aria-expanded={comboboxState === ComboboxState.Open} aria-activedescendant={activeDescendant} aria-autocomplete=\"list\" onCompositionStart={handleCompositionStart} onCompositionEnd={handleCompositionEnd} onKeyDown={handleInputKeyDown as never} onChange={handleInputChange as never} onFocus={handleInputFocus as never} /><Combobox.Button ref={buttonRef as never} aria-haspopup=\"listbox\" aria-controls={optionsElement?.id} aria-expanded={comboboxState === ComboboxState.Open} onKeyDown={handleInputKeyDown as never} {...toggleProps}>Person</Combobox.Button><Combobox.Options ref={(node) => { setLocalOptionsElement(node); machine.actions.setOptionsElement(node); floatingRef(node); }} role=\"listbox\" aria-multiselectable={data.mode === ValueMode.Multi ? true : undefined} data-portal-owner-document={portalOwnerDocument?.nodeType} data-input-moved={didInputMove} style={{ ...style, '--input-width': useElementSize(visible, inputElement, true).width }} onWheel={() => machine.actions.setActivationTrigger(ActivationTrigger.Pointer)} onMouseDown={(event) => { event.preventDefault(); machine.actions.setActivationTrigger(ActivationTrigger.Pointer); }} {...getFloatingPanelProps()} {...transitionDataAttributes(transitionData)}><Frozen freeze={visible && comboboxState === ComboboxState.Closed}><Combobox.Option value={options[0]} {...optionProps}>Ada {String(frozenValue)} {String(frozenOptions?.length)} {virtualizer.getVirtualItems().map((item) => <span key={item.key} aria-setsize={options.length} aria-posinset={item.index + 1} style={{ transform: `translateY(${item.start}px)` }} />)}</Combobox.Option></Frozen></Combobox.Options></Combobox></OpenClosedProvider></ComboboxContext.Provider></FloatingProvider>;",
      "}"
    ].join("\n"));

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "@tanstack/react-virtual": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "select-combobox-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      implementationSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.implementationSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Combobox machine");
    expect(readySignals).toEqual(expect.arrayContaining([
      "combobox-machine",
      "virtualizer",
      "virtual-configuration",
      "display-value",
      "input-value-sync",
      "composition-guard",
      "immediate-focus-open",
      "input-ref-sync",
      "input-role-combobox",
      "input-aria-expanded",
      "input-aria-controls",
      "input-aria-activedescendant",
      "input-aria-autocomplete",
      "clear-on-empty",
      "open-on-input-change",
      "escape-clear",
      "tab-select-close",
      "button-refocus-input",
      "options-tree-walker-role-none",
      "options-modal-scroll-lock",
      "portal-owner-document",
      "input-movement-cancel-transition",
      "virtual-option-positioning",
      "option-refocus-input",
      "mobile-keyboard-guard",
      "option-register-order",
      "pointer-activation-trigger",
      "default-first-option",
      "active-descendant-virtual",
      "voiceover-input-reset"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "select-combobox-readiness.md"), "utf8");
    expect(markdown).toContain("## Implementation Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "select-combobox-readiness.html"), "utf8");
    expect(html).toContain("Implementation Signals");
  });

  it("detects toolbar toggle readiness without changing pressed state", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-toolbar-toggle-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-toolbar-toggle-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "radix-toolbar-toggle.tsx"), [
      "import * as React from 'react';",
      "import * as Toolbar from '@radix-ui/react-toolbar';",
      "import * as Toggle from '@radix-ui/react-toggle';",
      "import * as ToggleGroup from '@radix-ui/react-toggle-group';",
      "export function RadixToolbarToggleControls() {",
      "  const [pressed, setPressed] = React.useState(false);",
      "  return (",
      "    <Toolbar.Root orientation=\"horizontal\" dir=\"ltr\" loop aria-label=\"Editor toolbar\">",
      "      <Toolbar.Button type=\"button\" aria-label=\"Undo\" />",
      "      <Toolbar.Link href=\"#help\">Help</Toolbar.Link>",
      "      <Toolbar.Separator decorative={false} />",
      "      <Toolbar.ToggleGroup type=\"single\" defaultValue=\"left\" value=\"left\" onValueChange={() => {}} rovingFocus orientation=\"horizontal\" disabled={false}>",
      "        <Toolbar.ToggleItem value=\"left\" aria-label=\"Align left\" />",
      "      </Toolbar.ToggleGroup>",
      "      <Toggle.Root pressed={pressed} defaultPressed={false} onPressedChange={setPressed} aria-label=\"Bold\" disabled={false} data-state={pressed ? 'on' : 'off'} />",
      "      <ToggleGroup.Root type=\"multiple\" defaultValue={[\"bold\"]} value={[\"bold\"]} onValueChange={() => {}} orientation=\"vertical\" dir=\"rtl\" loop={false} aria-label=\"Text style\">",
      "        <ToggleGroup.Item value=\"bold\" disabled={false} aria-label=\"Bold\" />",
      "      </ToggleGroup.Root>",
      "    </Toolbar.Root>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "ariakit-toolbar.tsx"), [
      "import { Toolbar, ToolbarContainer, ToolbarInput, ToolbarItem, ToolbarProvider, ToolbarSeparator, useToolbarStore } from '@ariakit/react';",
      "export function AriakitToolbarControls() {",
      "  const toolbar = useToolbarStore({ orientation: 'vertical', focusLoop: true, rtl: true, virtualFocus: true });",
      "  return (",
      "    <ToolbarProvider store={toolbar}>",
      "      <Toolbar aria-label=\"Formatting toolbar\" aria-orientation=\"vertical\">",
      "        <ToolbarContainer>",
      "          <ToolbarItem as=\"button\" type=\"button\" aria-pressed=\"false\" data-active=\"false\">Italic</ToolbarItem>",
      "          <ToolbarSeparator />",
      "          <ToolbarInput aria-label=\"Command filter\" />",
      "        </ToolbarContainer>",
      "      </Toolbar>",
      "    </ToolbarProvider>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "toolbar-toggle.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { RadixToolbarToggleControls } from '../src/radix-toolbar-toggle';",
      "describe('toolbar toggle readiness', () => {",
      "  it('keeps roles keyboard and pressed attributes testable', async () => {",
      "    render(<RadixToolbarToggleControls />);",
      "    expect(screen.getByRole('toolbar', { name: /editor toolbar/i })).toHaveAttribute('aria-orientation', 'horizontal');",
      "    expect(screen.getByRole('button', { name: /bold/i, pressed: false })).toHaveAttribute('aria-pressed', 'false');",
      "    await userEvent.keyboard('{ArrowRight}{ArrowLeft}{Home}{End}');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "toolbar-toggle.yml"), [
      "name: toolbar toggle",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- toolbar-toggle",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: toolbar-toggle-traces",
      "          path: test-results/toolbar-toggle"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@ariakit/react": "latest",
        "@radix-ui/react-toggle": "latest",
        "@radix-ui/react-toggle-group": "latest",
        "@radix-ui/react-toolbar": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "toolbar-toggle-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      toolbarToggleSetups: Array<{ filePath: string; framework: string; toolbarCount: number; toggleCount: number; toggleGroupCount: number; itemCount: number; separatorCount: number; buttonLinkCount: number; pressedStateCount: number; rovingFocusCount: number; orientationCount: number; keyboardCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      focusSignals: Array<{ signal: string; readiness: string }>;
      orientationSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Toolbar/toggle readiness Radix Toolbar Toggle ToggleGroup Ariakit Toolbar pressed aria-pressed roving focus orientation keyboard tests");
    expect(report.toolbarToggleSetups.some((item) => item.filePath === "src/radix-toolbar-toggle.tsx" && item.framework === "radix-toolbar" && item.toolbarCount > 0 && item.toggleCount > 0 && item.toggleGroupCount > 0 && item.itemCount > 0 && item.separatorCount > 0 && item.buttonLinkCount > 0 && item.pressedStateCount > 0 && item.rovingFocusCount > 0 && item.orientationCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.toolbarToggleSetups.some((item) => item.filePath === "src/ariakit-toolbar.tsx" && item.framework === "ariakit-toolbar" && item.toolbarCount > 0 && item.itemCount > 0 && item.separatorCount > 0 && item.buttonLinkCount > 0 && item.pressedStateCount > 0 && item.rovingFocusCount > 0 && item.orientationCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-toolbar", "radix-toggle", "radix-toggle-group", "ariakit-toolbar"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["toolbar-root", "toolbar-provider", "toolbar-item", "button-link", "separator", "toggle-root", "toggle-group", "toggle-item", "input-container"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["pressed", "default-pressed", "on-pressed-change", "value", "default-value", "on-value-change", "single", "multiple", "data-state", "disabled"]));
    expect(readySignals(report.focusSignals)).toEqual(expect.arrayContaining(["roving-focus", "composite-focus", "focus-loop", "virtual-focus", "active-item", "focusable-item", "rtl-dir"]));
    expect(readySignals(report.orientationSignals)).toEqual(expect.arrayContaining(["horizontal", "vertical", "aria-orientation", "dir", "loop"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-toolbar", "role-group", "role-radio", "aria-pressed", "aria-checked", "aria-label", "aria-disabled", "tabindex"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-toolbar", "@radix-ui/react-toggle", "@radix-ui/react-toggle-group", "@ariakit/react", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-toolbar"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records toolbar/toggle readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "toolbar-toggle-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "toolbar-toggle-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "toolbar-toggle-readiness.html"))).resolves.toBeUndefined();
    const toolbarMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "toolbar-toggle-readiness.md"), "utf8");
    expect(toolbarMarkdown).toContain("Toolbar Toggle Readiness");
    expect(toolbarMarkdown).toContain("@radix-ui/react-toolbar");
    const toolbarHtml = await fs.readFile(path.join(result.session.outputPaths.html, "toolbar-toggle-readiness.html"), "utf8");
    expect(toolbarHtml).toContain("toolbar-toggle-readiness-card");
    expect(toolbarHtml).toContain("data-source-pattern=\"ToolbarToggle\"");
    expect(toolbarHtml).toContain("RepoTutor records toolbar/toggle readiness only");
  });

  it("detects Zag toggle group readiness without toggling values", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-toggle-group-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-toggle-group-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-toggle-group.tsx"), [
      "import * as toggleGroup from '@zag-js/toggle-group';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "const machineEvidence = 'idle focused VALUE.SET TOGGLE.CLICK ROOT.MOUSE_DOWN ROOT.FOCUS ROOT.BLUR TOGGLE.FOCUS TOGGLE.FOCUS_NEXT TOGGLE.FOCUS_PREV TOGGLE.FOCUS_FIRST TOGGLE.FOCUS_LAST TOGGLE.SHIFT_TAB';",
      "const focusEvidence = 'focusedId isTabbingBackward isClickFocus isWithinToolbar currentLoopFocus checkIfWithinToolbar setIsTabbingBackward clearIsTabbingBackward setClickFocus clearClickFocus setFocusedId clearFocusedId focusFirstToggle focusLastToggle focusNextToggle focusPrevToggle raf preventScroll getFirstEl getLastEl getNextEl getPrevEl nextById prevById queryAll';",
      "const valueEvidence = 'defaultValue value onValueChange multiple deselectable ensureProps addOrRemove isArray isEqual getItemState pressed disabled focused data-state';",
      "const apiSurfaceEvidence = 'value setValue getItemState getRootProps getItemProps role: radiogroup role: group role: radio tabIndex data-disabled data-orientation data-focus data-ownedby data-state aria-checked aria-pressed onMouseDown onFocus onBlur onClick onKeyDown ArrowLeft ArrowRight ArrowUp ArrowDown Home End Tab Safari preventScroll';",
      "void machineEvidence; void focusEvidence; void valueEvidence; void apiSurfaceEvidence;",
      "export function ZagToggleGroupDemo() {",
      "  const service = useMachine(toggleGroup.machine, {",
      "    id: 'format-group',",
      "    ids: { root: 'format-group-root', item: (value) => `format-group-item-${value}` },",
      "    defaultValue: ['bold'],",
      "    value: ['bold'],",
      "    multiple: true,",
      "    deselectable: true,",
      "    disabled: false,",
      "    orientation: 'horizontal',",
      "    rovingFocus: true,",
      "    loopFocus: true,",
      "    dir: 'rtl',",
      "    onValueChange(details) { console.log(details.value); }",
      "  });",
      "  const api = toggleGroup.connect(service, normalizeProps);",
      "  api.setValue(['italic']);",
      "  api.getItemState({ value: 'bold' });",
      "  api.getItemState({ value: 'italic', disabled: true });",
      "  return (",
      "    <div role=\"toolbar\" aria-label=\"Formatting toolbar\">",
      "      <div {...api.getRootProps()} role=\"group\" data-disabled=\"false\" data-orientation=\"horizontal\" data-focus=\"true\" tabIndex={0}>",
      "        <button {...api.getItemProps({ value: 'bold' })} data-ownedby=\"format-group-root\" data-focus=\"true\" data-disabled=\"false\" data-orientation=\"horizontal\" data-state=\"on\" aria-pressed=\"true\" aria-label=\"Bold\">Bold</button>",
      "        <button {...api.getItemProps({ value: 'italic', disabled: true })} data-ownedby=\"format-group-root\" data-disabled=\"true\" data-state=\"off\" aria-pressed=\"false\" aria-label=\"Italic\">Italic</button>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "zag-toggle-group.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { ZagToggleGroupDemo } from '../src/zag-toggle-group';",
      "describe('zag toggle group readiness markers', () => {",
      "  it('keeps role state and keyboard contracts visible', async () => {",
      "    render(<ZagToggleGroupDemo />);",
      "    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal');",
      "    expect(screen.getByRole('button', { name: /bold/i, pressed: true })).toHaveAttribute('data-state', 'on');",
      "    await userEvent.keyboard('{ArrowRight}{ArrowLeft}{Home}{End}{Tab}');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "zag-toggle-group.yml"), [
      "name: zag toggle group",
      "on: [push]",
      "jobs:",
      "  static-zag-toggle-group:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm vitest zag-toggle-group.spec.tsx",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: toolbar-toggle-traces",
      "          path: test-results/zag-toggle-group"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/toggle-group": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/utils": "latest",
        react: "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        vitest: "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "toolbar-toggle-readiness-report.json"), "utf8")) as {
      toolbarToggleSetups: Array<{ filePath: string; framework: string; toolbarCount: number; toggleCount: number; toggleGroupCount: number; itemCount: number; pressedStateCount: number; rovingFocusCount: number; orientationCount: number; keyboardCount: number; accessibilityCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      focusSignals: Array<{ signal: string; readiness: string }>;
      orientationSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      rovingFocusSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.toolbarToggleSetups.some((item) => item.filePath === "src/zag-toggle-group.tsx" && item.framework === "zag-toggle-group" && item.toolbarCount > 0 && item.toggleGroupCount > 0 && item.itemCount > 0 && item.pressedStateCount > 0 && item.rovingFocusCount > 0 && item.orientationCount > 0 && item.accessibilityCount > 0 && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-toggle-group"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["toggle-group", "toggle-item", "toolbar-root"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["value", "default-value", "on-value-change", "multiple", "data-state", "disabled", "deselectable"]));
    expect(readySignals(report.focusSignals)).toEqual(expect.arrayContaining(["roving-focus", "focus-loop", "active-item", "focusable-item", "rtl-dir"]));
    expect(readySignals(report.orientationSignals)).toEqual(expect.arrayContaining(["horizontal", "dir", "loop"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-toolbar", "role-group", "aria-pressed", "aria-label", "aria-disabled", "tabindex"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["idle", "focused", "value-set", "toggle-click", "root-focus", "root-blur", "toggle-focus", "focus-next", "focus-prev", "focus-first", "focus-last", "shift-tab"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value-array", "controlled-value", "default-value", "on-value-change", "multiple", "deselectable", "ensure-props", "add-or-remove", "item-state"]));
    expect(readySignals(report.rovingFocusSignals)).toEqual(expect.arrayContaining(["focused-id", "tabbing-backward", "click-focus", "within-toolbar", "current-loop-focus", "raf-focus", "next-prev-by-id", "first-last"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "item-id", "data-ownedby", "data-disabled", "data-orientation", "data-focus", "data-state", "role-group", "aria-pressed"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["value-api", "set-value-api", "item-state-api", "root-props", "item-props", "root-radiogroup-role", "root-group-role", "item-radio-role", "root-tabindex", "item-tabindex", "data-disabled", "data-orientation", "data-focus", "data-ownedby", "data-state", "aria-checked", "aria-pressed", "root-mouse-down-handler", "root-focus-handler", "root-blur-handler", "item-focus-handler", "item-click-handler", "item-keydown-handler", "arrow-key-map", "home-end-key-map", "shift-tab-key-map", "safari-focus-fix"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/toggle-group", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/utils", "react"]));
    const toolbarMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "toolbar-toggle-readiness.md"), "utf8");
    expect(toolbarMarkdown).toContain("Machine Signals");
    expect(toolbarMarkdown).toContain("API Signals");
    expect(toolbarMarkdown).toContain("@zag-js/toggle-group");
    const toolbarHtml = await fs.readFile(path.join(result.session.outputPaths.html, "toolbar-toggle-readiness.html"), "utf8");
    expect(toolbarHtml).toContain("Machine Signals");
    expect(toolbarHtml).toContain("API Signals");
    expect(toolbarHtml).toContain("@zag-js/toggle-group");
  });

  it("detects scroll area readiness without scrolling viewports", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-scroll-area-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-scroll-area-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "radix-scroll-area.tsx"), [
      "import * as ScrollArea from '@radix-ui/react-scroll-area';",
      "export function RadixScrollAreaDemo() {",
      "  const measurementEvidence = 'ResizeObserver scrollHeight scrollWidth clientHeight clientWidth thumbSize thumbOffset cornerSize ratio scrollProgress';",
      "  void measurementEvidence;",
      "  return (",
      "    <ScrollArea.Root type=\"hover\" dir=\"rtl\" scrollHideDelay={600} data-state=\"visible\" aria-label=\"Scrollable documents\">",
      "      <ScrollArea.Viewport data-testid=\"scroll-viewport\" style={{ width: 300, height: 200, overflowX: 'scroll', overflowY: 'scroll' }} tabIndex={0}>",
      "        <div style={{ width: 900, height: 700 }}>Large scrollable content</div>",
      "      </ScrollArea.Viewport>",
      "      <ScrollArea.Scrollbar orientation=\"vertical\" forceMount data-orientation=\"vertical\">",
      "        <ScrollArea.Thumb data-state=\"visible\" />",
      "      </ScrollArea.Scrollbar>",
      "      <ScrollArea.Scrollbar orientation=\"horizontal\" forceMount data-orientation=\"horizontal\">",
      "        <ScrollArea.Thumb data-state=\"visible\" />",
      "      </ScrollArea.Scrollbar>",
      "      <ScrollArea.Corner />",
      "    </ScrollArea.Root>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "zag-scroll-area.tsx"), [
      "import * as scrollArea from '@zag-js/scroll-area';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagScrollAreaDemo() {",
      "  const service = useMachine(scrollArea.machine, { id: 'docs-scroll-area', dir: 'rtl' });",
      "  const api = scrollArea.connect(service, normalizeProps);",
      "  api.scrollTo({ top: 0, left: 0, behavior: 'smooth' });",
      "  api.scrollToEdge({ edge: 'bottom', behavior: 'smooth' });",
      "  api.hasOverflowX;",
      "  api.hasOverflowY;",
      "  return (",
      "    <div {...api.getRootProps()} data-overflow-x=\"true\" data-overflow-y=\"true\" data-ownedby=\"docs-scroll-area\">",
      "      <div {...api.getViewportProps()} role=\"presentation\" tabIndex={0} data-scrolling=\"true\">",
      "        <div {...api.getContentProps()}>Scrollable content</div>",
      "      </div>",
      "      <div {...api.getScrollbarProps({ orientation: 'vertical' })} data-orientation=\"vertical\" role=\"presentation\">",
      "        <div {...api.getThumbProps({ orientation: 'vertical' })} />",
      "      </div>",
      "      <div {...api.getScrollbarProps({ orientation: 'horizontal' })} data-orientation=\"horizontal\" role=\"presentation\">",
      "        <div {...api.getThumbProps({ orientation: 'horizontal' })} />",
      "      </div>",
      "      <div {...api.getCornerProps()} />",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "scroll-area.spec.tsx"), [
      "import { fireEvent, render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { RadixScrollAreaDemo } from '../src/radix-scroll-area';",
      "describe('scroll area readiness', () => {",
      "  it('keeps viewport scrollbar and overflow attributes testable', async () => {",
      "    render(<RadixScrollAreaDemo />);",
      "    const viewport = screen.getByTestId('scroll-viewport');",
      "    expect(viewport).toHaveStyle({ overflowX: 'scroll', overflowY: 'scroll' });",
      "    expect(screen.getAllByRole('presentation').length).toBeGreaterThanOrEqual(1);",
      "    expect(document.querySelector('[data-orientation=\"vertical\"]')).toHaveAttribute('data-orientation', 'vertical');",
      "    fireEvent.scroll(viewport, { target: { scrollTop: 120, scrollLeft: 20 } });",
      "    fireEvent.wheel(viewport, { deltaY: 64 });",
      "    await userEvent.pointer([{ keys: '[MouseLeft>]', target: viewport }, { keys: '[/MouseLeft]' }]);",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "scroll-area.yml"), [
      "name: scroll area",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- scroll-area",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: scroll-area-traces",
      "          path: test-results/scroll-area"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@radix-ui/react-scroll-area": "latest",
        "@zag-js/react": "latest",
        "@zag-js/scroll-area": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "scroll-area-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      scrollAreaSetups: Array<{ filePath: string; framework: string; scrollAreaCount: number; viewportCount: number; contentCount: number; scrollbarCount: number; thumbCount: number; cornerCount: number; orientationCount: number; overflowCount: number; measurementCount: number; interactionCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      measurementSignals: Array<{ signal: string; readiness: string }>;
      orientationSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Scroll area readiness Radix ScrollArea Zag scroll-area viewport scrollbar thumb corner overflow scrollTop scrollLeft ResizeObserver pointer wheel tests");
    expect(report.scrollAreaSetups.some((item) => item.filePath === "src/radix-scroll-area.tsx" && item.framework === "radix-scroll-area" && item.scrollAreaCount > 0 && item.viewportCount > 0 && item.contentCount > 0 && item.scrollbarCount > 0 && item.thumbCount > 0 && item.cornerCount > 0 && item.orientationCount > 0 && item.overflowCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.scrollAreaSetups.some((item) => item.filePath === "src/zag-scroll-area.tsx" && item.framework === "zag-scroll-area" && item.scrollAreaCount > 0 && item.viewportCount > 0 && item.contentCount > 0 && item.scrollbarCount > 0 && item.thumbCount > 0 && item.cornerCount > 0 && item.orientationCount > 0 && item.overflowCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-scroll-area", "zag-scroll-area", "native-scroll"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "viewport", "content", "scrollbar", "thumb", "corner", "provider-context", "anatomy-parts"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["type", "scroll-hide-delay", "force-mount", "overflow-x", "overflow-y", "scrollbar-hidden", "scroll-progress", "data-state"]));
    expect(readySignals(report.measurementSignals)).toEqual(expect.arrayContaining(["resize-observer", "scroll-height", "scroll-width", "client-height", "client-width", "thumb-size", "thumb-offset", "corner-size", "ratio"]));
    expect(readySignals(report.orientationSignals)).toEqual(expect.arrayContaining(["vertical", "horizontal", "dir", "rtl", "data-orientation"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pointer", "wheel", "drag", "scroll-event", "scroll-to", "scroll-to-edge"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-presentation", "tabindex", "aria-label", "data-overflow", "data-ownedby"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "scroll-event-test", "wheel-test", "attribute-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-scroll-area", "@zag-js/scroll-area", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-scroll-area"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records scroll area readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "scroll-area-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "scroll-area-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "scroll-area-readiness.html"))).resolves.toBeUndefined();
    const scrollMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "scroll-area-readiness.md"), "utf8");
    expect(scrollMarkdown).toContain("Scroll Area Readiness");
    expect(scrollMarkdown).toContain("@radix-ui/react-scroll-area");
    const scrollHtml = await fs.readFile(path.join(result.session.outputPaths.html, "scroll-area-readiness.html"), "utf8");
    expect(scrollHtml).toContain("scroll-area-readiness-card");
    expect(scrollHtml).toContain("data-source-pattern=\"ScrollArea\"");
    expect(scrollHtml).toContain("RepoTutor records scroll area readiness only");
  });
});
