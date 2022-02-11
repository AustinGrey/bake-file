<template>
  {{ state.units }}
  <ul>
    <li v-for="(unitDef, idx) of state.units">
      <span class="unit-input">
        <input v-model="state.units[idx].custom" />
        <template v-if="state.units[idx].type !== 'incomparable'">
          <span>=</span>
          <input v-model="state.units[idx].metric" />
        </template>
      </span>
      <button type="button" @click="convertType(idx)">Change Type</button>
      <button type="button" @click="state.units.splice(idx, 1)">Remove</button>
    </li>
    <li>
      <button
        type="button"
        @click="state.units.push({ custom: 'my unit', type: 'incomparable' })"
      >
        Add
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, PropType, ref, reactive, watch } from "vue";
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
/*
The units key is very dynamic, in order to cover a wide range of ways humans
express a unit. While in the ideal situtation you would want to bind vue directly
to the data structure we want to modify, here it is simpler to create our own
internal representation, and the provide glue code that will import into
this IR, and export from this IR to the bound value.

This representation is machine optimized, and allows storing information
about a type that would otherwise be lost as we cycle through. E.g. if someone
specified 1 foo = 1.35 g, but then decides to make it an incomparable unit, foo,
but then changes their mind and instead want to go back to a comparable unit,
we can remember the 1.35 g they had entered previously. It also allows the user
to enter an intermediary, invalid state, such as converting to a comparable unit
but we don't emit the change until they specify what unit to convert to.
*/
type CustomUnitIr = {
  custom: string;
  metric?: string;
  type: "comparable-string" | "comparable-array" | "incomparable";
};

// Normalize the value to a CustomUnitIr[] format
const normalizedModelValue = computed<CustomUnitIr[]>(() => {
  // First phase: normalize the array to a CustomUnitDefinition[]
  let customUnitDefinitionModelValue: CustomUnitDefinition[];
  if (props.modelValue === undefined) {
    // Detect undefined
    customUnitDefinitionModelValue = [];
  } else if (
    typeof props.modelValue === "string" ||
    (Array.isArray(props.modelValue) &&
      props.modelValue.length === 2 &&
      isMetricAmount(props.modelValue[1]))
  ) {
    /*
     Detect the single value form, which is either a simple string, or an array
     of exactly two values with the second value being a metric unit
     */
    customUnitDefinitionModelValue = [props.modelValue as CustomUnitDefinition];
  } else if (Array.isArray(props.modelValue)) {
    customUnitDefinitionModelValue = props.modelValue;
  } else {
    console.error("Unable to normalize the value of the 'units' key.");
    customUnitDefinitionModelValue = [];
  }

  // Second phase: convert all entries to CustomUnitIr
  return customUnitDefinitionModelValue.map<CustomUnitIr>((cud) => {
    if (typeof cud === "string") {
      if (cud.includes("=")) {
        // Is comparable-string
        let [custom, metric] = cud.split("=");
        custom = custom.trim();
        metric = metric.trim();
        return {
          custom,
          metric,
          type: "comparable-string",
        };
      }
      // Is incomparable
      return {
        custom: cud,
        type: "incomparable",
      };
    }
    // Is comparable-array
    let [custom, metric] = cud;
    return {
      custom,
      metric,
      type: "comparable-array",
    };
  });
});

const emit = defineEmits<{
  (e: "update:modelValue", newVal: Bakefile["units"]): void;
}>();

const state = reactive({
  units: [] as CustomUnitIr[],
  validationErrors: [] as string[],
});

/**
 * Imports the model value to the IR
 */
watch(
  normalizedModelValue,
  (newValue, oldValue) => {
    // Because we have circular reactivity from the prop to the state.units, we need to
    // be careful to only re-import if the state has actually changed
    if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return;
    // Load the normalized value into the state
    // Re-assigning the value can cause reactivity to be lost here if the export
    // watcher is an implicit deep, but not if it's an explicit deep.
    state.units = newValue;
    // state.units.splice(0);
    // newValue.forEach((entry) => state.units.push(entry));
  },
  { immediate: true }
);

/**
 * Exports the IR to the model value
 */
watch(
  () => state.units,
  (newValue) => {
    // Construct and validate a CustomUnitDefinition[]
    const errors = [] as string[];
    const toEmit = state.units.map<CustomUnitDefinition>((ir) => {
      if (ir.type === "incomparable") return ir.custom;

      // Validate, comparable types need valid comparable amount string
      if (!isNonMetricAmount(ir.custom)) {
        errors.push(
          `You specified a custom unit '${ir.custom}', but it doesn't look like a number followed by a string.`
        );
        return "INVALID";
      }
      if (!isMetricAmount(ir.metric)) {
        errors.push(
          `You specified a metric unit '${ir.metric}', but it doesn't look like a number followed by a string.`
        );
        return "INVALID";
      }

      if (ir.type === "comparable-string") return `${ir.custom} = ${ir.metric}`;
      if (ir.type === "comparable-array") return [ir.custom, ir.metric];
      errors.push(
        "Something doesn't look right with the custom unit: " +
          JSON.stringify(ir)
      );
      return "INVALID";
    });
    // Do nothing if validation failed
    state.validationErrors = errors;
    if (errors.length) {
      return;
    }
    emit(
      "update:modelValue",
      toEmit.length === 0 ? undefined : toEmit.length === 1 ? toEmit[0] : toEmit
    );
  },
  { deep: true }
);

/**
 * Converts a unit definition from one type to the next, cycling through the list
 * 1. incomparable == Bare string
 * 2. comparable-string == Amount compared to metric amount in string form
 * 3. comparable-array == Amount compared to metric amount in Array form
 *
 * @param idx the index of the modelAsList array to be converted
 */
function convertType(idx: number) {
  const currentType = state.units[idx].type;
  state.units[idx].type =
    currentType === "incomparable"
      ? "comparable-string"
      : currentType === "comparable-string"
      ? "comparable-array"
      : "incomparable";
}
</script>

<style scoped lang="scss">
.unit-input {
  display: inline-flex;
  width: 11em;
  > *:not(span) {
    flex: 1;
  }
}
</style>
