<template>
  <div class="map_box">
    <div class="map_left">
      <span>图层选择范围:</span>
      <json-viewer :expand-depth=2 :value="select_extent" boxed copyable sort></json-viewer>
      <br>
      <span>瓦片投影参考系:</span>
      <el-select v-model="select_crs" placeholder="投影" size="default">
        <el-option v-for="item in crs_options" :key="item" :label="item" :value="item" size="default"/>
      </el-select>
      <br>
      <span>最大并发请求数量:</span>
      <el-input v-model="select_concurrency" placeholder="最大并发请求数量" type="number"></el-input>
      <br>
      <span>下载层级范围:</span>
      <el-slider v-model="select_zoom_range" :max="25" :min="0" range show-stops/>
      <br>
      <span>存储方式:</span>
      <el-select v-model="select_storage" placeholder="请选择存储方式" size="default">
        <el-option v-for="item in source_storage" :key="item" :label="item" :value="item" size="default"/>
      </el-select>
      <br>
      <el-input v-show="select_storage !== ''" :placeholder=get_select_storage_placeholder()></el-input>
      <br>
      <span>下载失败重试次数/超时时间:</span>
      <div class="select_retry">
        <el-input-number v-model="select_retry_num" :max="10" :min="1"/>&nbsp;
        <el-input-number v-model="select_retry_time" :max="100" :min="1"/>
      </div>
      <br>
      <span>是否在存储的时候Y轴反转</span>
      <el-select v-model="select_storage_row_reverse" placeholder="是否在存储的时候Y轴反转" size="default">
        <el-option v-for="item in row_reverse_options" :key="item" :value="item" size="default"/>
      </el-select>
      <br>
      <span>地图瓦片的样式</span>
      <el-select v-model="select_tile_style" placeholder="瓦片的存储风格tms/wmts" size="default">
        <el-option v-for="item in tile_style_options" :key="item" :label="item" :value="item" size="default"/>
      </el-select>
      <br>

      <span v-if="select_storage === 'mbtiles'">mbtiles转化为tif:</span>
      <div v-if="select_storage === 'mbtiles'" class="select_mbtiles_tif">
        <el-switch v-model="select_mbtiles_tif"></el-switch>
      </div>

      <br>
      <el-button type="primary" @click="submit_download_job">提交任务</el-button>
      <br>
    </div>
    <div class="map_right">
      <div class="map_layers" @click="selectLayer">
        <div @click="selectLayerShow('tdt')">天地图</div>
        <div @click="selectLayerShow('ARCGIS')">Arcgis</div>
        <div @click="selectLayerShow('osm')">OSM</div>
      </div>
      <div id="mapTarget" class="map_content"></div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {ElMessage} from "element-plus";
import 'ol/ol.css'; // 引入 OpenLayers 样式
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import XYZ from 'ol/source/XYZ';
import TileDebug from 'ol/source/TileDebug';
import ZoomSlider from "ol/control/ZoomSlider";
import {defaults as defaultControls} from "ol/control";
import DragBox from "ol/interaction/DragBox";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {platformModifierKeyOnly} from "ol/events/condition";
import JsonViewer from 'vue-json-viewer'

const map = ref(null)
const select_extent = ref([])
const select_source = ref("")
const select_crs = ref("3857")
const select_concurrency = ref(10)
const select_zoom_range = ref([5, 15])
const select_storage = ref("本地存储")
const source_storage = ["mbtiles", "本地存储", "对象存储", "mongodb"]
const select_retry_num = ref(3)
const select_retry_time = ref(5)
const select_storage_row_reverse = ref("true")
const select_tile_style = ref("")
const select_mbtiles_tif = ref(true)
const source_map = {
  "osm": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  "ARCGIS": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "tdt": "http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=abf624f5ea9dd1d1dcd48a2bf1d3edf8"
}
const crs_options = ["3857", "4326"]
const row_reverse_options = ["false", "true"]
const tile_style_options = ["默认风格", "tms", "google"]

