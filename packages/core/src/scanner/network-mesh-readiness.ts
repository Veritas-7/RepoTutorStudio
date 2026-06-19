import type { CertificateReadinessReport, DnsReadinessReport, IngressControllerReadinessReport, ServiceMeshReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildServiceMeshReadinessReport(walk: WalkResult): Promise<ServiceMeshReadinessReport> {
  const sourceFiles = await serviceMeshReadinessSourceFiles(walk);
  const serviceMeshSetups = serviceMeshReadinessSetups(sourceFiles);
  const meshSignals = serviceMeshReadinessMeshSignals(sourceFiles);
  const controlPlaneSignals = serviceMeshReadinessControlPlaneSignals(sourceFiles);
  const injectionSignals = serviceMeshReadinessInjectionSignals(sourceFiles);
  const trafficSignals = serviceMeshReadinessTrafficSignals(sourceFiles);
  const securitySignals = serviceMeshReadinessSecuritySignals(sourceFiles);
  const mtlsSignals = serviceMeshReadinessMtlsSignals(sourceFiles);
  const resilienceSignals = serviceMeshReadinessResilienceSignals(sourceFiles);
  const gatewaySignals = serviceMeshReadinessGatewaySignals(sourceFiles);
  const telemetrySignals = serviceMeshReadinessTelemetrySignals(sourceFiles);
  const multiclusterSignals = serviceMeshReadinessMulticlusterSignals(sourceFiles);
  const ciSignals = serviceMeshReadinessCiSignals(sourceFiles);
  const packageSignals = serviceMeshReadinessPackageSignals(sourceFiles);

  const hasMesh = meshSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => ["istio", "linkerd", "consul", "envoy"].includes(item.signal) && item.readiness === "ready");
  const hasControlPlane = controlPlaneSignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.controlPlaneCount > 0);
  const hasInjection = injectionSignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.sidecarCount > 0);
  const hasTraffic = trafficSignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.routeCount + item.trafficPolicyCount > 0);
  const hasSecurity = securitySignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.securityPolicyCount > 0);
  const hasMtls = mtlsSignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.mtlsCount + item.identityCount > 0);
  const hasResilience = resilienceSignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.resilienceCount > 0);
  const hasGateway = gatewaySignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.gatewayCount > 0);
  const hasTelemetry = telemetrySignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.telemetryCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || serviceMeshSetups.some((item) => item.ciCount > 0);

  const riskQueue: ServiceMeshReadinessReport["riskQueue"] = [];
  if (!hasMesh && !hasControlPlane) {
    riskQueue.push({
      priority: "high",
      action: "Document the service mesh implementation and control-plane boundary before claiming service mesh readiness.",
      why: "Istio, Linkerd, and Consul readiness starts with visible mesh, control-plane, CRD, xDS, or package evidence.",
      relatedHref: "html/service-mesh-readiness.html"
    });
  }
  if (hasMesh && !hasInjection) {
    riskQueue.push({
      priority: "medium",
      action: "Trace sidecar, proxy injection, transparent proxy, CNI, ambient, or waypoint evidence.",
      why: "A mesh declaration without a proxy attachment path does not show how workloads enter the data plane.",
      relatedHref: "html/service-mesh-readiness.html"
    });
  }
  if (hasTraffic && !hasSecurity) {
    riskQueue.push({
      priority: "high",
      action: "Pair mesh routing with authorization, authentication, intentions, or network policy evidence.",
      why: "Mesh traffic shaping without policy controls can hide cross-service access risk from learners.",
      relatedHref: "html/service-mesh-readiness.html"
    });
  }
  if (hasSecurity && !hasMtls) {
    riskQueue.push({
      priority: "medium",
      action: "Document mTLS mode, workload identity, SPIFFE/SVID, CA, or certificate rotation evidence.",
      why: "Service mesh security claims depend on identity and transport protection, not only L7 authorization objects.",
      relatedHref: "html/service-mesh-readiness.html"
    });
  }
  if (hasTraffic && !hasResilience) {
    riskQueue.push({
      priority: "medium",
      action: "Add retry, timeout, outlier detection, circuit breaker, fault injection, or rate limit evidence.",
      why: "Mesh routing readiness is stronger when failure handling and overload behavior are visible.",
      relatedHref: "html/service-mesh-readiness.html"
    });
  }
  if (hasGateway && !hasSecurity) {
    riskQueue.push({
      priority: "medium",
      action: "Map gateway routes to authentication and authorization policy.",
      why: "Ingress, egress, API, terminating, and mesh gateways create perimeter paths that need explicit policy.",
      relatedHref: "html/service-mesh-readiness.html"
    });
  }
  if ((hasMesh || hasControlPlane || hasTraffic) && !hasTelemetry) {
    riskQueue.push({
      priority: "low",
      action: "Add telemetry, metrics, tracing, access logs, tap, viz, or Prometheus evidence.",
      why: "Mesh operators need request visibility before debugging route, policy, or proxy failures.",
      relatedHref: "html/service-mesh-readiness.html"
    });
  }
  if ((hasMesh || hasControlPlane || hasTraffic || hasSecurity) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Add mesh config lint, proxy-config smoke, policy smoke, traffic smoke, and artifact upload checks.",
      why: "Static mesh readiness is stronger when CI proves config parses and key proxy/policy paths are preserved.",
      relatedHref: "html/service-mesh-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run service mesh commands only in a trusted cluster or sandbox after reviewing this static map.",
    why: "RepoTutor records service mesh readiness only; it does not run istioctl, linkerd, consul, envoy, Kubernetes, Helm, traffic, proxy, policy, or CI commands.",
    relatedHref: "html/service-mesh-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Service mesh readiness report: setup ${serviceMeshSetups.length}개, mesh signal ${meshSignals.length}개, traffic signal ${trafficSignals.length}개, security signal ${securitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Service mesh readiness Istio Linkerd Consul Envoy Gateway API VirtualService DestinationRule Gateway Sidecar EnvoyFilter PeerAuthentication AuthorizationPolicy RequestAuthentication ServiceEntry HTTPRoute GRPCRoute TrafficSplit ServerAuthorization MeshTLSAuthentication service-defaults service-router service-splitter service-resolver proxy-defaults intentions mTLS SPIFFE telemetry proxy-config CI",
    serviceMeshSetups,
    meshSignals,
    controlPlaneSignals,
    injectionSignals,
    trafficSignals,
    securitySignals,
    mtlsSignals,
    resilienceSignals,
    gatewaySignals,
    telemetrySignals,
    multiclusterSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"VirtualService|DestinationRule|Gateway|Sidecar|EnvoyFilter|PeerAuthentication|AuthorizationPolicy|RequestAuthentication|ServiceEntry|Telemetry\" .", purpose: "Inventory Istio CRDs for routing, policy, identity, egress, telemetry, and proxy customization." },
      { command: "rg \"linkerd.io|ServerAuthorization|MeshTLSAuthentication|NetworkAuthentication|HTTPRoute|GRPCRoute|TrafficSplit|ServiceProfile|linkerd inject|linkerd check|linkerd viz\" .", purpose: "Find Linkerd injection, policy, Gateway API route, ServiceProfile, health check, and observability evidence." },
      { command: "rg \"service-defaults|service-router|service-splitter|service-resolver|proxy-defaults|ingress-gateway|terminating-gateway|mesh-gateway|sidecar_service|intentions|connect\" .", purpose: "Trace Consul Connect config entries, gateways, intentions, proxies, and service mesh registration." },
      { command: "rg \"mTLS|STRICT|PERMISSIVE|SPIFFE|spiffe|identity|certificate|CA|caBundle|TrustDomain|JWTProvider\" .", purpose: "Review workload identity, mTLS mode, certificate, trust-domain, and JWT policy evidence." },
      { command: "rg \"mesh-lint|proxy-config-smoke|policy-smoke|traffic-smoke|istioctl|linkerd check|consul config|upload-artifact\" .github .", purpose: "Check CI smoke commands and uploaded mesh analysis artifacts." }
    ],
    learnerNextSteps: [
      "먼저 Istio, Linkerd, Consul, Envoy, Gateway API 중 어떤 mesh boundary가 실제로 쓰이는지 찾으세요.",
      "control plane과 proxy injection, sidecar, transparent proxy, CNI, ambient/waypoint 경계를 분리해서 확인하세요.",
      "routing object가 보이면 VirtualService, DestinationRule, HTTPRoute, TrafficSplit, service-router/splitter/resolver를 서비스 단위로 묶어 보세요.",
      "AuthorizationPolicy, PeerAuthentication, ServerAuthorization, MeshTLSAuthentication, intentions가 mTLS와 workload identity를 어떻게 보호하는지 확인하세요.",
      "retry, timeout, circuit breaker, outlier detection, fault injection, rate limit 같은 resilience 정책이 routing과 연결되는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 mesh install, proxy config, route traffic, policy enforcement, telemetry dashboard는 안전한 cluster/sandbox에서 별도로 확인하세요."
    ]
  };
}

type ServiceMeshReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function serviceMeshReadinessSourceFiles(walk: WalkResult): Promise<ServiceMeshReadinessSourceFile[]> {
  const files: ServiceMeshReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !serviceMeshReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 280_000);
    if (!text) continue;
    if (!serviceMeshReadinessPathSignal(file.relPath) && !serviceMeshReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function serviceMeshReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return serviceMeshReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|go\.mod|go\.sum|Cargo\.toml|pyproject\.toml|requirements\.txt|Dockerfile|docker-compose\.ya?ml|compose\.ya?ml|helmfile\.ya?ml|Chart\.ya?ml|values\.ya?ml|kustomization\.ya?ml)$/i.test(base)
    || /\.(json|ya?ml|toml|tf|hcl|cue|rego|md|mdx|txt|sh|bash|go|rs|py|ts|tsx|js|jsx|mjs|cjs)$/i.test(filePath);
}

function serviceMeshReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(istio|linkerd|consul|envoy|service[-_ ]?mesh|mesh[-_ ]?gateway|ingress[-_ ]?gateway|egress[-_ ]?gateway|gateway-api|gatewayapi|virtual[-_]?service|destination[-_]?rule|authorization[-_]?policy|peer[-_]?authentication|request[-_]?authentication|service[-_]?entry|traffic[-_]?split|service[-_]?router|service[-_]?splitter|service[-_]?resolver|service[-_]?defaults|proxy[-_]?defaults|intentions?|xds|mtls|spiffe|sidecars?|proxies?|proxy-injector)(\/|\.|-|_|$)|\.github\/workflows|Chart\.ya?ml|values\.ya?ml/i.test(filePath);
}

function serviceMeshReadinessContentSignal(text: string): boolean {
  return /(Istio|istioctl|VirtualService|DestinationRule|EnvoyFilter|PeerAuthentication|AuthorizationPolicy|RequestAuthentication|ServiceEntry|meshConfig|outlierDetection|trafficPolicy|Linkerd|linkerd inject|linkerd check|linkerd viz|ServerAuthorization|MeshTLSAuthentication|NetworkAuthentication|TrafficSplit|ServiceProfile|Consul Connect|service-defaults|service-router|service-splitter|service-resolver|proxy-defaults|sidecar_service|intentions?|TransparentProxy|mesh-gateway|terminating-gateway|ingress-gateway|xDS|Envoy|Gateway API|HTTPRoute|GRPCRoute|mTLS|mutual TLS|SPIFFE|spiffe|service mesh)/i.test(text);
}

