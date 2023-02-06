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
  rt_mgr.page = 1;
  rt_mgr.per_page = 10;
  rt_mgr.sort = [];

  rt_mgr.getLimitOffset = function () {
    return {
      limit: rt_mgr.per_page,
      offset: (rt_mgr.page - 1) * rt_mgr.per_page,
    };
  };

  rt_mgr.onPageChange = function (params) {
    rt_mgr.page = params.currentPage;
    rt_mgr.loadItems();
  };

  rt_mgr.onPerPageChange = function (params) {
    rt_mgr.page = 1;
    rt_mgr.per_page = params.currentPerPage;
    rt_mgr.loadItems();
  };

  rt_mgr.onSortChange = function (params) {
    if (params[0].type == "none") {
      rt_mgr.sort = [];
    } else {
      rt_mgr.sort = [
        {
          type: params[0].type,
          field: params[0].field,
        },
      ];
    }
    rt_mgr.loadItems();
  };

  // load items is what brings back the rows from server
  rt_mgr.loadItems = function () {
    rt_mgr.isLoading.value = true;
    rt_mgr.getFromServer().then((response) => {
      rt_mgr.isLoading.value = false;
      rt_mgr.totalRecords.value = response.total_count;
      rt_mgr.rows.value = response.data;
    });
  };

  //simulate remote query sleep
  rt_mgr.sleep = (d) => new Promise((r) => setTimeout(r, d));
  ///////////////////////////////////////////////////

  return rt_mgr;
}

export { NewRemoteTableMgr as NewRemoteTableMgr };
