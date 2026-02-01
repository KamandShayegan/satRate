<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const results = ref(null)
const loading = ref(false)
const error = ref('')
const chartInstances = ref([])

const QUESTION_LABELS = {
  onboardingSmooth: 'How smooth was the onboarding process?',
  onboardingLength: 'Was the length appropriate?',
  docEffective: 'How effective was the documentation?',
  docUseLater: 'How likely to use documentation later?',
  docClear: 'How clear was the documentation?',
  docComplete: 'Was the documentation complete?',
  docReferToOthers: 'How likely to refer others to the doc?',
  docEasyIntuitive: 'How easy and intuitive was the documentation?',
  usabilityReflected: 'How well did it reflect what you needed to know?',
  usabilityCommunication: 'How effective was the communication?',
  usabilityTailored: 'How effective was the information for your role?',
  supportFeltSupported: 'Did you feel supported?',
  supportResponsive: 'How responsive was support?',
  supportHadResources: 'Did you get the resources you needed?',
  supportSolvedIssues: 'Did support help you solve your issues?',
}

const RATING_KEYS = [
  'onboardingSmooth',
  'docEffective', 'docUseLater', 'docClear', 'docComplete', 'docReferToOthers', 'docEasyIntuitive',
  'usabilityReflected', 'usabilityCommunication', 'usabilityTailored',
  'supportFeltSupported', 'supportResponsive', 'supportHadResources', 'supportSolvedIssues',
]
const LENGTH_KEYS = ['onboardingLength']
const LENGTH_LABELS = { short: 'Too short', appropriate: 'Just right', long: 'Too long' }

const ALL_KEYS = [...RATING_KEYS, ...LENGTH_KEYS]

function keyHasData(results, key) {
  if (!results) return false
  const dist = LENGTH_KEYS.includes(key) ? (results.length?.[key] || {}) : (results.rating?.[key] || {})
  const values = LENGTH_KEYS.includes(key) ? Object.values(dist) : [dist[1], dist[2], dist[3], dist[4], dist[5]].map(v => v || 0)
  return values.some(v => v > 0)
}

const keysWithData = computed(() => {
  if (!results.value || !(results.value.totalResponses > 0)) return []
  return ALL_KEYS.filter(k => keyHasData(results.value, k))
})

const PIE_COLORS = [
  'rgba(224, 124, 92, 0.8)',   // coral
  'rgba(155, 143, 181, 0.8)',   // lavender
  'rgba(129, 178, 154, 0.8)',   // mint
  'rgba(126, 184, 218, 0.8)',   // sky
  'rgba(168, 213, 186, 0.8)',   // mint-soft
]

async function fetchResults() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/results')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.error || 'Failed to load results'
      results.value = null
      return
    }
    results.value = data
  } catch (e) {
    error.value = 'Could not load results. Check your connection.'
    results.value = null
  } finally {
    loading.value = false
  }
}

function makeChart(canvas, dist, isLength = false) {
  const ctx = canvas.getContext('2d')
  const labels = isLength
    ? Object.keys(dist).map(k => LENGTH_LABELS[k] || k)
    : ['1', '2', '3', '4', '5']
  const values = isLength
    ? Object.values(dist)
    : [dist[1] || 0, dist[2] || 0, dist[3] || 0, dist[4] || 0, dist[5] || 0]
  const total = values.reduce((a, b) => a + b, 0)
  if (total === 0) return null
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: PIE_COLORS.slice(0, labels.length),
        borderWidth: 1,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  })
}

const resultsRoot = ref(null)

function renderCharts() {
  if (!results.value || !props.open || !resultsRoot.value) return
  chartInstances.value.forEach(c => c?.destroy())
  chartInstances.value = []
  const rating = results.value.rating || {}
  const length = results.value.length || {}
  const containers = resultsRoot.value.querySelectorAll('[data-results-chart]')
  const keys = keysWithData.value
  let idx = 0
  for (const key of keys) {
    const canvas = containers[idx]?.querySelector('canvas')
    if (!canvas) break
    const dist = LENGTH_KEYS.includes(key) ? (length[key] || {}) : (rating[key] || {})
    const chart = makeChart(canvas, dist, LENGTH_KEYS.includes(key))
    if (chart) chartInstances.value.push(chart)
    idx++
  }
}

watch(() => props.open, (open) => {
  if (open && !results.value && !loading.value) fetchResults()
  if (open && results.value) nextTick(renderCharts)
})

watch(results, () => {
  if (props.open) nextTick(renderCharts)
}, { deep: true })

onMounted(() => {
  if (props.open) fetchResults()
})

onUnmounted(() => {
  chartInstances.value.forEach(c => c?.destroy())
})
</script>

<template>
  <div v-if="open" ref="resultsRoot" class="results-view">
    <div class="results-header">
      <h2 class="results-title">Results</h2>
      <slot name="close" />
    </div>

    <div v-if="loading" class="results-loading">Loading results…</div>
    <div v-else-if="error" class="results-error">{{ error }}</div>
    <div v-else-if="results && !(results.totalResponses > 0)" class="results-empty">
      No results yet.
    </div>
    <div v-else-if="results && results.totalResponses > 0" class="results-content">
      <p class="results-total">{{ results.totalResponses }} response{{ results.totalResponses !== 1 ? 's' : '' }} recorded.</p>
      <div class="results-charts">
        <div
          v-for="key in keysWithData"
          :key="key"
          class="chart-card card"
          data-results-chart
        >
          <h3 class="chart-title">{{ QUESTION_LABELS[key] || key }}</h3>
          <div class="chart-wrap">
            <canvas />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-view {
  margin-top: 1.5rem;
  padding: 1.25rem 0;
  border-top: 1px solid #e8e4e0;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}

.results-loading,
.results-error,
.results-empty {
  padding: 1.5rem;
  text-align: center;
  color: var(--text-muted);
}

.results-error {
  color: var(--coral);
}

.results-total {
  margin: 0 0 1.25rem;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.results-charts {
  display: grid;
  gap: 1.25rem;
}

.chart-card {
  padding: 1.25rem;
}

.chart-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--text);
}

.chart-wrap {
  position: relative;
  max-width: 280px;
  margin: 0 auto;
  height: 220px;
}
</style>
