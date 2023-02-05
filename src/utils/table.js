import { ref } from "vue";

function NewRemoteTableMgr(colums, query_server_fn) {
  let rt_mgr = {};
  //
  rt_mgr.getFromServer = query_server_fn;

  ///
  rt_mgr.currentRowData = ref(null);

  rt_mgr.setCurrentRowData = function (row) {
    rt_mgr.currentRowData.value = Object.assign({}, row);
  };
  ///////////////////
  rt_mgr.columns = colums;

  ///////////////////
  rt_mgr.isLoading = ref(false);
  ///////////////////
  rt_mgr.rows = ref([]);
  rt_mgr.totalRecords = ref(0);

  rt_mgr.server_params = {
    page: 1, //current page
    per_page: 10,
  };

  rt_mgr.updateParams = function (new_props) {
    rt_mgr.server_params = Object.assign({}, rt_mgr.server_params, new_props);
  };

  rt_mgr.onPageChange = function (params) {
    rt_mgr.updateParams({ page: params.currentPage });
    rt_mgr.loadItems();
  };

  rt_mgr.onPerPageChange = function (params) {
    rt_mgr.updateParams({ page: 1, per_page: params.currentPerPage });
    rt_mgr.loadItems();
  };

  rt_mgr.onSortChange = function (params) {
    if (params[0].type == "none") {
      rt_mgr.updateParams({
        sort: [],
      });
    } else {
      rt_mgr.updateParams({
        sort: [
          {
            type: params[0].type,
            field: params[0].field,
          },
        ],
      });
    }
    rt_mgr.loadItems();
  };

  rt_mgr.onColumnFilter = function (params) {
    rt_mgr.updateParams(params);
    rt_mgr.loadItems();
  };

  // load items is what brings back the rows from server
  rt_mgr.loadItems = function () {
    rt_mgr.isLoading.value = true;
    rt_mgr.getFromServer().then((response) => {
      rt_mgr.isLoading.value = false;
      rt_mgr.totalRecords.value = response.result.total_count;
      rt_mgr.rows.value = response.result.data;
    });
  };

  //simulate remote query sleep
  rt_mgr.sleep = (d) => new Promise((r) => setTimeout(r, d));

  rt_mgr.server_params_tidy = function () {
    let result_condition = {};
    for (const [key, value] of Object.entries(rt_mgr.server_params)) {
      if (value == null || value === "") {
      } else {
        result_condition[key] = value;
      }
    }
    return result_condition;
  };
  ///////////////////////////////////////////////////

  return rt_mgr;
}

export { NewRemoteTableMgr as NewRemoteTableMgr };
