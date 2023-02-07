import main_lang from "./main/main_lang";
import admin_lang from "./admin/admin_lang";

import lang from "@/lang/lang";

///merge all langs
export default lang.merge_lang(main_lang, admin_lang);
