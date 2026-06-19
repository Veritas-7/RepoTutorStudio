// biome-ignore-all lint/suspicious/noTemplateCurlyInString: test fixtures assert literal template syntax from source snapshots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calculateQuizCount, runStudy } from "../index.js";

const fixtureRoot = path.resolve("packages/core/tests/fixtures/simple-ts-app");

describe("RepoTutor core pipeline - framework-and-state-readiness", () => {
  it("detects Hono server framework signals without executing route handlers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-hono-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-hono-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "hono-fixture",
      dependencies: {
        hono: "^4.7.0",
        "@hono/node-server": "^1.13.0",
        "@hono/zod-validator": "^0.4.0",
        zod: "^3.25.0"
      },
      devDependencies: {
        vitest: "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "app.ts"), [
      "import { Hono } from 'hono';",
      "import { hc } from 'hono/client';",
      "import { testClient } from 'hono/testing';",
      "import { validator } from 'hono/validator';",
      "import { jsxRenderer } from 'hono/jsx-renderer';",
      "import { zValidator } from '@hono/zod-validator';",
      "import { serve } from '@hono/node-server';",
      "import { z } from 'zod';",
      "",
      "type Bindings = { KV: KVNamespace };",
      "const app = new Hono<{ Bindings: Bindings }>();",
      "const api = new Hono().basePath('/v1');",
      "",
      "app.use('*', jsxRenderer());",
      "app.use('/api/*', async (c, next) => {",
      "  c.header('x-powered-by', 'repotutor');",
      "  await next();",
      "});",
      "",
      "api.get('/users/:id', (c) => {",
      "  const id = c.req.param('id');",
      "  const tab = c.req.query('tab');",
      "  return c.json({ id, tab });",
      "});",
      "",
      "const routes = api.post(",
      "  '/users',",
      "  validator('json', (value) => value),",
      "  zValidator('json', z.object({ name: z.string() })),",
      "  async (c) => {",
      "    const body = await c.req.json();",
      "    const valid = c.req.valid('json');",
      "    c.status(201);",
      "    return c.json({ body, valid }, 201);",
      "  }",
      ");",
      "",
      "api.get('/page', (c) => c.render(<h1>Learning</h1>));",
      "app.route('/api', api);",
      "app.notFound((c) => c.text('Not found', 404));",
      "app.onError((error, c) => c.json({ error: error.message }, 500));",
      "",
      "type AppType = typeof routes;",
      "export const client = hc<AppType>('http://localhost');",
      "export const tester = testClient(app);",
      "export const smoke = app.request('/api/v1/users/123');",
      "serve({ fetch: app.fetch, port: 3000 });",
      "export default app;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "worker.ts"), [
      "import app from './app';",
      "",
      "export default {",
      "  fetch(request: Request, env: unknown, ctx: ExecutionContext) {",
      "    return app.fetch(request, env, ctx);",
      "  }",
      "};"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      honoSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel");
    expect(report.sourcePattern).toContain("sails config/routes sails.config.routes sails.router.bind");
    expect(report.serverSetups.some((item) => item.framework === "hono" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "params"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "port"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "set-not-found-handler", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest"]));
    expect(readySignals(report.honoSignals)).toEqual(expect.arrayContaining(["app-instance", "method-routes", "route-groups", "base-path", "middleware-use", "context-request", "context-response", "validator", "zod-validator", "rpc-client", "test-client", "fetch-handler", "node-server", "cloudflare-worker", "jsx-renderer"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["hono"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Hono Signals");
    expect(markdown).toContain("zod-validator");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Hono Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Hapi server framework signals without starting the server", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-hapi-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-hapi-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "hapi-fixture",
      dependencies: {
        "@hapi/boom": "^10.0.1",
        "@hapi/hapi": "^21.4.9",
        "@hapi/inert": "^7.1.0",
        "@hapi/vision": "^7.0.3",
        joi: "^17.13.3"
      },
      devDependencies: {
        "@hapi/code": "^9.0.3",
        "@hapi/lab": "^25.3.2"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "server.js"), [
      "const Hapi = require('@hapi/hapi');",
      "const Boom = require('@hapi/boom');",
      "const Joi = require('joi');",
      "const Inert = require('@hapi/inert');",
      "const Vision = require('@hapi/vision');",
      "",
      "const server = Hapi.server({",
      "  port: process.env.PORT || 3000,",
      "  host: '127.0.0.1',",
      "  routes: {",
      "    cors: true,",
      "    validate: {",
      "      failAction: async (request, h, err) => { throw Boom.badRequest(err.message); }",
      "    }",
      "  }",
      "});",
      "",
      "server.validator(Joi);",
      "server.auth.scheme('custom', () => ({",
      "  authenticate: async (request, h) => h.authenticated({ credentials: { user: request.headers.authorization } })",
      "}));",
      "server.auth.strategy('default', 'custom');",
      "server.auth.default('default');",
      "server.state('sid', { ttl: 60 * 60 * 1000, isSecure: false });",
      "server.cache({ segment: 'users', expiresIn: 60 * 1000 });",
      "server.method('sum', (a, b) => a + b, { cache: { expiresIn: 1000 } });",
      "server.decorate('toolkit', 'success', function (value) { return this.response(value).code(200); });",
      "server.decorate('request', 'tenant', request => request.headers['x-tenant'], { apply: true });",
      "server.ext('onRequest', (request, h) => h.continue);",
      "server.ext('onPreAuth', (request, h) => h.continue);",
      "server.ext('onPostAuth', (request, h) => h.continue);",
      "server.ext('onPreHandler', (request, h) => h.continue);",
      "server.ext('onPreResponse', (request, h) => {",
      "  if (request.response.isBoom) return h.response({ error: request.response.message }).code(request.response.output.statusCode);",
      "  return h.continue;",
      "});",
      "",
      "const featurePlugin = {",
      "  name: 'featurePlugin',",
      "  register: async (srv, options) => {",
      "    srv.route([",
      "      { method: 'GET', path: '/users/{id}', options: {",
      "        auth: 'default',",
      "        plugins: { pagination: { enabled: true } },",
      "        validate: {",
      "          params: Joi.object({ id: Joi.string().required() }),",
      "          query: Joi.object({ redirect: Joi.boolean().default(false), fail: Joi.boolean().default(false) }),",
      "          payload: Joi.object({ name: Joi.string() }).optional(),",
      "          headers: Joi.object({ authorization: Joi.string().optional(), 'x-tenant': Joi.string().optional() }).unknown()",
      "        },",
      "        response: { status: { 200: Joi.object({ id: Joi.string(), tenant: Joi.any() }) } }",
      "      }, handler: (request, h) => {",
      "        if (request.query.fail) throw Boom.badRequest('bad query');",
      "        if (request.query.redirect) return h.redirect('/next');",
      "        const payload = request.payload;",
      "        return h.response({ id: request.params.id, tenant: request.tenant, payload, headers: request.headers }).state('sid', '1').code(200);",
      "      } },",
      "      { method: 'POST', path: '/users', options: { validate: { payload: Joi.object({ name: Joi.string().required() }) } }, handler: (request, h) => h.success(request.payload).code(201) },",
      "      { method: '*', path: '/{any*}', handler: (request, h) => h.response('missing').code(404) }",
      "    ]);",
      "  }",
      "};",
      "",
      "async function init() {",
      "  await server.register([{ plugin: Inert }, { plugin: Vision }, { plugin: featurePlugin, options: { message: 'hello' }, routes: { prefix: '/api' } }]);",
      "  const realmName = server.realm.plugin;",
      "  await server.start();",
      "  await server.inject({ method: 'GET', url: '/api/users/1', headers: { authorization: 'token' } });",
      "  return realmName;",
      "}",
      "",
      "init();",
      "module.exports = server;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "server.test.js"), [
      "const Lab = require('@hapi/lab');",
      "const Code = require('@hapi/code');",
      "const server = require('../src/server');",
      "const { describe, it } = exports.lab = Lab.script();",
      "",
      "describe('hapi server', () => {",
      "  it('injects a route', async () => {",
      "    const res = await server.inject({ method: 'GET', url: '/api/users/1', headers: { authorization: 'token' } });",
      "    Code.expect(res.statusCode).to.equal(200);",
      "  });",
      "});"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      hapiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Hapi.server server.route server.register server.ext server.auth server.method server.decorate server.state server.cache server.validator Joi h.response h.redirect request.params request.query request.payload request.headers Boom server.start server.inject Lab Code new Elysia group guard derive resolve model macro t.Object onBeforeHandle onAfterHandle onAfterResponse status redirect set.headers ws app.handle app.fetch treaty eden Bun.test @adonisjs/core router.get router.group router.resource middleware HttpContext request.validateUsing response.redirect ApplicationService BaseCommand testUtils Japa");
    expect(report.serverSetups.some((item) => item.framework === "hapi" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "all", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "host", "port"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "framework-errors", "validation-error", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["inject", "vitest"]));
    expect(readySignals(report.hapiSignals)).toEqual(expect.arrayContaining([
      "server-instance",
      "route-object",
      "route-array",
      "route-options",
      "validation-joi",
      "response-schema",
      "auth-scheme",
      "auth-strategy",
      "auth-default",
      "plugin-register",
      "plugin-options",
      "extension-points",
      "lifecycle-on-request",
      "lifecycle-on-pre-auth",
      "lifecycle-on-post-auth",
      "lifecycle-on-pre-handler",
      "lifecycle-on-pre-response",
      "server-method",
      "decorate",
      "state-cookie",
      "cache",
      "validator",
      "toolkit-response",
      "toolkit-redirect",
      "request-params",
      "request-query",
      "request-payload",
      "request-headers",
      "boom-error",
      "server-start",
      "server-inject",
      "lab-test",
      "code-assertions",
      "inert-vision",
      "realm-plugin"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@hapi/hapi"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Hapi Signals");
    expect(markdown).toContain("Hapi server instance");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Hapi Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Elysia server framework signals without starting Bun or handlers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-elysia-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-elysia-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "elysia-fixture",
      dependencies: {
        "@elysiajs/eden": "^1.4.8",
        elysia: "^1.4.28"
      },
      devDependencies: {
        "bun-types": "^1.3.0",
        vitest: "^4.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "server.ts"), [
      "import { Elysia, t } from 'elysia';",
      "import { treaty } from '@elysiajs/eden';",
      "",
      "const authPlugin = new Elysia({ name: 'auth-plugin' })",
      "  .state('counter', 0)",
      "  .decorate('db', { find: (id: string) => ({ id }) })",
      "  .model({ user: t.Object({ id: t.String(), name: t.String() }) })",
      "  .macro(({ onBeforeHandle }) => ({",
      "    requireAuth(enabled: boolean) {",
      "      if (enabled) onBeforeHandle(({ headers, status }) => headers.authorization ? undefined : status(401, { error: 'unauthorized' }));",
      "    }",
      "  }))",
      "  .derive(({ store }) => ({ requestId: `req-${store.counter}` }))",
      "  .resolve(({ headers }) => ({ tenant: headers['x-tenant'] ?? 'public' }))",
      "  .onRequest(({ set }) => { set.headers['x-requested'] = '1'; })",
      "  .onParse(() => undefined)",
      "  .onTransform(({ params }) => { params.id = params.id?.trim?.() ?? params.id; })",
      "  .onBeforeHandle(({ query, status }) => query.block ? status(400, { error: 'blocked' }) : undefined)",
      "  .onAfterHandle(({ set }) => { set.headers['x-after'] = '1'; })",
      "  .onAfterResponse(() => undefined)",
      "  .onError(({ code, error, status }) => status(500, { code, message: error.message }))",
      "  .get('/health', ({ status }) => status(200, { ok: true }), {",
      "    response: t.Object({ ok: t.Boolean() })",
      "  });",
      "",
      "const readContext = (context: { body: unknown; query: unknown; params: unknown; headers: Record<string, string>; cookie: Record<string, unknown> }) => [",
      "  context.body, context.query, context.params, context.headers, context.cookie",
      "];",
      "",
      "export const app = new Elysia({ prefix: '/api', aot: true })",
      "  .use(authPlugin)",
      "  .mount('/legacy', () => new Response('legacy'))",
      "  .group('/v1', (app) => app",
      "    .guard({",
      "      headers: t.Object({ authorization: t.Optional(t.String()), 'x-tenant': t.Optional(t.String()) }),",
      "      cookie: t.Object({ sid: t.Optional(t.String()) }),",
      "      beforeHandle: ({ headers, status }) => headers.authorization ? undefined : status(401, { error: 'auth' })",
      "    }, (app) => app",
      "      .get('/users/:id', ({ params, query, body, headers, cookie, set, redirect, requestId, tenant, db }) => {",
      "        readContext({ body, query, params, headers, cookie });",
      "        set.headers['x-tenant'] = tenant;",
      "        if (query.redirect) return redirect('/next');",
      "        return { id: params.id, tenant, cookie: cookie.sid?.value, requestId, user: db.find(params.id) };",
      "      }, {",
      "        requireAuth: true,",
      "        query: t.Object({ redirect: t.Optional(t.Boolean()), block: t.Optional(t.Boolean()) }),",
      "        params: t.Object({ id: t.String() }),",
      "        body: t.Optional(t.Object({ name: t.String() })),",
      "        headers: t.Object({ authorization: t.Optional(t.String()), 'x-tenant': t.Optional(t.String()) }),",
      "        cookie: t.Object({ sid: t.Optional(t.String()) }),",
      "        response: { 200: t.Object({ id: t.String(), tenant: t.String(), requestId: t.String(), user: t.Object({ id: t.String() }) }) }",
      "      })",
      "      .post('/users', ({ body, status }) => status(201, body), {",
      "        body: t.Object({ name: t.String() }),",
      "        response: { 201: t.Object({ name: t.String() }) }",
      "      })",
      "    )",
      "  )",
      "  .ws('/ws/:id', {",
      "    body: t.Object({ text: t.String() }),",
      "    message(ws, message) { ws.send(message.text); }",
      "  })",
      "  .listen({ port: 3000, hostname: '127.0.0.1' });",
      "",
      "export type App = typeof app;",
      "export const api = treaty<App>('http://localhost:3000');",
      "export const fetcher = app.fetch;",
      "export const handled = app.handle(new Request('http://localhost/api/v1/users/1'));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "server.test.ts"), [
      "import { describe, expect, it } from 'vitest';",
      "import { app } from '../src/server';",
      "",
      "Bun.test('bun smoke', () => {});",
      "",
      "describe('elysia server', () => {",
      "  it('handles a request through app.handle', async () => {",
      "    const response = await app.handle(new Request('http://localhost/api/v1/users/1'));",
      "    expect(response.status).toBe(200);",
      "  });",
      "});"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      elysiaSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("new Elysia group guard derive resolve model macro t.Object onBeforeHandle onAfterHandle onAfterResponse status redirect set.headers ws app.handle app.fetch treaty eden Bun.test @adonisjs/core router.get router.group router.resource middleware HttpContext request.validateUsing response.redirect ApplicationService BaseCommand testUtils Japa");
    expect(report.serverSetups.some((item) => item.framework === "elysia" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "params"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["on-request", "on-error"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "host", "port"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest"]));
    expect(readySignals(report.elysiaSignals)).toEqual(expect.arrayContaining([
      "app-instance",
      "method-routes",
      "route-options",
      "group",
      "guard",
      "plugin-use",
      "mount",
      "decorate",
      "state",
      "derive",
      "resolve",
      "model",
      "macro",
      "schema-typebox",
      "schema-body",
      "schema-query",
      "schema-params",
      "schema-headers",
      "schema-cookie",
      "schema-response",
      "lifecycle-on-request",
      "lifecycle-on-parse",
      "lifecycle-on-transform",
      "lifecycle-on-before-handle",
      "lifecycle-on-after-handle",
      "lifecycle-on-after-response",
      "lifecycle-on-error",
      "context-body",
      "context-query",
      "context-params",
      "context-headers",
      "context-cookie",
      "status-helper",
      "redirect-helper",
      "set-headers",
      "websocket",
      "listen",
      "handle",
      "fetch",
      "eden-treaty",
      "bun-test"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["elysia"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Elysia Signals");
    expect(markdown).toContain("Elysia app instance");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Elysia Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects AdonisJS server framework signals without booting the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-adonis-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-adonis-source-"));
    await fs.mkdir(path.join(sourceRoot, "start"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "controllers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "middleware"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "validators"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "commands"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "exceptions"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "providers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "bin"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests", "functional"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "adonis-fixture",
      dependencies: {
        "@adonisjs/core": "^7.3.4",
        "@adonisjs/lucid": "^21.0.0",
        "@vinejs/vine": "^3.0.0"
      },
      devDependencies: {
        "@japa/runner": "^4.0.0",
        supertest: "^7.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "start", "routes.ts"), [
      "import router from '@adonisjs/core/services/router';",
      "",
      "const UsersController = () => import('#controllers/users_controller');",
      "const middleware = router.named({",
      "  auth: async () => import('#middleware/auth_middleware'),",
      "  signed: async () => import('#middleware/signed_middleware'),",
      "  throttle: async () => import('#middleware/throttle_middleware')",
      "});",
      "",
      "router.get('/health', async ({ response }) => response.status(200).send({ ok: true })).as('health');",
      "router.on('/old-dashboard').redirect('/dashboard');",
      "",
      "router.group(() => {",
      "  router.get('/users/:id', [UsersController, 'show'])",
      "    .as('users.show')",
      "    .where('id', /^[0-9]+$/)",
      "    .middleware(middleware.auth());",
      "  router.post('/users', [UsersController, 'store'])",
      "    .as('users.store')",
      "    .middleware([middleware.auth(), middleware.signed()]);",
      "  router.resource('posts', '#controllers/posts_controller')",
      "    .apiOnly()",
      "    .middleware('*', middleware.throttle());",
      "})",
      "  .prefix('/api')",
      "  .middleware(middleware.auth());"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "start", "kernel.ts"), [
      "import server from '@adonisjs/core/services/server';",
      "import router from '@adonisjs/core/services/router';",
      "",
      "server.use([",
      "  () => import('#middleware/container_bindings_middleware'),",
      "]);",
      "",
      "export const middleware = router.named({",
      "  auth: async () => import('#middleware/auth_middleware')",
      "});",
      "",
      "server.listen();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "controllers", "users_controller.ts"), [
      "import type { HttpContext } from '@adonisjs/core/http';",
      "import { createUserValidator } from '#validators/user';",
      "",
      "export default class UsersController {",
      "  async show({ params, request, response }: HttpContext) {",
      "    const page = request.input('page');",
      "    const selected = request.only(['name', 'email']);",
      "    return response.status(200).send({ id: params.id, page, selected });",
      "  }",
      "",
      "  async store({ request, response }: HttpContext) {",
      "    const payload = await request.validateUsing(createUserValidator);",
      "    return response.created(payload);",
      "  }",
      "",
      "  async redirect({ response }: HttpContext) {",
      "    return response.redirect().toRoute('health');",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "middleware", "auth_middleware.ts"), [
      "import type { HttpContext } from '@adonisjs/core/http';",
      "import type { NextFn } from '@adonisjs/core/types/http';",
      "",
      "export default class AuthMiddleware {",
      "  async handle(ctx: HttpContext, next: NextFn) {",
      "    ctx.request.input('token');",
      "    return next();",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "validators", "user.ts"), [
      "import vine from '@vinejs/vine';",
      "",
      "export const createUserValidator = vine.compile(vine.object({",
      "  name: vine.string(),",
      "  email: vine.string().email()",
      "}));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "providers", "app_provider.ts"), [
      "import type { ApplicationService } from '@adonisjs/core/types';",
      "",
      "export default class AppProvider {",
      "  constructor(protected app: ApplicationService) {}",
      "  register() { this.app.container.singleton('repo', () => ({ ready: true })); }",
      "  async boot() {}",
      "  async start() {}",
      "  async ready() {}",
      "  async shutdown() {}",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "commands", "sync.ts"), [
      "import { BaseCommand } from '@adonisjs/core/ace';",
      "",
      "export default class SyncCommand extends BaseCommand {",
      "  static commandName = 'sync:users';",
      "  async run() { this.logger.info('sync'); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "bodyparser.ts"), [
      "import { defineConfig } from '@adonisjs/core/bodyparser';",
      "",
      "export default defineConfig({",
      "  allowedMethods: ['POST', 'PUT', 'PATCH'],",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "exceptions", "handler.ts"), [
      "import { ExceptionHandler } from '@adonisjs/core/http';",
      "",
      "export default class Handler extends ExceptionHandler {",
      "  async render(error: unknown, ctx: unknown) {",
      "    return super.render(error, ctx);",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "start", "health.ts"), [
      "import health from '@adonisjs/core/services/health';",
      "",
      "export const healthChecks = [health.check('app', async () => ({ healthy: true }))];"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "bin", "server.ts"), [
      "import { Ignitor } from '@adonisjs/core';",
      "",
      "new Ignitor(import.meta.url).createHttpServer().start();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "functional", "users.spec.ts"), [
      "import { test } from '@japa/runner';",
      "import testUtils from '@adonisjs/core/services/test_utils';",
      "import request from 'supertest';",
      "",
      "test.group('users', (group) => {",
      "  group.setup(() => testUtils.db().withGlobalTransaction());",
      "  test('GET /api/users/:id', async ({ client }) => {",
      "    const response = await client.get('/api/users/1');",
      "    response.assertStatus(200);",
      "    await request('http://localhost').get('/api/users/1');",
      "  });",
      "});"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      adonisSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("@adonisjs/core router.get router.group router.resource middleware HttpContext request.validateUsing response.redirect ApplicationService BaseCommand testUtils Japa");
    expect(report.serverSetups.some((item) => item.framework === "adonisjs" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "params", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["supertest", "tap"]));
    expect(readySignals(report.adonisSignals)).toEqual(expect.arrayContaining([
      "core-package",
      "router-service",
      "method-routes",
      "route-group",
      "route-prefix",
      "route-name",
      "resource-routes",
      "api-only-resource",
      "route-where",
      "route-middleware",
      "global-middleware",
      "named-middleware",
      "controller-string",
      "controller-lazy-import",
      "http-context",
      "request-input",
      "request-params",
      "request-validate-using",
      "response-status",
      "response-redirect",
      "bodyparser",
      "service-provider",
      "application-service",
      "ioc-container",
      "ace-command",
      "ignitor",
      "server-service",
      "vine-validation",
      "exception-handler",
      "health-check",
      "japa-test",
      "test-utils",
      "supertest"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@adonisjs/core"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## AdonisJS Signals");
    expect(markdown).toContain("AdonisJS core package");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("AdonisJS Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Sails server framework signals without lifting the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-sails-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-sails-source-"));
    await fs.mkdir(path.join(sourceRoot, "api", "controllers", "users"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "api", "controllers", "pages"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "api", "controllers", "sockets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "api", "helpers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "api", "hooks", "request-counter"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "api", "models"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "api", "policies"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "api", "services"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "api", "blueprints", "actions"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "lib"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test", "integration"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "sails-fixture",
      dependencies: {
        sails: "^1.5.18",
        waterline: "^0.15.2",
        "socket.io": "^4.8.1"
      },
      devDependencies: {
        mocha: "^11.0.0",
        supertest: "^7.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "app.js"), [
      "const sails = require('sails');",
      "",
      "sails.load({ port: 1337, hooks: { grunt: false } }, () => {});",
      "sails.lift({ port: 1337, host: '127.0.0.1', logger: true, log: { level: 'warn' } });",
      "sails.request({ method: 'GET', url: '/users/1', body: { name: 'Ada' } });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "routes.js"), [
      "module.exports.routes = {",
      "  'GET /': { view: 'pages/homepage' },",
      "  'GET /users/:id': { action: 'users/show' },",
      "  'POST /users': { controller: 'users', action: 'create' },",
      "  'PUT /users/:id': {",
      "    fn: async function(req, res) {",
      "      return res.json({ id: req.param('id'), body: req.body, query: req.query, headers: req.headers });",
      "    }",
      "  },",
      "  'GET /redirect': { redirect: '/users' }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "policies.js"), [
      "module.exports.policies = {",
      "  'users/*': ['is-logged-in']",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "blueprints.js"), [
      "module.exports.blueprints = {",
      "  actions: true,",
      "  rest: true,",
      "  shortcuts: false",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "hooks.js"), [
      "module.exports.hooks = { requestCounter: true };",
      "module.exports.installedHooks = {",
      "  'sails-hook-email': { name: 'emailHook' }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "controllers", "users", "show.js"), [
      "module.exports = {",
      "  inputs: {",
      "    id: { type: 'string', required: true }",
      "  },",
      "  exits: {",
      "    success: { responseType: 'ok' },",
      "    notFound: { statusCode: 404 }",
      "  },",
      "  fn: async function(inputs, exits) {",
      "    return exits.success({ id: inputs.id, model: User.identity });",
      "  }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "controllers", "users", "create.js"), [
      "module.exports = async function(req, res) {",
      "  const id = req.param('id');",
      "  const avatar = req.file('avatar');",
      "  if (!req.body.name) return res.status(400).json({ error: 'missing name', id, avatar });",
      "  return res.status(201).json({ ok: true, query: req.query });",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "controllers", "pages", "homepage.js"), [
      "module.exports = function(req, res) {",
      "  return res.view('pages/homepage');",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "controllers", "sockets", "join.js"), [
      "module.exports = function(req, res) {",
      "  sails.sockets.join(req, 'learning-room');",
      "  return res.json({ socketId: sails.sockets.getId(req) });",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "policies", "is-logged-in.js"), [
      "module.exports = function(req, res, next) {",
      "  if (!req.options) return res.forbidden();",
      "  return next();",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "hooks", "request-counter", "index.js"), [
      "module.exports = function(sails) {",
      "  return {",
      "    configure: function() { sails.config.custom = sails.config.custom || {}; },",
      "    initialize: function(cb) { sails.emit('hook:request-counter:loaded'); return cb(); },",
      "    routes: {",
      "      before: { 'GET /*': function(req, res, next) { return next(); } },",
      "      after: { 'GET /*': function(req, res, next) { return next(); } }",
      "    },",
      "    registerActions: function(cb) {",
      "      sails.registerAction({",
      "        inputs: { name: { type: 'string' } },",
      "        exits: { success: {} },",
      "        fn: async function(inputs) { return { name: inputs.name }; }",
      "      }, 'hello');",
      "      sails.registerActionMiddleware('audit', function(req, res, next) { return next(); });",
      "      return cb();",
      "    }",
      "  };",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "helpers", "format-user.js"), [
      "module.exports = {",
      "  friendlyName: 'Format user',",
      "  inputs: { name: { type: 'string' } },",
      "  exits: { success: {} },",
      "  fn: async function(inputs, exits) {",
      "    this.sails.log.info(inputs.name);",
      "    return exits.success(inputs.name.toUpperCase());",
      "  }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "models", "User.js"), [
      "const Waterline = require('waterline');",
      "module.exports = {",
      "  identity: 'user',",
      "  attributes: {",
      "    name: { type: 'string', required: true }",
      "  }",
      "};",
      "Waterline.Collection;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "services", "UserService.js"), [
      "module.exports = {",
      "  find(id) {",
      "    return sails.services.userService || { id };",
      "  }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "api", "blueprints", "actions", "find.js"), [
      "module.exports = function blueprintAction(req, res) {",
      "  return res.ok({ blueprint: true });",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "integration", "users.test.js"), [
      "const request = require('supertest');",
      "",
      "describe('sails users', function() {",
      "  it('requests a user without opening a new listener', async function() {",
      "    await sails.request({ method: 'GET', url: '/users/1' });",
      "    await request('http://localhost:1337').get('/users/1');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "lib", "router-note.js"), [
      "module.exports = function bindRoute(sails) {",
      "  sails.router.bind('GET /custom/:id', function(req, res) { return res.redirect('/users/' + req.param('id')); });",
      "  sails.router._privateRouter.get('/private', function(req, res) { return res.json({ ok: true }); });",
      "};"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      sailsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("sails config/routes sails.config.routes sails.router.bind sails.lift sails.load actions2 inputs exits fn policies blueprints hooks helpers Waterline res.view res.json sails.request");
    expect(report.serverSetups.some((item) => item.framework === "sails" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "put", "route", "params"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation", "plugin-options"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "host", "port", "logger"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["supertest", "vitest"]));
    expect(readySignals(report.sailsSignals)).toEqual(expect.arrayContaining([
      "package",
      "lift-load",
      "config-routes",
      "route-address",
      "router-bind",
      "router-private",
      "action-classic",
      "action2-inputs",
      "action2-exits",
      "action2-fn",
      "register-action",
      "action-middleware",
      "policies-config",
      "policy-file",
      "blueprints-config",
      "blueprint-actions",
      "hooks-config",
      "hook-routes",
      "hook-initialize",
      "helpers",
      "models-waterline",
      "services",
      "request-param",
      "request-body-query",
      "request-file",
      "response-json",
      "response-view",
      "response-redirect",
      "response-status",
      "sockets",
      "sails-request",
      "mocha-test"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["sails"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Sails Signals");
    expect(markdown).toContain("Sails package evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Sails Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Meteor server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-meteor-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-meteor-source-"));
    await fs.mkdir(path.join(sourceRoot, ".meteor"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "client"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "imports", "api", "tasks"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "packages", "local-feature"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "server"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "meteor-fixture",
      scripts: {
        start: "meteor run --settings settings.json",
        test: "meteor test --once --driver-package meteortesting:mocha",
        "test:packages": "meteor test-packages ./packages/local-feature"
      },
      dependencies: {
        "@babel/runtime": "^7.26.0",
        meteor: "^3.3.2"
      },
      meteor: {
        mainModule: {
          server: "server/main.js",
          client: "client/main.js"
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".meteor", "packages"), [
      "meteor-base",
      "mongo",
      "ddp",
      "webapp",
      "accounts-password",
      "blaze-html-templates",
      "tracker",
      "check",
      "tinytest"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".meteor", "versions"), [
      "meteor@3.3.2",
      "ddp@1.4.4",
      "mongo@2.1.0",
      "webapp@2.0.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "settings.json"), JSON.stringify({
      public: {
        appName: "RepoTutor Meteor",
        peerUrl: "https://example.meteor.local"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "imports", "api", "tasks", "tasks.js"), [
      "import { Mongo } from 'meteor/mongo';",
      "",
      "export const Tasks = new Mongo.Collection('tasks');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "server", "main.js"), [
      "import { Meteor } from 'meteor/meteor';",
      "import { DDP } from 'meteor/ddp';",
      "import { WebApp } from 'meteor/webapp';",
      "import { Accounts } from 'meteor/accounts-base';",
      "import { check, Match } from 'meteor/check';",
      "import { Tasks } from '../imports/api/tasks/tasks';",
      "",
      "Meteor.startup(() => {",
      "  console.log(Meteor.settings.public.appName, process.env.PORT);",
      "});",
      "",
      "Meteor.methods({",
      "  'tasks.insert'(text, options = {}) {",
      "    check(text, String);",
      "    check(options, Match.Optional(Object));",
      "    if (!this.userId) throw new Meteor.Error('not-authorized', 'Login required');",
      "    return Tasks.insert({ text, owner: this.userId, createdAt: new Date() });",
      "  }",
      "});",
      "",
      "Meteor.publish('tasks.mine', function() {",
      "  if (!this.userId) return this.ready();",
      "  return Tasks.find({ owner: this.userId });",
      "});",
      "",
      "WebApp.connectHandlers.use('/health', (req, res) => {",
      "  res.writeHead(200, { 'Content-Type': 'application/json' });",
      "  res.end(JSON.stringify({ ok: true, url: req.url }));",
      "});",
      "",
      "Accounts.onCreateUser((options, user) => ({ ...user, profile: options.profile }));",
      "const peer = DDP.connect(Meteor.settings.public.peerUrl);",
      "peer.call('tasks.insert', 'remote seed');",
      "if (Meteor.isServer) console.log('__meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "client", "main.js"), [
      "import { Meteor } from 'meteor/meteor';",
      "import { Tracker } from 'meteor/tracker';",
      "import { Template } from 'meteor/templating';",
      "import { Blaze } from 'meteor/blaze';",
      "import { Tasks } from '../imports/api/tasks/tasks';",
      "",
      "Meteor.subscribe('tasks.mine');",
      "Meteor.call('tasks.insert', 'hello');",
      "Meteor.apply('tasks.insert', ['from apply']);",
      "if (Meteor.isClient) console.log(__meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL);",
      "",
      "Tracker.autorun(() => {",
      "  Tasks.find().fetch();",
      "  Tracker.flush();",
      "});",
      "",
      "Template.taskList.onCreated(function() {",
      "  this.state = new ReactiveVar('ready');",
      "});",
      "Template.taskList.onRendered(function() {",
      "  console.log(this.state.get());",
      "});",
      "Template.taskList.events({",
      "  'click .add-task'(event) {",
      "    Meteor.call('tasks.insert', event.currentTarget.dataset.text);",
      "  }",
      "});",
      "Template.taskList.helpers({",
      "  tasks() { return Tasks.find(); }",
      "});",
      "Blaze.render(Template.taskList, document.body);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "packages", "local-feature", "package.js"), [
      "Package.describe({",
      "  name: 'local:feature',",
      "  summary: 'Local Meteor package for RepoTutor fixture',",
      "  version: '0.0.1'",
      "});",
      "",
      "Package.onUse(function(api) {",
      "  api.use(['meteor', 'ddp', 'mongo', 'webapp']);",
      "  api.addFiles('server.js', 'server');",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "tasks.tests.js"), [
      "import { Tinytest } from 'meteor/tinytest';",
      "import { Meteor } from 'meteor/meteor';",
      "import { Tasks } from '../imports/api/tasks/tasks';",
      "",
      "Tinytest.add('tasks collection exists', (test) => {",
      "  test.isTrue(Boolean(Tasks));",
      "});",
      "",
      "Tinytest.addAsync('tasks method can be called', async (test, next) => {",
      "  Meteor.callAsync('tasks.insert', 'from test').finally(next);",
      "});"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      meteorSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Meteor.startup Meteor.methods Meteor.publish Meteor.subscribe DDP.connect Mongo.Collection WebApp.connectHandlers check Match Tracker.autorun Template.events Template.helpers Blaze.render Tinytest meteor test");
    expect(report.serverSetups.some((item) => item.framework === "meteor" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["route"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation", "plugin-options"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "port"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "framework-errors"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["tinytest"]));
    expect(readySignals(report.meteorSignals)).toEqual(expect.arrayContaining([
      "package",
      "meteor-directory",
      "package-list",
      "main-module",
      "startup",
      "methods",
      "method-call",
      "method-apply",
      "publish",
      "subscribe",
      "ddp-connect",
      "ddp-runtime-config",
      "mongo-collection",
      "accounts",
      "settings",
      "is-client-server",
      "webapp-handlers",
      "check-match",
      "tracker-autorun",
      "template-lifecycle",
      "template-events",
      "template-helpers",
      "blaze-render",
      "package-describe",
      "package-on-use",
      "api-use",
      "api-add-files",
      "tinytest",
      "meteor-test"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["meteor"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Meteor Signals");
    expect(markdown).toContain("Meteor package/API evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Meteor Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Rails server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-rails-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-rails-source-"));
    await fs.mkdir(path.join(sourceRoot, "app", "controllers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "models"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "jobs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "mailers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "channels", "application_cable"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "bin"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config", "environments"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "db", "migrate"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "lib", "blog"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "lib", "tasks"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "spec", "requests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test", "controllers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test", "fixtures"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test", "models"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "Gemfile"), [
      "source 'https://rubygems.org'",
      "gem 'rails', '~> 8.2.0.alpha'",
      "gem 'puma'",
      "gem 'rspec-rails', group: [:test]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config.ru"), [
      "require_relative 'config/environment'",
      "run Rails.application"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "bin", "rails"), [
      "#!/usr/bin/env ruby",
      "APP_PATH = File.expand_path('../config/application', __dir__)",
      "require_relative '../config/boot'",
      "require 'rails/commands'",
      "# bin/rails server and rails routes are intentionally not executed by this fixture"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "application.rb"), [
      "require_relative 'boot'",
      "require 'rails/all'",
      "",
      "module Blog",
      "  class Application < Rails::Application",
      "    config.load_defaults 8.2",
      "    config.active_job.queue_adapter = :async",
      "    config.action_mailer.default_url_options = { host: 'example.test' }",
      "    config.secret_key_base = Rails.application.credentials.secret_key_base",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "routes.rb"), [
      "Rails.application.routes.draw do",
      "  root 'posts#index'",
      "  get '/health', to: 'health#show'",
      "  post '/preview', to: 'posts#preview'",
      "  resources :posts do",
      "    member do",
      "      patch :publish",
      "    end",
      "    collection do",
      "      get :recent",
      "    end",
      "  end",
      "  namespace :admin do",
      "    resources :posts",
      "  end",
      "  scope module: 'api', path: '/api' do",
      "    resources :posts, only: [:index]",
      "  end",
      "  mount ActionCable.server => '/cable'",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "environments", "development.rb"), [
      "Rails.application.configure do",
      "  config.hosts << 'example.test'",
      "  config.action_controller.perform_caching = false",
      "  config.active_record.verbose_query_logs = true",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "controllers", "application_controller.rb"), [
      "class ApplicationController < ActionController::Base",
      "  before_action :authenticate_user",
      "  rescue_from ActiveRecord::RecordNotFound, with: :not_found",
      "",
      "  private",
      "",
      "  def authenticate_user",
      "    head :unauthorized unless current_user",
      "  end",
      "",
      "  def not_found",
      "    render json: { error: 'not found' }, status: :not_found",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "controllers", "posts_controller.rb"), [
      "class PostsController < ApplicationController",
      "  before_action :set_post, only: [:show, :publish]",
      "",
      "  def index",
      "    render json: Post.recent",
      "  end",
      "",
      "  def create",
      "    post = Post.create!(post_params)",
      "    redirect_to post_path(post)",
      "  end",
      "",
      "  def publish",
      "    PublishPostJob.perform_later(@post.id)",
      "    head :accepted",
      "  end",
      "",
      "  private",
      "",
      "  def set_post",
      "    @post = Post.find(params[:id])",
      "  end",
      "",
      "  def post_params",
      "    params.require(:post).permit(:title, :body, :cover)",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "models", "application_record.rb"), [
      "class ApplicationRecord < ActiveRecord::Base",
      "  primary_abstract_class",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "models", "post.rb"), [
      "class Post < ApplicationRecord",
      "  has_many :comments, dependent: :destroy",
      "  belongs_to :user, optional: true",
      "  has_one_attached :cover",
      "  validates :title, presence: true",
      "  scope :recent, -> { order(created_at: :desc) }",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "db", "migrate", "20260608000000_create_posts.rb"), [
      "class CreatePosts < ActiveRecord::Migration[8.2]",
      "  def change",
      "    create_table :posts do |t|",
      "      t.string :title, null: false",
      "      t.text :body",
      "      t.references :user",
      "      t.timestamps",
      "    end",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "db", "schema.rb"), [
      "ActiveRecord::Schema[8.2].define(version: 2026_06_08_000000) do",
      "  create_table 'posts', force: :cascade do |t|",
      "    t.string 'title'",
      "    t.text 'body'",
      "    t.datetime 'created_at'",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "jobs", "publish_post_job.rb"), [
      "class PublishPostJob < ActiveJob::Base",
      "  queue_as :default",
      "  def perform(post_id)",
      "    Post.find(post_id).touch(:published_at)",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "mailers", "application_mailer.rb"), [
      "class ApplicationMailer < ActionMailer::Base",
      "  default from: 'from@example.test'",
      "  layout 'mailer'",
      "  def welcome(user)",
      "    mail(to: user.email, subject: 'Welcome').deliver_later",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "channels", "application_cable", "connection.rb"), [
      "module ApplicationCable",
      "  class Connection < ActionCable::Connection::Base",
      "    identified_by :current_user",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "channels", "posts_channel.rb"), [
      "class PostsChannel < ApplicationCable::Channel",
      "  def subscribed",
      "    stream_from 'posts'",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "lib", "blog", "engine.rb"), [
      "module Blog",
      "  class Engine < Rails::Engine",
      "    isolate_namespace Blog",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "lib", "blog", "railtie.rb"), [
      "module Blog",
      "  class Railtie < Rails::Railtie",
      "    initializer 'blog.configure_controller' do",
      "      ActiveSupport.on_load(:action_controller_base) { helper Blog::Engine.helpers }",
      "    end",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "lib", "tasks", "posts.rake"), [
      "namespace :posts do",
      "  task cleanup: :environment do",
      "    Post.where(title: nil).delete_all",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "controllers", "posts_controller_test.rb"), [
      "require 'test_helper'",
      "",
      "class PostsControllerTest < ActionDispatch::IntegrationTest",
      "  test 'gets index' do",
      "    get posts_url",
      "    assert_response :success",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "models", "post_test.rb"), [
      "require 'test_helper'",
      "",
      "class PostTest < ActiveSupport::TestCase",
      "  fixtures :posts",
      "  test 'validates title' do",
      "    assert_difference('Post.count') { Post.create!(title: 'Hello') }",
      "  end",
      "end"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "fixtures", "posts.yml"), [
      "hello:",
      "  title: Hello"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "spec", "requests", "posts_spec.rb"), [
      "require 'rails_helper'",
      "",
      "RSpec.describe 'Posts', type: :request do",
      "  it 'lists posts' do",
      "    get posts_path",
      "    expect(response).to have_http_status(:ok)",
      "  end",
      "end"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      railsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Rails.application.routes.draw resources namespace scope root ActionController::Base ApplicationController before_action params.require permit render json redirect_to ActiveRecord::Base ApplicationRecord has_many belongs_to validates ActiveJob::Base ActionMailer::Base ActionCable ActiveSupport::TestCase ActionDispatch::IntegrationTest Django urlpatterns path re_path include reverse resolve INSTALLED_APPS MIDDLEWARE ROOT_URLCONF settings.configure DJANGO_SETTINGS_MODULE models.Model ForeignKey ManyToManyField QuerySet Manager forms.Form forms.ModelForm MiddlewareMixin process_request process_response admin.site.register ModelAdmin migrations.Migration BaseCommand django-admin manage.py TestCase Client RequestFactory");
    expect(report.serverSetups.some((item) => item.framework === "rails" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "patch", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "params", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["host"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "framework-errors"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["rails-test"]));
    expect(readySignals(report.railsSignals)).toEqual(expect.arrayContaining([
      "gem",
      "application-class",
      "routes-draw",
      "route-resources",
      "route-member-collection",
      "route-namespace",
      "route-scope",
      "route-root",
      "route-mount",
      "controller-base",
      "controller-action",
      "before-action",
      "strong-parameters",
      "render",
      "redirect",
      "rescue-from",
      "model-base",
      "associations",
      "validations",
      "migration",
      "schema",
      "active-job",
      "action-mailer",
      "action-cable",
      "active-storage",
      "engine",
      "railtie",
      "environment-config",
      "credentials",
      "rake-task",
      "rails-command",
      "integration-test",
      "active-support-test",
      "fixtures",
      "rspec-rails"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["rails"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Rails Signals");
    expect(markdown).toContain("## Django Signals");
    expect(markdown).toContain("Rails gem/package evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Rails Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Django server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-django-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-django-source-"));
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "blog", "management", "commands"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "blog", "migrations"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "blog", "templates", "blog"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "blog", "static", "blog"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "blog", "fixtures"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"Django\"",
      "description = \"A high-level Python web framework that encourages rapid development and clean, pragmatic design.\"",
      "dependencies = [\"Django>=5.2\"]",
      "",
      "[project.scripts]",
      "django-admin = \"django.core.management:execute_from_command_line\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "manage.py"), [
      "#!/usr/bin/env python",
      "import os",
      "from django.core.management import execute_from_command_line",
      "",
      "os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')",
      "execute_from_command_line(['manage.py', 'runserver'])",
      "# django-admin runserver and python -m django are intentionally not executed by this fixture"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "settings.py"), [
      "from pathlib import Path",
      "",
      "BASE_DIR = Path(__file__).resolve().parent.parent",
      "SECRET_KEY = 'test-secret'",
      "ROOT_URLCONF = 'config.urls'",
      "ASGI_APPLICATION = 'config.asgi.application'",
      "WSGI_APPLICATION = 'config.wsgi.application'",
      "INSTALLED_APPS = [",
      "    'django.contrib.admin',",
      "    'django.contrib.staticfiles',",
      "    'blog.apps.BlogConfig',",
      "]",
      "MIDDLEWARE = [",
      "    'django.middleware.security.SecurityMiddleware',",
      "    'blog.middleware.AuditMiddleware',",
      "]",
      "DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}",
      "TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'APP_DIRS': True}]",
      "STATIC_URL = 'static/'",
      "STATICFILES_DIRS = [BASE_DIR / 'assets']"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "urls.py"), [
      "from django.contrib import admin",
      "from django.urls import include, path, re_path, reverse, resolve",
      "from blog import views",
      "",
      "handler404 = 'blog.views.not_found'",
      "urlpatterns = [",
      "    path('admin/', admin.site.urls),",
      "    path('', views.PostListView.as_view(), name='post-list'),",
      "    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),",
      "    path('blog/', include('blog.urls')),",
      "    re_path(r'^legacy/(?P<slug>[-a-z0-9]+)/$', views.legacy, name='legacy'),",
      "]",
      "reverse('post-list')",
      "resolve('/blog/')"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "asgi.py"), [
      "import os",
      "from django.core.asgi import get_asgi_application",
      "os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')",
      "application = get_asgi_application()"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "wsgi.py"), [
      "import os",
      "from django.core.wsgi import get_wsgi_application",
      "os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')",
      "application = get_wsgi_application()"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "apps.py"), [
      "from django.apps import AppConfig",
      "",
      "class BlogConfig(AppConfig):",
      "    name = 'blog'",
      "    def ready(self):",
      "        pass"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "urls.py"), [
      "from django.urls import path",
      "from . import views",
      "",
      "urlpatterns = [",
      "    path('health/', views.health, name='health'),",
      "    path('posts/', views.PostListView.as_view(), name='blog-posts'),",
      "]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "views.py"), [
      "from django.contrib.auth.decorators import login_required",
      "from django.core.exceptions import PermissionDenied",
      "from django.http import Http404, HttpResponse, JsonResponse",
      "from django.shortcuts import redirect, render",
      "from django.views import View",
      "from django.views.generic import ListView",
      "from .forms import PostForm, SearchForm",
      "from .models import Post",
      "",
      "def health(request):",
      "    return JsonResponse({'ok': True})",
      "",
      "@login_required",
      "def legacy(request, slug):",
      "    form = SearchForm(request.POST or None)",
      "    if form.is_valid():",
      "        return redirect('post-list')",
      "    return HttpResponse(slug)",
      "",
      "def not_found(request, exception):",
      "    raise Http404('missing')",
      "",
      "class PostListView(ListView):",
      "    model = Post",
      "    template_name = 'blog/list.html'",
      "",
      "class PostDetailView(View):",
      "    def get(self, request, pk):",
      "        if not request.user.is_authenticated:",
      "            raise PermissionDenied('login required')",
      "        post = Post.objects.select_related('author').get(pk=pk)",
      "        return render(request, 'blog/detail.html', {'post': post})",
      "",
      "    def post(self, request, pk):",
      "        form = PostForm(request.POST)",
      "        if form.is_valid():",
      "            form.save()",
      "            return redirect('post-detail', pk=pk)",
      "        return render(request, 'blog/form.html', {'form': form})"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "models.py"), [
      "from django.contrib.auth import get_user_model",
      "from django.db import models",
      "",
      "class PublishedQuerySet(models.QuerySet):",
      "    def visible(self):",
      "        return self.filter(is_public=True)",
      "",
      "class Post(models.Model):",
      "    title = models.CharField(max_length=200)",
      "    body = models.TextField()",
      "    created_at = models.DateTimeField(auto_now_add=True)",
      "    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)",
      "    tags = models.ManyToManyField('Tag')",
      "    objects = PublishedQuerySet.as_manager()",
      "",
      "    class Meta:",
      "        ordering = ['-created_at']",
      "        indexes = [models.Index(fields=['title'])]",
      "",
      "class Tag(models.Model):",
      "    name = models.CharField(max_length=50)"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "forms.py"), [
      "from django import forms",
      "from .models import Post",
      "",
      "class SearchForm(forms.Form):",
      "    q = forms.CharField(required=False)",
      "",
      "    def clean_q(self):",
      "        value = self.cleaned_data.get('q')",
      "        if value == 'bad':",
      "            raise forms.ValidationError('bad query')",
      "        return value",
      "",
      "class PostForm(forms.ModelForm):",
      "    class Meta:",
      "        model = Post",
      "        fields = ['title', 'body']",
      "",
      "    def clean(self):",
      "        return super().clean()"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "middleware.py"), [
      "from django.utils.deprecation import MiddlewareMixin",
      "",
      "class AuditMiddleware(MiddlewareMixin):",
      "    def __init__(self, get_response):",
      "        self.get_response = get_response",
      "",
      "    def __call__(self, request):",
      "        return self.get_response(request)",
      "",
      "    def process_request(self, request):",
      "        request.audit_seen = True",
      "",
      "    def process_response(self, request, response):",
      "        return response",
      "",
      "    def process_view(self, request, view_func, view_args, view_kwargs):",
      "        return None",
      "",
      "    def process_exception(self, request, exception):",
      "        return None"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "admin.py"), [
      "from django.contrib import admin",
      "from .models import Post, Tag",
      "",
      "@admin.register(Post)",
      "class PostAdmin(admin.ModelAdmin):",
      "    list_display = ['title', 'created_at']",
      "    list_filter = ['created_at']",
      "    search_fields = ['title']",
      "",
      "admin.site.register(Tag)",
      "admin.site.urls"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "migrations", "0001_initial.py"), [
      "from django.db import migrations, models",
      "",
      "class Migration(migrations.Migration):",
      "    dependencies = []",
      "    operations = [",
      "        migrations.CreateModel(",
      "            name='Post',",
      "            fields=[('id', models.BigAutoField(primary_key=True)), ('title', models.CharField(max_length=200))],",
      "        ),",
      "        migrations.AddField('Post', 'body', models.TextField(default='')),",
      "        migrations.RunPython(lambda apps, schema_editor: None),",
      "    ]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "management", "commands", "publish_posts.py"), [
      "from django.core.management import BaseCommand, call_command",
      "",
      "class Command(BaseCommand):",
      "    help = 'Publish posts'",
      "    def handle(self, *args, **options):",
      "        call_command('check')"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "templates", "blog", "list.html"), [
      "{% extends 'base.html' %}",
      "{% block content %}",
      "{{ object_list }}",
      "{% endblock %}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "static", "blog", "app.css"), "body { color: #111; }\n");
    await fs.writeFile(path.join(sourceRoot, "blog", "fixtures", "posts.json"), "[{\"model\":\"blog.post\",\"pk\":1,\"fields\":{\"title\":\"Hello\"}}]\n");
    await fs.writeFile(path.join(sourceRoot, "blog", "tests.py"), [
      "from django.test import Client, RequestFactory, TestCase, TransactionTestCase, SimpleTestCase, override_settings",
      "from django.core.management import call_command",
      "from .forms import SearchForm",
      "",
      "@override_settings(ROOT_URLCONF='config.urls')",
      "class PostTests(TestCase):",
      "    fixtures = ['posts.json']",
      "",
      "    def test_index(self):",
      "        client = Client()",
      "        response = self.client.get('/')",
      "        self.assertTemplateUsed(response, 'blog/list.html')",
      "        self.assertRedirects(client.get('/old/'), '/')",
      "        form = SearchForm({'q': 'ok'})",
      "        self.assertTrue(form.is_valid())",
      "        call_command('loaddata', 'posts')",
      "",
      "class FactoryTests(TransactionTestCase):",
      "    def test_factory(self):",
      "        request = RequestFactory().get('/posts/1/')",
      "        self.assertEqual(request.method, 'GET')",
      "",
      "class SmokeTests(SimpleTestCase):",
      "    def test_true(self):",
      "        self.assertTrue(True)"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      djangoSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Django urlpatterns path re_path include reverse resolve INSTALLED_APPS MIDDLEWARE ROOT_URLCONF settings.configure DJANGO_SETTINGS_MODULE models.Model ForeignKey ManyToManyField QuerySet Manager forms.Form forms.ModelForm MiddlewareMixin process_request process_response admin.site.register ModelAdmin migrations.Migration BaseCommand django-admin manage.py TestCase Client RequestFactory");
    expect(report.serverSetups.some((item) => item.framework === "django" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["route", "params"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "set-not-found-handler", "framework-errors", "validation-error"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["django-test"]));
    expect(readySignals(report.djangoSignals)).toEqual(expect.arrayContaining([
      "package",
      "settings-module",
      "installed-apps",
      "urlconf",
      "path-route",
      "re-path-route",
      "include-route",
      "reverse-resolve",
      "function-view",
      "class-view",
      "generic-view",
      "render",
      "redirect",
      "http-response",
      "json-response",
      "http404-permission",
      "model-base",
      "fields",
      "relationships",
      "queryset-manager",
      "model-meta",
      "forms",
      "modelform",
      "form-validation",
      "middleware",
      "middleware-hooks",
      "admin",
      "admin-options",
      "migration",
      "migration-operations",
      "management-command",
      "django-admin",
      "template",
      "static-files",
      "asgi-wsgi",
      "testcase",
      "test-client",
      "request-factory",
      "override-settings",
      "fixtures"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["django"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Django Signals");
    expect(markdown).toContain("Django package/import evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Django Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Laravel server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-laravel-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-laravel-source-"));
    await fs.mkdir(path.join(sourceRoot, "bootstrap"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "routes"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Http", "Controllers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Http", "Requests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Http", "Middleware"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Providers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Models"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Console", "Commands"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Jobs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Mail"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Notifications"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "Events"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "database", "migrations"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "database", "factories"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "database", "seeders"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "resources", "views", "posts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests", "Feature"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "composer.json"), JSON.stringify({
      name: "repotutor/laravel-fixture",
      require: {
        "laravel/framework": "^13.0"
      },
      requireDev: {
        "pestphp/pest": "^4.0",
        "phpunit/phpunit": "^12.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "artisan"), [
      "#!/usr/bin/env php",
      "<?php",
      "use Illuminate\\Foundation\\Application;",
      "$app = require __DIR__.'/bootstrap/app.php';",
      "$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->handle();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "bootstrap", "app.php"), [
      "<?php",
      "use Illuminate\\Foundation\\Application;",
      "use Illuminate\\Foundation\\Configuration\\Middleware;",
      "return Application::configure(basePath: dirname(__DIR__))",
      "  ->withRouting(web: __DIR__.'/../routes/web.php', api: __DIR__.'/../routes/api.php', commands: __DIR__.'/../routes/console.php')",
      "  ->withMiddleware(function (Middleware $middleware) {",
      "    $middleware->alias(['learner' => App\\Http\\Middleware\\EnsureLearner::class]);",
      "  })",
      "  ->create();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "routes", "web.php"), [
      "<?php",
      "use Illuminate\\Support\\Facades\\Route;",
      "use App\\Http\\Controllers\\PostController;",
      "",
      "Route::middleware(['web', 'learner'])->prefix('learn')->name('learn.')->group(function () {",
      "  Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');",
      "  Route::post('/posts', [PostController::class, 'store'])->name('posts.store');",
      "  Route::resource('lessons', PostController::class)->only(['index', 'show']);",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "routes", "api.php"), [
      "<?php",
      "use Illuminate\\Support\\Facades\\Route;",
      "$router->get('/health', fn () => response()->json(['ok' => true], 200));",
      "Route::apiResource('posts', App\\Http\\Controllers\\PostController::class)->middleware('auth:sanctum');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "routes", "console.php"), [
      "<?php",
      "use Illuminate\\Support\\Facades\\Artisan;",
      "use Illuminate\\Console\\Scheduling\\Schedule;",
      "Artisan::command('lessons:sync', fn () => $this->comment('synced'));",
      "app(Schedule::class)->command('queue:work')->daily();",
      "app(Schedule::class)->job(new App\\Jobs\\PublishPost(1))->hourly();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Http", "Controllers", "PostController.php"), [
      "<?php",
      "namespace App\\Http\\Controllers;",
      "use App\\Http\\Requests\\StorePostRequest;",
      "use App\\Models\\Post;",
      "class PostController extends Controller {",
      "  public function show(Post $post) {",
      "    abort_if(!$post->published, 404);",
      "    return response()->json(['post' => $post], 200);",
      "  }",
      "  public function store(StorePostRequest $request) {",
      "    $post = Post::query()->create($request->validated());",
      "    return redirect()->route('learn.posts.show', ['post' => $post]);",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Http", "Requests", "StorePostRequest.php"), [
      "<?php",
      "namespace App\\Http\\Requests;",
      "use Illuminate\\Foundation\\Http\\FormRequest;",
      "use Illuminate\\Support\\Facades\\Validator;",
      "class StorePostRequest extends FormRequest {",
      "  public function authorize(): bool { return true; }",
      "  public function rules(): array { return ['title' => ['required'], 'body' => ['required']]; }",
      "  public function manual(array $data) { return Validator::make($data, $this->rules())->validate(); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Http", "Middleware", "EnsureLearner.php"), [
      "<?php",
      "namespace App\\Http\\Middleware;",
      "use Closure;",
      "class EnsureLearner {",
      "  public function handle($request, Closure $next) {",
      "    return $next($request);",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Providers", "AppServiceProvider.php"), [
      "<?php",
      "namespace App\\Providers;",
      "use Illuminate\\Support\\ServiceProvider;",
      "use Illuminate\\Support\\Facades\\Event;",
      "use Illuminate\\Support\\Facades\\Cache;",
      "class AppServiceProvider extends ServiceProvider {",
      "  public function register(): void {",
      "    $this->app->singleton('lesson.cache', fn () => new \\stdClass());",
      "  }",
      "  public function boot(): void {",
      "    config('app.name');",
      "    Cache::remember('lessons.ready', 60, fn () => true);",
      "    session(['lessons' => 'ready']);",
      "    Event::listen(App\\Events\\PostPublished::class, App\\Listeners\\SendPostNotification::class);",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Models", "Post.php"), [
      "<?php",
      "namespace App\\Models;",
      "use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;",
      "use Illuminate\\Database\\Eloquent\\Model;",
      "class Post extends Model {",
      "  use HasFactory;",
      "  protected $fillable = ['title', 'body', 'published'];",
      "  protected $guarded = ['id'];",
      "  protected function casts(): array { return ['published' => 'boolean']; }",
      "  public function user() { return $this->belongsTo(User::class); }",
      "  public function comments() { return $this->hasMany(Comment::class); }",
      "  public function scopePublished($query) { return $query->where('published', true); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "database", "migrations", "2026_06_08_000000_create_posts_table.php"), [
      "<?php",
      "use Illuminate\\Database\\Migrations\\Migration;",
      "use Illuminate\\Database\\Schema\\Blueprint;",
      "use Illuminate\\Support\\Facades\\Schema;",
      "return new class extends Migration {",
      "  public function up(): void {",
      "    Schema::create('posts', function (Blueprint $table) {",
      "      $table->id();",
      "      $table->string('title');",
      "      $table->text('body');",
      "      $table->foreignId('user_id');",
      "      $table->timestamps();",
      "      $table->softDeletes();",
      "    });",
      "  }",
      "  public function down(): void { Schema::dropIfExists('posts'); }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "database", "factories", "PostFactory.php"), [
      "<?php",
      "namespace Database\\Factories;",
      "use App\\Models\\Post;",
      "use Illuminate\\Database\\Eloquent\\Factories\\Factory;",
      "class PostFactory extends Factory {",
      "  protected $model = Post::class;",
      "  public function definition(): array { return ['title' => 'A', 'body' => 'B']; }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "database", "seeders", "DatabaseSeeder.php"), [
      "<?php",
      "namespace Database\\Seeders;",
      "use Illuminate\\Database\\Seeder;",
      "class DatabaseSeeder extends Seeder {",
      "  public function run(): void { \\App\\Models\\Post::factory()->count(3)->create(); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "resources", "views", "posts", "index.blade.php"), [
      "@extends('layouts.app')",
      "@section('content')",
      "@csrf",
      "@foreach($posts as $post)",
      "  {{ $post->title }}",
      "@endforeach",
      "@endsection"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Console", "Commands", "SyncLessons.php"), [
      "<?php",
      "namespace App\\Console\\Commands;",
      "use Illuminate\\Console\\Command;",
      "class SyncLessons extends Command {",
      "  protected $signature = 'lessons:sync';",
      "  public function handle(): int { return self::SUCCESS; }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Jobs", "PublishPost.php"), [
      "<?php",
      "namespace App\\Jobs;",
      "use Illuminate\\Bus\\Queueable;",
      "use Illuminate\\Contracts\\Queue\\ShouldQueue;",
      "use Illuminate\\Foundation\\Bus\\Dispatchable;",
      "class PublishPost implements ShouldQueue {",
      "  use Dispatchable, Queueable;",
      "  public function __construct(public int $postId) {}",
      "  public function handle(): void {}",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Mail", "PostPublishedMail.php"), [
      "<?php",
      "namespace App\\Mail;",
      "use Illuminate\\Mail\\Mailable;",
      "class PostPublishedMail extends Mailable {",
      "  public function envelope(): \\Illuminate\\Mail\\Mailables\\Envelope { return new \\Illuminate\\Mail\\Mailables\\Envelope(subject: 'Published'); }",
      "  public function content(): \\Illuminate\\Mail\\Mailables\\Content { return new \\Illuminate\\Mail\\Mailables\\Content(view: 'posts.index'); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Notifications", "PostNotification.php"), [
      "<?php",
      "namespace App\\Notifications;",
      "use Illuminate\\Notifications\\Notification;",
      "class PostNotification extends Notification {",
      "  public function via($notifiable): array { return ['mail']; }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "Events", "PostPublished.php"), [
      "<?php",
      "namespace App\\Events;",
      "use Illuminate\\Contracts\\Broadcasting\\ShouldBroadcast;",
      "class PostPublished implements ShouldBroadcast {",
      "  public function broadcastOn(): array { return []; }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "app.php"), "<?php return ['env' => env('APP_ENV'), 'providers' => [App\\Providers\\AppServiceProvider::class]];");
    await fs.writeFile(path.join(sourceRoot, "config", "cache.php"), "<?php return ['default' => env('CACHE_STORE', 'array')];");
    await fs.writeFile(path.join(sourceRoot, "config", "session.php"), "<?php return ['driver' => env('SESSION_DRIVER', 'file')];");
    await fs.writeFile(path.join(sourceRoot, "tests", "Pest.php"), [
      "<?php",
      "uses(Tests\\TestCase::class)->in('Feature');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "Feature", "PostTest.php"), [
      "<?php",
      "namespace Tests\\Feature;",
      "use PHPUnit\\Framework\\TestCase;",
      "class PostTest extends TestCase {",
      "  public function test_posts_api(): void {",
      "    $this->withoutExceptionHandling();",
      "    $this->getJson('/api/posts')->assertStatus(200)->assertJson(['ok' => true]);",
      "    $this->postJson('/learn/posts', ['title' => 'A', 'body' => 'B'])->assertStatus(302);",
      "    $this->artisan('lessons:sync')->expectsOutput('synced')->assertExitCode(0);",
      "  }",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      laravelSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Laravel Route:: routes/web.php routes/api.php Controller Middleware FormRequest Validator::make Eloquent Model fillable guarded casts hasMany belongsTo Schema::create migration factory seeder Blade view artisan command schedule queue job Mailable Notification Broadcast Event Listener PHPUnit Pest");
    expect(report.serverSetups.some((item) => item.framework === "laravel" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "params", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["framework-errors", "validation-error", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["laravel-test"]));
    expect(readySignals(report.laravelSignals)).toEqual(expect.arrayContaining([
      "package",
      "application",
      "routing-facade",
      "router-methods",
      "route-group",
      "route-prefix",
      "route-name",
      "route-resource",
      "route-model-binding",
      "controller",
      "middleware",
      "service-provider",
      "container-binding",
      "request-validation",
      "form-request",
      "validator",
      "eloquent-model",
      "mass-assignment",
      "casts",
      "relationships",
      "query-builder",
      "migration",
      "schema-builder",
      "factory-seeder",
      "blade-view",
      "response-json",
      "redirect",
      "abort-exception",
      "artisan-command",
      "schedule",
      "queue-job",
      "mail",
      "notification",
      "broadcast",
      "event-listener",
      "cache-session",
      "config-env",
      "http-test",
      "phpunit-pest",
      "artisan-test"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["laravel"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Laravel Signals");
    expect(markdown).toContain("Laravel Route facade evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Laravel Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Spring Boot server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-spring-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-spring-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "main", "resources"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "test", "java", "com", "example", "posts"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "build.gradle"), [
      "plugins {",
      "  id 'java'",
      "  id 'org.springframework.boot' version '4.0.0'",
      "}",
      "",
      "dependencies {",
      "  implementation 'org.springframework.boot:spring-boot-starter-web'",
      "  implementation 'org.springframework.boot:spring-boot-starter-webflux'",
      "  implementation 'org.springframework.boot:spring-boot-starter-data-jpa'",
      "  implementation 'org.springframework.boot:spring-boot-starter-actuator'",
      "  implementation 'org.springframework.boot:spring-boot-starter-security'",
      "  testImplementation 'org.springframework.boot:spring-boot-starter-test'",
      "  testImplementation 'org.testcontainers:junit-jupiter'",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "resources", "application.yml"), [
      "server:",
      "  port: 8080",
      "spring:",
      "  profiles:",
      "    active: local",
      "  cache:",
      "    type: simple",
      "management:",
      "  endpoints:",
      "    web:",
      "      exposure:",
      "        include: health,metrics"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "DemoApplication.java"), [
      "package com.example.posts;",
      "",
      "import org.springframework.boot.ApplicationRunner;",
      "import org.springframework.boot.CommandLineRunner;",
      "import org.springframework.boot.SpringApplication;",
      "import org.springframework.boot.autoconfigure.SpringBootApplication;",
      "import org.springframework.boot.context.properties.EnableConfigurationProperties;",
      "import org.springframework.context.ApplicationContext;",
      "import org.springframework.context.annotation.Bean;",
      "",
      "@SpringBootApplication",
      "@EnableConfigurationProperties(PostProperties.class)",
      "class DemoApplication {",
      "  public static void main(String[] args) {",
      "    SpringApplication.run(DemoApplication.class, args);",
      "  }",
      "  @Bean",
      "  CommandLineRunner commandLineRunner(ApplicationContext context) { return args -> context.getId(); }",
      "  @Bean",
      "  ApplicationRunner applicationRunner() { return args -> {}; }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "PostProperties.java"), [
      "package com.example.posts;",
      "",
      "import org.springframework.boot.context.properties.ConfigurationProperties;",
      "",
      "@ConfigurationProperties(prefix = \"posts\")",
      "record PostProperties(boolean featured) {}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "PostController.java"), [
      "package com.example.posts;",
      "",
      "import jakarta.validation.Valid;",
      "import org.springframework.http.ResponseEntity;",
      "import org.springframework.web.bind.annotation.GetMapping;",
      "import org.springframework.web.bind.annotation.PathVariable;",
      "import org.springframework.web.bind.annotation.PostMapping;",
      "import org.springframework.web.bind.annotation.RequestBody;",
      "import org.springframework.web.bind.annotation.RequestMapping;",
      "import org.springframework.web.bind.annotation.RequestParam;",
      "import org.springframework.web.bind.annotation.RestController;",
      "",
      "@RestController",
      "@RequestMapping(\"/api/posts\")",
      "class PostController {",
      "  private final PostService service;",
      "  PostController(PostService service) { this.service = service; }",
      "  @GetMapping(\"/{id}\")",
      "  ResponseEntity<PostDto> show(@PathVariable Long id, @RequestParam(defaultValue = \"full\") String view) {",
      "    return ResponseEntity.ok(service.find(id, view));",
      "  }",
      "  @PostMapping",
      "  ResponseEntity<PostDto> create(@Valid @RequestBody PostDto body) {",
      "    return ResponseEntity.status(201).body(service.create(body));",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "PageController.java"), [
      "package com.example.posts;",
      "",
      "import org.springframework.stereotype.Controller;",
      "import org.springframework.web.bind.annotation.GetMapping;",
      "",
      "@Controller",
      "class PageController {",
      "  @GetMapping(\"/posts/page\")",
      "  String page() { return \"posts/page\"; }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "PostDto.java"), [
      "package com.example.posts;",
      "",
      "import jakarta.validation.constraints.NotBlank;",
      "",
      "record PostDto(@NotBlank String title, @NotBlank String body) {}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "PostService.java"), [
      "package com.example.posts;",
      "",
      "import org.springframework.beans.factory.annotation.Autowired;",
      "import org.springframework.cache.annotation.Cacheable;",
      "import org.springframework.stereotype.Service;",
      "import org.springframework.transaction.annotation.Transactional;",
      "",
      "@Service",
      "class PostService {",
      "  @Autowired PostRepository repository;",
      "  @Transactional",
      "  @Cacheable(\"posts\")",
      "  PostDto find(Long id, String view) { return new PostDto(\"title\", view); }",
      "  PostDto create(PostDto dto) { return dto; }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "PostRepository.java"), [
      "package com.example.posts;",
      "",
      "import org.springframework.data.jpa.repository.JpaRepository;",
      "import org.springframework.stereotype.Repository;",
      "",
      "@Repository",
      "interface PostRepository extends JpaRepository<Post, Long> {}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "Post.java"), [
      "package com.example.posts;",
      "",
      "import jakarta.persistence.Entity;",
      "import jakarta.persistence.GeneratedValue;",
      "import jakarta.persistence.Id;",
      "",
      "@Entity",
      "class Post {",
      "  @Id @GeneratedValue Long id;",
      "  String title;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "AppConfig.java"), [
      "package com.example.posts;",
      "",
      "import io.micrometer.core.instrument.Counter;",
      "import io.micrometer.core.instrument.MeterRegistry;",
      "import org.springframework.boot.actuate.health.Health;",
      "import org.springframework.boot.actuate.health.HealthIndicator;",
      "import org.springframework.boot.autoconfigure.AutoConfiguration;",
      "import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;",
      "import org.springframework.context.annotation.Bean;",
      "import org.springframework.context.annotation.Configuration;",
      "import org.springframework.context.annotation.Profile;",
      "import org.springframework.scheduling.annotation.EnableScheduling;",
      "import org.springframework.cache.annotation.EnableCaching;",
      "import org.springframework.security.web.SecurityFilterChain;",
      "import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;",
      "",
      "@AutoConfiguration",
      "@Configuration",
      "@EnableScheduling",
      "@EnableCaching",
      "class AppConfig implements WebMvcConfigurer {",
      "  @Bean",
      "  @Profile(\"local\")",
      "  @ConditionalOnProperty(name = \"posts.featured\", havingValue = \"true\", matchIfMissing = true)",
      "  HealthIndicator postsHealthIndicator() { return () -> Health.up().build(); }",
      "  @Bean",
      "  Counter postCounter(MeterRegistry registry) { return Counter.builder(\"posts.created\").register(registry); }",
      "  @Bean",
      "  SecurityFilterChain securityFilterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http) throws Exception { return http.build(); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "FunctionalRoutes.java"), [
      "package com.example.posts;",
      "",
      "import org.springframework.context.annotation.Bean;",
      "import org.springframework.context.annotation.Configuration;",
      "import org.springframework.web.reactive.function.server.RouterFunction;",
      "import org.springframework.web.reactive.function.server.RouterFunctions;",
      "import org.springframework.web.reactive.function.server.ServerResponse;",
      "import static org.springframework.web.reactive.function.server.RequestPredicates.GET;",
      "import static org.springframework.web.reactive.function.server.RequestPredicates.POST;",
      "",
      "@Configuration",
      "class FunctionalRoutes {",
      "  @Bean",
      "  RouterFunction<ServerResponse> routerFunction() {",
      "    return RouterFunctions.route(GET(\"/functional/posts\"), request -> ServerResponse.ok().build())",
      "      .andRoute(POST(\"/functional/posts\"), request -> ServerResponse.ok().build());",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "ErrorAdvice.java"), [
      "package com.example.posts;",
      "",
      "import org.springframework.http.HttpStatus;",
      "import org.springframework.http.ProblemDetail;",
      "import org.springframework.web.bind.MethodArgumentNotValidException;",
      "import org.springframework.web.bind.annotation.ControllerAdvice;",
      "import org.springframework.web.bind.annotation.ExceptionHandler;",
      "import org.springframework.web.bind.annotation.ResponseStatus;",
      "import org.springframework.web.server.ResponseStatusException;",
      "",
      "@ControllerAdvice",
      "class ErrorAdvice {",
      "  @ExceptionHandler(MethodArgumentNotValidException.class)",
      "  @ResponseStatus(HttpStatus.BAD_REQUEST)",
      "  ProblemDetail validation(MethodArgumentNotValidException ex) {",
      "    return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());",
      "  }",
      "  @ExceptionHandler(ResponseStatusException.class)",
      "  ProblemDetail status(ResponseStatusException ex) { return ProblemDetail.forStatus(ex.getStatusCode()); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "java", "com", "example", "posts", "PostEvents.java"), [
      "package com.example.posts;",
      "",
      "import org.springframework.context.ApplicationEventPublisher;",
      "import org.springframework.context.ApplicationListener;",
      "import org.springframework.context.event.EventListener;",
      "import org.springframework.scheduling.annotation.Scheduled;",
      "import org.springframework.stereotype.Component;",
      "",
      "@Component",
      "class PostEvents implements ApplicationListener<PostPublished> {",
      "  private final ApplicationEventPublisher publisher;",
      "  PostEvents(ApplicationEventPublisher publisher) { this.publisher = publisher; }",
      "  @EventListener",
      "  void onPost(PostPublished event) {}",
      "  @Scheduled(fixedDelay = 1000)",
      "  void refresh() { publisher.publishEvent(new PostPublished()); }",
      "  public void onApplicationEvent(PostPublished event) {}",
      "}",
      "class PostPublished {}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "test", "java", "com", "example", "posts", "PostControllerTest.java"), [
      "package com.example.posts;",
      "",
      "import org.junit.jupiter.api.Test;",
      "import org.springframework.beans.factory.annotation.Autowired;",
      "import org.springframework.boot.test.context.SpringBootTest;",
      "import org.springframework.boot.test.web.client.TestRestTemplate;",
      "import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;",
      "import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;",
      "import org.springframework.test.context.DynamicPropertyRegistry;",
      "import org.springframework.test.context.DynamicPropertySource;",
      "import org.springframework.test.web.reactive.server.WebTestClient;",
      "import org.springframework.test.web.servlet.MockMvc;",
      "import org.testcontainers.containers.GenericContainer;",
      "import org.testcontainers.junit.jupiter.Container;",
      "import org.testcontainers.junit.jupiter.Testcontainers;",
      "",
      "@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)",
      "@AutoConfigureMockMvc",
      "@Testcontainers",
      "class PostControllerTest {",
      "  @Container static GenericContainer<?> redis = new GenericContainer<>(\"redis:7\");",
      "  @Autowired MockMvc mockMvc;",
      "  @Autowired WebTestClient webTestClient;",
      "  @Autowired TestRestTemplate testRestTemplate;",
      "  @DynamicPropertySource",
      "  static void properties(DynamicPropertyRegistry registry) { registry.add(\"server.port\", () -> 0); }",
      "  @Test void posts() throws Exception { webTestClient.get().uri(\"/api/posts/1\").exchange(); }",
      "}",
      "",
      "@WebMvcTest(PostController.class)",
      "class PostControllerSliceTest { @Autowired MockMvc mvc; }"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      springSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("SpringBootApplication SpringApplication.run RestController RequestMapping GetMapping PostMapping PathVariable RequestParam RequestBody ResponseEntity Configuration AutoConfiguration ConfigurationProperties Bean ConditionalOn Service Repository Component Entity JpaRepository Transactional Actuator HealthIndicator MeterRegistry WebMvc WebFlux RouterFunction MockMvc WebTestClient TestRestTemplate Testcontainers");
    expect(report.serverSetups.some((item) => item.framework === "spring" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "port"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "framework-errors", "validation-error", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["spring-test"]));
    expect(readySignals(report.springSignals)).toEqual(expect.arrayContaining([
      "package",
      "boot-application",
      "spring-application-run",
      "rest-controller",
      "controller",
      "request-mapping",
      "method-mapping",
      "path-variable",
      "request-param",
      "request-body",
      "response-entity",
      "validation",
      "configuration",
      "auto-configuration",
      "configuration-properties",
      "bean",
      "conditional",
      "dependency-injection",
      "service",
      "repository",
      "component",
      "entity",
      "jpa-repository",
      "transactional",
      "security",
      "actuator",
      "health-indicator",
      "metrics",
      "application-properties",
      "profiles",
      "embedded-server",
      "webmvc",
      "webflux",
      "router-function",
      "command-line-runner",
      "scheduled",
      "event-listener",
      "cache",
      "exception-handler",
      "spring-boot-test",
      "webmvc-test",
      "mockmvc",
      "web-test-client",
      "test-rest-template",
      "dynamic-property-source",
      "testcontainers"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["spring"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Spring Signals");
    expect(markdown).toContain("Spring Boot package/build evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Spring Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects ASP.NET Core server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-aspnet-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-aspnet-source-"));
    await fs.mkdir(path.join(sourceRoot, "Controllers"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "Middleware"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "Hubs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "Services"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "Tests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "Properties"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "AspNetFixture.csproj"), [
      "<Project Sdk=\"Microsoft.NET.Sdk.Web\">",
      "  <PropertyGroup>",
      "    <TargetFramework>net10.0</TargetFramework>",
      "  </PropertyGroup>",
      "  <ItemGroup>",
      "    <PackageReference Include=\"Microsoft.AspNetCore.OpenApi\" Version=\"10.0.0\" />",
      "    <PackageReference Include=\"Microsoft.AspNetCore.SignalR\" Version=\"10.0.0\" />",
      "    <PackageReference Include=\"Microsoft.AspNetCore.TestHost\" Version=\"10.0.0\" />",
      "    <PackageReference Include=\"Microsoft.AspNetCore.Mvc.Testing\" Version=\"10.0.0\" />",
      "    <PackageReference Include=\"xunit\" Version=\"2.9.3\" />",
      "  </ItemGroup>",
      "</Project>"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "appsettings.json"), JSON.stringify({
      ASPNETCORE_URLS: "http://localhost:5010",
      Kestrel: { Endpoints: { Http: { Url: "http://localhost:5010" } } },
      ConnectionStrings: { Default: "Data Source=app.db" }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "Properties", "launchSettings.json"), JSON.stringify({
      profiles: {
        http: {
          commandName: "Project",
          applicationUrl: "http://localhost:5010",
          environmentVariables: { ASPNETCORE_ENVIRONMENT: "Development" }
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "Program.cs"), [
      "using Microsoft.AspNetCore.Authentication.JwtBearer;",
      "using Microsoft.AspNetCore.Diagnostics;",
      "using Microsoft.AspNetCore.Http.HttpResults;",
      "using Microsoft.AspNetCore.Mvc;",
      "using Microsoft.OpenApi.Models;",
      "using System.ComponentModel.DataAnnotations;",
      "",
      "var builder = WebApplication.CreateBuilder(args);",
      "var slimBuilder = WebApplication.CreateSlimBuilder(args);",
      "builder.Services.AddControllers();",
      "builder.Services.AddRazorPages();",
      "builder.Services.AddOpenApi(\"v1\");",
      "builder.Services.AddEndpointsApiExplorer();",
      "builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();",
      "builder.Services.AddAuthorization(options => options.FallbackPolicy = options.DefaultPolicy);",
      "builder.Services.AddCors(options => options.AddPolicy(\"api\", policy => policy.AllowAnyOrigin()));",
      "builder.Services.AddSignalR();",
      "builder.Services.AddHealthChecks();",
      "builder.Services.AddHttpClient(\"api\");",
      "builder.Services.AddProblemDetails();",
      "builder.Services.AddHostedService<SyncWorker>();",
      "builder.Services.Configure<AppOptions>(builder.Configuration.GetSection(\"App\"));",
      "builder.Services.AddScoped<IBookStore, BookStore>();",
      "builder.Services.AddSingleton(TimeProvider.System);",
      "builder.WebHost.UseKestrel();",
      "",
      "var app = builder.Build();",
      "app.UseExceptionHandler(errorApp => errorApp.Run(async context => {",
      "  var problemDetails = context.RequestServices.GetRequiredService<IProblemDetailsService>();",
      "  await problemDetails.WriteAsync(new ProblemDetailsContext { HttpContext = context, ProblemDetails = new ProblemDetails { Title = \"Failure\" } });",
      "}));",
      "app.UseHttpsRedirection();",
      "app.UseStaticFiles();",
      "app.UseRouting();",
      "app.UseCors(\"api\");",
      "app.UseAuthentication();",
      "app.UseAuthorization();",
      "app.UseMiddleware<RequestTraceMiddleware>();",
      "app.MapOpenApi();",
      "if (app.Environment.IsDevelopment()) { app.MapSwaggerUi(); }",
      "app.MapRazorPages();",
      "app.MapControllers();",
      "app.MapHealthChecks(\"/health\");",
      "app.MapHub<ChatHub>(\"/hubs/chat\");",
      "var group = app.MapGroup(\"/api/books\").RequireAuthorization().WithTags(\"books\");",
      "group.MapGet(\"/\", ([FromQuery] int page, IBookStore store) => TypedResults.Ok(store.List(page))).WithName(\"ListBooks\").WithOpenApi().Produces<BookDto>(StatusCodes.Status200OK);",
      "group.MapGet(\"/{id}\", Results<Ok<BookDto>, NotFound> ([FromRoute] int id, IBookStore store) => store.Find(id) is { } book ? TypedResults.Ok(book) : TypedResults.NotFound());",
      "group.MapPost(\"/\", ([FromBody] BookInput input, IBookStore store) => Results.Created($\"/api/books/{input.Title}\", store.Create(input))).WithSummary(\"Create book\");",
      "group.MapPut(\"/{id}\", ([FromRoute] int id, [FromBody] BookInput input) => Results.Ok(input));",
      "group.MapPatch(\"/{id}\", ([FromRoute] int id, [FromBody] BookInput input) => TypedResults.Ok(input));",
      "group.MapDelete(\"/{id}\", ([FromRoute] int id) => Results.NoContent());",
      "app.Run();",
      "",
      "public partial class Program { }",
      "public sealed record BookDto(int Id, string Title);",
      "public sealed record BookInput([Required] string Title);",
      "public sealed class AppOptions { public string Mode { get; set; } = \"local\"; }",
      "public interface IBookStore { IEnumerable<BookDto> List(int page); BookDto? Find(int id); BookDto Create(BookInput input); }",
      "public sealed class BookStore : IBookStore {",
      "  public IEnumerable<BookDto> List(int page) => [new BookDto(page, \"Test\")];",
      "  public BookDto? Find(int id) => id == 1 ? new BookDto(id, \"Test\") : null;",
      "  public BookDto Create(BookInput input) => new(1, input.Title);",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Controllers", "BooksController.cs"), [
      "using Microsoft.AspNetCore.Authorization;",
      "using Microsoft.AspNetCore.Mvc;",
      "",
      "[ApiController]",
      "[Route(\"api/[controller]\")]",
      "public sealed class BooksController : ControllerBase",
      "{",
      "  [HttpGet(\"{id}\")]",
      "  [ProducesResponseType(typeof(BookDto), StatusCodes.Status200OK)]",
      "  public ActionResult<BookDto> Get([FromRoute] int id, [FromQuery] string? view) => Ok(new BookDto(id, view ?? \"full\"));",
      "",
      "  [HttpPost]",
      "  [Authorize]",
      "  public IActionResult Post([FromBody] BookInput input) => Created($\"/api/books/{input.Title}\", input);",
      "",
      "  [HttpDelete(\"{id}\")]",
      "  public IResult Delete([FromRoute] int id) => TypedResults.NoContent();",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Middleware", "RequestTraceMiddleware.cs"), [
      "public sealed class RequestTraceMiddleware",
      "{",
      "  private readonly RequestDelegate next;",
      "  public RequestTraceMiddleware(RequestDelegate next) { this.next = next; }",
      "  public async Task InvokeAsync(HttpContext context) { await next(context); }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Hubs", "ChatHub.cs"), [
      "using Microsoft.AspNetCore.SignalR;",
      "",
      "public sealed class ChatHub : Hub",
      "{",
      "  public Task Send(string message) => Clients.All.SendAsync(\"message\", message);",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Services", "SyncWorker.cs"), [
      "using Microsoft.Extensions.Hosting;",
      "",
      "public sealed class SyncWorker : BackgroundService, IHostedService",
      "{",
      "  protected override Task ExecuteAsync(CancellationToken stoppingToken) => Task.CompletedTask;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Tests", "ApiTests.cs"), [
      "using Microsoft.AspNetCore.Hosting;",
      "using Microsoft.AspNetCore.Mvc.Testing;",
      "using Microsoft.AspNetCore.TestHost;",
      "using Microsoft.Extensions.DependencyInjection;",
      "using Xunit;",
      "",
      "public sealed class ApiFactory : WebApplicationFactory<Program>",
      "{",
      "  protected override void ConfigureWebHost(IWebHostBuilder builder)",
      "  {",
      "    builder.UseTestServer();",
      "    builder.ConfigureTestServices(services => services.AddSingleton<IBookStore, BookStore>());",
      "  }",
      "}",
      "",
      "public sealed class ApiTests : IClassFixture<ApiFactory>",
      "{",
      "  private readonly HttpClient client;",
      "  public ApiTests(ApiFactory factory) { client = factory.CreateClient(); }",
      "  [Fact]",
      "  public async Task GetsBooks() { var response = await client.GetAsync(\"/api/books\"); response.EnsureSuccessStatusCode(); }",
      "  [Theory]",
      "  [InlineData(1)]",
      "  public async Task PostsBooks(int id) { await client.PostAsync($\"/api/books/{id}\", new StringContent(\"{}\")); }",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      aspnetCoreSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("WebApplication.CreateBuilder WebApplication.CreateSlimBuilder builder.Services MapGet MapPost MapPut MapDelete MapPatch MapGroup MapControllers AddControllers ControllerBase ApiController Route HttpGet HttpPost FromBody FromRoute FromQuery IActionResult ActionResult IResult Results TypedResults ProblemDetails AddProblemDetails AddRouting UseRouting UseAuthentication UseAuthorization AddAuthentication AddAuthorization AddOpenApi MapOpenApi Swagger UI SignalR MapHub AddHealthChecks MapHealthChecks TestServer WebApplicationFactory UseTestServer CreateClient xUnit Flask Blueprint route add_url_rule MethodView request jsonify render_template redirect abort url_for session g current_app app_context request_context before_request after_request teardown_request errorhandler config from_prefixed_env test_client test_request_context test_cli_runner pytest Symfony FrameworkBundle Route RouteCollection AbstractController RequestStack JsonResponse RedirectResponse HttpKernel KernelInterface MicroKernelTrait ContainerBuilder services.yaml autowire autoconfigure CompilerPassInterface EventSubscriberInterface AsCommand CommandTester KernelBrowser WebTestCase KernelTestCase gin.Default gin.New gin.Engine gin.RouterGroup GET POST PUT PATCH DELETE Any Group Use gin.Context Param Query DefaultQuery PostForm DefaultPostForm GetHeader GetRawData ShouldBind BindJSON ShouldBindJSON ShouldBindQuery ShouldBindUri binding.Validator JSON String HTML Redirect File Abort AbortWithStatus NoRoute NoMethod Logger Recovery SetTrustedProxies Run RunTLS RunUnix httptest CreateTestContext SetMode TestMode");
    expect(report.serverSetups.some((item) => item.framework === "aspnet-core" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "put", "patch", "delete", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "port"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "framework-errors", "validation-error", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["aspnet-test"]));
    expect(readySignals(report.aspnetCoreSignals)).toEqual(expect.arrayContaining([
      "package",
      "project-sdk",
      "web-application-builder",
      "web-application-slim-builder",
      "builder-services",
      "service-registration",
      "options-configuration",
      "middleware-pipeline",
      "routing-middleware",
      "minimal-api-route",
      "map-group",
      "endpoint-metadata",
      "typed-results",
      "results-helper",
      "iresult",
      "mvc-controller",
      "api-controller",
      "controller-base",
      "route-attribute",
      "http-method-attributes",
      "binding-attributes",
      "action-result",
      "model-validation",
      "problem-details",
      "razor-pages",
      "static-files",
      "https-redirection",
      "authentication",
      "authorization",
      "cors",
      "openapi",
      "swagger-ui",
      "signalr",
      "health-checks",
      "http-client-factory",
      "background-service",
      "hosted-service",
      "configuration",
      "appsettings",
      "kestrel",
      "test-server",
      "web-application-factory",
      "http-client-test",
      "xunit"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["aspnet-core"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## ASP.NET Core Signals");
    expect(markdown).toContain("ASP.NET Core package/reference evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("ASP.NET Core Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Flask server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-flask-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-flask-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "flaskr"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "templates"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "static"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"flask-fixture\"",
      "dependencies = [\"Flask>=3.1\", \"pytest>=8\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), "Flask>=3.1\npytest>=8\n");
    await fs.writeFile(path.join(sourceRoot, "src", "flaskr", "__init__.py"), [
      "from flask import Flask, Blueprint, abort, current_app, g, jsonify, redirect, render_template, request, session, url_for",
      "from werkzeug.exceptions import HTTPException",
      "import click",
      "",
      "def create_app(test_config=None):",
      "    app = Flask(__name__, instance_relative_config=True, static_folder='static', template_folder='templates')",
      "    app.config.from_mapping(SECRET_KEY='dev', API_MODE='local')",
      "    app.config.from_prefixed_env()",
      "    if test_config:",
      "        app.config.from_mapping(test_config)",
      "    class MetricsExtension:",
      "        def init_app(self, flask_app):",
      "            flask_app.extensions['metrics'] = self",
      "    MetricsExtension().init_app(app)",
      "    app.register_blueprint(api_bp, url_prefix='/api')",
      "",
      "    @app.before_request",
      "    def load_user():",
      "        g.user = session.get('user_id')",
      "",
      "    @app.after_request",
      "    def add_headers(response):",
      "        response.headers['X-App'] = current_app.config['API_MODE']",
      "        return response",
      "",
      "    @app.teardown_request",
      "    def cleanup(exc):",
      "        g.pop('user', None)",
      "",
      "    @app.errorhandler(HTTPException)",
      "    def handle_http_error(error):",
      "        return jsonify(error=str(error)), error.code",
      "",
      "    @app.cli.command('sync-books')",
      "    def sync_books_command():",
      "        click.echo('synced')",
      "",
      "    app.add_url_rule('/health', 'health', health)",
      "    return app",
      "",
      "api_bp = Blueprint('api', __name__, template_folder='templates', static_folder='static')",
      "",
      "@api_bp.route('/books/<int:book_id>', methods=['GET', 'POST'])",
      "def book_detail(book_id):",
      "    if request.method == 'POST':",
      "        payload = request.get_json() or request.form",
      "        session['last_book'] = book_id",
      "        return jsonify(id=book_id, title=payload.get('title', 'Untitled')), 201",
      "    if request.args.get('format') == 'html':",
      "        return render_template('book.html', book_id=book_id)",
      "    return redirect(url_for('api.book_detail', book_id=book_id))",
      "",
      "@api_bp.get('/missing')",
      "def missing_book():",
      "    abort(404)",
      "",
      "def health():",
      "    return {'status': 'ok'}",
      "",
      "from flask.views import MethodView",
      "",
      "class BookApi(MethodView):",
      "    def get(self, book_id):",
      "        return jsonify(id=book_id)",
      "",
      "api_bp.add_url_rule('/class/<int:book_id>', view_func=BookApi.as_view('book_api'))"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "wsgi.py"), [
      "from flaskr import create_app",
      "app = create_app()",
      "if __name__ == '__main__':",
      "    app.run(host='127.0.0.1', port=5000)"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "test_app.py"), [
      "import pytest",
      "from flaskr import create_app",
      "",
      "@pytest.fixture",
      "def app():",
      "    return create_app({'TESTING': True})",
      "",
      "@pytest.fixture",
      "def client(app):",
      "    return app.test_client()",
      "",
      "def test_books(client):",
      "    response = client.post('/api/books/1', json={'title': 'Test'})",
      "    assert response.json['title'] == 'Test'",
      "",
      "def test_context(app):",
      "    with app.test_request_context('/api/books/1?format=json'):",
      "        assert True",
      "",
      "def test_app_context(app):",
      "    with app.app_context():",
      "        assert True",
      "",
      "def test_cli(app):",
      "    runner = app.test_cli_runner()",
      "    result = runner.invoke(args=['sync-books'])",
      "    assert result.exit_code == 0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), "Run locally with FLASK_APP=flaskr flask run\n");
    await fs.writeFile(path.join(sourceRoot, "templates", "book.html"), "<h1>{{ book_id }}</h1>\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      flaskSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Flask Blueprint route add_url_rule MethodView request jsonify render_template redirect abort url_for session g current_app app_context request_context before_request after_request teardown_request errorhandler config from_prefixed_env test_client test_request_context test_cli_runner pytest Symfony FrameworkBundle Route RouteCollection AbstractController RequestStack JsonResponse RedirectResponse HttpKernel KernelInterface MicroKernelTrait ContainerBuilder services.yaml autowire autoconfigure CompilerPassInterface EventSubscriberInterface AsCommand CommandTester KernelBrowser WebTestCase KernelTestCase gin.Default gin.New gin.Engine gin.RouterGroup GET POST PUT PATCH DELETE Any Group Use gin.Context Param Query DefaultQuery PostForm DefaultPostForm GetHeader GetRawData ShouldBind BindJSON ShouldBindJSON ShouldBindQuery ShouldBindUri binding.Validator JSON String HTML Redirect File Abort AbortWithStatus NoRoute NoMethod Logger Recovery SetTrustedProxies Run RunTLS RunUnix httptest CreateTestContext SetMode TestMode");
    expect(report.serverSetups.some((item) => item.framework === "flask" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "response"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "host", "port"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "framework-errors", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["flask-test"]));
    expect(readySignals(report.flaskSignals)).toEqual(expect.arrayContaining([
      "package",
      "app-instance",
      "app-factory",
      "blueprint",
      "blueprint-register",
      "route-decorator",
      "blueprint-route",
      "add-url-rule",
      "method-view",
      "request-object",
      "request-json",
      "request-form-args",
      "response-jsonify",
      "render-template",
      "redirect",
      "abort",
      "url-for",
      "session",
      "g-object",
      "current-app",
      "app-context",
      "request-context",
      "before-request",
      "after-request",
      "teardown-request",
      "errorhandler",
      "config",
      "instance-config",
      "static-files",
      "template-folder",
      "cli-command",
      "flask-command",
      "extension-init",
      "test-client",
      "test-request-context",
      "test-cli-runner",
      "pytest"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["flask"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Flask Signals");
    expect(markdown).toContain("Flask package/import evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Flask Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Symfony server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-symfony-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-symfony-source-"));
    await fs.mkdir(path.join(sourceRoot, "bin"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "public"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config", "packages"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "Controller"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "Command"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "DependencyInjection"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "EventSubscriber"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "Form"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "Message"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "MessageHandler"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "templates", "book"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "composer.json"), JSON.stringify({
      name: "example/symfony-fixture",
      require: {
        "symfony/framework-bundle": "^8.2",
        "symfony/routing": "^8.2",
        "symfony/http-foundation": "^8.2",
        "symfony/http-kernel": "^8.2",
        "symfony/dependency-injection": "^8.2",
        "symfony/console": "^8.2",
        "symfony/form": "^8.2",
        "symfony/validator": "^8.2",
        "symfony/security-bundle": "^8.2",
        "symfony/messenger": "^8.2",
        "symfony/workflow": "^8.2",
        "symfony/twig-bundle": "^8.2"
      },
      require_dev: {
        "phpunit/phpunit": "^12.0",
        "symfony/browser-kit": "^8.2"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "bin", "console"), [
      "#!/usr/bin/env php",
      "<?php",
      "",
      "use App\\Kernel;",
      "use Symfony\\Bundle\\FrameworkBundle\\Console\\Application;",
      "",
      "$kernel = new Kernel('dev', true);",
      "$application = new Application($kernel);",
      "$application->run();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "public", "index.php"), [
      "<?php",
      "",
      "use App\\Kernel;",
      "use Symfony\\Component\\HttpFoundation\\Request;",
      "",
      "$kernel = new Kernel('dev', true);",
      "$request = Request::createFromGlobals();",
      "$response = $kernel->handle($request);",
      "$response->send();",
      "$kernel->terminate($request, $response);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "routes.yaml"), [
      "controllers:",
      "  resource: ../src/Controller/",
      "  type: attribute"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "services.yaml"), [
      "services:",
      "  _defaults:",
      "    autowire: true",
      "    autoconfigure: true",
      "  App\\:",
      "    resource: ../src/",
      "  App\\DependencyInjection\\BookCompilerPass:",
      "    tags: ['container.service_subscriber']"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "packages", "workflow.yaml"), [
      "framework:",
      "  workflows:",
      "    book_review:",
      "      type: workflow",
      "      supports: [App\\Message\\BookMessage]",
      "      places: [draft, approved]",
      "      transitions:",
      "        approve:",
      "          from: draft",
      "          to: approved"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "Kernel.php"), [
      "<?php",
      "",
      "namespace App;",
      "",
      "use Symfony\\Bundle\\FrameworkBundle\\Kernel\\MicroKernelTrait;",
      "use Symfony\\Component\\Config\\Loader\\LoaderInterface;",
      "use Symfony\\Component\\DependencyInjection\\ContainerBuilder;",
      "use Symfony\\Component\\HttpKernel\\Kernel;",
      "use Symfony\\Component\\HttpKernel\\KernelInterface;",
      "use Symfony\\Component\\Routing\\Loader\\Configurator\\RoutingConfigurator;",
      "",
      "class Kernel extends Kernel implements KernelInterface",
      "{",
      "    use MicroKernelTrait;",
      "",
      "    protected function configureRoutes(RoutingConfigurator $routes): void",
      "    {",
      "        $routes->import('../config/routes.yaml');",
      "    }",
      "",
      "    protected function configureContainer(ContainerBuilder $container, LoaderInterface $loader): void",
      "    {",
      "        $loader->load('../config/services.yaml');",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "Controller", "BookController.php"), [
      "<?php",
      "",
      "namespace App\\Controller;",
      "",
      "use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;",
      "use Symfony\\Component\\HttpFoundation\\JsonResponse;",
      "use Symfony\\Component\\HttpFoundation\\RedirectResponse;",
      "use Symfony\\Component\\HttpFoundation\\Request;",
      "use Symfony\\Component\\HttpFoundation\\RequestStack;",
      "use Symfony\\Component\\HttpFoundation\\Response;",
      "use Symfony\\Component\\Routing\\Attribute\\Route;",
      "use Symfony\\Component\\Routing\\Generator\\UrlGeneratorInterface;",
      "use Symfony\\Component\\Routing\\RouterInterface;",
      "use Symfony\\Component\\Security\\Http\\Attribute\\IsGranted;",
      "use Symfony\\Component\\Validator\\Constraints as Assert;",
      "use Symfony\\Component\\Validator\\Validator\\ValidatorInterface;",
      "use Symfony\\Component\\HttpKernel\\Exception\\AccessDeniedException;",
      "use Symfony\\Component\\HttpKernel\\Exception\\NotFoundHttpException;",
      "",
      "class BookController extends AbstractController",
      "{",
      "    #[IsGranted('ROLE_USER')]",
      "    #[Route('/books/{id}', name: 'book_show', methods: ['GET', 'POST'])]",
      "    public function show(Request $request, RequestStack $requestStack, UrlGeneratorInterface $urlGenerator, RouterInterface $router, ValidatorInterface $validator, string $id): Response",
      "    {",
      "        $format = $request->query->get('format', 'html');",
      "        $payload = $request->request->all();",
      "        $agent = $request->headers->get('User-Agent');",
      "        $session = $requestStack->getSession();",
      "        $errors = $validator->validate($payload['title'] ?? '', [new Assert\\NotBlank()]);",
      "        if (count($errors) > 0) {",
      "            throw new NotFoundHttpException('Book title missing');",
      "        }",
      "        if ($agent === 'blocked') {",
      "            throw new AccessDeniedException('Blocked');",
      "        }",
      "        if ($format === 'json') {",
      "            return new JsonResponse(['id' => $id, 'session' => $session->getId()], Response::HTTP_CREATED);",
      "        }",
      "        $url = $urlGenerator->generate('book_show', ['id' => $id]);",
      "        $canonicalUrl = $router->generate('book_show', ['id' => $id]);",
      "        if ($format === 'redirect') {",
      "            return new RedirectResponse($url, Response::HTTP_FOUND);",
      "        }",
      "        if ($format === 'helper') {",
      "            return $this->json(['id' => $id, 'canonical_url' => $canonicalUrl], Response::HTTP_OK);",
      "        }",
      "        if ($format === 'route') {",
      "            return $this->redirectToRoute('book_show', ['id' => $id]);",
      "        }",
      "        return $this->render('book/show.html.twig', ['book_id' => $id]);",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "Command", "SyncBooksCommand.php"), [
      "<?php",
      "",
      "namespace App\\Command;",
      "",
      "use Symfony\\Component\\Console\\Attribute\\AsCommand;",
      "use Symfony\\Component\\Console\\Command\\Command;",
      "use Symfony\\Component\\Console\\Input\\InputInterface;",
      "use Symfony\\Component\\Console\\Output\\OutputInterface;",
      "",
      "#[AsCommand(name: 'app:sync-books')]",
      "class SyncBooksCommand extends Command",
      "{",
      "    protected function execute(InputInterface $input, OutputInterface $output): int",
      "    {",
      "        $output->writeln('synced');",
      "        return Command::SUCCESS;",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "DependencyInjection", "BookCompilerPass.php"), [
      "<?php",
      "",
      "namespace App\\DependencyInjection;",
      "",
      "use Symfony\\Component\\DependencyInjection\\Compiler\\CompilerPassInterface;",
      "use Symfony\\Component\\DependencyInjection\\ContainerBuilder;",
      "",
      "class BookCompilerPass implements CompilerPassInterface",
      "{",
      "    public function process(ContainerBuilder $container): void",
      "    {",
      "        if ($container->hasDefinition('book.repository')) {",
      "            $container->getDefinition('book.repository')->setAutowired(true)->setAutoconfigured(true);",
      "        }",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "EventSubscriber", "BookSubscriber.php"), [
      "<?php",
      "",
      "namespace App\\EventSubscriber;",
      "",
      "use Symfony\\Component\\EventDispatcher\\EventSubscriberInterface;",
      "use Symfony\\Component\\HttpKernel\\Event\\RequestEvent;",
      "use Symfony\\Component\\HttpKernel\\KernelEvents;",
      "",
      "class BookSubscriber implements EventSubscriberInterface",
      "{",
      "    public static function getSubscribedEvents(): array",
      "    {",
      "        return [KernelEvents::REQUEST => 'onKernelRequest'];",
      "    }",
      "",
      "    public function onKernelRequest(RequestEvent $event): void",
      "    {",
      "        $event->getRequest()->attributes->set('book_event_seen', true);",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "Form", "BookType.php"), [
      "<?php",
      "",
      "namespace App\\Form;",
      "",
      "use Symfony\\Component\\Form\\AbstractType;",
      "use Symfony\\Component\\Form\\Extension\\Core\\Type\\TextType;",
      "use Symfony\\Component\\Form\\FormBuilderInterface;",
      "use Symfony\\Component\\OptionsResolver\\OptionsResolver;",
      "",
      "class BookType extends AbstractType",
      "{",
      "    public function buildForm(FormBuilderInterface $builder, array $options): void",
      "    {",
      "        $builder->add('title', TextType::class);",
      "    }",
      "",
      "    public function configureOptions(OptionsResolver $resolver): void",
      "    {",
      "        $resolver->setDefaults(['csrf_protection' => false]);",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "Message", "BookMessage.php"), [
      "<?php",
      "",
      "namespace App\\Message;",
      "",
      "class BookMessage",
      "{",
      "    public function __construct(public string $id) {}",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "MessageHandler", "BookMessageHandler.php"), [
      "<?php",
      "",
      "namespace App\\MessageHandler;",
      "",
      "use App\\Message\\BookMessage;",
      "use Symfony\\Component\\Messenger\\Attribute\\AsMessageHandler;",
      "",
      "#[AsMessageHandler]",
      "class BookMessageHandler",
      "{",
      "    public function __invoke(BookMessage $message): void",
      "    {",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "templates", "book", "show.html.twig"), "<h1>{{ book_id }}</h1>\n");
    await fs.writeFile(path.join(sourceRoot, "tests", "BookControllerTest.php"), [
      "<?php",
      "",
      "namespace App\\Tests;",
      "",
      "use Symfony\\Bundle\\FrameworkBundle\\Test\\WebTestCase;",
      "",
      "class BookControllerTest extends WebTestCase",
      "{",
      "    public function testShow(): void",
      "    {",
      "        $client = static::createClient();",
      "        $client->request('GET', '/books/1');",
      "        self::assertResponseIsSuccessful();",
      "        self::assertSelectorTextContains('h1', '1');",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "KernelSmokeTest.php"), [
      "<?php",
      "",
      "namespace App\\Tests;",
      "",
      "use Symfony\\Bundle\\FrameworkBundle\\Test\\KernelTestCase;",
      "",
      "class KernelSmokeTest extends KernelTestCase",
      "{",
      "    public function testKernelBoots(): void",
      "    {",
      "        self::bootKernel();",
      "        self::assertTrue(true);",
      "    }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "CommandTest.php"), [
      "<?php",
      "",
      "namespace App\\Tests;",
      "",
      "use App\\Command\\SyncBooksCommand;",
      "use PHPUnit\\Framework\\TestCase;",
      "use Symfony\\Component\\Console\\Application;",
      "use Symfony\\Component\\Console\\Tester\\ApplicationTester;",
      "use Symfony\\Component\\Console\\Tester\\CommandTester;",
      "",
      "class CommandTest extends TestCase",
      "{",
      "    public function testCommand(): void",
      "    {",
      "        $commandTester = new CommandTester(new SyncBooksCommand());",
      "        $commandTester->execute([]);",
      "        $application = new Application();",
      "        $application->add(new SyncBooksCommand());",
      "        $applicationTester = new ApplicationTester($application);",
      "        $applicationTester->run(['command' => 'app:sync-books']);",
      "        self::assertSame(0, $commandTester->getStatusCode());",
      "    }",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      symfonySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Symfony FrameworkBundle Route RouteCollection AbstractController RequestStack JsonResponse RedirectResponse HttpKernel KernelInterface MicroKernelTrait ContainerBuilder services.yaml autowire autoconfigure CompilerPassInterface EventSubscriberInterface AsCommand CommandTester KernelBrowser WebTestCase KernelTestCase gin.Default gin.New gin.Engine gin.RouterGroup GET POST PUT PATCH DELETE Any Group Use gin.Context Param Query DefaultQuery PostForm DefaultPostForm GetHeader GetRawData ShouldBind BindJSON ShouldBindJSON ShouldBindQuery ShouldBindUri binding.Validator JSON String HTML Redirect File Abort AbortWithStatus NoRoute NoMethod Logger Recovery SetTrustedProxies Run RunTLS RunUnix httptest CreateTestContext SetMode TestMode");
    expect(report.serverSetups.some((item) => item.framework === "symfony" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-not-found-handler", "framework-errors", "validation-error", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["symfony-test"]));
    expect(readySignals(report.symfonySignals)).toEqual(expect.arrayContaining([
      "package",
      "framework-bundle",
      "routing-component",
      "route-attribute",
      "route-loader",
      "router-interface",
      "url-generator",
      "controller",
      "abstract-controller",
      "request-object",
      "request-stack",
      "response-object",
      "json-response",
      "redirect-response",
      "render-template",
      "http-kernel",
      "kernel-interface",
      "micro-kernel",
      "dependency-injection",
      "service-config",
      "autowire",
      "compiler-pass",
      "event-subscriber",
      "security",
      "form-type",
      "validator",
      "console-command",
      "as-command",
      "messenger",
      "workflow",
      "twig-bundle",
      "web-test-case",
      "kernel-test-case",
      "command-tester",
      "phpunit"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["symfony"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Symfony Signals");
    expect(markdown).toContain("Symfony package/import evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Symfony Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Gin server framework signals without running the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-gin-server-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-gin-server-source-"));
    await fs.mkdir(path.join(sourceRoot, "cmd", "server"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "internal", "http"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "templates"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "public"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/ginfixture",
      "",
      "go 1.23",
      "",
      "require github.com/gin-gonic/gin v1.11.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "cmd", "server", "main.go"), [
      "package main",
      "",
      "import (",
      "  stdhttp \"net/http\"",
      "  server \"example.com/ginfixture/internal/http\"",
      ")",
      "",
      "func main() {",
      "  router := server.NewRouter()",
      "  _ = router.SetTrustedProxies([]string{\"127.0.0.1\"})",
      "  _ = router.Run(\":8080\")",
      "  _ = router.RunTLS(\":8443\", \"cert.pem\", \"key.pem\")",
      "  _ = router.RunUnix(\"/tmp/gin.sock\")",
      "  _ = stdhttp.ListenAndServe(\":9090\", router)",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router.go"), [
      "package http",
      "",
      "import (",
      "  \"net/http\"",
      "",
      "  \"github.com/gin-gonic/gin\"",
      "  \"github.com/gin-gonic/gin/binding\"",
      "  \"github.com/go-playground/validator/v10\"",
      ")",
      "",
      "type CreateBookRequest struct {",
      "  Title string `json:\"title\" binding:\"required\"`",
      "}",
      "",
      "type BookURI struct {",
      "  ID string `uri:\"id\" binding:\"required\"`",
      "}",
      "",
      "func NewRouter() *gin.Engine {",
      "  gin.SetMode(gin.TestMode)",
      "  router := gin.Default()",
      "  router.Use(gin.Logger(), gin.Recovery(), func(c *gin.Context) {",
      "    c.Set(\"request_id\", c.GetHeader(\"X-Request-ID\"))",
      "    c.Next()",
      "  })",
      "  router.SetTrustedProxies([]string{\"127.0.0.1\"})",
      "  router.LoadHTMLGlob(\"templates/*.tmpl\")",
      "  router.Static(\"/public\", \"./public\")",
      "  router.StaticFile(\"/favicon.ico\", \"./public/favicon.ico\")",
      "  router.NoRoute(func(c *gin.Context) { c.AbortWithStatusJSON(http.StatusNotFound, gin.H{\"error\": \"missing\"}) })",
      "  router.NoMethod(func(c *gin.Context) { c.AbortWithStatus(http.StatusMethodNotAllowed) })",
      "  api := router.Group(\"/api\")",
      "  api.GET(\"/books/:id\", showBook)",
      "  api.POST(\"/books\", createBook)",
      "  api.PUT(\"/books/:id\", updateBook)",
      "  api.PATCH(\"/books/:id\", patchBook)",
      "  api.DELETE(\"/books/:id\", deleteBook)",
      "  api.Any(\"/health\", func(c *gin.Context) { c.String(http.StatusOK, \"ok\") })",
      "  return router",
      "}",
      "",
      "func showBook(c *gin.Context) {",
      "  id := c.Param(\"id\")",
      "  q := c.DefaultQuery(\"format\", \"json\")",
      "  c.GetRawData()",
      "  c.Header(\"X-Book\", id)",
      "  if q == \"html\" { c.HTML(http.StatusOK, \"book.tmpl\", gin.H{\"id\": id}); return }",
      "  if q == \"redirect\" { c.Redirect(http.StatusFound, \"/api/books/\"+id); return }",
      "  if q == \"file\" { c.File(\"./public/readme.txt\"); return }",
      "  c.JSON(http.StatusOK, gin.H{\"id\": id, \"agent\": c.GetHeader(\"User-Agent\")})",
      "}",
      "",
      "func createBook(c *gin.Context) {",
      "  var body CreateBookRequest",
      "  if err := c.ShouldBindJSON(&body); err != nil { c.AbortWithError(http.StatusBadRequest, err); return }",
      "  if binding.Validator != nil { _ = validator.New() }",
      "  c.IndentedJSON(http.StatusCreated, gin.H{\"title\": body.Title})",
      "}",
      "",
      "func updateBook(c *gin.Context) {",
      "  var uri BookURI",
      "  _ = c.ShouldBindUri(&uri)",
      "  _ = c.ShouldBindQuery(&CreateBookRequest{})",
      "  c.String(http.StatusAccepted, c.PostForm(\"title\"))",
      "}",
      "",
      "func patchBook(c *gin.Context) { c.Status(http.StatusNoContent) }",
      "",
      "func deleteBook(c *gin.Context) { c.Abort() }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router_test.go"), [
      "package http",
      "",
      "import (",
      "  \"net/http\"",
      "  \"net/http/httptest\"",
      "  \"testing\"",
      "",
      "  \"github.com/gin-gonic/gin\"",
      ")",
      "",
      "func TestNewRouter(t *testing.T) {",
      "  gin.SetMode(gin.TestMode)",
      "  recorder := httptest.NewRecorder()",
      "  ctx, router := gin.CreateTestContext(recorder)",
      "  ctx.Request = httptest.NewRequest(http.MethodGet, \"/api/books/1\", nil)",
      "  router.GET(\"/api/books/:id\", showBook)",
      "  router.ServeHTTP(recorder, ctx.Request)",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "templates", "book.tmpl"), "{{ .id }}\n");
    await fs.writeFile(path.join(sourceRoot, "public", "readme.txt"), "static fixture\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      ginSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("gin.Default gin.New gin.Engine gin.RouterGroup GET POST PUT PATCH DELETE Any Group Use gin.Context Param Query DefaultQuery PostForm DefaultPostForm GetHeader GetRawData ShouldBind BindJSON ShouldBindJSON ShouldBindQuery ShouldBindUri binding.Validator JSON String HTML Redirect File Abort AbortWithStatus NoRoute NoMethod Logger Recovery SetTrustedProxies Run RunTLS RunUnix httptest CreateTestContext SetMode TestMode");
    expect(report.serverSetups.some((item) => item.framework === "gin" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "put", "patch", "delete", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-not-found-handler", "framework-errors", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["go-test"]));
    expect(readySignals(report.ginSignals)).toEqual(expect.arrayContaining([
      "package",
      "default-engine",
      "engine-type",
      "method-routes",
      "route-group",
      "middleware-use",
      "handler-func",
      "context-param",
      "context-query",
      "context-post-form",
      "context-header",
      "context-raw-data",
      "binding",
      "binding-json",
      "binding-query",
      "binding-uri",
      "validator",
      "json-response",
      "string-response",
      "html-response",
      "redirect",
      "file-response",
      "status",
      "abort",
      "no-route",
      "no-method",
      "logger",
      "recovery",
      "trusted-proxies",
      "templates",
      "static-files",
      "run",
      "run-tls",
      "run-unix",
      "httptest",
      "create-test-context",
      "test-mode"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["gin"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Gin Signals");
    expect(markdown).toContain("Gin package evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Gin Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Echo server framework readiness signals without running Go code", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-echo-server-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-echo-server-source-"));
    await fs.mkdir(path.join(sourceRoot, "cmd", "server"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "internal", "http"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "public"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/echofixture",
      "",
      "go 1.24",
      "",
      "require github.com/labstack/echo/v4 v4.14.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "cmd", "server", "main.go"), [
      "package main",
      "",
      "import (",
      "  stdhttp \"net/http\"",
      "  server \"example.com/echofixture/internal/http\"",
      ")",
      "",
      "func main() {",
      "  e := server.NewRouter()",
      "  _ = e.Start(\":8080\")",
      "  _ = e.StartTLS(\":8443\", \"cert.pem\", \"key.pem\")",
      "  _ = e.StartAutoTLS(\":443\")",
      "  _ = e.StartServer(&stdhttp.Server{Addr: \":9090\", Handler: e})",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router.go"), [
      "package http",
      "",
      "import (",
      "  \"io\"",
      "  \"net/http\"",
      "  \"strings\"",
      "",
      "  \"github.com/labstack/echo/v4\"",
      "  \"github.com/labstack/echo/v4/middleware\"",
      ")",
      "",
      "type CreateBookRequest struct {",
      "  Title string `json:\"title\" validate:\"required\"`",
      "}",
      "",
      "type bookValidator struct{}",
      "",
      "func (bookValidator) Validate(i any) error { return nil }",
      "",
      "type templateRenderer struct{}",
      "",
      "func (templateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error { return nil }",
      "",
      "type bookRoutes struct {",
      "  group *echo.Group",
      "}",
      "",
      "func NewRouter() *echo.Echo {",
      "  e := echo.New()",
      "  e.Validator = bookValidator{}",
      "  e.Renderer = templateRenderer{}",
      "  e.HTTPErrorHandler = echo.DefaultHTTPErrorHandler",
      "  e.Use(middleware.Logger(), middleware.Recover())",
      "  e.Static(\"/public\", \"./public\")",
      "  e.File(\"/favicon.ico\", \"./public/favicon.ico\")",
      "  e.Pre(middleware.RemoveTrailingSlash())",
      "  e.GET(\"/missing\", echo.NotFoundHandler)",
      "  e.GET(\"/method\", echo.MethodNotAllowedHandler)",
      "  api := e.Group(\"/api\")",
      "  routes := bookRoutes{group: api}",
      "  api.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{}))",
      "  routes.group.GET(\"/books/:id\", showBook)",
      "  routes.group.POST(\"/books\", createBook)",
      "  routes.group.PUT(\"/books/:id\", updateBook)",
      "  routes.group.PATCH(\"/books/:id\", patchBook)",
      "  routes.group.DELETE(\"/books/:id\", deleteBook)",
      "  routes.group.Any(\"/health\", func(c echo.Context) error { return c.String(http.StatusOK, \"ok\") })",
      "  routes.group.Match([]string{http.MethodHead, http.MethodOptions}, \"/probe\", func(c echo.Context) error { return c.NoContent(http.StatusNoContent) })",
      "  return e",
      "}",
      "",
      "func showBook(c echo.Context) error {",
      "  id := c.Param(\"id\")",
      "  q := c.QueryParam(\"format\")",
      "  _ = c.FormValue(\"title\")",
      "  c.Response().Header().Set(\"X-Book\", id)",
      "  _ = c.Request().Header.Get(\"User-Agent\")",
      "  if q == \"html\" { return c.HTML(http.StatusOK, \"<p>\"+id+\"</p>\") }",
      "  if q == \"redirect\" { return c.Redirect(http.StatusFound, \"/api/books/\"+id) }",
      "  if q == \"file\" { return c.File(\"./public/readme.txt\") }",
      "  if q == \"attachment\" { return c.Attachment(\"./public/readme.txt\", \"readme.txt\") }",
      "  if q == \"inline\" { return c.Inline(\"./public/readme.txt\", \"readme.txt\") }",
      "  if q == \"stream\" { return c.Stream(http.StatusOK, \"text/plain\", strings.NewReader(id)) }",
      "  return c.JSON(http.StatusOK, map[string]string{\"id\": id})",
      "}",
      "",
      "func createBook(c echo.Context) error {",
      "  var body CreateBookRequest",
      "  if err := c.Bind(&body); err != nil { return echo.NewHTTPError(http.StatusBadRequest, err.Error()) }",
      "  if err := c.Validate(&body); err != nil { return echo.NewHTTPError(http.StatusUnprocessableEntity, err.Error()) }",
      "  return c.JSON(http.StatusCreated, body)",
      "}",
      "",
      "func updateBook(c echo.Context) error { return c.String(http.StatusAccepted, c.FormValue(\"title\")) }",
      "func patchBook(c echo.Context) error { return c.NoContent(http.StatusNoContent) }",
      "func deleteBook(c echo.Context) error { return echo.NewHTTPError(http.StatusGone, \"deleted\") }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router_test.go"), [
      "package http",
      "",
      "import (",
      "  \"net/http\"",
      "  \"net/http/httptest\"",
      "  \"testing\"",
      "",
      "  \"github.com/labstack/echo/v4\"",
      ")",
      "",
      "func TestNewRouter(t *testing.T) {",
      "  e := echo.New()",
      "  req := httptest.NewRequest(http.MethodGet, \"/api/books/1\", nil)",
      "  rec := httptest.NewRecorder()",
      "  c := e.NewContext(req, rec)",
      "  c.SetParamNames(\"id\")",
      "  c.SetParamValues(\"1\")",
      "  _ = showBook(c)",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "public", "readme.txt"), "static fixture\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      echoSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("echo.New echo.Echo echo.Group GET POST PUT PATCH DELETE Any Match Group Use echo.Context Param QueryParam FormValue Request Bind Validate JSON String HTML Redirect File Attachment Inline NoContent Stream HTTPError NewHTTPError NotFoundHandler MethodNotAllowedHandler Recover Logger Renderer Static Start StartTLS StartAutoTLS StartServer NewContext httptest");
    expect(report.serverSetups.some((item) => item.framework === "echo" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "put", "patch", "delete", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "set-not-found-handler", "framework-errors", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["go-test"]));
    expect(readySignals(report.echoSignals)).toEqual(expect.arrayContaining([
      "package",
      "new-instance",
      "echo-type",
      "group-type",
      "method-routes",
      "route-group",
      "middleware-use",
      "handler-func",
      "context-param",
      "context-query",
      "context-form",
      "context-header",
      "request",
      "binding",
      "validator",
      "json-response",
      "string-response",
      "html-response",
      "redirect",
      "file-response",
      "attachment",
      "inline",
      "no-content",
      "stream",
      "http-error",
      "not-found-handler",
      "method-not-allowed-handler",
      "recover",
      "logger",
      "renderer",
      "static-files",
      "start",
      "start-tls",
      "start-auto-tls",
      "start-server",
      "new-context",
      "httptest"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["echo"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Echo Signals");
    expect(markdown).toContain("Echo package evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Echo Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Fiber server framework readiness signals without running Go code", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-fiber-server-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-fiber-server-source-"));
    await fs.mkdir(path.join(sourceRoot, "cmd", "server"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "internal", "http"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "public"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/fiberfixture",
      "",
      "go 1.24",
      "",
      "require github.com/gofiber/fiber/v3 v3.0.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "cmd", "server", "main.go"), [
      "package main",
      "",
      "import (",
      "  server \"example.com/fiberfixture/internal/http\"",
      ")",
      "",
      "func main() {",
      "  app := server.NewRouter()",
      "  _ = app.Listen(\":8080\")",
      "  _ = app.ListenTLS(\":8443\", \"cert.pem\", \"key.pem\")",
      "  _ = app.ListenMutualTLS(\":9443\", \"cert.pem\", \"key.pem\", \"ca.pem\")",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router.go"), [
      "package http",
      "",
      "import (",
      "  \"strings\"",
      "",
      "  \"github.com/gofiber/fiber/v3\"",
      "  \"github.com/gofiber/fiber/v3/middleware/logger\"",
      "  \"github.com/gofiber/fiber/v3/middleware/recover\"",
      ")",
      "",
      "type CreateBookRequest struct {",
      "  Title string `json:\"title\" validate:\"required\"`",
      "}",
      "",
      "type bookValidator struct{}",
      "",
      "func (bookValidator) Validate(out any) error { return nil }",
      "",
      "type bookRoutes struct {",
      "  router fiber.Router",
      "}",
      "",
      "func NewRouter() *fiber.App {",
      "  app := fiber.New(fiber.Config{",
      "    ErrorHandler: func(c fiber.Ctx, err error) error {",
      "      return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{\"error\": err.Error()})",
      "    },",
      "    StructValidator: bookValidator{},",
      "  })",
      "  app.Use(logger.New(), recover.New(), func(c fiber.Ctx) error {",
      "    c.Get(\"X-Request-ID\")",
      "    return c.Next()",
      "  })",
      "  app.Static(\"/public\", \"./public\")",
      "  app.Get(\"/missing\", func(c fiber.Ctx) error { return fiber.NewError(fiber.StatusNotFound, \"missing\") })",
      "  app.Mount(\"/mounted\", fiber.New())",
      "  app.Route(\"/admin\", func(router fiber.Router) {",
      "    router.Get(\"/dashboard\", func(c fiber.Ctx) error { return c.SendString(\"admin\") })",
      "  })",
      "  api := app.Group(\"/api\")",
      "  routes := bookRoutes{router: api}",
      "  routes.router.Get(\"/books/:id\", showBook)",
      "  routes.router.Post(\"/books\", createBook)",
      "  routes.router.Put(\"/books/:id\", updateBook)",
      "  routes.router.Patch(\"/books/:id\", patchBook)",
      "  routes.router.Delete(\"/books/:id\", deleteBook)",
      "  routes.router.All(\"/health\", func(c fiber.Ctx) error { return c.SendStatus(fiber.StatusOK) })",
      "  return app",
      "}",
      "",
      "func showBook(c fiber.Ctx) error {",
      "  id := c.Params(\"id\")",
      "  q := c.Query(\"format\")",
      "  _ = c.Get(\"User-Agent\")",
      "  _ = c.Body()",
      "  if q == \"render\" { return c.Render(\"book\", fiber.Map{\"id\": id}) }",
      "  if q == \"redirect\" { return c.Redirect().Status(fiber.StatusFound).To(\"/api/books/\" + id) }",
      "  if q == \"file\" { return c.SendFile(\"./public/readme.txt\") }",
      "  if q == \"download\" { return c.Download(\"./public/readme.txt\", \"readme.txt\") }",
      "  if q == \"stream\" { return c.SendStream(strings.NewReader(id)) }",
      "  return c.JSON(fiber.Map{\"id\": id})",
      "}",
      "",
      "func createBook(c fiber.Ctx) error {",
      "  var body CreateBookRequest",
      "  if err := c.Bind().Body(&body); err != nil { return fiber.NewError(fiber.StatusBadRequest, err.Error()) }",
      "  return c.Status(fiber.StatusCreated).JSON(body)",
      "}",
      "",
      "func updateBook(c fiber.Ctx) error { return c.SendString(c.Query(\"title\")) }",
      "func patchBook(c fiber.Ctx) error { return c.SendStatus(fiber.StatusNoContent) }",
      "func deleteBook(c fiber.Ctx) error { return fiber.NewError(fiber.StatusGone, \"deleted\") }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router_test.go"), [
      "package http",
      "",
      "import (",
      "  \"net/http\"",
      "  \"net/http/httptest\"",
      "  \"testing\"",
      "",
      "  \"github.com/gofiber/fiber/v3\"",
      ")",
      "",
      "func TestNewRouter(t *testing.T) {",
      "  app := fiber.New()",
      "  ctx := app.AcquireCtx(nil)",
      "  app.ReleaseCtx(ctx)",
      "  _ = fiber.NewDefaultCtx(app)",
      "  req := httptest.NewRequest(http.MethodGet, \"/api/books/1\", nil)",
      "  _, _ = NewRouter().Test(req)",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "public", "readme.txt"), "static fixture\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      fiberSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("fiber.New fiber.App fiber.Ctx fiber.Router Get Post Put Patch Delete All Group Route Mount Use Static Params Query Get Bind Body JSON SendString Render Redirect SendFile Download SendStream SendStatus Status NewError ErrorHandler recover.New logger.New Listen ListenTLS ListenMutualTLS app.Test httptest");
    expect(report.serverSetups.some((item) => item.framework === "fiber" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "put", "patch", "delete", "route", "all", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response", "validator-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "set-not-found-handler", "framework-errors", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["go-test"]));
    expect(readySignals(report.fiberSignals)).toEqual(expect.arrayContaining([
      "package",
      "new-app",
      "app-type",
      "ctx-type",
      "router-type",
      "method-routes",
      "route-group",
      "route-function",
      "mount",
      "middleware-use",
      "handler-func",
      "context-next",
      "context-param",
      "context-query",
      "context-header",
      "context-body",
      "binding",
      "validator",
      "json-response",
      "string-response",
      "render-response",
      "redirect",
      "send-file",
      "download",
      "send-stream",
      "send-status",
      "status",
      "fiber-error",
      "error-handler",
      "recover",
      "logger",
      "static-files",
      "listen",
      "listen-tls",
      "listen-mutual-tls",
      "app-test",
      "httptest",
      "custom-context"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["fiber"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Fiber Signals");
    expect(markdown).toContain("Fiber package evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Fiber Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Chi server framework readiness without executing the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-chi-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-chi-source-"));
    await fs.mkdir(path.join(sourceRoot, "cmd", "server"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "internal", "http"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/chifixture",
      "",
      "go 1.24",
      "",
      "require github.com/go-chi/chi/v5 v5.2.2"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "cmd", "server", "main.go"), [
      "package main",
      "",
      "import (",
      "  \"net/http\"",
      "",
      "  server \"example.com/chifixture/internal/http\"",
      ")",
      "",
      "func main() {",
      "  r := server.NewRouter()",
      "  _ = http.ListenAndServe(\":8080\", r)",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router.go"), [
      "package http",
      "",
      "import (",
      "  \"encoding/json\"",
      "  \"fmt\"",
      "  \"net/http\"",
      "  \"time\"",
      "",
      "  \"github.com/go-chi/chi/v5\"",
      "  \"github.com/go-chi/chi/v5/middleware\"",
      ")",
      "",
      "type Book struct {",
      "  Title string `json:\"title\"`",
      "}",
      "",
      "func NewRouter() chi.Router {",
      "  r := chi.NewRouter()",
      "  var _ *chi.Mux = chi.NewMux()",
      "  var chain chi.Middlewares",
      "  chain = append(chain, middleware.NoCache)",
      "  _ = chain.HandlerFunc(showBook)",
      "  var _ chi.Routes = r",
      "  r.Use(middleware.RequestID)",
      "  r.Use(middleware.RealIP)",
      "  r.Use(middleware.Logger)",
      "  r.Use(middleware.Recoverer)",
      "  r.Use(middleware.Timeout(30 * time.Second))",
      "  r.Use(middleware.Compress(5))",
      "  r.Use(middleware.Throttle(100))",
      "  r.Use(middleware.StripSlashes)",
      "  r.Use(middleware.RedirectSlashes)",
      "  r.Use(middleware.URLFormat)",
      "  r.Use(middleware.NoCache)",
      "  r.Use(middleware.Heartbeat(\"/ping\"))",
      "  r.Use(middleware.AllowContentType(\"application/json\"))",
      "  r.Use(middleware.AllowContentEncoding(\"gzip\"))",
      "  r.Use(middleware.ContentCharset(\"utf-8\"))",
      "  r.Use(middleware.SetHeader(\"X-App\", \"books\"))",
      "  r.Use(middleware.GetHead)",
      "  r.Use(middleware.CleanPath)",
      "  r.Use(middleware.BasicAuth(\"books\", map[string]string{\"admin\": \"redacted\"}))",
      "  r.Use(middleware.RouteHeaders().Route(\"Accept\", \"application/json\", middleware.NoCache).Handler)",
      "  r.Use(middleware.WithValue(\"tenant\", \"books\"))",
      "  r.Use(middleware.ClientIPFromHeader(\"X-Forwarded-For\"))",
      "  r.NotFound(func(w http.ResponseWriter, r *http.Request) { http.NotFound(w, r) })",
      "  r.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) { http.Error(w, \"method\", http.StatusMethodNotAllowed) })",
      "  r.Get(\"/books/{id}\", showBook)",
      "  r.Post(\"/books\", createBook)",
      "  r.Put(\"/books/{id}\", updateBook)",
      "  r.Patch(\"/books/{id}\", patchBook)",
      "  r.Delete(\"/books/{id}\", deleteBook)",
      "  r.Head(\"/books/{id}\", headBook)",
      "  r.Options(\"/books\", optionsBooks)",
      "  r.Connect(\"/tunnel\", tunnel)",
      "  r.Trace(\"/trace\", traceBook)",
      "  r.Method(http.MethodGet, \"/method/{id}\", http.HandlerFunc(showBook))",
      "  r.MethodFunc(http.MethodPost, \"/method\", createBook)",
      "  r.Handle(\"/legacy/*\", http.HandlerFunc(showBook))",
      "  r.HandleFunc(\"/legacy-func/*\", showBook)",
      "  r.With(middleware.Maybe(middleware.NoCache, func(r *http.Request) bool { return true })).Get(\"/cached/{id}\", showBook)",
      "  r.Group(func(r chi.Router) {",
      "    r.Get(\"/group/{id}\", showBook)",
      "  })",
      "  r.Route(\"/admin\", func(r chi.Router) {",
      "    r.Get(\"/dashboard/{id}\", showBook)",
      "  })",
      "  r.Mount(\"/mounted\", chi.NewRouter())",
      "  return r",
      "}",
      "",
      "func showBook(w http.ResponseWriter, r *http.Request) {",
      "  id := chi.URLParam(r, \"id\")",
      "  _ = chi.URLParamFromCtx(r.Context(), \"id\")",
      "  routePattern := chi.RouteContext(r.Context()).RoutePattern()",
      "  _ = r.URL.Query().Get(\"format\")",
      "  _ = r.Header.Get(\"X-Trace\")",
      "  w.Header().Set(\"Content-Type\", \"application/json\")",
      "  json.NewEncoder(w).Encode(map[string]string{\"id\": id, \"route\": routePattern})",
      "}",
      "",
      "func createBook(w http.ResponseWriter, r *http.Request) {",
      "  var body Book",
      "  _ = json.NewDecoder(r.Body).Decode(&body)",
      "  w.WriteHeader(http.StatusCreated)",
      "  json.NewEncoder(w).Encode(body)",
      "}",
      "",
      "func updateBook(w http.ResponseWriter, r *http.Request) { fmt.Fprintf(w, \"update:%s\", chi.URLParam(r, \"id\")) }",
      "func patchBook(w http.ResponseWriter, r *http.Request) { http.Redirect(w, r, \"/books/\"+chi.URLParam(r, \"id\"), http.StatusFound) }",
      "func deleteBook(w http.ResponseWriter, r *http.Request) { http.Error(w, \"gone\", http.StatusGone) }",
      "func headBook(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusNoContent) }",
      "func optionsBooks(w http.ResponseWriter, r *http.Request) { w.Header().Set(\"Allow\", \"GET,POST,OPTIONS\"); w.WriteHeader(http.StatusOK) }",
      "func tunnel(w http.ResponseWriter, r *http.Request) { w.Write([]byte(\"connect\")) }",
      "func traceBook(w http.ResponseWriter, r *http.Request) { w.Write([]byte(\"trace\")) }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router_test.go"), [
      "package http",
      "",
      "import (",
      "  \"net/http\"",
      "  \"net/http/httptest\"",
      "  \"testing\"",
      "",
      "  \"github.com/go-chi/chi/v5\"",
      ")",
      "",
      "func TestNewRouter(t *testing.T) {",
      "  r := NewRouter()",
      "  req := httptest.NewRequest(http.MethodGet, \"/books/1\", nil)",
      "  rec := httptest.NewRecorder()",
      "  r.ServeHTTP(rec, req)",
      "  ctx := chi.NewRouteContext()",
      "  _ = r.Match(ctx, http.MethodGet, \"/books/1\")",
      "  _ = r.Find(ctx, http.MethodGet, \"/books/1\")",
      "  _ = r.Routes()",
      "  _ = r.Middlewares()",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      chiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("chi.NewRouter chi.NewMux chi.Mux chi.Router chi.Routes chi.Middlewares Get Post Put Patch Delete Head Options Connect Trace Method MethodFunc Handle HandleFunc Group Route Mount Use With Chain URLParam URLParamFromCtx RouteContext NewRouteContext RoutePattern Routes Middlewares Match Find NotFound MethodNotAllowed middleware.Logger middleware.Recoverer middleware.RequestID middleware.RealIP middleware.ClientIP middleware.Timeout middleware.Compress middleware.Throttle middleware.StripSlashes middleware.RedirectSlashes middleware.URLFormat httptest");
    expect(report.serverSetups.some((item) => item.framework === "chi" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "put", "patch", "delete", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-not-found-handler", "framework-errors", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["go-test"]));
    expect(readySignals(report.chiSignals)).toEqual(expect.arrayContaining([
      "package",
      "new-router",
      "new-mux",
      "mux-type",
      "router-interface",
      "routes-interface",
      "middlewares-type",
      "method-routes",
      "method-route",
      "method-func-route",
      "handle",
      "handle-func",
      "route-group",
      "route-function",
      "mount",
      "middleware-use",
      "middleware-with",
      "chain",
      "handler-func",
      "url-param",
      "url-param-from-ctx",
      "route-context",
      "new-route-context",
      "route-pattern",
      "route-params",
      "request-context",
      "json-response",
      "text-response",
      "response-status",
      "redirect",
      "not-found",
      "method-not-allowed",
      "routes-traversal",
      "match",
      "find",
      "logger",
      "recoverer",
      "request-id",
      "real-ip",
      "client-ip",
      "timeout",
      "compress",
      "throttle",
      "strip-slashes",
      "redirect-slashes",
      "url-format",
      "no-cache",
      "heartbeat",
      "content-type",
      "set-header",
      "get-head",
      "clean-path",
      "basic-auth",
      "route-headers",
      "with-value",
      "httptest"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["chi"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Chi Signals");
    expect(markdown).toContain("Chi package evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Chi Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Gorilla Mux server framework readiness without executing the app", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mux-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mux-source-"));
    await fs.mkdir(path.join(sourceRoot, "cmd", "server"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "internal", "http"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "public"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/muxfixture",
      "",
      "go 1.24",
      "",
      "require github.com/gorilla/mux v1.8.1"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "cmd", "server", "main.go"), [
      "package main",
      "",
      "import (",
      "  \"net/http\"",
      "  \"time\"",
      "",
      "  server \"example.com/muxfixture/internal/http\"",
      ")",
      "",
      "func main() {",
      "  r := server.NewRouter()",
      "  srv := &http.Server{Addr: \":8080\", Handler: r, ReadTimeout: 5 * time.Second}",
      "  _ = srv.ListenAndServe()",
      "  _ = http.ListenAndServe(\":9090\", r)",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router.go"), [
      "package http",
      "",
      "import (",
      "  \"encoding/json\"",
      "  \"fmt\"",
      "  \"net/http\"",
      "",
      "  \"github.com/gorilla/mux\"",
      ")",
      "",
      "type Book struct {",
      "  Title string `json:\"title\"`",
      "}",
      "",
      "func loggingMiddleware(next http.Handler) http.Handler {",
      "  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {",
      "    w.Header().Set(\"X-Middleware\", \"yes\")",
      "    next.ServeHTTP(w, r)",
      "  })",
      "}",
      "",
      "func NewRouter() *mux.Router {",
      "  r := mux.NewRouter().StrictSlash(true).SkipClean(true).UseEncodedPath().OmitRouteFromContext(false).OmitRouterFromContext(false)",
      "  var _ *mux.Router = r",
      "  var _ *mux.Route = r.NewRoute()",
      "  var _ mux.RouteMatch",
      "  var _ mux.MiddlewareFunc = loggingMiddleware",
      "  r.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { http.NotFound(w, r) })",
      "  r.MethodNotAllowedHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { http.Error(w, \"method\", http.StatusMethodNotAllowed) })",
      "  r.Use(loggingMiddleware, mux.CORSMethodMiddleware(r))",
      "  r.HandleFunc(\"/books/{id:[0-9]+}\", showBook).Methods(http.MethodGet, http.MethodOptions).Name(\"book\").Headers(\"Accept\", \"application/json\").HeadersRegexp(\"Content-Type\", \"application/(json|text)\").Queries(\"format\", \"{format}\").Schemes(\"https\").BuildVarsFunc(func(vars map[string]string) map[string]string { return vars }).Use(loggingMiddleware)",
      "  r.Handle(\"/legacy/{id}\", http.HandlerFunc(showBook)).Handler(http.HandlerFunc(showBook)).HandlerFunc(showBook)",
      "  r.Path(\"/books\").Methods(http.MethodPost).HandlerFunc(createBook)",
      "  r.PathPrefix(\"/static/\").Handler(http.StripPrefix(\"/static/\", http.FileServer(http.Dir(\"./public\"))))",
      "  r.Host(\"{subdomain}.example.com\").Subrouter().HandleFunc(\"/hosted/{id}\", showBook)",
      "  r.PathPrefix(\"/admin\").Subrouter().HandleFunc(\"/dashboard/{id}\", showBook).Methods(http.MethodGet)",
      "  r.MatcherFunc(func(r *http.Request, rm *mux.RouteMatch) bool { return true }).HandlerFunc(showBook)",
      "  r.Walk(func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {",
      "    _, _ = route.GetPathTemplate()",
      "    _, _ = route.GetPathRegexp()",
      "    _, _ = route.GetQueriesTemplates()",
      "    _, _ = route.GetQueriesRegexp()",
      "    _, _ = route.GetMethods()",
      "    _ = route.GetName()",
      "    _ = route.GetHandler()",
      "    return nil",
      "  })",
      "  if route := r.Get(\"book\"); route != nil {",
      "    _, _ = route.URL(\"id\", \"42\", \"format\", \"json\")",
      "    _, _ = route.URLHost(\"subdomain\", \"api\")",
      "    _, _ = route.URLPath(\"id\", \"42\")",
      "    _, _ = route.GetVarNames()",
      "  }",
      "  return r",
      "}",
      "",
      "func showBook(w http.ResponseWriter, r *http.Request) {",
      "  vars := mux.Vars(r)",
      "  _ = mux.CurrentRoute(r)",
      "  _ = mux.CurrentRouter(r)",
      "  _ = r.URL.Query().Get(\"format\")",
      "  _ = r.Header.Get(\"X-Trace\")",
      "  w.Header().Set(\"Content-Type\", \"application/json\")",
      "  json.NewEncoder(w).Encode(map[string]string{\"id\": vars[\"id\"]})",
      "}",
      "",
      "func createBook(w http.ResponseWriter, r *http.Request) {",
      "  var body Book",
      "  _ = json.NewDecoder(r.Body).Decode(&body)",
      "  w.WriteHeader(http.StatusCreated)",
      "  fmt.Fprintf(w, \"created:%s\", body.Title)",
      "}",
      "",
      "func updateBook(w http.ResponseWriter, r *http.Request) { http.Redirect(w, r, \"/books/\"+mux.Vars(r)[\"id\"], http.StatusFound) }",
      "func deleteBook(w http.ResponseWriter, r *http.Request) { http.Error(w, \"gone\", http.StatusGone) }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "http", "router_test.go"), [
      "package http",
      "",
      "import (",
      "  \"net/http\"",
      "  \"net/http/httptest\"",
      "  \"testing\"",
      "",
      "  \"github.com/gorilla/mux\"",
      ")",
      "",
      "func TestNewRouter(t *testing.T) {",
      "  r := NewRouter()",
      "  req := httptest.NewRequest(http.MethodGet, \"/books/1\", nil)",
      "  req = mux.SetURLVars(req, map[string]string{\"id\": \"1\"})",
      "  rec := httptest.NewRecorder()",
      "  r.ServeHTTP(rec, req)",
      "  var match mux.RouteMatch",
      "  _ = r.Match(req, &match)",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "public", "readme.txt"), "static fixture\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      muxSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("mux.NewRouter mux.Router mux.Route mux.RouteMatch Handle HandleFunc Handler HandlerFunc Methods Path PathPrefix Host Headers HeadersRegexp Queries Schemes MatcherFunc Subrouter Name URL URLHost URLPath GetVarNames BuildVarsFunc StrictSlash SkipClean UseEncodedPath Vars SetURLVars CurrentRoute CurrentRouter MiddlewareFunc Use CORSMethodMiddleware Walk WalkFunc GetPathTemplate GetMethods httptest");
    expect(report.serverSetups.some((item) => item.framework === "gorilla-mux" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "route", "params"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-not-found-handler", "framework-errors", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["go-test"]));
    expect(readySignals(report.muxSignals)).toEqual(expect.arrayContaining([
      "package",
      "new-router",
      "router-type",
      "route-type",
      "route-match",
      "route-match-type",
      "serve-http",
      "handle",
      "handle-func",
      "handler",
      "handler-func",
      "method-routes",
      "path",
      "path-prefix",
      "host",
      "headers",
      "headers-regexp",
      "queries",
      "schemes",
      "matcher-func",
      "subrouter",
      "route-name",
      "url-builder",
      "url-host",
      "url-path",
      "var-names",
      "build-vars-func",
      "strict-slash",
      "skip-clean",
      "encoded-path",
      "context-omit",
      "vars",
      "set-url-vars",
      "current-route",
      "current-router",
      "middleware-func",
      "router-use",
      "route-use",
      "cors-method-middleware",
      "not-found-handler",
      "method-not-allowed-handler",
      "walk",
      "walk-func",
      "route-getters",
      "static-files",
      "httptest"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["gorilla-mux"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Mux Signals");
    expect(markdown).toContain("Gorilla Mux package evidence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Mux Signals");
    expect(html).toContain("Gorilla Mux");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects TanStack Router typed route signals without executing navigation", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tanstack-router-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tanstack-router-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "routes"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "tanstack-router-fixture",
      dependencies: {
        "@tanstack/react-router": "^1.132.0",
        "@tanstack/router-devtools": "^1.132.0",
        "@tanstack/router-plugin": "^1.132.0"
      },
      devDependencies: {
        "@tanstack/eslint-plugin-router": "^1.132.0",
        vitest: "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "vite.config.ts"), [
      "import { defineConfig } from 'vite';",
      "import { TanStackRouterVite } from '@tanstack/router-plugin/vite';",
      "",
      "export default defineConfig({",
      "  plugins: [TanStackRouterVite({ routeToken: 'route' })]",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "eslint.config.js"), [
      "import router from '@tanstack/eslint-plugin-router';",
      "",
      "export default [router.configs['flat/recommended'], { rules: { '@tanstack/router/create-route-property-order': 'error' } }];"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main.tsx"), [
      "import { RouterProvider, createRouteMask, createRouter, getRouteApi } from '@tanstack/react-router';",
      "import { TanStackRouterDevtools } from '@tanstack/router-devtools';",
      "import { routeTree } from './routeTree.gen';",
      "",
      "const postRouteApi = getRouteApi('/posts/$postId');",
      "const postMask = createRouteMask({ routeTree, from: '/posts/$postId', to: '/posts/$postId', params: true });",
      "",
      "const router = createRouter({",
      "  routeTree,",
      "  defaultPreload: 'intent',",
      "  preloadStaleTime: 10_000,",
      "  routeMasks: [postMask]",
      "});",
      "",
      "export function App() {",
      "  const params = postRouteApi.useParams();",
      "  return <><RouterProvider router={router} context={{ user: 'learner' }} /><TanStackRouterDevtools router={router} />{params.postId}</>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "routeTree.gen.ts"), [
      "import { Route as rootRouteImport } from './routes/__root';",
      "import { Route as postsPostIdImport } from './routes/posts.$postId';",
      "",
      "declare module '@tanstack/react-router' {",
      "  interface FileRoutesByPath {",
      "    '/posts/$postId': { id: '/posts/$postId'; path: '/posts/$postId'; fullPath: '/posts/$postId' }",
      "  }",
      "}",
      "",
      "export const routeTree = rootRouteImport.addChildren([postsPostIdImport]);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "routes", "__root.tsx"), [
      "import { HeadContent, Outlet, Scripts, createRootRouteWithContext, notFound } from '@tanstack/react-router';",
      "",
      "type RouterContext = { user: string };",
      "",
      "export const Route = createRootRouteWithContext<RouterContext>()({",
      "  beforeLoad: ({ context }) => {",
      "    if (!context.user) throw notFound();",
      "    return { session: context.user };",
      "  },",
      "  notFoundComponent: () => <p>Missing route</p>,",
      "  component: () => <><HeadContent /><Outlet /><Scripts /></>",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "routes", "posts.$postId.tsx"), [
      "import { Link, SearchSchemaInput, createFileRoute, linkOptions, redirect } from '@tanstack/react-router';",
      "",
      "const postLinks = linkOptions([{ to: '/posts/$postId', params: { postId: 'intro' }, search: { tab: 'notes' } }]);",
      "",
      "export const Route = createFileRoute('/posts/$postId')({",
      "  validateSearch: (search: Record<string, unknown>): SearchSchemaInput => ({ tab: search.tab ?? 'overview' }),",
      "  search: { middlewares: [] },",
      "  beforeLoad: ({ params }) => {",
      "    if (params.postId === 'old') throw redirect({ to: '/posts/$postId', params: { postId: 'new' } });",
      "  },",
      "  loaderDeps: ({ search }) => ({ tab: search.tab }),",
      "  loader: async ({ params, deps }) => ({ postId: params.postId, tab: deps.tab }),",
      "  component: PostRoute",
      "});",
      "",
      "function PostRoute() {",
      "  const params = Route.useParams();",
      "  const search = Route.useSearch();",
      "  const data = Route.useLoaderData();",
      "  return <Link {...postLinks[0]} activeProps={{ className: 'active' }}>{params.postId}:{search.tab}:{data.postId}</Link>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Routing notes",
      "",
      "This app uses retainSearchParams, stripSearchParams, routeToken, and create-route-property-order guidance."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "routing-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      routingSetups: Array<{ mode: string; readiness: string }>;
      routeDefinitions: Array<{ routeCount: number; dynamicSegmentCount: number; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      dataRouteSignals: Array<{ signal: string; readiness: string }>;
      fileRouteSignals: Array<{ signal: string; readiness: string }>;
      tanstackSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("React Router TanStack Router BrowserRouter createBrowserRouter RouterProvider routes.ts route index Link NavLink Outlet loader action ErrorBoundary useNavigate useParams useSearchParams createRouter routeTree routeTree.gen createFileRoute createRootRoute createRoute Route.useParams validateSearch beforeLoad SearchSchemaInput linkOptions createRouteMask preload notFound TanStackRouterVite TanStackRouterDevtools");
    expect(report.routingSetups.some((item) => item.mode === "tanstack" && item.readiness === "ready")).toBe(true);
    expect(report.routeDefinitions.some((item) => item.routeCount > 0 && item.dynamicSegmentCount > 0 && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["Link", "useParams"]));
    expect(readySignals(report.dataRouteSignals)).toEqual(expect.arrayContaining(["loader", "redirect"]));
    expect(readySignals(report.fileRouteSignals)).toEqual(expect.arrayContaining(["dynamic-segment", "nested-route", "root-route"]));
    expect(readySignals(report.tanstackSignals)).toEqual(expect.arrayContaining(["router-provider", "create-router", "route-tree", "generated-route-tree", "file-route", "root-route", "typed-route-api", "route-hooks", "loader", "before-load", "validate-search", "search-schema", "link-options", "route-masking", "preload", "not-found", "devtools", "vite-plugin", "eslint-plugin"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["tanstack-router"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "routing-readiness.md"), "utf8");
    expect(markdown).toContain("## TanStack Router Signals");
    expect(markdown).toContain("validate-search");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "routing-readiness.html"), "utf8");
    expect(html).toContain("TanStack Router Signals");
    expect(html).toContain("data-source-pattern=\"React Router TanStack Router\"");
  });

  it("detects Storybook official signals without starting the component workshop", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-storybook-signals-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-storybook-signals-source-"));
    await fs.mkdir(path.join(sourceRoot, ".storybook"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "storybook-official-signals-fixture",
      private: true,
      scripts: {
        storybook: "storybook dev -p 6006",
        "build-storybook": "storybook build --output-dir storybook-static",
        "test-storybook": "test-storybook --coverage",
        chromatic: "chromatic --project-token=demo --storybook-build-dir storybook-static"
      },
      devDependencies: {
        "@chromatic-com/storybook": "latest",
        "@storybook/addon-a11y": "latest",
        "@storybook/addon-svelte-csf": "latest",
        "@storybook/addon-vitest": "latest",
        "@storybook/react-vite": "latest",
        "@storybook/test-runner": "latest",
        "msw-storybook-addon": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".storybook", "main.ts"), [
      "import type { StorybookConfig } from '@storybook/react-vite';",
      "",
      "const config: StorybookConfig = {",
      "  framework: { name: '@storybook/react-vite', options: {} },",
      "  stories: ['../src/**/*.stories.@(ts|tsx|mdx)', '../src/**/*.mdx'],",
      "  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest', '@chromatic-com/storybook', 'msw-storybook-addon', '@storybook/addon-svelte-csf'],",
      "  staticDirs: ['../public'],",
      "  refs: { designSystem: { title: 'Design System', url: 'https://example.com/storybook' } },",
      "  docs: { autodocs: true }",
      "};",
      "",
      "export default config;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".storybook", "preview.ts"), [
      "import { initialize } from 'msw-storybook-addon';",
      "",
      "initialize({ onUnhandledRequest: 'bypass' });",
      "",
      "export const parameters = {",
      "  controls: { expanded: true },",
      "  actions: { argTypesRegex: '^on[A-Z].*' }",
      "};",
      "",
      "export const decorators = [(Story) => Story()];",
      "",
      "export const globalTypes = {",
      "  theme: { toolbar: { items: ['light', 'dark'] } }",
      "};",
      "",
      "const preview = {",
      "  beforeEach: async () => ({ cleanup: true })",
      "};",
      "",
      "export default preview;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "Button.stories.tsx"), [
      "import type { Meta, StoryObj } from '@storybook/react-vite';",
      "import { expect, fn, userEvent, within } from 'storybook/test';",
      "",
      "const Button = (props: { label: string; onClick: () => void }) => null;",
      "",
      "const meta = {",
      "  component: Button,",
      "  tags: ['autodocs'],",
      "  args: { label: 'Save changes', onClick: fn() },",
      "  argTypes: { label: { control: 'text' } },",
      "  parameters: { msw: { handlers: [] }, layout: 'centered' },",
      "  loaders: [async () => ({ ready: true })],",
      "  decorators: [(Story) => Story()]",
      "} satisfies Meta<typeof Button>;",
      "",
      "export default meta;",
      "type Story = StoryObj<typeof meta>;",
      "",
      "export const Primary: Story = {",
      "  args: { label: 'Save changes' },",
      "  play: async ({ canvasElement }) => {",
      "    const canvas = within(canvasElement);",
      "    await userEvent.click(canvas.getByText('Save changes'));",
      "    await expect(canvas.getByText('Save changes')).toBeVisible();",
      "  }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "Button.mdx"), [
      "import { Meta, Story } from '@storybook/blocks';",
      "import * as ButtonStories from './Button.stories';",
      "",
      "<Meta of={ButtonStories} />",
      "<Story of={ButtonStories.Primary} />"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "SvelteButton.stories.svelte"), [
      "<script module>",
      "  import { defineMeta } from '@storybook/addon-svelte-csf';",
      "  const { Story } = defineMeta({ title: 'Svelte/Button' });",
      "</script>",
      "",
      "<Story name=\"Primary\" args={{ label: 'Svelte' }} />"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "portable.test.ts"), [
      "import { composeStories, setProjectAnnotations } from '@storybook/react-vite';",
      "import * as stories from './Button.stories';",
      "import preview from '../.storybook/preview';",
      "",
      "setProjectAnnotations([preview]);",
      "export const composed = composeStories(stories);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "vitest.config.storybook.ts"), [
      "import { defineConfig } from 'vitest/config';",
      "import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';",
      "",
      "export default defineConfig({ plugins: [storybookTest()] });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "storybook.yml"), [
      "name: storybook",
      "on: [push]",
      "jobs:",
      "  storybook:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run build-storybook",
      "      - run: npm run test-storybook",
      "      - run: npm run chromatic",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: storybook-static",
      "          path: storybook-static"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "storybook-report.json"), "utf8")) as {
      sourcePattern: string;
      storybookSignals: Array<{ signal: string; readiness: string }>;
      storyAnnotations: Array<{ annotation: string; readiness: string }>;
      addonSignals: Array<{ addon: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      publishSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Storybook Component Story Format stories Meta StoryObj satisfies Meta args argTypes decorators loaders play functions beforeEach autodocs MDX addons test-runner Vitest Chromatic portable stories composition MSW component workshop");
    expect(readySignals(report.storybookSignals)).toEqual(expect.arrayContaining(["meta-type", "storyobj-type", "satisfies-meta", "csf3-object", "stories-glob", "main-framework", "addons-array", "static-dirs", "preview-parameters", "preview-decorators", "global-types", "args", "arg-types", "parameters", "loaders", "before-each", "play-function", "tags-autodocs", "mdx-docs", "storybook-test-import", "portable-stories", "vitest-addon", "test-runner", "chromatic", "composition-refs", "msw-addon", "svelte-csf"]));
    expect(report.storyAnnotations.some((item) => item.annotation === "args" && item.readiness === "ready")).toBe(true);
    expect(report.addonSignals.some((item) => item.addon === "a11y" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["interaction-tests", "storybook-test", "portable-stories"]));
    expect(readySignals(report.publishSignals)).toEqual(expect.arrayContaining(["build-storybook", "storybook-static", "chromatic"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "storybook.md"), "utf8");
    expect(markdown).toContain("## Storybook Signals");
    expect(markdown).toContain("portable-stories [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "storybook.html"), "utf8");
    expect(html).toContain("Storybook Signals");
    expect(html).toContain("storybook signals");
    expect(html).toContain("data-source-pattern=\"Storybook\"");
  });

  it("detects Repomix context pack signals without executing pack commands", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-repomix-context-pack-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-repomix-context-pack-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".claude", "skills", "repo-context"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "assets"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        pack: "repomix --include \"src/**/*.ts,README.md\" --ignore \"dist/**,*.secret\" --style markdown --token-count-tree 100 --token-budget 32000 --split-output 1mb --compress --copy",
        "pack:pipe": "git ls-files \"*.ts\" | repomix --stdin --stdout --style json",
        "pack:remote": "repomix --remote yamadashy/repomix --remote-branch main --remote-trust-config --style plain",
        "pack:mcp": "repomix --mcp",
        "pack:skill": "repomix --skill-generate repo-context --skill-output .claude/skills/repo-context"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "repomix.config.json"), JSON.stringify({
      $schema: "https://repomix.com/schemas/latest/schema.json",
      input: { maxFileSize: 1048576 },
      output: {
        filePath: "repomix-output.xml",
        style: "xml",
        parsableStyle: true,
        headerText: "Use this as repo context.",
        instructionFilePath: "repomix-instruction.md",
        fileSummary: true,
        directoryStructure: true,
        files: true,
        removeComments: true,
        removeEmptyLines: true,
        compress: true,
        topFilesLength: 10,
        showLineNumbers: true,
        truncateBase64: true,
        copyToClipboard: true,
        includeEmptyDirectories: true,
        includeFullDirectoryStructure: true,
        splitOutput: 1000000,
        tokenCountTree: 100,
        tokenBudget: 32000,
        git: { sortByChanges: true, includeDiffs: true, includeLogs: true, includeLogsCount: 10 }
      },
      include: ["src/**/*.ts", "README.md"],
      ignore: { useGitignore: true, useDotIgnore: true, useDefaultPatterns: true, customPatterns: ["dist/**", "*.secret"] },
      security: { enableSecurityCheck: true },
      tokenCount: { encoding: "o200k_base" }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".repomixignore"), "dist/**\n*.secret\n");
    await fs.writeFile(path.join(sourceRoot, ".gitignore"), "node_modules\ndist\n");
    await fs.writeFile(path.join(sourceRoot, ".env.example"), "EXAMPLE_VALUE=placeholder\n");
    await fs.writeFile(path.join(sourceRoot, "repomix-instruction.md"), "Prefer source-faithful summaries and keep line numbers visible.\n");
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Repo context pack",
      "",
      "Repomix produces an AI-friendly context pack with --style xml, --style markdown, --style json, and --style plain.",
      "The workflow documents --remote, --remote-branch, --remote-trust-config, --stdin, --stdout, --mcp, and --skill-generate usage.",
      "Security checks use Secretlint, and compression uses Tree-sitter.",
      "MCP tools include pack_codebase and pack_remote_repository for Model Context Protocol handoff."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "index.ts"), "export const contextPackReady = true;\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "repomix.yml"), [
      "name: repomix",
      "on: [push]",
      "jobs:",
      "  pack:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run pack"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".claude", "skills", "repo-context", "SKILL.md"), "Use repomix context for source-grounded handoff.\n");
    await fs.writeFile(path.join(sourceRoot, "assets", "logo.png"), new Uint8Array([137, 80, 78, 71, 0, 1, 2, 3]));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "context-pack-report.json"), "utf8")) as {
      sourcePattern: string;
      contextPackSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Repomix token counting git-aware ignore AI-friendly context pack output styles compression token budget split output MCP skill generation");
    expect(readySignals(report.contextPackSignals)).toEqual(expect.arrayContaining([
      "text-candidate-filter",
      "token-estimate",
      "budget-profiles",
      "directory-token-tree",
      "top-files",
      "split-output-plan",
      "security-exclusions",
      "repomix-config",
      "repomix-ignore",
      "include-patterns",
      "ignore-patterns",
      "gitignore-aware",
      "default-ignore-patterns",
      "max-file-size",
      "output-style",
      "xml-output",
      "markdown-output",
      "json-output",
      "plain-output",
      "stdout-output",
      "stdin-input",
      "copy-clipboard",
      "line-numbers",
      "file-summary",
      "directory-structure",
      "remove-comments",
      "remove-empty-lines",
      "truncate-base64",
      "compress",
      "token-count-tree",
      "token-budget",
      "git-diffs",
      "git-logs",
      "remote-repository",
      "remote-branch",
      "remote-trust-config",
      "security-check",
      "mcp-server",
      "skill-generation"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "context-pack.md"), "utf8");
    expect(markdown).toContain("## Context Pack Signals");
    expect(markdown).toContain("token-budget [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "context-pack.html"), "utf8");
    expect(html).toContain("Context Pack Signals");
    expect(html).toContain("data-source-pattern=\"Repomix\"");
  });

  it("detects MSW-specific mocking signals without starting workers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-msw-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-msw-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "mocks"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        msw: "^2.12.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "mocks", "handlers.ts"), [
      "import { bypass, delay, graphql, http, HttpResponse, passthrough, sse, ws, type HttpResponseResolver, type RequestHandler, type ResponseResolver } from 'msw';",
      "const socket = ws.link('ws://localhost/socket');",
      "socket.addEventListener('connection', ({ client, server }) => {",
      "  client.send('hello from mock');",
      "  server.connect();",
      "});",
      "export const handlers: RequestHandler[] = [",
      "  http.get('/users/:id', async ({ params, cookies, request }) => {",
      "    await delay(50);",
      "    if (cookies.session === 'skip') return passthrough();",
      "    await fetch(bypass(request));",
      "    return HttpResponse.json({ id: params.id }, { status: 202, headers: { 'Set-Cookie': 'seen=true' } });",
      "  }),",
      "  http.post('/upload', async ({ request }) => HttpResponse.formData(await request.formData())),",
      "  http.get('/html', () => HttpResponse.html('<p>ok</p>')),",
      "  http.get('/xml', () => HttpResponse.xml('<ok />')),",
      "  http.get('/text', () => HttpResponse.text('ok')),",
      "  http.get('/binary', () => HttpResponse.arrayBuffer(new ArrayBuffer(1))),",
      "  graphql.query('GetUser', () => HttpResponse.json({ data: { user: null } })),",
      "  sse('/events', ({ client }) => { client.send({ event: 'message', data: 'hello' }); client.send({ retry: 1000 }); }),",
      "  socket,",
      "];",
      "export const resolver: ResponseResolver = () => HttpResponse.text('typed');",
      "export const httpResolver: HttpResponseResolver = () => HttpResponse.text('typed');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "mocks", "browser.ts"), [
      "import { setupWorker } from 'msw/browser';",
      "import { handlers } from './handlers';",
      "export const worker = setupWorker(...handlers);",
      "worker.events.on('request:start', ({ request, requestId }) => console.warn(request.url, requestId));",
      "worker.events.on('request:match', ({ requestId }) => console.warn(requestId));",
      "worker.events.on('request:unhandled', ({ requestId }) => console.warn(requestId));",
      "worker.events.on('request:end', ({ requestId }) => console.warn(requestId));",
      "worker.events.on('response:mocked', ({ response }) => console.warn(response.status));",
      "worker.events.on('response:bypass', ({ response }) => console.warn(response.status));",
      "worker.events.on('unhandledException', ({ error }) => console.error(error));",
      "worker.start({ quiet: true, waitUntilReady: true, findWorker(scriptURL, mockServiceWorkerUrl) { return scriptURL.includes(mockServiceWorkerUrl); }, serviceWorker: { url: '/mockServiceWorker.js', options: { scope: '/' } }, onUnhandledRequest: 'bypass' });",
      "worker.use(...handlers);",
      "worker.resetHandlers();",
      "worker.restoreHandlers();",
      "worker.listHandlers();",
      "worker.stop();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "mocks", "server.ts"), [
      "import { setupServer } from 'msw/node';",
      "import { setupServer as setupNativeServer } from 'msw/native';",
      "import { handlers } from './handlers';",
      "export const server = setupServer(...handlers);",
      "export const nativeServer = setupNativeServer(...handlers);",
      "server.listen({ onUnhandledRequest: 'error' });",
      "server.listen({ onUnhandledRequest: 'warn' });",
      "server.listen({ onUnhandledRequest(request, print) { print.warning(); } });",
      "server.boundary(() => { server.use(...handlers); server.listHandlers(); });",
      "server.resetHandlers(...handlers);",
      "server.restoreHandlers();",
      "server.close();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "mocks", "cookie-store.ts"), [
      "import { cookieStore } from 'msw';",
      "export async function persistCookies(responseCookies: string, url: string) {",
      "  await cookieStore.setCookie(responseCookies, url);",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "public", "mockServiceWorker.js"), "self.__MSW_INTEGRITY_CHECKSUM = 'static-test';\n", { flag: "w" }).catch(async () => {
      await fs.mkdir(path.join(sourceRoot, "public"), { recursive: true });
      await fs.writeFile(path.join(sourceRoot, "public", "mockServiceWorker.js"), "self.__MSW_INTEGRITY_CHECKSUM = 'static-test';\n");
    });

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "mocking-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      mswSignals: Array<{ signal: string; readiness: string }>;
    };
    const readyMswSignals = report.mswSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("setupWorker setupServer http graphql ws sse");
    expect(readyMswSignals).toEqual(expect.arrayContaining([
      "http-handler",
      "graphql-handler",
      "websocket-handler",
      "sse-handler",
      "setup-worker",
      "setup-server",
      "native-server",
      "service-worker-options",
      "find-worker",
      "quiet-option",
      "wait-until-ready",
      "worker-integrity",
      "http-response-json",
      "http-response-text",
      "http-response-html",
      "http-response-xml",
      "http-response-array-buffer",
      "http-response-form-data",
      "delay",
      "passthrough",
      "bypass",
      "route-params",
      "request-cookies",
      "response-cookies",
      "unhandled-error",
      "unhandled-warn",
      "unhandled-bypass",
      "unhandled-callback",
      "lifecycle-events",
      "request-events",
      "response-events",
      "unhandled-exception-event",
      "boundary",
      "list-handlers",
      "runtime-use",
      "reset-handlers",
      "restore-handlers",
      "close-stop",
      "request-handler-types",
      "response-resolver-types",
      "ws-client-send",
      "ws-server-connect",
      "sse-client-send",
      "sse-retry"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "mocking-readiness.md"), "utf8");
    expect(markdown).toContain("## MSW Signals");
    expect(markdown).toContain("http-handler [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "mocking-readiness.html"), "utf8");
    expect(html).toContain("MSW Signals");
    expect(html).toContain("data-source-pattern=\"Mock Service Worker\"");
  });

  it("detects Luxon datetime signals without evaluating clocks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-luxon-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-luxon-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        luxon: "^3.7.2"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "datetime.ts"), [
      "import { DateTime, Duration, FixedOffsetZone, IANAZone, Info, Interval, InvalidZone, Settings, SystemZone } from 'luxon';",
      "Settings.now = () => 0;",
      "Settings.defaultZone = IANAZone.create('America/New_York');",
      "Settings.defaultLocale = 'ko';",
      "Settings.defaultNumberingSystem = 'latn';",
      "Settings.defaultOutputCalendar = 'gregory';",
      "Settings.twoDigitCutoffYear = 50;",
      "Settings.throwOnInvalid = false;",
      "const parsed = DateTime.fromISO('2026-06-08T10:00:00+09:00', { setZone: true });",
      "const rfc = DateTime.fromRFC2822('Tue, 01 Nov 2016 13:23:12 +0630');",
      "const http = DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT');",
      "const sql = DateTime.fromSQL('2016-05-14 10:23:54 Europe/Paris', { setZone: true });",
      "const explained = DateTime.fromFormatExplain('Aug 6 1982', 'MMMM d yyyy');",
      "const zoned = DateTime.fromObject({ localWeekYear: 2026, localWeekNumber: 24, localWeekday: 1 }, { zone: 'system', locale: 'ko', numberingSystem: 'latn', outputCalendar: 'gregory' })",
      "  .setZone('America/New_York', { keepLocalTime: true, keepCalendarTime: true })",
      "  .toUTC().toLocal().reconfigure({ locale: 'fr' });",
      "const formatted = zoned.toLocaleString(DateTime.DATETIME_FULL) + zoned.toRelativeCalendar() + zoned.resolvedLocaleOptions().locale + zoned.toFormat('yyyy LLL dd');",
      "const duration = Duration.fromObject({ days: 1 }, { conversionAccuracy: 'longterm' }).shiftTo('hours').normalize().rescale();",
      "const human = duration.toHuman();",
      "const interval = Interval.fromDateTimes(parsed, parsed.plus({ days: 2 }));",
      "const intervalOps = interval.contains(parsed) || interval.splitBy(Duration.fromObject({ hours: 12 })).length > 0 || interval.mapEndpoints((dt) => dt.plus({ hours: 1 })).count('days') > 0 || interval.overlaps(Interval.after(parsed, duration)) || interval.engulfs(Interval.after(parsed, Duration.fromObject({ hours: 1 }))) || interval.abutsStart(Interval.after(parsed.minus({ days: 1 }), Duration.fromObject({ days: 1 })));",
      "const same = parsed.hasSame(rfc, 'day') || parsed.equals(http);",
      "const info = Info.months('long', { locale: 'ko' }).join(',') + Info.weekdays('short').join(',') + Info.eras('long').join(',') + String(Info.features().relative) + String(Info.getStartOfWeek()) + String(Info.getMinimumDaysInFirstWeek()) + Info.getWeekendWeekdays().join(',');",
      "const invalid = DateTime.now().setZone('America/Blorp');",
      "const invalids = [invalid.invalidReason, invalid.invalidExplanation, Duration.invalid('bad').invalidExplanation, Interval.invalid('bad').invalidReason, new InvalidZone('bad').type, FixedOffsetZone.utcInstance.type, SystemZone.instance.type];",
      "IANAZone.resetCache();",
      "DateTime.resetCache();",
      "export const luxonEvidence = { parsed, rfc, http, sql, explained, formatted, human, intervalOps, same, info, invalids };"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "datetime-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      luxonSignals: Array<{ signal: string; readiness: string }>;
    };
    const readyLuxonSignals = report.luxonSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Info Settings IANAZone FixedOffsetZone InvalidZone SystemZone");
    expect(readyLuxonSignals).toEqual(expect.arrayContaining([
      "datetime-class",
      "duration-class",
      "interval-class",
      "info-class",
      "settings-class",
      "iana-zone",
      "fixed-offset-zone",
      "invalid-zone",
      "system-zone",
      "from-rfc-http",
      "from-sql",
      "from-format-explain",
      "set-zone-option",
      "keep-local-time",
      "keep-calendar-time",
      "locale-output",
      "numbering-system",
      "output-calendar",
      "resolved-locale-options",
      "relative-calendar",
      "duration-human",
      "duration-shift",
      "duration-normalize",
      "duration-rescale",
      "interval-contains",
      "interval-split",
      "interval-map-endpoints",
      "interval-count",
      "interval-overlap",
      "interval-engulf-abut",
      "has-same",
      "equals",
      "week-settings",
      "local-week",
      "settings-now",
      "settings-throw-on-invalid",
      "two-digit-cutoff-year",
      "zone-cache-reset",
      "invalid-explanation"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "datetime-readiness.md"), "utf8");
    expect(markdown).toContain("## Luxon Signals");
    expect(markdown).toContain("datetime-class [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "datetime-readiness.html"), "utf8");
    expect(html).toContain("Luxon Signals");
    expect(html).toContain("data-source-pattern=\"Luxon\"");
  });

  it("detects TanStack Query advanced signals without fetching APIs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tanstack-query-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tanstack-query-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "query"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@tanstack/react-query": "^6.0.0",
        "@tanstack/query-core": "^6.0.0",
        "@tanstack/react-query-persist-client": "^6.0.0",
        "@tanstack/query-persist-client-core": "^6.0.0",
        "@tanstack/query-broadcast-client-experimental": "^6.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "query", "client.tsx"), [
      "import { HydrationBoundary, MutationCache, QueryCache, QueryClient, QueryClientProvider, infiniteQueryOptions, keepPreviousData, mutationOptions, queryOptions, skipToken, useInfiniteQuery, useIsFetching, useIsMutating, useMutation, useMutationState, usePrefetchInfiniteQuery, usePrefetchQuery, useQueries, useQuery, useSuspenseInfiniteQuery, useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';",
      "import { dehydrate, focusManager, hydrate, notifyManager, onlineManager, streamedQuery, timeoutManager } from '@tanstack/query-core';",
      "import { PersistQueryClientProvider, persistQueryClient } from '@tanstack/react-query-persist-client';",
      "import { createPersister } from '@tanstack/query-persist-client-core';",
      "import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental';",
      "type Todo = { id: string; title: string };",
      "const fetchTodos = async (): Promise<Todo[]> => [];",
      "const fetchPage = async ({ pageParam = 0 }: { pageParam?: number }) => ({ items: [] as Todo[], next: pageParam + 1 });",
      "const saveTodo = async (todo: Todo) => todo;",
      "const queryCache = new QueryCache();",
      "const mutationCache = new MutationCache();",
      "export const queryClient = new QueryClient({",
      "  queryCache,",
      "  mutationCache,",
      "  defaultOptions: {",
      "    queries: {",
      "      staleTime: 1000,",
      "      gcTime: 60000,",
      "      retry: 2,",
      "      retryDelay: (attempt) => attempt * 100,",
      "      enabled: true,",
      "      networkMode: 'offlineFirst',",
      "      throwOnError: false,",
      "      structuralSharing: true,",
      "      notifyOnChangeProps: ['data'],",
      "      subscribed: true,",
      "      placeholderData: keepPreviousData,",
      "      initialData: [] as Todo[],",
      "      select: (data: Todo[]) => data.slice(0, 5),",
      "      refetchOnWindowFocus: false,",
      "      refetchOnReconnect: true",
      "    }",
      "  }",
      "});",
      "queryClient.setQueryDefaults(['todos'], { queryFn: fetchTodos });",
      "export const todoOptions = queryOptions({ queryKey: ['todos'], queryFn: fetchTodos });",
      "export const pageOptions = infiniteQueryOptions({ queryKey: ['pages'], queryFn: fetchPage, initialPageParam: 0, getNextPageParam: (lastPage) => lastPage.next });",
      "export const saveOptions = mutationOptions({ mutationKey: ['save'], mutationFn: saveTodo });",
      "export const streamOptions = queryOptions({ queryKey: ['stream'], queryFn: streamedQuery({ queryFn: async function* () { yield 'chunk'; } }) });",
      "export async function warmCache() {",
      "  await queryClient.fetchQuery(todoOptions);",
      "  await queryClient.prefetchQuery(todoOptions);",
      "  await queryClient.fetchInfiniteQuery(pageOptions);",
      "  await queryClient.prefetchInfiniteQuery(pageOptions);",
      "  await queryClient.ensureQueryData(todoOptions);",
      "  await queryClient.ensureInfiniteQueryData(pageOptions);",
      "  queryClient.getQueryData(['todos']);",
      "  queryClient.getQueriesData({ queryKey: ['todos'] });",
      "  queryClient.getQueryState(['todos']);",
      "  queryClient.setQueryData(['todos'], []);",
      "  queryClient.setQueriesData({ queryKey: ['todos'] }, []);",
      "  await queryClient.invalidateQueries({ queryKey: ['todos'] });",
      "  await queryClient.refetchQueries({ stale: true });",
      "  await queryClient.cancelQueries({ queryKey: ['todos'] });",
      "  queryClient.removeQueries({ queryKey: ['todos'] });",
      "  queryClient.resetQueries({ queryKey: ['todos'] });",
      "  queryClient.isFetching();",
      "  queryClient.getQueryCache();",
      "  queryClient.getMutationCache();",
      "  const dehydrated = dehydrate(queryClient, { shouldDehydrateQuery: () => true, shouldDehydrateMutation: () => true });",
      "  hydrate(queryClient, dehydrated);",
      "  persistQueryClient({ queryClient, persister: createPersister({ storage: window.localStorage }) });",
      "  broadcastQueryClient({ queryClient, broadcastChannel: 'todos' });",
      "}",
      "focusManager.setEventListener((handleFocus) => { window.addEventListener('visibilitychange', handleFocus); return () => window.removeEventListener('visibilitychange', handleFocus); });",
      "focusManager.setFocused(true);",
      "onlineManager.setEventListener((setOnline) => { setOnline(true); return () => undefined; });",
      "onlineManager.setOnline(true);",
      "onlineManager.isOnline();",
      "notifyManager.batch(() => undefined);",
      "notifyManager.batchCalls(() => undefined);",
      "notifyManager.setScheduler((callback) => callback());",
      "timeoutManager.setTimeoutProvider({ setTimeout, clearTimeout, setInterval, clearInterval });",
      "export function Providers({ children, state }: { children: React.ReactNode; state: unknown }) {",
      "  return <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: createPersister({ storage: window.localStorage }) }}><QueryClientProvider client={queryClient}><HydrationBoundary state={state}>{children}</HydrationBoundary></QueryClientProvider></PersistQueryClientProvider>;",
      "}",
      "export function Hooks() {",
      "  useQuery(todoOptions);",
      "  useQuery({ queryKey: ['disabled'], queryFn: skipToken });",
      "  useInfiniteQuery(pageOptions);",
      "  useQueries({ queries: [todoOptions] });",
      "  useSuspenseQuery(todoOptions);",
      "  useSuspenseInfiniteQuery(pageOptions);",
      "  useSuspenseQueries({ queries: [todoOptions] });",
      "  usePrefetchQuery(todoOptions);",
      "  usePrefetchInfiniteQuery(pageOptions);",
      "  useMutation(saveOptions);",
      "  useMutationState({ filters: { mutationKey: ['save'] } });",
      "  useIsFetching({ queryKey: ['todos'] });",
      "  useIsMutating({ mutationKey: ['save'] });",
      "  return null;",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "data-fetching-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      tanstackQuerySignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.tanstackQuerySignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("queryOptions infiniteQueryOptions mutationOptions");
    expect(readySignals).toEqual(expect.arrayContaining([
      "query-options",
      "infinite-query-options",
      "mutation-options",
      "use-queries",
      "use-suspense-query",
      "use-suspense-infinite-query",
      "use-suspense-queries",
      "use-prefetch-query",
      "use-prefetch-infinite-query",
      "fetch-query",
      "fetch-infinite-query",
      "ensure-query-data",
      "ensure-infinite-query-data",
      "get-query-state",
      "get-mutation-cache",
      "query-cache",
      "mutation-cache",
      "set-queries-data",
      "reset-queries",
      "cancel-queries",
      "remove-queries",
      "refetch-queries",
      "is-fetching",
      "use-is-fetching",
      "use-is-mutating",
      "use-mutation-state",
      "query-defaults",
      "network-mode",
      "retry-delay",
      "throw-on-error",
      "structural-sharing",
      "notify-on-change-props",
      "subscribed",
      "placeholder-keep-previous",
      "skip-token",
      "dehydrate-options",
      "hydration-boundary",
      "persist-query-client-provider",
      "create-persister",
      "broadcast-query-client",
      "focus-manager",
      "online-manager",
      "notify-manager",
      "timeout-manager",
      "streamed-query"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "data-fetching-readiness.md"), "utf8");
    expect(markdown).toContain("## TanStack Query Signals");
    expect(markdown).toContain("query-options [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "data-fetching-readiness.html"), "utf8");
    expect(html).toContain("TanStack Query Signals");
    expect(html).toContain("data-source-pattern=\"TanStack Query\"");
  });

  it("detects Zustand state management signals without creating stores", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zustand-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zustand-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "state"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        zustand: "^5.0.0",
        immer: "^11.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "state", "bear-store.ts"), [
      "import { create, useStore, type Mutate, type StateCreator, type StoreApi, type StoreMutatorIdentifier } from 'zustand';",
      "import { createStore } from 'zustand/vanilla';",
      "import { createWithEqualityFn, useStoreWithEqualityFn } from 'zustand/traditional';",
      "import { useShallow } from 'zustand/react/shallow';",
      "import { shallow } from 'zustand/shallow';",
      "import { combine, createJSONStorage, devtools, persist, redux, subscribeWithSelector } from 'zustand/middleware';",
      "import { immer } from 'zustand/middleware/immer';",
      "type BearState = { bears: number; fish: number; increase: () => void; reset: () => void; read: () => number };",
      "type PersistedStore = Mutate<StoreApi<BearState>, [['zustand/persist', BearState]]>;",
      "type MutatorName = StoreMutatorIdentifier;",
      "const creator: StateCreator<BearState, [], []> = (set, get, store) => ({",
      "  bears: 0,",
      "  fish: 1,",
      "  increase: () => set((state) => ({ bears: state.bears + 1 }), false, 'bear/increase'),",
      "  reset: () => set({ bears: 0, fish: 1 }, true),",
      "  read: () => get().bears",
      "});",
      "export const useBearStore = create<BearState>()(",
      "  devtools(",
      "    persist(",
      "      subscribeWithSelector(immer(creator)),",
      "      {",
      "        name: 'bear-storage',",
      "        storage: createJSONStorage(() => localStorage),",
      "        partialize: (state) => ({ bears: state.bears }),",
      "        version: 2,",
      "        migrate: (persistedState, version) => persistedState as BearState,",
      "        merge: (persisted, current) => ({ ...current, ...persisted }),",
      "        onRehydrateStorage: () => (state, error) => console.log(state, error),",
      "        skipHydration: true",
      "      }",
      "    ),",
      "    { name: 'BearStore', store: 'bear-tab', serialize: { options: true }, enabled: true, anonymousActionType: 'anonymous' }",
      "  )",
      ");",
      "useBearStore.persist.rehydrate();",
      "const vanillaStore = createStore<BearState>()(",
      "  subscribeWithSelector(persist(devtools(creator), { name: 'vanilla-storage', storage: createJSONStorage(() => sessionStorage) }))",
      ");",
      "vanillaStore.getState();",
      "vanillaStore.setState({ bears: 2 }, false, 'vanilla/set');",
      "vanillaStore.setState({ bears: 0, fish: 0 }, true);",
      "vanillaStore.getInitialState();",
      "vanillaStore.subscribe((state) => state.bears, console.log, { equalityFn: shallow, fireImmediately: true });",
      "const combinedStore = createStore(combine({ bears: 0 }, (set, get) => ({ add: () => set({ bears: get().bears + 1 }) })));",
      "const reduxStore = createStore(redux((state = { count: 0 }, action: { type: string }) => state, { count: 0 }));",
      "const equalityStore = createWithEqualityFn<BearState>()(creator, shallow);",
      "export function BearCounter() {",
      "  const bears = useBearStore((state) => state.bears);",
      "  const pair = useBearStore(useShallow((state) => [state.bears, state.fish]));",
      "  const selected = useStore(vanillaStore, (state) => state.bears);",
      "  const equalSelected = useStoreWithEqualityFn(vanillaStore, (state) => state.fish, Object.is);",
      "  shallow({ bears }, { bears: selected });",
      "  console.log(pair, equalSelected, combinedStore, reduxStore, equalityStore);",
      "  return null;",
      "}",
      "export type ZustandEvidence = { store: PersistedStore; mutator: MutatorName };"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "state-management-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      zustandSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.zustandSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Zustand create createStore useStore useShallow");
    expect(readySignals).toEqual(expect.arrayContaining([
      "create",
      "create-store",
      "vanilla-store",
      "use-store",
      "use-bound-store",
      "set-function",
      "get-function",
      "set-state",
      "get-state",
      "get-initial-state",
      "subscribe",
      "replace-state",
      "selector",
      "use-shallow",
      "shallow-equality",
      "create-with-equality-fn",
      "equality-fn",
      "subscribe-with-selector",
      "fire-immediately",
      "persist-middleware",
      "create-json-storage",
      "persist-partialize",
      "persist-version",
      "persist-migrate",
      "persist-merge",
      "on-rehydrate-storage",
      "skip-hydration",
      "rehydrate",
      "devtools-middleware",
      "devtools-action-name",
      "devtools-store-name",
      "devtools-serialize",
      "devtools-enabled",
      "immer-middleware",
      "redux-middleware",
      "combine-middleware",
      "state-creator-type",
      "store-api-type",
      "mutate-type",
      "store-mutator-identifier",
      "traditional-entry",
      "react-shallow-entry",
      "middleware-entry"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "state-management-readiness.md"), "utf8");
    expect(markdown).toContain("## Zustand Signals");
    expect(markdown).toContain("create-store [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "state-management-readiness.html"), "utf8");
    expect(html).toContain("Zustand Signals");
    expect(html).toContain("data-source-pattern=\"Redux Toolkit\"");
  });

  it("detects Jotai state management signals without creating stores", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-jotai-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-jotai-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "state"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        jotai: "^2.12.0",
        "jotai-devtools": "^0.12.0",
        "jotai-effect": "^2.0.0",
        "jotai-immer": "^0.4.0",
        "jotai-optics": "^0.4.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "state", "jotai-atoms.tsx"), [
      "import { atom, Provider, createStore, getDefaultStore, useAtom, useAtomValue, useSetAtom, type Atom, type WritableAtom, type PrimitiveAtom, type Getter, type Setter, type ExtractAtomValue, type ExtractAtomArgs, type ExtractAtomResult } from 'jotai';",
      "import { atomFamily, atomWithDefault, atomWithHash, atomWithLocation, atomWithObservable, atomWithReducer, atomWithRefresh, atomWithReset, atomWithStorage, createJSONStorage, freezeAtom, loadable, RESET, selectAtom, splitAtom, unwrap, useAtomCallback, useAtomsDebugValue, useHydrateAtoms } from 'jotai/utils';",
      "import { focusAtom } from 'jotai-optics';",
      "import { useAtomDevtools, useAtomsDevtools, useAtomsSnapshot, useGotoAtomsSnapshot } from 'jotai-devtools';",
      "import { useReducerAtom, useResetAtom, useSelectAtom } from 'jotai/react/utils';",
      "import { atomEffect, useAtomEffect } from 'jotai-effect';",
      "import { atomWithImmer, useImmerAtom, withImmer } from 'jotai-immer';",
      "type Todo = { id: string; title: string; done: boolean };",
      "export const countAtom: PrimitiveAtom<number> = atom(0);",
      "countAtom.debugLabel = 'countAtom';",
      "countAtom.onMount = (setAtom) => { setAtom(1); return () => setAtom(0); };",
      "export const doubledAtom: Atom<number> = atom((get) => get(countAtom) * 2);",
      "export const readWriteAtom: WritableAtom<number, [number], void> = atom((get) => get(countAtom), (get, set, next: number) => set(countAtom, next));",
      "export const writeOnlyAtom = atom(null, (get, set, step: number) => set(countAtom, get(countAtom) + step));",
      "export const asyncAtom = atom(async (get) => Promise.resolve(get(countAtom)));",
      "export const storageAtom = atomWithStorage('count', 0, createJSONStorage(() => localStorage));",
      "export const resetAtom = atomWithReset(0);",
      "export const defaultAtom = atomWithDefault((get) => get(countAtom) + 1);",
      "export const reducerAtom = atomWithReducer(0, (value: number, action: { type: 'inc' }) => action.type === 'inc' ? value + 1 : value);",
      "export const refreshAtom = atomWithRefresh(async () => 1);",
      "export const observableAtom = atomWithObservable(() => ({ subscribe: () => ({ unsubscribe() {} }) }));",
      "export const hashAtom = atomWithHash('count', 0);",
      "export const locationAtom = atomWithLocation();",
      "export const familyAtom = atomFamily((id: string) => atom({ id, title: '', done: false }));",
      "export const selectedAtom = selectAtom(familyAtom('1'), (todo) => todo.title);",
      "export const todosAtom = atom<Todo[]>([]);",
      "export const splitTodosAtom = splitAtom(todosAtom);",
      "export const focusedAtom = focusAtom(familyAtom('1'), (optic) => optic.prop('title'));",
      "export const frozenAtom = freezeAtom(familyAtom('2'));",
      "export const loadableAtom = loadable(asyncAtom);",
      "export const unwrappedAtom = unwrap(asyncAtom, () => 0);",
      "export const effectAtom = atomEffect((get, set) => { set(countAtom, get(countAtom) + 1); });",
      "export const immerAtom = atomWithImmer({ count: 0 });",
      "export const wrappedImmerAtom = withImmer(readWriteAtom);",
      "export const resetWriterAtom = atom(null, (get, set) => set(storageAtom, RESET));",
      "const store = createStore();",
      "store.get(countAtom);",
      "store.set(countAtom, 2);",
      "store.sub(countAtom, () => undefined);",
      "getDefaultStore().get(countAtom);",
      "getDefaultStore().set(countAtom, 3);",
      "getDefaultStore().sub(countAtom, () => undefined);",
      "type Reader = Getter;",
      "type Writer = Setter;",
      "type CountValue = ExtractAtomValue<typeof countAtom>;",
      "type CountArgs = ExtractAtomArgs<typeof readWriteAtom>;",
      "type CountResult = ExtractAtomResult<typeof readWriteAtom>;",
      "export function JotaiPanel() {",
      "  const [count, setCount] = useAtom(countAtom);",
      "  const doubled = useAtomValue(doubledAtom);",
      "  const write = useSetAtom(writeOnlyAtom);",
      "  const [draft, setDraft] = useImmerAtom(immerAtom);",
      "  const [reduced, dispatch] = useReducerAtom(reducerAtom, (value: number, action: { type: 'inc' }) => value + 1);",
      "  const reset = useResetAtom(resetAtom);",
      "  const title = useSelectAtom(familyAtom('1'), (todo) => todo.title);",
      "  const callback = useAtomCallback((get, set, next: number) => set(countAtom, get(countAtom) + next));",
      "  useHydrateAtoms([[countAtom, 4]]);",
      "  useAtomsDebugValue();",
      "  useAtomsDevtools('jotai-atoms');",
      "  useAtomDevtools(countAtom, 'countAtom');",
      "  const snapshot = useAtomsSnapshot();",
      "  const goToSnapshot = useGotoAtomsSnapshot();",
      "  useAtomEffect((get, set) => { set(countAtom, get(countAtom) + 1); });",
      "  console.log(count, doubled, write, draft, setDraft, reduced, dispatch, reset, title, callback, snapshot, goToSnapshot, CountValue, CountArgs, CountResult);",
      "  return <Provider store={store}>{count}</Provider>;",
      "}",
      "export type JotaiEvidence = { reader: Reader; writer: Writer };"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "state-management-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      jotaiSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.jotaiSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Jotai atom primitive atom derived atom useAtom useAtomValue useSetAtom");
    expect(readySignals).toEqual(expect.arrayContaining([
      "atom",
      "primitive-atom",
      "derived-atom",
      "read-write-atom",
      "write-only-atom",
      "async-atom",
      "use-atom",
      "use-atom-value",
      "use-set-atom",
      "provider",
      "create-store",
      "get-default-store",
      "store-get",
      "store-set",
      "store-sub",
      "on-mount",
      "debug-label",
      "atom-with-storage",
      "create-json-storage",
      "reset",
      "atom-with-reset",
      "atom-with-default",
      "atom-with-reducer",
      "atom-with-refresh",
      "atom-with-observable",
      "atom-with-hash",
      "atom-with-location",
      "atom-family",
      "select-atom",
      "split-atom",
      "focus-atom",
      "freeze-atom",
      "loadable",
      "unwrap",
      "use-hydrate-atoms",
      "use-atom-callback",
      "use-atoms-debug-value",
      "use-atoms-devtools",
      "use-atom-devtools",
      "use-atoms-snapshot",
      "use-goto-atoms-snapshot",
      "use-reducer-atom",
      "use-reset-atom",
      "use-select-atom",
      "use-atom-effect",
      "atom-effect",
      "with-immer",
      "atom-with-immer",
      "use-immer-atom",
      "atom-type",
      "writable-atom-type",
      "primitive-atom-type",
      "getter-type",
      "setter-type",
      "extract-atom-types"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "state-management-readiness.md"), "utf8");
    expect(markdown).toContain("## Jotai Signals");
    expect(markdown).toContain("atom-with-storage [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "state-management-readiness.html"), "utf8");
    expect(html).toContain("Jotai Signals");
    expect(html).toContain("data-source-pattern=\"Redux Toolkit\"");
  });

  it("detects Valtio state management signals without creating proxies", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-valtio-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-valtio-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "state"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "derive-valtio": "^0.1.0",
        valtio: "^2.1.0",
        "valtio-history": "^1.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "state", "valtio-store.tsx"), [
      "import { useSnapshot } from 'valtio';",
      "import { proxy, ref, snapshot, subscribe, unstable_getInternalStates, type Snapshot } from 'valtio/vanilla';",
      "import { deepClone, devtools, isProxyMap, isProxySet, proxyMap, proxySet, subscribeKey, unstable_deepProxy, watch } from 'valtio/utils';",
      "import { useProxy } from 'valtio/react/utils';",
      "import { useProxy as useMacroProxy } from 'valtio/macro';",
      "import { derive, underive } from 'derive-valtio';",
      "import { proxyWithHistory } from 'valtio-history';",
      "type State = { count: number; text: string; child: { value: number }; post?: Promise<Response>; dom?: HTMLElement | null; map: Map<string, number>; set: Set<string> };",
      "const initial = { count: 0, text: 'hello', child: { value: 1 }, map: new Map<string, number>(), set: new Set<string>() };",
      "export const state = proxy<State>({",
      "  ...deepClone(initial),",
      "  child: proxy({ value: 2 }),",
      "  post: fetch('/api/post'),",
      "  dom: ref(typeof document === 'undefined' ? null : document.body),",
      "  map: proxyMap([['a', 1]]),",
      "  set: proxySet(['a'])",
      "});",
      "state.count += 1;",
      "state.text = 'updated';",
      "state.map.set('b', 2);",
      "const snap = snapshot(state);",
      "type StateSnapshot = Snapshot<State>;",
      "subscribe(state, (unstable_ops) => console.log(unstable_ops));",
      "const stopCount = subscribeKey(state, 'count', (value) => console.log(value));",
      "const stopWatch = watch((get) => { get(state); console.log(state.count); }, { sync: true });",
      "const stopDevtools = devtools(state, { name: 'ValtioState', enabled: true });",
      "const derivedState = derive({ doubled: (get) => get(state).count * 2 });",
      "underive(derivedState);",
      "const historyState = proxyWithHistory({ count: 0 });",
      "const clonedProxy = unstable_deepProxy({ map: new Map<string, number>(), set: new Set<string>() });",
      "isProxyMap(clonedProxy.map);",
      "isProxySet(clonedProxy.set);",
      "unstable_getInternalStates();",
      "export function ValtioPanel() {",
      "  const current = useSnapshot(state, { sync: true });",
      "  const writable = useProxy(state);",
      "  const macroWritable = useMacroProxy(state);",
      "  console.log(current.count, writable.text, macroWritable.text, snap, stopCount, stopWatch, stopDevtools, historyState, StateSnapshot);",
      "  return null;",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "state-management-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      storeSetups: Array<{ storeType: string }>;
      valtioSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.valtioSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Valtio proxy useSnapshot snapshot subscribe subscribeKey watch");
    expect(report.storeSetups.some((item) => item.storeType === "valtio")).toBe(true);
    expect(readySignals).toEqual(expect.arrayContaining([
      "proxy",
      "nested-proxy",
      "direct-mutation",
      "use-snapshot",
      "snapshot",
      "sync-option",
      "subscribe",
      "subscribe-ops",
      "subscribe-key",
      "watch",
      "ref",
      "promise-state",
      "devtools",
      "devtools-name",
      "devtools-enabled",
      "proxy-map",
      "is-proxy-map",
      "proxy-set",
      "is-proxy-set",
      "use-proxy",
      "derive",
      "underive",
      "proxy-with-history",
      "deep-clone",
      "unstable-deep-proxy",
      "vanilla-entry",
      "react-entry",
      "utils-entry",
      "macro-entry",
      "snapshot-type",
      "unstable-get-internal-states"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "state-management-readiness.md"), "utf8");
    expect(markdown).toContain("## Valtio Signals");
    expect(markdown).toContain("proxy-map [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "state-management-readiness.html"), "utf8");
    expect(html).toContain("Valtio Signals");
    expect(html).toContain("data-source-pattern=\"Redux Toolkit\"");
  });

  it("detects MobX state management signals without creating observables", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mobx-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mobx-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "state"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        mobx: "^6.15.0",
        "mobx-react": "^9.2.0",
        "mobx-react-lite": "^4.1.0"
      },
      devDependencies: {
        "eslint-plugin-mobx": "^0.0.9"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "state", "mobx-store.tsx"), [
      "import { action, autorun, computed, configure, extendObservable, flow, flowResult, intercept, interceptReads, isAction, isComputed, isComputedProp, isObservable, isObservableArray, isObservableMap, isObservableObject, isObservableProp, isObservableSet, makeAutoObservable, makeObservable, observable, observe, onBecomeObserved, onBecomeUnobserved, reaction, runInAction, spy, toJS, trace, transaction, when } from 'mobx';",
      "import { enableStaticRendering, Observer, observer, useLocalObservable, useObserver } from 'mobx-react-lite';",
      "import { inject, observer as legacyObserver, Provider } from 'mobx-react';",
      "configure({",
      "  enforceActions: 'always',",
      "  computedRequiresReaction: true,",
      "  reactionRequiresObservable: true,",
      "  observableRequiresReaction: true,",
      "  disableErrorBoundaries: true,",
      "  isolateGlobalState: true",
      "});",
      "class TodoStore {",
      "  todos = observable.array<string>([]);",
      "  boxed = observable.box(0);",
      "  map = observable.map<string, number>();",
      "  set = observable.set<string>();",
      "  objectState = observable.object({ title: 'first' });",
      "  extra = 0;",
      "  plain = observable({ nested: true });",
      "  constructor() {",
      "    makeObservable(this, {",
      "      todos: observable.shallow,",
      "      boxed: observable.ref,",
      "      plain: observable.struct,",
      "      total: computed,",
      "      summary: computed.struct,",
      "      add: action.bound,",
      "      load: flow",
      "    }, { autoBind: true });",
      "    makeAutoObservable(this, { extra: observable.ref }, { autoBind: true });",
      "    extendObservable(this, { status: 'idle' });",
      "  }",
      "  get total() { trace(); return this.todos.length; }",
      "  get summary() { return { total: this.total }; }",
      "  add = action('addTodo', (title: string) => { this.todos.push(title); });",
      "  *load() {",
      "    yield Promise.resolve('done');",
      "    runInAction(() => { this.boxed.set(1); });",
      "  }",
      "}",
      "const store = new TodoStore();",
      "autorun(() => console.log(store.total));",
      "reaction(() => store.total, (value) => console.log(value));",
      "when(() => store.total > 0, () => console.log('ready'));",
      "intercept(store, 'extra', (change) => change);",
      "interceptReads(store, 'extra', (value) => value);",
      "observe(store, 'extra', (change) => console.log(change));",
      "onBecomeObserved(store, 'total', () => console.log('observed'));",
      "onBecomeUnobserved(store, 'total', () => console.log('unobserved'));",
      "spy((change) => console.log(change));",
      "transaction(() => store.add('inside transaction'));",
      "flowResult(store.load());",
      "toJS(store);",
      "isObservable(store);",
      "isObservableProp(store, 'extra');",
      "isObservableObject(store);",
      "isObservableArray(store.todos);",
      "isObservableMap(store.map);",
      "isObservableSet(store.set);",
      "isAction(store.add);",
      "isComputed(store.summary);",
      "isComputedProp(store, 'total');",
      "enableStaticRendering(false);",
      "function MobxPanel() {",
      "  const local = useLocalObservable(() => ({ count: 0 }));",
      "  return useObserver(() => <Observer>{() => <span>{local.count}</span>}</Observer>);",
      "}",
      "const ObservedPanel = observer(MobxPanel);",
      "const LegacyObservedPanel = legacyObserver(MobxPanel);",
      "const InjectedPanel = inject('store')(ObservedPanel);",
      "export function App() {",
      "  return <Provider store={store}><InjectedPanel /><LegacyObservedPanel /></Provider>;",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "state-management-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      storeSetups: Array<{ storeType: string }>;
      mobxSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = report.mobxSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("MobX makeAutoObservable makeObservable observable computed action runInAction");
    expect(report.storeSetups.some((item) => item.storeType === "mobx")).toBe(true);
    expect(readySignals).toEqual(expect.arrayContaining([
      "make-auto-observable",
      "make-observable",
      "observable",
      "observable-object",
      "observable-box",
      "observable-array",
      "observable-map",
      "observable-set",
      "observable-ref",
      "observable-shallow",
      "observable-struct",
      "extend-observable",
      "computed",
      "computed-struct",
      "computed-requires-reaction",
      "action",
      "action-bound",
      "run-in-action",
      "flow",
      "flow-result",
      "auto-bind",
      "autorun",
      "reaction",
      "when",
      "configure",
      "enforce-actions",
      "reaction-requires-observable",
      "observable-requires-reaction",
      "disable-error-boundaries",
      "isolate-global-state",
      "observer",
      "observer-component",
      "use-local-observable",
      "use-observer",
      "provider",
      "inject",
      "enable-static-rendering",
      "intercept",
      "intercept-reads",
      "observe",
      "on-become-observed",
      "on-become-unobserved",
      "spy",
      "trace",
      "to-js",
      "transaction",
      "is-observable",
      "is-observable-prop",
      "is-action",
      "is-computed",
      "is-computed-prop",
      "is-observable-object",
      "is-observable-array",
      "is-observable-map",
      "is-observable-set",
      "mobx-react-lite",
      "mobx-react",
      "eslint-plugin-mobx"
    ]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "state-management-readiness.md"), "utf8");
    expect(markdown).toContain("## MobX Signals");
    expect(markdown).toContain("make-auto-observable [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "state-management-readiness.html"), "utf8");
    expect(html).toContain("MobX Signals");
    expect(html).toContain("data-source-pattern=\"Redux Toolkit\"");
  });

  it("detects OpenFeature, Unleash, and GrowthBook feature flag readiness without executing SDKs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-feature-flags-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-feature-flags-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "flags"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: { test: "vitest run" },
      dependencies: {
        "@openfeature/server-sdk": "^1.0.0",
        "@openfeature/web-sdk": "^1.0.0",
        "@openfeature/react-sdk": "^1.0.0",
        "@openfeature/nestjs-sdk": "^1.0.0",
        "unleash-client": "^6.0.0",
        "@unleash/proxy-client-react": "^5.0.0",
        "@growthbook/growthbook": "^1.0.0",
        "@growthbook/growthbook-react": "^1.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "flags", "openfeature.ts"), [
      "import { OpenFeature, ProviderEvents, EvaluationContext } from '@openfeature/server-sdk';",
      "import { OpenFeatureProvider, useBooleanFlag } from '@openfeature/react-sdk';",
      "",
      "const context: EvaluationContext = { targetingKey: 'user-123', email: 'user@example.test', country: 'KR' };",
      "OpenFeature.setProvider(new LaunchProvider());",
      "await OpenFeature.setProviderAndWait('checkout', new LaunchProvider());",
      "OpenFeature.addHooks({ before() {}, after() {}, error() {}, finally() {} });",
      "OpenFeature.addHandler(ProviderEvents.Ready, () => console.log('READY'));",
      "OpenFeature.addHandler(ProviderEvents.Error, () => console.log('ERROR'));",
      "OpenFeature.setTransactionContext({ requestId: 'req-1' });",
      "const client = OpenFeature.getClient('checkout');",
      "const enabled = await client.getBooleanValue('checkout.enabled', false, context);",
      "const copy = await client.getStringValue('checkout.copy', 'control', context);",
      "const limit = await client.getNumberValue('checkout.limit', 10, context);",
      "const payload = await client.getObjectValue('checkout.payload', { layout: 'a' }, context);",
      "const details = await client.getBooleanDetails('checkout.enabled', false, context);",
      "client.track('checkout.converted', context);",
      "new MultiProvider([{ provider: new LaunchProvider() }], new FirstMatchStrategy());",
      "await OpenFeature.close();",
      "void OpenFeatureProvider;",
      "void useBooleanFlag;",
      "void enabled;",
      "void copy;",
      "void limit;",
      "void payload;",
      "void details;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "flags", "unleash.ts"), [
      "import { UnleashClient } from 'unleash-client';",
      "",
      "const unleash = new UnleashClient({ appName: 'checkout', environment: 'production', projectName: 'commerce' });",
      "unleash.start();",
      "const active = unleash.isEnabled('checkout.enabled', { userId: 'user-123', sessionId: 's-1', properties: { plan: 'pro' } });",
      "const variant = unleash.getVariant('checkout.enabled', { stickiness: 'userId', segments: ['beta'], environment: 'production', project: 'commerce' });",
      "const rollout = { name: 'flexibleRollout', constraints: [{ contextName: 'country', values: ['KR'] }], segments: [12], variants: [variant], impressionData: true, stickiness: 'userId', stale: false, archived: false };",
      "const metrics = { impactMetrics: true, environment: 'production', project: 'commerce' };",
      "void active;",
      "void rollout;",
      "void metrics;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "flags", "growthbook.ts"), [
      "import { GrowthBook, GrowthBookClient } from '@growthbook/growthbook';",
      "",
      "const stickyBucketService = {",
      "  getAllAssignments: async () => ({ docs: [] }),",
      "  saveAssignments: async () => undefined",
      "};",
      "const growthBook = new GrowthBook({",
      "  attributes: { id: 'user-123', plan: 'pro', hashAttribute: 'id' },",
      "  trackingCallback: (experiment, result) => console.log(experiment.key, result.variationId),",
      "  stickyBucketService,",
      "  stickyBucketAssignmentDocs: [],",
      "  subscribeToChanges: true,",
      "  autoRefresh: true,",
      "  remoteEval: true,",
      "  forcedVariations: new Map([['checkout-test', 1]]),",
      "  qaMode: true,",
      "  encryptionKey: 'docs-only-key',",
      "  encryptedFeatures: 'encryptedFeaturesPayload'",
      "});",
      "growthBook.setAttributes({ id: 'user-123', country: 'KR' });",
      "growthBook.updateAttributes({ plan: 'enterprise' });",
      "growthBook.setTrackingCallback((experiment, result) => console.log(experiment.key, result.key));",
      "const on = growthBook.isOn('checkout.enabled');",
      "const off = growthBook.isOff('legacy.checkout');",
      "const value = growthBook.getFeatureValue('checkout.layout', 'control');",
      "const experimentResult = growthBook.run({ key: 'checkout-test', variations: ['control', 'treatment'] });",
      "const client = new GrowthBookClient({ attributes: { id: 'user-123' }, stickyBucketService });",
      "client.setGlobalAttributes({ environment: 'production', project: 'commerce' });",
      "new EventSource('/api/features/stream');",
      "growthBook.initSync({ featuresJson: '{}' });",
      "await growthBook.refreshFeatures();",
      "void on;",
      "void off;",
      "void value;",
      "void experimentResult;",
      "void client;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "feature-flags.md"), [
      "# Feature flag rollout plan",
      "",
      "Use a safe rollout with feature.saferollout.ship and feature.saferollout.rollback events.",
      "Ramp traffic 10% -> 50% -> 100% only after metrics and impact metrics are healthy.",
      "Document prerequisites, namespace, coverage, hashAttribute, ContextFactory, OpenFeatureModule, request.headers, segments, environment, and project ownership.",
      "Remote evaluation uses remoteEval; streaming uses EventSource or SSE subscribeToChanges; encrypted payloads use encryptedExperiments and encryptionKey.",
      "QA mode is enabled only in non-production."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    expect(result.session.status).toBe("complete");
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "feature-flag-readiness-report.json"), "utf8"));
    expect(report.sourcePattern).toContain("Unleash flexibleRollout");
    expect(report.sourcePattern).toContain("GrowthBook isOn isOff getFeatureValue");
    const providers = report.featureFlagSetups.map((item: { provider: string }) => item.provider);
    expect(providers).toEqual(expect.arrayContaining(["openfeature", "unleash", "growthbook"]));
    expect(report.featureFlagSetups.some((item: { provider: string; readiness: string }) => item.provider === "openfeature" && item.readiness === "ready")).toBe(true);
    expect(report.featureFlagSetups.some((item: { provider: string; readiness: string }) => item.provider === "unleash" && item.readiness === "ready")).toBe(true);
    expect(report.featureFlagSetups.some((item: { provider: string; readiness: string }) => item.provider === "growthbook" && item.readiness === "ready")).toBe(true);

    const readyEvaluationSignals = report.evaluationSignals.filter((item: { readiness: string }) => item.readiness === "ready").map((item: { signal: string }) => item.signal);
    expect(readyEvaluationSignals).toEqual(expect.arrayContaining([
      "boolean",
      "string",
      "number",
      "object",
      "details",
      "default-value",
      "variant",
      "flag-key",
      "on-off",
      "feature-value",
      "experiment-run",
      "forced-variation",
      "prerequisite",
      "safe-rollout"
    ]));
    const readyContextSignals = report.contextSignals.filter((item: { readiness: string }) => item.readiness === "ready").map((item: { signal: string }) => item.signal);
    expect(readyContextSignals).toEqual(expect.arrayContaining([
      "evaluation-context",
      "targeting-key",
      "user-attributes",
      "request-context",
      "transaction-context",
      "domain",
      "react-provider",
      "nest-context-factory",
      "attributes",
      "sticky-bucket",
      "hash-attribute",
      "segments",
      "environment",
      "project",
      "qa-mode"
    ]));
    const readyLifecycleSignals = report.lifecycleSignals.filter((item: { readiness: string }) => item.readiness === "ready").map((item: { signal: string }) => item.signal);
    expect(readyLifecycleSignals).toEqual(expect.arrayContaining([
      "set-provider",
      "set-provider-and-wait",
      "ready-event",
      "error-event",
      "hooks",
      "tracking",
      "shutdown",
      "multi-provider",
      "sse-stream",
      "auto-refresh",
      "bootstrap",
      "metrics",
      "impression-data",
      "encrypted-payload",
      "remote-eval"
    ]));
    const readyPackageSignals = report.packageSignals.filter((item: { readiness: string }) => item.readiness === "ready").map((item: { signal: string }) => item.signal);
    expect(readyPackageSignals).toEqual(expect.arrayContaining([
      "@openfeature/server-sdk",
      "@openfeature/web-sdk",
      "@openfeature/react-sdk",
      "@openfeature/nestjs-sdk",
      "unleash",
      "unleash-client",
      "@unleash/proxy-client-react",
      "growthbook",
      "@growthbook/growthbook",
      "@growthbook/growthbook-react"
    ]));
    expect(report.recommendedCommands.map((item: { command: string }) => item.command).join("\n")).toContain("GrowthBook");

    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "feature-flag-readiness.md"), "utf8");
    expect(markdown).toContain("Source pattern: OpenFeature");
    expect(markdown).toContain("sticky-bucket [ready]");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "feature-flag-readiness.html"), "utf8");
    expect(html).toContain("Feature Flag Snapshot");
    expect(html).toContain("data-source-pattern=\"OpenFeature Unleash GrowthBook\"");
    expect(html).toContain("remote-eval");
  }, 20_000);

  it("compares a new study session against the previous source snapshot", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-incremental-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-incremental-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "scratch.txt"), "temporary notes not important to the lesson map\n");

    const first = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    await fs.writeFile(path.join(sourceRoot, "src", "added.ts"), "export const added = 'next lesson';\n");
    await fs.appendFile(path.join(sourceRoot, "src", "message.ts"), "\nexport const changed = true;\n");
    await fs.rm(path.join(sourceRoot, "README.md"));
    await fs.rm(path.join(sourceRoot, "scratch.txt"));

    const second = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });

    expect(second.analysis.incrementalReport.baselineSessionId).toBe(first.session.sessionId);
    expect(second.analysis.incrementalReport.addedFiles).toContain("src/added.ts");
    expect(second.analysis.incrementalReport.changedFiles).toContain("src/message.ts");
    expect(second.analysis.incrementalReport.removedFiles).toContain("README.md");
    expect(second.analysis.incrementalReport.unchangedFiles).toContain("src/main.ts");
    expect(second.analysis.incrementalReport.coverageDelta.baselineCoverageRatio).toBeLessThan(second.analysis.incrementalReport.coverageDelta.currentCoverageRatio);
    expect(second.analysis.incrementalReport.coverageDelta.coverageRatioDelta).toBeGreaterThan(0);
  });

  it("resolves relative local sources against an explicit source base directory", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-relative-studies-"));
    const sourceBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-relative-source-base-"));
    await fs.cp(fixtureRoot, path.join(sourceBaseDir, "relative-app"), { recursive: true });

    const result = await runStudy({
      source: "relative-app",
      sourceBaseDir,
      mode: "quick",
      level: "beginner",
      studiesRoot
    });

    expect(result.session.status).toBe("complete");
    expect(result.session.localSourcePath).toBe(path.join(sourceBaseDir, "relative-app"));
    await expect(fs.access(path.join(result.session.outputPaths.html, "index.html"))).resolves.toBeUndefined();
  });

  it("uses the required quiz count formula bounds", () => {
    expect(calculateQuizCount({ mode: "quick", folderCount: 1, fileCount: 1, glossaryCount: 1, sectionCount: 1 })).toBeGreaterThanOrEqual(5);
    expect(calculateQuizCount({ mode: "standard", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(35);
    expect(calculateQuizCount({ mode: "deep", folderCount: 100, fileCount: 100, glossaryCount: 100, sectionCount: 12 })).toBeLessThanOrEqual(60);
  });
});
