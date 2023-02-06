<script setup>
import SidebarLayout from "../../layouts/sidebar/SidebarLayout.vue";

import Switch from "../../components/core/switch/Switch.vue";

import { VueGoodTable } from "vue-good-table-next";

import Modal from "@/components/core/modal/Modal.vue";
import { PencilSquareIcon,PlusCircleIcon, MagnifyingGlassIcon, CalendarDaysIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

import { ref } from "vue";

import { NewRemoteTableMgr } from "@/utils/table";

import ProgressBar from "../../components/core/progress/ProgressBar.vue";

import { useToast } from "vue-toastification";
import api from "@/api";
import useAuthStore from "@/stores/auth";

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
  //request api
  let resp = await api.kv.updateKv(rt_mgr.currentRowData.value.key,rt_mgr.currentRowData.value.value,rt_mgr.currentRowData.value.description,auth_store.token)
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
  rt_mgr.loadItems(); //reload table after success
}
// delete
async function deleteRecord(){
    console.log("submitupdate");
  edit_m_loader_open.value = true;
  
  //simulate remote submit
  //request api
  let resp = await api.kv.deleteKv([rt_mgr.currentRowData.value.key],auth_store.token)
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
  rt_mgr.loadItems(); //reload table after success
}

//selection
function onSelectedRows(params) {
  console.log(params.selectedRows.length);
}

///create/////
const create_open = ref(false)
const create_loader_open = ref(false);
/////////////////////////////////////////////
const new_record = ref({
  key: "",
  value: "",
  description: "",
});

async function createRecord(){
    console.log("submitcreate");

    if (new_record.value.key===""){
        toast.error("key error");
    return;
    }

  create_loader_open.value = true;
  
  //simulate remote submit
  //request api
  let resp = await api.kv.createKv(new_record.value.key,new_record.value.value,new_record.value.description, auth_store.token)
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
  new_record.value={
    key: "",
  value: "",
  description: "",
  }
  create_open.value = false;
  create_loader_open.value = false;
  rt_mgr.loadItems(); //reload table after success
}

async function search_fn() {
  
  let server_params = rt_mgr.server_params_tidy();

  console.log("server_params:", server_params);

  let resp = await api.kv.queryKv(null,auth_store.token)

  if (resp.err !== null) {
    toast.error(resp.err);
    return;
  }

  if (resp.result.meta_status < 0) {
    //todo  resp.result.meta_status => error msg
    toast.error(resp.result.meta_message);
    return;
  }

  return resp.result

}
/////////////////////////////////////////////
//inital loading
rt_mgr.loadItems();
</script>

<template>
  <SidebarLayout>
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl leading-6">DBKV</h1>
        <p class="mt-3"></p>
      </div>

      <div>
        <vue-good-table
          :pagination-options="{
            enabled: true,
            mode: 'records',
            perPage: rt_mgr.server_params.limit,
            perPageDropdown: [10, 20, 50, 100],
            setCurrentPage: rt_mgr.server_params.page,
            dropdownAllowAll: false,
          }"
          :select-options="{
            enabled: false,
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
            <button type="button" @click="create_open = true" class="btn-primary sm mr-3"><PlusCircleIcon class="prefix-icon" />Add Key</button>
            <button type="button" @click="rt_mgr.loadItems" class="btn-secondary sm mr-3"><ArrowPathIcon class="prefix-icon" />Refresh</button>
          </template>

          <template #table-row="props">
            <span v-if="props.column.field === 'action1'">
              <button type="button" @click="edit(props.row)" class="btn-secondary xs"><PencilSquareIcon class="prefix-icon" />Edit</button>
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
              <input type="text" v-model="rt_mgr.currentRowData.value.key" class="sm:col-span-3 mt-1 rounded disabled" disabled/>
              <p class="mt-3">Value</p>
              <textarea type="text" v-model="rt_mgr.currentRowData.value.value" class="sm:col-span-3 rounded mt-1" />
              <p class="mt-3">Description</p>
              <input type="text" v-model="rt_mgr.currentRowData.value.description" class="sm:col-span-3 rounded mt-1" />
            </div>
          </template>
          <template v-slot:footer>
            <button type="button" class="btn-secondary mr-3" @click="edit_m_open = false">Cancel</button>
            <button type="button" class="btn-primary mr-3" @click="submitUpdate">Update</button>
            <button type="button" class="btn-err mr-3" @click="deleteRecord">Delete</button>
          </template>
        </Modal>

        <Modal v-model:open="create_open" v-model:showLoader="create_loader_open">
          <template v-slot:header>Create</template>
          <template v-slot:body>
            <div class="my-2">
              <p>Key</p>
              <input type="text" v-model="new_record.key" class="sm:col-span-3 mt-1 rounded"/>
              <p class="mt-3">Value</p>
              <textarea type="text" v-model="new_record.value" class="sm:col-span-3 rounded mt-1" />
              <p class="mt-3">Description</p>
              <input type="text" v-model="new_record.description" class="sm:col-span-3 rounded mt-1" />
            </div>
          </template>
          <template v-slot:footer>
            <button type="button" class="btn-secondary mr-3" @click="create_open = false">Cancel</button>
            <button type="button" class="btn-primary mr-3" @click="createRecord">Create</button>
          </template>
        </Modal>
      </div>
    </div>
  </SidebarLayout>
</template>
