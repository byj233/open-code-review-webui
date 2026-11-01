// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export type JobStatus = 'running' | 'canceling' | 'succeeded' | 'failed' | 'canceled' | 'queued';
export type JobKind = 'review' | 'scan' | 'llm-test';
export type StreamName = 'stdout' | 'stderr';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type ReviewMode = 'workspace' | 'commit' | 'range';

export interface CommitInfo {
  hash: string
  short: string
  author: string
  date: string
  subject: string
}

export interface RepoInfo {
  path: string
  name: string
  is_git: boolean
  top_level?: string
  branch?: string
  detached?: boolean
  head?: string
  dirty: number
  staged: number
  unstaged: number
  untracked: number
  ahead: number
  behind: number
  commits: CommitInfo[]
  branches: string[]
  tags: string[]
  error?: string
}

export interface ActiveConfig {
  provider?: string
  provider_label?: string
  provider_kind?: 'preset' | 'custom' | 'unknown'
  model?: string
  source: 'provider' | 'legacy' | 'ocr-env' | 'claude-env' | 'none'
  protocol?: string
  base_url?: string
  env_var?: string
  auth_mode: 'api_key' | 'env' | 'ambient' | 'sign_in' | 'none'
  key_set: boolean
  env_set: boolean
  configured: boolean
}

export interface ConfigSummary {
  path: string
  exists: boolean
  error?: string
  active: ActiveConfig
  max_tokens: number
  effort?: string
  language?: string
  mcp_server_count: number
}

export interface MetaDefaults {
  concurrency: number
  timeout: number
  max_tokens: number
  max_tokens_budget: number
  modes: ReviewMode[]
}

export interface MetaResponse {
  version: string
  platform: string
  repo: RepoInfo
  config: ConfigSummary
  efforts: string[]
  defaults: MetaDefaults
  running_jobs: number
}

export interface ProviderEntry {
  url?: string
  protocol?: string
  model?: string
  models?: string[]
  auth_header?: string
  timeout_sec?: number
  aws_profile?: string
  aws_region?: string
  api_key_set: boolean
  api_key_cmd?: string
  api_key_cmd_set: boolean
}

export interface LlmConfig {
  url?: string
  model?: string
  protocol?: string
  auth_header?: string
  timeout_sec?: number
  use_anthropic?: boolean
  auth_token_set: boolean
  auth_token_cmd?: string
}

export interface TelemetryConfig {
  enabled: boolean
  exporter?: string
  otlp_endpoint?: string
  content_logging: boolean
}

export interface McpServer {
  name: string
  type?: string
  command?: string
  url?: string
  tools?: string[]
}

export interface ConfigView extends ConfigSummary {
  providers?: Record<string, ProviderEntry>
  custom_providers?: Record<string, ProviderEntry>
  llm: LlmConfig
  telemetry?: TelemetryConfig
  mcp_servers?: McpServer[]
}

export interface ProviderCard {
  name: string
  display_name: string
  protocol?: string
  base_url?: string
  env_var?: string
  ambient_auth?: boolean
  external_auth?: boolean
  models: string[]
  model?: string
  configured: boolean
  auth_mode: 'api_key' | 'env' | 'ambient' | 'sign_in' | 'none'
  key_set: boolean
  env_set: boolean
  active: boolean
  custom: boolean
}

export interface ProvidersResponse {
  active: ActiveConfig
  providers: ProviderCard[]
  custom: ProviderCard[]
  error?: string
}

export interface LlmComment {
  path: string
  content: string
  suggestion_code?: string
  existing_code?: string
  start_line: number
  end_line: number
  thinking?: string
  category?: string
  severity?: string
}

export interface ReviewSummary {
  files_reviewed: number
  comments: number
  total_tokens: number
  input_tokens: number
  output_tokens: number
  cache_read_tokens?: number
  cache_write_tokens?: number
  elapsed: string
  budget_exceeded?: boolean
}

export interface AgentWarning {
  file?: string
  message?: string
  type?: string
}

export interface CoverageItem {
  item_id?: string
  path?: string
  old_path?: string
  fingerprint?: string
  classification?: string
  reason?: string
}

export interface Coverage {
  selected?: CoverageItem[]
  completed?: CoverageItem[]
  reused?: CoverageItem[]
  failed?: CoverageItem[]
  waived?: CoverageItem[]
}

