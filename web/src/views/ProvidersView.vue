<!-- SPDX-License-Identifier: Apache-2.0 -->
<template>
  <div class="page">
    <PageHeader
      eyebrow="Setup"
      title="Providers"
      description="Choose the model that reviews your code. Keys stay in ~/.opencodereview/config.json and are never returned to this page."
    >
      <template #actions>
        <el-button @click="openNewCustom">
          <el-icon class="btn-icon"><Plus /></el-icon>
          Custom provider
        </el-button>
        <el-button type="primary" :disabled="!canTest" :loading="testing" @click="testConnection">
          <el-icon class="btn-icon"><VideoPlay /></el-icon>
          Test connection
        </el-button>
      </template>
    </PageHeader>

    <div v-if="error" class="callout callout--error">
      <el-icon class="callout__icon"><WarningFilled /></el-icon>
      <div class="callout__content">
        <span>{{ error }}</span>
        <el-button size="small" @click="load">Retry</el-button>
      </div>
    </div>

    <section class="active-banner card" :class="{ 'active-banner--off': !active?.configured }">
      <div class="active-banner__mark">
        <BrandMark :size="24" />
      </div>
      <div class="active-banner__body">
        <p class="eyebrow">{{ active?.configured ? 'Active provider' : 'No model configured' }}</p>
        <h2 class="active-banner__title">{{ active?.provider_label || 'Choose a provider below' }}</h2>
        <p class="active-banner__model mono">{{ active?.model || 'No model selected' }}</p>
        <div class="active-banner__meta">
          <span class="chip">
            <span class="dot" :class="active?.configured ? 'dot--green' : 'dot--amber'" />
            {{ authLabel(active?.auth_mode) }}
          </span>
          <span v-if="active?.base_url" class="chip chip--mono" :title="active.base_url">{{ hostOf(active.base_url) }}</span>
          <span v-if="active?.env_var" class="chip chip--mono">{{ active.env_var }}</span>
          <span class="chip chip--ghost">{{ sourceLabel(active?.source) }}</span>
        </div>
      </div>
      <div class="active-banner__actions">
        <el-button v-if="canTest" size="small" :loading="testing" @click="testConnection">
          Test connection
        </el-button>        <el-button v-if="activeCard" size="small" type="primary" @click="openCard(activeCard)">
          Change model
        </el-button>
        <el-button v-else size="small" @click="go('/settings')">Open settings</el-button>
      </div>
    </section>

    <div class="provider-toolbar">
      <div class="provider-toolbar__search">
        <el-input v-model="query" clearable placeholder="Search providers, models, or env vars">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <label class="configured-toggle">
        <el-switch v-model="configuredOnly" size="small" />
        <span>Configured only</span>
      </label>
      <span class="provider-toolbar__count">{{ configuredCount }} of {{ allCards.length }} configured</span>
    </div>

    <section class="provider-section">
      <header class="provider-section__head">
        <h2 class="section-title">Built-in providers</h2>
        <p class="provider-section__sub">Presets ship with endpoints, protocol, and suggested models.</p>
      </header>

      <div v-if="loading" class="provider-grid">
        <div v-for="n in 6" :key="n" class="skeleton" style="height: 190px" />
      </div>

      <div v-else-if="visibleBuiltins.length" class="provider-grid">
        <article
          v-for="card in visibleBuiltins"
          :key="card.name"
          class="provider-card"
          :class="{ 'provider-card--active': card.active }"
        >
          <header class="provider-card__head">
            <span class="provider-card__mark" :class="{ 'provider-card__mark--active': card.active }">
              {{ initial(card) }}
            </span>
            <div class="provider-card__heading">
              <h3 class="provider-card__name">{{ card.display_name }}</h3>
              <p class="provider-card__protocol">{{ protocolLabel(card.protocol) }}</p>
            </div>
            <span v-if="card.active" class="provider-card__active">Active</span>
          </header>

          <div class="provider-card__models">
            <span v-for="model in card.models.slice(0, 3)" :key="model" class="model-chip mono">{{ model }}</span>
            <span v-if="card.models.length > 3" class="model-chip model-chip--more">+{{ card.models.length - 3 }}</span>
            <span v-if="!card.models.length" class="model-chip model-chip--empty">Model list not preset</span>
          </div>

          <p v-if="card.base_url" class="provider-card__endpoint mono" :title="card.base_url">{{ hostOf(card.base_url) }}</p>

          <footer class="provider-card__foot">
            <span class="provider-card__auth">
              <span class="dot" :class="authDot(card)" />
              {{ authLabel(card.auth_mode) }}
              <span v-if="card.env_var" class="provider-card__env mono">{{ card.env_var }}</span>
            </span>
            <el-button size="small" text @click="openCard(card)">
              {{ card.active ? 'Configure' : card.configured ? 'Use' : 'Set up' }}
              <el-icon class="btn-icon-right"><ArrowRight /></el-icon>
            </el-button>
          </footer>
        </article>
      </div>

      <EmptyState
        v-else
        title="No built-in providers match"
        description="Clear the search or turn off the configured-only filter."
      />
    </section>

    <section class="provider-section">
      <header class="provider-section__head">
        <h2 class="section-title">Custom providers</h2>
        <p class="provider-section__sub">Any OpenAI-compatible or Anthropic-compatible endpoint.</p>
      </header>

      <div class="provider-grid">
        <article
          v-for="card in visibleCustom"
          :key="card.name"
          class="provider-card"
          :class="{ 'provider-card--active': card.active }"
        >
          <header class="provider-card__head">
            <span class="provider-card__mark">{{ initial(card) }}</span>
            <div class="provider-card__heading">
              <h3 class="provider-card__name">{{ card.name }}</h3>
              <p class="provider-card__protocol">{{ protocolLabel(card.protocol) }}</p>
            </div>
            <span v-if="card.active" class="provider-card__active">Active</span>
          </header>

          <div class="provider-card__models">
            <span v-for="model in card.models.slice(0, 3)" :key="model" class="model-chip mono">{{ model }}</span>
            <span v-if="!card.models.length" class="model-chip model-chip--empty">{{ card.model || 'No models yet' }}</span>
          </div>
          <p v-if="card.base_url" class="provider-card__endpoint mono" :title="card.base_url">{{ hostOf(card.base_url) }}</p>

          <footer class="provider-card__foot">
            <span class="provider-card__auth">
              <span class="dot" :class="authDot(card)" />
              {{ authLabel(card.auth_mode) }}
            </span>
            <el-button size="small" text @click="openCard(card)">
              Configure
              <el-icon class="btn-icon-right"><ArrowRight /></el-icon>
            </el-button>
          </footer>
        </article>

        <button class="add-card" type="button" @click="openNewCustom">
          <span class="add-card__icon"><el-icon><Plus /></el-icon></span>
          <span class="add-card__title">Add a custom provider</span>
          <span class="add-card__text">Gateway, local proxy, or a private OpenAI-compatible endpoint.</span>
        </button>
      </div>
    </section>

    <el-dialog v-model="dialog.open" :title="dialogTitle" width="540px" append-to-body :close-on-click-modal="!dialog.saving">
      <div class="dialog-intro">
        <p>{{ dialogIntro }}</p>
        <p v-if="dialog.card?.active" class="dialog-intro__active">This provider is currently active.</p>
      </div>

      <el-form label-position="top" class="dialog-form" @submit.prevent="saveProvider">
        <el-form-item v-if="dialog.mode === 'new'" label="Provider name">
          <el-input v-model="dialog.name" placeholder="my-gateway" maxlength="64" />
          <p class="dialog-hint">Letters, digits, dots, and dashes. Used in config keys.</p>
        </el-form-item>

        <el-form-item label="Model">
          <el-select
            v-model="dialog.model"
            class="full-width"
            filterable
            allow-create
            default-first-option
            placeholder="Select or type a model id"
          >
            <el-option v-for="model in dialogModels" :key="model" :label="model" :value="model" />
          </el-select>
        </el-form-item>

        <template v-if="dialog.mode === 'new' || dialog.mode === 'custom'">
          <el-form-item label="Endpoint URL">
            <el-input v-model="dialog.url" placeholder="https://gateway.internal.com/v1" />
          </el-form-item>
          <el-form-item label="Protocol">
            <el-select v-model="dialog.protocol" class="full-width">
              <el-option label="OpenAI chat completions" value="openai" />
              <el-option label="OpenAI responses" value="openai-responses" />
              <el-option label="Anthropic messages" value="anthropic" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item v-if="showsApiKey" label="API key">
          <el-input
            v-model="dialog.apiKey"
            type="password"
            show-password
            autocomplete="off"
            :placeholder="dialogKeyPlaceholder"
          />
          <p class="dialog-hint">
            {{
              dialog.mode === 'new'
                ? 'Optional at this step; you can add it later.'
                : 'Leave blank to keep the stored key. Keys are never shown in this console.'
            }}
          </p>
        </el-form-item>

        <div v-else class="dialog-note">
          <el-icon><InfoFilled /></el-icon>
          <span v-if="dialog.card?.ambient_auth">
            This provider authenticates through the ambient AWS credential chain. Set your AWS
            region and profile in Settings if needed.
          </span>
          <span v-else>
            This provider uses an interactive sign-in. Run <span class="code-inline">ocr auth login</span>
            in a terminal, then return here.
          </span>
        </div>

        <div v-if="dialog.error" class="dialog-error">{{ dialog.error }}</div>
      </el-form>

      <template #footer>
        <el-button :disabled="dialog.saving" @click="dialog.open = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="saveProvider">
          {{ dialog.mode === 'new' ? 'Add provider' : dialog.card?.active ? 'Save model' : 'Use provider' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  InfoFilled,
  Plus,
  Search,
  VideoPlay,
  WarningFilled,
} from '@element-plus/icons-vue'
import BrandMark from '@/components/BrandMark.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import { api, errorMessage } from '@/api/client'
import { useMetaStore } from '@/stores/meta'
import { authLabel, sourceLabel } from '@/utils/status'
import type { ProviderCard, ProvidersResponse } from '@/types'

const router = useRouter()
const { meta, refresh } = useMetaStore()

const data = ref<ProvidersResponse | null>(null)
const loading = ref(true)
const error = ref('')
const query = ref('')
const configuredOnly = ref(false)
const testing = ref(false)

type DialogMode = 'builtin' | 'custom' | 'new'

const dialog = reactive({
  open: false,
  mode: 'builtin' as DialogMode,
  card: null as ProviderCard | null,
  name: '',
  model: '',
  apiKey: '',
  url: '',
  protocol: 'openai',
  saving: false,
  error: '',
})

const active = computed(() => data.value?.active ?? meta.value?.config.active)
const canTest = computed(() => Boolean(active.value?.model))
const allCards = computed(() => [...(data.value?.providers ?? []), ...(data.value?.custom ?? [])])
const configuredCount = computed(() => allCards.value.filter((card) => card.configured).length)
const activeCard = computed(() => allCards.value.find((card) => card.name === active.value?.provider) ?? null)

const filteredCards = computed(() => {
  const term = query.value.trim().toLowerCase()
  return allCards.value.filter((card) => {
    if (configuredOnly.value && !card.configured) return false
    if (!term) return true
    const haystack = [
      card.name,
      card.display_name,
      card.protocol,
      card.base_url,
      card.env_var,
      ...card.models,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(term)
  })
})

const visibleBuiltins = computed(() =>
  filteredCards.value
    .filter((card) => !card.custom)
    .sort((left, right) => {
      if (left.active !== right.active) return left.active ? -1 : 1
      if (left.configured !== right.configured) return left.configured ? -1 : 1
      return left.display_name.localeCompare(right.display_name)
    }),
)
const visibleCustom = computed(() => filteredCards.value.filter((card) => card.custom))

const dialogModels = computed(() => {
  const models = [...(dialog.card?.models ?? [])]
  if (dialog.model && !models.includes(dialog.model)) models.unshift(dialog.model)
  return models
})
const showsApiKey = computed(() => {
  const card = dialog.card
  if (dialog.mode === 'new') return true
  if (!card) return false
  return !card.ambient_auth && !card.external_auth
})
const dialogTitle = computed(() => {
  if (dialog.mode === 'new') return 'Add custom provider'
  if (dialog.card?.active) return 'Configure active provider'
  return dialog.card ? `Configure ${dialog.card.display_name}` : 'Configure provider'
})
const dialogIntro = computed(() => {
  if (dialog.mode === 'new') return 'Point the console at an endpoint you control. Protocol and URL are stored in custom_providers.'
  if (dialog.card?.active) return 'Changing the model writes it to the active provider. Stored keys are kept unless you paste a new one.'
  return 'Select the model to use for this provider, then enable it for review and scan runs.'
})
const dialogKeyPlaceholder = computed(() =>
  dialog.mode !== 'new' && dialog.card?.key_set ? 'Stored key present - paste to replace' : 'Paste an API key',
)

function initial(card: ProviderCard): string {
  const name = card.display_name || card.name
  return name.charAt(0).toUpperCase()
}

function hostOf(url?: string): string {
  if (!url) return '--'
  try {
    return new URL(url).host || url
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0]
  }
}

function protocolLabel(protocol?: string): string {
  switch (protocol) {
    case 'anthropic':
      return 'Anthropic messages'
    case 'openai':
      return 'OpenAI compatible'
    case 'openai-responses':
      return 'OpenAI responses'
    case 'anthropic-bedrock':
      return 'AWS Bedrock'
    default:
      return protocol || 'Protocol not set'
  }
}

function authDot(card: ProviderCard): string {
  if (card.configured) return 'dot--green'
  if (card.auth_mode === 'sign_in') return 'dot--amber'
  return ''
}

function openCard(card: ProviderCard): void {
  dialog.open = true
  dialog.mode = card.custom ? 'custom' : 'builtin'
  dialog.card = card
  dialog.name = card.name
  dialog.model = card.model || card.models[0] || ''
  dialog.apiKey = ''
  dialog.url = card.base_url || ''
  dialog.protocol = card.protocol || 'openai'
  dialog.saving = false
  dialog.error = ''
}

function openNewCustom(): void {
  dialog.open = true
  dialog.mode = 'new'
  dialog.card = null
  dialog.name = ''
  dialog.model = ''
  dialog.apiKey = ''
  dialog.url = ''
  dialog.protocol = 'openai'
  dialog.saving = false
  dialog.error = ''
}

function validateDialog(): string {
  if (!dialog.model.trim()) return 'Choose a model for this provider.'
  if (dialog.mode === 'new' || dialog.mode === 'custom') {
    if (!dialog.url.trim()) return 'An endpoint URL is required.'
    if (!/^https?:\/\/[^\s]+$/i.test(dialog.url.trim())) return 'The endpoint must start with http:// or https://.'
  }
  if (dialog.mode === 'new') {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(dialog.name.trim())) {
      return 'Provider names may contain letters, digits, dots, and dashes.'
    }
    if (allCards.value.some((card) => !card.custom && card.name === dialog.name.trim())) {
      return 'That name belongs to a built-in provider.'
    }
  }
  return ''
}

