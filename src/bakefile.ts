// Defines the structure of a bakefile

/**
 * The allowed prefixes for metric units
 * @todo uncomment the more esoteric amounts once ready, as it's easier to
 *   debug types when you don't have a type expansion explosion
 */
type MetricUnitPrefix =
  // | "y" // e-24
  // | "z" // e-21
  // | "a" // e-18
  // | "f" // e-15
  // | "p" // e-12
  // | "n" // e-9
  // | "μ" // e-6
  | "m" // e-3
  // | "c" // e-2
  // | "d" // e-1
  | "" // e0
  // | "da" // e1
  // | "h" // e2
  | "k"; // e3
// | "M" // e6
// | "G" // e9
// | "T" // e12
// | "P" // e15
// | "E" // e18
// | "Z" // e21
// | "Y" // e24

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
 *
 * @todo uncomment IU options when ready, as it's easier to debug types
 * without them at this time
 */
export type MetricAmount = `${number}${"" | " "}${
  MetricVolumeUnit | MetricMassUnit
  // | "IU"
  // | "I.U."
}`;

/**
 * @param s The string to test if it defines a metric amount
 * @returns True if the string is a metric amount string, false otherwise
 */
export function isMetricAmount(s: unknown): s is MetricAmount {
  return (
    typeof s === "string" &&
    /^[0-9]+(\.[0-9]+)? ?(((y|z|a|f|p|n|μ|m|c|d|da|h|k|M|G|T|P|E|Z|Y)?(g|l))|(IU|I.U.))$/.test(
      s
    )
  );
}

/**
 * A string that specifies an amount in non-metric units.
 * There is an optional space between the value and the unit.
 * E.g. `2 oz`
 * E.g. `14cup`
 */
export type NonMetricAmount = `${number}${"" | " "}${string}`;

/**
 * @param s The value to test if it is a non-metric amount string
 * @returns True if the value is a non-metric amount string, false otherwise
 */
export function isNonMetricAmount(s: unknown): s is NonMetricAmount {
  return (
    typeof s === "string" &&
    /^[0-9]+(\.[0-9]+)? ?(.*)$/.test(s) &&
    !isMetricAmount(s)
  );
}

/**
 * Defines how a custom unit would be defined, either as a
 * direct relation to a metric unit or as a standalone, uncomparable
 * name.
 * E.g. "package"
 * E.g. "1oz = 25g"
 * E.g. ["1oz", "25g"]
 */
export type CustomUnitDefinition =
  | string
  | `${NonMetricAmount} = ${MetricAmount}`
  | [NonMetricAmount, MetricAmount];

export interface Bakefile {
  name?: string;
  units?: undefined | CustomUnitDefinition | CustomUnitDefinition[];
}
