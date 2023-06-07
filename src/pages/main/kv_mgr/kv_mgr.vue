<script setup>
import SidebarLayout from "@/layouts/sidebar/SidebarLayout.vue";


import GoodTable from "@/components/core/table/Table.vue";
import { NewTableMgr } from "@/components/core/table/table.js";


import Modal from "@/components/core/modal/Modal.vue";
import { PencilSquareIcon, PlusCircleIcon, MagnifyingGlassIcon, CalendarDaysIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

import { ref, toRaw } from "vue";

import { useToast } from "vue-toastification";
import api from "@/api";
import useAuthStore from "@/stores/auth";

// import { inject } from "vue";
// const swal = inject("$swal");

const auth_store = useAuthStore();
const toast = useToast();

////
const colums = [
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


////////////////search///////////////////////
async function searchFn(tableMgr) {
  let resp = await api.kv.queryKv(null, auth_store.token);

  if (resp.err !== null) {
    toast.error(resp.err);
    return;
  }

  if (resp.result.meta_status < 0) {
    toast.error(resp.result.meta_message);
    return;
  }

  return resp.result
}

////////////////end of search///////////////////////

/////////////////create////////////////////////////

function initNewItem() {
  return {
    key: "",
    value: "",
    description: "",
  }
}

const newItem = ref(initNewItem());

function resetNewItem() {
  newItem.value = initNewItem()
}

async function createSubmit(tableMgr) {

  let newItemData = toRaw(newItem.value)

  if (newItemData.key === "") {
    toast.error("key error");
    return false;
  }

  //simulate remote submit
  //request api
  let resp = await api.kv.createKv(newItemData.key, newItemData.value, newItemData.description, auth_store.token);
  if (resp.err !== null) {
    toast.error(resp.err);
    return false;
  }

  if (resp.result.meta_status < 0) {
    //todo  resp.result.meta_status => error msg
    toast.error(resp.result.meta_message);
    return false;
  }

  resetNewItem()
  toast.success("create success");
  return true;

}

/////////////////end of create////////////////////////////


////////////////////////update////////////////////////////////////

async function updateDelete() {

  let currentRowData = toRaw(currentRow.value)
  //simulate remote submit
  //request api
  let resp = await api.kv.deleteKv([currentRowData.key], auth_store.token);
  if (resp.err !== null) {
    toast.error(resp.err);
    return false;
  }

  if (resp.result.meta_status < 0) {
    toast.error(resp.result.meta_message);
    return false;
  }

  toast.success("delete success");
  return true;
}

async function updateSubmit(tableMgr) {
  let currentRawData = toRaw(currentRow.value)
  //request api
  let resp = await api.kv.updateKv(currentRawData.key, currentRawData.value, currentRawData.description, auth_store.token);
  if (resp.err !== null) {
    toast.error(resp.err);
    return false;
  }

  if (resp.result.meta_status < 0) {
    toast.error(resp.result.meta_message);
    return false;
  }

  toast.success("update success");
  return true;
}

////////////////////////end of update ////////////////////////////////////

////////table config///////

let table_callback = {
  searchFn: searchFn,
  createSubmit: createSubmit,
  updateDelete: updateDelete,
  updateSubmit: updateSubmit,
}


let t_config = {
  mode: 'local',
  select_enable: false,
}

let { tableMgr, currentRow,
  update_w_open, update_w_loader_open,
  create_w_open, create_w_loader_open } = NewTableMgr(t_config, colums, table_callback);


//inital loading
tableMgr.resetAndLoad();

</script>

<template>
  <SidebarLayout>
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl leading-6">DBKV</h1>
        <p class="mt-3">database key-value manager</p>
      </div>

      <div>
        <good-table :table-mgr="tableMgr">
          <template #selected-row-actions>
            <button class="btn-primary sm">selection Action 1</button>
          </template>

          <template #table-actions>
            <button type="button" @click="tableMgr.OpenCreateWindow" class="btn-primary sm mr-3">
              <PlusCircleIcon class="prefix-icon" />Add Key
            </button>
            <button type="button" @click="tableMgr.resetAndLoad" class="btn-secondary sm mr-3">
              <ArrowPathIcon class="prefix-icon" />Refresh
            </button>
          </template>

          <template #table-row="props">
            <span v-if="props.column.field === 'action'">
              <button type="button" @click="tableMgr.OpenUpdateWindow(props.row)" class="btn-secondary xs">
                <PencilSquareIcon class="prefix-icon" />Edit/Delete
              </button>
            </span>
            <!-- Column: Common -->
            <span v-else>{{ props.row[props.column.field] }}</span>
          </template>
        </good-table>

        <Modal v-model:open="update_w_open" :showLoader="update_w_loader_open">
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
              <button type="button" class="btn-err" @click="tableMgr.UpdateDelete">Delete</button>
              <div>
                <button type="button" class="btn-primary mr-3" @click="tableMgr.Update">Update</button>
                <button type="button" class="btn-secondary" @click="tableMgr.CloseUpdateWindow">Cancel</button>
              </div>
            </div>
          </template>
        </Modal>

        <Modal v-model:open="create_w_open" :showLoader="create_w_loader_open">
          <template v-slot:header>Create</template>
          <template v-slot:body>
            <div class="my-2">
              <p>Key</p>
              <input type="text" v-model="newItem.key" class="sm:col-span-3 mt-1 rounded" />
              <p class="mt-3">Value</p>
              <textarea type="text" v-model="newItem.value" class="sm:col-span-3 rounded mt-1" />
              <p class="mt-3">Description</p>
              <input type="text" v-model="newItem.description" class="sm:col-span-3 rounded mt-1" />
            </div>
          </template>
          <template v-slot:footer>
            <button type="button" class="btn-secondary" @click="tableMgr.CloseCreateWindow">Cancel</button>
            <button type="button" class="btn-primary mr-3" @click="tableMgr.Create">Create</button>
          </template>
        </Modal>
      </div>
    </div>
  </SidebarLayout>
</template>
