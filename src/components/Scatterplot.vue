<template>
  <div class="vis-component" ref="chart">
    <div>
      X Metric:
      <select v-model="selectedMetricX">
        <option>New Tests</option>
        <option>New Tests per Thousand</option>
        <option>New Cases</option>
        <option>New Cases per Million</option>
        <option>New Cases smoothed per Million</option>
        <option>Total Cases</option>
        <option>Total Cases per Million</option>
        <option>New Deaths</option>
        <option>New Deaths per Million</option>
        <option>New Deaths smoothed per Million</option>
        <option>Total Deaths</option>
        <option>New Vaccinations</option>
        <option>New Vaccinations smoothed per Million</option>
        <option>People Vaccinated</option>
        <option>People Vaccinated per Hundred</option>
        <option>Total Boosters</option>
        <option>Total Boosters per Hundred</option>
        <option>ICU Patients</option>
        <option>ICU Patients per Million</option>
        <option>Weekly Hospital Admissions</option>
        <option>Weekly Hospital Admissions per Million</option>
        <option>Stringency Index</option>
      </select>
      <br>
      Y Metric:
      <select v-model="selectedMetricY">
        <option>Aged 65 and older</option>
        <option>Aged 70 and older</option>
        <option>Cardiovascular Death Rate</option>
        <option>Diabetes Prevalence</option>
        <option>Female Smokers</option>
        <option>Male smokers</option>
        <option>Hospital Beds per Thousand</option>
        <option>GDP per Capita</option>
        <option>Life Expectancy</option>
        <option>Median Age</option>
        <option>Extreme Poverty</option>
        <option>Human Development Index</option>
        <option>Population Density</option>
      </select>
    </div>
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="scatter-group" ref="scatterGroup"></g>
      </g>
    </svg>
    <div class="inline">
    <label for="checkbox">
    <input type="checkbox" id="checkbox" v-model="BoxStateX">
    Log X-Axis</label>
    </div>
    <div class="inline">
    <label for="checkbox">
    <input type="checkbox" id="checkbox" v-model="BoxStateY">
    Log Y-Axis</label>
    </div>
  </div>
</template>

<script>

import * as d3 from 'd3';

