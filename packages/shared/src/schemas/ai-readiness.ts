import { z } from "zod";

export const LlmReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  llmSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["langchain", "vercel-ai-sdk", "openai", "anthropic", "google-genai", "ollama", "llamaindex", "custom", "unknown"]),
    modelCount: z.number().int().nonnegative(),
    promptCount: z.number().int().nonnegative(),
    toolCount: z.number().int().nonnegative(),
    agentCount: z.number().int().nonnegative(),
    retrievalCount: z.number().int().nonnegative(),
    embeddingCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    streamingCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  modelSignals: z.array(z.object({
    signal: z.enum(["chat-model", "completion-model", "embedding-model", "provider-config", "model-name", "temperature", "fallback", "init-chat-model", "model-provider-config", "model-provider-inference", "provider-prefix", "configurable-model", "configurable-fields", "config-prefix", "base-chat-model", "chat-model-call-options", "chat-model-stream-v2", "chat-model-generation", "chat-model-cache", "base-cache-interface", "in-memory-cache", "cache-key-encoder", "cache-generation-serialization", "cache-chat-generation-message", "global-cache-map", "chat-model-callbacks", "model-output-version", "model-token-usage-output", "llm-result-generations", "generation-info", "generation-chunk-concat", "chat-generation-chunk", "chat-result-output", "run-key-metadata", "model-profile", "model-context-window", "model-multimodal-inputs", "model-tool-message-inputs", "model-output-modalities", "model-reasoning-output", "model-tool-capabilities", "model-structured-output-profile", "fake-built-model", "fake-model-builder", "fake-model-response-queue", "fake-model-call-capture", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  promptSignals: z.array(z.object({
    signal: z.enum(["prompt-template", "chat-prompt-template", "system-message", "human-message", "messages-placeholder", "few-shot", "few-shot-template", "example-selector", "length-based-example-selector", "semantic-similarity-example-selector", "base-prompt-selector", "conditional-prompt-selector", "prompt-selector-partials", "prompt-selector-llm-type-guard", "example-prompt", "example-separator", "partial-variables", "template-format", "mustache-template", "f-string-template", "template-parser", "template-renderer", "template-validation", "invalid-prompt-input", "message-content-template", "message-content-block", "data-content-block", "provider-content-converter", "openai-data-block", "openai-response-block", "anthropic-content-block", "content-block-merge", "openrouter-reasoning-block", "groq-reasoning-block", "ollama-reasoning-block", "deepseek-reasoning-block", "xai-reasoning-block", "google-thinking-block", "bedrock-converse-block", "bedrock-citation-block", "message-prompt-template", "chat-message-prompt-template", "role-message-prompt-template", "image-prompt-template", "image-prompt-input", "image-prompt-value", "image-content-fields", "image-url-template", "image-prompt-partial", "placeholder-coercion", "message-constructor-coercion", "message-like-coercion", "message-buffer-string", "stored-message-v1-map", "stored-message-chat-map", "chat-message-storage-map", "chat-prompt-validation", "image-prompt-parsing", "chat-prompt-flattening", "pipeline-prompt-template", "pipeline-prompts", "pipeline-final-prompt", "pipeline-input-computation", "pipeline-format-prompts", "pipeline-partial", "structured-prompt", "structured-prompt-schema", "structured-prompt-method", "structured-prompt-pipe", "structured-prompt-factory", "dict-prompt-template", "dict-prompt-template-format", "dict-input-variables", "dict-template-render", "dict-nested-template", "base-prompt-template", "base-prompt-input", "base-string-prompt-template", "prompt-value-formatting", "prompt-serialization", "prompt-partial-merge", "dynamic-system-prompt", "summary-prompt", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runnableSignals: z.array(z.object({
    signal: z.enum(["runnable-sequence", "runnable-lambda", "runnable-passthrough", "runnable-map", "pipe-chain", "invoke", "batch", "stream", "as-tool", "with-message-history", "message-history-store", "message-history-config", "message-history-keys", "message-history-insert", "message-history-persist", "message-history-input-coercion", "message-history-output-coercion", "message-history-enter-exit", "message-history-session-attach", "message-history-dedupe", "message-filter", "message-run-merge", "message-trim", "message-chunk-conversion", "response-metadata-merge", "usage-metadata-merge", "runnable-config", "config-ensure", "config-merge", "config-patch", "config-pick-keys", "base-store", "in-memory-store", "store-mget", "store-mset", "store-mdelete", "store-yield-keys", "runnable-callback-manager-config", "async-local-config", "async-local-child-config", "async-local-run-tree", "async-local-root-run-control", "async-local-context-carryover", "async-local-global-instance", "recursion-limit", "config-timeout-signal", "configurable-runtime", "runnable-branch", "branch-condition", "branch-default", "runnable-router", "router-input", "router-key-dispatch", "router-missing-key", "router-batch-concurrency", "router-stream", "runnable-binding", "config-factory", "runnable-each", "runnable-retry", "retry-attempt-handler", "runnable-with-fallbacks", "runnable-assign", "runnable-pick", "map-key-callback", "runnable-stream-log", "runnable-stream-events", "runnable-coercion", "runnable-graph", "runnable-graph-json", "runnable-graph-edge", "runnable-graph-trim-reid", "runnable-graph-mermaid", "runnable-graph-mermaid-image", "with-retry", "with-fallbacks", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  toolSignals: z.array(z.object({
    signal: z.enum(["tool", "tool-schema", "tool-calling", "agent", "agent-executor", "agent-middleware", "middleware-state-schema", "middleware-context-schema", "wrap-model-call", "wrap-tool-call", "before-model", "after-model", "before-agent", "after-agent", "dynamic-tool", "hitl-interrupt", "hitl-review-config", "headless-tool", "headless-tool-overload", "headless-tool-implementation", "headless-tool-interrupt", "headless-tool-metadata", "summarization-middleware", "context-editing", "context-clear-tool-uses", "llm-tool-selector", "ai-message-tool-calls", "fake-model-tool-calls", "tool-call-parser", "tool-call-chunk", "tool-message-artifact", "tool-message-status", "tool-response-format", "tool-return-type", "tool-content-artifact-format", "direct-tool-output", "tool-output-formatting", "tool-runnable-config", "dynamic-tool-wrapper", "dynamic-structured-tool", "tool-input-parsing-exception", "tool-callback-lifecycle", "tool-wrapper-runtime-config", "tool-wrapper-abort-signal", "openai-function-conversion", "openai-tool-conversion", "tool-strict-schema", "tool-json-schema-conversion", "tool-json-schema-cache", "tool-schema-type-guards", "server-tool-call-block", "mcp-tool", "mcp-client", "mcp-load-tools", "mcp-list-tools-pagination", "mcp-json-schema-deref", "mcp-schema-simplify", "mcp-tool-hooks", "mcp-before-tool-call", "mcp-after-tool-call", "mcp-artifact-content", "mcp-structured-content", "mcp-meta-artifact", "mcp-command-result", "mcp-tool-message", "mcp-client-fork", "mcp-progress-callback", "mcp-tool-exception", "mcp-output-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  retrievalSignals: z.array(z.object({
    signal: z.enum(["vector-store", "retriever", "embeddings", "text-splitter", "document-loader", "rag-chain", "retriever-tool", "retriever-tool-schema", "retriever-callback-child", "retriever-document-format", "base-retriever", "retriever-run-config", "retriever-start-event", "retriever-end-event", "retriever-error-event", "fake-retriever", "document-transformer", "mapping-document-transformer", "transform-documents", "document-compressor", "compress-documents", "base-document-loader", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structuredOutputSignals: z.array(z.object({
    signal: z.enum(["output-parser", "zod-schema", "with-structured-output", "content-parser-factory", "function-calling-parser-factory", "structured-output-pipeline", "include-raw-output", "raw-parsed-output", "parser-fallback", "parser-assign", "json-schema", "function-calling", "response-format", "structured-response", "fake-model-structured-response", "tool-strategy", "provider-strategy", "typed-tool-strategy", "transform-response-format", "response-format-undefined", "json-schema-support", "structured-output-errors", "tool-strategy-options", "base-output-parser", "transform-output-parser", "cumulative-output-parser", "json-output-parser", "string-output-parser", "bytes-output-parser", "list-output-parser", "xml-output-parser", "standard-schema-output-parser", "openai-functions-parser", "openai-tools-parser", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  streamingSignals: z.array(z.object({
    signal: z.enum(["stream", "stream-events", "callbacks", "tracing", "langsmith", "token-usage", "agent-run-stream", "chat-model-stream", "text-content-stream", "tool-calls-substream", "reasoning-content-stream", "usage-metadata-stream", "replay-buffer", "content-delta-assembly", "stream-output-message", "tool-block-standardization", "stream-transformer", "stream-channel", "stream-mode", "http-event-stream-wrapper", "event-stream-data-frame", "event-stream-end-frame", "readable-stream-bridge", "iterable-readable-stream-adapter", "event-source-content-type", "event-source-byte-reader", "event-source-line-parser", "event-source-message-parser", "event-source-retry-id", "event-source-data-stream", "tool-call-stream", "tool-call-stream-projection", "tool-call-output-normalization", "headless-tool-stream-interrupt", "tool-call-pending-map", "tool-call-stream-finalize", "content-block-stream", "legacy-chat-generation-bridge", "stream-event-conversion", "stream-active-blocks", "stream-image-tool-output", "stream-audio-payload", "stream-abort-signal", "stream-usage-start", "base-callback-handler", "callback-manager-config", "callback-run-manager", "custom-event-dispatch", "custom-event-node-dispatch", "custom-event-web-dispatch", "custom-event-config-required", "custom-event-parent-run", "custom-event-async-local", "event-stream-callback", "log-stream-json-patch", "log-stream-run-state", "log-stream-filtering", "log-stream-writer", "log-stream-output-tap", "log-stream-standardized-io", "log-stream-callback", "run-collector-tracer", "root-listener-tracer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["guardrail", "moderation", "refusal", "retry", "fallback", "rate-limit", "model-retry", "tool-retry", "human-in-the-loop", "pii-detection", "pii-redaction", "pii-mask", "pii-hash", "pii-block", "openai-moderation", "moderation-jump", "prompt-caching", "model-call-limit", "tool-call-limit", "serialized-load-trust-boundary", "serialized-constructor-load", "serialized-secret-map", "serialized-import-map", "serialized-escape-marker", "serialized-depth-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["langchain", "@langchain/core", "@langchain/openai", "@langchain/mcp-adapters", "@langchain/langgraph", "@modelcontextprotocol/sdk", "ai", "openai", "@anthropic-ai/sdk", "llamaindex", "ollama", "unknown"]),
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

export const LlmEvalReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  evalSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["promptfoo", "openai-evals", "openevals", "langsmith", "custom", "unknown"]),
    promptCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    testCaseCount: z.number().int().nonnegative(),
    assertionCount: z.number().int().nonnegative(),
    datasetCount: z.number().int().nonnegative(),
    judgeCount: z.number().int().nonnegative(),
    redteamCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["promptfoo-config", "eval-registry", "eval-class", "samples-jsonl", "pyproject", "package-script", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  promptSignals: z.array(z.object({
    signal: z.enum(["prompt", "prompt-file", "prompt-template", "vars", "messages", "few-shot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["provider", "model-name", "grader-model", "completion-fn", "api-key-env", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testCaseSignals: z.array(z.object({
    signal: z.enum(["tests", "vars", "assert", "expected", "rubric", "threshold", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  judgeSignals: z.array(z.object({
    signal: z.enum(["llm-rubric", "modelgraded-spec", "llm-as-judge", "correctness", "hallucination", "feedback-key", "score", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  datasetSignals: z.array(z.object({
    signal: z.enum(["samples-jsonl", "dataset", "csv", "jsonl", "reference-output", "ideal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  redteamSignals: z.array(z.object({
    signal: z.enum(["redteam", "plugins", "strategies", "jailbreak", "prompt-injection", "pii", "owasp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["promptfoo-eval", "promptfoo-redteam", "oaieval", "evaluate", "ci", "report-output", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["promptfoo", "openevals", "openai-evals", "langsmith", "deepeval", "ragas", "unknown"]),
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

export const LlmObservabilityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  observabilitySetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["langfuse", "phoenix", "helicone", "langsmith", "openinference", "opentelemetry", "custom", "unknown"]),
    traceCount: z.number().int().nonnegative(),
    spanCount: z.number().int().nonnegative(),
    generationCount: z.number().int().nonnegative(),
    sessionCount: z.number().int().nonnegative(),
    userCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    scoreCount: z.number().int().nonnegative(),
    tokenCount: z.number().int().nonnegative(),
    costCount: z.number().int().nonnegative(),
    promptCount: z.number().int().nonnegative(),
    feedbackCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  traceSignals: z.array(z.object({
    signal: z.enum(["trace", "span", "observation", "generation", "root-span", "nested-span", "trace-id", "span-id", "run-tree", "base-tracer-run", "run-map-lifecycle", "parent-child-run-order", "dotted-order", "stream-event", "run-log-patch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  instrumentationSignals: z.array(z.object({
    signal: z.enum(["observe-decorator", "openai-wrapper", "callback-handler", "callback-promise-queue", "langchain-tracer", "run-collector", "log-stream-handler", "event-stream-handler", "root-listener", "openinference", "opentelemetry", "otel-exporter", "tracer-provider", "auto-instrumentation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  identitySignals: z.array(z.object({
    signal: z.enum(["user-id", "session-id", "conversation-id", "release", "environment", "tags", "metadata", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  llmMetricSignals: z.array(z.object({
    signal: z.enum(["prompt-tokens", "completion-tokens", "total-tokens", "cost", "latency", "model-name", "provider", "cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  feedbackSignals: z.array(z.object({
    signal: z.enum(["score", "feedback", "annotation", "label", "manual-review", "thumbs-up-down", "quality", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  datasetExperimentSignals: z.array(z.object({
    signal: z.enum(["dataset", "experiment", "run", "prompt-version", "playground", "benchmark", "eval-link", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  gatewaySignals: z.array(z.object({
    signal: z.enum(["base-url", "helicone-auth", "request-header", "property-header", "rate-limit", "retry", "provider-routing", "fallback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  privacySignals: z.array(z.object({
    signal: z.enum(["masking", "redaction", "pii", "prompt-filter", "telemetry-opt-out", "telemetry-boundary", "data-retention", "data-retention-enforcement", "ssrf-protection", "io-size-limit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["export", "api-client", "dashboard", "self-host", "docker-compose", "helm", "ci", "run-tree-map", "stream-filter", "callback-queue-drain", "callback-context-clear", "trace-batch-flush", "ingestion-queue", "event-replay", "clickhouse-storage", "blob-storage", "usage-metering", "openapi-spec", "sdk-integration", "annotation-queue", "llm-as-judge", "prompt-playground", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["langfuse", "phoenix", "arize-phoenix-otel", "openinference", "opentelemetry", "helicone", "@langchain/core", "langsmith", "openai-sdk", "litellm", "llamaindex", "unknown"]),
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

export const VectorDbReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  vectorSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["qdrant", "weaviate", "chroma", "pinecone", "milvus", "pgvector", "faiss", "langchain", "custom", "unknown"]),
    collectionCount: z.number().int().nonnegative(),
    vectorConfigCount: z.number().int().nonnegative(),
    embeddingCount: z.number().int().nonnegative(),
    upsertCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    hybridCount: z.number().int().nonnegative(),
    rerankCount: z.number().int().nonnegative(),
    tenantCount: z.number().int().nonnegative(),
    replicationCount: z.number().int().nonnegative(),
    snapshotCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  collectionSignals: z.array(z.object({
    signal: z.enum(["collection", "class", "schema", "vector-config", "distance", "dimensions", "hnsw", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["qdrant-client", "weaviate-client", "chromadb-client", "http-client", "persistent-client", "api-key", "endpoint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ingestionSignals: z.array(z.object({
    signal: z.enum(["add", "upsert", "batch", "ids", "documents", "metadata", "payload", "delete", "add-vectors", "from-texts", "from-documents", "memory-vector-store", "memory-vector-ids", "indexing-record-manager", "hashed-document", "indexing-batch", "indexing-deduplicate", "fake-vector-store", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["search", "query", "nearest-neighbor", "similarity", "hybrid", "full-text", "filter", "structured-query", "comparison-filter", "operation-filter", "structured-query-visitor", "basic-translator", "functional-translator", "function-filter", "type-aware-comparators", "comparator-function", "operator-function", "functional-filter-merge", "filter-merge", "filter-value-cast", "fake-vector-search", "limit", "score", "similarity-with-score", "mmr", "as-retriever", "memory-query-vectors", "mmr-index-selection", "similarity-sort", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  embeddingSignals: z.array(z.object({
    signal: z.enum(["embedding-function", "vectorizer", "model-provider", "precomputed-vector", "sparse-vector", "multimodal", "text-splitter", "base-embeddings", "embeddings-params", "embedding-async-caller", "embed-documents", "embed-query", "custom-similarity-function", "fake-vector-embedding", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  indexSignals: z.array(z.object({
    signal: z.enum(["hnsw", "quantization", "payload-index", "vector-index", "distance-metric", "shard", "replication", "consistency", "indexing-hash", "source-id-key", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["snapshot", "backup", "restore", "health", "metrics", "migration", "multi-tenancy", "ttl", "saveable-vectorstore", "from-existing-index", "incremental-cleanup", "full-cleanup", "force-update", "record-manager-keys", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["qdrant-client", "weaviate-client", "chromadb", "pinecone", "pymilvus", "pgvector", "faiss", "@langchain/core", "langchain", "unknown"]),
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

export const SearchServiceReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  searchSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["meilisearch", "typesense", "opensearch", "elasticsearch", "algolia", "lunr", "custom", "unknown"]),
    indexCount: z.number().int().nonnegative(),
    schemaCount: z.number().int().nonnegative(),
    documentCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    facetCount: z.number().int().nonnegative(),
    rankingCount: z.number().int().nonnegative(),
    typoCount: z.number().int().nonnegative(),
    synonymCount: z.number().int().nonnegative(),
    geoCount: z.number().int().nonnegative(),
    opsCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  indexSignals: z.array(z.object({
    signal: z.enum(["index", "collection", "schema", "mapping", "fields", "primary-key", "settings", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ingestionSignals: z.array(z.object({
    signal: z.enum(["document", "add", "import", "bulk", "upsert", "batch", "delete", "refresh", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["search", "q", "query-by", "match", "bool", "filter", "sort", "facet", "pagination", "highlight", "score", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  relevanceSignals: z.array(z.object({
    signal: z.enum(["typo-tolerance", "ranking-rules", "searchable-attributes", "filterable-attributes", "sortable-attributes", "synonyms", "stop-words", "distinct", "geo", "semantic-hybrid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["meilisearch-client", "typesense-client", "opensearch-client", "host", "api-key", "nodes", "timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["tasks", "health", "dump", "snapshot", "alias", "replica", "cluster", "analytics", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["meilisearch", "typesense", "opensearch", "elasticsearch", "algolia", "instantsearch", "search-ui", "unknown"]),
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

export const ObjectStorageReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  storageSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["s3", "minio", "r2", "gcs", "azure-blob", "supabase-storage", "local", "unknown"]),
    bucketCount: z.number().int().nonnegative(),
    clientCount: z.number().int().nonnegative(),
    uploadCount: z.number().int().nonnegative(),
    downloadCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    deleteCount: z.number().int().nonnegative(),
    presignCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    replicationCount: z.number().int().nonnegative(),
    encryptionCount: z.number().int().nonnegative(),
    opsCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  bucketSignals: z.array(z.object({
    signal: z.enum(["bucket", "region", "endpoint", "path-style", "public-private", "namespace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  clientSignals: z.array(z.object({
    signal: z.enum(["s3-client", "minio-client", "r2-client", "gcs-client", "azure-blob-client", "supabase-storage-client", "credentials", "timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  objectSignals: z.array(z.object({
    signal: z.enum(["put-object", "upload", "multipart", "get-object", "download", "list-objects", "delete-object", "copy-object", "metadata", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessSignals: z.array(z.object({
    signal: z.enum(["signed-url", "presigned-post", "public-url", "policy", "acl", "cors", "rbac", "rls", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reliabilitySignals: z.array(z.object({
    signal: z.enum(["versioning", "lifecycle", "retention", "object-lock", "replication", "checksum", "etag", "retry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["sse", "kms", "encryption", "secret-key", "least-privilege", "scan", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  opsSignals: z.array(z.object({
    signal: z.enum(["health", "metrics", "backup", "restore", "migration", "event-notification", "queue", "cdn-cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["aws-sdk-s3", "lib-storage", "minio", "supabase-storage", "gcs", "azure-blob", "r2", "s3-compatible", "unknown"]),
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

export const RealtimeCollaborationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  collaborationSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["yjs", "automerge", "liveblocks", "socket-provider", "custom", "unknown"]),
    docCount: z.number().int().nonnegative(),
    sharedTypeCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    presenceCount: z.number().int().nonnegative(),
    syncCount: z.number().int().nonnegative(),
    persistenceCount: z.number().int().nonnegative(),
    conflictCount: z.number().int().nonnegative(),
    historyCount: z.number().int().nonnegative(),
    authCount: z.number().int().nonnegative(),
    commentsCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  crdtSignals: z.array(z.object({
    signal: z.enum(["y-doc", "shared-map", "shared-array", "shared-text", "automerge-doc", "change", "merge", "conflict", "transaction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  providerSignals: z.array(z.object({
    signal: z.enum(["websocket-provider", "indexeddb-provider", "liveblocks-provider", "room-provider", "yjs-provider", "broadcast-channel", "network-agnostic", "custom-provider", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  presenceSignals: z.array(z.object({
    signal: z.enum(["awareness", "presence", "cursor", "avatars", "others", "self", "broadcast-event", "user-info", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  syncSignals: z.array(z.object({
    signal: z.enum(["encode-state", "apply-update", "sync-state", "sync-message", "save-load", "incremental-save", "heads", "patches", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  persistenceSignals: z.array(z.object({
    signal: z.enum(["indexeddb", "local-storage", "doc-handle", "repo", "save", "load", "storage-root", "snapshot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  historySignals: z.array(z.object({
    signal: z.enum(["undo-manager", "undo", "redo", "history", "version", "heads", "patch-listener", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessSignals: z.array(z.object({
    signal: z.enum(["auth-endpoint", "public-api-key", "room-id", "permission", "initial-presence", "initial-storage", "user-id", "token", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["yjs", "y-websocket", "y-indexeddb", "@automerge/automerge", "@automerge/automerge-repo", "@liveblocks/client", "@liveblocks/react", "@liveblocks/yjs", "unknown"]),
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

export const WorkflowOrchestrationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  workflowSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["temporal", "inngest", "triggerdotdev", "cloudflare-workflows", "langgraph", "custom", "unknown"]),
    workflowCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    scheduleCount: z.number().int().nonnegative(),
    stepCount: z.number().int().nonnegative(),
    activityCount: z.number().int().nonnegative(),
    queueCount: z.number().int().nonnegative(),
    retryCount: z.number().int().nonnegative(),
    timeoutCount: z.number().int().nonnegative(),
    waitCount: z.number().int().nonnegative(),
    cancelCount: z.number().int().nonnegative(),
    concurrencyCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    observabilityCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  triggerSignals: z.array(z.object({
    signal: z.enum(["event", "cron", "schedule", "webhook", "manual", "api-trigger", "child-trigger", "signal", "query", "update", "graph-start", "thread-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["task", "workflow", "activity", "step", "worker", "task-queue", "function-run", "handler", "workflow-client", "workflow-handle", "update-handler", "state-graph", "graph-node", "tool-node", "compiled-graph", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  durabilitySignals: z.array(z.object({
    signal: z.enum(["retry", "timeout", "heartbeat", "checkpoint", "state-store", "resume", "history", "continue-as-new", "idempotency", "application-failure", "activity-failure", "cancellation-scope", "patching", "workflow-info", "heartbeat-details", "checkpointer", "memory-saver", "resume-command", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  flowSignals: z.array(z.object({
    signal: z.enum(["wait", "sleep", "wait-for-event", "condition", "signal-handler", "query-handler", "update-handler", "cancel", "cancellation-scope", "external-workflow", "batch", "concurrency", "rate-limit", "throttle", "priority", "child-workflow", "graph-edge", "conditional-edge", "start-end", "tool-loop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["dev-server", "deploy", "worker-pool", "isolated-runtime", "machine", "environment", "serve", "dashboard", "native-connection", "test-environment", "workflow-bundle", "replay-worker", "graph-invoke", "stream-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observabilitySignals: z.array(z.object({
    signal: z.enum(["logger", "tracing", "metadata", "tags", "run-status", "dashboard", "alerts", "metrics", "sinks", "interceptors", "workflow-info", "activity-info", "heartbeat-details", "graph-state", "stream-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@temporalio/workflow", "@temporalio/worker", "@temporalio/client", "@temporalio/activity", "@temporalio/common", "@temporalio/testing", "@temporalio/openai-agents", "inngest", "@trigger.dev/sdk", "@trigger.dev/react", "cloudflare-workflows", "@langchain/langgraph", "@langchain/langgraph-checkpoint", "langchain", "unknown"]),
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

export type LlmReadinessReport = z.infer<typeof LlmReadinessReportSchema>;
export type LlmEvalReadinessReport = z.infer<typeof LlmEvalReadinessReportSchema>;
export type LlmObservabilityReadinessReport = z.infer<typeof LlmObservabilityReadinessReportSchema>;
export type VectorDbReadinessReport = z.infer<typeof VectorDbReadinessReportSchema>;
export type SearchServiceReadinessReport = z.infer<typeof SearchServiceReadinessReportSchema>;
export type ObjectStorageReadinessReport = z.infer<typeof ObjectStorageReadinessReportSchema>;
export type RealtimeCollaborationReadinessReport = z.infer<typeof RealtimeCollaborationReadinessReportSchema>;
export type WorkflowOrchestrationReadinessReport = z.infer<typeof WorkflowOrchestrationReadinessReportSchema>;
