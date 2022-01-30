<template>
  Bake File Editor
  <button @click="onChooseClick">Choose</button>

  <button v-for="handle in handles" @click="onDirTreeClick(handle)">
    {{ handle.name }}
  </button>

  <pre>{{ fileContents }}</pre>

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

/**
 * This component is responsible for
 * - Letting the user choose a file to work on
 * - Parsing the file into the segments that can be controlled by the individual editors
 * - Binding the segments to the editors so that when the edits happen, the result can
 *  be written out to the chosen file
 */

// Get the directory to choose files from
interface FileSystemFileHandle {
  name: string;
  kind: "file";
  getFile: () => Promise<File>;
  createWriteable: () => Promise<{ write: (...args: any[]) => {} }>;
}
interface FileSystemDirectoryHandle {
  name: string;
  kind: "directory";
}
type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;

const directory = ref(
  undefined as undefined | { values: () => Iterable<FileSystemHandle> }
);

async function onChooseClick() {
  directory.value = await (window as any).showDirectoryPicker({
    startIn: "desktop",
  });
}

/**
 * Called when a handle shown in the directory tree is picked
 */
async function onDirTreeClick(handle: FileSystemHandle) {
  if (handle.kind === "directory") {
    // do nothing @todo change current working directory
  } else {
    currentFile.value = await handle.getFile();
  }
}

/**
 * The current known set of file handles we can edit
 */
const handles = ref([] as FileSystemHandle[]);

/**
 * The user's currently chosen file handle they wish to edit
 */
const currentFile = ref(undefined as undefined | File);

/**
 * The JSON object from the currentFile
 */
const fileContents = ref(undefined as undefined | Record<string, unknown>);

watch(currentFile, async (newFile) => {
  const errorUnparsable =
    "File cannot be parsed. Did you select a '*.bakefile.yaml' ?";
  const contents = await newFile?.text();
  console.log(contents);
  try {
    fileContents.value = JSON.parse(
      contents ?? `{'error': '${errorUnparsable}'}`
    );
  } catch (e) {
    fileContents.value = { error: errorUnparsable };
  }
});

watch(directory, async (newVal) => {
  handles.value.splice(0, handles.value.length);
  for await (const entry of newVal?.values() ?? []) {
    handles.value.push(entry);
  }
});
</script>

<style lang="scss"></style>
