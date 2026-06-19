import type { ObjectStorageReadinessReport, RealtimeCollaborationReadinessReport, SearchServiceReadinessReport, VectorDbReadinessReport, WorkflowOrchestrationReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildVectorDbReadinessReport(walk: WalkResult): Promise<VectorDbReadinessReport> {
  const sourceFiles = await vectorDbSourceFiles(walk);
  const vectorSetups = vectorDbSetups(sourceFiles);
  const collectionSignals = vectorDbCollectionSignals(sourceFiles);
  const clientSignals = vectorDbClientSignals(sourceFiles);
  const ingestionSignals = vectorDbIngestionSignals(sourceFiles);
  const querySignals = vectorDbQuerySignals(sourceFiles);
  const embeddingSignals = vectorDbEmbeddingSignals(sourceFiles);
  const indexSignals = vectorDbIndexSignals(sourceFiles);
  const opsSignals = vectorDbOpsSignals(sourceFiles);
  const packageSignals = vectorDbPackageSignals(sourceFiles);

  const hasClient = clientSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasCollection = collectionSignals.some((item) => item.readiness === "ready") || vectorSetups.some((item) => item.collectionCount > 0 || item.vectorConfigCount > 0);
  const hasIngestion = ingestionSignals.some((item) => item.readiness === "ready") || vectorSetups.some((item) => item.upsertCount > 0);
  const hasQuery = querySignals.some((item) => item.readiness === "ready") || vectorSetups.some((item) => item.queryCount > 0);
  const hasEmbedding = embeddingSignals.some((item) => item.readiness === "ready") || vectorSetups.some((item) => item.embeddingCount > 0);
  const hasIndex = indexSignals.some((item) => item.readiness === "ready") || vectorSetups.some((item) => item.filterCount > 0 || item.replicationCount > 0);
  const hasOps = opsSignals.some((item) => item.readiness === "ready") || vectorSetups.some((item) => item.snapshotCount > 0 || item.tenantCount > 0);

  const riskQueue: VectorDbReadinessReport["riskQueue"] = [];
  if (!hasClient) {
    riskQueue.push({ priority: "high", action: "Add a visible Qdrant, Weaviate, Chroma, Pinecone, Milvus, pgvector, or FAISS client boundary.", why: "Vector DB readiness starts with a concrete datastore/client boundary, not just generic embeddings.", relatedHref: "html/vector-db-readiness.html" });
  }
  if (hasClient && !hasCollection) {
    riskQueue.push({ priority: "high", action: "Record collection/class/schema/vector config, distance, dimensions, or HNSW setup.", why: "Vector search is not reproducible unless the collection shape and vector dimensions are visible.", relatedHref: "html/vector-db-readiness.html" });
  }
  if (hasCollection && !hasEmbedding) {
    riskQueue.push({ priority: "medium", action: "Trace embedding functions, vectorizers, model providers, sparse vectors, multimodal vectors, or precomputed vectors.", why: "The database schema alone does not explain how searchable vectors are produced.", relatedHref: "html/vector-db-readiness.html" });
  }
  if (hasCollection && !hasIngestion) {
    riskQueue.push({ priority: "medium", action: "Add add/upsert/batch/ids/documents/metadata/payload ingestion evidence.", why: "Learners need to see how documents become points, objects, rows, or records in the vector store.", relatedHref: "html/vector-db-readiness.html" });
  }
  if (hasIngestion && !hasQuery) {
    riskQueue.push({ priority: "medium", action: "Add search/query/nearest-neighbor/similarity/filter/limit/score query evidence.", why: "Ingestion without query code does not prove the app can retrieve the vectors it stores.", relatedHref: "html/vector-db-readiness.html" });
  }
  if (hasQuery && !hasIndex) {
    riskQueue.push({ priority: "low", action: "Add index, payload-index, distance, HNSW, quantization, sharding, replication, or consistency evidence.", why: "Production vector retrieval usually needs index and scaling choices beyond happy-path queries.", relatedHref: "html/vector-db-readiness.html" });
  }
  if (hasQuery && !hasOps) {
    riskQueue.push({ priority: "low", action: "Document snapshot, backup, restore, health, metrics, migration, multi-tenancy, or TTL operations.", why: "Vector data can become production state; operations evidence helps avoid losing or misrouting indexes and embeddings.", relatedHref: "html/vector-db-readiness.html" });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Vector DB readiness report: setup ${vectorSetups.length}개, collection signal ${collectionSignals.length}개, ingestion signal ${ingestionSignals.length}개, query signal ${querySignals.length}개, ops signal ${opsSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Vector DB readiness Qdrant Weaviate Chroma LangChain VectorStore VectorStoreRetriever MemoryVectorStore FakeVectorStore FakeVectorStoreArgs EmbeddingsInterface Embeddings EmbeddingsParams AsyncCaller AsyncCallerParams caller maxConcurrency maxRetries MemoryVector memoryVectors _queryVectors filterFunction filteredMemoryVectors maximalMarginalRelevance queryEmbedding embeddingList mmrIndexes selectedEmbeddingsIndexes fromExistingIndex id DocumentInterface SyntheticEmbeddings similarityCalledCount custom similarity MMR similaritySearchWithScore addVectors addDocuments asRetriever RecordManagerInterface IndexingResult _HashedDocument HashedDocumentInterface CleanupMode IndexOptions sourceIdKey cleanupBatchSize forceUpdate _batch _deduplicateInOrder _getSourceIdAssigner _isBaseDocumentLoader indexStartDt timeAtLeast groupIds docsToIndex docsToUpdate seenDocs listKeys deleteKeys numAdded numDeleted numUpdated numSkipped UUIDV5_NAMESPACE hash_ contentHash metadataHash calculateHashes toDocument collections classes schema vector config embeddings vectorizer distance dimensions HNSW payload metadata filters StructuredQuery FilterDirective Comparison Operation Operators Comparators Visitor VisitorResult VisitorOperationResult VisitorComparisonResult VisitorStructuredQueryResult BaseTranslator BasicTranslator FunctionalTranslator FunctionFilter ValueType getAllowedComparatorsForType getComparatorFunction getOperatorFunction undefinedTrue TranslatorOpts allowedOperators allowedComparators visitOperation visitComparison visitStructuredQuery formatFunction mergeFilters isFilterEmpty castValue forceDefaultFilter mergeType hybrid search BM25 sparse vectors upsert add query search nearest neighbors score limit snapshots backup restore sharding replication tenancy ttl clients endpoints API keys persistence",
    vectorSetups,
    collectionSignals,
    clientSignals,
    ingestionSignals,
    querySignals,
    embeddingSignals,
    indexSignals,
    opsSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"QdrantClient|qdrant-client|WeaviateClient|weaviate|chromadb|PersistentClient|HttpClient\" .", purpose: "Find vector database clients and connection boundaries." },
      { command: "rg \"VectorStore|VectorStoreRetriever|SaveableVectorStore|similaritySearchWithScore|maxMarginalRelevanceSearch|asRetriever\" .", purpose: "Find LangChain VectorStore abstractions, retrievers, MMR, and scored similarity retrieval paths." },
      { command: "rg \"createCollection|create_collection|collections\\.create|get_or_create_collection|schema|vector_config|vectors\" .", purpose: "Map collection, class, schema, vector size, distance, and HNSW setup." },
      { command: "rg \"add\\(|upsert|insert|batch|documents|metadatas|payload|ids\" .", purpose: "Review vector ingestion paths without sending data to the database." },
      { command: "rg \"search|query|nearText|nearVector|hybrid|where|filter|limit|score|distance\" .", purpose: "Trace retrieval query shape, filtering, limits, and scoring." },
      { command: "rg \"snapshot|backup|restore|replication|shard|tenant|TTL|health|metrics|migration\" .", purpose: "Check vector database operations and production-readiness controls." }
    ],
    learnerNextSteps: [
      "먼저 Qdrant, Weaviate, Chroma, Pinecone, Milvus, pgvector, FAISS 중 어떤 저장소가 client boundary인지 찾으세요.",
      "collection/class/schema/vector_config, dimension, distance, HNSW 설정은 검색 결과 재현성의 핵심입니다.",
      "embedding_function, vectorizer, model provider, sparse vector, precomputed vector 경로를 ingestion 코드와 연결하세요.",
      "add/upsert/batch/ids/documents/metadatas/payload는 데이터가 vector store에 들어가는 방식을 보여줍니다.",
      "search/query/nearText/nearVector/hybrid/where/filter/limit/score는 검색 품질과 결과 shape를 설명합니다.",
      "LangChain VectorStore를 쓰는 경우 addVectors/addDocuments, similaritySearchWithScore, maxMarginalRelevanceSearch, asRetriever, embedDocuments/embedQuery를 함께 확인하세요.",
      "이 리포트는 정적 readiness입니다. RepoTutor는 vector DB 서버를 시작하거나, client를 실행하거나, embeddings를 생성하거나, 데이터를 upsert/query/delete/backup/restore하지 않습니다."
    ]
  };
}

type VectorDbSourceFile = { filePath: string; text: string; sourceHref: string };

async function vectorDbSourceFiles(walk: WalkResult): Promise<VectorDbSourceFile[]> {
  const files: VectorDbSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !vectorDbInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!vectorDbPathSignal(file.relPath) && !vectorDbContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function vectorDbInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return vectorDbPathSignal(filePath)
    || /(^|\/)(README|docs?|vector|vectors|embedding|embeddings|retrieval|retriever|rag|search|index|indexes|db|database|stores?|collections?|schemas?|workflows?|scripts?|config)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|docker-compose\.ya?ml|compose\.ya?ml)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|py|json|jsonl|csv|md|mdx|ya?ml|toml|txt|sql)$/i.test(filePath);
}

function vectorDbPathSignal(filePath: string): boolean {
  return /(^|\/)(qdrant|weaviate|chroma|chromadb|pinecone|milvus|pgvector|faiss|vector|vectors|embeddings?|retrieval|rag)(\/|\.|-|_|$)/i.test(filePath)
    || /\.github\/workflows\/.*(vector|embedding|retrieval|rag|qdrant|weaviate|chroma).*\.(ya?ml)$/i.test(filePath);
}

function vectorDbContentSignal(text: string): boolean {
  return /(QdrantClient|qdrant-client|WeaviateClient|weaviate|chromadb|PersistentClient|HttpClient|createCollection|create_collection|collections\.create|get_or_create_collection|vector_config|vectors\s*:|embeddings?|upsert|nearText|nearVector|hybrid|payload|metadatas?|HNSW|hnsw|quantization|snapshot|replication|multi[_-]?tenancy|pgvector|FAISS|Milvus|Pinecone|VectorStore|VectorStoreRetriever|SaveableVectorStore|MemoryVectorStore|FakeVectorStore|FakeVectorStoreArgs|MemoryVector|memoryVectors|_queryVectors|filterFunction|filteredMemoryVectors|maximalMarginalRelevance|similaritySearchWithScore|similaritySearchVectorWithScore|maxMarginalRelevanceSearch|asRetriever|addVectors|addDocuments|embedDocuments|embedQuery|fromTexts|fromDocuments|fromExistingIndex|RecordManagerInterface|IndexingResult|_HashedDocument|HashedDocumentInterface|sourceIdKey|cleanupBatchSize|forceUpdate|_deduplicateInOrder|_getSourceIdAssigner|timeAtLeast|groupIds|listKeys|deleteKeys|StructuredQuery|FilterDirective|BaseTranslator|BasicTranslator|Comparators|Operators|mergeFilters|castValue|@langchain\/core\/utils\/testing|@langchain\/core\/structured_query|@langchain\/core\/vectorstores|@langchain\/core\/embeddings|@langchain\/core\/indexing)/i.test(text);
}

