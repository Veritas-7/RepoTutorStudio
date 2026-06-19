export const PRODUCT_NAME = "RepoTutor Studio";
export const DEFAULT_LANGUAGE = "ko";
export const DEFAULT_STUDY_MODE = "standard";
export const DEFAULT_LEARNER_LEVEL = "beginner";
export const DEFAULT_REPO_MAP_DEPTH = 4;
export const MAX_TEXT_FILE_BYTES = 140_000;
export const LARGE_LOCKFILE_BYTES = 500_000;

export const EXCLUDED_DIR_NAMES = new Set([
  ".git",
  "node_modules",
  ".venv",
  "venv",
  "dist",
  "build",
  "target",
  "sidecar-dist",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  ".pytest_cache",
  "__pycache__"
]);

export const EXCLUDED_PATH_PREFIXES = [
  "apps/cli/studies",
  "docs/audits/generated",
  "studies"
];

export const SECRET_FILE_PATTERNS = [
  /^\.env(?:\..*)?$/i,
  /\.pem$/i,
  /\.key$/i,
  /^id_rsa$/i,
  /credential/i,
  /token/i,
  /secret/i,
  /password/i,
  /api[_-]?key/i
];

export const BINARY_OR_MEDIA_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".mp4",
  ".mov",
  ".mp3",
  ".wav",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".dmg",
  ".iso",
  ".exe",
  ".dll",
  ".so",
  ".dylib"
]);

export const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".py": "Python",
  ".rs": "Rust",
  ".go": "Go",
  ".java": "Java",
  ".kt": "Kotlin",
  ".swift": "Swift",
  ".rb": "Ruby",
  ".php": "PHP",
  ".cs": "C#",
  ".cpp": "C++",
  ".c": "C",
  ".h": "C/C++ Header",
  ".html": "HTML",
  ".css": "CSS",
  ".scss": "CSS",
  ".md": "Markdown",
  ".json": "JSON",
  ".toml": "TOML",
  ".yaml": "YAML",
  ".yml": "YAML",
  ".sh": "Shell",
  ".sql": "SQL"
};

export const DEPENDENCY_FILES = new Set([
  "package.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  "pyproject.toml",
  "requirements.txt",
  "Cargo.toml",
  "go.mod",
  "composer.json",
  "Gemfile",
  "Dockerfile",
  "docker-compose.yml",
  "Makefile"
]);
