<script setup>
import SidebarLayout from "../../layouts/sidebar/SidebarLayout.vue";
import Switch from "../../components/core/switch/Switch.vue";
import { VueGoodTable } from "vue-good-table-next";
import Modal from "@/components/core/modal/Modal.vue";
import { PencilSquareIcon, MagnifyingGlassIcon,PlusCircleIcon, CalendarDaysIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import { ref } from "vue";
import { NewRemoteTableMgr } from "@/utils/table";
import { useToast } from "vue-toastification";
import SimpleSecondarySelect from "../../components/core/select/SingleSelect.vue";
import Treeselect from "vue3-treeselect";
import api from "@/api";
import useAuthStore from "@/stores/auth";
import moment from "moment";
import validator from "@/utils/validator.js";

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

////
let rt_mgr = NewRemoteTableMgr(colums, search_fn);

//crete
const create_open = ref(false);
const create_loader_open = ref(false);

/////////////////////////////////////////////
const newUser = ref({
  email: "",
  password: "",
  roles: [],
  permissions:[],
});

async function createUser() {
  console.log("submitcreate");

  if (!validator.validateEmail(newUser.value.email )) {
    toast.error("email error");
    return;
  }

  if (!validator.validatePassword(newUser.value.password)) {
    toast.error("key error");
    return;
  }

  create_loader_open.value = true;

  //simulate remote submit
  //request api
  let resp = await api.user.createUser(newUser.value.email, newUser.value.password, newUser.value.roles,newUser.value.permissions, auth_store.token);
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
  newUser.value = {
    email: "",
  password: "",
  roles: [],
  permissions:[],
  };
  create_open.value = false;
  create_loader_open.value = false;
  rt_mgr.loadItems(); //reload table after success
}



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
  let resp = await api.user.updateUser(rt_mgr.currentRowData.value.id, rt_mgr.currentRowData.value.forbidden, rt_mgr.currentRowData.value.roles, rt_mgr.currentRowData.value.permissions, auth_store.token);

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

//selection
function onSelectedRows(params) {
  console.log(params.selectedRows.length);
}

///search/////
const search_open = ref(false);
//
const search_condition = ref({
  id: null,
  email_pattern: null,
  token: null,
  forbidden: null,
});

function reset_search_condition() {
  search_condition.value = {
    id: null,
    email_pattern: null,
    token: null,
    forbidden: null,
  };
}

const roleOptions = ["admin", "read_only", "user"].map((id) => ({
  id,
  label: `${id}`,
}));
/////////////////////////////////////////////
async function search_fn() {
    let id=null
  if (search_condition.value.id !== null && search_condition.value.id !== "") {
    id= parseInt(search_condition.value.id.trim());
  }

  let email_pattern=null
  if (search_condition.value.email_pattern !== null && search_condition.value.email_pattern !== "") {
    email_pattern= search_condition.value.email_pattern.trim();
  }

  let token=null
  if (search_condition.value.token !== null && search_condition.value.token != "") {
    token= search_condition.value.token.trim();
  }

  let forbidden=null
  if (search_condition.value.forbidden !== null) {
    forbidden= search_condition.value.forbidden.value;
  }

  let {limit,offset}=rt_mgr.getLimitOffset()

  // request api
  let resp = await api.user.queryUser(
    id,
    email_pattern,
    token,
    forbidden,
    limit,
    offset,
    auth_store.token
  );

  if (resp.err !== null) {
    toast.error(resp.err);
    return;
  }

  if (resp.result.meta_status < 0) {
    //todo  resp.result.meta_status => error msg
    toast.error(resp.result.meta_message);
    return;
  }

  //console.log(resp.result)

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
        <h1 class="text-2xl leading-6">User Manager</h1>
        <p class="mt-3"></p>
      </div>

      <div>
        <vue-good-table
          :pagination-options="{
            enabled: true,
            mode: 'pages',
            perPage: rt_mgr.per_page,
            perPageDropdown: [10, 20, 50, 100],
            setCurrentPage: rt_mgr.page,
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
            <button type="button" @click="create_open = true" class="btn-primary sm mr-3"><PlusCircleIcon class="prefix-icon" />New user</button>
            <button type="button" @click="rt_mgr.loadItems" class="btn-secondary sm mr-3"><ArrowPathIcon class="prefix-icon" />Refresh</button>
            <button type="button" @click="search_open = !search_open" class="btn-secondary sm"><MagnifyingGlassIcon class="prefix-icon" />Open Search</button>

            <div v-if="search_open" class="p-3 mt-1 bg-white border-1 border rounded">
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
                  <!-- <div class="prefix">Forbidden</div> -->
                  <!-- <input type="text" v-model="search_condition.token" class="rounded pl-15" /> -->
                  <div class="lg:col-span-2 mt-2">
                    <SimpleSecondarySelect
                      :options="[
                        { name: 'All', value: null },
                        { name: 'Only forbidden user', value: true },
                        { name: 'Only active user', value: false },
                      ]"
                      v-model="search_condition.forbidden"
                    ></SimpleSecondarySelect>
                  </div>
                </div>
              </div>

              <div class="btn btn-secondary mt-3 sm" @click="rt_mgr.loadItems">Search</div>
              <div class="btn btn-secondary mt-3 ml-3 sm" @click="reset_search_condition">Reset</div>
            </div>
          </template>

          <template #table-row="props">
            <span v-if="props.column.field === 'action'">
              <button type="button" @click="edit(props.row)" class="btn-secondary xs"><PencilSquareIcon class="prefix-icon" />Edit</button>
            </span>

            <span v-else-if="props.column.field === 'email'">
              <span class="badge secondary">{{ props.row[props.column.field] }}</span>
            </span>

            <span v-else-if="props.column.field === 'forbidden'">
                <span v-if="props.row[props.column.field]===true" class="badge err">forbidden</span>
                <span v-else class="badge success">active</span>
            </span>

            <span v-else-if="props.column.field === 'is_super_token'">
                <span v-if="props.row[props.column.field]===true" class="badge success">super</span>
                <span v-else class="badge secondary">normal</span>
            </span>

            <span v-else-if="props.column.field === 'roles'">
                <span v-for="role in props.row[props.column.field]" class="badge secondary mr-1">{{ role }}</span>
            </span>

            <span v-else-if="props.column.field === 'created_unixtime'">
              {{ moment.unix(props.row[props.column.field]).utc().format("YYYY-MM-DD HH:mm:ss") }}
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
              <input type="email" v-model="rt_mgr.currentRowData.value.email" class="sm:col-span-3 mt-1 rounded disabled" disabled="" />
              <p class="mt-3">Roles</p>
              <!-- <input type="number" v-model="rt_mgr.currentRowData.value.score" class="sm:col-span-3 rounded mt-1" /> -->
              <div class="lg:col-span-2 mt-2">
                <treeselect v-model="rt_mgr.currentRowData.value.roles" :multiple="true" :options="roleOptions" />
              </div>
              <p class="mt-3">Forbidden</p>
              <!-- <input type="number" v-model="rt_mgr.currentRowData.value.forbidden" class="sm:col-span-3 rounded mt-1" /> -->
              <div>
                <label class="mr-1"><input type="checkbox" v-model="rt_mgr.currentRowData.value.forbidden" class="mr-2" />forbidden user</label>
                <p></p>
              </div>
            </div>
          </template>
          <template v-slot:footer>
            <button type="button" class="btn-secondary mr-3" @click="edit_m_open = false">Cancel</button>
            <button type="button" class="btn-primary mr-3" @click="submitUpdate">Update</button>
          </template>
        </Modal>

        <Modal v-model:open="create_open" v-model:showLoader="create_loader_open">
          <template v-slot:header>New user</template>
          <template v-slot:body>
            <div class="my-2">
              <p>Email</p>
              <input type="email" v-model="newUser.email" class="sm:col-span-3 mt-1 rounded"  />

              <p>Password</p>
              <input type="email" v-model="newUser.password" class="sm:col-span-3 mt-1 rounded"  />

              <p class="mt-3">Roles</p>
              <!-- <input type="number" v-model="rt_mgr.currentRowData.value.score" class="sm:col-span-3 rounded mt-1" /> -->
              <div class="lg:col-span-2 mt-2">
                <treeselect v-model="newUser.roles" :multiple="true" :options="roleOptions" />
              </div>
              
            </div>
          </template>
          <template v-slot:footer>
            <button type="button" class="btn-secondary mr-3" @click="edit_m_open = false">Cancel</button>
            <button type="button" class="btn-primary mr-3" @click="createUser">Create</button>
          </template>
        </Modal>


      </div>
    </div>
  </SidebarLayout>
</template>