function vectorDbSetups(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["vectorSetups"] {
  const rows: VectorDbReadinessReport["vectorSetups"] = [];
  for (const source of sourceFiles) {
    const collectionCount = countMatches(source.text, /createCollection|create_collection|collections\.create|get_or_create_collection|get_collection|collection_name|class_name|collections\.get|create table|CREATE TABLE/gi);
    const vectorConfigCount = countMatches(source.text, /vector_config|vectors\s*:|VectorParams|size\s*:|dimension|dimensions|distance|hnsw|Configure\.Vectors|metadata=\{"hnsw/gi);
    const embeddingCount = countMatches(source.text, /embedding|embeddings|embedding_function|vectorizer|text2vec|model provider|sentence-transformers|OpenAIEmbeddingFunction|sparse vector|EmbeddingsInterface|embedDocuments|embedQuery|SyntheticEmbeddings|similarity\?:|custom similarity|cosine/gi);
    const upsertCount = countMatches(source.text, /upsert|add\(|addVectors|addDocuments|fromTexts|fromDocuments|MemoryVectorStore|MemoryVector|memoryVectors|RecordManagerInterface|_HashedDocument|_batch|_deduplicateInOrder|docsToIndex|vectorStore\.addDocuments|id:\s*documents\[idx\]\.id|insert|batch|points|objects|documents\s*=|ids\s*=|metadatas\s*=/gi);
    const queryCount = countMatches(source.text, /search|query|StructuredQuery|Visitor|visitStructuredQuery|BaseTranslator|BasicTranslator|nearText|nearVector|hybrid|nearest|similarity|similaritySearchWithScore|similaritySearchVectorWithScore|maxMarginalRelevanceSearch|asRetriever|_queryVectors|filterFunction|filteredMemoryVectors|maximalMarginalRelevance|mmrIndexes|selectedEmbeddingsIndexes|searchType|fetchK|lambda|n_results|limit|score|distance/gi);
    const filterCount = countMatches(source.text, /filter|FilterType|FilterDirective|Comparison|Operation|Operators|Comparators|allowedOperators|allowedComparators|visitOperation|visitComparison|mergeFilters|isFilterEmpty|castValue|filterFunction|filteredMemoryVectors|sourceIdKey|groupIds|where|payload|metadata|metadatas|must|should|operator|valueText|field_name|payload index/gi);
    const hybridCount = countMatches(source.text, /hybrid|BM25|sparse vector|sparse_vectors|full-text|keyword|RRF|rerank|reranker/gi);
    const rerankCount = countMatches(source.text, /rerank|reranker|cross-encoder|mmr|Maximal Marginal Relevance|MaxMarginalRelevanceSearchOptions|maximalMarginalRelevance|mmrIndexes|selectedEmbeddingsIndexes|searchType:\s*["']mmr["']|fetchK|lambda|relevance feedback/gi);
    const tenantCount = countMatches(source.text, /tenant|tenancy|multi_tenancy|multi-tenancy|tenant_id|tenantId/gi);
    const replicationCount = countMatches(source.text, /replication|replication_factor|shard|sharding|consistency|read_consistency|write_consistency/gi);
    const snapshotCount = countMatches(source.text, /snapshot|backup|restore|health|metrics|ttl|time-to-live|migration|persist|PersistentClient|SaveableVectorStore|save\s*\(|static\s+load|fromExistingIndex|cleanupBatchSize|forceUpdate|deleteKeys|listKeys|timeAtLeast|cleanup\s*===|recordManager\.update/gi);
    const totalSignals = collectionCount + vectorConfigCount + embeddingCount + upsertCount + queryCount + filterCount + hybridCount + rerankCount + tenantCount + replicationCount + snapshotCount;
    if (totalSignals === 0 && !vectorDbPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: vectorDbPlatform(source),
      collectionCount,
      vectorConfigCount,
      embeddingCount,
      upsertCount,
      queryCount,
      filterCount,
      hybridCount,
      rerankCount,
      tenantCount,
      replicationCount,
      snapshotCount,
      readiness: collectionCount > 0 && embeddingCount > 0 && upsertCount > 0 && queryCount > 0 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} vector DB signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.collectionCount + b.embeddingCount + b.upsertCount + b.queryCount + b.filterCount + b.snapshotCount) - (a.collectionCount + a.embeddingCount + a.upsertCount + a.queryCount + a.filterCount + a.snapshotCount) || a.filePath.localeCompare(b.filePath)).slice(0, 90);
}

function vectorDbPlatform(source: VectorDbSourceFile): VectorDbReadinessReport["vectorSetups"][number]["platform"] {
  if (/qdrant|QdrantClient/i.test(source.filePath) || /qdrant|QdrantClient/i.test(source.text)) return "qdrant";
  if (/weaviate|Weaviate/i.test(source.filePath) || /weaviate|Weaviate/i.test(source.text)) return "weaviate";
  if (/chroma|chromadb|PersistentClient|HttpClient/i.test(source.filePath) || /chroma|chromadb|PersistentClient|HttpClient/i.test(source.text)) return "chroma";
  if (/pinecone/i.test(source.text)) return "pinecone";
  if (/milvus|pymilvus/i.test(source.text)) return "milvus";
  if (/pgvector|vector\(/i.test(source.text)) return "pgvector";
  if (/faiss|FAISS/i.test(source.text)) return "faiss";
  if (/@langchain\/core\/vectorstores|@langchain\/core\/embeddings|@langchain\/core\/indexing|@langchain\/core\/structured_query|RecordManagerInterface|VectorStoreRetriever|SaveableVectorStore|MemoryVectorStore|VectorStoreInterface|VectorStore\b|FunctionalTranslator|BaseTranslator|BasicTranslator|StructuredQuery|Comparators|Operators/i.test(source.text)) return "langchain";
  if (/vector|embedding|retrieval/i.test(source.filePath) || /vector|embedding|retrieval/i.test(source.text)) return "custom";
  return "unknown";
}

function vectorDbCollectionSignals(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["collectionSignals"] {
  const specs: Array<{ signal: VectorDbReadinessReport["collectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "collection", pattern: /createCollection|create_collection|get_or_create_collection|collection_name|collections\.create/i, evidence: "collection evidence was detected." },
    { signal: "class", pattern: /class_name|DataType|Property\(|client\.collections\.create|schema class/i, evidence: "class/object schema evidence was detected." },
    { signal: "schema", pattern: /schema|properties|Property\(|DataType|payload_schema|CREATE TABLE/i, evidence: "schema evidence was detected." },
    { signal: "vector-config", pattern: /vector_config|vectors\s*:|VectorParams|Configure\.Vectors|embedding_function/i, evidence: "vector config evidence was detected." },
    { signal: "distance", pattern: /distance|Distance\.Cosine|Cosine|dot|euclidean|l2|hnsw:space/i, evidence: "distance metric evidence was detected." },
    { signal: "dimensions", pattern: /dimension|dimensions|size\s*:|vector_size|1536|768|384/i, evidence: "vector dimensions evidence was detected." },
    { signal: "hnsw", pattern: /HNSW|hnsw|hnsw_config|hnsw:space/i, evidence: "HNSW evidence was detected." }
  ];
  return vectorDbSignalFromSpecs(sourceFiles, specs, "collection", "signal");
}

function vectorDbClientSignals(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["clientSignals"] {
  const specs: Array<{ signal: VectorDbReadinessReport["clientSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "qdrant-client", pattern: /QdrantClient|qdrant-client|@qdrant\/js-client-rest|qdrant_client/i, evidence: "Qdrant client evidence was detected." },
    { signal: "weaviate-client", pattern: /weaviate-client|import weaviate|connect_to_local|WeaviateClient/i, evidence: "Weaviate client evidence was detected." },
    { signal: "chromadb-client", pattern: /chromadb|Chroma|chromadb\.Client|PersistentClient|HttpClient/i, evidence: "Chroma client evidence was detected." },
    { signal: "http-client", pattern: /HttpClient|url\s*:|baseURL|endpoint|host|port/i, evidence: "HTTP/client endpoint evidence was detected." },
    { signal: "persistent-client", pattern: /PersistentClient|persist_directory|persist|path\s*=|storage_path/i, evidence: "persistent client evidence was detected." },
    { signal: "api-key", pattern: /apiKey|api_key|API_KEY|X-OpenAI-Api-Key|QDRANT_API_KEY|WEAVIATE_API_KEY|PINECONE_API_KEY/i, evidence: "API key environment evidence was detected." },
    { signal: "endpoint", pattern: /QDRANT_URL|WEAVIATE_URL|CHROMA|endpoint|url\s*:|connect_to|host/i, evidence: "endpoint evidence was detected." }
  ];
  return vectorDbSignalFromSpecs(sourceFiles, specs, "client", "signal");
}

function vectorDbIngestionSignals(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["ingestionSignals"] {
  const specs: Array<{ signal: VectorDbReadinessReport["ingestionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "add", pattern: /\.add\(|collection\.add|add_documents|add_texts/i, evidence: "add ingestion evidence was detected." },
    { signal: "upsert", pattern: /upsert|upsert_points|client\.upsert/i, evidence: "upsert evidence was detected." },
    { signal: "batch", pattern: /batch|batches|batch_size|objects\.batch|range\(0/i, evidence: "batch ingestion evidence was detected." },
    { signal: "ids", pattern: /\bids\b|id\s*:|Point\(id|uuid/i, evidence: "record ID evidence was detected." },
    { signal: "documents", pattern: /documents|document|page_content|texts|chunks/i, evidence: "document ingestion evidence was detected." },
    { signal: "metadata", pattern: /metadata|metadatas|properties|source|filename/i, evidence: "metadata evidence was detected." },
    { signal: "payload", pattern: /payload|SetPayload|payload index|field_name/i, evidence: "payload evidence was detected." },
    { signal: "delete", pattern: /delete|remove|delete_collection|delete_vectors|delete_payload/i, evidence: "delete evidence was detected." },
    { signal: "add-vectors", pattern: /addVectors|add_vectors/i, evidence: "LangChain addVectors ingestion evidence was detected." },
    { signal: "from-texts", pattern: /fromTexts|from_texts/i, evidence: "LangChain fromTexts ingestion evidence was detected." },
    { signal: "from-documents", pattern: /fromDocuments|from_documents/i, evidence: "LangChain fromDocuments ingestion evidence was detected." },
    { signal: "memory-vector-store", pattern: /MemoryVectorStore|MemoryVector|memoryVectors|In-memory, ephemeral vector store/i, evidence: "LangChain MemoryVectorStore storage evidence was detected." },
    { signal: "memory-vector-ids", pattern: /id:\s*documents\[idx\]\.id|id\?:\s*string|stores and retrieves document IDs|DocumentInterface/i, evidence: "MemoryVectorStore document ID preservation evidence was detected." },
    { signal: "fake-vector-store", pattern: /FakeVectorStore|FakeVectorStoreArgs|@langchain\/core\/utils\/testing/i, evidence: "LangChain FakeVectorStore test double evidence was detected." },
    { signal: "indexing-record-manager", pattern: /RecordManagerInterface|recordManager\.getTime|recordManager\.exists|recordManager\.update|@langchain\/core\/indexing\/record_manager/i, evidence: "LangChain indexing record manager evidence was detected." },
    { signal: "hashed-document", pattern: /_HashedDocument|HashedDocumentInterface|hash_|contentHash|metadataHash|calculateHashes|toDocument/i, evidence: "LangChain hashed document evidence was detected." },
    { signal: "indexing-batch", pattern: /_batch|batchSize|cleanupBatchSize/i, evidence: "LangChain indexing batch evidence was detected." },
    { signal: "indexing-deduplicate", pattern: /_deduplicateInOrder|deduplicate|seenDocs/i, evidence: "LangChain indexing deduplication evidence was detected." }
  ];
  return vectorDbSignalFromSpecs(sourceFiles, specs, "ingestion", "signal");
}

function vectorDbQuerySignals(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["querySignals"] {
  const specs: Array<{ signal: VectorDbReadinessReport["querySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "search", pattern: /\.search\(|search\(|client\.search|semantic search/i, evidence: "search evidence was detected." },
    { signal: "query", pattern: /\.query\(|query_texts|query\(|collections\.query/i, evidence: "query evidence was detected." },
    { signal: "nearest-neighbor", pattern: /nearest|neighbor|knn|ann|vector similarity/i, evidence: "nearest-neighbor evidence was detected." },
    { signal: "similarity", pattern: /similarity|cosine|distance|score|distances/i, evidence: "similarity scoring evidence was detected." },
    { signal: "hybrid", pattern: /hybrid|BM25|sparse vector|RRF|keyword/i, evidence: "hybrid search evidence was detected." },
    { signal: "full-text", pattern: /full-text|full text|where_document|\$contains|keyword/i, evidence: "full-text evidence was detected." },
    { signal: "filter", pattern: /filter|where|must|should|operator|Equal|valueText/i, evidence: "filter evidence was detected." },
    { signal: "structured-query", pattern: /StructuredQuery|structured_query\/ir|@langchain\/core\/structured_query/i, evidence: "LangChain structured query evidence was detected." },
    { signal: "comparison-filter", pattern: /Comparison|Comparators|VisitorComparisonResult|comparison\.attribute|comparison\.comparator/i, evidence: "LangChain comparison filter evidence was detected." },
    { signal: "operation-filter", pattern: /Operation|Operators|VisitorOperationResult|operation\.args|operator:\s*Operator/i, evidence: "LangChain operation filter evidence was detected." },
    { signal: "structured-query-visitor", pattern: /Visitor|visitOperation|visitComparison|visitStructuredQuery|accept\(visitor/i, evidence: "LangChain structured query visitor evidence was detected." },
    { signal: "basic-translator", pattern: /BaseTranslator|BasicTranslator|TranslatorOpts|allowedOperators|allowedComparators|formatFunction/i, evidence: "LangChain structured query translator evidence was detected." },
    { signal: "functional-translator", pattern: /FunctionalTranslator|structured_query\/functional|getRelevantDocuments/i, evidence: "LangChain functional translator evidence was detected." },
    { signal: "function-filter", pattern: /FunctionFilter|\(document:\s*Document\)\s*=>\s*boolean|returns a function that takes a `Document`/i, evidence: "LangChain function filter evidence was detected." },
    { signal: "type-aware-comparators", pattern: /getAllowedComparatorsForType|ValueType|Unsupported data type|boolean[\s\S]{0,120}Comparators\.eq/i, evidence: "LangChain type-aware comparator allowlist evidence was detected." },
    { signal: "comparator-function", pattern: /getComparatorFunction|Unknown comparator|Comparators\.(eq|ne|gt|gte|lt|lte)/i, evidence: "LangChain comparator function evidence was detected." },
    { signal: "operator-function", pattern: /getOperatorFunction|Unknown operator|Operators\.(and|or)|operatorFunction/i, evidence: "LangChain operator function evidence was detected." },
    { signal: "functional-filter-merge", pattern: /mergeFilters[\s\S]{0,220}(defaultFilter|generatedFilter)|defaultFilter\(document\)|generatedFilter\(document\)/i, evidence: "LangChain functional filter merge evidence was detected." },
    { signal: "filter-merge", pattern: /mergeFilters|forceDefaultFilter|mergeType|isFilterEmpty|\$and|\$or/i, evidence: "LangChain filter merge evidence was detected." },
    { signal: "filter-value-cast", pattern: /castValue|isInt|isFloat|isBoolean|Unsupported value type/i, evidence: "LangChain filter value cast evidence was detected." },
    { signal: "fake-vector-search", pattern: /FakeVectorStore[\s\S]{0,240}similaritySearchVectorWithScore|similaritySearchVectorWithScore[\s\S]{0,160}filterFunction/i, evidence: "LangChain FakeVectorStore search evidence was detected." },
    { signal: "limit", pattern: /limit|n_results|top_k|topK|k\s*=/i, evidence: "limit/top-k evidence was detected." },
    { signal: "score", pattern: /score|distance|distances|certainty|similarity/i, evidence: "score/distance evidence was detected." },
    { signal: "similarity-with-score", pattern: /similaritySearchWithScore|similaritySearchVectorWithScore|SimilaritySearchWithScore/i, evidence: "LangChain scored similarity search evidence was detected." },
    { signal: "mmr", pattern: /maxMarginalRelevanceSearch|MaxMarginalRelevanceSearchOptions|searchType:\s*["']mmr["']|MMR|fetchK|lambda/i, evidence: "MMR retrieval evidence was detected." },
    { signal: "as-retriever", pattern: /\.asRetriever|asRetriever\(|VectorStoreRetriever/i, evidence: "LangChain retriever adapter evidence was detected." },
    { signal: "memory-query-vectors", pattern: /_queryVectors|filterFunction|filteredMemoryVectors|this\.similarity\(query,\s*vector\.embedding\)/i, evidence: "MemoryVectorStore query vector pipeline evidence was detected." },
    { signal: "mmr-index-selection", pattern: /maximalMarginalRelevance|queryEmbedding|embeddingList|mmrIndexes|selectedEmbeddingsIndexes/i, evidence: "MMR embedding index selection evidence was detected." },
    { signal: "similarity-sort", pattern: /sort\(\(a,\s*b\).*similarity|descending order of similarity|similarityCalledCount|expectedOrder/i, evidence: "similarity sort ordering evidence was detected." }
  ];
  return vectorDbSignalFromSpecs(sourceFiles, specs, "query", "signal");
}

function vectorDbEmbeddingSignals(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["embeddingSignals"] {
  const specs: Array<{ signal: VectorDbReadinessReport["embeddingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "embedding-function", pattern: /embedding_function|EmbeddingFunction|OpenAIEmbeddingFunction|embedding_functions/i, evidence: "embedding function evidence was detected." },
    { signal: "vectorizer", pattern: /vectorizer|text2vec|Configure\.Vectors|model2vec/i, evidence: "vectorizer evidence was detected." },
    { signal: "model-provider", pattern: /OpenAI|Cohere|HuggingFace|sentence-transformers|text-embedding|model_name|model provider/i, evidence: "embedding model provider evidence was detected." },
    { signal: "precomputed-vector", pattern: /embeddings\s*=|vector\s*:|vectors\s*:|precomputed|own embeddings/i, evidence: "precomputed vector evidence was detected." },
    { signal: "sparse-vector", pattern: /sparse vector|sparse_vectors|BM25|SPLADE|sparse/i, evidence: "sparse vector evidence was detected." },
    { signal: "multimodal", pattern: /image|multimodal|CLIP|audio|visual search/i, evidence: "multimodal vector evidence was detected." },
    { signal: "text-splitter", pattern: /TextSplitter|split_documents|chunk|chunks|RecursiveCharacterTextSplitter/i, evidence: "text splitting/chunking evidence was detected." },
    { signal: "base-embeddings", pattern: /abstract class Embeddings|class\s+\w+\s+extends\s+Embeddings|Embeddings<|implements\s+EmbeddingsInterface/i, evidence: "LangChain base Embeddings contract evidence was detected." },
    { signal: "embeddings-params", pattern: /EmbeddingsParams|AsyncCallerParams|maxConcurrency|maxRetries/i, evidence: "LangChain EmbeddingsParams evidence was detected." },
    { signal: "embedding-async-caller", pattern: /AsyncCaller|caller:\s*AsyncCaller|this\.caller|new AsyncCaller/i, evidence: "LangChain embedding AsyncCaller evidence was detected." },
    { signal: "embed-documents", pattern: /embedDocuments|EmbeddingsInterface/i, evidence: "LangChain embedDocuments evidence was detected." },
    { signal: "embed-query", pattern: /embedQuery|EmbeddingsInterface/i, evidence: "LangChain embedQuery evidence was detected." },
    { signal: "custom-similarity-function", pattern: /similarity\?:\s*typeof cosine|similarity:\s*\(a:\s*number\[\],\s*b:\s*number\[\]\)|this\.similarity = similarity \?\? cosine|custom similarity|cosine/i, evidence: "custom similarity function evidence was detected." },
    { signal: "fake-vector-embedding", pattern: /FakeVectorStore[\s\S]{0,240}EmbeddingsInterface|embeddings:\s*EmbeddingsInterface/i, evidence: "LangChain FakeVectorStore embedding evidence was detected." }
  ];
  return vectorDbSignalFromSpecs(sourceFiles, specs, "embedding", "signal");
}

function vectorDbIndexSignals(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["indexSignals"] {
  const specs: Array<{ signal: VectorDbReadinessReport["indexSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hnsw", pattern: /HNSW|hnsw|hnsw_config|hnsw:space/i, evidence: "HNSW evidence was detected." },
    { signal: "quantization", pattern: /quantization|scalar quantization|product quantization|int8/i, evidence: "quantization evidence was detected." },
    { signal: "payload-index", pattern: /payload index|createPayloadIndex|field_schema|index property|filterable/i, evidence: "payload index evidence was detected." },
    { signal: "vector-index", pattern: /vector_index|vector index|indexing|index config/i, evidence: "vector index evidence was detected." },
    { signal: "distance-metric", pattern: /distance|Cosine|Dot|Euclid|L2|hnsw:space/i, evidence: "distance metric evidence was detected." },
    { signal: "shard", pattern: /shard|sharding|shard_number|shard_name/i, evidence: "sharding evidence was detected." },
    { signal: "replication", pattern: /replication|replication_factor|replicas|factor\s*:\s*3/i, evidence: "replication evidence was detected." },
    { signal: "consistency", pattern: /consistency|read_consistency|write_consistency|quorum/i, evidence: "consistency evidence was detected." },
    { signal: "indexing-hash", pattern: /UUIDV5_NAMESPACE|hash_|contentHash|metadataHash|HashKeyEncoder|sha256|calculateHashes|_hashStringToUUID|_hashNestedDictToUUID/i, evidence: "LangChain indexing hash evidence was detected." },
    { signal: "source-id-key", pattern: /sourceIdKey|_getSourceIdAssigner|sourceIdAssigner|groupIds/i, evidence: "LangChain indexing source ID evidence was detected." }
  ];
  return vectorDbSignalFromSpecs(sourceFiles, specs, "index", "signal");
}

function vectorDbOpsSignals(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["opsSignals"] {
  const specs: Array<{ signal: VectorDbReadinessReport["opsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "snapshot", pattern: /snapshot|createSnapshot|snapshot recovery/i, evidence: "snapshot evidence was detected." },
    { signal: "backup", pattern: /backup|backup store|backup_restore/i, evidence: "backup evidence was detected." },
    { signal: "restore", pattern: /restore|recover|recovery/i, evidence: "restore evidence was detected." },
    { signal: "health", pattern: /health|healthz|readyz|liveness/i, evidence: "health check evidence was detected." },
    { signal: "metrics", pattern: /metrics|Prometheus|duration|latency|query_dimensions/i, evidence: "metrics evidence was detected." },
    { signal: "migration", pattern: /migration|migrate|reindex|schema migration/i, evidence: "migration evidence was detected." },
    { signal: "multi-tenancy", pattern: /multi-tenancy|multi_tenancy|tenant|tenants/i, evidence: "multi-tenancy evidence was detected." },
    { signal: "ttl", pattern: /\bTTL\b|ttl|time-to-live|expire|retention/i, evidence: "TTL/retention evidence was detected." },
    { signal: "saveable-vectorstore", pattern: /SaveableVectorStore|save\s*\(|static\s+load|fromExistingIndex/i, evidence: "LangChain save/load vector store evidence was detected." },
    { signal: "from-existing-index", pattern: /fromExistingIndex|existing index/i, evidence: "LangChain vector store fromExistingIndex evidence was detected." },
    { signal: "incremental-cleanup", pattern: /cleanup:\s*["']incremental["']|cleanup\s*===\s*["']incremental["']|CleanupMode.*incremental/i, evidence: "LangChain incremental cleanup evidence was detected." },
    { signal: "full-cleanup", pattern: /cleanup:\s*["']full["']|cleanup\s*===\s*["']full["']|CleanupMode.*full/i, evidence: "LangChain full cleanup evidence was detected." },
    { signal: "force-update", pattern: /forceUpdate|docsToUpdate|seenDocs/i, evidence: "LangChain force-update evidence was detected." },
    { signal: "record-manager-keys", pattern: /listKeys|deleteKeys|timeAtLeast|groupIds|recordManager\.deleteKeys/i, evidence: "LangChain record manager key lifecycle evidence was detected." }
  ];
  return vectorDbSignalFromSpecs(sourceFiles, specs, "ops", "signal");
}

function vectorDbPackageSignals(sourceFiles: VectorDbSourceFile[]): VectorDbReadinessReport["packageSignals"] {
  const specs: Array<{ signal: VectorDbReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "qdrant-client", pattern: /@qdrant\/js-client-rest|qdrant-client|qdrant_client/i, evidence: "Qdrant client package evidence was detected." },
    { signal: "weaviate-client", pattern: /weaviate-client|import weaviate/i, evidence: "Weaviate client package evidence was detected." },
    { signal: "chromadb", pattern: /"chromadb"|chromadb|Chroma/i, evidence: "Chroma package evidence was detected." },
    { signal: "pinecone", pattern: /pinecone|@pinecone-database\/pinecone/i, evidence: "Pinecone package evidence was detected." },
    { signal: "pymilvus", pattern: /pymilvus|MilvusClient|milvus/i, evidence: "Milvus package evidence was detected." },
    { signal: "pgvector", pattern: /pgvector|vector\(|CREATE EXTENSION vector/i, evidence: "pgvector package/config evidence was detected." },
    { signal: "faiss", pattern: /faiss|FAISS/i, evidence: "FAISS package evidence was detected." },
    { signal: "@langchain/core", pattern: /@langchain\/core\/vectorstores|@langchain\/core\/embeddings|@langchain\/core/i, evidence: "LangChain core vector package evidence was detected." },
    { signal: "langchain", pattern: /langchain|@langchain\/core\/indexing|RecordManagerInterface|VectorStoreRetriever|SaveableVectorStore|MemoryVectorStore|VectorStoreInterface/i, evidence: "LangChain vector abstraction evidence was detected." }
  ];
  return vectorDbSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function vectorDbSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: VectorDbSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/vector-db-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSearchServiceReadinessReport(walk: WalkResult): Promise<SearchServiceReadinessReport> {
  const sourceFiles = await searchServiceSourceFiles(walk);
  const searchSetups = searchServiceSetups(sourceFiles);
  const indexSignals = searchServiceIndexSignals(sourceFiles);
  const ingestionSignals = searchServiceIngestionSignals(sourceFiles);
  const querySignals = searchServiceQuerySignals(sourceFiles);
  const relevanceSignals = searchServiceRelevanceSignals(sourceFiles);
  const clientSignals = searchServiceClientSignals(sourceFiles);
  const opsSignals = searchServiceOpsSignals(sourceFiles);
  const packageSignals = searchServicePackageSignals(sourceFiles);
  const hasClient = searchSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasIndex = indexSignals.some((item) => item.readiness === "ready") || searchSetups.some((item) => item.indexCount > 0 || item.schemaCount > 0);
  const hasIngestion = ingestionSignals.some((item) => item.readiness === "ready") || searchSetups.some((item) => item.documentCount > 0);
  const hasQuery = querySignals.some((item) => item.readiness === "ready") || searchSetups.some((item) => item.queryCount > 0);
  const hasRelevance = relevanceSignals.some((item) => item.readiness === "ready") || searchSetups.some((item) => item.rankingCount > 0 || item.typoCount > 0 || item.synonymCount > 0);
  const hasOps = opsSignals.some((item) => item.readiness === "ready") || searchSetups.some((item) => item.opsCount > 0);
  const riskQueue: SearchServiceReadinessReport["riskQueue"] = [];
  if (!hasClient) riskQueue.push({ priority: "high", action: "Add a visible Meilisearch, Typesense, OpenSearch, Elasticsearch, Algolia, or local search client boundary.", why: "Search-service readiness starts with a concrete engine/client boundary, not only a static Pagefind index.", relatedHref: "html/search-service-readiness.html" });
  if (hasClient && !hasIndex) riskQueue.push({ priority: "high", action: "Record index, collection, schema, mapping, field, primary key, or settings setup.", why: "Search quality is not reproducible unless the indexed data shape is visible.", relatedHref: "html/search-service-readiness.html" });
  if (hasIndex && !hasIngestion) riskQueue.push({ priority: "medium", action: "Add document add/import/bulk/upsert/batch/delete/refresh ingestion evidence.", why: "Learners need to see how records become searchable documents.", relatedHref: "html/search-service-readiness.html" });
  if (hasIngestion && !hasQuery) riskQueue.push({ priority: "medium", action: "Add search query evidence with q/query_by/match/bool/filter/sort/facet/pagination/highlight.", why: "Indexing without query shape does not explain the user-facing search contract.", relatedHref: "html/search-service-readiness.html" });
  if (hasQuery && !hasRelevance) riskQueue.push({ priority: "low", action: "Add relevance controls such as typo tolerance, ranking rules, searchable/filterable/sortable attributes, synonyms, stop words, distinct, geo, or semantic/hybrid search.", why: "Search-service behavior depends heavily on relevance tuning, not only query execution.", relatedHref: "html/search-service-readiness.html" });
  if (hasQuery && !hasOps) riskQueue.push({ priority: "low", action: "Document tasks, health, dumps, snapshots, aliases, replicas, cluster settings, or analytics.", why: "Production search indexes are operational state and need recovery, scaling, and monitoring evidence.", relatedHref: "html/search-service-readiness.html" });
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Search service readiness report: setup ${searchSetups.length}개, index signal ${indexSignals.length}개, query signal ${querySignals.length}개, relevance signal ${relevanceSignals.length}개, ops signal ${opsSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Search service readiness Meilisearch Typesense OpenSearch indexes collections schema mappings fields primary key settings documents add import bulk upsert batch search q query_by filter_by sort_by facet_by ranking rules typo tolerance synonyms stop words distinct geosearch hybrid semantic highlight crop pagination tasks health dumps snapshots aliases replicas cluster analytics API keys hosts nodes",
    searchSetups,
    indexSignals,
    ingestionSignals,
    querySignals,
    relevanceSignals,
    clientSignals,
    opsSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"MeiliSearch|meilisearch|Typesense|@opensearch-project|OpenSearch|Elasticsearch|algoliasearch\" .", purpose: "Find search engine client boundaries and packages." },
      { command: "rg \"index\\(|collections\\.create|indices\\.create|mappings|fields|primaryKey|primary_key|settings\" .", purpose: "Map index, collection, schema, mapping, field, primary key, and settings setup." },
      { command: "rg \"addDocuments|documents\\.create|documents\\.import|bulk|upsert|batch|refresh|delete\" .", purpose: "Review document ingestion paths without writing to a search service." },
      { command: "rg \"search\\(|query_by|filter_by|sort_by|facet_by|match|bool|highlight|limit|offset|per_page\" .", purpose: "Trace user-facing query shape, filters, facets, sort, pagination, and highlighting." },
      { command: "rg \"rankingRules|typo|synonyms|stopWords|distinct|geo|hybrid|semantic|tasks|snapshot|dump|alias|replica|cluster|analytics\" .", purpose: "Check relevance tuning and search operations evidence." }
    ],
    learnerNextSteps: [
      "먼저 Meilisearch, Typesense, OpenSearch, Elasticsearch, Algolia, 또는 local search 중 어떤 engine이 client boundary인지 확인하세요.",
      "index/collection/schema/mapping/fields/primary key/settings는 검색 결과 재현성의 핵심입니다.",
      "add/import/bulk/upsert/batch/delete/refresh는 데이터가 searchable document로 들어가는 방식을 보여줍니다.",
      "q/query_by/match/bool/filter/sort/facet/pagination/highlight/score는 사용자 search contract를 설명합니다.",
      "typo tolerance, ranking rules, synonyms, stop words, distinct, geo, semantic/hybrid search는 relevance tuning 근거입니다.",
      "이 리포트는 정적 readiness입니다. RepoTutor는 search server를 시작하거나, clients를 실행하거나, documents를 index/search/delete/snapshot하지 않습니다."
    ]
  };
}

type SearchServiceSourceFile = { filePath: string; text: string; sourceHref: string };

async function searchServiceSourceFiles(walk: WalkResult): Promise<SearchServiceSourceFile[]> {
  const files: SearchServiceSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !searchServiceInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!searchServicePathSignal(file.relPath) && !searchServiceContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function searchServiceInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return searchServicePathSignal(filePath)
    || /(^|\/)(README|docs?|search|indexes?|indices|collections?|schemas?|mappings?|opensearch|elasticsearch|meili|typesense|algolia|config|workflows?|scripts?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|docker-compose\.ya?ml|compose\.ya?ml)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|py|json|jsonl|csv|md|mdx|ya?ml|toml|txt)$/i.test(filePath);
}

function searchServicePathSignal(filePath: string): boolean {
  return /(^|\/)(meilisearch|meili|typesense|opensearch|elasticsearch|elastic|algolia|instantsearch|search|indexes?|indices|collections?)(\/|\.|-|_|$)/i.test(filePath)
    || /\.github\/workflows\/.*(search|meili|typesense|opensearch|elastic|algolia).*\.(ya?ml)$/i.test(filePath);
}

function searchServiceContentSignal(text: string): boolean {
  return /(MeiliSearch|meilisearch|Typesense|@opensearch-project\/opensearch|OpenSearch|Elasticsearch|algoliasearch|instantsearch|indices\.create|collections\.create|addDocuments|documents\.create|documents\.import|bulk|query_by|filter_by|sort_by|facet_by|rankingRules|ranking rules|typo tolerance|synonyms|stopWords|highlight|geosearch|semantic search|hybrid search|snapshot|dump|tasks|replicas?|cluster)/i.test(text);
}

function searchServiceSetups(sourceFiles: SearchServiceSourceFile[]): SearchServiceReadinessReport["searchSetups"] {
  const rows: SearchServiceReadinessReport["searchSetups"] = [];
  for (const source of sourceFiles) {
    const indexCount = countMatches(source.text, /index\(|client\.index|indices\.create|createIndex|collections\.create|collection_name|indexName|index_name/gi);
    const schemaCount = countMatches(source.text, /schema|mappings|properties|fields|settings|primaryKey|primary_key|default_sorting_field|searchableAttributes|filterableAttributes|sortableAttributes/gi);
    const documentCount = countMatches(source.text, /addDocuments|documents\.create|documents\.import|add_documents|bulk|upsert|batch|refresh|delete|documents\s*=/gi);
    const queryCount = countMatches(source.text, /search\(|\.search|query_by|filter_by|sort_by|facet_by|match|bool|query|q\s*:|highlight|pagination|per_page|limit|offset|size|from/gi);
    const filterCount = countMatches(source.text, /filter|filter_by|where|term|range|facet|facet_by|facets|aggs|aggregations/gi);
    const facetCount = countMatches(source.text, /facet|facet_by|facets|aggregations|aggs|terms/gi);
    const rankingCount = countMatches(source.text, /rankingRules|ranking rules|ranking|searchableAttributes|sortableAttributes|filterableAttributes|customRanking|score|boost|curation|merchandizing/gi);
    const typoCount = countMatches(source.text, /typo|typo tolerance|prefix|fuzzy|edit distance|spellcheck/gi);
    const synonymCount = countMatches(source.text, /synonym|synonyms|stopWords|stop words|stop-words/gi);
    const geoCount = countMatches(source.text, /geo|geosearch|_geo|lat|lng|longitude|latitude|bounding box/gi);
    const opsCount = countMatches(source.text, /task|tasks|health|dump|snapshot|alias|replica|replicas|cluster|analytics|monitoring|metrics|api key|API_KEY|master key|nodes/gi);
    const totalSignals = indexCount + schemaCount + documentCount + queryCount + filterCount + facetCount + rankingCount + typoCount + synonymCount + geoCount + opsCount;
    if (totalSignals === 0 && !searchServicePathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: searchServicePlatform(source),
      indexCount,
      schemaCount,
      documentCount,
      queryCount,
      filterCount,
      facetCount,
      rankingCount,
      typoCount,
      synonymCount,
      geoCount,
      opsCount,
      readiness: indexCount > 0 && documentCount > 0 && queryCount > 0 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} search service signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.indexCount + b.documentCount + b.queryCount + b.rankingCount + b.opsCount) - (a.indexCount + a.documentCount + a.queryCount + a.rankingCount + a.opsCount) || a.filePath.localeCompare(b.filePath)).slice(0, 90);
}

function searchServicePlatform(source: SearchServiceSourceFile): SearchServiceReadinessReport["searchSetups"][number]["platform"] {
  if (/meilisearch|MeiliSearch|meili/i.test(source.filePath) || /meilisearch|MeiliSearch|meili/i.test(source.text)) return "meilisearch";
  if (/typesense/i.test(source.filePath) || /Typesense|typesense/i.test(source.text)) return "typesense";
  if (/opensearch/i.test(source.filePath) || /OpenSearch|@opensearch-project/i.test(source.text)) return "opensearch";
  if (/elasticsearch|elastic/i.test(source.text)) return "elasticsearch";
  if (/algolia|algoliasearch/i.test(source.text)) return "algolia";
  if (/lunr|FlexSearch|MiniSearch/i.test(source.text)) return "lunr";
  if (/search|index|query/i.test(source.filePath) || /search|index|query/i.test(source.text)) return "custom";
  return "unknown";
}

function searchServiceIndexSignals(sourceFiles: SearchServiceSourceFile[]): SearchServiceReadinessReport["indexSignals"] {
  const specs: Array<{ signal: SearchServiceReadinessReport["indexSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "index", pattern: /index\(|client\.index|indices\.create|createIndex|indexName|index_name/i, evidence: "index evidence was detected." },
    { signal: "collection", pattern: /collections\.create|collection_name|client\.collections|collections\(/i, evidence: "collection evidence was detected." },
    { signal: "schema", pattern: /schema|fields|default_sorting_field|properties/i, evidence: "schema evidence was detected." },
    { signal: "mapping", pattern: /mappings|properties|type:\s*['"]?(text|keyword)|indices\.putMapping/i, evidence: "mapping evidence was detected." },
    { signal: "fields", pattern: /fields|query_by|searchableAttributes|filterableAttributes|sortableAttributes|attributesForFaceting/i, evidence: "field evidence was detected." },
    { signal: "primary-key", pattern: /primaryKey|primary_key|primary key|document id|id:/i, evidence: "primary key evidence was detected." },
    { signal: "settings", pattern: /settings|number_of_shards|number_of_replicas|rankingRules|typoTolerance|synonyms|stopWords/i, evidence: "settings evidence was detected." }
  ];
  return searchServiceSignalFromSpecs(sourceFiles, specs, "index", "signal");
}

function searchServiceIngestionSignals(sourceFiles: SearchServiceSourceFile[]): SearchServiceReadinessReport["ingestionSignals"] {
  const specs: Array<{ signal: SearchServiceReadinessReport["ingestionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "document", pattern: /documents|document|record|records|hits|source/i, evidence: "document evidence was detected." },
    { signal: "add", pattern: /addDocuments|add_documents|documents\.create|addObject|saveObjects/i, evidence: "add document evidence was detected." },
    { signal: "import", pattern: /documents\.import|import\(|import_documents|jsonl|csv/i, evidence: "import evidence was detected." },
    { signal: "bulk", pattern: /bulk|_bulk|bulkIndex|bulk indexing/i, evidence: "bulk ingestion evidence was detected." },
    { signal: "upsert", pattern: /upsert|action:\s*['"]upsert|updateDocuments|partialUpdateObject/i, evidence: "upsert/update evidence was detected." },
    { signal: "batch", pattern: /batch|batch_size|batchSize|chunks?|chunk_size/i, evidence: "batch evidence was detected." },
    { signal: "delete", pattern: /deleteDocuments|documents\.delete|deleteObject|indices\.delete|deleteIndex|drop collection/i, evidence: "delete evidence was detected." },
    { signal: "refresh", pattern: /refresh|waitForTask|wait_task|wait_for_task|commit|flush/i, evidence: "refresh/task wait evidence was detected." }
  ];
  return searchServiceSignalFromSpecs(sourceFiles, specs, "ingestion", "signal");
}

function searchServiceQuerySignals(sourceFiles: SearchServiceSourceFile[]): SearchServiceReadinessReport["querySignals"] {
  const specs: Array<{ signal: SearchServiceReadinessReport["querySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "search", pattern: /\.search\(|search\(|client\.search|multiSearch|msearch/i, evidence: "search evidence was detected." },
    { signal: "q", pattern: /\bq\s*:|q['"]?\s*[:=]|query\s*:|searchTerm/i, evidence: "query text evidence was detected." },
    { signal: "query-by", pattern: /query_by|queryBy|attributesToSearchOn|searchableAttributes/i, evidence: "query-by/searchable fields evidence was detected." },
    { signal: "match", pattern: /match|multi_match|match_phrase|query_string/i, evidence: "match query evidence was detected." },
    { signal: "bool", pattern: /bool|must|should|must_not|minimum_should_match/i, evidence: "bool query evidence was detected." },
    { signal: "filter", pattern: /filter|filter_by|filters|where|term|range/i, evidence: "filter evidence was detected." },
    { signal: "sort", pattern: /sort|sort_by|order_by|ranking|default_sorting_field/i, evidence: "sort evidence was detected." },
    { signal: "facet", pattern: /facet|facet_by|facets|aggs|aggregations|terms/i, evidence: "facet evidence was detected." },
    { signal: "pagination", pattern: /limit|offset|page|per_page|perPage|size|from|hitsPerPage/i, evidence: "pagination evidence was detected." },
    { signal: "highlight", pattern: /highlight|attributesToHighlight|attributes_to_highlight|crop|snippet/i, evidence: "highlight/crop evidence was detected." },
    { signal: "score", pattern: /score|_score|rankingScore|sort_score|explain/i, evidence: "score evidence was detected." }
  ];
  return searchServiceSignalFromSpecs(sourceFiles, specs, "query", "signal");
}

function searchServiceRelevanceSignals(sourceFiles: SearchServiceSourceFile[]): SearchServiceReadinessReport["relevanceSignals"] {
  const specs: Array<{ signal: SearchServiceReadinessReport["relevanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "typo-tolerance", pattern: /typo|typoTolerance|num_typos|fuzzy|spellcheck|prefix/i, evidence: "typo/fuzzy evidence was detected." },
    { signal: "ranking-rules", pattern: /rankingRules|ranking rules|customRanking|boost|curation|merchandizing/i, evidence: "ranking evidence was detected." },
    { signal: "searchable-attributes", pattern: /searchableAttributes|query_by|attributesToSearchOn|searchable fields/i, evidence: "searchable attributes evidence was detected." },
    { signal: "filterable-attributes", pattern: /filterableAttributes|filter_by|attributesForFaceting|facetable|facet:\s*true/i, evidence: "filterable/facetable evidence was detected." },
    { signal: "sortable-attributes", pattern: /sortableAttributes|sort_by|default_sorting_field|sortable/i, evidence: "sortable attributes evidence was detected." },
    { signal: "synonyms", pattern: /synonym|synonyms/i, evidence: "synonym evidence was detected." },
    { signal: "stop-words", pattern: /stopWords|stop words|stop-words|stopwords/i, evidence: "stop-word evidence was detected." },
    { signal: "distinct", pattern: /distinct|distinctAttribute|group_by|grouping|collapse/i, evidence: "distinct/grouping evidence was detected." },
    { signal: "geo", pattern: /geo|geosearch|_geo|lat|lng|longitude|latitude|aroundLatLng|bounding/i, evidence: "geo search evidence was detected." },
    { signal: "semantic-hybrid", pattern: /semantic|hybrid|vector|embedding|natural language|conversational|RAG/i, evidence: "semantic/hybrid evidence was detected." }
  ];
  return searchServiceSignalFromSpecs(sourceFiles, specs, "relevance", "signal");
}

function searchServiceClientSignals(sourceFiles: SearchServiceSourceFile[]): SearchServiceReadinessReport["clientSignals"] {
  const specs: Array<{ signal: SearchServiceReadinessReport["clientSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "meilisearch-client", pattern: /MeiliSearch|meilisearch|meili/i, evidence: "Meilisearch client evidence was detected." },
    { signal: "typesense-client", pattern: /Typesense|typesense/i, evidence: "Typesense client evidence was detected." },
    { signal: "opensearch-client", pattern: /@opensearch-project\/opensearch|OpenSearch|opensearch/i, evidence: "OpenSearch client evidence was detected." },
    { signal: "host", pattern: /host|hosts|node:|nodes:|MEILI_HOST|TYPESENSE_HOST|OPENSEARCH_URL|ELASTICSEARCH_URL/i, evidence: "host/node evidence was detected." },
    { signal: "api-key", pattern: /apiKey|api_key|API_KEY|MASTER_KEY|MEILI_MASTER_KEY|TYPESENSE_API_KEY|Authorization|x-typesense-api-key/i, evidence: "API key evidence was detected." },
    { signal: "nodes", pattern: /nodes|node:|cluster|peering|replica/i, evidence: "node/cluster evidence was detected." },
    { signal: "timeout", pattern: /timeout|connectionTimeoutSeconds|requestTimeout|maxRetries|retry/i, evidence: "timeout/retry evidence was detected." }
  ];
  return searchServiceSignalFromSpecs(sourceFiles, specs, "client", "signal");
}

function searchServiceOpsSignals(sourceFiles: SearchServiceSourceFile[]): SearchServiceReadinessReport["opsSignals"] {
  const specs: Array<{ signal: SearchServiceReadinessReport["opsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tasks", pattern: /task|tasks|waitForTask|wait_task|asynchronous/i, evidence: "task evidence was detected." },
    { signal: "health", pattern: /health|healthz|ready|status/i, evidence: "health evidence was detected." },
    { signal: "dump", pattern: /dump|dumps|export/i, evidence: "dump/export evidence was detected." },
    { signal: "snapshot", pattern: /snapshot|snapshots|backup|restore/i, evidence: "snapshot evidence was detected." },
    { signal: "alias", pattern: /alias|aliases|swapIndexes|index alias/i, evidence: "alias evidence was detected." },
    { signal: "replica", pattern: /replica|replicas|number_of_replicas|replication/i, evidence: "replica evidence was detected." },
    { signal: "cluster", pattern: /cluster|nodes|shards|sharding|peering|raft/i, evidence: "cluster evidence was detected." },
    { signal: "analytics", pattern: /analytics|click|conversion|metrics|monitoring|search_clicks/i, evidence: "analytics/metrics evidence was detected." }
  ];
  return searchServiceSignalFromSpecs(sourceFiles, specs, "ops", "signal");
}

function searchServicePackageSignals(sourceFiles: SearchServiceSourceFile[]): SearchServiceReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SearchServiceReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "meilisearch", pattern: /"meilisearch"|meilisearch|MeiliSearch/i, evidence: "Meilisearch package evidence was detected." },
    { signal: "typesense", pattern: /"typesense"|typesense|Typesense/i, evidence: "Typesense package evidence was detected." },
    { signal: "opensearch", pattern: /@opensearch-project\/opensearch|opensearch/i, evidence: "OpenSearch package evidence was detected." },
    { signal: "elasticsearch", pattern: /@elastic\/elasticsearch|elasticsearch/i, evidence: "Elasticsearch package evidence was detected." },
    { signal: "algolia", pattern: /algoliasearch|algolia/i, evidence: "Algolia package evidence was detected." },
    { signal: "instantsearch", pattern: /instantsearch|react-instantsearch|typesense-instantsearch-adapter/i, evidence: "InstantSearch package evidence was detected." },
    { signal: "search-ui", pattern: /@elastic\/react-search-ui|search-ui|autocomplete-js|docsearch/i, evidence: "search UI package evidence was detected." }
  ];
  return searchServiceSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function searchServiceSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SearchServiceSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/search-service-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildObjectStorageReadinessReport(walk: WalkResult): Promise<ObjectStorageReadinessReport> {
  const sourceFiles = await objectStorageSourceFiles(walk);
  const storageSetups = objectStorageSetups(sourceFiles);
  const bucketSignals = objectStorageBucketSignals(sourceFiles);
  const clientSignals = objectStorageClientSignals(sourceFiles);
  const objectSignals = objectStorageObjectSignals(sourceFiles);
  const accessSignals = objectStorageAccessSignals(sourceFiles);
  const reliabilitySignals = objectStorageReliabilitySignals(sourceFiles);
  const securitySignals = objectStorageSecuritySignals(sourceFiles);
  const opsSignals = objectStorageOpsSignals(sourceFiles);
  const packageSignals = objectStoragePackageSignals(sourceFiles);
  const hasClient = storageSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasBucket = bucketSignals.some((item) => item.readiness === "ready") || storageSetups.some((item) => item.bucketCount > 0);
  const hasObjectFlow = objectSignals.some((item) => item.readiness === "ready") || storageSetups.some((item) => item.uploadCount + item.downloadCount + item.listCount + item.deleteCount > 0);
  const hasAccess = accessSignals.some((item) => item.readiness === "ready") || storageSetups.some((item) => item.presignCount + item.policyCount > 0);
  const hasReliability = reliabilitySignals.some((item) => item.readiness === "ready") || storageSetups.some((item) => item.lifecycleCount + item.replicationCount > 0);
  const hasSecurity = securitySignals.some((item) => item.readiness === "ready") || storageSetups.some((item) => item.encryptionCount > 0);
  const hasOps = opsSignals.some((item) => item.readiness === "ready") || storageSetups.some((item) => item.opsCount > 0);
  const riskQueue: ObjectStorageReadinessReport["riskQueue"] = [];
  if (!hasClient) riskQueue.push({ priority: "high", action: "Add a visible S3, MinIO, R2, GCS, Azure Blob, Supabase Storage, or S3-compatible client boundary.", why: "Object-storage readiness starts with a concrete bucket/object client, not only generic file paths.", relatedHref: "html/object-storage-readiness.html" });
  if (hasClient && !hasBucket) riskQueue.push({ priority: "high", action: "Record bucket, region, endpoint, path-style, public/private, or namespace setup.", why: "Object keys are only meaningful when learners can see which bucket namespace and endpoint own them.", relatedHref: "html/object-storage-readiness.html" });
  if (hasBucket && !hasObjectFlow) riskQueue.push({ priority: "medium", action: "Add put/upload/get/download/list/delete/copy object evidence.", why: "Storage integrations need a visible object lifecycle, not just bucket configuration.", relatedHref: "html/object-storage-readiness.html" });
  if (hasObjectFlow && !hasAccess) riskQueue.push({ priority: "medium", action: "Document signed URLs, presigned posts, public URLs, policies, ACL, CORS, RBAC, or RLS.", why: "Object storage failures often happen at the access boundary between app users, buckets, and object keys.", relatedHref: "html/object-storage-readiness.html" });
  if (hasObjectFlow && !hasReliability) riskQueue.push({ priority: "low", action: "Add versioning, lifecycle, retention, object lock, replication, checksum, ETag, or retry evidence.", why: "Production object storage needs durability and recovery behavior beyond basic put/get calls.", relatedHref: "html/object-storage-readiness.html" });
  if (hasObjectFlow && !hasSecurity) riskQueue.push({ priority: "low", action: "Record SSE, KMS, encryption, secret-key handling, least-privilege IAM, or scanning controls.", why: "Buckets frequently store sensitive user content and need explicit data-protection evidence.", relatedHref: "html/object-storage-readiness.html" });
  if (hasClient && !hasOps) riskQueue.push({ priority: "low", action: "Document health, metrics, backup, restore, migration, events, queues, or CDN/cache operations.", why: "Object storage becomes operational state once uploads are accepted from users or jobs.", relatedHref: "html/object-storage-readiness.html" });
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Object storage readiness report: setup ${storageSetups.length}개, bucket signal ${bucketSignals.length}개, object signal ${objectSignals.length}개, access signal ${accessSignals.length}개, ops signal ${opsSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Object storage readiness S3 MinIO R2 Supabase Storage buckets regions endpoints path-style credentials PutObject GetObject ListObjects DeleteObject CopyObject multipart upload download metadata tags presigned URL signed URL policy ACL CORS RLS RBAC versioning lifecycle retention object lock replication checksum ETag SSE KMS encryption event notifications queues CDN cache health metrics backup restore migration",
    storageSetups,
    bucketSignals,
    clientSignals,
    objectSignals,
    accessSignals,
    reliabilitySignals,
    securitySignals,
    opsSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"S3Client|@aws-sdk/client-s3|Minio\\.Client|R2Bucket|@google-cloud/storage|BlobServiceClient|supabase\\.storage|storage\\.from\" .", purpose: "Find object storage client boundaries and packages." },
      { command: "rg \"Bucket|bucket_name|region|endpoint|forcePathStyle|path-style|storage\\.from|containerName|namespace\" .", purpose: "Map bucket names, regions, endpoints, path-style mode, and namespace ownership." },
      { command: "rg \"PutObject|putObject|Upload|multipart|GetObject|getObject|download|ListObjects|DeleteObject|CopyObject|metadata|tags\" .", purpose: "Review object lifecycle evidence without contacting storage endpoints." },
      { command: "rg \"getSignedUrl|presigned|createSignedUrl|createPresignedPost|getPublicUrl|policy|ACL|CORS|RBAC|RLS\" .", purpose: "Trace access controls, signed URLs, browser upload boundaries, and policy models." },
      { command: "rg \"versioning|lifecycle|retention|object lock|replication|checksum|ETag|SSE|KMS|encryption|health|metrics|backup|restore|migration|notification|queue|CDN|cache\" .", purpose: "Check reliability, security, and operational evidence." }
    ],
    learnerNextSteps: [
      "먼저 S3, MinIO, R2, GCS, Azure Blob, Supabase Storage 중 어떤 client가 bucket boundary인지 확인하세요.",
      "bucket, region, endpoint, forcePathStyle/path-style, namespace, public/private 설정은 object key의 소유 범위를 설명합니다.",
      "PutObject/upload/multipart/GetObject/download/ListObjects/DeleteObject/CopyObject로 object lifecycle을 따라가세요.",
      "signed URL, presigned post, public URL, policy, ACL, CORS, RBAC, RLS는 사용자 접근 경계입니다.",
      "versioning, lifecycle, retention, object lock, replication, checksum, ETag, retry는 durability와 recovery 근거입니다.",
      "SSE, KMS, encryption, secret key, least privilege, scanning 신호로 민감 파일 보호를 확인하세요.",
      "이 리포트는 정적 readiness입니다. RepoTutor는 bucket을 만들거나, object를 upload/download/list/delete/copy하거나, signed URL을 발급하거나, storage endpoint와 통신하지 않습니다."
    ]
  };
}

type ObjectStorageSourceFile = { filePath: string; text: string; sourceHref: string };

async function objectStorageSourceFiles(walk: WalkResult): Promise<ObjectStorageSourceFile[]> {
  const files: ObjectStorageSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !objectStorageInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!objectStoragePathSignal(file.relPath) && !objectStorageContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function objectStorageInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return objectStoragePathSignal(filePath)
    || /(^|\/)(README|docs?|storage|storages|object-storage|objects?|buckets?|uploads?|assets?|files?|media|s3|minio|r2|gcs|blob|supabase|config|workflows?|scripts?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|docker-compose\.ya?ml|compose\.ya?ml|wrangler\.toml)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|py|go|java|kt|rs|json|md|mdx|ya?ml|toml|tf|hcl|txt)$/i.test(filePath);
}

function objectStoragePathSignal(filePath: string): boolean {
  return /(^|\/)(s3|minio|r2|gcs|google-cloud-storage|azure-blob|blob|supabase|storage|storages|object-storage|objects?|buckets?|uploads?|assets?|files?)(\/|\.|-|_|$)|wrangler\.toml$/i.test(filePath)
    || /\.github\/workflows\/.*(s3|minio|r2|gcs|blob|storage|bucket).*\.(ya?ml)$/i.test(filePath);
}

function objectStorageContentSignal(text: string): boolean {
  return /(S3Client|@aws-sdk\/client-s3|PutObjectCommand|GetObjectCommand|ListObjects|DeleteObjectCommand|CopyObjectCommand|@aws-sdk\/lib-storage|createPresignedPost|getSignedUrl|Minio\.Client|minio|R2Bucket|r2_buckets|@google-cloud\/storage|BlobServiceClient|@azure\/storage-blob|supabase\.storage|storage\.from|createSignedUrl|getPublicUrl|S3 compatible|S3-compatible|forcePathStyle|presigned|signed URL|bucket policy|ServerSideEncryption|SSE|KMS|ObjectLock|Lifecycle|Replication|checksum|ETag)/i.test(text);
}

function objectStorageSetups(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["storageSetups"] {
  const rows: ObjectStorageReadinessReport["storageSetups"] = [];
  for (const source of sourceFiles) {
    const bucketCount = countMatches(source.text, /\bBucket\b|bucket_name|bucketName|buckets?|r2_buckets|createBucket|makeBucket|storage\.from|containerName|ContainerClient|BUCKET/gi);
    const clientCount = countMatches(source.text, /S3Client|new\s+S3|Minio\.Client|minio\.Client|R2Bucket|Storage\(|new\s+Storage|BlobServiceClient|createClient|supabase\.storage|S3-compatible|S3 compatible/gi);
    const uploadCount = countMatches(source.text, /PutObjectCommand|putObject|\.upload\s*\(|new\s+Upload|multipartUpload|createMultipartUpload|uploadData|uploadStream|storage\.from\([^)]*\)\.upload|put\s*\(/gi);
    const downloadCount = countMatches(source.text, /GetObjectCommand|getObject|\.download\s*\(|downloadToBuffer|downloadToFile|createReadStream|getBlobClient|storage\.from\([^)]*\)\.download/gi);
    const listCount = countMatches(source.text, /ListObjects|listObjects|listBuckets|\.list\s*\(|listBlobs|storage\.from\([^)]*\)\.list/gi);
    const deleteCount = countMatches(source.text, /DeleteObjectCommand|deleteObject|removeObject|removeObjects|\.delete\s*\(|\.remove\s*\(|DeleteBlob|storage\.from\([^)]*\)\.remove/gi);
    const presignCount = countMatches(source.text, /getSignedUrl|presigned|pre-signed|signedUrl|signed URL|createSignedUrl|createPresignedPost|presignedGetObject|presignedPutObject/gi);
    const metadataCount = countMatches(source.text, /Metadata|metadata|Tagging|tags|ContentType|CacheControl|ContentDisposition|ETag|etag|customMetadata/gi);
    const policyCount = countMatches(source.text, /policy|Policy|ACL|CORS|cors|publicUrl|public URL|getPublicUrl|private|public|RBAC|RLS|row level security|bucket policy/gi);
    const lifecycleCount = countMatches(source.text, /versioning|lifecycle|Lifecycle|retention|ObjectLock|object lock|expiration|expire|ttl/gi);
    const replicationCount = countMatches(source.text, /replication|Replication|replica|multi-region|MultiRegion|cross-region/gi);
    const encryptionCount = countMatches(source.text, /ServerSideEncryption|SSE|SSEKMSKeyId|KMS|kms|encryption|encrypted|secretKey|accessKey|SecretAccessKey/gi);
    const opsCount = countMatches(source.text, /health|metrics|monitoring|backup|restore|migration|notification|event notification|queue|Queue|CDN|cache|Cache-Control|snapshot|audit/gi);
    const totalSignals = bucketCount + clientCount + uploadCount + downloadCount + listCount + deleteCount + presignCount + metadataCount + policyCount + lifecycleCount + replicationCount + encryptionCount + opsCount;
    if (totalSignals === 0 && !objectStoragePathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: objectStoragePlatform(source),
      bucketCount,
      clientCount,
      uploadCount,
      downloadCount,
      listCount,
      deleteCount,
      presignCount,
      metadataCount,
      policyCount,
      lifecycleCount,
      replicationCount,
      encryptionCount,
      opsCount,
      readiness: bucketCount > 0 && clientCount > 0 && uploadCount + downloadCount + listCount + deleteCount > 0 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} object storage signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.bucketCount + b.clientCount + b.uploadCount + b.downloadCount + b.presignCount + b.opsCount) - (a.bucketCount + a.clientCount + a.uploadCount + a.downloadCount + a.presignCount + a.opsCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function objectStoragePlatform(source: ObjectStorageSourceFile): ObjectStorageReadinessReport["storageSetups"][number]["platform"] {
  if (/supabase|storage\.from|supabase\.storage/i.test(source.filePath) || /supabase|storage\.from|supabase\.storage/i.test(source.text)) return "supabase-storage";
  if (/minio/i.test(source.filePath) || /Minio\.Client|minio/i.test(source.text)) return "minio";
  if (/r2|wrangler/i.test(source.filePath) || /R2Bucket|r2_buckets|\bR2\b/i.test(source.text)) return "r2";
  if (/gcs|google-cloud-storage|google cloud storage/i.test(source.filePath) || /@google-cloud\/storage|Google Cloud Storage|\bGCS\b/i.test(source.text)) return "gcs";
  if (/azure|blob/i.test(source.filePath) || /@azure\/storage-blob|BlobServiceClient|Azure Blob/i.test(source.text)) return "azure-blob";
  if (/\bs3\b/i.test(source.filePath) || /@aws-sdk\/client-s3|S3Client|PutObjectCommand|GetObjectCommand|S3-compatible|S3 compatible|\bAWS S3\b/i.test(source.text)) return "s3";
  if (/local|filesystem|fs\.|disk/i.test(source.filePath) || /local storage|filesystem|disk storage/i.test(source.text)) return "local";
  return "unknown";
}

function objectStorageBucketSignals(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["bucketSignals"] {
  const specs: Array<{ signal: ObjectStorageReadinessReport["bucketSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "bucket", pattern: /\bBucket\b|bucket_name|bucketName|buckets?|createBucket|makeBucket|r2_buckets/i, evidence: "bucket evidence was detected." },
    { signal: "region", pattern: /region\s*:|AWS_REGION|storageS3Region|locationConstraint/i, evidence: "region evidence was detected." },
    { signal: "endpoint", pattern: /endpoint\s*:|storageS3Endpoint|endPoint|accountid\.r2\.cloudflarestorage|blob\.core\.windows\.net|storage\.googleapis/i, evidence: "endpoint evidence was detected." },
    { signal: "path-style", pattern: /forcePathStyle|path-style|pathStyle|storageS3ForcePathStyle|s3ForcePathStyle/i, evidence: "path-style evidence was detected." },
    { signal: "public-private", pattern: /public|private|publicUrl|getPublicUrl|ACL|authenticated|anonymous/i, evidence: "public/private evidence was detected." },
    { signal: "namespace", pattern: /prefix|folder|keyPrefix|object key|Key\s*:|path\s*:|storage\.from|containerName|namespace/i, evidence: "namespace/key-prefix evidence was detected." }
  ];
  return objectStorageSignalFromSpecs(sourceFiles, specs, "bucket", "signal");
}

function objectStorageClientSignals(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["clientSignals"] {
  const specs: Array<{ signal: ObjectStorageReadinessReport["clientSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "s3-client", pattern: /S3Client|new\s+S3|@aws-sdk\/client-s3|boto3\.client\(["']s3/i, evidence: "S3 client evidence was detected." },
    { signal: "minio-client", pattern: /Minio\.Client|minio\.Client|from ["']minio["']|require\(["']minio["']\)/i, evidence: "MinIO client evidence was detected." },
    { signal: "r2-client", pattern: /R2Bucket|r2_buckets|\bR2\b|cloudflarestorage\.com/i, evidence: "Cloudflare R2 evidence was detected." },
    { signal: "gcs-client", pattern: /@google-cloud\/storage|new\s+Storage|google-cloud-storage|storage\.Client/i, evidence: "GCS client evidence was detected." },
    { signal: "azure-blob-client", pattern: /@azure\/storage-blob|BlobServiceClient|ContainerClient|BlockBlobClient/i, evidence: "Azure Blob client evidence was detected." },
    { signal: "supabase-storage-client", pattern: /supabase\.storage|storage\.from|@supabase\/supabase-js/i, evidence: "Supabase Storage client evidence was detected." },
    { signal: "credentials", pattern: /credentials|accessKey|secretKey|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|accountKey|serviceAccount|SUPABASE_SERVICE_ROLE_KEY/i, evidence: "credential boundary evidence was detected." },
    { signal: "timeout", pattern: /timeout|requestTimeout|clientTimeout|storageS3ClientTimeout|maxAttempts|retry/i, evidence: "timeout/retry config evidence was detected." }
  ];
  return objectStorageSignalFromSpecs(sourceFiles, specs, "client", "signal");
}

function objectStorageObjectSignals(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["objectSignals"] {
  const specs: Array<{ signal: ObjectStorageReadinessReport["objectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "put-object", pattern: /PutObjectCommand|putObject|put\s*\([^)]*Bucket|uploadData/i, evidence: "put object evidence was detected." },
    { signal: "upload", pattern: /\.upload\s*\(|storage\.from\([^)]*\)\.upload|uploadFile|uploadStream/i, evidence: "upload evidence was detected." },
    { signal: "multipart", pattern: /new\s+Upload|@aws-sdk\/lib-storage|multipart|createMultipartUpload|uploadPart|completeMultipartUpload/i, evidence: "multipart evidence was detected." },
    { signal: "get-object", pattern: /GetObjectCommand|getObject|getObjectCommand/i, evidence: "get object evidence was detected." },
    { signal: "download", pattern: /\.download\s*\(|downloadToBuffer|downloadToFile|createReadStream|storage\.from\([^)]*\)\.download/i, evidence: "download evidence was detected." },
    { signal: "list-objects", pattern: /ListObjects|listObjects|listBuckets|\.list\s*\(|listBlobs|storage\.from\([^)]*\)\.list/i, evidence: "list object evidence was detected." },
    { signal: "delete-object", pattern: /DeleteObjectCommand|deleteObject|removeObject|removeObjects|\.remove\s*\(|DeleteBlob/i, evidence: "delete object evidence was detected." },
    { signal: "copy-object", pattern: /CopyObjectCommand|copyObject|startCopyFromURL|copyFrom|rewriteObject/i, evidence: "copy object evidence was detected." },
    { signal: "metadata", pattern: /Metadata|metadata|Tagging|tags|ContentType|CacheControl|ContentDisposition|ETag|customMetadata/i, evidence: "metadata/tag evidence was detected." }
  ];
  return objectStorageSignalFromSpecs(sourceFiles, specs, "object", "signal");
}

function objectStorageAccessSignals(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["accessSignals"] {
  const specs: Array<{ signal: ObjectStorageReadinessReport["accessSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "signed-url", pattern: /getSignedUrl|createSignedUrl|signedUrl|signed URL|presignedGetObject|presignedPutObject/i, evidence: "signed URL evidence was detected." },
    { signal: "presigned-post", pattern: /createPresignedPost|presigned post|POST policy|policyFields/i, evidence: "presigned POST evidence was detected." },
    { signal: "public-url", pattern: /getPublicUrl|publicUrl|public URL|public-read/i, evidence: "public URL evidence was detected." },
    { signal: "policy", pattern: /bucket policy|setBucketPolicy|PutBucketPolicy|policy\s*:|Statement|Effect|Principal|Action/i, evidence: "policy evidence was detected." },
    { signal: "acl", pattern: /ACL|public-read|private|PutObjectAcl|GrantRead|GrantFullControl/i, evidence: "ACL evidence was detected." },
    { signal: "cors", pattern: /CORS|cors|AllowedOrigins|AllowedMethods|PutBucketCors/i, evidence: "CORS evidence was detected." },
    { signal: "rbac", pattern: /RBAC|role-based|IAM|least privilege|least-privilege|iam:|s3:PutObject|s3:GetObject/i, evidence: "RBAC/IAM evidence was detected." },
    { signal: "rls", pattern: /RLS|row level security|create policy|storage\.objects|auth\.uid/i, evidence: "RLS evidence was detected." }
  ];
  return objectStorageSignalFromSpecs(sourceFiles, specs, "access", "signal");
}

function objectStorageReliabilitySignals(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["reliabilitySignals"] {
  const specs: Array<{ signal: ObjectStorageReadinessReport["reliabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "versioning", pattern: /versioning|VersioningConfiguration|PutBucketVersioning|versionId/i, evidence: "versioning evidence was detected." },
    { signal: "lifecycle", pattern: /lifecycle|LifecycleConfiguration|PutBucketLifecycle|expiration|transition/i, evidence: "lifecycle evidence was detected." },
    { signal: "retention", pattern: /retention|RetainUntilDate|retentionMode|governance|compliance/i, evidence: "retention evidence was detected." },
    { signal: "object-lock", pattern: /ObjectLock|object lock|LegalHold|PutObjectLockConfiguration/i, evidence: "object lock evidence was detected." },
    { signal: "replication", pattern: /replication|ReplicationConfiguration|replica|cross-region|multi-region/i, evidence: "replication evidence was detected." },
    { signal: "checksum", pattern: /checksum|ChecksumSHA256|ContentMD5|crc32|sha256/i, evidence: "checksum evidence was detected." },
    { signal: "etag", pattern: /ETag|etag|IfMatch|IfNoneMatch/i, evidence: "ETag evidence was detected." },
    { signal: "retry", pattern: /retry|maxAttempts|backoff|RetryStrategy|retryDelayOptions/i, evidence: "retry evidence was detected." }
  ];
  return objectStorageSignalFromSpecs(sourceFiles, specs, "reliability", "signal");
}

function objectStorageSecuritySignals(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["securitySignals"] {
  const specs: Array<{ signal: ObjectStorageReadinessReport["securitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sse", pattern: /ServerSideEncryption|SSE|aws:kms|AES256|SSECustomer/i, evidence: "SSE evidence was detected." },
    { signal: "kms", pattern: /KMS|kms|SSEKMSKeyId|kmsKeyId|customer managed key/i, evidence: "KMS evidence was detected." },
    { signal: "encryption", pattern: /encrypt|encryption|encrypted|crypto|storageS3Encrypt/i, evidence: "encryption evidence was detected." },
    { signal: "secret-key", pattern: /secretKey|SecretAccessKey|AWS_SECRET_ACCESS_KEY|SUPABASE_SERVICE_ROLE_KEY|accountKey|accessKeySecret/i, evidence: "secret key boundary evidence was detected." },
    { signal: "least-privilege", pattern: /least privilege|least-privilege|s3:GetObject|s3:PutObject|s3:ListBucket|deny|allow/i, evidence: "least-privilege/IAM evidence was detected." },
    { signal: "scan", pattern: /virus|malware|clamav|av scan|content scan|scan upload|quarantine/i, evidence: "upload scanning evidence was detected." }
  ];
  return objectStorageSignalFromSpecs(sourceFiles, specs, "security", "signal");
}

function objectStorageOpsSignals(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["opsSignals"] {
  const specs: Array<{ signal: ObjectStorageReadinessReport["opsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "health", pattern: /health|ready|liveness|bucketExists|statObject|headBucket|HeadBucket/i, evidence: "health evidence was detected." },
    { signal: "metrics", pattern: /metrics|prometheus|observability|monitoring|storage usage|bucket size/i, evidence: "metrics evidence was detected." },
    { signal: "backup", pattern: /backup|snapshot|replicate to|archive/i, evidence: "backup evidence was detected." },
    { signal: "restore", pattern: /restore|recovery|restoreObject|restore request/i, evidence: "restore evidence was detected." },
    { signal: "migration", pattern: /migration|migrate|copy between buckets|sync buckets|mirror/i, evidence: "migration evidence was detected." },
    { signal: "event-notification", pattern: /notification|event notification|ObjectCreated|ObjectRemoved|PutBucketNotification|setBucketNotification/i, evidence: "event notification evidence was detected." },
    { signal: "queue", pattern: /queue|Queue|SQS|PubSub|EventBridge|workers queue/i, evidence: "queue integration evidence was detected." },
    { signal: "cdn-cache", pattern: /CDN|cache|Cache-Control|CloudFront|Cloudflare cache|asset cache/i, evidence: "CDN/cache evidence was detected." }
  ];
  return objectStorageSignalFromSpecs(sourceFiles, specs, "ops", "signal");
}

function objectStoragePackageSignals(sourceFiles: ObjectStorageSourceFile[]): ObjectStorageReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ObjectStorageReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aws-sdk-s3", pattern: /"@aws-sdk\/client-s3"|@aws-sdk\/client-s3|boto3|aws-sdk\/clients\/s3/i, evidence: "AWS S3 package evidence was detected." },
    { signal: "lib-storage", pattern: /"@aws-sdk\/lib-storage"|@aws-sdk\/lib-storage|new\s+Upload/i, evidence: "AWS lib-storage evidence was detected." },
    { signal: "minio", pattern: /"minio"|Minio\.Client|minio\.Client|github\.com\/minio\/minio-go/i, evidence: "MinIO package evidence was detected." },
    { signal: "supabase-storage", pattern: /"@supabase\/supabase-js"|supabase\.storage|storage\.from|@supabase\/storage-js/i, evidence: "Supabase Storage evidence was detected." },
    { signal: "gcs", pattern: /"@google-cloud\/storage"|@google-cloud\/storage|google-cloud-storage/i, evidence: "GCS package evidence was detected." },
    { signal: "azure-blob", pattern: /"@azure\/storage-blob"|@azure\/storage-blob|azure-storage-blob/i, evidence: "Azure Blob package evidence was detected." },
    { signal: "r2", pattern: /R2Bucket|r2_buckets|cloudflarestorage\.com|wrangler/i, evidence: "Cloudflare R2 evidence was detected." },
    { signal: "s3-compatible", pattern: /S3-compatible|S3 compatible|forcePathStyle|path-style|storageS3Endpoint/i, evidence: "S3-compatible storage evidence was detected." }
  ];
  return objectStorageSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function objectStorageSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ObjectStorageSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/object-storage-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildRealtimeCollaborationReadinessReport(walk: WalkResult): Promise<RealtimeCollaborationReadinessReport> {
  const sourceFiles = await realtimeCollaborationSourceFiles(walk);
  const collaborationSetups = realtimeCollaborationSetups(sourceFiles);
  const crdtSignals = realtimeCollaborationCrdtSignals(sourceFiles);
  const providerSignals = realtimeCollaborationProviderSignals(sourceFiles);
  const presenceSignals = realtimeCollaborationPresenceSignals(sourceFiles);
  const syncSignals = realtimeCollaborationSyncSignals(sourceFiles);
  const persistenceSignals = realtimeCollaborationPersistenceSignals(sourceFiles);
  const historySignals = realtimeCollaborationHistorySignals(sourceFiles);
  const accessSignals = realtimeCollaborationAccessSignals(sourceFiles);
  const packageSignals = realtimeCollaborationPackageSignals(sourceFiles);
  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasDoc = crdtSignals.some((item) => item.readiness === "ready") || collaborationSetups.some((item) => item.docCount > 0 || item.sharedTypeCount > 0);
  const hasProvider = providerSignals.some((item) => item.readiness === "ready") || collaborationSetups.some((item) => item.providerCount > 0);
  const hasPresence = presenceSignals.some((item) => item.readiness === "ready") || collaborationSetups.some((item) => item.presenceCount > 0);
  const hasSync = syncSignals.some((item) => item.readiness === "ready") || collaborationSetups.some((item) => item.syncCount > 0);
  const hasPersistence = persistenceSignals.some((item) => item.readiness === "ready") || collaborationSetups.some((item) => item.persistenceCount > 0);
  const hasHistory = historySignals.some((item) => item.readiness === "ready") || collaborationSetups.some((item) => item.historyCount > 0);
  const hasAccess = accessSignals.some((item) => item.readiness === "ready") || collaborationSetups.some((item) => item.authCount > 0);
  const riskQueue: RealtimeCollaborationReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasDoc) riskQueue.push({ priority: "medium", action: "Add or document the realtime collaboration strategy before claiming multiplayer readiness.", why: "Realtime collaboration readiness starts with a visible Yjs, Automerge, Liveblocks, provider, room, or shared-document boundary.", relatedHref: "html/realtime-collaboration-readiness.html" });
  if ((hasPackage || hasProvider) && !hasDoc) riskQueue.push({ priority: "high", action: "Pair collaboration packages/providers with a concrete shared document, CRDT type, room, or storage model.", why: "A provider package alone does not tell learners which data structure is merged or synchronized.", relatedHref: "html/realtime-collaboration-readiness.html" });
  if (hasDoc && !hasProvider) riskQueue.push({ priority: "high", action: "Record the provider boundary that synchronizes peers.", why: "CRDT documents need a visible WebSocket, IndexedDB, Liveblocks, broadcast, custom, or offline provider boundary.", relatedHref: "html/realtime-collaboration-readiness.html" });
  if (hasProvider && !hasPresence) riskQueue.push({ priority: "medium", action: "Document awareness, presence, cursors, avatars, self/others, or broadcast events.", why: "Collaborative interfaces usually need ephemeral user state separate from persisted document state.", relatedHref: "html/realtime-collaboration-readiness.html" });
  if (hasProvider && !hasSync) riskQueue.push({ priority: "medium", action: "Expose update/sync/save-load semantics for peer reconciliation.", why: "Learners need to see whether the app uses Yjs updates, Automerge sync messages, Liveblocks room state, or another sync contract.", relatedHref: "html/realtime-collaboration-readiness.html" });
  if (hasDoc && !hasPersistence) riskQueue.push({ priority: "low", action: "Add persistence, offline, snapshot, save/load, or storage-root evidence.", why: "Local-first and multiplayer systems need a recovery story when tabs, devices, or networks restart.", relatedHref: "html/realtime-collaboration-readiness.html" });
  if (hasDoc && !hasHistory) riskQueue.push({ priority: "low", action: "Record undo/redo, history, heads, versions, or patch-listener behavior.", why: "Collaborative editing needs explicit history semantics so conflicts and user mistakes are recoverable.", relatedHref: "html/realtime-collaboration-readiness.html" });
  if (hasProvider && !hasAccess) riskQueue.push({ priority: "low", action: "Document auth endpoints, room IDs, permissions, tokens, and initial presence/storage boundaries.", why: "Room access and identity controls decide who can join, read, write, and broadcast collaboration state.", relatedHref: "html/realtime-collaboration-readiness.html" });
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Realtime collaboration readiness report: setup ${collaborationSetups.length}개, CRDT signal ${crdtSignals.length}개, provider signal ${providerSignals.length}개, presence signal ${presenceSignals.length}개, sync signal ${syncSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Realtime collaboration readiness Yjs Y.Doc shared types WebsocketProvider awareness UndoManager encodeStateAsUpdate applyUpdate Automerge change merge sync save load conflicts heads patches Liveblocks LiveblocksProvider RoomProvider useOthers useMyPresence useMutation storage presence comments threads authEndpoint room permissions",
    collaborationSetups,
    crdtSignals,
    providerSignals,
    presenceSignals,
    syncSignals,
    persistenceSignals,
    historySignals,
    accessSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"Y\\.Doc|getText|getMap|getArray|Automerge\\.init|Automerge\\.change|RoomProvider|LiveblocksProvider\" src app packages", purpose: "Find shared document, CRDT type, and room/provider boundaries." },
      { command: "rg \"WebsocketProvider|IndexeddbPersistence|getYjsProviderForRoom|createClient|broadcast-channel|provider\" src app packages", purpose: "Map realtime providers, offline providers, and sync transport ownership." },
      { command: "rg \"awareness|presence|cursor|avatar|useOthers|useMyPresence|setLocalStateField|broadcast\" src app packages", purpose: "Separate ephemeral presence from persisted shared document state." },
      { command: "rg \"encodeStateAsUpdate|applyUpdate|mergeUpdates|initSyncState|generateSyncMessage|saveIncremental|getHeads|getConflicts|patches\" src app packages", purpose: "Review sync, conflict, persistence, and patch semantics without joining rooms." },
      { command: "rg \"authEndpoint|publicApiKey|roomId|permission|initialPresence|initialStorage|token|authorize\" src app packages", purpose: "Check room identity, auth, permission, initial presence, and storage boundaries." }
    ],
    learnerNextSteps: [
      "먼저 Y.Doc, Automerge document, Liveblocks RoomProvider 중 실제 shared document boundary를 찾으세요.",
      "shared text/map/array/storage와 provider를 분리해서 어떤 상태가 병합되고 어떤 상태가 전송되는지 확인하세요.",
      "awareness, presence, cursor, avatar, useOthers/useMyPresence는 저장 문서가 아니라 ephemeral user state로 읽으세요.",
      "encode/apply update, sync message, save/load, heads, patches, conflicts 신호로 merge와 recovery 모델을 따라가세요.",
      "authEndpoint, room id, permission, token, initialPresence, initialStorage 신호로 누가 room에 접근하고 쓸 수 있는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. RepoTutor는 provider에 연결하거나, room에 join하거나, CRDT 문서를 mutate/sync하거나, 원격 협업 서비스를 호출하지 않습니다."
    ]
  };
}

type RealtimeCollaborationSourceFile = { filePath: string; text: string; sourceHref: string };

async function realtimeCollaborationSourceFiles(walk: WalkResult): Promise<RealtimeCollaborationSourceFile[]> {
  const files: RealtimeCollaborationSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !realtimeCollaborationInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!realtimeCollaborationPathSignal(file.relPath) && !realtimeCollaborationContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function realtimeCollaborationInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return realtimeCollaborationPathSignal(filePath)
    || /(^|\/)(README|docs?|collab|collaboration|realtime|real-time|multiplayer|rooms?|presence|awareness|cursors?|comments?|threads?|sync|crdt|yjs|automerge|liveblocks|editor|whiteboard)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|requirements\.txt)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function realtimeCollaborationPathSignal(filePath: string): boolean {
  return /(^|\/)(collab|collaboration|realtime|real-time|multiplayer|rooms?|presence|awareness|cursors?|comments?|threads?|sync|crdt|yjs|automerge|liveblocks|editor|whiteboard)(\/|\.|-|_|$)/i.test(filePath);
}

function realtimeCollaborationContentSignal(text: string): boolean {
  return /(Y\.Doc|new\s+Y\.|getText|getMap|getArray|WebsocketProvider|IndexeddbPersistence|awareness|UndoManager|encodeStateAsUpdate|applyUpdate|Automerge\.|@automerge\/automerge|initSyncState|generateSyncMessage|getConflicts|LiveblocksProvider|RoomProvider|useOthers|useMyPresence|useMutation|getYjsProviderForRoom|@liveblocks\/(client|react|yjs)|presence|initialStorage|authEndpoint)/i.test(text);
}

function realtimeCollaborationSetups(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["collaborationSetups"] {
  const rows: RealtimeCollaborationReadinessReport["collaborationSetups"] = [];
  for (const source of sourceFiles) {
    const docCount = countMatches(source.text, /Y\.Doc|new\s+Y\.Doc|Automerge\.(init|from|load)|RoomProvider|enterRoom|roomId|room-?id/gi);
    const sharedTypeCount = countMatches(source.text, /getText|getMap|getArray|getXml|Y\.(Text|Map|Array|XmlFragment)|LiveList|LiveMap|LiveObject|Automerge\.Text|storage\.get|initialStorage/gi);
    const providerCount = countMatches(source.text, /WebsocketProvider|IndexeddbPersistence|LiveblocksProvider|RoomProvider|getYjsProviderForRoom|createClient|broadcast-channel|BroadcastChannel|provider/gi);
    const presenceCount = countMatches(source.text, /awareness|presence|cursor|avatar|useOthers|useSelf|useMyPresence|setLocalStateField|broadcast|userInfo/gi);
    const syncCount = countMatches(source.text, /encodeStateAsUpdate|applyUpdate|mergeUpdates|initSyncState|generateSyncMessage|receiveSyncMessage|getLastLocalChange|applyChanges|sync|synchronize/gi);
    const persistenceCount = countMatches(source.text, /IndexeddbPersistence|localStorage|saveIncremental|loadIncremental|Automerge\.(save|load)|DocHandle|Repo|storageRoot|snapshot|persist/gi);
    const conflictCount = countMatches(source.text, /Automerge\.merge|getConflicts|conflict|getHeads|getMissingDeps|heads|mergeUpdates/gi);
    const historyCount = countMatches(source.text, /UndoManager|undo\s*\(|redo\s*\(|history|version|getHeads|patches|patch-listener|listen/gi);
    const authCount = countMatches(source.text, /authEndpoint|publicApiKey|secret|token|permission|authorize|roomId|id=|initialPresence|initialStorage|userId/gi);
    const commentsCount = countMatches(source.text, /comments?|threads?|useThreads|Comment|Notifications?|broadcastEvent|useBroadcastEvent/gi);
    const totalSignals = docCount + sharedTypeCount + providerCount + presenceCount + syncCount + persistenceCount + conflictCount + historyCount + authCount + commentsCount;
    if (totalSignals === 0 && !realtimeCollaborationPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: realtimeCollaborationPlatform(source),
      docCount,
      sharedTypeCount,
      providerCount,
      presenceCount,
      syncCount,
      persistenceCount,
      conflictCount,
      historyCount,
      authCount,
      commentsCount,
      readiness: docCount + sharedTypeCount > 0 && providerCount > 0 && (presenceCount > 0 || syncCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} realtime collaboration signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.docCount + b.sharedTypeCount + b.providerCount + b.presenceCount + b.syncCount) - (a.docCount + a.sharedTypeCount + a.providerCount + a.presenceCount + a.syncCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function realtimeCollaborationPlatform(source: RealtimeCollaborationSourceFile): RealtimeCollaborationReadinessReport["collaborationSetups"][number]["platform"] {
  if (/liveblocks/i.test(source.filePath) || /LiveblocksProvider|RoomProvider|@liveblocks\/(client|react|yjs)|useOthers|useMyPresence/i.test(source.text)) return "liveblocks";
  if (/automerge/i.test(source.filePath) || /Automerge\.|@automerge\/automerge/i.test(source.text)) return "automerge";
  if (/yjs|\/y-/i.test(source.filePath) || /Y\.Doc|new\s+Y\.|WebsocketProvider|IndexeddbPersistence|@liveblocks\/yjs|y-websocket|y-indexeddb/i.test(source.text)) return "yjs";
  if (/WebsocketProvider|BroadcastChannel|provider/i.test(source.text)) return "socket-provider";
  if (/collab|collaboration|realtime|multiplayer|presence|sync/i.test(source.text)) return "custom";
  return "unknown";
}

function realtimeCollaborationCrdtSignals(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["crdtSignals"] {
  const specs: Array<{ signal: RealtimeCollaborationReadinessReport["crdtSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "y-doc", pattern: /Y\.Doc|new\s+Y\.Doc/i, evidence: "Y.Doc evidence was detected." },
    { signal: "shared-map", pattern: /getMap|Y\.Map|LiveMap/i, evidence: "shared map evidence was detected." },
    { signal: "shared-array", pattern: /getArray|Y\.Array|LiveList/i, evidence: "shared array/list evidence was detected." },
    { signal: "shared-text", pattern: /getText|Y\.Text|Automerge\.Text|withYjs|sharedType/i, evidence: "shared text evidence was detected." },
    { signal: "automerge-doc", pattern: /Automerge\.(init|from|load)|@automerge\/automerge/i, evidence: "Automerge document evidence was detected." },
    { signal: "change", pattern: /Automerge\.change|change\s*\([^)]*doc|useMutation/i, evidence: "change/mutation evidence was detected." },
    { signal: "merge", pattern: /Automerge\.merge|mergeUpdates|merge\s*\(/i, evidence: "merge evidence was detected." },
    { signal: "conflict", pattern: /getConflicts|conflict/i, evidence: "conflict inspection evidence was detected." },
    { signal: "transaction", pattern: /transact|transaction|doc\.transact|Y\.transact/i, evidence: "transaction evidence was detected." }
  ];
  return realtimeCollaborationSignalFromSpecs(sourceFiles, specs, "crdt", "signal");
}

function realtimeCollaborationProviderSignals(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["providerSignals"] {
  const specs: Array<{ signal: RealtimeCollaborationReadinessReport["providerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "websocket-provider", pattern: /WebsocketProvider|y-websocket|websocket provider/i, evidence: "WebSocket provider evidence was detected." },
    { signal: "indexeddb-provider", pattern: /IndexeddbPersistence|y-indexeddb|indexeddb provider/i, evidence: "IndexedDB provider evidence was detected." },
    { signal: "liveblocks-provider", pattern: /LiveblocksProvider|createClient|@liveblocks\/client/i, evidence: "Liveblocks provider evidence was detected." },
    { signal: "room-provider", pattern: /RoomProvider|enterRoom|roomId|room-?id/i, evidence: "room provider evidence was detected." },
    { signal: "yjs-provider", pattern: /getYjsProviderForRoom|LiveblocksYjsProvider|yjs provider|provider\.doc/i, evidence: "Yjs provider evidence was detected." },
    { signal: "broadcast-channel", pattern: /BroadcastChannel|broadcast-channel|useBroadcastEvent|broadcast\s*\(/i, evidence: "broadcast channel/event evidence was detected." },
    { signal: "network-agnostic", pattern: /network agnostic|offline editing|offline-first|local-first|p2p|peer-to-peer/i, evidence: "network-agnostic or offline collaboration evidence was detected." },
    { signal: "custom-provider", pattern: /provider|syncProvider|collaborationProvider|roomProvider|transport/i, evidence: "custom provider evidence was detected." }
  ];
  return realtimeCollaborationSignalFromSpecs(sourceFiles, specs, "provider", "signal");
}

function realtimeCollaborationPresenceSignals(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["presenceSignals"] {
  const specs: Array<{ signal: RealtimeCollaborationReadinessReport["presenceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "awareness", pattern: /awareness|setLocalStateField|getLocalState/i, evidence: "Yjs awareness evidence was detected." },
    { signal: "presence", pattern: /presence|initialPresence|useMyPresence|updateMyPresence/i, evidence: "presence evidence was detected." },
    { signal: "cursor", pattern: /cursor|caret|selection|withCursors/i, evidence: "cursor/caret evidence was detected." },
    { signal: "avatars", pattern: /avatar|avatars|useSelf|userInfo/i, evidence: "avatar/user info evidence was detected." },
    { signal: "others", pattern: /useOthers|getOthers|others\.|connectionId/i, evidence: "others/remote user evidence was detected." },
    { signal: "self", pattern: /useSelf|getSelf|self\.|myPresence/i, evidence: "self presence evidence was detected." },
    { signal: "broadcast-event", pattern: /useBroadcastEvent|broadcastEvent|broadcast\s*\(/i, evidence: "broadcast event evidence was detected." },
    { signal: "user-info", pattern: /userInfo|userId|name|color|displayName/i, evidence: "user info evidence was detected." }
  ];
  return realtimeCollaborationSignalFromSpecs(sourceFiles, specs, "presence", "signal");
}

function realtimeCollaborationSyncSignals(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["syncSignals"] {
  const specs: Array<{ signal: RealtimeCollaborationReadinessReport["syncSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "encode-state", pattern: /encodeStateAsUpdate|encodeStateVector|encodeState/i, evidence: "Yjs encode state evidence was detected." },
    { signal: "apply-update", pattern: /applyUpdate|applyUpdateV2|mergeUpdates/i, evidence: "Yjs apply/merge update evidence was detected." },
    { signal: "sync-state", pattern: /initSyncState|syncState|sync state/i, evidence: "sync state evidence was detected." },
    { signal: "sync-message", pattern: /generateSyncMessage|receiveSyncMessage|sync message/i, evidence: "sync message evidence was detected." },
    { signal: "save-load", pattern: /Automerge\.(save|load)|save\s*\(|load\s*\(/i, evidence: "save/load evidence was detected." },
    { signal: "incremental-save", pattern: /saveIncremental|loadIncremental|incremental/i, evidence: "incremental save/load evidence was detected." },
    { signal: "heads", pattern: /getHeads|getMissingDeps|getChanges|heads/i, evidence: "heads/change-set evidence was detected." },
    { signal: "patches", pattern: /patches|applyPatch|Patch|listen|onChange/i, evidence: "patch listener evidence was detected." }
  ];
  return realtimeCollaborationSignalFromSpecs(sourceFiles, specs, "sync", "signal");
}

function realtimeCollaborationPersistenceSignals(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["persistenceSignals"] {
  const specs: Array<{ signal: RealtimeCollaborationReadinessReport["persistenceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "indexeddb", pattern: /IndexeddbPersistence|indexedDB|y-indexeddb/i, evidence: "IndexedDB persistence evidence was detected." },
    { signal: "local-storage", pattern: /localStorage|sessionStorage|AsyncStorage/i, evidence: "local storage evidence was detected." },
    { signal: "doc-handle", pattern: /DocHandle|docHandle|handle\.doc/i, evidence: "doc handle evidence was detected." },
    { signal: "repo", pattern: /new\s+Repo|AutomergeRepo|storageRoot|repo\.find|repo\.create/i, evidence: "Automerge Repo evidence was detected." },
    { signal: "save", pattern: /Automerge\.save|saveIncremental|\.save\s*\(/i, evidence: "save evidence was detected." },
    { signal: "load", pattern: /Automerge\.load|loadIncremental|\.load\s*\(/i, evidence: "load evidence was detected." },
    { signal: "storage-root", pattern: /storageRoot|storage root|persistenceDir|dataDir/i, evidence: "storage root evidence was detected." },
    { signal: "snapshot", pattern: /snapshot|version snapshot|saveSnapshot|restoreSnapshot/i, evidence: "snapshot evidence was detected." }
  ];
  return realtimeCollaborationSignalFromSpecs(sourceFiles, specs, "persistence", "signal");
}

function realtimeCollaborationHistorySignals(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["historySignals"] {
  const specs: Array<{ signal: RealtimeCollaborationReadinessReport["historySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "undo-manager", pattern: /UndoManager|new\s+Y\.UndoManager/i, evidence: "Y.UndoManager evidence was detected." },
    { signal: "undo", pattern: /\.undo\s*\(|history\.undo|undoStack/i, evidence: "undo evidence was detected." },
    { signal: "redo", pattern: /\.redo\s*\(|history\.redo|redoStack/i, evidence: "redo evidence was detected." },
    { signal: "history", pattern: /history|useHistory|getHistory/i, evidence: "history evidence was detected." },
    { signal: "version", pattern: /version|versionId|heads|snapshot/i, evidence: "version/head evidence was detected." },
    { signal: "heads", pattern: /getHeads|heads/i, evidence: "heads evidence was detected." },
    { signal: "patch-listener", pattern: /patches|patch listener|listen|onChange|observeDeep|observe\s*\(/i, evidence: "patch/observer evidence was detected." }
  ];
  return realtimeCollaborationSignalFromSpecs(sourceFiles, specs, "history", "signal");
}

function realtimeCollaborationAccessSignals(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["accessSignals"] {
  const specs: Array<{ signal: RealtimeCollaborationReadinessReport["accessSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "auth-endpoint", pattern: /authEndpoint|\/api\/liveblocks-auth|authorize|prepareSession/i, evidence: "auth endpoint evidence was detected." },
    { signal: "public-api-key", pattern: /publicApiKey|pk_[A-Za-z0-9_]+|LIVEBLOCKS_PUBLIC_KEY/i, evidence: "public API key boundary evidence was detected." },
    { signal: "room-id", pattern: /RoomProvider\s+id=|roomId|room-?id|enterRoom\s*\(/i, evidence: "room ID evidence was detected." },
    { signal: "permission", pattern: /permission|allow|deny|canWrite|canComment|readOnly|full-access/i, evidence: "permission evidence was detected." },
    { signal: "initial-presence", pattern: /initialPresence|presence\s*:/i, evidence: "initial presence evidence was detected." },
    { signal: "initial-storage", pattern: /initialStorage|storage\s*:/i, evidence: "initial storage evidence was detected." },
    { signal: "user-id", pattern: /userId|user\.id|connectionId|identity/i, evidence: "user ID evidence was detected." },
    { signal: "token", pattern: /token|secret|accessToken|jwt|Bearer/i, evidence: "token evidence was detected." }
  ];
  return realtimeCollaborationSignalFromSpecs(sourceFiles, specs, "access", "signal");
}

function realtimeCollaborationPackageSignals(sourceFiles: RealtimeCollaborationSourceFile[]): RealtimeCollaborationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: RealtimeCollaborationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "yjs", pattern: /"yjs"|from ["']yjs["']|Y\.Doc|new\s+Y\./i, evidence: "Yjs package/import evidence was detected." },
    { signal: "y-websocket", pattern: /"y-websocket"|WebsocketProvider|from ["']y-websocket["']/i, evidence: "y-websocket evidence was detected." },
    { signal: "y-indexeddb", pattern: /"y-indexeddb"|IndexeddbPersistence|from ["']y-indexeddb["']/i, evidence: "y-indexeddb evidence was detected." },
    { signal: "@automerge/automerge", pattern: /"@automerge\/automerge"|@automerge\/automerge|Automerge\./i, evidence: "Automerge package/import evidence was detected." },
    { signal: "@automerge/automerge-repo", pattern: /"@automerge\/automerge-repo"|@automerge\/automerge-repo|new\s+Repo|DocHandle/i, evidence: "Automerge Repo evidence was detected." },
    { signal: "@liveblocks/client", pattern: /"@liveblocks\/client"|@liveblocks\/client|createClient/i, evidence: "Liveblocks client evidence was detected." },
    { signal: "@liveblocks/react", pattern: /"@liveblocks\/react"|@liveblocks\/react|LiveblocksProvider|RoomProvider|useOthers|useMyPresence/i, evidence: "Liveblocks React evidence was detected." },
    { signal: "@liveblocks/yjs", pattern: /"@liveblocks\/yjs"|@liveblocks\/yjs|getYjsProviderForRoom|LiveblocksYjsProvider/i, evidence: "Liveblocks Yjs evidence was detected." }
  ];
  return realtimeCollaborationSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function realtimeCollaborationSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: RealtimeCollaborationSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/realtime-collaboration-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildWorkflowOrchestrationReadinessReport(walk: WalkResult): Promise<WorkflowOrchestrationReadinessReport> {
  const sourceFiles = await workflowOrchestrationSourceFiles(walk);
  const workflowSetups = workflowOrchestrationSetups(sourceFiles);
  const triggerSignals = workflowOrchestrationTriggerSignals(sourceFiles);
  const executionSignals = workflowOrchestrationExecutionSignals(sourceFiles);
  const durabilitySignals = workflowOrchestrationDurabilitySignals(sourceFiles);
  const flowSignals = workflowOrchestrationFlowSignals(sourceFiles);
  const runtimeSignals = workflowOrchestrationRuntimeSignals(sourceFiles);
  const observabilitySignals = workflowOrchestrationObservabilitySignals(sourceFiles);
  const packageSignals = workflowOrchestrationPackageSignals(sourceFiles);
  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasWorkflow = executionSignals.some((item) => item.readiness === "ready") || workflowSetups.some((item) => item.workflowCount + item.stepCount + item.activityCount > 0);
  const hasTrigger = triggerSignals.some((item) => item.readiness === "ready") || workflowSetups.some((item) => item.eventCount + item.scheduleCount > 0);
  const hasDurability = durabilitySignals.some((item) => item.readiness === "ready") || workflowSetups.some((item) => item.retryCount + item.timeoutCount + item.stateCount > 0);
  const hasFlow = flowSignals.some((item) => item.readiness === "ready") || workflowSetups.some((item) => item.waitCount + item.cancelCount + item.concurrencyCount + item.queueCount > 0);
  const hasRuntime = runtimeSignals.some((item) => item.readiness === "ready") || workflowSetups.some((item) => item.queueCount > 0);
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready") || workflowSetups.some((item) => item.observabilityCount > 0);
  const riskQueue: WorkflowOrchestrationReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasWorkflow) riskQueue.push({ priority: "medium", action: "Add or document the workflow orchestration strategy before claiming durable background-job readiness.", why: "Durable workflow readiness starts with a visible Temporal, Inngest, Trigger.dev, Cloudflare Workflow, LangGraph StateGraph, task, step, activity, or worker boundary.", relatedHref: "html/workflow-orchestration-readiness.html" });
  if ((hasPackage || hasWorkflow) && !hasTrigger) riskQueue.push({ priority: "high", action: "Pair workflow definitions with event, schedule, API, webhook, or manual trigger evidence.", why: "A durable task definition without a trigger leaves learners unable to see when the work starts.", relatedHref: "html/workflow-orchestration-readiness.html" });
  if (hasTrigger && !hasWorkflow) riskQueue.push({ priority: "high", action: "Trace the task, workflow, activity, step, or worker that handles each trigger.", why: "Triggers need an execution boundary so background logic is not confused with ordinary request handling.", relatedHref: "html/workflow-orchestration-readiness.html" });
  if (hasWorkflow && !hasDurability) riskQueue.push({ priority: "medium", action: "Document retry, timeout, heartbeat, checkpoint, state-store, resume, history, or idempotency behavior.", why: "Workflow orchestration is valuable because work can recover across failures, restarts, and long waits.", relatedHref: "html/workflow-orchestration-readiness.html" });
  if (hasWorkflow && !hasFlow) riskQueue.push({ priority: "medium", action: "Expose waits, sleeps, wait-for-event, cancellation, batching, concurrency, rate limit, throttle, priority, or child-workflow controls.", why: "Durable workflows need visible coordination semantics beyond one fire-and-forget function.", relatedHref: "html/workflow-orchestration-readiness.html" });
  if (hasWorkflow && !hasRuntime) riskQueue.push({ priority: "low", action: "Record dev server, deploy, worker pool, isolated runtime, machine, environment, serve, or dashboard evidence.", why: "Learners need to know where long-running work is executed and observed.", relatedHref: "html/workflow-orchestration-readiness.html" });
  if (hasWorkflow && !hasObservability) riskQueue.push({ priority: "low", action: "Add logger, tracing, metadata, tags, run status, dashboard, alerts, or metrics evidence.", why: "Long-running jobs need progress and failure visibility so operators can inspect stuck or failed runs.", relatedHref: "html/workflow-orchestration-readiness.html" });
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Workflow orchestration readiness report: setup ${workflowSetups.length}개, trigger signal ${triggerSignals.length}개, execution signal ${executionSignals.length}개, durability signal ${durabilitySignals.length}개, flow signal ${flowSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Workflow orchestration readiness Temporal workflows activities Worker taskQueue schedules signals queries updates setHandler condition CancellationScope workflowInfo patched deprecatePatch ApplicationFailure ActivityFailure NativeConnection TestWorkflowEnvironment proxySinks interceptors @temporalio/activity @temporalio/common @temporalio/testing @temporalio/openai-agents continueAsNew Inngest createFunction events cron step.run step.sleep waitForEvent invoke cancelOn concurrency throttle debounce rate limit Trigger.dev task schemaTask schedules cron wait queue retry maxDuration idempotency metadata logger deploy runs LangGraph StateGraph START END addNode addEdge addConditionalEdges compile checkpointer MemorySaver Command resume graph.getState streamEvents",
    workflowSetups,
    triggerSignals,
    executionSignals,
    durabilitySignals,
    flowSignals,
    runtimeSignals,
    observabilitySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"@temporalio/(workflow|worker|client|activity|common|testing)|defineUpdate|setHandler|condition\\(|CancellationScope|workflowInfo|patched|ApplicationFailure|ActivityFailure|NativeConnection|TestWorkflowEnvironment|proxySinks|interceptors\" src app packages", purpose: "Find Temporal workflow handlers, cancellation/failure semantics, test environments, sinks, and interceptors." },
      { command: "rg \"new Inngest|createFunction|inngest\\.send|step\\.run|step\\.sleep|step\\.waitForEvent|step\\.invoke|serve\\(\" src app packages", purpose: "Trace Inngest event functions, steps, waits, invokes, and serve endpoints." },
      { command: "rg \"@trigger\\.dev/sdk|task\\(|schemaTask|schedules\\.task|tasks\\.trigger|triggerAndWait|batchTrigger|wait\\.for|metadata|logger\" src app packages", purpose: "Map Trigger.dev tasks, schedules, waits, child runs, metadata, and logging." },
      { command: "rg \"@langchain/langgraph|StateGraph|START|END|addNode|addEdge|addConditionalEdges|compile\\(|checkpointer|MemorySaver|Command\\(|getState|streamEvents\" src app packages", purpose: "Map LangGraph state graphs, node routing, checkpoints, resume commands, state reads, and event streams." },
      { command: "rg \"retry|retries|timeout|maxDuration|heartbeat|checkpoint|state store|history|idempotency|continueAsNew|resume\" src app packages docs", purpose: "Review durability, recovery, and idempotency semantics without executing jobs." },
      { command: "rg \"concurrency|queue|rateLimit|throttle|debounce|priority|cancelOn|AbortTaskRun|waitForEvent|batch\" src app packages docs", purpose: "Check coordination, cancellation, batching, and flow-control behavior." },
      { command: "rg \"dev server|trigger.dev dev|deploy|Worker\\.run|dashboard|run status|tags|metrics|alerts|tracing\" src app packages docs", purpose: "Find runtime and observability evidence for long-running work." }
    ],
    learnerNextSteps: [
      "먼저 Temporal workflow/activity/worker, Inngest createFunction, Trigger.dev task/schemaTask 중 실제 durable work boundary를 찾으세요.",
      "Temporal을 쓰는 경우 signal/query/update handler, condition, CancellationScope, workflowInfo, patching, failure type, sinks/interceptors, test environment를 함께 확인하세요.",
      "event, cron, schedule, webhook, API trigger를 task/workflow/step과 연결해서 언제 작업이 시작되는지 확인하세요.",
      "retry, timeout, heartbeat, checkpoint, state store, resume, history, idempotency 신호로 실패 복구 모델을 읽으세요.",
      "LangGraph를 쓰는 경우 StateGraph, START/END, addNode/addEdge/addConditionalEdges, compile checkpointer, Command resume, graph.getState, streamEvents를 함께 확인하세요.",
      "wait, sleep, waitForEvent, cancelOn, batch, concurrency, rate limit, child workflow 신호로 coordination semantics를 분리하세요.",
      "dev server, deploy, worker pool, isolated runtime, machine, environment, dashboard 신호로 작업이 어디서 실행되고 관찰되는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. RepoTutor는 workflow worker를 시작하거나, 이벤트를 전송하거나, schedule을 등록하거나, task/run을 실행하거나, 외부 orchestration 서비스를 호출하지 않습니다."
    ]
  };
}

type WorkflowOrchestrationSourceFile = { filePath: string; text: string; sourceHref: string };

async function workflowOrchestrationSourceFiles(walk: WalkResult): Promise<WorkflowOrchestrationSourceFile[]> {
  const files: WorkflowOrchestrationSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !workflowOrchestrationInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!workflowOrchestrationPathSignal(file.relPath) && !workflowOrchestrationContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function workflowOrchestrationInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return workflowOrchestrationPathSignal(filePath)
    || /(^|\/)(README|docs?|workflows?|workflow-orchestration|durable|background|jobs?|tasks?|temporal|inngest|trigger|schedules?|cron|workers?|activities?|queue|queues|runs?|events?|serverless|api|routes?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|wrangler\.(toml|json|jsonc))$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|go|rs|py|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function workflowOrchestrationPathSignal(filePath: string): boolean {
  return /(^|\/)(workflows?|workflow-orchestration|durable|background|jobs?|tasks?|temporal|inngest|trigger|langgraph|agents?|schedules?|cron|workers?|activities?|queue|queues|runs?|events?)(\/|\.|-|_|$)/i.test(filePath);
}

function workflowOrchestrationContentSignal(text: string): boolean {
  return /(@temporalio\/(workflow|worker|client|activity|common|testing|openai-agents)|proxyActivities|defineSignal|defineQuery|defineUpdate|setHandler|condition\(|CancellationScope|workflowInfo|patched|deprecatePatch|ApplicationFailure|ActivityFailure|NativeConnection|TestWorkflowEnvironment|proxySinks|interceptors|Worker\.create|taskQueue|continueAsNew|new Inngest|createFunction|step\.(run|sleep|waitForEvent|invoke)|cancelOn|@trigger\.dev\/sdk|schemaTask|task\(|schedules\.task|tasks\.(trigger|batchTrigger)|triggerAndWait|wait\.for|AbortTaskRun|WorkflowEntrypoint|workflows?\s*[=:]|@langchain\/langgraph|@langchain\/langgraph-checkpoint|StateGraph|CompiledStateGraph|MessagesAnnotation|ToolNode|START|END|addNode|addEdge|addConditionalEdges|checkpointer|MemorySaver|Command\(|graph\.getState|getState\(|streamEvents)/i.test(text);
}

function workflowOrchestrationSetups(sourceFiles: WorkflowOrchestrationSourceFile[]): WorkflowOrchestrationReadinessReport["workflowSetups"] {
  const rows: WorkflowOrchestrationReadinessReport["workflowSetups"] = [];
  for (const source of sourceFiles) {
    const workflowCount = countMatches(source.text, /workflow|Workflow|WorkflowClient|WorkflowHandle|StateGraph|CompiledStateGraph|createAgent|createFunction|task\(|schemaTask|WorkflowEntrypoint|workflows?\s*[=:]/g);
    const eventCount = countMatches(source.text, /event|events|defineSignal|defineQuery|defineUpdate|setHandler|START|thread_id|configurable|inngest\.send|webhook|trigger\(|tasks\.trigger|api trigger/gi);
    const scheduleCount = countMatches(source.text, /cron|schedule|schedules\.task|scheduled|interval/gi);
    const stepCount = countMatches(source.text, /step\.run|step\.sleep|step\.waitForEvent|step\.invoke|step\(|addNode|ToolNode|BeforeAgentNode|BeforeModelNode|AfterModelNode|AfterAgentNode|wait\.for|wait\.until/gi);
    const activityCount = countMatches(source.text, /activity|activities|proxyActivities|Activity|executeActivity/gi);
    const queueCount = countMatches(source.text, /taskQueue|queue|queues|worker pool|Queue<|concurrencyLimit/gi);
    const retryCount = countMatches(source.text, /retry|retries|maxAttempts|maximumAttempts|backoff/gi);
    const timeoutCount = countMatches(source.text, /timeout|startToCloseTimeout|scheduleToCloseTimeout|maxDuration|deadline/gi);
    const waitCount = countMatches(source.text, /waitForEvent|wait\.for|wait\.until|sleep|pause|waitpoint/gi);
    const cancelCount = countMatches(source.text, /cancel|cancelOn|AbortTaskRun|CancellationScope|terminate/gi);
    const concurrencyCount = countMatches(source.text, /concurrency|rateLimit|rate limit|throttle|debounce|priority|batch|batchTrigger/gi);
    const stateCount = countMatches(source.text, /checkpoint|checkpointer|MemorySaver|state store|getState|thread_id|Command\(|resume|history|continueAsNew|idempotency|idempotencyKey|metadata\.set|persist|workflowInfo|patched|deprecatePatch|heartbeatDetails/gi);
    const observabilityCount = countMatches(source.text, /logger|log\.|tracing|trace|metadata|tags|run status|dashboard|metrics|alerts|observability|getState|streamEvents|proxySinks|sinks|interceptors|workflowInfo|activityInfo|heartbeatDetails/gi);
    const totalSignals = workflowCount + eventCount + scheduleCount + stepCount + activityCount + queueCount + retryCount + timeoutCount + waitCount + cancelCount + concurrencyCount + stateCount + observabilityCount;
    if (totalSignals === 0 && !workflowOrchestrationPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: workflowOrchestrationPlatform(source),
      workflowCount,
      eventCount,
      scheduleCount,
      stepCount,
      activityCount,
      queueCount,
      retryCount,
      timeoutCount,
      waitCount,
      cancelCount,
      concurrencyCount,
      stateCount,
      observabilityCount,
      readiness: workflowCount + stepCount + activityCount > 0 && (eventCount + scheduleCount > 0) && (retryCount + timeoutCount + stateCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} workflow orchestration signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.workflowCount + b.stepCount + b.activityCount + b.eventCount + b.retryCount + b.concurrencyCount + b.stateCount) - (a.workflowCount + a.stepCount + a.activityCount + a.eventCount + a.retryCount + a.concurrencyCount + a.stateCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function workflowOrchestrationPlatform(source: WorkflowOrchestrationSourceFile): WorkflowOrchestrationReadinessReport["workflowSetups"][number]["platform"] {
  if (/trigger|@trigger\.dev|schemaTask|schedules\.task|tasks\.trigger/i.test(source.filePath) || /@trigger\.dev\/sdk|schemaTask|schedules\.task|tasks\.(trigger|batchTrigger)|AbortTaskRun/i.test(source.text)) return "triggerdotdev";
  if (/inngest/i.test(source.filePath) || /new Inngest|createFunction|step\.(run|sleep|waitForEvent|invoke)|inngest\.send/i.test(source.text)) return "inngest";
  if (/temporal/i.test(source.filePath) || /@temporalio\/(workflow|worker|client|activity|common|testing|openai-agents)|proxyActivities|defineUpdate|setHandler|CancellationScope|Worker\.create|taskQueue|continueAsNew/i.test(source.text)) return "temporal";
  if (/langgraph/i.test(source.filePath) || /@langchain\/langgraph|StateGraph|CompiledStateGraph|MessagesAnnotation|ToolNode|MemorySaver/i.test(source.text)) return "langgraph";
  if (/WorkflowEntrypoint|workflows?\s*[=:]/i.test(source.text)) return "cloudflare-workflows";
  if (/workflow|durable|background|job|task|queue|cron|schedule/i.test(source.filePath) || /workflow|durable|background job|queue|cron|schedule/i.test(source.text)) return "custom";
  return "unknown";
}

function workflowOrchestrationTriggerSignals(sourceFiles: WorkflowOrchestrationSourceFile[]): WorkflowOrchestrationReadinessReport["triggerSignals"] {
  const specs: Array<{ signal: WorkflowOrchestrationReadinessReport["triggerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "event", pattern: /event\s*:|events?|inngest\.send|Trigger|triggering event/i, evidence: "event trigger evidence was detected." },
    { signal: "cron", pattern: /cron|crontab|scheduled tasks/i, evidence: "cron trigger evidence was detected." },
    { signal: "schedule", pattern: /schedule|schedules\.task|interval|scheduled/i, evidence: "schedule evidence was detected." },
    { signal: "webhook", pattern: /webhook|serve\(|endpoint|HTTP|https/i, evidence: "webhook/HTTP trigger evidence was detected." },
    { signal: "manual", pattern: /manual|workflow_dispatch|trigger\.dev dev|dashboard/i, evidence: "manual trigger evidence was detected." },
    { signal: "api-trigger", pattern: /tasks\.trigger|task\.trigger|client\.workflow\.start|workflow\.execute|startWorkflow|executeWorkflow/i, evidence: "API trigger evidence was detected." },
    { signal: "child-trigger", pattern: /triggerAndWait|executeChild|child workflow|step\.invoke|tasks\.trigger/i, evidence: "child trigger evidence was detected." },
    { signal: "signal", pattern: /defineSignal|setHandler\([^)]*Signal|\.signal\(/i, evidence: "Temporal signal trigger evidence was detected." },
    { signal: "query", pattern: /defineQuery|setHandler\([^)]*Query|\.query\(/i, evidence: "Temporal query trigger evidence was detected." },
    { signal: "update", pattern: /defineUpdate|startUpdate|executeUpdate|setHandler\([^)]*Update|\.update\(/i, evidence: "Temporal update trigger evidence was detected." },
    { signal: "graph-start", pattern: /\bSTART\b|addEdge\(\s*START|START\s*,/i, evidence: "LangGraph START trigger evidence was detected." },
    { signal: "thread-config", pattern: /thread_id|configurable\s*:|RunnableConfig|LangGraphRunnableConfig/i, evidence: "LangGraph thread config evidence was detected." }
  ];
  return workflowOrchestrationSignalFromSpecs(sourceFiles, specs, "trigger", "signal");
}

function workflowOrchestrationExecutionSignals(sourceFiles: WorkflowOrchestrationSourceFile[]): WorkflowOrchestrationReadinessReport["executionSignals"] {
  const specs: Array<{ signal: WorkflowOrchestrationReadinessReport["executionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "task", pattern: /task\(|schemaTask|@trigger\.dev\/sdk|durable task/i, evidence: "task evidence was detected." },
    { signal: "workflow", pattern: /workflow|Workflow|WorkflowEntrypoint|@temporalio\/workflow/i, evidence: "workflow evidence was detected." },
    { signal: "activity", pattern: /activity|activities|proxyActivities|executeActivity/i, evidence: "activity evidence was detected." },
    { signal: "step", pattern: /step\.run|step\.sleep|step\.waitForEvent|step\.invoke|steps are/i, evidence: "step evidence was detected." },
    { signal: "worker", pattern: /Worker\.create|Worker\.run|worker pool|polling task queues|@temporalio\/worker/i, evidence: "worker evidence was detected." },
    { signal: "task-queue", pattern: /taskQueue|task queue|queue:/i, evidence: "task queue evidence was detected." },
    { signal: "function-run", pattern: /function runs|run state|run:/i, evidence: "function run evidence was detected." },
    { signal: "handler", pattern: /serve\(|handler|endpoint|executor/i, evidence: "handler/executor evidence was detected." },
    { signal: "workflow-client", pattern: /WorkflowClient|new Client|client\.workflow/i, evidence: "Temporal workflow client evidence was detected." },
    { signal: "workflow-handle", pattern: /WorkflowHandle|WorkflowHandleWithFirstExecutionRunId|handle\.result|workflow\.getHandle/i, evidence: "Temporal workflow handle evidence was detected." },
    { signal: "update-handler", pattern: /defineUpdate|setHandler\([^)]*Update|startUpdate|executeUpdate/i, evidence: "Temporal update handler evidence was detected." },
    { signal: "state-graph", pattern: /StateGraph|CompiledStateGraph|MessagesAnnotation/i, evidence: "LangGraph StateGraph evidence was detected." },
    { signal: "graph-node", pattern: /addNode|BeforeAgentNode|BeforeModelNode|AfterModelNode|AfterAgentNode|AgentNode/i, evidence: "LangGraph node evidence was detected." },
    { signal: "tool-node", pattern: /ToolNode|TOOLS_NODE_NAME/i, evidence: "LangGraph tool node evidence was detected." },
    { signal: "compiled-graph", pattern: /\.compile\(|CompiledStateGraph|workflow\.compile/i, evidence: "LangGraph compile evidence was detected." }
  ];
  return workflowOrchestrationSignalFromSpecs(sourceFiles, specs, "execution", "signal");
}

function workflowOrchestrationDurabilitySignals(sourceFiles: WorkflowOrchestrationSourceFile[]): WorkflowOrchestrationReadinessReport["durabilitySignals"] {
  const specs: Array<{ signal: WorkflowOrchestrationReadinessReport["durabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "retry", pattern: /retry|retries|maxAttempts|maximumAttempts|backoff/i, evidence: "retry evidence was detected." },
    { signal: "timeout", pattern: /timeout|startToCloseTimeout|scheduleToCloseTimeout|maxDuration|deadline/i, evidence: "timeout evidence was detected." },
    { signal: "heartbeat", pattern: /heartbeat|recordActivityHeartbeat|Heartbeat/i, evidence: "heartbeat evidence was detected." },
    { signal: "checkpoint", pattern: /checkpoint|Checkpoint|CRIU|restore/i, evidence: "checkpoint evidence was detected." },
    { signal: "state-store", pattern: /state store|run state|State store|database|persist/i, evidence: "state-store evidence was detected." },
    { signal: "resume", pattern: /resume|resumption|waitForEvent|restore/i, evidence: "resume evidence was detected." },
    { signal: "history", pattern: /history|workflow history|event history|run history/i, evidence: "history evidence was detected." },
    { signal: "continue-as-new", pattern: /continueAsNew|continue as new/i, evidence: "continue-as-new evidence was detected." },
    { signal: "idempotency", pattern: /idempotency|idempotencyKey|idempotent|dedupe/i, evidence: "idempotency evidence was detected." },
    { signal: "application-failure", pattern: /ApplicationFailure|ensureApplicationFailure/i, evidence: "Temporal application failure evidence was detected." },
    { signal: "activity-failure", pattern: /ActivityFailure/i, evidence: "Temporal activity failure evidence was detected." },
    { signal: "cancellation-scope", pattern: /CancellationScope|CancelledFailure|isCancellation/i, evidence: "Temporal cancellation scope evidence was detected." },
    { signal: "patching", pattern: /patched\(|deprecatePatch|patchId/i, evidence: "Temporal workflow patching evidence was detected." },
    { signal: "workflow-info", pattern: /workflowInfo\(|WorkflowInfo/i, evidence: "Temporal workflow info evidence was detected." },
    { signal: "heartbeat-details", pattern: /heartbeatDetails|heartbeat details|activityInfo\(\)|Context\.current\(\)\.heartbeat/i, evidence: "Temporal heartbeat detail evidence was detected." },
    { signal: "checkpointer", pattern: /checkpointer|BaseCheckpointSaver|langgraph-checkpoint/i, evidence: "LangGraph checkpointer evidence was detected." },
    { signal: "memory-saver", pattern: /MemorySaver/i, evidence: "LangGraph MemorySaver evidence was detected." },
    { signal: "resume-command", pattern: /new Command\(|Command\(|resume\s*:/i, evidence: "LangGraph resume command evidence was detected." }
  ];
  return workflowOrchestrationSignalFromSpecs(sourceFiles, specs, "durability", "signal");
}

function workflowOrchestrationFlowSignals(sourceFiles: WorkflowOrchestrationSourceFile[]): WorkflowOrchestrationReadinessReport["flowSignals"] {
  const specs: Array<{ signal: WorkflowOrchestrationReadinessReport["flowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wait", pattern: /wait\.for|wait\.until|waitpoint|wait for/i, evidence: "wait evidence was detected." },
    { signal: "sleep", pattern: /sleep\(|step\.sleep|timer/i, evidence: "sleep/timer evidence was detected." },
    { signal: "wait-for-event", pattern: /waitForEvent|wait for event/i, evidence: "wait-for-event evidence was detected." },
    { signal: "condition", pattern: /\bcondition\(|workflow\.condition|wf\.condition/i, evidence: "Temporal condition evidence was detected." },
    { signal: "signal-handler", pattern: /defineSignal|setHandler\([^)]*Signal/i, evidence: "Temporal signal handler evidence was detected." },
    { signal: "query-handler", pattern: /defineQuery|setHandler\([^)]*Query/i, evidence: "Temporal query handler evidence was detected." },
    { signal: "update-handler", pattern: /defineUpdate|setHandler\([^)]*Update/i, evidence: "Temporal update handler evidence was detected." },
    { signal: "cancel", pattern: /cancelOn|cancel|AbortTaskRun|CancellationScope|terminate/i, evidence: "cancellation evidence was detected." },
    { signal: "cancellation-scope", pattern: /CancellationScope/i, evidence: "Temporal cancellation scope flow evidence was detected." },
    { signal: "external-workflow", pattern: /getExternalWorkflowHandle|ExternalWorkflowHandle/i, evidence: "Temporal external workflow evidence was detected." },
    { signal: "batch", pattern: /batch|batchTrigger|batching/i, evidence: "batch evidence was detected." },
    { signal: "concurrency", pattern: /concurrency|concurrencyLimit|maxConcurrent/i, evidence: "concurrency evidence was detected." },
    { signal: "rate-limit", pattern: /rateLimit|rate limit|rate limiting/i, evidence: "rate limit evidence was detected." },
    { signal: "throttle", pattern: /throttle|throttling/i, evidence: "throttle evidence was detected." },
    { signal: "priority", pattern: /priority|prioritization/i, evidence: "priority evidence was detected." },
    { signal: "child-workflow", pattern: /triggerAndWait|executeChild|child workflow|step\.invoke|subtask/i, evidence: "child workflow/subtask evidence was detected." },
    { signal: "graph-edge", pattern: /addEdge|edges\s*:|Graph\.addEdge/i, evidence: "LangGraph edge evidence was detected." },
    { signal: "conditional-edge", pattern: /addConditionalEdges|conditional routing|conditional edge/i, evidence: "LangGraph conditional edge evidence was detected." },
    { signal: "start-end", pattern: /\bSTART\b|\bEND\b/i, evidence: "LangGraph START/END evidence was detected." },
    { signal: "tool-loop", pattern: /ToolNode|TOOLS_NODE_NAME|tool loop|tool calls/i, evidence: "LangGraph tool loop evidence was detected." }
  ];
  return workflowOrchestrationSignalFromSpecs(sourceFiles, specs, "flow", "signal");
}

function workflowOrchestrationRuntimeSignals(sourceFiles: WorkflowOrchestrationSourceFile[]): WorkflowOrchestrationReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: WorkflowOrchestrationReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dev-server", pattern: /dev server|trigger\.dev dev|inngest dev|localhost:8288/i, evidence: "dev server evidence was detected." },
    { signal: "deploy", pattern: /deploy|trigger\.dev deploy|deployment|versioning/i, evidence: "deploy evidence was detected." },
    { signal: "worker-pool", pattern: /worker pool|Worker\.run|polling task queues|executor|runner/i, evidence: "worker pool evidence was detected." },
    { signal: "isolated-runtime", pattern: /isolated environment|isolated runtime|sandbox|worker thread|vm context/i, evidence: "isolated runtime evidence was detected." },
    { signal: "machine", pattern: /machine|vCPU|GBs of RAM|large-1x|resources/i, evidence: "machine/resource evidence was detected." },
    { signal: "environment", pattern: /environment|DEV|PREVIEW|STAGING|PROD|namespace/i, evidence: "environment evidence was detected." },
    { signal: "serve", pattern: /serve\(|serve endpoint|registration|introspection/i, evidence: "serve endpoint evidence was detected." },
    { signal: "dashboard", pattern: /dashboard|web app|cloud\.trigger|Inngest Dev Server dashboard/i, evidence: "dashboard evidence was detected." },
    { signal: "native-connection", pattern: /NativeConnection|InternalNativeConnection/i, evidence: "Temporal native connection evidence was detected." },
    { signal: "test-environment", pattern: /TestWorkflowEnvironment|createTimeSkipping|createLocal/i, evidence: "Temporal test environment evidence was detected." },
    { signal: "workflow-bundle", pattern: /workflowBundle|bundleWorkflowCode|workflowsPath|WorkflowCodeBundler/i, evidence: "Temporal workflow bundle evidence was detected." },
    { signal: "replay-worker", pattern: /ReplayWorker|replayWorkflowHistory|runReplayHistory|historyFromJSON/i, evidence: "Temporal replay evidence was detected." },
    { signal: "graph-invoke", pattern: /\.invoke\(|graph\.invoke|app\.invoke|agent\.invoke/i, evidence: "LangGraph invoke evidence was detected." },
    { signal: "stream-events", pattern: /streamEvents|streamMode|StreamEvent|StreamTransformer/i, evidence: "LangGraph stream events evidence was detected." }
  ];
  return workflowOrchestrationSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function workflowOrchestrationObservabilitySignals(sourceFiles: WorkflowOrchestrationSourceFile[]): WorkflowOrchestrationReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: WorkflowOrchestrationReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "logger", pattern: /logger|log\.|console\.log/i, evidence: "logger evidence was detected." },
    { signal: "tracing", pattern: /tracing|trace|span|otel|OpenTelemetry/i, evidence: "tracing evidence was detected." },
    { signal: "metadata", pattern: /metadata|metadata\.set|run metadata/i, evidence: "metadata evidence was detected." },
    { signal: "tags", pattern: /tags?|tagging/i, evidence: "tag evidence was detected." },
    { signal: "run-status", pattern: /run status|runs?|status|FAILED|STOPPED|RUNNING/i, evidence: "run status evidence was detected." },
    { signal: "dashboard", pattern: /dashboard|trace view|cloud\.trigger|localhost:8288/i, evidence: "dashboard evidence was detected." },
    { signal: "alerts", pattern: /alerts?|notification|failure alert/i, evidence: "alert evidence was detected." },
    { signal: "metrics", pattern: /metrics|monitoring|observability|deletionCyclesTotal/i, evidence: "metrics evidence was detected." },
    { signal: "sinks", pattern: /proxySinks|InjectedSinks|\bsinks\b/i, evidence: "Temporal sinks evidence was detected." },
    { signal: "interceptors", pattern: /interceptors?|WorkflowInterceptors|ActivityInterceptors/i, evidence: "Temporal interceptor evidence was detected." },
    { signal: "workflow-info", pattern: /workflowInfo\(|WorkflowInfo/i, evidence: "Temporal workflow info evidence was detected." },
    { signal: "activity-info", pattern: /activityInfo\(|ActivityInfo|Context\.current\(\)\.info/i, evidence: "Temporal activity info evidence was detected." },
    { signal: "heartbeat-details", pattern: /heartbeatDetails|heartbeat details/i, evidence: "Temporal heartbeat detail evidence was detected." },
    { signal: "graph-state", pattern: /getState|graph\.getState|state\.next|state\.tasks|interrupts/i, evidence: "LangGraph state inspection evidence was detected." },
    { signal: "stream-events", pattern: /streamEvents|StreamEvent|streamMode|AgentRunStream/i, evidence: "LangGraph stream events evidence was detected." }
  ];
  return workflowOrchestrationSignalFromSpecs(sourceFiles, specs, "observability", "signal");
}

function workflowOrchestrationPackageSignals(sourceFiles: WorkflowOrchestrationSourceFile[]): WorkflowOrchestrationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: WorkflowOrchestrationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@temporalio/workflow", pattern: /"@temporalio\/workflow"|@temporalio\/workflow|proxyActivities|defineSignal/i, evidence: "Temporal workflow package/import evidence was detected." },
    { signal: "@temporalio/worker", pattern: /"@temporalio\/worker"|@temporalio\/worker|Worker\.create/i, evidence: "Temporal worker package/import evidence was detected." },
    { signal: "@temporalio/client", pattern: /"@temporalio\/client"|@temporalio\/client|new Client|workflow\.start/i, evidence: "Temporal client package/import evidence was detected." },
    { signal: "@temporalio/activity", pattern: /"@temporalio\/activity"|@temporalio\/activity|activityInfo|Context\.current|heartbeat\(/i, evidence: "Temporal activity package/import evidence was detected." },
    { signal: "@temporalio/common", pattern: /"@temporalio\/common"|@temporalio\/common|ApplicationFailure|ActivityFailure|CancelledFailure/i, evidence: "Temporal common package/import evidence was detected." },
    { signal: "@temporalio/testing", pattern: /"@temporalio\/testing"|@temporalio\/testing|TestWorkflowEnvironment/i, evidence: "Temporal testing package/import evidence was detected." },
    { signal: "@temporalio/openai-agents", pattern: /"@temporalio\/openai-agents"|@temporalio\/openai-agents/i, evidence: "Temporal OpenAI agents package/import evidence was detected." },
    { signal: "inngest", pattern: /"inngest"|from ["']inngest["']|new Inngest|createFunction/i, evidence: "Inngest package/import evidence was detected." },
    { signal: "@trigger.dev/sdk", pattern: /"@trigger\.dev\/sdk"|@trigger\.dev\/sdk|task\(|schemaTask|schedules\.task/i, evidence: "Trigger.dev SDK evidence was detected." },
    { signal: "@trigger.dev/react", pattern: /"@trigger\.dev\/react"|@trigger\.dev\/react|useRealtimeRun|useTaskTrigger/i, evidence: "Trigger.dev React evidence was detected." },
    { signal: "cloudflare-workflows", pattern: /WorkflowEntrypoint|workflows?\s*[=:]|Workflow</i, evidence: "Cloudflare Workflows evidence was detected." },
    { signal: "@langchain/langgraph", pattern: /"@langchain\/langgraph"|@langchain\/langgraph|StateGraph|MessagesAnnotation/i, evidence: "LangGraph package/import evidence was detected." },
    { signal: "@langchain/langgraph-checkpoint", pattern: /"@langchain\/langgraph-checkpoint"|@langchain\/langgraph-checkpoint|MemorySaver|BaseCheckpointSaver/i, evidence: "LangGraph checkpoint package/import evidence was detected." },
    { signal: "langchain", pattern: /"langchain"|from ["']langchain["']|createAgent|createMiddleware/i, evidence: "LangChain agent package/import evidence was detected." }
  ];
  return workflowOrchestrationSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function workflowOrchestrationSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: WorkflowOrchestrationSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/workflow-orchestration-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
