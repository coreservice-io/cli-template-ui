<script setup>
import SidebarLayout from "@/layouts/sidebar/SidebarLayout.vue";


import Modal from "@/components/core/modal/Modal.vue";
import { PencilSquareIcon, MagnifyingGlassIcon, PlusCircleIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import { ref, toRaw } from "vue";

import { useToast } from "vue-toastification";
import SingleSelect from "@/components/core/select/SingleSelect.vue";
import Treeselect from "vue3-treeselect";
import { LOAD_ROOT_OPTIONS } from "vue3-treeselect";

import api from "@/api";
import useAuthStore from "@/stores/auth";
import moment from "moment";
import validator from "@/utils/validator.js";

import GoodTable from "@/components/core/table/Table.vue";
import { NewTableMgr } from "@/components/core/table/table.js";


import { useI18n } from "vue-i18n";
const { t } = useI18n();

const auth_store = useAuthStore();
const toast = useToast();

////
const colums = [
  {
    label: "Id",
    field: "id",
  },
  {
    label: "Email",
    field: "email",
  },
  {
    label: "Roles",
    field: "roles",
    type: "text",
  },
  {
    label: "Token",
    field: "token",
  },
  {
    label: "Super token",
    field: "is_super_token",
    type: "bool",
  },
  {
    label: "Forbidden",
    field: "forbidden",
    type: "bool",
  },
  {
    label: "Location",
    field: "register_country_code",
  },
  {
    label: "Created On",
    field: "created_unixtime",
    type: "number",
  },
  {
    label: "Action",
    field: "action",
  },
];


///////////search///////////////////////

function initSearchCondition() {
  return {
    id: null,
    email_pattern: null,
    token: null,
    forbidden: null,
  }
}

const search_condition = ref(initSearchCondition());

function ResetSearch() {
  search_condition.value = initSearchCondition();
}

/////////////////////
let roleOptions = ref(null);
async function loadOptions({ action /*, callback*/ }) {
  if (action === LOAD_ROOT_OPTIONS) {
    // request api
    let resp = await api.user.auth_config();

    if (resp.err !== null) {
      throw new Error("Failed to load options");
    }

    if (resp.result.meta_status < 0) {
      throw new Error("Failed to load options,err:" + resp.result.meta_message);
    }

    roleOptions.value = resp.result.roles.map((id) => ({
      id,
      label: `${id}`,
    }));
  }
}

async function searchFn(tableMgr) {

  let search_params = toRaw(search_condition.value)

  let id = null;
  if (search_params.id !== null && search_params.id.trim() !== "") {
    id = parseInt(search_params.id.trim());
  }

  let email_pattern = null;
  if (search_params.email_pattern !== null && search_params.email_pattern.trim() !== "") {
    email_pattern = search_params.email_pattern.trim();
  }

  let token = null;
  if (search_params.token !== null && search_params.token.trim() != "") {
    token = search_params.token.trim();
  }

  let { limit, offset } = tableMgr.getLimitOffset();

  // request api
  let resp = await api.user.queryUser(id, email_pattern, token, search_params.forbidden, limit, offset, auth_store.token);

  if (resp.err !== null) {
    toast.error(resp.err);
    return;
  }

  if (resp.result.meta_status < 0) {
    //todo  resp.result.meta_status => error msg
    toast.error(resp.result.meta_message);
    return;
  }
  return resp.result;
}

///////////end of search///////////////////////

///////////create///////////////////////

function initNewItem() {
  return {
    email: "",
    password: "",
    roles: [],
    permissions: [],
  }
}

const newItem = ref(initNewItem());

function resetNewItem() {
  newItem.value = initNewItem()
}

async function createSubmit(tableMgr) {

  let create_params = toRaw(newItem.value)

  if (!validator.validateEmail(create_params.email)) {
    toast.error("email error");
    return false;
  }

  if (!validator.validatePassword(create_params.password)) {
    toast.error("password error," + t("password_rule"));
    return false;
  }

  //request api
  let resp = await api.user.createUser(create_params.email, create_params.password, create_params.roles, create_params.permissions, auth_store.token);
  if (resp.err !== null) {
    toast.error(resp.err);
    return false;
  }

  if (resp.result.meta_status < 0) {
    toast.error(resp.result.meta_message);
    return false;
  }

  toast.success("create success");
  resetNewItem()
  return true;
}

///////////end of create///////////////////////

////////////update////////////

async function updateDelete() {
  return false
}

async function updateSubmit(tableMgr) {

  let resp = await api.user.updateUser(tableMgr.currentRowData.value.id, tableMgr.currentRowData.value.forbidden, tableMgr.currentRowData.value.roles, tableMgr.currentRowData.value.permissions, auth_store.token);
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

/////////////// end of update /////////////////////////////////////

////////table config///////
let table_config = {
  mode: 'remote',
  select_enable:false,
}

let table_callback = {
  searchFn: searchFn,
  createSubmit: createSubmit,
  updateDelete: updateDelete,
  updateSubmit: updateSubmit,
}

let { tableMgr, currentRow,
  update_w_open, update_w_loader_open,
  create_w_open, create_w_loader_open } = NewTableMgr(table_config, colums, table_callback);

/////////////////////////////////////////////
//inital loading
tableMgr.loadItems();

/////////////////////////////////////////////

</script>

<template>
  <SidebarLayout>
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl leading-6">User Manager</h1>
        <p class="mt-3">user manager for admin</p>
      </div>

      <div>
        <good-table :table-mgr="tableMgr">

          <template #selected-row-actions>
            <button class="btn-primary sm">selection Action 1</button>
          </template>

          <template #table-actions>
            <button type="button" @click="tableMgr.OpenCreateWindow" class="btn-primary sm mr-3">
              <PlusCircleIcon class="prefix-icon" />New user
            </button>
            <button type="button" @click="tableMgr.loadItems" class="btn-secondary sm mr-3">
              <ArrowPathIcon class="prefix-icon" />Refresh
            </button>
            <button type="button" @click="tableMgr.toggleSearchWindow" class="btn-secondary sm">
              <MagnifyingGlassIcon class="prefix-icon" />Open Search
            </button>
          </template>

          <template #search-window>
            <div class="pt-3 grid lg:grid-cols-3 gap-2 md:gap-4">
              <div class="lg:col-span-1 input-wrap sm">
                <div class="prefix">Id</div>
                <input type="text" v-model="search_condition.id" class="rounded pl-15" />
              </div>

              <div class="lg:col-span-1 input-wrap sm">
                <div class="prefix">Email pattern</div>
                <input type="text" v-model="search_condition.email_pattern" class="rounded pl-28" />
              </div>

              <div class="lg:col-span-1 input-wrap sm">
                <div class="prefix">Token</div>
                <input type="text" v-model="search_condition.token" class="rounded pl-15" />
              </div>

              <div class="lg:col-span-1 input-wrap sm">
                <div class="lg:col-span-2 mt-2">
                  <SingleSelect :options="[
                    { name: 'Only forbidden user', value: true },
                    { name: 'Only active user', value: false },
                  ]" v-model="search_condition.forbidden"></SingleSelect>
                </div>
              </div>
            </div>

            <div class="btn btn-secondary mt-3 sm" @click="tableMgr.loadItems">Search</div>
            <div class="btn btn-secondary mt-3 ml-3 sm" @click="ResetSearch">Reset</div>
          </template>



          <template #table-row="props">
            <span v-if="props.column.field === 'action'">
              <button type="button" @click="tableMgr.OpenUpdateWindow(props.row)" class="btn-secondary xs">
                <PencilSquareIcon class="prefix-icon" />Edit
              </button>
            </span>

            <span v-else-if="props.column.field === 'email'">
              <span class="badge secondary">{{ props.row[props.column.field] }}</span>
            </span>

            <span v-else-if="props.column.field === 'forbidden'">
              <span v-if="props.row[props.column.field] === true" class="badge err">forbidden</span>
              <span v-else class="badge success">active</span>
            </span>

            <span v-else-if="props.column.field === 'is_super_token'">
              <span v-if="props.row[props.column.field] === true" class="badge success">super</span>
              <span v-else class="badge secondary">normal</span>
            </span>

            <span v-else-if="props.column.field === 'roles'">
              <span v-for="role in props.row[props.column.field]" class="badge secondary mr-1">{{ role }}</span>
            </span>

            <span v-else-if="props.column.field === 'created_unixtime'">
              {{ moment.unix(props.row[props.column.field]).utc().format("YYYY-MM-DD HH:mm:ss") }}
            </span>

            <ProgressBar class="sm" v-else-if="props.column.field === 'score'" tippy="score:"
              :percent="props.row[props.column.field]" />
            <!-- Column: Common -->
            <span v-else>{{ props.row[props.column.field] }}</span>
          </template>
        </good-table>

        <Modal v-model:open="update_w_open" :showLoader="update_w_loader_open">
          <template v-slot:header>Edit</template>
          <template v-slot:body>
            <div class="my-2">
              <p>Email</p>
              <input type="email" v-model="currentRow.email" class="sm:col-span-3 mt-1 rounded disabled" disabled="" />
              <p class="mt-4">Roles</p>
              <div class="lg:col-span-2 mt-2">
                <treeselect v-model="currentRow.roles" :multiple="true" :options="roleOptions"
                  :load-options="loadOptions" />
              </div>
              <p class="mt-5">Forbidden</p>
              <div>
                <label class="mr-1 mt-2"><input type="checkbox" v-model="currentRow.forbidden"
                    class="mr-2" />forbidden</label>
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <button type="button" class="btn-secondary" @click="tableMgr.CloseUpdateWindow">Cancel</button>
            <button type="button" class="btn-primary mr-3" @click="tableMgr.Update">Update</button>
          </template>
        </Modal>

        <Modal v-model:open="create_w_open" :showLoader="create_w_loader_open">
          <template v-slot:header>New user</template>
          <template v-slot:body>
            <div class="my-2">
              <p>Email</p>
              <input type="email" v-model="newItem.email" class="sm:col-span-3 mt-1 rounded" />

              <p>Password</p>
              <input type="email" v-model="newItem.password" class="sm:col-span-3 mt-1 rounded" />

              <p class="mt-3">Roles</p>
              <div class="lg:col-span-2 mt-2">
                <treeselect v-model="newItem.roles" :multiple="true" :options="roleOptions" :load-options="loadOptions" />
              </div>
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