const get_select_storage_placeholder = () => {
  if (select_storage.value === "mbtiles") {
    return "xxx/xxx.mbtiles"
  } else if (select_storage.value === "本地存储") {
    return "xxx/xxx"
  } else if (select_storage.value === "对象存储") {
    return "object://ak:sk@endpoint/region/bucket/path"
  } else if (select_storage.value === "mongodb") {
    return "mongodb://user:pass@localhost:27017/dbname/collection"
  }
}

const selectLayerShow = (target) => {
  let layerName = target
  map.value.getLayers().forEach((layer) => {
    if (layer.get('name') === layerName) {
      layer.setVisible(true)
      select_source.value = layer.get("name")
    } else {
      layer.setVisible(false)
    }
  })
}

const submit_download_job = () => {
  let isPass = check_submit_args()
  if (!isPass) {
    // 弹窗提醒
    ElMessage.error('参数错误，请检测参数')
    console.log("参数错误")
    return
  }

  console.log("图层选择范围:", select_extent.value)
  console.log("数据源:", select_source.value)
  console.log("瓦片投影参考系:", select_crs.value)
  console.log("最大并发请求数量:", select_concurrency.value)
  console.log("下载层级范围:", select_zoom_range.value)
  console.log("存储方式:", select_storage.value)
  console.log("下载失败重试次数/超时时间:", select_retry_num.value, select_retry_time.value)
  console.log("是否在存储的时候Y轴反转:", select_storage_row_reverse.value)
  console.log("地图瓦片的样式:", select_tile_style.value)
  console.log("mbtiles转化为tif:", select_mbtiles_tif.value)
}


const check_submit_args = () => {
  if (select_extent.value.length === 0) {
    return false
  }
  if (select_source.value === "") {
    return false
  }

  if (select_crs.value === "") {
    return false
  }

  if (select_concurrency.value < 0) {
    return false
  }

  if (select_zoom_range.value[0] > select_zoom_range.value[1]) {
    return false
  }

  if (select_storage.value === "") {
    return false
  }

  if (select_retry_num.value < 0) {
    return false
  }
  if (select_retry_time.value < 0) {
    return false
  }
  if (select_tile_style.value === "") {
    return false
  }
  return true
}


const selectLayer = () => {
  document.querySelector('.map_layers').classList.toggle('select_layer')
}

