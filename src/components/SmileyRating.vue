<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: null },
  scale: { type: Number, default: 5 },
})
const emit = defineEmits(['update:modelValue'])

const labels = computed(() => {
  if (props.scale === 5) return ['😊', '🙂', '😐', '😕', '😞'] // happiest left → saddest right
  return Array.from({ length: props.scale }, (_, i) => i + 1)
})

/** Left = happiest = 5, right = saddest = 1 (so higher stored value = better) */
function valueForIndex(i) {
  return props.scale === 5 ? props.scale - i : i + 1
}

function select(i) {
  emit('update:modelValue', valueForIndex(i))
}
</script>

<template>
  <div class="smiley-row">
    <button
      v-for="(label, i) of labels"
      :key="i"
      type="button"
      class="smiley-btn"
      :class="{ active: modelValue === valueForIndex(i) }"
      @click="select(i)"
    >
      {{ typeof label === 'string' ? label : label }}
    </button>
  </div>
</template>

<style scoped>
.smiley-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.smiley-btn {
  width: 2.75rem;
  height: 2.75rem;
  border: 2px solid var(--lavender-soft, #c4b8d4);
  border-radius: 50%;
  background: var(--card);
  font-size: 1.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.smiley-btn:hover {
  transform: scale(1.1);
  border-color: var(--lavender);
  box-shadow: 0 4px 12px rgba(155, 143, 181, 0.25);
}

.smiley-btn.active {
  border-color: var(--lavender);
  background: linear-gradient(135deg, #f0ecf5 0%, #e8e2ef 100%);
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(155, 143, 181, 0.3);
}

.smiley-btn:active {
  animation: pop 0.3s ease;
}
</style>
