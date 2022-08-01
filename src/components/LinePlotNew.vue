<template>
  <div class="vis-component" ref="chart">
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="line-group" ref="lineGroup"></g>
      </g>
    </svg>
  </div>
</template>

<script>

import * as d3 from 'd3';

export default {
  name: 'LinePlot',
  props: {
  },
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 20, right: 20, bottom: 20, left: 70,
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
      this.drawYAxis();
      this.drawXAxis();
      this.drawLines();
    },
    drawXAxis() {

      //console.log(this.xScale(new Date('2020-12-17')))
      //console.log(this.covidDataAllDates)

      d3.select(this.$refs.axisX)
        .attr('transform', `translate( 0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom} )`)
        .call(d3.axisBottom(this.xScale))

      d3.select("#xlabel").remove();

      d3.select(this.$refs.axisX)
        .append('text')
        .attr('y', -5)
        .attr('x',this.svgWidth - this.svgPadding.right - this.svgPadding.left)
        .attr('text-anchor', 'end') 
        .attr("id", "xlabel")
        .attr('fill', 'black')
        .text("time");
    },
    drawYAxis() {

      d3.select(this.$refs.axisY)
        .call(d3.axisLeft(this.yScale))

      d3.select("#ylabel").remove();

      d3.select(this.$refs.axisY)
          .append("text")
          .attr('transform', 'rotate(-90)')
          .text(this.selectedMetric)
          .attr('y', 6)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'end')
          .attr("id", "ylabel")
          .style('fill', 'black')
    },
    drawLines() {

      var vm = this

      function lineOver() {
        d3.select(this).style("stroke-width", "2")
        for (let i = 0; i < vm.selectedCountries.length; i++) {
          if (vm.selectedCountries[i] != this.id) {
            d3.select("#" + vm.selectedCountries[i]).attr("stroke", "#f0efeb")
            d3.select("#" + vm.selectedCountries[i] + "_labelColor").attr("fill", "#f0efeb")
          }
        }
      }

      function lineOut() {
        d3.select(this).style("stroke-width", "1")
        for (let i = 0; i < vm.selectedCountries.length; i++) {
          if (vm.selectedCountries[i] != this.id) {
            d3.select("#" + vm.selectedCountries[i]).attr("stroke", colors[i])
            d3.select("#" + vm.selectedCountries[i] + "_labelColor").attr("fill", colors[i])
          }
        }
      }

      const lineGroup = d3.select(this.$refs.lineGroup);
      var totalDays = 748
      const colors = ["#CAFDE0","#FFEDB4","#FFB8EA","#B9CEFB","#DFAEFF"]

      for (let i = 0; i < this.drawnCountries.length; i++) { //remove drawing
          var idname = "#" + this.drawnCountries[i]
          d3.select(idname).remove();
          d3.select(idname+"_labelText").remove()
          d3.select(idname+"_labelColor").remove()
      }
      this.drawnCountries = []

      for (let j = 0; j < this.selectedCountries.length; j++) {

        if (j <= 4) {
          
          var dayAmount = this.covidDataAllDates[j].length
          var info = []
          for (let k = 0; k < dayAmount; k++) {
              if (typeof this.covidDataAllDates[j][k] == 'undefined') {
                    this.covidDataAllDates[j][k] = 0
              }
              info.push({day: (totalDays - dayAmount) + k, metric: this.covidDataAllDates[j][k]})
          }
          var line = d3.line()
          .x(d => this.xHelpScale(d.day))
          .y(d => this.yScale(d.metric))

          lineGroup
          .append("path")
          .attr("stroke", colors[j])
          .attr("stroke-width", 1)
          .attr("id",this.selectedCountries[j])
          .attr("fill","none")
          .attr("d", line(info))
          .on("mouseover",lineOver)
          .on("mouseout",lineOut)

          var posy = 10
          var posx = 40

          lineGroup.append("text") //only needed for length of text calc
            .text(this.selectedCountries[j])
            .attr("x", 0)
            .attr("y", 0)
            .attr("id", "dummy")
            .style('fill', 'black')

          var leng = d3.select("#dummy").node().getComputedTextLength()
          d3.select("#dummy").remove(); //immediately remove again

          lineGroup
          .append("rect")
          .attr("x",posx)
          .attr("y",posy + j*20)
          .attr("height",20)
          .attr("width",leng)
          .attr("id",this.selectedCountries[j] + "_labelColor")
          .attr("fill",colors[j])

          lineGroup
          .append("text")
          .attr("x",posx)
          .attr("y",posy+16 + j*20)
          .attr("fill","black")
          .attr("id",this.selectedCountries[j] + "_labelText")
          .text(this.selectedCountries[j])


          this.drawnCountries.push(this.selectedCountries[j])
          }
        }

    }
  },
  computed: {
    xHelpScale() {
      return d3.scaleLinear()
        .rangeRound([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
        .domain([1,748])
    }, 
    xScale() {
      return d3.scaleTime()
        .rangeRound([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
        .domain([new Date(2020,0,22),new Date(2022,0,17)])
    }, 
    yScale() {
        return d3.scaleLinear()
          .rangeRound([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
          .domain([0, this.dataMaxVal]);
    },
    dataMaxVal() {
      var individual_max = []
      for (let i = 0; i < this.covidDataAllDates.length; i++) {
        individual_max.push(d3.max(this.covidDataAllDates[i])) 
      }
      return d3.max(individual_max);
    },
    covidDataAllDates: {
      get() {
        return this.$store.getters.covidDataAllDates;
      }
    },
    selectedMetric: {
      get() {
        return this.$store.getters.selectedMetric;
      }
    },
    selectedCountries: {
      get() {
        return this.$store.getters.selectedCountries;
      },
    },
    drawnCountries: {
      get() {
        return this.$store.getters.drawnCountries;
      },
      set(val) {
        this.$store.commit('changeDrawnCountries', val);
      },
    },
  },
  watch: {
    covidDataAllDates: {
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
  },
}
</script>