async function saveProvider(): Promise<void> {
  const validation = validateDialog()
  if (validation) {
    dialog.error = validation
    return
  }
  const card = dialog.card
  dialog.saving = true
  dialog.error = ''
  try {
    await api.activateProvider({
      name: dialog.mode === 'new' ? dialog.name.trim() : card?.name ?? '',
      model: dialog.model.trim(),
      api_key: dialog.apiKey.trim() || undefined,
      url: dialog.mode === 'new' || dialog.mode === 'custom' ? dialog.url.trim() : undefined,
      protocol: dialog.mode === 'new' || dialog.mode === 'custom' ? dialog.protocol : undefined,
      create_custom: dialog.mode === 'new',
    })
    dialog.open = false
    ElMessage.success(dialog.mode === 'new' ? 'Custom provider added' : 'Provider activated')
    await Promise.all([load(), refresh(true)])
  } catch (err) {
    dialog.error = errorMessage(err)
  } finally {
    dialog.saving = false
  }
}

async function testConnection(): Promise<void> {
  testing.value = true
  try {
    const job = await api.testConnection()
    await router.push(`/runs/${job.id}`)
  } catch (err) {
    ElMessage.error(errorMessage(err))
  } finally {
    testing.value = false
  }
}

function go(path: string): void {
  void router.push(path)
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    data.value = await api.providers()
    if (data.value.error) error.value = data.value.error
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([load(), refresh()])
})
</script>

