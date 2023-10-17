import {createApp} from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import 'element-plus/dist/index.css'
// import OpenLayersMap from "vue3-openlayers";
// import "vue3-openlayers/styles.css";
const options = {
    debug: true,
};
createApp(App).use(router).mount("#app");
