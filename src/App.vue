<template>
  Bake File Editor
  <button @click="onChooseClick">Choose</button>

  <div v-for="file in files">
    {{ file.name }}
  </div>

  <h1>Name</h1>
  <name />

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
  <units />

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
import { computed, onMounted, ref, watch } from "vue";

type FileSystemHandle = { name: string; kind: "file" | "directory" };

const directory = ref(
  undefined as undefined | { values: () => Iterable<FileSystemHandle> }
);

async function onChooseClick() {
  directory.value = await (window as any).showDirectoryPicker({
    startIn: "desktop",
  });
}

const files = ref([] as FileSystemHandle[]);

watch(directory, async (newVal) => {
  files.value.splice(0, files.value.length);
  for await (const entry of newVal?.values() ?? []) {
    files.value.push(entry);
  }
});
</script>

<style lang="scss"></style>
