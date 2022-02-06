<template>
  <textarea></textarea>
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
    type: String as PropType<undefined | string>,
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

/**
 * The allowed prefixes for metric units
 */
type MetricUnitPrefix =
  | "y"
  | "z"
  | "a"
  | "f"
  | "p"
  | "n"
  | "μ"
  | "m"
  | "c"
  | "d"
  | ""
  | "da"
  | "h"
  | "k"
  | "M"
  | "G"
  | "T"
  | "P"
  | "E"
  | "Z"
  | "Y";

/**
 * String for a metric unit that measures mass
 */
type MetricMassUnit = `${MetricUnitPrefix}g`;

/**
 * String for a metric unit that measures volume
 */
type MetricVolumeUnit = `${MetricUnitPrefix}l`;

/**
 * A string that specifies an amount in metric units.
 * There is an optional space between the value and the unit.
 * Supports the international unit (IU) which is specific to every
 * compound that it is assigned to and measures efficacy only. 1 IU of
 * vitamin A is not equal in mass, volume, or efficacy to an IU of any
 * other substance. And for different foods, 1 IU of vitamin A may be
 * a different mass or volume of vitamin A present, but what the body
 * absorbs (efficacy) will be the same.
 *
 * E.g. '1 ml'
 * E.g. '47g'
 */
type MetricAmount = `${number}${"" | " "}${
  | MetricVolumeUnit
  | MetricMassUnit
  | "IU"
  | "I.U."}`;

/**
 * A string that specifies an amount in non-metric units.
 * There is an optional space between the value and the unit.
 * E.g. `2 oz`
 * E.g. `14cup`
 */
type NonMetricAmount = `${number}${"" | " "}${string}`;
/**
 * Defines how a custom unit would be defined, either as a
 * direct relation to a metric unit or as a standalone, uncomparable
 * name.
 * E.g. "package"
 * E.g. "1oz = 25g"
 * E.g. ["1oz", "25g"]
 */
type CustomUnitDefinition =
  | string
  | `${NonMetricAmount} = ${MetricAmount}`
  | [NonMetricAmount, MetricAmount];
/**
 * Defines how the units key may be declared in a bake file.
 */
type CustomUnitsDeclaration =
  | undefined
  | CustomUnitDefinition
  | CustomUnitDefinition[];
</script>

<style scoped lang="scss"></style>
