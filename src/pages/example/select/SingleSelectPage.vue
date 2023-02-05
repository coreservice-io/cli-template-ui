<script setup>
import { ref } from "vue";
import SidebarLayout from "../../../layouts/sidebar/SidebarLayout.vue";

import SimpleSecondarySelect from "../../../components/core/select/SingleSelect.vue";

var options = [
  { name: "txt1", secondary: "s-1", active: false },
  { name: "txt2", secondary: "s-2", active: true },
  { name: "txt3", secondary: "s-3", active: false },
];

const selected = ref(null); //if no selected item yet
//const selected = ref(options[1]);
</script>

<template>
  <SidebarLayout>
    <div class="space-y-8 divide-y divide-gray-200 divide-gray-200">
      <div>
        <h1 class="text-2xl leading-6">Single Select</h1>
        <p class="mt-3">Select with a secondary label</p>
      </div>

      <div class="pt-5 lg:grid lg:grid-cols-3 lg:gap-4">
        <div>
          <label for="username" class="flex">Single select with name,secondary,active </label>
          <p>{{ selected ? selected : "not selected" }}</p>
        </div>
        <div class="lg:col-span-2 mt-2">
          <SimpleSecondarySelect :options="options" v-model="selected"></SimpleSecondarySelect>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>
