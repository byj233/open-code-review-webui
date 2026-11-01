// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import type { ReviewFormState, ScanFormState } from '@/types';

function quote(value: string | number): string {
  const text = String(value);
  if (text === '') return '""';
  if (/^[A-Za-z0-9_./:=@%+,-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, `'\\''`)}'`;
}

function join(args: Array<string | number>): string {
  return ['ocr', ...args.map(quote)].join(' ');
}

export function reviewCommand(form: ReviewFormState): string {
  const args: Array<string | number> = ['review', '--format', 'json', '--audience', 'human'];
  if (form.mode === 'commit' && form.commit.trim()) {
    args.push('--commit', form.commit.trim());
  }
  if (form.mode === 'range') {
    if (form.from.trim()) args.push('--from', form.from.trim());
    if (form.to.trim()) args.push('--to', form.to.trim());
  }
  if (form.resume.trim()) args.push('--resume', form.resume.trim());
  if (form.background.trim()) args.push('--background', form.background.trim());
  if (form.exclude.trim()) args.push('--exclude', form.exclude.trim());
  if (form.provider.trim()) args.push('--provider', form.provider.trim());
  if (form.model.trim()) args.push('--model', form.model.trim());
  if (form.effort) args.push('--effort', form.effort);
  args.push('--concurrency', form.concurrency);
  args.push('--timeout', form.timeout);
  if (form.max_tokens > 0) args.push('--max-tokens', form.max_tokens);
  if (form.max_tokens_budget > 0) args.push('--max-tokens-budget', form.max_tokens_budget);
  if (form.no_filter) args.push('--no-filter');
  if (form.preview) args.push('--preview');
  return join(args);
}

export function scanCommand(form: ScanFormState): string {
  const args: Array<string | number> = ['scan', '--format', 'json', '--audience', 'human'];
  if (form.paths.trim()) args.push('--path', form.paths.trim());
  if (form.background.trim()) args.push('--background', form.background.trim());
  if (form.exclude.trim()) args.push('--exclude', form.exclude.trim());
  if (form.provider.trim()) args.push('--provider', form.provider.trim());
  if (form.model.trim()) args.push('--model', form.model.trim());
  if (form.batch) args.push('--batch', form.batch);
  args.push('--concurrency', form.concurrency);
  args.push('--timeout', form.timeout);
  if (form.max_tokens > 0) args.push('--max-tokens', form.max_tokens);
  if (form.max_tokens_budget > 0) args.push('--max-tokens-budget', form.max_tokens_budget);
  if (form.no_plan) args.push('--no-plan');
  if (form.no_dedup) args.push('--no-dedup');
  if (form.no_summary) args.push('--no-summary');
  if (form.preview) args.push('--preview');
  if (form.resume.trim()) args.push('--resume', form.resume.trim());
  return join(args);
}

export function createReviewForm(): ReviewFormState {
  return {
    mode: 'workspace',
    from: '',
    to: '',
    commit: '',
    resume: '',
    background: '',
    exclude: '',
    provider: '',
    model: '',
    effort: '',
    concurrency: 8,
    timeout: 15,
    max_tokens: 0,
    max_tokens_budget: 0,
    no_filter: false,
    preview: false,
  };
}

export function createScanForm(): ScanFormState {
  return {
    paths: '',
    background: '',
    exclude: '',
    provider: '',
    model: '',
    batch: '',
    concurrency: 8,
    timeout: 15,
    max_tokens: 0,
    max_tokens_budget: 0,
    no_plan: false,
    no_dedup: false,
    no_summary: false,
    preview: false,
    resume: '',
  };
}
