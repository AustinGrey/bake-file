<template>
  <p>Parent state</p>
  {{ state }}

  <p>Child Component with bound state</p>
  <units
    v-model="state.bakefile.units"
    @implicit-deep="state.implicitDeepUpdates += 1"
    @explicit-deep="state.explicitDeepUpdates += 1"
  />
</template>

<script setup lang="ts">
import Units from "./components/editors/units.vue";
import { reactive } from "vue";
import { Bakefile } from "./bakefile";

const state = reactive({
  bakefile: {} as Bakefile,
  implicitDeepUpdates: 0,
  explicitDeepUpdates: 0,
});
</script>