<style scoped>
.active-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-color: rgba(201, 100, 66, 0.22);
  background:
    radial-gradient(440px 180px at 8% 0%, rgba(201, 100, 66, 0.1), transparent 68%),
    var(--surface);
}

.active-banner--off {
  border-color: rgba(168, 120, 35, 0.24);
  background:
    radial-gradient(440px 180px at 8% 0%, rgba(168, 120, 35, 0.08), transparent 68%),
    var(--surface);
}

.active-banner__mark {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--accent-softer);
  flex: none;
}

.active-banner__body {
  flex: 1;
  min-width: 0;
}

.active-banner__title {
  margin-top: 3px;
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.active-banner__model {
  margin-top: 1px;
  color: var(--ink-faint);
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-banner__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.active-banner__actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  flex: none;
}

.provider-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.provider-toolbar__search {
  width: 330px;
  max-width: 100%;
}

.configured-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--ink-muted);
  font-size: 11.5px;
  cursor: pointer;
}

.provider-toolbar__count {
  margin-left: auto;
  color: var(--ink-faint);
  font-size: 10.5px;
}

.provider-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-section__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.provider-section__sub {
  color: var(--ink-faint);
  font-size: 11.5px;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.provider-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 16px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-xs);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}

.provider-card:hover {
  border-color: var(--line-strong);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.provider-card--active {
  border-color: rgba(201, 100, 66, 0.4);
  box-shadow: 0 0 0 3px rgba(201, 100, 66, 0.06);
}

.provider-card__head {
  display: flex;
  align-items: center;
  gap: 9px;
}

.provider-card__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--bg-tint);
  color: var(--ink-muted);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  flex: none;
}

