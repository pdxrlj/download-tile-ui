<template>
    <div class="download_box">
        <div class="download_state">
            <span class="download_state_title">任务状态</span>
            <div>
                <span>当前任务:</span>
                <span> 正在下载OSM瓦片</span>
            </div>

            <div>
                <span>层级范围:</span>
                <span> 1-10</span>
            </div>

            <div>
                <span>瓦片总数:</span>
                <span>&nbsp;200</span>
            </div>
            <div>
                <span>已经下载:</span>
                <span>&nbsp;100</span>
            </div>
            <div>
                <span>下载进度:</span>
                <span>&nbsp;34%</span>
            </div>
            <div>
                <span>存储地址:</span>
                <span>&nbsp;xxx/xxx/xxxxx</span>
            </div>
        </div>
        <div class="download_chart">
            <span class="download_chart_title">系统状态</span>
            <div class="download_chart_box">
              <div ref="chart_coroutine" class="chart_coroutine"></div>
              <div ref="chart_cpu" class="chart_cpu"></div>
              <div ref="chart_memory" class="chart_memory"></div>
            </div>
        </div>
      <div class="real_time_logging">
        <span class="real_time_logging_title">实时日志</span>
        <div class="real_time_logging_box"></div>
      </div>
    </div>
</template>

<script setup>
import * as echarts from "echarts";
import { onMounted, ref } from "vue";
let chart_coroutine = ref()
let chart_cpu = ref()
let chart_memory = ref()
onMounted(() => {
    const chart_coroutine_init = echarts.init(chart_coroutine.value)
    const chart_cpu_init = echarts.init(chart_cpu.value)
    const chart_memory_init = echarts.init(chart_memory.value)
    window.addEventListener("resize", () => {
        chart_coroutine_init.resize()
        chart_cpu_init.resize()
      chart_memory_init.resize()
    }, false)

    // 协程图表
    let coroutineOption = {
        title: {
            text: '协程数量',
            textStyle: {
                color: '#A9A9A9',
                fontSize: 14,
                fontWeight: 'normal'
            },
            // textAlign: 'left',
            left: "center",
        },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [820, 932, 901, 934, 1290, 1330, 1320],
                type: 'line',
                smooth: true
            }
        ],
        grid: {
            "left": "10px",
            "right": "10px",
            "bottom": 0,
            "top": "30px",
            "containLabel": true
        },
    };

    // cpu图表
    let cpuOption = {
        title: {
            text: 'CPU使用率',
            textStyle: {
                color: '#A9A9A9',
                fontSize: 14,
                fontWeight: 'normal'
            },
            // textAlign: 'left',
            left: "center",
        },
        tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
            {
                name: 'CPU',
                type: 'gauge',
                progress: {
                    show: true
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value}',
                    textStyle: {
                        fontSize: 13
                    },
                    fontSize: 12,
                },
                data: [
                    {
                        value: 30,
                        name: 'CPU',
                    }
                ],
                axisLabel: {                // 刻度标签。
                    show: true,             // 是否显示标签,默认 true。
                    distance: 12,           // 标签与刻度线的距离,默认 5。
                    // color: "#fff",       // 文字的颜色,默认 #fff。
                    fontSize: 8,            // 文字的字体大小,默认 5。
                    formatter: "{value}",   // 刻度标签的内容格式器，支持字符串模板和回调函数两种形式
                },

            }
        ],
        grid: {
            "left": "0",
            "right": "0",
            "bottom": 0,
            "top": "0",
        },
    }

    // 内存图表
    let memoryOption = {
        title: {
            text: '内存使用',
            left: 'center',
            textStyle: {
                color: '#A9A9A9',
                fontSize: 14,
                fontWeight: 'normal'
            },
            padding: [20, 0, 0, 0],
            fontSize: 12,
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },

        series: [
            {
                name: '内存使用',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 1048, name: '空闲', label: { color: '#A9A9A9' } },
                    { value: 735, name: '使用', label: { color: '#A9A9A9' } }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    fontSize: 12,
                }
            }
        ],
        grid: {
            "left": "0",
            "right": "0",
            "bottom": 0,
            "top": "0",
        },
    };
    chart_coroutine_init.setOption(coroutineOption)
    chart_cpu_init.setOption(cpuOption)
    chart_memory_init.setOption(memoryOption)
})

</script>

<style lang="sass" scoped>
.download_box
    width: 100%
    height: 100%
    overflow: hidden
    box-sizing: border-box
    border-radius: 5px
    padding: 30px
    display: flex
    flex-wrap: wrap
    div
        border-radius: 5px
    .download_state
        width: 48%
        height: 350px
        border: 1px solid #ccc
        .download_state_title
            position: relative
            top: -15px
            left: 10px
            z-index: 9
            background: #242424
            border-radius: 3px
            font-weight: bold
            padding: 0 10px
            font-size: 13px
        filter: drop-shadow(0 0 1em #242424)
        background: #242424
        div
            padding: 10px
            font-size: 15px
            font-family: '微软雅黑'
            border-bottom: 1px solid #A9A9A9
            border-radius: 0    
            span:first-child
                font-size: 16px
                color: #A9A9A9
                font-weight: bold
    .download_chart
        border: 1px solid #ccc
        width: 49%
        height: 350px
        margin-left: 25px
        .download_chart_title
            //position: relative
            //top: -15px
            float: left
            background: #242424
            border-radius: 3px
            font-weight: bold
            box-sizing: border-box
            font-size: 13px
            height: 15px
            line-height: 15px
            margin-top: -8px
            margin-left: 13px
        .download_chart_box
          width: 100%
          height: 100%
          display: flex
          flex-wrap: wrap
          .chart_coroutine
              width: 49%
              height: 50%
          .chart_cpu
              width: 49%
              height: 50%
          .chart_memory
              width: 100%
              height: 50%
              margin-top: 1px
    .real_time_logging
      flex-basis: 100%
      width: 100%
      height: 300px
      border: 1px solid #ccc
      .real_time_logging_title
        position: relative
        top: -15px
        left: 10px
        z-index: 9
        background: #242424
        border-radius: 3px
        font-weight: bold
        padding: 0 10px
        font-size: 13px

</style>