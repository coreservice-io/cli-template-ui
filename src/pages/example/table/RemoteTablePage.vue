<script setup>
import SidebarLayout from "../../../layouts/sidebar/SidebarLayout.vue";

import Switch from "../../../components/core/switch/Switch.vue";

import { VueGoodTable } from "vue-good-table-next";

import Modal from "@/components/core/modal/Modal.vue";
import { PencilSquareIcon, MagnifyingGlassIcon, CalendarDaysIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

import { ref } from "vue";

import { NewRemoteTableMgr } from "@/utils/table";

import ProgressBar from "../../../components/core/progress/ProgressBar.vue";

import { useToast } from "vue-toastification";
const toast = useToast();

////
const colums = [
  {
    label: "Name",
    field: "name",
  },
  {
    label: "Email",
    field: "email",
  },
  {
    label: "Age",
    field: "age",
    type: "number",
  },
  {
    label: "Married",
    field: "married",
    type: "bool",
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
  {
    label: "Action1",
    field: "action1",
  },
];

////
let rt_mgr = NewRemoteTableMgr(colums, search_fn);

///edit
const edit_m_open = ref(false);
const edit_m_loader_open = ref(false);
function edit(row) {
  rt_mgr.setCurrentRowData(row);
  edit_m_open.value = true;
}
async function submitUpdate() {
  console.log("submitupdate");
  edit_m_loader_open.value = true;
  //simulate remote submit
  await rt_mgr.sleep(2000);
  toast.success("update success");
  edit_m_open.value = false;
  edit_m_loader_open.value = false;
  rt_mgr.loadItems(); //reload table after success
}

//selection
function onSelectedRows(params) {
  console.log(params.selectedRows.length);
}

///search/////
const search_open = ref(false);
//
const search_condition = ref({
  age_start: "",
  age_end: "",
  date_range: {
    start: new Date(1998, 0, 0),
    end: new Date(2099, 0, 0),
  },
  name: "",
});
/////////////////////////////////////////////
async function search_fn() {
  if (search_condition.name != "") {
    rt_mgr.updateParams({ name: search_condition.value.name.trim() });
  }

  if (search_condition.age_start != "") {
    rt_mgr.updateParams({ age_start: search_condition.value.age_start });
  }

  if (search_condition.age_end != "") {
    rt_mgr.updateParams({ age_end: search_condition.value.age_end });
  }

  rt_mgr.updateParams({ date_start: search_condition.value.date_range.start.toISOString().substring(0, 10), date_end: search_condition.value.date_range.end.toISOString().substring(0, 10) });

  let server_params = rt_mgr.server_params_tidy();

  console.log("server_params:", server_params);

  await rt_mgr.sleep(2000);
  return {
    meta_status: 1,
    meta_msg: "",
    result: {
      total_count: 1000,
      data: [
        { id: 1, name: "John", email: "john@gmail.com", married: true, age: 20, createdAt: "2011-10-31", score: 33.43 },
        { id: 2, name: "Jane", email: "jane@gmail.com", married: false, age: 24, createdAt: "2011-10-31", score: 30.43 },
        { id: 3, name: "Susan", email: "crikck@gmail.com", married: true, age: 16, createdAt: "2011-10-30", score: 3.343 },
        { id: 4, name: "Chris", email: "jos@gmail.com", married: false, age: 55, createdAt: "2011-10-11", score: 43 },
        { id: 5, name: "Dan", email: "dan@gmail.com", married: false, age: 40, createdAt: "2011-10-21", score: 10 },
        { id: 6, name: "John", email: "xxx@gmail.com", married: true, age: 20, createdAt: "2011-10-31", score: 95 },
      ],
    },
  };
}
/////////////////////////////////////////////
//inital loading
rt_mgr.loadItems();
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
          :pagination-options="{
            enabled: true,
            mode: 'records',
            perPage: rt_mgr.server_params.per_page,
            perPageDropdown: [20, 50, 100],
            setCurrentPage: rt_mgr.server_params.page,
            dropdownAllowAll: false,
          }"
          :select-options="{
            enabled: true,
            selectOnCheckboxOnly: true, // only select when checkbox is clicked instead of the row
          }"
          :columns="rt_mgr.columns"
          :rows="rt_mgr.rows.value"
          :totalRows="rt_mgr.totalRecords.value"
          mode="remote"
          :isLoading.sync="rt_mgr.isLoading.value"
          v-on:page-change="rt_mgr.onPageChange"
          v-on:sort-change="rt_mgr.onSortChange"
          v-on:column-filter="rt_mgr.onColumnFilter"
          v-on:per-page-change="rt_mgr.onPerPageChange"
          v-on:selected-rows-change="onSelectedRows"
        >
          <template #selected-row-actions>
            <button class="btn-primary sm">selection Action 1</button>
          </template>

          <template #table-actions>
            <button type="button" @click="rt_mgr.loadItems" class="btn-secondary sm mr-3"><ArrowPathIcon class="prefix-icon" />Refresh</button>
            <button type="button" @click="search_open = !search_open" class="btn-secondary sm"><MagnifyingGlassIcon class="prefix-icon" />Open Search</button>

            <div v-if="search_open" class="p-3 mt-1 bg-white border-1 border rounded">
              <div class="pt-3 grid lg:grid-cols-3 gap-2 md:gap-4">
                <div class="lg:col-span-1 input-wrap sm">
                  <div class="prefix">Name</div>
                  <input type="text" v-model="search_condition.name" class="rounded pl-15" />
                </div>

                <div class="input-wrap sm lg:col-span-1">
                  <div class="flex -space-x-px">
                    <div class="w-1/2 input-wrap sm">
                      <div class="prefix">Age >=</div>
                      <input type="number" min="0" step="1" v-model="search_condition.age_start" class="pl-16 w-1/2 relative rounded-l" />
                    </div>

                    <div class="w-1/2 input-wrap sm">
                      <div class="prefix">Age {{ "<=" }}</div>
                      <input type="number" min="0" step="1" v-model="search_condition.age_end" class="pl-16 w-1/2 relative rounded-r" />
                    </div>
                  </div>
                </div>

                <div class="lg:col-span-1 input-wrap sm">
                  <v-date-picker v-model="search_condition.date_range" timezone="UTC" is-range is24hr color="indigo">
                    <template v-slot="{ inputValue, togglePopover }">
                      <div class="input-wrap">
                        <div class="prefix">
                          <CalendarDaysIcon class="icon" />
                        </div>
                        <input type="text" class="rounded pl-10" :value="inputValue.start + ' - ' + inputValue.end" v-on:click="togglePopover" @keypress.prevent />
                      </div>
                    </template>
                  </v-date-picker>
                </div>
              </div>

              <div class="btn btn-secondary mt-3 sm" @click="rt_mgr.loadItems">Search</div>
            </div>
          </template>

          <template #table-row="props">
            <span v-if="props.column.field === 'action1'">
              <button type="button" @click="edit(props.row)" class="btn-secondary xs"><PencilSquareIcon class="prefix-icon" />Edit</button>
            </span>

            <span v-else-if="props.column.field === 'email'">
              <span  class="badge secondary">{{ props.row[props.column.field] }}</span>
            </span>

            <span v-else-if="props.column.field === 'married'">
              <Switch class="sm" v-model="props.row[props.column.field]" read-only></Switch>
            </span>

            <ProgressBar class="sm" v-else-if="props.column.field === 'score'" tippy="score:" :percent="props.row[props.column.field]" />
            <!-- Column: Common -->
            <span v-else>{{ props.row[props.column.field] }}</span>
          </template>
        </vue-good-table>

        <Modal v-model:open="edit_m_open" v-model:showLoader="edit_m_loader_open">
          <template v-slot:header>Edit</template>
          <template v-slot:body>
            <div class="my-2">
              <p>Email</p>
              <input type="email" v-model="rt_mgr.currentRowData.value.name" class="sm:col-span-3 mt-1 rounded" />
              <p class="mt-3">Score</p>
              <input type="number" v-model="rt_mgr.currentRowData.value.score" class="sm:col-span-3 rounded mt-1" />
            </div>
          </template>
          <template v-slot:footer>
            <button type="button" class="btn-secondary mr-3" @click="edit_m_open = false">Cancel</button>
            <button type="button" class="btn-primary mr-3" @click="submitUpdate">Update</button>
          </template>
        </Modal>
      </div>
    </div>
  </SidebarLayout>
</template>
