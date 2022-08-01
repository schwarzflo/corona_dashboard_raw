<template>
    <div class="vis-component" ref="chart">
      <svg class="main-svg" :width="svgWidth" :height="svgHeight">
        <g class="chart-group" ref="chartGroup">
          <g class="map-group" ref="mapGroup"></g>
        </g>
      </svg>
    </div>
</template>

<script>

import * as d3 from 'd3';
import mapWorld from '@/assets/world-geo-corrected-alpha.json';

export default {
  name: 'Map',
  props: {
  },
  data() {
    return {
      svgWidth: 750,
      svgHeight: 750,
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
      this.drawMap();
      //this.zoomMap();
      this.drawLegend();
    },
    drawMap() {

      var vm = this; //needed to update this in function

      function countryClick(event, d){
        
        var add = true

        for (let i = 0; i < vm.selectedCountries.length; i++) {
          if (vm.selectedCountries[i] == d.properties.iso_a3) {
            add = false
            vm.selectedCountries.splice(i,1) //remove this entry!
            vm.lastRemovedCountry = d.properties.iso_a3
            break
          }
        }
        if (add == true) {
          vm.selectedCountries.push(d.properties.iso_a3)
        }
      }

      function countryOver(event,d){

        d3.select(this).style("stroke-width", 1)
        d3.select(this).style("stroke","black")

        var coordinates= d3.pointer(event); //get mouse coordinates
        var mx = coordinates[0];
        var my = coordinates[1];

        mapGroup.append("text") //only needed for length of text calc
          .text(d.value)
          .attr("x", mx)
          .attr("y", my-20)
          .attr("id", "dummy")
          .style('fill', 'black')

        var leng = d3.select("#dummy").node().getComputedTextLength()
        d3.select("#dummy").remove(); //immediately remove again

       mapGroup.append("rect")
          .attr("x",mx-5)
          .attr("y",my-35)
          .attr("height",20)
          .attr("width",leng+10)
          .attr("id","countryBox")
          .attr('stroke', 'black')
          .style("fill","white")

        mapGroup.append("text")
          .text(d.value)
          .attr("x", mx)
          .attr("y", my-20)
          .attr("id", "countryValue")
          .style('fill', 'black')
      }

      function countryOut(event,d){

          d3.select("#countryValue").remove();
          d3.select("#countryBox").remove();

          for (let i = 0; i < vm.selectedCountries.length; i++) {
            if (vm.selectedCountries[i] == d.properties.iso_a3) {
              return
            }
          }

          d3.select(this).style("stroke-width", 0.5)
          d3.select(this).style("stroke","white")
      }
      
      const mapGroup = d3.select(this.$refs.mapGroup);
      var geo_projection = d3.geoMercator().fitSize([this.svgWidth, this.svgHeight-100], mapWorld);
      var geo_path = d3.geoPath().projection(geo_projection);
      var feats = mapWorld.features;

      var colors = this.selectedColors
      var idx
      var maxVal = this.dataMaxVal

      for (let i = 0; i < feats.length; i++) {
        feats[i].strokecolor = "white" 
        feats[i].strokewidth = 0.5 //needed for highlighting selected countries
        if (isNaN(this.covidDataAtDate[i].value)) {
          feats[i].color = "#C7C6C4"
          feats[i].value = "-"
        }
        else {
          if (this.covidDataAtDate[i].value == maxVal) {
            idx = colors.length-1
          }
          else {
            idx = Math.floor(this.covidDataAtDate[i].value / (maxVal/colors.length))
          }
          feats[i].color = colors[idx]
          feats[i].value = this.covidDataAtDate[i].value
        }
        for (let j = 0; j < this.selectedCountries.length; j++) {
          if (feats[i].properties.iso_a3 == this.selectedCountries[j]) {
              feats[i].strokecolor = "black" //needed for highlighting selected 
              feats[i].strokewidth = 1
            break
          }
        }
      }

      mapGroup.selectAll(".state")
      .data(feats)
      .join("path")
      .attr('class', 'state')
      .attr("d",geo_path)
      .style('stroke', (d) => d.strokecolor)
      .style('stroke-width', (d) => d.strokewidth)
      .style("fill",(d) => d.color)
      .on("mouseover",countryOver)
      .on("mouseout",countryOut)
      .on("click", countryClick)

    },
    zoomMap() { //gerade nicht im einsatz

      function handleZoom(e) { //taken from https://www.d3indepth.com/zoom-and-pan/
        d3.select('svg g')
          .attr('transform', e.transform);
        }

        let zoom = d3.zoom()
        .on('zoom', handleZoom);

        d3.select('svg')
        .call(zoom);
    },
    drawLegend(){
      const mapGroup = d3.select(this.$refs.mapGroup);
      var cube_size = 20
      var legend_prop = [{x: 0, y: 10, c:this.selectedColors[0]},{x: cube_size, y: 10, c:this.selectedColors[1]},{x: 2*cube_size, y: 10, c:this.selectedColors[2]},{x: 3*cube_size, y: 10, c:this.selectedColors[3]}]

      mapGroup.selectAll(".mapGroup")
          .data(legend_prop)
          .join("rect")
          .attr('class', 'mapGroup')
          .attr("x",(d) => d.x)
          .attr("y",(d) => d.y)
          .attr("height",cube_size)
          .attr("width",cube_size)
          .style("fill",(d) => d.c)

    }
  },
  computed: {
    dataMaxVal() {
      return d3.max(this.covidDataAtDate, (d) => d.value);
    },
    covidDataAtDate: {
      get() {
        return this.$store.getters.covidDataAtDate;
      }
    },
    covidDataAllDates: {
      get() {
        return this.$store.getters.covidDataAllDates;
      }
    },
    selectedColors: {
      get() {
        return this.$store.getters.selectedColors;
      }
    },
    selectedCountries: {
      get() {
        return this.$store.getters.selectedCountries;
      },
      set(val) {
        this.$store.commit('changeSelectedCountries', val);
      },
    },
  },
  watch: {
    covidDataAtDate: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    covidDataAllDates: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    selectedColors: {
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

<style>
</style>
