import { z } from "zod";

export const ServiceMeshReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  serviceMeshSetups: z.array(z.object({
    filePath: z.string(),
    mesh: z.enum(["istio", "linkerd", "consul", "gateway-api", "envoy", "custom", "unknown"]),
    controlPlaneCount: z.number().int().nonnegative(),
    sidecarCount: z.number().int().nonnegative(),
    gatewayCount: z.number().int().nonnegative(),
    routeCount: z.number().int().nonnegative(),
    trafficPolicyCount: z.number().int().nonnegative(),
    securityPolicyCount: z.number().int().nonnegative(),
    mtlsCount: z.number().int().nonnegative(),
    identityCount: z.number().int().nonnegative(),
    telemetryCount: z.number().int().nonnegative(),
    resilienceCount: z.number().int().nonnegative(),
    multiClusterCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  meshSignals: z.array(z.object({
    signal: z.enum(["istio", "linkerd", "consul", "gateway-api", "envoy", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  controlPlaneSignals: z.array(z.object({
    signal: z.enum(["istiod", "linkerd-control-plane", "consul-server", "proxy-injector", "xds", "crds", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  injectionSignals: z.array(z.object({
    signal: z.enum(["sidecar-injection", "proxy-container", "transparent-proxy", "cni", "ambient", "waypoint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trafficSignals: z.array(z.object({
    signal: z.enum(["virtual-service", "destination-rule", "gateway-api-route", "traffic-split", "service-router", "service-splitter", "service-resolver", "service-defaults", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["peer-authentication", "authorization-policy", "request-authentication", "server-authorization", "mesh-tls-authentication", "network-authentication", "intentions", "jwt-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  mtlsSignals: z.array(z.object({
    signal: z.enum(["strict-mtls", "permissive-mtls", "spiffe", "identity", "ca", "certificate-rotation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resilienceSignals: z.array(z.object({
    signal: z.enum(["retry", "timeout", "circuit-breaker", "outlier-detection", "fault-injection", "rate-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  gatewaySignals: z.array(z.object({
    signal: z.enum(["ingress-gateway", "egress-gateway", "mesh-gateway", "terminating-gateway", "api-gateway", "gateway-class", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  telemetrySignals: z.array(z.object({
    signal: z.enum(["telemetry-api", "metrics", "tracing", "access-logs", "prometheus", "tap", "viz", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  multiclusterSignals: z.array(z.object({
    signal: z.enum(["multi-cluster", "service-entry", "east-west-gateway", "cluster-link", "sameness-group", "peering", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "mesh-lint", "proxy-config-smoke", "policy-smoke", "traffic-smoke", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["istio", "linkerd", "consul", "envoy", "gateway-api", "helm-chart", "unknown"]),
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

export const IngressControllerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  ingressControllerSetups: z.array(z.object({
    filePath: z.string(),
    controller: z.enum(["ingress-nginx", "traefik", "envoy-gateway", "gateway-api", "nginx", "custom", "unknown"]),
    controllerCount: z.number().int().nonnegative(),
    ingressClassCount: z.number().int().nonnegative(),
    routeCount: z.number().int().nonnegative(),
    serviceExposureCount: z.number().int().nonnegative(),
    tlsCount: z.number().int().nonnegative(),
    middlewareCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    loadBalancingCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    admissionCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  controllerSignals: z.array(z.object({
    signal: z.enum(["ingress-nginx", "traefik", "envoy-gateway", "gateway-api", "nginx", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ingressClassSignals: z.array(z.object({
    signal: z.enum(["ingress-class", "controller-class", "gateway-class", "default-class", "class-annotation", "parameters-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  routeSignals: z.array(z.object({
    signal: z.enum(["kubernetes-ingress", "ingress-rule", "path-rule", "ingressroute", "httproute", "grpcroute", "tcproute", "tls-route", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  serviceExposureSignals: z.array(z.object({
    signal: z.enum(["loadbalancer-service", "nodeport-service", "external-ip", "external-dns", "ingress-status", "load-balancer-ip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tlsSignals: z.array(z.object({
    signal: z.enum(["tls-secret", "cert-manager", "cluster-issuer", "acme", "tls-option", "tls-store", "backend-tls", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  middlewareSignals: z.array(z.object({
    signal: z.enum(["traefik-middleware", "rewrite-target", "headers", "forward-auth", "rate-limit", "cors", "modsecurity", "waf", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["backend-traffic-policy", "client-traffic-policy", "security-policy", "envoy-patch-policy", "extension-policy", "ip-allowlist", "auth-policy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loadBalancingSignals: z.array(z.object({
    signal: z.enum(["service-weight", "sticky-session", "health-check", "circuit-breaker", "retry", "timeout", "canary", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metrics", "prometheus", "access-logs", "tracing", "dashboard", "events", "kubectl-plugin", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  admissionSignals: z.array(z.object({
    signal: z.enum(["validating-webhook", "admission-controller", "webhook-certgen", "crd", "status-update", "lint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "helm-template", "kubeconform", "kubectl-dry-run", "ingress-lint", "route-smoke", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["ingress-nginx", "traefik", "envoy-gateway", "gateway-api", "helm-chart", "cert-manager", "unknown"]),
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

export const DnsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dnsSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["external-dns", "coredns", "octodns", "route53", "cloudflare", "custom", "unknown"]),
    sourceCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    zoneCount: z.number().int().nonnegative(),
    recordCount: z.number().int().nonnegative(),
    ownershipCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    coreDnsCount: z.number().int().nonnegative(),
    automationCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["external-dns", "route53", "cloudflare", "google-cloud-dns", "azure-dns", "octodns", "coredns", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sourceSignals: z.array(z.object({
    signal: z.enum(["service", "ingress", "gateway", "dnsendpoint-crd", "endpoint-slice", "node", "file-zone", "yaml-provider", "dynamic-zone", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  zoneSignals: z.array(z.object({
    signal: z.enum(["domain-filter", "zone-id-filter", "managed-zone", "public-private-zone", "reverse-zone", "split-horizon", "soa-serial", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  recordSignals: z.array(z.object({
    signal: z.enum(["a", "aaaa", "cname", "txt", "mx", "ns", "srv", "caa", "alias", "ptr", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ownershipSignals: z.array(z.object({
    signal: z.enum(["txt-registry", "txt-owner-id", "txt-prefix-suffix", "txt-encryption", "policy-sync", "upsert-only", "dry-run", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  coreDnsSignals: z.array(z.object({
    signal: z.enum(["corefile", "forward", "cache", "kubernetes-plugin", "rewrite", "template", "health", "ready", "prometheus", "reload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  automationSignals: z.array(z.object({
    signal: z.enum(["octodns-sync", "octodns-plan", "providers-config", "sources-targets", "record-validation", "processors", "ci", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metrics", "prometheus", "logs", "errors", "health", "ready", "events", "dig-smoke", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "external-dns-dry-run", "octodns-validate", "coredns-check", "dig-smoke", "artifact-upload", "provider-plan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["external-dns", "coredns", "octodns", "route53", "cloudflare", "google-cloud-dns", "unknown"]),
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

export const CertificateReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  certificateSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["cert-manager", "step-ca", "certmagic", "acme", "custom", "unknown"]),
    resourceCount: z.number().int().nonnegative(),
    issuerCount: z.number().int().nonnegative(),
    challengeCount: z.number().int().nonnegative(),
    renewalCount: z.number().int().nonnegative(),
    secretCount: z.number().int().nonnegative(),
    keyCount: z.number().int().nonnegative(),
    trustCount: z.number().int().nonnegative(),
    revocationCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["cert-manager", "step-ca", "certmagic", "acme", "vault", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["certificate", "certificate-request", "issuer", "cluster-issuer", "order", "challenge", "csr", "secret", "ingress", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  issuerSignals: z.array(z.object({
    signal: z.enum(["acme", "ca", "self-signed", "vault", "step-ca", "lets-encrypt", "external", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  challengeSignals: z.array(z.object({
    signal: z.enum(["dns01", "http01", "tls-alpn-01", "solver", "eab", "self-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["duration", "renew-before", "revision-history", "private-key-rotation", "keystore", "status-conditions", "on-demand", "cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  trustSignals: z.array(z.object({
    signal: z.enum(["root-ca", "intermediate-ca", "ca-bundle", "cainjector", "trust-manager", "bootstrap", "install-root", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  revocationSignals: z.array(z.object({
    signal: z.enum(["crl", "ocsp", "revoke", "short-lived", "passive-revocation", "must-staple", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  automationSignals: z.array(z.object({
    signal: z.enum(["cmctl", "step-ca-renew", "certmagic-manage", "storage", "issuer-config", "solver-config", "policy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["metrics", "prometheus", "events", "logs", "health", "webhook", "readiness", "expiration-alert", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "helm-template", "kubeconform", "cmctl-check", "step-ca-smoke", "certmagic-tests", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["cert-manager", "step-ca", "certmagic", "lego", "x509", "openssl", "unknown"]),
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

export const HelmReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  helmSetups: z.array(z.object({
    filePath: z.string(),
    chartType: z.enum(["application", "library", "unknown"]),
    chartCount: z.number().int().nonnegative(),
    valuesCount: z.number().int().nonnegative(),
    templateCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    packagingCount: z.number().int().nonnegative(),
    releaseCount: z.number().int().nonnegative(),
    provenanceCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  chartSignals: z.array(z.object({
    signal: z.enum(["chart-yaml", "values", "templates", "helpers", "library-chart", "chart-lock", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  templateSignals: z.array(z.object({
    signal: z.enum(["helm-template", "include", "tpl", "lookup", "required", "capabilities", "hooks", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valuesSignals: z.array(z.object({
    signal: z.enum(["values-schema", "global-values", "env-values", "required-values", "default-values", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["dependencies", "repository", "condition", "alias", "helm-dependency", "chart-lock", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["helm-lint", "helm-template", "dry-run", "kubeconform", "ct-lint", "ct-install", "helm-unittest", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  releaseSignals: z.array(z.object({
    signal: z.enum(["helm-upgrade", "helm-install", "helm-rollback", "helm-test", "chart-releaser", "oci-push", "repo-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["provenance", "signing", "verify", "keyring", "digest", "oci-registry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-actions", "chart-testing", "helm-lint", "helm-template", "kubeconform", "chart-releaser", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["helm", "chart-testing", "chart-releaser", "helm-docs", "helm-unittest", "kubeconform", "unknown"]),
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

export const CacheReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  cacheSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["redis", "ioredis", "upstash-redis", "keyv", "memcached", "custom", "unknown"]),
    clientSetupCount: z.number().int().nonnegative(),
    connectCount: z.number().int().nonnegative(),
    readCount: z.number().int().nonnegative(),
    writeCount: z.number().int().nonnegative(),
    ttlCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  operationSignals: z.array(z.object({
    signal: z.enum(["get", "set", "mget", "mset", "del", "exists", "expire", "ttl", "scan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["ttl", "nx", "xx", "ex", "px", "stale-while-revalidate", "invalidation", "namespace", "serialization", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  connectionSignals: z.array(z.object({
    signal: z.enum(["REDIS_URL", "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD", "url", "socket", "tls", "reconnect", "is-ready", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  advancedSignals: z.array(z.object({
    signal: z.enum(["transaction", "watch", "pubsub", "client-side-cache", "pipeline", "pool", "cluster", "sentinel", "telemetry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["redis", "@redis/client", "ioredis", "@upstash/redis", "keyv", "memcached", "lru-cache", "unknown"]),
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

export const LoggingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  loggingSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["pino", "zap", "zerolog", "winston", "bunyan", "loglevel", "console", "custom", "unknown"]),
    loggerSetupCount: z.number().int().nonnegative(),
    levelCount: z.number().int().nonnegative(),
    callCount: z.number().int().nonnegative(),
    childLoggerCount: z.number().int().nonnegative(),
    transportCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  levelSignals: z.array(z.object({
    signal: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "panic", "silent", "custom-level", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["child-logger", "bindings", "request-id", "http-request", "error-object", "serializer", "mixin", "timestamp", "sugared-logger", "typed-fields", "named-logger", "event-builder", "context-logger", "context-integration", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["redact", "redact-paths", "secret-fields", "safe-stringify", "error-serializer", "stdout-stderr", "flush-on-exit", "caller", "stacktrace", "sampling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transportSignals: z.array(z.object({
    signal: z.enum(["transport", "destination", "pino-pretty", "multistream", "worker-thread", "async-logging", "file-output", "log-processor", "zapcore", "encoder", "write-syncer", "sink", "console-writer", "multi-writer", "level-writer", "diode-writer", "slog-handler", "journald", "syslog", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["pino", "pino-pretty", "pino-http", "zap", "zapcore", "zapgrpc", "zapio", "zaptest", "zerolog", "zerolog-log", "zerolog-hlog", "zerolog-diode", "zerolog-journald", "zerolog-syslog", "zerolog-pkgerrors", "winston", "bunyan", "loglevel", "@pinojs/redact", "unknown"]),
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

export const FeatureFlagReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  featureFlagSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["openfeature", "launchdarkly", "unleash", "growthbook", "flagsmith", "custom", "unknown"]),
    providerSetupCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    evaluationCount: z.number().int().nonnegative(),
    contextCount: z.number().int().nonnegative(),
    hookCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  evaluationSignals: z.array(z.object({
    signal: z.enum(["boolean", "string", "number", "object", "details", "default-value", "variant", "flag-key", "on-off", "feature-value", "experiment-run", "forced-variation", "prerequisite", "safe-rollout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["evaluation-context", "targeting-key", "user-attributes", "request-context", "transaction-context", "domain", "react-provider", "nest-context-factory", "attributes", "sticky-bucket", "hash-attribute", "segments", "environment", "project", "qa-mode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["set-provider", "set-provider-and-wait", "ready-event", "error-event", "hooks", "tracking", "shutdown", "multi-provider", "sse-stream", "auto-refresh", "bootstrap", "metrics", "impression-data", "encrypted-payload", "remote-eval", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@openfeature/server-sdk", "@openfeature/web-sdk", "@openfeature/react-sdk", "@openfeature/nestjs-sdk", "launchdarkly", "unleash", "unleash-client", "@unleash/proxy-client-react", "growthbook", "@growthbook/growthbook", "@growthbook/growthbook-react", "flagsmith", "unknown"]),
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

export const RateLimitReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  rateLimitSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["rate-limiter-flexible", "express-rate-limit", "fastify-rate-limit", "upstash-ratelimit", "custom", "unknown"]),
    limiterSetupCount: z.number().int().nonnegative(),
    windowCount: z.number().int().nonnegative(),
    storeCount: z.number().int().nonnegative(),
    consumeCount: z.number().int().nonnegative(),
    headerCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  quotaSignals: z.array(z.object({
    signal: z.enum(["points", "duration", "limit", "window", "block-duration", "exec-evenly", "in-memory-block", "queue", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["ip", "user-id", "authorization-token", "api-route", "key-prefix", "get-key", "black-white-list", "skip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storeSignals: z.array(z.object({
    signal: z.enum(["memory", "redis", "valkey", "mongo", "postgres", "mysql", "sqlite", "dynamodb", "memcached", "prisma", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  responseSignals: z.array(z.object({
    signal: z.enum(["ms-before-next", "remaining-points", "consumed-points", "retry-after", "x-ratelimit-limit", "x-ratelimit-remaining", "x-ratelimit-reset", "too-many-requests", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resilienceSignals: z.array(z.object({
    signal: z.enum(["insurance-limiter", "store-client", "reject-if-not-ready", "atomic-increment", "penalty", "reward", "delete", "block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["rate-limiter-flexible", "express-rate-limit", "@fastify/rate-limit", "@upstash/ratelimit", "bottleneck", "limiter", "unknown"]),
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

export const ErrorTrackingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  errorTrackingSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["sentry", "rollbar", "bugsnag", "airbrake", "custom", "unknown"]),
    initCount: z.number().int().nonnegative(),
    dsnCount: z.number().int().nonnegative(),
    captureCount: z.number().int().nonnegative(),
    scopeCount: z.number().int().nonnegative(),
    integrationCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  captureSignals: z.array(z.object({
    signal: z.enum(["capture-exception", "capture-message", "capture-event", "error-boundary", "react-error-handler", "unhandled-errors", "breadcrumbs", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["set-user", "set-tag", "set-context", "set-extra", "with-scope", "component-stack", "release-environment", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  filteringSignals: z.array(z.object({
    signal: z.enum(["before-send", "before-breadcrumb", "ignore-errors", "allow-deny-urls", "send-default-pii", "scrubbers", "sample-rate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["traces-sample-rate", "traces-sampler", "trace-propagation-targets", "browser-tracing", "profiles-sample-rate", "replay", "feedback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@sentry/browser", "@sentry/node", "@sentry/react", "@sentry/nextjs", "@sentry/vue", "rollbar", "@bugsnag/js", "unknown"]),
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

export type ServiceMeshReadinessReport = z.infer<typeof ServiceMeshReadinessReportSchema>;
export type IngressControllerReadinessReport = z.infer<typeof IngressControllerReadinessReportSchema>;
export type DnsReadinessReport = z.infer<typeof DnsReadinessReportSchema>;
export type CertificateReadinessReport = z.infer<typeof CertificateReadinessReportSchema>;
export type HelmReadinessReport = z.infer<typeof HelmReadinessReportSchema>;
export type CacheReadinessReport = z.infer<typeof CacheReadinessReportSchema>;
export type LoggingReadinessReport = z.infer<typeof LoggingReadinessReportSchema>;
export type FeatureFlagReadinessReport = z.infer<typeof FeatureFlagReadinessReportSchema>;
export type RateLimitReadinessReport = z.infer<typeof RateLimitReadinessReportSchema>;
export type ErrorTrackingReadinessReport = z.infer<typeof ErrorTrackingReadinessReportSchema>;