onMounted(() => {
  let osmSource = new OSM()
  let projection = "EPSG:3857"
  map.value = new Map({
    target: "mapTarget", // 地图容器的 DOM 元素
    layers: [
      // 添加一个 OpenStreetMap 图层作为底图
      new TileLayer({
        source: osmSource,
        visible: true,
        name: "osm"
      }),
      new TileLayer({
        source: new Stamen({
          layer: "watercolor"
        }),
        visible: false,
      }),
      new TileLayer({
        name: "ARCGIS",
        source: new XYZ({
          url: source_map.ARCGIS,
        }),
        visible: false,
      }),
      new TileLayer({
        name: "tdt",
        source: new XYZ({
          //abf624f5ea9dd1d1dcd48a2bf1d3edf8
          url: source_map.tdt,
        }),
        visible: false,
      }),
      new TileLayer({
        source: new TileDebug({
          projection: projection,
          tileGrid: osmSource.getTileGrid()
        })
      })
    ],
    view: new View({                         // 地图视图
      projection: projection,             // 坐标系，有EPSG:4326和EPSG:3857
      center: [114.064839, 10.548857],     // 深圳坐标
      minZoom: 3,                          // 地图缩放最小级别
      zoom: 3                             // 地图缩放级别（打开页面时默认级别）
    }),
    controls: defaultControls().extend([new ZoomSlider()]),
  });

  select_source.value = "osm"

  // 创建一个交互对象来处理矩形选择
  var dragBox = new DragBox({
    condition: platformModifierKeyOnly // 按住Ctrl键进行选择
  });
  map.value.addInteraction(dragBox)
  // 监听矩形选择事件

  dragBox.on('boxend', function () {
    // 获取选择框的几何范围
    var extent = dragBox.getGeometry();

    let polygonFeature = new Feature({
      // 空间信息
      geometry: extent,
      name: '多边形要素'
    });

    let vectorSource = new VectorSource();
    vectorSource.addFeature(polygonFeature);

    // 初始化一个矢量图层
    let vectorLayer = new VectorLayer({
      source: vectorSource
    });
    map.value.addLayer(vectorLayer);


    // 在控制台中打印选定的范围
    let lonlatArr = new Array()
    for (let i = 0; i < extent.getCoordinates()[0].length; i++) {
      // console.log(extent.getCoordinates()[0][i]);
      let lonlat = mercatorTolonlat(extent.getCoordinates()[0][i])
      lonlatArr.push(lonlat)
    }

    select_extent.value = lonlatArr
    // console.log('Selected extent:', lonlatArr);
  });

  // 清除选择框
  dragBox.on('boxstart', function () {
    // 清除之前的选择框
    dragBox.getGeometry().setCoordinates([]);
    map.value.removeInteraction(dragBox)
    select_extent.value = []
  });
  const mercatorTolonlat = (mercator) => {
    var lonlat = {
      x: 0,
      y: 0
    };
    var x = mercator[0] / 20037508.34 * 180;
    var y = mercator[1] / 20037508.34 * 180;
    y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
    lonlat.x = x;
    lonlat.y = y;
    return lonlat;
  }
})

</script>

<style lang="sass" scoped>
.map_box
  width: 100%
  height: 100%
  position: relative
  top: 0
  left: 0
  display: flex
  overflow: hidden

  .map_left
    box-sizing: border-box
    padding: 10px
    min-width: 350px
    height: 100%
    font-size: 16px
    font-weight: 600
    display: flex
    flex-direction: column
    align-items: center
    overflow-y: scroll

    &::-webkit-scrollbar
      display: none
    scrollbar-width: none
    /* firefox */
    -ms-overflow-style: none
    /* IE 10+ */





































    .select_mbtiles_tif
      width: 100%

    .jv-container
      width: 100%

    span
      display: block
      align-self: flex-start
      font-size: 14px
      color: #A9A9A9

    .select_retry
      .el-input-number:first-child
        margin-left: -15px

    .el-button
      width: 100%

  .map_right
    width: calc(100% - 350px)
    height: 100%

    .map_content
      background: transparent
      width: 100%
      height: 100%

    .map_layers
      position: absolute
      z-index: 9
      right: 10px
      top: 10px
      opacity: 0.9
      background: url('../assets/map.png') no-repeat
      background-size: cover
      border-radius: 5px
      width: 50px
      height: 50px
      border: 3px solid #42B883
      box-sizing: border-box
      cursor: pointer
      filter: drop-shadow(0 0 1em #747bff)

      div
        width: 100%
        height: 100%
        font-size: 12px
        border: 1px solid #42B883
        visibility: hidden
        background-size: cover
        border-radius: 5px
        text-align: center
        line-height: 50px


.select_layer
  div
    position: relative
    background: url('../assets/tdt.png') no-repeat
    --top: 55px

    &:nth-child(2)
      background: url('../assets/arcgis.jpg') no-repeat
      animation: move 0.2s 0.5s ease-in-out forwards
      --top: 60px

    &:nth-child(3)
      --top: 65px
      background: url('../assets/osm.jpg') no-repeat
      color: black
      animation: move 0.2s 1.1s ease-in-out forwards

    animation: move 0.2s ease-in-out forwards

  @keyframes move
    0%
      top: 0px
    20%
      visibility: visible
    100%
      visibility: visible
      top: var(--top)

.el-select
  width: 100%
</style>
