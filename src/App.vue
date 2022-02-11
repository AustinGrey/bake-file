<template>
  Bake File Editor
  <bakefile-loader v-model="state.bakefile" />

  <h1>Name</h1>
  <name v-model="state.bakefile.name" />

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
  <units v-model="state.bakefile.units" />

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
import { reactive } from "vue";

/**
 * This component is responsible for
 * - Letting the user choose a file to work on
 * - Parsing the file into the segments that can be controlled by the individual editors
 * - Binding the segments to the editors so that when the edits happen, the result can
 *  be written out to the chosen file
 */
const state = reactive({
  bakefile: {} as Bakefile,
});
</script>

<style lang="scss">
// Modern Reset CSS
/* Box sizing rules */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Remove default margin */
body,
h1,
h2,
h3,
h4,
p,
figure,
blockquote,
dl,
dd {
  margin: 0;
}

/* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */
ul[role="list"],
ol[role="list"] {
  list-style: none;
}

/* Set core root defaults */
html:focus-within {
  scroll-behavior: smooth;
}

/* Set core body defaults */
body {
  min-height: 100vh;
  text-rendering: optimizeSpeed;
  line-height: 1.5;
}

/* A elements that don't have a class get default styles */
a:not([class]) {
  text-decoration-skip-ink: auto;
}

/* Make images easier to work with */
img,
picture {
  max-width: 100%;
  display: block;
}

/* Inherit fonts for inputs and buttons */
input,
button,
textarea,
select {
  font: inherit;
}

/* Remove all animations, transitions and smooth scroll for people that prefer not to see them */
@media (prefers-reduced-motion: reduce) {
  html:focus-within {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// My reset css
input {
  min-width: 1em;
}
</style>