export default {
  name: 'ScatterPlot',
  props: {
  },
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 20, right: 20, bottom: 20, left: 40,
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
      this.drawScatter();
      this.drawLegend();
    },
    drawLegend(){

      for (let i = 0; i < this.selectedCountries.length; i++) { //mark the selected country on scatter plot
        d3.select("#" + this.selectedCountries[i] + "_circ").style("stroke","white")
        d3.select("#" + this.selectedCountries[i] + "_circ").style("stroke-width",2)
      }

      function legendPopOver(event,d){

        d3.select(this).style("stroke-width", 1)

        chartGroup.append("text") //only needed for length of text calc
          .text(d.pop)
          .attr("x", d.x)
          .attr("y", d.y+20)
          .attr("id", "dummy")
          .style('fill', 'black')
          
          var leng = d3.select("#dummy").node().getComputedTextLength()

          d3.select("#dummy").remove(); //immediately remove again

        chartGroup.append("rect")
          .attr("x",d.x-5)
          .attr("y",d.y+10)
          .attr("height",20)
          .attr("width",leng+10)
          .attr("id","legendPopBox")
          .attr('stroke', 'black')
          .style("fill","white")

        chartGroup.append("text")
          .text(d.pop)
          .attr("id","legendPopInfo")
          .attr("x", d.x)
          .attr("y", d.y+26)
          .style('fill', 'black')
      }

      function legendOver(event,d){

        d3.select(this).style("stroke-width", 1)

        chartGroup.append("text") //only needed for length of text calc
          .text(d.cont)
          .attr("x", d.x)
          .attr("y", d.y+20)
          .attr("id", "dummy")
          .style('fill', 'black')
          
          var leng = d3.select("#dummy").node().getComputedTextLength()

          d3.select("#dummy").remove(); //immediately remove again

        chartGroup.append("rect")
          .attr("x",d.x-5)
          .attr("y",d.y+10)
          .attr("height",20)
          .attr("width",leng+10)
          .attr("id","legendBox")
          .attr('stroke', 'black')
          .style("fill","white")

        chartGroup.append("text")
          .text(d.cont)
          .attr("id","legendInfo")
          .attr("x", d.x)
          .attr("y", d.y+26)
          .style('fill', 'black')
      }

      function legendOut(){

        d3.select(this).style("stroke-width", 0.5)
        d3.select("#legendInfo").remove();
        d3.select("#legendBox").remove();
      }

      function legendPopOut(){

        d3.select(this).style("stroke-width", 0.5)
        d3.select("#legendPopInfo").remove();
        d3.select("#legendPopBox").remove();
      }

      function calcR(pop) {
        var hi = 1444216102
        var fac = hi / 1e5
        return 1.5 * Math.log10(pop / fac)
      }

      function numberWithDots(x) { //from https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }


      const chartGroup = d3.select(this.$refs.chartGroup);
      var dist = 20
      var start = 100
      var legend_cont_data = [{x: start, y: -10, c:"#ffadad", cont:"Europe"},{x: start+dist, y: -10, c:"#ffd6a5",cont:"Africa"},{x: start+2*dist, y: -10, c:"#caffbf",cont:"Asia"},{x: start+3*dist, y: -10, c:"#9bf6ff",cont:"Oceania"},{x: start+4*dist, y: -10, c:"#bdb2ff",cont:"North America"},{x: start+5*dist, y: -10, c:"#ffc6ff",cont:"South America"}]

      var startpop = 320
      var legend_pop_data = [{x: startpop, y: -10, r:calcR(1.5e9), pop:numberWithDots(1500000000)},{x: startpop+dist, y: -10, r:calcR(5*1e8),pop:numberWithDots(5*1e8)},{x: startpop+2*dist, y: -10, r:calcR(1e8), pop:numberWithDots(1e8)},{x: startpop+3*dist, y: -10, r:calcR(5*1e7),pop:numberWithDots(5*1e7)},{x: startpop+4*dist, y: -10, r:calcR(1e7),pop:numberWithDots(1e7)},{x: startpop+5*dist, y: -10, r:calcR(1e6),pop:numberWithDots(1e6)}]

      d3.select("#legendText1").remove()
      d3.select("#legendText2").remove()
      d3.select("#contLegend").remove()
      d3.select("#popLegend").remove()

      chartGroup.append("text")
      .attr('id', 'legendText1')
      .attr("x",0)
      .attr("y",-5)
      .text("Continents:")

      chartGroup.append("text")
      .attr('id', 'legendText2')
      .attr("x",220)
      .attr("y",-5)
      .text("Population:")


      chartGroup.selectAll(".chartGroup")
          .data(legend_cont_data)
          .join("circle")
          .attr("cx",(d) => d.x)
          .attr("cy",(d) => d.y)
          .attr("r",1.5*5)
          .style("stroke", "black")
          .style("stroke-width", "0.5")
          .style("fill",(d) => d.c)
          .attr("id","contLegend")
          .on("mouseover",legendOver)
          .on("mouseout",legendOut)

      chartGroup.selectAll(".chartGroup")
          .data(legend_pop_data)
          .join("circle")
          .attr("cx",(d) => d.x)
          .attr("cy",(d) => d.y)
          .attr("r",(d) =>d.r)
          .style("stroke", "black")
          .style("stroke-width", "0.5")
          .style("fill", "#edede8")
          .attr("id","popLegend")
          .on("mouseover",legendPopOver)
          .on("mouseout",legendPopOut)


    },
    drawScatter() {

      var vm = this

      var yAxis = d3.select(this.$refs.axisY)
        .call(d3.axisLeft(this.yScale))

      d3.select("#ylabel").remove();

      d3.select(this.$refs.axisY)
          .append("text")
          .attr('transform', 'rotate(-90)')
          .text(this.selectedMetricY)
          .attr('y', 6)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'end')
          .attr("id", "ylabel")
          .style('fill', 'black')

      var xAxis = d3.select(this.$refs.axisX)
        .attr('transform', `translate(0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom } )`)
        .call(d3.axisBottom(this.xScale))

      d3.select("#xlabel").remove();

      d3.select(this.$refs.axisX)
        .append('text')
        .attr('y', -5)
        .attr('x',this.svgWidth - this.svgPadding.right - this.svgPadding.left)
        .attr('text-anchor', 'end') 
        .attr("id", "xlabel")
        .attr('fill', 'black')
        .text(this.selectedMetricX);

      function round(num) { //from https://www.delftstack.com/de/howto/javascript/javascript-round-to-2-decimal-places/
        var m = Number((Math.abs(num) * 100).toPrecision(15));
        return Math.round(m) / 100 * Math.sign(num);
      }


      function circleOver(event,d){

        console.log(this.id)

        d3.select(this).style("stroke-width", 1)

        var coordinates= d3.pointer(event); //get mouse coordinates
        var mx = coordinates[0];
        var my = coordinates[1];
        var leng = 0
        var infoarr = [d.country, d.xmetric, d.ymetric]

        for (let i = 0; i < 3; i++) { //which info is the longest: country, x or y
          scatterGroup.append("text") //only needed for length of text calc
          .text(infoarr[i])
          .attr("x", mx)
          .attr("y", my-20)
          .attr("id", "dummy")
          .style('fill', 'black')

          if (leng < d3.select("#dummy").node().getComputedTextLength()) {
            leng = d3.select("#dummy").node().getComputedTextLength()
          }
          d3.select("#dummy").remove(); //immediately remove again
        }

        var posx = mx-5
        if (mx-5+leng > vm.svgWidth - vm.svgPadding.left - vm.svgPadding.right) {
          var diff = mx-5+leng - (vm.svgWidth - vm.svgPadding.left - vm.svgPadding.right)
          posx = mx-5-diff
        }
        scatterGroup.append("rect")
          .attr("x",posx)
          .attr("y",my-65)
          .attr("height",60)
          .attr("width",leng+10)
          .attr("id","circleBox")
          .attr('stroke', 'black')
          .style("fill","white")

        scatterGroup.append("text")
          .text(d.country)
          .attr("id","circleInfo1")
          .attr("x", posx+5)
          .attr("y", my-50)
          .style('fill', 'black')
        scatterGroup.append("text")
          .text(round(d.xmetric))
          .attr("id","circleInfo2")
          .attr("x", posx+5)
          .attr("y", my-30)
          .style('fill', 'black')
        scatterGroup.append("text")
          .text(round(d.ymetric))
          .attr("id","circleInfo3")
          .attr("x", posx+5)
          .attr("y", my-10)
          .style('fill', 'black')

      }

      function circleOut(){

        d3.select(this).style("stroke-width", 0.5)
        d3.select("#circleInfo1").remove();
        d3.select("#circleInfo2").remove();
        d3.select("#circleInfo3").remove();
        d3.select("#circleBox").remove();
      }

      var data = this.covidDataAtDateXY
      const scatterGroup = d3.select(this.$refs.scatterGroup);

      scatterGroup.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight - this.svgPadding.bottom - this.svgPadding.top)
            .attr("x", 0)
            .attr("y", 0);

      scatterGroup.attr("clip-path", "url(#clip)")

      scatterGroup.selectAll('circle')
        .data(data)
        .join("circle")
        .attr('cx', (d) => this.xScale(d.xmetric))
        .attr('cy', (d) => this.yScale(d.ymetric))
        .attr("r", (d) => 1.5* d.popr)
        .attr("id", (d) => d.iso_a3 + "_circ")
        .style("fill", (d) => d.contc)
        .style("stroke", "black")
        .style("stroke-width", "0.5")
        .on("mouseover",circleOver)
        .on("mouseout",circleOut)


      var brush = d3.brush()
      .extent([[0,0],[this.svgWidth - this.svgPadding.left -  this.svgPadding.right,this.svgHeight - this.svgPadding.top - this.svgPadding.bottom]])
      .on("end", updateChart)

      scatterGroup
        .attr("class","brush")
        .call(brush)

      var idleTimeout
      function idled() { idleTimeout = null; }

      function updateChart(event) {
        let extent = event.selection

        if(!extent){
          if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
          vm.xScale.domain([vm.dataMinValX * 0.95,vm.dataMaxValX * 1.05])
          vm.yScale.domain([vm.dataMinValY * 0.95,vm.dataMaxValY * 1.05])
        }
        else{
          vm.xScale.domain([vm.xScale.invert(extent[0][0]), vm.xScale.invert(extent[1][0])])
          vm.yScale.domain([vm.yScale.invert(extent[1][1]), vm.yScale.invert(extent[0][1])])
          scatterGroup.select(".brush").call(brush.move, null)
        }

        xAxis.transition().duration(1000).call(d3.axisBottom(vm.xScale))
        yAxis.transition().duration(1000).call(d3.axisLeft(vm.yScale))
        scatterGroup
          .selectAll("circle")
          .transition().duration(1000)
          .attr("cx", function (d) { return vm.xScale(d.xmetric); } )
          .attr("cy", function (d) { return vm.yScale(d.ymetric); } )
      }
    }
  },
  computed: {
    dataMaxValX() {
      return d3.max(this.covidDataAtDateXY, (d) => d.xmetric);
    },
    dataMaxValY() {
      return d3.max(this.covidDataAtDateXY, (d) => d.ymetric);
    },
    dataMinValX() {
      return d3.min(this.covidDataAtDateXY, (d) => d.xmetric);
    },
    dataMinValY() {
      return d3.min(this.covidDataAtDateXY, (d) => d.ymetric);
    },
    xScale() {

        if (this.BoxStateX == true) {
          return d3.scaleLog()
          .domain([this.dataMinValX * 0.95,this.dataMaxValX * 1.05])
          .rangeRound([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
        }
        else {
          return d3.scaleLinear()
          .domain([this.dataMinValX * 0.95,this.dataMaxValX * 1.05])
          .rangeRound([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
        }
    },
    yScale() {
        if (this.BoxStateY == true) {
          return d3.scaleLog()
          .domain([this.dataMinValY * 0.95,this.dataMaxValY * 1.05])
          .rangeRound([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
        }
        else {
          return d3.scaleLinear()
          .domain([this.dataMinValY * 0.95,this.dataMaxValY * 1.05])
          .rangeRound([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
        }
    },
    selectedMetricX: {
      get() {
        return this.$store.getters.selectedMetricX;
      },
      set(val) {
        this.$store.commit('changeSelectedMetricX', val);
      },
    },
    selectedMetricY: {
      get() {
        return this.$store.getters.selectedMetricY;
      },
      set(val) {
        this.$store.commit('changeSelectedMetricY', val);
      },
    },
    covidDataAtDateXY: {
      get() {
        return this.$store.getters.covidDataAtDateXY;
      },
    },
    BoxStateX: {
      get() {
        return this.$store.getters.BoxStateX;
      },
      set(val) {
        this.$store.commit('changeBoxStateX', val);
      },
    },
    BoxStateY: {
      get() {
        return this.$store.getters.BoxStateY;
      },
      set(val) {
        this.$store.commit('changeBoxStateY', val);
      },
    },
    selectedCountries: {
      get() {
        return this.$store.getters.selectedCountries;
      },
    },
  },
  watch: {
    selectedMetricX: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    selectedMetricY: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    covidDataAtDateXY: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    selectedCountries: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
  },
}
</script>

<style scoped>
div label input {
  margin-right:5px;
}
.inline { 
    display: inline-block; 
    margin:10px;
    }
</style>
