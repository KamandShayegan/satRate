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

// One pie per category: aggregate all 1–5 ratings in that category
const CATEGORIES = [
  { id: 'onboarding', label: '1. Onboarding', keys: ['onboardingSmooth'] },
  { id: 'documentation', label: '2. Documentation', keys: ['docEffective', 'docUseLater', 'docClear', 'docComplete', 'docReferToOthers', 'docEasyIntuitive'] },
  { id: 'usability', label: '3. Usability & ease of use', keys: ['usabilityReflected', 'usabilityCommunication', 'usabilityTailored'] },
  { id: 'support', label: '4. Overall support', keys: ['supportFeltSupported', 'supportResponsive', 'supportHadResources', 'supportSolvedIssues'] },
]

// Same order as survey: 😊 (best) → 😞 (worst), i.e. 5 → 1
const EMOJI_LABELS = ['😊', '🙂', '😐', '😕', '😞']

function aggregateCategoryDist(rating, keys) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const k of keys) {
    const d = rating?.[k] || {}
    for (let i = 1; i <= 5; i++) dist[i] = (dist[i] || 0) + (d[i] || 0)
  }
  return dist
}

function categoryHasData(dist) {
  return [1, 2, 3, 4, 5].some(i => (dist[i] || 0) > 0)
}

const categoriesWithData = computed(() => {
  if (!results.value || !(results.value.totalResponses > 0)) return []
  const rating = results.value.rating || {}
  return CATEGORIES.filter(cat => {
    const dist = aggregateCategoryDist(rating, cat.keys)
    return categoryHasData(dist)
  }).map(cat => ({
    ...cat,
    dist: aggregateCategoryDist(rating, cat.keys),
  }))
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

function makeChart(canvas, dist) {
  const ctx = canvas.getContext('2d')
  const labels = EMOJI_LABELS
  const values = [dist[5] || 0, dist[4] || 0, dist[3] || 0, dist[2] || 0, dist[1] || 0] // 😊→5, 😞→1
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
  const containers = resultsRoot.value.querySelectorAll('[data-results-chart]')
  const categories = categoriesWithData.value
  let idx = 0
  for (const cat of categories) {
    const canvas = containers[idx]?.querySelector('canvas')
    if (!canvas) break
    const chart = makeChart(canvas, cat.dist)
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
          v-for="cat in categoriesWithData"
          :key="cat.id"
          class="chart-card card"
          data-results-chart
        >
          <h3 class="chart-title">{{ cat.label }}</h3>
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
