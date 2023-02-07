import auth_router from "./auth.js";
import main_router from "./main.js";
import admin_router from "./admin";

export default [...auth_router, ...main_router, ...admin_router];
