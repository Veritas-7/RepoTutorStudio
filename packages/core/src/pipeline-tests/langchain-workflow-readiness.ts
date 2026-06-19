// biome-ignore-all lint/suspicious/noTemplateCurlyInString: test fixtures assert literal template syntax from source snapshots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "../index.js";

const fixtureRoot = path.resolve("packages/core/tests/fixtures/simple-ts-app");

describe("RepoTutor core pipeline - langchain-workflow-readiness", () => {
  it("detects LangChain MCP adapter readiness without calling MCP servers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-mcp-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-mcp-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        "@langchain/langgraph": "latest",
        "@langchain/mcp-adapters": "latest",
        "@langchain/openai": "latest",
        "@modelcontextprotocol/sdk": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "mcp-adapters.ts"), [
      "import { ChatOpenAI } from \"@langchain/openai\";",
      "import { DynamicStructuredTool } from \"@langchain/core/tools\";",
      "import { ToolMessage } from \"@langchain/core/messages\";",
      "import { Command } from \"@langchain/langgraph\";",
      "import { Client } from \"@modelcontextprotocol/sdk/client/index.js\";",
      "import { CallToolResult } from \"@modelcontextprotocol/sdk/types.js\";",
      "import { loadMcpTools, ToolCallRequest, ToolCallModification, ModifiedToolCallResult, ToolHooks, toolHooksSchema } from \"@langchain/mcp-adapters\";",
      "",
      "const model = new ChatOpenAI({ model: \"gpt-4o-mini\", temperature: 0, apiKey: process.env.OPENAI_API_KEY });",
      "const hooks: ToolHooks = {",
      "  beforeToolCall: async (request: ToolCallRequest): Promise<ToolCallModification> => ({ args: { ...request.args, tenant: \"fixture\" } }),",
      "  afterToolCall: async (_request: ToolCallRequest, result: CallToolResult): Promise<ModifiedToolCallResult> => {",
      "    const message = new ToolMessage({ tool_call_id: \"fixture\", content: JSON.stringify(result.structuredContent ?? {}) });",
      "    return new Command({ update: { mcp_structured_content: result.structuredContent, mcp_meta: result._meta, message } });",
      "  },",
      "};",
      "",
      "export async function loadStaticMcpTools(client: Client) {",
      "  const forked = client.fork({ headers: { \"x-repotutor\": \"fixture\" } });",
      "  const tools = await loadMcpTools(\"docs\", forked, {",
      "    throwOnLoadError: true,",
      "    prefixToolNameWithServerName: true,",
      "    additionalToolNamePrefix: \"safe_\",",
      "    useStandardContentBlocks: true,",
      "    outputHandling: \"content_and_artifact\",",
      "    hooks: toolHooksSchema.parse(hooks),",
      "  });",
      "  let cursor: string | undefined;",
      "  do {",
      "    const page = await forked.listTools({ cursor });",
      "    cursor = page.nextCursor;",
      "  } while (cursor);",
      "  return tools.map((tool: DynamicStructuredTool) => tool.withConfig({ callbacks: [{ handleToolStart() {}, handleToolEnd() {} }] }));",
      "}",
      "",
      "const adapterTerms = [",
      "  \"dereferenceJsonSchema resolveRefs $defs definitions deepMergeSchemas extractPropertiesFromConditional simplifyJsonSchemaForLLM\",",
      "  \"allOf anyOf oneOf if then else not additionalProperties unevaluatedProperties inputSchema outputSchema\",",
      "  \"_embeddedResourceToStandardFileBlocks _toolOutputToContentBlocks _convertCallToolResult ExtendedArtifact ExtendedContent\",",
      "  \"mcp_structured_content mcp_meta structuredContent _meta resource_link embeddedResource readResource\",",
      "  \"onProgress requestOptions timeout config.signal ToolException isToolException getCurrentTaskInput\",",
      "];",
      "void model;",
      "void adapterTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; toolCount: number; outputCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/mcp-adapters.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining([
      "mcp-client",
      "mcp-load-tools",
      "mcp-list-tools-pagination",
      "mcp-json-schema-deref",
      "mcp-schema-simplify",
      "mcp-tool-hooks",
      "mcp-before-tool-call",
      "mcp-after-tool-call",
      "mcp-artifact-content",
      "mcp-structured-content",
      "mcp-meta-artifact",
      "mcp-command-result",
      "mcp-tool-message",
      "mcp-client-fork",
      "mcp-progress-callback",
      "mcp-tool-exception",
      "mcp-output-handling"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/mcp-adapters", "@modelcontextprotocol/sdk", "@langchain/langgraph"]));
  });

  it("detects LangChain agent middleware readiness without running agents", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-middleware-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-middleware-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        "@langchain/langgraph": "latest",
        "@langchain/openai": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "middleware.ts"), [
      "import { z } from \"zod\";",
      "import { ChatOpenAI } from \"@langchain/openai\";",
      "import { HumanMessage, ToolMessage } from \"@langchain/core/messages\";",
      "import { Command, interrupt } from \"@langchain/langgraph\";",
      "import { createAgent, createMiddleware, humanInTheLoopMiddleware, modelRetryMiddleware, toolRetryMiddleware, tool } from \"langchain\";",
      "",
      "const model = new ChatOpenAI({ model: \"gpt-4o-mini\", temperature: 0, apiKey: process.env.OPENAI_API_KEY });",
      "const staticTool = tool(async ({ value }) => `static ${value}`, { name: \"static_tool\", description: \"Static tool\", schema: z.object({ value: z.string() }) });",
      "const dynamicTool = tool(async ({ value }) => `dynamic ${value}`, { name: \"dynamic_tool\", description: \"Dynamic tool\", schema: z.object({ value: z.string() }) });",
      "const stateSchema = z.object({ reviewed: z.boolean().optional(), retryCount: z.number().optional() });",
      "const contextSchema = z.object({ tenantId: z.string(), region: z.string().optional() });",
      "const middleware = createMiddleware({",
      "  name: \"review-and-dynamic-tools\",",
      "  stateSchema,",
      "  contextSchema,",
      "  beforeAgent: async () => ({ reviewed: false }),",
      "  beforeModel: async (state, runtime) => ({ retryCount: (state.retryCount ?? 0) + 1, tenantId: runtime.context?.tenantId }),",
      "  wrapModelCall: async (request, handler) => handler({ ...request, messages: [new HumanMessage(\"system review\"), ...request.messages] }),",
      "  wrapToolCall: async (request, handler) => {",
      "    if (request.toolCall.name === \"dynamic_tool\" && !request.tool) {",
      "      return handler({ ...request, tool: dynamicTool });",
      "    }",
      "    return new ToolMessage({ tool_call_id: request.toolCall.id ?? \"missing\", name: request.toolCall.name, content: \"blocked\", status: \"error\" });",
      "  },",
      "  afterModel: async () => ({ reviewed: true }),",
      "  afterAgent: async () => new Command({ update: { reviewed: true } }),",
      "  streamTransformers: [() => async function* transformer(stream) { for await (const chunk of stream) yield chunk; }],",
      "});",
      "const hitl = humanInTheLoopMiddleware({",
      "  interruptOn: {",
      "    write_file: { allowedDecisions: [\"approve\", \"edit\", \"reject\"], argsSchema: { type: \"object\" }, description: \"Review write_file before executing\" }",
      "  }",
      "});",
      "const modelRetry = modelRetryMiddleware({ maxRetries: 3, initialDelayMs: 10, maxDelayMs: 100, backoffFactor: 2, jitter: false, onFailure: \"continue\" });",
      "const toolRetry = toolRetryMiddleware({ maxRetries: 2, initialDelayMs: 10, maxDelayMs: 100, backoffFactor: 2, jitter: false, tools: [\"dynamic_tool\"], onFailure: \"continue\" });",
      "export const agent = createAgent({ model, tools: [staticTool], middleware: [middleware, hitl, modelRetry, toolRetry] });",
      "export async function runMiddlewareReview() {",
      "  await agent.invoke({ messages: [new HumanMessage(\"use dynamic_tool\")] }, { configurable: { thread_id: \"middleware\" }, context: { tenantId: \"t1\" } });",
      "  return agent.invoke(new Command({ resume: { decisions: [{ type: \"approve\" }] } }), { configurable: { thread_id: \"middleware\" } });",
      "}",
      "const middlewareTerms = \"ToolCallRequest ToolCallHandler WrapToolCallHook WrapModelCallHook ModelRequest Runtime interruptOn HITLRequest actionRequests reviewConfigs allowedDecisions approve edit reject humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware calculateRetryDelay shouldRetryException shouldRetryTool dynamic tool request.tool undefined stateSchema contextSchema beforeAgent beforeModel wrapModelCall wrapToolCall afterModel afterAgent streamTransformers\";",
      "void interrupt;",
      "void middlewareTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; toolCount: number; agentCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/middleware.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.agentCount).toBeGreaterThan(0);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining([
      "agent-middleware",
      "middleware-state-schema",
      "middleware-context-schema",
      "wrap-model-call",
      "wrap-tool-call",
      "before-model",
      "after-model",
      "before-agent",
      "after-agent",
      "dynamic-tool",
      "hitl-interrupt",
      "hitl-review-config"
    ]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["retry", "model-retry", "tool-retry", "human-in-the-loop"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core", "@langchain/openai", "@langchain/langgraph"]));
  });

  it("detects LangChain safety middleware readiness without filtering live content", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-safety-middleware-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-safety-middleware-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@anthropic-ai/sdk": "latest",
        "@langchain/core": "latest",
        "@langchain/openai": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "safety-middleware.ts"), [
      "import { ChatOpenAI } from \"@langchain/openai\";",
      "import { HumanMessage, AIMessage, ToolMessage } from \"@langchain/core/messages\";",
      "import { createAgent, piiMiddleware, openAIModerationMiddleware, anthropicPromptCachingMiddleware } from \"langchain\";",
      "",
      "const model = new ChatOpenAI({ model: \"gpt-4o-mini\", temperature: 0, apiKey: process.env.OPENAI_API_KEY });",
      "const piiRules = [",
      "  piiMiddleware(\"email\", { strategy: \"redact\", applyToInput: true, applyToOutput: true }),",
      "  piiMiddleware(\"credit_card\", { strategy: \"mask\", applyToInput: true, applyToToolResults: true }),",
      "  piiMiddleware(\"ip\", { strategy: \"hash\", applyToOutput: true, applyToToolResults: true }),",
      "  piiMiddleware(\"api_token\", { detector: \"token_[a-zA-Z0-9]{32}\", strategy: \"block\", applyToInput: true }),",
      "];",
      "const moderation = openAIModerationMiddleware({",
      "  model,",
      "  moderationModel: \"omni-moderation-latest\",",
      "  checkInput: true,",
      "  checkOutput: true,",
      "  checkToolResults: true,",
      "  exitBehavior: \"end\",",
      "  violationMessage: \"Content flagged: {categories}\",",
      "});",
      "const cache = anthropicPromptCachingMiddleware({",
      "  enableCaching: true,",
      "  ttl: \"1h\",",
      "  minMessagesToCache: 3,",
      "  unsupportedModelBehavior: \"warn\",",
      "});",
      "export const safetyAgent = createAgent({",
      "  model: \"anthropic:claude-sonnet-4-5\",",
      "  middleware: [...piiRules, moderation, cache],",
      "});",
      "export function explainStaticSafetyBoundary() {",
      "  return [new HumanMessage(\"review input\"), new AIMessage(\"review output\"), new ToolMessage({ tool_call_id: \"tool\", content: \"review tool result\" })];",
      "}",
      "const safetyTerms = \"PIIDetectionError PIIMatch PIIStrategy BuiltInPIIType detectEmail detectCreditCard detectIP applyRedactStrategy applyMaskStrategy applyHashStrategy applyStrategy processContent applyToInput applyToOutput applyToToolResults OpenAIModerationMiddleware OpenAIModerationError ViolationStage moderateInputs moderateOutput moderateToolMessages canJumpTo jumpTo end exitBehavior anthropicPromptCachingMiddleware PromptCachingMiddlewareError cache_control enableCaching ttl minMessagesToCache unsupportedModelBehavior\";",
      "void safetyAgent;",
      "void safetyTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; toolCount: number; agentCount: number }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/safety-middleware.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.agentCount).toBeGreaterThan(0);
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining([
      "pii-detection",
      "pii-redaction",
      "pii-mask",
      "pii-hash",
      "pii-block",
      "openai-moderation",
      "moderation-jump",
      "prompt-caching"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core", "@langchain/openai", "@anthropic-ai/sdk"]));
  });

  it("detects LangChain serialized load safety without deserializing objects", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-serialized-load-safety-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-serialized-load-safety-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "serialized-load.ts"), [
      "import { load, type LoadOptions } from \"@langchain/core/load\";",
      "import { Serializable, type SerializedConstructor, type SerializedNotImplemented, type SerializedSecret } from \"@langchain/core/load/serializable\";",
      "import { LC_ESCAPED_KEY, escapeObject, needsEscaping, serializeLcObject, serializeValue } from \"@langchain/core/load/validation\";",
      "import { ChatPromptTemplate } from \"@langchain/core/prompts\";",
      "",
      "export type SerializedLoadBoundary = LoadOptions | SerializedConstructor | SerializedSecret | SerializedNotImplemented | Serializable;",
      "export const trustedLoadOptions: LoadOptions = {",
      "  secretsMap: { OPENAI_API_KEY: \"redacted\" },",
      "  secretsFromEnv: false,",
      "  optionalImportsMap: {},",
      "  optionalImportEntrypoints: [],",
      "  importMap: {},",
      "  maxDepth: 12,",
      "};",
      "export const prompt = ChatPromptTemplate.fromMessages([[\"system\", \"static only\"]]);",
      "export const serializedLoadTerms = \"load LoadOptions trusted source insecure deserialization class instantiation constructor kwargs secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys\";",
      "void load;",
      "void prompt;",
      "void trustedLoadOptions;",
      "void serializedLoadTerms;",
      "void LC_ESCAPED_KEY;",
      "void escapeObject;",
      "void needsEscaping;",
      "void serializeValue;",
      "void serializeLcObject;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number; safetyCount?: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/serialized-load.ts");
    expect(report.sourcePattern).toContain("load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth");
    expect(report.sourcePattern).toContain("SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue");
    expect(report.sourcePattern).toContain("LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining(["chat-prompt-template"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining([
      "serialized-load-trust-boundary",
      "serialized-constructor-load",
      "serialized-secret-map",
      "serialized-import-map",
      "serialized-escape-marker",
      "serialized-depth-limit"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain budget and context middleware readiness without running agents", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-budget-context-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-budget-context-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        "@langchain/openai": "latest",
        langchain: "latest",
        zod: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "budget-context-middleware.ts"), [
      "import { z } from \"zod\";",
      "import { ChatOpenAI } from \"@langchain/openai\";",
      "import { SystemMessage } from \"@langchain/core/messages\";",
      "import { createAgent, tool, dynamicSystemPromptMiddleware, summarizationMiddleware, contextEditingMiddleware, ClearToolUsesEdit, llmToolSelectorMiddleware, modelCallLimitMiddleware, toolCallLimitMiddleware } from \"langchain\";",
      "",
      "const model = new ChatOpenAI({ model: \"gpt-4o-mini\", temperature: 0, apiKey: process.env.OPENAI_API_KEY });",
      "const contextSchema = z.object({ tenant: z.string(), region: z.string().optional() });",
      "const searchTool = tool(async ({ query }) => `result ${query}`, { name: \"search\", description: \"Search docs\", schema: z.object({ query: z.string() }) });",
      "const auditTool = tool(async ({ entry }) => `audit ${entry}`, { name: \"audit_log\", description: \"Audit log\", schema: z.object({ entry: z.string() }) });",
      "const dynamicPrompt = dynamicSystemPromptMiddleware<z.infer<typeof contextSchema>>((_state, runtime) => new SystemMessage(`Tenant ${runtime.context.tenant} in ${runtime.context.region ?? \"global\"}`));",
      "const summarizer = summarizationMiddleware({",
      "  model,",
      "  trigger: { tokens: 4000, messages: 10 },",
      "  keep: { messages: 20 },",
      "  tokenCounter: async (messages) => messages.length * 100,",
      "  summaryPrompt: \"Summarize the messages while preserving decisions: {messages}\",",
      "  summaryPrefix: \"Conversation summary:\",",
      "});",
      "const contextEditor = contextEditingMiddleware({",
      "  edits: [new ClearToolUsesEdit({",
      "    trigger: { tokens: 100000, messages: 50 },",
      "    keep: { messages: 3 },",
      "    clearToolInputs: true,",
      "    excludeTools: [\"audit_log\"],",
      "    placeholder: \"[cleared]\",",
      "  })],",
      "});",
      "const selector = llmToolSelectorMiddleware({ model, maxTools: 2, alwaysInclude: [\"audit_log\"], systemPrompt: \"Select only the tools needed for this request.\" });",
      "const modelLimit = modelCallLimitMiddleware({ threadLimit: 10, runLimit: 3, exitBehavior: \"end\" });",
      "const searchLimit = toolCallLimitMiddleware({ toolName: \"search\", threadLimit: 5, runLimit: 2, exitBehavior: \"continue\" });",
      "export const budgetContextAgent = createAgent({",
      "  model,",
      "  contextSchema,",
      "  tools: [searchTool, auditTool],",
      "  middleware: [dynamicPrompt, summarizer, contextEditor, selector, modelLimit, searchLimit],",
      "});",
      "const budgetContextTerms = \"DynamicSystemPromptMiddleware dynamicSystemPromptMiddleware systemMessage summarizationMiddleware DEFAULT_SUMMARY_PROMPT summaryPrompt summaryPrefix tokenCounter trimMessages RemoveMessage REMOVE_ALL_MESSAGES contextEditingMiddleware ClearToolUsesEdit clearToolInputs excludeTools placeholder context_editing clear_tool_uses llmToolSelectorMiddleware LLMToolSelectorOptionsSchema createToolSelectionResponse withStructuredOutput maxTools alwaysInclude modelCallLimitMiddleware ModelCallLimitMiddlewareError threadModelCallCount runModelCallCount toolCallLimitMiddleware ToolCallLimitExceededError ToolCallLimitOptionsSchema threadToolCallCount runToolCallCount threadLimit runLimit exitBehavior continue canJumpTo\";",
      "void budgetContextAgent;",
      "void budgetContextTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; promptCount: number; toolCount: number; agentCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/budget-context-middleware.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.agentCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining(["dynamic-system-prompt", "summary-prompt"]));
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining([
      "summarization-middleware",
      "context-editing",
      "context-clear-tool-uses",
      "llm-tool-selector"
    ]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["model-call-limit", "tool-call-limit"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core", "@langchain/openai"]));
  });

  it("detects LangChain universal chat model routing without loading providers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-universal-routing-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-universal-routing-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/openai": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "universal-model-router.ts"), [
      "import { createAgent } from \"langchain\";",
      "import { ConfigurableModel, initChatModel } from \"langchain/chat_models/universal\";",
      "",
      "export async function buildUniversalRouter() {",
      "  const directModel = await initChatModel(\"openai:gpt-4o-mini\", {",
      "    temperature: 0,",
      "    configurableFields: [\"model\", \"modelProvider\", \"apiKey\"],",
      "    configPrefix: \"router\",",
      "  });",
      "  const configurableModel = await initChatModel(undefined, {",
      "    modelProvider: \"openai\",",
      "    configurableFields: \"any\",",
      "    configPrefix: \"tenant\",",
      "  });",
      "  const manualModel = new ConfigurableModel({",
      "    defaultConfig: { model: \"gpt-4o-mini\", modelProvider: \"openai\" },",
      "    configurableFields: [\"model\", \"modelProvider\", \"apiKey\"],",
      "    configPrefix: \"manual\",",
      "  });",
      "  const universalAgent = createAgent({ model: configurableModel, tools: [] });",
      "  const runtimeConfig = {",
      "    configurable: {",
      "      tenant_model: \"anthropic:claude-3-5-sonnet-latest\",",
      "      tenant_modelProvider: \"anthropic\",",
      "      tenant_apiKey: process.env.ANTHROPIC_API_KEY,",
      "    },",
      "  };",
      "  return { directModel, configurableModel, manualModel, universalAgent, runtimeConfig };",
      "}",
      "const universalRoutingTerms = \"MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider ConfigurableModel _defaultConfig _configurableFields configurableFields configPrefix queuedMethodOperations configurable openai:gpt-4 anthropic:claude google-genai google-vertexai-web azure_openai bedrock deepseek xai cerebras fireworks together perplexity\";",
      "void universalRoutingTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; agentCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/universal-model-router.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.agentCount).toBeGreaterThan(0);
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining([
      "init-chat-model",
      "model-provider-config",
      "model-provider-inference",
      "provider-prefix",
      "configurable-model",
      "configurable-fields",
      "config-prefix"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/openai"]));
  });

  it("detects LangChain agent stream transformer readiness without consuming streams", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-agent-stream-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-agent-stream-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        "@langchain/langgraph": "latest",
        langchain: "latest",
        zod: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "agent-streaming.ts"), [
      "import { z } from \"zod\";",
      "import { AIMessage, HumanMessage, ToolMessage } from \"@langchain/core/messages\";",
      "import { StreamChannel, type ProtocolEvent, type StreamTransformer } from \"@langchain/langgraph\";",
      "import { createAgent, createMiddleware, createToolCallTransformer, tool, type AgentRunStream } from \"langchain\";",
      "",
      "const eventCounter = (): StreamTransformer<{ eventCount: StreamChannel<number> }> => {",
      "  const eventCount = StreamChannel.remote<number>(\"eventCount\");",
      "  return {",
      "    init: () => ({ eventCount }),",
      "    process(event: ProtocolEvent) {",
      "      if (event.method === \"messages\") eventCount.push(1);",
      "      return true;",
      "    },",
      "    finalize() { eventCount.close(); },",
      "  };",
      "};",
      "const streamMiddleware = createMiddleware({ name: \"StreamMiddleware\", streamTransformers: [eventCounter] });",
      "const searchTool = tool(async ({ query }) => new ToolMessage({ tool_call_id: \"call_search\", content: `results ${query}` }), {",
      "  name: \"search\",",
      "  description: \"Search docs\",",
      "  schema: z.object({ query: z.string() }),",
      "});",
      "const agent = createAgent({",
      "  model: \"openai:gpt-4\",",
      "  tools: [searchTool],",
      "  middleware: [streamMiddleware],",
      "  streamTransformers: [eventCounter, createToolCallTransformer([])],",
      "});",
      "export async function startAgentStreams() {",
      "  const run = await agent.streamEvents({ messages: [new HumanMessage(\"stream tools\")] }, {",
      "    version: \"v3\",",
      "    transformers: [eventCounter],",
      "    streamMode: [\"values\", \"updates\", \"messages\"],",
      "    encoding: \"text/event-stream\",",
      "  }) as AgentRunStream;",
      "  for await (const call of run.toolCalls) {",
      "    await call.status;",
      "    await call.output;",
      "  }",
      "  const stateStream = await agent.stream({ messages: [new HumanMessage(\"stream state\")] }, { streamMode: [\"updates\", \"messages\", \"values\"] });",
      "  return { run, stateStream, sample: new AIMessage(\"ok\") };",
      "}",
      "const agentStreamTerms = \"AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel NativeStreamTransformer ProtocolEvent createToolCallTransformer ToolCallProjection ToolCallStream ToolCallStatus ToolsEventData streamMode text/event-stream content-block-delta content-block-finish tool-started tool-finished tool-error toolCalls run.extensions.eventCount run.messages StreamMiddleware isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail\";",
      "void agentStreamTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; toolCount: number; agentCount: number; streamingCount: number }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/agent-streaming.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.agentCount).toBeGreaterThan(0);
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(report.sourcePattern).toContain("createToolCallTransformer ToolCallProjection ToolCallStream");
    expect(report.sourcePattern).toContain("isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput");
    expect(report.sourcePattern).toContain("pendingCalls resolveOutput rejectOutput resolveStatus resolveError");
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining([
      "agent-run-stream",
      "stream-transformer",
      "stream-channel",
      "stream-mode",
      "tool-call-stream",
      "content-block-stream",
      "tool-call-stream-projection",
      "tool-call-output-normalization",
      "headless-tool-stream-interrupt",
      "tool-call-pending-map",
      "tool-call-stream-finalize"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core", "@langchain/langgraph"]));
  });

  it("detects LangChain agent response format strategies without invoking models", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-response-format-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-response-format-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest",
        zod: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "agent-response-format.ts"), [
      "import { z } from \"zod\";",
      "import { AIMessage } from \"@langchain/core/messages\";",
      "import { createAgent, providerStrategy, tool, toolStrategy, type TypedToolStrategy } from \"langchain\";",
      "import { MultipleStructuredOutputsError, StructuredOutputParsingError } from \"langchain/agents\";",
      "",
      "const ContactInfo = z.object({",
      "  name: z.string(),",
      "  email: z.string(),",
      "});",
      "const lookup = tool(async ({ email }) => ({ email }), {",
      "  name: \"lookup\",",
      "  description: \"Lookup contact\",",
      "  schema: z.object({ email: z.string() }),",
      "});",
      "const toolResponseFormat: TypedToolStrategy = toolStrategy([ContactInfo], {",
      "  handleError: (error) => error instanceof MultipleStructuredOutputsError ? \"Return one structured output.\" : \"Retry structured output.\",",
      "  toolMessageContent: \"Structured response captured\",",
      "});",
      "const providerResponseFormat = providerStrategy({ schema: ContactInfo, strict: true });",
      "const toolAgent = createAgent({",
      "  model: \"openai:gpt-4o-mini\",",
      "  tools: [lookup],",
      "  responseFormat: toolResponseFormat,",
      "});",
      "const providerAgent = createAgent({",
      "  model: \"openai:gpt-4o\",",
      "  tools: [],",
      "  responseFormat: providerResponseFormat,",
      "});",
      "export async function parseStructuredResponse(message: AIMessage) {",
      "  const result = await providerAgent.invoke({ messages: [{ role: \"user\", content: message.content.toString() }] });",
      "  return result.structuredResponse;",
      "}",
      "const responseFormatTerms = \"responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined __responseFormatUndefined hasSupportForJsonSchemaOutput structuredOutput MultipleStructuredOutputsError StructuredOutputParsingError ToolStrategyOptions handleError toolMessageContent JsonSchemaFormat strict true function_call tool_calls\";",
      "void toolAgent;",
      "void responseFormatTerms;",
      "void StructuredOutputParsingError;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; toolCount: number; agentCount: number; outputCount: number }>;
      structuredOutputSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/agent-response-format.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.agentCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.structuredOutputSignals)).toEqual(expect.arrayContaining([
      "response-format",
      "structured-response",
      "tool-strategy",
      "provider-strategy",
      "typed-tool-strategy",
      "transform-response-format",
      "response-format-undefined",
      "json-schema-support",
      "structured-output-errors",
      "tool-strategy-options"
    ]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["retry"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain headless tool readiness without executing client tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-headless-tool-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-headless-tool-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        "@langchain/langgraph": "latest",
        langchain: "latest",
        zod: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "headless-tools.ts"), [
      "import { z } from \"zod\";",
      "import { createAgent } from \"langchain\";",
      "import { tool, type HeadlessTool, type HeadlessToolFields, type HeadlessToolImplementation } from \"langchain/tools\";",
      "import type { ToolRunnableConfig } from \"@langchain/core/tools\";",
      "import { useStream } from \"@langchain/langgraph-sdk/react\";",
      "",
      "const getLocation = tool({",
      "  name: \"get_location\",",
      "  description: \"Get browser geolocation\",",
      "  schema: z.object({ highAccuracy: z.boolean().optional() }),",
      "});",
      "const locationImplementation = getLocation.implement(async ({ highAccuracy }) => ({",
      "  latitude: highAccuracy ? 37.5665 : 37.5,",
      "  longitude: 126.9780,",
      "}));",
      "const agent = createAgent({",
      "  model: \"openai:gpt-4o\",",
      "  tools: [getLocation],",
      "});",
      "export function ClientToolBoundary() {",
      "  return useStream({",
      "    assistantId: \"agent\",",
      "    tools: [locationImplementation],",
      "  });",
      "}",
      "const headlessTerms = \"HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload DynamicStructuredTool ToolRunnableConfig coreTool langchain/tools headless.js headlessTool metadata headlessTool true implement withImplementation useStream tools client-side implementation interrupt agent execution interrupt({ type: 'tool', toolCall: { id: config?.toolCall?.id, name, args } }) config.toolCall.id typed arguments from the interrupt payload omit implementation function no implementation needed\";",
      "void agent;",
      "void headlessTerms;",
      "void (getLocation as HeadlessTool);",
      "void ({} as HeadlessToolFields<typeof getLocation.schema>);",
      "void (locationImplementation as HeadlessToolImplementation);",
      "void ({} as ToolRunnableConfig);"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; toolCount: number; agentCount: number; outputCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/headless-tools.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.agentCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining([
      "headless-tool",
      "headless-tool-overload",
      "headless-tool-implementation",
      "headless-tool-interrupt",
      "headless-tool-metadata"
    ]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["human-in-the-loop"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core", "@langchain/langgraph"]));
  });

  it("detects LangChain retriever tool readiness without querying retrievers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-retriever-tool-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-retriever-tool-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest",
        zod: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "retriever-tool.ts"), [
      "import type { BaseRetrieverInterface } from \"@langchain/core/retrievers\";",
      "import { CallbackManagerForToolRun } from \"@langchain/core/callbacks/manager\";",
      "import { DynamicStructuredTool, type DynamicStructuredToolInput } from \"@langchain/core/tools\";",
      "import { z } from \"zod\";",
      "import { createRetrieverTool } from \"langchain/tools/retriever\";",
      "import { formatDocumentsAsString } from \"langchain/util/document\";",
      "",
      "export function buildClassicRetrieverTool(retriever: BaseRetrieverInterface) {",
      "  const search = createRetrieverTool(retriever, {",
      "    name: \"state_of_union_retriever\",",
      "    description: \"Query a retriever to get information about state of the union address\",",
      "  });",
      "  const schema = z.object({ query: z.string().describe(\"query to look up in retriever\") });",
      "  const manual = new DynamicStructuredTool({",
      "    name: \"manual_retriever\",",
      "    description: \"Manual retriever wrapper\",",
      "    schema,",
      "    async func({ query }: { query: string }, runManager?: CallbackManagerForToolRun) {",
      "      const docs = await retriever.invoke(query, runManager?.getChild(\"retriever\"));",
      "      return formatDocumentsAsString(docs);",
      "    },",
      "  } satisfies DynamicStructuredToolInput);",
      "  return { search, manual };",
      "}",
      "const retrieverToolTerms = \"createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun DynamicStructuredTool DynamicStructuredToolInput formatDocumentsAsString retriever.invoke runManager?.getChild(\\\"retriever\\\") query to look up in retriever Natural language query used as input to the retriever Omit<DynamicStructuredToolInput, func schema> formatForOpenAIFunctions AgentExecutor bindTools retriever tool schema document formatting child retriever callback\";",
      "void retrieverToolTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; toolCount: number; retrievalCount: number; outputCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      retrievalSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/retriever-tool.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.retrievalCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["tool", "tool-schema"]));
    expect(readySignals(report.retrievalSignals)).toEqual(expect.arrayContaining([
      "retriever-tool",
      "retriever-tool-schema",
      "retriever-callback-child",
      "retriever-document-format"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain BaseRetriever run lifecycle readiness without invoking retrievers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-base-retriever-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-base-retriever-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "base-retriever.ts"), [
      "import { CallbackManager, type CallbackManagerForRetrieverRun, type Callbacks, parseCallbackConfigArg } from \"@langchain/core/callbacks/manager\";",
      "import { Document, type DocumentInterface } from \"@langchain/core/documents\";",
      "import { BaseRetriever, type BaseRetrieverInput, type BaseRetrieverInterface } from \"@langchain/core/retrievers\";",
      "import { ensureConfig, type RunnableConfig } from \"@langchain/core/runnables/config\";",
      "import { FakeRetriever } from \"@langchain/core/utils/testing\";",
      "",
      "export class StaticPolicyRetriever extends BaseRetriever {",
      "  callbacks?: Callbacks;",
      "  tags = [\"policy\", \"retriever\"];",
      "  metadata = { source: \"static\" };",
      "  verbose = true;",
      "",
      "  constructor(fields?: BaseRetrieverInput) {",
      "    super(fields);",
      "    this.callbacks = fields?.callbacks;",
      "    this.tags = fields?.tags ?? this.tags;",
      "    this.metadata = fields?.metadata ?? this.metadata;",
      "    this.verbose = fields?.verbose ?? this.verbose;",
      "  }",
      "",
      "  async _getRelevantDocuments(query: string, callbacks?: CallbackManagerForRetrieverRun): Promise<DocumentInterface[]> {",
      "    await callbacks?.handleText?.(`retriever query: ${query}`);",
      "    return [new Document({ pageContent: query, metadata: this.metadata })];",
      "  }",
      "}",
      "",
      "export async function previewRetrieverLifecycle(retriever: BaseRetrieverInterface, input: string, options?: RunnableConfig): Promise<DocumentInterface[]> {",
      "  const parsedConfig = ensureConfig(parseCallbackConfigArg(options));",
      "  const callbackManager = await CallbackManager.configure(parsedConfig.callbacks, undefined, parsedConfig.tags, [\"static\"], parsedConfig.metadata, { retriever: \"policy\" }, { verbose: true });",
      "  const runManager = await callbackManager?.handleRetrieverStart(retriever, input, parsedConfig.runId, undefined, undefined, undefined, parsedConfig.runName);",
      "  try {",
      "    const results = await retriever.invoke(input, parsedConfig);",
      "    await runManager?.handleRetrieverEnd(results);",
      "    return results;",
      "  } catch (error) {",
      "    await runManager?.handleRetrieverError(error);",
      "    throw error;",
      "  }",
      "}",
      "",
      "const fakeRetriever = new FakeRetriever({ output: [new Document({ pageContent: \"foo\", metadata: { source: \"test\" } })] });",
      "const baseRetrieverTerms = \"BaseRetriever BaseRetrieverInput BaseRetrieverInterface _getRelevantDocuments invoke ensureConfig parseCallbackConfigArg CallbackManager.configure CallbackManagerForRetrieverRun handleRetrieverStart handleRetrieverEnd handleRetrieverError callbacks tags metadata verbose runId runName FakeRetriever lc_namespace test fake DocumentInterface\";",
      "void fakeRetriever;",
      "void baseRetrieverTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; retrievalCount: number; observabilityCount: number; streamingCount: number }>;
      retrievalSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/base-retriever.ts");
    expect(report.sourcePattern).toContain("BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart");
    expect(report.sourcePattern).toContain("handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.retrievalCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(readySignals(report.retrievalSignals)).toEqual(expect.arrayContaining([
      "base-retriever",
      "retriever-run-config",
      "retriever-start-event",
      "retriever-end-event",
      "retriever-error-event",
      "fake-retriever"
    ]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining(["callback-run-manager"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain RouterRunnable readiness without invoking routes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-router-runnable-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-router-runnable-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "router-runnable.ts"), [
      "import { RunnableLambda, RouterRunnable, type RouterInput } from \"@langchain/core/runnables\";",
      "import { ensureConfig, type RunnableConfig } from \"@langchain/core/runnables/config\";",
      "",
      "type RouteName = \"summarize\" | \"classify\";",
      "type PolicyRouterInput = RouterInput & { key: RouteName; input: string };",
      "",
      "const router = new RouterRunnable<PolicyRouterInput, string, string>({",
      "  runnables: {",
      "    summarize: RunnableLambda.from((input: string) => `summary:${input}`),",
      "    classify: RunnableLambda.from((input: string) => `label:${input}`)",
      "  }",
      "});",
      "",
      "export async function previewRoute(selected: RouteName, input: string, options?: RunnableConfig) {",
      "  const config = ensureConfig(options);",
      "  const invokePlan = router.invoke({ key: selected, input }, config);",
      "  const streamPlan = router.stream({ key: selected, input }, config);",
      "  const batchPlan = router.batch([{ key: selected, input }], [config], { returnExceptions: true, maxConcurrency: 2 });",
      "  return { invokePlan, streamPlan, batchPlan };",
      "}",
      "",
      "const routerTerms = \"RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions maxConcurrency batchSize RunnableBatchOptions ensureConfig stream batch\";",
      "void routerTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/router-runnable.ts");
    expect(report.sourcePattern).toContain("RouterRunnable RouterInput runnables key actualInput missingKey");
    expect(report.sourcePattern).toContain("No runnable associated with key _getOptionsList returnExceptions batchSize");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining([
      "runnable-router",
      "router-input",
      "router-key-dispatch",
      "router-missing-key",
      "router-batch-concurrency",
      "router-stream"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain HTTP event stream wrapper readiness without consuming streams", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-http-event-stream-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-http-event-stream-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "http-event-stream.ts"), [
      "import { convertToHttpEventStream } from \"@langchain/core/runnables/wrappers\";",
      "import type { IterableReadableStream } from \"@langchain/core/utils/stream\";",
      "",
      "type Chunk = { token: string; index: number };",
      "",
      "async function* previewChunks(): AsyncGenerator<Chunk> {",
      "  yield { token: \"hello\", index: 1 };",
      "}",
      "",
      "export function describeHttpEventStream(): typeof convertToHttpEventStream {",
      "  return convertToHttpEventStream;",
      "}",
      "",
      "type HttpEventReadable = IterableReadableStream<Uint8Array>;",
      "const streamBridgeTerms = \"convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data data: ${JSON.stringify(chunk)} event: end fromReadableStream AsyncGenerator text/event-stream\";",
      "void previewChunks;",
      "void streamBridgeTerms;",
      "void (undefined as unknown as HttpEventReadable);"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/http-event-stream.ts");
    expect(report.sourcePattern).toContain("convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array>");
    expect(report.sourcePattern).toContain("controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining([
      "http-event-stream-wrapper",
      "event-stream-data-frame",
      "event-stream-end-frame",
      "readable-stream-bridge",
      "iterable-readable-stream-adapter"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain event source parser readiness without parsing streams", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-event-source-parser-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-event-source-parser-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "event-source-parser.ts"), [
      "import { EventStreamContentType, type EventSourceMessage, convertEventStreamToIterableReadableDataStream, getBytes, getLines, getMessages } from \"@langchain/core/utils/event_source_parse\";",
      "import type { IterableReadableStream } from \"@langchain/core/utils/stream\";",
      "",
      "type ParserReferences = {",
      "  byteReader: typeof getBytes;",
      "  lineParser: typeof getLines;",
      "  messageParser: typeof getMessages;",
      "  dataStream: typeof convertEventStreamToIterableReadableDataStream;",
      "  contentType: typeof EventStreamContentType;",
      "};",
      "",
      "export function describeEventSourceParser(): ParserReferences {",
      "  return {",
      "    byteReader: getBytes,",
      "    lineParser: getLines,",
      "    messageParser: getMessages,",
      "    dataStream: convertEventStreamToIterableReadableDataStream,",
      "    contentType: EventStreamContentType",
      "  };",
      "}",
      "",
      "type ParsedMessage = EventSourceMessage & { retry?: number };",
      "type ParsedDataStream = IterableReadableStream<string>;",
      "const parserTerms = \"EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close IterableReadableStream fromReadableStream\";",
      "void parserTerms;",
      "void (undefined as unknown as ParsedMessage);",
      "void (undefined as unknown as ParsedDataStream);"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/event-source-parser.ts");
    expect(report.sourcePattern).toContain("EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages");
    expect(report.sourcePattern).toContain("ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline");
    expect(report.sourcePattern).toContain("onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining([
      "event-source-content-type",
      "event-source-byte-reader",
      "event-source-line-parser",
      "event-source-message-parser",
      "event-source-retry-id",
      "event-source-data-stream"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain stream log JSON Patch readiness without applying patches", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-log-stream-json-patch-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-log-stream-json-patch-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "log-stream-json-patch.ts"), [
      "import { LogStreamCallbackHandler, RunLogPatch, RunLog, type LogEntry, type RunState, type SchemaFormat } from \"@langchain/core/tracers/log_stream\";",
      "import type { Operation as JSONPatchOperation } from \"@langchain/core/utils/fast-json-patch\";",
      "import type { IterableReadableStream } from \"@langchain/core/utils/stream\";",
      "",
      "type LogStreamContracts = {",
      "  handler: LogStreamCallbackHandler;",
      "  patch: RunLogPatch;",
      "  log: RunLog;",
      "  ops: JSONPatchOperation[];",
      "  entry: LogEntry;",
      "  state: RunState;",
      "  schema: SchemaFormat;",
      "};",
      "",
      "const handler = new LogStreamCallbackHandler({",
      "  autoClose: true,",
      "  includeNames: [\"answer\"],",
      "  includeTypes: [\"llm\"],",
      "  includeTags: [\"support\"],",
      "  excludeNames: [\"debug\"],",
      "  excludeTypes: [\"retriever\"],",
      "  excludeTags: [\"internal\"],",
      "  _schemaFormat: \"streaming_events\"",
      "});",
      "",
      "const ops: JSONPatchOperation[] = [",
      "  { op: \"replace\", path: \"\", value: { id: \"run-1\", name: \"root\", type: \"chain\", streamed_output: [], final_output: undefined, logs: {} } },",
      "  { op: \"add\", path: \"/logs/answer\", value: { id: \"run-2\", name: \"answer\", type: \"llm\", tags: [\"support\"], metadata: {}, start_time: \"2026-06-07T00:00:00.000Z\", streamed_output: [], streamed_output_str: [], inputs: { question: \"q\" }, final_output: undefined, end_time: undefined } },",
      "  { op: \"add\", path: \"/logs/answer/streamed_output_str/-\", value: \"token\" },",
      "  { op: \"add\", path: \"/logs/answer/streamed_output/-\", value: { content: \"token\" } },",
      "  { op: \"replace\", path: \"/logs/answer/inputs\", value: { question: \"q\" } },",
      "  { op: \"add\", path: \"/logs/answer/final_output\", value: { text: \"done\" } },",
      "  { op: \"add\", path: \"/logs/answer/end_time\", value: \"2026-06-07T00:00:01.000Z\" },",
      "  { op: \"replace\", path: \"/final_output\", value: { text: \"done\" } }",
      "];",
      "const patch = new RunLogPatch({ ops });",
      "const log = RunLog.fromRunLogPatch(patch);",
      "const combined = patch.concat(new RunLogPatch({ ops: [{ op: \"add\", path: \"/logs/answer/streamed_output/-\", value: \"extra\" }] }));",
      "const receiveStream: IterableReadableStream<RunLogPatch> = handler.receiveStream;",
      "void handler.tapOutputIterable(\"run-2\", (async function* () { yield \"chunk\"; })());",
      "",
      "const logEntry: LogEntry = { id: \"run-2\", name: \"answer\", type: \"llm\", tags: [\"support\"], metadata: {}, start_time: \"2026-06-07T00:00:00.000Z\", streamed_output: [], streamed_output_str: [], inputs: { question: \"q\" }, final_output: { text: \"done\" }, end_time: \"2026-06-07T00:00:01.000Z\" };",
      "const runState: RunState = { id: \"run-1\", name: \"root\", type: \"chain\", streamed_output: [], final_output: { text: \"done\" }, logs: { answer: logEntry } };",
      "const schema: SchemaFormat = \"streaming_events\";",
      "const logTerms = \"JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close\";",
      "const contracts: LogStreamContracts = { handler, patch, log, ops, entry: logEntry, state: runState, schema };",
      "void combined;",
      "void receiveStream;",
      "void logTerms;",
      "void contracts;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number; observabilityCount: number }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/log-stream-json-patch.ts");
    expect(report.sourcePattern).toContain("JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat");
    expect(report.sourcePattern).toContain("LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs");
    expect(report.sourcePattern).toContain("LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat");
    expect(report.sourcePattern).toContain("TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator");
    expect(report.sourcePattern).toContain("tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/-");
    expect(report.sourcePattern).toContain("/logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/-");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining([
      "log-stream-json-patch",
      "log-stream-run-state",
      "log-stream-filtering",
      "log-stream-writer",
      "log-stream-output-tap",
      "log-stream-standardized-io"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain document transformer and compressor readiness without transforming documents", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-document-transformer-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-document-transformer-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "document-transformers.ts"), [
      "import type { Callbacks } from \"@langchain/core/callbacks/manager\";",
      "import { Document, type DocumentInterface } from \"@langchain/core/documents\";",
      "import { BaseDocumentLoader, type DocumentLoader } from \"@langchain/core/document_loaders/base\";",
      "import { BaseDocumentTransformer, MappingDocumentTransformer } from \"@langchain/core/documents/transformers\";",
      "import { BaseDocumentCompressor } from \"@langchain/core/retrievers/document_compressors\";",
      "",
      "export class StaticDocumentTransformer extends BaseDocumentTransformer {",
      "  lc_namespace = [\"langchain_core\", \"documents\", \"transformers\"];",
      "",
      "  async transformDocuments(documents: DocumentInterface[]): Promise<DocumentInterface[]> {",
      "    return documents.map((document) => new Document({",
      "      pageContent: document.pageContent.trim(),",
      "      metadata: { ...document.metadata, transformed: true }",
      "    }));",
      "  }",
      "}",
      "",
      "export class StaticMappingTransformer extends MappingDocumentTransformer {",
      "  async _transformDocument(document: DocumentInterface): Promise<DocumentInterface> {",
      "    return new Document({",
      "      pageContent: document.pageContent.toUpperCase(),",
      "      metadata: { ...document.metadata, mapped: true }",
      "    });",
      "  }",
      "}",
      "",
      "export class StaticDocumentCompressor extends BaseDocumentCompressor {",
      "  async compressDocuments(documents: DocumentInterface[], query: string, callbacks?: Callbacks): Promise<DocumentInterface[]> {",
      "    void callbacks;",
      "    return documents.filter((document) => document.pageContent.includes(query));",
      "  }",
      "}",
      "",
      "export class StaticDocumentLoader extends BaseDocumentLoader implements DocumentLoader {",
      "  async load(): Promise<Document[]> {",
      "    return [new Document({ pageContent: \"policy\", metadata: { source: \"loader\" } })];",
      "  }",
      "}",
      "",
      "const compressorGuard = BaseDocumentCompressor.isBaseDocumentCompressor(new StaticDocumentCompressor());",
      "const documentTransformerTerms = \"BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load lc_namespace langchain_core documents transformers\";",
      "void compressorGuard;",
      "void documentTransformerTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; retrievalCount: number }>;
      retrievalSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/document-transformers.ts");
    expect(report.sourcePattern).toContain("BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument");
    expect(report.sourcePattern).toContain("BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.retrievalCount).toBeGreaterThan(0);
    expect(readySignals(report.retrievalSignals)).toEqual(expect.arrayContaining([
      "document-transformer",
      "mapping-document-transformer",
      "transform-documents",
      "document-compressor",
      "compress-documents",
      "base-document-loader"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain BaseStore readiness without mutating stores", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-base-store-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-base-store-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "store-contracts.ts"), [
      "import { BaseStore, InMemoryStore } from \"@langchain/core/stores\";",
      "",
      "export class StaticRuntimeStore extends BaseStore<string, unknown> {",
      "  lc_namespace = [\"langchain\", \"storage\"];",
      "  private readonly state: Record<string, unknown> = {};",
      "",
      "  async mget(keys: string[]): Promise<(unknown | undefined)[]> {",
      "    return keys.map((key) => this.state[key]);",
      "  }",
      "",
      "  async mset(keyValuePairs: [string, unknown][]): Promise<void> {",
      "    for (const [key, value] of keyValuePairs) {",
      "      void key;",
      "      void value;",
      "    }",
      "  }",
      "",
      "  async mdelete(keys: string[]): Promise<void> {",
      "    void keys;",
      "  }",
      "",
      "  async *yieldKeys(prefix?: string): AsyncGenerator<string> {",
      "    if (prefix !== undefined) {",
      "      yield `message:id:${prefix}`;",
      "    }",
      "  }",
      "}",
      "",
      "const inMemoryStore = new InMemoryStore<unknown>();",
      "const storeTerms = \"BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs lc_namespace langchain storage\";",
      "void inMemoryStore;",
      "void storeTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("BaseStore InMemoryStore mget mset mdelete yieldKeys");
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining([
      "base-store",
      "in-memory-store",
      "store-mget",
      "store-mset",
      "store-mdelete",
      "store-yield-keys"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain fake model builder readiness without invoking models", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-fake-model-builder-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-fake-model-builder-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "fake-model-builder.ts"), [
      "import { AIMessage, BaseMessage } from \"@langchain/core/messages\";",
      "import { FakeBuiltModel, fakeModel } from \"@langchain/core/testing\";",
      "import { RunnableLambda } from \"@langchain/core/runnables\";",
      "import { StructuredTool } from \"@langchain/core/tools\";",
      "",
      "type ResponseFactory = (messages: BaseMessage[]) => BaseMessage | Error;",
      "type QueueEntry = { kind: \"message\" } | { kind: \"toolCalls\" } | { kind: \"error\" } | { kind: \"factory\" };",
      "interface FakeModelCall { messages: BaseMessage[]; options: unknown; }",
      "interface FakeModelState { callIndex: number; calls: FakeModelCall[]; }",
      "",
      "const dynamicResponse: ResponseFactory = (messages) => new AIMessage(`seen ${messages.length}`);",
      "const model: FakeBuiltModel = fakeModel()",
      "  .respond(new AIMessage(\"queued\"))",
      "  .respond(dynamicResponse)",
      "  .respondWithTools([{ name: \"lookup\", args: { query: \"policy\" } }])",
      "  .structuredResponse({ answer: \"static\" })",
      "  .alwaysThrow(new Error(\"planned failure\"));",
      "const boundModel = model.bindTools([]);",
      "const runnable = RunnableLambda.from(async () => model.callCount);",
      "const toolTerms: StructuredTool[] = [];",
      "const fakeModelTerms = \"FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued BaseChatModel RunnableLambda StructuredTool ToolSpec\";",
      "void boundModel;",
      "void runnable;",
      "void toolTerms;",
      "void fakeModelTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; toolCount: number; outputCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      structuredOutputSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/fake-model-builder.ts");
    expect(report.sourcePattern).toContain("FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState");
    expect(report.sourcePattern).toContain("respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining([
      "fake-built-model",
      "fake-model-builder",
      "fake-model-response-queue",
      "fake-model-call-capture"
    ]));
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["fake-model-tool-calls"]));
    expect(readySignals(report.structuredOutputSignals)).toEqual(expect.arrayContaining(["fake-model-structured-response"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LLM observability readiness patterns without contacting observability services", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-observability-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-observability-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "datasets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prompts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "observability"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "observe:llm": "tsx src/observability/phoenix.ts",
        "prompt:sync": "langfuse prompts pull"
      },
      dependencies: {
        "@arizeai/phoenix-client": "latest",
        "@arizeai/phoenix-evals": "latest",
        "@arizeai/phoenix-otel": "latest",
        "@helicone/helpers": "latest",
        "@langfuse/tracing": "latest",
        "@opentelemetry/auto-instrumentations-node": "latest",
        "@opentelemetry/exporter-trace-otlp-http": "latest",
        "@opentelemetry/sdk-trace-node": "latest",
        langfuse: "latest",
        openai: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "langfuse",
      "litellm",
      "llama-index",
      "arize-phoenix-otel",
      "openinference-instrumentation-openai",
      "openinference-instrumentation-langchain",
      "opentelemetry-exporter-otlp"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "langfuse.py"), [
      "from langfuse import observe, get_client",
      "from langfuse.openai import openai",
      "from langfuse.decorators import langfuse_context",
      "from langfuse.callback import LangfuseCallbackHandler",
      "",
      "langfuse = get_client()",
      "callback_handler = LangfuseCallbackHandler()",
      "",
      "@observe(name=\"support-answer\")",
      "def answer(user_id: str, session_id: str, conversation_id: str, prompt: str):",
      "    langfuse_context.update_current_trace(",
      "        user_id=user_id,",
      "        session_id=session_id,",
      "        metadata={\"tenant\": \"acme\", \"conversation_id\": conversation_id, \"environment\": \"staging\"},",
      "        tags=[\"support\", \"rag\"],",
      "        release=\"2026.06\"",
      "    )",
      "    generation = openai.chat.completions.create(",
      "        model=\"gpt-4.1-mini\",",
      "        messages=[{\"role\": \"user\", \"content\": prompt}],",
      "        metadata={\"promptVersion\": \"support-v3\", \"promptTokens\": 42, \"completionTokens\": 12, \"totalTokens\": 54, \"cost\": 0.01, \"latency\": 120}",
      "    )",
      "    trace_id = langfuse_context.get_current_trace_id()",
      "    langfuse.score(name=\"helpfulness\", value=1, trace_id=trace_id)",
      "    langfuse.flush()",
      "    return generation, callback_handler"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "phoenix.ts"), [
      "import { register } from \"@arizeai/phoenix-otel\";",
      "import { OTLPTraceExporter } from \"@opentelemetry/exporter-trace-otlp-http\";",
      "import { NodeTracerProvider } from \"@opentelemetry/sdk-trace-node\";",
      "import { getNodeAutoInstrumentations } from \"@opentelemetry/auto-instrumentations-node\";",
      "import { registerInstrumentations } from \"@opentelemetry/instrumentation\";",
      "",
      "const provider = new NodeTracerProvider();",
      "const exporter = new OTLPTraceExporter({ url: process.env.PHOENIX_COLLECTOR_ENDPOINT });",
      "register({ projectName: \"support-agent\", endpoint: process.env.PHOENIX_COLLECTOR_ENDPOINT });",
      "registerInstrumentations({ instrumentations: [getNodeAutoInstrumentations()] });",
      "",
      "export const phoenixReadiness = {",
      "  provider,",
      "  exporter,",
      "  openInference: \"OpenInference instrumentation for OpenAI and LangChain\",",
      "  dataset: \"support-regression\",",
      "  experiment: \"prompt-v3-vs-v4\",",
      "  run_id: \"run-001\",",
      "  playground: \"prompt playground\",",
      "  benchmark: \"golden set\",",
      "  eval: \"quality score feedback link\",",
      "  span: \"retrieval-span\",",
      "  trace: \"support-trace\",",
      "  rootSpan: \"root span\",",
      "  childSpan: \"nested span\",",
      "  spanId: \"span_id\",",
      "  traceId: \"trace_id\"",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "helicone.ts"), [
      "import OpenAI from \"openai\";",
      "",
      "export const client = new OpenAI({",
      "  apiKey: process.env.OPENAI_API_KEY,",
      "  baseURL: \"https://ai-gateway.helicone.ai/v1\",",
      "  defaultHeaders: {",
      "    \"Helicone-Auth\": `Bearer ${process.env.HELICONE_API_KEY}`,",
      "    \"Helicone-User-Id\": \"user-123\",",
      "    \"Helicone-Session-Id\": \"session-456\",",
      "    \"Helicone-Property-Environment\": \"staging\",",
      "    \"Helicone-Cache-Enabled\": \"true\",",
      "    \"Helicone-Retry-Enabled\": \"true\",",
      "    \"Helicone-RateLimit-Policy\": \"support-tier\",",
      "    \"Helicone-Prompt-Id\": \"support-answer-v3\"",
      "  }",
      "});",
      "",
      "export const gatewayPolicy = \"provider routing with fallback retry and secondary provider\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "langfuse-ops.ts"), [
      "export const langfuseOperationalSignals = {",
      "  ingestionQueues: \"OtelIngestionQueue TraceUpsertQueue LANGFUSE_OTEL_INGESTION_QUEUE_SHARD_COUNT LANGFUSE_TRACE_UPSERT_QUEUE_ATTEMPTS ingestion queue events bucket\",",
      "  eventReplay: \"replayIngestionEvents Replay Ingestion Events failed ingestion events S3 access logs Athena\",",
      "  durableStorage: \"ClickHouse observations table traces table scores table LANGFUSE_S3_EVENT_UPLOAD_BUCKET LANGFUSE_S3_MEDIA_UPLOAD_BUCKET blob storage\",",
      "  retention: \"handleDataRetentionProcessingJob retentionDays LANGFUSE_TRACE_DELETE_DELAY_MS removeIngestionEventsFromS3AndDeleteClickhouseRefsForProject\",",
      "  metering: \"usageAggregation usageThreshold cloud usage metering tracing_observations\",",
      "  apiSurface: \"OpenAPI spec generated/api/openapi.yml Postman collection typed SDK\",",
      "  sdkIntegrations: \"OpenAI SDK Langchain LiteLLM LlamaIndex drop-in replacement automated instrumentation\",",
      "  reviewWorkflows: \"annotation queue annotationQueue manual labeling LLM-as-a-judge LANGFUSE_LLM_AS_JUDGE prompt playground\",",
      "  privacyBoundary: \"telemetry does not include raw traces, prompts, observations, scores, or dataset contents\",",
      "  safety: \"safe URL blocked IP SSRF LANGFUSE_API_TRACE_OBSERVATIONS_SIZE_LIMIT_BYTES LANGFUSE_SERVER_SIDE_IO_CHAR_LIMIT payloadSize too large size limit\"",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prompts", "support-answer.prompt.md"), [
      "---",
      "langfuse_prompt: support-answer",
      "promptVersion: v3",
      "metadata:",
      "  redaction: pii-mask",
      "  prompt_tokens: tracked",
      "  completion_tokens: tracked",
      "  total_tokens: tracked",
      "  total_cost: tracked",
      "  quality: feedback",
      "  prompt_filter: enabled",
      "  telemetry_opt_out: TELEMETRY_ENABLED=false",
      "  data_retention: 30 days",
      "---",
      "Answer with citations and collect thumbs up/down user feedback after the response."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "datasets", "support-observability.csv"), [
      "input,expected,feedback,annotation,label",
      "\"How do I reset?\",\"Use settings\",positive,\"manual review\",quality"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".env.example"), [
      "TELEMETRY_ENABLED=false",
      "PII_MASKING=true",
      "TRACE_REDACTION=enabled",
      "PROMPT_FILTER=enabled",
      "TRACE_RETENTION_DAYS=30",
      "LANGFUSE_API_TRACE_OBSERVATIONS_SIZE_LIMIT_BYTES=9500000",
      "LANGFUSE_SERVER_SIDE_IO_CHAR_LIMIT=200000"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "llm-observability.yml"), [
      "name: llm-observability",
      "on:",
      "  pull_request:",
      "  workflow_dispatch:",
      "jobs:",
      "  static-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: echo \"dashboard export self-host docker-compose helm Langfuse Phoenix Helicone OpenInference OpenTelemetry only\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-observability-readiness-report.json"), "utf8")) as {
      observabilitySetups: Array<{ filePath: string; platform: string; traceCount: number; spanCount: number; generationCount: number; sessionCount: number; userCount: number; metadataCount: number; scoreCount: number; tokenCount: number; costCount: number; promptCount: number; feedbackCount: number }>;
      traceSignals: Array<{ signal: string; readiness: string }>;
      instrumentationSignals: Array<{ signal: string; readiness: string }>;
      identitySignals: Array<{ signal: string; readiness: string }>;
      llmMetricSignals: Array<{ signal: string; readiness: string }>;
      feedbackSignals: Array<{ signal: string; readiness: string }>;
      datasetExperimentSignals: Array<{ signal: string; readiness: string }>;
      gatewaySignals: Array<{ signal: string; readiness: string }>;
      privacySignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const langfuseSetup = report.observabilitySetups.find((item) => item.filePath === "src/observability/langfuse.py");
    expect(report.observabilitySetups.length).toBeGreaterThan(0);
    expect(langfuseSetup?.platform).toBe("langfuse");
    expect(langfuseSetup?.traceCount).toBeGreaterThan(0);
    expect(langfuseSetup?.generationCount).toBeGreaterThan(0);
    expect(langfuseSetup?.sessionCount).toBeGreaterThan(0);
    expect(langfuseSetup?.userCount).toBeGreaterThan(0);
    expect(langfuseSetup?.metadataCount).toBeGreaterThan(0);
    expect(langfuseSetup?.scoreCount).toBeGreaterThan(0);
    expect(langfuseSetup?.tokenCount).toBeGreaterThan(0);
    expect(langfuseSetup?.costCount).toBeGreaterThan(0);
    expect(report.observabilitySetups.some((item) => item.platform === "phoenix")).toBe(true);
    expect(report.observabilitySetups.some((item) => item.platform === "helicone")).toBe(true);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.traceSignals, ["trace", "span", "observation", "generation", "root-span", "nested-span", "trace-id", "span-id"]);
    expectReady(report.instrumentationSignals, ["observe-decorator", "openai-wrapper", "callback-handler", "openinference", "opentelemetry", "otel-exporter", "tracer-provider", "auto-instrumentation"]);
    expectReady(report.identitySignals, ["user-id", "session-id", "conversation-id", "release", "environment", "tags", "metadata"]);
    expectReady(report.llmMetricSignals, ["prompt-tokens", "completion-tokens", "total-tokens", "cost", "latency", "model-name", "provider", "cache"]);
    expectReady(report.feedbackSignals, ["score", "feedback", "annotation", "label", "manual-review", "thumbs-up-down", "quality"]);
    expectReady(report.datasetExperimentSignals, ["dataset", "experiment", "run", "prompt-version", "playground", "benchmark", "eval-link"]);
    expectReady(report.gatewaySignals, ["base-url", "helicone-auth", "request-header", "property-header", "rate-limit", "retry", "provider-routing", "fallback"]);
    expectReady(report.privacySignals, ["masking", "redaction", "pii", "prompt-filter", "telemetry-opt-out", "telemetry-boundary", "data-retention", "data-retention-enforcement", "ssrf-protection", "io-size-limit"]);
    expectReady(report.workflowSignals, ["export", "api-client", "dashboard", "self-host", "docker-compose", "helm", "ci", "ingestion-queue", "event-replay", "clickhouse-storage", "blob-storage", "usage-metering", "openapi-spec", "sdk-integration", "annotation-queue", "llm-as-judge", "prompt-playground"]);
    expectReady(report.packageSignals, ["langfuse", "phoenix", "arize-phoenix-otel", "openinference", "opentelemetry", "helicone", "openai-sdk", "litellm", "llamaindex"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "llm-observability-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "llm-observability-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects LangChain tracer observability internals without exporting traces", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-tracer-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-tracer-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "observability"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langsmith: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "langchain-tracer.ts"), [
      "import { LangChainTracer } from \"@langchain/core/tracers/tracer_langchain\";",
      "import { RunCollectorCallbackHandler } from \"@langchain/core/tracers/run_collector\";",
      "import { LogStreamCallbackHandler, RunLogPatch, RunLog } from \"@langchain/core/tracers/log_stream\";",
      "import { EventStreamCallbackHandler, StreamEvent } from \"@langchain/core/tracers/event_stream\";",
      "import { RootListenersTracer } from \"@langchain/core/tracers/root_listener\";",
      "import { RunTree, convertToDottedOrderFormat } from \"langsmith/run_trees\";",
      "import { Client } from \"langsmith\";",
      "",
      "const client = {} as Client;",
      "const runTree = new RunTree({ id: \"run-1\", name: \"root\", run_type: \"chain\", inputs: {}, project_name: \"support\", client, tracingEnabled: false });",
      "const tracer = new LangChainTracer({ projectName: \"support\", client, metadata: { ls_agent_type: \"worker\", release: \"2026.06\", environment: \"staging\" }, tags: [\"support\", \"rag\"] });",
      "const copied = tracer.copyWithTracingConfig({ metadata: { tenant: \"acme\", usage_metadata: { input_tokens: 7, output_tokens: 3, total_tokens: 10 } }, tags: [\"child\"] });",
      "tracer.updateFromRunTree(runTree);",
      "tracer.getRunTreeWithTracingConfig(\"run-1\")?.patchRun();",
      "tracer.onLLMEnd({ outputs: { generations: [] }, extra: { metadata: {} } } as never);",
      "",
      "const collector = new RunCollectorCallbackHandler({ exampleId: \"example-1\" });",
      "collector.tracedRuns.push({ id: \"run-2\", reference_example_id: \"example-1\", trace_id: \"trace-1\" } as never);",
      "",
      "const logStream = new LogStreamCallbackHandler({ autoClose: true, includeNames: [\"answer\"], includeTypes: [\"llm\"], includeTags: [\"support\"], excludeTags: [\"debug\"], _schemaFormat: \"streaming_events\" });",
      "const patch = new RunLogPatch({ ops: [{ op: \"add\", path: \"/logs/answer/streamed_output_str/-\", value: \"token\" }] });",
      "const log = RunLog.fromRunLogPatch(patch);",
      "void log.concat(new RunLogPatch({ ops: [{ op: \"add\", path: \"/logs/answer/final_output\", value: { text: \"done\" } }] }));",
      "void logStream.tapOutputIterable(\"run-2\", (async function* () { yield \"chunk\"; })());",
      "",
      "const eventStream = new EventStreamCallbackHandler({ autoClose: true, includeNames: [\"answer\"], includeTypes: [\"chat_model\"], includeTags: [\"support\"], excludeNames: [\"debug\"] });",
      "const event: StreamEvent = { event: \"on_chat_model_stream\", name: \"answer\", run_id: \"run-3\", tags: [\"support\"], metadata: { trace_id: \"trace-3\" }, data: { chunk: \"token\" } };",
      "void eventStream.tapOutputIterable(\"run-3\", (async function* () { yield \"chunk\"; })());",
      "void eventStream.send(event, { name: \"answer\", tags: [\"support\"], metadata: {}, runType: \"chat_model\" });",
      "void eventStream.sendEndEvent({ ...event, event: \"on_chat_model_end\", data: { output: \"done\", input: \"question\" } }, { name: \"answer\", tags: [\"support\"], metadata: {}, runType: \"chat_model\" });",
      "",
      "const root = new RootListenersTracer({ config: { runName: \"support-root\", tags: [\"root\"] }, onStart: () => undefined, onEnd: () => undefined, onError: () => undefined });",
      "const dotted = convertToDottedOrderFormat(Date.now(), \"run-4\", 1);",
      "const terms = \"LangSmithTracingClientInterface getDefaultLangChainClientSingleton runTreeMap child_runs child_execution_order dotted_order trace_id _serialized_start_time lc_prefer_streaming runInfoMap tappedPromises readableStreamClosed writer receiveStream streamed_output streamed_output_str includeNames includeTypes includeTags excludeNames excludeTypes excludeTags rootId onRunCreate onRunUpdate onLLMNewToken onLLMStart onLLMEnd onToolStart\";",
      "void copied;",
      "void root;",
      "void dotted;",
      "void terms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-observability-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      observabilitySetups: Array<{ filePath: string; platform: string; traceCount: number; spanCount: number; metadataCount: number; tokenCount: number }>;
      traceSignals: Array<{ signal: string; readiness: string }>;
      instrumentationSignals: Array<{ signal: string; readiness: string }>;
      identitySignals: Array<{ signal: string; readiness: string }>;
      llmMetricSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.observabilitySetups.find((item) => item.filePath === "src/observability/langchain-tracer.ts");
    expect(report.sourcePattern).toBe("LLM observability readiness Langfuse Phoenix Helicone LangChainTracer RunCollectorCallbackHandler LogStreamCallbackHandler EventStreamCallbackHandler RootListenersTracer BaseTracer isBaseTracer convertRunTreeToRun convertRunToRunTree _addRunToRunMap runMap runTreeMap usesRunTreeMap getRunById persistRun _endTrace _getExecutionOrder _createRunForLLMStart parent_run_id child_runs child_execution_order trace_id dotted_order _serialized_start_time convertToDottedOrderFormat consumeCallback awaitAllCallbacks getQueue createQueue PQueue autoStart concurrency awaitHandlers getGlobalAsyncLocalStorageInstance asyncLocalStorageInstance.run awaitPendingTraceBatches Promise.allSettled queue.onIdle RunTree traces spans observations generations sessions userId sessionId metadata release tags scores feedback annotations datasets experiments prompt versions playground OpenInference OpenTelemetry OTLP exporter token usage promptTokens completionTokens totalTokens cost latency model provider gateway baseURL Helicone headers rate limit retry fallback redaction telemetry opt-out ingestion queues ClickHouse S3 blob storage data retention OpenAPI SDK integrations annotation queues LLM-as-a-judge usage metering event replay safe URL SSRF IO size limit");
    expect(setup?.platform).toBe("langsmith");
    expect(setup?.traceCount).toBeGreaterThan(0);
    expect(setup?.spanCount).toBeGreaterThan(0);
    expect(setup?.metadataCount).toBeGreaterThan(0);
    expect(setup?.tokenCount).toBeGreaterThan(0);
    expect(readySignals(report.traceSignals)).toEqual(expect.arrayContaining(["run-tree", "dotted-order", "stream-event", "run-log-patch", "trace-id"]));
    expect(readySignals(report.instrumentationSignals)).toEqual(expect.arrayContaining(["langchain-tracer", "run-collector", "log-stream-handler", "event-stream-handler", "root-listener", "callback-handler"]));
    expect(readySignals(report.identitySignals)).toEqual(expect.arrayContaining(["release", "environment", "tags", "metadata"]));
    expect(readySignals(report.llmMetricSignals)).toEqual(expect.arrayContaining(["prompt-tokens", "completion-tokens", "total-tokens"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["api-client", "run-tree-map", "stream-filter"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langsmith"]));
  });

  it("detects LangChain BaseTracer run lifecycle without exporting traces", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-base-tracer-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-base-tracer-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "observability"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langsmith: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "base-tracer.ts"), [
      "import { BaseTracer, isBaseTracer, type Run } from \"@langchain/core/tracers/base\";",
      "import { RunTree, convertToDottedOrderFormat } from \"langsmith/run_trees\";",
      "",
      "class StaticTracer extends BaseTracer {",
      "  protected async persistRun(run: Run): Promise<void> {",
      "    void run.id;",
      "    void run.trace_id;",
      "    void run.dotted_order;",
      "  }",
      "}",
      "",
      "const tracer = new StaticTracer();",
      "const run = {",
      "  id: \"run-1\",",
      "  name: \"root\",",
      "  parent_run_id: undefined,",
      "  start_time: Date.now(),",
      "  serialized: { lc: 1, type: \"constructor\", id: [\"fixture\"] },",
      "  events: [],",
      "  inputs: { prompts: [\"hello\"] },",
      "  execution_order: 1,",
      "  child_runs: [],",
      "  child_execution_order: 1,",
      "  run_type: \"llm\",",
      "  extra: { metadata: { trace_id: \"trace-1\" } },",
      "  tags: [\"base-tracer\"],",
      "} as unknown as Run;",
      "",
      "const runTree = {} as RunTree;",
      "const dotted = convertToDottedOrderFormat(Date.now(), run.id, run.execution_order);",
      "const baseTracerTerms = \"BaseTracer isBaseTracer convertRunTreeToRun convertRunToRunTree _addRunToRunMap runMap runTreeMap usesRunTreeMap getRunById persistRun _endTrace _getExecutionOrder _createRunForLLMStart parent_run_id child_runs child_execution_order trace_id dotted_order _serialized_start_time convertToDottedOrderFormat BaseRun RunTree\";",
      "void tracer;",
      "void isBaseTracer;",
      "void runTree;",
      "void dotted;",
      "void baseTracerTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-observability-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      observabilitySetups: Array<{ filePath: string; platform: string; traceCount: number; spanCount: number; metadataCount: number }>;
      traceSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.observabilitySetups.find((item) => item.filePath === "src/observability/base-tracer.ts");
    expect(report.sourcePattern).toContain("BaseTracer isBaseTracer convertRunTreeToRun convertRunToRunTree _addRunToRunMap");
    expect(report.sourcePattern).toContain("runMap runTreeMap usesRunTreeMap getRunById persistRun _endTrace _getExecutionOrder _createRunForLLMStart");
    expect(setup?.platform).toBe("langsmith");
    expect(setup?.traceCount).toBeGreaterThan(0);
    expect(setup?.spanCount).toBeGreaterThan(0);
    expect(setup?.metadataCount).toBeGreaterThan(0);
    expect(readySignals(report.traceSignals)).toEqual(expect.arrayContaining([
      "base-tracer-run",
      "run-map-lifecycle",
      "parent-child-run-order",
      "run-tree",
      "dotted-order",
      "trace-id"
    ]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["run-tree-map"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langsmith"]));
  });

  it("detects LangChain callback promise queue readiness without draining callbacks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-callback-queue-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-callback-queue-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "observability"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langsmith: "latest",
        "p-queue": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "observability", "callback-queue.ts"), [
      "import { awaitAllCallbacks, consumeCallback } from \"@langchain/core/callbacks/promises\";",
      "import { getDefaultLangChainClientSingleton } from \"@langchain/core/singletons/tracer\";",
      "import { getGlobalAsyncLocalStorageInstance } from \"@langchain/core/singletons/async_local_storage/globals\";",
      "",
      "type QueueTerms = { autoStart: true; concurrency: 1; wait: boolean };",
      "const queueTerms: QueueTerms = { autoStart: true, concurrency: 1, wait: false };",
      "const callbackQueueTerms = \"getQueue createQueue PQueue autoStart concurrency consumeCallback awaitHandlers wait true queue.add getGlobalAsyncLocalStorageInstance asyncLocalStorageInstance.run undefined awaitAllCallbacks Promise.allSettled queue.onIdle getDefaultLangChainClientSingleton awaitPendingTraceBatches metadata trace batch\";",
      "void queueTerms;",
      "void callbackQueueTerms;",
      "void consumeCallback;",
      "void awaitAllCallbacks;",
      "void getDefaultLangChainClientSingleton;",
      "void getGlobalAsyncLocalStorageInstance;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-observability-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      observabilitySetups: Array<{ filePath: string; platform: string; traceCount: number; metadataCount: number }>;
      instrumentationSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.observabilitySetups.find((item) => item.filePath === "src/observability/callback-queue.ts");
    expect(report.sourcePattern).toContain("consumeCallback awaitAllCallbacks getQueue createQueue PQueue autoStart concurrency awaitHandlers");
    expect(report.sourcePattern).toContain("getGlobalAsyncLocalStorageInstance asyncLocalStorageInstance.run awaitPendingTraceBatches Promise.allSettled queue.onIdle");
    expect(setup?.platform).toBe("langsmith");
    expect(setup?.traceCount).toBeGreaterThan(0);
    expect(setup?.metadataCount).toBeGreaterThan(0);
    expect(readySignals(report.instrumentationSignals)).toEqual(expect.arrayContaining(["callback-promise-queue"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining([
      "callback-queue-drain",
      "callback-context-clear",
      "trace-batch-flush"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langsmith"]));
  });

  it("detects vector DB readiness patterns without running vector databases", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-vector-db-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-vector-db-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "vector:index": "tsx src/vector/qdrant.ts",
        "vector:query": "python src/vector/chroma.py",
        "vector:ops": "echo vector backup restore migration metrics"
      },
      dependencies: {
        "@pinecone-database/pinecone": "latest",
        "@qdrant/js-client-rest": "latest",
        chromadb: "latest",
        "weaviate-client": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "qdrant-client",
      "weaviate-client",
      "chromadb",
      "sentence-transformers",
      "faiss-cpu",
      "pgvector",
      "pymilvus"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "qdrant.ts"), [
      "import { QdrantClient } from \"@qdrant/js-client-rest\";",
      "",
      "const client = new QdrantClient({ url: process.env.QDRANT_URL, apiKey: process.env.QDRANT_API_KEY });",
      "await client.createCollection(\"docs\", {",
      "  vectors: { size: 1536, distance: \"Cosine\" },",
      "  hnsw_config: { m: 16, ef_construct: 100 },",
      "  quantization_config: { scalar: { type: \"int8\" } },",
      "  shard_number: 3,",
      "  replication_factor: 3,",
      "  write_consistency_factor: 2",
      "});",
      "await client.createPayloadIndex(\"docs\", { field_name: \"tenant\", field_schema: \"keyword\" });",
      "await client.upsert(\"docs\", {",
      "  wait: true,",
      "  points: [{ id: \"doc-1\", vector: [0.1, 0.2, 0.3], payload: { tenant: \"acme\", source: \"manual\", metadata: { filename: \"manual.md\" }, sparse_vectors: { bm25: [1, 3] } } }]",
      "});",
      "await client.search(\"docs\", {",
      "  vector: [0.1, 0.2, 0.3],",
      "  filter: { must: [{ key: \"tenant\", match: { value: \"acme\" } }] },",
      "  limit: 5,",
      "  with_payload: true,",
      "  score_threshold: 0.8,",
      "  consistency: \"quorum\"",
      "});",
      "await client.delete(\"docs\", { points: [\"doc-old\"] });",
      "await client.createSnapshot(\"docs\");",
      "export const searchNotes = \"vector similarity nearest neighbor ann score sparse vector BM25 multimodal CLIP image chunks RecursiveCharacterTextSplitter\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "weaviate.py"), [
      "import weaviate",
      "from weaviate.classes.config import Configure, DataType, Property",
      "",
      "client = weaviate.connect_to_local(headers={\"X-OpenAI-Api-Key\": \"env\"})",
      "articles = client.collections.create(",
      "    name=\"Article\",",
      "    vector_config=Configure.Vectors.text2vec_openai(model=\"text-embedding-3-small\"),",
      "    properties=[Property(name=\"title\", data_type=DataType.TEXT), Property(name=\"tenant\", data_type=DataType.TEXT)],",
      "    multi_tenancy_config=Configure.multi_tenancy(enabled=True),",
      "    replication_config=Configure.replication(factor=3)",
      ")",
      "batch_size = 100",
      "articles.data.insert(properties={\"title\": \"Vector DB\", \"tenant\": \"acme\", \"documents\": \"chunks\"}, vector=[0.1, 0.2, 0.3])",
      "results = articles.query.hybrid(query=\"policy\", where={\"path\": [\"tenant\"], \"operator\": \"Equal\", \"valueText\": \"acme\"}, limit=5)",
      "generated = articles.generate.near_text(query=\"database\", grouped_task=\"summarize with RAG\")",
      "rerank = \"rerank by cross-encoder after hybrid BM25 sparse vector search\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "chroma.py"), [
      "import chromadb",
      "from chromadb.utils import embedding_functions",
      "",
      "client = chromadb.PersistentClient(path=\"./chroma\")",
      "http_client = chromadb.HttpClient(host=\"localhost\", port=8000)",
      "embedding_function = embedding_functions.OpenAIEmbeddingFunction(model_name=\"text-embedding-3-small\", api_key=\"env\")",
      "collection = client.get_or_create_collection(name=\"docs\", metadata={\"hnsw:space\": \"cosine\"}, embedding_function=embedding_function)",
      "collection.add(ids=[\"1\"], documents=[\"policy chunk\"], metadatas=[{\"tenant\": \"acme\", \"source\": \"guide\"}])",
      "collection.upsert(ids=[\"2\"], documents=[\"second chunk\"], metadatas=[{\"tenant\": \"acme\"}], embeddings=[[0.1, 0.2, 0.3]])",
      "results = collection.query(query_texts=[\"policy\"], n_results=5, where={\"tenant\": \"acme\"}, where_document={\"$contains\": \"keyword\"}, include=[\"documents\", \"metadatas\", \"distances\"])",
      "collection.delete(ids=[\"stale\"])",
      "notes = \"full-text keyword sparse vector multimodal audio visual search text splitter chunks\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "ops.sql"), [
      "CREATE EXTENSION vector;",
      "CREATE TABLE documents (id text primary key, embedding vector(1536), metadata jsonb);",
      "CREATE INDEX documents_embedding_hnsw ON documents USING hnsw (embedding vector_cosine_ops);",
      "-- vector index migration backup restore health metrics ttl multi-tenancy replication sharding consistency pgvector"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "vector-db.yaml"), [
      "qdrant:",
      "  endpoint: ${QDRANT_URL}",
      "  health: /healthz",
      "  metrics: prometheus",
      "  backup: s3://vector-backups",
      "  restore: true",
      "  migration: reindex",
      "  ttl: 30d",
      "  tenant_key: tenant",
      "  replication_factor: 3",
      "  read_consistency: quorum",
      "  api_key_env: QDRANT_API_KEY"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "vector-db.yml"), [
      "name: vector-db",
      "on:",
      "  pull_request:",
      "  workflow_dispatch:",
      "jobs:",
      "  static-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: echo \"Qdrant Weaviate Chroma Pinecone Milvus pgvector FAISS vector index backup restore metrics health migration ttl static only\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      vectorSetups: Array<{ filePath: string; platform: string; collectionCount: number; embeddingCount: number; upsertCount: number; queryCount: number }>;
      collectionSignals: Array<{ signal: string; readiness: string }>;
      clientSignals: Array<{ signal: string; readiness: string }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      embeddingSignals: Array<{ signal: string; readiness: string }>;
      indexSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.vectorSetups.length).toBeGreaterThan(0);
    expect(report.vectorSetups.some((item) => item.platform === "qdrant")).toBe(true);
    expect(report.vectorSetups.some((item) => item.platform === "weaviate")).toBe(true);
    expect(report.vectorSetups.some((item) => item.platform === "chroma")).toBe(true);
    const qdrantSetup = report.vectorSetups.find((item) => item.filePath === "src/vector/qdrant.ts");
    expect(qdrantSetup?.collectionCount).toBeGreaterThan(0);
    expect(qdrantSetup?.embeddingCount).toBeGreaterThan(0);
    expect(qdrantSetup?.upsertCount).toBeGreaterThan(0);
    expect(qdrantSetup?.queryCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.collectionSignals, ["collection", "class", "schema", "vector-config", "distance", "dimensions", "hnsw"]);
    expectReady(report.clientSignals, ["qdrant-client", "weaviate-client", "chromadb-client", "http-client", "persistent-client", "api-key", "endpoint"]);
    expectReady(report.ingestionSignals, ["add", "upsert", "batch", "ids", "documents", "metadata", "payload", "delete"]);
    expectReady(report.querySignals, ["search", "query", "nearest-neighbor", "similarity", "hybrid", "full-text", "filter", "limit", "score"]);
    expectReady(report.embeddingSignals, ["embedding-function", "vectorizer", "model-provider", "precomputed-vector", "sparse-vector", "multimodal", "text-splitter"]);
    expectReady(report.indexSignals, ["hnsw", "quantization", "payload-index", "vector-index", "distance-metric", "shard", "replication", "consistency"]);
    expectReady(report.opsSignals, ["snapshot", "backup", "restore", "health", "metrics", "migration", "multi-tenancy", "ttl"]);
    expectReady(report.packageSignals, ["qdrant-client", "weaviate-client", "chromadb", "pinecone", "pymilvus", "pgvector", "faiss"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "vector-db-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "vector-db-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects LangChain vector store abstraction readiness without querying vector stores", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-vector-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-vector-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "langchain-vectorstore.ts"), [
      "import { DocumentInterface } from \"@langchain/core/documents\";",
      "import { EmbeddingsInterface } from \"@langchain/core/embeddings\";",
      "import { CallbackManagerForRetrieverRun } from \"@langchain/core/callbacks/manager\";",
      "import { MaxMarginalRelevanceSearchOptions, SaveableVectorStore, VectorStoreRetriever, VectorStoreRetrieverInput } from \"@langchain/core/vectorstores\";",
      "",
      "type FilterType = { tenant?: string } | ((doc: DocumentInterface) => boolean);",
      "",
      "export class TenantVectorStore extends SaveableVectorStore {",
      "  declare FilterType: FilterType;",
      "  lc_namespace = [\"langchain\", \"vectorstores\", this._vectorstoreType()];",
      "  memoryVectors: Array<{ embedding: number[]; document: DocumentInterface; metadata: Record<string, unknown> }> = [];",
      "",
      "  _vectorstoreType(): string { return \"tenant-memory\"; }",
      "",
      "  async addVectors(vectors: number[][], documents: DocumentInterface[], options?: Record<string, unknown>): Promise<string[]> {",
      "    this.memoryVectors = this.memoryVectors.concat(vectors.map((embedding, index) => ({ embedding, document: documents[index], metadata: documents[index].metadata ?? {} })));",
      "    return documents.map((_, index) => `doc-${index}-${String(options?.tenant ?? \"global\")}`);",
      "  }",
      "",
      "  async addDocuments(documents: DocumentInterface[], options?: Record<string, unknown>): Promise<string[]> {",
      "    const vectors = await this.embeddings.embedDocuments(documents.map((doc) => doc.pageContent));",
      "    return this.addVectors(vectors, documents, options);",
      "  }",
      "",
      "  async delete(params?: Record<string, unknown>): Promise<void> { void params?.tenant; }",
      "",
      "  async similaritySearchVectorWithScore(query: number[], k: number, filter?: this[\"FilterType\"]): Promise<[DocumentInterface, number][]> {",
      "    void filter;",
      "    return this.memoryVectors.slice(0, k).map((item, index) => [item.document, query[index] ?? 0]);",
      "  }",
      "",
      "  async maxMarginalRelevanceSearch(query: string, options: MaxMarginalRelevanceSearchOptions<this[\"FilterType\"]>, runManager?: CallbackManagerForRetrieverRun): Promise<DocumentInterface[]> {",
      "    const child = runManager?.getChild(\"vectorstore\");",
      "    const vector = await this.embeddings.embedQuery(query);",
      "    const scored = await this.similaritySearchVectorWithScore(vector, options.fetchK ?? options.k, options.filter);",
      "    void child;",
      "    void options.lambda;",
      "    return scored.slice(0, options.k).map(([document]) => document);",
      "  }",
      "",
      "  async save(directory: string): Promise<void> { void directory; }",
      "  static async load(directory: string, embeddings: EmbeddingsInterface): Promise<TenantVectorStore> { return new TenantVectorStore(embeddings, { directory }); }",
      "  static async fromTexts(texts: string[], metadatas: object[] | object, embeddings: EmbeddingsInterface, dbConfig: Record<string, unknown>): Promise<TenantVectorStore> {",
      "    const store = new TenantVectorStore(embeddings, dbConfig);",
      "    await store.addVectors(await embeddings.embedDocuments(texts), texts.map((text, index) => ({ pageContent: text, metadata: Array.isArray(metadatas) ? metadatas[index] : metadatas } as DocumentInterface)));",
      "    return store;",
      "  }",
      "  static async fromDocuments(docs: DocumentInterface[], embeddings: EmbeddingsInterface, dbConfig: Record<string, unknown>): Promise<TenantVectorStore> {",
      "    const store = new TenantVectorStore(embeddings, dbConfig);",
      "    await store.addDocuments(docs, { source: \"fromDocuments\" });",
      "    return store;",
      "  }",
      "}",
      "",
      "export async function makeRetriever(store: TenantVectorStore, filter: FilterType): Promise<VectorStoreRetriever<TenantVectorStore>> {",
      "  const retrieverInput: Partial<VectorStoreRetrieverInput<TenantVectorStore>> = {",
      "    k: 5,",
      "    filter,",
      "    searchType: \"mmr\",",
      "    searchKwargs: { fetchK: 20, lambda: 0.35 },",
      "    tags: [store._vectorstoreType(), \"tenant\"],",
      "    metadata: { tenant: \"acme\", vectorStore: store._vectorstoreType() },",
      "    verbose: true,",
      "  };",
      "  const retriever = store.asRetriever(retrieverInput);",
      "  await store.similaritySearch(\"policy\", 4, filter);",
      "  await store.similaritySearchWithScore(\"policy\", 4, filter);",
      "  await store.similaritySearchVectorWithScore(await store.embeddings.embedQuery(\"policy\"), 4, filter);",
      "  return retriever;",
      "}",
      "",
      "const terms = \"VectorStoreInterface VectorStoreRetrieverInterface MaxMarginalRelevanceSearchOptions VectorStoreRetrieverMMRSearchKwargs addVectors addDocuments fromTexts fromDocuments fromExistingIndex similaritySearch similaritySearchWithScore similaritySearchVectorWithScore maxMarginalRelevanceSearch asRetriever SaveableVectorStore embedDocuments embedQuery searchType mmr fetchK lambda filter callbacks tags metadata verbose\";",
      "void terms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      vectorSetups: Array<{ filePath: string; platform: string; embeddingCount: number; upsertCount: number; queryCount: number; filterCount: number; rerankCount: number; snapshotCount: number }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      embeddingSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.vectorSetups.find((item) => item.filePath === "src/vector/langchain-vectorstore.ts");
    expect(report.sourcePattern).toBe("Vector DB readiness Qdrant Weaviate Chroma LangChain VectorStore VectorStoreRetriever MemoryVectorStore FakeVectorStore FakeVectorStoreArgs EmbeddingsInterface Embeddings EmbeddingsParams AsyncCaller AsyncCallerParams caller maxConcurrency maxRetries MemoryVector memoryVectors _queryVectors filterFunction filteredMemoryVectors maximalMarginalRelevance queryEmbedding embeddingList mmrIndexes selectedEmbeddingsIndexes fromExistingIndex id DocumentInterface SyntheticEmbeddings similarityCalledCount custom similarity MMR similaritySearchWithScore addVectors addDocuments asRetriever RecordManagerInterface IndexingResult _HashedDocument HashedDocumentInterface CleanupMode IndexOptions sourceIdKey cleanupBatchSize forceUpdate _batch _deduplicateInOrder _getSourceIdAssigner _isBaseDocumentLoader indexStartDt timeAtLeast groupIds docsToIndex docsToUpdate seenDocs listKeys deleteKeys numAdded numDeleted numUpdated numSkipped UUIDV5_NAMESPACE hash_ contentHash metadataHash calculateHashes toDocument collections classes schema vector config embeddings vectorizer distance dimensions HNSW payload metadata filters StructuredQuery FilterDirective Comparison Operation Operators Comparators Visitor VisitorResult VisitorOperationResult VisitorComparisonResult VisitorStructuredQueryResult BaseTranslator BasicTranslator FunctionalTranslator FunctionFilter ValueType getAllowedComparatorsForType getComparatorFunction getOperatorFunction undefinedTrue TranslatorOpts allowedOperators allowedComparators visitOperation visitComparison visitStructuredQuery formatFunction mergeFilters isFilterEmpty castValue forceDefaultFilter mergeType hybrid search BM25 sparse vectors upsert add query search nearest neighbors score limit snapshots backup restore sharding replication tenancy ttl clients endpoints API keys persistence");
    expect(setup?.platform).toBe("langchain");
    expect(setup?.embeddingCount).toBeGreaterThan(0);
    expect(setup?.upsertCount).toBeGreaterThan(0);
    expect(setup?.queryCount).toBeGreaterThan(0);
    expect(setup?.filterCount).toBeGreaterThan(0);
    expect(setup?.rerankCount).toBeGreaterThan(0);
    expect(setup?.snapshotCount).toBeGreaterThan(0);
    expect(readySignals(report.ingestionSignals)).toEqual(expect.arrayContaining(["add-vectors", "from-texts", "from-documents"]));
    expect(readySignals(report.querySignals)).toEqual(expect.arrayContaining(["similarity-with-score", "mmr", "as-retriever"]));
    expect(readySignals(report.embeddingSignals)).toEqual(expect.arrayContaining(["embed-documents", "embed-query"]));
    expect(readySignals(report.opsSignals)).toEqual(expect.arrayContaining(["saveable-vectorstore"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain MemoryVectorStore readiness without running similarity search", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-memory-vector-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-memory-vector-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "memory-vectorstore.ts"), [
      "import { Document, type DocumentInterface } from \"@langchain/core/documents\";",
      "import type { EmbeddingsInterface } from \"@langchain/core/embeddings\";",
      "import { maximalMarginalRelevance } from \"@langchain/core/utils/math\";",
      "import { VectorStore, type MaxMarginalRelevanceSearchOptions } from \"@langchain/core/vectorstores\";",
      "import { MemoryVectorStore } from \"langchain/vectorstores/memory\";",
      "import { cosine } from \"langchain/util/ml-distance/similarities\";",
      "",
      "type MemoryVector = { content: string; embedding: number[]; metadata: Record<string, unknown>; id?: string };",
      "type FilterType = (doc: DocumentInterface) => boolean;",
      "",
      "export class StaticMemoryVectorStore extends VectorStore {",
      "  declare FilterType: FilterType;",
      "  memoryVectors: MemoryVector[] = [];",
      "  similarity: typeof cosine;",
      "",
      "  _vectorstoreType(): string { return \"memory\"; }",
      "",
      "  constructor(embeddings: EmbeddingsInterface, { similarity, ...rest }: { similarity?: typeof cosine } = {}) {",
      "    super(embeddings, rest);",
      "    this.similarity = similarity ?? cosine;",
      "  }",
      "",
      "  async addDocuments(documents: Document[]): Promise<void> {",
      "    const texts = documents.map(({ pageContent }) => pageContent);",
      "    return this.addVectors(await this.embeddings.embedDocuments(texts), documents);",
      "  }",
      "",
      "  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {",
      "    const memoryVectors = vectors.map((embedding, idx) => ({ content: documents[idx].pageContent, embedding, metadata: documents[idx].metadata, id: documents[idx].id }));",
      "    this.memoryVectors = this.memoryVectors.concat(memoryVectors);",
      "  }",
      "",
      "  protected async _queryVectors(query: number[], k: number, filter?: this[\"FilterType\"]) {",
      "    const filterFunction = (memoryVector: MemoryVector) => {",
      "      if (!filter) return true;",
      "      const doc = new Document({ metadata: memoryVector.metadata, pageContent: memoryVector.content, id: memoryVector.id });",
      "      return filter(doc);",
      "    };",
      "    const filteredMemoryVectors = this.memoryVectors.filter(filterFunction);",
      "    return filteredMemoryVectors.map((vector, index) => ({ similarity: this.similarity(query, vector.embedding), index, metadata: vector.metadata, content: vector.content, embedding: vector.embedding, id: vector.id })).sort((a, b) => (a.similarity > b.similarity ? -1 : 0)).slice(0, k);",
      "  }",
      "",
      "  async similaritySearchVectorWithScore(query: number[], k: number, filter?: this[\"FilterType\"]): Promise<[Document, number][]> {",
      "    const searches = await this._queryVectors(query, k, filter);",
      "    return searches.map((search) => [new Document({ metadata: search.metadata, pageContent: search.content, id: search.id }), search.similarity]);",
      "  }",
      "",
      "  async maxMarginalRelevanceSearch(query: string, options: MaxMarginalRelevanceSearchOptions<this[\"FilterType\"]>): Promise<DocumentInterface[]> {",
      "    const queryEmbedding = await this.embeddings.embedQuery(query);",
      "    const searches = await this._queryVectors(queryEmbedding, options.fetchK ?? 20, options.filter);",
      "    const embeddingList = searches.map((searchResp) => searchResp.embedding);",
      "    const mmrIndexes = maximalMarginalRelevance(queryEmbedding, embeddingList, options.lambda, options.k);",
      "    return mmrIndexes.map((idx) => new Document({ metadata: searches[idx].metadata, pageContent: searches[idx].content, id: searches[idx].id }));",
      "  }",
      "",
      "  static async fromTexts(texts: string[], metadatas: object[] | object, embeddings: EmbeddingsInterface): Promise<StaticMemoryVectorStore> {",
      "    const docs = texts.map((text, i) => new Document({ pageContent: text, metadata: Array.isArray(metadatas) ? metadatas[i] : metadatas }));",
      "    return StaticMemoryVectorStore.fromDocuments(docs, embeddings);",
      "  }",
      "",
      "  static async fromDocuments(docs: Document[], embeddings: EmbeddingsInterface): Promise<StaticMemoryVectorStore> {",
      "    const instance = new this(embeddings);",
      "    await instance.addDocuments(docs);",
      "    return instance;",
      "  }",
      "",
      "  static async fromExistingIndex(embeddings: EmbeddingsInterface): Promise<StaticMemoryVectorStore> { return new this(embeddings); }",
      "}",
      "",
      "const memoryStoreType: typeof MemoryVectorStore = MemoryVectorStore;",
      "const memoryVectorTerms = \"MemoryVectorStore FakeVectorStore FakeVectorStoreArgs EmbeddingsInterface Embeddings EmbeddingsParams AsyncCaller AsyncCallerParams caller maxConcurrency maxRetries MemoryVector memoryVectors _queryVectors filterFunction filteredMemoryVectors similarity sort descending similaritySearchVectorWithScore maxMarginalRelevanceSearch maximalMarginalRelevance queryEmbedding embeddingList mmrIndexes selectedEmbeddingsIndexes fromExistingIndex id DocumentInterface SyntheticEmbeddings similarityCalledCount custom similarity cosine asRetriever searchType mmr fetchK lambda\";",
      "void memoryStoreType;",
      "void memoryVectorTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      vectorSetups: Array<{ filePath: string; platform: string; embeddingCount: number; upsertCount: number; queryCount: number; filterCount: number; rerankCount: number; snapshotCount: number }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      embeddingSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.vectorSetups.find((item) => item.filePath === "src/vector/memory-vectorstore.ts");
    expect(report.sourcePattern).toContain("MemoryVectorStore FakeVectorStore FakeVectorStoreArgs EmbeddingsInterface Embeddings EmbeddingsParams AsyncCaller AsyncCallerParams caller maxConcurrency maxRetries MemoryVector memoryVectors _queryVectors filterFunction");
    expect(report.sourcePattern).toContain("maximalMarginalRelevance queryEmbedding embeddingList mmrIndexes selectedEmbeddingsIndexes");
    expect(report.sourcePattern).toContain("fromExistingIndex id DocumentInterface SyntheticEmbeddings similarityCalledCount custom similarity");
    expect(setup?.platform).toBe("langchain");
    expect(setup?.embeddingCount).toBeGreaterThan(0);
    expect(setup?.upsertCount).toBeGreaterThan(0);
    expect(setup?.queryCount).toBeGreaterThan(0);
    expect(setup?.filterCount).toBeGreaterThan(0);
    expect(setup?.rerankCount).toBeGreaterThan(0);
    expect(setup?.snapshotCount).toBeGreaterThan(0);
    expect(readySignals(report.ingestionSignals)).toEqual(expect.arrayContaining(["memory-vector-store", "memory-vector-ids", "add-vectors", "from-texts", "from-documents"]));
    expect(readySignals(report.querySignals)).toEqual(expect.arrayContaining(["memory-query-vectors", "mmr-index-selection", "similarity-sort", "similarity-with-score", "mmr"]));
    expect(readySignals(report.embeddingSignals)).toEqual(expect.arrayContaining(["embed-documents", "embed-query", "custom-similarity-function"]));
    expect(readySignals(report.opsSignals)).toEqual(expect.arrayContaining(["from-existing-index"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain FakeVectorStore readiness without running similarity search", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-fake-vector-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-fake-vector-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "fake-vectorstore.ts"), [
      "import { Document } from \"@langchain/core/documents\";",
      "import type { EmbeddingsInterface } from \"@langchain/core/embeddings\";",
      "import { FakeVectorStore, type FakeVectorStoreArgs } from \"@langchain/core/utils/testing\";",
      "import { cosine } from \"@langchain/core/utils/math\";",
      "",
      "type FilterType = (doc: Document) => boolean;",
      "",
      "export function previewFakeVectorStore(embeddings: EmbeddingsInterface, dbConfig?: FakeVectorStoreArgs) {",
      "  const store = new FakeVectorStore(embeddings, { similarity: dbConfig?.similarity ?? cosine });",
      "  const filter: FilterType = (doc) => doc.metadata.tenant === \"acme\";",
      "  const documents = [new Document({ pageContent: \"policy\", metadata: { tenant: \"acme\" } })];",
      "  const vector = [0.1, 0.2, 0.3];",
      "  const plan = {",
      "    addDocuments: \"store.addDocuments(documents)\",",
      "    addVectors: \"store.addVectors([vector], documents)\",",
      "    similaritySearchVectorWithScore: \"store.similaritySearchVectorWithScore(vector, 1, filter)\",",
      "    fromTexts: \"FakeVectorStore.fromTexts([policy], [{ tenant: acme }], embeddings, dbConfig)\",",
      "    fromDocuments: \"FakeVectorStore.fromDocuments(documents, embeddings, dbConfig)\",",
      "    fromExistingIndex: \"FakeVectorStore.fromExistingIndex(embeddings, dbConfig)\",",
      "  };",
      "  void filter;",
      "  void vector;",
      "  void plan;",
      "  return store;",
      "}",
      "",
      "const fakeVectorTerms = \"FakeVectorStore FakeVectorStoreArgs EmbeddingsInterface Embeddings EmbeddingsParams AsyncCaller AsyncCallerParams caller maxConcurrency maxRetries MemoryVector memoryVectors similarity cosine FilterType filterFunction filteredMemoryVectors similaritySearchVectorWithScore addDocuments addVectors fromTexts fromDocuments fromExistingIndex Document pageContent metadata\";",
      "void fakeVectorTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      vectorSetups: Array<{ filePath: string; platform: string; embeddingCount: number; upsertCount: number; queryCount: number; filterCount: number; snapshotCount: number }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      embeddingSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.vectorSetups.find((item) => item.filePath === "src/vector/fake-vectorstore.ts");
    expect(report.sourcePattern).toContain("FakeVectorStore FakeVectorStoreArgs EmbeddingsInterface");
    expect(setup?.platform).toBe("langchain");
    expect(setup?.embeddingCount).toBeGreaterThan(0);
    expect(setup?.upsertCount).toBeGreaterThan(0);
    expect(setup?.queryCount).toBeGreaterThan(0);
    expect(setup?.filterCount).toBeGreaterThan(0);
    expect(setup?.snapshotCount).toBeGreaterThan(0);
    expect(readySignals(report.ingestionSignals)).toEqual(expect.arrayContaining(["fake-vector-store", "add-vectors", "from-texts", "from-documents"]));
    expect(readySignals(report.querySignals)).toEqual(expect.arrayContaining(["fake-vector-search", "similarity-with-score"]));
    expect(readySignals(report.embeddingSignals)).toEqual(expect.arrayContaining(["fake-vector-embedding", "custom-similarity-function"]));
    expect(readySignals(report.opsSignals)).toEqual(expect.arrayContaining(["from-existing-index"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain base embeddings readiness without calling embedding providers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-base-embeddings-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-base-embeddings-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "base-embeddings.ts"), [
      "import { Embeddings, type EmbeddingsInterface, type EmbeddingsParams } from \"@langchain/core/embeddings\";",
      "import { AsyncCaller, type AsyncCallerParams } from \"@langchain/core/utils/async_caller\";",
      "",
      "export class StaticEmbeddings extends Embeddings<number[]> {",
      "  constructor(params: EmbeddingsParams = { maxConcurrency: 2, maxRetries: 0 }) {",
      "    super(params);",
      "  }",
      "",
      "  async embedDocuments(documents: string[]): Promise<number[][]> {",
      "    return documents.map((document, index) => [document.length, index]);",
      "  }",
      "",
      "  async embedQuery(document: string): Promise<number[]> {",
      "    return [document.length, 1];",
      "  }",
      "}",
      "",
      "const embeddings: EmbeddingsInterface<number[]> = new StaticEmbeddings({ maxConcurrency: 1 } satisfies AsyncCallerParams);",
      "const caller: AsyncCaller = (embeddings as StaticEmbeddings).caller;",
      "const embeddingTerms = \"Embeddings EmbeddingsInterface EmbeddingsParams AsyncCaller AsyncCallerParams caller maxConcurrency maxRetries embedDocuments embedQuery Promise<TOutput[]> Promise<TOutput> vector for each document\";",
      "void caller;",
      "void embeddingTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      vectorSetups: Array<{ filePath: string; platform: string; embeddingCount: number }>;
      embeddingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.vectorSetups.find((item) => item.filePath === "src/vector/base-embeddings.ts");
    expect(report.sourcePattern).toContain("Embeddings EmbeddingsParams AsyncCaller AsyncCallerParams caller maxConcurrency maxRetries");
    expect(setup?.platform).toBe("langchain");
    expect(setup?.embeddingCount).toBeGreaterThan(0);
    expect(readySignals(report.embeddingSignals)).toEqual(expect.arrayContaining([
      "base-embeddings",
      "embeddings-params",
      "embedding-async-caller",
      "embed-documents",
      "embed-query"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain indexing cleanup readiness without mutating vector stores", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-indexing-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-indexing-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "langchain-indexing.ts"), [
      "import { Document, type DocumentInterface } from \"@langchain/core/documents\";",
      "import type { BaseDocumentLoader } from \"@langchain/core/document_loaders/base\";",
      "import { index, _HashedDocument, _batch, _deduplicateInOrder, _getSourceIdAssigner, _isBaseDocumentLoader, type HashedDocumentInterface, type IndexOptions, type IndexingResult } from \"@langchain/core/indexing\";",
      "import type { RecordManagerInterface } from \"@langchain/core/indexing/record_manager\";",
      "import type { VectorStore } from \"@langchain/core/vectorstores\";",
      "",
      "const options: IndexOptions = {",
      "  batchSize: 100,",
      "  cleanup: \"incremental\",",
      "  sourceIdKey: \"source\",",
      "  cleanupBatchSize: 1000,",
      "  forceUpdate: true,",
      "};",
      "",
      "function sourceIdKey(doc: DocumentInterface): string {",
      "  return String(doc.metadata.source);",
      "}",
      "",
      "const sourceIdAssigner = _getSourceIdAssigner(sourceIdKey);",
      "const firstDoc = new Document({ pageContent: \"policy\", metadata: { source: \"docs/policy.md\" } });",
      "const hashedDoc: HashedDocumentInterface = _HashedDocument.fromDocument(firstDoc);",
      "hashedDoc.calculateHashes();",
      "const hashedDocs = _deduplicateInOrder([hashedDoc]);",
      "const batches = _batch<DocumentInterface>(100, hashedDocs.map((doc) => doc.toDocument()));",
      "const hashTerms = \"hash_ contentHash metadataHash calculateHashes toDocument UUIDV5_NAMESPACE makeDefaultKeyEncoder HashKeyEncoder sha256\";",
      "",
      "export async function planIndexing(docsSource: BaseDocumentLoader | DocumentInterface[], recordManager: RecordManagerInterface, vectorStore: VectorStore): Promise<IndexingResult> {",
      "  const loadedDocs = _isBaseDocumentLoader(docsSource) ? await docsSource.load() : docsSource;",
      "  const indexStartDt = await recordManager.getTime();",
      "  const sourceIds = loadedDocs.map((doc) => sourceIdAssigner(doc));",
      "  const batchExists = await recordManager.exists(hashedDocs.map((doc) => doc.uid));",
      "  const docsToIndex = hashedDocs.map((doc) => doc.toDocument());",
      "  const docsToUpdate = batchExists.map((exists, idx) => exists ? hashedDocs[idx].uid : \"\");",
      "  const seenDocs = new Set(docsToUpdate);",
      "  await recordManager.update(docsToUpdate, { timeAtLeast: indexStartDt });",
      "  await vectorStore.addDocuments(docsToIndex, { ids: hashedDocs.map((doc) => doc.uid) });",
      "  await recordManager.update(hashedDocs.map((doc) => doc.uid), { timeAtLeast: indexStartDt, groupIds: sourceIds });",
      "  const incrementalKeys = await recordManager.listKeys({ before: indexStartDt, groupIds: sourceIds, limit: options.cleanupBatchSize });",
      "  if (options.cleanup === \"incremental\") {",
      "    await vectorStore.delete({ ids: incrementalKeys });",
      "    await recordManager.deleteKeys(incrementalKeys);",
      "  }",
      "  if (options.cleanup === \"full\") {",
      "    const fullCleanupKeys = await recordManager.listKeys({ before: indexStartDt, limit: options.cleanupBatchSize });",
      "    await vectorStore.delete({ ids: fullCleanupKeys });",
      "    await recordManager.deleteKeys(fullCleanupKeys);",
      "  }",
      "  if (options.forceUpdate && seenDocs.size > 0) {",
      "    await recordManager.update([...seenDocs], { timeAtLeast: indexStartDt, groupIds: sourceIds });",
      "  }",
      "  return index({ docsSource, recordManager, vectorStore, options });",
      "}",
      "",
      "const resultShape: IndexingResult = { numAdded: 0, numDeleted: 0, numUpdated: 0, numSkipped: 0 };",
      "const indexingTerms = \"RecordManagerInterface IndexingResult _HashedDocument HashedDocumentInterface CleanupMode IndexOptions sourceIdKey cleanupBatchSize forceUpdate _batch _deduplicateInOrder _getSourceIdAssigner _isBaseDocumentLoader indexStartDt timeAtLeast groupIds docsToIndex docsToUpdate seenDocs listKeys deleteKeys numAdded numDeleted numUpdated numSkipped vectorStore.addDocuments cleanup === incremental cleanup === full\";",
      "void batches;",
      "void hashTerms;",
      "void resultShape;",
      "void indexingTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      vectorSetups: Array<{ filePath: string; platform: string; upsertCount: number; filterCount: number; snapshotCount: number }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      indexSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.vectorSetups.find((item) => item.filePath === "src/vector/langchain-indexing.ts");
    expect(report.sourcePattern).toContain("RecordManagerInterface IndexingResult _HashedDocument HashedDocumentInterface CleanupMode");
    expect(report.sourcePattern).toContain("sourceIdKey cleanupBatchSize forceUpdate _batch _deduplicateInOrder _getSourceIdAssigner");
    expect(report.sourcePattern).toContain("timeAtLeast groupIds docsToIndex docsToUpdate seenDocs listKeys deleteKeys");
    expect(setup?.platform).toBe("langchain");
    expect(setup?.upsertCount).toBeGreaterThan(0);
    expect(setup?.filterCount).toBeGreaterThan(0);
    expect(setup?.snapshotCount).toBeGreaterThan(0);
    expect(readySignals(report.ingestionSignals)).toEqual(expect.arrayContaining(["indexing-record-manager", "hashed-document", "indexing-batch", "indexing-deduplicate"]));
    expect(readySignals(report.indexSignals)).toEqual(expect.arrayContaining(["indexing-hash", "source-id-key"]));
    expect(readySignals(report.opsSignals)).toEqual(expect.arrayContaining(["incremental-cleanup", "full-cleanup", "force-update", "record-manager-keys"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain structured query translator readiness without querying vector stores", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-structured-query-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-structured-query-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "structured-query.ts"), [
      "import { BasicTranslator, BaseTranslator, type TranslatorOpts } from \"@langchain/core/structured_query/base\";",
      "import { castValue, isFilterEmpty } from \"@langchain/core/structured_query/utils\";",
      "import { Comparators, Comparison, Operation, Operators, StructuredQuery, Visitor, type Comparator, type Operator, type VisitorComparisonResult, type VisitorOperationResult, type VisitorStructuredQueryResult } from \"@langchain/core/structured_query/ir\";",
      "import type { VectorStore } from \"@langchain/core/vectorstores\";",
      "",
      "export class TenantTranslator<T extends VectorStore = VectorStore> extends BasicTranslator<T> {",
      "  declare VisitOperationOutput: VisitorOperationResult;",
      "  declare VisitComparisonOutput: VisitorComparisonResult;",
      "  declare VisitStructuredQueryOutput: VisitorStructuredQueryResult;",
      "",
      "  constructor(opts?: TranslatorOpts) {",
      "    super(opts ?? { allowedOperators: [Operators.and, Operators.or], allowedComparators: [Comparators.eq, Comparators.gte] });",
      "  }",
      "",
      "  formatFunction(func: Operator | Comparator): string {",
      "    return super.formatFunction(func);",
      "  }",
      "",
      "  mergeFilters(defaultFilter: VisitorStructuredQueryResult[\"filter\"] | undefined, generatedFilter: VisitorStructuredQueryResult[\"filter\"] | undefined, mergeType: \"and\" | \"or\" | \"replace\" = \"and\", forceDefaultFilter = true) {",
      "    return super.mergeFilters(defaultFilter, generatedFilter, mergeType, forceDefaultFilter);",
      "  }",
      "}",
      "",
      "const comparison = new Comparison(Comparators.eq, \"tenant\", \"acme\");",
      "const range = new Comparison(Comparators.gte, \"priority\", \"2\");",
      "const operation = new Operation(Operators.and, [comparison, range]);",
      "const structuredQuery = new StructuredQuery(\"policy\", operation);",
      "const translator = new TenantTranslator();",
      "const visitor: Visitor = translator;",
      "const comparisonFilter = translator.visitComparison(comparison);",
      "const operationFilter = translator.visitOperation(operation);",
      "const structuredFilter = translator.visitStructuredQuery(structuredQuery);",
      "const mergedFilter = translator.mergeFilters({ tenant: { $eq: \"acme\" } }, structuredFilter.filter, \"and\", true);",
      "const castPriority = castValue(\"42\");",
      "const emptyFilter = isFilterEmpty({});",
      "const structuredQueryTerms = \"StructuredQuery FilterDirective Comparison Operation Operators Comparators Visitor VisitorResult VisitorOperationResult VisitorComparisonResult VisitorStructuredQueryResult BaseTranslator BasicTranslator FunctionalTranslator FunctionFilter ValueType getAllowedComparatorsForType getComparatorFunction getOperatorFunction undefinedTrue TranslatorOpts allowedOperators allowedComparators visitOperation visitComparison visitStructuredQuery formatFunction mergeFilters isFilterEmpty castValue forceDefaultFilter mergeType filter accept VectorStore FilterType\";",
      "void visitor;",
      "void comparisonFilter;",
      "void operationFilter;",
      "void mergedFilter;",
      "void castPriority;",
      "void emptyFilter;",
      "void structuredQueryTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      vectorSetups: Array<{ filePath: string; platform: string; queryCount: number; filterCount: number }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.vectorSetups.find((item) => item.filePath === "src/vector/structured-query.ts");
    expect(report.sourcePattern).toContain("StructuredQuery FilterDirective Comparison Operation Operators Comparators Visitor");
    expect(report.sourcePattern).toContain("BaseTranslator BasicTranslator FunctionalTranslator FunctionFilter ValueType getAllowedComparatorsForType getComparatorFunction getOperatorFunction undefinedTrue TranslatorOpts allowedOperators allowedComparators visitOperation visitComparison visitStructuredQuery");
    expect(report.sourcePattern).toContain("formatFunction mergeFilters isFilterEmpty castValue");
    expect(setup?.platform).toBe("langchain");
    expect(setup?.queryCount).toBeGreaterThan(0);
    expect(setup?.filterCount).toBeGreaterThan(0);
    expect(readySignals(report.querySignals)).toEqual(expect.arrayContaining([
      "structured-query",
      "comparison-filter",
      "operation-filter",
      "structured-query-visitor",
      "basic-translator",
      "filter-merge",
      "filter-value-cast"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain structured query functional translator readiness without filtering documents", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-functional-query-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langchain-functional-query-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "vector"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "vector", "functional-query.ts"), [
      "import { Document } from \"@langchain/core/documents\";",
      "import { FunctionalTranslator, type FunctionFilter } from \"@langchain/core/structured_query/functional\";",
      "import { Comparators, Comparison, Operation, Operators, StructuredQuery } from \"@langchain/core/structured_query/ir\";",
      "",
      "const translator = new FunctionalTranslator();",
      "const defaultFilter: FunctionFilter = (document: Document) => Boolean(document.metadata.tenant);",
      "const comparison = new Comparison(Comparators.eq, \"tenant\", \"acme\");",
      "const operation = new Operation(Operators.and, [comparison]);",
      "const query = new StructuredQuery(\"policy\", operation);",
      "const allowedForBoolean = translator.getAllowedComparatorsForType(\"boolean\");",
      "const comparatorFunction = translator.getComparatorFunction(Comparators.eq);",
      "const operatorFunction = translator.getOperatorFunction(Operators.and);",
      "const comparisonFilter = translator.visitComparison(comparison);",
      "const operationFilter = translator.visitOperation(operation);",
      "const structuredFilter = translator.visitStructuredQuery(query);",
      "const mergedFilter = translator.mergeFilters(defaultFilter, structuredFilter.filter ?? defaultFilter, \"or\");",
      "const functionalTerms = \"FunctionalTranslator FunctionFilter ValueType getAllowedComparatorsForType getComparatorFunction getOperatorFunction undefinedTrue Comparator not allowed Operator not allowed Filter is not a function Structured query filter is not a function defaultFilter generatedFilter mergeFilters\";",
      "void allowedForBoolean;",
      "void comparatorFunction;",
      "void operatorFunction;",
      "void comparisonFilter;",
      "void operationFilter;",
      "void mergedFilter;",
      "void functionalTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "vector-db-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      vectorSetups: Array<{ filePath: string; platform: string; queryCount: number; filterCount: number }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.vectorSetups.find((item) => item.filePath === "src/vector/functional-query.ts");
    expect(report.sourcePattern).toContain("FunctionalTranslator FunctionFilter ValueType getAllowedComparatorsForType");
    expect(report.sourcePattern).toContain("getComparatorFunction getOperatorFunction undefinedTrue");
    expect(setup?.platform).toBe("langchain");
    expect(setup?.queryCount).toBeGreaterThan(0);
    expect(setup?.filterCount).toBeGreaterThan(0);
    expect(readySignals(report.querySignals)).toEqual(expect.arrayContaining([
      "functional-translator",
      "function-filter",
      "type-aware-comparators",
      "comparator-function",
      "operator-function",
      "functional-filter-merge"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects search service readiness patterns without running search services", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-search-service-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-search-service-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "search"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "search:meili": "node src/search/meili.js",
        "search:typesense": "node src/search/typesense.js",
        "search:opensearch": "tsx src/search/opensearch.ts"
      },
      dependencies: {
        "@elastic/elasticsearch": "latest",
        "@elastic/react-search-ui": "latest",
        "@opensearch-project/opensearch": "latest",
        algoliasearch: "latest",
        "instantsearch.js": "latest",
        meilisearch: "latest",
        typesense: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "meilisearch",
      "typesense",
      "opensearch-py",
      "elasticsearch",
      "algoliasearch"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "search", "meili.js"), [
      "import { MeiliSearch } from \"meilisearch\";",
      "",
      "const client = new MeiliSearch({ host: process.env.MEILI_HOST, apiKey: process.env.MEILI_MASTER_KEY });",
      "const index = client.index(\"products\");",
      "await index.addDocuments([{ id: \"sku-1\", title: \"Desk\", category: \"office\", _geo: { lat: 37.5, lng: 127.0 } }], { primaryKey: \"id\" });",
      "await index.updateSearchableAttributes([\"title\", \"description\"]);",
      "await index.updateFilterableAttributes([\"category\", \"brand\", \"_geo\"]);",
      "await index.updateSortableAttributes([\"price\", \"updated_at\"]);",
      "await index.updateRankingRules([\"words\", \"typo\", \"proximity\", \"attribute\", \"sort\", \"exactness\"]);",
      "await index.updateSettings({ typoTolerance: { enabled: true }, pagination: { maxTotalHits: 1000 } });",
      "await index.updateSynonyms({ desk: [\"table\"] });",
      "await index.updateStopWords([\"the\", \"a\"]);",
      "await index.updateDistinctAttribute(\"sku\");",
      "const result = await index.search(\"desk\", { filter: \"category = office\", facets: [\"brand\"], sort: [\"price:asc\"], limit: 20, offset: 0, attributesToHighlight: [\"title\"], attributesToCrop: [\"description\"], showRankingScore: true });",
      "await index.deleteDocuments([\"sku-old\"]);",
      "await client.waitForTask(result.taskUid);",
      "await client.createDump();",
      "export const meiliNotes = \"tasks health dumps typo tolerance ranking rules synonyms stop words distinct geosearch semantic hybrid score\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "search", "typesense.js"), [
      "import Typesense from \"typesense\";",
      "",
      "const client = new Typesense.Client({",
      "  nodes: [{ host: process.env.TYPESENSE_HOST, port: 8108, protocol: \"https\" }],",
      "  apiKey: process.env.TYPESENSE_API_KEY,",
      "  connectionTimeoutSeconds: 2",
      "});",
      "await client.collections().create({",
      "  name: \"products\",",
      "  fields: [{ name: \"title\", type: \"string\" }, { name: \"category\", type: \"string\", facet: true }, { name: \"location\", type: \"geopoint\" }, { name: \"price\", type: \"float\" }],",
      "  default_sorting_field: \"price\"",
      "});",
      "await client.collections(\"products\").documents().import([{ id: \"sku-1\", title: \"Desk\", category: \"office\", price: 120 }], { action: \"upsert\", batch_size: 100 });",
      "const hits = await client.collections(\"products\").documents().search({ q: \"desk\", query_by: \"title,description\", filter_by: \"category:=office\", sort_by: \"price:asc\", facet_by: \"brand\", per_page: 20, page: 1, highlight_fields: \"title\", group_by: \"sku\" });",
      "await client.collections(\"products\").documents(\"sku-old\").delete();",
      "await client.aliases().upsert(\"products_read\", { collection_name: \"products\" });",
      "await client.keys().create({ description: \"scoped API keys\", actions: [\"documents:search\"], collections: [\"products\"] });",
      "const status = await client.health.retrieve();",
      "export const typesenseOps = \"synonyms aliases health metrics cluster replica analytics federated search curation scoped API keys semantic hybrid natural language search\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "search", "opensearch.ts"), [
      "import { Client } from \"@opensearch-project/opensearch\";",
      "",
      "const client = new Client({ node: process.env.OPENSEARCH_URL, auth: { username: \"admin\", password: process.env.OPENSEARCH_PASSWORD }, requestTimeout: 2000 });",
      "await client.indices.create({ index: \"products\", body: { settings: { number_of_shards: 3, number_of_replicas: 2 }, mappings: { properties: { title: { type: \"text\" }, category: { type: \"keyword\" }, location: { type: \"geo_point\" }, embedding: { type: \"knn_vector\", dimension: 384 } } } } });",
      "await client.bulk({ refresh: true, body: [{ index: { _index: \"products\", _id: \"sku-1\" } }, { title: \"Desk\", category: \"office\", location: { lat: 37.5, lon: 127.0 } }] });",
      "await client.search({ index: \"products\", body: { query: { bool: { must: [{ match: { title: \"desk\" } }], filter: [{ term: { category: \"office\" } }] } }, aggs: { brands: { terms: { field: \"brand\" } } }, highlight: { fields: { title: {} } }, size: 20, from: 0, sort: [{ _score: \"desc\" }, { price: \"asc\" }] } });",
      "await client.indices.delete({ index: \"old_products\" });",
      "await client.snapshot.create({ repository: \"s3_backup\", snapshot: \"products_001\" });",
      "await client.indices.putAlias({ index: \"products\", name: \"products_read\" });",
      "await client.cluster.health();",
      "await client.cat.indices({ format: \"json\" });",
      "export const opensearchNotes = \"semantic hybrid vector knn query_string multi_match bool score snapshot aliases replicas cluster analytics monitoring\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "search-service.yaml"), [
      "meilisearch:",
      "  api_key_env: MEILI_MASTER_KEY",
      "  hosts: [https://search.local]",
      "  tasks: true",
      "  health: /health",
      "  dumps: s3://search-dumps",
      "typesense:",
      "  nodes: [search-a, search-b]",
      "  aliases: products_read",
      "  analytics: true",
      "  cluster: raft",
      "opensearch:",
      "  snapshots: s3_backup",
      "  replicas: 2",
      "  index_aliases: products_read",
      "  timeout: 2000"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "search-service.yml"), [
      "name: search-service",
      "on:",
      "  pull_request:",
      "jobs:",
      "  static-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: echo \"Meilisearch Typesense OpenSearch indexes collections schema mappings documents search filter_by facet_by ranking rules typo tolerance snapshots aliases replicas cluster analytics static only\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "search-service-readiness-report.json"), "utf8")) as {
      searchSetups: Array<{ filePath: string; platform: string; indexCount: number; schemaCount: number; documentCount: number; queryCount: number; opsCount: number }>;
      indexSignals: Array<{ signal: string; readiness: string }>;
      ingestionSignals: Array<{ signal: string; readiness: string }>;
      querySignals: Array<{ signal: string; readiness: string }>;
      relevanceSignals: Array<{ signal: string; readiness: string }>;
      clientSignals: Array<{ signal: string; readiness: string }>;
      opsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.searchSetups.length).toBeGreaterThan(0);
    expect(report.searchSetups.some((item) => item.platform === "meilisearch")).toBe(true);
    expect(report.searchSetups.some((item) => item.platform === "typesense")).toBe(true);
    expect(report.searchSetups.some((item) => item.platform === "opensearch")).toBe(true);
    const meiliSetup = report.searchSetups.find((item) => item.filePath === "src/search/meili.js");
    expect(meiliSetup?.indexCount).toBeGreaterThan(0);
    expect(meiliSetup?.schemaCount).toBeGreaterThan(0);
    expect(meiliSetup?.documentCount).toBeGreaterThan(0);
    expect(meiliSetup?.queryCount).toBeGreaterThan(0);
    expect(meiliSetup?.opsCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.indexSignals, ["index", "collection", "schema", "mapping", "fields", "primary-key", "settings"]);
    expectReady(report.ingestionSignals, ["document", "add", "import", "bulk", "upsert", "batch", "delete", "refresh"]);
    expectReady(report.querySignals, ["search", "q", "query-by", "match", "bool", "filter", "sort", "facet", "pagination", "highlight", "score"]);
    expectReady(report.relevanceSignals, ["typo-tolerance", "ranking-rules", "searchable-attributes", "filterable-attributes", "sortable-attributes", "synonyms", "stop-words", "distinct", "geo", "semantic-hybrid"]);
    expectReady(report.clientSignals, ["meilisearch-client", "typesense-client", "opensearch-client", "host", "api-key", "nodes", "timeout"]);
    expectReady(report.opsSignals, ["tasks", "health", "dump", "snapshot", "alias", "replica", "cluster", "analytics"]);
    expectReady(report.packageSignals, ["meilisearch", "typesense", "opensearch", "elasticsearch", "algolia", "instantsearch", "search-ui"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "search-service-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "search-service-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects realtime collaboration readiness patterns without connecting providers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-realtime-collab-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-realtime-collab-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "collab"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app", "rooms"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        yjs: "latest",
        "y-websocket": "latest",
        "y-indexeddb": "latest",
        "@automerge/automerge": "latest",
        "@automerge/automerge-repo": "latest",
        "@liveblocks/client": "latest",
        "@liveblocks/react": "latest",
        "@liveblocks/yjs": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "docs", "collaboration.md"), [
      "# Collaboration",
      "The realtime collaboration layer is network agnostic, local-first, p2p capable, and supports offline editing.",
      "Rooms use permissions, tokens, userId, publicApiKey, initialPresence, and initialStorage boundaries."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "collab", "yjs.ts"), [
      "import * as Y from \"yjs\";",
      "import { WebsocketProvider } from \"y-websocket\";",
      "import { IndexeddbPersistence } from \"y-indexeddb\";",
      "",
      "const doc = new Y.Doc();",
      "const sharedText = doc.getText(\"body\");",
      "const sharedMap = doc.getMap(\"meta\");",
      "const sharedArray = doc.getArray(\"cards\");",
      "const provider = new WebsocketProvider(\"wss://collab.example\", \"room-1\", doc);",
      "new IndexeddbPersistence(\"room-1\", doc);",
      "provider.awareness.setLocalStateField(\"user\", { name: \"Ada\", avatar: \"ada.png\", cursor: { x: 1, y: 2 } });",
      "const undoManager = new Y.UndoManager([sharedText, sharedMap, sharedArray]);",
      "undoManager.undo();",
      "undoManager.redo();",
      "doc.transact(() => sharedText.insert(0, \"hello\"));",
      "sharedText.observe(() => undoManager.undoStack.length);",
      "const update = Y.encodeStateAsUpdate(doc);",
      "Y.applyUpdate(doc, update);",
      "Y.mergeUpdates([update]);",
      "localStorage.setItem(\"snapshot\", JSON.stringify(Array.from(update)));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "collab", "automerge.ts"), [
      "import * as Automerge from \"@automerge/automerge\";",
      "import { Repo, DocHandle } from \"@automerge/automerge-repo\";",
      "",
      "type Doc = { title?: string; cards: Array<Automerge.Text> };",
      "let local = Automerge.init<Doc>();",
      "local = Automerge.change(local, doc => { doc.title = \"Plan\"; doc.cards = [new Automerge.Text(\"one\")]; });",
      "const saved = Automerge.save(local);",
      "let remote = Automerge.load<Doc>(saved);",
      "remote = Automerge.change(remote, doc => { doc.cards.push(new Automerge.Text(\"two\")); });",
      "const merged = Automerge.merge(local, remote);",
      "Automerge.getConflicts(merged, \"title\");",
      "const heads = Automerge.getHeads(merged);",
      "const before = Automerge.view(merged, heads);",
      "const changes = Automerge.getChanges(before, merged);",
      "Automerge.applyChanges(remote, changes);",
      "Automerge.saveIncremental(merged);",
      "Automerge.loadIncremental(merged, new Uint8Array());",
      "const sync = Automerge.initSyncState();",
      "const [, message] = Automerge.generateSyncMessage(merged, sync);",
      "if (message) Automerge.receiveSyncMessage(merged, sync, message);",
      "const repo = new Repo({ storage: { storageRoot: \"./.automerge\" } as never });",
      "const handle: DocHandle<Doc> = repo.create<Doc>({ cards: [] });",
      "handle.on(\"change\", ({ patches }) => patches);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "rooms", "Room.tsx"), [
      "import { LiveblocksProvider, RoomProvider, useBroadcastEvent, useHistory, useMutation, useMyPresence, useOthers, useSelf, useThreads } from \"@liveblocks/react/suspense\";",
      "import { createClient } from \"@liveblocks/client\";",
      "import { getYjsProviderForRoom, LiveblocksYjsProvider } from \"@liveblocks/yjs\";",
      "",
      "const client = createClient({ publicApiKey: \"pk_test\", authEndpoint: \"/api/liveblocks-auth\" });",
      "const roomId = \"room-1\";",
      "const permissions = [\"room:read\", \"room:write\"];",
      "const token = \"test-token\";",
      "export function Providers({ children }: { children: React.ReactNode }) {",
      "  return <LiveblocksProvider client={client} authEndpoint=\"/api/liveblocks-auth\">{children}</LiveblocksProvider>;",
      "}",
      "export function Room() {",
      "  const others = useOthers();",
      "  const self = useSelf();",
      "  const [{ cursor }, updateMyPresence] = useMyPresence();",
      "  const broadcast = useBroadcastEvent();",
      "  const history = useHistory();",
      "  const { threads } = useThreads();",
      "  const mutation = useMutation(({ storage }) => {",
      "    storage.get(\"shapes\");",
      "    updateMyPresence({ cursor, userInfo: { name: self?.info?.name, avatar: \"ada.png\" } });",
      "    broadcast({ type: \"cursor\", cursor });",
      "    history.undo();",
      "    history.redo();",
      "  }, [cursor]);",
      "  const yjsProvider: LiveblocksYjsProvider = getYjsProviderForRoom({ id: roomId } as never);",
      "  return <RoomProvider id={roomId} initialPresence={{ cursor }} initialStorage={{ shapes: [] }}>{others.length + threads.length + permissions.length + token.length}</RoomProvider>;",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "realtime-collaboration-readiness-report.json"), "utf8")) as {
      collaborationSetups: Array<{ filePath: string; platform: string; docCount: number; sharedTypeCount: number; providerCount: number; presenceCount: number; syncCount: number; persistenceCount: number; conflictCount: number; historyCount: number; authCount: number; commentsCount: number }>;
      crdtSignals: Array<{ signal: string; readiness: string }>;
      providerSignals: Array<{ signal: string; readiness: string }>;
      presenceSignals: Array<{ signal: string; readiness: string }>;
      syncSignals: Array<{ signal: string; readiness: string }>;
      persistenceSignals: Array<{ signal: string; readiness: string }>;
      historySignals: Array<{ signal: string; readiness: string }>;
      accessSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.collaborationSetups.length).toBeGreaterThan(0);
    expect(report.collaborationSetups.some((item) => item.platform === "yjs")).toBe(true);
    expect(report.collaborationSetups.some((item) => item.platform === "automerge")).toBe(true);
    expect(report.collaborationSetups.some((item) => item.platform === "liveblocks")).toBe(true);
    const yjsSetup = report.collaborationSetups.find((item) => item.filePath === "src/collab/yjs.ts");
    expect(yjsSetup?.docCount).toBeGreaterThan(0);
    expect(yjsSetup?.sharedTypeCount).toBeGreaterThan(0);
    expect(yjsSetup?.providerCount).toBeGreaterThan(0);
    expect(yjsSetup?.presenceCount).toBeGreaterThan(0);
    expect(yjsSetup?.syncCount).toBeGreaterThan(0);
    expect(yjsSetup?.persistenceCount).toBeGreaterThan(0);
    expect(yjsSetup?.historyCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.crdtSignals, ["y-doc", "shared-map", "shared-array", "shared-text", "automerge-doc", "change", "merge", "conflict", "transaction"]);
    expectReady(report.providerSignals, ["websocket-provider", "indexeddb-provider", "liveblocks-provider", "room-provider", "yjs-provider", "broadcast-channel", "network-agnostic", "custom-provider"]);
    expectReady(report.presenceSignals, ["awareness", "presence", "cursor", "avatars", "others", "self", "broadcast-event", "user-info"]);
    expectReady(report.syncSignals, ["encode-state", "apply-update", "sync-state", "sync-message", "save-load", "incremental-save", "heads", "patches"]);
    expectReady(report.persistenceSignals, ["indexeddb", "local-storage", "doc-handle", "repo", "save", "load", "storage-root", "snapshot"]);
    expectReady(report.historySignals, ["undo-manager", "undo", "redo", "history", "version", "heads", "patch-listener"]);
    expectReady(report.accessSignals, ["auth-endpoint", "public-api-key", "room-id", "permission", "initial-presence", "initial-storage", "user-id", "token"]);
    expectReady(report.packageSignals, ["yjs", "y-websocket", "y-indexeddb", "@automerge/automerge", "@automerge/automerge-repo", "@liveblocks/client", "@liveblocks/react", "@liveblocks/yjs"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "realtime-collaboration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "realtime-collaboration-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects workflow orchestration readiness patterns without executing jobs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-workflow-orchestration-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-workflow-orchestration-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "trigger:dev": "trigger.dev dev",
        "trigger:deploy": "trigger.dev deploy",
        "inngest:dev": "inngest-cli dev"
      },
      dependencies: {
        "@temporalio/workflow": "latest",
        "@temporalio/worker": "latest",
        "@temporalio/client": "latest",
        "@temporalio/activity": "latest",
        "@temporalio/common": "latest",
        "@temporalio/testing": "latest",
        "@temporalio/openai-agents": "latest",
        inngest: "latest",
        "@trigger.dev/sdk": "latest",
        "@trigger.dev/react": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "docs", "workflow.md"), [
      "Temporal workflows run activities through a task queue with retry, timeout, heartbeat, history, continue as new recovery, signal/query/update handlers, condition waits, CancellationScope, workflowInfo, patching, ApplicationFailure, ActivityFailure, NativeConnection, TestWorkflowEnvironment, proxySinks, and interceptors.",
      "Inngest durable functions use events, cron schedules, webhook endpoint handlers, step.run, step.sleep, waitForEvent, cancelOn, concurrency, throttling, debounce, rate limiting, prioritization, batching, state store, executor, runner, serve endpoint registration, and dashboard status.",
      "Trigger.dev tasks use schemaTask, schedules.task, wait.for, waitpoints, queues, retry, maxDuration, idempotencyKey, metadata, tags, logger, tracing, alerts, metrics, machine resources, environments, dev server, deploy, and isolated runtime checkpoint resume."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "workflows", "temporal.ts"), [
      "import { proxyActivities, defineSignal, defineQuery, defineUpdate, setHandler, sleep, condition, continueAsNew, CancellationScope, workflowInfo, patched, deprecatePatch, proxySinks, getExternalWorkflowHandle } from \"@temporalio/workflow\";",
      "import { NativeConnection, Worker, bundleWorkflowCode } from \"@temporalio/worker\";",
      "import { Client, WorkflowClient, WorkflowHandle } from \"@temporalio/client\";",
      "import { Context, activityInfo, heartbeat } from \"@temporalio/activity\";",
      "import { ActivityFailure, ApplicationFailure } from \"@temporalio/common\";",
      "import { TestWorkflowEnvironment } from \"@temporalio/testing\";",
      "import \"@temporalio/openai-agents\";",
      "const activities = proxyActivities({ startToCloseTimeout: \"1 minute\", scheduleToCloseTimeout: \"5 minutes\", heartbeatTimeout: \"10 seconds\", retry: { maximumAttempts: 3 } });",
      "export const approveSignal = defineSignal<[string]>(\"approve\");",
      "export const statusQuery = defineQuery<string>(\"status\");",
      "export const approveUpdate = defineUpdate<boolean, [string]>(\"approveUpdate\");",
      "const { logger } = proxySinks<{ logger: { info(message: string): void } }>();",
      "export async function onboardingWorkflow(userId: string) {",
      "  let approved = false;",
      "  setHandler(approveSignal, () => void (approved = true));",
      "  setHandler(statusQuery, () => workflowInfo().workflowId);",
      "  setHandler(approveUpdate, (value: string) => value === userId);",
      "  await activities.sendWelcomeEmail(userId);",
      "  await condition(() => approved, \"10 seconds\");",
      "  await CancellationScope.nonCancellable(async () => logger.info(workflowInfo().workflowType));",
      "  if (patched(\"new-onboarding\")) deprecatePatch(\"old-onboarding\");",
      "  await getExternalWorkflowHandle(\"audit-workflow\").signal(approveSignal, userId);",
      "  await sleep(\"1 day\");",
      "  return continueAsNew(userId);",
      "}",
      "export async function reportActivityProgress() { const info = activityInfo(); Context.current().heartbeat(info.activityId); heartbeat(info.attempt); throw ApplicationFailure.retryable(\"retry\", \"RetryableError\"); }",
      "export async function handleActivityFailure(err: ActivityFailure) { return err.retryState; }",
      "export const connection = NativeConnection.connect({ address: \"localhost:7233\" });",
      "export const worker = Worker.create({ workflowsPath: require.resolve(\"./temporal\"), workflowBundle: bundleWorkflowCode({ workflowsPath: require.resolve(\"./temporal\") }), activities, taskQueue: \"onboarding\", maxConcurrentActivityTaskExecutions: 10, interceptors: { workflowModules: [require.resolve(\"./interceptors\")] }, sinks: { logger: { info: { fn: () => undefined, callDuringReplay: false } } } });",
      "export const client = new Client({ namespace: \"default\" });",
      "export const workflowClient = new WorkflowClient();",
      "export const testEnv = TestWorkflowEnvironment.createTimeSkipping();",
      "client.workflow.start(onboardingWorkflow, { taskQueue: \"onboarding\", workflowId: \"user-onboarding\", args: [\"u1\"] });",
      "const handle: WorkflowHandle<typeof onboardingWorkflow> = workflowClient.getHandle(\"user-onboarding\");",
      "handle.result();",
      "const replayTerms = \"ReplayWorker replayWorkflowHistory runReplayHistory historyFromJSON heartbeatDetails interceptors\";"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "workflows", "inngest.ts"), [
      "import { Inngest } from \"inngest\";",
      "export const inngest = new Inngest({ id: \"app\" });",
      "export const importProduct = inngest.createFunction(",
      "  { id: \"import-product\", retries: 3, concurrency: { limit: 2, key: \"event.data.userId\" }, throttle: { limit: 1, period: \"1m\" }, debounce: { period: \"5s\" }, rateLimit: { limit: 10, period: \"1m\" }, priority: { run: \"event.data.priority\" }, cancelOn: [{ event: \"product/cancel\" }] },",
      "  { event: \"shop/product.imported\" },",
      "  async ({ event, step }) => {",
      "    await step.run(\"copy-images\", async () => event.data.imageURLs);",
      "    await step.sleep(\"wait-for-review\", \"1h\");",
      "    await step.waitForEvent(\"approval\", { event: \"product/approved\", if: \"async.data.id == event.data.id\" });",
      "    await step.invoke(\"resize-images\", { function: importProduct, data: event.data });",
      "  }",
      ");",
      "inngest.send({ name: \"shop/product.imported\", data: { userId: \"u1\" } });",
      "serve({ client: inngest, functions: [importProduct] });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "workflows", "trigger.ts"), [
      "import { AbortTaskRunError, logger, metadata, schedules, schemaTask, task, tasks, wait } from \"@trigger.dev/sdk\";",
      "export const videoTask = task({",
      "  id: \"convert-video\",",
      "  retry: { maxAttempts: 3 },",
      "  queue: { concurrencyLimit: 1 },",
      "  maxDuration: 3600,",
      "  machine: \"large-1x\",",
      "  run: async (payload: { videoId: string }) => {",
      "    metadata.set(\"videoId\", payload.videoId);",
      "    logger.info(\"Video task started\", { tags: [\"video\"] });",
      "    await wait.for({ seconds: 30 });",
      "    await tasks.trigger(\"child-task\", payload, { idempotencyKey: payload.videoId });",
      "    await tasks.batchTrigger([{ payload }]);",
      "    throw new AbortTaskRunError(\"manual cancel\");",
      "  }",
      "});",
      "export const nightlySchedule = schedules.task({ id: \"nightly\", cron: \"0 0 * * *\", run: async () => videoTask.trigger({ videoId: \"v1\" }) });",
      "export const typedTask = schemaTask({ id: \"typed\", schema: {}, run: async () => ({ ok: true }) });"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "workflow-orchestration-readiness-report.json"), "utf8")) as {
      workflowSetups: Array<{ filePath: string; platform: string; workflowCount: number; eventCount: number; scheduleCount: number; stepCount: number; activityCount: number; queueCount: number; retryCount: number; timeoutCount: number; waitCount: number; cancelCount: number; concurrencyCount: number; stateCount: number; observabilityCount: number }>;
      triggerSignals: Array<{ signal: string; readiness: string }>;
      executionSignals: Array<{ signal: string; readiness: string }>;
      durabilitySignals: Array<{ signal: string; readiness: string }>;
      flowSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.workflowSetups.length).toBeGreaterThan(0);
    expect(report.workflowSetups.some((item) => item.platform === "temporal")).toBe(true);
    expect(report.workflowSetups.some((item) => item.platform === "inngest")).toBe(true);
    expect(report.workflowSetups.some((item) => item.platform === "triggerdotdev")).toBe(true);
    const temporalSetup = report.workflowSetups.find((item) => item.filePath === "src/workflows/temporal.ts");
    const inngestSetup = report.workflowSetups.find((item) => item.filePath === "src/workflows/inngest.ts");
    const triggerSetup = report.workflowSetups.find((item) => item.filePath === "src/workflows/trigger.ts");
    expect(temporalSetup?.workflowCount).toBeGreaterThan(0);
    expect(temporalSetup?.activityCount).toBeGreaterThan(0);
    expect(temporalSetup?.queueCount).toBeGreaterThan(0);
    expect(temporalSetup?.retryCount).toBeGreaterThan(0);
    expect(temporalSetup?.timeoutCount).toBeGreaterThan(0);
    expect(inngestSetup?.eventCount).toBeGreaterThan(0);
    expect(inngestSetup?.stepCount).toBeGreaterThan(0);
    expect(inngestSetup?.waitCount).toBeGreaterThan(0);
    expect(inngestSetup?.cancelCount).toBeGreaterThan(0);
    expect(inngestSetup?.concurrencyCount).toBeGreaterThan(0);
    expect(triggerSetup?.scheduleCount).toBeGreaterThan(0);
    expect(triggerSetup?.waitCount).toBeGreaterThan(0);
    expect(triggerSetup?.stateCount).toBeGreaterThan(0);
    expect(triggerSetup?.observabilityCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.triggerSignals, ["event", "cron", "schedule", "webhook", "manual", "api-trigger", "child-trigger", "signal", "query", "update"]);
    expectReady(report.executionSignals, ["task", "workflow", "activity", "step", "worker", "task-queue", "function-run", "handler", "workflow-client", "workflow-handle", "update-handler"]);
    expectReady(report.durabilitySignals, ["retry", "timeout", "heartbeat", "checkpoint", "state-store", "resume", "history", "continue-as-new", "idempotency", "application-failure", "activity-failure", "cancellation-scope", "patching", "workflow-info", "heartbeat-details"]);
    expectReady(report.flowSignals, ["wait", "sleep", "wait-for-event", "condition", "signal-handler", "query-handler", "update-handler", "cancel", "cancellation-scope", "external-workflow", "batch", "concurrency", "rate-limit", "throttle", "priority", "child-workflow"]);
    expectReady(report.runtimeSignals, ["dev-server", "deploy", "worker-pool", "isolated-runtime", "machine", "environment", "serve", "dashboard", "native-connection", "test-environment", "workflow-bundle", "replay-worker"]);
    expectReady(report.observabilitySignals, ["logger", "tracing", "metadata", "tags", "run-status", "dashboard", "alerts", "metrics", "sinks", "interceptors", "workflow-info", "activity-info", "heartbeat-details"]);
    expectReady(report.packageSignals, ["@temporalio/workflow", "@temporalio/worker", "@temporalio/client", "@temporalio/activity", "@temporalio/common", "@temporalio/testing", "@temporalio/openai-agents", "inngest", "@trigger.dev/sdk", "@trigger.dev/react"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "workflow-orchestration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "workflow-orchestration-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects LangGraph workflow orchestration readiness without invoking graphs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langgraph-workflow-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-langgraph-workflow-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "agents"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/langgraph": "latest",
        "@langchain/langgraph-checkpoint": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "agents", "langgraph-agent.ts"), [
      "import { AIMessage, HumanMessage } from \"@langchain/core/messages\";",
      "import { Command, END, START, MessagesAnnotation, StateGraph } from \"@langchain/langgraph\";",
      "import { ToolNode } from \"@langchain/langgraph/prebuilt\";",
      "import { MemorySaver } from \"@langchain/langgraph-checkpoint\";",
      "import { createAgent, createMiddleware } from \"langchain\";",
      "",
      "const tools = [weatherTool, writeFileTool];",
      "const toolNode = new ToolNode(tools);",
      "const reviewMiddleware = createMiddleware({",
      "  name: \"human-review\",",
      "  beforeAgent: async () => new Command({ update: { reviewed: true } }),",
      "  afterAgent: async () => undefined",
      "});",
      "const checkpointer = new MemorySaver();",
      "const llmNode = async (state: typeof MessagesAnnotation.State) => {",
      "  const response = await model.invoke(state.messages);",
      "  return { messages: [response] };",
      "};",
      "const routeTools = (state: typeof MessagesAnnotation.State) => {",
      "  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;",
      "  return lastMessage.tool_calls?.length ? \"tools\" : END;",
      "};",
      "export const workflow = new StateGraph(MessagesAnnotation)",
      "  .addNode(\"model\", llmNode)",
      "  .addNode(\"tools\", toolNode)",
      "  .addEdge(START, \"model\")",
      "  .addConditionalEdges(\"model\", routeTools, [\"tools\", END])",
      "  .addEdge(\"tools\", \"model\");",
      "export const app = workflow.compile({",
      "  checkpointer,",
      "  name: \"support-agent\",",
      "  description: \"LangGraph support workflow with stateful tool routing\"",
      "});",
      "export const agent = createAgent({",
      "  model,",
      "  tools,",
      "  middleware: [reviewMiddleware],",
      "  checkpointer",
      "});",
      "export async function runGraph(thread_id: string) {",
      "  const config = { configurable: { thread_id }, tags: [\"support\"], metadata: { workflow: \"langgraph\" } };",
      "  await app.invoke({ messages: [new HumanMessage(\"check weather\")] }, config);",
      "  await app.streamEvents({ messages: [new HumanMessage(\"stream weather\")] }, config);",
      "  const state = await app.getState(config);",
      "  const resumed = await agent.invoke(new Command({ resume: { decisions: [{ type: \"approve\" }] } }), config);",
      "  return { state, resumed };",
      "}",
      "const terms = \"StateGraph START END addNode addEdge addConditionalEdges compile checkpointer MemorySaver Command resume graph.getState streamEvents ToolNode MessagesAnnotation thread_id\";"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "workflow-orchestration-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      workflowSetups: Array<{ filePath: string; platform: string; workflowCount: number; stepCount: number; stateCount: number; observabilityCount: number }>;
      triggerSignals: Array<{ signal: string; readiness: string }>;
      executionSignals: Array<{ signal: string; readiness: string }>;
      durabilitySignals: Array<{ signal: string; readiness: string }>;
      flowSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.sourcePattern).toBe("Workflow orchestration readiness Temporal workflows activities Worker taskQueue schedules signals queries updates setHandler condition CancellationScope workflowInfo patched deprecatePatch ApplicationFailure ActivityFailure NativeConnection TestWorkflowEnvironment proxySinks interceptors @temporalio/activity @temporalio/common @temporalio/testing @temporalio/openai-agents continueAsNew Inngest createFunction events cron step.run step.sleep waitForEvent invoke cancelOn concurrency throttle debounce rate limit Trigger.dev task schemaTask schedules cron wait queue retry maxDuration idempotency metadata logger deploy runs LangGraph StateGraph START END addNode addEdge addConditionalEdges compile checkpointer MemorySaver Command resume graph.getState streamEvents");
    const setup = report.workflowSetups.find((item) => item.filePath === "src/agents/langgraph-agent.ts");
    expect(setup?.platform).toBe("langgraph");
    expect(setup?.workflowCount).toBeGreaterThan(0);
    expect(setup?.stepCount).toBeGreaterThan(0);
    expect(setup?.stateCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.triggerSignals, ["graph-start", "thread-config"]);
    expectReady(report.executionSignals, ["state-graph", "graph-node", "tool-node", "compiled-graph"]);
    expectReady(report.durabilitySignals, ["checkpointer", "memory-saver", "resume-command"]);
    expectReady(report.flowSignals, ["graph-edge", "conditional-edge", "start-end", "tool-loop"]);
    expectReady(report.runtimeSignals, ["graph-invoke", "stream-events"]);
    expectReady(report.observabilitySignals, ["graph-state", "stream-events"]);
    expectReady(report.packageSignals, ["@langchain/langgraph", "@langchain/langgraph-checkpoint", "langchain"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "workflow-orchestration-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "workflow-orchestration-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects OpenAPI client generation readiness patterns without running generators", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-openapi-client-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-openapi-client-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "openapi"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "generated"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "client"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "gen:types": "openapi-typescript ./openapi/petstore.yaml --output src/generated/petstore.d.ts",
        "gen:hey": "openapi-ts --config openapi-ts.config.ts",
        "gen:orval": "orval --config orval.config.ts --output src/generated",
        "gen:server": "openapi-generator-cli generate -i ./openapi/admin.yaml -g typescript-fetch -o src/generated/admin",
        "gen:swagger": "swagger-codegen generate -i ./openapi/admin.yaml -l typescript-angular -o src/generated/angular",
        "lint:openapi": "redocly lint openapi/petstore.yaml",
        "validate:openapi": "openapi-generator validate -i openapi/admin.yaml",
        "update-samples": "orval --config orval.config.ts && pnpm test:cli",
        "test:samples": "vitest run samples",
        "test:snapshots": "vitest run src/generated --update-snapshots",
        "test:snapshots:update": "vitest run src/generated --update-snapshots",
        "test:cli": "tsc --noEmit src/generated/client.ts",
        typecheck: "tsc --noEmit"
      },
      dependencies: {
        "openapi-fetch": "latest",
        "@hey-api/client-fetch": "latest",
        "@hey-api/client-axios": "latest",
        "@hey-api/client-ky": "latest",
        "@hey-api/client-next": "latest",
        "@hey-api/client-nuxt": "latest",
        "@hey-api/client-ofetch": "latest",
        "@hey-api/sdk": "latest",
        "@hey-api/schemas": "latest",
        "@hey-api/transformers": "latest",
        "@hey-api/typescript": "latest",
        axios: "latest",
        "@tanstack/react-query": "latest",
        "@tanstack/preact-query": "latest",
        "@pinia/colada": "latest",
        swr: "latest",
        zod: "latest",
        valibot: "latest",
        arktype: "latest",
        msw: "latest",
        hono: "latest"
      },
      devDependencies: {
        "openapi-typescript": "latest",
        orval: "latest",
        "@openapitools/openapi-generator-cli": "latest",
        "openapi-generator-cli": "latest",
        "swagger-codegen": "latest",
        "@hey-api/openapi-ts": "latest",
        "@redocly/cli": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "openapi", "petstore.yaml"), [
      "openapi: 3.1.0",
      "info:",
      "  title: Petstore",
      "  version: 1.0.0",
      "paths:",
      "  /pets:",
      "    get:",
      "      operationId: listPets",
      "      responses:",
      "        '200':",
      "          description: ok",
      "          content:",
      "            application/json:",
      "              schema:",
      "                type: array",
      "                items:",
      "                  $ref: '#/components/schemas/Pet'",
      "    post:",
      "      operationId: createPet",
      "      requestBody:",
      "        content:",
      "          application/json:",
      "            schema:",
      "              $ref: '#/components/schemas/Pet'",
      "      responses:",
      "        '201':",
      "          description: created",
      "components:",
      "  schemas:",
      "    Pet:",
      "      type: object",
      "      required: [id, name]",
      "      properties:",
      "        id:",
      "          type: string",
      "        name:",
      "          type: string"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "openapi", "admin.yaml"), [
      "swagger: '2.0'",
      "info:",
      "  title: Admin",
      "  version: 1.0.0",
      "paths:",
      "  /admin/users:",
      "    get:",
      "      operationId: listAdminUsers",
      "      responses:",
      "        '200':",
      "          description: ok"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "redocly.yaml"), [
      "apis:",
      "  petstore:",
      "    root: ./openapi/petstore.yaml",
      "  admin:",
      "    root: ./openapi/admin.yaml",
      "extends:",
      "  - recommended"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "orval.config.ts"), [
      "import { defineConfig } from 'orval';",
      "export default defineConfig({",
      "  petstore: {",
      "    input: { target: './openapi/petstore.yaml', validation: true },",
      "    output: {",
      "      target: 'src/generated/petstore.ts',",
      "      schemas: 'src/generated/schemas',",
      "      client: 'react-query',",
      "      mock: true,",
      "      mode: 'tags-split',",
      "      override: {",
      "        mutator: { path: 'src/client/mutator.ts', name: 'customClient' },",
      "        zod: { generate: true }",
      "      }",
      "    }",
      "  },",
      "  admin: {",
      "    input: { target: 'https://example.com/api-docs/openapi.json' },",
      "    output: { target: 'src/generated/admin.ts', client: 'swr', mock: true }",
      "  }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "openapi-ts.config.ts"), [
      "import { createClient } from '@hey-api/openapi-ts';",
      "export default createClient({",
      "  input: './openapi/petstore.yaml',",
      "  output: [{ path: 'src/generated/hey-api', format: 'prettier' }],",
      "  watch: false,",
      "  plugins: [",
      "    '@hey-api/client-fetch',",
      "    '@hey-api/client-axios',",
      "    '@hey-api/client-ky',",
      "    '@hey-api/client-next',",
      "    '@hey-api/client-nuxt',",
      "    '@hey-api/client-ofetch',",
      "    '@hey-api/sdk',",
      "    '@hey-api/schemas',",
      "    '@hey-api/transformers',",
      "    '@hey-api/typescript',",
      "    '@tanstack/react-query',",
      "    '@tanstack/preact-query',",
      "    '@pinia/colada',",
      "    '@tanstack/vue-query',",
      "    '@tanstack/svelte-query',",
      "    '@tanstack/solid-query',",
      "    '@tanstack/angular-query-experimental',",
      "    'swr',",
      "    'zod',",
      "    'valibot',",
      "    'arktype',",
      "    'fastify',",
      "    'nestjs',",
      "    'orpc'",
      "  ]",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "openapi-generator-config.json"), JSON.stringify({
      inputSpec: "./openapi/admin.yaml",
      generatorName: "typescript-nestjs",
      outputDir: "src/generated/admin-server",
      additionalProperties: {
        apiPackage: "admin.api",
        modelPackage: "admin.models",
        npmName: "@example/admin-sdk"
      },
      globalProperties: {
        apis: "",
        models: "",
        supportingFiles: ""
      },
      templateDir: "./templates/openapi"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".openapi-generator-ignore"), [
      "# generated output ignore file",
      "src/generated/admin-server/README.md",
      "src/generated/admin-server/.openapi-generator/**"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "openapi-client.yml"), [
      "name: openapi-client",
      "on: [pull_request, workflow_dispatch]",
      "jobs:",
      "  generated-client:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm lint:openapi",
      "      - run: pnpm gen:types && pnpm gen:orval && pnpm gen:server",
      "      - run: git diff --exit-code src/generated",
      "      - run: pnpm test:snapshots",
      "      - run: pnpm typecheck"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "client", "mutator.ts"), [
      "export async function customClient(url: string, init: RequestInit = {}) {",
      "  return fetch(url, { ...init, headers: { ...init.headers, Authorization: 'Bearer test-token' } });",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "client", "hey-api-runtime.ts"), [
      "import { createClient } from '@hey-api/client-fetch';",
      "const heyClient = createClient({ baseUrl: '/api', auth: async () => 'Bearer test-token', headers: { 'x-client': 'repo-tutor' } });",
      "heyClient.interceptors.request.use((request) => request);",
      "heyClient.interceptors.response.use((response) => response);",
      "heyClient.interceptors.error.use((error) => error);",
      "export { heyClient };"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "generated", "client.ts"), [
      "// do not edit - generated diff snapshots validate generated output",
      "import createClient from 'openapi-fetch';",
      "import axios from 'axios';",
      "import useSWR from 'swr';",
      "import { useQuery, useMutation } from '@tanstack/react-query';",
      "import { http } from 'msw';",
      "import { z } from 'zod';",
      "export interface Pet { id: string; name: string }",
      "export type paths = { '/pets': { get: { responses: { 200: { content: { 'application/json': Pet[] } } } } } };",
      "export const client = createClient<paths>({ baseUrl: '/api' });",
      "export const petSchema = z.object({ id: z.string(), name: z.string() });",
      "export const handlers = [http.get('/pets', () => Response.json([]))];",
      "export function usePets() { return useQuery({ queryKey: ['pets'], queryFn: () => fetch('/pets').then((r) => r.json()) }); }",
      "export function useCreatePet() { return useMutation({ mutationFn: (pet: Pet) => axios.post('/pets', pet) }); }",
      "export function usePetsSWR() { return useSWR('/pets', (url) => fetch(url).then((r) => r.json())); }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "openapi-client.md"), [
      "Orval generates models, requests, hooks, mocks, zod schemas, and TypeScript SDKs from valid OpenAPI v3 or Swagger v2 specs in YAML and JSON formats.",
      "OpenAPI client projects generate TypeScript SDKs, docs, html2 markdown documentation, server stub output, and schema output from multiple specs.",
      "projects: petstore admin public internal specs: ./openapi/petstore.yaml ./openapi/admin.yaml",
      "Runtime coverage includes React apps, React Query, SWR, Vue Query, Svelte Query, Solid Query, SolidStart, Angular HttpClient, Angular Query, Hono, zod, Effect, MCP server, Model Context Protocol, native fetch, Axios, React Query, and SWR.",
      "Hey API coverage includes Vite plugin heyApiPlugin, Nuxt module, watch mode, createClient, plugin arrays, @hey-api/client-fetch, client-axios, client-ky, client-next, client-nuxt, client-ofetch, SDK, schemas, transformers, TypeScript plugin, Preact Query, Pinia Colada, Fastify, NestJS, oRPC, valibot, and arktype.",
      "Custom client runtime uses interceptors, auth, headers, baseUrl, request interceptors, response interceptors, and error interceptors.",
      "Generator input errors are normalized with getInputError for invalid input or inaccessible input.",
      "Generation workflow runs update-samples, test:samples, test:snapshots, test:snapshots:update, and test:cli so generated output and sample snapshots stay reviewed.",
      "A note about AI-generated output: review AI-generated output and do not merge changes you cannot explain in your own words.",
      "Security review: review untrusted source specs, code injection risks, custom template review, and templateDir changes before running generators."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "openapi-client-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      clientSetups: Array<{ filePath: string; generator: string; specCount: number; outputCount: number; clientCount: number; typeCount: number; hookCount: number; mockCount: number; validationCount: number; configCount: number; scriptCount: number; packageCount: number }>;
      specSignals: Array<{ signal: string; readiness: string }>;
      generatorSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      clientTargetSignals: Array<{ signal: string; readiness: string }>;
      generationWorkflowSignals: Array<{ signal: string; readiness: string }>;
      qualitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.sourcePattern).toContain("Hey API @hey-api/openapi-ts createClient plugins");
    expect(report.clientSetups.length).toBeGreaterThan(0);
    expect(report.clientSetups.some((item) => item.generator === "hey-api")).toBe(true);
    expect(report.clientSetups.some((item) => item.generator === "openapi-typescript")).toBe(true);
    expect(report.clientSetups.some((item) => item.generator === "orval")).toBe(true);
    expect(report.clientSetups.some((item) => item.generator === "openapi-generator")).toBe(true);
    const packageSetup = report.clientSetups.find((item) => item.filePath === "package.json");
    const orvalSetup = report.clientSetups.find((item) => item.filePath === "orval.config.ts");
    const generatedSetup = report.clientSetups.find((item) => item.filePath === "src/generated/client.ts");
    expect(packageSetup?.scriptCount).toBeGreaterThan(0);
    expect(packageSetup?.packageCount).toBeGreaterThan(0);
    expect(orvalSetup?.specCount).toBeGreaterThan(0);
    expect(orvalSetup?.outputCount).toBeGreaterThan(0);
    expect(orvalSetup?.configCount).toBeGreaterThan(0);
    expect(generatedSetup?.clientCount).toBeGreaterThan(0);
    expect(generatedSetup?.typeCount).toBeGreaterThan(0);
    expect(generatedSetup?.hookCount).toBeGreaterThan(0);
    expect(generatedSetup?.mockCount).toBeGreaterThan(0);
    expect(generatedSetup?.validationCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.specSignals, ["openapi", "swagger", "input-spec", "remote-schema", "multi-spec", "redocly-config", "schema-validation"]);
    expectReady(report.generatorSignals, ["openapi-typescript", "openapi-fetch", "hey-api", "orval", "openapi-generator", "swagger-codegen", "generator-name", "config-file", "cli-command", "vite-plugin", "nuxt-module", "watch-mode"]);
    expectReady(report.outputSignals, ["types", "client-sdk", "hooks", "schemas", "mocks", "zod", "valibot", "arktype", "transformers", "msw", "server-stub", "docs", "split-output"]);
    expectReady(report.runtimeSignals, ["fetch", "axios", "ky", "ofetch", "next", "nuxt", "interceptors", "react-query", "swr", "angular", "vue", "svelte", "hono", "mcp", "custom-mutator", "custom-client"]);
    expectReady(report.clientTargetSignals, ["models", "requests", "react", "react-query", "preact-query", "swr", "vue-query", "svelte-query", "solid-query", "solid-start", "angular", "angular-query", "pinia-colada", "hono", "fastify", "nestjs", "orpc", "zod", "valibot", "arktype", "transformers", "effect", "native-fetch", "mcp-server"]);
    expectReady(report.generationWorkflowSignals, ["update-samples", "test-samples", "snapshot-tests", "snapshot-update", "cli-type-validation", "generated-output", "reviewed-ai-output", "valid-openapi-v3", "swagger-v2", "yaml-json-spec", "vite-plugin", "nuxt-module", "watch-mode", "multi-output"]);
    expectReady(report.qualitySignals, ["validate-spec", "lint", "snapshots", "generated-diff", "typecheck", "ci", "ignore-file", "templates", "security-review", "plugin-config", "input-error"]);
    expectReady(report.packageSignals, ["openapi-typescript", "openapi-fetch", "orval", "@openapitools/openapi-generator-cli", "openapi-generator-cli", "swagger-codegen", "@hey-api/openapi-ts", "@hey-api/client-fetch", "@hey-api/client-axios", "@hey-api/client-ky", "@hey-api/client-next", "@hey-api/client-nuxt", "@hey-api/client-ofetch", "@hey-api/sdk", "@hey-api/schemas", "@hey-api/transformers", "@hey-api/typescript", "@tanstack/preact-query", "@pinia/colada", "valibot", "arktype"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "openapi-client-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "openapi-client-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects webhook readiness patterns without receiving webhooks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-webhook-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-webhook-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "webhooks"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "app", "api", "webhooks", "github"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "webhook:listen": "hookdeck listen 3000 stripe --path /webhooks/stripe --filter-headers '{\"x-stripe-signature\":{\"$exist\":true}}'",
        "webhook:events": "hookdeck gateway event list --status FAILED",
        "webhook:attempts": "hookdeck gateway attempt list --event-id evt_abc123"
      },
      dependencies: {
        svix: "latest",
        standardwebhooks: "latest",
        stripe: "latest",
        "@octokit/webhooks": "latest",
        express: "latest",
        next: "latest"
      },
      devDependencies: {
        "hookdeck-cli": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "webhooks", "svix.ts"), [
      "import { Webhook } from 'svix';",
      "const endpoint = new Webhook('whsec_test_secret');",
      "const signingKey = 'whsk_test_private';",
      "const publicKey = 'whpk_test_public';",
      "export function verifySvix(rawBody: string, headers: Record<string, string>) {",
      "  return endpoint.verify(rawBody, headers);",
      "}",
      "export const svixNotes = `${signingKey} ${publicKey} secret rotation asymmetric public key private key`;".replaceAll("`", "'")
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "webhooks", "standard.ts"), [
      "import { Webhook } from 'standardwebhooks';",
      "const webhook = new Webhook('standard_signing_secret');",
      "export function verifyStandard(rawBody: string, headers: Record<string, string>) {",
      "  const id = headers['webhook-id'];",
      "  const timestamp = headers['webhook-timestamp'];",
      "  const signature = headers['webhook-signature'];",
      "  const signedContent = `${id}.${timestamp}.${rawBody}`;",
      "  const decodedSecret = Buffer.from('placeholder', 'base64');",
      "  const versionedSignature = `v1,${signature} v1a,${signature}`;",
      "  const requiredHeaders = 'webhook-id webhook-timestamp webhook-signature missing required header invalid signature';",
      "  const tolerance = 'timestamp tolerance allowable tolerance recent enough clock skew current timestamp';",
      "  const schema = 'JSON Schema OpenAPI AsyncAPI payload schema schema validation event type schema';",
      "  const payloadShape = 'thin payload full payload thin vs full payload';",
      "  const extraSpec = 'payload size smaller than 20kb retry-after 503 Service Unavailable SSRF server-side request forgery proxy private subnet legacy webhook migration API Gateway signature verification';",
      "  const trustList = 'trusted public keys untrusted public keys Do not blindly trust public key from request payload';",
      "  return webhook.verify(rawBody, { 'webhook-id': id, 'webhook-timestamp': timestamp, 'webhook-signature': signature });",
      "}",
      "export const standardNotes = 'ed25519 v1a asymmetric signature timestamp tolerance replay raw request body msg_id.timestamp.payload signed content metadata binding space delimited multiple signatures try each signature zero downtime secret rotation base64 secret';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "webhooks", "stripe.ts"), [
      "import crypto from 'node:crypto';",
      "import express from 'express';",
      "import Stripe from 'stripe';",
      "import Redis from 'ioredis';",
      "const app = express();",
      "const stripe = new Stripe('sk_test');",
      "const redis = new Redis();",
      "app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (request, response) => {",
      "  const rawBody = request.body;",
      "  const signature = request.headers['x-stripe-signature'];",
      "  const hmac = crypto.createHmac('sha256', 'signing secret').update(rawBody).digest();",
      "  crypto.timingSafeEqual(hmac, Buffer.from(String(signature ?? ''), 'utf8'));",
      "  const event = stripe.webhooks.constructEvent(rawBody, signature as string, 'endpoint_secret');",
      "  await redis.setnx(`processed_events:${event.id}`, '1');",
      "  const idempotencyKey = request.headers['idempotency-key'];",
      "  const retry = 'retry schedule uses exponential backoff and jitter for delivery attempt recovery';",
      "  const replay = 'manual replay supported; dead-letter DLQ stores failed queue events; disable endpoint with 410 Gone';",
      "  const responseCodes = '2xx success 4xx bad request 5xx retry status code timeout after 15s';",
      "  const eventTypes = 'event types invoice.paid user.created eventTypes filter subscription source destination connection fan-out';",
      "  const security = 'HTTPS https://example.com/webhooks/stripe SSRF allowlist static IP constant time raw body secret rotation untrusted';",
      "  response.status(200).json({ ok: true, retry, replay, responseCodes, eventTypes, security, idempotencyKey });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "app", "api", "webhooks", "github", "route.ts"), [
      "import { Webhooks } from '@octokit/webhooks';",
      "import { NextRequest } from 'next/server';",
      "const webhooks = new Webhooks({ secret: 'github_secret' });",
      "export async function POST(request: NextRequest) {",
      "  const rawBody = await request.text();",
      "  const signature = request.headers.get('x-hub-signature-256');",
      "  const delivery = request.headers.get('X-GitHub-Delivery');",
      "  await webhooks.verify(rawBody, signature ?? '');",
      "  return Response.json({ delivery, signature });",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "webhooks.md"), [
      "# Webhooks",
      "Hookdeck listen forwards events to localhost: hookdeck listen 3000 stripe --path /webhooks/stripe.",
      "Hookdeck gateway source and destination create a connection; fan-out sends one source to multiple destinations.",
      "Source authentication uses source-webhook-secret while destination authentication uses destination-bearer-token and destination-api-key.",
      "Transformations use addHandler(\"transform\", request), filters use filter-body and filter-headers, rate limit uses destination-rate-limit, and healthcheck can be disabled with --no-healthcheck.",
      "The dashboard shows event history, request log, attempt log, attempt details, failure rate, metrics, issues, alerts, aggregate metrics, bookmarks, and saved events.",
      "Operators run hookdeck gateway event list --status FAILED and hookdeck gateway attempt list for delivery attempts.",
      "Failed events can be manual replay requests, replayed from event history, and inspected through Event Gateway MCP Model Context Protocol tools: hookdeck_connections hookdeck_sources hookdeck_destinations hookdeck_requests hookdeck_events hookdeck_attempts hookdeck_metrics.",
      "The local CLI listener can forward events to localhost during local forwarding and local development.",
      "Hookdeck config.toml profiles use HOOKDECK_CONFIG_FILE and XDG_CONFIG_HOME. Telemetry opt-out uses HOOKDECK_CLI_TELEMETRY_DISABLED.",
      "Reliability includes rule-retry-count, svix-retry-count, rate limit, retry-after, message.attempt.exhausted, queue depth, paused queues, pause connection, and unpause connection."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "webhook-readiness-report.json"), "utf8")) as {
      webhookSetups: Array<{ filePath: string; provider: string; endpointCount: number; signatureCount: number; replayCount: number; idempotencyCount: number; retryCount: number; deliveryCount: number; eventTypeCount: number; localDebugCount: number; observabilityCount: number; securityCount: number }>;
      endpointSignals: Array<{ signal: string; readiness: string }>;
      signatureSignals: Array<{ signal: string; readiness: string }>;
      verificationSignals: Array<{ signal: string; readiness: string }>;
      reliabilitySignals: Array<{ signal: string; readiness: string }>;
      operationsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const providers = report.webhookSetups.map((item) => item.provider);
    expect(report.webhookSetups.length).toBeGreaterThan(0);
    expect(providers).toContain("svix");
    expect(providers).toContain("standard-webhooks");
    expect(providers).toContain("hookdeck");
    expect(providers).toContain("stripe");
    expect(providers).toContain("github");
    const stripeSetup = report.webhookSetups.find((item) => item.filePath === "src/webhooks/stripe.ts");
    const hookdeckSetup = report.webhookSetups.find((item) => item.filePath === "docs/webhooks.md");
    expect(stripeSetup?.endpointCount).toBeGreaterThan(0);
    expect(stripeSetup?.signatureCount).toBeGreaterThan(0);
    expect(stripeSetup?.idempotencyCount).toBeGreaterThan(0);
    expect(stripeSetup?.retryCount).toBeGreaterThan(0);
    expect(stripeSetup?.deliveryCount).toBeGreaterThan(0);
    expect(stripeSetup?.securityCount).toBeGreaterThan(0);
    expect(hookdeckSetup?.localDebugCount).toBeGreaterThan(0);
    expect(hookdeckSetup?.observabilityCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      const readySignals = items.filter((item) => item.readiness === "ready").map((item) => item.signal);
      for (const signal of signals) {
        expect(readySignals).toContain(signal);
      }
    };
    expectReady(report.endpointSignals, ["endpoint", "route", "source", "destination", "connection", "fan-out", "event-filter", "source-auth", "destination-auth", "transformation", "rate-limit", "healthcheck", "https", "status-code", "timeout"]);
    expectReady(report.signatureSignals, ["webhook-id", "webhook-timestamp", "webhook-signature", "hmac", "ed25519", "secret-prefix", "public-key", "private-key", "trust-list", "constant-time", "raw-body", "rotation", "asymmetric"]);
    expectReady(report.verificationSignals, ["signed-content", "metadata-binding", "versioned-signature", "multi-signature", "base64-secret", "timestamp-tolerance", "required-headers", "invalid-signature", "payload-schema", "thin-full-payload", "payload-size", "retry-after", "ssrf-protection", "legacy-migration", "api-gateway-verification"]);
    expectReady(report.reliabilitySignals, ["retry", "retry-schedule", "retry-count", "backoff", "jitter", "delivery-attempt", "manual-replay", "idempotency", "dedupe-store", "disable-endpoint", "pause-connection", "rate-limit", "retry-after", "exhausted-event", "queue-depth", "dead-letter"]);
    expectReady(report.operationsSignals, ["dashboard", "event-history", "request-log", "attempt-log", "failure-rate", "metrics", "issues", "alerts", "event-gateway", "mcp", "mcp-tools", "cli-listen", "local-forward", "config-profile", "bookmark", "healthcheck", "telemetry-opt-out"]);
    expectReady(report.packageSignals, ["svix", "standardwebhooks", "standard-webhooks-spec", "hookdeck-cli", "hookdeck-gateway", "stripe", "@octokit/webhooks", "express", "next-server"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "webhook-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "webhook-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects notification readiness patterns without sending notifications", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-notification-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-notification-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "notifications"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "components"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "notifications:check": "rg \"@novu|subscriberId|preferences|delivery log\" src docs"
      },
      dependencies: {
        "@novu/node": "latest",
        "@novu/js": "latest",
        "@novu/react": "latest",
        "@knocklabs/node": "latest",
        "@magicbell/react": "latest",
        "firebase-admin": "latest",
        "onesignal-node": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "notifications", "novu.ts"), [
      "import { Novu } from '@novu/node';",
      "import { novu } from '@novu/js';",
      "const client = new Novu(process.env.NOVU_API_KEY ?? 'test_key');",
      "export async function triggerInvoiceWorkflow(user: { id: string; email: string; firstName: string }, organizationId: string) {",
      "  const payload = { invoiceId: 'inv_123', variables: { total: '$10' }, firstName: user.firstName, email: user.email };",
      "  await client.subscribers.identify(user.id, { email: user.email, firstName: user.firstName, profile: { plan: 'pro' } });",
      "  await client.topics.create({ key: 'billing-topic', name: 'Billing topic' });",
      "  await client.topics.addSubscribers('billing-topic', { subscribers: [user.id] });",
      "  await client.trigger('invoice-paid-workflow', { to: { subscriberId: user.id }, payload, tenant: organizationId, tenantId: organizationId });",
      "  return novu.notifications.list({ subscriberId: user.id });",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "components", "notification-inbox.tsx"), [
      "import { Inbox, NovuProvider, PreferenceLevel, WorkflowCriticalityEnum, useNovu } from '@novu/react';",
      "export function NotificationInbox() {",
      "  const { preferences, createSubscription, removeSubscription } = useNovu();",
      "  const channels = 'Inbox in-app notification center email SMS push chat Slack Microsoft Teams Telegram WhatsApp';",
      "  const settings = `${PreferenceLevel.TEMPLATE} ${WorkflowCriticalityEnum.CRITICAL} opt-in opt-out unsubscribe subscription controls`;",
      "  void preferences;",
      "  void createSubscription;",
      "  void removeSubscription;",
      "  return <NovuProvider applicationIdentifier=\"app_id\" subscriberId=\"user_123\" subscriberHash=\"hash\"><Inbox />{channels}{settings}</NovuProvider>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "notifications.md"), [
      "# Notification workflow",
      "Novu workflows trigger subscriberId subscribers topics subscriptions preferences through one notification workflow.",
      "The workflow uses step.email, step.inbox, digest batching, delay scheduling, wait rules, branch conditions, payload variables, tenant routing, and a conversation thread for inbound message replies.",
      "Audience coverage includes subscriber profile, user profile, topic subscription, segments, groups, tenantId, organizationId, subscribe, unsubscribe, opt-in, and opt-out controls.",
      "Channel coverage includes Inbox, in-app, email, SMS, push notification, chat, Slack, Teams, Telegram, WhatsApp, and Discord providers.",
      "Template coverage includes template subject title body content editor no-code email editor variables payload localization i18n branding theme logo preview test send sandbox dry-run.",
      "Operations coverage includes NOVU_API_KEY environment staging production baseURL webhook callback delivery log activity feed delivery status logs rate limit 429 retry retries backoff analytics metrics dashboard admin panel portal failure.",
      "Package comparison notes mention @knocklabs/node, @magicbell/react, firebase-admin admin.messaging, OneSignal onesignal-node, and a custom notification sender."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "notification-readiness-report.json"), "utf8")) as {
      notificationSetups: Array<{ filePath: string; provider: string; workflowCount: number; triggerCount: number; subscriberCount: number; topicCount: number; preferenceCount: number; channelCount: number; inboxCount: number; templateCount: number; credentialCount: number; observabilityCount: number }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      audienceSignals: Array<{ signal: string; readiness: string }>;
      channelSignals: Array<{ signal: string; readiness: string }>;
      templateSignals: Array<{ signal: string; readiness: string }>;
      operationsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.notificationSetups.length).toBeGreaterThan(0);
    expect(report.notificationSetups.some((item) => item.provider === "novu")).toBe(true);
    const novuSetup = report.notificationSetups.find((item) => item.filePath === "src/notifications/novu.ts");
    const docsSetup = report.notificationSetups.find((item) => item.filePath === "docs/notifications.md");
    expect(novuSetup?.workflowCount).toBeGreaterThan(0);
    expect(novuSetup?.triggerCount).toBeGreaterThan(0);
    expect(novuSetup?.subscriberCount).toBeGreaterThan(0);
    expect(novuSetup?.topicCount).toBeGreaterThan(0);
    expect(docsSetup?.preferenceCount).toBeGreaterThan(0);
    expect(docsSetup?.channelCount).toBeGreaterThan(0);
    expect(docsSetup?.templateCount).toBeGreaterThan(0);
    expect(docsSetup?.credentialCount).toBeGreaterThan(0);
    expect(docsSetup?.observabilityCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.workflowSignals, ["workflow", "trigger", "step", "digest", "delay", "condition", "payload", "tenant", "conversation"]);
    expectReady(report.audienceSignals, ["subscriber", "subscriber-id", "topic", "subscription", "preferences", "segments", "user-profile", "tenant"]);
    expectReady(report.channelSignals, ["inbox", "email", "sms", "push", "chat", "slack", "teams", "telegram", "whatsapp"]);
    expectReady(report.templateSignals, ["template", "subject", "body", "editor", "variables", "localization", "branding", "preview"]);
    expectReady(report.operationsSignals, ["api-key", "environment", "webhook", "delivery-log", "activity-feed", "rate-limit", "retry", "analytics", "dashboard"]);
    expectReady(report.packageSignals, ["@novu/node", "@novu/js", "@novu/react", "@knocklabs/node", "@magicbell/react", "firebase-admin", "onesignal-node", "custom"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "notification-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "notification-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects consent readiness patterns without executing CMP scripts", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-consent-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-consent-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "consent"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "consent:check": "rg \"CookieConsent|klaro|__tcfapi|TCString|ConsentManager\" src docs"
      },
      dependencies: {
        "vanilla-cookieconsent": "latest",
        "klaro": "latest",
        "@iabtcf/core": "latest",
        "@iabtcf/cmpapi": "latest",
        "@iabtcf/stub": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "consent", "cookieconsent.ts"), [
      "import * as CookieConsent from 'vanilla-cookieconsent';",
      "CookieConsent.run({",
      "  revision: 4,",
      "  hideFromBots: true,",
      "  disablePageInteraction: true,",
      "  guiOptions: { consentModal: { layout: 'box' }, preferencesModal: { layout: 'bar' } },",
      "  cookie: { name: 'cc_cookie', expiresAfterDays: 180 },",
      "  language: { default: 'en', translations: { en: { consentModal: { title: 'Cookie banner privacy policy' }, preferencesModal: { title: 'Manage preferences' } } } },",
      "  categories: {",
      "    necessary: { enabled: true, readOnly: true },",
      "    analytics: { autoclear: { cookies: [{ name: /^_ga/ }] }, services: { ga4: { label: 'Analytics service' } } },",
      "    marketing: { services: { ads: { label: 'Marketing pixel' } } },",
      "    preferences: { services: { theme: { label: 'Preferences service' } } },",
      "    functional: { services: { chat: { label: 'Functional service' } } },",
      "    performance: { services: { perf: { label: 'Performance service' } } }",
      "  },",
      "  onConsent: () => localStorage.setItem('consent proof timestamp', Date.now().toString()),",
      "  onChange: () => sessionStorage.setItem('lastConsent', 'changed')",
      "});",
      "export const controls = 'acceptAll acceptSelected rejectAll settings button privacy policy withdraw consent opt-out consentMode gpc do not track legitimate interest consent log proof';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "consent", "klaro.js"), [
      "import * as klaro from 'klaro';",
      "const manager = new klaro.ConsentManager({",
      "  services: [{ name: 'analytics-service', purposes: ['analytics', 'performance'] }, { name: 'ads-service', purposes: ['marketing'] }],",
      "  apps: [{ name: 'preferences-app', purposes: ['preferences', 'functional'] }]",
      "});",
      "klaro.show();",
      "manager.getConsent('analytics-service');",
      "export const blockedScript = '<script type=\"text/plain\" data-type=\"text/javascript\" data-name=\"analytics-service\" data-src=\"https://example.test/analytics.js\"></script>';",
      "export const pageScripts = 'pageScripts script blocking data-src text/plain data-type data-name autoclear disable page interaction withdraw opt-out';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "consent", "tcf.ts"), [
      "import { TCString, GVL } from '@iabtcf/core';",
      "import { CmpApi } from '@iabtcf/cmpapi';",
      "import '@iabtcf/stub';",
      "const cmp = new CmpApi(123, 2, true);",
      "window.__tcfapi?.('addEventListener', 2, () => {}, []);",
      "export const tcModel = {",
      "  TCString,",
      "  GVL,",
      "  cmpId: 123,",
      "  cmpVersion: 2,",
      "  vendorListVersion: 88,",
      "  purposeConsents: { 1: true, 2: true },",
      "  vendorConsents: { 42: true },",
      "  purposeLegitimateInterests: { 7: true },",
      "  vendorLegitimateInterests: { 42: true },",
      "  legitimateInterests: true",
      "};",
      "void cmp;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "consent.md"), [
      "# Consent readiness",
      "The CMP shows a cookie banner and modal with accept all, accept selected, reject all, and a settings button.",
      "Categories include necessary, analytics, marketing, preferences, functional, performance, services, and purposes.",
      "Scripts use data-src, text/plain, data-type, data-name, autoclear, page-script, and disable-page-interaction.",
      "Privacy controls include privacy policy, withdraw, opt-out, consent mode, GPC, do not track, legitimate interest, and proof records.",
      "IAB TCF uses __tcfapi, TCString, cmpId, vendor list, purposeConsents, vendorConsents, legitimateInterests, and GVL."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "consent-readiness-report.json"), "utf8")) as {
      consentSetups: Array<{ filePath: string; provider: string; bannerCount: number; modalCount: number; categoryCount: number; serviceCount: number; purposeCount: number; vendorCount: number; scriptBlockingCount: number; storageCount: number; localizationCount: number; apiCount: number }>;
      bannerSignals: Array<{ signal: string; readiness: string }>;
      categorySignals: Array<{ signal: string; readiness: string }>;
      scriptSignals: Array<{ signal: string; readiness: string }>;
      privacySignals: Array<{ signal: string; readiness: string }>;
      tcfSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.consentSetups.length).toBeGreaterThan(0);
    expect(report.consentSetups.some((item) => item.provider === "cookieconsent")).toBe(true);
    expect(report.consentSetups.some((item) => item.provider === "klaro")).toBe(true);
    expect(report.consentSetups.some((item) => item.provider === "iab-tcf")).toBe(true);
    const cookieSetup = report.consentSetups.find((item) => item.filePath === "src/consent/cookieconsent.ts");
    const klaroSetup = report.consentSetups.find((item) => item.filePath === "src/consent/klaro.js");
    const tcfSetup = report.consentSetups.find((item) => item.filePath === "src/consent/tcf.ts");
    expect(cookieSetup?.bannerCount).toBeGreaterThan(0);
    expect(cookieSetup?.modalCount).toBeGreaterThan(0);
    expect(cookieSetup?.categoryCount).toBeGreaterThan(0);
    expect(cookieSetup?.storageCount).toBeGreaterThan(0);
    expect(cookieSetup?.localizationCount).toBeGreaterThan(0);
    expect(cookieSetup?.apiCount).toBeGreaterThan(0);
    expect(klaroSetup?.serviceCount).toBeGreaterThan(0);
    expect(klaroSetup?.scriptBlockingCount).toBeGreaterThan(0);
    expect(tcfSetup?.purposeCount).toBeGreaterThan(0);
    expect(tcfSetup?.vendorCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.bannerSignals, ["banner", "modal", "accept-all", "accept-selected", "reject-all", "settings-button", "revision", "hide-from-bots"]);
    expectReady(report.categorySignals, ["necessary", "analytics", "marketing", "preferences", "functional", "performance", "services", "purposes"]);
    expectReady(report.scriptSignals, ["data-src", "text-plain", "data-type", "data-name", "autoclear", "page-script", "disable-page-interaction"]);
    expectReady(report.privacySignals, ["privacy-policy", "withdraw", "opt-out", "consent-mode", "gpc", "do-not-track", "legitimate-interest", "proof"]);
    expectReady(report.tcfSignals, ["__tcfapi", "tc-string", "cmp-id", "vendor-list", "purpose-consents", "vendor-consents", "legitimate-interests", "gvl"]);
    expectReady(report.packageSignals, ["vanilla-cookieconsent", "klaro", "@iabtcf/core", "@iabtcf/cmpapi", "@iabtcf/stub", "custom"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "consent-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "consent-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects privacy readiness patterns without processing live PII", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-privacy-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-privacy-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "privacy"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "privacy:scan": "rg \"AnalyzerEngine|AnonymizerEngine|RecognizerResult|PatternRecognizer|Scrubber|Detector|PII|redact|mask|privacy|retention|delete|DSAR|epsilon|delta\" .",
        "privacy:test": "python -m pytest -q tests -k \"privacy or pii or redaction\""
      },
      dependencies: {
        presidio: "latest",
        opendp: "latest",
        scrubadub: "latest",
        "@faker-js/faker": "latest",
        zod: "latest",
        yup: "latest",
        pydantic: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "privacy", "presidio.py"), [
      "from presidio_analyzer import AnalyzerEngine, RecognizerResult, PatternRecognizer",
      "from presidio_anonymizer import AnonymizerEngine",
      "from presidio_anonymizer.entities import OperatorConfig",
      "from pydantic import BaseModel, Field",
      "",
      "class PrivacyFieldMap(BaseModel):",
      "    email: str = Field(description='database field map personal_data_fields pii_fields')",
      "",
      "analyzer = AnalyzerEngine(nlp_engine='spacy')",
      "custom_recognizer = PatternRecognizer(",
      "    supported_entity='CUSTOM_ACCOUNT_ID',",
      "    patterns=[],",
      "    deny_list=['internal@example.test'],",
      "    allow_list=['public@example.test']",
      ")",
      "result = RecognizerResult(entity_type='EMAIL_ADDRESS', start=0, end=16, score=0.91)",
      "anonymizer = AnonymizerEngine()",
      "operators = {",
      "    'EMAIL_ADDRESS': OperatorConfig('mask', {'masking_char': '*', 'chars_to_mask': 8}),",
      "    'PHONE_NUMBER': OperatorConfig('replace', {'new_value': '[REDACTED]'}),",
      "    'PERSON': OperatorConfig('encrypt', {'key': 'unit-test-key'}),",
      "    'ADDRESS': OperatorConfig('decrypt', {'key': 'unit-test-key'}),",
      "}",
      "score_threshold = 0.80",
      "hash_tokenize = 'sha256 hmac token vault token map surrogate pseudonymize tokenize redact mask replace encrypt decrypt'",
      "void_values = (analyzer, custom_recognizer, result, anonymizer, operators, score_threshold, hash_tokenize, PrivacyFieldMap)"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "privacy", "scrubber.py"), [
      "import scrubadub",
      "from scrubadub import Scrubber",
      "from scrubadub.detectors import EmailDetector, PhoneDetector, NameDetector, Detector",
      "from scrubadub.filth import Filth",
      "from scrubadub.post_processors import PostProcessor",
      "",
      "scrubber = Scrubber(locale='en_US')",
      "scrubber.add_detector(EmailDetector)",
      "scrubber.add_detector(PhoneDetector)",
      "scrubber.add_detector(NameDetector)",
      "detectors = [Detector, EmailDetector, PhoneDetector, NameDetector]",
      "filth = Filth(beg=0, end=5, text='Alice', detector_name='name')",
      "post_processor = PostProcessor()",
      "clean = scrubber.clean('Alice email alice@example.test phone 555-0100 address Seoul')",
      "catalogue = 'identifier email phone name address locale catalogue post_processor validate pii replace_with redaction fixture'",
      "void_values = (detectors, filth, post_processor, clean, catalogue)"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "privacy", "opendp.py"), [
      "from opendp.mod import enable_features",
      "from opendp.measurements import make_laplace, make_gaussian",
      "from opendp.transformations import make_clamp",
      "",
      "enable_features('contrib')",
      "epsilon = 1.0",
      "delta = 1e-6",
      "bounds = (0, 100)",
      "measurement = make_laplace(scale=1.0)",
      "gaussian = make_gaussian(scale=2.0)",
      "transformation = make_clamp(bounds=bounds)",
      "privacy_map = measurement.map(d_in=1)",
      "privacy_budget = 'differential privacy privacy loss privacy budget composition privacy profile privacy unit clamp bounds bounded lower_bound upper_bound noise domain OpenDP Measurement Transformation make_private'",
      "void_values = (epsilon, delta, bounds, measurement, gaussian, transformation, privacy_map, privacy_budget)"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "privacy-policy.md"), [
      "# Privacy readiness",
      "The privacy policy and privacy notice classify personal data as sensitive data and map collection to consent, processing purpose, lawful basis, opt-in, opt-out, and withdrawal.",
      "Data minimization and purpose limitation require collecting only the least data required for product workflows.",
      "The retention policy retains email, phone, name, and address fields for 30 days, then TTL expires and purge jobs erase records.",
      "The deletion policy supports delete account, right to erasure, hard delete, and soft delete review.",
      "DSAR flows support data subject access, subject access request, data export, export data, right to access, right to deletion, GDPR, and CCPA review."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "privacy.yml"), [
      "name: privacy scan",
      "on: [push]",
      "jobs:",
      "  privacy:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - name: PII scan command",
      "        run: rg \"AnalyzerEngine|AnonymizerEngine|Scrubber|PII|redaction|privacy scan|pii scan\" .",
      "      - name: PII test fixture",
      "        run: python -m pytest -q tests -k \"privacy or pii or redaction\"",
      "      - name: policy check",
      "        run: rg \"privacy policy check|retention check|dsar check|gdpr check|ccpa check\" docs",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: redaction report",
      "          path: privacy-report.sarif"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "privacy-readiness-report.json"), "utf8")) as {
      privacySetups: Array<{ filePath: string; tool: string; detectorCount: number; anonymizerCount: number; policyCount: number; retentionCount: number; consentCount: number; dsarCount: number; differentialPrivacyCount: number; ciCount: number }>;
      piiDetectionSignals: Array<{ signal: string; readiness: string }>;
      redactionSignals: Array<{ signal: string; readiness: string }>;
      policySignals: Array<{ signal: string; readiness: string }>;
      differentialPrivacySignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.privacySetups.length).toBeGreaterThan(0);
    expect(report.privacySetups.some((item) => item.tool === "presidio")).toBe(true);
    expect(report.privacySetups.some((item) => item.tool === "scrubadub")).toBe(true);
    expect(report.privacySetups.some((item) => item.tool === "opendp")).toBe(true);
    expect(report.privacySetups.some((item) => item.tool === "gdpr")).toBe(true);
    const presidioSetup = report.privacySetups.find((item) => item.filePath === "privacy/presidio.py");
    const policySetup = report.privacySetups.find((item) => item.filePath === "docs/privacy-policy.md");
    const opendpSetup = report.privacySetups.find((item) => item.filePath === "privacy/opendp.py");
    const ciSetup = report.privacySetups.find((item) => item.filePath === ".github/workflows/privacy.yml");
    expect(presidioSetup?.detectorCount).toBeGreaterThan(0);
    expect(presidioSetup?.anonymizerCount).toBeGreaterThan(0);
    expect(policySetup?.policyCount).toBeGreaterThan(0);
    expect(policySetup?.retentionCount).toBeGreaterThan(0);
    expect(policySetup?.consentCount).toBeGreaterThan(0);
    expect(policySetup?.dsarCount).toBeGreaterThan(0);
    expect(opendpSetup?.differentialPrivacyCount).toBeGreaterThan(0);
    expect(ciSetup?.ciCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.piiDetectionSignals, ["presidio-analyzer", "pattern-recognizer", "recognizer-result", "scrubadub-detector", "email-phone-name-address", "score-threshold", "custom-entity"]);
    expectReady(report.redactionSignals, ["anonymizer-engine", "operator-config", "replace-mask-redact", "encrypt-decrypt", "surrogate-token", "scrubadub-post-processor", "hash-tokenize"]);
    expectReady(report.policySignals, ["privacy-policy", "data-classification", "data-minimization", "retention-policy", "deletion-policy", "dsar-export-delete", "consent-purpose"]);
    expectReady(report.differentialPrivacySignals, ["opendp-measurement", "privacy-map", "epsilon-delta", "laplace-gaussian-noise", "clamp-bounds", "privacy-budget"]);
    expectReady(report.configSignals, ["allow-list", "deny-list", "score-threshold", "locale", "nlp-engine", "operator-defaults", "database-field-map"]);
    expectReady(report.ciSignals, ["github-actions", "privacy-scan-command", "pii-test-fixture", "redaction-artifact", "policy-check"]);
    expectReady(report.packageSignals, ["presidio", "opendp", "scrubadub", "faker", "zod", "yup", "pydantic", "gdpr"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "privacy-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "privacy-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects secret management readiness patterns without executing secret tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-smgmt-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-smgmt-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "smgmt"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "config"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "k8s"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "smgmt:scan": "rg \"Vault|Infisical|Doppler|SOPS|ExternalSecret|SealedSecret\" src docs config k8s",
        "smgmt:run": "doppler run -- infisical run -- node src/index.js"
      },
      dependencies: {
        "@infisical/sdk": "latest",
        "infisical": "latest",
        "vault": "latest",
        "node-vault": "latest",
        "doppler": "latest",
        "sops": "latest",
        "sealed-secrets": "latest",
        "external-secrets": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "smgmt", "vault.ts"), [
      "import vault from 'node-vault';",
      "const client = vault({ endpoint: process.env.VAULT_ADDR, token: process.env.VAULT_TOKEN });",
      "export const vaultOps = [",
      "  'vault login token service token',",
      "  'vault auth enable approle role_id secret_id AppRole',",
      "  'vault auth enable kubernetes Kubernetes Auth service account',",
      "  'vault auth enable oidc OIDC JWT auth',",
      "  'vault auth enable aws AWS Auth IAM role',",
      "  'vault auth enable gcp GCP Auth Google Cloud auth',",
      "  'vault auth enable azure Azure Auth managed identity',",
      "  'vault secrets enable kv kv-v2 versioning versioned secrets',",
      "  'vault secrets enable transit encryption as a service encrypt decrypt',",
      "  'vault secrets enable pki PKI certificate authority certificates TLS cert',",
      "  'vault secrets enable database dynamic secrets database credentials leased credentials',",
      "  'vault policy write app least privilege policy policies rbac role permission',",
      "  'vault audit enable file audit log access log telemetry metrics',",
      "  'lease renew revoke ttl token TTL max_ttl rotation rotate expiry expiration dynamic secret',",
      "  'access request approval privileged access break-glass break glass emergency access',",
      "  'vault agent sidecar template env injection secretRef envFrom secrets.inject SDK API vault client secret sync certificate sync'",
      "];",
      "void client;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "smgmt", "infisical.ts"), [
      "import { InfisicalSDK } from '@infisical/sdk';",
      "const infisical = new InfisicalSDK({ clientId: 'client id', clientSecret: 'client secret' });",
      "export const infisicalOps = [",
      "  'Infisical infisical run infisical login infisical secrets infisical export',",
      "  'machine identity Universal Auth Kubernetes Auth GCP Auth Azure Auth AWS Auth OIDC Auth',",
      "  'secret rotation rotate Kubernetes Operator Infisical Agent SDK API certificate sync KMS',",
      "  'environment config app config env injection sync audit logs access request policy rbac'",
      "];",
      "void infisical;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "doppler.md"), [
      "# Doppler secret management",
      "Use Doppler with doppler login, doppler setup, doppler run, and doppler secrets for environment config.",
      "Project/config selection uses a scoped token, CI/CD pipeline, GitHub Action workflow, SDK/API sync, and env injection.",
      "Operations record audit log, activity logs, access request approvals, break glass emergency access, versioning, rotation, TTL, and revoke guidance."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "config", "sops-policy.yaml"), [
      "creation_rules:",
      "  - path_regex: secrets/.*\\.yaml$",
      "    age: age1example",
      "    pgp: fingerprint",
      "    encrypted_regex: '^(data|stringData)$'",
      "    kms: arn:aws:kms:us-east-1:111122223333:key/example",
      "# SOPS sops encrypt decrypt encryption workflow"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "sealed-sync.yaml"), [
      "apiVersion: bitnami.com/v1alpha1",
      "kind: SealedSecret",
      "metadata:",
      "  name: app-sealed-secret",
      "spec:",
      "  encryptedData:",
      "    token: sealed secret value",
      "# sealed-secrets kubeseal sync rotation audit"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "external-sync.yaml"), [
      "apiVersion: external-secrets.io/v1",
      "kind: ExternalSecret",
      "metadata:",
      "  name: app-external-secret",
      "spec:",
      "  secretStoreRef:",
      "    name: app-secret-store",
      "    kind: SecretStore",
      "  target:",
      "    name: synced-secret",
      "  dataFrom:",
      "    - extract:",
      "        key: app/config",
      "---",
      "apiVersion: external-secrets.io/v1",
      "kind: ClusterSecretStore",
      "metadata:",
      "  name: cluster-secret-store",
      "# External Secrets Kubernetes Operator secret sync"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "secret-management.yml"), [
      "name: secret-management",
      "on: [push]",
      "jobs:",
      "  secret-management:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - name: Doppler GitHub Action CI/CD",
      "        uses: dopplerhq/secrets-fetch-action@v1",
      "      - name: Vault policy and audit check",
      "        run: rg \"vault policy|audit log|lease|rotation|ExternalSecret|SOPS\" ."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "secret-management-readiness-report.json"), "utf8")) as {
      secretManagementSetups: Array<{ filePath: string; provider: string; readiness: string; authCount: number; engineCount: number; policyCount: number; injectionCount: number; rotationCount: number; syncCount: number; auditCount: number; leaseCount: number; encryptionCount: number; cliCount: number }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      authSignals: Array<{ signal: string; readiness: string }>;
      storageSignals: Array<{ signal: string; readiness: string }>;
      deliverySignals: Array<{ signal: string; readiness: string }>;
      governanceSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    expect(report.secretManagementSetups.length).toBeGreaterThan(0);
    expect(report.secretManagementSetups.some((item) => item.provider === "vault")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "infisical")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "doppler")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "sops")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "sealed-secrets")).toBe(true);
    expect(report.secretManagementSetups.some((item) => item.provider === "external-secrets")).toBe(true);
    const vaultSetup = report.secretManagementSetups.find((item) => item.filePath === "src/smgmt/vault.ts");
    expect(vaultSetup?.authCount).toBeGreaterThan(0);
    expect(vaultSetup?.engineCount).toBeGreaterThan(0);
    expect(vaultSetup?.policyCount).toBeGreaterThan(0);
    expect(vaultSetup?.injectionCount).toBeGreaterThan(0);
    expect(vaultSetup?.rotationCount).toBeGreaterThan(0);
    expect(vaultSetup?.syncCount).toBeGreaterThan(0);
    expect(vaultSetup?.auditCount).toBeGreaterThan(0);
    expect(vaultSetup?.leaseCount).toBeGreaterThan(0);
    expect(vaultSetup?.encryptionCount).toBeGreaterThan(0);
    expect(vaultSetup?.cliCount).toBeGreaterThan(0);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.platformSignals, ["vault", "infisical", "doppler", "sops", "sealed-secrets", "external-secrets"]);
    expectReady(report.authSignals, ["token", "approle", "kubernetes-auth", "oidc", "aws-auth", "gcp-auth", "azure-auth", "universal-auth"]);
    expectReady(report.storageSignals, ["kv", "secret-engine", "dynamic-secrets", "pki", "transit", "certificate", "database-credentials", "environment-config"]);
    expectReady(report.deliverySignals, ["env-injection", "cli-run", "agent", "kubernetes-operator", "sync", "github-action", "ci-cd", "sdk-api"]);
    expectReady(report.governanceSignals, ["policy", "rbac", "audit-log", "lease", "rotation", "versioning", "access-request", "break-glass"]);
    expectReady(report.packageSignals, ["@infisical/sdk", "infisical", "vault", "node-vault", "doppler", "sops", "sealed-secrets", "external-secrets"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "secret-management-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "secret-management-readiness.html"))).resolves.toBeUndefined();
  });
});