.provider-card__mark--active {
  border-color: rgba(201, 100, 66, 0.25);
  background: var(--accent-softer);
  color: var(--accent-ink);
}

.provider-card__heading {
  min-width: 0;
  flex: 1;
}

.provider-card__name {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-card__protocol {
  margin-top: 1px;
  color: var(--ink-faint);
  font-size: 9.5px;
}

.provider-card__active {
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex: none;
}

.provider-card__models {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  min-height: 21px;
}

.model-chip {
  padding: 2px 6px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--bg-tint);
  color: var(--ink-muted);
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.model-chip--more {
  color: var(--ink-faint);
  background: transparent;
}

.model-chip--empty {
  border-style: dashed;
  color: var(--ink-faint);
  background: transparent;
}

.provider-card__endpoint {
  color: var(--ink-faint);
  font-size: 9.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 9px;
  border-top: 1px solid var(--line);
}

.provider-card__auth {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: var(--ink-faint);
  font-size: 9.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-card__env {
  display: none;
  margin-left: 2px;
  font-size: 8.5px;
}

.provider-card__foot :deep(.el-button) {
  height: 26px;
  padding: 0 6px;
  font-size: 10.5px;
}

.btn-icon-right {
  margin-left: 2px;
  font-size: 10px;
}

.add-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  min-height: 154px;
  padding: 18px;
  border: 1px dashed var(--line-strong);
  border-radius: 13px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.add-card:hover {
  border-color: var(--accent);
  background: var(--accent-softer);
}

.add-card__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-bottom: 4px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--accent);
  font-size: 13px;
}

