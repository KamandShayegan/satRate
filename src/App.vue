<script setup>
import { reactive, computed, ref, watch } from 'vue'
import SmileyRating from './components/SmileyRating.vue'
import YesNo from './components/YesNo.vue'
import LengthChoice from './components/LengthChoice.vue'
import ResultsView from './components/ResultsView.vue'

const form = reactive({
  // 1. Onboarding
  onboardingSmooth: null,
  onboardingLength: '',
  // 2. Documentation
  docEffective: null,
  docUseLater: null,
  docClear: null,
  docComplete: null,
  docFeedback: '',
  docReferToOthers: null,
  docEasyIntuitive: null,
  // 3. Usability
  usabilityReflected: null,
  usabilityCommunication: null,
  usabilityTailored: null,
  // 4. Overall support
  supportFeltSupported: null,
  supportResponsive: null,
  supportHadResources: null,
  supportSolvedIssues: null,
  suggestions: '',
})

const submitted = ref(false)
const showMandatoryMessage = ref(false)
const submitError = ref('')
const resultsOpen = ref(false)

const requiredRatingKeys = [
  'onboardingSmooth',
  'docEffective', 'docUseLater', 'docClear', 'docComplete', 'docReferToOthers', 'docEasyIntuitive',
  'usabilityReflected', 'usabilityCommunication', 'usabilityTailored',
  'supportFeltSupported', 'supportResponsive', 'supportHadResources', 'supportSolvedIssues',
]

const isFormComplete = computed(() => {
  const ratingsOk = requiredRatingKeys.every(k => typeof form[k] === 'number' && form[k] >= 1 && form[k] <= 5)
  const lengthOk = ['short', 'appropriate', 'long'].includes(form.onboardingLength)
  return ratingsOk && lengthOk
})

watch(isFormComplete, (complete) => {
  if (complete) showMandatoryMessage.value = false
})

function sectionNumericKeys(sectionKeys) {
  return sectionKeys.filter(k => typeof form[k] === 'number')
}

const section1Avg = computed(() => {
  const keys = sectionNumericKeys(['onboardingSmooth'])
  if (!keys.length) return null
  const sum = keys.reduce((s, k) => s + form[k], 0)
  return (sum / keys.length).toFixed(1)
})

const section2Avg = computed(() => {
  const keys = sectionNumericKeys(['docEffective', 'docUseLater', 'docClear', 'docComplete', 'docReferToOthers', 'docEasyIntuitive'])
  if (!keys.length) return null
  const sum = keys.reduce((s, k) => s + form[k], 0)
  return (sum / keys.length).toFixed(1)
})

const section3Avg = computed(() => {
  const keys = sectionNumericKeys(['usabilityReflected', 'usabilityCommunication', 'usabilityTailored'])
  if (!keys.length) return null
  const sum = keys.reduce((s, k) => s + form[k], 0)
  return (sum / keys.length).toFixed(1)
})

const section4Avg = computed(() => {
  const keys = sectionNumericKeys(['supportFeltSupported', 'supportResponsive', 'supportHadResources', 'supportSolvedIssues'])
  if (!keys.length) return null
  const sum = keys.reduce((s, k) => s + form[k], 0)
  return (sum / keys.length).toFixed(1)
})

const totalAvg = computed(() => {
  const avgs = [section1Avg.value, section2Avg.value, section3Avg.value, section4Avg.value].filter(Boolean).map(Number)
  if (!avgs.length) return null
  return (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1)
})

async function submit() {
  if (!isFormComplete.value) {
    showMandatoryMessage.value = true
    return
  }
  submitError.value = ''
  const payload = { ...form, submittedAt: new Date().toISOString() }
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      submitError.value = data.error || 'Something went wrong. Please try again.'
      return
    }
    submitted.value = true
  } catch (e) {
    submitError.value = 'Could not send. Check your connection and try again.'
  }
}

const initialForm = {
  onboardingSmooth: null,
  onboardingLength: '',
  docEffective: null,
  docUseLater: null,
  docClear: null,
  docComplete: null,
  docFeedback: '',
  docReferToOthers: null,
  docEasyIntuitive: null,
  usabilityReflected: null,
  usabilityCommunication: null,
  usabilityTailored: null,
  supportFeltSupported: null,
  supportResponsive: null,
  supportHadResources: null,
  supportSolvedIssues: null,
  suggestions: '',
}

