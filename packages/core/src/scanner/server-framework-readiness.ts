import path from "node:path";
import type { ServerFrameworkReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";
import {
  serverFrameworkReadinessFastifySignals,
  serverFrameworkReadinessExpressSignals,
  serverFrameworkReadinessKoaSignals,
  serverFrameworkReadinessNestjsSignals,
  serverFrameworkReadinessHonoSignals,
  serverFrameworkReadinessHapiSignals,
  serverFrameworkReadinessElysiaSignals,
  serverFrameworkReadinessAdonisSignals,
  serverFrameworkReadinessSailsSignals,
  serverFrameworkReadinessMeteorSignals,
  serverFrameworkReadinessRailsSignals,
  serverFrameworkReadinessDjangoSignals,
  serverFrameworkReadinessLaravelSignals,
  serverFrameworkReadinessSpringSignals,
  serverFrameworkReadinessAspnetCoreSignals,
  serverFrameworkReadinessFlaskSignals,
  serverFrameworkReadinessSymfonySignals,
  serverFrameworkReadinessGinSignals,
  serverFrameworkReadinessEchoSignals,
  serverFrameworkReadinessFiberSignals,
  serverFrameworkReadinessChiSignals,
  serverFrameworkReadinessMuxSignals,
  serverFrameworkReadinessPackageSignals,
  serverFrameworkReadinessSignalFromSpecs
} from "./server-framework-specific-signals.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildServerFrameworkReadinessReport(walk: WalkResult): Promise<ServerFrameworkReadinessReport> {
  const sourceFiles = await serverFrameworkReadinessSourceFiles(walk);
  const serverSetups = serverFrameworkReadinessSetups(sourceFiles);
  const routeSignals = serverFrameworkReadinessRouteSignals(sourceFiles);
  const schemaSignals = serverFrameworkReadinessSchemaSignals(sourceFiles);
  const pluginSignals = serverFrameworkReadinessPluginSignals(sourceFiles);
  const lifecycleSignals = serverFrameworkReadinessLifecycleSignals(sourceFiles);
  const runtimeSignals = serverFrameworkReadinessRuntimeSignals(sourceFiles);
  const errorSignals = serverFrameworkReadinessErrorSignals(sourceFiles);
  const testSignals = serverFrameworkReadinessTestSignals(sourceFiles);
  const fastifySignals = serverFrameworkReadinessFastifySignals(sourceFiles);
  const expressSignals = serverFrameworkReadinessExpressSignals(sourceFiles);
  const koaSignals = serverFrameworkReadinessKoaSignals(sourceFiles);
  const nestjsSignals = serverFrameworkReadinessNestjsSignals(sourceFiles);
  const honoSignals = serverFrameworkReadinessHonoSignals(sourceFiles);
  const hapiSignals = serverFrameworkReadinessHapiSignals(sourceFiles);
  const elysiaSignals = serverFrameworkReadinessElysiaSignals(sourceFiles);
  const adonisSignals = serverFrameworkReadinessAdonisSignals(sourceFiles);
  const sailsSignals = serverFrameworkReadinessSailsSignals(sourceFiles);
  const meteorSignals = serverFrameworkReadinessMeteorSignals(sourceFiles);
  const railsSignals = serverFrameworkReadinessRailsSignals(sourceFiles);
  const djangoSignals = serverFrameworkReadinessDjangoSignals(sourceFiles);
  const laravelSignals = serverFrameworkReadinessLaravelSignals(sourceFiles);
  const springSignals = serverFrameworkReadinessSpringSignals(sourceFiles);
  const aspnetCoreSignals = serverFrameworkReadinessAspnetCoreSignals(sourceFiles);
  const flaskSignals = serverFrameworkReadinessFlaskSignals(sourceFiles);
  const symfonySignals = serverFrameworkReadinessSymfonySignals(sourceFiles);
  const ginSignals = serverFrameworkReadinessGinSignals(sourceFiles);
  const echoSignals = serverFrameworkReadinessEchoSignals(sourceFiles);
  const fiberSignals = serverFrameworkReadinessFiberSignals(sourceFiles);
  const chiSignals = serverFrameworkReadinessChiSignals(sourceFiles);
  const muxSignals = serverFrameworkReadinessMuxSignals(sourceFiles);
  const packageSignals = serverFrameworkReadinessPackageSignals(sourceFiles);

  const hasFastify = serverSetups.some((item) => item.framework === "fastify")
    || packageSignals.some((item) => item.readiness === "ready" && ["fastify", "@fastify/autoload", "fastify-plugin"].includes(item.signal))
    || fastifySignals.some((item) => item.readiness === "ready");
  const hasExpress = serverSetups.some((item) => item.framework === "express")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "express")
    || expressSignals.some((item) => item.readiness === "ready");
  const hasKoa = serverSetups.some((item) => item.framework === "koa")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "koa")
    || koaSignals.some((item) => item.readiness === "ready");
  const hasNestjs = serverSetups.some((item) => item.framework === "nestjs")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "@nestjs/core")
    || nestjsSignals.some((item) => item.readiness === "ready");
  const hasHapi = serverSetups.some((item) => item.framework === "hapi")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "@hapi/hapi")
    || hapiSignals.some((item) => item.readiness === "ready");
  const hasElysia = serverSetups.some((item) => item.framework === "elysia")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "elysia")
    || elysiaSignals.some((item) => item.readiness === "ready");
  const hasAdonis = serverSetups.some((item) => item.framework === "adonisjs")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "@adonisjs/core")
    || adonisSignals.some((item) => item.readiness === "ready");
  const hasSails = serverSetups.some((item) => item.framework === "sails")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "sails")
    || sailsSignals.some((item) => item.readiness === "ready");
  const hasMeteor = serverSetups.some((item) => item.framework === "meteor")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "meteor")
    || meteorSignals.some((item) => item.readiness === "ready");
  const hasRails = serverSetups.some((item) => item.framework === "rails")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "rails")
    || railsSignals.some((item) => item.readiness === "ready");
  const hasDjango = serverSetups.some((item) => item.framework === "django")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "django")
    || djangoSignals.some((item) => item.readiness === "ready");
  const hasLaravel = serverSetups.some((item) => item.framework === "laravel")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "laravel")
    || laravelSignals.some((item) => item.readiness === "ready");
  const hasSpring = serverSetups.some((item) => item.framework === "spring")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "spring")
    || springSignals.some((item) => item.readiness === "ready");
  const hasAspnetCore = serverSetups.some((item) => item.framework === "aspnet-core")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "aspnet-core")
    || aspnetCoreSignals.some((item) => item.readiness === "ready");
  const hasFlask = serverSetups.some((item) => item.framework === "flask")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "flask")
    || flaskSignals.some((item) => item.readiness === "ready");
  const hasSymfony = serverSetups.some((item) => item.framework === "symfony")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "symfony")
    || symfonySignals.some((item) => item.readiness === "ready");
  const hasGin = serverSetups.some((item) => item.framework === "gin")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "gin")
    || ginSignals.some((item) => item.readiness === "ready");
  const hasEcho = serverSetups.some((item) => item.framework === "echo")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "echo")
    || echoSignals.some((item) => item.readiness === "ready");
  const hasFiber = serverSetups.some((item) => item.framework === "fiber")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "fiber")
    || fiberSignals.some((item) => item.readiness === "ready");
  const hasChi = serverSetups.some((item) => item.framework === "chi")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "chi")
    || chiSignals.some((item) => item.readiness === "ready");
  const hasMux = serverSetups.some((item) => item.framework === "gorilla-mux")
    || packageSignals.some((item) => item.readiness === "ready" && item.signal === "gorilla-mux")
    || muxSignals.some((item) => item.readiness === "ready");
  const hasServer = serverSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready") || hasFastify || hasExpress || hasKoa || hasNestjs || hasHapi || hasElysia || hasAdonis || hasSails || hasMeteor || hasRails || hasDjango || hasLaravel || hasSpring || hasAspnetCore || hasFlask || hasSymfony || hasGin || hasEcho || hasFiber || hasChi || hasMux;
  const hasRoutes = routeSignals.some((item) => item.readiness === "ready") || serverSetups.some((item) => item.routeCount > 0);
  const hasSchemas = schemaSignals.some((item) => item.readiness === "ready") || serverSetups.some((item) => item.schemaCount > 0);
  const hasPlugins = pluginSignals.some((item) => item.readiness === "ready") || serverSetups.some((item) => item.pluginCount > 0);
  const hasRuntime = runtimeSignals.some((item) => item.readiness === "ready") || serverSetups.some((item) => item.listenCount > 0);
  const hasErrors = errorSignals.some((item) => item.readiness === "ready") || serverSetups.some((item) => item.errorCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || serverSetups.some((item) => item.testCount > 0);
  const hasFastifyRoutes = fastifySignals.some((item) => item.readiness === "ready" && ["route-shorthand", "route-object"].includes(item.signal));
  const hasFastifySchemas = fastifySignals.some((item) => item.readiness === "ready" && ["route-options-schema", "add-schema", "validator-compiler", "serializer-compiler", "schema-controller"].includes(item.signal));
  const hasExpressMiddleware = expressSignals.some((item) => item.readiness === "ready" && ["middleware-use", "error-middleware", "static-middleware", "json-parser", "urlencoded-parser"].includes(item.signal));
  const hasKoaMiddleware = koaSignals.some((item) => item.readiness === "ready" && ["middleware-use", "async-middleware", "await-next", "compose"].includes(item.signal));
  const hasNestjsModule = nestjsSignals.some((item) => item.readiness === "ready" && ["module-decorator", "controller-decorator", "injectable-provider", "provider-registration"].includes(item.signal));
  const hasHapiRoute = hapiSignals.some((item) => item.readiness === "ready" && ["route-object", "route-array", "route-options"].includes(item.signal));
  const hasElysiaRoute = elysiaSignals.some((item) => item.readiness === "ready" && ["method-routes", "route-options", "group", "guard"].includes(item.signal));
  const hasAdonisRoute = adonisSignals.some((item) => item.readiness === "ready" && ["router-service", "method-routes", "route-group", "resource-routes"].includes(item.signal));
  const hasSailsRoute = sailsSignals.some((item) => item.readiness === "ready" && ["config-routes", "route-address", "router-bind", "action-classic", "action2-fn", "register-action"].includes(item.signal));
  const hasMeteorRoute = meteorSignals.some((item) => item.readiness === "ready" && ["methods", "publish", "webapp-handlers", "ddp-connect"].includes(item.signal));
  const hasRailsRoute = railsSignals.some((item) => item.readiness === "ready" && ["routes-draw", "route-resources", "route-namespace", "route-scope", "route-root", "route-mount", "controller-action"].includes(item.signal));
  const hasDjangoRoute = djangoSignals.some((item) => item.readiness === "ready" && ["urlconf", "path-route", "re-path-route", "include-route", "function-view", "class-view", "generic-view"].includes(item.signal));
  const hasLaravelRoute = laravelSignals.some((item) => item.readiness === "ready" && ["routing-facade", "router-methods", "route-group", "route-prefix", "route-resource", "controller"].includes(item.signal));
  const hasSpringRoute = springSignals.some((item) => item.readiness === "ready" && ["rest-controller", "controller", "request-mapping", "method-mapping", "router-function"].includes(item.signal));
  const hasAspnetCoreRoute = aspnetCoreSignals.some((item) => item.readiness === "ready" && ["minimal-api-route", "map-group", "mvc-controller", "api-controller", "route-attribute", "http-method-attributes"].includes(item.signal));
  const hasFlaskRoute = flaskSignals.some((item) => item.readiness === "ready" && ["route-decorator", "blueprint-route", "add-url-rule", "method-view"].includes(item.signal));
  const hasSymfonyRoute = symfonySignals.some((item) => item.readiness === "ready" && ["route-attribute", "route-collection", "route-loader", "router-interface", "controller", "abstract-controller"].includes(item.signal));
  const hasGinRoute = ginSignals.some((item) => item.readiness === "ready" && ["method-routes", "route-group", "router-group", "handler-func"].includes(item.signal));
  const hasEchoRoute = echoSignals.some((item) => item.readiness === "ready" && ["method-routes", "route-group", "group-type", "handler-func"].includes(item.signal));
  const hasFiberRoute = fiberSignals.some((item) => item.readiness === "ready" && ["method-routes", "route-group", "route-function", "handler-func", "router-type"].includes(item.signal));
  const hasChiRoute = chiSignals.some((item) => item.readiness === "ready" && ["method-routes", "method-route", "method-func-route", "handle", "handle-func", "route-group", "route-function", "mount", "router-interface"].includes(item.signal));
  const hasMuxRoute = muxSignals.some((item) => item.readiness === "ready" && ["new-router", "handle", "handle-func", "handler", "handler-func", "method-routes", "path", "path-prefix", "subrouter", "route-type"].includes(item.signal));

  const riskQueue: ServerFrameworkReadinessReport["riskQueue"] = [];
  if (!hasServer) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the server framework entry point before claiming server readiness.",
      why: "Fastify-style readiness starts with a framework instance, route registration, plugin registration, or package evidence learners can trace.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasServer && !hasRoutes) {
    riskQueue.push({
      priority: "high",
      action: "Trace route declarations and HTTP method handlers.",
      why: "A server framework dependency without route evidence does not show request entry points or learner navigation paths.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasFastify && !hasFastifyRoutes) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Fastify route shorthand or route-object declarations.",
      why: "Fastify readiness needs visible .get/.post shorthand or .route({ method, url }) evidence so learners can map request entry points.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasRoutes && !hasSchemas) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document request/response schemas for important routes.",
      why: "Fastify emphasizes JSON Schema validation and serialization; routes without schemas are harder to rebuild and verify safely.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasFastify && !hasFastifySchemas) {
    riskQueue.push({
      priority: "low",
      action: "Add Fastify route schemas, shared schemas, validator compiler, or serializer compiler evidence.",
      why: "Fastify projects often depend on JSON Schema and compiler hooks for safe request validation and response serialization.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasRoutes && !hasPlugins) {
    riskQueue.push({
      priority: "low",
      action: "Record plugin registration, encapsulation, or route prefix ownership.",
      why: "Plugins explain how framework apps organize cross-cutting behavior, shared decorators, and scoped routes.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasExpress && !hasExpressMiddleware) {
    riskQueue.push({
      priority: "low",
      action: "Trace Express middleware, body parser, static assets, or error middleware.",
      why: "Express applications often organize behavior around app.use(), mounted routers, parser middleware, static middleware, and four-argument error handlers.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasKoa && !hasKoaMiddleware) {
    riskQueue.push({
      priority: "low",
      action: "Trace Koa middleware, async next flow, compose usage, or ctx response writes.",
      why: "Koa applications are middleware-first; readiness depends on understanding async app.use layers, ctx mutation, and upstream/downstream flow.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasNestjs && !hasNestjsModule) {
    riskQueue.push({
      priority: "medium",
      action: "Trace NestJS modules, controllers, providers, and dependency-injection boundaries.",
      why: "NestJS readiness depends on decorator metadata that links modules, controllers, providers, guards, pipes, interceptors, and filters into an application graph.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasHapi && !hasHapiRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Hapi server.route declarations, route options, plugins, and lifecycle extensions.",
      why: "Hapi readiness depends on the server.route object graph plus plugin registration, validation, auth, toolkit responses, and extension points.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasElysia && !hasElysiaRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Elysia method routes, groups, guards, route schemas, and lifecycle hooks.",
      why: "Elysia readiness depends on the chained route graph plus TypeBox schemas, scoped plugins, context extension, lifecycle hooks, and Bun/fetch adapters.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasAdonis && !hasAdonisRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace AdonisJS router service declarations, route groups, middleware stacks, and controllers.",
      why: "AdonisJS readiness depends on the router/controller graph plus middleware ownership, HttpContext, service providers, validation, and test utilities.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasSails && !hasSailsRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Sails config/routes.js, action targets, policies, hooks, and blueprint routes.",
      why: "Sails readiness depends on configured routes plus controller/action ownership, policies, hooks, blueprints, and request/response helpers.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasMeteor && !hasMeteorRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Meteor methods, publications, DDP connections, and WebApp connect handlers.",
      why: "Meteor readiness depends on the DDP method/publication graph plus Mongo collections, client subscriptions, WebApp handlers, package files, and Tinytest coverage.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasRails && !hasRailsRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Rails config/routes.rb, controller actions, mounted engines, and request specs.",
      why: "Rails readiness depends on the routes DSL plus controller action ownership, strong parameters, models, jobs, mailers, Action Cable, and integration tests.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasDjango && !hasDjangoRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Django urls.py, path/re_path/include declarations, views, and test client coverage.",
      why: "Django readiness depends on URLConf route ownership plus views, settings, models, forms, middleware, admin, migrations, commands, and tests.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasLaravel && !hasLaravelRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Laravel routes/web.php or routes/api.php, Route facade/router declarations, controllers, and HTTP tests.",
      why: "Laravel readiness depends on route/controller ownership plus middleware, service providers, Eloquent models, migrations, validation, Artisan commands, queues, mail, events, and tests.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasSpring && !hasSpringRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Spring Boot controllers, request mappings, functional routers, and HTTP tests.",
      why: "Spring Boot readiness depends on @SpringBootApplication plus MVC/WebFlux route ownership, configuration, beans, data boundaries, actuator signals, and test slices.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasAspnetCore && !hasAspnetCoreRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace ASP.NET Core Minimal API routes, MapGroup usage, controllers, route attributes, and HTTP tests.",
      why: "ASP.NET Core readiness depends on WebApplication builder setup plus endpoint routing, middleware, dependency injection, auth/OpenAPI/health signals, and TestHost/WebApplicationFactory coverage.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasFlask && !hasFlaskRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Flask @app.route/@blueprint.route decorators, add_url_rule calls, MethodView classes, and test client coverage.",
      why: "Flask readiness depends on the application factory or Flask instance plus route ownership, blueprints, request context, config, hooks, error handlers, templates, CLI, and tests.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasSymfony && !hasSymfonyRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Symfony Route attributes, route loaders, controller services, and functional tests.",
      why: "Symfony readiness depends on FrameworkBundle plus Routing, HttpKernel, controller helpers, dependency injection, events, console commands, and KernelBrowser/WebTestCase coverage.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasGin && !hasGinRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Gin Engine routes, RouterGroup ownership, middleware, bindings, and httptest coverage.",
      why: "Gin readiness depends on gin.Default/gin.New setup plus method routes, grouped routes, gin.Context helpers, binding/validator behavior, middleware, runtime Run calls, and httptest verification.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasEcho && !hasEchoRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Echo instance routes, Group ownership, middleware, bindings, and httptest coverage.",
      why: "Echo readiness depends on echo.New setup plus method routes, grouped routes, echo.Context helpers, bind/validate behavior, middleware, Start calls, HTTP error handlers, and httptest verification.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasFiber && !hasFiberRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Fiber App routes, Router groups, middleware, binders, error handlers, and app.Test coverage.",
      why: "Fiber readiness depends on fiber.New setup plus method routes, grouped routers, fiber.Ctx helpers, Bind behavior, middleware, Listen calls, ErrorHandler/NewError handling, static/rendering response helpers, and app.Test/httptest verification.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasChi && !hasChiRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Chi Router/Mux routes, mounted subrouters, middleware chain, URL params, custom not-found/method handlers, and httptest coverage.",
      why: "Chi readiness depends on chi.NewRouter/NewMux setup plus method routes, Handle/Method helpers, Group/Route/Mount ownership, net/http middleware chains, chi.URLParam/RouteContext helpers, custom NotFound/MethodNotAllowed behavior, and httptest verification.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasMux && !hasMuxRoute) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Gorilla Mux router routes, matchers, subrouters, middleware, route variables, reverse URL builders, and httptest coverage.",
      why: "Gorilla Mux readiness depends on mux.NewRouter setup plus Handle/HandleFunc, Methods/Path/PathPrefix/Host/Queries/Schemes matchers, Subrouter ownership, mux.Vars request context helpers, CORS/middleware chains, URL builders, Walk traversal, and httptest verification.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasRoutes && !hasErrors) {
    riskQueue.push({
      priority: "medium",
      action: "Document error and not-found handlers for request failures.",
      why: "Learners need to see how validation errors, framework errors, not-found responses, and reply codes are handled.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasServer && !hasRuntime) {
    riskQueue.push({
      priority: "low",
      action: "Trace listen/host/port/logger/body-limit runtime configuration.",
      why: "Framework setup is incomplete until learners can see where the server binds, logs, and limits incoming requests.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  if (hasServer && !hasTests) {
    riskQueue.push({
      priority: "low",
      action: "Add inject, light-my-request, supertest, or integration test evidence for server routes.",
      why: "Fastify exposes inject-style testing so routes can be verified without opening a real network listener.",
      relatedHref: "html/server-framework-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify server behavior with trusted tests or a local dev server outside RepoTutor.",
    why: "RepoTutor records server framework readiness only; it does not start listeners, execute handlers, send HTTP requests, run plugins, compile schemas, or mutate runtime state.",
    relatedHref: "html/server-framework-readiness.html"
  });

  return {
    summary: `Fastify/Express/Koa/NestJS/Hono/Hapi/Elysia/AdonisJS/Sails/Meteor/Rails/Django/Laravel/Spring Boot/ASP.NET Core/Flask/Symfony/Gin/Echo/Fiber/Chi/Gorilla Mux-style server framework readiness report: setup ${serverSetups.length}개, route signal ${routeSignals.length}개, schema signal ${schemaSignals.length}개, plugin signal ${pluginSignals.length}개, Fastify signal ${fastifySignals.length}개, Express signal ${expressSignals.length}개, Koa signal ${koaSignals.length}개, NestJS signal ${nestjsSignals.length}개, Hono signal ${honoSignals.length}개, Hapi signal ${hapiSignals.length}개, Elysia signal ${elysiaSignals.length}개, AdonisJS signal ${adonisSignals.length}개, Sails signal ${sailsSignals.length}개, Meteor signal ${meteorSignals.length}개, Rails signal ${railsSignals.length}개, Django signal ${djangoSignals.length}개, Laravel signal ${laravelSignals.length}개, Spring signal ${springSignals.length}개, ASP.NET Core signal ${aspnetCoreSignals.length}개, Flask signal ${flaskSignals.length}개, Symfony signal ${symfonySignals.length}개, Gin signal ${ginSignals.length}개, Echo signal ${echoSignals.length}개, Fiber signal ${fiberSignals.length}개, Chi signal ${chiSignals.length}개, Gorilla Mux signal ${muxSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux fastify route get post schema register plugin addHook decorate setErrorHandler listen inject logger withTypeProvider FastifyInstance FastifyPluginCallback FastifyPluginAsync addContentTypeParser childLoggerFactory express express.Router app.use error middleware app.param express.static express.json express.urlencoded res.send res.json res.render res.redirect req.params req.query req.body supertest mocha new Koa app.use async ctx await next koa-compose app.callback app.on error ctx.body ctx.status ctx.throw ctx.assert ctx.state ctx.cookies ctx.redirect app.context app.keys app.proxy asyncLocalStorage node:test NestFactory @Module @Controller @Get @Post @Injectable @Inject @Body @Param @Query @Headers @UseGuards @UsePipes @UseInterceptors @UseFilters ValidationPipe ExceptionFilter CanActivate PipeTransform NestInterceptor TestingModule createTestingModule enableCors setGlobalPrefix NestExpressApplication NestFastifyApplication WebSocketGateway @Resolver @MessagePattern ClientProxy ConfigModule TypeOrmModule MongooseModule GraphQLModule new Hono app.route basePath app.use c.req c.json validator zValidator hc testClient app.fetch serve Hapi.server server.route server.register server.ext server.auth server.method server.decorate server.state server.cache server.validator Joi h.response h.redirect request.params request.query request.payload request.headers Boom server.start server.inject Lab Code new Elysia group guard derive resolve model macro t.Object onBeforeHandle onAfterHandle onAfterResponse status redirect set.headers ws app.handle app.fetch treaty eden Bun.test @adonisjs/core router.get router.group router.resource middleware HttpContext request.validateUsing response.redirect ApplicationService BaseCommand testUtils Japa sails config/routes sails.config.routes sails.router.bind sails.lift sails.load actions2 inputs exits fn policies blueprints hooks helpers Waterline res.view res.json sails.request Meteor.startup Meteor.methods Meteor.publish Meteor.subscribe DDP.connect Mongo.Collection WebApp.connectHandlers check Match Tracker.autorun Template.events Template.helpers Blaze.render Tinytest meteor test Rails.application.routes.draw resources namespace scope root ActionController::Base ApplicationController before_action params.require permit render json redirect_to ActiveRecord::Base ApplicationRecord has_many belongs_to validates ActiveJob::Base ActionMailer::Base ActionCable ActiveSupport::TestCase ActionDispatch::IntegrationTest Django urlpatterns path re_path include reverse resolve INSTALLED_APPS MIDDLEWARE ROOT_URLCONF settings.configure DJANGO_SETTINGS_MODULE models.Model ForeignKey ManyToManyField QuerySet Manager forms.Form forms.ModelForm MiddlewareMixin process_request process_response admin.site.register ModelAdmin migrations.Migration BaseCommand django-admin manage.py TestCase Client RequestFactory Laravel Route:: routes/web.php routes/api.php Controller Middleware FormRequest Validator::make Eloquent Model fillable guarded casts hasMany belongsTo Schema::create migration factory seeder Blade view artisan command schedule queue job Mailable Notification Broadcast Event Listener PHPUnit Pest SpringBootApplication SpringApplication.run RestController RequestMapping GetMapping PostMapping PathVariable RequestParam RequestBody ResponseEntity Configuration AutoConfiguration ConfigurationProperties Bean ConditionalOn Service Repository Component Entity JpaRepository Transactional Actuator HealthIndicator MeterRegistry WebMvc WebFlux RouterFunction MockMvc WebTestClient TestRestTemplate Testcontainers WebApplication.CreateBuilder WebApplication.CreateSlimBuilder builder.Services MapGet MapPost MapPut MapDelete MapPatch MapGroup MapControllers AddControllers ControllerBase ApiController Route HttpGet HttpPost FromBody FromRoute FromQuery IActionResult ActionResult IResult Results TypedResults ProblemDetails AddProblemDetails AddRouting UseRouting UseAuthentication UseAuthorization AddAuthentication AddAuthorization AddOpenApi MapOpenApi Swagger UI SignalR MapHub AddHealthChecks MapHealthChecks TestServer WebApplicationFactory UseTestServer CreateClient xUnit Flask Blueprint route add_url_rule MethodView request jsonify render_template redirect abort url_for session g current_app app_context request_context before_request after_request teardown_request errorhandler config from_prefixed_env test_client test_request_context test_cli_runner pytest Symfony FrameworkBundle Route RouteCollection AbstractController RequestStack JsonResponse RedirectResponse HttpKernel KernelInterface MicroKernelTrait ContainerBuilder services.yaml autowire autoconfigure CompilerPassInterface EventSubscriberInterface AsCommand CommandTester KernelBrowser WebTestCase KernelTestCase gin.Default gin.New gin.Engine gin.RouterGroup GET POST PUT PATCH DELETE Any Group Use gin.Context Param Query DefaultQuery PostForm DefaultPostForm GetHeader GetRawData ShouldBind BindJSON ShouldBindJSON ShouldBindQuery ShouldBindUri binding.Validator JSON String HTML Redirect File Abort AbortWithStatus NoRoute NoMethod Logger Recovery SetTrustedProxies Run RunTLS RunUnix httptest CreateTestContext SetMode TestMode echo.New echo.Echo echo.Group GET POST PUT PATCH DELETE Any Match Group Use echo.Context Param QueryParam FormValue Request Bind Validate JSON String HTML Redirect File Attachment Inline NoContent Stream HTTPError NewHTTPError NotFoundHandler MethodNotAllowedHandler Recover Logger Renderer Static Start StartTLS StartAutoTLS StartServer NewContext httptest fiber.New fiber.App fiber.Ctx fiber.Router Get Post Put Patch Delete All Group Route Mount Use Static Params Query Get Bind Body JSON SendString Render Redirect SendFile Download SendStream SendStatus Status NewError ErrorHandler recover.New logger.New Listen ListenTLS ListenMutualTLS app.Test httptest chi.NewRouter chi.NewMux chi.Mux chi.Router chi.Routes chi.Middlewares Get Post Put Patch Delete Head Options Connect Trace Method MethodFunc Handle HandleFunc Group Route Mount Use With Chain URLParam URLParamFromCtx RouteContext NewRouteContext RoutePattern Routes Middlewares Match Find NotFound MethodNotAllowed middleware.Logger middleware.Recoverer middleware.RequestID middleware.RealIP middleware.ClientIP middleware.Timeout middleware.Compress middleware.Throttle middleware.StripSlashes middleware.RedirectSlashes middleware.URLFormat httptest mux.NewRouter mux.Router mux.Route mux.RouteMatch Handle HandleFunc Handler HandlerFunc Methods Path PathPrefix Host Headers HeadersRegexp Queries Schemes MatcherFunc Subrouter Name URL URLHost URLPath GetVarNames BuildVarsFunc StrictSlash SkipClean UseEncodedPath Vars SetURLVars CurrentRoute CurrentRouter MiddlewareFunc Use CORSMethodMiddleware Walk WalkFunc GetPathTemplate GetMethods httptest",
    serverSetups,
    routeSignals,
    schemaSignals,
    pluginSignals,
    lifecycleSignals,
    runtimeSignals,
    errorSignals,
    testSignals,
    fastifySignals,
    expressSignals,
    koaSignals,
    nestjsSignals,
    honoSignals,
    hapiSignals,
    elysiaSignals,
    adonisSignals,
    sailsSignals,
    meteorSignals,
    railsSignals,
    djangoSignals,
    laravelSignals,
    springSignals,
    aspnetCoreSignals,
    flaskSignals,
    symfonySignals,
    ginSignals,
    echoSignals,
    fiberSignals,
    chiSignals,
    muxSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"fastify\\(|Fastify\\(|express\\(|new Koa|new Hono|NestFactory|Hapi\\.server|new Elysia|@adonisjs/core|router\\.|sails|sails\\.lift|sails\\.load|Meteor\\.|DDP\\.connect|WebApp\\.connectHandlers|Rails\\.application|ActionController::Base|ApplicationController|Django|urlpatterns|path\\(|models\\.Model|Laravel|Route::|Illuminate\\\\|artisan|SpringBootApplication|SpringApplication\\.run|spring-boot-starter|github.com/gofiber/fiber|fiber.New|fiber.App|fiber.Ctx|github\\.com/go-chi/chi|chi\\.NewRouter|chi\\.NewMux|chi\\.Router|chi\\.Mux|github\\.com/gorilla/mux|mux\\.NewRouter|mux\\.Router\" package.json pyproject.toml composer.json Gemfile pom.xml build.gradle build.gradle.kts go.mod .meteor src app api cmd internal pkg config start server client imports packages django routes database bootstrap", purpose: "Find server framework instance creation and package ownership." },
      { command: "rg \"\\.route\\(|\\.get\\(|\\.post\\(|\\.put\\(|\\.patch\\(|\\.delete\\(|router\\.|basePath\" src app server packages", purpose: "Trace HTTP routes, method handlers, mounted route groups, parameters, and route options." },
      { command: "rg \"schema\\s*:|body\\s*:|querystring\\s*:|params\\s*:|response\\s*:|addSchema|setValidatorCompiler|setSerializerCompiler|validator\\(|zValidator|c\\.req\\.valid\" src app server packages", purpose: "Review request validation and response serialization schemas." },
      { command: "rg \"\\.register\\(|fastify-plugin|@fastify/autoload|addHook|decorate|decorateRequest|decorateReply|\\.use\\(|middleware\" src app server packages", purpose: "Map plugin/middleware encapsulation, hooks, decorators, and shared request/reply behavior." },
      { command: "rg \"setErrorHandler|setNotFoundHandler|frameworkErrors|reply\\.code|validation error|onError|notFound|HTTPException|c\\.status\" src app server packages", purpose: "Inspect framework error, not-found, validation, and response-code handling." },
      { command: "rg \"\\.listen\\(|host\\s*:|port\\s*:|logger\\s*:|bodyLimit|addContentTypeParser|\\.inject\\(|supertest|testClient|app\\.fetch|serve\\(\" src app server packages test tests", purpose: "Check runtime binding, logging, parser limits, fetch handlers, and route test coverage." },
      { command: "rg \"fastify\\(|Fastify\\(|\\.route\\(|\\.get\\(|\\.post\\(|\\.register\\(|fastify-plugin|withTypeProvider|FastifyInstance|FastifyPlugin|addSchema|setValidatorCompiler|setSerializerCompiler|addContentTypeParser|childLoggerFactory\" src app server packages test tests", purpose: "Map Fastify-specific route, plugin, schema compiler, type provider, runtime, and test signals." },
      { command: "rg \"express\\(|express\\.Router|app\\.use|router\\.use|app\\.param|router\\.param|express\\.static|express\\.json|express\\.urlencoded|res\\.(send|json|render|redirect|sendFile|download|cookie)|req\\.(params|query|body|cookies|headers|accepts|get)|supertest|mocha\" src app server packages test tests", purpose: "Map Express app, router, middleware, parser, request/response, view, static asset, and route test signals." },
      { command: "rg \"new Koa|app\\.use|async \\(ctx|await next\\(|koa-compose|app\\.callback|app\\.on\\(['\\\"]error|ctx\\.(body|status|throw|assert|state|cookies|set|get|redirect)|ctx\\.(request|response)|app\\.(context|keys|proxy|subdomainOffset)|asyncLocalStorage|supertest|node:test\" src app server packages test tests", purpose: "Map Koa middleware flow, context/request/response helpers, proxy/cookie settings, callbacks, error handling, and route tests." },
      { command: "rg \"NestFactory|@Module|@Controller|@(Get|Post|Put|Patch|Delete)|@Injectable|@Inject|@Body|@Param|@Query|@Headers|@UseGuards|@UsePipes|@UseInterceptors|@UseFilters|ValidationPipe|ExceptionFilter|CanActivate|PipeTransform|NestInterceptor|TestingModule|createTestingModule|enableCors|setGlobalPrefix|WebSocketGateway|@Resolver|@MessagePattern|ClientProxy\" src app server packages test tests", purpose: "Map NestJS module/controller/provider graph, decorators, guards, pipes, interceptors, filters, adapters, and tests." },
      { command: "rg \"new Hono|app\\.route|basePath|app\\.use|c\\.req|c\\.json|validator\\(|zValidator|hc<|testClient|app\\.fetch|serve\\(\" src app server packages test tests", purpose: "Map Hono-specific route groups, context helpers, validators, RPC clients, tests, and adapters." },
      { command: "rg \"Hapi\\.server|server\\.route|server\\.register|server\\.ext|server\\.auth|server\\.method|server\\.decorate|server\\.state|server\\.cache|server\\.validator|Joi|h\\.(response|redirect)|request\\.(params|query|payload|headers)|Boom|server\\.start|server\\.inject|Lab|Code\" src app server packages test tests", purpose: "Map Hapi server, route objects, plugins, extension points, auth, validation, toolkit responses, request objects, errors, and inject tests." },
      { command: "rg \"new Elysia|\\.group\\(|\\.guard\\(|\\.derive\\(|\\.resolve\\(|\\.model\\(|\\.macro\\(|\\.decorate\\(|\\.state\\(|\\.on(Request|Parse|Transform|BeforeHandle|AfterHandle|AfterResponse|Error)|t\\.Object|\\.ws\\(|\\.listen\\(|\\.handle\\(|\\.fetch|treaty|eden|Bun\\.test\" src app server packages test tests", purpose: "Map Elysia chained routes, scoped groups, TypeBox schemas, context extension, lifecycle hooks, WebSockets, adapters, tests, and Eden clients." },
      { command: "rg \"@adonisjs/core|router\\.(get|post|put|patch|delete|group|resource)|\\.middleware\\(|\\.prefix\\(|\\.as\\(|HttpContext|request\\.(input|only|validateUsing|params)|response\\.(status|redirect)|ApplicationService|BaseCommand|testUtils|Japa|supertest\" app start config providers commands tests", purpose: "Map AdonisJS router/controller graph, middleware stacks, HttpContext, providers, commands, validation, and tests." },
      { command: "rg \"sails|sails\\.lift|sails\\.load|sails\\.config\\.routes|config/routes|sails\\.router\\.bind|module\\.exports|inputs\\s*:|exits\\s*:|fn\\s*:|registerAction|registerActionMiddleware|policies|blueprints|api/hooks|helpers|Waterline|res\\.(view|json|redirect|status)|req\\.(param|body|query|file)|sails\\.request\" api config lib test tests", purpose: "Map Sails routes, actions2 inputs/exits/fn, policies, hooks, blueprints, helpers, Waterline models, request/response helpers, and request tests." },
      { command: "rg \"Meteor\\.(startup|methods|publish|subscribe|call|apply|settings|isClient|isServer|Error)|DDP\\.connect|Mongo\\.Collection|WebApp\\.connectHandlers|check\\(|Match\\.|Tracker\\.autorun|Template\\.|Blaze\\.render|Package\\.(describe|onUse)|api\\.(use|addFiles)|Tinytest|meteor test\" .meteor server client imports packages tests", purpose: "Map Meteor DDP methods/publications, subscriptions, Mongo collections, WebApp handlers, Blaze/Tracker UI hooks, package APIs, and Tinytest coverage." },
      { command: "rg \"Rails\\.application\\.routes\\.draw|resources :|namespace :|scope |root ['\\\"]|ActionController::Base|ApplicationController|before_action|params\\.require|permit\\(|render json:|redirect_to|ActiveRecord::Base|ApplicationRecord|has_many|belongs_to|validates |ActiveJob::Base|ActionMailer::Base|ActionCable|ActionDispatch::IntegrationTest|ActiveSupport::TestCase\" Gemfile config app db lib test spec", purpose: "Map Rails routes, controllers, strong parameters, models, jobs, mailers, Action Cable, environment config, and tests." },
      { command: "rg \"urlpatterns|path\\(|re_path\\(|include\\(|reverse\\(|resolve\\(|INSTALLED_APPS|MIDDLEWARE|ROOT_URLCONF|settings\\.configure|DJANGO_SETTINGS_MODULE|models\\.Model|ForeignKey|ManyToManyField|QuerySet|forms\\.Form|forms\\.ModelForm|MiddlewareMixin|process_request|process_response|admin\\.site\\.register|ModelAdmin|migrations\\.Migration|BaseCommand|django-admin|manage\\.py|TestCase|Client\\(|RequestFactory\" pyproject.toml manage.py settings.py urls.py views.py models.py forms.py admin.py middleware.py migrations tests django", purpose: "Map Django URLConf, views, settings, models, forms, middleware, admin, migrations, commands, and tests." },
      { command: "rg \"Route::|routes/(web|api)\\.php|->(get|post|put|patch|delete|middleware|prefix|name|group)|Controller|Middleware|ServiceProvider|FormRequest|Validator::make|extends Model|fillable|guarded|casts\\(|hasMany\\(|belongsTo\\(|Schema::create|factory\\(|Seeder|Blade|view\\(|artisan|Illuminate\\\\Console\\\\Command|ShouldQueue|Mailable|Notification|Broadcast|TestResponse|withoutExceptionHandling|Pest\" composer.json artisan bootstrap app routes database tests", purpose: "Map Laravel routes, controllers, middleware, providers, validation, Eloquent models, migrations, commands, queues, mail, events, and tests." },
      { command: "rg \"SpringBootApplication|SpringApplication\\.run|@RestController|@Controller|@RequestMapping|@(Get|Post|Put|Patch|Delete)Mapping|@PathVariable|@RequestParam|@RequestBody|ResponseEntity|@Configuration|@AutoConfiguration|@ConfigurationProperties|@Bean|@ConditionalOn|@Service|@Repository|@Entity|JpaRepository|@Transactional|HealthIndicator|MeterRegistry|@SpringBootTest|@WebMvcTest|MockMvc|WebTestClient|TestRestTemplate|Testcontainers\" pom.xml build.gradle build.gradle.kts src/main src/test", purpose: "Map Spring Boot application, MVC/WebFlux routes, config/beans, data boundaries, actuator, and test slice signals." },
      { command: "rg \"Microsoft\\.AspNetCore|WebApplication\\.Create(Slim)?Builder|builder\\.Services|app\\.Map(Get|Post|Put|Patch|Delete)|MapGroup|MapControllers|AddControllers|ControllerBase|ApiController|\\[Route|\\[Http(Get|Post|Put|Patch|Delete)|FromBody|FromRoute|FromQuery|IActionResult|ActionResult|IResult|Results\\.|TypedResults\\.|ProblemDetails|UseRouting|UseAuthentication|UseAuthorization|AddAuthentication|AddAuthorization|AddOpenApi|MapOpenApi|MapHub|AddSignalR|AddHealthChecks|MapHealthChecks|TestServer|WebApplicationFactory|UseTestServer|CreateClient\" '*.cs' '*.csproj' appsettings*.json", purpose: "Map ASP.NET Core builder, Minimal API routes, MVC controllers, middleware, DI/options, auth/OpenAPI/health/SignalR, runtime, and tests." },
      { command: "rg \"from flask|import flask|Flask\\(|Blueprint\\(|register_blueprint|@(app|bp|blueprint)\\.(route|get|post|put|patch|delete)|add_url_rule|MethodView|request\\.(args|form|json|get_json)|jsonify|render_template|redirect\\(|abort\\(|url_for|session\\[|g\\.|current_app|app_context|request_context|before_request|after_request|teardown_request|errorhandler|test_client|test_request_context|test_cli_runner|pytest\" pyproject.toml requirements.txt app.py wsgi.py src tests templates static", purpose: "Map Flask app factories, blueprints, routes, request/session context, templates, errors, CLI, and tests." },
      { command: "rg \"Symfony\\\\|FrameworkBundle|#\\[Route|RouteCollection|AbstractController|RequestStack|JsonResponse|RedirectResponse|HttpKernel|KernelInterface|MicroKernelTrait|ContainerBuilder|services\\.ya?ml|autowire|CompilerPassInterface|EventSubscriberInterface|AsCommand|Messenger|Workflow|TwigBundle|KernelBrowser|WebTestCase|KernelTestCase|CommandTester\" composer.json bin/console public/index.php config src templates tests", purpose: "Map Symfony FrameworkBundle, Routing, controllers, HttpKernel, DI services, events, console commands, Twig/templates, Messenger/Workflow, and functional tests." },
      { command: "rg \"github\\.com/gin-gonic/gin|gin\\.Default|gin\\.New|gin\\.Engine|gin\\.RouterGroup|\\.(GET|POST|PUT|PATCH|DELETE|Any|Group|Use)\\(|\\*gin\\.Context|c\\.(Param|Query|DefaultQuery|PostForm|GetHeader|GetRawData|ShouldBind|ShouldBindJSON|ShouldBindQuery|ShouldBindUri|JSON|String|HTML|Redirect|File|Status|Abort)|binding\\.Validator|NoRoute|NoMethod|SetTrustedProxies|RunTLS|RunUnix|httptest|CreateTestContext|TestMode\" go.mod go.sum cmd internal pkg server routes handlers middleware tests", purpose: "Map Gin Engine setup, RouterGroup routes, context helpers, binding/validator behavior, middleware, runtime Run calls, and httptest coverage." },
      { command: "rg \"github\\.com/gofiber/fiber|fiber\\.New|fiber\\.App|fiber\\.Ctx|fiber\\.Router|\\.(Get|Post|Put|Patch|Delete|All|Group|Route|Mount|Use|Static|Listen|ListenTLS|ListenMutualTLS|Test)\\(|c\\.(Params|Query|Get|Bind|Body|JSON|SendString|Render|Redirect|SendFile|Download|SendStream|SendStatus|Status|Next)|fiber\\.NewError|ErrorHandler|recover\\.New|logger\\.New|httptest\" go.mod go.sum cmd internal pkg server routes handlers middleware tests", purpose: "Map Fiber App setup, Router groups, Ctx helpers, binding/validator behavior, middleware, Listen calls, errors, and app.Test coverage." },
      { command: "rg \"github\\.com/go-chi/chi|chi\\.NewRouter|chi\\.NewMux|chi\\.Router|chi\\.Mux|\\.(Get|Post|Put|Patch|Delete|Head|Options|Connect|Trace|Method|MethodFunc|Handle|HandleFunc|Group|Route|Mount|Use|With)\\(|chi\\.(URLParam|URLParamFromCtx|RouteContext|NewRouteContext)|middleware\\.(Logger|Recoverer|RequestID|RealIP|ClientIP|Timeout|Compress|Throttle|StripSlashes|RedirectSlashes|URLFormat|NoCache|Heartbeat|BasicAuth|RouteHeaders)|httptest\" go.mod go.sum cmd internal pkg server routes handlers middleware tests", purpose: "Map Chi Router/Mux setup, routes, middleware chains, URL params, custom handlers, and httptest coverage." },
      { command: "rg \"github\\.com/gorilla/mux|mux\\.NewRouter|mux\\.Router|mux\\.Route|\\.(Handle|HandleFunc|Handler|HandlerFunc|Methods|Path|PathPrefix|Host|Headers|HeadersRegexp|Queries|Schemes|MatcherFunc|Subrouter|Name|URL|URLHost|URLPath|GetVarNames|BuildVarsFunc|StrictSlash|SkipClean|UseEncodedPath|Use|Walk)\\(|mux\\.(Vars|SetURLVars|CurrentRoute|CurrentRouter|CORSMethodMiddleware)|httptest\" go.mod go.sum cmd internal pkg server routes handlers middleware tests", purpose: "Map Gorilla Mux router setup, matchers, subrouters, route vars, URL builders, middleware, Walk traversal, and httptest coverage." }
    ],
    learnerNextSteps: [
      "먼저 Fastify(), fastify(), express(), new Koa(), new Hono(), NestFactory, Hapi.server, new Elysia, AdonisJS router service, Meteor.startup/Meteor.methods, Rails.application.routes.draw, Django urlpatterns, Laravel Route:: 같은 server instance 생성 지점을 찾으세요.",
      "get/post/put/patch/delete/route 신호로 실제 HTTP entry point와 parameter path를 확인하세요.",
      "schema.body, schema.querystring, schema.params, schema.response, addSchema로 request/response contract를 분리해서 보세요.",
      "register, fastify-plugin, @fastify/autoload, addHook, decorate 신호가 있으면 plugin encapsulation과 shared behavior 경계를 확인하세요.",
      "Fastify 프로젝트라면 withTypeProvider, FastifyInstance, FastifyPluginCallback/Async, FastifyRequest/Reply 타입 신호로 타입 안전 route contract를 확인하세요.",
      "Express 프로젝트라면 express.Router, app.use/router.use, app.param/router.param, parser/static middleware, four-argument error middleware, req/res helper 신호를 route contract와 분리해서 보세요.",
      "Koa 프로젝트라면 app.use async middleware, await next(), koa-compose, ctx.request/response, ctx.body/status/throw/assert/state/cookies 신호로 downstream/upstream 흐름을 확인하세요.",
      "NestJS 프로젝트라면 @Module, @Controller, @Injectable, NestFactory, guards/pipes/interceptors/filters, TestingModule 신호를 모듈 그래프와 요청 파이프라인으로 나눠 보세요.",
      "Hono 프로젝트라면 app.route/basePath/app.use로 route group과 middleware 경계를 보고 c.req/c.json/text/render로 context 입출력을 분리하세요.",
      "Hapi 프로젝트라면 Hapi.server, server.route, server.register, server.ext, server.auth, Joi validation, h.response, Boom error, server.inject 신호를 route object graph와 lifecycle로 나눠 보세요.",
      "Elysia 프로젝트라면 new Elysia, get/post, group/guard, t.Object schema, derive/resolve/decorate/state, onBeforeHandle/onError, ws, app.handle/fetch 신호를 chained route graph와 Bun/fetch adapter 경계로 나눠 보세요.",
      "AdonisJS 프로젝트라면 @adonisjs/core, router.get/post/group/resource, middleware stacks, HttpContext, request.validateUsing, response.redirect, providers, BaseCommand, testUtils/Japa 신호를 HTTP entry와 framework service 경계로 나눠 보세요.",
      "Sails 프로젝트라면 config/routes.js, sails.config.routes, sails.router.bind, actions2 inputs/exits/fn, policies, hooks, blueprints, helpers, Waterline models, res.view/json/redirect, sails.request 신호를 MVC와 runtime hook 경계로 나눠 보세요.",
      "Meteor 프로젝트라면 .meteor/packages, Meteor.methods/publish/subscribe, DDP.connect, Mongo.Collection, WebApp.connectHandlers, check/Match, Tracker/Blaze, Package.describe/onUse, Tinytest 신호를 DDP와 client/server package 경계로 나눠 보세요.",
      "Rails 프로젝트라면 config/routes.rb, resources/namespace/scope/root, ApplicationController, before_action, strong parameters, ActiveRecord associations/validations, ActiveJob, ActionMailer, ActionCable, integration tests 신호를 MVC와 framework component 경계로 나눠 보세요.",
      "Django 프로젝트라면 urls.py, path/re_path/include, views, settings, models, forms, middleware, admin, migrations, management commands, django.test 신호를 URLConf와 app component 경계로 나눠 보세요.",
      "Laravel 프로젝트라면 routes/web.php/api.php, Route facade, controllers, middleware, service providers, FormRequest/Validator, Eloquent models, migrations, Artisan commands, queues, mail/notification/broadcast, PHPUnit/Pest 신호를 HTTP entry와 framework component 경계로 나눠 보세요.",
      "Spring Boot 프로젝트라면 @SpringBootApplication, SpringApplication.run, controllers/request mappings, @Configuration/@Bean, @ConfigurationProperties, service/repository/entity, Actuator, MockMvc/WebTestClient/Testcontainers 신호를 application, HTTP entry, bean graph, data, observability, test slice 경계로 나눠 보세요.",
      "ASP.NET Core 프로젝트라면 WebApplication.CreateBuilder/CreateSlimBuilder, builder.Services, Minimal API MapGet/MapPost/MapGroup, MVC ControllerBase/[ApiController], middleware Use*, DI/options, auth/OpenAPI/health/SignalR, TestServer/WebApplicationFactory 신호를 builder, HTTP entry, middleware, service graph, verification 경계로 나눠 보세요.",
      "Flask 프로젝트라면 create_app/Flask(), Blueprint/register_blueprint, @app.route/@bp.route/add_url_rule, MethodView, request/jsonify/render_template/redirect/abort/url_for, session/g/current_app, app/request context, hooks, errorhandler, config, CLI, test_client/pytest 신호를 app factory, HTTP entry, context, template, error, verification 경계로 나눠 보세요.",
      "Symfony 프로젝트라면 composer.json, config/routes.yaml, config/services.yaml, src/Controller, src/Kernel.php, bin/console, templates, tests에서 Route attribute, FrameworkBundle, AbstractController, HttpFoundation request/response, ContainerBuilder/autowire, KernelEvents/EventSubscriber, AsCommand, KernelBrowser/WebTestCase 신호를 HTTP entry, DI graph, kernel/event lifecycle, verification 경계로 나눠 보세요.",
      "Gin 프로젝트라면 go.mod, cmd, internal, routes, handlers, middleware, tests에서 gin.Default/gin.New, Engine/RouterGroup, GET/POST/PUT/PATCH/DELETE/Any, Group/Use, gin.Context helpers, binding.Validator, NoRoute/NoMethod, Run/RunTLS/RunUnix, httptest/CreateTestContext/TestMode 신호를 HTTP entry, context contract, middleware, runtime, verification 경계로 나눠 보세요.",
      "Fiber 프로젝트라면 go.mod, cmd, internal, routes, handlers, middleware, tests에서 fiber.New, App/Router/Ctx, Get/Post/Put/Patch/Delete/All, Group/Route/Mount/Use, c.Params/c.Query/c.Bind/c.JSON, ErrorHandler/NewError, Listen/ListenTLS/ListenMutualTLS, app.Test/httptest 신호를 HTTP entry, context contract, middleware, runtime, verification 경계로 나눠 보세요.",
      "Chi 프로젝트라면 go.mod, cmd, internal, routes, handlers, middleware, tests에서 chi.NewRouter/NewMux, Router/Mux, Get/Post/Method/HandleFunc, Group/Route/Mount, Use/With, chi.URLParam/RouteContext, middleware.Logger/Recoverer/RequestID/Timeout, NotFound/MethodNotAllowed, httptest 신호를 HTTP entry, net/http middleware chain, route context, verification 경계로 나눠 보세요.",
      "Gorilla Mux 프로젝트라면 go.mod, cmd, internal, routes, handlers, middleware, tests에서 mux.NewRouter, Router/Route, HandleFunc/Methods/Path/PathPrefix/Host/Queries/Schemes, Subrouter, mux.Vars/SetURLVars, CORSMethodMiddleware, Walk, URL/URLHost/URLPath, httptest 신호를 HTTP entry, matcher graph, route context, reverse URL, verification 경계로 나눠 보세요.",
      "validator/zValidator, hc<typeof route>, testClient, app.fetch, serve 신호가 있으면 validation, type-safe client, test, adapter 경계를 별도로 확인하세요.",
      "setErrorHandler, setNotFoundHandler, validation error, reply.code 신호로 실패 응답 경로를 확인하세요.",
      "listen host/port/logger/bodyLimit/content-type parser와 inject/supertest 테스트 신호를 runtime과 verification 관점에서 분리하세요.",
      "이 리포트는 정적 readiness입니다. 실제 listener, route handler, plugin lifecycle, schema compiler, HTTP request behavior는 원본 프로젝트 테스트나 안전한 dev server에서 별도 확인하세요."
    ]
  };
}

type ServerFrameworkReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function serverFrameworkReadinessSourceFiles(walk: WalkResult): Promise<ServerFrameworkReadinessSourceFile[]> {
  const files: ServerFrameworkReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !serverFrameworkReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!serverFrameworkReadinessPathSignal(file.relPath) && !serverFrameworkReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function serverFrameworkReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return serverFrameworkReadinessPathSignal(filePath)
    || /^(package\.json|composer\.json|artisan|console|server\.[cm]?[jt]sx?|app\.[cm]?[jt]sx?|index\.[cm]?[jt]sx?|main\.[cm]?[jt]sx?|routes?\.[cm]?[jt]sx?|Program\.cs|Startup\.cs|appsettings(\.[A-Za-z0-9_-]+)?\.json)$/i.test(base)
    || /^(go\.mod|go\.sum|main\.go|server\.go|router\.go|routes\.go|handlers?\.go|middleware\.go)$/i.test(base)
    || /^(Gemfile|Rakefile|config\.ru|manage\.py|settings\.py|urls\.py|views\.py|models\.py|forms\.py|admin\.py|middleware\.py|wsgi\.py|app\.py|blueprints?\.py|conftest\.py)$/i.test(base)
    || /^(pom\.xml|build\.gradle|build\.gradle\.kts|settings\.gradle|settings\.gradle\.kts|application\.(properties|ya?ml))$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|py|rb|rake|ru|erb|php|blade\.php|go|java|kt|kts|gradle|properties|xml|cs|csproj|sln|html|json|md|mdx|rst|ya?ml|toml)$/i.test(filePath);
}

function serverFrameworkReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(server|servers|client|clients|imports|api|apis|routes?|router|routers|controllers?|handlers?|actions?|methods?|publications?|subscriptions?|collections?|policies?|blueprints?|helpers?|models?|entities|repositories?|components?|resources?|main|policies?|helpers?|services?|plugins?|middleware|middlewares|hooks?|decorators?|providers?|commands?|validators?|binding|bindings?|render|renders?|start|startup|program|fastify|express|koa|hono|nestjs|hapi|elysia|adonis|sails|meteor|rails|django|laravel|illuminate|spring|boot|actuator|webmvc|webflux|jpa|aspnet|aspnetcore|dotnet|mvc|razor|signalr|grpc|openapi|kestrel|testhost|webapplicationfactory|healthchecks|flask|blueprints?|jinja|click|wsgi|werkzeug|symfony|frameworkbundle|kernel|console|dependencyinjection|messenger|workflow|twig|gin|gonic|echo|labstack|fiber|gofiber|chi|go-chi|gorilla|gorilla-mux|httptest|ddp|webapp|accounts|blaze|templates?|jobs?|mailers?|channels?|notifications?|broadcasts?|listeners?|subscribers?|events?|views?|environments?|initializers?|migrate|migrations?|factories?|seeders?|schema|tasks?|spec|test|tests|urls?|forms?|admin|management|static|settings)(\/|\.|-|_|$)|(^|\/)\.meteor(\/|$)|package\.json$|composer\.json$|go\.mod$|go\.sum$|artisan$|bin\/console$|public\/index\.php$|config\/routes\.(ya?ml|php|xml)$|config\/services\.(ya?ml|php|xml)$|pyproject\.toml$|requirements\.txt$|pom\.xml$|build\.gradle(\.kts)?$|settings\.gradle(\.kts)?$|application\.(properties|ya?ml)$|appsettings(\.[A-Za-z0-9_-]+)?\.json$|.*\.csproj$|.*\.sln$|Program\.cs$|Startup\.cs$|Gemfile$|Rakefile$|config\.ru$|manage\.py$|settings\.py$|urls\.py$|wsgi\.py$|app\.py$/i.test(filePath);
}

function serverFrameworkReadinessContentSignal(text: string): boolean {
  return /(fastify\s*\(|Fastify\s*\(|FastifyInstance|FastifyPlugin|withTypeProvider|childLoggerFactory|express\s*\(|express\.Router|express\.static|express\.json|express\.urlencoded|app\.param|router\.param|supertest|new\s+Koa|koa-compose|ctx\.body|ctx\.status|ctx\.throw|ctx\.assert|ctx\.state|ctx\.cookies|app\.callback|app\.on\(['"]error|NestFactory|@Module\s*\(|@Controller\s*\(|@Injectable\s*\(|@UseGuards|@UsePipes|@UseInterceptors|@UseFilters|ValidationPipe|TestingModule|createTestingModule|WebSocketGateway|@Resolver|@MessagePattern|ClientProxy|new\s+Hono|Hapi\.server|server\.route|server\.register|server\.ext|server\.auth|server\.method|server\.decorate|server\.state|server\.cache|server\.validator|Joi\.|h\.response|Boom\.|server\.inject|new\s+Hapi|new\s+Elysia|Elysia\s*\(|\.group\s*\(|\.mount\s*\(|\.guard\s*\(|\.derive\s*\(|\.resolve\s*\(|\.model\s*\(|\.macro\s*\(|t\.Object|\.onBeforeHandle|\.onAfterHandle|\.onAfterResponse|\.ws\s*\(|\.handle\s*\(|treaty\s*\(|eden|Bun\.test|@adonisjs\/core|router\.(get|post|put|patch|delete|group|resource)|HttpContext|request\.validateUsing|ApplicationService|BaseCommand|testUtils|Japa|sails\.lift|sails\.load|sails\.config\.routes|config\/routes|sails\.router\.bind|registerAction|registerActionMiddleware|actions2|inputs\s*:|exits\s*:|fn\s*:|blueprints|policies|Waterline|sails\.request|res\.view|req\.param|Meteor\.(startup|methods|publish|subscribe|call|apply|settings|isClient|isServer|Error)|DDP\.connect|Mongo\.Collection|WebApp\.connectHandlers|check\s*\(|Match\.|Tracker\.autorun|Template\.[A-Za-z0-9_$]+|Blaze\.render|Package\.(describe|onUse)|api\.(use|addFiles)|Tinytest|meteor\s+(run|test|test-packages)|Rails\.application|Rails::Application|Rails::Engine|Rails::Railtie|ActionController::Base|ApplicationController|Rails\.application\.routes\.draw|resources\s+:|namespace\s+:|scope\s+|root\s+["']|before_action|params\.require|permit\s*\(|render\s+json:|redirect_to|ActiveRecord::Base|ApplicationRecord|has_many\s+:|belongs_to\s+:|validates\s+:|ActiveJob::Base|ActionMailer::Base|ActionCable|ActiveSupport::TestCase|ActionDispatch::IntegrationTest|rspec-rails|urlpatterns|\bpath\s*\(|re_path\s*\(|include\s*\(|reverse\s*\(|resolve\s*\(|INSTALLED_APPS|MIDDLEWARE|ROOT_URLCONF|DJANGO_SETTINGS_MODULE|settings\.configure|models\.Model|models\.(CharField|ForeignKey|ManyToManyField)|QuerySet|Manager|forms\.(Form|ModelForm)|MiddlewareMixin|process_request|process_response|admin\.site\.register|ModelAdmin|migrations\.Migration|BaseCommand|django-admin|manage\.py|django\.test|RequestFactory|override_settings|Laravel|Illuminate\\|Route::|routes\/(web|api)\.php|->(get|post|put|patch|delete|middleware|prefix|name|group|resource)\s*\(|extends\s+Controller|FormRequest|Validator::make|extends\s+Model|\$fillable|\$guarded|casts\s*\(|hasMany\s*\(|belongsTo\s*\(|Schema::(create|table)|artisan|Illuminate\\Console\\Command|ShouldQueue|Mailable|Notification|Broadcast|TestResponse|Pest|PHPUnit|SpringBootApplication|SpringApplication\.run|@RestController|@RequestMapping|@(Get|Post|Put|Patch|Delete)Mapping|RouterFunction|RouterFunctions|ServerResponse|@Configuration|@AutoConfiguration|@ConfigurationProperties|@Bean|@ConditionalOn|@Service|@Repository|@Component|@Entity|JpaRepository|CrudRepository|@Transactional|HealthIndicator|MeterRegistry|@SpringBootTest|@WebMvcTest|MockMvc|WebTestClient|TestRestTemplate|Testcontainers|WebApplication\.Create(Slim)?Builder|builder\.Services|app\.Map(Get|Post|Put|Patch|Delete)|MapGroup\s*\(|MapControllers\s*\(|AddControllers\s*\(|ControllerBase|ApiController|IActionResult|ActionResult<|IResult|Results\.|TypedResults\.|ProblemDetails|AddProblemDetails|UseRouting\s*\(|UseAuthentication\s*\(|UseAuthorization\s*\(|AddAuthentication\s*\(|AddAuthorization\s*\(|AddOpenApi\s*\(|MapOpenApi\s*\(|MapHub\s*\(|AddSignalR\s*\(|AddHealthChecks\s*\(|MapHealthChecks\s*\(|TestServer|WebApplicationFactory|UseTestServer|CreateClient\s*\(|Flask\s*\(|Blueprint\s*\(|add_url_rule|MethodView|request\.(args|form|json|get_json)|jsonify|render_template|redirect\s*\(|abort\s*\(|url_for|session\[|g\.|current_app|app_context|request_context|before_request|after_request|teardown_request|errorhandler|test_client|test_request_context|test_cli_runner|Symfony\\|FrameworkBundle|RouteCollection|#\[\s*Route\s*\(|AbstractController|RequestStack|JsonResponse|RedirectResponse|HttpKernel|KernelInterface|MicroKernelTrait|ContainerBuilder|services\.ya?ml|autowire|autoconfigure|CompilerPassInterface|EventSubscriberInterface|KernelEvents::|AsCommand|MessageHandlerInterface|AsMessageHandler|WorkflowInterface|TwigBundle|KernelBrowser|WebTestCase|KernelTestCase|CommandTester|ApplicationTester|github\.com\/gin-gonic\/gin|gin\.Default\s*\(|gin\.New\s*\(|gin\.Engine\b|gin\.RouterGroup\b|\*gin\.Context\b|c\.(Param|Query|DefaultQuery|PostForm|DefaultPostForm|GetHeader|GetRawData|ShouldBind|ShouldBindJSON|ShouldBindQuery|ShouldBindUri|JSON|String|HTML|Redirect|File|Status|Abort)|binding\.Validator|CreateTestContext|SetMode\s*\(\s*(?:gin\.)?TestMode|github\.com\/labstack\/echo|echo\.New\s*\(|echo\.Echo\b|echo\.Group\b|\*echo\.Context\b|c\.(QueryParam|FormValue|Bind|Validate|NoContent|Attachment|Inline|Stream)|NewHTTPError|HTTPError|Start(TLS|AutoTLS|Server)?\s*\(|github\.com\/gofiber\/fiber|fiber\.New\s*\(|fiber\.App\b|fiber\.Ctx\b|fiber\.Router\b|app\.(Get|Post|Put|Patch|Delete|All|Group|Route|Mount|Use|Static|Listen|Test)\s*\(|c\.(Params|Query|Get|Bind|Body|JSON|SendString|Render|Redirect|SendFile|Download|SendStream|SendStatus|Status|Next)\s*\(|fiber\.NewError|ErrorHandler|recover\.New|logger\.New|github\.com\/gorilla\/mux|mux\.NewRouter\s*\(|mux\.(Router|Route|RouteMatch|MiddlewareFunc|Vars|SetURLVars|CurrentRoute|CurrentRouter|CORSMethodMiddleware)\b|github\.com\/go-chi\/chi|chi\.NewRouter\s*\(|chi\.NewMux\s*\(|chi\.(Router|Routes|Middlewares|URLParam|URLParamFromCtx|RouteContext|NewRouteContext)\b|middleware\.(Logger|Recoverer|RequestID|RealIP|ClientIP|Timeout|Compress|Throttle|StripSlashes|RedirectSlashes|URLFormat|NoCache|Heartbeat|BasicAuth|RouteHeaders)|\.(Method|MethodFunc|Handle|HandleFunc|With)\s*\(|\.route\s*\(|\.get\s*\(|\.post\s*\(|\.put\s*\(|\.patch\s*\(|\.delete\s*\(|\.register\s*\(|fastify-plugin|@fastify\/autoload|addHook|decorateRequest|decorateReply|setErrorHandler|setNotFoundHandler|addSchema|setValidatorCompiler|setSerializerCompiler|\.listen\s*\(|\.inject\s*\(|basePath\s*\(|\.use\s*\(|c\.req|c\.json|validator\s*\(|zValidator|hc<|testClient|app\.fetch|serve\s*\()|"(fastify|express|koa|hono|@hono\/zod-validator|@hono\/node-server|@nestjs\/core|@nestjs\/common|@nestjs\/testing|@hapi\/hapi|elysia|@adonisjs\/core|sails|meteor|rails|Django|django|laravel\/framework|symfony\/(framework-bundle|routing|http-kernel|http-foundation|dependency-injection|console|form|validator|twig-bundle|security-bundle|messenger|workflow)|spring-boot-starter|spring-boot-starter-web|spring-boot-starter-webflux|spring-boot-starter-actuator|github\.com\/gin-gonic\/gin|github\.com\/labstack\/echo|github\.com\/gofiber\/fiber|github\.com\/gorilla\/mux|github\.com\/go-chi\/chi|Microsoft\.AspNetCore\.[^"]+)"/i.test(text);
}

function serverFrameworkReadinessSetups(sourceFiles: ServerFrameworkReadinessSourceFile[]): ServerFrameworkReadinessReport["serverSetups"] {
  const rows: ServerFrameworkReadinessReport["serverSetups"] = [];
  for (const source of sourceFiles) {
    const routeCount = countMatches(source.text, /\.(route|get|post|put|patch|delete|head|options|connect|trace|all|method|methods|methodfunc|handle|handlefunc|handler|handlerfunc|mount|path|pathprefix|host|headers|headersregexp|queries|schemes|matcherfunc|subrouter|name|walk)\s*\(|\b(server|srv)\.route\s*\(|router\.(get|post|put|patch|delete|group|resource|on)\s*\(|Route::(get|post|put|patch|delete|match|any|resource|apiResource|controller|middleware|prefix|name|domain|group)\s*\(|\$router->(get|post|put|patch|delete|match|any|resource|apiResource|group)\s*\(|sails\.router\.bind\s*\(|sails\.config\.routes|Meteor\.(methods|publish|subscribe)\s*\(|DDP\.connect\s*\(|WebApp\.connectHandlers\.use\s*\(|Rails\.application\.routes\.draw|resources\s+:|resource\s+:|namespace\s+:|scope\s+|root\s+["']|mount\s+ActionCable|urlpatterns\s*=|\bpath\s*\(|re_path\s*\(|include\s*\(|as_view\s*\(|^\s*(get|post|put|patch|delete)\s+["':]|["'](?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|ALL)\s+\/|@(Get|Post|Put|Patch|Delete|Head|Options|All|Controller|MessagePattern|Resolver|Query)\s*\(|@(RestController|Controller|RequestMapping|GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)\b|RouterFunction|RouterFunctions|ServerResponse|app\.Map(Get|Post|Put|Patch|Delete|Methods|Controllers)\s*\(|endpoints\.Map(Get|Post|Put|Patch|Delete|Controllers)\s*\(|\.MapGroup\s*\(|\[Route\s*\(|\[Http(Get|Post|Put|Patch|Delete|Head|Options)\b|#\[\s*Route\s*\(|new\s+Route\s*\(|new\s+RouteCollection\s*\(|RouteCollection\b|RoutingConfigurator\b|RouterInterface\b|routes\.(ya?ml|php|xml)|method\s*:|url\s*:|path\s*:|\.group\s*\(|\.mount\s*\(|\.guard\s*\(/gim);
    const schemaCount = countMatches(source.text, /schema\s*:|body\s*:|querystring\s*:|params\s*:|headers\s*:|response\s*:|cookie\s*:|validate\s*:|inputs\s*:|exits\s*:|Joi\.|addSchema|setValidatorCompiler|setSerializerCompiler|validator\s*\(|server\.validator\s*\(|zValidator|c\.req\.valid|t\.Object|t\.String|t\.Number|t\.Boolean|TypeBox|check\s*\(|Match\.|SimpleSchema|ValidatedMethod|params\.require|permit\s*\(|validates\s+:|attribute\s+:|create_table|models\.(CharField|TextField|IntegerField|DateTimeField|ForeignKey|ManyToManyField)|forms\.(Form|ModelForm|CharField|ChoiceField)|clean_[A-Za-z0-9_]+|def\s+clean\s*\(|is_valid\s*\(|Validator::make|\$request->validate\s*\(|function\s+rules\s*\(|validated\s*\(|FormRequest|Schema::(create|table)|\$fillable|\$guarded|\$casts|protected\s+function\s+casts\s*\(|@(Body|Param|Query|Headers|Args)\s*\(|@(RequestBody|PathVariable|RequestParam|Valid|Validated)\b|jakarta\.validation|javax\.validation|ResponseEntity|ProblemDetail|\[From(Body|Route|Query|Header|Form|Services)\b|\[Required\b|System\.ComponentModel\.DataAnnotations|Produces(ResponseType)?\s*\(|ProducesProblem|ValidationProblem|ProblemDetails|IResult|TypedResults|Results<|request\.(args|form|values|json|get_json|files)|jsonify|make_response|ValidationPipe|class-validator|Dto\b|DTO\b|\$request->(request|query|attributes|headers)|RequestStack|JsonResponse|RedirectResponse|Response::HTTP_|ValidatorInterface|Constraints\\|Assert\\|AbstractType\b|FormType\b|buildForm\s*\(|configureOptions\s*\(|ShouldBind|Bind(JSON|Query|Uri|Header|XML|YAML|TOML|Plain)?\s*\(|binding\.Validator|validator\.Validate|json\.NewDecoder\s*\(\s*r\.Body\s*\)|json\.NewEncoder\s*\(\s*w\s*\)\.Encode|io\.ReadAll\s*\(\s*r\.Body\s*\)|r\.URL\.Query\s*\(|chi\.(URLParam|URLParamFromCtx|RouteContext)\s*\(|mux\.(Vars|SetURLVars|CurrentRoute|CurrentRouter)\s*\(|w\.Header\(\)\.Set|r\.Header\.Get|w\.Write\s*\(|w\.WriteHeader\s*\(|http\.(Error|Redirect)\s*\(|c\.(Param|Params|Query|DefaultQuery|QueryParam|PostForm|DefaultPostForm|FormValue|Get|GetHeader|GetRawData|Bind|Body|Validate|Request)\s*\(|c\.(JSON|String|SendString|HTML|Render|Redirect|File|SendFile|Attachment|Inline|Download|NoContent|Stream|SendStream|Status|SendStatus)\s*\(/gi);
    const pluginCount = countMatches(source.text, /\.register\s*\(|server\.register\s*\(|fastify-plugin|@fastify\/autoload|autoload|plugin\s*:|plugins\s*:|\.use\s*\(|\.with\s*\(|chi\.Chain\s*\(|mux\.(CORSMethodMiddleware|MiddlewareFunc)|middleware\.|\.middleware\s*\(|\.mount\s*\(|\.group\s*\(|\.mount\s*\(|\.guard\s*\(|middleware|router\.named|server\.use|policies|blueprints|helpers|services|models|Waterline|Package\.(describe|onUse)|api\.(use|addFiles)|\.meteor\/packages|meteor-base|accounts-|ddp|webapp|mongo|Rails::Engine|Rails::Railtie|ActiveSupport\.on_load|config\.|mount\s+|INSTALLED_APPS|MIDDLEWARE|admin\.site\.register|ModelAdmin|AppConfig|ServiceProvider|register\s*\(\)|boot\s*\(\)|\$this->app->(bind|singleton|scoped|make)\s*\(|Kernel::class|Blueprint\s*\(|register_blueprint|init_app\s*\(|@Module\s*\(|imports\s*:|providers\s*:|controllers\s*:|exports\s*:|MiddlewareConsumer|consumer\.apply|forRoutes\s*\(|@(Configuration|AutoConfiguration|EnableConfigurationProperties|ConfigurationProperties|Bean|ConditionalOn|Service|Repository|Component|SpringBootApplication)\b|ApplicationContext|@Autowired|builder\.Services|IServiceCollection|Add(Controllers|RazorPages|Mvc|OpenApi|Authentication|Authorization|Cors|SignalR|HealthChecks|HttpClient|HostedService|ProblemDetails|EndpointsApiExplorer)|Add(Singleton|Scoped|Transient)\s*\(|Configure<|Use(Routing|Authentication|Authorization|Cors|StaticFiles|HttpsRedirection|ExceptionHandler|Endpoints)\s*\(|FrameworkBundle|ContainerBuilder|DependencyInjection|services\.ya?ml|services\.php|autowire|autoconfigure|CompilerPassInterface|EventSubscriberInterface|SecurityBundle|TwigBundle|Messenger|Workflow/gi);
    const hookCount = countMatches(source.text, /addHook|server\.ext\s*\(|sails\.hooks|api\/hooks|registerActionMiddleware|hook:|initialize\s*:\s*function|configure\s*:\s*function|routes\s*:\s*\{|Meteor\.startup|Tracker\.autorun|Template\.[A-Za-z0-9_$]+\.(onCreated|onRendered|onDestroyed|events|helpers)|before_action|after_action|around_action|before_validation|after_commit|ActiveSupport\.on_load|initializer\s+["']|MiddlewareMixin|process_request|process_response|process_view|process_exception|def\s+__call__\s*\(\s*self\s*,\s*request|ready\s*\(self\)|handle\s*\(\s*\$request|terminate\s*\(\s*\$request|boot\s*\(\)|register\s*\(\)|Event::listen|Listener|ShouldQueue|before_request|after_request|teardown_request|before_app_request|after_app_request|teardown_app_request|app_context|request_context|onRequest|onParse|onTransform|onBeforeHandle|onAfterHandle|onAfterResponse|onPreAuth|onPostAuth|onPreHandler|onPreResponse|preParsing|preValidation|preHandler|preSerialization|onSend|onResponse|onError|onClose|onListen|onRoute|OnModuleInit|OnApplicationBootstrap|OnModuleDestroy|BeforeApplicationShutdown|OnApplicationShutdown|ApplicationRunner|CommandLineRunner|@EventListener|ApplicationListener|@Scheduled|@PostConstruct|@PreDestroy|ConfigureServices\s*\(|Configure\s*\(\s*IApplicationBuilder|UseMiddleware<|RequestDelegate|BackgroundService|IHostedService|KernelEvents::|EventSubscriberInterface|EventDispatcherInterface|getSubscribedEvents\s*\(|HttpKernel\b|MicroKernelTrait|configureRoutes\s*\(|configureContainer\s*\(/gi);
    const decoratorCount = countMatches(source.text, /decorate\s*\(|\.decorate\s*\(|\.state\s*\(|\.derive\s*\(|\.resolve\s*\(|\.model\s*\(|\.macro\s*\(|decorateRequest|decorateReply|hasDecorator|hasRequestDecorator|hasReplyDecorator|@(Module|Controller|Injectable|Inject|Get|Post|Put|Patch|Delete|UseGuards|UsePipes|UseInterceptors|UseFilters|Catch|Resolver|WebSocketGateway|MessagePattern|SpringBootApplication|RestController|RequestMapping|GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|PathVariable|RequestParam|RequestBody|Configuration|AutoConfiguration|ConfigurationProperties|Bean|ConditionalOn|Service|Repository|Component|Entity|Transactional|SpringBootTest|WebMvcTest|AutoConfigureMockMvc)\s*\(|\[(ApiController|Route|HttpGet|HttpPost|HttpPut|HttpPatch|HttpDelete|FromBody|FromRoute|FromQuery|Authorize|AllowAnonymous|Produces|ProducesResponseType)\b|#\[\s*(Route|AsCommand|AsMessageHandler|IsGranted)\b/gi);
    const errorCount = countMatches(source.text, /setErrorHandler|setNotFoundHandler|frameworkErrors|validationError|reply\.code|statusCode|notFound|onError|Boom\.|HTTPException|HttpException|NewHTTPError|HTTPError|DefaultHTTPErrorHandler|fiber\.NewError|NewError|DefaultErrorHandler|ErrorHandler|NotFoundHandler|StatusNotFound|StatusMethodNotAllowed|MethodNotAllowedHandler|\.NotFound\s*\(|\.MethodNotAllowed\s*\(|http\.(Error|NotFound)\s*\(|Meteor\.Error|rescue_from|ActiveRecord::RecordNotFound|render\s+status:|head\s+:[a-z_]+|Http404|PermissionDenied|ValidationError|ImproperlyConfigured|ValidationException|ModelNotFoundException|NotFoundHttpException|abort\s*\(|abort_if\s*\(|abort_unless\s*\(|ExceptionFilter|@Catch|UseFilters|BadRequestException|NotFoundException|badRequest|serverError|forbidden|errorhandler|register_error_handler|werkzeug\.exceptions|c\.status|status\s*\(\s*\d{3}|@ExceptionHandler|@ControllerAdvice|ResponseStatusException|@ResponseStatus|ProblemDetail|ProblemDetails|UseExceptionHandler|Results\.(Problem|NotFound|BadRequest|ValidationProblem)|TypedResults\.(Problem|NotFound|BadRequest)|StatusCodes\.Status[0-9]+|ValidationProblemDetails|NotFoundHttpException|AccessDeniedException|ExceptionEvent|Response::HTTP_|new\s+JsonResponse\s*\([^)]*,\s*Response::HTTP_|NoRoute\s*\(|NoMethod\s*\(|SendStatus\s*\(|fiber\.Status|Abort(WithStatus(JSON)?|WithError)?\s*\(/gi);
    const listenCount = countMatches(source.text, /\.listen\s*\(|server\.start\s*\(|sails\.lift\s*\(|sails\.load\s*\(|meteor\s+run|Meteor\.settings|WebApp\.connectHandlers|__meteor_runtime_config__|rails\s+server|bin\/rails\s+s|Puma|config\.hosts|config\.puma|django-admin\s+runserver|manage\.py\s+runserver|WSGI_APPLICATION|ASGI_APPLICATION|wsgi\.py|asgi\.py|flask\s+run|FLASK_APP|app\.run\s*\(|php artisan serve|artisan\s+serve|public\/index\.php|bootstrap\/app\.php|bin\/console|KernelInterface|extends\s+Kernel\b|HttpKernel\b|Runtime\\Runner|Symfony\\Runtime|Illuminate\\Foundation\\Application|SpringApplication\.run|@SpringBootApplication|java\s+-jar|server\.port|application\.(properties|ya?ml)|embedded\s+(server|servlet|tomcat|jetty|netty)|WebApplication\.Create(Slim)?Builder|WebApplicationOptions|app\.Run\s*\(|UseKestrel|Kestrel|ASPNETCORE_URLS|launchSettings\.json|appsettings(\.[A-Za-z0-9_-]+)?\.json|host\s*:|port\s*:|logger\s*:|trustProxy|bodyLimit|addContentTypeParser|app\.fetch|\.fetch\s*\(|\.handle\s*\(|serve\s*\(|Bun\.serve|NestFactory|enableCors|setGlobalPrefix|useGlobal(Pipes|Guards|Interceptors|Filters)|createMicroservice|connectMicroservice|startAllMicroservices|\.Run(TLS|Unix)?\s*\(|http\.ListenAndServe\s*\(|SetTrustedProxies\s*\(|\.Start(TLS|AutoTLS|Server)?\s*\(|\.Listen(TLS|MutualTLS)?\s*\(/gi);
    const testCount = countMatches(source.text, /\.inject\s*\(|server\.inject\s*\(|light-my-request|supertest|tap|vitest|Bun\.test|bun:test|Lab\.script|@hapi\/lab|Code\.expect|sails\.request\s*\(|Tinytest|meteor\s+test|meteor\s+test-packages|ActionDispatch::IntegrationTest|ActiveSupport::TestCase|rspec-rails|RSpec\.describe|assert_response|fixtures\s+:|django\.test|TestCase|TransactionTestCase|SimpleTestCase|Client\s*\(|RequestFactory|assertTemplateUsed|assertRedirects|override_settings|pytest\.mark\.django_db|pytest|test_client\s*\(|test_request_context\s*\(|test_cli_runner\s*\(|FlaskClient|FlaskCliRunner|client\.(get|post|put|patch|delete)\s*\(|runner\.invoke\s*\(|Illuminate\\Foundation\\Testing|TestResponse|withoutExceptionHandling|assertJson|assertStatus|getJson\s*\(|postJson\s*\(|Pest\\|pestphp|PHPUnit\\Framework\\TestCase|@SpringBootTest|@WebMvcTest|@AutoConfigureMockMvc|MockMvc|WebTestClient|TestRestTemplate|@DynamicPropertySource|Testcontainers|TestServer|WebApplicationFactory|Microsoft\.AspNetCore\.TestHost|UseTestServer|ConfigureTestServices|CreateClient\s*\(|HttpClient|Microsoft\.AspNetCore\.Mvc\.Testing|FactAttribute|\[Fact\]|\[Theory\]|xunit|KernelBrowser|HttpKernelBrowser|WebTestCase|KernelTestCase|CommandTester|ApplicationTester|assertResponse|assertSelector|static::createClient\s*\(|bootKernel\s*\(|request\(|testClient|app\.request|app\.fetch|app\.handle|createTestingModule|TestingModule|getHttpServer|httptest|CreateTestContext|SetMode\s*\(\s*TestMode|\.Test\s*\(|go\s+test/gi);
    const hasSetupSignal = routeCount + schemaCount + pluginCount + hookCount + decoratorCount + errorCount + listenCount + testCount > 0;
    if (!hasSetupSignal) continue;
    const framework = serverFrameworkReadinessFramework(source);
    const readiness = framework === "koa"
      ? pluginCount > 0 && listenCount > 0 ? "ready" : "partial"
      : framework === "nestjs"
        ? routeCount > 0 && pluginCount > 0 && (listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "hapi"
        ? routeCount > 0 && (pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "elysia"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "adonisjs"
        ? routeCount > 0 && (pluginCount > 0 || decoratorCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "sails"
        ? routeCount > 0 && (pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "meteor"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "rails"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "django"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "laravel"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "spring"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "aspnet-core"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "flask"
        ? routeCount > 0 && (pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "symfony"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || hookCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "gin"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "echo"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "fiber"
        ? routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || errorCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "chi"
        ? routeCount > 0 && (pluginCount > 0 || schemaCount > 0 || errorCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : framework === "gorilla-mux"
        ? routeCount > 0 && (pluginCount > 0 || schemaCount > 0 || errorCount > 0 || listenCount > 0 || testCount > 0) ? "ready" : "partial"
      : routeCount > 0 && (schemaCount > 0 || pluginCount > 0 || listenCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing";
    rows.push({
      filePath: source.filePath,
      framework,
      routeCount,
      schemaCount,
      pluginCount,
      hookCount,
      decoratorCount,
      errorCount,
      listenCount,
      testCount,
      readiness,
      evidence: `${source.filePath} contains routes ${routeCount}, schemas ${schemaCount}, plugins ${pluginCount}, hooks ${hookCount}, decorators ${decoratorCount}, errors ${errorCount}, runtime ${listenCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function serverFrameworkReadinessFramework(source: ServerFrameworkReadinessSourceFile): ServerFrameworkReadinessReport["serverSetups"][number]["framework"] {
  if (/github\.com\/gorilla\/mux|mux\.NewRouter\s*\(|mux\.(Vars|SetURLVars|CurrentRoute|CurrentRouter|CORSMethodMiddleware)\s*\(|mux\.(Router|Route|RouteMatch|MiddlewareFunc)\b/i.test(source.text) || /(^|\/)(go\.mod|main\.go|server\.go|router\.go|routes\.go|handlers?\.go|middleware\.go|gorilla|gorilla-mux)(\/|$)/i.test(source.filePath) && /github\.com\/gorilla\/mux|mux\./i.test(source.text)) return "gorilla-mux";
  if (/github\.com\/go-chi\/chi(?:\/v\d+)?|chi\.NewRouter\s*\(|chi\.NewMux\s*\(|chi\.Router\b|chi\.Mux\b|chi\.URLParam\s*\(/i.test(source.text) || /(^|\/)(go\.mod|main\.go|server\.go|router\.go|routes\.go|handlers?\.go|middleware\.go|chi)(\/|$)/i.test(source.filePath) && /go-chi\/chi|chi\./i.test(source.text)) return "chi";
  if (/github\.com\/gofiber\/fiber|fiber\.New\s*\(|fiber\.App\b|fiber\.Ctx\b|fiber\.Router\b|fiber\.NewError\s*\(|DefaultErrorHandler|app\.Test\s*\(/i.test(source.text) || /(^|\/)(go\.mod|main\.go|server\.go|router\.go|routes\.go|handlers?\.go|middleware\.go|binding|render|fiber|gofiber)(\/|$)/i.test(source.filePath) && /gofiber\/fiber|fiber\.|fiber\b|app\.(Get|Post|Put|Patch|Delete|All|Group|Route|Mount|Use|Static|Listen|Test)|fiber\.NewError/i.test(source.text)) return "fiber";
  if (/github\.com\/labstack\/echo|echo\.New\s*\(|echo\.Echo\b|echo\.Group\b|\*echo\.Context\b|NewHTTPError\s*\(|DefaultHTTPErrorHandler|StartAutoTLS\s*\(/i.test(source.text) || /(^|\/)(go\.mod|main\.go|server\.go|router\.go|routes\.go|handlers?\.go|middleware\.go|binding|render|echo|labstack)(\/|$)/i.test(source.filePath) && /labstack\/echo|echo\.|Echo\b|Group\b|NewContext|NewHTTPError/i.test(source.text)) return "echo";
  if (/github\.com\/gin-gonic\/gin|gin\.Default\s*\(|gin\.New\s*\(|gin\.Engine\b|gin\.RouterGroup\b|\*gin\.Context\b|gin\.Context\b|CreateTestContext\s*\(|SetMode\s*\(\s*gin\.TestMode/i.test(source.text) || /(^|\/)(go\.mod|main\.go|server\.go|router\.go|routes\.go|handlers?\.go|middleware\.go|binding|render|gin)(\/|$)/i.test(source.filePath) && /gin-gonic|gin\.|gin\b|RouterGroup|CreateTestContext/i.test(source.text)) return "gin";
  if (/symfony\/framework-bundle|Symfony\\Bundle\\FrameworkBundle|FrameworkBundle|#\[\s*Route\s*\(|AbstractController|MicroKernelTrait|KernelInterface|ContainerBuilder|WebTestCase/i.test(source.text) || /(^|\/)(bin\/console|public\/index\.php|config\/routes\.(ya?ml|php|xml)|config\/services\.(ya?ml|php|xml)|config\/packages|src\/Controller|src\/Kernel\.php|templates|tests)(\/|$)/i.test(source.filePath) && /Symfony|symfony|FrameworkBundle|RouteCollection|#\[\s*Route/i.test(source.text)) return "symfony";
  if (/NestFactory|@nestjs\/|@Module\s*\(|@Controller\s*\(|@Injectable\s*\(/i.test(source.text)) return "nestjs";
  if (/fastify|Fastify|@fastify\/autoload|fastify-plugin/i.test(source.text)) return "fastify";
  if (/"sails"|from ["']sails["']|require\(["']sails["']\)|sails\.lift|sails\.load|sails\.config\.routes|sails\.router\.bind|config\/routes|actions2/i.test(source.text)) return "sails";
  if (/"meteor"|Meteor\.(startup|methods|publish|subscribe|call|apply)|DDP\.connect|Mongo\.Collection|WebApp\.connectHandlers|Package\.(describe|onUse)|\.meteor\/packages/i.test(source.text) || /(^|\/)\.meteor(\/|$)/i.test(source.filePath)) return "meteor";
  if (/"rails"|Rails\.application|Rails::Application|Rails::Engine|Rails::Railtie|ActionController::Base|ApplicationController|ActiveRecord::Base|ApplicationRecord|ActiveJob::Base|ActionMailer::Base|ActionCable/i.test(source.text) || /(^|\/)(Gemfile|config\/routes\.rb|app\/controllers|app\/models|app\/jobs|app\/mailers|app\/channels|db\/migrate|test\/(controllers|models|integration|system|fixtures)|spec\/(controllers|models|requests|features|system))(\/|$)/i.test(source.filePath)) return "rails";
  if (/"Django"|["']django["']|django-admin|DJANGO_SETTINGS_MODULE|settings\.configure|urlpatterns|\bpath\s*\(|re_path\s*\(|models\.Model|forms\.(Form|ModelForm)|MiddlewareMixin|admin\.site\.register|migrations\.Migration|from django|import django/i.test(source.text) || /(^|\/)(manage\.py|settings\.py|urls\.py|migrations|management)(\/|$)/i.test(source.filePath)) return "django";
  if (/"laravel\/framework"|Laravel|Illuminate\\|Route::|routes\/(web|api)\.php|extends\s+Controller|FormRequest|extends\s+Model|Schema::(create|table)|artisan/i.test(source.text) || /(^|\/)(composer\.json|artisan|routes\/(web|api)\.php|app\/Http|app\/Models|app\/Providers|app\/Console|app\/Jobs|app\/Mail|app\/Notifications|database\/migrations|database\/factories|database\/seeders|bootstrap\/app\.php)(\/|$)/i.test(source.filePath)) return "laravel";
  if (/SpringBootApplication|SpringApplication\.run|spring-boot-starter|org\.springframework\.boot|@RestController|@(Get|Post|Put|Patch|Delete)Mapping|RouterFunction|@ConfigurationProperties|HealthIndicator|MeterRegistry|@SpringBootTest/i.test(source.text) || /(^|\/)(pom\.xml|build\.gradle(\.kts)?|settings\.gradle(\.kts)?|src\/main\/java|src\/main\/kotlin|src\/test\/java|src\/test\/kotlin|application\.(properties|ya?ml))(\/|$)/i.test(source.filePath)) return "spring";
  if (/Microsoft\.AspNetCore|WebApplication\.Create(Slim)?Builder|builder\.Services|app\.Map(Get|Post|Put|Patch|Delete|Controllers)|\.MapGroup\s*\(|ControllerBase|\[ApiController\]|\[Route\s*\(|AddControllers\s*\(|TestServer|WebApplicationFactory/i.test(source.text) || /(^|\/)(Program\.cs|Startup\.cs|.*\.csproj|appsettings(\.[A-Za-z0-9_-]+)?\.json|Controllers?|Pages?|Hubs?|Middleware|Properties\/launchSettings\.json)(\/|$)/i.test(source.filePath)) return "aspnet-core";
  if (/(^|\s)from\s+flask\s+import|import\s+flask|Flask\s*\(|Blueprint\s*\(|@(?:app|bp|blueprint)\.(route|get|post|put|patch|delete)|add_url_rule|MethodView|test_client\s*\(|flask\s+run/i.test(source.text) || /(^|\/)(requirements\.txt|pyproject\.toml|app\.py|wsgi\.py|blueprints?\.py|templates|static)(\/|$)/i.test(source.filePath) && /\bflask\b/i.test(source.text)) return "flask";
  if (/express|express\s*\(/i.test(source.text)) return "express";
  if (/koa|new\s+Koa/i.test(source.text)) return "koa";
  if (/hono|new\s+Hono/i.test(source.text)) return "hono";
  if (/Hapi\.server|@hapi\/hapi|server\.route\s*\(|server\.register\s*\(|server\.ext\s*\(/i.test(source.text)) return "hapi";
  if (/new\s+Elysia|from ["']elysia["']|require\(["']elysia["']\)|\belysia\b/i.test(source.text)) return "elysia";
  if (/@adonisjs\/core|router\.(get|post|put|patch|delete|group|resource)|HttpContext|ApplicationService|BaseCommand/i.test(source.text)) return "adonisjs";
  if (/server|router|route|middleware/i.test(source.filePath) || /HTTP server|route handler/i.test(source.text)) return "custom";
  return "unknown";
}

function serverFrameworkReadinessRouteSignals(sourceFiles: ServerFrameworkReadinessSourceFile[]): ServerFrameworkReadinessReport["routeSignals"] {
  const specs: Array<{ signal: ServerFrameworkReadinessReport["routeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "get", pattern: /\.get\s*\(|Route::get\s*\(|\$router->get\s*\(|@Get\s*\(|@GetMapping\b|\.\s*MapGet\s*\(|\[HttpGet\b|route\s*\(\s*GET\s*\(|methods?\s*:\s*\[[^\]]*["']GET["']|method\s*:\s*["']GET["']|^\s*get\s+["':]|["']GET\s+\//im, evidence: "GET route evidence was detected." },
    { signal: "post", pattern: /\.post\s*\(|Route::post\s*\(|\$router->post\s*\(|@Post\s*\(|@PostMapping\b|\.\s*MapPost\s*\(|\[HttpPost\b|route\s*\(\s*POST\s*\(|methods?\s*:\s*\[[^\]]*["']POST["']|method\s*:\s*["']POST["']|^\s*post\s+["':]|["']POST\s+\//im, evidence: "POST route evidence was detected." },
    { signal: "put", pattern: /\.put\s*\(|Route::put\s*\(|\$router->put\s*\(|@Put\s*\(|@PutMapping\b|\.\s*MapPut\s*\(|\[HttpPut\b|route\s*\(\s*PUT\s*\(|methods?\s*:\s*\[[^\]]*["']PUT["']|method\s*:\s*["']PUT["']|^\s*put\s+["':]|["']PUT\s+\//im, evidence: "PUT route evidence was detected." },
    { signal: "patch", pattern: /\.patch\s*\(|Route::patch\s*\(|\$router->patch\s*\(|@Patch\s*\(|@PatchMapping\b|\.\s*MapPatch\s*\(|\[HttpPatch\b|route\s*\(\s*PATCH\s*\(|methods?\s*:\s*\[[^\]]*["']PATCH["']|method\s*:\s*["']PATCH["']|^\s*patch\s+["':]|["']PATCH\s+\//im, evidence: "PATCH route evidence was detected." },
    { signal: "delete", pattern: /\.delete\s*\(|Route::delete\s*\(|\$router->delete\s*\(|@Delete\s*\(|@DeleteMapping\b|\.\s*MapDelete\s*\(|\[HttpDelete\b|route\s*\(\s*DELETE\s*\(|methods?\s*:\s*\[[^\]]*["']DELETE["']|method\s*:\s*["']DELETE["']|^\s*delete\s+["':]|["']DELETE\s+\//im, evidence: "DELETE route evidence was detected." },
    { signal: "route", pattern: /\.route\s*\(|add_url_rule\s*\(|server\.route\s*\(|router\.(get|post|put|patch|delete|group|resource|on)\s*\(|Route::(get|post|put|patch|delete|match|any|resource|apiResource|controller|group)\s*\(|\$router->(get|post|put|patch|delete|match|any|resource|apiResource|group)\s*\(|sails\.router\.bind\s*\(|sails\.config\.routes|Meteor\.(methods|publish|subscribe)\s*\(|DDP\.connect\s*\(|WebApp\.connectHandlers\.use\s*\(|Rails\.application\.routes\.draw|resources\s+:|resource\s+:|namespace\s+:|scope\s+|root\s+["']|mount\s+ActionCable|urlpatterns\s*=|\bpath\s*\(|re_path\s*\(|include\s*\(|as_view\s*\(|["'](?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|ALL)\s+\/|@(?:RestController|Controller|RequestMapping|GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)\b|RouterFunction|RouterFunctions|ServerResponse|\.\s*Map(Get|Post|Put|Patch|Delete|Methods|Controllers)\s*\(|\.MapGroup\s*\(|\[Route\s*\(|\[Http(Get|Post|Put|Patch|Delete|Head|Options)\b|#\[\s*Route\s*\(|new\s+RouteCollection\s*\(|RouterInterface\b|\.(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|CONNECT|TRACE|Any|Method|MethodFunc|Handle|HandleFunc|Route|Mount)\s*\(|gin\.RouterGroup\b|@MessagePattern\s*\(|@Resolver\s*\(|method\s*:|url\s*:/i, evidence: "route object evidence was detected." },
    { signal: "all", pattern: /\.all\s*\(|@All\s*\(|method\s*:\s*['"]\*/i, evidence: "catch-all route evidence was detected." },
    { signal: "params", pattern: /\/:[A-Za-z0-9_]+|\/\{[A-Za-z0-9_]+(?::[^}]+)?}|{[A-Za-z0-9_]+}|<(?:int|slug|str|uuid|path):[A-Za-z0-9_]+>|params\s*:|request\.params|params\.require|\$request->route\s*\(|@Param\s*\(|@PathVariable\b|\[FromRoute\b|chi\.(URLParam|URLParamFromCtx)\s*\(/i, evidence: "path params evidence was detected." },
    { signal: "prefix", pattern: /prefix\s*:|url_prefix\s*=|routePrefix|routes\s*:\s*\{[^}]*prefix|basePath|setGlobalPrefix\s*\(|@(Controller|RequestMapping|RestController)\s*\(\s*(?:path\s*=\s*)?["'][^"']+["']|\[Route\s*\(\s*["'][^"']+["']|#\[\s*Route\s*\(\s*["'][^"']+["']|\.MapGroup\s*\(\s*["'][^"']+["']|\.Group\s*\(\s*["'][^"']+["']|namespace\s+:|scope\s+["':]|Route::prefix\s*\(|->prefix\s*\(|\.prefix\s*\(|\.(use|route)\s*\(\s*["'][^"']+["']\s*,/i, evidence: "route prefix evidence was detected." }
  ];
  return serverFrameworkReadinessSignalFromSpecs(sourceFiles, specs, "route", "signal");
}

function serverFrameworkReadinessSchemaSignals(sourceFiles: ServerFrameworkReadinessSourceFile[]): ServerFrameworkReadinessReport["schemaSignals"] {
  const specs: Array<{ signal: ServerFrameworkReadinessReport["schemaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "body", pattern: /body\s*:|payload\s*:|inputs\s*:|req\.body|request\.payload|request\.input|request\.only|request\.POST|request\.body|request\.(json|get_json|form|files)|params\.require|permit\s*\(|\$request->(input|only|all|validated|validate|request|getPayload)\s*\(|\$request->request(?:\s*\(|->)|@(Body|RequestBody)\b|\[FromBody\b|validator\s*\(\s*["']json["']|zValidator\s*\(\s*["']json["']|c\.req\.valid\s*\(\s*["']json["']|json\.NewDecoder\s*\(\s*r\.Body\s*\)|io\.ReadAll\s*\(\s*r\.Body\s*\)|ShouldBind(JSON|BodyWith|With)?\s*\(|Bind(JSON|XML|YAML|TOML|Plain)?\s*\(|c\.Bind\s*\(|c\.Body\s*\(|c\.Request\s*\(\)\.Body|c\.GetRawData\s*\(|c\.PostForm/i, evidence: "request body schema evidence was detected." },
    { signal: "querystring", pattern: /querystring\s*:|query\s*:|req\.query|request\.query|request\.(args|values)|r\.URL\.Query\s*\(|\$request->query(?:\s*\(|->)|@(Query|RequestParam)\s*\(|\[FromQuery\b|validator\s*\(\s*["']query["']|zValidator\s*\(\s*["']query["']|c\.req\.query\s*\(|c\.(Query|Queries|DefaultQuery|GetQuery|QueryArray|QueryMap|QueryParam)\s*\(|ShouldBindQuery\s*\(/i, evidence: "query schema evidence was detected." },
    { signal: "params", pattern: /params\s*:|params\.|req\.param\s*\(|req\.params|request\.params|\$request->(route|attributes)\s*\(|\{[A-Za-z_][A-Za-z0-9_]*(?::[^}]+)?}|@(Param|PathVariable)\s*\(|\[FromRoute\b|validator\s*\(\s*["']param["']|zValidator\s*\(\s*["']param["']|chi\.(URLParam|URLParamFromCtx|RouteContext)\s*\(|c\.req\.param\s*\(|c\.(Param|Params|AddParam)\s*\(|ShouldBindUri\s*\(/i, evidence: "params schema evidence was detected." },
    { signal: "headers", pattern: /headers\s*:|req\.headers|request\.headers|r\.Header\.Get|w\.Header\(\)\.Set|\$request->headers(?:\s*\(|->)|@Headers\s*\(|@Header\s*\(|\[FromHeader\b|validator\s*\(\s*["']header["']|zValidator\s*\(\s*["']header["']|c\.req\.header\s*\(|c\.Request\s*\(\)\.Header(?:\.Get)?|c\.(Get|GetHeader)\s*\(|ShouldBindHeader\s*\(/i, evidence: "headers schema evidence was detected." },
    { signal: "response", pattern: /response\s*:|exits\s*:|statusCode\s*:|render\s+json:|JsonResponse|RedirectResponse|HttpResponse|TemplateResponse|new\s+Response\s*\(|Response::HTTP_|head\s+:[a-z_]+|response\(\)->json|->json\s*\(|redirect\(\)->|view\s*\(|jsonify|make_response|ResponseEntity|ServerResponse|ProblemDetail|ProblemDetails|IResult|TypedResults|Results<|Results\.|ActionResult|IActionResult|Produces(ResponseType)?\s*\(|@ResponseBody|@HttpCode\s*\(|@Header\s*\(|json\.NewEncoder\s*\(\s*w\s*\)\.Encode|w\.Write\s*\(|w\.WriteHeader\s*\(|http\.(Error|Redirect)\s*\(|fiber\.Map|c\.(JSON|IndentedJSON|SecureJSON|PureJSON|String|SendString|HTML|Render|Redirect|File|SendFile|Attachment|Inline|Download|NoContent|Stream|SendStream|Blob|Data|Status|SendStatus)\s*\(/i, evidence: "response schema evidence was detected." },
    { signal: "add-schema", pattern: /addSchema|getSchema|getSchemas/i, evidence: "shared schema registry evidence was detected." },
    { signal: "validator-compiler", pattern: /setValidatorCompiler|validatorCompiler|schemaController|server\.validator\s*\(|Joi\.|request\.validateUsing|vine\.|check\s*\(|Match\.|validates\s+:|forms\.(Form|ModelForm)|clean_[A-Za-z0-9_]+|def\s+clean\s*\(|is_valid\s*\(|Validator::make|FormRequest|function\s+rules\s*\(|\$request->validate\s*\(|@Valid\b|@Validated\b|jakarta\.validation|javax\.validation|\[Required\b|System\.ComponentModel\.DataAnnotations|ValidationProblem|ValidationProblemDetails|ValidatorInterface|Symfony\\Component\\Validator|Constraints\\|Assert\\|AbstractType\b|FormType\b|buildForm\s*\(|configureOptions\s*\(|binding\.Validator|go-playground\/validator|validator\.Validate|StructValidator|Validate\(out any\)|binding\s*:\s*["']|c\.Validate\s*\(|Validator\s+interface/i, evidence: "validator compiler evidence was detected." },
    { signal: "serializer-compiler", pattern: /setSerializerCompiler|serializerCompiler|compileSerializationSchema/i, evidence: "serializer compiler evidence was detected." }
  ];
  return serverFrameworkReadinessSignalFromSpecs(sourceFiles, specs, "schema", "signal");
}

function serverFrameworkReadinessPluginSignals(sourceFiles: ServerFrameworkReadinessSourceFile[]): ServerFrameworkReadinessReport["pluginSignals"] {
  const specs: Array<{ signal: ServerFrameworkReadinessReport["pluginSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "register", pattern: /\.register\s*\(|server\.register\s*\(|sails\.registerAction\s*\(|registerActions\s*:|Package\.(describe|onUse)|api\.(use|addFiles)|Rails::Engine|Rails::Railtie|admin\.site\.register|INSTALLED_APPS|ServiceProvider|\$this->app->(bind|singleton|scoped)\s*\(|Blueprint\s*\(|register_blueprint|init_app\s*\(|@(Configuration|AutoConfiguration|Bean|Service|Repository|Component|SpringBootApplication)\b|ApplicationContext|@Autowired|builder\.Services|IServiceCollection|Add(Singleton|Scoped|Transient|Controllers|RazorPages|OpenApi|Authentication|Authorization|Cors|SignalR|HealthChecks|HttpClient|HostedService)\s*\(|\.use\s*\(|FrameworkBundle|ContainerBuilder|services\.ya?ml|services\.php|autowire|autoconfigure|CompilerPassInterface|EventSubscriberInterface/i, evidence: "plugin registration evidence was detected." },
    { signal: "fastify-plugin", pattern: /fastify-plugin|fp\s*\(/i, evidence: "fastify-plugin wrapper evidence was detected." },
    { signal: "autoload", pattern: /@fastify\/autoload|autoload/i, evidence: "autoload plugin evidence was detected." },
    { signal: "encapsulation", pattern: /encapsulation|pluginName|prefix\s*:|url_prefix\s*=|realm|policies|blueprints|Blueprint\s*\(|register_blueprint|hooks|\.meteor\/packages|meteor-base|accounts-|namespace\s+:|scope\s+|Rails::Engine|AppConfig|include\s*\(|ROOT_URLCONF|@Module\s*\(|imports\s*:|controllers\s*:|providers\s*:|exports\s*:|Route::(middleware|prefix|name|group)|->middleware\s*\(|->prefix\s*\(|@(RequestMapping|ConfigurationProperties|EnableConfigurationProperties)\b|@ConditionalOn|\.use\s*\(|\.with\s*\(|\.(Group|Route|Mount)\s*\(|\.middleware\s*\(|router\.group|router\.named|createMiddleware|MiddlewareConsumer|basePath\s*\(|\.MapGroup\s*\(|UseRouting\s*\(|UseEndpoints\s*\(|ContainerBuilder|DependencyInjection|RequestStack|KernelInterface|SecurityBundle|TwigBundle|Messenger|Workflow/i, evidence: "encapsulation/prefix evidence was detected." },
    { signal: "plugin-options", pattern: /pluginTimeout|FastifyPluginOptions|options\s*:|requireAuth\s*:|blueprints|installedHooks|meteor\.mainModule|api\.use|as\s*:\s*["'](global|scoped|local)["']|config\/app\.php|["']providers["']\s*=>|providers\s*=>/i, evidence: "plugin option evidence was detected." },
    { signal: "ready", pattern: /\.ready\s*\(/i, evidence: "ready lifecycle evidence was detected." },
    { signal: "after", pattern: /\.after\s*\(/i, evidence: "after lifecycle evidence was detected." }
  ];
  return serverFrameworkReadinessSignalFromSpecs(sourceFiles, specs, "plugin", "signal");
}

function serverFrameworkReadinessLifecycleSignals(sourceFiles: ServerFrameworkReadinessSourceFile[]): ServerFrameworkReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: ServerFrameworkReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "on-request", pattern: /onRequest/i, evidence: "onRequest hook evidence was detected." },
    { signal: "pre-parsing", pattern: /preParsing/i, evidence: "preParsing hook evidence was detected." },
    { signal: "pre-validation", pattern: /preValidation/i, evidence: "preValidation hook evidence was detected." },
    { signal: "pre-handler", pattern: /preHandler/i, evidence: "preHandler hook evidence was detected." },
    { signal: "pre-serialization", pattern: /preSerialization/i, evidence: "preSerialization hook evidence was detected." },
    { signal: "on-send", pattern: /onSend/i, evidence: "onSend hook evidence was detected." },
    { signal: "on-response", pattern: /onResponse/i, evidence: "onResponse hook evidence was detected." },
    { signal: "on-error", pattern: /onError/i, evidence: "onError hook evidence was detected." },
    { signal: "on-close", pattern: /onClose/i, evidence: "onClose hook evidence was detected." }
  ];
  return serverFrameworkReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function serverFrameworkReadinessRuntimeSignals(sourceFiles: ServerFrameworkReadinessSourceFile[]): ServerFrameworkReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: ServerFrameworkReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "listen", pattern: /\.listen\s*\(|server\.start\s*\(|sails\.lift\s*\(|sails\.load\s*\(|meteor\s+run|django-admin\s+runserver|manage\.py\s+runserver|flask\s+run|app\.run\s*\(|php artisan serve|artisan\s+serve|public\/index\.php|bootstrap\/app\.php|bin\/console|KernelInterface|extends\s+Kernel\b|HttpKernel\b|SpringApplication\.run|@SpringBootApplication|java\s+-jar|WebApplication\.Create(Slim)?Builder|app\.Run\s*\(|UseKestrel|WebApp\.connectHandlers|app\.fetch|serve\s*\(|\.Start(TLS|AutoTLS|Server)?\s*\(|\.Listen(TLS|MutualTLS)?\s*\(|\.Run(TLS|Unix)?\s*\(|http\.ListenAndServe\s*\(/i, evidence: "listen evidence was detected." },
    { signal: "host", pattern: /host\s*:|hostname\s*:|HOST|0\.0\.0\.0|127\.0\.0\.1/i, evidence: "host binding evidence was detected." },
    { signal: "port", pattern: /port\s*:|PORT|process\.env\.PORT|server\.port|local\.server\.port|ASPNETCORE_URLS|applicationUrl|\.listen\s*\(\s*\d+/i, evidence: "port evidence was detected." },
    { signal: "logger", pattern: /logger\s*:|pino|createLogger|logLevel/i, evidence: "logger evidence was detected." },
    { signal: "trust-proxy", pattern: /trustProxy|trust proxy/i, evidence: "trust proxy evidence was detected." },
    { signal: "body-limit", pattern: /bodyLimit|limit\s*:/i, evidence: "body limit evidence was detected." },
    { signal: "content-type-parser", pattern: /addContentTypeParser|contentTypeParser|content-type parser/i, evidence: "content-type parser evidence was detected." }
  ];
  return serverFrameworkReadinessSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function serverFrameworkReadinessErrorSignals(sourceFiles: ServerFrameworkReadinessSourceFile[]): ServerFrameworkReadinessReport["errorSignals"] {
  const specs: Array<{ signal: ServerFrameworkReadinessReport["errorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-error-handler", pattern: /setErrorHandler|DefaultHTTPErrorHandler|HTTPErrorHandler|ErrorHandler|DefaultErrorHandler|onError|onPreResponse|Boom\.|Meteor\.Error|rescue_from|Http404|PermissionDenied|handler404|handler500|process_exception|errorhandler|register_error_handler|ExceptionEvent|KernelEvents::EXCEPTION|res\.(badRequest|forbidden|notFound|serverError)\s*\(|useGlobalFilters\s*\(|@UseFilters\s*\(|@Catch\s*\(|@ExceptionHandler|@ControllerAdvice|UseExceptionHandler|AddProblemDetails|IProblemDetailsService|app\.on\s*\(\s*["']error["']|app\.emit\s*\(\s*["']error["']|ctx\.onerror|\.use\s*\(\s*(?:function\s*)?\(?\s*err\s*,\s*req\s*,\s*res\s*,\s*next|function\s*\(\s*err\s*,\s*req\s*,\s*res\s*,\s*next\s*\)/i, evidence: "error handler evidence was detected." },
    { signal: "set-not-found-handler", pattern: /setNotFoundHandler|notFound|NotFoundHandler|StatusNotFound|\.NotFound\s*\(|http\.NotFound|NotFoundException|NotFoundHttpException|Http404|handler404|sendStatus\s*\(\s*404|status\s*\(\s*404|NoRoute\s*\(/i, evidence: "not-found handler evidence was detected." },
    { signal: "framework-errors", pattern: /frameworkErrors|FST_ERR|FastifyError|HttpException|ExceptionFilter|BadRequestException|Boom\.|Meteor\.Error|ActiveRecord::RecordNotFound|ActionController::ParameterMissing|django\.core\.exceptions|ImproperlyConfigured|SuspiciousOperation|PermissionDenied|ModelNotFoundException|NotFoundHttpException|AccessDeniedException|AuthenticationException|werkzeug\.exceptions|HTTPException|NewHTTPError|HTTPError|fiber\.NewError|NewError\s*\(|\*fiber\.Error|MethodNotAllowedHandler|\.MethodNotAllowed\s*\(|StatusMethodNotAllowed|http\.Error\s*\(|ResponseStatusException|ProblemDetail|ProblemDetails|Results\.(Problem|NotFound|BadRequest|ValidationProblem)|TypedResults\.(Problem|NotFound|BadRequest)|Abort(WithStatus(JSON)?|WithError)?\s*\(|ErrorTypeBind|abort\s*\(|abort_if\s*\(|abort_unless\s*\(/i, evidence: "framework error evidence was detected." },
    { signal: "validation-error", pattern: /validationError|schemaErrorFormatter|ValidationError|ValidationPipe|class-validator|Joi\.|forms\.ValidationError|ValidationException|Validator::make|ValidatorInterface|Constraints\\|Assert\\|MethodArgumentNotValidException|BindException|@Valid\b|@Validated\b|\[Required\b|ValidationProblem|ValidationProblemDetails/i, evidence: "validation error evidence was detected." },
    { signal: "reply-code", pattern: /reply\.code|reply\.status|res\.status\s*\(|res\.sendStatus\s*\(|statusCode|\.code\s*\(\s*\d{3}|code\(\d{3}\)|status\s*\(\s*\d{3}|@HttpCode\s*\(\s*\d{3}|@ResponseStatus|Response::HTTP_|ResponseEntity\.status|ResponseEntity\.(ok|created|badRequest|notFound)|StatusCodes\.Status[0-9]+|TypedResults\.(Ok|Created|BadRequest|NotFound|NoContent)|Results\.(Ok|Created|BadRequest|NotFound|NoContent)|new\s+JsonResponse\s*\([^)]*,\s*Response::HTTP_|jsonify[\s\S]{0,160},\s*\d{3}|return\s+[^\n]+,\s*\d{3}|w\.WriteHeader\s*\(\s*http\.Status|http\.Error\s*\(|c\.status\s*\(|response\(\)->json\([^)]*,\s*\d{3}|assertStatus\s*\(\s*\d{3}|c\.(JSON|String|SendString|HTML|Render|Redirect|File|SendFile|Attachment|Inline|Download|NoContent|Stream|SendStream|Blob|Data|Status|SendStatus|AbortWithStatusJSON|AbortWithStatus)\s*\(\s*(?:http\.|fiber\.)?Status|c\.(json|text|html)\s*\([^)]*,\s*\d{3}/i, evidence: "reply status/code evidence was detected." }
  ];
  return serverFrameworkReadinessSignalFromSpecs(sourceFiles, specs, "error", "signal");
}

function serverFrameworkReadinessTestSignals(sourceFiles: ServerFrameworkReadinessSourceFile[]): ServerFrameworkReadinessReport["testSignals"] {
  const specs: Array<{ signal: ServerFrameworkReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "inject", pattern: /\.inject\s*\(|server\.inject\s*\(/i, evidence: "inject test evidence was detected." },
    { signal: "light-my-request", pattern: /light-my-request/i, evidence: "light-my-request evidence was detected." },
    { signal: "supertest", pattern: /supertest|request\(app\)|request\s*\(\s*app\.getHttpServer\s*\(\s*\)\s*\)/i, evidence: "supertest evidence was detected." },
    { signal: "tap", pattern: /from ['"]node:test|from ['"]tap|require\(['"]tap|test\(/i, evidence: "tap/node test evidence was detected." },
    { signal: "vitest", pattern: /vitest|@hapi\/lab|Lab\.script|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "tinytest", pattern: /Tinytest|meteor\s+test|meteor\s+test-packages/i, evidence: "Meteor Tinytest evidence was detected." },
    { signal: "rails-test", pattern: /ActionDispatch::IntegrationTest|ActiveSupport::TestCase|rspec-rails|RSpec\.describe|assert_response|fixtures\s+:/i, evidence: "Rails test evidence was detected." },
    { signal: "django-test", pattern: /django\.test|TestCase|TransactionTestCase|SimpleTestCase|Client\s*\(|RequestFactory|assertTemplateUsed|assertRedirects|override_settings|pytest\.mark\.django_db/i, evidence: "Django test evidence was detected." },
    { signal: "laravel-test", pattern: /Illuminate\\Foundation\\Testing|TestResponse|withoutExceptionHandling|assertJson|assertStatus|getJson\s*\(|postJson\s*\(|Pest\\|pestphp|PHPUnit\\Framework\\TestCase/i, evidence: "Laravel test evidence was detected." },
    { signal: "spring-test", pattern: /@SpringBootTest|@WebMvcTest|@AutoConfigureMockMvc|MockMvc|WebTestClient|TestRestTemplate|@DynamicPropertySource|Testcontainers/i, evidence: "Spring Boot test evidence was detected." },
    { signal: "aspnet-test", pattern: /TestServer|WebApplicationFactory|Microsoft\.AspNetCore\.TestHost|Microsoft\.AspNetCore\.Mvc\.Testing|UseTestServer|ConfigureTestServices|CreateClient\s*\(|\[Fact\]|\[Theory\]|xunit/i, evidence: "ASP.NET Core test evidence was detected." },
    { signal: "flask-test", pattern: /test_client\s*\(|test_request_context\s*\(|test_cli_runner\s*\(|FlaskClient|FlaskCliRunner|client\.(get|post|put|patch|delete)\s*\(|runner\.invoke\s*\(|pytest/i, evidence: "Flask test evidence was detected." },
    { signal: "symfony-test", pattern: /WebTestCase\b|KernelTestCase\b|KernelBrowser\b|HttpKernelBrowser\b|static::createClient\s*\(|bootKernel\s*\(|CommandTester\b|ApplicationTester\b|assertResponse|assertSelector|PHPUnit\\Framework\\TestCase/i, evidence: "Symfony functional/kernel test evidence was detected." },
    { signal: "go-test", pattern: /httptest|CreateTestContext\s*\(|SetMode\s*\(\s*(?:gin\.)?TestMode|\.Test\s*\(|go\s+test|func\s+Test[A-Za-z0-9_]*\s*\(\s*t\s+\*testing\.T/i, evidence: "Go httptest evidence was detected." }
  ];
  return serverFrameworkReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}
