<template>
  Bake File Editor
  <bakefile-loader v-model="bakefile" />

  <h1>Name</h1>
  <name v-model="bakefile.name" />

  <h1>Alters</h1>
  <alters />

  <h1>Nutrition</h1>
  <nutrition />

  <h1>Portions</h1>
  <portions />

  <h1>References</h1>
  <references />

  <h1>Tools</h1>
  <tools />

  <h1>Units</h1>
  <units v-model="bakefile.units" />

  <h1>Yield</h1>
  <yield />

  <h1>Ingredients</h1>
  <ingredients />

  <h1>Result</h1>
  <card />
</template>

<script setup lang="ts">
import Ingredients from "./components/editors/ingredients.vue";
import Name from "./components/editors/name.vue";
import Alters from "./components/editors/alters.vue";
import Nutrition from "./components/editors/nutrition.vue";
import Portions from "./components/editors/portions.vue";
import References from "./components/editors/references.vue";
import Tools from "./components/editors/tools.vue";
import Units from "./components/editors/units.vue";
import Yield from "./components/editors/yield.vue";
import Card from "./components/views/card.vue";
import BakefileLoader from "./components/bakefile-loader.vue";
import { Bakefile } from "./bakefile";
import { ref } from "vue";

/**
 * This component is responsible for
 * - Letting the user choose a file to work on
 * - Parsing the file into the segments that can be controlled by the individual editors
 * - Binding the segments to the editors so that when the edits happen, the result can
 *  be written out to the chosen file
 */
const bakefile = ref({} as Bakefile);
</script>

<style lang="scss"></style>
