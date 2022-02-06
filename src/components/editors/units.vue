<template>
  <ul>
    <li v-for="(unitDef, idx) of modelAsList">
      <input v-model="modelAsList[idx]" />
    </li>
    <li><button type="button" @click="modelAsList.push('')">Add</button></li>
  </ul>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { Bakefile, CustomUnitDefinition, isMetricAmount } from "../../bakefile";

const props = defineProps({
  /**
   * The JSON string value of the 'unit' key in the bakefile.
   *
   * It may be undefined if the 'unit' key was not defined in the file.
   */
  modelValue: {
    type: Object as PropType<Bakefile["units"]>,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", newVal: Bakefile["units"]): void;
}>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Normalizes the model value to the 'array of definitions' form
const modelAsList = computed<CustomUnitDefinition[]>({
  get: () => {
    // Detect undefined
    if (props.modelValue === undefined) return [];
    /*
   Detect the single value form, which is either a simple string, or an array
   of exactly two values with the second value being a metric unit
   */
    if (
      typeof props.modelValue === "string" ||
      (Array.isArray(props.modelValue) &&
        props.modelValue.length === 2 &&
        isMetricAmount(props.modelValue[1]))
    ) {
      return [props.modelValue as CustomUnitDefinition];
    }
    if (Array.isArray(props.modelValue)) return props.modelValue;
    console.error("Unable to normalize the value of the 'units' key.");
    return [];
  },
  set: (val) => {
    if (val.length === 1) {
      // For simplicity, if only one item is in the list, just write that item
      // rather than a one item list
      modelValue.value = val[0];
    } else {
      modelValue.value = val;
    }
  },
});
</script>

<style scoped lang="scss"></style>
