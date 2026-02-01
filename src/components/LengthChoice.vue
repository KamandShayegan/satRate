<script setup>
defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const options = [
  { value: 'short', label: 'Too short' },
  { value: 'appropriate', label: 'Just right' },
  { value: 'long', label: 'Too long' },
]
</script>

<template>
  <div class="length-row">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="length-btn"
      :class="{ active: modelValue === opt.value }"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.length-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.length-btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 2px solid var(--sky-soft);
  background: var(--card);
  font-size: 0.9rem;
  color: var(--text);
  transition: transform var(--transition), border-color var(--transition-fast), background var(--transition-fast);
}

.length-btn:hover {
  transform: scale(1.05);
  border-color: var(--sky);
}

.length-btn.active {
  border-color: var(--sky);
  background: linear-gradient(135deg, #e8f4fa 0%, #d8ecf5 100%);
  color: #1a5a7a;
}

.length-btn:active {
  animation: pop 0.25s ease;
}
</style>
