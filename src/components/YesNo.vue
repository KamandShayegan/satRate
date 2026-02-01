<script setup>
defineProps({
  modelValue: { type: Boolean, default: null },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="yesno-row">
    <button
      type="button"
      class="yn-btn yes"
      :class="{ active: modelValue === true }"
      @click="$emit('update:modelValue', true)"
    >
      Yes
    </button>
    <button
      type="button"
      class="yn-btn no"
      :class="{ active: modelValue === false }"
      @click="$emit('update:modelValue', false)"
    >
      No
    </button>
  </div>
</template>

<style scoped>
.yesno-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.yn-btn {
  min-width: 4rem;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-sm);
  border: 2px solid var(--text-muted);
  background: var(--card);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  transition: transform var(--transition), border-color var(--transition-fast), background var(--transition-fast);
}

.yn-btn:hover {
  transform: scale(1.05);
}

.yn-btn.yes.active {
  border-color: var(--mint);
  background: linear-gradient(135deg, #e8f5ee 0%, #d4ede0 100%);
  color: #2d5a45;
}

.yn-btn.no.active {
  border-color: var(--coral-soft);
  background: linear-gradient(135deg, #fef2ef 0%, #fce8e2 100%);
  color: #8b451a;
}

.yn-btn:active {
  animation: pop 0.25s ease;
}
</style>
