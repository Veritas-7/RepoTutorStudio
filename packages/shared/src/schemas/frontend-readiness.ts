import { z } from "zod";

export const DataFetchingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  clientSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["react", "vue", "svelte", "solid", "angular", "core", "unknown"]),
    hasClient: z.boolean(),
    hasProvider: z.boolean(),
    devtoolsSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  queryUsages: z.array(z.object({
    filePath: z.string(),
    queryCount: z.number().int().nonnegative(),
    mutationCount: z.number().int().nonnegative(),
    infiniteQueryCount: z.number().int().nonnegative(),
    queryKeySignals: z.number().int().nonnegative(),
    queryFnSignals: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  cacheSignals: z.array(z.object({
    signal: z.enum(["staleTime", "gcTime", "retry", "enabled", "placeholderData", "initialData", "select", "suspense", "refetchOnWindowFocus", "refetchOnReconnect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataFlowSignals: z.array(z.object({
    signal: z.enum(["invalidateQueries", "prefetchQuery", "setQueryData", "getQueryData", "dehydrate", "hydrate", "persistQueryClient", "onlineManager", "focusManager", "devtools", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tanstackQuerySignals: z.array(z.object({
    signal: z.enum(["query-options", "infinite-query-options", "mutation-options", "use-queries", "use-suspense-query", "use-suspense-infinite-query", "use-suspense-queries", "use-prefetch-query", "use-prefetch-infinite-query", "fetch-query", "fetch-infinite-query", "ensure-query-data", "ensure-infinite-query-data", "get-query-state", "get-mutation-cache", "query-cache", "mutation-cache", "set-queries-data", "reset-queries", "cancel-queries", "remove-queries", "refetch-queries", "is-fetching", "use-is-fetching", "use-is-mutating", "use-mutation-state", "query-defaults", "network-mode", "retry-delay", "throw-on-error", "structural-sharing", "notify-on-change-props", "subscribed", "placeholder-keep-previous", "skip-token", "dehydrate-options", "hydration-boundary", "persist-query-client-provider", "create-persister", "broadcast-query-client", "focus-manager", "online-manager", "notify-manager", "timeout-manager", "streamed-query", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["tanstack-react-query", "tanstack-query-core", "swr", "axios", "ky", "graphql-request", "apollo-client", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const RoutingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  routingSetups: z.array(z.object({
    filePath: z.string(),
    mode: z.enum(["framework", "data", "declarative", "file-routes", "next", "vue", "tanstack", "unknown"]),
    hasRouter: z.boolean(),
    hasProvider: z.boolean(),
    hasConfig: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  routeDefinitions: z.array(z.object({
    filePath: z.string(),
    routeCount: z.number().int().nonnegative(),
    dynamicSegmentCount: z.number().int().nonnegative(),
    nestedSignal: z.boolean(),
    indexSignal: z.boolean(),
    layoutSignal: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["Link", "NavLink", "Navigate", "useNavigate", "useLocation", "useParams", "useSearchParams", "useMatches", "useBlocker", "useFetcher", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataRouteSignals: z.array(z.object({
    signal: z.enum(["loader", "action", "clientLoader", "clientAction", "useLoaderData", "useActionData", "useRouteError", "ErrorBoundary", "HydrateFallback", "redirect", "defer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fileRouteSignals: z.array(z.object({
    signal: z.enum(["routes-ts", "app-routes-directory", "flatRoutes", "index-route", "dynamic-segment", "nested-route", "pathless-route", "ignoredRouteFiles", "root-route", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tanstackSignals: z.array(z.object({
    signal: z.enum(["router-provider", "create-router", "route-tree", "generated-route-tree", "file-route", "root-route", "code-route", "typed-route-api", "route-hooks", "loader", "before-load", "validate-search", "search-schema", "link-options", "route-masking", "preload", "not-found", "devtools", "vite-plugin", "eslint-plugin", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["react-router", "react-router-dom", "@react-router/dev", "@react-router/fs-routes", "tanstack-router", "next", "vue-router", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const StateManagementReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  storeSetups: z.array(z.object({
    filePath: z.string(),
    storeType: z.enum(["redux-toolkit", "redux", "zustand", "jotai", "valtio", "mobx", "unknown"]),
    hasConfigureStore: z.boolean(),
    hasProvider: z.boolean(),
    hasTypedHooks: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  sliceDefinitions: z.array(z.object({
    filePath: z.string(),
    sliceCount: z.number().int().nonnegative(),
    reducerCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    selectorCount: z.number().int().nonnegative(),
    usesImmerStyle: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  selectorSignals: z.array(z.object({
    signal: z.enum(["useSelector", "useAppSelector", "createSelector", "slice-selectors", "RootState", "selectFromResult", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sideEffectSignals: z.array(z.object({
    signal: z.enum(["createAsyncThunk", "createListenerMiddleware", "listenerMiddleware", "thunkMiddleware", "extraReducers", "builder-callback", "rejectWithValue", "abort-signal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entitySignals: z.array(z.object({
    signal: z.enum(["createEntityAdapter", "selectId", "sortComparer", "getSelectors", "upsertMany", "normalized-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  middlewareSignals: z.array(z.object({
    signal: z.enum(["getDefaultMiddleware", "serializableCheck", "immutableCheck", "devTools", "autoBatchEnhancer", "dynamicMiddleware", "logger", "redux-thunk", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rtkQuerySignals: z.array(z.object({
    signal: z.enum(["createApi", "fetchBaseQuery", "reducerPath", "api-middleware", "tagTypes", "providesTags", "invalidatesTags", "generated-hooks", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  zustandSignals: z.array(z.object({
    signal: z.enum(["create", "create-store", "vanilla-store", "use-store", "use-bound-store", "set-function", "get-function", "set-state", "get-state", "get-initial-state", "subscribe", "replace-state", "selector", "use-shallow", "shallow-equality", "create-with-equality-fn", "equality-fn", "subscribe-with-selector", "fire-immediately", "persist-middleware", "create-json-storage", "persist-partialize", "persist-version", "persist-migrate", "persist-merge", "on-rehydrate-storage", "skip-hydration", "rehydrate", "devtools-middleware", "devtools-action-name", "devtools-store-name", "devtools-serialize", "devtools-enabled", "immer-middleware", "redux-middleware", "combine-middleware", "state-creator-type", "store-api-type", "mutate-type", "store-mutator-identifier", "traditional-entry", "react-shallow-entry", "middleware-entry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  jotaiSignals: z.array(z.object({
    signal: z.enum(["atom", "primitive-atom", "derived-atom", "read-write-atom", "write-only-atom", "async-atom", "use-atom", "use-atom-value", "use-set-atom", "provider", "create-store", "get-default-store", "store-get", "store-set", "store-sub", "on-mount", "debug-label", "atom-with-storage", "create-json-storage", "reset", "atom-with-reset", "atom-with-default", "atom-with-reducer", "atom-with-refresh", "atom-with-observable", "atom-with-hash", "atom-with-location", "atom-family", "select-atom", "split-atom", "focus-atom", "freeze-atom", "loadable", "unwrap", "use-hydrate-atoms", "use-atom-callback", "use-atoms-debug-value", "use-atoms-devtools", "use-atom-devtools", "use-atoms-snapshot", "use-goto-atoms-snapshot", "use-reducer-atom", "use-reset-atom", "use-select-atom", "use-atom-effect", "atom-effect", "with-immer", "atom-with-immer", "use-immer-atom", "atom-type", "writable-atom-type", "primitive-atom-type", "getter-type", "setter-type", "extract-atom-types", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valtioSignals: z.array(z.object({
    signal: z.enum(["proxy", "nested-proxy", "direct-mutation", "use-snapshot", "snapshot", "sync-option", "subscribe", "subscribe-ops", "subscribe-key", "watch", "ref", "promise-state", "devtools", "devtools-name", "devtools-enabled", "proxy-map", "is-proxy-map", "proxy-set", "is-proxy-set", "use-proxy", "derive", "underive", "proxy-with-history", "deep-clone", "unstable-deep-proxy", "vanilla-entry", "react-entry", "utils-entry", "macro-entry", "snapshot-type", "unstable-get-internal-states", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mobxSignals: z.array(z.object({
    signal: z.enum(["make-auto-observable", "make-observable", "observable", "observable-object", "observable-box", "observable-array", "observable-map", "observable-set", "observable-ref", "observable-shallow", "observable-struct", "extend-observable", "computed", "computed-struct", "computed-requires-reaction", "action", "action-bound", "run-in-action", "flow", "flow-result", "auto-bind", "autorun", "reaction", "when", "configure", "enforce-actions", "reaction-requires-observable", "observable-requires-reaction", "disable-error-boundaries", "isolate-global-state", "observer", "observer-component", "use-local-observable", "use-observer", "provider", "inject", "enable-static-rendering", "intercept", "intercept-reads", "observe", "on-become-observed", "on-become-unobserved", "spy", "trace", "to-js", "transaction", "is-observable", "is-observable-prop", "is-action", "is-computed", "is-computed-prop", "is-observable-object", "is-observable-array", "is-observable-map", "is-observable-set", "mobx-react-lite", "mobx-react", "eslint-plugin-mobx", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["redux-toolkit", "react-redux", "redux", "zustand", "jotai", "mobx", "valtio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const FormReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  formSetups: z.array(z.object({
    filePath: z.string(),
    library: z.enum(["react-hook-form", "formik", "tanstack-form", "native", "unknown"]),
    useFormCount: z.number().int().nonnegative(),
    hasSubmitHandler: z.boolean(),
    hasDefaultValues: z.boolean(),
    hasFormProvider: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  fieldRegistrations: z.array(z.object({
    filePath: z.string(),
    registeredFieldCount: z.number().int().nonnegative(),
    controlledFieldCount: z.number().int().nonnegative(),
    fieldArrayCount: z.number().int().nonnegative(),
    nestedFieldSignals: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["required", "min", "max", "minLength", "maxLength", "pattern", "validate", "resolver", "zodResolver", "yupResolver", "schema", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  errorSignals: z.array(z.object({
    signal: z.enum(["formState-errors", "ErrorMessage", "setError", "clearErrors", "trigger", "isValid", "isSubmitting", "dirtyFields", "touchedFields", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueFlowSignals: z.array(z.object({
    signal: z.enum(["watch", "useWatch", "getValues", "setValue", "reset", "resetField", "defaultValues", "values", "unregister", "shouldUnregister", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reactHookFormSignals: z.array(z.object({
    signal: z.enum(["use-form", "register", "handle-submit", "controller", "use-controller", "form-provider", "use-form-context", "use-field-array", "field-array-append", "field-array-remove", "field-array-move", "field-array-insert", "field-array-update", "field-array-replace", "field-array-swap", "use-watch", "watch", "use-form-state", "form-state", "resolver", "mode", "revalidate-mode", "criteria-mode", "default-values", "values", "reset", "reset-field", "set-value", "get-values", "get-field-state", "set-error", "clear-errors", "trigger", "should-unregister", "disabled", "delay-error", "should-focus-error", "context", "control", "register-options", "validate-option", "deps-option", "value-as-number", "value-as-date", "set-value-as", "dirty-fields", "touched-fields", "is-submitting", "is-valid", "field-values-type", "field-path-type", "submit-handler-type", "use-form-return-type", "controller-render", "form-component", "form-state-subscribe", "create-form-control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["react-hook-form", "hookform-resolvers", "formik", "tanstack-form", "zod", "yup", "valibot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const AuthReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  authSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["authjs", "next-auth", "better-auth", "clerk", "auth0", "custom", "unknown"]),
    handlerCount: z.number().int().nonnegative(),
    hasAuthFunction: z.boolean(),
    hasRouteHandler: z.boolean(),
    hasMiddleware: z.boolean(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  sessionSurfaces: z.array(z.object({
    filePath: z.string(),
    clientSessionCount: z.number().int().nonnegative(),
    serverSessionCount: z.number().int().nonnegative(),
    providerBoundaryCount: z.number().int().nonnegative(),
    signInOutCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["handlers-export", "auth-export", "sign-in-export", "sign-out-export", "session-strategy", "session-max-age", "session-update-age", "trust-host", "base-path", "experimental-webauthn", "raw-env", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  protectionSignals: z.array(z.object({
    signal: z.enum(["middleware", "authorized-callback", "protected-route", "redirect", "role-check", "session-required", "csrf", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["oauth-provider", "credentials-provider", "email-provider", "webauthn-passkey", "adapter", "database-session", "jwt-session", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callbackSignals: z.array(z.object({
    signal: z.enum(["signIn", "redirect", "session", "jwt", "authorized", "account", "profile", "events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  credentialSignals: z.array(z.object({
    signal: z.enum(["AUTH_SECRET", "NEXTAUTH_SECRET", "AUTH_URL", "NEXTAUTH_URL", "provider-client-id", "provider-client-secret", "cookie-policy", "csrf-token", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["next-auth", "@auth/core", "@auth-adapter", "better-auth", "@clerk/nextjs", "@auth0/nextjs-auth0", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const AuthorizationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  authorizationSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["openfga", "casbin", "casl", "oso", "opa", "custom", "unknown"]),
    modelCount: z.number().int().nonnegative(),
    relationCount: z.number().int().nonnegative(),
    roleCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    guardCount: z.number().int().nonnegative(),
    middlewareCount: z.number().int().nonnegative(),
    ownershipCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["rbac", "abac", "rebac", "acl", "relationship-tuples", "policy-file", "subject-object-action", "resource-action", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  enforcementSignals: z.array(z.object({
    signal: z.enum(["guard", "middleware", "can-check", "authorize-call", "deny-by-default", "route-protection", "resolver-protection", "ui-ability", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["user", "role", "group", "tenant", "organization", "service-account", "owner", "anonymous", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["document", "project", "repository", "organization", "tenant", "record", "field", "collection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["least-privilege", "separation-of-duties", "audit-log", "permission-review", "policy-versioning", "migration", "decision-log", "break-glass", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["unit-test", "fixture", "table-test", "negative-test", "policy-test", "e2e-test", "type-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@openfga/sdk", "openfga", "casbin", "casl", "@casl/ability", "oso", "opa", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const PaymentReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  paymentSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["stripe", "paypal", "paddle", "lemonsqueezy", "custom", "unknown"]),
    serverClientCount: z.number().int().nonnegative(),
    checkoutSessionCount: z.number().int().nonnegative(),
    paymentIntentCount: z.number().int().nonnegative(),
    webhookHandlerCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  checkoutSignals: z.array(z.object({
    signal: z.enum(["checkout-session", "payment-intent", "subscription", "customer-portal", "price-id", "product-id", "currency", "quantity", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  webhookSignals: z.array(z.object({
    signal: z.enum(["webhook-route", "signature-verification", "raw-body", "event-switch", "checkout-completed", "invoice-paid", "payment-failed", "idempotency", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  customerSignals: z.array(z.object({
    signal: z.enum(["customer", "subscription", "invoice", "billing-portal", "trial", "coupon", "tax", "refund", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  credentialSignals: z.array(z.object({
    signal: z.enum(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PUBLISHABLE_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "price-env", "api-version", "webhook-secret", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["stripe", "@stripe/stripe-js", "@stripe/react-stripe-js", "paypal", "paddle", "lemonsqueezy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const EmailReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  emailSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["resend", "nodemailer", "sendgrid", "mailgun", "postmark", "ses", "custom", "unknown"]),
    clientSetupCount: z.number().int().nonnegative(),
    sendCallCount: z.number().int().nonnegative(),
    templateSignalCount: z.number().int().nonnegative(),
    domainSignalCount: z.number().int().nonnegative(),
    webhookSignalCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  recipientSignals: z.array(z.object({
    signal: z.enum(["from", "to", "cc", "bcc", "reply-to", "subject", "text", "html", "react", "attachments", "scheduled", "tags", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deliverySignals: z.array(z.object({
    signal: z.enum(["domain-verification", "batch-send", "idempotency", "webhook-verification", "event-handling", "bounce", "complaint", "delivery", "open-tracking", "click-tracking", "unsubscribe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["react-email", "html-template", "text-template", "jsx-runtime", "template-id", "variables", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["resend-client", "emails-resource", "batch-resource", "domains-resource", "webhooks-resource", "api-keys-resource", "templates-resource", "events-resource", "logs-resource", "contacts-resource", "audiences-segments", "broadcasts-resource", "automations-resource", "receiving-resource", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  credentialSignals: z.array(z.object({
    signal: z.enum(["RESEND_API_KEY", "RESEND_BASE_URL", "RESEND_USER_AGENT", "SENDGRID_API_KEY", "MAILGUN_API_KEY", "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "POSTMARK_SERVER_TOKEN", "AWS_SES", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["resend", "nodemailer", "@sendgrid/mail", "mailgun.js", "postmark", "@aws-sdk/client-ses", "@react-email/render", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const QueueReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  queueSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["bullmq", "bull", "graphile-worker", "bree", "agenda", "custom", "unknown"]),
    queueCount: z.number().int().nonnegative(),
    workerCount: z.number().int().nonnegative(),
    schedulerCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    flowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  producerSignals: z.array(z.object({
    signal: z.enum(["queue-add", "add-bulk", "job-name", "job-data", "priority", "delay", "repeat", "job-id", "parent", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workerSignals: z.array(z.object({
    signal: z.enum(["worker", "processor", "concurrency", "rate-limit", "sandbox", "stalled-check", "lock-renewal", "remove-on-complete", "remove-on-fail", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["attempts", "backoff", "failed-event", "completed-event", "queue-events", "retry", "dead-letter", "metrics", "telemetry", "dashboard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  connectionSignals: z.array(z.object({
    signal: z.enum(["REDIS_URL", "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD", "connection", "ioredis", "node-redis", "docker-compose-redis", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["bullmq", "bull", "@nestjs/bullmq", "graphile-worker", "bree", "agenda", "ioredis", "redis", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export const EventStreamReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  eventStreamSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["kafka", "redpanda", "pulsar", "custom", "unknown"]),
    brokerCount: z.number().int().nonnegative(),
    topicCount: z.number().int().nonnegative(),
    producerCount: z.number().int().nonnegative(),
    consumerCount: z.number().int().nonnegative(),
    groupCount: z.number().int().nonnegative(),
    offsetCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    reliabilityCount: z.number().int().nonnegative(),
    securityCount: z.number().int().nonnegative(),
    opsCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["apache-kafka", "redpanda", "apache-pulsar", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  brokerSignals: z.array(z.object({
    signal: z.enum(["broker", "bootstrap-server", "listener", "advertised-listener", "kraft", "zookeeper", "bookkeeper", "broker-service", "proxy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  topicSignals: z.array(z.object({
    signal: z.enum(["topic", "partition", "replication-factor", "retention", "compaction", "cleanup-policy", "partitioned-topic", "tenant-namespace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  producerSignals: z.array(z.object({
    signal: z.enum(["kafka-producer", "pulsar-producer", "producer-config", "acks", "idempotence", "transactional-id", "batching", "compression", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  consumerSignals: z.array(z.object({
    signal: z.enum(["kafka-consumer", "pulsar-consumer", "consumer-group", "subscription", "offset-commit", "rebalance", "acknowledge", "negative-ack", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  groupProtocolSignals: z.array(z.object({
    signal: z.enum(["group-protocol-consumer", "group-protocol-streams", "classic-protocol", "group-coordinator", "consumer-offsets-topic", "auto-offset-reset", "auto-commit", "isolation-level", "partition-assignment", "rebalance-metrics", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  schemaSignals: z.array(z.object({
    signal: z.enum(["schema-registry", "avro", "protobuf", "json-schema", "schema-evolution", "compatibility", "schema-definition", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["dead-letter-queue", "retry-topic", "poison-record", "transaction", "exactly-once", "mirror-replication", "geo-replication", "backpressure", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["sasl", "tls", "acl", "authentication", "authorization", "oauth", "scram", "certificates", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["metrics", "lag-monitoring", "quota", "rack-awareness", "admin-client", "topic-create", "reassignment", "health-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "broker-smoke-command", "producer-smoke-command", "consumer-smoke-command", "schema-smoke-command", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["kafka-client", "kafka-streams", "kafka-connect", "redpanda", "pulsar-client", "pulsar-broker", "pulsar-functions", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
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

export type DataFetchingReadinessReport = z.infer<typeof DataFetchingReadinessReportSchema>;
export type RoutingReadinessReport = z.infer<typeof RoutingReadinessReportSchema>;
export type StateManagementReadinessReport = z.infer<typeof StateManagementReadinessReportSchema>;
export type FormReadinessReport = z.infer<typeof FormReadinessReportSchema>;
export type AuthReadinessReport = z.infer<typeof AuthReadinessReportSchema>;
export type AuthorizationReadinessReport = z.infer<typeof AuthorizationReadinessReportSchema>;
export type PaymentReadinessReport = z.infer<typeof PaymentReadinessReportSchema>;
export type EmailReadinessReport = z.infer<typeof EmailReadinessReportSchema>;
export type QueueReadinessReport = z.infer<typeof QueueReadinessReportSchema>;
export type EventStreamReadinessReport = z.infer<typeof EventStreamReadinessReportSchema>;
