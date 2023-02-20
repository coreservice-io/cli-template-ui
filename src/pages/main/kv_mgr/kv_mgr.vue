<script setup>
import SidebarLayout from "@/layouts/sidebar/SidebarLayout.vue";

import { VueGoodTable } from "vue-good-table-next";

import Modal from "@/components/core/modal/Modal.vue";
import { PencilSquareIcon, PlusCircleIcon, MagnifyingGlassIcon, CalendarDaysIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

import { ref } from "vue";

import { useToast } from "vue-toastification";
import api from "@/api";
import useAuthStore from "@/stores/auth";

import { inject } from "vue";
const swal = inject("$swal");

const auth_store = useAuthStore();

const toast = useToast();

////
const columns = [
  {
    label: "ID",
    field: "id",
  },
  {
    label: "Key",
    field: "key",
  },
  {
    label: "Value",
    field: "value",
    type: "text",
  },
  {
    label: "Description",
    field: "description",
    type: "text",
  },
  {
    label: "Action",
    field: "action",
  },
];

let rows = ref([]);
let currentRow = {};
////
// let rt_mgr = NewRemoteTableMgr(colums, search_fn);

///edit
const edit_m_open = ref(false);
const edit_m_loader_open = ref(false);
function edit(row) {
  currentRow = Object.assign({}, row);
  edit_m_open.value = true;
}
async function submitUpdate() {
  console.log("submitupdate");
  edit_m_loader_open.value = true;

  //simulate remote submit
  //request api
  let resp = await api.kv.updateKv(currentRow.key, currentRow.value, currentRow.description, auth_store.token);
  if (resp.err !== null) {
    toast.error(resp.err);
    return;
  }

  if (resp.result.meta_status < 0) {
    //todo  resp.result.meta_status => error msg
    toast.error(resp.result.meta_message);
    return;
  }

  toast.success("update success");
  edit_m_open.value = false;
  edit_m_loader_open.value = false;
  search_fn(); //reload table after success
}
// delete
async function deleteRecord() {
  let result = await swal.fire({
    title: "Do you confirm?",
    showDenyButton: true,
    showCancelButton: true,
    showConfirmButton: false,
    confirmButtonText: "Delete",
    denyButtonText: "Delete",
  });

  if (!result.isDenied) {
    return;
  }

  console.log("submitupdate");
  edit_m_loader_open.value = true;

  //simulate remote submit
  //request api
  let resp = await api.kv.deleteKv([currentRow.key], auth_store.token);
  if (resp.err !== null) {
    toast.error(resp.err);
    return;
  }

  if (resp.result.meta_status < 0) {
    //todo  resp.result.meta_status => error msg
    toast.error(resp.result.meta_message);
    return;
  }

  toast.success("delete success");
  edit_m_open.value = false;
  edit_m_loader_open.value = false;
  search_fn(); //reload table after success
}

//selection
function onSelectedRows(params) {
  console.log(params.selectedRows.length);
}

///create/////
const create_open = ref(false);
const create_loader_open = ref(false);
/////////////////////////////////////////////
const new_record = ref({
  key: "",
  value: "",
  description: "",
});

async function createRecord() {
  console.log("submitcreate");

  if (new_record.value.key === "") {
    toast.error("key error");
    return;
  }

  create_loader_open.value = true;

  //simulate remote submit
  //request api
  let resp = await api.kv.createKv(new_record.value.key, new_record.value.value, new_record.value.description, auth_store.token);
  if (resp.err !== null) {
    toast.error(resp.err);
    return;
  }

  if (resp.result.meta_status < 0) {
    //todo  resp.result.meta_status => error msg
    toast.error(resp.result.meta_message);
    return;
  }

  toast.success("create success");
  new_record.value = {
    key: "",
    value: "",
    description: "",
  };
  create_open.value = false;
  create_loader_open.value = false;
  search_fn(); //reload table after success
}

async function search_fn() {
  let resp = await api.kv.queryKv(null, auth_store.token);

  if (resp.err !== null) {
    toast.error(resp.err);
    return;
  }

  if (resp.result.meta_status < 0) {
    //todo  resp.result.meta_status => error msg
    toast.error(resp.result.meta_message);
    return;
  }

  rows.value = resp.result.data;
}
/////////////////////////////////////////////
//inital loading
search_fn();

////////table config///////
let table_search_options = {
  enabled: false,
  placeholder: 'search table',
}

let table_pagination_options = {
  enabled: true,
  mode: 'records',
  perPage: 10,
  perPageDropdown: [10, 20, 50, 100],
  setCurrentPage: 1,
  dropdownAllowAll: false,
}

let table_select_options = {
  enabled: false,
  selectOnCheckboxOnly: true, // only select when checkbox is clicked instead of the row
}
</script>

<template>
  <SidebarLayout>
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl leading-6">DBKV</h1>
        <p class="mt-3">database key-value manager</p>
      </div>

      <div>
        <vue-good-table v-on:selected-rows-change="onSelectedRows" :search-options="table_search_options"
          :pagination-options="table_pagination_options" :select-options="table_select_options" :columns="columns" :rows="rows">
          <template #selected-row-actions>
            <button class="btn-primary sm">selection Action 1</button>
          </template>

          <template #table-actions>
            <button type="button" @click="create_open = true" class="btn-primary sm mr-3">
              <PlusCircleIcon class="prefix-icon" />Add Key
            </button>
            <button type="button" @click="search_fn" class="btn-secondary sm mr-3">
              <ArrowPathIcon class="prefix-icon" />Refresh
            </button>
          </template>

          <template #table-row="props">
            <span v-if="props.column.field === 'action'">
              <button type="button" @click="edit(props.row)" class="btn-secondary xs">
                <PencilSquareIcon class="prefix-icon" />Edit/Delete
              </button>
            </span>

            <!-- Column: Common -->
            <span v-else>{{ props.row[props.column.field] }}</span>
          </template>
        </vue-good-table>

        <Modal v-model:open="edit_m_open" v-model:showLoader="edit_m_loader_open">
          <template v-slot:header>Edit</template>
          <template v-slot:body>
            <div class="my-2">
              <p>Key</p>
              <input type="text" v-model="currentRow.key" class="sm:col-span-3 mt-1 rounded disabled" disabled />
              <p class="mt-3">Value</p>
              <textarea type="text" v-model="currentRow.value" class="sm:col-span-3 rounded mt-1" />
              <p class="mt-3">Description</p>
              <input type="text" v-model="currentRow.description" class="sm:col-span-3 rounded mt-1" />
            </div>
          </template>
          <template v-slot:footer>
            <div class="justify-between flex w-full">
              <button type="button" class="btn-err" @click="deleteRecord">Delete</button>
              <div>
                <button type="button" class="btn-primary mr-3" @click="submitUpdate">Update</button>
                <button type="button" class="btn-secondary" @click="edit_m_open = false">Cancel</button>
              </div>
            </div>
          </template>
        </Modal>

        <Modal v-model:open="create_open" v-model:showLoader="create_loader_open">
          <template v-slot:header>Create</template>
          <template v-slot:body>
            <div class="my-2">
              <p>Key</p>
              <input type="text" v-model="new_record.key" class="sm:col-span-3 mt-1 rounded" />
              <p class="mt-3">Value</p>
              <textarea type="text" v-model="new_record.value" class="sm:col-span-3 rounded mt-1" />
              <p class="mt-3">Description</p>
              <input type="text" v-model="new_record.description" class="sm:col-span-3 rounded mt-1" />
            </div>
          </template>
          <template v-slot:footer>
            <button type="button" class="btn-secondary" @click="create_open = false">Cancel</button>
            <button type="button" class="btn-primary mr-3" @click="createRecord">Create</button>
          </template>
        </Modal>
      </div>
    </div>
</SidebarLayout>
</template>
