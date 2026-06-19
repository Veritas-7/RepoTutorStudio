import type { RealtimeMediaReadinessReport, WebSocketReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildWebSocketReadinessReport(walk: WalkResult): Promise<WebSocketReadinessReport> {
  const sourceFiles = await webSocketReadinessSourceFiles(walk);
  const webSocketSetups = webSocketReadinessSetups(sourceFiles);
  const connectionSignals = webSocketReadinessConnectionSignals(sourceFiles);
  const messageSignals = webSocketReadinessMessageSignals(sourceFiles);
  const lifecycleSignals = webSocketReadinessLifecycleSignals(sourceFiles);
  const safetySignals = webSocketReadinessSafetySignals(sourceFiles);
  const packageSignals = webSocketReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasWsPackage = packageSignals.some((item) => item.signal === "ws" && item.readiness === "ready");
  const hasSetup = webSocketSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = webSocketSetups.some((item) => item.readiness === "ready");
  const hasMessages = messageSignals.some((item) => item.readiness === "ready") || webSocketSetups.some((item) => item.messageCount > 0);
  const hasHeartbeat = lifecycleSignals.some((item) => item.signal === "ping-pong" && item.readiness === "ready") || webSocketSetups.some((item) => item.heartbeatCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || webSocketSetups.some((item) => item.safetyCount > 0);
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready");

  const riskQueue: WebSocketReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the WebSocket strategy before claiming real-time readiness.",
      why: "WebSocket readiness starts with explicit server/client, upgrade, message, lifecycle, safety, or package evidence.",
      relatedHref: "html/websocket-readiness.html"
    });
  }
  if (hasWsPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair ws package evidence with concrete WebSocketServer, connection, message, send, close/error, and heartbeat call sites.",
      why: "A WebSocket dependency alone does not prove that connections, message flow, or failure handling are wired.",
      relatedHref: "html/websocket-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasMessages) {
    riskQueue.push({
      priority: "high",
      action: "Add message handlers, send paths, parse/validation, binary handling, or broadcast documentation.",
      why: "Real-time connections are only useful when message contracts and send/receive flows are visible.",
      relatedHref: "html/websocket-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasHeartbeat) {
    riskQueue.push({
      priority: "medium",
      action: "Add ping/pong heartbeat and stale connection timeout checks.",
      why: "Long-lived sockets can silently die without heartbeat and timeout policy.",
      relatedHref: "html/websocket-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasSafety) {
    riskQueue.push({
      priority: "high",
      action: "Review origin, authentication, rate-limit, payload limit, and compression settings before exposing sockets.",
      why: "WebSocket upgrade endpoints bypass normal request/response lifecycles and need explicit boundary checks.",
      relatedHref: "html/websocket-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Add open, close, error, reconnect, and backpressure lifecycle handling.",
      why: "Socket reliability depends on observable lifecycle events and buffered send policy.",
      relatedHref: "html/websocket-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run representative WebSocket integration tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not open sockets, perform HTTP upgrades, send frames, keep timers, mutate rooms, or run the analyzed project's tests.",
    relatedHref: "html/websocket-readiness.html"
  });

  return {
    summary: `ws-style WebSocket readiness report: setup ${webSocketSetups.length}개, connection signal ${connectionSignals.length}개, message signal ${messageSignals.length}개, lifecycle signal ${lifecycleSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "ws WebSocket WebSocketServer upgrade connection message send close error ping pong perMessageDeflate backpressure maxPayload",
    webSocketSetups,
    connectionSignals,
    messageSignals,
    lifecycleSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"WebSocketServer|new WebSocket|socket.io|uWebSockets|EventSource|upgrade\" src app packages", purpose: "Inventory WebSocket servers, clients, framework wrappers, and HTTP upgrade paths." },
      { command: "rg \"connection|message|send\\(|broadcast|JSON.parse|safeParse|binary|isBinary\" src app packages test tests", purpose: "Review message handlers, send paths, serialization, validation, and binary payload handling." },
      { command: "rg \"open|close|error|ping|pong|heartbeat|reconnect|bufferedAmount|backpressure\" src app packages", purpose: "Check lifecycle handling, stale socket policy, reconnect behavior, and send buffering." },
      { command: "rg \"origin|Authorization|token|rateLimit|maxPayload|perMessageDeflate|verifyClient|authenticate\" src app packages", purpose: "Check origin, auth, payload size, compression, rate limit, and upgrade boundary controls." },
      { command: "npx vitest run", purpose: "Run local tests that cover connection setup, messages, close/error events, heartbeat, payload limits, and auth failures." }
    ],
    learnerNextSteps: [
      "먼저 WebSocketServer, new WebSocket, socket.io, uWebSockets, upgrade 경로를 찾아 server/client 경계를 확인하세요.",
      "connection, message, send, broadcast, JSON.parse, schema validation, binary 신호로 message contract와 payload 처리를 분리하세요.",
      "open, close, error, ping, pong, reconnect, bufferedAmount/backpressure 신호로 장애와 긴 연결의 운영 상태를 확인하세요.",
      "origin, Authorization/token, rateLimit, maxPayload, perMessageDeflate, verifyClient 신호로 upgrade endpoint의 안전 경계를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 socket 연결, HTTP upgrade, frame 전송, timer/heartbeat, room mutation은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type WebSocketReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function webSocketReadinessSourceFiles(walk: WalkResult): Promise<WebSocketReadinessSourceFile[]> {
  const files: WebSocketReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !webSocketReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!webSocketReadinessPathSignal(file.relPath) && !webSocketReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function webSocketReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return webSocketReadinessPathSignal(filePath)
    || /^(package\.json|websocket\.[cm]?[jt]sx?|websockets\.[cm]?[jt]sx?|socket\.[cm]?[jt]sx?|realtime\.[cm]?[jt]sx?|events\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function webSocketReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(websocket|websockets|ws|socket|sockets|socket-io|socketio|realtime|real-time|pubsub|events|gateway|channels)(\/|\.|-|_|$)/i.test(filePath);
}

function webSocketReadinessContentSignal(text: string): boolean {
  return /(from ['"]ws|require\(['"]ws|WebSocketServer|new WebSocket|handleUpgrade|on\(['"]connection|on\(['"]message|\.send\s*\(|ping\s*\(|pong\s*\(|perMessageDeflate|maxPayload|socket\.io|uWebSockets|EventSource)/i.test(text);
}

function webSocketReadinessSetups(sourceFiles: WebSocketReadinessSourceFile[]): WebSocketReadinessReport["webSocketSetups"] {
  const rows: WebSocketReadinessReport["webSocketSetups"] = [];
  for (const source of sourceFiles) {
    const serverCount = countMatches(source.text, /WebSocketServer|WebSocket\.Server|socket\.io|new Server|uWebSockets|App\(\)\.ws|EventSource|SSE/gi);
    const clientCount = countMatches(source.text, /new WebSocket|ReconnectingWebSocket|io\s*\(|connect\s*\(|WebSocket\(/gi);
    const upgradeCount = countMatches(source.text, /upgrade|handleUpgrade|noServer|Sec-WebSocket|server\.on\(['"]upgrade/gi);
    const messageCount = countMatches(source.text, /on\(['"]message|addEventListener\(['"]message|onmessage|\.send\s*\(|broadcast|emit\s*\(|JSON\.parse|safeParse|isBinary/gi);
    const heartbeatCount = countMatches(source.text, /ping\s*\(|pong\s*\(|heartbeat|isAlive|setInterval|terminate\s*\(|closeTimeout/gi);
    const safetyCount = countMatches(source.text, /origin|Authorization|token|authenticate|rateLimit|throttle|maxPayload|perMessageDeflate|verifyClient|payload|compression/gi);
    const hasSetupSignal = serverCount + clientCount + upgradeCount + messageCount + heartbeatCount + safetyCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: webSocketReadinessProvider(source),
      serverCount,
      clientCount,
      upgradeCount,
      messageCount,
      heartbeatCount,
      safetyCount,
      readiness: (serverCount > 0 || clientCount > 0) && messageCount > 0 && (heartbeatCount > 0 || safetyCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains server ${serverCount}, client ${clientCount}, upgrade ${upgradeCount}, message ${messageCount}, heartbeat ${heartbeatCount}, safety ${safetyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function webSocketReadinessProvider(source: WebSocketReadinessSourceFile): WebSocketReadinessReport["webSocketSetups"][number]["provider"] {
  if (/from ['"]ws|require\(['"]ws|WebSocketServer|WebSocket\.Server/i.test(source.text)) return "ws";
  if (/socket\.io|from ['"]socket\.io|io\s*\(/i.test(source.text)) return "socket.io";
  if (/uWebSockets|uwebsockets|App\(\)\.ws/i.test(source.text)) return "uwebsockets";
  if (/new WebSocket|WebSocket\(/i.test(source.text)) return "native-websocket";
  if (/EventSource|text\/event-stream|Server-Sent Events|SSE/i.test(source.text)) return "sse";
  if (/websocket|real-time|realtime|socket/i.test(source.text)) return "custom";
  return "unknown";
}

function webSocketReadinessConnectionSignals(sourceFiles: WebSocketReadinessSourceFile[]): WebSocketReadinessReport["connectionSignals"] {
  const specs: Array<{ signal: WebSocketReadinessReport["connectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "server", pattern: /WebSocketServer|WebSocket\.Server|new Server|App\(\)\.ws|socket\.io/i, evidence: "WebSocket server evidence was detected." },
    { signal: "client", pattern: /new WebSocket|ReconnectingWebSocket|WebSocket\(|io\s*\(/i, evidence: "WebSocket client evidence was detected." },
    { signal: "upgrade", pattern: /upgrade|handleUpgrade|noServer|Sec-WebSocket|server\.on\(['"]upgrade/i, evidence: "HTTP upgrade evidence was detected." },
    { signal: "namespace-room", pattern: /namespace|room|join\s*\(|leave\s*\(|to\s*\(|broadcast/i, evidence: "namespace, room, or broadcast connection grouping evidence was detected." },
    { signal: "reconnect", pattern: /reconnect|reconnection|retry|backoff|ReconnectingWebSocket/i, evidence: "reconnect evidence was detected." },
    { signal: "tls", pattern: /wss:|https\.createServer|TLS|SSL|cert|key\s*:/i, evidence: "TLS or secure WebSocket evidence was detected." }
  ];
  return webSocketReadinessSignalFromSpecs(sourceFiles, specs, "connection", "signal");
}

function webSocketReadinessMessageSignals(sourceFiles: WebSocketReadinessSourceFile[]): WebSocketReadinessReport["messageSignals"] {
  const specs: Array<{ signal: WebSocketReadinessReport["messageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "send", pattern: /\.send\s*\(|emit\s*\(/i, evidence: "send or emit evidence was detected." },
    { signal: "message-handler", pattern: /on\(['"]message|addEventListener\(['"]message|onmessage/i, evidence: "message handler evidence was detected." },
    { signal: "json-parse", pattern: /JSON\.parse|JSON\.stringify|serialize|deserialize/i, evidence: "JSON serialization evidence was detected." },
    { signal: "binary", pattern: /isBinary|binaryType|ArrayBuffer|Buffer\.|Blob|Uint8Array/i, evidence: "binary message evidence was detected." },
    { signal: "broadcast", pattern: /broadcast|clients\.forEach|wss\.clients|io\.to|room|namespace/i, evidence: "broadcast evidence was detected." },
    { signal: "schema-validation", pattern: /safeParse|parseAsync|z\.object|schema|validate|ajv|yup|joi/i, evidence: "message schema validation evidence was detected." }
  ];
  return webSocketReadinessSignalFromSpecs(sourceFiles, specs, "message", "signal");
}

function webSocketReadinessLifecycleSignals(sourceFiles: WebSocketReadinessSourceFile[]): WebSocketReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: WebSocketReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /on\(['"]open|addEventListener\(['"]open|onopen|readyState|OPEN/i, evidence: "open lifecycle evidence was detected." },
    { signal: "close", pattern: /on\(['"]close|addEventListener\(['"]close|onclose|\.close\s*\(|closeTimeout|CLOSED/i, evidence: "close lifecycle evidence was detected." },
    { signal: "error", pattern: /on\(['"]error|addEventListener\(['"]error|onerror|catch\s*\(|wsClientError/i, evidence: "error lifecycle evidence was detected." },
    { signal: "ping-pong", pattern: /ping\s*\(|pong\s*\(|on\(['"]ping|on\(['"]pong|heartbeat|isAlive/i, evidence: "ping/pong heartbeat evidence was detected." },
    { signal: "reconnect", pattern: /reconnect|reconnection|retry|backoff|ReconnectingWebSocket/i, evidence: "reconnect lifecycle evidence was detected." },
    { signal: "backpressure", pattern: /bufferedAmount|backpressure|drain|highWaterMark|createWebSocketStream|pause\s*\(|resume\s*\(/i, evidence: "backpressure or buffered send evidence was detected." }
  ];
  return webSocketReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function webSocketReadinessSafetySignals(sourceFiles: WebSocketReadinessSourceFile[]): WebSocketReadinessReport["safetySignals"] {
  const specs: Array<{ signal: WebSocketReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "origin-check", pattern: /origin|Origin|verifyClient|Sec-WebSocket-Origin|cors/i, evidence: "origin check evidence was detected." },
    { signal: "auth-token", pattern: /Authorization|Bearer|token|authenticate|session|cookie|jwt/i, evidence: "auth token evidence was detected." },
    { signal: "rate-limit", pattern: /rateLimit|rate-limit|throttle|quota|backoff|too many/i, evidence: "rate limit evidence was detected." },
    { signal: "payload-limit", pattern: /maxPayload|maxReceivedFrameSize|payload limit|message size|bufferutil/i, evidence: "payload size limit evidence was detected." },
    { signal: "heartbeat-timeout", pattern: /heartbeat|isAlive|setInterval|terminate\s*\(|timeout|closeTimeout/i, evidence: "heartbeat timeout evidence was detected." },
    { signal: "compression", pattern: /perMessageDeflate|permessage-deflate|compress|zlib|concurrencyLimit|threshold/i, evidence: "compression policy evidence was detected." }
  ];
  return webSocketReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function webSocketReadinessPackageSignals(sourceFiles: WebSocketReadinessSourceFile[]): WebSocketReadinessReport["packageSignals"] {
  const specs: Array<{ signal: WebSocketReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ws", pattern: /"ws"|from ['"]ws|require\(['"]ws|WebSocketServer|WebSocket\.Server/i, evidence: "ws package/import evidence was detected." },
    { signal: "socket.io", pattern: /"socket\.io"|from ['"]socket\.io|require\(['"]socket\.io|socket\.io|io\s*\(/i, evidence: "Socket.IO package/import evidence was detected." },
    { signal: "uWebSockets.js", pattern: /"uWebSockets\.js"|uWebSockets|uwebsockets|App\(\)\.ws/i, evidence: "uWebSockets.js package/import evidence was detected." },
    { signal: "isomorphic-ws", pattern: /"isomorphic-ws"|from ['"]isomorphic-ws|require\(['"]isomorphic-ws/i, evidence: "isomorphic-ws package/import evidence was detected." },
    { signal: "native-websocket", pattern: /new WebSocket|WebSocket\(/i, evidence: "native WebSocket API evidence was detected." }
  ];
  return webSocketReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function webSocketReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: WebSocketReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/websocket-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildRealtimeMediaReadinessReport(walk: WalkResult): Promise<RealtimeMediaReadinessReport> {
  const sourceFiles = await realtimeMediaSourceFiles(walk);
  const mediaSetups = realtimeMediaSetups(sourceFiles);
  const platformSignals = realtimeMediaPlatformSignals(sourceFiles);
  const roomSignals = realtimeMediaRoomSignals(sourceFiles);
  const deviceSignals = realtimeMediaDeviceSignals(sourceFiles);
  const trackSignals = realtimeMediaTrackSignals(sourceFiles);
  const transportSignals = realtimeMediaTransportSignals(sourceFiles);
  const sfuSignals = realtimeMediaSfuSignals(sourceFiles);
  const dataChannelSignals = realtimeMediaDataChannelSignals(sourceFiles);
  const qualitySignals = realtimeMediaQualitySignals(sourceFiles);
  const securitySignals = realtimeMediaSecuritySignals(sourceFiles);
  const workflowSignals = realtimeMediaWorkflowSignals(sourceFiles);
  const packageSignals = realtimeMediaPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasMediasoup = platformSignals.some((item) => item.signal === "mediasoup" && item.readiness === "ready") || packageSignals.some((item) => ["mediasoup", "mediasoup-client"].includes(item.signal) && item.readiness === "ready");
  const hasSetup = mediaSetups.some((item) => item.readiness !== "missing");
  const hasDevices = deviceSignals.some((item) => item.readiness === "ready") || mediaSetups.some((item) => item.deviceCount > 0);
  const hasTracks = trackSignals.some((item) => item.readiness === "ready") || mediaSetups.some((item) => item.mediaTrackCount > 0);
  const hasTransport = transportSignals.some((item) => item.readiness === "ready") || mediaSetups.some((item) => item.transportCount > 0 || item.iceCount > 0);
  const hasSfu = sfuSignals.some((item) => item.readiness === "ready");
  const hasSecurity = securitySignals.some((item) => item.readiness === "ready");

  const riskQueue: RealtimeMediaReadinessReport["riskQueue"] = [];
  if (!hasPlatform && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the realtime media platform before claiming WebRTC audio/video readiness.",
      why: "Realtime media readiness starts with LiveKit, mediasoup, PeerJS, native WebRTC, or another explicit room/call/signaling implementation.",
      relatedHref: "html/realtime-media-readiness.html"
    });
  }
  if (hasSetup && !hasDevices) {
    riskQueue.push({
      priority: "high",
      action: "Document getUserMedia, camera, microphone, screen share, device list, or autoplay handling.",
      why: "Browser media sessions fail early when device permission and playback requirements are not visible.",
      relatedHref: "html/realtime-media-readiness.html"
    });
  }
  if (hasSetup && !hasTracks) {
    riskQueue.push({
      priority: "high",
      action: "Record local/remote tracks, publish/subscribe paths, MediaStream, and simulcast/SVC evidence.",
      why: "Room or peer setup alone does not prove that audio/video tracks are published and rendered.",
      relatedHref: "html/realtime-media-readiness.html"
    });
  }
  if (hasSetup && !hasTransport) {
    riskQueue.push({
      priority: "medium",
      action: "Document ICE, DTLS, STUN/TURN, WebRtcTransport, send/receive transport, or RTCConfiguration evidence.",
      why: "Realtime media reliability depends on explicit transport and NAT traversal boundaries.",
      relatedHref: "html/realtime-media-readiness.html"
    });
  }
  if (hasMediasoup && !hasSfu) {
    riskQueue.push({
      priority: "medium",
      action: "Document mediasoup RTP capabilities, media codecs, producers/consumers, transport variants, SCTP, observers, score, trace, or closure handling.",
      why: "A mediasoup dependency or WebRtcTransport alone does not prove SFU routing, codec negotiation, data transport, observer, and lifecycle readiness.",
      relatedHref: "html/realtime-media-readiness.html"
    });
  }
  if (hasSetup && !hasSecurity) {
    riskQueue.push({
      priority: "medium",
      action: "Review room tokens, E2EE, media permission, track permissions, and secure signaling before live calls.",
      why: "Camera, microphone, screen share, and call signaling are privacy-sensitive surfaces.",
      relatedHref: "html/realtime-media-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify calls, device permission prompts, TURN credentials, room tokens, and media recording only in a trusted browser or media test environment.",
    why: "RepoTutor records realtime media readiness only; it does not join rooms, request camera or microphone access, connect to signaling servers, create WebRTC transports, fetch TURN credentials, publish media, record calls, or run the analyzed project's tests.",
    relatedHref: "html/realtime-media-readiness.html"
  });

  return {
    summary: `Realtime media readiness report: setup ${mediaSetups.length}개, platform signal ${platformSignals.length}개, track signal ${trackSignals.length}개, transport signal ${transportSignals.length}개, SFU signal ${sfuSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Realtime media readiness WebRTC LiveKit Room mediasoup WebRtcTransport PeerJS getUserMedia MediaStream Track publish subscribe ICE DTLS RTP capabilities mediaCodecs Producer Consumer PlainTransport PipeTransport DirectTransport SCTP observer score trace data channel E2EE",
    mediaSetups,
    platformSignals,
    roomSignals,
    deviceSignals,
    trackSignals,
    transportSignals,
    sfuSignals,
    dataChannelSignals,
    qualitySignals,
    securitySignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"LiveKit|RoomEvent|new Room|room\\.connect|localParticipant|publishTrack|setCameraEnabled|setMicrophoneEnabled\" .", purpose: "Inventory LiveKit room connection, participant, device, and track publishing evidence." },
      { command: "rg \"mediasoup|createWorker|createRouter|createWebRtcTransport|produce\\(|consume\\(|iceParameters|dtlsParameters\" .", purpose: "Review mediasoup worker, router, WebRTC transport, producer, consumer, ICE, and DTLS evidence." },
      { command: "rg \"rtpCapabilities|mediaCodecs|canConsume|createPlainTransport|createPipeTransport|createDirectTransport|enableSctp|produceData|consumeData|createActiveSpeakerObserver|createAudioLevelObserver|enableTraceEvent|transportclose|score\" .", purpose: "Review mediasoup SFU RTP capability, codec, transport variant, SCTP/data, observer, trace, score, and closure evidence." },
      { command: "rg \"new Peer|peer\\.connect|peer\\.call|getUserMedia|MediaConnection|DataConnection|call\\.answer|on\\(['\\\"]stream\" .", purpose: "Map PeerJS peer, data connection, media call, local device, and remote stream evidence." },
      { command: "rg \"RTCPeerConnection|RTCConfiguration|iceServers|stun:|turn:|RTCDataChannel|addTrack|getStats|reconnect\" .", purpose: "Check native WebRTC transport, NAT traversal, data channel, stats, and reconnect evidence." },
      { command: "rg \"e2ee|token|permission|TrackPermission|BrowserStack|playwright|media.*artifact|recording\" .", purpose: "Check privacy/security controls, browser media QA, artifacts, and recording boundaries." }
    ],
    learnerNextSteps: [
      "먼저 LiveKit, mediasoup, PeerJS, native WebRTC 중 어떤 realtime media path가 실제 entry point인지 확인하세요.",
      "room/participant/peer/call 신호 다음에 getUserMedia, camera, microphone, screen share, autoplay 처리를 확인하세요.",
      "publishTrack/produce/call/answer와 TrackSubscribed/consume/stream 이벤트를 연결해 local track과 remote render 흐름을 분리하세요.",
      "ICE, DTLS, STUN/TURN, WebRtcTransport, send/recv transport, RTCConfiguration 신호로 NAT traversal과 transport 경계를 확인하세요.",
      "mediasoup가 보이면 rtpCapabilities, mediaCodecs, producer/consumer, Plain/Pipe/Direct transport, SCTP data channel, observer, score/trace, close event를 별도 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 room join, device permission, TURN credential, media publish/recording, browser media QA는 안전한 환경에서 별도로 검증하세요."
    ]
  };
}

type RealtimeMediaSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function realtimeMediaSourceFiles(walk: WalkResult): Promise<RealtimeMediaSourceFile[]> {
  const files: RealtimeMediaSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !realtimeMediaInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!realtimeMediaPathSignal(file.relPath) && !realtimeMediaContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function realtimeMediaInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return realtimeMediaPathSignal(filePath)
    || /^(package\.json|playwright\.config\.[jt]s|vite\.config\.[jt]s)$/i.test(base)
    || /\.(ts|tsx|js|jsx|mjs|cjs|json|ya?ml|toml|md|mdx|html)$/i.test(filePath);
}

function realtimeMediaPathSignal(filePath: string): boolean {
  return /(^|\/)(webrtc|rtc|realtime[-_]?media|livekit|mediasoup|peerjs|peer|peers|room|rooms|call|calls|video|audio|media|tracks?|transports?|signaling|sfu|turn|stun|e2e|browserstack)(\/|\.|-|_|$)|\.github\/workflows/i.test(filePath);
}

function realtimeMediaContentSignal(text: string): boolean {
  return /LiveKit|RoomEvent|new\s+Room|room\.connect|localParticipant|createLocalTracks|publishTrack|setCameraEnabled|setMicrophoneEnabled|setScreenShareEnabled|mediasoup|createWebRtcTransport|WebRtcTransport|rtpCapabilities|mediaCodecs|canConsume|createPlainTransport|createPipeTransport|createDirectTransport|enableSctp|produceData|consumeData|createActiveSpeakerObserver|createAudioLevelObserver|enableTraceEvent|transportclose|produce\(|consume\(|iceParameters|dtlsParameters|new\s+Peer|peer\.call|peer\.connect|getUserMedia|MediaConnection|DataConnection|RTCPeerConnection|RTCDataChannel|iceServers|E2EE/i.test(text);
}

function realtimeMediaSetups(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["mediaSetups"] {
  const rows: RealtimeMediaReadinessReport["mediaSetups"] = [];
  for (const source of sourceFiles) {
    const roomCount = countMatches(source.text, /new\s+Room|RoomEvent|room\.connect|localParticipant|Participant|new\s+Peer|peer\.call|peer\.connect|peer\.on\(['"]call|createRouter|router\.|roomId|call\(/gi);
    const signalingCount = countMatches(source.text, /connect\(|room\.connect|SignalClient|signaling|PeerServer|host:\s*|secure:\s*|serverUrl|participantToken|token|wss?:\/\//gi);
    const mediaTrackCount = countMatches(source.text, /Track|LocalTrack|RemoteTrack|MediaStream|MediaStreamTrack|audio|video|publishTrack|TrackSubscribed|produce\(|consume\(|getTracks|addTrack|remoteStream|localStream/gi);
    const deviceCount = countMatches(source.text, /getUserMedia|mediaDevices|getLocalDevices|setCameraEnabled|setMicrophoneEnabled|setScreenShareEnabled|enableCameraAndMicrophone|camera|microphone|screen[-_ ]?share|startAudio|autoplay/gi);
    const publishCount = countMatches(source.text, /publishTrack|publishDataTrack|setCameraEnabled|setMicrophoneEnabled|setScreenShareEnabled|produce\(|peer\.call|addTrack|sendFile|tryPush|send\(/gi);
    const subscribeCount = countMatches(source.text, /TrackSubscribed|TrackUnsubscribed|consume\(|on\(['"]stream|call\.answer|attachRemote|remoteTrack|remoteStream|ondatachannel/gi);
    const dataChannelCount = countMatches(source.text, /RTCDataChannel|DataChannel|DataConnection|DataTrack|publishDataTrack|data channel|data-track|peer\.connect|conn\.on\(['"]data|performRpc|registerRpcMethod|reliable|unreliable/gi);
    const transportCount = countMatches(source.text, /RTCPeerConnection|WebRtcTransport|createWebRtcTransport|createSendTransport|createRecvTransport|sendTransport|recvTransport|transport\.connect|transport\.produce|transport\.consume|RTCConfiguration/gi);
    const iceCount = countMatches(source.text, /iceServers|iceParameters|iceCandidates|stun:|turn:|listenIps|listenInfos|announcedAddress|dtlsParameters|DTLS|ICE|rtcMinPort|rtcMaxPort/gi);
    const qualityCount = countMatches(source.text, /adaptiveStream|dynacast|ConnectionQuality|connectionQuality|quality|simulcast|svc|getStats|stats|reconnect|Reconnecting|Reconnected|bandwidth|bwe/gi);
    const recordingCount = countMatches(source.text, /recording|Recorder|MediaRecorder|egress|ingress|LocalTrackRecorder|record|captureStream/gi);
    const workflowCount = countMatches(source.text, /playwright|BrowserStack|media[-_ ]?e2e|video[-_ ]?call|upload-artifact|artifact|fuzzer|webrtc[-_ ]?test/gi)
      + (source.filePath.includes(".github/workflows") ? 1 : 0);
    const hasSetupSignal = roomCount + signalingCount + mediaTrackCount + deviceCount + publishCount + subscribeCount + dataChannelCount + transportCount + iceCount + qualityCount + recordingCount + workflowCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: realtimeMediaPlatform(source),
      roomCount,
      signalingCount,
      mediaTrackCount,
      deviceCount,
      publishCount,
      subscribeCount,
      dataChannelCount,
      transportCount,
      iceCount,
      qualityCount,
      recordingCount,
      workflowCount,
      readiness: (roomCount > 0 || transportCount > 0) && mediaTrackCount > 0 && (deviceCount > 0 || iceCount > 0 || publishCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains rooms ${roomCount}, signaling ${signalingCount}, media tracks ${mediaTrackCount}, devices ${deviceCount}, publish ${publishCount}, subscribe ${subscribeCount}, data channels ${dataChannelCount}, transports ${transportCount}, ICE/DTLS ${iceCount}, quality ${qualityCount}, recording ${recordingCount}, workflow ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function realtimeMediaPlatform(source: RealtimeMediaSourceFile): RealtimeMediaReadinessReport["mediaSetups"][number]["platform"] {
  if (/livekit/i.test(source.filePath) || /LiveKit|livekit-client|RoomEvent|localParticipant/i.test(source.text)) return "livekit";
  if (/mediasoup/i.test(source.filePath) || /mediasoup|WebRtcTransport|createWebRtcTransport|createRouter|createWorker/i.test(source.text)) return "mediasoup";
  if (/peerjs|peer/i.test(source.filePath) || /PeerJS|new\s+Peer|peer\.call|peer\.connect|MediaConnection|DataConnection/i.test(source.text)) return "peerjs";
  if (/twilio/i.test(source.filePath) || /twilio-video|connect\(\s*token|LocalVideoTrack/i.test(source.text)) return "twilio";
  if (/daily/i.test(source.filePath) || /DailyIframe|daily-js|daily\.co/i.test(source.text)) return "daily";
  if (/RTCPeerConnection|getUserMedia|RTCDataChannel/i.test(source.text)) return "webrtc";
  if (/webrtc|media|audio|video|call/i.test(source.text)) return "custom";
  return "unknown";
}

function realtimeMediaPlatformSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["platformSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "livekit", pattern: /LiveKit|livekit-client|RoomEvent|localParticipant/i, evidence: "LiveKit evidence was detected." },
    { signal: "mediasoup", pattern: /mediasoup|WebRtcTransport|createWebRtcTransport|createRouter|createWorker/i, evidence: "mediasoup evidence was detected." },
    { signal: "peerjs", pattern: /PeerJS|new\s+Peer|peer\.call|peer\.connect|MediaConnection|DataConnection/i, evidence: "PeerJS evidence was detected." },
    { signal: "native-webrtc", pattern: /RTCPeerConnection|RTCDataChannel|getUserMedia|RTCConfiguration/i, evidence: "native WebRTC evidence was detected." },
    { signal: "twilio-video", pattern: /twilio-video|Twilio\.Video|LocalVideoTrack|RemoteVideoTrack/i, evidence: "Twilio Video evidence was detected." },
    { signal: "daily", pattern: /DailyIframe|daily-js|daily\.co/i, evidence: "Daily video evidence was detected." },
    { signal: "custom", pattern: /realtime media|video call|audio call|media room|SFU/i, evidence: "custom realtime media evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function realtimeMediaRoomSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["roomSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["roomSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "room", pattern: /new\s+Room|room\.connect|RoomEvent|roomId|roomName|RoomConfiguration/i, evidence: "room evidence was detected." },
    { signal: "participant", pattern: /localParticipant|Participant|participantToken|participantSid|ParticipantConnected|ParticipantDisconnected/i, evidence: "participant evidence was detected." },
    { signal: "peer", pattern: /new\s+Peer|peer\.connect|peer\.on|PeerServer|peerId/i, evidence: "peer evidence was detected." },
    { signal: "sfu-router", pattern: /createRouter|Router|createWorker|SFU|router\.createWebRtcTransport/i, evidence: "SFU router evidence was detected." },
    { signal: "call", pattern: /peer\.call|on\(['"]call|call\.answer|video call|audio call|MediaConnection/i, evidence: "call evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "room", "signal");
}

function realtimeMediaDeviceSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["deviceSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["deviceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "get-user-media", pattern: /getUserMedia|createLocalTracks|mediaDevices/i, evidence: "getUserMedia/local track capture evidence was detected." },
    { signal: "camera", pattern: /setCameraEnabled|Track\.Source\.Camera|video:\s*true|camera/i, evidence: "camera evidence was detected." },
    { signal: "microphone", pattern: /setMicrophoneEnabled|Track\.Source\.Microphone|audio:\s*true|microphone/i, evidence: "microphone evidence was detected." },
    { signal: "screen-share", pattern: /setScreenShareEnabled|ScreenShare|getDisplayMedia|screen[-_ ]?share/i, evidence: "screen share evidence was detected." },
    { signal: "device-list", pattern: /getLocalDevices|enumerateDevices|deviceId|audioinput|videoinput/i, evidence: "device listing evidence was detected." },
    { signal: "autoplay", pattern: /startAudio|AudioPlaybackStatusChanged|canPlaybackAudio|autoplay|play\(\)/i, evidence: "autoplay/audio playback evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "device", "signal");
}

function realtimeMediaTrackSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["trackSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["trackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "local-track", pattern: /LocalTrack|localTrack|createLocalTracks|mediaStreamTrack|Track\.Source/i, evidence: "local track evidence was detected." },
    { signal: "remote-track", pattern: /RemoteTrack|remoteTrack|TrackSubscribed|remoteStream|on\(['"]stream/i, evidence: "remote track evidence was detected." },
    { signal: "publish-track", pattern: /publishTrack|produce\(|peer\.call|addTrack|setCameraEnabled|setMicrophoneEnabled/i, evidence: "publish track evidence was detected." },
    { signal: "subscribe-track", pattern: /TrackSubscribed|consume\(|TrackUnsubscribed|call\.answer|attachRemote|on\(['"]stream/i, evidence: "subscribe/render track evidence was detected." },
    { signal: "media-stream", pattern: /MediaStream|MediaStreamTrack|getTracks|srcObject|captureStream/i, evidence: "MediaStream evidence was detected." },
    { signal: "simulcast", pattern: /simulcast|svc|dynacast|scalabilityMode|encodings|bwe/i, evidence: "simulcast/SVC evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "track", "signal");
}

function realtimeMediaTransportSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["transportSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["transportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ice", pattern: /iceServers|iceParameters|iceCandidates|ICE|listenIps|listenInfos|rtcMinPort|rtcMaxPort/i, evidence: "ICE evidence was detected." },
    { signal: "dtls", pattern: /dtlsParameters|DTLS|fingerprints|transport\.connect/i, evidence: "DTLS evidence was detected." },
    { signal: "stun-turn", pattern: /stun:|turn:|TURN|STUN|announcedAddress|iceServers/i, evidence: "STUN/TURN evidence was detected." },
    { signal: "webrtc-transport", pattern: /WebRtcTransport|createWebRtcTransport|RTCPeerConnection|RTCConfiguration/i, evidence: "WebRTC transport evidence was detected." },
    { signal: "send-transport", pattern: /createSendTransport|sendTransport|producerTransport|produce\(|transport\.produce/i, evidence: "send transport evidence was detected." },
    { signal: "recv-transport", pattern: /createRecvTransport|recvTransport|consumerTransport|consume\(|transport\.consume/i, evidence: "receive transport evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "transport", "signal");
}

function realtimeMediaSfuSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["sfuSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["sfuSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rtp-capabilities", pattern: /rtpCapabilities|RtpCapabilities|router\.canConsume|canConsume/i, evidence: "RTP capabilities evidence was detected." },
    { signal: "media-codecs", pattern: /mediaCodecs|RtpCodecCapability|mimeType:\s*['"](?:audio|video)\//i, evidence: "media codec evidence was detected." },
    { signal: "producer-consumer", pattern: /\bProducer\b|\bConsumer\b|produce\(|consume\(|producerId|consumerId/i, evidence: "mediasoup producer/consumer evidence was detected." },
    { signal: "plain-transport", pattern: /PlainTransport|createPlainTransport/i, evidence: "plain transport evidence was detected." },
    { signal: "pipe-transport", pattern: /PipeTransport|createPipeTransport/i, evidence: "pipe transport evidence was detected." },
    { signal: "direct-transport", pattern: /DirectTransport|createDirectTransport/i, evidence: "direct transport evidence was detected." },
    { signal: "sctp", pattern: /enableSctp|numSctpStreams|sctpParameters|SCTP|produceData|consumeData|DataProducer|DataConsumer/i, evidence: "SCTP/data producer evidence was detected." },
    { signal: "active-speaker-observer", pattern: /createActiveSpeakerObserver|ActiveSpeakerObserver|activeSpeaker/i, evidence: "active speaker observer evidence was detected." },
    { signal: "audio-level-observer", pattern: /createAudioLevelObserver|AudioLevelObserver|audioLevel/i, evidence: "audio level observer evidence was detected." },
    { signal: "score-trace", pattern: /enableTraceEvent|trace|score|getStats|transport-cc|bwe|probation/i, evidence: "score, trace, or stats evidence was detected." },
    { signal: "transport-close", pattern: /transportclose|producerclose|consumerclose|transportClosed|producerClosed/i, evidence: "transport or producer/consumer close lifecycle evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "sfu", "signal");
}

function realtimeMediaDataChannelSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["dataChannelSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["dataChannelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "data-channel", pattern: /RTCDataChannel|createDataChannel|ondatachannel|data channel/i, evidence: "RTC data channel evidence was detected." },
    { signal: "data-track", pattern: /DataTrack|publishDataTrack|DataPacket|LocalDataTrack|RemoteDataTrack/i, evidence: "LiveKit data track evidence was detected." },
    { signal: "peer-data-connection", pattern: /DataConnection|peer\.connect|conn\.on\(['"]data|dataConnection/i, evidence: "PeerJS data connection evidence was detected." },
    { signal: "rpc", pattern: /performRpc|registerRpcMethod|RpcInvocationData|RPC/i, evidence: "RPC over realtime channel evidence was detected." },
    { signal: "reliable-unreliable", pattern: /reliable|ordered|maxRetransmits|maxPacketLifeTime|unreliable/i, evidence: "data channel reliability evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "dataChannel", "signal");
}

function realtimeMediaQualitySignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["qualitySignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["qualitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "adaptive-stream", pattern: /adaptiveStream|supportsAdaptiveStream|RemoteVideoTrack.*adaptive/i, evidence: "adaptive stream evidence was detected." },
    { signal: "dynacast", pattern: /dynacast|supportsDynacast/i, evidence: "dynacast evidence was detected." },
    { signal: "connection-quality", pattern: /ConnectionQuality|connectionQuality|ConnectionQualityChanged/i, evidence: "connection quality evidence was detected." },
    { signal: "stats", pattern: /getStats|stats|webrtc-internals|bwe|bitrate|packetLoss/i, evidence: "media stats evidence was detected." },
    { signal: "reconnect", pattern: /reconnect|Reconnecting|Reconnected|disconnected|disconnect/i, evidence: "reconnect/disconnect evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "quality", "signal");
}

function realtimeMediaSecuritySignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["securitySignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["securitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "token", pattern: /token|participantToken|accessToken|jwt|serverUrl/i, evidence: "room/signaling token evidence was detected." },
    { signal: "e2ee", pattern: /E2EE|e2ee|encryption|keyProvider|EncryptionError/i, evidence: "E2EE or encryption evidence was detected." },
    { signal: "permission", pattern: /MediaDevicesError|NotAllowedError|permission|getUserMedia|camera|microphone/i, evidence: "media permission evidence was detected." },
    { signal: "track-permission", pattern: /ParticipantTrackPermission|TrackPermission|autoSubscribe|permission/i, evidence: "track permission evidence was detected." },
    { signal: "secure-peer-server", pattern: /secure:\s*true|https:\/\/|wss:\/\/|PeerServer|tls|ssl/i, evidence: "secure peer/signaling evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "security", "signal");
}

function realtimeMediaWorkflowSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "playwright", pattern: /playwright|@media|media\.spec/i, evidence: "Playwright media QA evidence was detected." },
    { signal: "browserstack", pattern: /BrowserStack|browserstack/i, evidence: "BrowserStack media/browser evidence was detected." },
    { signal: "media-e2e", pattern: /media[-_ ]?e2e|video[-_ ]?call|datachannel|mediachannel|webrtc[-_ ]?test/i, evidence: "media E2E evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact|playwright-report|media-call-report|screenshots?|recordings?/i, evidence: "media artifact upload evidence was detected." },
    { signal: "fuzzer", pattern: /fuzzer|MS_FUZZ|libFuzzer|rtp-corpus|rtcp-corpus/i, evidence: "media transport fuzzer evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function realtimeMediaPackageSignals(sourceFiles: RealtimeMediaSourceFile[]): RealtimeMediaReadinessReport["packageSignals"] {
  const specs: Array<{ signal: RealtimeMediaReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "livekit-client", pattern: /"livekit-client"|from ['"]livekit-client|livekit-client/i, evidence: "livekit-client package evidence was detected." },
    { signal: "mediasoup", pattern: /"mediasoup"|from ['"]mediasoup|require\(['"]mediasoup|mediasoup/i, evidence: "mediasoup package evidence was detected." },
    { signal: "mediasoup-client", pattern: /"mediasoup-client"|from ['"]mediasoup-client|mediasoup-client/i, evidence: "mediasoup-client package evidence was detected." },
    { signal: "peerjs", pattern: /"peerjs"|from ['"]peerjs|PeerJS|new\s+Peer/i, evidence: "peerjs package evidence was detected." },
    { signal: "simple-peer", pattern: /"simple-peer"|from ['"]simple-peer|new\s+SimplePeer/i, evidence: "simple-peer package evidence was detected." },
    { signal: "webrtc-adapter", pattern: /"webrtc-adapter"|from ['"]webrtc-adapter|adapter\.js/i, evidence: "webrtc-adapter package evidence was detected." }
  ];
  return realtimeMediaSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function realtimeMediaSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: RealtimeMediaSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/realtime-media-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