export interface RunManifest {
  schema_version?: string
  run_id?: string
  parent_run_id?: string
  operation?: string
  terminal_state?: string
  coverage?: Coverage
  run_failure?: { classification?: string; reason?: string }
  elapsed_ms?: number
  [key: string]: unknown
}

export interface FileGroupInfo {
  label?: string
  files?: string[]
  [key: string]: unknown
}

export interface ReviewResult {
  status?: string
  llm?: { provider?: string; model?: string }
  trace_id?: string
  message?: string
  summary?: ReviewSummary
  tool_calls?: {
    total?: number
    by_tool?: Record<string, number>
    failure?: number
  }
  comments?: LlmComment[]
  groups?: FileGroupInfo[]
  warnings?: AgentWarning[]
  project_summary?: string
  session_id?: string
  manifest?: RunManifest
  retry_report?: unknown
}

export interface PreviewEntry {
  path: string
  status: string
  insertions: number
  deletions: number
  will_review: boolean
  exclude_reason?: string
}

export interface PreviewResult {
  files: PreviewEntry[]
  total_insertions: number
  total_deletions: number
  total_files: number
  reviewable_count: number
  excluded_count: number
}

export interface JobLogLine {
  seq: number
  time: string
  stream: StreamName
  text: string
}

export interface JobSnapshot {
  id: string
  kind: JobKind
  title: string
  status: JobStatus
  command: string[]
  command_preview: string
  started_at: string
  ended_at?: string
  exit_code?: number
  error?: string
  logs?: JobLogLine[]
  logs_truncated?: boolean
  result?: ReviewResult | PreviewResult | Record<string, unknown> | null
  output?: string
  version: number
}

export interface JobsResponse {
  jobs: JobSnapshot[]
  running: number
}

export interface SessionSummary {
  session_id: string
  file_path: string
  repo_dir: string
  git_branch?: string
  model?: string
  review_mode?: string
  diff_from?: string
  diff_to?: string
  diff_commit?: string
  resumed_from?: string
  start_time: string
  end_time?: string
  duration_ns?: number
  selected_files: number
  completed_files: number
  failed_files: number
  reused_files: number
  waived_files: number
  total_comments: number
  llm_failures: number
  aborted: boolean
  legacy: boolean
  run_manifest?: RunManifest
  resume_lineage?: unknown
}

export interface SessionItem {
  type: string
  timestamp: string
  file_path: string
  old_path?: string
  new_path?: string
  fingerprint?: string
  comments: number
  source_session_id?: string
  error?: string
}

export interface SessionsResponse {
  sessions: SessionSummary[]
  total: number
}

export interface SessionDetailResponse {
  summary: SessionSummary
  items: SessionItem[]
  comments: LlmComment[]
}

export interface RulePattern {
  pattern: string
  rule: string
}

export interface RulesResponse {
  default_rule: string
  patterns: RulePattern[]
}

export interface RuleCheckResponse {
  path: string
  source: string
  pattern: string
  rule: string
  sniffed_as?: string
}

export interface ConfigApplyResponse {
  ok: boolean
  applied: string[]
  messages: string[]
}

export interface ActivateProviderResponse {
  ok: boolean
  messages: string[]
}

export interface ReviewRequest {
  mode: ReviewMode
  from?: string
  to?: string
  commit?: string
  resume?: string
  background?: string
  exclude?: string
  provider?: string
  model?: string
  effort?: string
  concurrency: number
  timeout: number
  max_tokens: number
  max_tokens_budget: number
  no_filter: boolean
  preview: boolean
}

export interface ScanRequest {
  paths?: string
  background?: string
  exclude?: string
  provider?: string
  model?: string
  batch?: string
  concurrency: number
  timeout: number
  max_tokens: number
  max_tokens_budget: number
  no_plan: boolean
  no_dedup: boolean
  no_summary: boolean
  preview: boolean
  resume?: string
}

export interface ReviewFormState {
  mode: ReviewMode
  from: string
  to: string
  commit: string
  resume: string
  background: string
  exclude: string
  provider: string
  model: string
  effort: string
  concurrency: number
  timeout: number
  max_tokens: number
  max_tokens_budget: number
  no_filter: boolean
  preview: boolean
}

export interface ScanFormState {
  paths: string
  background: string
  exclude: string
  provider: string
  model: string
  batch: string
  concurrency: number
  timeout: number
  max_tokens: number
  max_tokens_budget: number
  no_plan: boolean
  no_dedup: boolean
  no_summary: boolean
  preview: boolean
  resume: string
}

