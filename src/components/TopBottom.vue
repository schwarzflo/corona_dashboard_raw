<template>
  <div class="vis-component" ref="chart">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x-top" ref="axisXTop"></g>
        <g class="axis axis-x-bottom" ref="axisXBottom"></g>
        <g class="axis axis-y-top" ref="axisYTop"></g>
        <g class="axis axis-y-bottom" ref="axisYBottom"></g>
        <g class="histo-group" ref="histoGroup"></g>
      </g>
    </svg>
    <input type="checkbox" id="checkbox" v-model="BoxState">
    <label for="checkbox">(Longer Load Times on Metric-Change)</label>
  </div>
</template>

<script>

import * as d3 from 'd3';

export default {
  name: 'TopBottom',
  props: {
  },
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 20, right: 20, bottom: 20, left: 20,
      },
    }
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    drawChart() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup)
        .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
      this.drawYAxisTop();
      this.drawYAxisBottom();
      this.drawXAxisTop();
      this.drawXAxisBottom();
      this.drawHisto();
    },
    drawXAxisTop() {

      const histoGroup = d3.select(this.$refs.histoGroup);

      histoGroup.select('#topfivenametop').remove();
      histoGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("x",(this.svgWidth-this.svgPadding.left)/2)
          .attr("y",-5)
          .attr("id","topfivenametop")
          .text("TOP 5 Countries in " + this.selectedMetric + " on " + this.selectedDate)

      d3.select(this.$refs.axisXTop)
        .attr('transform', `translate(0, ${(this.svgHeight - this.svgPadding.top - this.svgPadding.bottom)/2} )`)
        .call(d3.axisBottom(this.xScaleTop).tickSize(0).tickFormat(''))

    },
    drawXAxisBottom() {

      const histoGroup = d3.select(this.$refs.histoGroup);

      histoGroup.select('#topfivenamebottom').remove();
      histoGroup
          .append("text")
          .attr("text-anchor", "middle")
          .attr("x",(this.svgWidth-this.svgPadding.left)/2)
          .attr("y",480)
          .attr("id","topfivenamebottom")
          .text("TOP 5 Countries in " + this.selectedMetric + " of all Time")

      d3.select(this.$refs.axisXBottom)
        .attr('transform', `translate(0, ${(this.svgHeight - this.svgPadding.top - this.svgPadding.bottom)/2} )`)
        .call(d3.axisBottom(this.xScaleBottom).tickSize(0).tickFormat(''))

    },
    drawYAxisTop() {

      d3.select(this.$refs.axisYTop)
        .call(d3.axisLeft(this.yScaleTop).tickFormat(''))

    },
    drawYAxisBottom() {

      d3.select(this.$refs.axisYBottom)
        .call(d3.axisLeft(this.yScaleBottom).tickFormat(''))

    },
    drawHisto() {

      function sorting(vm) {
        var data = []

        for(let i = 0; i < vm.covidDataAtDate.length; i++) {
          if (vm.covidDataAtDate[i].value != undefined && !isNaN(vm.covidDataAtDate[i].value)) {
              data.push(vm.covidDataAtDate[i])
          }
        }
        
        data.sort((a,b) => b.value-a.value).slice(0,5);

        return data
      }

      function round(num) { //from https://www.delftstack.com/de/howto/javascript/javascript-round-to-2-decimal-places/
        var m = Number((Math.abs(num) * 100).toPrecision(15));
        return Math.round(m) / 100 * Math.sign(num);
      }

      function barOverTop(event,d) {

        d3.select(this).style("stroke-width", "1")
        d3.select(this).style("stroke","black")

        var coordinates= d3.pointer(event); //get mouse coordinates
        var mx = coordinates[0];
        var my = coordinates[1];

        histoGroup.append("text") //only needed for length of text calc
          .text(round(d.value))
          .attr("x", mx)
          .attr("y", my-20)
          .attr("id", "dummy")
          .style('fill', 'black')

        var leng = d3.select("#dummy").node().getComputedTextLength()
        d3.select("#dummy").remove(); //immediately remove again

        histoGroup.append("rect")
          .attr("x",mx-5)
          .attr("y",my-35)
          .attr("height",20)
          .attr("width",leng+10)
          .attr("id","countryBox")
          .attr('stroke', 'black')
          .style("fill","white")

        histoGroup.append("text")
          .text(round(d.value))
          .attr("x", mx)
          .attr("y", my-20)
          .attr("id", "countryValue")
          .style('fill', 'black')
      }

      function barOverBottom(event,d) {

        d3.select(this).style("stroke-width", "1")
        d3.select(this).style("stroke","black")

        var coordinates= d3.pointer(event); //get mouse coordinates
        var mx = coordinates[0];
        var my = coordinates[1];

        histoGroup.append("text") //only needed for length of text calc
          .text(d.value + ", recorded on " + d.date)
          .attr("x", mx)
          .attr("y", my-20)
          .attr("id", "dummy")
          .style('fill', 'black')

        var leng = d3.select("#dummy").node().getComputedTextLength()
        d3.select("#dummy").remove(); //immediately remove again

        histoGroup.append("rect")
          .attr("x",mx-5)
          .attr("y",my-35)
          .attr("height",20)
          .attr("width",leng+10)
          .attr("id","countryBox")
          .attr('stroke', 'black')
          .style("fill","white")

        histoGroup.append("text")
          .text(d.value + ", recorded on " + d.date)
          .attr("x", mx)
          .attr("y", my-20)
          .attr("id", "countryValue")
          .style('fill', 'black')
      }

      function barOut() {
        d3.select(this).style("stroke-width", 0)

        d3.select("#countryValue").remove();
        d3.select("#countryBox").remove();
      }

      var vm = this
      var sortedCovidData = sorting(vm)
      var topFive = sortedCovidData.slice(0,5)
      var topFiveAtMetric = this.covidDataMaxAtMetric
      var colors = this.selectedColors


      for(let i = 0; i < 5; i++) {
        if (topFive.length != 0) {
          var maxVal = topFive[0].value
          topFive[i].index = i
          if (i == 0) {
            topFive[i].color = colors[colors.length-1]
          }
          else {
            topFive[i].color = colors[Math.floor(topFive[i].value / (maxVal/colors.length))]
          }
        }
        if (topFiveAtMetric.length != 0) {
          topFiveAtMetric[i].index = i
        }
      } 

      const histoGroup = d3.select(this.$refs.histoGroup);

      histoGroup.selectAll('.ids').remove();
      histoGroup.selectAll('.Maxids').remove();
      histoGroup.selectAll('.barsM').remove();
      histoGroup.selectAll('.bars').remove();

      if (topFive.length != 0) {
        histoGroup.selectAll('.bars')
          .data(topFive)
          .join("rect") 
          .attr('class', 'bars')
          .attr("x",0)
          .attr("y", (d) => 13+d.index*46)
          .attr("width",(d) => this.xScaleTop(d.value))
          .attr("height", 20)
          .style("fill", (d) => d.color)
          .on("mouseover",barOverTop)
          .on("mouseout",barOut)
      }

      if (topFiveAtMetric.length != 0) {
        histoGroup.selectAll('.barsM')
          .data(topFiveAtMetric)
          .join("rect") 
          .attr('class', 'barsM')
          .attr("x",0)
          .attr("y", (d) => 244+d.index*46)
          .attr("width",(d) => this.xScaleBottom(d.value))
          .attr("height", 20)
          .style("fill", "black")
          .on("mouseover",barOverBottom)
          .on("mouseout",barOut)
      }

      for(let i = 0; i < 5; i++) {
        if (topFive.length != 0) {
        histoGroup
          .append("text")
          .attr('class', 'ids')
          .text(topFive[i].country)
          .attr("x",this.xScaleTop(topFive[i].value)+5)
          .attr("y",29+i*46)
          .attr("fill","black")
        }
        if (topFiveAtMetric.length != 0) {
        histoGroup
          .append("text")
          .attr('class', 'Maxids')
          .text(topFiveAtMetric[i].country)
          .attr("x",this.xScaleBottom(topFiveAtMetric[i].value)+5)
          .attr("y",260+i*46)
          .attr("fill","black")
        }
      }
    }
  },
  computed: {
    xScaleTop() {
        return d3.scaleLinear() 
        .domain([0,this.dataMaxVal*1.25])
        .rangeRound([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]) 
    },
    xScaleBottom() {
        return d3.scaleLinear() 
        .domain([0,this.dataMaxValAtMetric*1.25])
        .rangeRound([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right]) 
    },
    yScaleTop() {
        return d3.scaleBand() 
        .domain(["dummy1","dummy2","dummy3","dummy4","dummy5"])
        .range([this.svgHeight/2- this.svgPadding.top, 0])  
    },
    yScaleBottom() {
        return d3.scaleBand() 
        .domain(["dummy1","dummy2","dummy3","dummy4","dummy5"])
        .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, this.svgHeight/2- this.svgPadding.top]) 
    },
    covidDataAtDate: {
      get() {
        return this.$store.getters.covidDataAtDate;
      }
    },
    covidDataMaxAtMetric: {
      get() {
        return this.$store.getters.covidDataMaxAtMetric;
      }
    },
    selectedMetric: {
      get() {
        return this.$store.getters.selectedMetric;
      }
    },
    selectedDate: {
      get() {
        return this.$store.getters.selectedDate;
      }
    },
    dataMaxVal() {
      return d3.max(this.covidDataAtDate, (d) => d.value);
    },
    dataMaxValAtMetric() {
      if (this.covidDataMaxAtMetric != 0) {
        return this.covidDataMaxAtMetric[0].value
      }
      return 100
    },
    BoxState: {
      get() {
        return this.$store.getters.BoxState;
      },
      set(val) {
        this.$store.commit('changeBoxState', val);
      },
    },
    selectedColors: {
      get() {
        return this.$store.getters.selectedColors;
      }
    },
  },
  watch: {
    covidDataAtDate: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    selectedMetric: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    selectedDate: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    covidDataMaxAtMetric: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    covidDataMaxAtDate: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
  },
}
</script>
