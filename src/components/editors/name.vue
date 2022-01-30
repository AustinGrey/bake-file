<template>
  <textarea v-model="modelValue"></textarea>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: String as PropType<undefined | string>,
  },
});

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", newVal: string | undefined): void;
}>();
</script>

<style scoped lang="scss"></style>
