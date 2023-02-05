<script setup>
import SidebarLayout from "../../../layouts/sidebar/SidebarLayout.vue";

import { ref } from "vue";

import { VueGoodTable } from "vue-good-table-next";

const columns = [
  {
    label: "Name",
    field: "name",
    filterOptions: {
      enabled: true,
      filterDropdownItems: ["a", "b", "c"],
    },
  },
  {
    label: "Age",
    field: "age",
    type: "number",
  },
  {
    label: "Created On",
    field: "createdAt",
    type: "date",
    dateInputFormat: "yyyy-MM-dd",
    dateOutputFormat: "MMM do yy",
  },
  {
    label: "Percent",
    field: "score",
    type: "percentage",
  },
];

const rows = [
  { id: 1, name: "John", age: 20, createdAt: "2011-10-31", score: 0.03343 },
  { id: 2, name: "Jane", age: 24, createdAt: "2011-10-31", score: 0.03343 },
  { id: 3, name: "Susan", age: 16, createdAt: "2011-10-30", score: 0.03343 },
  { id: 4, name: "Chris", age: 55, createdAt: "2011-10-11", score: 0.03343 },
  { id: 5, name: "Dan", age: 40, createdAt: "2011-10-21", score: 0.03343 },
  { id: 6, name: "John", age: 20, createdAt: "2011-10-31", score: 0.03343 },
];

const open_row_data = ref(null);
const edit_m_open = ref(false);

function edit_row(row_line) {
  edit_m_open.value = true;
  const line_data = rows[row_line];
  open_row_data.value = line_data;
}

///
function onSelectedRows(params) {
  console.log(params.selectedRows.length);
}
</script>

<template>
  <SidebarLayout>
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl leading-6">Table</h1>
        <p class="mt-3">demo of a simple table</p>
      </div>

      <div>
        <vue-good-table
          :search-options="{
            enabled: true,
            placeholder: 'search table',
          }"
          :pagination-options="{
            enabled: true,
            mode: 'records',
            perPage: 5,
            perPageDropdown: [3, 7, 9],
            setCurrentPage: 1,
          }"
          :select-options="{
            enabled: true,
            selectOnCheckboxOnly: true, // only select when checkbox is clicked instead of the row
          }"
          :columns="columns"
          :rows="rows"
          v-on:selected-rows-change="onSelectedRows"
        >
          <template #selected-row-actions>
            <button class="btn-primary sm">selection Action 1</button>
          </template>

          <template #table-actions>
            <button class="btn-secondary sm mr-3">Action 2</button>
            <button class="btn-secondary sm mr-3">Action 2</button>
          </template>

          <template #table-row="props">
            <span>{{ props.row[props.column.field] }}</span>
          </template>
        </vue-good-table>
      </div>
    </div>
  </SidebarLayout>
</template>
