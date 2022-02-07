<template>
  <ul>
    <li v-for="(unitDef, idx) of modelAsList">
      <input v-model="modelAsList[idx]" />
      <button type="button" @click="convertType(idx)">Change Type</button>
    </li>
    <li>
      <button type="button" @click="modelAsList = [...modelAsList, '']">
        Add
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import {
  Bakefile,
  CustomUnitDefinition,
  isMetricAmount,
  isNonMetricAmount,
} from "../../bakefile";

const props = defineProps({
  /**
   * The JSON string value of the 'unit' key in the bakefile.
   *
   * It may be undefined if the 'unit' key was not defined in the file.
   */
  modelValue: {
    type: [String, Object] as PropType<Bakefile["units"]>,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", newVal: Bakefile["units"]): void;
}>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
  },
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

/**
 * Converts a unit definition from one type to the next, cycling through the list
 * 1. Bare string
 * 2. Amount compared to metric amount in string form
 * 3. Amount compared to metric amount in Array form
 *
 * @param idx the index of the modelAsList array to be converted
 */
function convertType(idx: number) {
  const val = modelAsList.value[idx];
  if (typeof val === "string") {
    if (val.includes("=")) {
      // Is quantity unit string, convert to quantity unit array
      let [first, second] = val.split("=");
      first = first.trim();
      second = second.trim();
      if (isNonMetricAmount(first) && isMetricAmount(second)) {
        modelAsList.value[idx] = [first, second];
      } else {
        console.error(
          "Cannot convert from quantity unit string to quantity unit array"
        );
      }
    } else {
      // Is non-quantity unit, convert to quantity unit string
      modelAsList.value[idx] = `1 ${val} = 1 g`;
    }
  } else {
    // Is quantity unit array, convert to non-quantity unit
    const unitName = val[0].match(/^[0-9]+(\.[0-9]+)? ?(?<unitName>.*)$/)
      ?.groups?.unitName;
    if (unitName === undefined) {
      console.error(
        "Could not detect the name of the unit to convert to non-quantity type"
      );
    } else {
      modelAsList.value[idx] = unitName;
    }
  }
}
</script>

<style scoped lang="scss"></style>