function startOver() {
  Object.assign(form, initialForm)
  submitted.value = false
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>satRate</h1>
      <p class="subtitle">Kamand’s personal knowledge transfer satisfaction survey</p>
    </header>

    <ResultsView :open="resultsOpen">
      <template #close>
        <button type="button" class="close-results-btn" @click="resultsOpen = false">Close</button>
      </template>
    </ResultsView>

    <div v-if="!resultsOpen">
    <div class="anonymous-banner card" v-if="!submitted">
      <strong>Anonymous feedback</strong> — Your answers are anonymous. No one will see individual responses; only aggregated results are used to improve onboarding.
    </div>

    <div v-if="submitted" class="thank-you card">
      <p class="thank-you-message">All results have been saved. Thank you for participating.</p>
      <button type="button" class="start-over-btn" @click="startOver">Start over</button>
    </div>

    <form v-else @submit.prevent="submit" class="form">
      <!-- 1. Onboarding -->
      <section class="section card animate-in" style="animation-delay: 0.05s">
        <h2 class="section-title">1. Onboarding</h2>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How smooth was the onboarding process?</label>
          <SmileyRating v-model="form.onboardingSmooth" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> Was the length of the onboarding appropriate?</label>
          <LengthChoice v-model="form.onboardingLength" />
        </div>
      </section>

      <!-- 2. Documentation -->
      <section class="section card animate-in" style="animation-delay: 0.1s">
        <h2 class="section-title">2. Documentation</h2>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How effective was the documentation?</label>
          <SmileyRating v-model="form.docEffective" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How likely are you to use the documentation later?</label>
          <SmileyRating v-model="form.docUseLater" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How clear was the documentation?</label>
          <SmileyRating v-model="form.docClear" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> Was the documentation complete?</label>
          <SmileyRating v-model="form.docComplete" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How likely are you to refer others to sections of the documentation?</label>
          <SmileyRating v-model="form.docReferToOthers" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How easy and intuitive was the documentation to use?</label>
          <SmileyRating v-model="form.docEasyIntuitive" :scale="5" />
        </div>
        <div class="guide-banner card">
          <strong>A quick note</strong> — We encourage you to make the documentation more complete (e.g. in Notion). Your additions help others and the team in general.
        </div>
        <div class="question">
          <label class="question-label">Any additional feedback on the documentation? (optional)</label>
          <textarea
            v-model="form.docFeedback"
            class="feedback-input"
            rows="3"
            placeholder="Your comments..."
          />
        </div>
      </section>

      <!-- 3. Usability / Ease of use -->
      <section class="section card animate-in" style="animation-delay: 0.15s">
        <h2 class="section-title">3. Usability &amp; ease of use</h2>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How well did the onboarding reflect what you needed to know?</label>
          <SmileyRating v-model="form.usabilityReflected" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How effective was the communication during your onboarding?</label>
          <SmileyRating v-model="form.usabilityCommunication" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How effective do you think the information was for your role?</label>
          <SmileyRating v-model="form.usabilityTailored" :scale="5" />
        </div>
      </section>

      <!-- 4. Overall support -->
      <section class="section card animate-in" style="animation-delay: 0.2s">
        <h2 class="section-title">4. Overall support</h2>
        <div class="question">
          <label class="question-label"><span class="required">*</span> Did you feel supported during onboarding?</label>
          <SmileyRating v-model="form.supportFeltSupported" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> How responsive was support when you needed it?</label>
          <SmileyRating v-model="form.supportResponsive" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> Did you get the resources you needed when you sought help?</label>
          <SmileyRating v-model="form.supportHadResources" :scale="5" />
        </div>
        <div class="question">
          <label class="question-label"><span class="required">*</span> Did the support help you solve your issues?</label>
          <SmileyRating v-model="form.supportSolvedIssues" :scale="5" />
        </div>
      </section>

      <div class="summary card" v-if="totalAvg">
        <strong>Your overall satisfaction (average):</strong> {{ totalAvg }} / 5
      </div>

      <div class="question">
        <label class="question-label">Any suggestions? (optional)</label>
        <textarea
          v-model="form.suggestions"
          class="feedback-input"
          rows="3"
          placeholder="Your suggestions..."
        />
      </div>

      <p v-if="showMandatoryMessage" class="mandatory-message">Please answer all mandatory questions.</p>
      <p v-if="submitError" class="submit-error">{{ submitError }}</p>
      <button type="submit" class="submit-btn" :class="{ 'submit-btn--disabled': !isFormComplete }">Submit feedback</button>
    </form>

    <div class="results-footer">
      <button
        v-if="!resultsOpen"
        type="button"
        class="results-btn"
        @click="resultsOpen = true"
      >
        Previously submitted results
      </button>
    </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 520px;
  margin: 0 auto;
}