function serviceMeshReadinessSetups(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["serviceMeshSetups"] {
  const rows: ServiceMeshReadinessReport["serviceMeshSetups"] = [];
  for (const source of sourceFiles) {
    const controlPlaneCount = countMatches(source.text, /\bistiod\b|\blinkerd-(identity|destination|proxy-injector|policy|tap|viz)\b|\bconsul server\b|\bconsul-server\b|\bcontrol plane\b|\bcontrol-plane\b|\bxDS\b|\bCRDs?\b|\bCustomResourceDefinition\b|\bmeshConfig\b/gi);
    const sidecarCount = countMatches(source.text, /\bsidecar\b|\bSidecar\b|\blinkerd-proxy\b|\bistio-proxy\b|\bproxy-injector\b|\bsidecar_service\b|\bTransparentProxy\b|\btransparent proxy\b|\bproxy container\b|\bCNI\b|\bambient\b|\bwaypoint\b/gi);
    const gatewayCount = countMatches(source.text, /\bGateway\b|\bIngressGateway\b|\bEgressGateway\b|\bingress-gateway\b|\begress-gateway\b|\bmesh-gateway\b|\bterminating-gateway\b|\bapi-gateway\b|\bGatewayClass\b|\bGateway API\b/gi);
    const routeCount = countMatches(source.text, /\bVirtualService\b|\bHTTPRoute\b|\bGRPCRoute\b|\bTCPRoute\b|\bTrafficSplit\b|\bServiceProfile\b|\bservice-router\b|\bservice-splitter\b|\bservice-resolver\b|\broute\b|\broutes\b/gi);
    const trafficPolicyCount = countMatches(source.text, /\bDestinationRule\b|\btrafficPolicy\b|\bsubsets?\b|\bloadBalancer\b|\boutlierDetection\b|\bservice-defaults\b|\bproxy-defaults\b|\bretries?\b|\btimeout\b|\bcircuit.?breaker\b/gi);
    const securityPolicyCount = countMatches(source.text, /\bPeerAuthentication\b|\bAuthorizationPolicy\b|\bRequestAuthentication\b|\bServerAuthorization\b|\bMeshTLSAuthentication\b|\bNetworkAuthentication\b|\bintentions?\b|\bservice-intentions\b|\bJWTProvider\b|\bRBAC\b|\ballow\b|\bdeny\b/gi);
    const mtlsCount = countMatches(source.text, /\bmTLS\b|\bmutual TLS\b|\bSTRICT\b|\bPERMISSIVE\b|\bMeshTLS\b|\btlsMode\b|\bTLS\b|\bspiffe\b|\bSPIFFE\b|\bSVID\b|\bidentity\b|\bTrustDomain\b/gi);
    const identityCount = countMatches(source.text, /\bidentity\b|\bSPIFFE\b|\bspiffe\b|\bSVID\b|\bcertificate\b|\bcert-manager\b|\bcaBundle\b|\bCA\b|\btrustDomain\b|\bTrustDomain\b|\bworkload identity\b/gi);
    const telemetryCount = countMatches(source.text, /\bTelemetry\b|\bmetrics?\b|\btracing\b|\baccess logs?\b|\bPrometheus\b|\bOpenTelemetry\b|\botel\b|\btap\b|\blinkerd viz\b|\bviz\b|\bgolden metrics\b|\bproxy logs?\b/gi);
    const resilienceCount = countMatches(source.text, /\bretries?\b|\btimeout\b|\bfault\b|\bfaultInjection\b|\boutlierDetection\b|\bcircuit.?breaker\b|\brate.?limit\b|\bPassiveHealthCheck\b|\bConsecutive5xx\b|\bretryBudget\b/gi);
    const multiClusterCount = countMatches(source.text, /\bmulti[-_ ]?cluster\b|\bmulticluster\b|\bServiceEntry\b|\beast[-_ ]?west\b|\beast-west-gateway\b|\bcluster link\b|\bSamenessGroup\b|\bpeering\b|\bfederation\b/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|\bgithub[-_ ]?actions\b|mesh-lint|proxy-config-smoke|policy-smoke|traffic-smoke|istioctl analyze|istioctl proxy-config|linkerd check|consul config|upload-artifact|service-mesh-report\.json/gi);
    const hasSetupSignal = controlPlaneCount + sidecarCount + gatewayCount + routeCount + trafficPolicyCount + securityPolicyCount + mtlsCount + identityCount + telemetryCount + resilienceCount + multiClusterCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      mesh: serviceMeshReadinessMesh(source),
      controlPlaneCount,
      sidecarCount,
      gatewayCount,
      routeCount,
      trafficPolicyCount,
      securityPolicyCount,
      mtlsCount,
      identityCount,
      telemetryCount,
      resilienceCount,
      multiClusterCount,
      ciCount,
      readiness: (routeCount + trafficPolicyCount > 0) && securityPolicyCount > 0 && mtlsCount > 0 && (sidecarCount > 0 || controlPlaneCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains control-plane ${controlPlaneCount}, sidecar/proxy ${sidecarCount}, gateway ${gatewayCount}, route ${routeCount}, traffic policy ${trafficPolicyCount}, security policy ${securityPolicyCount}, mTLS ${mtlsCount}, identity ${identityCount}, telemetry ${telemetryCount}, resilience ${resilienceCount}, multicluster ${multiClusterCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.controlPlaneCount + b.sidecarCount + b.gatewayCount + b.routeCount + b.trafficPolicyCount + b.securityPolicyCount + b.mtlsCount + b.telemetryCount + b.resilienceCount) - (a.controlPlaneCount + a.sidecarCount + a.gatewayCount + a.routeCount + a.trafficPolicyCount + a.securityPolicyCount + a.mtlsCount + a.telemetryCount + a.resilienceCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function serviceMeshReadinessMesh(source: ServiceMeshReadinessSourceFile): ServiceMeshReadinessReport["serviceMeshSetups"][number]["mesh"] {
  if (/(^|\/)istio(\/|$)/i.test(source.filePath) || /\bIstio\b|\bistioctl\b|\bVirtualService\b|\bDestinationRule\b|\bPeerAuthentication\b|\bEnvoyFilter\b/i.test(source.text)) return "istio";
  if (/(^|\/)linkerd(2)?(\/|$)/i.test(source.filePath) || /\bLinkerd\b|\blinkerd\b|\bServerAuthorization\b|\bMeshTLSAuthentication\b|\blinkerd-proxy\b/i.test(source.text)) return "linkerd";
  if (/(^|\/)consul(\/|$)/i.test(source.filePath) || /\bConsul\b|\bconsul\b|\bservice-defaults\b|\bservice-router\b|\bsidecar_service\b|\bintentions?\b/i.test(source.text)) return "consul";
  if (/\bGateway API\b|\bHTTPRoute\b|\bGRPCRoute\b|\bGatewayClass\b/i.test(source.text)) return "gateway-api";
  if (/\bEnvoy\b|\bxDS\b|\benvoy\b/i.test(source.filePath) || /\bEnvoy\b|\bxDS\b|\benvoy\b/i.test(source.text)) return "envoy";
  if (/service[-_ ]?mesh|mesh/i.test(source.filePath) || /service mesh|mesh/i.test(source.text)) return "custom";
  return "unknown";
}

function serviceMeshReadinessMeshSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["meshSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["meshSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "istio", pattern: /\bIstio\b|\bistioctl\b|\bVirtualService\b|\bDestinationRule\b|\bPeerAuthentication\b|\bAuthorizationPolicy\b/i, evidence: "Istio evidence was detected." },
    { signal: "linkerd", pattern: /\bLinkerd\b|\blinkerd\b|\bServerAuthorization\b|\bMeshTLSAuthentication\b|\blinkerd-proxy\b/i, evidence: "Linkerd evidence was detected." },
    { signal: "consul", pattern: /\bConsul\b|\bconsul\b|\bservice-defaults\b|\bservice-router\b|\bsidecar_service\b|\bintentions?\b/i, evidence: "Consul service mesh evidence was detected." },
    { signal: "gateway-api", pattern: /\bGateway API\b|\bHTTPRoute\b|\bGRPCRoute\b|\bGatewayClass\b|\bgateway\.networking\.k8s\.io\b/i, evidence: "Gateway API evidence was detected." },
    { signal: "envoy", pattern: /\bEnvoy\b|\bxDS\b|\benvoy\b/i, evidence: "Envoy or xDS evidence was detected." },
    { signal: "custom", pattern: /\bservice mesh\b|\bmesh routing\b|\bmesh policy\b/i, evidence: "custom service mesh evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "mesh", "signal");
}

function serviceMeshReadinessControlPlaneSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["controlPlaneSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["controlPlaneSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "istiod", pattern: /\bistiod\b|\bpilot-discovery\b|\bmeshConfig\b/i, evidence: "Istio control-plane evidence was detected." },
    { signal: "linkerd-control-plane", pattern: /\blinkerd-(identity|destination|policy|tap|viz)\b|\blinkerd control plane\b/i, evidence: "Linkerd control-plane evidence was detected." },
    { signal: "consul-server", pattern: /\bconsul server\b|\bconsul-server\b|\bconsul agent\b|\bconnect\b/i, evidence: "Consul server/agent evidence was detected." },
    { signal: "proxy-injector", pattern: /\bproxy-injector\b|\bsidecar injector\b|\bMutatingWebhookConfiguration\b|\binjector\b/i, evidence: "proxy injector evidence was detected." },
    { signal: "xds", pattern: /\bxDS\b|\bADS\b|\bCDS\b|\bEDS\b|\bRDS\b|\bLDS\b|\bSDS\b|\bdiscovery service\b/i, evidence: "xDS/discovery service evidence was detected." },
    { signal: "crds", pattern: /\bCustomResourceDefinition\b|\bCRD\b|\bcrds?\b|\bapiextensions\.k8s\.io\b/i, evidence: "CRD evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "control-plane", "signal");
}

function serviceMeshReadinessInjectionSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["injectionSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["injectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sidecar-injection", pattern: /sidecar\.istio\.io\/inject|linkerd inject|proxy-injector|sidecar injection|inject: ["']?enabled|injection/i, evidence: "sidecar injection evidence was detected." },
    { signal: "proxy-container", pattern: /istio-proxy|linkerd-proxy|envoy sidecar|proxy container|name:\s*(istio-proxy|linkerd-proxy)/i, evidence: "proxy container evidence was detected." },
    { signal: "transparent-proxy", pattern: /TransparentProxy|transparent proxy|tproxy|redirect inbound|redirect outbound/i, evidence: "transparent proxy evidence was detected." },
    { signal: "cni", pattern: /\bCNI\b|istio-cni|linkerd-cni|cniPlugin|cni plugin/i, evidence: "CNI evidence was detected." },
    { signal: "ambient", pattern: /\bambient\b|\bztunnel\b|istio ambient/i, evidence: "Istio ambient mesh evidence was detected." },
    { signal: "waypoint", pattern: /\bwaypoint\b|\bWaypoint\b/i, evidence: "waypoint proxy evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "injection", "signal");
}

function serviceMeshReadinessTrafficSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["trafficSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["trafficSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "virtual-service", pattern: /\bVirtualService\b|kind:\s*VirtualService/i, evidence: "Istio VirtualService evidence was detected." },
    { signal: "destination-rule", pattern: /\bDestinationRule\b|kind:\s*DestinationRule|\btrafficPolicy\b|\bsubsets?\b/i, evidence: "Istio DestinationRule/traffic policy evidence was detected." },
    { signal: "gateway-api-route", pattern: /\bHTTPRoute\b|\bGRPCRoute\b|\bTCPRoute\b|\bGateway API\b|\bgateway\.networking\.k8s\.io/i, evidence: "Gateway API route evidence was detected." },
    { signal: "traffic-split", pattern: /\bTrafficSplit\b|traffic split|split traffic/i, evidence: "TrafficSplit evidence was detected." },
    { signal: "service-router", pattern: /service-router|ServiceRouter|kind\s*=\s*"service-router"/i, evidence: "Consul service-router evidence was detected." },
    { signal: "service-splitter", pattern: /service-splitter|ServiceSplitter|kind\s*=\s*"service-splitter"/i, evidence: "Consul service-splitter evidence was detected." },
    { signal: "service-resolver", pattern: /service-resolver|ServiceResolver|kind\s*=\s*"service-resolver"/i, evidence: "Consul service-resolver evidence was detected." },
    { signal: "service-defaults", pattern: /service-defaults|ServiceDefaults|kind\s*=\s*"service-defaults"/i, evidence: "Consul service-defaults evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "traffic", "signal");
}

function serviceMeshReadinessSecuritySignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["securitySignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["securitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "peer-authentication", pattern: /\bPeerAuthentication\b|kind:\s*PeerAuthentication/i, evidence: "Istio PeerAuthentication evidence was detected." },
    { signal: "authorization-policy", pattern: /\bAuthorizationPolicy\b|kind:\s*AuthorizationPolicy/i, evidence: "Istio AuthorizationPolicy evidence was detected." },
    { signal: "request-authentication", pattern: /\bRequestAuthentication\b|kind:\s*RequestAuthentication/i, evidence: "Istio RequestAuthentication evidence was detected." },
    { signal: "server-authorization", pattern: /\bServerAuthorization\b|serverauthorizations\.policy\.linkerd\.io/i, evidence: "Linkerd ServerAuthorization evidence was detected." },
    { signal: "mesh-tls-authentication", pattern: /\bMeshTLSAuthentication\b|meshtlsauthentications\.policy\.linkerd\.io/i, evidence: "Linkerd MeshTLSAuthentication evidence was detected." },
    { signal: "network-authentication", pattern: /\bNetworkAuthentication\b|networkauthentications\.policy\.linkerd\.io/i, evidence: "Linkerd NetworkAuthentication evidence was detected." },
    { signal: "intentions", pattern: /\bintentions?\b|\bservice-intentions\b|IntentionCreate|TrafficPermissions/i, evidence: "Consul intentions or traffic permissions evidence was detected." },
    { signal: "jwt-provider", pattern: /\bJWTProvider\b|\bjwt\b|\bJWKS\b|\bissuer\b/i, evidence: "JWT provider/authentication evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "security", "signal");
}

function serviceMeshReadinessMtlsSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["mtlsSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["mtlsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "strict-mtls", pattern: /\bSTRICT\b|mode:\s*STRICT|mtls.*strict/i, evidence: "strict mTLS evidence was detected." },
    { signal: "permissive-mtls", pattern: /\bPERMISSIVE\b|mode:\s*PERMISSIVE|mtls.*permissive/i, evidence: "permissive mTLS evidence was detected." },
    { signal: "spiffe", pattern: /\bSPIFFE\b|\bspiffe:\/\/|\bSVID\b/i, evidence: "SPIFFE/SVID evidence was detected." },
    { signal: "identity", pattern: /\bidentity\b|\blinkerd-identity\b|\bworkload identity\b|\btrustDomain\b|\bTrustDomain\b/i, evidence: "workload identity evidence was detected." },
    { signal: "ca", pattern: /\bCA\b|\bcaBundle\b|\bcertificate authority\b|\broot cert\b|\btrust anchor\b/i, evidence: "CA/trust anchor evidence was detected." },
    { signal: "certificate-rotation", pattern: /\bcertificate rotation\b|\brotate\b|\bissuer\b|\bcert-manager\b|\bSDS\b/i, evidence: "certificate rotation/SDS evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "mTLS", "signal");
}

function serviceMeshReadinessResilienceSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["resilienceSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["resilienceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "retry", pattern: /\bretries?\b|\bretryBudget\b|\bRetryPolicy\b/i, evidence: "retry evidence was detected." },
    { signal: "timeout", pattern: /\btimeout\b|\brequestTimeout\b|\bidleTimeout\b/i, evidence: "timeout evidence was detected." },
    { signal: "circuit-breaker", pattern: /circuit.?breaker|maxConnections|http1MaxPendingRequests|maxRequestsPerConnection/i, evidence: "circuit breaker evidence was detected." },
    { signal: "outlier-detection", pattern: /outlierDetection|outlier detection|Consecutive5xx|ConsecutiveGatewayFailure/i, evidence: "outlier detection evidence was detected." },
    { signal: "fault-injection", pattern: /\bfault\b|\bfaultInjection\b|\bdelay\b|\babort\b/i, evidence: "fault injection evidence was detected." },
    { signal: "rate-limit", pattern: /rate.?limit|localRateLimit|RateLimit|quota/i, evidence: "rate limit evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "resilience", "signal");
}

function serviceMeshReadinessGatewaySignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["gatewaySignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["gatewaySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ingress-gateway", pattern: /ingress-gateway|IngressGateway|istio-ingressgateway|\bingress gateway\b/i, evidence: "ingress gateway evidence was detected." },
    { signal: "egress-gateway", pattern: /egress-gateway|EgressGateway|istio-egressgateway|\begress gateway\b/i, evidence: "egress gateway evidence was detected." },
    { signal: "mesh-gateway", pattern: /mesh-gateway|MeshGateway|\bmesh gateway\b/i, evidence: "mesh gateway evidence was detected." },
    { signal: "terminating-gateway", pattern: /terminating-gateway|TerminatingGateway|\bterminating gateway\b/i, evidence: "terminating gateway evidence was detected." },
    { signal: "api-gateway", pattern: /api-gateway|APIGateway|\bAPI Gateway\b/i, evidence: "API gateway evidence was detected." },
    { signal: "gateway-class", pattern: /\bGatewayClass\b|\bgatewayClassName\b/i, evidence: "GatewayClass evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "gateway", "signal");
}

function serviceMeshReadinessTelemetrySignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["telemetrySignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["telemetrySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "telemetry-api", pattern: /\bTelemetry\b|telemetry\.istio\.io|kind:\s*Telemetry/i, evidence: "Telemetry API evidence was detected." },
    { signal: "metrics", pattern: /\bmetrics?\b|\bgolden metrics\b|\bproxy metrics\b/i, evidence: "metrics evidence was detected." },
    { signal: "tracing", pattern: /\btracing\b|\bJaeger\b|\bZipkin\b|\bOpenTelemetry\b|\botel\b/i, evidence: "tracing evidence was detected." },
    { signal: "access-logs", pattern: /access logs?|accessLog|proxy logs?|tap logs?/i, evidence: "access log evidence was detected." },
    { signal: "prometheus", pattern: /\bPrometheus\b|prometheus\.io|prometheusUrl/i, evidence: "Prometheus evidence was detected." },
    { signal: "tap", pattern: /\btap\b|\blinkerd tap\b|\blinkerd-tap\b/i, evidence: "Linkerd tap evidence was detected." },
    { signal: "viz", pattern: /\bviz\b|\blinkerd viz\b|\blinkerd-viz\b/i, evidence: "Linkerd viz evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "telemetry", "signal");
}

function serviceMeshReadinessMulticlusterSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["multiclusterSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["multiclusterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "multi-cluster", pattern: /multi[-_ ]?cluster|multicluster|remote cluster/i, evidence: "multi-cluster evidence was detected." },
    { signal: "service-entry", pattern: /\bServiceEntry\b|kind:\s*ServiceEntry/i, evidence: "Istio ServiceEntry evidence was detected." },
    { signal: "east-west-gateway", pattern: /east[-_ ]?west|east-west-gateway/i, evidence: "east-west gateway evidence was detected." },
    { signal: "cluster-link", pattern: /cluster link|cluster-link|linkerd multicluster/i, evidence: "cluster link evidence was detected." },
    { signal: "sameness-group", pattern: /\bSamenessGroup\b|sameness_group/i, evidence: "Consul sameness group evidence was detected." },
    { signal: "peering", pattern: /\bpeering\b|\bPeer\b|\bmesh federation\b/i, evidence: "mesh peering/federation evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "multicluster", "signal");
}

function serviceMeshReadinessCiSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["ciSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "mesh-lint", pattern: /mesh-lint|istioctl analyze|linkerd check|consul validate|kubeconform|kubeval/i, evidence: "mesh lint evidence was detected." },
    { signal: "proxy-config-smoke", pattern: /proxy-config-smoke|istioctl proxy-config|linkerd diagnostics|consul.*envoy|xds.*smoke/i, evidence: "proxy config smoke evidence was detected." },
    { signal: "policy-smoke", pattern: /policy-smoke|authorization.*smoke|intentions.*smoke|mtls.*smoke|authn.*authz/i, evidence: "policy smoke evidence was detected." },
    { signal: "traffic-smoke", pattern: /traffic-smoke|curl.*VirtualService|HTTPRoute.*smoke|TrafficSplit.*smoke|route.*smoke/i, evidence: "traffic smoke evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|service-mesh-report\.json|mesh-analysis\.json|proxy-config\.json|policy-smoke\.json|traffic-smoke\.json/i, evidence: "service mesh artifact upload evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function serviceMeshReadinessPackageSignals(sourceFiles: ServiceMeshReadinessSourceFile[]): ServiceMeshReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ServiceMeshReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "istio", pattern: /istioctl|\bistio\b|istio\.io|charts\/istio|istio-proxy/i, evidence: "Istio package/chart evidence was detected." },
    { signal: "linkerd", pattern: /\blinkerd\b|linkerd\.io|linkerd-proxy|linkerd2/i, evidence: "Linkerd package/chart evidence was detected." },
    { signal: "consul", pattern: /\bconsul\b|hashicorp\/consul|consul-k8s|consul-helm/i, evidence: "Consul package/chart evidence was detected." },
    { signal: "envoy", pattern: /\benvoy\b|envoyproxy|EnvoyFilter|xDS/i, evidence: "Envoy package/config evidence was detected." },
    { signal: "gateway-api", pattern: /gateway-api|gateway\.networking\.k8s\.io|GatewayClass|HTTPRoute/i, evidence: "Gateway API package/config evidence was detected." },
    { signal: "helm-chart", pattern: /Chart\.ya?ml|values\.ya?ml|helm install|helm upgrade|charts\//i, evidence: "Helm chart evidence was detected." }
  ];
  return serviceMeshReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function serviceMeshReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ServiceMeshReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/service-mesh-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildIngressControllerReadinessReport(walk: WalkResult): Promise<IngressControllerReadinessReport> {
  const sourceFiles = await ingressControllerReadinessSourceFiles(walk);
  const ingressControllerSetups = ingressControllerReadinessSetups(sourceFiles);
  const controllerSignals = ingressControllerReadinessControllerSignals(sourceFiles);
  const ingressClassSignals = ingressControllerReadinessIngressClassSignals(sourceFiles);
  const routeSignals = ingressControllerReadinessRouteSignals(sourceFiles);
  const serviceExposureSignals = ingressControllerReadinessServiceExposureSignals(sourceFiles);
  const tlsSignals = ingressControllerReadinessTlsSignals(sourceFiles);
  const middlewareSignals = ingressControllerReadinessMiddlewareSignals(sourceFiles);
  const policySignals = ingressControllerReadinessPolicySignals(sourceFiles);
  const loadBalancingSignals = ingressControllerReadinessLoadBalancingSignals(sourceFiles);
  const observabilitySignals = ingressControllerReadinessObservabilitySignals(sourceFiles);
  const admissionSignals = ingressControllerReadinessAdmissionSignals(sourceFiles);
  const ciSignals = ingressControllerReadinessCiSignals(sourceFiles);
  const packageSignals = ingressControllerReadinessPackageSignals(sourceFiles);

  const hasController = controllerSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => ["ingress-nginx", "traefik", "envoy-gateway"].includes(item.signal) && item.readiness === "ready");
  const hasClass = ingressClassSignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.ingressClassCount > 0);
  const hasRoute = routeSignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.routeCount > 0);
  const hasExposure = serviceExposureSignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.serviceExposureCount > 0);
  const hasTls = tlsSignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.tlsCount > 0);
  const hasMiddleware = middlewareSignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.middlewareCount > 0);
  const hasPolicy = policySignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.policyCount > 0);
  const hasLoadBalancing = loadBalancingSignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.loadBalancingCount > 0);
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.observabilityCount > 0);
  const hasAdmission = admissionSignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.admissionCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || ingressControllerSetups.some((item) => item.ciCount > 0);

  const riskQueue: IngressControllerReadinessReport["riskQueue"] = [];
  if (!hasController && !hasClass) {
    riskQueue.push({
      priority: "high",
      action: "Document the ingress controller implementation and class ownership before claiming ingress readiness.",
      why: "Ingress controller readiness starts with visible ingress-nginx, Traefik, Envoy Gateway, Gateway API, IngressClass, or controller package evidence.",
      relatedHref: "html/ingress-controller-readiness.html"
    });
  }
  if (hasRoute && !hasExposure) {
    riskQueue.push({
      priority: "medium",
      action: "Map routes to LoadBalancer, NodePort, external IP, DNS, status, or address publication evidence.",
      why: "Route manifests alone do not show how external clients reach the ingress data plane.",
      relatedHref: "html/ingress-controller-readiness.html"
    });
  }
  if (hasRoute && !hasTls) {
    riskQueue.push({
      priority: "medium",
      action: "Pair public ingress routes with TLS secret, cert-manager, ACME, TLSOption, TLSStore, or backend TLS evidence.",
      why: "Ingress readiness is weak when hostname/path routing is visible but transport protection is not.",
      relatedHref: "html/ingress-controller-readiness.html"
    });
  }
  if (hasMiddleware && !hasPolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Connect middleware to explicit policy such as security policy, backend traffic policy, auth, WAF, or IP allowlist.",
      why: "Middleware can mutate or protect traffic, but learners need policy ownership to understand security and traffic behavior.",
      relatedHref: "html/ingress-controller-readiness.html"
    });
  }
  if (hasRoute && !hasLoadBalancing) {
    riskQueue.push({
      priority: "low",
      action: "Add weight, sticky session, health check, circuit breaker, retry, timeout, or canary evidence.",
      why: "Ingress route readiness is stronger when traffic distribution and failure behavior are visible.",
      relatedHref: "html/ingress-controller-readiness.html"
    });
  }
  if ((hasController || hasRoute || hasExposure) && !hasObservability) {
    riskQueue.push({
      priority: "low",
      action: "Add metrics, Prometheus, access log, tracing, dashboard, events, or kubectl plugin evidence.",
      why: "Ingress operators need route and controller visibility before debugging external traffic failures.",
      relatedHref: "html/ingress-controller-readiness.html"
    });
  }
  if ((hasController || hasClass || hasRoute) && !hasAdmission) {
    riskQueue.push({
      priority: "low",
      action: "Add validating webhook, admission controller, CRD, status update, or lint evidence.",
      why: "Ingress and Gateway API configuration is safer when malformed routes can be rejected or diagnosed before traffic changes.",
      relatedHref: "html/ingress-controller-readiness.html"
    });
  }
  if ((hasController || hasRoute || hasPolicy) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Add helm template, kubeconform, kubectl dry-run, ingress lint, route smoke, and artifact upload checks.",
      why: "Static ingress readiness is stronger when CI proves manifests render and routes remain smoke-testable.",
      relatedHref: "html/ingress-controller-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run ingress controller commands only in a trusted cluster or sandbox after reviewing this static map.",
    why: "RepoTutor records ingress controller readiness only; it does not run kubectl, helm, ingress controllers, Gateway API controllers, admission webhooks, traffic, DNS, TLS, load balancer, or CI commands.",
    relatedHref: "html/ingress-controller-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Ingress controller readiness report: setup ${ingressControllerSetups.length}개, controller signal ${controllerSignals.length}개, route signal ${routeSignals.length}개, policy signal ${policySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Ingress controller readiness ingress-nginx Traefik Envoy Gateway IngressClass IngressRoute Middleware GatewayClass Gateway HTTPRoute GRPCRoute BackendTrafficPolicy SecurityPolicy ClientTrafficPolicy TLSOption TLSStore LoadBalancer NodePort admission webhook cert-manager Prometheus access logs rate limit CI",
    ingressControllerSetups,
    controllerSignals,
    ingressClassSignals,
    routeSignals,
    serviceExposureSignals,
    tlsSignals,
    middlewareSignals,
    policySignals,
    loadBalancingSignals,
    observabilitySignals,
    admissionSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"IngressClass|kind: Ingress|ingressClassName|nginx.ingress.kubernetes.io|ingress-nginx\" .", purpose: "Inventory ingress-nginx class, route, annotation, controller, and plugin evidence." },
      { command: "rg \"IngressRoute|Middleware|TraefikService|TLSOption|TLSStore|ServersTransport|entryPoints|certificatesResolvers\" .", purpose: "Find Traefik CRDs, middleware chain, TLS, service, and entryPoint ownership." },
      { command: "rg \"GatewayClass|Gateway|HTTPRoute|GRPCRoute|BackendTrafficPolicy|ClientTrafficPolicy|SecurityPolicy|EnvoyProxy\" .", purpose: "Trace Envoy Gateway and Gateway API route, listener, policy, and proxy resources." },
      { command: "rg \"LoadBalancer|NodePort|external-dns|cert-manager|ClusterIssuer|ACME|Prometheus|access logs|rateLimit|modsecurity\" .", purpose: "Review exposure, TLS automation, observability, traffic policy, and WAF evidence." },
      { command: "rg \"helm template|kubeconform|kubectl.*dry-run|ingress lint|route-smoke|upload-artifact\" .github .", purpose: "Check CI rendering, validation, route smoke, and uploaded ingress analysis artifacts." }
    ],
    learnerNextSteps: [
      "먼저 ingress-nginx, Traefik, Envoy Gateway, Gateway API 중 어떤 controller boundary가 실제로 쓰이는지 찾으세요.",
      "IngressClass, GatewayClass, class annotation, parametersRef를 통해 어떤 controller가 어떤 route를 소유하는지 확인하세요.",
      "Ingress, IngressRoute, HTTPRoute, GRPCRoute, TCPRoute를 hostname, path, backend service, listener 단위로 묶어 보세요.",
      "LoadBalancer, NodePort, external-dns, status address가 외부 노출 경로를 어떻게 게시하는지 확인하세요.",
      "TLS secret, cert-manager, ACME, TLSOption/TLSStore, backend TLS와 middleware/policy/WAF/allowlist가 route와 연결되는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 controller install, admission webhook, DNS, certificate issuance, load balancer, traffic smoke는 안전한 cluster/sandbox에서 별도로 확인하세요."
    ]
  };
}

type IngressControllerReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function ingressControllerReadinessSourceFiles(walk: WalkResult): Promise<IngressControllerReadinessSourceFile[]> {
  const files: IngressControllerReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !ingressControllerReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 280_000);
    if (!text) continue;
    if (!ingressControllerReadinessPathSignal(file.relPath) && !ingressControllerReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function ingressControllerReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return ingressControllerReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|go\.mod|go\.sum|Cargo\.toml|pyproject\.toml|requirements\.txt|Dockerfile|helmfile\.ya?ml|Chart\.ya?ml|values\.ya?ml|kustomization\.ya?ml)$/i.test(base)
    || /\.(json|ya?ml|toml|tf|hcl|cue|rego|md|mdx|txt|sh|bash|go|rs|py|ts|tsx|js|jsx|mjs|cjs)$/i.test(filePath);
}

function ingressControllerReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(ingress|ingress[-_ ]?nginx|nginx[-_ ]?ingress|traefik|envoy[-_ ]?gateway|gateway-api|gatewayapi|gatewayclass|httproute|grpcroute|tcproute|ingressroute|middleware|tlsoption|tlsstore|serverstransport|backendtrafficpolicy|clienttrafficpolicy|securitypolicy|envoypatchpolicy|extensionpolicy|loadbalancer|nodeport|external-dns|cert-manager|clusterissuer|admission|webhook|waf|modsecurity)(\/|\.|-|_|$)|\.github\/workflows|Chart\.ya?ml|values\.ya?ml/i.test(filePath);
}

function ingressControllerReadinessContentSignal(text: string): boolean {
  return /(ingress-nginx|NGINX Ingress|nginx\.ingress\.kubernetes\.io|IngressClass|kind:\s*Ingress|ingressClassName|Traefik|IngressRoute|Middleware|TraefikService|TLSOption|TLSStore|ServersTransport|entryPoints|certificatesResolvers|Envoy Gateway|Gateway API|GatewayClass|HTTPRoute|GRPCRoute|BackendTrafficPolicy|ClientTrafficPolicy|SecurityPolicy|EnvoyProxy|EnvoyPatchPolicy|ExtensionPolicy|LoadBalancer|NodePort|external-dns|cert-manager|ClusterIssuer|ACME|ValidatingWebhookConfiguration|admission webhook|kube-webhook-certgen|Prometheus|access logs|rate.?limit|modsecurity|WAF)/i.test(text);
}

