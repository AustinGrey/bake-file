<template>
  <ul>
    <li></li>
  </ul>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";

const props = defineProps({
  /**
   * The JSON string value of the 'unit' key in the bakefile.
   *
   * It may be undefined if the 'unit' key was not defined in the file.
   */
  modelValue: {
    type: String as PropType<CustomUnitsDeclaration>,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", newVal: string | undefined): void;
}>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val === "" ? undefined : val);
  },
});
</script>

<style scoped lang="scss"></style>
