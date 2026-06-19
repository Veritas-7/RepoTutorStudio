import type { LlmEvalReadinessReport, LlmObservabilityReadinessReport, LlmReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildLlmReadinessReport(walk: WalkResult): Promise<LlmReadinessReport> {
  const sourceFiles = await llmReadinessSourceFiles(walk);
  const llmSetups = llmReadinessSetups(sourceFiles);
  const modelSignals = llmReadinessModelSignals(sourceFiles);
  const promptSignals = llmReadinessPromptSignals(sourceFiles);
  const runnableSignals = llmReadinessRunnableSignals(sourceFiles);
  const toolSignals = llmReadinessToolSignals(sourceFiles);
  const retrievalSignals = llmReadinessRetrievalSignals(sourceFiles);
  const structuredOutputSignals = llmReadinessStructuredOutputSignals(sourceFiles);
  const streamingSignals = llmReadinessStreamingSignals(sourceFiles);
  const safetySignals = llmReadinessSafetySignals(sourceFiles);
  const packageSignals = llmReadinessPackageSignals(sourceFiles);

  const hasModel = modelSignals.some((item) => item.readiness === "ready") || llmSetups.some((item) => item.modelCount > 0);
  const hasPrompt = promptSignals.some((item) => item.readiness === "ready") || llmSetups.some((item) => item.promptCount > 0);
  const hasTools = toolSignals.some((item) => item.readiness === "ready") || llmSetups.some((item) => item.toolCount > 0 || item.agentCount > 0);
  const hasRetrieval = retrievalSignals.some((item) => item.readiness === "ready") || llmSetups.some((item) => item.retrievalCount > 0 || item.embeddingCount > 0);
  const hasStructuredOutput = structuredOutputSignals.some((item) => item.readiness === "ready") || llmSetups.some((item) => item.outputCount > 0);
  const hasStreaming = streamingSignals.some((item) => item.readiness === "ready") || llmSetups.some((item) => item.streamingCount > 0 || item.observabilityCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready");

  const riskQueue: LlmReadinessReport["riskQueue"] = [];
  if (!hasModel && !hasPrompt && !hasTools && !hasRetrieval) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the LLM model, prompt, tool, or retrieval boundary before claiming LLM readiness.",
      why: "LangChain.js-style readiness starts with a model provider plus prompts, tools, retrieval, or output parsing learners can trace.",
      relatedHref: "html/llm-readiness.html"
    });
  }
  if ((hasPrompt || hasTools || hasRetrieval || hasStructuredOutput) && !hasModel) {
    riskQueue.push({
      priority: "high",
      action: "Trace the chat/completion/embedding model provider and model-name configuration.",
      why: "Prompts, tools, RAG, and parsers need an explicit model boundary to explain cost, latency, streaming, and failure behavior.",
      relatedHref: "html/llm-readiness.html"
    });
  }
  if (hasModel && !hasPrompt) {
    riskQueue.push({
      priority: "medium",
      action: "Document the system/human prompt template or message assembly path next to the model call.",
      why: "LLM behavior is mostly shaped by prompts and message history; model calls alone are not enough for learner rebuilds.",
      relatedHref: "html/llm-readiness.html"
    });
  }
  if ((hasTools || hasRetrieval) && !hasStructuredOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Add structured output, schema validation, or parser evidence for tool/RAG responses.",
      why: "Agent and retrieval flows are easier to test when outputs are parsed through Zod, JSON Schema, output parsers, or structured tool calls.",
      relatedHref: "html/llm-readiness.html"
    });
  }
  if ((hasModel || hasTools || hasRetrieval) && !hasStreaming) {
    riskQueue.push({
      priority: "low",
      action: "Record streaming, callbacks, token usage, tracing, or LangSmith-style observability for LLM runs.",
      why: "Production LLM apps need visibility into latency, token usage, callbacks, traces, and partial output behavior.",
      relatedHref: "html/llm-readiness.html"
    });
  }
  if ((hasModel || hasTools || hasRetrieval) && !hasSafety) {
    riskQueue.push({
      priority: "low",
      action: "Document retry, fallback, guardrail, moderation, refusal, and rate-limit handling around LLM calls.",
      why: "LLM integrations fail through provider limits, invalid output, prompt injection, unsafe content, and transient model errors.",
      relatedHref: "html/llm-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify LLM behavior with trusted tests, mocked providers, evals, or reviewed traces outside RepoTutor.",
    why: "RepoTutor records LLM readiness only; it does not call providers, stream tokens, run agents, fetch vector stores, evaluate prompts, or inspect live traces.",
    relatedHref: "html/llm-readiness.html"
  });

  return {
    summary: `LangChain.js-style LLM readiness report: setup ${llmSetups.length}개, model signal ${modelSignals.length}개, prompt signal ${promptSignals.length}개, runnable signal ${runnableSignals.length}개, tool signal ${toolSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/$" + "{key}/streamed_output/- /logs/$" + "{runName}/streamed_output_str/- /logs/$" + "{runName}/streamed_output/- /logs/$" + "{runName}/inputs /logs/$" + "{runName}/final_output /logs/$" + "{runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys",
    llmSetups,
    modelSignals,
    promptSignals,
    runnableSignals,
    toolSignals,
    retrievalSignals,
    structuredOutputSignals,
    streamingSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"BaseChatModel|BaseChatModelCallOptions|BaseLanguageModel|streamV2|_streamChatModelEvents|_generateUncached|_generateCached|generatePrompt|_getSerializedCacheKeyParametersForCall|cache.lookup|cache.update|RUN_KEY|LLMResult|GenerationChunk|GenerationChunkFields|ChatGeneration|ChatGenerationChunk|ChatGenerationChunkFields|ChatResult|generationInfo|llmOutput|generations|initChatModel|ConfigurableModel|modelProvider|configurableFields|configPrefix|ChatOpenAI|ChatAnthropic|ChatGoogle|OpenAI\\(|Anthropic\\(|Ollama|model:\" package.json src app server packages", purpose: "Inventory model profile capabilities, base chat model execution, model caching, LLM result/output contracts, universal model routing, configurable runtime overrides, model providers, model names, temperatures, and runtime configuration." },
      { command: "rg \"ChatPromptTemplate|PromptTemplate|FewShotPromptTemplate|FewShotChatMessagePromptTemplate|PipelinePromptTemplate|pipelinePrompts|finalPrompt|computeInputValues|formatPipelinePrompts|StructuredPrompt|StructuredPromptInput|fromMessagesAndSchema|DictPromptTemplate|TypedPromptInputValues|_getInputVariables|_insertInputVariables|inputVariables|lc_serializable|BasePromptTemplate|BasePromptTemplateInput|BaseStringPromptTemplate|PromptValueReturnType|formatPromptValue|mergePartialAndUserVariables|lc_attributes|outputParser|StringPromptValue|SerializedPromptTemplate|SerializedFewShotTemplate|SerializedBasePromptTemplate|input_variables|template_format|serialize|deserialize|schema_|jsonMode|jsonSchema|functionMode|RunnableBinding|withStructuredOutput|BaseMessagePromptTemplate|BaseChatPromptTemplate|BaseMessageStringPromptTemplate|ChatMessagePromptTemplate|HumanMessagePromptTemplate|AIMessagePromptTemplate|SystemMessagePromptTemplate|ImagePromptTemplate|ImagePromptTemplateInput|ImagePromptValue|ImageContent|ContentBlock|additionalContentFields|detail|MessageContentComplex|DataContentBlock|BaseDataContentBlock|URLContentBlock|Base64ContentBlock|PlainTextContentBlock|IDContentBlock|isDataContentBlock|isURLContentBlock|isBase64ContentBlock|isPlainTextContentBlock|isIDContentBlock|convertToOpenAIImageBlock|parseMimeType|parseBase64DataUrl|ProviderFormatTypes|StandardContentBlockConverter|convertToProviderContentBlock|convertToStandardContentBlock|convertToV1FromDataContentBlock|convertToV1FromDataContent|isOpenAIDataBlock|convertToV1FromOpenAIDataBlock|convertToV1FromChatCompletions|convertToV1FromChatCompletionsChunk|convertToV1FromChatCompletionsInput|convertToV1FromResponses|convertToV1FromResponsesChunk|convertToV1FromAnthropicContentBlock|convertToV1FromAnthropicInput|convertToV1FromAnthropicMessage|convertAnthropicAnnotation|StandardContentBlockTranslator|contentBlocksFromNonStringFirst|mergeContent|tool_call|server_tool_call|reasoning|citation|non_standard|mime_type|source_type|fileId|metadata|convertToV1FromOpenRouterMessage|ChatOpenRouterTranslator|reasoning_content|reasoning_details|convertToV1FromGroqMessage|ChatGroqTranslator|<think>|convertToV1FromOllamaMessage|ChatOllamaTranslator|convertToV1FromDeepSeekMessage|ChatDeepSeekTranslator|convertToV1FromXAIMessage|ChatXAITranslator|ChatGoogleGenAITranslator|ChatGoogleTranslator|thinking|thoughtSignature|inlineData|functionCall|functionResponse|fileData|executableCode|codeExecutionResult|convertToV1FromChatBedrockConverseInput|convertToV1FromChatBedrockConverseMessage|ChatBedrockConverseTranslator|citations_content|citationsContent|guard_content|cache_point|documentChar|documentPage|documentChunk|BaseExampleSelector|LengthBasedExampleSelector|SemanticSimilarityExampleSelector|BasePromptSelector|ConditionalPromptSelector|BaseGetPromptAsyncOptions|getPromptAsync|defaultPrompt|conditionals|isLLM|isChatModel|BaseLanguageModelInterface|exampleSelector|examplePrompt|exampleSeparator|partialVariables|inputKeys|exampleKeys|maxLength|getTextLength|selectExamples|TemplateFormat|templateFormat|parseTemplate|renderTemplate|checkValidTemplate|validateTemplate|INVALID_PROMPT_INPUT|mustache|f-string|image_url|_coerceMessagePromptTemplateLike|isMessagesPlaceholder|_parseImagePrompts|promptMessages|flattenedMessages|SystemMessage|HumanMessage|MessagesPlaceholder|fromMessages\" src app server packages", purpose: "Trace prompt templates, base/string prompt contracts, serialization shapes, image prompt inputs/values/content fields, format/parser/renderer validation, chat message prompt internals, pipeline prompts, structured prompts, dict prompts, few-shot/example selector contracts, message history, and chat input assembly." },
      { command: "rg \"RunnableSequence|RunnableLambda|RunnablePassthrough|RunnableBranch|BranchLike|RouterRunnable|RouterInput|actualInput|missingKey|_getOptionsList|returnExceptions|RunnableBinding|RunnableBindingArgs|configFactories|RunnableEach|RunnableRetry|RunnableRetryFailedAttemptHandler|RunnableWithFallbacks|RunnableAssign|RunnablePick|RunnableMap|RunnableMapLike|_coerceToRunnable|_coerceToDict|streamLog|RunLogPatch|streamed_output|streamEvents|convertChunksToEvents|ChatModelStreamEvent|ContentBlockDelta|activeBlocks|nextBlockIndex|getAdditionalKwargs|extractImageBlocksFromToolOutputs|getAudioPayload|MIME_TYPE_BY_AUDIO_FORMAT|MIME_TYPE_BY_IMAGE_FORMAT|AudioStreamState|throwIfAborted|ChatModelStream|TextContentStream|ToolCallsStream|ReasoningContentStream|UsageMetadataStream|ReplayBuffer|applyDelta|getEventDelta|getReasoningDelta|isReasoningContent|normalizeUsage|parseToolArgs|standardizeToolBlock|RunnableWithMessageHistory|RunnableWithMessageHistoryInputs|GetSessionHistoryCallable|_getInputMessages|_getOutputMessages|_enterHistory|_exitHistory|_mergeConfig|configurable.messageHistory|existingMessages.length|inputMessages.slice|RunnableConfig|DEFAULT_RECURSION_LIMIT|ensureConfig|mergeConfigs|patchConfig|pickRunnableConfigKeys|getCallbackManagerForConfig|AsyncLocalStorageProviderSingleton|runWithConfig|getRunnableConfig|consumeIteratorInContext|consumeAsyncIterableInContext|recursionLimit|runId|runName|maxConcurrency|timeoutMs|AbortSignal|configurable|store|BaseChatMessageHistory|BaseListChatMessageHistory|InMemoryChatMessageHistory|getMessageHistory|inputMessagesKey|outputMessagesKey|historyMessagesKey|messageHistory|sessionId|_coerceToolCall|isSerializedConstructor|SerializedConstructor|_constructMessageFromParams|coerceMessageLikeToMessage|_contentBlockToString|getBufferString|mapV1MessageToStoredMessage|StoredMessage|StoredMessageV1|mapStoredMessageToChatMessage|mapStoredMessagesToChatMessages|mapChatMessagesToStoredMessages|toDict|filterMessages|FilterMessagesFields|includeNames|excludeNames|includeTypes|excludeTypes|includeIds|excludeIds|mergeMessageRuns|convertToChunk|_chunkToMsg|trimMessages|TrimMessagesFields|maxTokens|tokenCounter|allowPartial|endOn|startOn|includeSystem|textSplitter|BaseMessageChunk|isBaseMessageChunk|AIMessageChunk|AIMessageChunkFields|HumanMessageChunk|SystemMessageChunk|FunctionMessageChunk|ChatMessageChunk|mergeResponseMetadata|mergeUsageMetadata|UsageMetadata|input_token_details|output_token_details|\\.pipe\\(|\\.invoke\\(|\\.batch\\(|\\.asTool\\(|withRetry|withFallbacks\" src app server packages", purpose: "Map LangChain Expression Language composition, runnable config propagation, router key dispatch, router batch concurrency, async-local config context, message history stores/configuration, message filtering, run merging, trimming, chunk conversion, metadata merge, invocation, batching, streaming, tool wrapping, retry, and fallback behavior." },
      { command: "rg \"tool\\(|DynamicTool|DynamicStructuredTool|StructuredTool|HeadlessTool|headlessTool|implement\\(|useStream|ToolRunnableConfig|ResponseFormat|content_and_artifact|ToolOutputType|ToolEventType|InferToolEventFromFunc|InferToolOutputFromFunc|ContentAndArtifact|ToolReturnType|ToolInputSchemaBase|ToolInputSchemaInputType|ToolInputSchemaOutputType|StructuredToolCallInput|ToolCallInput|StructuredToolInterface|responseFormat|defaultConfig|verboseParsingErrors|extras|_formatToolOutput|returnDirect|toolCallId|config\\.toolCall|convertToOpenAIFunction|convertToOpenAITool|FunctionDefinition|ToolDefinition|RunnableToolLike|isLangChainTool|isStructuredTool|isStructuredToolParams|isRunnableToolLike|strict|fieldsCopy|parameters|toJsonSchema|_jsonSchemaCache|canCache|StandardJSONSchemaV1|interopZodObjectStrict|zodToJsonSchema|toJSONSchema|createAgent|AgentExecutor|bindTools|tool_choice|tools:|@langchain/mcp-adapters|loadMcpTools|ToolHooks|beforeToolCall|afterToolCall|CallToolResult|ToolMessage|Command|client\\.fork|outputHandling\" src app server packages", purpose: "Find tool calling, typed output/response-format boundaries, OpenAI tool/function schema conversion, JSON schema cache paths, headless client-tool boundaries, MCP adapter hooks, agent orchestration, and tool schema boundaries." },
      { command: "rg \"createMiddleware|wrapModelCall|wrapToolCall|beforeModel|afterModel|beforeAgent|afterAgent|stateSchema|contextSchema|humanInTheLoopMiddleware|interruptOn|modelRetryMiddleware|toolRetryMiddleware|piiMiddleware|openAIModerationMiddleware|anthropicPromptCachingMiddleware|dynamicSystemPromptMiddleware|summarizationMiddleware|contextEditingMiddleware|ClearToolUsesEdit|llmToolSelectorMiddleware|modelCallLimitMiddleware|toolCallLimitMiddleware|cache_control|threadLimit|runLimit|maxTools\" src app server packages", purpose: "Find LangChain agent middleware hooks, state/context schema, HITL review gates, retry middleware, PII controls, moderation, prompt caching, budget limits, and context controls." },
      { command: "rg \"VectorStore|asRetriever|Retriever|BaseRetrieverInterface|createRetrieverTool|CallbackManagerForToolRun|formatDocumentsAsString|DynamicStructuredToolInput|Embeddings|TextSplitter|DocumentLoader|retrieval|RAG\" src app server packages", purpose: "Map retrieval, retriever tools, callback child spans, document formatting, embeddings, vector stores, and document loading paths." },
      { command: "rg \"StructuredOutputParser|createContentParser|createFunctionCallingParser|FunctionCallingParserConstructor|assembleStructuredOutputPipeline|includeRaw|parserAssign|parserNone|parsedWithFallback|JsonOutputKeyToolsParser|returnSingle|StandardSchemaOutputParser|SerializableSchema|isSerializableSchema|InteropZodType|isInteropZodSchema|BaseLLMOutputParser|BaseOutputParser|BaseTransformOutputParser|BaseCumulativeTransformOutputParser|OutputParserException|FormatInstructionsOptions|parseResultWithPrompt|parseWithPrompt|getFormatInstructions|parsePartialResult|JsonOutputParser|StringOutputParser|BytesOutputParser|ListOutputParser|CommaSeparatedListOutputParser|CustomListOutputParser|NumberedListOutputParser|MarkdownListOutputParser|XMLOutputParser|StandardSchemaOutputParser|OutputFunctionsParser|JsonOutputFunctionsParser|JsonKeyOutputFunctionsParser|JsonOutputToolsParser|JsonOutputKeyToolsParser|StructuredPrompt|fromMessagesAndSchema|withStructuredOutput|RunnableBinding|responseFormat|structuredResponse|toolStrategy|providerStrategy|ToolStrategy|ProviderStrategy|transformResponseFormat|handleError|toolMessageContent|zod|json_schema|JsonOutputParser|OutputParser\" src app server packages", purpose: "Review structured prompt output binding, agent responseFormat strategies, parser validation, and retry/error handling coverage." },
      { command: "rg \"\\.stream\\(|streamEvents|streamLog|ChatModelStream|TextContentStream|ToolCallsStream|ReasoningContentStream|UsageMetadataStream|ReplayBuffer|applyDelta|getEventDelta|getReasoningDelta|isReasoningContent|normalizeUsage|parseToolArgs|standardizeToolBlock|BaseCallbackHandler|CallbackManager|CallbackManagerForLLMRun|CallbackManagerForChainRun|CallbackManagerForToolRun|CallbackManagerForRetrieverRun|dispatchCustomEvent|EventStreamCallbackHandler|LogStreamCallbackHandler|RunCollectorCallbackHandler|RootListenersTracer|streamTransformers|StreamTransformer|StreamChannel|createToolCallTransformer|toolCalls|streamMode|text/event-stream|convertToHttpEventStream|EventStreamContentType|EventSourceMessage|getBytes|getLines|getMessages|convertEventStreamToIterableReadableDataStream|IterableReadableStream|fromReadableStream|controller.enqueue|event: data|event: end|content-block-delta|tool-started|callbacks|LangSmith|LANGSMITH|traceable|tokenUsage|retry|fallback|moderation|rateLimit\" src app server packages", purpose: "Check streaming, typed chat model substreams, delta assembly, callback managers, stream tracers, agent stream projections, callbacks, observability, retries, and safety handling." }
    ],
    learnerNextSteps: [
      "먼저 ModelProfile, maxInputTokens, maxOutputTokens, imageInputs, imageUrlInputs, pdfInputs, audioInputs, videoInputs, imageToolMessage, pdfToolMessage, reasoningOutput, imageOutputs, audioOutputs, videoOutputs, toolCalling, toolChoice, structuredOutput, BaseChatModel, BaseChatModelCallOptions, BaseLanguageModel, streamV2, _streamChatModelEvents, _generateUncached, _generateCached, generatePrompt, _getSerializedCacheKeyParametersForCall, cache.lookup, cache.update, RUN_KEY, LLMResult, Generation, GenerationChunk, GenerationChunkFields, ChatGeneration, ChatGenerationChunk, ChatGenerationChunkFields, ChatResult, generationInfo, llmOutput, generations, initChatModel, ConfigurableModel, modelProvider, configurableFields, configPrefix, ChatOpenAI, ChatAnthropic, AI SDK, OpenAI client, Ollama 같은 model capability profile, base chat model 실행/cache/output 경계, LLM result/generation metadata, model routing/provider, model name 설정을 찾으세요.",
      "ChatPromptTemplate, PromptTemplate, FewShotPromptTemplate, FewShotChatMessagePromptTemplate, PipelinePromptTemplate, pipelinePrompts, finalPrompt, computeInputValues, formatPipelinePrompts, StructuredPrompt, StructuredPromptInput, fromMessagesAndSchema, DictPromptTemplate, TypedPromptInputValues, _getInputVariables, _insertInputVariables, inputVariables, lc_serializable, BasePromptTemplate, BasePromptTemplateInput, BaseStringPromptTemplate, PromptValueReturnType, formatPromptValue, mergePartialAndUserVariables, lc_attributes, outputParser, StringPromptValue, SerializedPromptTemplate, SerializedFewShotTemplate, SerializedBasePromptTemplate, input_variables, template_format, serialize, deserialize, schema, method, jsonMode, jsonSchema, functionMode, RunnableBinding, withStructuredOutput, BaseMessagePromptTemplate, BaseChatPromptTemplate, BaseMessageStringPromptTemplate, ChatMessagePromptTemplate, HumanMessagePromptTemplate, AIMessagePromptTemplate, SystemMessagePromptTemplate, ImagePromptTemplate, ImagePromptTemplateInput, ImagePromptValue, ImageContent, ContentBlock, additionalContentFields, detail, MessageContentComplex, DataContentBlock, BaseDataContentBlock, URLContentBlock, Base64ContentBlock, PlainTextContentBlock, IDContentBlock, isDataContentBlock, isURLContentBlock, isBase64ContentBlock, isPlainTextContentBlock, isIDContentBlock, convertToOpenAIImageBlock, parseMimeType, parseBase64DataUrl, ProviderFormatTypes, StandardContentBlockConverter, convertToProviderContentBlock, convertToStandardContentBlock, convertToV1FromDataContentBlock, convertToV1FromDataContent, isOpenAIDataBlock, convertToV1FromOpenAIDataBlock, convertToV1FromChatCompletions, convertToV1FromChatCompletionsChunk, convertToV1FromChatCompletionsInput, convertToV1FromResponses, convertToV1FromResponsesChunk, convertToV1FromAnthropicContentBlock, convertToV1FromAnthropicInput, convertToV1FromAnthropicMessage, convertAnthropicAnnotation, StandardContentBlockTranslator, contentBlocksFromNonStringFirst, mergeContent, tool_call, server_tool_call, reasoning, citation, non_standard, mime_type, source_type, fileId, metadata, convertToV1FromOpenRouterMessage, ChatOpenRouterTranslator, reasoning_content, reasoning_details, convertToV1FromGroqMessage, ChatGroqTranslator, <think>, convertToV1FromOllamaMessage, ChatOllamaTranslator, convertToV1FromDeepSeekMessage, ChatDeepSeekTranslator, convertToV1FromXAIMessage, ChatXAITranslator, ChatGoogleGenAITranslator, ChatGoogleTranslator, thinking, thoughtSignature, inlineData, functionCall, functionResponse, fileData, executableCode, codeExecutionResult, convertToV1FromChatBedrockConverseInput, convertToV1FromChatBedrockConverseMessage, ChatBedrockConverseTranslator, citations_content, citationsContent, guard_content, cache_point, documentChar, documentPage, documentChunk, TemplateFormat, templateFormat, parseTemplate, renderTemplate, checkValidTemplate, validateTemplate, INVALID_PROMPT_INPUT, mustache, f-string, image_url, _coerceMessagePromptTemplateLike, isMessagesPlaceholder, _parseImagePrompts, promptMessages, flattenedMessages, examplePrompt, exampleSeparator, partialVariables, SystemMessage, HumanMessage, MessagesPlaceholder로 prompt, base/string prompt, serialized prompt, image prompt, pipeline prompt, structured prompt, dict prompt, chat message prompt internals, template format/parser/renderer/validation, few-shot selector, message history가 어떻게 조립되는지 확인하세요.",
      "RunnableSequence, RunnableLambda, RunnablePassthrough, RunnableBranch/BranchLike, RouterRunnable/RouterInput, actualInput/missingKey, _getOptionsList/returnExceptions/batchSize, RunnableBinding/RunnableBindingArgs, configFactories, withListeners, RunnableEach, RunnableRetry, RunnableWithFallbacks, RunnableAssign, RunnablePick, RunnableMapLike, _coerceToRunnable/_coerceToDict, streamLog, streamEvents, RunnableWithMessageHistory, RunnableWithMessageHistoryInputs, GetSessionHistoryCallable, _getInputMessages, _getOutputMessages, _enterHistory, _exitHistory, _mergeConfig, configurable.messageHistory, existingMessages.length, inputMessages.slice, RunnableConfig, ensureConfig, mergeConfigs, patchConfig, pickRunnableConfigKeys, getCallbackManagerForConfig, AsyncLocalStorageProviderSingleton, runWithConfig, getRunnableConfig, consumeIteratorInContext, consumeAsyncIterableInContext, recursionLimit, runName/runId, maxConcurrency, timeoutMs, AbortSignal, configurable, store, BaseChatMessageHistory, getMessageHistory, inputMessagesKey, outputMessagesKey, historyMessagesKey, messageHistory, sessionId, _coerceToolCall, isSerializedConstructor, SerializedConstructor, _constructMessageFromParams, coerceMessageLikeToMessage, _contentBlockToString, getBufferString, mapV1MessageToStoredMessage, StoredMessage, StoredMessageV1, mapStoredMessageToChatMessage, mapStoredMessagesToChatMessages, mapChatMessagesToStoredMessages, toDict, filterMessages, FilterMessagesFields, includeNames/excludeNames, includeTypes/excludeTypes, includeIds/excludeIds, mergeMessageRuns, convertToChunk, _chunkToMsg, trimMessages, TrimMessagesFields, maxTokens, tokenCounter, allowPartial, endOn/startOn, includeSystem, textSplitter, BaseMessageChunk, isBaseMessageChunk, AIMessageChunk, AIMessageChunkFields, mergeResponseMetadata, mergeUsageMetadata, UsageMetadata, input_token_details, output_token_details, pipe(), invoke(), batch(), asTool(), withRetry(), withFallbacks()로 LCEL 실행 경계, 분기, router key dispatch/batch/stream, binding/listener, retry/fallback, assign/pick/map-key callback, streamLog/streamEvents, runnable config 전파, async-local context, 대화 기록 저장/설정, 메시지 coercion/storage/buffer, 메시지 필터링/병합/트리밍/청크 변환, 응답/사용량 메타데이터 병합 경계를 확인하세요.",
      "tool(), StructuredTool, DynamicStructuredTool, ResponseFormat, content_and_artifact, ContentAndArtifact, ToolReturnType, ToolOutputType, ToolEventType, InferToolEventFromFunc, InferToolOutputFromFunc, ToolInputSchemaBase, StructuredToolCallInput, ToolCallInput, StructuredToolInterface, responseFormat, defaultConfig, verboseParsingErrors, extras, _formatToolOutput, returnDirect, toolCallId, config.toolCall, convertToOpenAIFunction, convertToOpenAITool, FunctionDefinition, ToolDefinition, RunnableToolLike, isLangChainTool, isStructuredTool, isStructuredToolParams, isRunnableToolLike, strict, fieldsCopy, parameters, toJsonSchema, _jsonSchemaCache, canCache, StandardJSONSchemaV1, interopZodObjectStrict, zodToJsonSchema, toJSONSchema, HeadlessTool, headlessTool metadata, implement(), useStream, bindTools, createAgent, AgentExecutor, loadMcpTools가 있으면 tool schema, typed output/response-format, OpenAI function/tool schema conversion, JSON schema cache, direct output bypass, client-side implementation, interrupt payload, MCP adapter hook, side effect 경계를 확인하세요.",
      "createMiddleware, wrapModelCall, wrapToolCall, before/after hooks, stateSchema, contextSchema, humanInTheLoopMiddleware, modelRetryMiddleware, toolRetryMiddleware, piiMiddleware, openAIModerationMiddleware, anthropicPromptCachingMiddleware, dynamicSystemPromptMiddleware, summarizationMiddleware, contextEditingMiddleware, llmToolSelectorMiddleware, modelCallLimitMiddleware, toolCallLimitMiddleware가 있으면 agent 운영 정책과 안전/비용/컨텍스트 정책을 분리해 보세요.",
      "VectorStore, Retriever, BaseRetrieverInterface, createRetrieverTool, CallbackManagerForToolRun, formatDocumentsAsString, Embeddings, TextSplitter, DocumentLoader가 있으면 RAG 입력 데이터, retriever tool schema, callback child span, 검색 파라미터를 같이 보세요.",
      "StructuredPrompt, fromMessagesAndSchema, withStructuredOutput, RunnableBinding, StructuredOutputParser, createContentParser, createFunctionCallingParser, assembleStructuredOutputPipeline, includeRaw, raw/parsed, parserAssign, parsedWithFallback, BaseLLMOutputParser, BaseOutputParser, BaseTransformOutputParser, BaseCumulativeTransformOutputParser, JsonOutputParser, StringOutputParser, BytesOutputParser, ListOutputParser, XMLOutputParser, StandardSchemaOutputParser, OutputFunctionsParser, JsonOutputToolsParser, responseFormat, structuredResponse, toolStrategy, providerStrategy, transformResponseFormat, Zod, JSON Schema, output parser로 structured prompt binding과 agent 구조화 응답 전략이 있는지 확인하세요.",
      "stream, streamEvents, streamLog, ChatModelStream, TextContentStream, ToolCallsStream, ReasoningContentStream, UsageMetadataStream, ReplayBuffer, applyDelta, getEventDelta, standardizeToolBlock, BaseCallbackHandler, CallbackManager, CallbackManagerForLLMRun, CallbackManagerForChainRun, CallbackManagerForToolRun, CallbackManagerForRetrieverRun, dispatchCustomEvent, EventStreamCallbackHandler, LogStreamCallbackHandler, RunCollectorCallbackHandler, RootListenersTracer, streamTransformers, StreamChannel, toolCalls, callbacks, LangSmith, token usage, retry/fallback/moderation/rate limit, PII redaction/mask/hash/block, prompt cache, call limit, context summarization/editing, configurable model routing 신호로 typed sub-stream, content delta assembly, tool-call stream, 운영 가시성과 실패 대응을 분리해서 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 모델 호출, agent run, vector search, prompt 품질, 비용/지연시간은 원본 프로젝트 테스트, mock, eval, trace에서 별도 확인하세요."
    ]
  };
}

type LlmReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function llmReadinessSourceFiles(walk: WalkResult): Promise<LlmReadinessSourceFile[]> {
  const files: LlmReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !llmReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!llmReadinessPathSignal(file.relPath) && !llmReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function llmReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return llmReadinessPathSignal(filePath)
    || /^(package\.json|langchain\.(json|ya?ml|js|mjs|cjs|ts)|mcp\.(json|ya?ml|js|mjs|cjs|ts)|ai\.(config\.)?(json|ya?ml|js|mjs|cjs|ts)|openai\.(json|ya?ml|js|mjs|cjs|ts))$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function llmReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(ai|llm|llms|agent|agents|prompt|prompts|rag|retrieval|retriever|retrievers|vector|vectors|embedding|embeddings|tools?|langchain|langgraph|langsmith|mcp|openai|anthropic|ollama|llamaindex)(\/|\.|-|_|$)|package\.json$/i.test(filePath);
}

function llmReadinessContentBlockSignal(text: string): boolean {
  return /\b(MessageContentText|MessageContentImageUrl|MessageContentComplex|DataContentBlock|BaseDataContentBlock|URLContentBlock|Base64ContentBlock|PlainTextContentBlock|IDContentBlock|isDataContentBlock|isURLContentBlock|isBase64ContentBlock|isPlainTextContentBlock|isIDContentBlock|convertToOpenAIImageBlock|parseMimeType|parseBase64DataUrl|ProviderFormatTypes|StandardContentBlockConverter|convertToProviderContentBlock|convertToStandardContentBlock|convertToV1FromDataContentBlock|convertToV1FromDataContent|isOpenAIDataBlock|convertToV1FromOpenAIDataBlock|convertToV1FromChatCompletions|convertToV1FromChatCompletionsChunk|convertToV1FromChatCompletionsInput|convertToV1FromResponses|convertToV1FromResponsesChunk|convertToV1FromAnthropicContentBlock|convertToV1FromAnthropicInput|convertToV1FromAnthropicMessage|convertAnthropicAnnotation|StandardContentBlockTranslator|contentBlocksFromNonStringFirst|mergeContent|tool_call|server_tool_call|reasoning|citation|non_standard|mime_type|source_type|fileId|metadata|convertToV1FromOpenRouterMessage|ChatOpenRouterTranslator|reasoning_content|reasoning_details|convertToV1FromGroqMessage|ChatGroqTranslator|convertToV1FromOllamaMessage|ChatOllamaTranslator|convertToV1FromDeepSeekMessage|ChatDeepSeekTranslator|convertToV1FromXAIMessage|ChatXAITranslator|ChatGoogleGenAITranslator|ChatGoogleTranslator|thinking|thoughtSignature|inlineData|functionCall|functionResponse|fileData|executableCode|codeExecutionResult|convertToV1FromChatBedrockConverseInput|convertToV1FromChatBedrockConverseMessage|ChatBedrockConverseTranslator|citations_content|citationsContent|guard_content|cache_point|documentChar|documentPage|documentChunk)\b|<think>/i.test(text);
}

function llmReadinessContentSignal(text: string): boolean {
  return /\b(ModelProfile|maxInputTokens|maxOutputTokens|imageInputs|imageUrlInputs|pdfInputs|audioInputs|videoInputs|imageToolMessage|pdfToolMessage|reasoningOutput|imageOutputs|audioOutputs|videoOutputs|toolCalling|toolChoice|structuredOutput|BaseChatModel|BaseChatModelParams|BaseChatModelCallOptions|BaseLanguageModel|BaseLanguageModelCallOptions|BaseLanguageModelInput|BaseLanguageModelParams|LangSmithParams|BindToolsInput|ToolChoice|disableStreaming|outputVersion|LC_OUTPUT_VERSION|MessageOutputVersion|streamV2|_streamChatModelEvents|_streamResponseChunks|_streamIterator|_generateUncached|_generateCached|generatePrompt|invocationParams|_modelType|_llmType|_combineLLMOutput|_separateRunnableConfigFromCallOptionsCompat|handleChatModelStart|handleChatModelStreamEvent|callbackHandlerPrefersChatModelStreamEvents|callbackHandlerPrefersStreaming|_getSerializedCacheKeyParametersForCall|BaseCache|InMemoryCache|defaultHashKeyEncoder|HashKeyEncoder|sha256|serializeGeneration|deserializeStoredGeneration|StoredGeneration|mapStoredMessageToChatMessage|toDict|makeDefaultKeyEncoder|keyEncoder|GLOBAL_MAP|missingPromptIndices|RUN_KEY|castStandardMessageContent|ModelAbortError|LLMResult|GenerationChunk|GenerationChunkFields|ChatGeneration|ChatGenerationChunk|ChatGenerationChunkFields|ChatResult|generationInfo|ChatOpenAI|OpenAIEmbeddings|ChatAnthropic|ChatGoogle|Ollama|initChatModel|ConfigurableModel|MODEL_PROVIDER_CONFIG|SUPPORTED_PROVIDERS|ChatModelProvider|getChatModelByClassName|_initChatModelHelper|_inferModelProvider|modelProvider|configurableFields|configPrefix|RunnableConfig|DEFAULT_RECURSION_LIMIT|_getTracingInheritableMetadataFromConfig|CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS|PRIMITIVES|getCallbackManagerForConfig|mergeConfigs|ensureConfig|patchConfig|pickRunnableConfigKeys|AsyncLocalStorageProviderSingleton|recursionLimit|runId|runName|maxConcurrency|AbortSignal|timeoutMs|consumeIteratorInContext|consumeAsyncIterableInContext|runWithConfig|getRunnableConfig|ChatPromptTemplate|PromptTemplate|FewShotPromptTemplate|FewShotChatMessagePromptTemplate|PipelinePromptTemplate|PipelinePromptParams|PipelinePromptTemplateInput|pipelinePrompts|finalPrompt|computeInputValues|intermediateValues|extractRequiredInputValues|formatPipelinePrompts|StructuredPrompt|StructuredPromptInput|fromMessagesAndSchema|isWithStructuredOutput|isRunnableBinding|RunnableBinding|lc_namespace|lc_aliases|schema_|DictPromptTemplate|TypedPromptInputValues|_getInputVariables|_insertInputVariables|lc_serializable|BasePromptTemplate|BasePromptTemplateInput|BaseStringPromptTemplate|PromptValueReturnType|formatPromptValue|mergePartialAndUserVariables|lc_attributes|outputParser|runType|_getPromptType|StringPromptValue|StringPromptValueInterface|SerializedPromptTemplate|SerializedFewShotTemplate|SerializedBasePromptTemplate|input_variables|template_format|serialize|deserialize|load|LoadOptions|secretsMap|secretsFromEnv|optionalImportsMap|optionalImportEntrypoints|importMap|maxDepth|DEFAULT_MAX_DEPTH|reviver|SerializedSecret|SerializedNotImplemented|getEnvironmentVariable|LC_ESCAPED_KEY|escapeObject|needsEscaping|serializeValue|serializeLcObject|lc_secrets|toJSONNotImplemented|replaceSecrets|keyToJson|keyFromJson|BaseMessagePromptTemplate|BaseChatPromptTemplate|BaseMessageStringPromptTemplate|ChatMessagePromptTemplate|HumanMessagePromptTemplate|AIMessagePromptTemplate|SystemMessagePromptTemplate|ImagePromptTemplate|ImagePromptTemplateInput|ImagePromptValue|ImageContent|ContentBlock|additionalContentFields|detail|_StringImageMessagePromptTemplate|BaseExampleSelector|LengthBasedExampleSelector|SemanticSimilarityExampleSelector|BasePromptSelector|ConditionalPromptSelector|BaseGetPromptAsyncOptions|getPromptAsync|defaultPrompt|conditionals|isLLM|isChatModel|BaseLanguageModelInterface|exampleSelector|examplePrompt|exampleSeparator|partialVariables|TemplateFormat|ParsedTemplateNode|ParsedFStringNode|parseFString|parseMustache|interpolateFString|interpolateMustache|DEFAULT_FORMATTER_MAPPING|DEFAULT_PARSER_MAPPING|renderTemplate|parseTemplate|checkValidTemplate|INVALID_PROMPT_INPUT|templateFormat|validateTemplate|_coerceMessagePromptTemplateLike|isMessagesPlaceholder|_parseImagePrompts|promptMessages|flattenedMessages|flattenedPartialVariables|SystemMessage|HumanMessage|MessagesPlaceholder|RunnableSequence|RunnableLambda|RunnablePassthrough|RunnableBranch|BranchLike|RouterRunnable|RouterInput|RunnableBinding|RunnableBindingArgs|configFactories|RunnableEach|RunnableRetry|RunnableRetryFailedAttemptHandler|RunnableWithFallbacks|RunnableAssign|RunnablePick|RunnableMap|RunnableMapLike|_coerceToRunnable|_coerceToDict|streamLog|RunLogPatch|streamed_output|streamEvents|convertChunksToEvents|ChatModelStreamEvent|ContentBlockDelta|activeBlocks|nextBlockIndex|getAdditionalKwargs|extractImageBlocksFromToolOutputs|getAudioPayload|MIME_TYPE_BY_AUDIO_FORMAT|MIME_TYPE_BY_IMAGE_FORMAT|AudioStreamState|throwIfAborted|ChatModelStream|TextContentStream|ToolCallsStream|ReasoningContentStream|UsageMetadataStream|ReplayBuffer|applyDelta|getEventDelta|getReasoningDelta|isReasoningContent|normalizeUsage|parseToolArgs|standardizeToolBlock|RunnableWithMessageHistory|RunnableWithMessageHistoryInputs|GetSessionHistoryCallable|_getInputMessages|_getOutputMessages|_enterHistory|_exitHistory|_mergeConfig|configurable.messageHistory|existingMessages.length|inputMessages.slice|HumanMessage|AIMessage|isBaseMessage|generations[0][0].message|BaseChatMessageHistory|BaseListChatMessageHistory|InMemoryChatMessageHistory|getMessageHistory|inputMessagesKey|outputMessagesKey|historyMessagesKey|messageHistory|_coerceToolCall|isSerializedConstructor|SerializedConstructor|_constructMessageFromParams|coerceMessageLikeToMessage|_contentBlockToString|getBufferString|mapV1MessageToStoredMessage|StoredMessage|StoredMessageV1|mapStoredMessageToChatMessage|mapStoredMessagesToChatMessages|mapChatMessagesToStoredMessages|toDict|filterMessages|FilterMessagesFields|includeNames|excludeNames|includeTypes|excludeTypes|includeIds|excludeIds|mergeMessageRuns|convertToChunk|_chunkToMsg|TrimMessagesFields|maxTokens|tokenCounter|allowPartial|endOn|startOn|includeSystem|textSplitter|_trimMessagesHelper|_firstMaxTokens|_lastMaxTokens|_switchTypeToMessage|_MSG_CHUNK_MAP|BaseMessageChunk|isBaseMessageChunk|AIMessageChunk|AIMessageChunkFields|HumanMessageChunk|SystemMessageChunk|FunctionMessageChunk|ChatMessageChunk|mergeResponseMetadata|mergeUsageMetadata|UsageMetadata|input_token_details|output_token_details|StringOutputParser|StructuredOutputParser|JsonOutputParser|BaseLLMOutputParser|BaseOutputParser|BaseTransformOutputParser|BaseCumulativeTransformOutputParser|OutputParserException|FormatInstructionsOptions|parseResultWithPrompt|parseWithPrompt|getFormatInstructions|parsePartialResult|parseJsonMarkdown|parsePartialJson|BytesOutputParser|ListOutputParser|CommaSeparatedListOutputParser|CustomListOutputParser|NumberedListOutputParser|MarkdownListOutputParser|XMLOutputParser|XML_FORMAT_INSTRUCTIONS|parseXMLMarkdown|StandardSchemaOutputParser|fromSerializableSchema|OutputFunctionsParser|JsonOutputFunctionsParser|JsonKeyOutputFunctionsParser|JsonOutputToolsParser|JsonOutputKeyToolsParser|ParsedToolCall|parseToolCall|convertLangChainToolCallToOpenAI|makeInvalidToolCall|withStructuredOutput|responseFormat|structuredResponse|ToolStrategy|ProviderStrategy|TypedToolStrategy|toolStrategy|providerStrategy|transformResponseFormat|ResponseFormatUndefined|hasSupportForJsonSchemaOutput|StructuredOutputParsingError|MultipleStructuredOutputsError|ToolStrategyOptions|toolMessageContent|ResponseFormat|content_and_artifact|ToolOutputType|ToolEventType|InferToolEventFromFunc|InferToolOutputFromFunc|ContentAndArtifact|ToolReturnType|ToolInputSchemaBase|ToolInputSchemaInputType|ToolInputSchemaOutputType|StructuredToolCallInput|ToolCallInput|StructuredToolInterface|defaultConfig|verboseParsingErrors|extras|_formatToolOutput|returnDirect|toolCallId|config.toolCall|Tool response format|convertToOpenAIFunction|convertToOpenAITool|FunctionDefinition|ToolDefinition|RunnableToolLike|isLangChainTool|isStructuredTool|isStructuredToolParams|isRunnableToolLike|fieldsCopy|ToJSONSchemaParams|_jsonSchemaCache|WeakMap|canCache|cached|StandardJSONSchemaV1|isStandardJsonSchema|isZodSchemaV4|isZodSchemaV3|interopZodTransformInputSchema|interopZodObjectStrict|zodToJsonSchema|toJSONSchema|HeadlessTool|HeadlessToolFields|HeadlessToolImplementation|createHeadlessTool|HeadlessToolOverload|headlessTool|ToolRunnableConfig|createRetrieverTool|BaseRetrieverInterface|CallbackManagerForToolRun|formatDocumentsAsString|DynamicStructuredToolInput|tool\s*\(|StructuredTool|DynamicTool|DynamicStructuredTool|loadMcpTools|ToolHooks|ToolCallRequest|beforeToolCall|afterToolCall|CallToolResult|ToolMessage|Command|createAgent|createMiddleware|humanInTheLoopMiddleware|modelRetryMiddleware|toolRetryMiddleware|piiMiddleware|PIIDetectionError|openAIModerationMiddleware|OpenAIModerationMiddleware|anthropicPromptCachingMiddleware|PromptCachingMiddleware|dynamicSystemPromptMiddleware|summarizationMiddleware|contextEditingMiddleware|ClearToolUsesEdit|llmToolSelectorMiddleware|modelCallLimitMiddleware|toolCallLimitMiddleware|ToolCallLimitExceededError|ModelCallLimitMiddlewareError|wrapModelCall|wrapToolCall|beforeModel|afterModel|beforeAgent|afterAgent|stateSchema|contextSchema|interruptOn|AgentExecutor|createReactAgent|bindTools|AgentRunStream|GraphRunStream|convertChunksToEvents|ChatModelStreamEvent|ContentBlockDelta|activeBlocks|nextBlockIndex|getAdditionalKwargs|extractImageBlocksFromToolOutputs|getAudioPayload|MIME_TYPE_BY_AUDIO_FORMAT|MIME_TYPE_BY_IMAGE_FORMAT|AudioStreamState|throwIfAborted|ChatModelStream|TextContentStream|ToolCallsStream|ReasoningContentStream|UsageMetadataStream|ReplayBuffer|applyDelta|getEventDelta|getReasoningDelta|isReasoningContent|normalizeUsage|parseToolArgs|standardizeToolBlock|StreamTransformer|StreamChannel|createToolCallTransformer|ToolCallProjection|ToolCallStream|isOwnEvent|isHeadlessToolInterruptError|isSerializedToolMessage|normalizeToolOutput|pendingCalls|resolveOutput|rejectOutput|resolveStatus|resolveError|toolCallsLog.close|toolCallsLog.fail|ProtocolEvent|streamTransformers|streamMode|tool-started|tool-finished|tool-error|content-block-delta|content-block-finish|VectorStore|MemoryVectorStore|asRetriever|BaseRetriever|TextSplitter|DocumentLoader|BaseCallbackHandler|CallbackManager|CallbackManagerForLLMRun|CallbackManagerForChainRun|CallbackManagerForToolRun|CallbackManagerForRetrieverRun|dispatchCustomEvent|EventStreamCallbackHandler|LogStreamCallbackHandler|RunCollectorCallbackHandler|RootListenersTracer|streamEvents|LangSmith|traceable|LANGSMITH|tokenUsage|cache_control|REMOVE_ALL_MESSAGES|trimMessages|LLMChain|RetrievalQAChain|withRetry|withFallbacks)\b|cache\.lookup|cache\.update|llmOutput|text\/event-stream|event:\s*data|event:\s*end|\.pipe\s*\(|\.invoke\s*\(|\.batch\s*\(|\.asTool\s*\(|\.implement\s*\(|"(langchain|@langchain\/core|@langchain\/openai|@langchain\/mcp-adapters|@langchain\/langgraph|@modelcontextprotocol\/sdk|ai|openai|@anthropic-ai\/sdk|llamaindex|ollama)"/i.test(text)
    || llmReadinessContentBlockSignal(text);
}

function llmReadinessSetups(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["llmSetups"] {
  const rows: LlmReadinessReport["llmSetups"] = [];
  for (const source of sourceFiles) {
    const modelCount = countMatches(source.text, /\b(ModelProfile|maxInputTokens|maxOutputTokens|imageInputs|imageUrlInputs|pdfInputs|audioInputs|videoInputs|imageToolMessage|pdfToolMessage|reasoningOutput|imageOutputs|audioOutputs|videoOutputs|toolCalling|toolChoice|structuredOutput|BaseChatModel|BaseChatModelParams|BaseChatModelCallOptions|BaseLanguageModel|BaseLanguageModelCallOptions|BaseLanguageModelInput|BaseLanguageModelParams|LangSmithParams|BindToolsInput|ToolChoice|disableStreaming|outputVersion|LC_OUTPUT_VERSION|MessageOutputVersion|streamV2|_streamChatModelEvents|_streamResponseChunks|_streamIterator|_generateUncached|_generateCached|generatePrompt|invocationParams|_modelType|_llmType|_combineLLMOutput|_separateRunnableConfigFromCallOptionsCompat|handleChatModelStart|callbackHandlerPrefersChatModelStreamEvents|callbackHandlerPrefersStreaming|_getSerializedCacheKeyParametersForCall|BaseCache|InMemoryCache|defaultHashKeyEncoder|HashKeyEncoder|sha256|serializeGeneration|deserializeStoredGeneration|StoredGeneration|mapStoredMessageToChatMessage|toDict|makeDefaultKeyEncoder|keyEncoder|GLOBAL_MAP|missingPromptIndices|RUN_KEY|castStandardMessageContent|ModelAbortError|LLMResult|GenerationChunk|GenerationChunkFields|ChatGeneration|ChatGenerationChunk|ChatGenerationChunkFields|ChatResult|generationInfo|ChatOpenAI|AzureChatOpenAI|OpenAI\(|ChatAnthropic|Anthropic\(|ChatGoogle|GoogleGenerativeAI|Ollama|initChatModel|ConfigurableModel|MODEL_PROVIDER_CONFIG|SUPPORTED_PROVIDERS|ChatModelProvider|getChatModelByClassName|_initChatModelHelper|_inferModelProvider|modelProvider|configurableFields|configPrefix|modelName|temperature|baseURL|apiKey)\b|cache\.lookup|cache\.update|llmOutput|\bmodel\s*:|["'](?:openai|anthropic|google-genai|google-vertexai-web|azure_openai|bedrock|deepseek|xai|cerebras|fireworks|together|perplexity):[^"']+["']/gi);
    const promptCount = countMatches(source.text, /\b(maxInputTokens|imageInputs|imageUrlInputs|pdfInputs|audioInputs|videoInputs|ChatPromptTemplate|PromptTemplate|SystemMessage|HumanMessage|AIMessage|AIMessageChunk|MessagesPlaceholder|fromMessages|fromTemplate|_coerceToolCall|isSerializedConstructor|SerializedConstructor|_constructMessageFromParams|coerceMessageLikeToMessage|_contentBlockToString|getBufferString|mapV1MessageToStoredMessage|StoredMessage|StoredMessageV1|mapStoredMessageToChatMessage|mapStoredMessagesToChatMessages|mapChatMessagesToStoredMessages|toDict|filterMessages|FilterMessagesFields|mergeMessageRuns|trimMessages|TrimMessagesFields|BaseMessageChunk|AIMessageChunkFields|UsageMetadata|FewShotPromptTemplate|FewShotChatMessagePromptTemplate|PipelinePromptTemplate|PipelinePromptParams|PipelinePromptTemplateInput|pipelinePrompts|finalPrompt|computeInputValues|formatPipelinePrompts|StructuredPrompt|StructuredPromptInput|fromMessagesAndSchema|jsonMode|jsonSchema|functionMode|RunnableBinding|DictPromptTemplate|TypedPromptInputValues|_getInputVariables|_insertInputVariables|inputVariables|lc_serializable|BasePromptTemplate|BasePromptTemplateInput|BaseStringPromptTemplate|PromptValueReturnType|formatPromptValue|mergePartialAndUserVariables|lc_attributes|outputParser|runType|_getPromptType|StringPromptValue|StringPromptValueInterface|SerializedPromptTemplate|SerializedFewShotTemplate|SerializedBasePromptTemplate|input_variables|template_format|serialize|deserialize|load|LoadOptions|secretsMap|secretsFromEnv|optionalImportsMap|optionalImportEntrypoints|importMap|maxDepth|DEFAULT_MAX_DEPTH|reviver|SerializedSecret|SerializedNotImplemented|getEnvironmentVariable|LC_ESCAPED_KEY|escapeObject|needsEscaping|serializeValue|serializeLcObject|lc_secrets|toJSONNotImplemented|replaceSecrets|keyToJson|keyFromJson|BaseMessagePromptTemplate|BaseChatPromptTemplate|BaseMessageStringPromptTemplate|ChatMessagePromptTemplate|HumanMessagePromptTemplate|AIMessagePromptTemplate|SystemMessagePromptTemplate|ImagePromptTemplate|ImagePromptTemplateInput|ImagePromptValue|ImageContent|ContentBlock|additionalContentFields|detail|_StringImageMessagePromptTemplate|BaseExampleSelector|LengthBasedExampleSelector|SemanticSimilarityExampleSelector|BasePromptSelector|ConditionalPromptSelector|BaseGetPromptAsyncOptions|getPromptAsync|defaultPrompt|conditionals|isLLM|isChatModel|BaseLanguageModelInterface|exampleSelector|examplePrompt|TemplateFormat|ParsedTemplateNode|parseTemplate|renderTemplate|checkValidTemplate|templateFormat|validateTemplate|promptMessages|flattenedMessages|dynamicSystemPromptMiddleware|summaryPrompt|summaryPrefix)\b/gi)
      + (llmReadinessContentBlockSignal(source.text) ? 1 : 0);
    const toolCount = countMatches(source.text, /\b(toolCalling|toolChoice|imageToolMessage|pdfToolMessage|tool\s*\(|StructuredTool|DynamicTool|DynamicStructuredTool|HeadlessTool|HeadlessToolFields|HeadlessToolImplementation|createHeadlessTool|HeadlessToolOverload|headlessTool|ToolRunnableConfig|ResponseFormat|content_and_artifact|ToolOutputType|ToolEventType|InferToolEventFromFunc|InferToolOutputFromFunc|ContentAndArtifact|ToolReturnType|ToolInputSchemaBase|ToolInputSchemaInputType|ToolInputSchemaOutputType|StructuredToolCallInput|ToolCallInput|StructuredToolInterface|responseFormat|defaultConfig|verboseParsingErrors|extras|_formatToolOutput|returnDirect|toolCallId|config.toolCall|convertToOpenAIFunction|convertToOpenAITool|FunctionDefinition|ToolDefinition|RunnableToolLike|isLangChainTool|isStructuredTool|isStructuredToolParams|isRunnableToolLike|strict|fieldsCopy|parameters|toJsonSchema|ToJSONSchemaParams|_jsonSchemaCache|WeakMap|canCache|cached|StandardJSONSchemaV1|isStandardJsonSchema|isZodSchemaV4|isZodSchemaV3|interopZodTransformInputSchema|interopZodObjectStrict|zodToJsonSchema|toJSONSchema|loadMcpTools|ToolHooks|beforeToolCall|afterToolCall|createMiddleware|wrapToolCall|humanInTheLoopMiddleware|modelRetryMiddleware|toolRetryMiddleware|piiMiddleware|openAIModerationMiddleware|OpenAIModerationMiddleware|anthropicPromptCachingMiddleware|summarizationMiddleware|contextEditingMiddleware|ClearToolUsesEdit|llmToolSelectorMiddleware|modelCallLimitMiddleware|toolCallLimitMiddleware|interruptOn|bindTools|tool_choice|toolCall|ToolMessage|MCP|ModelContextProtocol|tools\s*:)\b|\.implement\s*\(|useStream\s*\(/gi);
    const agentCount = countMatches(source.text, /\b(createAgent|createMiddleware|AgentMiddleware|AgentExecutor|createReactAgent|createOpenAIFunctionsAgent|LangGraph|StateGraph|agent\s*:)\b/gi);
    const retrievalCount = countMatches(source.text, /\b(VectorStore|MemoryVectorStore|asRetriever|Retriever|BaseRetriever|BaseRetrieverInput|BaseRetrieverInterface|_getRelevantDocuments|createRetrieverTool|CallbackManagerForToolRun|CallbackManagerForRetrieverRun|formatDocumentsAsString|retriever\.invoke|handleRetrieverStart|handleRetrieverEnd|handleRetrieverError|parseCallbackConfigArg|ensureConfig|FakeRetriever|BaseDocumentTransformer|MappingDocumentTransformer|transformDocuments|_transformDocument|BaseDocumentCompressor|compressDocuments|isBaseDocumentCompressor|BaseDocumentLoader|DocumentLoader|load\(\)|retrieval|RAG|TextSplitter|RecursiveCharacterTextSplitter)\b/gi);
    const embeddingCount = countMatches(source.text, /\b(Embeddings|OpenAIEmbeddings|embedQuery|embedDocuments|embeddingModel|vectorstore|vectorStore)\b/gi);
    const outputCount = countMatches(source.text, /\b(maxOutputTokens|reasoningOutput|imageOutputs|audioOutputs|videoOutputs|structuredOutput|LLMResult|Generation|GenerationChunk|GenerationChunkFields|ChatGeneration|ChatGenerationChunk|ChatGenerationChunkFields|ChatResult|RUN_KEY|generationInfo|llmOutput|generations|tokenUsage|promptTokens|completionTokens|totalTokens|StructuredOutputParser|createContentParser|createFunctionCallingParser|FunctionCallingParserConstructor|assembleStructuredOutputPipeline|includeRaw|parserAssign|parserNone|parsedWithFallback|JsonOutputKeyToolsParser|returnSingle|StandardSchemaOutputParser|SerializableSchema|isSerializableSchema|InteropZodType|isInteropZodSchema|BaseLLMOutputParser|BaseOutputParser|BaseTransformOutputParser|BaseCumulativeTransformOutputParser|OutputParserException|FormatInstructionsOptions|parseResultWithPrompt|parseWithPrompt|getFormatInstructions|parsePartialResult|JsonOutputParser|StringOutputParser|BytesOutputParser|ListOutputParser|CommaSeparatedListOutputParser|CustomListOutputParser|NumberedListOutputParser|MarkdownListOutputParser|XMLOutputParser|StandardSchemaOutputParser|OutputFunctionsParser|JsonOutputFunctionsParser|JsonKeyOutputFunctionsParser|JsonOutputToolsParser|JsonOutputKeyToolsParser|StructuredPrompt|StructuredPromptInput|StringOutputParser|JsonOutputParser|withStructuredOutput|RunnableBinding|responseFormat|structuredResponse|ToolStrategy|ProviderStrategy|TypedToolStrategy|toolStrategy|providerStrategy|transformResponseFormat|ResponseFormatUndefined|hasSupportForJsonSchemaOutput|StructuredOutputParsingError|MultipleStructuredOutputsError|ToolStrategyOptions|toolMessageContent|ResponseFormat|content_and_artifact|ToolOutputType|ToolEventType|InferToolEventFromFunc|InferToolOutputFromFunc|ContentAndArtifact|ToolReturnType|ToolInputSchemaBase|ToolInputSchemaInputType|ToolInputSchemaOutputType|StructuredToolCallInput|ToolCallInput|StructuredToolInterface|defaultConfig|verboseParsingErrors|extras|_formatToolOutput|returnDirect|toolCallId|config.toolCall|Tool response format|convertToOpenAIFunction|convertToOpenAITool|FunctionDefinition|ToolDefinition|RunnableToolLike|isLangChainTool|isStructuredTool|isStructuredToolParams|isRunnableToolLike|fieldsCopy|ToJSONSchemaParams|_jsonSchemaCache|WeakMap|canCache|cached|StandardJSONSchemaV1|isStandardJsonSchema|isZodSchemaV4|isZodSchemaV3|interopZodTransformInputSchema|interopZodObjectStrict|zodToJsonSchema|toJSONSchema|OutputParser|zod|z\.object|json_schema|JSONSchema|structuredContent|mcp_structured_content|ExtendedArtifact|ExtendedContent|function_call|tool_calls|argsSchema|allowedDecisions|reviewConfigs)\b/gi);
    const streamingCount = countMatches(source.text, /\b(\.stream\s*\(|streamV2|_streamChatModelEvents|_streamResponseChunks|_streamIterator|streamEvents|streamLog|for await|callbacks|GenerationChunk|GenerationChunkFields|ChatGenerationChunk|ChatGenerationChunkFields|BaseMessageChunk|concat\(|BaseCallbackHandler|CallbackManager|CallbackManagerForLLMRun|CallbackManagerForChainRun|CallbackManagerForToolRun|CallbackManagerForRetrieverRun|handleLLMNewToken|handleChatModelStreamEvent|dispatchCustomEvent|EventStreamCallbackHandler|LogStreamCallbackHandler|LogStreamCallbackHandlerInput|RunLogPatch|RunLog|LogEntry|RunState|JSONPatchOperation|StreamEvent|on_llm_new_token|AgentRunStream|GraphRunStream|convertChunksToEvents|ChatModelStreamEvent|ContentBlockDelta|activeBlocks|nextBlockIndex|getAdditionalKwargs|extractImageBlocksFromToolOutputs|getAudioPayload|MIME_TYPE_BY_AUDIO_FORMAT|MIME_TYPE_BY_IMAGE_FORMAT|AudioStreamState|throwIfAborted|ChatModelStream|TextContentStream|ToolCallsStream|ReasoningContentStream|UsageMetadataStream|ReplayBuffer|applyDelta|applyPatch|getEventDelta|getReasoningDelta|isReasoningContent|normalizeUsage|parseToolArgs|standardizeToolBlock|StreamTransformer|StreamChannel|createToolCallTransformer|ToolCallProjection|ToolCallStream|isOwnEvent|isHeadlessToolInterruptError|isSerializedToolMessage|normalizeToolOutput|pendingCalls|resolveOutput|rejectOutput|resolveStatus|resolveError|toolCallsLog.close|toolCallsLog.fail|ProtocolEvent|streamTransformers|streamMode|convertToHttpEventStream|EventStreamContentType|EventSourceMessage|getBytes|getLines|getMessages|convertEventStreamToIterableReadableDataStream|IterableReadableStream|fromReadableStream|ReadableStream|TransformStream|receiveStream|tapOutputIterable|_getStandardizedInputs|_getStandardizedOutputs|isChatGenerationChunk|controller\.enqueue|BaseTransformOutputParser|BaseCumulativeTransformOutputParser|parsePartialResult|_transformStreamWithConfig|tool-started|tool-finished|tool-error|content-block-delta|content-block-finish|usage_metadata|UsageMetadata|RunnableConfig|AsyncLocalStorageProviderSingleton|consumeIteratorInContext|consumeAsyncIterableInContext|runWithConfig|getRunnableConfig|timeoutMs|AbortSignal|input_tokens|output_tokens|total_tokens)\b|text\/event-stream/gi);
    const observabilityCount = countMatches(source.text, /\b(LangSmith|LANGSMITH|traceable|tracing|runName|metadata|tags|tokenUsage|usage_metadata|llmOutput|promptTokens|completionTokens|totalTokens|callbacks|RunCollectorCallbackHandler|RootListenersTracer|tracedRuns|onRunCreate|onRunUpdate|handleChatModelStart|handleLLMEnd|handleLLMError|handleChatModelStreamEvent|callbackHandlerPrefersChatModelStreamEvents|callbackHandlerPrefersStreaming|inheritableMetadata|inheritableTags|runId|RUN_KEY|timeoutMs|_getTracingInheritableMetadataFromConfig|CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS|getCallbackManagerForConfig)\b/gi);
    const hasSetupSignal = modelCount + promptCount + toolCount + agentCount + retrievalCount + embeddingCount + outputCount + streamingCount + observabilityCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: llmReadinessProvider(source),
      modelCount,
      promptCount,
      toolCount,
      agentCount,
      retrievalCount,
      embeddingCount,
      outputCount,
      streamingCount,
      observabilityCount,
      readiness: modelCount > 0 && (promptCount > 0 || toolCount > 0 || retrievalCount > 0 || outputCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains models ${modelCount}, prompts ${promptCount}, tools ${toolCount}, agents ${agentCount}, retrieval ${retrievalCount}, embeddings ${embeddingCount}, output ${outputCount}, streaming ${streamingCount}, observability ${observabilityCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function llmReadinessProvider(source: LlmReadinessSourceFile): LlmReadinessReport["llmSetups"][number]["provider"] {
  if (llmReadinessContentBlockSignal(source.text)) return "langchain";
  if (/langchain|@langchain\/core|BaseChatModel|BaseChatModelCallOptions|BaseLanguageModel|streamV2|_streamChatModelEvents|_generateUncached|_generateCached|generatePrompt|_getSerializedCacheKeyParametersForCall|BaseCache|InMemoryCache|defaultHashKeyEncoder|HashKeyEncoder|serializeGeneration|deserializeStoredGeneration|StoredGeneration|makeDefaultKeyEncoder|GLOBAL_MAP|initChatModel|ConfigurableModel|MODEL_PROVIDER_CONFIG|ChatModelProvider|modelProvider|configurableFields|RunnableConfig|ensureConfig|mergeConfigs|patchConfig|pickRunnableConfigKeys|AsyncLocalStorageProviderSingleton|ChatPromptTemplate|PromptTemplate|PipelinePromptTemplate|pipelinePrompts|finalPrompt|StructuredPrompt|StructuredPromptInput|fromMessagesAndSchema|RunnableBinding|DictPromptTemplate|TypedPromptInputValues|_getInputVariables|_insertInputVariables|BasePromptTemplate|BasePromptTemplateInput|BaseStringPromptTemplate|PromptValueReturnType|formatPromptValue|mergePartialAndUserVariables|lc_attributes|outputParser|StringPromptValue|SerializedPromptTemplate|SerializedFewShotTemplate|SerializedBasePromptTemplate|input_variables|template_format|serialize|deserialize|_coerceToolCall|isSerializedConstructor|SerializedConstructor|_constructMessageFromParams|coerceMessageLikeToMessage|_contentBlockToString|getBufferString|mapV1MessageToStoredMessage|StoredMessage|StoredMessageV1|mapStoredMessageToChatMessage|mapStoredMessagesToChatMessages|mapChatMessagesToStoredMessages|toDict|filterMessages|FilterMessagesFields|mergeMessageRuns|TrimMessagesFields|AIMessageChunk|BaseMessageChunk|UsageMetadata|mergeResponseMetadata|mergeUsageMetadata|BaseMessagePromptTemplate|BaseChatPromptTemplate|ChatMessagePromptTemplate|HumanMessagePromptTemplate|AIMessagePromptTemplate|SystemMessagePromptTemplate|ImagePromptTemplate|ImagePromptTemplateInput|ImagePromptValue|ImageContent|ContentBlock|additionalContentFields|TemplateFormat|parseTemplate|renderTemplate|checkValidTemplate|templateFormat|validateTemplate|RunnableSequence|RunnableBranch|RunnableBinding|RunnableEach|RunnableRetry|RunnableWithFallbacks|RunnableAssign|RunnablePick|RunnableMapLike|_coerceToRunnable|streamLog|streamEvents|convertChunksToEvents|ChatModelStreamEvent|ContentBlockDelta|activeBlocks|nextBlockIndex|getAdditionalKwargs|extractImageBlocksFromToolOutputs|getAudioPayload|MIME_TYPE_BY_AUDIO_FORMAT|MIME_TYPE_BY_IMAGE_FORMAT|AudioStreamState|throwIfAborted|ChatModelStream|TextContentStream|ToolCallsStream|ReasoningContentStream|UsageMetadataStream|ReplayBuffer|applyDelta|getEventDelta|getReasoningDelta|isReasoningContent|normalizeUsage|parseToolArgs|standardizeToolBlock|StructuredOutputParser|createContentParser|createFunctionCallingParser|FunctionCallingParserConstructor|assembleStructuredOutputPipeline|includeRaw|parserAssign|parserNone|parsedWithFallback|JsonOutputKeyToolsParser|returnSingle|StandardSchemaOutputParser|SerializableSchema|isSerializableSchema|InteropZodType|isInteropZodSchema|BaseLLMOutputParser|BaseOutputParser|BaseTransformOutputParser|BaseCumulativeTransformOutputParser|OutputParserException|JsonOutputParser|StringOutputParser|BytesOutputParser|ListOutputParser|XMLOutputParser|StandardSchemaOutputParser|OutputFunctionsParser|JsonOutputFunctionsParser|JsonOutputToolsParser|responseFormat|ToolStrategy|ProviderStrategy|toolStrategy|providerStrategy|transformResponseFormat|ResponseFormat|content_and_artifact|ToolOutputType|ToolEventType|ContentAndArtifact|ToolReturnType|ToolInputSchemaBase|ToolInputSchemaInputType|ToolInputSchemaOutputType|StructuredToolCallInput|StructuredToolInterface|_formatToolOutput|returnDirect|toolCallId|config.toolCall|convertToOpenAIFunction|convertToOpenAITool|FunctionDefinition|ToolDefinition|RunnableToolLike|isLangChainTool|isStructuredTool|isStructuredToolParams|isRunnableToolLike|strict|fieldsCopy|parameters|toJsonSchema|ToJSONSchemaParams|_jsonSchemaCache|WeakMap|canCache|cached|StandardJSONSchemaV1|isStandardJsonSchema|isZodSchemaV4|isZodSchemaV3|interopZodTransformInputSchema|interopZodObjectStrict|zodToJsonSchema|toJSONSchema|HeadlessTool|headlessTool|createHeadlessTool|HeadlessToolImplementation|createAgent|createMiddleware|AgentExecutor|humanInTheLoopMiddleware|modelRetryMiddleware|toolRetryMiddleware|piiMiddleware|openAIModerationMiddleware|anthropicPromptCachingMiddleware|dynamicSystemPromptMiddleware|summarizationMiddleware|contextEditingMiddleware|llmToolSelectorMiddleware|modelCallLimitMiddleware|toolCallLimitMiddleware/i.test(source.text)) return "langchain";
  if (/"ai"|from ["']ai["']|generateText|streamText|tool\s*\(/i.test(source.text)) return "vercel-ai-sdk";
  if (/openai|ChatOpenAI|OpenAIEmbeddings|new\s+OpenAI|OpenAI\(/i.test(source.text)) return "openai";
  if (/anthropic|ChatAnthropic|@anthropic-ai\/sdk|Claude/i.test(source.text)) return "anthropic";
  if (/google-genai|GoogleGenerativeAI|ChatGoogle|Gemini/i.test(source.text)) return "google-genai";
  if (/ollama|ChatOllama|OllamaEmbeddings/i.test(source.text)) return "ollama";
  if (/llamaindex|LlamaIndex/i.test(source.text)) return "llamaindex";
  if (/llm|model\s*:|prompt|embedding|vector/i.test(source.filePath) || /LLM|AI model|prompt template/i.test(source.text)) return "custom";
  return "unknown";
}

function llmReadinessModelSignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["modelSignals"] {
  const specs: Array<{ signal: LlmReadinessReport["modelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "chat-model", pattern: /ChatOpenAI|AzureChatOpenAI|ChatAnthropic|ChatGoogle|ChatOllama|chatModel|chat\s*:/i, evidence: "chat model evidence was detected." },
    { signal: "completion-model", pattern: /\bnew\s+OpenAI\(|Completion|generateText|complete\s*\(|LLMChain/i, evidence: "completion/generation model evidence was detected." },
    { signal: "embedding-model", pattern: /Embeddings|OpenAIEmbeddings|embedQuery|embedDocuments|embeddingModel/i, evidence: "embedding model evidence was detected." },
    { signal: "provider-config", pattern: /apiKey|baseURL|organization|project|OPENAI_API_KEY|ANTHROPIC_API_KEY|LANGCHAIN_API_KEY/i, evidence: "provider configuration evidence was detected." },
    { signal: "model-name", pattern: /model\s*:|modelName|model_name|gpt-|claude-|gemini-|llama/i, evidence: "model name evidence was detected." },
    { signal: "temperature", pattern: /temperature|topP|top_p|maxTokens|max_tokens/i, evidence: "sampling parameter evidence was detected." },
    { signal: "fallback", pattern: /fallback|withFallbacks|backupModel|fallbacks/i, evidence: "model fallback evidence was detected." },
    { signal: "init-chat-model", pattern: /initChatModel|langchain\/chat_models\/universal/i, evidence: "LangChain initChatModel universal loader evidence was detected." },
    { signal: "model-provider-config", pattern: /MODEL_PROVIDER_CONFIG|SUPPORTED_PROVIDERS|ChatModelProvider|getChatModelByClassName|modelProvider/i, evidence: "universal model provider config evidence was detected." },
    { signal: "model-provider-inference", pattern: /_inferModelProvider|_initChatModelHelper|infer model provider|gpt-[45]|claude-|gemini-|sonar|pplx|amazon\./i, evidence: "model provider inference evidence was detected." },
    { signal: "provider-prefix", pattern: /\b(openai|anthropic|google-genai|google-vertexai-web|azure_openai|bedrock|deepseek|xai|cerebras|fireworks|together|perplexity):[A-Za-z0-9_.-]+|SUPPORTED_PROVIDERS\.includes|model\.includes\(\s*["']:["']\s*\)/i, evidence: "provider-prefixed model name evidence was detected." },
    { signal: "configurable-model", pattern: /ConfigurableModel|isConfigurableModel|queuedMethodOperations|_defaultConfig/i, evidence: "LangChain ConfigurableModel evidence was detected." },
    { signal: "configurable-fields", pattern: /configurableFields|_configurableFields|configurable\s*:/i, evidence: "configurable model field evidence was detected." },
    { signal: "config-prefix", pattern: /configPrefix|_configPrefix|_removePrefix/i, evidence: "configurable model prefix evidence was detected." },
    { signal: "base-chat-model", pattern: /BaseChatModel|BaseChatModelParams|SerializedChatModel|_modelType\(\)|_llmType\(\)/i, evidence: "LangChain BaseChatModel contract evidence was detected." },
    { signal: "chat-model-call-options", pattern: /BaseChatModelCallOptions|BaseLanguageModelCallOptions|ToolChoice|tool_choice|callKeys|BindToolsInput/i, evidence: "chat model call option contract evidence was detected." },
    { signal: "chat-model-stream-v2", pattern: /streamV2|_streamChatModelEvents|_streamResponseChunks|_streamIterator|convertChunksToEvents|disableStreaming/i, evidence: "chat model streamV2/streaming decision evidence was detected." },
    { signal: "chat-model-generation", pattern: /_generateUncached|generatePrompt|handleChatModelStart|ChatGenerationChunk|ChatResult|LLMResult|invocationParams/i, evidence: "chat model generation lifecycle evidence was detected." },
    { signal: "chat-model-cache", pattern: /_generateCached|BaseCache|cache\.lookup|cache\.update|missingPromptIndices|_getSerializedCacheKeyParametersForCall/i, evidence: "chat model cache lookup/update evidence was detected." },
    { signal: "base-cache-interface", pattern: /BaseCache|abstract class BaseCache|lookup\(prompt:\s*string,\s*llmKey:\s*string\)|update\(prompt:\s*string,\s*llmKey:\s*string/i, evidence: "LangChain BaseCache interface evidence was detected." },
    { signal: "in-memory-cache", pattern: /InMemoryCache|new InMemoryCache|cache:\s*Map<string,\s*T>|lookup\(prompt,\s*llmKey\)/i, evidence: "LangChain InMemoryCache evidence was detected." },
    { signal: "cache-key-encoder", pattern: /defaultHashKeyEncoder|HashKeyEncoder|sha256|makeDefaultKeyEncoder|keyEncoder\(prompt,\s*llmKey\)/i, evidence: "cache key encoder evidence was detected." },
    { signal: "cache-generation-serialization", pattern: /serializeGeneration|deserializeStoredGeneration|StoredGeneration|Generation\[\]|storedGeneration/i, evidence: "cache generation serialization evidence was detected." },
    { signal: "cache-chat-generation-message", pattern: /ChatGeneration|mapStoredMessageToChatMessage|message\.toDict\(\)|storedGeneration\.message/i, evidence: "cache chat generation message mapping evidence was detected." },
    { signal: "global-cache-map", pattern: /GLOBAL_MAP|InMemoryCache\.global|static\s+global\(\)|global\(\):\s*InMemoryCache|new InMemoryCache\(GLOBAL_MAP\)/i, evidence: "global in-memory cache map evidence was detected." },
    { signal: "chat-model-callbacks", pattern: /CallbackManagerForLLMRun|handleLLMEnd|handleLLMError|handleChatModelStreamEvent|callbackHandlerPrefersChatModelStreamEvents|callbackHandlerPrefersStreaming/i, evidence: "chat model callback lifecycle evidence was detected." },
    { signal: "model-output-version", pattern: /outputVersion|LC_OUTPUT_VERSION|MessageOutputVersion|castStandardMessageContent/i, evidence: "model output version conversion evidence was detected." },
    { signal: "model-token-usage-output", pattern: /llmOutput|tokenUsage|promptTokens|completionTokens|totalTokens|usage_metadata/i, evidence: "model token usage output evidence was detected." },
    { signal: "llm-result-generations", pattern: /LLMResult|generations:\s*Generation\[\]\[\]|generations:\s*\[\[|generations\[0\]\[0\]/i, evidence: "LLMResult nested generations evidence was detected." },
    { signal: "generation-info", pattern: /Generation|generationInfo|finish_reason|model_name|logprobs/i, evidence: "generation metadata evidence was detected." },
    { signal: "generation-chunk-concat", pattern: /GenerationChunk|GenerationChunkFields|\.concat\(\s*(?:chunk|new GenerationChunk)|text:\s*this\.text\s*\+\s*chunk\.text/i, evidence: "generation chunk concat evidence was detected." },
    { signal: "chat-generation-chunk", pattern: /ChatGeneration|ChatGenerationChunk|ChatGenerationChunkFields|BaseMessageChunk/i, evidence: "chat generation chunk evidence was detected." },
    { signal: "chat-result-output", pattern: /ChatResult|generations:\s*ChatGeneration\[\]|llmOutput\?:|ChatGeneration\[\]/i, evidence: "chat result output evidence was detected." },
    { signal: "run-key-metadata", pattern: /RUN_KEY|__run|Object\.defineProperty\([^)]*RUN_KEY|\[RUN_KEY\]/i, evidence: "LLM run metadata key evidence was detected." },
    { signal: "model-profile", pattern: /ModelProfile|profile\s*:|get profile\(\)/i, evidence: "model capability profile evidence was detected." },
    { signal: "model-context-window", pattern: /maxInputTokens|maxOutputTokens|context window|token budget/i, evidence: "model context/output token limit evidence was detected." },
    { signal: "model-multimodal-inputs", pattern: /imageInputs|imageUrlInputs|pdfInputs|audioInputs|videoInputs/i, evidence: "model multimodal input profile evidence was detected." },
    { signal: "model-tool-message-inputs", pattern: /imageToolMessage|pdfToolMessage|tool messages/i, evidence: "model tool message media profile evidence was detected." },
    { signal: "model-output-modalities", pattern: /imageOutputs|audioOutputs|videoOutputs|maxOutputTokens/i, evidence: "model output modality profile evidence was detected." },
    { signal: "model-reasoning-output", pattern: /reasoningOutput|chain-of-thought|reasoning steps/i, evidence: "model reasoning output profile evidence was detected." },
    { signal: "model-tool-capabilities", pattern: /toolCalling|toolChoice|tool-calling behavior/i, evidence: "model tool capability profile evidence was detected." },
    { signal: "model-structured-output-profile", pattern: /structuredOutput|specified schema|specified schema or structure/i, evidence: "model structured output profile evidence was detected." },
    { signal: "fake-built-model", pattern: /FakeBuiltModel|fake chat model for testing/i, evidence: "LangChain FakeBuiltModel test double evidence was detected." },
    { signal: "fake-model-builder", pattern: /fakeModel\s*\(|fake-model-builder|created via \{@link fakeModel\}/i, evidence: "LangChain fakeModel builder evidence was detected." },
    { signal: "fake-model-response-queue", pattern: /ResponseFactory|QueueEntry|respond\s*\(|alwaysThrow|no response queued|first-in-first-out|FIFO/i, evidence: "fake model queued response evidence was detected." },
    { signal: "fake-model-call-capture", pattern: /FakeModelCall|FakeModelState|callCount|calls\(\)|_state\.calls|All invocations recorded/i, evidence: "fake model invocation capture evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "model", "signal");
}

function llmReadinessPromptSignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["promptSignals"] {
  const specs: Array<{ signal: LlmReadinessReport["promptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prompt-template", pattern: /PromptTemplate|fromTemplate|template\s*:/i, evidence: "prompt template evidence was detected." },
    { signal: "chat-prompt-template", pattern: /ChatPromptTemplate|fromMessages/i, evidence: "chat prompt template evidence was detected." },
    { signal: "system-message", pattern: /SystemMessage|system\s*:/i, evidence: "system message evidence was detected." },
    { signal: "human-message", pattern: /HumanMessage|user\s*:/i, evidence: "human/user message evidence was detected." },
    { signal: "messages-placeholder", pattern: /MessagesPlaceholder|chat_history|history\s*:/i, evidence: "message history placeholder evidence was detected." },
    { signal: "few-shot", pattern: /FewShotPromptTemplate|exampleSelector|examples\s*:/i, evidence: "few-shot prompt evidence was detected." },
    { signal: "few-shot-template", pattern: /FewShotPromptTemplate|FewShotChatMessagePromptTemplate|few_shot/i, evidence: "few-shot prompt template evidence was detected." },
    { signal: "example-selector", pattern: /BaseExampleSelector|exampleSelector|selectExamples/i, evidence: "example selector evidence was detected." },
    { signal: "length-based-example-selector", pattern: /LengthBasedExampleSelector|maxLength|getTextLength|exampleTextLengths/i, evidence: "length-based example selector evidence was detected." },
    { signal: "semantic-similarity-example-selector", pattern: /SemanticSimilarityExampleSelector|vectorStoreRetriever|fromTexts|inputKeys|exampleKeys/i, evidence: "semantic similarity example selector evidence was detected." },
    { signal: "base-prompt-selector", pattern: /BasePromptSelector|getPrompt\s*\(|BaseLanguageModelInterface/i, evidence: "base prompt selector evidence was detected." },
    { signal: "conditional-prompt-selector", pattern: /ConditionalPromptSelector|defaultPrompt|conditionals/i, evidence: "conditional prompt selector evidence was detected." },
    { signal: "prompt-selector-partials", pattern: /BaseGetPromptAsyncOptions|getPromptAsync|partialVariables|partial\s*\(/i, evidence: "prompt selector partial variable evidence was detected." },
    { signal: "prompt-selector-llm-type-guard", pattern: /isLLM|isChatModel|_modelType|base_llm|base_chat_model/i, evidence: "prompt selector LLM type guard evidence was detected." },
    { signal: "example-prompt", pattern: /examplePrompt|example_prompt|PromptTemplate\.fromTemplate/i, evidence: "example prompt evidence was detected." },
    { signal: "example-separator", pattern: /exampleSeparator|example_separator|prefix\s*:|suffix\s*:/i, evidence: "example separator/prefix/suffix evidence was detected." },
    { signal: "partial-variables", pattern: /partialVariables|partial\s*\(/i, evidence: "partial prompt variable evidence was detected." },
    { signal: "template-format", pattern: /TemplateFormat|templateFormat|template_format/i, evidence: "prompt template format evidence was detected." },
    { signal: "mustache-template", pattern: /mustache|parseMustache|interpolateMustache/i, evidence: "mustache prompt template evidence was detected." },
    { signal: "f-string-template", pattern: /f-string|parseFString|interpolateFString|ParsedFStringNode/i, evidence: "f-string prompt template evidence was detected." },
    { signal: "template-parser", pattern: /parseTemplate|DEFAULT_PARSER_MAPPING|ParsedTemplateNode/i, evidence: "prompt template parser evidence was detected." },
    { signal: "template-renderer", pattern: /renderTemplate|DEFAULT_FORMATTER_MAPPING|interpolateFString|interpolateMustache/i, evidence: "prompt template renderer evidence was detected." },
    { signal: "template-validation", pattern: /checkValidTemplate|validateTemplate|Invalid prompt schema|inputVariables/i, evidence: "prompt template validation evidence was detected." },
    { signal: "invalid-prompt-input", pattern: /INVALID_PROMPT_INPUT|addLangChainErrorFields/i, evidence: "invalid prompt input error evidence was detected." },
    { signal: "message-content-template", pattern: /MessageContent|image_url|message content template|message template/i, evidence: "message content template evidence was detected." },
    { signal: "message-content-block", pattern: /MessageContentComplex|MessageContentText|MessageContentImageUrl|ContentBlock|MessageContent/i, evidence: "message content block evidence was detected." },
    { signal: "data-content-block", pattern: /DataContentBlock|BaseDataContentBlock|URLContentBlock|Base64ContentBlock|PlainTextContentBlock|IDContentBlock|isDataContentBlock|source_type|mime_type/i, evidence: "data content block evidence was detected." },
    { signal: "provider-content-converter", pattern: /ProviderFormatTypes|StandardContentBlockConverter|convertToProviderContentBlock|convertToStandardContentBlock/i, evidence: "provider content converter evidence was detected." },
    { signal: "openai-data-block", pattern: /isOpenAIDataBlock|convertToV1FromOpenAIDataBlock|convertToV1FromChatCompletions|convertToV1FromChatCompletionsInput|image_url|input_audio/i, evidence: "OpenAI content block conversion evidence was detected." },
    { signal: "openai-response-block", pattern: /convertToV1FromResponses|convertToV1FromResponsesChunk|server_tool_call|reasoning|citation|non_standard/i, evidence: "OpenAI Responses content block evidence was detected." },
    { signal: "anthropic-content-block", pattern: /convertToV1FromAnthropicContentBlock|convertToV1FromAnthropicInput|convertToV1FromAnthropicMessage|convertAnthropicAnnotation|thinking|tool_use|web_search_tool_result/i, evidence: "Anthropic content block conversion evidence was detected." },
    { signal: "content-block-merge", pattern: /contentBlocksFromNonStringFirst|mergeContent|parseBase64DataUrl|parseMimeType/i, evidence: "content block merge or parsing evidence was detected." },
    { signal: "openrouter-reasoning-block", pattern: /convertToV1FromOpenRouterMessage|ChatOpenRouterTranslator|reasoning_details|reasoning\.summary|reasoning\.text|reasoning\.encrypted/i, evidence: "OpenRouter reasoning block translator evidence was detected." },
    { signal: "groq-reasoning-block", pattern: /convertToV1FromGroqMessage|ChatGroqTranslator|<think>|additional_kwargs\??\.reasoning/i, evidence: "Groq reasoning block translator evidence was detected." },
    { signal: "ollama-reasoning-block", pattern: /convertToV1FromOllamaMessage|ChatOllamaTranslator/i, evidence: "Ollama reasoning block translator evidence was detected." },
    { signal: "deepseek-reasoning-block", pattern: /convertToV1FromDeepSeekMessage|ChatDeepSeekTranslator/i, evidence: "DeepSeek reasoning block translator evidence was detected." },
    { signal: "xai-reasoning-block", pattern: /convertToV1FromXAIMessage|ChatXAITranslator/i, evidence: "xAI reasoning block translator evidence was detected." },
    { signal: "google-thinking-block", pattern: /ChatGoogleGenAITranslator|ChatGoogleTranslator|thinking|thoughtSignature|thought|inlineData|functionCall|functionResponse|fileData|executableCode|codeExecutionResult/i, evidence: "Google thinking/content block translator evidence was detected." },
    { signal: "bedrock-converse-block", pattern: /convertToV1FromChatBedrockConverseInput|convertToV1FromChatBedrockConverseMessage|ChatBedrockConverseTranslator|reasoning_content|guard_content|cache_point|documentChar|documentPage|documentChunk/i, evidence: "Bedrock Converse content block translator evidence was detected." },
    { signal: "bedrock-citation-block", pattern: /citations_content|citationsContent|sourceContent|documentChar|documentPage|documentChunk|citedText/i, evidence: "Bedrock Converse citation block evidence was detected." },
    { signal: "message-prompt-template", pattern: /BaseMessagePromptTemplate|BaseMessageStringPromptTemplate|formatMessages/i, evidence: "base message prompt template evidence was detected." },
    { signal: "chat-message-prompt-template", pattern: /ChatMessagePromptTemplate|ChatPromptTemplateInput|promptMessages/i, evidence: "chat message prompt template evidence was detected." },
    { signal: "role-message-prompt-template", pattern: /HumanMessagePromptTemplate|AIMessagePromptTemplate|SystemMessagePromptTemplate|ChatMessagePromptTemplate\.fromTemplate/i, evidence: "role-specific message prompt template evidence was detected." },
    { signal: "image-prompt-template", pattern: /ImagePromptTemplate|additionalContentFields|image_url/i, evidence: "image prompt template evidence was detected." },
    { signal: "image-prompt-input", pattern: /ImagePromptTemplateInput|templateFormat|validateTemplate|BasePromptTemplateInput/i, evidence: "image prompt input evidence was detected." },
    { signal: "image-prompt-value", pattern: /ImagePromptValue|ImageContent|formatPromptValue/i, evidence: "image prompt value evidence was detected." },
    { signal: "image-content-fields", pattern: /additionalContentFields|ContentBlock|MessageContent/i, evidence: "image prompt content field evidence was detected." },
    { signal: "image-url-template", pattern: /image_url|Must provide either an image URL|url must be a string|detail/i, evidence: "image URL template evidence was detected." },
    { signal: "image-prompt-partial", pattern: /ImagePromptTemplate[\s\S]{0,240}partial|newPartialVariables|PartialValues/i, evidence: "image prompt partial application evidence was detected." },
    { signal: "placeholder-coercion", pattern: /MessagesPlaceholderFields|_coerceMessagePromptTemplateLike|isMessagesPlaceholder|coerceMessageLikeToMessage|InputFormatError/i, evidence: "message placeholder coercion evidence was detected." },
    { signal: "message-constructor-coercion", pattern: /_constructMessageFromParams|isSerializedConstructor|SerializedConstructor|_coerceToolCall/i, evidence: "message constructor coercion evidence was detected." },
    { signal: "message-like-coercion", pattern: /coerceMessageLikeToMessage|_isMessageFieldWithRole|MESSAGE_COERCION_FAILURE/i, evidence: "message-like coercion evidence was detected." },
    { signal: "message-buffer-string", pattern: /getBufferString|_contentBlockToString|Human:|Tool:|\[image\]|\[audio\]|\[video\]/i, evidence: "message buffer string rendering evidence was detected." },
    { signal: "stored-message-v1-map", pattern: /mapV1MessageToStoredMessage|StoredMessageV1|v1Message\.text|v1Message\.role/i, evidence: "stored message V1 mapping evidence was detected." },
    { signal: "stored-message-chat-map", pattern: /mapStoredMessageToChatMessage|mapStoredMessagesToChatMessages|StoredMessage|FunctionMessageFields|ToolMessageFields|ChatMessageFields/i, evidence: "stored message to chat message mapping evidence was detected." },
    { signal: "chat-message-storage-map", pattern: /mapChatMessagesToStoredMessages|toDict\(\)|BaseMessage\[\]|StoredMessage\[\]/i, evidence: "chat message storage mapping evidence was detected." },
    { signal: "chat-prompt-validation", pattern: /validateTemplate|inputVariablesMessages|Input variables.*prompt messages|INVALID_PROMPT_INPUT/i, evidence: "chat prompt validation evidence was detected." },
    { signal: "image-prompt-parsing", pattern: /_parseImagePrompts|parseFString|parseMustache|Only one format variable allowed per image template/i, evidence: "image prompt parsing evidence was detected." },
    { signal: "chat-prompt-flattening", pattern: /flattenedMessages|flattenedPartialVariables|promptMessages\.reduce|partialVariables/i, evidence: "chat prompt flattening evidence was detected." },
    { signal: "pipeline-prompt-template", pattern: /PipelinePromptTemplate|PipelinePromptTemplateInput/i, evidence: "pipeline prompt template evidence was detected." },
    { signal: "pipeline-prompts", pattern: /pipelinePrompts|PipelinePromptParams/i, evidence: "pipeline prompt list evidence was detected." },
    { signal: "pipeline-final-prompt", pattern: /finalPrompt|formatPromptValue/i, evidence: "pipeline final prompt evidence was detected." },
    { signal: "pipeline-input-computation", pattern: /computeInputValues|intermediateValues|extractRequiredInputValues/i, evidence: "pipeline input computation evidence was detected." },
    { signal: "pipeline-format-prompts", pattern: /formatPipelinePrompts|mergePartialAndUserVariables|formatMessages/i, evidence: "pipeline formatting evidence was detected." },
    { signal: "pipeline-partial", pattern: /PipelinePromptTemplate<|partialVariables|_getPromptType\(\).*pipeline|SerializedBasePromptTemplate/i, evidence: "pipeline partial or serialization boundary evidence was detected." },
    { signal: "structured-prompt", pattern: /StructuredPrompt|StructuredPromptInput/i, evidence: "structured prompt evidence was detected." },
    { signal: "structured-prompt-schema", pattern: /fromMessagesAndSchema|schema_|schema\s*:|StructuredPromptInput\["schema"\]/i, evidence: "structured prompt schema evidence was detected." },
    { signal: "structured-prompt-method", pattern: /method\s*:|jsonMode|jsonSchema|functionMode/i, evidence: "structured prompt method evidence was detected." },
    { signal: "structured-prompt-pipe", pattern: /withStructuredOutput|RunnableBinding|isWithStructuredOutput|isRunnableBinding/i, evidence: "structured prompt pipe binding evidence was detected." },
    { signal: "structured-prompt-factory", pattern: /fromMessagesAndSchema|StructuredPrompt\.fromMessages|ChatPromptTemplateInput|BaseMessagePromptTemplateLike/i, evidence: "structured prompt factory evidence was detected." },
    { signal: "dict-prompt-template", pattern: /DictPromptTemplate|langchain_core["']?,\s*["']prompts["']?,\s*["']dict/i, evidence: "dict prompt template evidence was detected." },
    { signal: "dict-prompt-template-format", pattern: /DictPromptTemplate|templateFormat|TemplateFormat/i, evidence: "dict prompt template format evidence was detected." },
    { signal: "dict-input-variables", pattern: /_getInputVariables|inputVariables|TypedPromptInputValues/i, evidence: "dict prompt input variable extraction evidence was detected." },
    { signal: "dict-template-render", pattern: /_insertInputVariables|renderTemplate|runType:\s*["']prompt["']/i, evidence: "dict prompt render evidence was detected." },
    { signal: "dict-nested-template", pattern: /Object\.values|Array\.isArray|Record<string, unknown>|nested dictionary|template array object/i, evidence: "nested dict prompt template evidence was detected." },
    { signal: "base-prompt-template", pattern: /BasePromptTemplate|BasePromptTemplateInput|PromptValueReturnType|_getPromptType/i, evidence: "base prompt template evidence was detected." },
    { signal: "base-prompt-input", pattern: /TypedPromptInputValues|inputVariables|partialVariables|outputParser|metadata|tags|Cannot have an input variable named ["']?stop/i, evidence: "base prompt input contract evidence was detected." },
    { signal: "base-string-prompt-template", pattern: /BaseStringPromptTemplate|StringPromptValue|StringPromptValueInterface/i, evidence: "base string prompt template evidence was detected." },
    { signal: "prompt-value-formatting", pattern: /formatPromptValue|PromptValueReturnType|StringPromptValue/i, evidence: "prompt value formatting evidence was detected." },
    { signal: "prompt-serialization", pattern: /SerializedPromptTemplate|SerializedFewShotTemplate|SerializedBasePromptTemplate|input_variables|template_format|serialize\(|deserialize\(/i, evidence: "prompt serialization evidence was detected." },
    { signal: "prompt-partial-merge", pattern: /mergePartialAndUserVariables|partialVariables|lc_attributes|outputParser/i, evidence: "prompt partial merge and attributes evidence was detected." },
    { signal: "dynamic-system-prompt", pattern: /dynamicSystemPromptMiddleware|DynamicSystemPromptMiddleware|systemMessage|runtime\.context/i, evidence: "dynamic system prompt middleware evidence was detected." },
    { signal: "summary-prompt", pattern: /summarizationMiddleware|DEFAULT_SUMMARY_PROMPT|summaryPrompt|summaryPrefix/i, evidence: "summarization prompt evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "prompt", "signal");
}

function llmReadinessRunnableSignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["runnableSignals"] {
  const specs: Array<{ signal: LlmReadinessReport["runnableSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "runnable-sequence", pattern: /RunnableSequence|RunnableSequence\.from/i, evidence: "RunnableSequence composition evidence was detected." },
    { signal: "runnable-lambda", pattern: /RunnableLambda|RunnableLambda\.from/i, evidence: "RunnableLambda adapter evidence was detected." },
    { signal: "runnable-passthrough", pattern: /RunnablePassthrough|RunnablePassthrough\.assign/i, evidence: "RunnablePassthrough evidence was detected." },
    { signal: "runnable-map", pattern: /RunnableMap|RunnableMap\.from/i, evidence: "RunnableMap fan-out evidence was detected." },
    { signal: "pipe-chain", pattern: /\.pipe\s*\(/i, evidence: "LCEL pipe-chain evidence was detected." },
    { signal: "invoke", pattern: /\.invoke\s*\(/i, evidence: "Runnable invoke evidence was detected." },
    { signal: "batch", pattern: /\.batch\s*\(/i, evidence: "Runnable batch evidence was detected." },
    { signal: "stream", pattern: /\.stream\s*\(|for await\s*\(/i, evidence: "Runnable stream iteration evidence was detected." },
    { signal: "as-tool", pattern: /\.asTool\s*\(|RunnableToolLike/i, evidence: "Runnable-to-tool wrapping evidence was detected." },
    { signal: "with-message-history", pattern: /RunnableWithMessageHistory|withMessageHistory|MessagesPlaceholder|chat_history|history\s*:/i, evidence: "message-history runnable evidence was detected." },
    { signal: "message-history-store", pattern: /BaseChatMessageHistory|BaseListChatMessageHistory|InMemoryChatMessageHistory|ChatMessageHistory/i, evidence: "chat message history store evidence was detected." },
    { signal: "message-history-config", pattern: /getMessageHistory|configurable\.sessionId|configurable\s*:\s*\{[\s\S]{0,160}sessionId|sessionId is required/i, evidence: "message history session configuration evidence was detected." },
    { signal: "message-history-keys", pattern: /inputMessagesKey|outputMessagesKey|historyMessagesKey/i, evidence: "message history input/output/history key mapping evidence was detected." },
    { signal: "message-history-insert", pattern: /loadHistory|insertHistory|RunnablePassthrough\.assign\(\{[\s\S]{0,160}\[messagesKey\]|messageHistory/i, evidence: "message history loading or insertion evidence was detected." },
    { signal: "message-history-persist", pattern: /getMessages|addMessages|addMessage|addUserMessage|addAIMessage|clear\(\)/i, evidence: "message history persistence operation evidence was detected." },
    { signal: "message-history-input-coercion", pattern: /_getInputMessages|HumanMessage|isBaseMessage\(parsedInputValue\)|Expected a string, BaseMessage, or array of BaseMessages/i, evidence: "message history input coercion evidence was detected." },
    { signal: "message-history-output-coercion", pattern: /_getOutputMessages|AIMessage|generations\[0\]\[0\]\.message|outputMessagesKey/i, evidence: "message history output coercion evidence was detected." },
    { signal: "message-history-enter-exit", pattern: /_enterHistory|_exitHistory|withListeners\(\{[\s\S]{0,160}onEnd|loadHistory|insertHistory/i, evidence: "message history enter/exit lifecycle evidence was detected." },
    { signal: "message-history-session-attach", pattern: /RunnableWithMessageHistoryInputs|GetSessionHistoryCallable|_mergeConfig|configurable\.messageHistory|sessionId is required/i, evidence: "message history session attach evidence was detected." },
    { signal: "message-history-dedupe", pattern: /existingMessages\.length|inputMessages\.slice|avoid adding duplicate messages to history/i, evidence: "message history duplicate-prevention evidence was detected." },
    { signal: "message-filter", pattern: /_coerceToolCall|isSerializedConstructor|SerializedConstructor|_constructMessageFromParams|coerceMessageLikeToMessage|_contentBlockToString|getBufferString|mapV1MessageToStoredMessage|StoredMessage|StoredMessageV1|mapStoredMessageToChatMessage|mapStoredMessagesToChatMessages|mapChatMessagesToStoredMessages|toDict|filterMessages|FilterMessagesFields|includeNames|excludeNames|includeTypes|excludeTypes|includeIds|excludeIds|_filterMessages|_isMessageType/i, evidence: "message filter transformer evidence was detected." },
    { signal: "message-run-merge", pattern: /mergeMessageRuns|_mergeMessageRuns|convertToChunk|_chunkToMsg|lastChunk\.concat|mergedChunks/i, evidence: "message run merge transformer evidence was detected." },
    { signal: "message-trim", pattern: /trimMessages|TrimMessagesFields|maxTokens|tokenCounter|allowPartial|endOn|startOn|includeSystem|textSplitter|_trimMessagesHelper|_firstMaxTokens|_lastMaxTokens/i, evidence: "message trim transformer evidence was detected." },
    { signal: "message-chunk-conversion", pattern: /BaseMessageChunk|isBaseMessageChunk|AIMessageChunk|AIMessageChunkFields|HumanMessageChunk|SystemMessageChunk|FunctionMessageChunk|ChatMessageChunk|_switchTypeToMessage|_MSG_CHUNK_MAP|ToolMessageChunk/i, evidence: "message chunk conversion evidence was detected." },
    { signal: "response-metadata-merge", pattern: /mergeResponseMetadata|ResponseMetadata|model_provider|model_name|output_version|_mergeDicts/i, evidence: "response metadata merge evidence was detected." },
    { signal: "usage-metadata-merge", pattern: /mergeUsageMetadata|UsageMetadata|ModalitiesTokenDetails|input_tokens|output_tokens|total_tokens|input_token_details|output_token_details|mergeInputTokenDetails|mergeOutputTokenDetails/i, evidence: "usage metadata merge evidence was detected." },
    { signal: "runnable-config", pattern: /RunnableConfig|BaseCallbackConfig|configurable\?:|maxConcurrency|timeout\?:|signal\?:/i, evidence: "RunnableConfig contract evidence was detected." },
    { signal: "config-ensure", pattern: /ensureConfig|DEFAULT_RECURSION_LIMIT|getRunnableConfig|recursionLimit/i, evidence: "runnable config ensure/default evidence was detected." },
    { signal: "config-merge", pattern: /mergeConfigs|metadata|tags|configurable|timeout|AbortSignal\.any/i, evidence: "runnable config merge evidence was detected." },
    { signal: "config-patch", pattern: /patchConfig|runName|runId|maxConcurrency|recursionLimit/i, evidence: "runnable config patch evidence was detected." },
    { signal: "config-pick-keys", pattern: /pickRunnableConfigKeys|store|callbacks|metadata|tags/i, evidence: "runnable config key-picking evidence was detected." },
    { signal: "base-store", pattern: /BaseStore<|BaseStore\b|abstract class BaseStore/i, evidence: "LangChain BaseStore contract evidence was detected." },
    { signal: "in-memory-store", pattern: /InMemoryStore|lc_namespace\s*=\s*\["langchain",\s*"storage"\]/i, evidence: "LangChain InMemoryStore evidence was detected." },
    { signal: "store-mget", pattern: /mget\s*\(\s*keys|abstract mget|Promise<\((?:V|unknown)[\s\S]{0,80}undefined\)\[]>/i, evidence: "LangChain store bulk get evidence was detected." },
    { signal: "store-mset", pattern: /mset\s*\(\s*keyValuePairs|keyValuePairs:\s*\[(?:K|string),\s*(?:V|unknown)\]\[\]/i, evidence: "LangChain store bulk set evidence was detected." },
    { signal: "store-mdelete", pattern: /mdelete\s*\(\s*keys|delete\s+this\.store/i, evidence: "LangChain store bulk delete evidence was detected." },
    { signal: "store-yield-keys", pattern: /yieldKeys|AsyncGenerator|startsWith\(prefix\)/i, evidence: "LangChain store key iteration evidence was detected." },
    { signal: "runnable-callback-manager-config", pattern: /getCallbackManagerForConfig|_getTracingInheritableMetadataFromConfig|tracerInheritableMetadata|CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS|PRIMITIVES/i, evidence: "runnable callback manager config propagation evidence was detected." },
    { signal: "async-local-config", pattern: /AsyncLocalStorageProviderSingleton|runWithConfig|getRunnableConfig|consumeIteratorInContext|consumeAsyncIterableInContext/i, evidence: "async-local runnable config propagation evidence was detected." },
    { signal: "async-local-child-config", pattern: /LC_CHILD_KEY|lc:child_config|runTree\.extra|getRunnableConfig/i, evidence: "async-local child config propagation evidence was detected." },
    { signal: "async-local-run-tree", pattern: /getRunTreeWithTracingConfig|LangChainTracer|RunTree|parentRunId/i, evidence: "async-local run tree propagation evidence was detected." },
    { signal: "async-local-root-run-control", pattern: /avoidCreatingRootRunTree|<runnable_lambda>|tracingEnabled:\s*false|new\s+RunTree/i, evidence: "async-local root run control evidence was detected." },
    { signal: "async-local-context-carryover", pattern: /_CONTEXT_VARIABLES_KEY|previousValue|storage\.getStore|storage\.run/i, evidence: "async-local context carryover evidence was detected." },
    { signal: "async-local-global-instance", pattern: /initializeGlobalInstance|getGlobalAsyncLocalStorageInstance|setGlobalAsyncLocalStorageInstance|MockAsyncLocalStorage/i, evidence: "async-local global instance evidence was detected." },
    { signal: "recursion-limit", pattern: /DEFAULT_RECURSION_LIMIT|recursionLimit|Maximum number of times a call can recurse/i, evidence: "runnable recursion limit evidence was detected." },
    { signal: "config-timeout-signal", pattern: /timeoutMs|AbortSignal\.timeout|AbortSignal\.any|signal\s*:|timeout\s*:/i, evidence: "runnable timeout and abort signal evidence was detected." },
    { signal: "configurable-runtime", pattern: /configurable|ConfigurableFieldType|configurable\.model|thread_id|Runtime values for attributes/i, evidence: "runtime configurable values evidence was detected." },
    { signal: "runnable-branch", pattern: /RunnableBranch|BranchLike|Branch<|branch:default/i, evidence: "RunnableBranch routing evidence was detected." },
    { signal: "branch-condition", pattern: /condition:\$\{i \+ 1\}|conditionValue|condition runnable|conditions are true|condition\s*=\s*RunnableLambda|RunnableBranch[\s\S]{0,160}\bcondition\b/i, evidence: "branch condition evidence was detected." },
    { signal: "branch-default", pattern: /defaultBranch|branch:default|default branch|executes the default branch/i, evidence: "branch default evidence was detected." },
    { signal: "runnable-router", pattern: /RouterRunnable|new\s+RouterRunnable|lc_name\(\)[\s\S]{0,80}RouterRunnable/i, evidence: "RouterRunnable key-based routing evidence was detected." },
    { signal: "router-input", pattern: /RouterInput|key:\s*string[\s\S]{0,80}input|input:\s*any/i, evidence: "RouterRunnable input contract evidence was detected." },
    { signal: "router-key-dispatch", pattern: /runnables\[key\]|const\s+\{\s*key,\s*input:\s*actualInput\s*\}|actualInput/i, evidence: "RouterRunnable key dispatch evidence was detected." },
    { signal: "router-missing-key", pattern: /missingKey|No runnable associated with key|do not have a corresponding runnable/i, evidence: "RouterRunnable missing-key guard evidence was detected." },
    { signal: "router-batch-concurrency", pattern: /_getOptionsList|returnExceptions|maxConcurrency|batchSize|actualInputs\.slice/i, evidence: "RouterRunnable batch/concurrency evidence was detected." },
    { signal: "router-stream", pattern: /RouterRunnable[\s\S]{0,260}\.stream|return\s+runnable\.stream|streamPlan|router\.stream/i, evidence: "RouterRunnable stream forwarding evidence was detected." },
    { signal: "runnable-binding", pattern: /RunnableBinding|RunnableBindingArgs|withConfig|kwargs|bound:\s*this/i, evidence: "RunnableBinding evidence was detected." },
    { signal: "config-factory", pattern: /configFactories|withListeners|RootListenersTracer|onStart|onEnd|onError/i, evidence: "runnable config factory or listener evidence was detected." },
    { signal: "runnable-each", pattern: /RunnableEach|RunInputItem|RunOutputItem|bound\.batch/i, evidence: "RunnableEach evidence was detected." },
    { signal: "runnable-retry", pattern: /RunnableRetry|RunnableRetryFailedAttemptHandler|maxAttemptNumber|stopAfterAttempt|pRetry/i, evidence: "RunnableRetry evidence was detected." },
    { signal: "retry-attempt-handler", pattern: /onFailedAttempt|retry:attempt|_patchConfigForRetry|failed attempt/i, evidence: "retry attempt handler evidence was detected." },
    { signal: "runnable-with-fallbacks", pattern: /RunnableWithFallbacks|fallbacks|handledExceptions|exceptionKey/i, evidence: "RunnableWithFallbacks evidence was detected." },
    { signal: "runnable-assign", pattern: /RunnableAssign|RunnablePassthrough\.assign|mapper|\.assign\(/i, evidence: "RunnableAssign evidence was detected." },
    { signal: "runnable-pick", pattern: /RunnablePick|\.pick\(|keys\s*:|new RunnablePick/i, evidence: "RunnablePick evidence was detected." },
    { signal: "map-key-callback", pattern: /map:key|RunnableMapLike|getStepsKeys|atee\(/i, evidence: "RunnableMap key callback evidence was detected." },
    { signal: "runnable-stream-log", pattern: /streamLog|_streamLog|RunLogPatch|streamed_output/i, evidence: "runnable streamLog evidence was detected." },
    { signal: "runnable-stream-events", pattern: /streamEvents|_streamEventsV1|_streamEventsV2|on_chain_start|on_chain_stream|on_chain_end/i, evidence: "runnable streamEvents evidence was detected." },
    { signal: "runnable-coercion", pattern: /_coerceToRunnable|_coerceToDict|RunnableLike/i, evidence: "runnable coercion evidence was detected." },
    { signal: "runnable-graph", pattern: /getGraph\(|new\s+Graph|class\s+Graph|Graph\s*\{/i, evidence: "runnable graph construction evidence was detected." },
    { signal: "runnable-graph-json", pattern: /toJSON\(|nodeDataJson|stableNodeIds|toJsonSchema/i, evidence: "runnable graph JSON serialization evidence was detected." },
    { signal: "runnable-graph-edge", pattern: /addNode|removeNode|addEdge|firstNode|lastNode|_firstNode|_lastNode/i, evidence: "runnable graph node and edge evidence was detected." },
    { signal: "runnable-graph-trim-reid", pattern: /trimFirstNode|trimLastNode|reid\(|nodeLabelCounts|prefixed/i, evidence: "runnable graph trimming or re-identification evidence was detected." },
    { signal: "runnable-graph-mermaid", pattern: /drawMermaid|curveStyle|withStyles|nodeColors|wrapLabelNWords|_generateMermaidGraphStyles|MARKDOWN_SPECIAL_CHARS/i, evidence: "runnable graph Mermaid rendering evidence was detected." },
    { signal: "runnable-graph-mermaid-image", pattern: /drawMermaidPng|drawMermaidImage|mermaid\.ink|toBase64Url|backgroundColor|imageType/i, evidence: "runnable graph Mermaid image rendering evidence was detected." },
    { signal: "with-retry", pattern: /\.withRetry\s*\(|withRetry\s*\(/i, evidence: "Runnable retry evidence was detected." },
    { signal: "with-fallbacks", pattern: /\.withFallbacks\s*\(|withFallbacks\s*\(|fallbacks\s*:/i, evidence: "Runnable fallback evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "runnable", "signal");
}

function llmReadinessToolSignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["toolSignals"] {
  const specs: Array<{ signal: LlmReadinessReport["toolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tool", pattern: /\btool\s*\(|StructuredTool|DynamicTool|DynamicStructuredTool|ToolMessage|tools\s*:/i, evidence: "tool declaration evidence was detected." },
    { signal: "tool-schema", pattern: /schema\s*:|z\.object|parameters\s*:|argsSchema|inputSchema/i, evidence: "tool schema evidence was detected." },
    { signal: "tool-calling", pattern: /bindTools|tool_calls|tool_choice|function_call|withConfig\([^)]*tools/i, evidence: "tool calling evidence was detected." },
    { signal: "agent", pattern: /createAgent|createReactAgent|agent\s*:|LangGraph|StateGraph/i, evidence: "agent evidence was detected." },
    { signal: "agent-executor", pattern: /AgentExecutor|executor|invoke\s*\([^)]*messages/i, evidence: "agent executor evidence was detected." },
    { signal: "agent-middleware", pattern: /createMiddleware|AgentMiddleware|AnyAgentMiddleware/i, evidence: "LangChain agent middleware evidence was detected." },
    { signal: "middleware-state-schema", pattern: /stateSchema|StateSchema|middleware\.stateSchema/i, evidence: "middleware state schema evidence was detected." },
    { signal: "middleware-context-schema", pattern: /contextSchema|Runtime<|runtime\.context|context\s*:/i, evidence: "middleware context schema evidence was detected." },
    { signal: "wrap-model-call", pattern: /wrapModelCall|WrapModelCallHook|ModelRequest/i, evidence: "wrapModelCall middleware evidence was detected." },
    { signal: "wrap-tool-call", pattern: /wrapToolCall|WrapToolCallHook|ToolCallRequest|ToolCallHandler/i, evidence: "wrapToolCall middleware evidence was detected." },
    { signal: "before-model", pattern: /beforeModel/i, evidence: "beforeModel middleware evidence was detected." },
    { signal: "after-model", pattern: /afterModel/i, evidence: "afterModel middleware evidence was detected." },
    { signal: "before-agent", pattern: /beforeAgent/i, evidence: "beforeAgent middleware evidence was detected." },
    { signal: "after-agent", pattern: /afterAgent/i, evidence: "afterAgent middleware evidence was detected." },
    { signal: "dynamic-tool", pattern: /dynamic tool|dynamically registered|request\.tool|handler\(\{\s*\.\.\.request,\s*tool|dynamicTool/i, evidence: "dynamic middleware tool evidence was detected." },
    { signal: "hitl-interrupt", pattern: /humanInTheLoopMiddleware|interruptOn|interrupt\(|HITLRequest/i, evidence: "human-in-the-loop interrupt evidence was detected." },
    { signal: "hitl-review-config", pattern: /reviewConfigs|allowedDecisions|actionRequests|ApproveDecision|EditDecision|RejectDecision|approve|edit|reject/i, evidence: "HITL review config evidence was detected." },
    { signal: "headless-tool", pattern: /HeadlessTool\b|createHeadlessTool|langchain\/tools|tools\/headless|headless tool/i, evidence: "LangChain headless tool evidence was detected." },
    { signal: "headless-tool-overload", pattern: /HeadlessToolOverload|HeadlessToolFields|without an implementation function|no implementation needed|funcOrFields/i, evidence: "headless tool overload evidence was detected." },
    { signal: "headless-tool-implementation", pattern: /HeadlessToolImplementation|\.implement\s*\(|useStream\s*\(|client-side implementation|typed arguments from the interrupt payload/i, evidence: "headless tool client implementation evidence was detected." },
    { signal: "headless-tool-interrupt", pattern: /interrupt\(\s*\{|interrupt agent execution|interrupt payload|config\?\.toolCall\?\.id|toolCall\s*:\s*\{|ToolRunnableConfig/i, evidence: "headless tool interrupt payload evidence was detected." },
    { signal: "headless-tool-metadata", pattern: /headlessTool\s*:?\s*true|headlessTool metadata|metadata\s*:\s*\{[\s\S]{0,160}headlessTool/i, evidence: "headless tool metadata evidence was detected." },
    { signal: "summarization-middleware", pattern: /summarizationMiddleware|DEFAULT_SUMMARY_PROMPT|trimMessages|REMOVE_ALL_MESSAGES|TokenCounter|countTokensApproximately/i, evidence: "conversation summarization middleware evidence was detected." },
    { signal: "context-editing", pattern: /contextEditingMiddleware|ContextEdit|context_editing|edits\s*:/i, evidence: "context editing middleware evidence was detected." },
    { signal: "context-clear-tool-uses", pattern: /ClearToolUsesEdit|clearToolInputs|excludeTools|placeholder|clear_tool_uses/i, evidence: "clear-tool-uses context editing evidence was detected." },
    { signal: "llm-tool-selector", pattern: /llmToolSelectorMiddleware|LLMToolSelector|LLMToolSelectorOptionsSchema|createToolSelectionResponse|maxTools|alwaysInclude/i, evidence: "LLM tool selector middleware evidence was detected." },
    { signal: "ai-message-tool-calls", pattern: /AIMessage|tool_calls|invalid_tool_calls|contentBlocks|missingContentBlockToolCalls|missingToolCalls/i, evidence: "AIMessage tool call field evidence was detected." },
    { signal: "fake-model-tool-calls", pattern: /respondWithTools|nextToolCallId|fake_tc_|toolCalls:\s*toolCalls\.map|type:\s*["']tool_call["']/i, evidence: "fake model tool-call response evidence was detected." },
    { signal: "tool-call-parser", pattern: /defaultToolCallParser|InvalidToolCall|additional_kwargs\?\.tool_calls|rawToolCalls/i, evidence: "tool call parser evidence was detected." },
    { signal: "tool-call-chunk", pattern: /ToolCallChunk|tool_call_chunks|collapseToolCallChunks|tool_call_chunk/i, evidence: "tool call chunk evidence was detected." },
    { signal: "tool-message-artifact", pattern: /ToolMessageFields|ToolMessageChunk|DirectToolOutput|isDirectToolOutput|lc_direct_tool_output|artifact|tool_call_id/i, evidence: "ToolMessage artifact/direct output evidence was detected." },
    { signal: "tool-message-status", pattern: /ToolMessageFields|ToolMessageChunk|status\s*:\s*["'](?:success|error)["']|_mergeStatus/i, evidence: "ToolMessage status evidence was detected." },
    { signal: "tool-response-format", pattern: /ResponseFormat|responseFormat|content_and_artifact/i, evidence: "tool response format evidence was detected." },
    { signal: "tool-return-type", pattern: /ToolReturnType|ToolOutputType|ToolEventType|InferToolEventFromFunc|InferToolOutputFromFunc/i, evidence: "tool return/event type evidence was detected." },
    { signal: "tool-content-artifact-format", pattern: /ContentAndArtifact|content_and_artifact|Tool response format|two-tuple|artifact/i, evidence: "content and artifact tool output evidence was detected." },
    { signal: "direct-tool-output", pattern: /DirectToolOutput|isDirectToolOutput|lc_direct_tool_output/i, evidence: "direct tool output bypass evidence was detected." },
    { signal: "tool-output-formatting", pattern: /_formatToolOutput|Tool response format|_stringify|toolCallId|status\s*:\s*["']success["']/i, evidence: "tool output formatting evidence was detected." },
    { signal: "tool-runnable-config", pattern: /ToolRunnableConfig|defaultConfig|config\.toolCall|toolCallId|verboseParsingErrors|extras/i, evidence: "tool runnable config evidence was detected." },
    { signal: "dynamic-tool-wrapper", pattern: /\btool\s*\(|ToolWrapperParams|DynamicToolInput|isSimpleStringZodSchema|validatesOnlyStrings/i, evidence: "LangChain tool() wrapper overload evidence was detected." },
    { signal: "dynamic-structured-tool", pattern: /DynamicStructuredTool|DynamicStructuredToolInput|schema:\s*SchemaT|ToolWrapperParams<SchemaT/i, evidence: "LangChain dynamic structured tool evidence was detected." },
    { signal: "tool-input-parsing-exception", pattern: /ToolInputParsingException|Received tool input did not match expected schema|interopParseAsync|validate\(/i, evidence: "LangChain tool input parsing error evidence was detected." },
    { signal: "tool-callback-lifecycle", pattern: /handleToolStart|handleToolEvent|handleToolError|handleToolEnd|CallbackManagerForToolRun/i, evidence: "LangChain tool callback lifecycle evidence was detected." },
    { signal: "tool-wrapper-runtime-config", pattern: /AsyncLocalStorageProviderSingleton|runWithConfig|patchConfig|pickRunnableConfigKeys|runManager\?\.getChild/i, evidence: "LangChain tool wrapper runtime config propagation evidence was detected." },
    { signal: "tool-wrapper-abort-signal", pattern: /getAbortSignalError|config\?\.signal|addEventListener\(["']abort["']|removeEventListener\(["']abort["']/i, evidence: "LangChain tool wrapper abort-signal evidence was detected." },
    { signal: "openai-function-conversion", pattern: /convertToOpenAIFunction|FunctionDefinition|OpenAI function format/i, evidence: "OpenAI function conversion evidence was detected." },
    { signal: "openai-tool-conversion", pattern: /convertToOpenAITool|ToolDefinition|type\s*:\s*["']function["']/i, evidence: "OpenAI tool conversion evidence was detected." },
    { signal: "tool-strict-schema", pattern: /strict\??\s*:|fieldsCopy\?\.strict|strict\s*!==\s*undefined/i, evidence: "tool strict schema propagation evidence was detected." },
    { signal: "tool-json-schema-conversion", pattern: /toJsonSchema|toJSONSchema|zodToJsonSchema|StandardJSONSchemaV1|isStandardJsonSchema/i, evidence: "tool JSON Schema conversion evidence was detected." },
    { signal: "tool-json-schema-cache", pattern: /_jsonSchemaCache|WeakMap<object,\s*JSONSchema>|canCache|cached|schema object reference/i, evidence: "tool JSON Schema cache evidence was detected." },
    { signal: "tool-schema-type-guards", pattern: /isLangChainTool|isStructuredTool|isStructuredToolParams|isRunnableToolLike|RunnableToolLike/i, evidence: "tool schema type guard evidence was detected." },
    { signal: "server-tool-call-block", pattern: /server_tool_call|server_tool_call_chunk|server_tool_call_result|ServerToolCall|ServerToolCallChunk|ServerToolCallResult/i, evidence: "server tool call content block evidence was detected." },
    { signal: "mcp-tool", pattern: /MCP|ModelContextProtocol|@modelcontextprotocol|@langchain\/mcp-adapters|langchain-mcp-adapters/i, evidence: "MCP tool evidence was detected." },
    { signal: "mcp-client", pattern: /@modelcontextprotocol\/sdk|\bClient\b|MCPClient|MCPInstance/i, evidence: "MCP client evidence was detected." },
    { signal: "mcp-load-tools", pattern: /loadMcpTools|defaultLoadMcpToolsOptions|DynamicStructuredTool/i, evidence: "MCP loadMcpTools adapter evidence was detected." },
    { signal: "mcp-list-tools-pagination", pattern: /listTools\s*\(\s*\{\s*cursor|nextCursor|cursor\s*:/i, evidence: "MCP listTools cursor pagination evidence was detected." },
    { signal: "mcp-json-schema-deref", pattern: /dereferenceJsonSchema|resolveRefs|\$defs|definitions|circular/i, evidence: "MCP JSON Schema dereference evidence was detected." },
    { signal: "mcp-schema-simplify", pattern: /simplifyJsonSchemaForLLM|deepMergeSchemas|extractPropertiesFromConditional|allOf|anyOf|oneOf|if\s+then\s+else|unevaluatedProperties/i, evidence: "MCP schema simplification evidence was detected." },
    { signal: "mcp-tool-hooks", pattern: /ToolHooks|toolHooksSchema|ToolCallRequest|ToolCallModification|ModifiedToolCallResult/i, evidence: "MCP tool hook type evidence was detected." },
    { signal: "mcp-before-tool-call", pattern: /beforeToolCall/i, evidence: "MCP beforeToolCall hook evidence was detected." },
    { signal: "mcp-after-tool-call", pattern: /afterToolCall/i, evidence: "MCP afterToolCall hook evidence was detected." },
    { signal: "mcp-artifact-content", pattern: /ExtendedArtifact|ExtendedContent|_embeddedResourceToStandardFileBlocks|_toolOutputToContentBlocks|resource_link|embeddedResource|readResource/i, evidence: "MCP artifact/content block evidence was detected." },
    { signal: "mcp-structured-content", pattern: /structuredContent|mcp_structured_content|_convertCallToolResult|CallToolResult/i, evidence: "MCP structured content evidence was detected." },
    { signal: "mcp-meta-artifact", pattern: /mcp_meta|_meta|ExtendedArtifact/i, evidence: "MCP metadata/artifact evidence was detected." },
    { signal: "mcp-command-result", pattern: /\bCommand\b|new\s+Command|@langchain\/langgraph/i, evidence: "LangGraph Command result evidence was detected." },
    { signal: "mcp-tool-message", pattern: /ToolMessage|ToolMessage\.isInstance/i, evidence: "ToolMessage result evidence was detected." },
    { signal: "mcp-client-fork", pattern: /\.fork\s*\(|client\.fork|headers\s*:/i, evidence: "MCP client fork/header evidence was detected." },
    { signal: "mcp-progress-callback", pattern: /onProgress|progressToken|CallbackManagerForToolRun/i, evidence: "MCP progress callback evidence was detected." },
    { signal: "mcp-tool-exception", pattern: /ToolException|isToolException|throwOnLoadError/i, evidence: "MCP tool exception/load-error evidence was detected." },
    { signal: "mcp-output-handling", pattern: /outputHandling|content_and_artifact|useStandardContentBlocks|_getOutputTypeForContentType/i, evidence: "MCP output handling evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "tool", "signal");
}

function llmReadinessRetrievalSignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["retrievalSignals"] {
  const specs: Array<{ signal: LlmReadinessReport["retrievalSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vector-store", pattern: /VectorStore|MemoryVectorStore|Chroma|Pinecone|FAISS|pgvector|RedisVector|MongoDBAtlasVectorSearch/i, evidence: "vector store evidence was detected." },
    { signal: "retriever", pattern: /Retriever|asRetriever|BaseRetriever|createRetrieverTool/i, evidence: "retriever evidence was detected." },
    { signal: "embeddings", pattern: /Embeddings|OpenAIEmbeddings|embedQuery|embedDocuments/i, evidence: "embeddings evidence was detected." },
    { signal: "text-splitter", pattern: /TextSplitter|RecursiveCharacterTextSplitter|TokenTextSplitter|splitDocuments/i, evidence: "text splitter evidence was detected." },
    { signal: "document-loader", pattern: /DocumentLoader|PDFLoader|CSVLoader|WebBaseLoader|loadAndSplit/i, evidence: "document loader evidence was detected." },
    { signal: "rag-chain", pattern: /RetrievalQAChain|createRetrievalChain|stuffDocumentsChain|RAG|context\s*:/i, evidence: "RAG chain/context evidence was detected." },
    { signal: "retriever-tool", pattern: /createRetrieverTool|DynamicStructuredToolInput|DynamicStructuredTool/i, evidence: "LangChain retriever tool wrapper evidence was detected." },
    { signal: "retriever-tool-schema", pattern: /query to look up in retriever|Natural language query used as input to the retriever|z\.object\(\{[\s\S]{0,160}(query|input)\s*:/i, evidence: "retriever tool query schema evidence was detected." },
    { signal: "retriever-callback-child", pattern: /CallbackManagerForToolRun|runManager\?\.getChild\(["']retriever["']\)|getChild\(["']retriever["']\)/i, evidence: "retriever tool child callback evidence was detected." },
    { signal: "retriever-document-format", pattern: /formatDocumentsAsString|format documents|DocumentInterface/i, evidence: "retriever document formatting evidence was detected." },
    { signal: "base-retriever", pattern: /BaseRetriever|BaseRetrieverInput|BaseRetrieverInterface|_getRelevantDocuments/i, evidence: "LangChain BaseRetriever contract evidence was detected." },
    { signal: "retriever-run-config", pattern: /ensureConfig|parseCallbackConfigArg|RunnableConfig|callbacks|tags|metadata|verbose/i, evidence: "LangChain retriever run configuration evidence was detected." },
    { signal: "retriever-start-event", pattern: /handleRetrieverStart|runId|runName/i, evidence: "LangChain retriever start callback evidence was detected." },
    { signal: "retriever-end-event", pattern: /handleRetrieverEnd/i, evidence: "LangChain retriever end callback evidence was detected." },
    { signal: "retriever-error-event", pattern: /handleRetrieverError/i, evidence: "LangChain retriever error callback evidence was detected." },
    { signal: "fake-retriever", pattern: /FakeRetriever|lc_namespace\s*=\s*\[["']test["'],\s*["']fake["']\]/i, evidence: "LangChain FakeRetriever testing evidence was detected." },
    { signal: "document-transformer", pattern: /BaseDocumentTransformer|documents\/transformers|lc_namespace\s*=\s*\["langchain_core",\s*"documents",\s*"transformers"\]/i, evidence: "LangChain document transformer evidence was detected." },
    { signal: "mapping-document-transformer", pattern: /MappingDocumentTransformer|_transformDocument|newDocuments/i, evidence: "LangChain mapping document transformer evidence was detected." },
    { signal: "transform-documents", pattern: /transformDocuments|invoke\(input[\s\S]{0,120}transformDocuments/i, evidence: "LangChain transformDocuments evidence was detected." },
    { signal: "document-compressor", pattern: /BaseDocumentCompressor|document_compressors/i, evidence: "LangChain document compressor evidence was detected." },
    { signal: "compress-documents", pattern: /compressDocuments|isBaseDocumentCompressor/i, evidence: "LangChain compressDocuments evidence was detected." },
    { signal: "base-document-loader", pattern: /BaseDocumentLoader|DocumentLoader|load\(\):\s*Promise<Document\[\]>/i, evidence: "LangChain base document loader evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "retrieval", "signal");
}

function llmReadinessStructuredOutputSignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["structuredOutputSignals"] {
  const specs: Array<{ signal: LlmReadinessReport["structuredOutputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "output-parser", pattern: /OutputParser|StructuredOutputParser|StringOutputParser|JsonOutputParser|parse\s*\(/i, evidence: "output parser evidence was detected." },
    { signal: "zod-schema", pattern: /z\.object|zod|ZodSchema|schema\s*:/i, evidence: "Zod/schema validation evidence was detected." },
    { signal: "with-structured-output", pattern: /withStructuredOutput|structuredOutput|response_format/i, evidence: "structured output evidence was detected." },
    { signal: "content-parser-factory", pattern: /createContentParser|StructuredOutputParser\.fromZodSchema|StandardSchemaOutputParser\.fromSerializableSchema|JsonOutputParser<|isSerializableSchema|isInteropZodSchema/i, evidence: "structured output content parser factory evidence was detected." },
    { signal: "function-calling-parser-factory", pattern: /createFunctionCallingParser|FunctionCallingParserConstructor|JsonOutputKeyToolsParser|returnSingle|keyName/i, evidence: "structured output function-calling parser factory evidence was detected." },
    { signal: "structured-output-pipeline", pattern: /assembleStructuredOutputPipeline|StructuredOutputRunnable|StructuredOutput|llm\.pipe\(outputParser\)/i, evidence: "structured output runnable pipeline evidence was detected." },
    { signal: "include-raw-output", pattern: /includeRaw|raw LLM response|raw:\s*BaseMessage/i, evidence: "includeRaw structured output evidence was detected." },
    { signal: "raw-parsed-output", pattern: /raw:\s*BaseMessage|parsed:\s*RunOutput|raw parsed|\{\s*raw:\s*llm\s*\}/i, evidence: "raw/parsed structured output shape evidence was detected." },
    { signal: "parser-fallback", pattern: /parsedWithFallback|parserNone|parsed:\s*\(\)\s*=>\s*null|withFallbacks\(\{\s*fallbacks/i, evidence: "structured output parser fallback evidence was detected." },
    { signal: "parser-assign", pattern: /parserAssign|RunnablePassthrough\.assign|outputParser\.invoke\(input\.raw/i, evidence: "structured output parser assignment evidence was detected." },
    { signal: "json-schema", pattern: /json_schema|JSONSchema|JsonSchema|schemaType/i, evidence: "JSON Schema evidence was detected." },
    { signal: "function-calling", pattern: /function_call|tool_calls|OpenAIFunctions|functions\s*:/i, evidence: "function/tool calling output evidence was detected." },
    { signal: "response-format", pattern: /responseFormat|ResponseFormatInput|ResponseFormat\b/i, evidence: "LangChain agent responseFormat evidence was detected." },
    { signal: "structured-response", pattern: /structuredResponse|structured output state key|structured response/i, evidence: "structuredResponse output state evidence was detected." },
    { signal: "fake-model-structured-response", pattern: /_structuredResponseValue|structuredResponse\s*\(\s*(?:value|\{)|fakeModel\(\)[\s\S]{0,320}\.structuredResponse|withStructuredOutput[\s\S]{0,220}_structuredResponseValue/i, evidence: "fake model structured response evidence was detected." },
    { signal: "tool-strategy", pattern: /ToolStrategy|toolStrategy\s*\(|ToolResponseFormat/i, evidence: "LangChain toolStrategy structured output evidence was detected." },
    { signal: "provider-strategy", pattern: /ProviderStrategy|providerStrategy\s*\(|native structured output/i, evidence: "LangChain providerStrategy structured output evidence was detected." },
    { signal: "typed-tool-strategy", pattern: /TypedToolStrategy|Branded type for ToolStrategy arrays/i, evidence: "TypedToolStrategy evidence was detected." },
    { signal: "transform-response-format", pattern: /transformResponseFormat|fromSchema\(responseFormat|fromSchema\(schema/i, evidence: "response format transformation evidence was detected." },
    { signal: "response-format-undefined", pattern: /ResponseFormatUndefined|__responseFormatUndefined/i, evidence: "responseFormat undefined sentinel evidence was detected." },
    { signal: "json-schema-support", pattern: /hasSupportForJsonSchemaOutput|profile\.structuredOutput|structuredOutput\s*[:=]{1,3}\s*true/i, evidence: "native JSON schema support detection evidence was detected." },
    { signal: "structured-output-errors", pattern: /StructuredOutputParsingError|MultipleStructuredOutputsError|ToolStrategyError/i, evidence: "structured output parsing or multiplicity error evidence was detected." },
    { signal: "tool-strategy-options", pattern: /ToolStrategyOptions|handleError|toolMessageContent/i, evidence: "toolStrategy error handling option evidence was detected." },
    { signal: "base-output-parser", pattern: /BaseLLMOutputParser|BaseOutputParser|FormatInstructionsOptions|parseResultWithPrompt|parseWithPrompt|getFormatInstructions|OutputParserException|OUTPUT_PARSING_FAILURE/i, evidence: "base output parser contract evidence was detected." },
    { signal: "transform-output-parser", pattern: /BaseTransformOutputParser|_transformStreamWithConfig|runType:\s*["']parser["']/i, evidence: "transform output parser evidence was detected." },
    { signal: "cumulative-output-parser", pattern: /BaseCumulativeTransformOutputParser|parsePartialResult|BaseCumulativeTransformOutputParserInput|deepCompareStrict/i, evidence: "cumulative transform output parser evidence was detected." },
    { signal: "json-output-parser", pattern: /JsonOutputParser|parseJsonMarkdown|parsePartialJson|_concatOutputChunks/i, evidence: "JSON output parser evidence was detected." },
    { signal: "string-output-parser", pattern: /StringOutputParser|StrOutputParser|_messageContentToString|_baseMessageContentToString/i, evidence: "string output parser evidence was detected." },
    { signal: "bytes-output-parser", pattern: /BytesOutputParser|TextEncoder|Uint8Array/i, evidence: "bytes output parser evidence was detected." },
    { signal: "list-output-parser", pattern: /ListOutputParser|CommaSeparatedListOutputParser|CustomListOutputParser|NumberedListOutputParser|MarkdownListOutputParser/i, evidence: "list output parser evidence was detected." },
    { signal: "xml-output-parser", pattern: /XMLOutputParser|XML_FORMAT_INSTRUCTIONS|parseXMLMarkdown|sax\.parser/i, evidence: "XML output parser evidence was detected." },
    { signal: "standard-schema-output-parser", pattern: /StandardSchemaOutputParser|fromSerializableSchema|StandardSchemaV1|\["~standard"\]\.validate/i, evidence: "standard schema output parser evidence was detected." },
    { signal: "openai-functions-parser", pattern: /OutputFunctionsParser|JsonOutputFunctionsParser|JsonKeyOutputFunctionsParser|function_call|argsOnly|attrName/i, evidence: "OpenAI functions output parser evidence was detected." },
    { signal: "openai-tools-parser", pattern: /JsonOutputToolsParser|JsonOutputKeyToolsParser|ParsedToolCall|parseToolCall|convertLangChainToolCallToOpenAI|makeInvalidToolCall|returnId|returnSingle|keyName/i, evidence: "OpenAI tools output parser evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "structured output", "signal");
}

function llmReadinessStreamingSignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["streamingSignals"] {
  const specs: Array<{ signal: LlmReadinessReport["streamingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "stream", pattern: /\.stream\s*\(|streamText|streamObject|streaming\s*:/i, evidence: "streaming evidence was detected." },
    { signal: "stream-events", pattern: /streamEvents|streamLog|on_llm_new_token|handleLLMNewToken/i, evidence: "stream events evidence was detected." },
    { signal: "callbacks", pattern: /callbacks|CallbackManager|handleLLMStart|handleLLMEnd/i, evidence: "callback evidence was detected." },
    { signal: "tracing", pattern: /traceable|tracing|runName|tags\s*:|metadata\s*:/i, evidence: "tracing metadata evidence was detected." },
    { signal: "langsmith", pattern: /LangSmith|LANGSMITH|smith\.langchain/i, evidence: "LangSmith evidence was detected." },
    { signal: "token-usage", pattern: /tokenUsage|usage_metadata|completion_tokens|prompt_tokens|total_tokens/i, evidence: "token usage evidence was detected." },
    { signal: "agent-run-stream", pattern: /AgentRunStream|GraphRunStream|run\.toolCalls|run\.messages|run\.extensions/i, evidence: "agent run stream projection evidence was detected." },
    { signal: "chat-model-stream", pattern: /ChatModelStream|AsyncIterable<ChatModelStreamEvent>|PromiseLike<AIMessage>/i, evidence: "ChatModelStream facade evidence was detected." },
    { signal: "text-content-stream", pattern: /TextContentStream|text-delta|get text\(\)|accumulated text/i, evidence: "text content substream evidence was detected." },
    { signal: "tool-calls-substream", pattern: /ToolCallsStream|toolCalls|ContentBlock\.Tools\.ToolCall|tool_call_chunk/i, evidence: "tool call substream evidence was detected." },
    { signal: "reasoning-content-stream", pattern: /ReasoningContentStream|reasoning-delta|getReasoningDelta|isReasoningContent/i, evidence: "reasoning content substream evidence was detected." },
    { signal: "usage-metadata-stream", pattern: /UsageMetadataStream|normalizeUsage|UsageMetadataLike|usage_metadata/i, evidence: "usage metadata substream evidence was detected." },
    { signal: "replay-buffer", pattern: /ReplayBuffer|waiters|buffer\.iterate|setError\(/i, evidence: "stream replay buffer evidence was detected." },
    { signal: "content-delta-assembly", pattern: /applyDelta|getEventDelta|ContentBlockDelta|text-delta|data-delta|block-delta/i, evidence: "content block delta assembly evidence was detected." },
    { signal: "stream-output-message", pattern: /_assembleMessage|message-start|message-finish|output_version|finish_reason|response_metadata/i, evidence: "stream output message assembly evidence was detected." },
    { signal: "tool-block-standardization", pattern: /standardizeToolBlock|parseToolArgs|tool_use|input_json_delta|type:\s*["']tool_call["']/i, evidence: "tool block standardization evidence was detected." },
    { signal: "stream-transformer", pattern: /streamTransformers|StreamTransformer|NativeStreamTransformer|transformers\s*:|BaseTransformOutputParser|BaseCumulativeTransformOutputParser|parsePartialResult/i, evidence: "stream transformer evidence was detected." },
    { signal: "stream-channel", pattern: /StreamChannel\.(remote|local)|StreamChannel<|eventCount|methods\s*:/i, evidence: "stream channel evidence was detected." },
    { signal: "stream-mode", pattern: /streamMode|text\/event-stream|encoding\s*:\s*["']text\/event-stream["']/i, evidence: "stream mode or SSE encoding evidence was detected." },
    { signal: "http-event-stream-wrapper", pattern: /convertToHttpEventStream|runnables\/wrappers/i, evidence: "LangChain HTTP event stream wrapper evidence was detected." },
    { signal: "event-stream-data-frame", pattern: /event:\s*data|data:\s*\$\{JSON\.stringify\(chunk\)\}|JSON\.stringify\(chunk\)/i, evidence: "HTTP event-stream data frame evidence was detected." },
    { signal: "event-stream-end-frame", pattern: /event:\s*end|controller\.close\(\)/i, evidence: "HTTP event-stream end frame evidence was detected." },
    { signal: "readable-stream-bridge", pattern: /ReadableStream<Uint8Array>|new\s+ReadableStream|controller\.enqueue|TextEncoder/i, evidence: "ReadableStream bridge evidence was detected." },
    { signal: "iterable-readable-stream-adapter", pattern: /IterableReadableStream|fromReadableStream/i, evidence: "IterableReadableStream adapter evidence was detected." },
    { signal: "event-source-content-type", pattern: /EventStreamContentType|event_source_parse|text\/event-stream/i, evidence: "event source content-type evidence was detected." },
    { signal: "event-source-byte-reader", pattern: /getBytes|ReadableStream<Uint8Array>|AsyncIterable<any>|onChunk|flush/i, evidence: "event source byte reader evidence was detected." },
    { signal: "event-source-line-parser", pattern: /getLines|ControlChars|NewLine|CarriageReturn|Space|Colon|fieldLength|discardTrailingNewline/i, evidence: "event source line parser evidence was detected." },
    { signal: "event-source-message-parser", pattern: /getMessages|EventSourceMessage|TextDecoder|newMessage|isEmpty/i, evidence: "event source message parser evidence was detected." },
    { signal: "event-source-retry-id", pattern: /onId|onRetry|parseInt|Number\.isNaN|retry\??:\s*number|id:\s*string/i, evidence: "event source id/retry handling evidence was detected." },
    { signal: "event-source-data-stream", pattern: /convertEventStreamToIterableReadableDataStream|onMetadataEvent|msg\.event\s*===\s*["'](?:metadata|error)["']|controller\.close|IterableReadableStream\.fromReadableStream/i, evidence: "event source data stream conversion evidence was detected." },
    { signal: "tool-call-stream", pattern: /createToolCallTransformer|ToolCallProjection|ToolCallStream|isOwnEvent|isHeadlessToolInterruptError|isSerializedToolMessage|normalizeToolOutput|pendingCalls|resolveOutput|rejectOutput|resolveStatus|resolveError|toolCallsLog.close|toolCallsLog.fail|ToolCallStatus|ToolsEventData|toolCalls|tool-started|tool-finished|tool-error/i, evidence: "tool call stream evidence was detected." },
    { signal: "tool-call-stream-projection", pattern: /ToolCallProjection|createToolCallTransformer|isOwnEvent|run\.toolCalls|toolCallsLog/i, evidence: "tool call stream projection evidence was detected." },
    { signal: "tool-call-output-normalization", pattern: /normalizeToolOutput|isSerializedToolMessage|ToolMessage\.isInstance|kwargs\?\.content/i, evidence: "tool call output normalization evidence was detected." },
    { signal: "headless-tool-stream-interrupt", pattern: /isHeadlessToolInterruptError|payload\.type\s*===\s*["']tool["']|payload\.toolCall\?\.id|toolCallId/i, evidence: "headless tool stream interrupt filtering evidence was detected." },
    { signal: "tool-call-pending-map", pattern: /pendingCalls|resolveOutput|rejectOutput|resolveStatus|resolveError/i, evidence: "tool call pending promise map evidence was detected." },
    { signal: "tool-call-stream-finalize", pattern: /finalize\(\)|toolCallsLog\.close|fail\(err|toolCallsLog\.fail|pendingCalls\.clear/i, evidence: "tool call stream finalize/fail cleanup evidence was detected." },
    { signal: "content-block-stream", pattern: /content-block-delta|content-block-finish|contentBlock|content_block|text-delta/i, evidence: "content block streaming evidence was detected." },
    { signal: "legacy-chat-generation-bridge", pattern: /convertChunksToEvents|_streamResponseChunks|ChatGenerationChunk|AIMessageChunk/i, evidence: "legacy chat generation chunk bridge evidence was detected." },
    { signal: "stream-event-conversion", pattern: /ChatModelStreamEvent|ContentBlockDelta|content-block-start|content-block-delta|text-delta/i, evidence: "chat model stream event conversion evidence was detected." },
    { signal: "stream-active-blocks", pattern: /activeBlocks|nextBlockIndex|part\.index|activeBlocks\.size/i, evidence: "stream active block indexing evidence was detected." },
    { signal: "stream-image-tool-output", pattern: /extractImageBlocksFromToolOutputs|emittedImageKeys|imageToolMessage|mime_type|source_type/i, evidence: "stream image tool-output extraction evidence was detected." },
    { signal: "stream-audio-payload", pattern: /getAudioPayload|MIME_TYPE_BY_AUDIO_FORMAT|MIME_TYPE_BY_IMAGE_FORMAT|AudioStreamState|audioStream/i, evidence: "stream audio payload state evidence was detected." },
    { signal: "stream-abort-signal", pattern: /throwIfAborted|options\?\.signal|AbortSignal/i, evidence: "stream abort signal evidence was detected." },
    { signal: "stream-usage-start", pattern: /message-start|usage_metadata|input_tokens|output_tokens|total_tokens|lastUsage/i, evidence: "stream message-start usage evidence was detected." },
    { signal: "base-callback-handler", pattern: /BaseCallbackHandler|BaseCallbackHandlerInput|ignoreLLM|ignoreChain|ignoreAgent|ignoreRetriever|ignoreCustomEvent|_awaitHandler|raiseError/i, evidence: "base callback handler contract evidence was detected." },
    { signal: "callback-manager-config", pattern: /CallbackManagerOptions|BaseCallbackConfig|parseCallbackConfigArg|CallbackManager\.configure|CallbackManager\.fromHandlers|addHandler|removeHandler|setHandlers/i, evidence: "callback manager configuration evidence was detected." },
    { signal: "callback-run-manager", pattern: /BaseRunManager|CallbackManagerForLLMRun|CallbackManagerForChainRun|CallbackManagerForToolRun|CallbackManagerForRetrieverRun|inheritableHandlers|inheritableTags|inheritableMetadata|getParentRunId|getChild/i, evidence: "callback run manager evidence was detected." },
    { signal: "custom-event-dispatch", pattern: /dispatchCustomEvent|handleCustomEvent|ignoreCustomEvent|callbacks\/dispatch/i, evidence: "custom callback event dispatch evidence was detected." },
    { signal: "custom-event-node-dispatch", pattern: /callbacks\/dispatch["']|dispatchCustomEventWeb|AsyncLocalStorageProviderSingleton\.initializeGlobalInstance|AsyncLocalStorage/i, evidence: "Node custom event dispatch entrypoint evidence was detected." },
    { signal: "custom-event-web-dispatch", pattern: /callbacks\/dispatch\/web|dispatchCustomEventWeb|explicitly pass in a config parameter/i, evidence: "web custom event dispatch entrypoint evidence was detected." },
    { signal: "custom-event-config-required", pattern: /Unable to dispatch a custom event without a parent run id|ensureConfig\(config\)|RunnableConfig|getCallbackManagerForConfig/i, evidence: "custom event config requirement evidence was detected." },
    { signal: "custom-event-parent-run", pattern: /parentRunId|getParentRunId|handleCustomEvent\?\([^)]*parentRunId/i, evidence: "custom event parent run routing evidence was detected." },
    { signal: "custom-event-async-local", pattern: /AsyncLocalStorageProviderSingleton|initializeGlobalInstance|node:async_hooks|AsyncLocalStorage/i, evidence: "custom event async-local storage evidence was detected." },
    { signal: "event-stream-callback", pattern: /EventStreamCallbackHandler|EventStreamCallbackHandlerInput|StreamEvent|StreamEventData|isStreamEventsHandler|includeNames|includeTypes|includeTags|excludeNames|excludeTypes|excludeTags/i, evidence: "event stream callback handler evidence was detected." },
    { signal: "log-stream-json-patch", pattern: /JSONPatchOperation|applyPatch|RunLogPatch|RunLog\.fromRunLogPatch|fromRunLogPatch|states\[states\.length\s*-\s*1\]\.newDocument/i, evidence: "log stream JSON Patch reconstruction evidence was detected." },
    { signal: "log-stream-run-state", pattern: /LogEntry|RunState|streamed_output_str|streamed_output|final_output|end_time|logs/i, evidence: "log stream run state evidence was detected." },
    { signal: "log-stream-filtering", pattern: /LogStreamCallbackHandlerInput|includeNames|includeTypes|includeTags|excludeNames|excludeTypes|excludeTags|_includeRun|_schemaFormat|streaming_events/i, evidence: "log stream include/exclude filter evidence was detected." },
    { signal: "log-stream-writer", pattern: /TransformStream|writable\.getWriter|writer|receiveStream|IterableReadableStream\.fromReadableStream|Symbol\.asyncIterator|lc_prefer_streaming/i, evidence: "log stream writer and receive stream evidence was detected." },
    { signal: "log-stream-output-tap", pattern: /tapOutputIterable|keyMapByRunId|counterMapByRunName|\/logs\/\$\{(?:key|runName)\}\/streamed_output|streamed_output_str|onLLMNewToken/i, evidence: "log stream output tap evidence was detected." },
    { signal: "log-stream-standardized-io", pattern: /_getStandardizedInputs|_getStandardizedOutputs|isChatGenerationChunk|AIMessageChunk|\/logs\/\$\{runName\}\/inputs|\/logs\/\$\{runName\}\/final_output|\/final_output|writer\.close/i, evidence: "log stream standardized input/output evidence was detected." },
    { signal: "log-stream-callback", pattern: /LogStreamCallbackHandler|LogStreamCallbackHandlerInput|RunLogPatch|RunLog|RunState|LogEntry|SchemaFormat|isLogStreamHandler|streaming_events/i, evidence: "log stream callback handler evidence was detected." },
    { signal: "run-collector-tracer", pattern: /RunCollectorCallbackHandler|run_collector|tracedRuns|exampleId|reference_example_id/i, evidence: "run collector tracer evidence was detected." },
    { signal: "root-listener-tracer", pattern: /RootListenersTracer|onRunCreate|onRunUpdate|argOnStart|argOnEnd|argOnError|rootId/i, evidence: "root listener tracer evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "streaming", "signal");
}

function llmReadinessSafetySignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["safetySignals"] {
  const specs: Array<{ signal: LlmReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "guardrail", pattern: /guardrail|policy|safety|jailbreak|prompt injection/i, evidence: "guardrail/safety policy evidence was detected." },
    { signal: "moderation", pattern: /moderation|moderate|contentFilter|safetySettings/i, evidence: "moderation evidence was detected." },
    { signal: "refusal", pattern: /refusal|refuse|blocked|unsafe/i, evidence: "refusal/blocked output evidence was detected." },
    { signal: "retry", pattern: /retry|withRetry|maxRetries|backoff/i, evidence: "retry evidence was detected." },
    { signal: "fallback", pattern: /fallback|withFallbacks|backupModel/i, evidence: "fallback evidence was detected." },
    { signal: "rate-limit", pattern: /rateLimit|rate-limit|429|quota|throttle/i, evidence: "rate limit evidence was detected." },
    { signal: "model-retry", pattern: /modelRetryMiddleware|ModelRetryMiddlewareOptionsSchema|wrapModelCall.*maxRetries|shouldRetryException/i, evidence: "LangChain model retry middleware evidence was detected." },
    { signal: "tool-retry", pattern: /toolRetryMiddleware|ToolRetryMiddlewareOptionsSchema|wrapToolCall.*maxRetries|shouldRetryTool/i, evidence: "LangChain tool retry middleware evidence was detected." },
    { signal: "human-in-the-loop", pattern: /humanInTheLoopMiddleware|interruptOn|interrupt\(|HITLRequest|HeadlessTool|headlessTool|allowedDecisions|reviewConfigs/i, evidence: "human-in-the-loop safety gate evidence was detected." },
    { signal: "pii-detection", pattern: /piiMiddleware|PIIDetectionError|PIIMatch|BuiltInPIIType|detectEmail|detectCreditCard|detectIP|detectMacAddress|detectUrl/i, evidence: "LangChain PII detection middleware evidence was detected." },
    { signal: "pii-redaction", pattern: /strategy\s*:\s*["']redact["']|applyRedactStrategy|REDACTED_|redaction/i, evidence: "PII redaction strategy evidence was detected." },
    { signal: "pii-mask", pattern: /strategy\s*:\s*["']mask["']|applyMaskStrategy|masking|masked/i, evidence: "PII masking strategy evidence was detected." },
    { signal: "pii-hash", pattern: /strategy\s*:\s*["']hash["']|applyHashStrategy|sha256|_hash:/i, evidence: "PII hash strategy evidence was detected." },
    { signal: "pii-block", pattern: /strategy\s*:\s*["']block["']|PIIDetectionError|block PII/i, evidence: "PII block strategy evidence was detected." },
    { signal: "openai-moderation", pattern: /openAIModerationMiddleware|OpenAIModerationMiddleware|OpenAIModerationError|omni-moderation|moderationModel/i, evidence: "OpenAI moderation middleware evidence was detected." },
    { signal: "moderation-jump", pattern: /canJumpTo\s*:\s*\[\s*["']end["']|jumpTo\s*:\s*["']end["']|exitBehavior\s*:\s*["']end["']/i, evidence: "moderation jump-to-end behavior evidence was detected." },
    { signal: "prompt-caching", pattern: /anthropicPromptCachingMiddleware|PromptCachingMiddleware|cache_control|enableCaching|minMessagesToCache|unsupportedModelBehavior/i, evidence: "Anthropic prompt caching middleware evidence was detected." },
    { signal: "model-call-limit", pattern: /modelCallLimitMiddleware|ModelCallLimitMiddlewareError|threadModelCallCount|runModelCallCount|threadLimit|runLimit/i, evidence: "model call limit middleware evidence was detected." },
    { signal: "tool-call-limit", pattern: /toolCallLimitMiddleware|ToolCallLimitExceededError|ToolCallLimitOptionsSchema|threadToolCallCount|runToolCallCount/i, evidence: "tool call limit middleware evidence was detected." },
    { signal: "serialized-load-trust-boundary", pattern: /\bload\(|LoadOptions|insecure deserialization|trusted source|user-supplied|executable configuration/i, evidence: "serialized load trust-boundary evidence was detected." },
    { signal: "serialized-constructor-load", pattern: /SerializedConstructor|reviver|class instantiation|constructor kwargs|new \(builder as any\)|mapKeys\(/i, evidence: "serialized constructor instantiation evidence was detected." },
    { signal: "serialized-secret-map", pattern: /SerializedSecret|secretsMap|secretsFromEnv|getEnvironmentVariable|replaceSecrets|lc_secrets/i, evidence: "serialized secret map/env handling evidence was detected." },
    { signal: "serialized-import-map", pattern: /optionalImportsMap|optionalImportEntrypoints|importMap|defaultOptionalImportEntrypoints|Invalid namespace/i, evidence: "serialized import allowlist evidence was detected." },
    { signal: "serialized-escape-marker", pattern: /LC_ESCAPED_KEY|__lc_escaped__|needsEscaping|escapeObject|isEscapedObject|unescapeValue|serializeValue|serializeLcObject/i, evidence: "serialized escape marker evidence was detected." },
    { signal: "serialized-depth-limit", pattern: /maxDepth|DEFAULT_MAX_DEPTH|Maximum recursion depth|depth \+ 1|malicious payload/i, evidence: "serialized load recursion depth limit evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function llmReadinessPackageSignals(sourceFiles: LlmReadinessSourceFile[]): LlmReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LlmReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "langchain", pattern: /"langchain"|from ["']langchain["']|require\(["']langchain["']\)/i, evidence: "langchain package evidence was detected." },
    { signal: "@langchain/core", pattern: /"@langchain\/core"|from ["']@langchain\/core/i, evidence: "@langchain/core evidence was detected." },
    { signal: "@langchain/openai", pattern: /"@langchain\/openai"|from ["']@langchain\/openai/i, evidence: "@langchain/openai evidence was detected." },
    { signal: "@langchain/mcp-adapters", pattern: /"@langchain\/mcp-adapters"|from ["']@langchain\/mcp-adapters|loadMcpTools|ToolHooks/i, evidence: "@langchain/mcp-adapters evidence was detected." },
    { signal: "@langchain/langgraph", pattern: /"@langchain\/langgraph"|from ["']@langchain\/langgraph|\bCommand\b|StateGraph|LangGraph/i, evidence: "@langchain/langgraph evidence was detected." },
    { signal: "@modelcontextprotocol/sdk", pattern: /"@modelcontextprotocol\/sdk"|from ["']@modelcontextprotocol\/sdk|CallToolResult|ModelContextProtocol/i, evidence: "@modelcontextprotocol/sdk evidence was detected." },
    { signal: "ai", pattern: /"ai"|from ["']ai["']|generateText|streamText/i, evidence: "Vercel AI SDK evidence was detected." },
    { signal: "openai", pattern: /"openai"|from ["']openai["']|new\s+OpenAI/i, evidence: "OpenAI SDK evidence was detected." },
    { signal: "@anthropic-ai/sdk", pattern: /"@anthropic-ai\/sdk"|from ["']@anthropic-ai\/sdk|ChatAnthropic/i, evidence: "Anthropic SDK evidence was detected." },
    { signal: "llamaindex", pattern: /"llamaindex"|from ["']llamaindex["']|LlamaIndex/i, evidence: "LlamaIndex evidence was detected." },
    { signal: "ollama", pattern: /"ollama"|from ["']ollama["']|ChatOllama|OllamaEmbeddings/i, evidence: "Ollama evidence was detected." }
  ];
  return llmReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function llmReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: LlmReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/llm-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildLlmEvalReadinessReport(walk: WalkResult): Promise<LlmEvalReadinessReport> {
  const sourceFiles = await llmEvalSourceFiles(walk);
  const evalSetups = llmEvalSetups(sourceFiles);
  const configSignals = llmEvalConfigSignals(sourceFiles);
  const promptSignals = llmEvalPromptSignals(sourceFiles);
  const providerSignals = llmEvalProviderSignals(sourceFiles);
  const testCaseSignals = llmEvalTestCaseSignals(sourceFiles);
  const judgeSignals = llmEvalJudgeSignals(sourceFiles);
  const datasetSignals = llmEvalDatasetSignals(sourceFiles);
  const redteamSignals = llmEvalRedteamSignals(sourceFiles);
  const workflowSignals = llmEvalWorkflowSignals(sourceFiles);
  const packageSignals = llmEvalPackageSignals(sourceFiles);

  const hasConfig = configSignals.some((item) => item.readiness === "ready") || evalSetups.length > 0;
  const hasProvider = providerSignals.some((item) => item.readiness === "ready") || evalSetups.some((item) => item.providerCount > 0);
  const hasTests = testCaseSignals.some((item) => item.readiness === "ready") || evalSetups.some((item) => item.testCaseCount > 0 || item.assertionCount > 0);
  const hasJudge = judgeSignals.some((item) => item.readiness === "ready") || evalSetups.some((item) => item.judgeCount > 0);
  const hasDataset = datasetSignals.some((item) => item.readiness === "ready") || evalSetups.some((item) => item.datasetCount > 0);
  const hasRedteam = redteamSignals.some((item) => item.readiness === "ready") || evalSetups.some((item) => item.redteamCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || evalSetups.some((item) => item.outputCount > 0);

  const riskQueue: LlmEvalReadinessReport["riskQueue"] = [];
  if (!hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add an explicit LLM eval config, registry entry, or evaluator source before claiming eval readiness.",
      why: "Prompt and model code alone do not prove that quality checks, datasets, scoring, or reporting can be repeated.",
      relatedHref: "html/llm-eval-readiness.html"
    });
  }
  if (hasConfig && !hasProvider) {
    riskQueue.push({
      priority: "high",
      action: "Record provider, model, completion function, or judge-model configuration for the eval.",
      why: "Eval results are not reproducible unless the model boundary and provider configuration are visible.",
      relatedHref: "html/llm-eval-readiness.html"
    });
  }
  if (hasConfig && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add test cases, vars, assertions, expected outputs, rubrics, or thresholds.",
      why: "Eval configs need concrete cases and pass/fail criteria; provider-only configs are demos, not readiness evidence.",
      relatedHref: "html/llm-eval-readiness.html"
    });
  }
  if ((hasTests || hasJudge) && !hasDataset) {
    riskQueue.push({
      priority: "medium",
      action: "Trace dataset, samples_jsonl, reference output, ideal answer, CSV, or JSONL sources.",
      why: "Datasets and reference outputs make eval changes reviewable across model or prompt changes.",
      relatedHref: "html/llm-eval-readiness.html"
    });
  }
  if (hasProvider && hasTests && !hasJudge) {
    riskQueue.push({
      priority: "low",
      action: "Add or document the LLM-as-judge, rubric, modelgraded spec, or scoring function.",
      why: "Semantic answer quality usually needs a visible judge/rubric path in addition to exact assertions.",
      relatedHref: "html/llm-eval-readiness.html"
    });
  }
  if (hasConfig && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add eval CLI, CI, report output, or dashboard/view workflow commands.",
      why: "Eval readiness improves when learners can see how results are produced and persisted outside RepoTutor.",
      relatedHref: "html/llm-eval-readiness.html"
    });
  }
  if (hasProvider && hasTests && !hasRedteam) {
    riskQueue.push({
      priority: "low",
      action: "Add or document red-team, jailbreak, prompt-injection, PII, or OWASP-style adversarial probes.",
      why: "Quality evals and safety probes answer different questions for production LLM apps.",
      relatedHref: "html/llm-eval-readiness.html"
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `LLM eval readiness report: setup ${evalSetups.length}개, config signal ${configSignals.length}개, test signal ${testCaseSignals.length}개, judge signal ${judgeSignals.length}개, red-team signal ${redteamSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "LLM eval readiness promptfoo promptfooconfig providers prompts tests assert llm-rubric redteam plugins strategies OpenAI evals evals registry samples_jsonl modelgraded_spec completion_fns oaieval OpenEvals create_llm_as_judge createLLMAsJudge correctness hallucination feedbackKey score reference_outputs datasets reports",
    evalSetups,
    configSignals,
    promptSignals,
    providerSignals,
    testCaseSignals,
    judgeSignals,
    datasetSignals,
    redteamSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"promptfooconfig|promptfoo|providers:|prompts:|tests:|assert:\" .", purpose: "Find promptfoo configs, providers, prompts, cases, assertions, and report options." },
      { command: "rg \"redteam:|plugins:|strategies:|jailbreak|prompt-injection|pii|OWASP\" .", purpose: "Review adversarial eval coverage without running probes." },
      { command: "rg \"samples_jsonl|modelgraded_spec|completion_fns|oaieval|evals/registry\" .", purpose: "Map OpenAI eval registry specs, sample datasets, and completion functions." },
      { command: "rg \"create_llm_as_judge|createLLMAsJudge|CORRECTNESS_PROMPT|HALLUCINATION_PROMPT|feedbackKey|score\" .", purpose: "Trace OpenEvals judge prompts, scoring keys, and output score shapes." },
      { command: "promptfoo eval -c <config> --no-cache -o results.json", purpose: "Run promptfoo only in a trusted project environment when provider credentials and cost limits are ready." },
      { command: "oaieval <completion-fn> <eval-name>", purpose: "Run OpenAI eval registry entries only after reviewing model/provider and dataset boundaries." }
    ],
    learnerNextSteps: [
      "먼저 promptfooconfig.yaml, evals/registry, openevals evaluator source, package scripts 중 어디서 eval이 시작되는지 찾으세요.",
      "prompts, providers, tests, assert, vars, expected, rubric을 분리해서 prompt 품질 기준과 모델 경계를 확인하세요.",
      "samples_jsonl, dataset, CSV, JSONL, reference_outputs, ideal 답변이 있으면 재현 가능한 평가 데이터 경로를 추적하세요.",
      "llm-rubric, modelgraded_spec, create_llm_as_judge, createLLMAsJudge, feedbackKey, score는 judge 모델과 채점 기준을 설명합니다.",
      "redteam, plugins, strategies, jailbreak, prompt-injection, PII, OWASP 신호는 품질 eval과 별도로 안전성 경계를 보여줍니다.",
      "이 리포트는 정적 readiness입니다. RepoTutor는 provider 호출, judge 모델 실행, red-team probe 생성, 데이터셋 실행, 점수 계산, 리포트 업로드를 하지 않습니다."
    ]
  };
}

type LlmEvalSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function llmEvalSourceFiles(walk: WalkResult): Promise<LlmEvalSourceFile[]> {
  const files: LlmEvalSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !llmEvalInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!llmEvalPathSignal(file.relPath) && !llmEvalContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function llmEvalInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return llmEvalPathSignal(filePath)
    || /(^|\/)(README|docs?|evals?|evaluation|evaluators?|prompts?|promptfoo|redteam|red-team|benchmarks?|datasets?|fixtures?|tests?|ci|workflows?|scripts?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|pyproject\.toml|setup\.py|promptfooconfig\..*|evals\.ya?ml|evals\.json)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|py|json|jsonl|csv|md|mdx|ya?ml|toml|txt)$/i.test(filePath);
}

function llmEvalPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(evals?|evaluators?|evaluation|promptfoo|redteam|red-team|benchmarks?|datasets?)(\/|\.|-|_|$)/i.test(filePath)
    || /^promptfooconfig(\..*)?\.ya?ml$/i.test(base)
    || /(^|\/)evals\/registry\/(evals|data)\/.*\.(ya?ml|jsonl|json|csv)$/i.test(filePath)
    || /\.github\/workflows\/.*(eval|promptfoo|redteam|benchmark).*\.(ya?ml)$/i.test(filePath);
}

