<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router'
import { MapLocation, Download, Notification } from "@element-plus/icons-vue";

let isActive = ref('地图预览')
const router = useRouter()
const activityHandler = (params) => {
  try {
    isActive.value = params.target.innerText

    if (isActive.value === "下载任务") {
      router.push({
        name: "Download"
      })
    }

    if (isActive.value === "地图预览") {
      router.push({
        name: "MapLocation"
      })
    }

    if (isActive.value === "系统日志") {
      router.push({
        name: "Notification"
      })
    }

  } catch (error) {
    console.log("errr:", error)
  }

}
</script>

<template>
  <div class="main_box">
    <nav class="main_nav" @click="activityHandler">
      <div :class="[isActive === '地图预览' ? 'activity' : '']">
        <el-icon color=" white" size="15px" class="icon no-inherit">
          <map-location />
        </el-icon>
        <span>地图预览</span>
      </div>
      <div :class="[isActive === '下载任务' ? 'activity' : '']">
        <el-icon color="white" size="17px" class="icon no-inherit">
          <download />
        </el-icon>
        <span>下载任务</span>
      </div>
      <div :class="[isActive === '系统日志' ? 'activity' : '']">
        <el-icon color="white" size="17px" class="icon no-inherit">
          <notification />
        </el-icon>
        <span>系统日志</span>
      </div>
    </nav>
    <div class="max_content">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="sass">
.activity
  font-size: 20px
  font-weight: bold
  cursor: pointer
  border-radius: 0px
  color: #42B883 !important
  .icon
    color: #42B883
.icon
  margin-top: -3px
  vertical-align: middle


.main_box
  display: flex
  box-sizing: border-box
  .max_content
    height: 100vh
    width: calc( 100vw - 150px )
  .main_nav
    padding: 0
    display: flex
    justify-content: flex-start
    flex-direction: column
    text-align: center
    height: 100vh
    width: 150px
    max-width: 300px
    background-color: #1A1A1A
    border-right: 1px solid #3E4452
  
    div
      height: 50px
      width: 100%
      line-height: 50px
      text-align: center
      font-size: 16px
      font-weight: bold
      cursor: pointer
      color: #fff
      border-bottom: 2px solid transparent
      &:nth-child(n+1)
        margin-top: 10px


      span
        margin-left: 5px
        vertical-align: middle
        

</style>