function ingressControllerReadinessSetups(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["ingressControllerSetups"] {
  const rows: IngressControllerReadinessReport["ingressControllerSetups"] = [];
  for (const source of sourceFiles) {
    const controllerCount = countMatches(source.text, /\bingress-nginx\b|\bNGINX Ingress\b|\bTraefik\b|\bEnvoy Gateway\b|\bcontroller\b|\bGateway API\b|\bEnvoyProxy\b/gi);
    const ingressClassCount = countMatches(source.text, /\bIngressClass\b|\bingressClassName\b|kubernetes\.io\/ingress\.class|ingress\.class|controllerClass|GatewayClass|gatewayClassName|parametersRef|isDefaultClass/gi);
    const routeCount = countMatches(source.text, /kind:\s*Ingress\b|\bIngressRoute\b|\bHTTPRoute\b|\bGRPCRoute\b|\bTCPRoute\b|\bGateway\b|\brules?:|\bpaths?:|\bbackend\b|\broute\b/gi);
    const serviceExposureCount = countMatches(source.text, /type:\s*LoadBalancer|type:\s*NodePort|\bLoadBalancer\b|\bNodePort\b|\bexternalIPs?\b|\bexternal-dns\b|\bloadBalancerIP\b|\bstatus\.loadBalancer\b|\bADDRESS\b/gi);
    const tlsCount = countMatches(source.text, /\btls:\b|\btls-secret\b|\bsecretName\b|cert-manager|ClusterIssuer|Issuer|ACME|certificatesResolvers|TLSOption|TLSStore|BackendTLSPolicy|backend TLS|https\b/gi);
    const middlewareCount = countMatches(source.text, /\bMiddleware\b|nginx\.ingress\.kubernetes\.io\/(rewrite-target|proxy-body-size|auth-url|enable-cors|limit-rps|limit-connections|configuration-snippet)|rewrite-target|forwardAuth|basicAuth|headers|rateLimit|cors|modsecurity|WAF/gi);
    const policyCount = countMatches(source.text, /\bBackendTrafficPolicy\b|\bClientTrafficPolicy\b|\bSecurityPolicy\b|\bEnvoyPatchPolicy\b|\bExtensionPolicy\b|IPAllowList|ipWhiteList|ipAllowList|authPolicy|JWT|OIDC|OAuth|WAF|allowlist|denylist/gi);
    const loadBalancingCount = countMatches(source.text, /weight:|weighted|sticky|affinity|healthCheck|PassiveHealthCheck|circuitBreaker|retry|timeout|canary|loadBalancer|roundRobin|leastconn/gi);
    const observabilityCount = countMatches(source.text, /\bmetrics?\b|Prometheus|prometheus\.io|access logs?|accesslog|tracing|OpenTelemetry|dashboard|events?|kubectl ingress-nginx|logs\b/gi);
    const admissionCount = countMatches(source.text, /ValidatingWebhookConfiguration|validating webhook|admission webhook|admission controller|kube-webhook-certgen|CustomResourceDefinition|\bCRD\b|status update|status publisher|ingress lint|kubectl ingress-nginx lint/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|\bgithub[-_ ]?actions\b|helm template|kubeconform|kubeval|kubectl.*dry-run|ingress-lint|ingress lint|route-smoke|gateway-smoke|upload-artifact|ingress-controller-report\.json/gi);
    const hasSetupSignal = controllerCount + ingressClassCount + routeCount + serviceExposureCount + tlsCount + middlewareCount + policyCount + loadBalancingCount + observabilityCount + admissionCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      controller: ingressControllerReadinessController(source),
      controllerCount,
      ingressClassCount,
      routeCount,
      serviceExposureCount,
      tlsCount,
      middlewareCount,
      policyCount,
      loadBalancingCount,
      observabilityCount,
      admissionCount,
      ciCount,
      readiness: controllerCount > 0 && ingressClassCount > 0 && routeCount > 0 && serviceExposureCount > 0 && tlsCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains controller ${controllerCount}, class ${ingressClassCount}, route ${routeCount}, exposure ${serviceExposureCount}, TLS ${tlsCount}, middleware ${middlewareCount}, policy ${policyCount}, load balancing ${loadBalancingCount}, observability ${observabilityCount}, admission ${admissionCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.controllerCount + b.ingressClassCount + b.routeCount + b.serviceExposureCount + b.tlsCount + b.middlewareCount + b.policyCount + b.loadBalancingCount + b.observabilityCount + b.admissionCount) - (a.controllerCount + a.ingressClassCount + a.routeCount + a.serviceExposureCount + a.tlsCount + a.middlewareCount + a.policyCount + a.loadBalancingCount + a.observabilityCount + a.admissionCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function ingressControllerReadinessController(source: IngressControllerReadinessSourceFile): IngressControllerReadinessReport["ingressControllerSetups"][number]["controller"] {
  if (/ingress[-_]?nginx|nginx[-_]?ingress/i.test(source.filePath) || /\bingress-nginx\b|\bNGINX Ingress\b|nginx\.ingress\.kubernetes\.io/i.test(source.text)) return "ingress-nginx";
  if (/traefik/i.test(source.filePath) || /\bTraefik\b|\bIngressRoute\b|\bTraefikService\b|\bTLSOption\b|\bServersTransport\b/i.test(source.text)) return "traefik";
  if (/envoy[-_]?gateway/i.test(source.filePath) || /\bEnvoy Gateway\b|\bEnvoyProxy\b|\bBackendTrafficPolicy\b|\bClientTrafficPolicy\b|\bSecurityPolicy\b/i.test(source.text)) return "envoy-gateway";
  if (/\bGateway API\b|\bGatewayClass\b|\bHTTPRoute\b|\bGRPCRoute\b/i.test(source.text)) return "gateway-api";
  if (/\bnginx\b|nginx\.conf|nginx\.tmpl/i.test(source.filePath) || /\bnginx\b|nginx\.conf|nginx\.tmpl/i.test(source.text)) return "nginx";
  if (/ingress[-_ ]?controller|gateway/i.test(source.filePath) || /ingress controller|gateway controller/i.test(source.text)) return "custom";
  return "unknown";
}

function ingressControllerReadinessControllerSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["controllerSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["controllerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ingress-nginx", pattern: /\bingress-nginx\b|\bNGINX Ingress\b|nginx\.ingress\.kubernetes\.io/i, evidence: "ingress-nginx evidence was detected." },
    { signal: "traefik", pattern: /\bTraefik\b|\bIngressRoute\b|\bTraefikService\b|\bTLSOption\b|\bServersTransport\b/i, evidence: "Traefik evidence was detected." },
    { signal: "envoy-gateway", pattern: /\bEnvoy Gateway\b|\bEnvoyProxy\b|\bBackendTrafficPolicy\b|\bClientTrafficPolicy\b|\bSecurityPolicy\b/i, evidence: "Envoy Gateway evidence was detected." },
    { signal: "gateway-api", pattern: /\bGateway API\b|\bGatewayClass\b|\bHTTPRoute\b|\bGRPCRoute\b|gateway\.networking\.k8s\.io/i, evidence: "Gateway API evidence was detected." },
    { signal: "nginx", pattern: /\bnginx\b|nginx\.conf|nginx\.tmpl/i, evidence: "NGINX controller/config evidence was detected." },
    { signal: "custom", pattern: /ingress controller|gateway controller|edge gateway/i, evidence: "custom ingress controller evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "controller", "signal");
}

function ingressControllerReadinessIngressClassSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["ingressClassSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["ingressClassSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ingress-class", pattern: /\bIngressClass\b|\bingressClassName\b/i, evidence: "IngressClass evidence was detected." },
    { signal: "controller-class", pattern: /controllerClass|spec:\s*controller|k8s\.io\/ingress-nginx|traefik\.io\/ingress-controller|gateway\.envoyproxy\.io\/gatewayclass-controller/i, evidence: "controller class evidence was detected." },
    { signal: "gateway-class", pattern: /\bGatewayClass\b|\bgatewayClassName\b/i, evidence: "GatewayClass evidence was detected." },
    { signal: "default-class", pattern: /is-default-class|ingressclass\.kubernetes\.io\/is-default-class|isDefaultClass/i, evidence: "default class evidence was detected." },
    { signal: "class-annotation", pattern: /kubernetes\.io\/ingress\.class|nginx\.ingress\.kubernetes\.io|traefik\.ingress\.kubernetes\.io/i, evidence: "class annotation evidence was detected." },
    { signal: "parameters-ref", pattern: /parametersRef|parameters:\s*ref|GatewayClassConfig|IngressClassParameters/i, evidence: "parametersRef evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "class", "signal");
}

function ingressControllerReadinessRouteSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["routeSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["routeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kubernetes-ingress", pattern: /kind:\s*Ingress\b|networking\.k8s\.io\/v1/i, evidence: "Kubernetes Ingress evidence was detected." },
    { signal: "ingress-rule", pattern: /\brules?:\b|\bhost:\b|Host\(`/i, evidence: "host/rule evidence was detected." },
    { signal: "path-rule", pattern: /\bpaths?:\b|\bpathType\b|PathPrefix\(|Path\(`/i, evidence: "path route evidence was detected." },
    { signal: "ingressroute", pattern: /\bIngressRoute\b|ingressroutes\.traefik\.io/i, evidence: "Traefik IngressRoute evidence was detected." },
    { signal: "httproute", pattern: /\bHTTPRoute\b|httproutes\.gateway\.networking\.k8s\.io/i, evidence: "HTTPRoute evidence was detected." },
    { signal: "grpcroute", pattern: /\bGRPCRoute\b|grpcroutes\.gateway\.networking\.k8s\.io/i, evidence: "GRPCRoute evidence was detected." },
    { signal: "tcproute", pattern: /\bTCPRoute\b|tcproutes\.gateway\.networking\.k8s\.io/i, evidence: "TCPRoute evidence was detected." },
    { signal: "tls-route", pattern: /\btls:\b|\bTLSRoute\b|\bwebsecure\b|\bhttps\b/i, evidence: "TLS route evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "route", "signal");
}

function ingressControllerReadinessServiceExposureSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["serviceExposureSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["serviceExposureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "loadbalancer-service", pattern: /type:\s*LoadBalancer|\bLoadBalancer\b/i, evidence: "LoadBalancer service evidence was detected." },
    { signal: "nodeport-service", pattern: /type:\s*NodePort|\bNodePort\b/i, evidence: "NodePort service evidence was detected." },
    { signal: "external-ip", pattern: /\bexternalIPs?\b|\bexternalIP\b/i, evidence: "external IP evidence was detected." },
    { signal: "external-dns", pattern: /external-dns|external-dns\.alpha\.kubernetes\.io/i, evidence: "external-dns evidence was detected." },
    { signal: "ingress-status", pattern: /status\.loadBalancer|LoadBalancer Ingress|publish-status-address|update-status|status publisher/i, evidence: "ingress status publication evidence was detected." },
    { signal: "load-balancer-ip", pattern: /loadBalancerIP|load-balancer-ip|service\.beta\.kubernetes\.io\/.*load-balancer/i, evidence: "load balancer IP annotation evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "exposure", "signal");
}

function ingressControllerReadinessTlsSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["tlsSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["tlsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tls-secret", pattern: /\btls:\b|kubernetes\.io\/tls|secretName|tls-secret/i, evidence: "TLS secret evidence was detected." },
    { signal: "cert-manager", pattern: /cert-manager|cert\.manager\.io|certmanager/i, evidence: "cert-manager evidence was detected." },
    { signal: "cluster-issuer", pattern: /\bClusterIssuer\b|cluster-issuer|issuerRef/i, evidence: "ClusterIssuer/issuer evidence was detected." },
    { signal: "acme", pattern: /\bACME\b|acme\.json|certificatesResolvers|lets.?encrypt|Let's Encrypt|tlsChallenge|httpChallenge/i, evidence: "ACME certificate evidence was detected." },
    { signal: "tls-option", pattern: /\bTLSOption\b|tlsoptions\.traefik\.io/i, evidence: "Traefik TLSOption evidence was detected." },
    { signal: "tls-store", pattern: /\bTLSStore\b|tlsstores\.traefik\.io/i, evidence: "Traefik TLSStore evidence was detected." },
    { signal: "backend-tls", pattern: /\bBackendTLSPolicy\b|backend TLS|backendProtocol:\s*HTTPS|service\.serverstransport|ServersTransport/i, evidence: "backend TLS evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "TLS", "signal");
}

function ingressControllerReadinessMiddlewareSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["middlewareSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["middlewareSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "traefik-middleware", pattern: /\bMiddleware\b|middlewares\.traefik\.io|kind:\s*Middleware/i, evidence: "Traefik Middleware evidence was detected." },
    { signal: "rewrite-target", pattern: /rewrite-target|replacePath|StripPrefix|AddPrefix|RedirectRegex/i, evidence: "rewrite middleware evidence was detected." },
    { signal: "headers", pattern: /\bheaders\b|customRequestHeaders|customResponseHeaders|X-Forwarded|proxy_set_header/i, evidence: "header middleware evidence was detected." },
    { signal: "forward-auth", pattern: /forwardAuth|auth-url|external-auth|authResponseHeaders/i, evidence: "forward auth evidence was detected." },
    { signal: "rate-limit", pattern: /rateLimit|rate.?limit|limit-rps|limit-connections/i, evidence: "rate limit middleware evidence was detected." },
    { signal: "cors", pattern: /\bCORS\b|enable-cors|access-control-allow-origin|accessControlAllowMethods/i, evidence: "CORS middleware evidence was detected." },
    { signal: "modsecurity", pattern: /modsecurity|ModSecurity|owasp-modsecurity-crs/i, evidence: "ModSecurity evidence was detected." },
    { signal: "waf", pattern: /\bWAF\b|web application firewall|owasp|coraza/i, evidence: "WAF evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "middleware", "signal");
}

function ingressControllerReadinessPolicySignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["policySignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "backend-traffic-policy", pattern: /\bBackendTrafficPolicy\b|backendtrafficpolicies\.gateway\.envoyproxy\.io/i, evidence: "BackendTrafficPolicy evidence was detected." },
    { signal: "client-traffic-policy", pattern: /\bClientTrafficPolicy\b|clienttrafficpolicies\.gateway\.envoyproxy\.io/i, evidence: "ClientTrafficPolicy evidence was detected." },
    { signal: "security-policy", pattern: /\bSecurityPolicy\b|securitypolicies\.gateway\.envoyproxy\.io/i, evidence: "SecurityPolicy evidence was detected." },
    { signal: "envoy-patch-policy", pattern: /\bEnvoyPatchPolicy\b|envoypatchpolicies\.gateway\.envoyproxy\.io/i, evidence: "EnvoyPatchPolicy evidence was detected." },
    { signal: "extension-policy", pattern: /\bExtensionPolicy\b|extensionpolicies\.gateway\.envoyproxy\.io/i, evidence: "ExtensionPolicy evidence was detected." },
    { signal: "ip-allowlist", pattern: /IPAllowList|ipWhiteList|ipAllowList|allowlist|denylist|whitelist/i, evidence: "IP allowlist evidence was detected." },
    { signal: "auth-policy", pattern: /\bJWT\b|\bOIDC\b|\bOAuth\b|basicAuth|forwardAuth|authPolicy|Authorization/i, evidence: "auth policy evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function ingressControllerReadinessLoadBalancingSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["loadBalancingSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["loadBalancingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "service-weight", pattern: /weight:|weighted|loadBalancer\.servers|TraefikService/i, evidence: "weighted service evidence was detected." },
    { signal: "sticky-session", pattern: /sticky|affinity|sessionAffinity|cookieName/i, evidence: "sticky session evidence was detected." },
    { signal: "health-check", pattern: /healthCheck|PassiveHealthCheck|readinessProbe|livenessProbe/i, evidence: "health check evidence was detected." },
    { signal: "circuit-breaker", pattern: /circuitBreaker|circuit.?breaker|Consecutive5xx|outlierDetection/i, evidence: "circuit breaker evidence was detected." },
    { signal: "retry", pattern: /\bretry\b|\bretries\b|Retry/i, evidence: "retry evidence was detected." },
    { signal: "timeout", pattern: /\btimeout\b|respondingTimeouts|idleTimeout|requestTimeout/i, evidence: "timeout evidence was detected." },
    { signal: "canary", pattern: /canary|canary-weight|service-upstream|TrafficSplit/i, evidence: "canary/traffic split evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "load-balancing", "signal");
}

function ingressControllerReadinessObservabilitySignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metrics", pattern: /\bmetrics?\b|:10254|:9100|:19001/i, evidence: "metrics evidence was detected." },
    { signal: "prometheus", pattern: /\bPrometheus\b|prometheus\.io|serviceMonitor|podMonitor/i, evidence: "Prometheus evidence was detected." },
    { signal: "access-logs", pattern: /access logs?|accesslog|accessLog|nginx logs|kubectl logs/i, evidence: "access log evidence was detected." },
    { signal: "tracing", pattern: /\btracing\b|OpenTelemetry|opentelemetry|Jaeger|Zipkin/i, evidence: "tracing evidence was detected." },
    { signal: "dashboard", pattern: /\bdashboard\b|api\.dashboard|traefik dashboard|admin console/i, evidence: "dashboard evidence was detected." },
    { signal: "events", pattern: /\bevents?\b|Event\(|kubectl describe ingress|Normal\s+CREATE|Normal\s+UPDATE/i, evidence: "Kubernetes event evidence was detected." },
    { signal: "kubectl-plugin", pattern: /kubectl ingress-nginx|ingress-nginx plugin|kubectl-plugin/i, evidence: "kubectl ingress-nginx plugin evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "observability", "signal");
}

function ingressControllerReadinessAdmissionSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["admissionSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["admissionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "validating-webhook", pattern: /ValidatingWebhookConfiguration|validating webhook/i, evidence: "validating webhook evidence was detected." },
    { signal: "admission-controller", pattern: /admission controller|admissionController|internal\/admission/i, evidence: "admission controller evidence was detected." },
    { signal: "webhook-certgen", pattern: /kube-webhook-certgen|webhook-certgen|certgen/i, evidence: "webhook cert generation evidence was detected." },
    { signal: "crd", pattern: /CustomResourceDefinition|\bCRD\b|apiextensions\.k8s\.io/i, evidence: "CRD evidence was detected." },
    { signal: "status-update", pattern: /status update|status publisher|update-status|publish-status-address|Ingress Object status/i, evidence: "status update evidence was detected." },
    { signal: "lint", pattern: /ingress lint|kubectl ingress-nginx lint|route lint|validate ingress/i, evidence: "ingress lint evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "admission", "signal");
}

function ingressControllerReadinessCiSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["ciSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "helm-template", pattern: /helm template|helm lint|chart-testing|ct lint/i, evidence: "helm render/lint evidence was detected." },
    { signal: "kubeconform", pattern: /kubeconform|kubeval|datree|conftest/i, evidence: "manifest schema validation evidence was detected." },
    { signal: "kubectl-dry-run", pattern: /kubectl.*dry-run|kubectl apply --dry-run|server-side.*dry-run/i, evidence: "kubectl dry-run evidence was detected." },
    { signal: "ingress-lint", pattern: /ingress-lint|ingress lint|kubectl ingress-nginx lint|gateway lint/i, evidence: "ingress lint CI evidence was detected." },
    { signal: "route-smoke", pattern: /route-smoke|ingress-smoke|gateway-smoke|curl.*Ingress|curl.*HTTPRoute|curl.*IngressRoute/i, evidence: "route smoke evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|ingress-controller-report\.json|ingress-analysis\.json|route-smoke\.json|gateway-smoke\.json|admission-report\.json/i, evidence: "ingress artifact upload evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function ingressControllerReadinessPackageSignals(sourceFiles: IngressControllerReadinessSourceFile[]): IngressControllerReadinessReport["packageSignals"] {
  const specs: Array<{ signal: IngressControllerReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ingress-nginx", pattern: /ingress-nginx|kubernetes\/ingress-nginx|charts\/ingress-nginx/i, evidence: "ingress-nginx package/chart evidence was detected." },
    { signal: "traefik", pattern: /\btraefik\b|traefik\.io|traefik\/traefik/i, evidence: "Traefik package/chart evidence was detected." },
    { signal: "envoy-gateway", pattern: /envoy-gateway|Envoy Gateway|gateway-helm|envoyproxy\/gateway/i, evidence: "Envoy Gateway package/chart evidence was detected." },
    { signal: "gateway-api", pattern: /gateway-api|gateway\.networking\.k8s\.io|GatewayClass|HTTPRoute/i, evidence: "Gateway API package/config evidence was detected." },
    { signal: "helm-chart", pattern: /Chart\.ya?ml|values\.ya?ml|helm install|helm upgrade|charts\//i, evidence: "Helm chart evidence was detected." },
    { signal: "cert-manager", pattern: /cert-manager|cert\.manager\.io|ClusterIssuer/i, evidence: "cert-manager package/config evidence was detected." }
  ];
  return ingressControllerReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function ingressControllerReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: IngressControllerReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/ingress-controller-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDnsReadinessReport(walk: WalkResult): Promise<DnsReadinessReport> {
  const sourceFiles = await dnsReadinessSourceFiles(walk);
  const dnsSetups = dnsReadinessSetups(sourceFiles);
  const providerSignals = dnsReadinessProviderSignals(sourceFiles);
  const sourceSignals = dnsReadinessSourceSignals(sourceFiles);
  const zoneSignals = dnsReadinessZoneSignals(sourceFiles);
  const recordSignals = dnsReadinessRecordSignals(sourceFiles);
  const ownershipSignals = dnsReadinessOwnershipSignals(sourceFiles);
  const coreDnsSignals = dnsReadinessCoreDnsSignals(sourceFiles);
  const automationSignals = dnsReadinessAutomationSignals(sourceFiles);
  const observabilitySignals = dnsReadinessObservabilitySignals(sourceFiles);
  const ciSignals = dnsReadinessCiSignals(sourceFiles);
  const packageSignals = dnsReadinessPackageSignals(sourceFiles);

  const hasProvider = providerSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasSource = sourceSignals.some((item) => item.readiness === "ready") || dnsSetups.some((item) => item.sourceCount > 0);
  const hasZone = zoneSignals.some((item) => item.readiness === "ready") || dnsSetups.some((item) => item.zoneCount > 0);
  const hasRecords = recordSignals.some((item) => item.readiness === "ready") || dnsSetups.some((item) => item.recordCount > 0);
  const hasOwnership = ownershipSignals.some((item) => item.readiness === "ready") || dnsSetups.some((item) => item.ownershipCount > 0);
  const hasAutomation = automationSignals.some((item) => item.readiness === "ready") || dnsSetups.some((item) => item.automationCount > 0);
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready") || dnsSetups.some((item) => item.observabilityCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || dnsSetups.some((item) => item.ciCount > 0);

  const riskQueue: DnsReadinessReport["riskQueue"] = [];
  if (!hasProvider && !hasSource) riskQueue.push({ priority: "high", action: "Document the DNS provider or source of truth before claiming DNS readiness.", why: "DNS readiness starts with visible ExternalDNS, CoreDNS, octoDNS, provider, source, or zone evidence.", relatedHref: "html/dns-readiness.html" });
  if (hasSource && !hasZone) riskQueue.push({ priority: "medium", action: "Map DNS sources to managed zones, domain filters, zone IDs, or split-horizon boundaries.", why: "DNS source evidence without zone ownership makes it hard to reason about blast radius.", relatedHref: "html/dns-readiness.html" });
  if (hasZone && !hasRecords) riskQueue.push({ priority: "medium", action: "Add record type evidence such as A, AAAA, CNAME, TXT, MX, NS, SRV, CAA, ALIAS, or PTR.", why: "Learners need record-shape evidence to understand what DNS data can change.", relatedHref: "html/dns-readiness.html" });
  if (hasProvider && !hasOwnership) riskQueue.push({ priority: "medium", action: "Add ownership and safety evidence such as TXT registry, txt-owner-id, upsert-only, dry-run, or policy sync boundaries.", why: "Provider automation can delete or mutate records unless ownership and policy are visible.", relatedHref: "html/dns-readiness.html" });
  if ((hasProvider || hasRecords) && !hasAutomation) riskQueue.push({ priority: "low", action: "Add plan/sync automation evidence such as octodns-sync, ExternalDNS dry-run, provider plan, or record validation.", why: "DNS readiness is stronger when changes can be reviewed before apply.", relatedHref: "html/dns-readiness.html" });
  if ((hasProvider || hasSource) && !hasObservability) riskQueue.push({ priority: "low", action: "Add health, ready, metrics, Prometheus, logs, errors, events, or dig smoke evidence.", why: "DNS failures are hard to debug without resolution and control-plane visibility.", relatedHref: "html/dns-readiness.html" });
  if ((hasProvider || hasAutomation) && !hasCi) riskQueue.push({ priority: "low", action: "Add DNS CI checks for dry-run, octoDNS validation, CoreDNS check, dig smoke, provider plan, and artifact upload.", why: "Static DNS readiness is stronger when CI records the intended changes and resolution checks.", relatedHref: "html/dns-readiness.html" });
  riskQueue.push({ priority: "low", action: "Run DNS provider, CoreDNS, octoDNS, and dig commands only in a trusted sandbox after reviewing this static map.", why: "RepoTutor records DNS readiness only; it does not query resolvers, mutate DNS providers, start CoreDNS, run octoDNS, call cloud APIs, or execute CI commands.", relatedHref: "html/dns-readiness.html" });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `DNS readiness report: setup ${dnsSetups.length}개, provider signal ${providerSignals.length}개, source signal ${sourceSignals.length}개, record signal ${recordSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "DNS readiness ExternalDNS CoreDNS octoDNS Route53 Cloudflare Google Cloud DNS Azure DNS source provider zone record TXT registry Corefile forward cache kubernetes plugin octodns-sync dry-run dig",
    dnsSetups,
    providerSignals,
    sourceSignals,
    zoneSignals,
    recordSignals,
    ownershipSignals,
    coreDnsSignals,
    automationSignals,
    observabilitySignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"external-dns|--source=|--provider=|--domain-filter|--txt-owner-id|--registry=txt|external-dns.kubernetes.io\" .", purpose: "Inventory ExternalDNS source, provider, zone filter, TXT ownership, and annotation evidence." },
      { command: "rg \"Corefile|forward|cache|kubernetes|rewrite|template|health|ready|prometheus|reload|errors|log\" .", purpose: "Review CoreDNS Corefile plugins, health, readiness, caching, forwarding, and observability." },
      { command: "rg \"octodns-sync|octodns-validate|YamlProvider|Route53Provider|CloudflareProvider|sources:|targets:|zones:\" .", purpose: "Find octoDNS providers, source/target mapping, zones, validation, and sync workflow." },
      { command: "rg \"type: (A|AAAA|CNAME|TXT|MX|NS|SRV|CAA|ALIAS|PTR)|SOA|serial|split-horizon|public|private\" .", purpose: "Trace DNS record types, zone serials, and public/private zone ownership." },
      { command: "rg \"dig |drill |nslookup|dns smoke|dns-plan|provider-plan|upload-artifact|dry-run\" .github .", purpose: "Check CI dry-run, provider plan, DNS smoke, and artifact upload evidence." }
    ],
    learnerNextSteps: [
      "먼저 DNS source of truth가 ExternalDNS, CoreDNS Corefile, octoDNS config, cloud provider, 또는 custom workflow 중 어디인지 찾으세요.",
      "source가 Service/Ingress/Gateway/CRD/file zone/provider config 중 어디서 오는지 zone boundary와 함께 묶어 보세요.",
      "domain-filter, zone-id-filter, public/private zone, split-horizon, reverse zone, SOA serial 같은 blast radius 신호를 확인하세요.",
      "A/AAAA/CNAME/TXT/MX/NS/SRV/CAA/ALIAS/PTR record shape와 TTL, ownership, sync policy를 함께 확인하세요.",
      "TXT registry, txt-owner-id, txt prefix/suffix, encryption, dry-run, upsert-only/sync policy가 shared zone 삭제 위험을 줄이는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 DNS lookup, provider mutation, CoreDNS startup, octoDNS apply는 안전한 sandbox에서 별도로 확인하세요."
    ]
  };
}

type DnsReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function dnsReadinessSourceFiles(walk: WalkResult): Promise<DnsReadinessSourceFile[]> {
  const files: DnsReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dnsReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!dnsReadinessPathSignal(file.relPath) && !dnsReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function dnsReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dnsReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|go\.mod|go\.sum|pyproject\.toml|requirements\.txt|Dockerfile|Corefile|Chart\.ya?ml|values\.ya?ml|kustomization\.ya?ml)$/i.test(base)
    || /\.(json|ya?ml|toml|tf|hcl|cue|rego|md|mdx|txt|zone|db|conf|sh|bash|go|py|ts|tsx|js|jsx|mjs|cjs|rst)$/i.test(filePath);
}

function dnsReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(dns|external-dns|coredns|corefile|octodns|route53|cloudflare|clouddns|azuredns|dnsendpoint|zone|zones|records|bind|named|resolver)(\/|\.|-|_|$)|\.github\/workflows|Corefile|Chart\.ya?ml|values\.ya?ml/i.test(filePath);
}

function dnsReadinessContentSignal(text: string): boolean {
  return /(ExternalDNS|external-dns|external-dns\.kubernetes\.io|--source=|--provider=|--domain-filter|--txt-owner-id|CoreDNS|Corefile|forward\s+\.|cache\s+\d|kubernetes\s+cluster\.local|health|ready|prometheus|octoDNS|octodns-sync|YamlProvider|Route53Provider|CloudflareProvider|zones:|sources:|targets:|type:\s*(A|AAAA|CNAME|TXT|MX|NS|SRV|CAA|ALIAS|PTR)|dig\s+|nslookup|dns smoke)/i.test(text);
}

function dnsReadinessSetups(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["dnsSetups"] {
  const rows: DnsReadinessReport["dnsSetups"] = [];
  for (const source of sourceFiles) {
    const sourceCount = countMatches(source.text, /--source=|source:\s|sources:|external-dns\.kubernetes\.io|kind:\s*(Service|Ingress|Gateway|DNSEndpoint)|EndpointSlice|YamlProvider|file\s+\/|zone file/gi);
    const providerCount = countMatches(source.text, /--provider=|provider:\s|providers:|Route53|Cloudflare|Google Cloud DNS|CloudDNS|Azure DNS|AzurePrivateDNS|DynProvider|YamlProvider|PowerDnsProvider|CoreDNS|octoDNS|external-dns/gi);
    const zoneCount = countMatches(source.text, /--domain-filter|--zone-id-filter|managedZone|hosted zone|public zone|private zone|split-horizon|reverse zone|in-addr\.arpa|ip6\.arpa|SOA|serial|zones:/gi);
    const recordCount = countMatches(source.text, /\b(A|AAAA|CNAME|TXT|MX|NS|SRV|CAA|ALIAS|PTR|SOA)\b|type:\s*(A|AAAA|CNAME|TXT|MX|NS|SRV|CAA|ALIAS|PTR)|ttl:/gi);
    const ownershipCount = countMatches(source.text, /--registry=txt|registry:\s*txt|--txt-owner-id|txt-owner-id|--txt-prefix|--txt-suffix|--txt-encrypt|TXT registry|heritage=external-dns|owner=|--policy=sync|--policy=upsert-only|--dry-run|dry-run/gi);
    const policyCount = countMatches(source.text, /policy=sync|policy=upsert-only|upsert-only|sync policy|delete|deletion|managed-record-types|exclude|include|ignore|safe|owner-id/gi);
    const coreDnsCount = countMatches(source.text, /Corefile|CoreDNS|forward\s+\.|cache\s+\d|kubernetes\s+cluster\.local|rewrite|template|health|ready|prometheus|reload|errors|log|fallthrough|transfer/gi);
    const automationCount = countMatches(source.text, /octodns-sync|octodns-validate|octodns-dump|plan|provider plan|sources:|targets:|processors:|record validation|--doit|--config-file|external-dns.*--once/gi);
    const observabilityCount = countMatches(source.text, /metrics?|Prometheus|prometheus|logs?|errors|health|ready|events?|dig\s+|drill\s+|nslookup|trace|query log/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\/|external-dns.*dry-run|octodns-validate|octodns-sync|coredns\s+-conf|coredns-check|Corefile check|dig\s+|dns smoke|provider-plan|upload-artifact|dns-readiness-report\.json/gi);
    const hasSetupSignal = sourceCount + providerCount + zoneCount + recordCount + ownershipCount + policyCount + coreDnsCount + automationCount + observabilityCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: dnsReadinessPlatform(source),
      sourceCount,
      providerCount,
      zoneCount,
      recordCount,
      ownershipCount,
      policyCount,
      coreDnsCount,
      automationCount,
      observabilityCount,
      ciCount,
      readiness: providerCount > 0 && zoneCount > 0 && recordCount > 0 && (ownershipCount > 0 || coreDnsCount > 0 || automationCount > 0) ? "ready" : "partial",
      evidence: `${source.filePath} contains source ${sourceCount}, provider ${providerCount}, zone ${zoneCount}, record ${recordCount}, ownership ${ownershipCount}, policy ${policyCount}, CoreDNS ${coreDnsCount}, automation ${automationCount}, observability ${observabilityCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.sourceCount + b.providerCount + b.zoneCount + b.recordCount + b.ownershipCount + b.coreDnsCount + b.automationCount) - (a.sourceCount + a.providerCount + a.zoneCount + a.recordCount + a.ownershipCount + a.coreDnsCount + a.automationCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function dnsReadinessPlatform(source: DnsReadinessSourceFile): DnsReadinessReport["dnsSetups"][number]["platform"] {
  if (/external-dns/i.test(source.filePath) || /ExternalDNS|external-dns/i.test(source.text)) return "external-dns";
  if (/Corefile|coredns/i.test(source.filePath) || /CoreDNS|Corefile|forward\s+\.|kubernetes\s+cluster\.local/i.test(source.text)) return "coredns";
  if (/octodns/i.test(source.filePath) || /octoDNS|octodns-sync|YamlProvider/i.test(source.text)) return "octodns";
  if (/route53/i.test(source.filePath) || /Route53|AWS Route 53/i.test(source.text)) return "route53";
  if (/cloudflare/i.test(source.filePath) || /Cloudflare|CloudFlare/i.test(source.text)) return "cloudflare";
  if (/dns/i.test(source.filePath) || /dns/i.test(source.text)) return "custom";
  return "unknown";
}

function dnsReadinessProviderSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["providerSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "external-dns", pattern: /ExternalDNS|external-dns/i, evidence: "ExternalDNS evidence was detected." },
    { signal: "route53", pattern: /Route53|route53|AWS Route 53|--provider=aws/i, evidence: "Route53 evidence was detected." },
    { signal: "cloudflare", pattern: /Cloudflare|CloudFlare|--provider=cloudflare|CloudflareProvider/i, evidence: "Cloudflare DNS evidence was detected." },
    { signal: "google-cloud-dns", pattern: /Google Cloud DNS|CloudDNS|google-cloud-dns|--provider=google|GoogleProvider/i, evidence: "Google Cloud DNS evidence was detected." },
    { signal: "azure-dns", pattern: /Azure DNS|AzurePrivateDNS|--provider=azure|AzureProvider/i, evidence: "Azure DNS evidence was detected." },
    { signal: "octodns", pattern: /octoDNS|octodns-sync|octodns\.provider/i, evidence: "octoDNS evidence was detected." },
    { signal: "coredns", pattern: /CoreDNS|Corefile|github\.com\/coredns\/coredns/i, evidence: "CoreDNS evidence was detected." },
    { signal: "custom", pattern: /dns provider|custom DNS|PowerDnsProvider|DynProvider|NS1Provider/i, evidence: "custom DNS provider evidence was detected." }
  ], "provider", "signal");
}

function dnsReadinessSourceSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["sourceSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "service", pattern: /--source=service|kind:\s*Service\b|external-dns\.kubernetes\.io\/hostname/i, evidence: "Kubernetes Service source evidence was detected." },
    { signal: "ingress", pattern: /--source=ingress|kind:\s*Ingress\b|Ingress source/i, evidence: "Ingress source evidence was detected." },
    { signal: "gateway", pattern: /--source=gateway|Gateway API|HTTPRoute|GRPCRoute|GatewayClass/i, evidence: "Gateway source evidence was detected." },
    { signal: "dnsendpoint-crd", pattern: /DNSEndpoint|externaldns\.k8s\.io|--source=crd|dnsendpoint/i, evidence: "DNSEndpoint CRD source evidence was detected." },
    { signal: "endpoint-slice", pattern: /EndpointSlice|endpointslices|discovery\.k8s\.io/i, evidence: "EndpointSlice source evidence was detected." },
    { signal: "node", pattern: /--source=node|--source=nodes|Nodes as source|\bnodes\b/i, evidence: "node source evidence was detected." },
    { signal: "file-zone", pattern: /Corefile|file\s+\/|zone file|\.zone|\.db|SOA/i, evidence: "file zone evidence was detected." },
    { signal: "yaml-provider", pattern: /YamlProvider|SplitYamlProvider|directory:\s*\.?\/?config/i, evidence: "YAML provider source evidence was detected." },
    { signal: "dynamic-zone", pattern: /dynamic zone|list_zones|zones:\s*\n\s*\*|dynamic entry/i, evidence: "dynamic zone evidence was detected." }
  ], "source", "signal");
}

function dnsReadinessZoneSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["zoneSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "domain-filter", pattern: /--domain-filter|domain-filter|domainFilters/i, evidence: "domain filter evidence was detected." },
    { signal: "zone-id-filter", pattern: /--zone-id-filter|zone-id-filter|zoneId|hostedZoneId/i, evidence: "zone ID filter evidence was detected." },
    { signal: "managed-zone", pattern: /managedZone|managed zone|hosted zone|zoneName|zones:/i, evidence: "managed zone evidence was detected." },
    { signal: "public-private-zone", pattern: /public zone|private zone|--aws-zone-type=(public|private)|public.*private|private.*public/i, evidence: "public/private zone evidence was detected." },
    { signal: "reverse-zone", pattern: /in-addr\.arpa|ip6\.arpa|reverse zone|PTR\b/i, evidence: "reverse zone evidence was detected." },
    { signal: "split-horizon", pattern: /split-horizon|split horizon|internal-hostname|public and private|internal zone/i, evidence: "split-horizon evidence was detected." },
    { signal: "soa-serial", pattern: /\bSOA\b|serial|soa serial/i, evidence: "SOA/serial evidence was detected." }
  ], "zone", "signal");
}

function dnsReadinessRecordSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["recordSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "a", pattern: /type:\s*A\b|\bA\s+IN\b|\bA record\b|managed-record-types=A\b/i, evidence: "A record evidence was detected." },
    { signal: "aaaa", pattern: /type:\s*AAAA\b|\bAAAA\s+IN\b|\bAAAA record\b/i, evidence: "AAAA record evidence was detected." },
    { signal: "cname", pattern: /type:\s*CNAME\b|\bCNAME\s+IN\b|\bCNAME record\b/i, evidence: "CNAME record evidence was detected." },
    { signal: "txt", pattern: /type:\s*TXT\b|\bTXT\s+IN\b|\bTXT record\b|registry=txt/i, evidence: "TXT record evidence was detected." },
    { signal: "mx", pattern: /type:\s*MX\b|\bMX\s+IN\b|\bMX record\b/i, evidence: "MX record evidence was detected." },
    { signal: "ns", pattern: /type:\s*NS\b|\bNS\s+IN\b|\bNS record\b/i, evidence: "NS record evidence was detected." },
    { signal: "srv", pattern: /type:\s*SRV\b|\bSRV\s+IN\b|\bSRV record\b/i, evidence: "SRV record evidence was detected." },
    { signal: "caa", pattern: /type:\s*CAA\b|\bCAA\s+IN\b|\bCAA record\b/i, evidence: "CAA record evidence was detected." },
    { signal: "alias", pattern: /type:\s*ALIAS\b|\bALIAS\b|\bANAME\b/i, evidence: "ALIAS/ANAME record evidence was detected." },
    { signal: "ptr", pattern: /type:\s*PTR\b|\bPTR\s+IN\b|\bPTR record\b|in-addr\.arpa|ip6\.arpa/i, evidence: "PTR record evidence was detected." }
  ], "record", "signal");
}

function dnsReadinessOwnershipSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["ownershipSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "txt-registry", pattern: /--registry=txt|registry:\s*txt|TXT registry/i, evidence: "TXT registry evidence was detected." },
    { signal: "txt-owner-id", pattern: /--txt-owner-id|txt-owner-id|owner-id|external-dns\/owner/i, evidence: "TXT owner ID evidence was detected." },
    { signal: "txt-prefix-suffix", pattern: /--txt-prefix|--txt-suffix|txt-prefix|txt-suffix|%{record_type}/i, evidence: "TXT prefix/suffix evidence was detected." },
    { signal: "txt-encryption", pattern: /--txt-encrypt|txt-encrypt|AES-256-GCM|encrypt.*TXT/i, evidence: "TXT encryption evidence was detected." },
    { signal: "policy-sync", pattern: /--policy=sync|policy:\s*sync|policy=sync/i, evidence: "sync policy evidence was detected." },
    { signal: "upsert-only", pattern: /--policy=upsert-only|policy:\s*upsert-only|upsert-only/i, evidence: "upsert-only policy evidence was detected." },
    { signal: "dry-run", pattern: /--dry-run|dry-run|DRY_RUN|EXTERNAL_DNS_DRY_RUN/i, evidence: "dry-run evidence was detected." }
  ], "ownership", "signal");
}

function dnsReadinessCoreDnsSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["coreDnsSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "corefile", pattern: /Corefile|\.:\s*53|corefile/i, evidence: "Corefile evidence was detected." },
    { signal: "forward", pattern: /forward\s+\.|forward\s+[a-z0-9.-]+\s+/i, evidence: "CoreDNS forward plugin evidence was detected." },
    { signal: "cache", pattern: /cache\s+\d*|plugin\/cache|coredns_cache/i, evidence: "CoreDNS cache evidence was detected." },
    { signal: "kubernetes-plugin", pattern: /kubernetes\s+cluster\.local|plugin\/kubernetes|pods\s+insecure|fallthrough/i, evidence: "CoreDNS Kubernetes plugin evidence was detected." },
    { signal: "rewrite", pattern: /rewrite\s+|plugin\/rewrite/i, evidence: "CoreDNS rewrite evidence was detected." },
    { signal: "template", pattern: /template\s+|plugin\/template/i, evidence: "CoreDNS template evidence was detected." },
    { signal: "health", pattern: /\bhealth\b|plugin\/health/i, evidence: "CoreDNS health plugin evidence was detected." },
    { signal: "ready", pattern: /\bready\b|plugin\/ready/i, evidence: "CoreDNS ready plugin evidence was detected." },
    { signal: "prometheus", pattern: /prometheus|coredns_dns_requests_total/i, evidence: "CoreDNS Prometheus evidence was detected." },
    { signal: "reload", pattern: /\breload\b|plugin\/reload/i, evidence: "CoreDNS reload evidence was detected." }
  ], "CoreDNS", "signal");
}

function dnsReadinessAutomationSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["automationSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "octodns-sync", pattern: /octodns-sync|octodns sync/i, evidence: "octoDNS sync evidence was detected." },
    { signal: "octodns-plan", pattern: /octodns.*plan|provider plan|plan output|--doit/i, evidence: "octoDNS/provider plan evidence was detected." },
    { signal: "providers-config", pattern: /providers:\s*\n|YamlProvider|Route53Provider|CloudflareProvider|GoogleProvider|AzureProvider/i, evidence: "provider config evidence was detected." },
    { signal: "sources-targets", pattern: /sources:\s*\n|targets:\s*\n|source providers|target providers/i, evidence: "source/target mapping evidence was detected." },
    { signal: "record-validation", pattern: /octodns-validate|validate records|ZoneValidator|Record.from_rrs|missing trailing|not a valid FQDN/i, evidence: "DNS record validation evidence was detected." },
    { signal: "processors", pattern: /processors:\s*\n|processor|filter processor|include|exclude/i, evidence: "octoDNS processor/filter evidence was detected." },
    { signal: "ci", pattern: /\.github\/workflows|github[-_ ]?actions|upload-artifact|dns-plan/i, evidence: "DNS automation CI evidence was detected." }
  ], "automation", "signal");
}

function dnsReadinessObservabilitySignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["observabilitySignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "metrics", pattern: /\bmetrics?\b|coredns_dns_requests_total|external_dns_registry_errors_total/i, evidence: "DNS metrics evidence was detected." },
    { signal: "prometheus", pattern: /Prometheus|prometheus|ServiceMonitor|PodMonitor/i, evidence: "Prometheus evidence was detected." },
    { signal: "logs", pattern: /\blogs?\b|query log|log-level|log-format|plugin\/log/i, evidence: "DNS log evidence was detected." },
    { signal: "errors", pattern: /\berrors\b|plugin\/errors|SERVFAIL|NXDOMAIN/i, evidence: "DNS error evidence was detected." },
    { signal: "health", pattern: /\bhealth\b|healthcheck|health check/i, evidence: "DNS health evidence was detected." },
    { signal: "ready", pattern: /\bready\b|readinessProbe|ready plugin/i, evidence: "DNS readiness evidence was detected." },
    { signal: "events", pattern: /\bevents?\b|Kubernetes Events|kubectl describe|Normal\s+UPDATE/i, evidence: "DNS event evidence was detected." },
    { signal: "dig-smoke", pattern: /dig\s+|drill\s+|nslookup|dns smoke|resolution smoke/i, evidence: "DNS smoke query evidence was detected." }
  ], "observability", "signal");
}

function dnsReadinessCiSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["ciSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "external-dns-dry-run", pattern: /external-dns.*--dry-run|EXTERNAL_DNS_DRY_RUN|external-dns.*--once/i, evidence: "ExternalDNS dry-run evidence was detected." },
    { signal: "octodns-validate", pattern: /octodns-validate|octodns.*validate|python -m octodns/i, evidence: "octoDNS validation evidence was detected." },
    { signal: "coredns-check", pattern: /coredns.*-conf|Corefile check|coredns-check|coredns -dns\.port/i, evidence: "CoreDNS check evidence was detected." },
    { signal: "dig-smoke", pattern: /dig\s+|drill\s+|nslookup|dns smoke|resolution-smoke/i, evidence: "dig/nslookup smoke evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|dns-readiness-report\.json|dns-plan\.json|dig-smoke\.json|coredns-check\.json/i, evidence: "DNS artifact upload evidence was detected." },
    { signal: "provider-plan", pattern: /provider-plan|dns-plan|octodns-sync.*--doit|octodns-sync.*--config-file|terraform plan.*dns/i, evidence: "provider plan evidence was detected." }
  ], "CI", "signal");
}

function dnsReadinessPackageSignals(sourceFiles: DnsReadinessSourceFile[]): DnsReadinessReport["packageSignals"] {
  return dnsReadinessSignalFromSpecs(sourceFiles, [
    { signal: "external-dns", pattern: /external-dns|sigs\.k8s\.io\/external-dns|registry\.k8s\.io\/external-dns/i, evidence: "ExternalDNS package/image evidence was detected." },
    { signal: "coredns", pattern: /coredns|github\.com\/coredns\/coredns|coredns\/coredns/i, evidence: "CoreDNS package/image evidence was detected." },
    { signal: "octodns", pattern: /octodns|octoDNS|octodns-sync/i, evidence: "octoDNS package evidence was detected." },
    { signal: "route53", pattern: /octodns-route53|Route53Provider|boto3|route53/i, evidence: "Route53 package/provider evidence was detected." },
    { signal: "cloudflare", pattern: /octodns-cloudflare|CloudflareProvider|cloudflare/i, evidence: "Cloudflare package/provider evidence was detected." },
    { signal: "google-cloud-dns", pattern: /octodns-google|GoogleProvider|google-cloud-dns|CloudDNS/i, evidence: "Google Cloud DNS package/provider evidence was detected." }
  ], "package", "signal");
}

function dnsReadinessSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: DnsReadinessSourceFile[],
  specs: T,
  label: string,
  labelKey: "signal"
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/dns-readiness.html"
    } as { signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildCertificateReadinessReport(walk: WalkResult): Promise<CertificateReadinessReport> {
  const sourceFiles = await certificateReadinessSourceFiles(walk);
  const certificateSetups = certificateReadinessSetups(sourceFiles);
  const platformSignals = certificateReadinessPlatformSignals(sourceFiles);
  const resourceSignals = certificateReadinessResourceSignals(sourceFiles);
  const issuerSignals = certificateReadinessIssuerSignals(sourceFiles);
  const challengeSignals = certificateReadinessChallengeSignals(sourceFiles);
  const lifecycleSignals = certificateReadinessLifecycleSignals(sourceFiles);
  const trustSignals = certificateReadinessTrustSignals(sourceFiles);
  const revocationSignals = certificateReadinessRevocationSignals(sourceFiles);
  const automationSignals = certificateReadinessAutomationSignals(sourceFiles);
  const observabilitySignals = certificateReadinessObservabilitySignals(sourceFiles);
  const ciSignals = certificateReadinessCiSignals(sourceFiles);
  const packageSignals = certificateReadinessPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasResource = resourceSignals.some((item) => item.readiness === "ready") || certificateSetups.some((item) => item.resourceCount > 0);
  const hasIssuer = issuerSignals.some((item) => item.readiness === "ready") || certificateSetups.some((item) => item.issuerCount > 0);
  const hasChallenge = challengeSignals.some((item) => item.readiness === "ready") || certificateSetups.some((item) => item.challengeCount > 0);
  const hasRenewal = lifecycleSignals.some((item) => item.readiness === "ready") || certificateSetups.some((item) => item.renewalCount > 0);
  const hasTrust = trustSignals.some((item) => item.readiness === "ready") || certificateSetups.some((item) => item.trustCount > 0);
  const hasRevocation = revocationSignals.some((item) => item.readiness === "ready") || certificateSetups.some((item) => item.revocationCount > 0);
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready") || certificateSetups.some((item) => item.observabilityCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || certificateSetups.some((item) => item.ciCount > 0);

  const riskQueue: CertificateReadinessReport["riskQueue"] = [];
  if (!hasPlatform && !hasResource) riskQueue.push({ priority: "high", action: "Document the certificate authority, certificate manager, or certificate resource before claiming certificate readiness.", why: "Certificate readiness starts with visible cert-manager, step-ca, CertMagic, ACME, issuer, certificate, or secret evidence.", relatedHref: "html/certificate-readiness.html" });
  if (hasResource && !hasIssuer) riskQueue.push({ priority: "high", action: "Pair certificate resources with issuer or CA ownership evidence.", why: "Certificates without issuer evidence cannot be tied to renewal, trust, or key custody boundaries.", relatedHref: "html/certificate-readiness.html" });
  if (hasIssuer && !hasChallenge) riskQueue.push({ priority: "medium", action: "Map ACME challenge, solver, or external account binding evidence for automated issuance.", why: "Automated issuance depends on DNS01, HTTP01, TLS-ALPN-01, solver, self-check, or EAB configuration.", relatedHref: "html/certificate-readiness.html" });
  if ((hasPlatform || hasResource) && !hasRenewal) riskQueue.push({ priority: "medium", action: "Add renewal and lifecycle evidence such as duration, renewBefore, private key rotation, keystore, status, or cache policy.", why: "Certificate outages usually come from expiry, failed renewal, key rotation, or cache/storage drift.", relatedHref: "html/certificate-readiness.html" });
  if (hasIssuer && !hasTrust) riskQueue.push({ priority: "medium", action: "Document trust distribution through root/intermediate CA, CA bundle, cainjector, trust-manager, bootstrap, or install-root flow.", why: "Issued certificates are only usable when relying parties receive the correct trust anchor.", relatedHref: "html/certificate-readiness.html" });
  if (hasIssuer && !hasRevocation) riskQueue.push({ priority: "low", action: "Add revocation or short-lived certificate evidence such as CRL, OCSP, revoke, passive revocation, or must-staple.", why: "Revocation and short-lived validity reduce blast radius when a key or certificate is compromised.", relatedHref: "html/certificate-readiness.html" });
  if ((hasPlatform || hasRenewal) && !hasObservability) riskQueue.push({ priority: "low", action: "Add certificate metrics, events, logs, webhook health, readiness, or expiration alert evidence.", why: "Certificate failures need visible expiry and controller/CA health signals before runtime incidents.", relatedHref: "html/certificate-readiness.html" });
  if ((hasPlatform || hasIssuer) && !hasCi) riskQueue.push({ priority: "low", action: "Add certificate CI checks for Helm render, kubeconform, cmctl, step-ca smoke, CertMagic tests, and artifact upload.", why: "Static readiness is stronger when CI records issuer, solver, renewal, and trust checks.", relatedHref: "html/certificate-readiness.html" });
  riskQueue.push({ priority: "low", action: "Run certificate manager, CA, ACME, DNS, TLS, and revocation commands only in a trusted sandbox after reviewing this static map.", why: "RepoTutor records certificate readiness only; it does not request certificates, mutate issuers, contact ACME/CA servers, read private keys, rotate secrets, start step-ca, or run TLS handshakes.", relatedHref: "html/certificate-readiness.html" });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Certificate readiness report: setup ${certificateSetups.length}개, platform signal ${platformSignals.length}개, issuer signal ${issuerSignals.length}개, lifecycle signal ${lifecycleSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Certificate readiness cert-manager step-ca CertMagic ACME Certificate Issuer ClusterIssuer CertificateRequest Order Challenge DNS01 HTTP01 TLS-ALPN renewBefore duration privateKey rotation Secret cainjector trust-manager root intermediate CRL OCSP cmctl step ca renew",
    certificateSetups,
    platformSignals,
    resourceSignals,
    issuerSignals,
    challengeSignals,
    lifecycleSignals,
    trustSignals,
    revocationSignals,
    automationSignals,
    observabilitySignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"kind: (Certificate|CertificateRequest|Issuer|ClusterIssuer|Order|Challenge)|cert-manager.io|secretName|renewBefore|duration|privateKey\" .", purpose: "Inventory cert-manager resources, issuer references, secret outputs, renewal windows, and private key policy." },
      { command: "rg \"ACME|DNS01|HTTP01|TLS-ALPN-01|solver|challenge|externalAccountBinding|EAB|self check|nameservers\" .", purpose: "Trace ACME challenge, solver, self-check, and EAB readiness." },
      { command: "rg \"step-ca|step ca renew|provisioner|root certificate|intermediate|bootstrap|install root|revoke|CRL|OCSP\" .", purpose: "Review CA, provisioner, trust distribution, renewal, and revocation evidence." },
      { command: "rg \"CertMagic|certmagic|OnDemand|storage|cache|OCSP|must-staple|ManageSync|ManageAsync|issuer\" .", purpose: "Find CertMagic automation, storage, cache, OCSP, and on-demand issuance signals." },
      { command: "rg \"cmctl|helm template|kubeconform|certificate smoke|step-ca smoke|certmagic test|expiration|upload-artifact\" .github .", purpose: "Check CI, smoke, expiry alert, and artifact evidence." }
    ],
    learnerNextSteps: [
      "먼저 certificate source of truth가 cert-manager resource, step-ca authority, CertMagic automation, ACME client, 또는 custom issuer 중 어디인지 찾으세요.",
      "Certificate/CertificateRequest가 있다면 Issuer/ClusterIssuer, secretName, duration, renewBefore, privateKey rotation을 함께 확인하세요.",
      "ACME issuer는 DNS01/HTTP01/TLS-ALPN-01 solver, self-check, EAB, challenge/order 흐름이 어떤 blast radius를 갖는지 확인하세요.",
      "CA 기반 흐름은 root/intermediate trust, CA bundle injection, bootstrap/install-root, revocation/OCSP/CRL 또는 short-lived certificate 정책을 확인하세요.",
      "CertMagic 기반 흐름은 storage, cache, issuer, on-demand issuance, OCSP staple, renewal worker가 운영 환경에서 안전한지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 인증서 발급, CA/ACME 호출, private key rotation, TLS handshake, revocation 테스트는 안전한 sandbox에서 별도로 확인하세요."
    ]
  };
}

type CertificateReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function certificateReadinessSourceFiles(walk: WalkResult): Promise<CertificateReadinessSourceFile[]> {
  const files: CertificateReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !certificateReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!certificateReadinessPathSignal(file.relPath) && !certificateReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function certificateReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return certificateReadinessPathSignal(filePath)
    || /^(package\.json|go\.mod|go\.sum|pyproject\.toml|requirements\.txt|Dockerfile|Chart\.ya?ml|values\.ya?ml|kustomization\.ya?ml)$/i.test(base)
    || /\.(json|ya?ml|toml|tf|hcl|cue|rego|md|mdx|txt|pem|crt|csr|key|conf|sh|bash|go|py|ts|tsx|js|jsx|mjs|cjs|rst)$/i.test(filePath);
}

function certificateReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(cert|certs|certificate|certificates|tls|ssl|pki|acme|issuer|clusterissuer|step-ca|stepca|certmagic|cainjector|trust-manager|ocsp|crl)(\/|\.|-|_|$)|\.github\/workflows|Chart\.ya?ml|values\.ya?ml/i.test(filePath);
}

