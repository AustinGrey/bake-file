<template>
  <p>Parent state</p>
  {{ state.bakefile.units }}

  <p>Child Component with bound state</p>
  <units v-model="state.bakefile.units" />
</template>

<script setup lang="ts">
import Units from "./components/editors/units.vue";
import { reactive } from "vue";
import { Bakefile } from "./bakefile";

const state = reactive({
  bakefile: {} as Bakefile,
});
</script>