.add-card__title {
  color: var(--ink-strong);
  font-size: 12px;
  font-weight: 650;
}

.add-card__text {
  color: var(--ink-faint);
  font-size: 10.5px;
  line-height: 1.55;
}

.dialog-intro p {
  color: var(--ink-muted);
  font-size: 12px;
  line-height: 1.6;
}

.dialog-intro__active {
  margin-top: 4px;
  color: var(--accent-ink);
  font-weight: 600;
}

.dialog-form {
  margin-top: 15px;
}

.full-width {
  width: 100%;
}

.dialog-hint {
  margin-top: 4px;
  color: var(--ink-faint);
  font-size: 10.5px;
  line-height: 1.5;
}

.dialog-note {
  display: flex;
  gap: 7px;
  padding: 10px 11px;
  border-radius: 8px;
  background: var(--bg-tint);
  color: var(--ink-muted);
  font-size: 11px;
  line-height: 1.55;
}

.dialog-error {
  margin-top: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 11px;
  line-height: 1.5;
}

.btn-icon {
  margin-right: 5px;
}

.callout__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex: 1;
}

@media (max-width: 1180px) {
  .provider-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .active-banner {
    flex-wrap: wrap;
  }

  .active-banner__actions {
    width: 100%;
  }
}

@media (max-width: 720px) {
  .provider-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .provider-toolbar__search {
    width: 100%;
  }

  .provider-toolbar__count {
    margin-left: 0;
  }
}
</style>