function certificateReadinessContentSignal(text: string): boolean {
  return /(cert-manager|cert-manager\.io|kind:\s*(Certificate|CertificateRequest|Issuer|ClusterIssuer|Order|Challenge)|ACME|DNS01|HTTP01|TLS-ALPN|renewBefore|privateKey|secretName|cainjector|trust-manager|step-ca|step ca renew|CertMagic|certmagic|OCSP|CRL|cmctl|x509|openssl)/i.test(text);
}

function certificateReadinessSetups(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["certificateSetups"] {
  const rows: CertificateReadinessReport["certificateSetups"] = [];
  for (const source of sourceFiles) {
    const resourceCount = countMatches(source.text, /kind:\s*(Certificate|CertificateRequest|Issuer|ClusterIssuer|Order|Challenge)|cert-manager\.io|CertificateRequest|tls\.crt|tls\.key|CertificateSigningRequest/gi);
    const issuerCount = countMatches(source.text, /Issuer|ClusterIssuer|issuerRef|ACME|step-ca|Certificate Authority|CA\b|selfSigned|Vault|Let's Encrypt|letsencrypt|CertMagic|issuer/gi);
    const challengeCount = countMatches(source.text, /DNS01|HTTP01|TLS-ALPN-01|solver|challenge|Order|externalAccountBinding|EAB|self[- ]?check|recursive nameserver/gi);
    const renewalCount = countMatches(source.text, /renewBefore|duration|renewal|renew|NotAfter|expiration|expires|privateKey.*rotation|rotationPolicy|revisionHistoryLimit|keystore|jks|pkcs12|OnDemand|cache/gi);
    const secretCount = countMatches(source.text, /secretName|Secret|tls\.crt|tls\.key|ca\.crt|secretRef|private key|credential|keyFile|certFile/gi);
    const keyCount = countMatches(source.text, /privateKey|keyAlgorithm|keySize|rotationPolicy|HSM|KMS|TPM|JWK|RSA|ECDSA|Ed25519|pkcs12|jks/gi);
    const trustCount = countMatches(source.text, /root certificate|root CA|intermediate|caBundle|cainjector|trust-manager|inject-ca|bootstrap|install root|federation|trust anchor/gi);
    const revocationCount = countMatches(source.text, /CRL|OCSP|revoke|revocation|short-lived|passive revocation|must-staple|staple/gi);
    const observabilityCount = countMatches(source.text, /metrics?|Prometheus|events?|logs?|health|ready|readiness|webhook|expiration alert|expiry|cmctl status|CertificateReady/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\/|helm template|kubeconform|cmctl|step-ca smoke|certmagic test|go test|openssl x509|upload-artifact|certificate-readiness-report\.json/gi);
    const hasSetupSignal = resourceCount + issuerCount + challengeCount + renewalCount + secretCount + keyCount + trustCount + revocationCount + observabilityCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: certificateReadinessPlatform(source),
      resourceCount,
      issuerCount,
      challengeCount,
      renewalCount,
      secretCount,
      keyCount,
      trustCount,
      revocationCount,
      observabilityCount,
      ciCount,
      readiness: resourceCount > 0 && issuerCount > 0 && renewalCount > 0 && (secretCount > 0 || trustCount > 0) ? "ready" : "partial",
      evidence: `${source.filePath} contains resources ${resourceCount}, issuers ${issuerCount}, challenges ${challengeCount}, renewal ${renewalCount}, secrets ${secretCount}, keys ${keyCount}, trust ${trustCount}, revocation ${revocationCount}, observability ${observabilityCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.resourceCount + b.issuerCount + b.renewalCount + b.trustCount + b.ciCount) - (a.resourceCount + a.issuerCount + a.renewalCount + a.trustCount + a.ciCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function certificateReadinessPlatform(source: CertificateReadinessSourceFile): CertificateReadinessReport["certificateSetups"][number]["platform"] {
  if (/cert-manager/i.test(source.filePath) || /cert-manager|cert-manager\.io/i.test(source.text)) return "cert-manager";
  if (/step-ca|stepca|smallstep/i.test(source.filePath) || /step-ca|smallstep|provisioner/i.test(source.text)) return "step-ca";
  if (/certmagic/i.test(source.filePath) || /CertMagic|certmagic/i.test(source.text)) return "certmagic";
  if (/acme/i.test(source.filePath) || /\bACME\b|DNS01|HTTP01|TLS-ALPN/i.test(source.text)) return "acme";
  if (/cert|certificate|tls|pki/i.test(source.filePath) || /certificate|x509|openssl/i.test(source.text)) return "custom";
  return "unknown";
}

function certificateReadinessPlatformSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["platformSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "cert-manager", pattern: /cert-manager|cert-manager\.io/i, evidence: "cert-manager evidence was detected." },
    { signal: "step-ca", pattern: /step-ca|smallstep|provisioner|online certificate authority/i, evidence: "step-ca evidence was detected." },
    { signal: "certmagic", pattern: /CertMagic|certmagic|ManageSync|ManageAsync/i, evidence: "CertMagic evidence was detected." },
    { signal: "acme", pattern: /\bACME\b|RFC8555|DNS01|HTTP01|TLS-ALPN/i, evidence: "ACME evidence was detected." },
    { signal: "vault", pattern: /HashiCorp Vault|Vault Issuer|vault:/i, evidence: "Vault issuer evidence was detected." },
    { signal: "custom", pattern: /custom certificate|custom issuer|openssl|x509|Certificate Authority/i, evidence: "custom certificate authority evidence was detected." }
  ], "platform", "signal");
}

function certificateReadinessResourceSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["resourceSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "certificate", pattern: /kind:\s*Certificate\b|\bCertificate\b.*secretName/i, evidence: "Certificate resource evidence was detected." },
    { signal: "certificate-request", pattern: /kind:\s*CertificateRequest\b|CertificateRequests?/i, evidence: "CertificateRequest evidence was detected." },
    { signal: "issuer", pattern: /kind:\s*Issuer\b|issuerRef/i, evidence: "Issuer evidence was detected." },
    { signal: "cluster-issuer", pattern: /kind:\s*ClusterIssuer\b|ClusterIssuer/i, evidence: "ClusterIssuer evidence was detected." },
    { signal: "order", pattern: /kind:\s*Order\b|\bOrder\b.*ACME/i, evidence: "ACME Order evidence was detected." },
    { signal: "challenge", pattern: /kind:\s*Challenge\b|\bChallenge\b.*solver/i, evidence: "ACME Challenge evidence was detected." },
    { signal: "csr", pattern: /CertificateSigningRequest|\bCSR\b|x509 CertificateRequest/i, evidence: "CSR evidence was detected." },
    { signal: "secret", pattern: /secretName|kind:\s*Secret\b|tls\.crt|tls\.key|ca\.crt/i, evidence: "Secret output evidence was detected." },
    { signal: "ingress", pattern: /cert-manager\.io\/cluster-issuer|cert-manager\.io\/issuer|kind:\s*Ingress\b|ingressShim/i, evidence: "Ingress certificate automation evidence was detected." }
  ], "resource", "signal");
}

function certificateReadinessIssuerSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["issuerSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "acme", pattern: /\bACME\b|server:\s*https?:\/\/.*acme|RFC8555/i, evidence: "ACME issuer evidence was detected." },
    { signal: "ca", pattern: /\bCA\b|caBundle|ca\.crt|Certificate Authority|issuer certificate/i, evidence: "CA issuer evidence was detected." },
    { signal: "self-signed", pattern: /selfSigned|SelfSigned|self-signed/i, evidence: "self-signed issuer evidence was detected." },
    { signal: "vault", pattern: /Vault|vault:/i, evidence: "Vault issuer evidence was detected." },
    { signal: "step-ca", pattern: /step-ca|smallstep|provisioner/i, evidence: "step-ca issuer evidence was detected." },
    { signal: "lets-encrypt", pattern: /Let's Encrypt|letsencrypt|acme-v02\.api\.letsencrypt\.org/i, evidence: "Let's Encrypt evidence was detected." },
    { signal: "external", pattern: /external issuer|ExternalIssuer|issuer kind.*external|approver-policy/i, evidence: "external issuer evidence was detected." }
  ], "issuer", "signal");
}

function certificateReadinessChallengeSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["challengeSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "dns01", pattern: /DNS01|dns-01|dns01/i, evidence: "DNS01 challenge evidence was detected." },
    { signal: "http01", pattern: /HTTP01|http-01|http01|ingress solver/i, evidence: "HTTP01 challenge evidence was detected." },
    { signal: "tls-alpn-01", pattern: /TLS-ALPN-01|tls-alpn-01|TLSALPN/i, evidence: "TLS-ALPN-01 challenge evidence was detected." },
    { signal: "solver", pattern: /solver|solvers:|ACMEHTTP01|dnsNameserver/i, evidence: "solver config evidence was detected." },
    { signal: "eab", pattern: /externalAccountBinding|External Account Binding|\bEAB\b/i, evidence: "EAB evidence was detected." },
    { signal: "self-check", pattern: /self[- ]?check|recursive nameserver|--dns01-recursive-nameservers|DNS01 Self Check/i, evidence: "self-check evidence was detected." }
  ], "challenge", "signal");
}

function certificateReadinessLifecycleSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["lifecycleSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "duration", pattern: /\bduration\b|validity|lifetime|NotAfter/i, evidence: "duration/validity evidence was detected." },
    { signal: "renew-before", pattern: /renewBefore|renew before|renewal window|RenewalWindow/i, evidence: "renewBefore evidence was detected." },
    { signal: "revision-history", pattern: /revisionHistoryLimit|history limit/i, evidence: "revision history evidence was detected." },
    { signal: "private-key-rotation", pattern: /rotationPolicy|privateKey.*rotation|RotatePrivateKey|key rotation/i, evidence: "private key rotation evidence was detected." },
    { signal: "keystore", pattern: /keystores?|pkcs12|jks|PKCS#12/i, evidence: "keystore evidence was detected." },
    { signal: "status-conditions", pattern: /status:\s|conditions:|CertificateReady|Ready=True|Issuing|Renewing/i, evidence: "status condition evidence was detected." },
    { signal: "on-demand", pattern: /OnDemand|on-demand|on demand/i, evidence: "on-demand issuance evidence was detected." },
    { signal: "cache", pattern: /certificate cache|certCache|cacheCertificate|OCSPCheckInterval|Storage/i, evidence: "certificate cache/storage evidence was detected." }
  ], "lifecycle", "signal");
}

function certificateReadinessTrustSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["trustSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "root-ca", pattern: /root certificate|root CA|rootX509|trusted root/i, evidence: "root CA evidence was detected." },
    { signal: "intermediate-ca", pattern: /intermediate|online intermediate|issuer certificate/i, evidence: "intermediate CA evidence was detected." },
    { signal: "ca-bundle", pattern: /caBundle|ca\.crt|CA bundle/i, evidence: "CA bundle evidence was detected." },
    { signal: "cainjector", pattern: /cainjector|inject-ca/i, evidence: "cainjector evidence was detected." },
    { signal: "trust-manager", pattern: /trust-manager|trust manager/i, evidence: "trust-manager evidence was detected." },
    { signal: "bootstrap", pattern: /bootstrap|ca bootstrap|trust anchor/i, evidence: "bootstrap evidence was detected." },
    { signal: "install-root", pattern: /install root|root install|certificate install|distribute root/i, evidence: "install-root evidence was detected." }
  ], "trust", "signal");
}

function certificateReadinessRevocationSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["revocationSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "crl", pattern: /\bCRL\b|certificate revocation list/i, evidence: "CRL evidence was detected." },
    { signal: "ocsp", pattern: /\bOCSP\b|staple|stapling/i, evidence: "OCSP evidence was detected." },
    { signal: "revoke", pattern: /\brevoke\b|revoked|revocation/i, evidence: "revoke evidence was detected." },
    { signal: "short-lived", pattern: /short-lived|short lived|short validity|short lifetime/i, evidence: "short-lived certificate evidence was detected." },
    { signal: "passive-revocation", pattern: /passive revocation|passive-revocation/i, evidence: "passive revocation evidence was detected." },
    { signal: "must-staple", pattern: /must-staple|MustStaple|tlsfeature/i, evidence: "must-staple evidence was detected." }
  ], "revocation", "signal");
}

function certificateReadinessAutomationSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["automationSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "cmctl", pattern: /\bcmctl\b|kubectl cert-manager/i, evidence: "cmctl evidence was detected." },
    { signal: "step-ca-renew", pattern: /step ca renew|step-ca.*renew|ca\/renew/i, evidence: "step-ca renew evidence was detected." },
    { signal: "certmagic-manage", pattern: /ManageSync|ManageAsync|CertMagic|certmagic/i, evidence: "CertMagic manage evidence was detected." },
    { signal: "storage", pattern: /Storage|storage|certificates stored|asset storage|secretName/i, evidence: "certificate storage evidence was detected." },
    { signal: "issuer-config", pattern: /issuerRef|Issuer|ClusterIssuer|provisioner|issuer config/i, evidence: "issuer config evidence was detected." },
    { signal: "solver-config", pattern: /solvers:|solver|DNS01|HTTP01|TLS-ALPN/i, evidence: "solver config evidence was detected." },
    { signal: "policy", pattern: /approver-policy|policy|nameConstraints|allowed|authorization/i, evidence: "certificate policy evidence was detected." }
  ], "automation", "signal");
}

function certificateReadinessObservabilitySignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["observabilitySignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "metrics", pattern: /\bmetrics?\b|certificate_expiration|certmanager_certificate/i, evidence: "certificate metrics evidence was detected." },
    { signal: "prometheus", pattern: /Prometheus|prometheus|ServiceMonitor|PodMonitor/i, evidence: "Prometheus evidence was detected." },
    { signal: "events", pattern: /\bevents?\b|Kubernetes Events|Normal\s+Issuing|CertificateReady/i, evidence: "certificate event evidence was detected." },
    { signal: "logs", pattern: /\blogs?\b|log-level|zap\.Logger/i, evidence: "certificate log evidence was detected." },
    { signal: "health", pattern: /\bhealth\b|healthz|livenessProbe/i, evidence: "health evidence was detected." },
    { signal: "webhook", pattern: /webhook|ValidatingWebhook|MutatingWebhook|startupapicheck/i, evidence: "webhook evidence was detected." },
    { signal: "readiness", pattern: /\bready\b|readinessProbe|Ready=True|startupapicheck/i, evidence: "readiness evidence was detected." },
    { signal: "expiration-alert", pattern: /expiration alert|expiry alert|expires|NotAfter|certificate_expiration/i, evidence: "expiration alert evidence was detected." }
  ], "observability", "signal");
}

function certificateReadinessCiSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["ciSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "helm-template", pattern: /helm template|helm lint/i, evidence: "Helm template/lint evidence was detected." },
    { signal: "kubeconform", pattern: /kubeconform|kubectl.*dry-run/i, evidence: "Kubernetes manifest validation evidence was detected." },
    { signal: "cmctl-check", pattern: /cmctl check|cmctl status|cmctl inspect/i, evidence: "cmctl check evidence was detected." },
    { signal: "step-ca-smoke", pattern: /step-ca smoke|step ca certificate|step ca renew|step ca revoke/i, evidence: "step-ca smoke evidence was detected." },
    { signal: "certmagic-tests", pattern: /certmagic test|go test.*certmagic|ManageSync.*test/i, evidence: "CertMagic test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|certificate-readiness-report\.json|certificate-smoke\.json|issuer-check\.json|renewal-check\.json/i, evidence: "certificate artifact upload evidence was detected." }
  ], "CI", "signal");
}

function certificateReadinessPackageSignals(sourceFiles: CertificateReadinessSourceFile[]): CertificateReadinessReport["packageSignals"] {
  return certificateReadinessSignalFromSpecs(sourceFiles, [
    { signal: "cert-manager", pattern: /cert-manager|cert-manager\.io|quay\.io\/jetstack/i, evidence: "cert-manager package/image evidence was detected." },
    { signal: "step-ca", pattern: /step-ca|smallstep\/certificates|github\.com\/smallstep\/certificates/i, evidence: "step-ca package evidence was detected." },
    { signal: "certmagic", pattern: /certmagic|github\.com\/caddyserver\/certmagic/i, evidence: "CertMagic package evidence was detected." },
    { signal: "lego", pattern: /go-acme\/lego|\blego\b/i, evidence: "lego ACME client evidence was detected." },
    { signal: "x509", pattern: /crypto\/x509|\bx509\b/i, evidence: "x509 package evidence was detected." },
    { signal: "openssl", pattern: /openssl|OpenSSL/i, evidence: "OpenSSL evidence was detected." }
  ], "package", "signal");
}

function certificateReadinessSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: CertificateReadinessSourceFile[],
  specs: T,
  label: string,
  labelKey: "signal"
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/certificate-readiness.html"
    } as { signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