function llmEvalContentSignal(text: string): boolean {
  return /(promptfoo|promptfooconfig|providers\s*:|prompts\s*:|tests\s*:|assert\s*:|llm-rubric|redteam\s*:|plugins\s*:|strategies\s*:|jailbreak|prompt-injection|samples_jsonl|modelgraded_spec|completion_fns|oaieval|create_llm_as_judge|createLLMAsJudge|CORRECTNESS_PROMPT|HALLUCINATION_PROMPT|feedbackKey|reference_outputs|ideal\s*:)/i.test(text);
}

function llmEvalSetups(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["evalSetups"] {
  const rows: LlmEvalReadinessReport["evalSetups"] = [];
  for (const source of sourceFiles) {
    const promptCount = countMatches(source.text, /(^|\n)\s*prompts?\s*:|file:\/\/.*prompt|PromptTemplate|prompt\s*:|few_shot_examples|messages\s*:/gi);
    const providerCount = countMatches(source.text, /(^|\n)\s*providers?\s*:|openai:|anthropic:|gemini|gpt-|claude-|model\s*:|completion_fns|api[_-]?key|OPENAI_API_KEY/gi);
    const testCaseCount = countMatches(source.text, /(^|\n)\s*tests?\s*:|(^|\n)\s*vars\s*:|samples_jsonl|evals\/registry|input\s*:|outputs?\s*:/gi);
    const assertionCount = countMatches(source.text, /(^|\n)\s*assert\s*:|type\s*:\s*(contains|equals|javascript|llm-rubric|model-graded)|expected|threshold|rubric/gi);
    const datasetCount = countMatches(source.text, /samples_jsonl|dataset|datasets|\.jsonl|\.csv|reference_outputs?|ideal\s*:|expected_output|golden/gi);
    const judgeCount = countMatches(source.text, /llm-rubric|modelgraded_spec|create_llm_as_judge|createLLMAsJudge|CORRECTNESS_PROMPT|HALLUCINATION_PROMPT|feedbackKey|score|grader|judge/gi);
    const redteamCount = countMatches(source.text, /redteam\s*:|plugins\s*:|strategies\s*:|jailbreak|prompt-injection|pii|OWASP|MITRE|NIST|excessive-agency/gi);
    const outputCount = countMatches(source.text, /promptfoo\s+(eval|redteam)|oaieval|evaluate\s*\(|-o\s+\S+|output|report|results?\.(json|jsonl|html)|view\b|share\b/gi);
    const totalSignals = promptCount + providerCount + testCaseCount + assertionCount + datasetCount + judgeCount + redteamCount + outputCount;
    if (totalSignals === 0 && !llmEvalPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: llmEvalFramework(source),
      promptCount,
      providerCount,
      testCaseCount,
      assertionCount,
      datasetCount,
      judgeCount,
      redteamCount,
      outputCount,
      readiness: providerCount > 0 && testCaseCount > 0 && (assertionCount > 0 || judgeCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} LLM eval signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.providerCount + b.testCaseCount + b.assertionCount + b.judgeCount + b.datasetCount + b.redteamCount;
    const aScore = a.providerCount + a.testCaseCount + a.assertionCount + a.judgeCount + a.datasetCount + a.redteamCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 90);
}

function llmEvalFramework(source: LlmEvalSourceFile): LlmEvalReadinessReport["evalSetups"][number]["framework"] {
  if (/promptfoo|promptfooconfig|llm-rubric|redteam\s*:|providers\s*:|tests\s*:/i.test(source.filePath) || /promptfoo|promptfooconfig|llm-rubric|redteam\s*:|providers\s*:|tests\s*:/i.test(source.text)) return "promptfoo";
  if (/evals\/registry|oaieval|modelgraded_spec|samples_jsonl|completion_fns/i.test(source.filePath) || /evals\/registry|oaieval|modelgraded_spec|samples_jsonl|completion_fns/i.test(source.text)) return "openai-evals";
  if (/openevals|create_llm_as_judge|createLLMAsJudge|CORRECTNESS_PROMPT|HALLUCINATION_PROMPT/i.test(source.filePath) || /openevals|create_llm_as_judge|createLLMAsJudge|CORRECTNESS_PROMPT|HALLUCINATION_PROMPT/i.test(source.text)) return "openevals";
  if (/langsmith|evaluate\s*\(|Client\s*\(|feedbackKey/i.test(source.text)) return "langsmith";
  if (/eval|judge|rubric|benchmark/i.test(source.filePath) || /eval|judge|rubric|benchmark/i.test(source.text)) return "custom";
  return "unknown";
}

function llmEvalConfigSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["configSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "promptfoo-config", pattern: /promptfooconfig(\..*)?\.ya?ml|promptfoo|providers\s*:|prompts\s*:|tests\s*:/i, evidence: "promptfoo config evidence was detected." },
    { signal: "eval-registry", pattern: /evals\/registry|(^|\n)\s*id\s*:.*eval|evals:\s*/i, evidence: "OpenAI eval registry evidence was detected." },
    { signal: "eval-class", pattern: /class\s*:\s*evals\.|ModelBasedClassify|eval_type\s*:/i, evidence: "eval class evidence was detected." },
    { signal: "samples-jsonl", pattern: /samples_jsonl|samples\.jsonl|\.jsonl/i, evidence: "samples_jsonl evidence was detected." },
    { signal: "pyproject", pattern: /pyproject\.toml|project\s*=|dependencies\s*=/i, evidence: "Python project metadata evidence was detected." },
    { signal: "package-script", pattern: /"eval"\s*:|"redteam"\s*:|promptfoo\s+(eval|redteam)|oaieval/i, evidence: "package/script eval command evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function llmEvalPromptSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["promptSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["promptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prompt", pattern: /(^|\n)\s*prompts?\s*:|prompt\s*:/i, evidence: "prompt evidence was detected." },
    { signal: "prompt-file", pattern: /file:\/\/.*prompt|prompts\/|\.prompt\./i, evidence: "prompt file evidence was detected." },
    { signal: "prompt-template", pattern: /PromptTemplate|ChatPromptTemplate|\{\{[^}]+\}\}|template\s*:/i, evidence: "prompt template evidence was detected." },
    { signal: "vars", pattern: /(^|\n)\s*vars\s*:|context\s*:|question\s*:|input\s*:/i, evidence: "test variables evidence was detected." },
    { signal: "messages", pattern: /messages\s*:|role\s*:\s*(system|user|assistant)|SystemMessage|HumanMessage/i, evidence: "message-style prompt evidence was detected." },
    { signal: "few-shot", pattern: /few_shot_examples|few-shot|examples\s*:|exampleSelector/i, evidence: "few-shot evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "prompt", "signal");
}

function llmEvalProviderSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["providerSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["providerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "provider", pattern: /(^|\n)\s*providers?\s*:|openai:|anthropic:|azureopenai|vertex|ollama/i, evidence: "provider evidence was detected." },
    { signal: "model-name", pattern: /gpt-|claude-|gemini-|llama|model\s*:|modelName|model_name/i, evidence: "model name evidence was detected." },
    { signal: "grader-model", pattern: /grader|judge|llm-rubric|modelgraded|createLLMAsJudge|create_llm_as_judge/i, evidence: "grader/judge model evidence was detected." },
    { signal: "completion-fn", pattern: /completion_fns|completion_fn|oaieval|CompletionFn/i, evidence: "completion function evidence was detected." },
    { signal: "api-key-env", pattern: /OPENAI_API_KEY|ANTHROPIC_API_KEY|LANGSMITH_API_KEY|api[_-]?key/i, evidence: "provider API key environment evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "provider", "signal");
}

function llmEvalTestCaseSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["testCaseSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["testCaseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tests", pattern: /(^|\n)\s*tests?\s*:|testCases|eval cases/i, evidence: "test cases evidence was detected." },
    { signal: "vars", pattern: /(^|\n)\s*-?\s*vars\s*:|variables\s*:/i, evidence: "vars evidence was detected." },
    { signal: "assert", pattern: /(^|\n)\s*assert\s*:|assertions?\s*:/i, evidence: "assertion evidence was detected." },
    { signal: "expected", pattern: /expected|expected_output|ideal\s*:|reference_outputs?/i, evidence: "expected/reference output evidence was detected." },
    { signal: "rubric", pattern: /rubric|criteria|criterion|scoring/i, evidence: "rubric evidence was detected." },
    { signal: "threshold", pattern: /threshold|passThreshold|minScore|scoreThreshold/i, evidence: "threshold evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "test case", "signal");
}

function llmEvalJudgeSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["judgeSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["judgeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "llm-rubric", pattern: /llm-rubric|rubricPrompt/i, evidence: "llm-rubric evidence was detected." },
    { signal: "modelgraded-spec", pattern: /modelgraded_spec|ModelBasedClassify|cot_classify/i, evidence: "modelgraded spec evidence was detected." },
    { signal: "llm-as-judge", pattern: /create_llm_as_judge|createLLMAsJudge|LLM-as-judge|judge\s*:/i, evidence: "LLM-as-judge evidence was detected." },
    { signal: "correctness", pattern: /CORRECTNESS_PROMPT|correctness|accuracy/i, evidence: "correctness judge evidence was detected." },
    { signal: "hallucination", pattern: /HALLUCINATION_PROMPT|hallucination|groundedness|faithfulness/i, evidence: "hallucination/groundedness judge evidence was detected." },
    { signal: "feedback-key", pattern: /feedbackKey|feedback_key|key\s*:\s*['"]score/i, evidence: "feedback key evidence was detected." },
    { signal: "score", pattern: /score|continuous|choices\s*:|pass\s*:/i, evidence: "score output evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "judge", "signal");
}

function llmEvalDatasetSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["datasetSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["datasetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "samples-jsonl", pattern: /samples_jsonl|samples\.jsonl/i, evidence: "samples_jsonl evidence was detected." },
    { signal: "dataset", pattern: /dataset|datasets|examples\s*:/i, evidence: "dataset evidence was detected." },
    { signal: "csv", pattern: /\.csv|text\/csv|fromCSV/i, evidence: "CSV dataset evidence was detected." },
    { signal: "jsonl", pattern: /\.jsonl|JSONL|json lines/i, evidence: "JSONL dataset evidence was detected." },
    { signal: "reference-output", pattern: /reference_outputs?|referenceOutputs|expected_output/i, evidence: "reference output evidence was detected." },
    { signal: "ideal", pattern: /ideal\s*:|"ideal"/i, evidence: "ideal answer evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "dataset", "signal");
}

function llmEvalRedteamSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["redteamSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["redteamSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "redteam", pattern: /redteam\s*:|promptfoo\s+redteam|red-team/i, evidence: "red-team evidence was detected." },
    { signal: "plugins", pattern: /(^|\n)\s*plugins\s*:|pluginId|plugins\//i, evidence: "red-team plugin evidence was detected." },
    { signal: "strategies", pattern: /(^|\n)\s*strategies\s*:|strategyId/i, evidence: "red-team strategy evidence was detected." },
    { signal: "jailbreak", pattern: /jailbreak|hydra|meta/i, evidence: "jailbreak strategy evidence was detected." },
    { signal: "prompt-injection", pattern: /prompt-injection|prompt injection|indirect prompt/i, evidence: "prompt-injection evidence was detected." },
    { signal: "pii", pattern: /\bPII\b|pii:|privacy|data exfiltration/i, evidence: "PII/privacy evidence was detected." },
    { signal: "owasp", pattern: /OWASP|MITRE|ATLAS|NIST AI RMF/i, evidence: "AI risk mapping evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "redteam", "signal");
}

function llmEvalWorkflowSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "promptfoo-eval", pattern: /promptfoo\s+eval|npx\s+promptfoo.*eval/i, evidence: "promptfoo eval command evidence was detected." },
    { signal: "promptfoo-redteam", pattern: /promptfoo\s+redteam|redteam\s+generate|redteam\s+eval/i, evidence: "promptfoo redteam command evidence was detected." },
    { signal: "oaieval", pattern: /oaieval|openai eval/i, evidence: "oaieval command evidence was detected." },
    { signal: "evaluate", pattern: /\bevaluate\s*\(|langsmith.*evaluate|client\.evaluate/i, evidence: "evaluate API evidence was detected." },
    { signal: "ci", pattern: /\.github\/workflows|CI=true|pull_request|workflow_dispatch/i, evidence: "CI workflow evidence was detected." },
    { signal: "report-output", pattern: /-o\s+\S+|output\s*:|report|results?\.(json|jsonl|html)|promptfoo\s+view/i, evidence: "report/output evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function llmEvalPackageSignals(sourceFiles: LlmEvalSourceFile[]): LlmEvalReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LlmEvalReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "promptfoo", pattern: /"promptfoo"|promptfoo/i, evidence: "promptfoo package evidence was detected." },
    { signal: "openevals", pattern: /"openevals"|from ["']openevals|import openevals/i, evidence: "OpenEvals package evidence was detected." },
    { signal: "openai-evals", pattern: /openai[/-]evals|oaieval|evals\.elsuite/i, evidence: "OpenAI evals evidence was detected." },
    { signal: "langsmith", pattern: /"langsmith"|from ["']langsmith|LANGSMITH/i, evidence: "LangSmith evidence was detected." },
    { signal: "deepeval", pattern: /"deepeval"|from ["']deepeval|deepeval/i, evidence: "DeepEval evidence was detected." },
    { signal: "ragas", pattern: /"ragas"|from ["']ragas|ragas/i, evidence: "Ragas evidence was detected." }
  ];
  return llmEvalSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function llmEvalSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: LlmEvalSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/llm-eval-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildLlmObservabilityReadinessReport(walk: WalkResult): Promise<LlmObservabilityReadinessReport> {
  const sourceFiles = await llmObservabilitySourceFiles(walk);
  const observabilitySetups = llmObservabilitySetups(sourceFiles);
  const traceSignals = llmObservabilityTraceSignals(sourceFiles);
  const instrumentationSignals = llmObservabilityInstrumentationSignals(sourceFiles);
  const identitySignals = llmObservabilityIdentitySignals(sourceFiles);
  const llmMetricSignals = llmObservabilityMetricSignals(sourceFiles);
  const feedbackSignals = llmObservabilityFeedbackSignals(sourceFiles);
  const datasetExperimentSignals = llmObservabilityDatasetExperimentSignals(sourceFiles);
  const gatewaySignals = llmObservabilityGatewaySignals(sourceFiles);
  const privacySignals = llmObservabilityPrivacySignals(sourceFiles);
  const workflowSignals = llmObservabilityWorkflowSignals(sourceFiles);
  const packageSignals = llmObservabilityPackageSignals(sourceFiles);

  const hasTrace = traceSignals.some((item) => item.readiness === "ready") || observabilitySetups.some((item) => item.traceCount > 0 || item.spanCount > 0 || item.generationCount > 0);
  const hasInstrumentation = instrumentationSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasIdentity = identitySignals.some((item) => item.readiness === "ready") || observabilitySetups.some((item) => item.sessionCount > 0 || item.userCount > 0 || item.metadataCount > 0);
  const hasMetrics = llmMetricSignals.some((item) => item.readiness === "ready") || observabilitySetups.some((item) => item.tokenCount > 0 || item.costCount > 0);
  const hasFeedback = feedbackSignals.some((item) => item.readiness === "ready") || observabilitySetups.some((item) => item.scoreCount > 0 || item.feedbackCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || datasetExperimentSignals.some((item) => item.readiness === "ready");
  const hasGateway = gatewaySignals.some((item) => item.readiness === "ready");

  const riskQueue: LlmObservabilityReadinessReport["riskQueue"] = [];
  if (!hasInstrumentation) {
    riskQueue.push({
      priority: "high",
      action: "Add Langfuse, Phoenix/OpenInference, Helicone, or OpenTelemetry instrumentation before claiming LLM observability readiness.",
      why: "LLM provider code alone does not prove prompts, generations, traces, or sessions are observable.",
      relatedHref: "html/llm-observability-readiness.html"
    });
  }
  if (hasInstrumentation && !hasTrace) {
    riskQueue.push({
      priority: "high",
      action: "Record trace, span, observation, generation, trace ID, or span ID boundaries around LLM calls.",
      why: "LLM observability needs a visible unit of work so model calls can be debugged across prompts, retrieval, tools, and responses.",
      relatedHref: "html/llm-observability-readiness.html"
    });
  }
  if (hasTrace && !hasIdentity) {
    riskQueue.push({
      priority: "medium",
      action: "Add user, session, conversation, release, environment, tags, or metadata linkage.",
      why: "Trace lists are hard to investigate when they cannot be grouped by session, user journey, deployment, or tenant.",
      relatedHref: "html/llm-observability-readiness.html"
    });
  }
  if (hasTrace && !hasMetrics) {
    riskQueue.push({
      priority: "medium",
      action: "Track model, provider, prompt tokens, completion tokens, total tokens, latency, cache, or cost metadata.",
      why: "LLM observability should explain both quality and operating cost; trace shape alone is not enough for production review.",
      relatedHref: "html/llm-observability-readiness.html"
    });
  }
  if ((hasTrace || hasGateway) && !hasFeedback) {
    riskQueue.push({
      priority: "low",
      action: "Add scores, feedback, annotations, labels, manual review, or quality fields.",
      why: "Feedback turns traces from debugging records into reviewable quality signals.",
      relatedHref: "html/llm-observability-readiness.html"
    });
  }
  if (hasInstrumentation && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Document dashboard, export, self-hosting, dataset, experiment, or CI workflow paths.",
      why: "Learners need to know how captured LLM traces become reviewable reports, prompt versions, datasets, or experiments.",
      relatedHref: "html/llm-observability-readiness.html"
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `LLM observability readiness report: setup ${observabilitySetups.length}개, trace signal ${traceSignals.length}개, identity signal ${identitySignals.length}개, metric signal ${llmMetricSignals.length}개, feedback signal ${feedbackSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "LLM observability readiness Langfuse Phoenix Helicone LangChainTracer RunCollectorCallbackHandler LogStreamCallbackHandler EventStreamCallbackHandler RootListenersTracer BaseTracer isBaseTracer convertRunTreeToRun convertRunToRunTree _addRunToRunMap runMap runTreeMap usesRunTreeMap getRunById persistRun _endTrace _getExecutionOrder _createRunForLLMStart parent_run_id child_runs child_execution_order trace_id dotted_order _serialized_start_time convertToDottedOrderFormat consumeCallback awaitAllCallbacks getQueue createQueue PQueue autoStart concurrency awaitHandlers getGlobalAsyncLocalStorageInstance asyncLocalStorageInstance.run awaitPendingTraceBatches Promise.allSettled queue.onIdle RunTree traces spans observations generations sessions userId sessionId metadata release tags scores feedback annotations datasets experiments prompt versions playground OpenInference OpenTelemetry OTLP exporter token usage promptTokens completionTokens totalTokens cost latency model provider gateway baseURL Helicone headers rate limit retry fallback redaction telemetry opt-out ingestion queues ClickHouse S3 blob storage data retention OpenAPI SDK integrations annotation queues LLM-as-a-judge usage metering event replay safe URL SSRF IO size limit",
    observabilitySetups,
    traceSignals,
    instrumentationSignals,
    identitySignals,
    llmMetricSignals,
    feedbackSignals,
    datasetExperimentSignals,
    gatewaySignals,
    privacySignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"Langfuse|@observe|langfuse_context|observe\\(|trace|span|generation|session_id|user_id\" .", purpose: "Find Langfuse trace, generation, session, user, metadata, score, and prompt-version boundaries." },
      { command: "rg \"LangChainTracer|RunCollectorCallbackHandler|LogStreamCallbackHandler|EventStreamCallbackHandler|RootListenersTracer|BaseTracer|isBaseTracer|_addRunToRunMap|convertRunTreeToRun|convertRunToRunTree|persistRun|_endTrace|_getExecutionOrder|_createRunForLLMStart|consumeCallback|awaitAllCallbacks|getQueue|createQueue|PQueue|awaitPendingTraceBatches|queue.onIdle|getGlobalAsyncLocalStorageInstance|RunTree|RunLogPatch|StreamEvent|dotted_order|runTreeMap\" .", purpose: "Find LangChain/LangSmith tracer, run tree, stream log, event stream, callback queue, and root listener boundaries." },
      { command: "rg \"Phoenix|OpenInference|PHOENIX_COLLECTOR_ENDPOINT|OTLP|TracerProvider|register\\(\" .", purpose: "Map Phoenix/OpenInference/OpenTelemetry setup without exporting spans." },
      { command: "rg \"Helicone-|ai-gateway.helicone.ai|baseURL|rate limit|retry|fallback|provider routing\" .", purpose: "Review Helicone gateway headers, provider routing, retry, cache, and rate-limit hints." },
      { command: "rg \"promptTokens|completionTokens|totalTokens|token_usage|usage|cost|latency|duration|model|provider\" .", purpose: "Trace token, cost, latency, model, and provider metadata fields." },
      { command: "rg \"score|feedback|annotation|label|thumbs|quality|manual review|dataset|experiment|prompt version\" .", purpose: "Find quality feedback, prompt version, dataset, and experiment linkage." },
      { command: "rg \"ingestion queue|OtelIngestionQueue|TraceUpsertQueue|ClickHouse|S3|blob storage|event replay|data retention|retentionDays|usage metering|LLM-as-a-judge|annotation queue|openapi\" .", purpose: "Map durable Langfuse-style ingestion, storage, replay, retention, eval, and API workflow surfaces." },
      { command: "rg \"redact|mask|PII|telemetry|retention|TELEMETRY_ENABLED|safe URL|SSRF|blocked IP|LANGFUSE_API_TRACE_OBSERVATIONS_SIZE_LIMIT_BYTES|LANGFUSE_SERVER_SIDE_IO_CHAR_LIMIT\" .", purpose: "Review privacy, redaction, telemetry opt-out, retention, URL safety, and IO-size limits before connecting live collectors." }
    ],
    learnerNextSteps: [
      "먼저 Langfuse, Phoenix/OpenInference, Helicone, OpenTelemetry 중 어떤 계층이 LLM 호출을 감싸는지 찾으세요.",
      "LangChainTracer, RunCollectorCallbackHandler, LogStreamCallbackHandler, EventStreamCallbackHandler, RootListenersTracer가 있으면 LangSmith run tree와 stream log/event 경계를 확인하세요.",
      "trace, span, observation, generation, trace_id, span_id는 디버깅 가능한 작업 단위를 보여줍니다.",
      "user_id, session_id, conversation_id, release, environment, tags, metadata는 LLM 호출을 사용자 흐름과 배포 흐름에 연결합니다.",
      "promptTokens, completionTokens, totalTokens, cost, latency, model, provider, cache 신호로 운영 비용과 성능 경계를 확인하세요.",
      "score, feedback, annotation, label, quality, dataset, experiment, prompt version은 관측 데이터를 품질 검토로 연결합니다.",
      "Langfuse식 운영 코드는 ingestion queue, ClickHouse/S3/blob storage, event replay, usage metering, data retention, OpenAPI, annotation queue, LLM-as-a-judge 경계를 함께 확인하세요.",
      "이 리포트는 정적 readiness입니다. RepoTutor는 provider 호출, trace 전송, span export, Langfuse/Phoenix/Helicone collector 접속, dashboard 조회, prompt/dataset/score 업로드를 하지 않습니다."
    ]
  };
}

type LlmObservabilitySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function llmObservabilitySourceFiles(walk: WalkResult): Promise<LlmObservabilitySourceFile[]> {
  const files: LlmObservabilitySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !llmObservabilityInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!llmObservabilityPathSignal(file.relPath) && !llmObservabilityContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function llmObservabilityInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return llmObservabilityPathSignal(filePath)
    || /(^|\/)(README|docs?|observability|telemetry|tracing|traces?|spans?|instrumentation|analytics|monitoring|prompts?|datasets?|experiments?|evals?|workflows?|scripts?|ci)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|docker-compose\.ya?ml|helmfile\.ya?ml)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|py|json|jsonl|csv|md|mdx|ya?ml|toml|txt|env|example)$/i.test(filePath);
}

function llmObservabilityPathSignal(filePath: string): boolean {
  return /(^|\/)(langfuse|phoenix|helicone|openinference|opentelemetry|otel|observability|telemetry|tracing|traces?|spans?|instrumentation)(\/|\.|-|_|$)/i.test(filePath)
    || /\.github\/workflows\/.*(llm|observability|telemetry|trace|eval|prompt).*\.(ya?ml)$/i.test(filePath);
}

function llmObservabilityContentSignal(text: string): boolean {
  return /(Langfuse|langfuse|@observe|langfuse_context|Phoenix|PHOENIX_COLLECTOR_ENDPOINT|OpenInference|openinference|OpenTelemetry|OTLP|TracerProvider|LangChainTracer|RunCollectorCallbackHandler|LogStreamCallbackHandler|EventStreamCallbackHandler|RootListenersTracer|BaseTracer|isBaseTracer|_addRunToRunMap|convertRunTreeToRun|convertRunToRunTree|persistRun|_endTrace|_getExecutionOrder|_createRunForLLMStart|consumeCallback|awaitAllCallbacks|getQueue|createQueue|PQueue|awaitHandlers|getGlobalAsyncLocalStorageInstance|awaitPendingTraceBatches|Promise\.allSettled|queue\.onIdle|RunTree|RunLogPatch|StreamEvent|dotted_order|runTreeMap|trace_id|span_id|traceId|spanId|generation|observation|Helicone-|helicone|ai-gateway\.helicone\.ai|promptTokens|completionTokens|totalTokens|token_usage|usage|usage_metadata|cost|latency|feedback|annotation|prompt version|TELEMETRY_ENABLED|redact|PII|OtelIngestionQueue|TraceUpsertQueue|LANGFUSE_OTEL_INGESTION_QUEUE|LANGFUSE_TRACE_UPSERT_QUEUE|ClickHouse.*(traces|observations|scores)|traces table|observations table|scores table|S3 access logs|LANGFUSE_S3|blob storage|data retention|retentionDays|usage metering|LLM-as-a-judge|annotation queue|OpenAPI spec|generated\/api\/openapi|LiteLLM|LlamaIndex|safe URL|SSRF|blocked IP|LANGFUSE_API_TRACE_OBSERVATIONS_SIZE_LIMIT_BYTES|LANGFUSE_SERVER_SIDE_IO_CHAR_LIMIT)/i.test(text);
}

function llmObservabilitySetups(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["observabilitySetups"] {
  const rows: LlmObservabilityReadinessReport["observabilitySetups"] = [];
  for (const source of sourceFiles) {
    const traceCount = countMatches(source.text, /\btrace\b|trace_id|traceId|traces|current_trace|update_current_trace|BaseTracer|isBaseTracer|_addRunToRunMap|convertRunTreeToRun|convertRunToRunTree|persistRun|_endTrace|_getExecutionOrder|_createRunForLLMStart|awaitPendingTraceBatches|RunTree|RunLogPatch|StreamEvent|dotted_order|runTreeMap/gi);
    const spanCount = countMatches(source.text, /\bspan\b|span_id|spanId|startSpan|root span|nested span|OTLPTraceExporter|child_runs|child_execution_order|rootId/gi);
    const generationCount = countMatches(source.text, /generation|generations|chat\.completions|responses\.create|llm call|model call/gi);
    const sessionCount = countMatches(source.text, /session_id|sessionId|Helicone-Session-Id|conversation_id|conversationId|thread_id|threadId/gi);
    const userCount = countMatches(source.text, /user_id|userId|Helicone-User-Id|enduser|tenant|account_id/gi);
    const metadataCount = countMatches(source.text, /metadata|tags|release|environment|Helicone-Property-|projectName|project_name/gi);
    const scoreCount = countMatches(source.text, /\bscore\b|scoreTrace|create_score|quality score|thumbs|rating/gi);
    const tokenCount = countMatches(source.text, /promptTokens|completionTokens|totalTokens|prompt_tokens|completion_tokens|total_tokens|input_tokens|output_tokens|token_usage|usage_metadata|usage/gi);
    const costCount = countMatches(source.text, /\bcost\b|total_cost|latency|duration|response_time|time_to_first_token/gi);
    const promptCount = countMatches(source.text, /prompt version|promptVersion|prompt_id|Helicone-Prompt-Id|promptName|prompt template|prompts?\/|langfuse_prompt/gi);
    const feedbackCount = countMatches(source.text, /feedback|annotation|label|manual review|manual-review|quality|rating|thumbs/gi);
    const totalSignals = traceCount + spanCount + generationCount + sessionCount + userCount + metadataCount + scoreCount + tokenCount + costCount + promptCount + feedbackCount;
    if (totalSignals === 0 && !llmObservabilityPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: llmObservabilityPlatform(source),
      traceCount,
      spanCount,
      generationCount,
      sessionCount,
      userCount,
      metadataCount,
      scoreCount,
      tokenCount,
      costCount,
      promptCount,
      feedbackCount,
      readiness: (traceCount > 0 || spanCount > 0 || generationCount > 0) && (sessionCount > 0 || userCount > 0 || metadataCount > 0) && (tokenCount > 0 || costCount > 0 || scoreCount > 0 || feedbackCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} LLM observability signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.traceCount + b.spanCount + b.generationCount + b.sessionCount + b.userCount + b.tokenCount + b.costCount + b.scoreCount + b.feedbackCount;
    const aScore = a.traceCount + a.spanCount + a.generationCount + a.sessionCount + a.userCount + a.tokenCount + a.costCount + a.scoreCount + a.feedbackCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 90);
}

function llmObservabilityPlatform(source: LlmObservabilitySourceFile): LlmObservabilityReadinessReport["observabilitySetups"][number]["platform"] {
  if (/langfuse|@observe|langfuse_context|Langfuse/i.test(source.filePath) || /langfuse|@observe|langfuse_context|Langfuse/i.test(source.text)) return "langfuse";
  if (/phoenix|PHOENIX_COLLECTOR_ENDPOINT|arize-phoenix/i.test(source.filePath) || /phoenix|PHOENIX_COLLECTOR_ENDPOINT|arize-phoenix/i.test(source.text)) return "phoenix";
  if (/helicone|Helicone-|ai-gateway\.helicone\.ai/i.test(source.filePath) || /helicone|Helicone-|ai-gateway\.helicone\.ai/i.test(source.text)) return "helicone";
  if (/langsmith|LangSmith|LangChainTracer|BaseTracer|isBaseTracer|RunTree|RunCollectorCallbackHandler|LogStreamCallbackHandler|EventStreamCallbackHandler|RootListenersTracer|getDefaultLangChainClientSingleton|awaitPendingTraceBatches/i.test(source.filePath) || /langsmith|LangSmith|LangChainTracer|BaseTracer|isBaseTracer|RunTree|RunCollectorCallbackHandler|LogStreamCallbackHandler|EventStreamCallbackHandler|RootListenersTracer|getDefaultLangChainClientSingleton|awaitPendingTraceBatches/i.test(source.text)) return "langsmith";
  if (/openinference|OpenInference/i.test(source.filePath) || /openinference|OpenInference/i.test(source.text)) return "openinference";
  if (/opentelemetry|OpenTelemetry|OTLP|TracerProvider|@opentelemetry/i.test(source.filePath) || /opentelemetry|OpenTelemetry|OTLP|TracerProvider|@opentelemetry/i.test(source.text)) return "opentelemetry";
  if (/trace|span|generation|observability|telemetry/i.test(source.filePath) || /trace|span|generation|observability|telemetry/i.test(source.text)) return "custom";
  return "unknown";
}

function llmObservabilityTraceSignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["traceSignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["traceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trace", pattern: /\btrace\b|traces|current_trace|update_current_trace/i, evidence: "trace boundary evidence was detected." },
    { signal: "span", pattern: /\bspan\b|spans|startSpan|withSpan/i, evidence: "span evidence was detected." },
    { signal: "observation", pattern: /observation|observe\(|@observe|observations/i, evidence: "observation evidence was detected." },
    { signal: "generation", pattern: /generation|generations|chat\.completions|responses\.create|llm call|model call/i, evidence: "LLM generation evidence was detected." },
    { signal: "root-span", pattern: /root span|rootSpan|parent_span|parentSpan|parentObservation/i, evidence: "root/parent span evidence was detected." },
    { signal: "nested-span", pattern: /nested span|child span|childSpan|span\.start|span\.end|with_span/i, evidence: "nested span evidence was detected." },
    { signal: "trace-id", pattern: /trace_id|traceId|get_current_trace_id|Helicone-Trace-Id/i, evidence: "trace ID evidence was detected." },
    { signal: "span-id", pattern: /span_id|spanId|SpanContext/i, evidence: "span ID evidence was detected." },
    { signal: "run-tree", pattern: /RunTree|RunCreate|RunUpdate|getRunTreeWithTracingConfig|updateFromRunTree/i, evidence: "LangSmith RunTree evidence was detected." },
    { signal: "base-tracer-run", pattern: /BaseTracer|isBaseTracer|BaseRun|_createRunForLLMStart/i, evidence: "LangChain BaseTracer run evidence was detected." },
    { signal: "run-map-lifecycle", pattern: /_addRunToRunMap|runMap|runTreeMap|usesRunTreeMap|getRunById|_endTrace|persistRun/i, evidence: "LangChain tracer run-map lifecycle evidence was detected." },
    { signal: "parent-child-run-order", pattern: /parent_run_id|child_runs|child_execution_order|_getExecutionOrder|convertToDottedOrderFormat/i, evidence: "LangChain parent/child run ordering evidence was detected." },
    { signal: "dotted-order", pattern: /dotted_order|dottedOrder|convertToDottedOrderFormat|_serialized_start_time/i, evidence: "dotted order evidence was detected." },
    { signal: "stream-event", pattern: /StreamEvent|EventStreamCallbackHandler|on_chat_model_stream|on_llm_stream|on_tool_start|sendEndEvent/i, evidence: "stream event evidence was detected." },
    { signal: "run-log-patch", pattern: /RunLogPatch|RunLog|JSONPatchOperation|applyPatch|streamed_output|streamed_output_str/i, evidence: "run log patch evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "trace", "signal");
}

function llmObservabilityInstrumentationSignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["instrumentationSignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["instrumentationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "observe-decorator", pattern: /@observe|observe\(|langfuse\.observe/i, evidence: "observe decorator/API evidence was detected." },
    { signal: "openai-wrapper", pattern: /from ["']langfuse\.openai|wrapOpenAI|openai\.chat\.completions|responses\.create/i, evidence: "OpenAI wrapper evidence was detected." },
    { signal: "callback-handler", pattern: /CallbackHandler|callback_handler|LangfuseCallbackHandler|callbacks\s*:|BaseCallbackHandler/i, evidence: "callback handler evidence was detected." },
    { signal: "callback-promise-queue", pattern: /consumeCallback|awaitAllCallbacks|getQueue|createQueue|PQueue|awaitHandlers/i, evidence: "LangChain callback promise queue evidence was detected." },
    { signal: "langchain-tracer", pattern: /LangChainTracer|langchain_tracer|copyWithTracingConfig|tracingMetadata|tracingTags/i, evidence: "LangChain tracer evidence was detected." },
    { signal: "run-collector", pattern: /RunCollectorCallbackHandler|run_collector|tracedRuns|reference_example_id/i, evidence: "run collector evidence was detected." },
    { signal: "log-stream-handler", pattern: /LogStreamCallbackHandler|log_stream_tracer|RunLogPatch|RunLog|streamed_output_str/i, evidence: "log stream handler evidence was detected." },
    { signal: "event-stream-handler", pattern: /EventStreamCallbackHandler|event_stream_tracer|StreamEvent|lc_prefer_streaming|tapOutputIterable/i, evidence: "event stream handler evidence was detected." },
    { signal: "root-listener", pattern: /RootListenersTracer|onStart|onEnd|onError|rootId/i, evidence: "root listener tracer evidence was detected." },
    { signal: "openinference", pattern: /OpenInference|openinference|instrumentation-openai|instrumentation-langchain/i, evidence: "OpenInference instrumentation evidence was detected." },
    { signal: "opentelemetry", pattern: /OpenTelemetry|opentelemetry|@opentelemetry|otel/i, evidence: "OpenTelemetry evidence was detected." },
    { signal: "otel-exporter", pattern: /OTLPTraceExporter|OTLPSpanExporter|OTEL_EXPORTER|collector endpoint|PHOENIX_COLLECTOR_ENDPOINT/i, evidence: "OTLP exporter evidence was detected." },
    { signal: "tracer-provider", pattern: /TracerProvider|NodeTracerProvider|tracer_provider|getTracer|register\(/i, evidence: "tracer provider evidence was detected." },
    { signal: "auto-instrumentation", pattern: /auto-instrumentation|getNodeAutoInstrumentations|instrument\(|registerInstrumentations/i, evidence: "auto-instrumentation evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "instrumentation", "signal");
}

function llmObservabilityIdentitySignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["identitySignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["identitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "user-id", pattern: /user_id|userId|Helicone-User-Id|enduser|tenant/i, evidence: "user identity evidence was detected." },
    { signal: "session-id", pattern: /session_id|sessionId|Helicone-Session-Id|thread_id|threadId/i, evidence: "session identity evidence was detected." },
    { signal: "conversation-id", pattern: /conversation_id|conversationId|chat_id|chatId|thread/i, evidence: "conversation identity evidence was detected." },
    { signal: "release", pattern: /release|version|commit_sha|git_sha/i, evidence: "release/version evidence was detected." },
    { signal: "environment", pattern: /environment|env|staging|production|development|Helicone-Property-Environment/i, evidence: "environment evidence was detected." },
    { signal: "tags", pattern: /tags\s*:|tags=|add_tags|Helicone-Property-/i, evidence: "tag/property evidence was detected." },
    { signal: "metadata", pattern: /metadata|meta|properties|Helicone-Property-|projectName|project_name/i, evidence: "metadata evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "identity", "signal");
}

function llmObservabilityMetricSignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["llmMetricSignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["llmMetricSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prompt-tokens", pattern: /promptTokens|prompt_tokens|input_tokens|inputTokens/i, evidence: "prompt token evidence was detected." },
    { signal: "completion-tokens", pattern: /completionTokens|completion_tokens|output_tokens|outputTokens/i, evidence: "completion token evidence was detected." },
    { signal: "total-tokens", pattern: /totalTokens|total_tokens|token_usage|usage\.total|tokens_total/i, evidence: "total token evidence was detected." },
    { signal: "cost", pattern: /\bcost\b|total_cost|prompt_cost|completion_cost|price|billing/i, evidence: "cost evidence was detected." },
    { signal: "latency", pattern: /latency|duration|response_time|elapsed|time_to_first_token|ttft/i, evidence: "latency evidence was detected." },
    { signal: "model-name", pattern: /model\s*:|modelName|model_name|gpt-|claude-|gemini-|llama/i, evidence: "model name evidence was detected." },
    { signal: "provider", pattern: /provider|openai|anthropic|azure|gemini|vertex|ollama/i, evidence: "provider evidence was detected." },
    { signal: "cache", pattern: /cache|cached|Helicone-Cache-Enabled|prompt cache|prompt_caching/i, evidence: "cache evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "metric", "signal");
}

function llmObservabilityFeedbackSignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["feedbackSignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["feedbackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "score", pattern: /\bscore\b|scoreTrace|create_score|quality_score|rating/i, evidence: "score evidence was detected." },
    { signal: "feedback", pattern: /feedback|user feedback|feedbackKey|feedback_key/i, evidence: "feedback evidence was detected." },
    { signal: "annotation", pattern: /annotation|annotate|annotation_queue|review queue/i, evidence: "annotation evidence was detected." },
    { signal: "label", pattern: /\blabel\b|labels|manual label|classification/i, evidence: "label evidence was detected." },
    { signal: "manual-review", pattern: /manual review|manual-review|human review|reviewer|labeling/i, evidence: "manual review evidence was detected." },
    { signal: "thumbs-up-down", pattern: /thumbs|thumb_up|thumb_down|like|dislike/i, evidence: "thumbs up/down evidence was detected." },
    { signal: "quality", pattern: /quality|helpfulness|correctness|hallucination|groundedness/i, evidence: "quality evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "feedback", "signal");
}

function llmObservabilityDatasetExperimentSignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["datasetExperimentSignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["datasetExperimentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dataset", pattern: /dataset|datasets|samples\.jsonl|\.csv|golden/i, evidence: "dataset evidence was detected." },
    { signal: "experiment", pattern: /experiment|experiments|run experiment|experiment_name/i, evidence: "experiment evidence was detected." },
    { signal: "run", pattern: /\brun\b|run_id|runId|runs\/|experiment run/i, evidence: "run evidence was detected." },
    { signal: "prompt-version", pattern: /prompt version|promptVersion|prompt_id|Helicone-Prompt-Id|langfuse_prompt|promptName/i, evidence: "prompt version evidence was detected." },
    { signal: "playground", pattern: /playground|prompt playground|llm playground/i, evidence: "playground evidence was detected." },
    { signal: "benchmark", pattern: /benchmark|benchmarks|regression|golden set/i, evidence: "benchmark evidence was detected." },
    { signal: "eval-link", pattern: /eval|evaluation|judge|score|feedback/i, evidence: "eval linkage evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "dataset/experiment", "signal");
}

function llmObservabilityGatewaySignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["gatewaySignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["gatewaySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "base-url", pattern: /baseURL|base_url|ai-gateway\.helicone\.ai|oai\.helicone\.ai/i, evidence: "gateway base URL evidence was detected." },
    { signal: "helicone-auth", pattern: /Helicone-Auth|HELICONE_API_KEY|helicone.*auth/i, evidence: "Helicone auth evidence was detected." },
    { signal: "request-header", pattern: /defaultHeaders|headers\s*:|Helicone-[A-Za-z-]+/i, evidence: "request header evidence was detected." },
    { signal: "property-header", pattern: /Helicone-Property-|helicone-property/i, evidence: "Helicone property header evidence was detected." },
    { signal: "rate-limit", pattern: /rate limit|rate-limit|RateLimit|Helicone-RateLimit/i, evidence: "rate-limit evidence was detected." },
    { signal: "retry", pattern: /\bretry\b|retries|Helicone-Retry-Enabled|fallback retry/i, evidence: "retry evidence was detected." },
    { signal: "provider-routing", pattern: /provider routing|provider-routing|router|route provider|helicone.*provider/i, evidence: "provider routing evidence was detected." },
    { signal: "fallback", pattern: /fallback|fallbacks|backup provider|secondary provider/i, evidence: "fallback evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "gateway", "signal");
}

function llmObservabilityPrivacySignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["privacySignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["privacySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "masking", pattern: /mask|masking|masked|scrub/i, evidence: "masking evidence was detected." },
    { signal: "redaction", pattern: /redact|redaction|redacted|sanitize/i, evidence: "redaction evidence was detected." },
    { signal: "pii", pattern: /\bPII\b|personal data|sensitive data|privacy/i, evidence: "PII/privacy evidence was detected." },
    { signal: "prompt-filter", pattern: /prompt filter|prompt_filter|filterPrompt|block prompt/i, evidence: "prompt filter evidence was detected." },
    { signal: "telemetry-opt-out", pattern: /TELEMETRY_ENABLED\s*=\s*false|telemetry opt|disable telemetry|telemetry_enabled/i, evidence: "telemetry opt-out evidence was detected." },
    { signal: "telemetry-boundary", pattern: /does not include raw traces|does not include raw prompts|does not include raw .*observations|raw traces, prompts, observations, scores, or dataset contents|telemetry docs/i, evidence: "telemetry boundary evidence was detected." },
    { signal: "data-retention", pattern: /retention|data retention|delete traces|expire traces|TTL/i, evidence: "data retention evidence was detected." },
    { signal: "data-retention-enforcement", pattern: /handleDataRetentionProcessingJob|retentionDays|LANGFUSE_TRACE_DELETE_DELAY_MS|removeIngestionEventsFromS3AndDeleteClickhouseRefsForProject/i, evidence: "data retention enforcement evidence was detected." },
    { signal: "ssrf-protection", pattern: /safe[- ]?url|blocked IP|blockedIp|presigned.*redirect|LANGFUSE_(WEBHOOK|LLM_CONNECTION|BLOB_STORAGE_ENDPOINT)_WHITELISTED/i, evidence: "SSRF/URL safety evidence was detected." },
    { signal: "io-size-limit", pattern: /LANGFUSE_API_TRACE_OBSERVATIONS_SIZE_LIMIT_BYTES|LANGFUSE_SERVER_SIDE_IO_CHAR_LIMIT|contentLength|payloadSize|too large|size limit/i, evidence: "trace IO size limit evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "privacy", "signal");
}

function llmObservabilityWorkflowSignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "export", pattern: /export|data export|traces export|download traces|PostHog/i, evidence: "export evidence was detected." },
    { signal: "api-client", pattern: /api client|LangfuseClient|PhoenixClient|phoenix-client|langfuse.*client|LangSmithTracingClientInterface|getDefaultLangChainClientSingleton|client\.datasets|client\.experiments|helicone.*api/i, evidence: "API client evidence was detected." },
    { signal: "dashboard", pattern: /dashboard|trace view|sessions view|prompt view|analytics/i, evidence: "dashboard evidence was detected." },
    { signal: "self-host", pattern: /self-host|self hosted|selfhost|docker compose|kubernetes|helm/i, evidence: "self-hosting evidence was detected." },
    { signal: "docker-compose", pattern: /docker-compose|compose\.ya?ml/i, evidence: "Docker Compose evidence was detected." },
    { signal: "helm", pattern: /\bhelm\b|Chart\.yaml|values\.yaml/i, evidence: "Helm evidence was detected." },
    { signal: "ci", pattern: /\.github\/workflows|pull_request|workflow_dispatch|CI=true/i, evidence: "CI evidence was detected." },
    { signal: "run-tree-map", pattern: /runTreeMap|runMap|child_runs|child_execution_order|getRunTreeWithTracingConfig|updateFromRunTree/i, evidence: "run tree map evidence was detected." },
    { signal: "stream-filter", pattern: /includeNames|includeTypes|includeTags|excludeNames|excludeTypes|excludeTags|_includeRun/i, evidence: "stream filter evidence was detected." },
    { signal: "callback-queue-drain", pattern: /awaitAllCallbacks|Promise\.allSettled|queue\.onIdle|getQueue|createQueue|PQueue/i, evidence: "callback queue drain evidence was detected." },
    { signal: "callback-context-clear", pattern: /getGlobalAsyncLocalStorageInstance|asyncLocalStorageInstance\.run\(undefined|callbacks are not part of the root run/i, evidence: "callback async-context clearing evidence was detected." },
    { signal: "trace-batch-flush", pattern: /awaitPendingTraceBatches|getDefaultLangChainClientSingleton|pending trace batches/i, evidence: "pending trace batch flush evidence was detected." },
    { signal: "ingestion-queue", pattern: /OtelIngestionQueue|TraceUpsertQueue|LANGFUSE_(OTEL_)?INGESTION_QUEUE|LANGFUSE_TRACE_UPSERT_QUEUE|ingestion queue|events bucket/i, evidence: "ingestion queue evidence was detected." },
    { signal: "event-replay", pattern: /replayIngestionEvents|Replay Ingestion Events|event replay|failed ingestion events|S3 access logs|Athena/i, evidence: "event replay evidence was detected." },
    { signal: "clickhouse-storage", pattern: /ClickHouse|clickhouse|observations table|traces table|scores table/i, evidence: "ClickHouse storage evidence was detected." },
    { signal: "blob-storage", pattern: /blob storage|S3_EVENT_UPLOAD|S3_MEDIA_UPLOAD|LANGFUSE_S3|AZURE_BLOB_STORAGE|GOOGLE_CLOUD_STORAGE|OCI_NATIVE_OBJECT_STORAGE/i, evidence: "blob/object storage evidence was detected." },
    { signal: "usage-metering", pattern: /usage metering|usageAggregation|usageThreshold|cloud usage metering|tracing_observations/i, evidence: "usage metering evidence was detected." },
    { signal: "openapi-spec", pattern: /OpenAPI spec|openapi\.ya?ml|generated\/api\/openapi|Postman collection|typed SDK/i, evidence: "OpenAPI/API spec evidence was detected." },
    { signal: "sdk-integration", pattern: /OpenAI SDK|Langchain|LangChain|LiteLLM|LlamaIndex|drop-in replacement|automated instrumentation/i, evidence: "SDK integration evidence was detected." },
    { signal: "annotation-queue", pattern: /annotation queue|annotationQueue|annotation_queue|manual labeling|manual label/i, evidence: "annotation queue evidence was detected." },
    { signal: "llm-as-judge", pattern: /LLM-as-a-judge|llm as judge|LANGFUSE_LLM_AS_JUDGE|judge evaluator|model-graded/i, evidence: "LLM-as-a-judge evidence was detected." },
    { signal: "prompt-playground", pattern: /prompt playground|LLM Playground|jump to the playground|convert.*Playground|playgroundConverter/i, evidence: "prompt playground evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function llmObservabilityPackageSignals(sourceFiles: LlmObservabilitySourceFile[]): LlmObservabilityReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LlmObservabilityReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "langfuse", pattern: /"langfuse"|from ["']langfuse|@langfuse|LANGFUSE/i, evidence: "Langfuse package/config evidence was detected." },
    { signal: "phoenix", pattern: /"@arizeai\/phoenix|arize-phoenix|from ["']phoenix|PHOENIX_COLLECTOR_ENDPOINT/i, evidence: "Phoenix package/config evidence was detected." },
    { signal: "arize-phoenix-otel", pattern: /@arizeai\/phoenix-otel|arize-phoenix-otel/i, evidence: "Phoenix OpenTelemetry package evidence was detected." },
    { signal: "openinference", pattern: /openinference|OpenInference|instrumentation-openai|instrumentation-langchain/i, evidence: "OpenInference package evidence was detected." },
    { signal: "opentelemetry", pattern: /@opentelemetry|opentelemetry|OTLPTraceExporter|TracerProvider/i, evidence: "OpenTelemetry package evidence was detected." },
    { signal: "helicone", pattern: /"helicone"|@helicone|Helicone-|HELICONE_API_KEY|ai-gateway\.helicone\.ai/i, evidence: "Helicone package/config evidence was detected." },
    { signal: "@langchain/core", pattern: /"@langchain\/core"|from ["']@langchain\/core|LangChainTracer|RunCollectorCallbackHandler|LogStreamCallbackHandler|EventStreamCallbackHandler|consumeCallback|awaitAllCallbacks/i, evidence: "@langchain/core tracer evidence was detected." },
    { signal: "langsmith", pattern: /"langsmith"|from ["']langsmith|RunTree|LangSmithTracingClientInterface|getDefaultProjectName|getDefaultLangChainClientSingleton|awaitPendingTraceBatches/i, evidence: "LangSmith package evidence was detected." },
    { signal: "openai-sdk", pattern: /"openai"|from ["']openai|OpenAI SDK|langfuse\.openai|wrapOpenAI/i, evidence: "OpenAI SDK integration evidence was detected." },
    { signal: "litellm", pattern: /LiteLLM|litellm/i, evidence: "LiteLLM integration evidence was detected." },
    { signal: "llamaindex", pattern: /LlamaIndex|llamaindex/i, evidence: "LlamaIndex integration evidence was detected." }
  ];
  return llmObservabilitySignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function llmObservabilitySignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: LlmObservabilitySourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/llm-observability-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
