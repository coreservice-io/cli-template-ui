<script setup>
import SidebarLayout from "../../layouts/sidebar/SidebarLayout.vue";
import Switch from "../../components/core/switch/Switch.vue";
import { VueGoodTable } from "vue-good-table-next";
import Modal from "@/components/core/modal/Modal.vue";
import { PencilSquareIcon, MagnifyingGlassIcon, CalendarDaysIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import { ref } from "vue";
import { NewRemoteTableMgr } from "@/utils/table";
import { useToast } from "vue-toastification";
import SimpleSecondarySelect from "../../components/core/select/SingleSelect.vue";
import Treeselect from "vue3-treeselect";
import api from "@/api";
import useAuthStore from "@/stores/auth";

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
    type: "date",
    dateInputFormat: "",
    dateOutputFormat: "yyyy-MM-dd HH-mm-ss",
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
  let filter = {};
  if (search_condition.value.id !== null && search_condition.value.id !== "") {
    // filter.id = parseInt(search_condition.value.id.trim());
    rt_mgr.updateParams({ id: parseInt(search_condition.value.id.trim()) });
  }

  if (search_condition.value.email_pattern !== null && search_condition.value.email_pattern !== "") {
    // filter.email_pattern = search_condition.value.email_pattern.trim();
    rt_mgr.updateParams({ email_pattern: search_condition.value.email_pattern.trim() });
  }

  if (search_condition.value.token !== null && search_condition.value.token != "") {
    // filter.token = search_condition.value.token.trim();
    rt_mgr.updateParams({ token: search_condition.value.token.trim() });
  }

  if (search_condition.value.forbidden !== null) {
    // filter.forbidden = search_condition.value.forbidden.value;
    rt_mgr.updateParams({ forbidden: search_condition.value.forbidden });
  }

  rt_mgr.updateParams({ filter: filter });

  let server_params = rt_mgr.server_params_tidy();

  console.log("server_params:", server_params);

  // request api
  let resp = await api.user.queryUser(
    server_params.id,
    server_params.email_pattern,
    server_params.token,
    server_params.forbidden,
    server_params.limit,
    server_params.offset,
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

//   await rt_mgr.sleep(2000);
//   return {
//     meta_status: 1,
//     meta_msg: "",
//     result: {
//       total_count: 1000,
//       data: [
//         { id: 1, name: "John", email: "john@gmail.com", married: true, age: 20, createdAt: "2011-10-31", score: 33.43 },
//         { id: 2, name: "Jane", email: "jane@gmail.com", married: false, age: 24, createdAt: "2011-10-31", score: 30.43 },
//         { id: 3, name: "Susan", email: "crikck@gmail.com", married: true, age: 16, createdAt: "2011-10-30", score: 3.343 },
//         { id: 4, name: "Chris", email: "jos@gmail.com", married: false, age: 55, createdAt: "2011-10-11", score: 43 },
//         { id: 5, name: "Dan", email: "dan@gmail.com", married: false, age: 40, createdAt: "2011-10-21", score: 10 },
//         { id: 6, name: "John", email: "xxx@gmail.com", married: true, age: 20, createdAt: "2011-10-31", score: 95 },
//       ],
//     },
//   };
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
            perPage: rt_mgr.server_params.limit,
            perPageDropdown: [10, 20, 50, 100, 500, 1000],
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
                  <input type="text" v-model="search_condition.email_pattern" class="rounded pl-15" />
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
            <span v-if="props.column.field === 'action1'">
              <button type="button" @click="edit(props.row)" class="btn-secondary xs"><PencilSquareIcon class="prefix-icon" />Edit</button>
            </span>

            <span v-else-if="props.column.field === 'email'">
              <span class="badge secondary">{{ props.row[props.column.field] }}</span>
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
      </div>
    </div>
  </SidebarLayout>
</template>