.header {
  margin-bottom: 1.5rem;
}

.header {
  text-align: center;
}

.header .subtitle {
  margin-bottom: 0.75rem;
}

.results-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  text-align: center;
  border-top: 1px solid #e8e4e0;
}

.header h1 {
  margin: 0;
  background: linear-gradient(135deg, var(--coral) 0%, var(--lavender) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2rem;
}

.results-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(155, 143, 181, 0.4);
  background: linear-gradient(135deg, rgba(224, 124, 92, 0.12) 0%, rgba(155, 143, 181, 0.12) 100%);
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(45, 42, 38, 0.06);
  transition: transform var(--transition), border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
}

.results-btn:hover {
  border-color: var(--lavender-soft);
  background: linear-gradient(135deg, rgba(224, 124, 92, 0.2) 0%, rgba(155, 143, 181, 0.2) 100%);
  box-shadow: 0 2px 6px rgba(45, 42, 38, 0.08);
  transform: scale(1.05);
}

.close-results-btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: none;
  background: linear-gradient(135deg, var(--coral) 0%, var(--lavender) 100%);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}

.close-results-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(155, 143, 181, 0.35);
}

.guide-banner,
.anonymous-banner {
  background: linear-gradient(135deg, #f0f9f4 0%, #e8f4fa 100%);
  border: 1px solid var(--mint-soft);
  padding: 1.25rem 1.5rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: var(--text);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.anonymous-banner {
  margin-bottom: 1.5rem;
}

.thank-you {
  text-align: center;
  padding: 2rem 1.5rem;
}

.thank-you-message {
  margin: 0 0 1.5rem;
  font-size: 1.05rem;
  color: var(--text);
}

.start-over-btn {
  display: block;
  width: 100%;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius);
  border: none;
  background: linear-gradient(135deg, var(--coral) 0%, var(--lavender) 100%);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition), opacity 0.2s ease;
}

.start-over-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 24px rgba(224, 124, 92, 0.35);
}

.section {
  margin-bottom: 1.25rem;
}

.question-label .required {
  color: var(--coral);
  margin-right: 0.15rem;
}

.section .question {
  margin-bottom: 1.25rem;
}

.section .question:last-of-type {
  margin-bottom: 0.5rem;
}

.section-score {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.feedback-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border: 2px solid #e8e4e0;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.feedback-input:focus {
  outline: none;
  border-color: var(--lavender);
  box-shadow: 0 0 0 3px rgba(155, 143, 181, 0.2);
}

.summary {
  background: linear-gradient(135deg, #fef9f5 0%, #f5f0fc 100%);
  border: 1px solid var(--lavender-soft);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.submit-btn {
  width: 100%;
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--coral) 0%, var(--lavender) 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}

.submit-btn:hover:not(.submit-btn--disabled) {
  transform: scale(1.02);
  box-shadow: 0 6px 24px rgba(155, 143, 181, 0.4);
}

.submit-btn:active:not(.submit-btn--disabled) {
  animation: pop 0.3s ease;
}

.submit-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mandatory-message {
  margin: 0 0 0.75rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  color: var(--coral);
  font-weight: 500;
  background: #fef5f2;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--coral);
}

.submit-error {
  margin: 0 0 0.75rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  color: #c0392b;
  font-weight: 500;
  background: #fdf2f0;
  border-radius: var(--radius-sm);
  border-left: 3px solid #c0392b;
}
</style>
