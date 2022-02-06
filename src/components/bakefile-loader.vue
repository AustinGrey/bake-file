<template>
  <button @click="onChooseClick">Choose</button>

  <button v-for="handle in handles" @click="onDirTreeClick(handle)">
    {{ handle.name }}
  </button>

  <pre>{{ modelValue }}</pre>
  <pre>{{ parsingErrors }}</pre>

  <button type="button" v-if="fileDirty" @click="saveFile">Save Changes</button>
</template>

<script setup lang="ts">
/**
 * Component responsibilities
 * - Bind a provided object to a file on disk, such that
 * -- The file can be loaded into the object
 * -- The object can be saved to the file
 *
 * The object is always guaranteed to exist. So if no file is bound,
 * the user should still be able to edit the object, it would just be
 * the empty object to start off with.
 */

import { computed, PropType, ref, watch } from "vue";
import { Bakefile } from "../bakefile";

const props = defineProps({
  /**
   * The internal object representation of the bakefile, or
   * an empty object if no bakefile is loaded
   */
  modelValue: {
    type: Object as PropType<Bakefile>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", newVal: Bakefile): void;
}>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Get the directory to choose files from
interface FileSystemFileHandle {
  name: string;
  kind: "file";
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (...args: any[]) => {};
    close: () => void;
  }>;
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
    startIn: "documents",
  });
}

/**
 * Called when a handle shown in the directory tree is picked
 */
async function onDirTreeClick(handle: FileSystemHandle) {
  if (handle.kind === "directory") {
    // do nothing @todo change current working directory
  } else {
    currentHandle.value = handle;
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
const currentHandle = ref(undefined as undefined | FileSystemFileHandle);

/**
 * True if the user has made changes to the file contents that are not saved yet
 */
const fileDirty = computed(
  () => JSON.stringify(props.modelValue) !== lastSavedValue.value
);
/**
 * The last JSON string written to file
 */
const lastSavedValue = ref(undefined as undefined | string);

async function saveFile() {
  const writable = await currentHandle.value?.createWritable();
  const jsonString = JSON.stringify(modelValue.value);
  await writable?.write(jsonString);
  await writable?.close();
  lastSavedValue.value = jsonString;
}

const parsingErrors = ref(undefined as string | undefined);

watch(currentFile, async (newFile) => {
  const contents = await newFile?.text();
  if (contents === "" || contents === undefined) {
    modelValue.value = {};
    parsingErrors.value =
      "The selected file was empty or undefined, using an empty object instead.";
  } else {
    try {
      modelValue.value = JSON.parse(contents);
      parsingErrors.value = undefined;
    } catch (e) {
      modelValue.value = {};
      parsingErrors.value =
        "File cannot be parsed. Did you select a '*.bakefile.yaml' ?";
    }
  }
  // The last saved file is exactly the contents of the file we just loaded
  lastSavedValue.value = contents;
});

watch(directory, async (newVal) => {
  handles.value.splice(0, handles.value.length);
  for await (const entry of newVal?.values() ?? []) {
    handles.value.push(entry);
  }
});
</script>

<style scoped lang="scss"></style>
