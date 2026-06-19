import path from "node:path";
import type { ChaosEngineeringReadinessReport, FuzzReadinessReport, IntegrationTestEnvironmentReadinessReport, PropertyBasedTestingReadinessReport, RuntimeEnvironmentReport, TestDataReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildPropertyBasedTestingReadinessReport(walk: WalkResult): Promise<PropertyBasedTestingReadinessReport> {
  const sourceFiles = await propertyBasedTestingSourceFiles(walk);
  const propertySetups = propertyBasedTestingSetupRows(sourceFiles);
  const generatorSignals = propertyBasedTestingGeneratorSignals(sourceFiles);
  const runnerSignals = propertyBasedTestingRunnerSignals(sourceFiles);
  const reproductionSignals = propertyBasedTestingReproductionSignals(sourceFiles);
  const statefulSignals = propertyBasedTestingStatefulSignals(sourceFiles);
  const ciSignals = propertyBasedTestingCiSignals(sourceFiles);
  const packageSignals = propertyBasedTestingPackageSignals(sourceFiles);
  const hasProperty = propertySetups.some((item) => item.propertyCount > 0 || item.readiness === "ready");
  const hasGenerator = generatorSignals.some((item) => item.readiness === "ready");
  const hasReproduction = reproductionSignals.some((item) => item.readiness === "ready");
  const hasCi = ciSignals.some((item) => ["github-actions", "property-script", "num-runs", "max-examples", "tries"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: PropertyBasedTestingReadinessReport["riskQueue"] = [];
  if (!hasProperty && !hasGenerator) {
    riskQueue.push({
      priority: "medium",
      action: "Add at least one property-based test with an explicit generator before claiming generative coverage.",
      why: "fast-check, Hypothesis, jqwik, QuickCheck, and proptest all need properties paired with generated inputs.",
      relatedHref: "html/property-based-testing-readiness.html"
    });
  }
  if (hasProperty && !hasReproduction) {
    riskQueue.push({
      priority: "high",
      action: "Record seed, path, falsifying example, or example database policy for failing generated cases.",
      why: "Property-based failures are only actionable when the smallest counterexample can be replayed deterministically.",
      relatedHref: "html/property-based-testing-readiness.html"
    });
  }
  if (hasProperty && !hasCi) {
    riskQueue.push({
      priority: "medium",
      action: "Expose property-test run counts and CI commands before enforcing the suite.",
      why: "Generated tests can be slow or flaky without bounded numRuns, max_examples, tries, seed, and runner policy.",
      relatedHref: "html/property-based-testing-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original project test command before treating this as property-based test evidence.",
    why: "RepoTutor records static readiness only; it does not generate inputs, shrink failures, or replay counterexamples.",
    relatedHref: "html/property-based-testing-readiness.html"
  });

  return {
    summary: `Property-based testing readiness report: setup ${propertySetups.length}개, generator signal ${generatorSignals.filter((item) => item.readiness === "ready").length}개, reproduction signal ${reproductionSignals.filter((item) => item.readiness === "ready").length}개, CI signal ${ciSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Property-based testing fast-check Hypothesis jqwik generators arbitraries strategies shrinking seeds counterexamples stateful CI",
    propertySetups,
    generatorSignals,
    runnerSignals,
    reproductionSignals,
    statefulSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx vitest run --runInBand", purpose: "Run Vitest property tests with a bounded worker surface before increasing generated case counts." },
      { command: "npx jest --show-seed --runInBand", purpose: "Run Jest tests while exposing seed data for fast-check replay." },
      { command: "pytest -q --hypothesis-show-statistics", purpose: "Run Hypothesis tests and print generation statistics." },
      { command: "mvn test -Djqwik.failures.runfirst=true", purpose: "Run jqwik through the JUnit Platform and prioritize previous falsifying samples." },
      { command: "rg \"fc\\.property|fc\\.assert|@given|strategies as st|@Property|@ForAll|RuleBasedStateMachine|modelRun\" .", purpose: "Locate static property-based testing evidence." }
    ],
    learnerNextSteps: [
      "property와 generator가 같은 테스트 경계 안에 있는지 먼저 확인하세요.",
      "counterexample, seed, path, example database 같은 재현 수단이 실패 메시지나 설정에 남는지 보세요.",
      "numRuns, max_examples, tries 같은 실행량 설정이 로컬과 CI에서 의도적으로 다르게 관리되는지 확인하세요.",
      "stateful/model-based property는 원본 테스트에서 실제 상태 전이가 재현 가능한지 별도 실행으로 검증해야 합니다."
    ]
  };
}

type PropertyBasedTestingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function propertyBasedTestingSourceFiles(walk: WalkResult): Promise<PropertyBasedTestingSourceFile[]> {
  const files: PropertyBasedTestingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !propertyBasedTestingInspectablePath(file.relPath)) continue;
    const pathCandidate = propertyBasedTestingPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !propertyBasedTestingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 180) break;
  }
  return files;
}

function propertyBasedTestingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|pytest\.ini|tox\.ini|pom\.xml|build\.gradle|build\.gradle\.kts|junit-platform\.properties|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(test|tests|spec|specs|properties|property-tests?|stateful|model)(\/|$)/i.test(filePath)
    || /\.(test|spec)\.[cm]?[jt]sx?$/i.test(filePath)
    || /\.(js|ts|jsx|tsx|py|java|kt|scala|rs|hs|toml|xml|ya?ml|md|json)$/i.test(filePath);
}

function propertyBasedTestingPathSignal(filePath: string): boolean {
  return /(^|\/)(property-tests?|properties|stateful|model-based|hypothesis|fast-check|jqwik|quickcheck|proptest)(\/|\.|-|_|$)/i.test(filePath);
}

function propertyBasedTestingContentSignal(text: string): boolean {
  return /(fast-check|@fast-check\/jest|fc\.property|fc\.assert|fc\.check|fc\.configureGlobal|numRuns|replayPath|@given|strategies as st|hypothesis\.strategies|settings\(|max_examples|derandomize|example database|Falsifying example|RuleBasedStateMachine|@Property|@ForAll|Arbitraries|@Provide|junit-platform|QuickCheck|proptest!|proptest::|modelRun|commands\()/i.test(text);
}

function propertyBasedTestingSetupRows(sourceFiles: PropertyBasedTestingSourceFile[]): PropertyBasedTestingReadinessReport["propertySetups"] {
  const rows: PropertyBasedTestingReadinessReport["propertySetups"] = [];
  for (const source of sourceFiles) {
    const propertyCount = countMatches(source.text, /fc\.property|fc\.asyncProperty|@given\s*\(|@Property\b|property\s*\(|quickCheck|QuickCheck|proptest!|proptest::/g);
    const generatorCount = countMatches(source.text, /fc\.(integer|string|boolean|array|record|tuple|oneof|constant|dictionary|option|letrec|anything)|strategies as st|hypothesis\.strategies|st\.(integers|text|lists|dictionaries|builds|from_type|composite|data)|Arbitraries\.|@ForAll|@Provide|Gen\.|Strategy|any::<|prop::/g);
    const assertionCount = countMatches(source.text, /fc\.assert|fc\.check|assert |expect\(|should|Assertions\.|assertThat|assertEquals|assertTrue|prop_assert|prop_assert_eq/g);
    const shrinkCount = countMatches(source.text, /shrink|shrinking|counterexample|smallest|minimal|falsifying example|RunDetails|afterFailure|ShrinkingMode/gi);
    const seedCount = countMatches(source.text, /seed|--show-seed|replayPath|path:|derandomize|random seed|whenFixedSeed|jqwik\.seed|HYPOTHESIS_SEED/gi);
    const runCount = countMatches(source.text, /numRuns|max_examples|settings\(|tries\s*=|@PropertyDefaults|iterations|cases|runs per test|100 inputs|1000 tries/gi);
    const statefulCount = countMatches(source.text, /modelRun|commands\(|fc\.commands|RuleBasedStateMachine|stateful|state machine|ActionChain|Stateful Testing|run_state_machine_as_test/gi);
    const exampleCount = countMatches(source.text, /example database|@example|example\(|\.example|failures\.runfirst|Falsifying example|counterexample|reproduce_failure/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|GitHub Actions|pull_request|CI\s*[:=]|runs-on|matrix|pytest|vitest|jest|mvn test|gradle test|cargo test|pnpm test|npm test/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = propertyCount + generatorCount + assertionCount + shrinkCount + seedCount + runCount + statefulCount + exampleCount + ciCount;
    if (totalSignals === 0 && !propertyBasedTestingPathSignal(source.filePath)) continue;
    const readiness = propertyCount > 0 && generatorCount > 0 && assertionCount > 0 && (seedCount > 0 || shrinkCount > 0 || exampleCount > 0)
      ? "ready"
      : totalSignals > 0
        ? "partial"
        : "missing";
    rows.push({
      filePath: source.filePath,
      ecosystem: propertyBasedTestingEcosystem(source.filePath, source.text),
      propertyCount,
      generatorCount,
      assertionCount,
      shrinkCount,
      seedCount,
      runCount,
      statefulCount,
      exampleCount,
      ciCount,
      readiness,
      evidence: `${source.filePath} contains ${totalSignals} property-based testing readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows.sort((a, b) => order[a.readiness] - order[b.readiness] || a.filePath.localeCompare(b.filePath)).slice(0, 90);
}

function propertyBasedTestingEcosystem(filePath: string, text: string): PropertyBasedTestingReadinessReport["propertySetups"][number]["ecosystem"] {
  if (/fast-check|@fast-check\/jest|fc\.property|fc\.assert|fc\.check/i.test(text) || /fast-check/i.test(filePath)) return "fast-check";
  if (/hypothesis|@given|strategies as st|hypothesis\.strategies|RuleBasedStateMachine/i.test(text) || /hypothesis/i.test(filePath)) return "hypothesis";
  if (/jqwik|@Property|@ForAll|Arbitraries\.|@Provide|junit-platform/i.test(text) || /jqwik/i.test(filePath)) return "jqwik";
  if (/QuickCheck|quickCheck|quickcheck/i.test(text) || /quickcheck/i.test(filePath)) return "quickcheck";
  if (/proptest!|proptest::|prop_assert/i.test(text) || /proptest/i.test(filePath)) return "proptest";
  return propertyBasedTestingContentSignal(text) ? "custom" : "unknown";
}

function propertyBasedTestingGeneratorSignals(sourceFiles: PropertyBasedTestingSourceFile[]): PropertyBasedTestingReadinessReport["generatorSignals"] {
  const specs: Array<{ signal: PropertyBasedTestingReadinessReport["generatorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "fast-check-arbitraries", pattern: /fc\.(integer|string|boolean|array|record|tuple|oneof|dictionary|letrec|anything)|Arbitrary/i, evidence: "fast-check arbitrary evidence was detected." },
    { signal: "hypothesis-strategies", pattern: /strategies as st|hypothesis\.strategies|st\.(integers|text|lists|dictionaries|builds|from_type|data)/i, evidence: "Hypothesis strategy evidence was detected." },
    { signal: "jqwik-arbitraries", pattern: /Arbitraries\.|@ForAll|@Provide|Arbitrary</i, evidence: "jqwik arbitrary evidence was detected." },
    { signal: "custom-generators", pattern: /fc\.letrec|@composite|st\.composite|@Provide|generator|arbitrary/i, evidence: "custom generator evidence was detected." },
    { signal: "composite-generators", pattern: /st\.composite|@composite|fc\.record|fc\.tuple|Combinators\.|flatMap|chain\(/i, evidence: "composite generator evidence was detected." },
    { signal: "filtered-generators", pattern: /\.filter\(|assume\(|Assume\.that|suchThat|withAssumptions/i, evidence: "filtered or assumption-based generator evidence was detected." },
    { signal: "recursive-generators", pattern: /fc\.letrec|recursive|memo|deferred|LazyArbitrary|st\.recursive/i, evidence: "recursive generator evidence was detected." }
  ];
  return propertyBasedTestingSignalFromSpecs(sourceFiles, specs, "generator", "signal");
}

function propertyBasedTestingRunnerSignals(sourceFiles: PropertyBasedTestingSourceFile[]): PropertyBasedTestingReadinessReport["runnerSignals"] {
  const specs: Array<{ signal: PropertyBasedTestingReadinessReport["runnerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "fc-assert", pattern: /fc\.assert|assert\(\s*fc\./i, evidence: "fc.assert evidence was detected." },
    { signal: "fc-check", pattern: /fc\.check|check\(\s*fc\./i, evidence: "fc.check evidence was detected." },
    { signal: "hypothesis-given", pattern: /@given\s*\(/i, evidence: "Hypothesis @given evidence was detected." },
    { signal: "jqwik-property", pattern: /@Property\b/i, evidence: "jqwik @Property evidence was detected." },
    { signal: "pytest", pattern: /pytest|pyproject\.toml|pytest\.ini/i, evidence: "pytest runner evidence was detected." },
    { signal: "vitest", pattern: /vitest|vi\.|describe\(|it\(|test\(/i, evidence: "Vitest runner evidence was detected." },
    { signal: "jest", pattern: /jest|@jest\/globals|describe\(|it\(|test\(/i, evidence: "Jest runner evidence was detected." },
    { signal: "junit-platform", pattern: /junit-platform|org\.junit|mvn test|gradle test/i, evidence: "JUnit Platform evidence was detected." }
  ];
  return propertyBasedTestingSignalFromSpecs(sourceFiles, specs, "runner", "signal");
}

function propertyBasedTestingReproductionSignals(sourceFiles: PropertyBasedTestingSourceFile[]): PropertyBasedTestingReadinessReport["reproductionSignals"] {
  const specs: Array<{ signal: PropertyBasedTestingReadinessReport["reproductionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "seed", pattern: /seed|--show-seed|random seed|jqwik\.seed|HYPOTHESIS_SEED/i, evidence: "seed evidence was detected." },
    { signal: "path", pattern: /path:\s*["']?[0-9:]|counterexamplePath|failure path/i, evidence: "failure path evidence was detected." },
    { signal: "replay-path", pattern: /replayPath|replay path/i, evidence: "fast-check replayPath evidence was detected." },
    { signal: "counterexample", pattern: /counterexample|RunDetails|Counterexample/i, evidence: "counterexample evidence was detected." },
    { signal: "example-database", pattern: /example database|\.hypothesis|database_file|HYPOTHESIS_STORAGE_DIRECTORY/i, evidence: "Hypothesis example database evidence was detected." },
    { signal: "falsifying-example", pattern: /Falsifying example|falsified|failure sample|failures\.runfirst/i, evidence: "falsifying example evidence was detected." },
    { signal: "shrinking", pattern: /shrink|shrinking|ShrinkingMode|smallest|minimal failing/i, evidence: "shrinking evidence was detected." }
  ];
  return propertyBasedTestingSignalFromSpecs(sourceFiles, specs, "reproduction", "signal");
}

function propertyBasedTestingStatefulSignals(sourceFiles: PropertyBasedTestingSourceFile[]): PropertyBasedTestingReadinessReport["statefulSignals"] {
  const specs: Array<{ signal: PropertyBasedTestingReadinessReport["statefulSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "model-run", pattern: /modelRun|model-based|model based/i, evidence: "model-run evidence was detected." },
    { signal: "commands", pattern: /fc\.commands|commands\(|Command<|ICommand/i, evidence: "command model evidence was detected." },
    { signal: "rule-based-state-machine", pattern: /RuleBasedStateMachine|run_state_machine_as_test|rule\(/i, evidence: "Hypothesis state machine evidence was detected." },
    { signal: "state-machine", pattern: /state machine|stateful testing|Stateful Testing|ActionSequence/i, evidence: "stateful testing evidence was detected." },
    { signal: "action-chain", pattern: /ActionChain|ActionChainArbitrary|action chain/i, evidence: "jqwik ActionChain evidence was detected." }
  ];
  return propertyBasedTestingSignalFromSpecs(sourceFiles, specs, "stateful", "signal");
}

function propertyBasedTestingCiSignals(sourceFiles: PropertyBasedTestingSourceFile[]): PropertyBasedTestingReadinessReport["ciSignals"] {
  const specs: Array<{ signal: PropertyBasedTestingReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "property-script", pattern: /property|pbt|hypothesis|fast-check|jqwik/i, evidence: "property-test script evidence was detected." },
    { signal: "num-runs", pattern: /numRuns|--numRuns|FC_NUM_RUNS/i, evidence: "fast-check numRuns evidence was detected." },
    { signal: "max-examples", pattern: /max_examples|HYPOTHESIS_PROFILE|settings\(/i, evidence: "Hypothesis max_examples evidence was detected." },
    { signal: "tries", pattern: /tries\s*=|jqwik\.tries|@PropertyDefaults/i, evidence: "jqwik tries evidence was detected." },
    { signal: "seed-policy", pattern: /seed|--show-seed|derandomize|whenFixedSeed|jqwik\.seed/i, evidence: "seed policy evidence was detected." },
    { signal: "artifact", pattern: /upload-artifact|failure artifact|counterexample artifact|test-results|reports?\//i, evidence: "failure artifact evidence was detected." }
  ];
  return propertyBasedTestingSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function propertyBasedTestingPackageSignals(sourceFiles: PropertyBasedTestingSourceFile[]): PropertyBasedTestingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PropertyBasedTestingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "fast-check", pattern: /"fast-check"|fast-check/i, evidence: "fast-check package evidence was detected." },
    { signal: "@fast-check/jest", pattern: /"@fast-check\/jest"|@fast-check\/jest/i, evidence: "@fast-check/jest package evidence was detected." },
    { signal: "hypothesis", pattern: /hypothesis/i, evidence: "Hypothesis package evidence was detected." },
    { signal: "pytest", pattern: /pytest/i, evidence: "pytest package evidence was detected." },
    { signal: "jqwik", pattern: /jqwik/i, evidence: "jqwik package evidence was detected." },
    { signal: "quickcheck", pattern: /quickcheck|QuickCheck/i, evidence: "QuickCheck package evidence was detected." },
    { signal: "proptest", pattern: /proptest/i, evidence: "proptest package evidence was detected." }
  ];
  return propertyBasedTestingSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function propertyBasedTestingSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PropertyBasedTestingSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(haystack);
    });
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/property-based-testing-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildFuzzReadinessReport(walk: WalkResult): Promise<FuzzReadinessReport> {
  const sourceFiles = await fuzzSourceFiles(walk);
  const fuzzSetups = fuzzSetupRows(sourceFiles);
  const harnessSignals = fuzzHarnessSignals(sourceFiles);
  const engineSignals = fuzzEngineSignals(sourceFiles);
  const buildSignals = fuzzBuildSignals(sourceFiles);
  const runtimeSignals = fuzzRuntimeSignals(sourceFiles);
  const sanitizerSignals = fuzzSanitizerSignals(sourceFiles);
  const ciSignals = fuzzCiSignals(sourceFiles);
  const packageSignals = fuzzPackageSignals(sourceFiles);
  const hasHarness = harnessSignals.some((item) => item.readiness === "ready")
    || fuzzSetups.some((item) => item.harnessCount > 0 || item.targetCount > 0);
  const hasEngine = engineSignals.some((item) => item.readiness === "ready")
    || fuzzSetups.some((item) => item.engineCount > 0);
  const hasSanitizer = sanitizerSignals.some((item) => item.readiness === "ready")
    || fuzzSetups.some((item) => item.sanitizerCount > 0);
  const hasRuntime = runtimeSignals.some((item) => ["seed-corpus", "dictionary", "timeout", "reproducer"].includes(item.signal) && item.readiness === "ready");
  const hasCi = ciSignals.some((item) => item.readiness === "ready")
    || fuzzSetups.some((item) => item.ciCount > 0);

  const riskQueue: FuzzReadinessReport["riskQueue"] = [];
  if (!hasHarness && hasEngine) {
    riskQueue.push({
      priority: "high",
      action: "Add a concrete fuzz target or harness before relying on fuzzing tooling.",
      why: "OSS-Fuzz, libFuzzer, AFL++, and Jazzer need an entrypoint that maps generated bytes to the code under test.",
      relatedHref: "html/fuzz-readiness.html"
    });
  }
  if (hasHarness && !hasEngine) {
    riskQueue.push({
      priority: "high",
      action: "Declare the fuzzing engine or runner used for the harness.",
      why: "Harness code alone does not prove it is wired to libFuzzer, AFL++, Jazzer, OSS-Fuzz, ClusterFuzzLite, or a language-native fuzz runner.",
      relatedHref: "html/fuzz-readiness.html"
    });
  }
  if (hasHarness && !hasSanitizer) {
    riskQueue.push({
      priority: "medium",
      action: "Add sanitizer or bug-detector configuration to the fuzz build.",
      why: "Coverage-guided fuzzing is far more useful when memory, undefined behavior, coverage, or Jazzer sanitizers are enabled.",
      relatedHref: "html/fuzz-readiness.html"
    });
  }
  if (hasHarness && !hasRuntime) {
    riskQueue.push({
      priority: "medium",
      action: "Record corpus, dictionary, timeout, run count, or reproducer policy.",
      why: "Fuzz failures are actionable only when seed material, bounds, and crash reproduction paths are clear.",
      relatedHref: "html/fuzz-readiness.html"
    });
  }
  if (hasHarness && !hasCi) {
    riskQueue.push({
      priority: "medium",
      action: "Attach fuzz smoke, CIFuzz, ClusterFuzzLite, or OSS-Fuzz evidence to CI.",
      why: "Continuous fuzzing catches regressions before fuzz harnesses drift away from the current build.",
      relatedHref: "html/fuzz-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run OSS-Fuzz, libFuzzer, AFL++, Jazzer, ClusterFuzzLite, or language fuzz commands only in an authorized environment.",
    why: "RepoTutor records static fuzz readiness only and never compiles harnesses, launches fuzzers, mutates corpora, or executes generated crash inputs.",
    relatedHref: "html/fuzz-readiness.html"
  });

  return {
    summary: `Fuzz readiness report: setup ${fuzzSetups.length}개, harness signal ${harnessSignals.filter((item) => item.readiness === "ready").length}개, engine signal ${engineSignals.filter((item) => item.readiness === "ready").length}개, runtime signal ${runtimeSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Fuzz readiness OSS-Fuzz libFuzzer AFL++ Jazzer ClusterFuzzLite fuzz targets corpus dictionary sanitizer coverage reproducer CI",
    fuzzSetups,
    harnessSignals,
    engineSignals,
    buildSignals,
    runtimeSignals,
    sanitizerSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"LLVMFuzzerTestOneInput|@FuzzTest|FuzzedDataProvider|go test -fuzz|cargo fuzz|afl-fuzz\" .", purpose: "Find fuzz harness entrypoints across native, JVM, Go, Rust, and AFL++ targets." },
      { command: "rg \"project.yaml|build.sh|Dockerfile|infra/helper.py build_fuzzers|ClusterFuzzLite|cifuzz\" .github .", purpose: "Find OSS-Fuzz, ClusterFuzzLite, and CIFuzz build or CI wiring." },
      { command: "rg -- \"-fsanitize=fuzzer|AFL_USE_ASAN|AFL_LLVM_CMPLOG|afl-clang-fast|jazzer-junit|rules_fuzzing\" .", purpose: "Find instrumentation, sanitizer, and package/tooling setup." },
      { command: "rg \"corpus|seed|dictionary|-dict|-x |timeout|max_len|max_total_time|reproducer|crash-\" .", purpose: "Find corpus, dictionary, runtime bound, and reproduction policy." }
    ],
    learnerNextSteps: [
      "Start by locating the fuzz harness entrypoint, then confirm which engine runs it.",
      "Check sanitizer coverage before treating a fuzz run as security evidence.",
      "Review corpus, dictionary, timeout, and reproducer policy so failures can be replayed.",
      "RepoTutor does not execute fuzzers; run the commands in an isolated, authorized environment before release decisions."
    ]
  };
}

type FuzzSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function fuzzSourceFiles(walk: WalkResult): Promise<FuzzSourceFile[]> {
  const files: FuzzSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !fuzzInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!fuzzPathSignal(file.relPath) && !fuzzContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function fuzzInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return fuzzPathSignal(filePath)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(fuzz|fuzzers|fuzzing|corpus|seeds|dictionaries|oss-fuzz|clusterfuzz|cifuzz|jazzer|afl)(\/|\.|-|_|$)/i.test(filePath)
    || /^(Dockerfile|build\.sh|project\.ya?ml|package\.json|pom\.xml|build\.gradle|build\.gradle\.kts|Cargo\.toml|go\.mod|WORKSPACE|BUILD|BUILD\.bazel|README\.md)$/i.test(base)
    || /\.(c|cc|cpp|cxx|h|hpp|rs|go|java|kt|scala|py|js|ts|sh|ya?ml|json|toml|xml|md|dict)$/i.test(filePath);
}

function fuzzPathSignal(filePath: string): boolean {
  return /(fuzz|fuzzer|fuzzing|oss-fuzz|clusterfuzz|cifuzz|jazzer|afl|corpus|seed|dictionary|\.dict$)/i.test(filePath);
}

function fuzzContentSignal(text: string): boolean {
  return /(LLVMFuzzerTestOneInput|@FuzzTest|FuzzedDataProvider|libFuzzer|OSS-Fuzz|ClusterFuzzLite|cifuzz|afl-fuzz|afl-clang-fast|AFL_USE_ASAN|AFL_LLVM_CMPLOG|__AFL_LOOP|__AFL_INIT|jazzer-junit|com\.code_intelligence\.jazzer|go test -fuzz|func Fuzz|cargo fuzz|-fsanitize=fuzzer|project\.yaml|build\.sh|seed corpus|generated corpus|dictionary|reproducer|crash-)/i.test(text);
}

function fuzzSetupRows(sourceFiles: FuzzSourceFile[]): FuzzReadinessReport["fuzzSetups"] {
  const rows: FuzzReadinessReport["fuzzSetups"] = [];
  for (const source of sourceFiles) {
    const targetCount = countMatches(source.text, /(LLVMFuzzerTestOneInput|@FuzzTest|func Fuzz[A-Z0-9_]|fuzz_target!|FUZZ_TARGET|fuzz target|target_class|afl-fuzz)/g);
    const harnessCount = countMatches(source.text, /(FuzzedDataProvider|LLVMFuzzerTestOneInput|@FuzzTest|fuzz target|harness|input bytes|data provider|__AFL_LOOP|__AFL_INIT)/gi);
    const engineCount = countMatches(source.text, /(libFuzzer|OSS-Fuzz|AFL\+\+|afl-fuzz|Jazzer|ClusterFuzzLite|Honggfuzz|Centipede|go test -fuzz|cargo fuzz)/g);
    const sanitizerCount = countMatches(source.text, /(sanitizer|AddressSanitizer|UndefinedBehaviorSanitizer|MemorySanitizer|LeakSanitizer|-fsanitize=fuzzer|-fsanitize=address|-fsanitize=undefined|AFL_USE_ASAN|AFL_USE_UBSAN|AFL_USE_MSAN|--asan|--ubsan)/g);
    const corpusCount = countMatches(source.text, /(corpus|seed|inputs directory|generated corpus|\.cifuzz-corpus|crash-|reproducer|testcase)/gi);
    const dictionaryCount = countMatches(source.text, /(dictionary|\.dict|-dict=|-x\s+|AFL_LLVM_DICT2FILE|tokens)/gi);
    const coverageCount = countMatches(source.text, /(coverage|Fuzz Introspector|fuzz-introspector|--coverage_report|coverage_dump|jacoco|cov:|trace=cov)/gi);
    const ciCount = countMatches(source.text, /(\.github\/workflows|GitHub Actions|cifuzz|ClusterFuzzLite|OSS-Fuzz|pull_request|schedule|upload-artifact|runs-on|infra\/helper\.py)/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = targetCount + harnessCount + engineCount + sanitizerCount + corpusCount + dictionaryCount + coverageCount + ciCount;
    if (totalSignals === 0 && !fuzzPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      ecosystem: fuzzEcosystem(source.filePath, source.text),
      targetCount,
      harnessCount,
      engineCount,
      sanitizerCount,
      corpusCount,
      dictionaryCount,
      coverageCount,
      ciCount,
      readiness: (targetCount > 0 || harnessCount > 0) && engineCount > 0 && (sanitizerCount > 0 || corpusCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains ${totalSignals} fuzz readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows.sort((a, b) => {
    const bScore = b.targetCount + b.harnessCount + b.engineCount + b.sanitizerCount + b.corpusCount + b.dictionaryCount + b.coverageCount + b.ciCount;
    const aScore = a.targetCount + a.harnessCount + a.engineCount + a.sanitizerCount + a.corpusCount + a.dictionaryCount + a.coverageCount + a.ciCount;
    return order[a.readiness] - order[b.readiness] || bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function fuzzEcosystem(filePath: string, text: string): FuzzReadinessReport["fuzzSetups"][number]["ecosystem"] {
  if (/project\.ya?ml|oss-fuzz|infra\/helper\.py|build_fuzzers/i.test(`${filePath}\n${text}`)) return "oss-fuzz";
  if (/ClusterFuzzLite|clusterfuzzlite|cifuzz/i.test(`${filePath}\n${text}`)) return "clusterfuzzlite";
  if (/AFL\+\+|afl-fuzz|afl-clang-fast|__AFL_LOOP|__AFL_INIT/i.test(text)) return "aflplusplus";
  if (/Jazzer|@FuzzTest|FuzzedDataProvider|jazzer-junit|com\.code_intelligence\.jazzer/i.test(text)) return "jazzer";
  if (/cargo fuzz|fuzz_target!|libfuzzer-sys/i.test(text)) return "cargo-fuzz";
  if (/go test -fuzz|func Fuzz[A-Z0-9_]/i.test(text)) return "go-fuzz";
  if (/libFuzzer|LLVMFuzzerTestOneInput|-fsanitize=fuzzer/i.test(text)) return "libfuzzer";
  if (/package\.json$/i.test(filePath) || /scripts?["']?\s*:/.test(text)) return "package-script";
  if (/^\.github\/workflows\//i.test(filePath)) return "workflow";
  return "unknown";
}

function fuzzHarnessSignals(sourceFiles: FuzzSourceFile[]): FuzzReadinessReport["harnessSignals"] {
  return fuzzSignalFromSpecs(sourceFiles, [
    { signal: "llvm-fuzzer-test-one-input", pattern: /LLVMFuzzerTestOneInput/i, evidence: "LLVMFuzzerTestOneInput harness evidence was detected." },
    { signal: "fuzztest-annotation", pattern: /@FuzzTest|FuzzedDataProvider/i, evidence: "Jazzer/JUnit @FuzzTest evidence was detected." },
    { signal: "jazzer-fuzztest", pattern: /com\.code_intelligence\.jazzer|jazzer-junit|Jazzer/i, evidence: "Jazzer fuzz test evidence was detected." },
    { signal: "go-fuzz", pattern: /go test -fuzz|func Fuzz[A-Z0-9_]/i, evidence: "Go fuzz target evidence was detected." },
    { signal: "cargo-fuzz-target", pattern: /cargo fuzz|fuzz_target!|libfuzzer_sys/i, evidence: "cargo-fuzz target evidence was detected." },
    { signal: "afl-target", pattern: /afl-fuzz|__AFL_LOOP|__AFL_INIT|AFL_INPUT_PLACEHOLDER/i, evidence: "AFL++ target evidence was detected." }
  ], "harness");
}

function fuzzEngineSignals(sourceFiles: FuzzSourceFile[]): FuzzReadinessReport["engineSignals"] {
  return fuzzSignalFromSpecs(sourceFiles, [
    { signal: "oss-fuzz", pattern: /OSS-Fuzz|project\.ya?ml|infra\/helper\.py build_fuzzers/i, evidence: "OSS-Fuzz evidence was detected." },
    { signal: "libfuzzer", pattern: /libFuzzer|LLVMFuzzerTestOneInput|-fsanitize=fuzzer/i, evidence: "libFuzzer evidence was detected." },
    { signal: "aflplusplus", pattern: /AFL\+\+|afl-fuzz|afl-clang-fast|AFL_LLVM/i, evidence: "AFL++ evidence was detected." },
    { signal: "jazzer", pattern: /Jazzer|jazzer-junit|com\.code_intelligence\.jazzer/i, evidence: "Jazzer evidence was detected." },
    { signal: "clusterfuzzlite", pattern: /ClusterFuzzLite|clusterfuzzlite|cifuzz/i, evidence: "ClusterFuzzLite/CIFuzz evidence was detected." },
    { signal: "honggfuzz", pattern: /Honggfuzz|honggfuzz/i, evidence: "Honggfuzz evidence was detected." },
    { signal: "centipede", pattern: /Centipede|centipede/i, evidence: "Centipede evidence was detected." }
  ], "engine");
}

function fuzzBuildSignals(sourceFiles: FuzzSourceFile[]): FuzzReadinessReport["buildSignals"] {
  return fuzzSignalFromSpecs(sourceFiles, [
    { signal: "oss-fuzz-dockerfile", pattern: /Dockerfile|gcr\.io\/oss-fuzz|base-builder/i, evidence: "OSS-Fuzz Dockerfile evidence was detected." },
    { signal: "build-sh", pattern: /build\.sh|\$OUT|\$SRC|compile fuzz/i, evidence: "OSS-Fuzz build.sh evidence was detected." },
    { signal: "project-yaml", pattern: /project\.ya?ml|language:|fuzzing_engines:|sanitizers:/i, evidence: "OSS-Fuzz project.yaml evidence was detected." },
    { signal: "compiler-wrapper", pattern: /afl-clang-fast|afl-clang-lto|afl-cc|CC=|CXX=|CFLAGS=|CXXFLAGS=/i, evidence: "compiler wrapper evidence was detected." },
    { signal: "fsanitize-fuzzer", pattern: /-fsanitize=fuzzer|-fsanitize=fuzzer-no-link|-fsanitize=address|-fsanitize=undefined/i, evidence: "fuzzer sanitizer compile flag evidence was detected." },
    { signal: "bazel-rules-fuzzing", pattern: /rules_fuzzing|fuzz_test|cc_fuzz_test|java_fuzz_test/i, evidence: "Bazel rules_fuzzing evidence was detected." },
    { signal: "maven-plugin", pattern: /jazzer-maven-plugin|jazzer-junit|maven-surefire-plugin/i, evidence: "Maven Jazzer evidence was detected." },
    { signal: "gradle-dependency", pattern: /jazzer-junit|com\.code-intelligence|gradle test|useJUnitPlatform/i, evidence: "Gradle Jazzer evidence was detected." }
  ], "build");
}

function fuzzRuntimeSignals(sourceFiles: FuzzSourceFile[]): FuzzReadinessReport["runtimeSignals"] {
  return fuzzSignalFromSpecs(sourceFiles, [
    { signal: "seed-corpus", pattern: /seed corpus|corpus\/|inputs directory|testcases?|seeds?\//i, evidence: "seed corpus evidence was detected." },
    { signal: "generated-corpus", pattern: /generated corpus|\.cifuzz-corpus|corpus generated|new coverage/i, evidence: "generated corpus evidence was detected." },
    { signal: "dictionary", pattern: /dictionary|\.dict|-dict=|-x\s+|AFL_LLVM_DICT2FILE/i, evidence: "dictionary evidence was detected." },
    { signal: "timeout", pattern: /timeout|max_total_time|-max_total_time|AFL_EXIT_ON_TIME|deadline/i, evidence: "timeout evidence was detected." },
    { signal: "max-len", pattern: /max_len|-max_len|max_len=|AFL_MAX_FILE|max length/i, evidence: "max length evidence was detected." },
    { signal: "runs", pattern: /-runs=|runs:|number_of_runs|max_examples|fuzzing mode/i, evidence: "bounded run evidence was detected." },
    { signal: "fork-jobs", pattern: /-fork=|-jobs=|parallel fuzz|worker|AFL_FINAL_SYNC/i, evidence: "fork/jobs evidence was detected." },
    { signal: "persistent-mode", pattern: /persistent mode|__AFL_LOOP|__AFL_INIT|AFL_PERSISTENT|deferred forkserver/i, evidence: "persistent mode evidence was detected." },
    { signal: "reproducer", pattern: /reproducer|crash-|Crash-.*\.java|artifact_prefix|regression mode|reproduce/i, evidence: "reproducer evidence was detected." }
  ], "runtime");
}

function fuzzSanitizerSignals(sourceFiles: FuzzSourceFile[]): FuzzReadinessReport["sanitizerSignals"] {
  return fuzzSignalFromSpecs(sourceFiles, [
    { signal: "address", pattern: /AddressSanitizer|ASAN|AFL_USE_ASAN|-fsanitize=address|--asan/i, evidence: "AddressSanitizer evidence was detected." },
    { signal: "undefined", pattern: /UndefinedBehaviorSanitizer|UBSAN|AFL_USE_UBSAN|-fsanitize=undefined|--ubsan/i, evidence: "UndefinedBehaviorSanitizer evidence was detected." },
    { signal: "memory", pattern: /MemorySanitizer|MSAN|AFL_USE_MSAN|-fsanitize=memory/i, evidence: "MemorySanitizer evidence was detected." },
    { signal: "coverage", pattern: /coverage|--coverage_report|coverage_dump|Fuzz Introspector|fuzz-introspector|trace=cov/i, evidence: "coverage sanitizer/report evidence was detected." },
    { signal: "asan", pattern: /ASAN|AFL_USE_ASAN|--asan/i, evidence: "ASAN runtime evidence was detected." },
    { signal: "ubsan", pattern: /UBSAN|AFL_USE_UBSAN|--ubsan/i, evidence: "UBSAN runtime evidence was detected." },
    { signal: "msan", pattern: /MSAN|AFL_USE_MSAN|Memory Sanitizer/i, evidence: "MSAN runtime evidence was detected." },
    { signal: "jazzer-sanitizers", pattern: /Jazzer sanitizers|BugDetectorsAPI|disabled_hooks|Server-Side Request Forgery|File Path Traversal/i, evidence: "Jazzer sanitizer evidence was detected." }
  ], "sanitizer");
}

function fuzzCiSignals(sourceFiles: FuzzSourceFile[]): FuzzReadinessReport["ciSignals"] {
  return fuzzSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|actions\/checkout|runs-on|GitHub Actions/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "cifuzz", pattern: /cifuzz|CIFuzz/i, evidence: "CIFuzz evidence was detected." },
    { signal: "oss-fuzz", pattern: /OSS-Fuzz|infra\/helper\.py build_fuzzers|project\.ya?ml/i, evidence: "OSS-Fuzz CI evidence was detected." },
    { signal: "clusterfuzzlite", pattern: /ClusterFuzzLite|clusterfuzzlite/i, evidence: "ClusterFuzzLite evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact|crash|reproducer|corpus/i, evidence: "artifact upload evidence was detected." },
    { signal: "coverage-report", pattern: /coverage report|coverage_report|fuzz-introspector|jacoco|code coverage/i, evidence: "coverage report evidence was detected." }
  ], "CI");
}

function fuzzPackageSignals(sourceFiles: FuzzSourceFile[]): FuzzReadinessReport["packageSignals"] {
  return fuzzSignalFromSpecs(sourceFiles, [
    { signal: "libfuzzer", pattern: /libFuzzer|libfuzzer-sys|-fsanitize=fuzzer/i, evidence: "libFuzzer package/tool evidence was detected." },
    { signal: "aflplusplus", pattern: /AFL\+\+|aflplusplus|afl-fuzz|afl-clang-fast/i, evidence: "AFL++ package/tool evidence was detected." },
    { signal: "jazzer-junit", pattern: /jazzer-junit|com\.code-intelligence.*jazzer-junit/i, evidence: "jazzer-junit package evidence was detected." },
    { signal: "jazzer-maven-plugin", pattern: /jazzer-maven-plugin/i, evidence: "Jazzer Maven plugin evidence was detected." },
    { signal: "rules-fuzzing", pattern: /rules_fuzzing|cc_fuzz_test|java_fuzz_test/i, evidence: "Bazel rules_fuzzing evidence was detected." },
    { signal: "cargo-fuzz", pattern: /cargo-fuzz|cargo fuzz|libfuzzer-sys/i, evidence: "cargo-fuzz evidence was detected." },
    { signal: "go-test-fuzz", pattern: /go test -fuzz|func Fuzz[A-Z0-9_]/i, evidence: "Go native fuzz evidence was detected." }
  ], "package");
}

function fuzzSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: FuzzSourceFile[],
  specs: T,
  label: string
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/fuzz-readiness.html"
    };
  });
}

export async function buildTestDataReadinessReport(walk: WalkResult): Promise<TestDataReadinessReport> {
  const sourceFiles = await testDataReadinessSourceFiles(walk);
  const dataSetups = testDataReadinessSetupRows(sourceFiles);
  const factorySignals = testDataReadinessFactorySignals(sourceFiles);
  const relationshipSignals = testDataReadinessRelationshipSignals(sourceFiles);
  const generationSignals = testDataReadinessGenerationSignals(sourceFiles);
  const reproducibilitySignals = testDataReadinessReproducibilitySignals(sourceFiles);
  const lifecycleSignals = testDataReadinessLifecycleSignals(sourceFiles);
  const ciSignals = testDataReadinessCiSignals(sourceFiles);
  const packageSignals = testDataReadinessPackageSignals(sourceFiles);
  const hasFactory = dataSetups.some((item) => item.factoryCount > 0 || item.readiness === "ready");
  const hasGeneration = generationSignals.some((item) => item.readiness === "ready");
  const hasReproducibility = reproducibilitySignals.some((item) => item.readiness === "ready");
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready");
  const hasCi = ciSignals.some((item) => ["github-actions", "factory-lint", "seed-script"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: TestDataReadinessReport["riskQueue"] = [];
  if (!hasFactory && !hasGeneration) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a factory, fixture, seed, or deterministic data builder before relying on synthetic test data.",
      why: "Factory Bot, factory_boy, and Faker-style setups need a visible source of generated examples.",
      relatedHref: "html/test-data-readiness.html"
    });
  }
  if (hasFactory && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Record whether factories build in memory, persist rows, expose attributes, or load fixtures.",
      why: "A factory definition alone does not explain whether tests touch the database or only construct objects.",
      relatedHref: "html/test-data-readiness.html"
    });
  }
  if ((hasFactory || hasGeneration) && !hasReproducibility) {
    riskQueue.push({
      priority: "high",
      action: "Add deterministic seed, sequence reset, factory lint, or fixture stability policy.",
      why: "Randomized or sequenced test data can hide flaky failures unless replay and validation signals are visible.",
      relatedHref: "html/test-data-readiness.html"
    });
  }
  if ((hasFactory || hasGeneration) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Wire factory lint, seed loading, or fixture checks into CI.",
      why: "Test data contracts drift when factory validity is only checked manually.",
      relatedHref: "html/test-data-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original project tests or factory lint command before treating this as operational test data evidence.",
    why: "RepoTutor records static readiness only; it does not create records, reset databases, seed Faker, or validate factories at runtime.",
    relatedHref: "html/test-data-readiness.html"
  });

  return {
    summary: `Test data readiness report: setup ${dataSetups.length}개, factory signal ${factorySignals.filter((item) => item.readiness === "ready").length}개, generation signal ${generationSignals.filter((item) => item.readiness === "ready").length}개, reproducibility signal ${reproducibilitySignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Test data Factory Bot factory_boy Faker factories traits associations sequences seeds fixtures deterministic lint CI",
    dataSetups,
    factorySignals,
    relationshipSignals,
    generationSignals,
    reproducibilitySignals,
    lifecycleSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "bundle exec rails runner 'FactoryBot.lint'", purpose: "Validate Ruby Factory Bot definitions in a trusted Rails app." },
      { command: "pytest -q tests/factories.py tests --maxfail=1", purpose: "Run Python factory_boy fixtures and dependent tests in a trusted checkout." },
      { command: "node -e \"const { faker } = require('@faker-js/faker'); faker.seed(123); console.log(faker.person.firstName())\"", purpose: "Smoke-check deterministic Faker seeding in a trusted JavaScript project." },
      { command: "rg \"FactoryBot\\.define|factory\\.Factory|@faker-js/faker|faker\\.seed|FactoryBot\\.lint|factory_boy\" .", purpose: "Locate static factory, Faker, seed, and lint evidence." }
    ],
    learnerNextSteps: [
      "factory definition, trait, association, sequence가 같은 테스트 데이터 경계 안에 있는지 먼저 확인하세요.",
      "build/create/attributes_for/build_stubbed/create_batch 같은 lifecycle 신호로 DB write 여부를 분리하세요.",
      "Faker seed, sequence reset, fixed reference date, deterministic fixture path가 있는지 확인하세요.",
      "FactoryBot.lint, pytest factory smoke, seed script, database reset 같은 CI 검증은 원본 프로젝트에서 직접 실행해야 합니다."
    ]
  };
}

type TestDataReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function testDataReadinessSourceFiles(walk: WalkResult): Promise<TestDataReadinessSourceFile[]> {
  const files: TestDataReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !testDataReadinessInspectablePath(file.relPath)) continue;
    const pathCandidate = testDataReadinessPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!pathCandidate && !testDataReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 180) break;
  }
  return files;
}

function testDataReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|Gemfile|Gemfile\.lock|pyproject\.toml|requirements.*\.txt|setup\.cfg|tox\.ini|pytest\.ini|README\.md|seeds\.rb|database\.ya?ml)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(spec\/factories|test\/factories|tests?\/factories|factories|fixtures?|seeds?|testdata|test-data|support|conftest)(\/|\.|$)/i.test(filePath)
    || /\.(rb|py|js|ts|jsx|tsx|ya?ml|json|toml|md)$/i.test(filePath);
}

function testDataReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(factories|factory|fixtures?|seeds?|testdata|test-data|factory_bot|factory_boy|faker)(\/|\.|-|_|$)/i.test(filePath);
}

function testDataReadinessContentSignal(text: string): boolean {
  return /(FactoryBot\.define|factory_bot|factory_bot_rails|factory_boy|factory\.Factory|factory\.django\.DjangoModelFactory|factory\.alchemy\.SQLAlchemyModelFactory|SubFactory|RelatedFactory|LazyAttribute|factory\.Sequence|@faker-js\/faker|faker\.seed|setDefaultRefDate|FactoryBot\.lint|create_list|build_stubbed|attributes_for|sequence\(|trait\s*:|association\s*:|db:seed|seed\.rb|fixtures?)/i.test(text);
}

function testDataReadinessSetupRows(sourceFiles: TestDataReadinessSourceFile[]): TestDataReadinessReport["dataSetups"] {
  const rows: TestDataReadinessReport["dataSetups"] = [];
  for (const source of sourceFiles) {
    const factoryCount = countMatches(source.text, /FactoryBot\.define|factory\s*:|class\s+\w+Factory\(|class\s+\w+Factory\b|factory\.Factory|DjangoModelFactory|SQLAlchemyModelFactory|FactoryBot\.(build|create|attributes_for|build_stubbed)|\b(factory|Factory)\(/g);
    const traitCount = countMatches(source.text, /trait\s*:|trait\s*\(|traits_for_enum|class\s+Params\b|factory\.Trait|Trait\(/g);
    const associationCount = countMatches(source.text, /association\s*:|association\s*\(|SubFactory|RelatedFactory|RelatedFactoryList|has_many|belongs_to|foreign_key|factory:\s*:|\w+__\w+/g);
    const sequenceCount = countMatches(source.text, /sequence\s*:|sequence\s*\(|factory\.Sequence|LazyAttributeSequence|reset_sequence|rewind_sequences|generate_list/g);
    const fakerCount = countMatches(source.text, /@faker-js\/faker|from ['"]@faker-js\/faker|require\(['"]@faker-js\/faker|faker\.|Faker\(|factory\.Faker|Fuzzy(Text|Choice|Integer|Decimal|Float|Date|DateTime)/g);
    const overrideCount = countMatches(source.text, /transient|overrides?|attributes_for|initialize_with|to_create|skip_create|Params\b|post_generation|after\(:|before\(:|callback/g);
    const persistenceCount = countMatches(source.text, /create_list|create_batch|FactoryBot\.create|\.create\(|build_stubbed|attributes_for|db:seed|seed\.rb|fixture_file_upload|fixtures\s*:/g);
    const seedCount = countMatches(source.text, /faker\.seed|seed\s*\(|setDefaultRefDate|generateMersenne32Randomizer|rewind_sequences|reset_sequence|factory\.random|reseed_random|random\.reseed|db:seed|seed\.rb/gi);
    const lintCount = countMatches(source.text, /FactoryBot\.lint|factory lint|lint factories|factory_lint|linting factories/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|GitHub Actions|pull_request|CI\s*[:=]|runs-on|matrix|bundle exec|pytest|rails db:seed|FactoryBot\.lint|npm test|pnpm test/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = factoryCount + traitCount + associationCount + sequenceCount + fakerCount + overrideCount + persistenceCount + seedCount + lintCount + ciCount;
    if (totalSignals === 0 && !testDataReadinessPathSignal(source.filePath)) continue;
    const readiness = factoryCount > 0 && (sequenceCount > 0 || fakerCount > 0) && (seedCount > 0 || lintCount > 0)
      ? "ready"
      : totalSignals > 0
        ? "partial"
        : "missing";
    rows.push({
      filePath: source.filePath,
      ecosystem: testDataReadinessEcosystem(source.filePath, source.text),
      factoryCount,
      traitCount,
      associationCount,
      sequenceCount,
      fakerCount,
      overrideCount,
      persistenceCount,
      seedCount,
      lintCount,
      ciCount,
      readiness,
      evidence: `${source.filePath} contains ${totalSignals} test data readiness signal(s).`,
      sourceHref: source.sourceHref
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return rows.sort((a, b) => order[a.readiness] - order[b.readiness] || a.filePath.localeCompare(b.filePath)).slice(0, 90);
}

function testDataReadinessEcosystem(filePath: string, text: string): TestDataReadinessReport["dataSetups"][number]["ecosystem"] {
  if (/FactoryBot|factory_bot|factory_bot_rails|spec\/factories/i.test(text) || /spec\/factories|factory_bot/i.test(filePath)) return "factory-bot";
  if (/factory_boy|factory\.Factory|DjangoModelFactory|SQLAlchemyModelFactory|SubFactory/i.test(text) || /factory_boy|factories\.py/i.test(filePath)) return "factory-boy";
  if (/@faker-js\/faker|from ['"]@faker-js\/faker|require\(['"]@faker-js\/faker|faker\.seed|setDefaultRefDate/i.test(text)) return "faker-js";
  if (/factory\.Faker|from faker import Faker|Faker\(/i.test(text)) return "faker-python";
  if (/seed\.rb|db:seed|seeds?\//i.test(text) || /seeds?\//i.test(filePath)) return "seeds";
  if (/fixtures?\//i.test(filePath) || /fixtures?/i.test(text)) return "fixtures";
  return testDataReadinessContentSignal(text) ? "custom" : "unknown";
}

function testDataReadinessFactorySignals(sourceFiles: TestDataReadinessSourceFile[]): TestDataReadinessReport["factorySignals"] {
  const specs: Array<{ signal: TestDataReadinessReport["factorySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "factory-bot-define", pattern: /FactoryBot\.define|factory\s*:/i, evidence: "Factory Bot definition evidence was detected." },
    { signal: "factory-boy-class", pattern: /class\s+\w+Factory\b|factory\.Factory|DjangoModelFactory|SQLAlchemyModelFactory/i, evidence: "factory_boy factory class evidence was detected." },
    { signal: "factory-girl", pattern: /factory_girl|FactoryGirl/i, evidence: "legacy factory_girl evidence was detected." },
    { signal: "fixture-files", pattern: /(^|\/)fixtures?\//i, evidence: "fixture file evidence was detected." },
    { signal: "seed-scripts", pattern: /seed\.rb|db:seed|seed-data|seed script/i, evidence: "seed script evidence was detected." },
    { signal: "custom-builders", pattern: /build[A-Z]\w*Fixture|make[A-Z]\w*Fixture|create[A-Z]\w*Fixture|testDataBuilder|mother object|ObjectMother/i, evidence: "custom test data builder evidence was detected." }
  ];
  return testDataReadinessSignalFromSpecs(sourceFiles, specs, "factory", "signal");
}

function testDataReadinessRelationshipSignals(sourceFiles: TestDataReadinessSourceFile[]): TestDataReadinessReport["relationshipSignals"] {
  const specs: Array<{ signal: TestDataReadinessReport["relationshipSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "traits", pattern: /trait\s*:|trait\s*\(|factory\.Trait|traits_for_enum|class\s+Params\b/i, evidence: "trait evidence was detected." },
    { signal: "associations", pattern: /association\s*:|association\s*\(|belongs_to|has_many|factory:\s*:|foreign_key/i, evidence: "association evidence was detected." },
    { signal: "subfactory", pattern: /SubFactory|RelatedFactory|RelatedFactoryList|\w+__\w+/i, evidence: "factory_boy nested factory evidence was detected." },
    { signal: "transient", pattern: /transient|TransientAttribute|class\s+Params\b/i, evidence: "transient parameter evidence was detected." },
    { signal: "post-generation", pattern: /post_generation|after\(:create\)|after\(:build\)|after\(:stub\)|before\(:create\)/i, evidence: "post-generation/callback evidence was detected." },
    { signal: "callbacks", pattern: /callback|after\(:|before\(:|skip_callback|to_create|initialize_with/i, evidence: "factory callback evidence was detected." }
  ];
  return testDataReadinessSignalFromSpecs(sourceFiles, specs, "relationship", "signal");
}

function testDataReadinessGenerationSignals(sourceFiles: TestDataReadinessSourceFile[]): TestDataReadinessReport["generationSignals"] {
  const specs: Array<{ signal: TestDataReadinessReport["generationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sequence", pattern: /sequence\s*:|sequence\s*\(|factory\.Sequence|LazyAttributeSequence|generate_list/i, evidence: "sequence evidence was detected." },
    { signal: "lazy-attribute", pattern: /LazyAttribute|lazy_attribute|factory\.lazy_attribute|lazy_fixture/i, evidence: "lazy attribute evidence was detected." },
    { signal: "faker-js", pattern: /@faker-js\/faker|from ['"]@faker-js\/faker|faker\.(person|internet|number|date|helpers|seed)/i, evidence: "Faker JS evidence was detected." },
    { signal: "faker-python", pattern: /factory\.Faker|from faker import Faker|Faker\(/i, evidence: "Python Faker evidence was detected." },
    { signal: "fuzzy", pattern: /factory\.fuzzy|Fuzzy(Text|Choice|Integer|Decimal|Float|Date|DateTime)/i, evidence: "factory_boy fuzzy generator evidence was detected." },
    { signal: "locale", pattern: /locale|faker[A-Z]{2}|new Faker\(|faker\.(setLocale|locale)|en_US|ko_KR/i, evidence: "locale-specific faker evidence was detected." },
    { signal: "unique", pattern: /unique|uniqueness|sequence.*email|generate_unique|faker\.helpers\.unique|faker\.internet\.email/i, evidence: "unique value generation evidence was detected." }
  ];
  return testDataReadinessSignalFromSpecs(sourceFiles, specs, "generation", "signal");
}

function testDataReadinessReproducibilitySignals(sourceFiles: TestDataReadinessSourceFile[]): TestDataReadinessReport["reproducibilitySignals"] {
  const specs: Array<{ signal: TestDataReadinessReport["reproducibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "faker-seed", pattern: /faker\.seed|Faker\.seed|seed_instance|reseed_random|factory\.random|random\.reseed/i, evidence: "faker seed evidence was detected." },
    { signal: "sequence-reset", pattern: /rewind_sequences|reset_sequence|sequence reset|FactoryBot\.rewind_sequences/i, evidence: "sequence reset evidence was detected." },
    { signal: "factory-lint", pattern: /FactoryBot\.lint|lint factories|factory lint|factory_lint/i, evidence: "factory lint evidence was detected." },
    { signal: "fixed-ref-date", pattern: /setDefaultRefDate|defaultRefDate|freeze_time|travel_to|timecop/i, evidence: "fixed reference date evidence was detected." },
    { signal: "deterministic-fixtures", pattern: /fixtures?\/|fixture_file_upload|snapshot fixture|golden|testdata/i, evidence: "deterministic fixture evidence was detected." },
    { signal: "database-cleaner", pattern: /database_cleaner|DatabaseCleaner|transactional_fixtures|use_transactional_tests|truncate/i, evidence: "database cleaner/reset evidence was detected." }
  ];
  return testDataReadinessSignalFromSpecs(sourceFiles, specs, "reproducibility", "signal");
}

function testDataReadinessLifecycleSignals(sourceFiles: TestDataReadinessSourceFile[]): TestDataReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: TestDataReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "build", pattern: /FactoryBot\.build|\bbuild\(:|\w+Factory\.build\(|\.build\(/i, evidence: "build lifecycle evidence was detected." },
    { signal: "create", pattern: /FactoryBot\.create|\bcreate\(:|\w+Factory\.create\(|\.create\(/i, evidence: "create lifecycle evidence was detected." },
    { signal: "attributes-for", pattern: /attributes_for|FactoryBot\.attributes_for/i, evidence: "attributes_for lifecycle evidence was detected." },
    { signal: "build-stubbed", pattern: /build_stubbed|FactoryBot\.build_stubbed/i, evidence: "build_stubbed evidence was detected." },
    { signal: "build-batch", pattern: /build_list|build_pair|build_batch/i, evidence: "batch build evidence was detected." },
    { signal: "create-batch", pattern: /create_list|create_pair|create_batch/i, evidence: "batch create evidence was detected." },
    { signal: "fixture-load", pattern: /(^|\/)fixtures?\/|fixtures\s*:|load_fixture|fixture_file_upload|pytest\.fixture|@pytest\.fixture/i, evidence: "fixture loading evidence was detected." },
    { signal: "db-seed", pattern: /db:seed|rails db:seed|prisma db seed|seed\.rb|seed script/i, evidence: "database seed lifecycle evidence was detected." }
  ];
  return testDataReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function testDataReadinessCiSignals(sourceFiles: TestDataReadinessSourceFile[]): TestDataReadinessReport["ciSignals"] {
  const specs: Array<{ signal: TestDataReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /^\.github\/workflows\/|GitHub Actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "factory-lint", pattern: /FactoryBot\.lint|factory lint|lint factories/i, evidence: "CI factory lint evidence was detected." },
    { signal: "seed-script", pattern: /db:seed|rails db:seed|prisma db seed|seed script|seed\.rb/i, evidence: "CI seed script evidence was detected." },
    { signal: "test-data-artifact", pattern: /upload-artifact|fixtures artifact|seed artifact|testdata artifact|factory report/i, evidence: "test data artifact evidence was detected." },
    { signal: "database-reset", pattern: /database_cleaner|db:test:prepare|db:reset|migrate|truncate|transactional/i, evidence: "database reset evidence was detected." },
    { signal: "parallel-workers", pattern: /parallel_tests|knapsack|matrix|worker|pytest-xdist|CI_NODE_INDEX/i, evidence: "parallel worker test data evidence was detected." }
  ];
  return testDataReadinessSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function testDataReadinessPackageSignals(sourceFiles: TestDataReadinessSourceFile[]): TestDataReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TestDataReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "factory_bot", pattern: /factory_bot\b/i, evidence: "factory_bot package evidence was detected." },
    { signal: "factory_bot_rails", pattern: /factory_bot_rails\b/i, evidence: "factory_bot_rails package evidence was detected." },
    { signal: "factory_boy", pattern: /factory_boy\b/i, evidence: "factory_boy package evidence was detected." },
    { signal: "faker", pattern: /(^|[^@-])faker\b|Faker\(/i, evidence: "Faker package evidence was detected." },
    { signal: "@faker-js/faker", pattern: /@faker-js\/faker/i, evidence: "@faker-js/faker package evidence was detected." },
    { signal: "database_cleaner", pattern: /database_cleaner|DatabaseCleaner/i, evidence: "database_cleaner package evidence was detected." }
  ];
  return testDataReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function testDataReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TestDataReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(haystack);
    });
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/test-data-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildIntegrationTestEnvironmentReadinessReport(
  walk: WalkResult,
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): Promise<IntegrationTestEnvironmentReadinessReport> {
  const sourceFiles = await integrationTestEnvironmentReadinessSourceFiles(walk);
  const integrationSetups = integrationTestEnvironmentReadinessSetups(sourceFiles);
  const containerSignals = integrationTestEnvironmentReadinessContainerSignals(sourceFiles);
  const waitSignals = integrationTestEnvironmentReadinessWaitSignals(sourceFiles);
  const lifecycleSignals = integrationTestEnvironmentReadinessLifecycleSignals(sourceFiles);
  const runtimeSignals = integrationTestEnvironmentReadinessRuntimeSignals(sourceFiles, runtimeEnvironmentReport);
  const packageSignals = integrationTestEnvironmentReadinessPackageSignals(sourceFiles);
  const hasPackage = packageSignals.some((item) => ["testcontainers", "@testcontainers/*", "testcontainers-python"].includes(item.signal) && item.readiness === "ready");
  const hasSetup = integrationSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = integrationSetups.some((item) => item.readiness === "ready");
  const hasContainer = containerSignals.some((item) => ["generic-container", "docker-container", "specialized-module", "docker-compose"].includes(item.signal) && item.readiness === "ready");
  const hasWait = waitSignals.some((item) => item.readiness === "ready");
  const hasLifecycle = lifecycleSignals.some((item) => ["stop", "context-manager", "after-all", "global-setup", "resource-reaper", "ryuk"].includes(item.signal) && item.readiness === "ready");
  const hasRuntime = runtimeSignals.some((item) => ["docker-host", "podman", "compose-binary", "ci-service", "socket"].includes(item.signal) && item.readiness !== "missing");

  const riskQueue: IntegrationTestEnvironmentReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasContainer) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the integration-test environment strategy before claiming service-level test coverage.",
      why: "Testcontainers-style readiness starts with a package, container fixture, compose environment, or equivalent local service harness.",
      relatedHref: "html/integration-test-environment-readiness.html"
    });
  }
  if (hasPackage && !hasContainer) {
    riskQueue.push({
      priority: "high",
      action: "Pair Testcontainers packages with concrete container or module fixtures.",
      why: "A dependency alone does not show which database, broker, object store, or emulator is provisioned for tests.",
      relatedHref: "html/integration-test-environment-readiness.html"
    });
  }
  if (hasSetup && !hasReadySetup) {
    riskQueue.push({
      priority: "medium",
      action: "Connect container startup, readiness waiting, and teardown in the same fixture boundary.",
      why: "Integration environments are reproducible only when startup, wait strategy, and cleanup are visible together.",
      relatedHref: "html/integration-test-environment-readiness.html"
    });
  }
  if (hasContainer && !hasWait) {
    riskQueue.push({
      priority: "high",
      action: "Add wait strategies for ports, logs, health checks, HTTP endpoints, or ready commands.",
      why: "Tests that start immediately after container creation can race service boot and produce flaky failures.",
      relatedHref: "html/integration-test-environment-readiness.html"
    });
  }
  if (hasContainer && !hasLifecycle) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit cleanup through stop(), context managers, afterAll/finally, or a verified resource reaper.",
      why: "Containerized integration tests can leak ports, volumes, networks, and processes without teardown evidence.",
      relatedHref: "html/integration-test-environment-readiness.html"
    });
  }
  if (hasContainer && !hasRuntime) {
    riskQueue.push({
      priority: "medium",
      action: "Document Docker/Podman host requirements and CI service availability.",
      why: "Testcontainers requires a compatible container runtime; CI and local machines need the same assumption recorded.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run integration tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not start Docker, Podman, Docker Compose, Testcontainers, service modules, resource reapers, or the analyzed project's tests.",
    relatedHref: "html/integration-test-environment-readiness.html"
  });

  return {
    summary: `Testcontainers식 integration test environment readiness report: setup ${integrationSetups.length}개, container signal ${containerSignals.length}개, wait signal ${waitSignals.length}개, lifecycle signal ${lifecycleSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Testcontainers GenericContainer DockerContainer DockerComposeEnvironment DockerCompose wait strategies exposed ports env lifecycle stop Ryuk resource reaper pytest beforeAll afterAll",
    integrationSetups,
    containerSignals,
    waitSignals,
    lifecycleSignals,
    runtimeSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"testcontainers|GenericContainer|DockerContainer|DockerComposeEnvironment|DockerCompose\" tests src packages", purpose: "Inventory Testcontainers fixtures, generic containers, compose environments, and service modules." },
      { command: "rg \"withWaitStrategy|Wait\\.for|wait_for_logs|wait_for_http|wait_container_is_ready|withStartupTimeout\" tests src packages", purpose: "Review readiness waits for ports, logs, HTTP endpoints, health checks, and startup timeout controls." },
      { command: "rg \"\\.start\\(|\\.stop\\(|beforeAll|afterAll|pytest.fixture|yield|Ryuk|resource reaper|reuse\" tests src packages", purpose: "Trace startup/teardown lifecycle boundaries and cleanup assumptions." },
      { command: "rg \"DOCKER_HOST|TESTCONTAINERS_|RYUK|podman|docker compose|docker.sock\" .", purpose: "Check container-runtime, CI, resource reaper, and socket configuration." },
      { command: "npm test -- --runInBand", purpose: "Run local integration tests serially after confirming the workspace may start containers." }
    ],
    learnerNextSteps: [
      "먼저 testcontainers package/import와 실제 GenericContainer 또는 DockerContainer fixture가 같은 테스트 경계에 있는지 확인하세요.",
      "withWaitStrategy, Wait.for*, wait_for_logs, wait_for_http 같은 ready wait가 없으면 서비스 부팅 race 가능성이 큽니다.",
      "start와 stop, afterAll/finally, Python context manager/yield fixture, Ryuk/resource reaper 신호를 함께 보세요.",
      "Docker Desktop, Podman, docker.sock, TESTCONTAINERS_* 환경변수, CI service 설정이 문서화되어 있는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 컨테이너 기동과 테스트 pass/fail은 원본 프로젝트의 안전한 개발/CI 환경에서 별도로 확인하세요."
    ]
  };
}

type IntegrationTestEnvironmentReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function integrationTestEnvironmentReadinessSourceFiles(walk: WalkResult): Promise<IntegrationTestEnvironmentReadinessSourceFile[]> {
  const files: IntegrationTestEnvironmentReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !integrationTestEnvironmentReadinessInspectablePath(file.relPath)) continue;
    const pathCandidate = integrationTestEnvironmentReadinessPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!pathCandidate && !integrationTestEnvironmentReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function integrationTestEnvironmentReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements.*\.txt|poetry\.lock|pnpm-lock\.yaml|package-lock\.json|yarn\.lock|docker-compose\.ya?ml|compose\.ya?ml|testcontainers\.properties)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(ts|tsx|js|jsx|mjs|cjs|py|java|go|json|toml|ya?ml|md|sh)$/i.test(filePath);
}

function integrationTestEnvironmentReadinessPathSignal(filePath: string): boolean {
  return /(testcontainers?|integration[-_ ]?tests?|itest|e2e|fixtures?|docker[-_ ]?compose|compose\.ya?ml|containers?|postgres|mysql|redis|kafka|rabbitmq|localstack|toxiproxy|podman|ryuk)/i.test(filePath);
}

function integrationTestEnvironmentReadinessContentSignal(text: string): boolean {
  return /\b(testcontainers|@testcontainers|GenericContainer|DockerContainer|DockerComposeEnvironment|DockerCompose|StartedTestContainer|Wait\.for|withWaitStrategy|withExposedPorts|withEnvironment|withBindMounts|withNetwork|wait_for_logs|wait_for_http|wait_container_is_ready|pytest\.fixture|beforeAll|afterAll|Ryuk|resource reaper|TESTCONTAINERS_|DOCKER_HOST|docker\.sock|toxiproxy|podman)\b/i.test(text);
}

function integrationTestEnvironmentReadinessSetups(sourceFiles: IntegrationTestEnvironmentReadinessSourceFile[]): IntegrationTestEnvironmentReadinessReport["integrationSetups"] {
  const rows: IntegrationTestEnvironmentReadinessReport["integrationSetups"] = [];
  for (const source of sourceFiles) {
    const containerCount = countMatches(source.text, /\b(new\s+)?(GenericContainer|DockerContainer|DockerComposeEnvironment|DockerCompose|StartedTestContainer|[A-Z][A-Za-z0-9]*(Container|Module))\b/gi);
    const moduleCount = countMatches(source.text, /@testcontainers\/[a-z0-9-]+|from\s+testcontainers\.[a-z0-9_]+\s+import|new\s+[A-Z][A-Za-z0-9]+Container\s*\(/gi);
    const hasWaitStrategy = /\b(withWaitStrategy|Wait\.for|withStartupTimeout|wait_for_logs|wait_for_http|wait_container_is_ready|waiting_for|wait_for)\b/i.test(source.text);
    const hasLifecycleCleanup = /\b\.stop\s*\(|afterAll\s*\(|afterEach\s*\(|finally\b|with\s+(GenericContainer|DockerContainer)|yield\s+\w+|Ryuk|resource reaper|ResourceReaper|testcontainers.reuse.enable\b/i.test(source.text);
    const hasSetupSignal = containerCount + moduleCount > 0 || /testcontainers|docker compose|pytest\.fixture|beforeAll|afterAll/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      ecosystem: integrationTestEnvironmentReadinessEcosystem(source),
      containerCount,
      moduleCount,
      hasWaitStrategy,
      hasLifecycleCleanup,
      readiness: containerCount > 0 && hasWaitStrategy && hasLifecycleCleanup ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains containers ${containerCount}, modules ${moduleCount}, wait strategy ${hasWaitStrategy ? "yes" : "no"}, cleanup ${hasLifecycleCleanup ? "yes" : "no"}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function integrationTestEnvironmentReadinessEcosystem(source: IntegrationTestEnvironmentReadinessSourceFile): IntegrationTestEnvironmentReadinessReport["integrationSetups"][number]["ecosystem"] {
  if (/testcontainers\/|@testcontainers|GenericContainer|DockerComposeEnvironment|StartedTestContainer|\.ts\b|\.js\b/i.test(`${source.filePath}\n${source.text}`)) return "testcontainers-node";
  if (/testcontainers\.core|testcontainers\.[a-z0-9_]+|DockerContainer|pytest|\.py\b/i.test(`${source.filePath}\n${source.text}`)) return "testcontainers-python";
  if (/org\.testcontainers|Testcontainers|\.java\b/i.test(`${source.filePath}\n${source.text}`)) return "java";
  if (/testcontainers-go|\.go\b/i.test(`${source.filePath}\n${source.text}`)) return "go";
  if (/docker-compose|compose\.ya?ml|DockerCompose/i.test(`${source.filePath}\n${source.text}`)) return "compose";
  if (/container|integration/i.test(`${source.filePath}\n${source.text}`)) return "custom";
  return "unknown";
}

function integrationTestEnvironmentReadinessContainerSignals(sourceFiles: IntegrationTestEnvironmentReadinessSourceFile[]): IntegrationTestEnvironmentReadinessReport["containerSignals"] {
  const specs: Array<{ signal: IntegrationTestEnvironmentReadinessReport["containerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "generic-container", pattern: /\bGenericContainer\b|new\s+GenericContainer\s*\(/i, evidence: "GenericContainer evidence was detected." },
    { signal: "docker-container", pattern: /\bDockerContainer\b|with\s+DockerContainer\s*\(/i, evidence: "Python DockerContainer evidence was detected." },
    { signal: "specialized-module", pattern: /@testcontainers\/[a-z0-9-]+|from\s+testcontainers\.[a-z0-9_]+\s+import\s+\w+Container|new\s+(PostgreSql|Redis|Kafka|RabbitMQ|LocalStack|Mongo|MySql|Minio|Vault|Elasticsearch)\w*Container\s*\(/i, evidence: "specialized service module evidence was detected." },
    { signal: "docker-compose", pattern: /\bDockerComposeEnvironment\b|\bDockerCompose\b|docker-compose\.ya?ml|compose\.ya?ml/i, evidence: "Docker Compose environment evidence was detected." },
    { signal: "exposed-ports", pattern: /\bwithExposedPorts\b|\bwith_exposed_ports\b|ports\s*:|exposed_ports/i, evidence: "exposed port mapping evidence was detected." },
    { signal: "env-vars", pattern: /\bwithEnvironment\b|\bwithEnv\b|\bwith_env\b|environment\s*:|TESTCONTAINERS_|DOCKER_HOST/i, evidence: "container environment evidence was detected." },
    { signal: "bind-mounts", pattern: /\bwithBindMounts\b|\bwithCopyFilesToContainer\b|\bwith_volume_mapping\b|volumes\s*:|bind mount/i, evidence: "bind mount or volume evidence was detected." },
    { signal: "network", pattern: /\bwithNetwork\b|\bNetwork\.newNetwork\b|\bnetwork\s*:|networks\s*:|with_network/i, evidence: "container network evidence was detected." },
    { signal: "image-build", pattern: /\bGenericContainer\.fromDockerfile\b|\bDockerImage\b|\bImageFromDockerfile\b|\bbuild_image\b|Dockerfile/i, evidence: "image build evidence was detected." },
    { signal: "toxiproxy", pattern: /\bToxiproxy\b|toxiproxy/i, evidence: "Toxiproxy fault-injection container evidence was detected." }
  ];
  return integrationTestEnvironmentReadinessSignalFromSpecs(sourceFiles, specs, "container", "signal");
}

function integrationTestEnvironmentReadinessWaitSignals(sourceFiles: IntegrationTestEnvironmentReadinessSourceFile[]): IntegrationTestEnvironmentReadinessReport["waitSignals"] {
  const specs: Array<{ signal: IntegrationTestEnvironmentReadinessReport["waitSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "listening-ports", pattern: /Wait\.forListeningPorts|listening ports|wait.*ports/i, evidence: "listening-port wait evidence was detected." },
    { signal: "log-message", pattern: /Wait\.forLogMessage|wait_for_logs|LogMessageWaitStrategy/i, evidence: "log-message wait evidence was detected." },
    { signal: "health-check", pattern: /Wait\.forHealthCheck|healthcheck|health check|HealthCheck/i, evidence: "health-check wait evidence was detected." },
    { signal: "http", pattern: /Wait\.forHttp|HttpWaitStrategy|wait_for_http/i, evidence: "HTTP endpoint wait evidence was detected." },
    { signal: "successful-command", pattern: /Wait\.forSuccessfulCommand|successful command|exec.*wait/i, evidence: "successful-command wait evidence was detected." },
    { signal: "one-shot", pattern: /Wait\.forOneShotStartup|one-shot|oneshot/i, evidence: "one-shot startup wait evidence was detected." },
    { signal: "startup-timeout", pattern: /withStartupTimeout|startup_timeout|timeout\s*=|TESTCONTAINERS_TIMEOUT/i, evidence: "startup timeout evidence was detected." },
    { signal: "wait-for-logs", pattern: /wait_for_logs/i, evidence: "Python wait_for_logs evidence was detected." },
    { signal: "wait-for-http", pattern: /wait_for_http/i, evidence: "Python wait_for_http evidence was detected." },
    { signal: "wait-container-ready", pattern: /wait_container_is_ready|waiting_for\s*\(|wait_for\s*\(/i, evidence: "container ready wait wrapper evidence was detected." }
  ];
  return integrationTestEnvironmentReadinessSignalFromSpecs(sourceFiles, specs, "wait", "signal");
}

function integrationTestEnvironmentReadinessLifecycleSignals(sourceFiles: IntegrationTestEnvironmentReadinessSourceFile[]): IntegrationTestEnvironmentReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: IntegrationTestEnvironmentReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "start", pattern: /\.start\s*\(|await\s+new\s+\w+Container|with\s+\w+Container\s*\(/i, evidence: "container start evidence was detected." },
    { signal: "stop", pattern: /\.stop\s*\(|\.down\s*\(|stop\(\)|compose\.down/i, evidence: "container stop/compose down evidence was detected." },
    { signal: "context-manager", pattern: /with\s+(GenericContainer|DockerContainer|DockerCompose)\s*\(|__enter__|__exit__/i, evidence: "Python context manager cleanup evidence was detected." },
    { signal: "before-all", pattern: /\bbeforeAll\s*\(|beforeEach\s*\(|pytest\.fixture/i, evidence: "test setup fixture evidence was detected." },
    { signal: "after-all", pattern: /\bafterAll\s*\(|afterEach\s*\(|finally\b|yield\s+\w+/i, evidence: "test teardown fixture evidence was detected." },
    { signal: "global-setup", pattern: /globalSetup|globalTeardown|setupFilesAfterEnv|conftest\.py/i, evidence: "global setup/teardown evidence was detected." },
    { signal: "ryuk", pattern: /\bRyuk\b|ryuk|TESTCONTAINERS_RYUK/i, evidence: "Ryuk resource reaper evidence was detected." },
    { signal: "resource-reaper", pattern: /resource reaper|ResourceReaper|Reaper|garbage collection|cleanup/i, evidence: "resource reaper or cleanup evidence was detected." },
    { signal: "reuse", pattern: /testcontainers\.reuse\.enable|withReuse|reuse\s*[:=]\s*true|TESTCONTAINERS_REUSE/i, evidence: "container reuse control evidence was detected." }
  ];
  return integrationTestEnvironmentReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function integrationTestEnvironmentReadinessRuntimeSignals(
  sourceFiles: IntegrationTestEnvironmentReadinessSourceFile[],
  runtimeEnvironmentReport: RuntimeEnvironmentReport
): IntegrationTestEnvironmentReadinessReport["runtimeSignals"] {
  const runtimeSignalCount = runtimeEnvironmentReport.setupSignals.length + runtimeEnvironmentReport.containerSignals.length;
  const specs: Array<{ signal: IntegrationTestEnvironmentReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "docker-host", pattern: /DOCKER_HOST|Docker Desktop|container runtime|docker daemon/i, evidence: "Docker host/runtime evidence was detected." },
    { signal: "podman", pattern: /podman|TESTCONTAINERS_RYUK_DISABLED|rootless/i, evidence: "Podman/rootless runtime evidence was detected." },
    { signal: "compose-binary", pattern: /docker compose|docker-compose|compose command|DockerCompose/i, evidence: "Compose binary evidence was detected." },
    { signal: "ci-service", pattern: /services\s*:|docker:dind|setup-docker|act.*docker|GitHub Actions|CI\b/i, evidence: "CI container service evidence was detected." },
    { signal: "socket", pattern: /docker\.sock|var\/run\/docker|DOCKER_SOCKET|unix:\/\/|npipe/i, evidence: "Docker socket evidence was detected." },
    { signal: "env-config", pattern: /TESTCONTAINERS_|DOCKER_HOST|RYUK|COMPOSE_PROJECT_NAME|\.env/i, evidence: "container test environment variable evidence was detected." },
    { signal: "timeout", pattern: /TESTCONTAINERS_TIMEOUT|withStartupTimeout|startup_timeout|timeout\s*[:=]/i, evidence: "runtime timeout evidence was detected." },
    { signal: "cleanup-disable", pattern: /TESTCONTAINERS_RYUK_DISABLED|ryuk\.disabled|cleanup.*false/i, evidence: "cleanup disable override evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    if (match) return { signal: spec.signal, readiness: "ready", evidence: `${match.filePath} ${spec.evidence}`, relatedHref: match.sourceHref };
    return {
      signal: spec.signal,
      readiness: runtimeSignalCount > 0 && ["docker-host", "ci-service", "env-config"].includes(spec.signal) ? "external" : "missing",
      evidence: `${spec.signal} runtime evidence was not detected in integration-test environment files.`,
      relatedHref: "html/runtime-environment.html"
    };
  });
}

function integrationTestEnvironmentReadinessPackageSignals(sourceFiles: IntegrationTestEnvironmentReadinessSourceFile[]): IntegrationTestEnvironmentReadinessReport["packageSignals"] {
  const specs: Array<{ signal: IntegrationTestEnvironmentReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "testcontainers", pattern: /["']testcontainers["']|from\s+["']testcontainers["']|require\(["']testcontainers["']\)/i, evidence: "Node testcontainers package/import evidence was detected." },
    { signal: "@testcontainers/*", pattern: /@testcontainers\/[a-z0-9-]+/i, evidence: "@testcontainers module package evidence was detected." },
    { signal: "testcontainers-python", pattern: /name\s*=\s*["']testcontainers["']|testcontainers(\[[^\]]+\])?==|from\s+testcontainers\.|import\s+testcontainers/i, evidence: "Python testcontainers package/import evidence was detected." },
    { signal: "pytest", pattern: /pytest|pytest\.fixture|conftest\.py/i, evidence: "pytest fixture evidence was detected." },
    { signal: "vitest", pattern: /vitest|beforeAll|afterAll|describe\s*\(|it\s*\(/i, evidence: "Vitest test lifecycle evidence was detected." },
    { signal: "jest", pattern: /jest|beforeAll|afterAll|describe\s*\(|test\s*\(/i, evidence: "Jest test lifecycle evidence was detected." }
  ];
  return integrationTestEnvironmentReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function integrationTestEnvironmentReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: IntegrationTestEnvironmentReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/integration-test-environment-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildChaosEngineeringReadinessReport(walk: WalkResult): Promise<ChaosEngineeringReadinessReport> {
  const sourceFiles = await chaosEngineeringReadinessSourceFiles(walk);
  const chaosSetups = chaosEngineeringReadinessSetups(sourceFiles);
  const experimentSignals = chaosEngineeringReadinessExperimentSignals(sourceFiles);
  const faultSignals = chaosEngineeringReadinessFaultSignals(sourceFiles);
  const scopeSignals = chaosEngineeringReadinessScopeSignals(sourceFiles);
  const safetySignals = chaosEngineeringReadinessSafetySignals(sourceFiles);
  const observabilitySignals = chaosEngineeringReadinessObservabilitySignals(sourceFiles);
  const packageSignals = chaosEngineeringReadinessPackageSignals(sourceFiles);
  const riskQueue: ChaosEngineeringReadinessReport["riskQueue"] = [];
  const readyExperiments = experimentSignals.filter((item) => item.readiness === "ready").length;
  const readyFaults = faultSignals.filter((item) => item.readiness === "ready").length;
  const hasPackageSignal = packageSignals.some((item) => item.readiness === "ready");
  const hasToxicFault = faultSignals.some((item) => item.readiness === "ready" && item.signal.endsWith("-toxic"));
  const hasToxicCleanup = safetySignals.some((item) => item.readiness === "ready" && ["cleanup", "rollback", "abort"].includes(item.signal));

  if (sourceFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Document whether this project intentionally has no chaos engineering or fault-injection strategy.",
      why: "No Chaos Mesh, LitmusChaos, Toxiproxy, Gremlin, probe, steady-state, or fault-injection source signals were detected.",
      relatedHref: "html/chaos-engineering-readiness.html"
    });
  }
  if (hasPackageSignal && readyExperiments === 0) {
    riskQueue.push({
      priority: "high",
      action: "Connect chaos engineering dependencies or cluster tooling to at least one reviewed experiment manifest or test fixture.",
      why: "Package/tool evidence without experiment definitions often means the learner cannot see the actual failure mode being exercised.",
      relatedHref: packageSignals.find((item) => item.readiness === "ready")?.relatedHref ?? "html/chaos-engineering-readiness.html"
    });
  }
  if (readyExperiments > 0 && chaosSetups.some((setup) => !setup.hasSelector || setup.scopeCount === 0)) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit selector, namespace, target, or blast-radius scope to every chaos experiment.",
      why: "Chaos Mesh and Litmus examples make scope concrete through selectors, namespaces, modes, service accounts, and app info.",
      relatedHref: chaosSetups.find((setup) => !setup.hasSelector || setup.scopeCount === 0)?.sourceHref ?? "html/chaos-engineering-readiness.html"
    });
  }
  if (readyExperiments > 0 && chaosSetups.some((setup) => !setup.hasDuration)) {
    riskQueue.push({
      priority: "high",
      action: "Add duration, schedule, timeout, or bounded toxic lifetime controls before running chaos experiments.",
      why: "Fault injection without a time boundary can turn a learning exercise into an unbounded outage.",
      relatedHref: chaosSetups.find((setup) => !setup.hasDuration)?.sourceHref ?? "html/chaos-engineering-readiness.html"
    });
  }
  if (readyExperiments > 0 && chaosSetups.some((setup) => !setup.hasProbeOrSteadyState)) {
    riskQueue.push({
      priority: "high",
      action: "Add probe, steady-state, rollback, abort, or cleanup evidence before promoting chaos experiments.",
      why: "Litmus probe modes and Toxiproxy cleanup APIs are the safety boundary that turn a fault into a controlled experiment.",
      relatedHref: chaosSetups.find((setup) => !setup.hasProbeOrSteadyState)?.sourceHref ?? "html/chaos-engineering-readiness.html"
    });
  }
  if (readyExperiments > 0 && !observabilitySignals.some((item) => item.readiness === "ready")) {
    riskQueue.push({
      priority: "medium",
      action: "Attach Prometheus, alert rule, metrics, dashboard, ChaosResult, or report evidence to chaos runs.",
      why: "Learners need observable results to compare steady state, injected fault, and recovery.",
      relatedHref: "html/chaos-engineering-readiness.html"
    });
  }
  if (hasToxicFault && !hasToxicCleanup) {
    riskQueue.push({
      priority: "medium",
      action: "Pair each Toxiproxy toxic with RemoveToxic, UpdateToxic, cleanup, or rollback evidence.",
      why: "Toxiproxy fault injection remains safer when the teardown path is visible next to AddToxic calls.",
      relatedHref: faultSignals.find((item) => item.readiness === "ready" && item.signal.endsWith("-toxic"))?.relatedHref ?? "html/chaos-engineering-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Treat this report as static readiness only; run chaos experiments only in an approved non-production environment.",
    why: "RepoTutor does not execute kubectl, helm, Chaos Mesh, LitmusChaos, Gremlin, Toxiproxy, network faults, stress tests, or cluster workloads.",
    relatedHref: "html/chaos-engineering-readiness.html"
  });

  return {
    summary: `Chaos engineering readiness report: ${chaosSetups.length} setup 후보, experiment signal ${readyExperiments}개, fault signal ${readyFaults}개, safety signal ${safetySignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Chaos Mesh LitmusChaos Toxiproxy chaos experiments probes steady state blast radius schedules toxics cleanup",
    chaosSetups,
    experimentSignals,
    faultSignals,
    scopeSignals,
    safetySignals,
    observabilitySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"ChaosEngine|ChaosExperiment|PodChaos|NetworkChaos|StressChaos|Toxiproxy|AddToxic\" .", purpose: "Inventory cluster chaos manifests, Litmus engines, and Toxiproxy fault-injection fixtures." },
      { command: "rg \"selector|namespace|mode|duration|containerNames|chaosServiceAccount|blast\" chaos charts tests .github", purpose: "Review experiment scope, blast radius, target, and time-bound controls." },
      { command: "rg \"probe|steady-state|promProbe|httpProbe|k8sProbe|cmdProbe|ChaosResult|RemoveToxic|cleanup\" chaos charts tests .github", purpose: "Trace probe, steady-state, result, and cleanup evidence before any real run." },
      { command: "helm template <chart> --dry-run", purpose: "Render chaos manifests for review without applying them to a cluster." },
      { command: "kubectl apply --dry-run=server -f chaos/", purpose: "Validate manifests against the target cluster API without creating experiments." },
      { command: "kubectl get chaosresults --all-namespaces", purpose: "Inspect Litmus result artifacts after an approved non-production chaos run." }
    ],
    learnerNextSteps: [
      "먼저 chaos experiment가 어떤 플랫폼인지 구분하세요: Chaos Mesh CRD, Litmus ChaosEngine/Experiment, Toxiproxy fixture, 또는 custom fault injection.",
      "selector, namespace, mode, duration, target, service account가 없으면 blast radius가 불명확합니다.",
      "probe, steady-state, Prometheus/HTTP/K8s/CMD probe, ChaosResult, cleanup 신호가 있는지 확인하세요.",
      "Toxiproxy는 AddToxic만 보지 말고 UpdateToxic, RemoveToxic, teardown 위치를 같이 보세요.",
      "이 리포트는 정적 readiness입니다. 실제 chaos run은 승인된 개발/스테이징 환경에서 별도 절차로만 수행하세요."
    ]
  };
}

type ChaosEngineeringReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function chaosEngineeringReadinessSourceFiles(walk: WalkResult): Promise<ChaosEngineeringReadinessSourceFile[]> {
  const files: ChaosEngineeringReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !chaosEngineeringReadinessInspectablePath(file.relPath)) continue;
    const pathCandidate = chaosEngineeringReadinessPathSignal(file.relPath);
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!pathCandidate && !chaosEngineeringReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function chaosEngineeringReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|go\.mod|go\.sum|pyproject\.toml|requirements.*\.txt|poetry\.lock|Chart\.ya?ml|values.*\.ya?ml|docker-compose\.ya?ml|compose\.ya?ml)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(chaos|experiments?|litmus|toxiproxy|resilience|reliability|sre)(\/|$)/i.test(filePath)
    || /\.(ts|tsx|js|jsx|mjs|cjs|py|go|java|rb|json|toml|ya?ml|md|sh)$/i.test(filePath);
}

function chaosEngineeringReadinessPathSignal(filePath: string): boolean {
  return /(chaos|litmus|chaos-mesh|toxiproxy|gremlin|fault[-_ ]?injection|resilience|reliability|sre|network[-_ ]?latency|pod[-_ ]?delete|pod[-_ ]?kill|blast[-_ ]?radius|steady[-_ ]?state)/i.test(filePath);
}

function chaosEngineeringReadinessContentSignal(text: string): boolean {
  return /\b(chaos-mesh|litmuschaos|Litmus|ChaosEngine|ChaosExperiment|ChaosSchedule|ChaosResult|PodChaos|NetworkChaos|StressChaos|IOChaos|DNSChaos|TimeChaos|HTTPChaos|Workflow|Toxiproxy|toxiproxy|AddToxic|CreateProxy|fault injection|fault-injection|steady-state|steady state|blast radius|pod-network-latency|pod-delete|pod-kill|promProbe|httpProbe|k8sProbe|cmdProbe|sloProbe|Chaos Mesh|kubectl apply --dry-run|helm template)\b/i.test(text);
}

function chaosEngineeringReadinessSetups(sourceFiles: ChaosEngineeringReadinessSourceFile[]): ChaosEngineeringReadinessReport["chaosSetups"] {
  const rows: ChaosEngineeringReadinessReport["chaosSetups"] = [];
  for (const source of sourceFiles) {
    const experimentCount = countMatches(source.text, /\b(kind:\s*(PodChaos|NetworkChaos|StressChaos|IOChaos|DNSChaos|TimeChaos|HTTPChaos|Schedule|Workflow|ChaosEngine|ChaosExperiment|ChaosSchedule|ChaosResult)|Toxiproxy|toxiproxy\.NewClient|CreateProxy|AddToxic)\b/gi);
    const faultCount = countMatches(source.text, /\b(action:\s*(pod-kill|pod-failure|pod-delete|container-kill|delay|loss|partition|bandwidth|netem|stress|latency|abort|http-abort|http-delay|random)|pod-network-latency|pod-delete|pod-kill|AddToxic|latency|timeout|bandwidth|slow_close|limit_data)\b/gi);
    const scopeCount = countMatches(source.text, /\b(selector|namespace|labelSelector|mode|containerNames|target|listen|upstream|appinfo|chaosServiceAccount|annotationCheck|blast radius|blast-radius)\b/gi);
    const safetyCount = countMatches(source.text, /\b(probe|steady-state|steady state|SOT|EOT|Edge|Continuous|OnChaos|promProbe|httpProbe|k8sProbe|cmdProbe|sloProbe|rollback|abort|pause|cleanup|jobCleanUpPolicy|RemoveToxic|UpdateToxic)\b/gi);
    const observabilityCount = countMatches(source.text, /\b(Prometheus|promProbe|Grafana|OpenTelemetry|otel|alert|metrics|dashboard|ChaosResult|report)\b/gi);
    const hasSelector = /\b(selector|labelSelector|namespace|appinfo|chaosServiceAccount|containerNames|target|listen|upstream|blast radius|blast-radius)\b/i.test(source.text);
    const hasDuration = /\b(duration|scheduler|schedule|timeout|latency|toxicity|DURATION|TOTAL_CHAOS_DURATION|CHAOS_INTERVAL|stopAfter|deadline)\b/i.test(source.text);
    const hasProbeOrSteadyState = /\b(probe|steady-state|steady state|SOT|EOT|promProbe|httpProbe|k8sProbe|cmdProbe|sloProbe|ChaosResult|RemoveToxic|UpdateToxic|cleanup|rollback|abort)\b/i.test(source.text);
    const hasSetupSignal = experimentCount + faultCount + scopeCount + safetyCount + observabilityCount > 0 || chaosEngineeringReadinessPlatform(source) !== "unknown";
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: chaosEngineeringReadinessPlatform(source),
      experimentCount,
      faultCount,
      scopeCount,
      safetyCount,
      observabilityCount,
      hasSelector,
      hasDuration,
      hasProbeOrSteadyState,
      readiness: experimentCount > 0 && faultCount > 0 && hasSelector && hasDuration && hasProbeOrSteadyState ? "ready" : "partial",
      evidence: `${source.filePath} contains experiments ${experimentCount}, faults ${faultCount}, scope ${scopeCount}, safety ${safetyCount}, observability ${observabilityCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 120);
}

function chaosEngineeringReadinessPlatform(source: ChaosEngineeringReadinessSourceFile): ChaosEngineeringReadinessReport["chaosSetups"][number]["platform"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/chaos-mesh|chaos-mesh\.org|PodChaos|NetworkChaos|StressChaos|IOChaos|DNSChaos|TimeChaos|HTTPChaos/i.test(haystack)) return "chaos-mesh";
  if (/litmuschaos|ChaosEngine|ChaosExperiment|ChaosSchedule|ChaosResult|chaosServiceAccount|promProbe|sloProbe/i.test(haystack)) return "litmus";
  if (/toxiproxy|Toxiproxy|AddToxic|CreateProxy|ToxicOptions/i.test(haystack)) return "toxiproxy";
  if (/gremlin/i.test(haystack)) return "gremlin";
  if (/fault[-_ ]?injection|chaos|resilience/i.test(haystack)) return "custom";
  return "unknown";
}

function chaosEngineeringReadinessExperimentSignals(sourceFiles: ChaosEngineeringReadinessSourceFile[]): ChaosEngineeringReadinessReport["experimentSignals"] {
  const specs: Array<{ signal: ChaosEngineeringReadinessReport["experimentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pod-chaos", pattern: /kind:\s*PodChaos|PodChaos\b/i, evidence: "Chaos Mesh PodChaos evidence was detected." },
    { signal: "network-chaos", pattern: /kind:\s*NetworkChaos|NetworkChaos\b|pod-network-latency/i, evidence: "network chaos experiment evidence was detected." },
    { signal: "stress-chaos", pattern: /kind:\s*StressChaos|StressChaos\b|stress-ng|cpu.*stress|memory.*stress/i, evidence: "stress chaos experiment evidence was detected." },
    { signal: "io-chaos", pattern: /kind:\s*IOChaos|IOChaos\b|io.*delay/i, evidence: "IO chaos experiment evidence was detected." },
    { signal: "dns-chaos", pattern: /kind:\s*DNSChaos|DNSChaos\b/i, evidence: "DNS chaos experiment evidence was detected." },
    { signal: "time-chaos", pattern: /kind:\s*TimeChaos|TimeChaos\b|time.*shift/i, evidence: "time chaos experiment evidence was detected." },
    { signal: "http-chaos", pattern: /kind:\s*HTTPChaos|HTTPChaos\b|http-abort|http-delay/i, evidence: "HTTP chaos experiment evidence was detected." },
    { signal: "schedule", pattern: /kind:\s*(Schedule|ChaosSchedule)|scheduler:|ChaosSchedule\b/i, evidence: "scheduled chaos evidence was detected." },
    { signal: "workflow", pattern: /kind:\s*Workflow|Workflow\b/i, evidence: "workflow-style chaos evidence was detected." },
    { signal: "chaos-engine", pattern: /kind:\s*ChaosEngine|ChaosEngine\b/i, evidence: "Litmus ChaosEngine evidence was detected." },
    { signal: "chaos-experiment", pattern: /kind:\s*ChaosExperiment|ChaosExperiment\b|experiments:/i, evidence: "Litmus ChaosExperiment evidence was detected." },
    { signal: "chaos-result", pattern: /kind:\s*ChaosResult|ChaosResult\b/i, evidence: "Litmus ChaosResult evidence was detected." },
    { signal: "toxiproxy", pattern: /Toxiproxy|toxiproxy\.NewClient|CreateProxy|AddToxic/i, evidence: "Toxiproxy fault-injection fixture evidence was detected." }
  ];
  return chaosEngineeringReadinessSignalFromSpecs(sourceFiles, specs, "experiment", "signal");
}

function chaosEngineeringReadinessFaultSignals(sourceFiles: ChaosEngineeringReadinessSourceFile[]): ChaosEngineeringReadinessReport["faultSignals"] {
  const specs: Array<{ signal: ChaosEngineeringReadinessReport["faultSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pod-kill", pattern: /pod-kill|pod kill|container-kill|action:\s*pod-kill/i, evidence: "pod kill fault evidence was detected." },
    { signal: "pod-delete", pattern: /pod-delete|pod delete|action:\s*pod-delete/i, evidence: "pod delete fault evidence was detected." },
    { signal: "network-delay", pattern: /action:\s*delay|pod-network-latency|network.*latency|latency:\s*['"]?\d/i, evidence: "network delay/latency fault evidence was detected." },
    { signal: "network-loss", pattern: /action:\s*loss|packet.*loss|loss:\s*['"]?\d/i, evidence: "network loss fault evidence was detected." },
    { signal: "network-partition", pattern: /partition|action:\s*partition/i, evidence: "network partition fault evidence was detected." },
    { signal: "network-bandwidth", pattern: /bandwidth|rate limit|rate-limit/i, evidence: "network bandwidth fault evidence was detected." },
    { signal: "cpu-stress", pattern: /cpu.*stress|StressChaos[\s\S]{0,120}cpu|CPU_CORES/i, evidence: "CPU stress fault evidence was detected." },
    { signal: "memory-stress", pattern: /memory.*stress|StressChaos[\s\S]{0,120}memory|MEMORY_CONSUMPTION/i, evidence: "memory stress fault evidence was detected." },
    { signal: "io-delay", pattern: /IOChaos|io.*delay|latency.*io/i, evidence: "IO delay fault evidence was detected." },
    { signal: "time-shift", pattern: /TimeChaos|time.*shift|clock.*skew/i, evidence: "time shift fault evidence was detected." },
    { signal: "dns-error", pattern: /DNSChaos|dns.*error|dns.*random/i, evidence: "DNS error fault evidence was detected." },
    { signal: "http-abort", pattern: /http-abort|abort|HTTPChaos[\s\S]{0,120}abort/i, evidence: "HTTP abort fault evidence was detected." },
    { signal: "http-delay", pattern: /http-delay|HTTPChaos[\s\S]{0,120}delay/i, evidence: "HTTP delay fault evidence was detected." },
    { signal: "latency-toxic", pattern: /AddToxic\s*\([^)]*latency|toxic[^\n]*latency|type:\s*latency/i, evidence: "Toxiproxy latency toxic evidence was detected." },
    { signal: "timeout-toxic", pattern: /AddToxic\s*\([^)]*timeout|toxic[^\n]*timeout|type:\s*timeout/i, evidence: "Toxiproxy timeout toxic evidence was detected." },
    { signal: "bandwidth-toxic", pattern: /AddToxic\s*\([^)]*bandwidth|toxic[^\n]*bandwidth|type:\s*bandwidth/i, evidence: "Toxiproxy bandwidth toxic evidence was detected." },
    { signal: "slow-close-toxic", pattern: /AddToxic\s*\([^)]*slow_close|slow_close|type:\s*slow_close/i, evidence: "Toxiproxy slow_close toxic evidence was detected." },
    { signal: "limit-data-toxic", pattern: /AddToxic\s*\([^)]*limit_data|limit_data|type:\s*limit_data/i, evidence: "Toxiproxy limit_data toxic evidence was detected." }
  ];
  return chaosEngineeringReadinessSignalFromSpecs(sourceFiles, specs, "fault", "signal");
}

function chaosEngineeringReadinessScopeSignals(sourceFiles: ChaosEngineeringReadinessSourceFile[]): ChaosEngineeringReadinessReport["scopeSignals"] {
  const specs: Array<{ signal: ChaosEngineeringReadinessReport["scopeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "selector", pattern: /\bselector\s*:|selector:/i, evidence: "selector scope evidence was detected." },
    { signal: "namespace", pattern: /\bnamespace\s*:|metadata:\s*[\s\S]{0,120}namespace/i, evidence: "namespace scope evidence was detected." },
    { signal: "label-selector", pattern: /labelSelector|matchLabels|labels?:/i, evidence: "label selector scope evidence was detected." },
    { signal: "mode", pattern: /\bmode\s*:\s*(one|all|fixed|fixed-percent|random-max-percent|random)/i, evidence: "Chaos Mesh mode scope evidence was detected." },
    { signal: "duration", pattern: /\bduration\s*:|TOTAL_CHAOS_DURATION|CHAOS_INTERVAL|deadline|timeout/i, evidence: "duration or timeout scope evidence was detected." },
    { signal: "container-names", pattern: /containerNames|containerRuntime|containerName/i, evidence: "container-specific scope evidence was detected." },
    { signal: "target", pattern: /\btarget\s*:|listen:|upstream:|CreateProxy|serviceName|appns|applabel/i, evidence: "target service evidence was detected." },
    { signal: "blast-radius", pattern: /blast radius|blast-radius|radius|limited scope|failure domain/i, evidence: "blast radius language was detected." },
    { signal: "service-account", pattern: /chaosServiceAccount|serviceAccountName|serviceAccount/i, evidence: "service account scope evidence was detected." },
    { signal: "annotation-check", pattern: /annotationCheck|chaos\.alpha\.kubernetes\.io|annotation check/i, evidence: "annotation check scope guard evidence was detected." }
  ];
  return chaosEngineeringReadinessSignalFromSpecs(sourceFiles, specs, "scope", "signal");
}

function chaosEngineeringReadinessSafetySignals(sourceFiles: ChaosEngineeringReadinessSourceFile[]): ChaosEngineeringReadinessReport["safetySignals"] {
  const specs: Array<{ signal: ChaosEngineeringReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "probe", pattern: /\bprobe\b|probes:/i, evidence: "probe evidence was detected." },
    { signal: "steady-state", pattern: /steady-state|steady state|sloProbe|SLO/i, evidence: "steady-state evidence was detected." },
    { signal: "sot", pattern: /\bSOT\b|mode:\s*SOT/i, evidence: "start-of-test probe mode evidence was detected." },
    { signal: "eot", pattern: /\bEOT\b|mode:\s*EOT/i, evidence: "end-of-test probe mode evidence was detected." },
    { signal: "prometheus-probe", pattern: /promProbe|Prometheus|prometheus/i, evidence: "Prometheus probe evidence was detected." },
    { signal: "http-probe", pattern: /httpProbe|http probe|url:/i, evidence: "HTTP probe evidence was detected." },
    { signal: "k8s-probe", pattern: /k8sProbe|k8s probe|kubectl get/i, evidence: "Kubernetes probe evidence was detected." },
    { signal: "cmd-probe", pattern: /cmdProbe|cmd probe|command:/i, evidence: "command probe evidence was detected." },
    { signal: "rollback", pattern: /rollback|restore|revert/i, evidence: "rollback evidence was detected." },
    { signal: "abort", pattern: /\babort\b|http-abort|abortOnFailure|stopOnFailure/i, evidence: "abort control evidence was detected." },
    { signal: "pause", pattern: /\bpause\b|suspend/i, evidence: "pause/suspend control evidence was detected." },
    { signal: "cleanup", pattern: /cleanup|jobCleanUpPolicy|RemoveToxic|DeleteProxy|defer|finally/i, evidence: "cleanup evidence was detected." },
    { signal: "job-cleanup-policy", pattern: /jobCleanUpPolicy|delete|retain/i, evidence: "Litmus job cleanup policy evidence was detected." }
  ];
  return chaosEngineeringReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function chaosEngineeringReadinessObservabilitySignals(sourceFiles: ChaosEngineeringReadinessSourceFile[]): ChaosEngineeringReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: ChaosEngineeringReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prometheus", pattern: /Prometheus|prometheus|promProbe/i, evidence: "Prometheus observability evidence was detected." },
    { signal: "grafana", pattern: /Grafana|grafana/i, evidence: "Grafana dashboard evidence was detected." },
    { signal: "otel", pattern: /OpenTelemetry|otel|trace|span/i, evidence: "OpenTelemetry observability evidence was detected." },
    { signal: "alert-rule", pattern: /PrometheusRule|alert:|alertname|Alertmanager/i, evidence: "alert rule evidence was detected." },
    { signal: "metrics", pattern: /metrics|histogram|counter|gauge|slo/i, evidence: "metrics evidence was detected." },
    { signal: "dashboard", pattern: /dashboard|panels|grafana/i, evidence: "dashboard evidence was detected." },
    { signal: "chaos-result", pattern: /ChaosResult|chaosresults/i, evidence: "ChaosResult evidence was detected." },
    { signal: "report", pattern: /report|junit|json.*result|artifact/i, evidence: "report artifact evidence was detected." }
  ];
  return chaosEngineeringReadinessSignalFromSpecs(sourceFiles, specs, "observability", "signal");
}

function chaosEngineeringReadinessPackageSignals(sourceFiles: ChaosEngineeringReadinessSourceFile[]): ChaosEngineeringReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ChaosEngineeringReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "chaos-mesh", pattern: /chaos-mesh|chaos-mesh\.org|helm.*chaos-mesh/i, evidence: "Chaos Mesh package/chart/API evidence was detected." },
    { signal: "litmuschaos", pattern: /litmuschaos|litmus-portal|chaos-runner|ChaosEngine/i, evidence: "LitmusChaos package/API evidence was detected." },
    { signal: "toxiproxy", pattern: /toxiproxy|github\.com\/Shopify\/toxiproxy|toxiproxy-node-client|Toxiproxy/i, evidence: "Toxiproxy package/import evidence was detected." },
    { signal: "gremlin", pattern: /gremlin/i, evidence: "Gremlin package/tool evidence was detected." },
    { signal: "helm", pattern: /\bhelm\b|Chart\.yaml|helm template/i, evidence: "Helm rendering evidence was detected." },
    { signal: "kubectl", pattern: /\bkubectl\b|kubectl apply|kubectl get/i, evidence: "kubectl validation/run evidence was detected." }
  ];
  return chaosEngineeringReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function chaosEngineeringReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ChaosEngineeringReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/chaos-engineering-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
