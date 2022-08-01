<template>
  <div class="slidecontainer">
  <input type="range" min="2" max="747" value="1" class="slider" id="myRange">
  <p>Selected Date: <span id="demo"></span></p>
</div>
</template>

<script>

import * as d3 from 'd3';

export default {
  name: 'DateSlider',
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
    this.drawIt();
  },
  methods: {
    drawIt() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup)
        .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
      this.Calcs();
    },
    Calcs() {
      var vm = this;
      var slider = document.getElementById("myRange");
      var output = document.getElementById("demo");

      var date = new Date(2020, 0, +slider.value);

      var newdate = date.toISOString()
      var corrdate = newdate.slice(0,10)
      output.innerHTML = corrdate;
      this.selectedIntDate = +output.innerHTML
      this.selectedDate = corrdate


      slider.oninput = function() {
        var date = new Date(2020, 0, +this.value);
        var newdate = date.toISOString()
        var corrdate = newdate.slice(0,10)

        output.innerHTML = corrdate;
        vm.selectedDate = corrdate
        vm.selectedIntDate = +this.value
      }
    }
  },
  computed: {
    selectedDate: {
      get() {
        return this.$store.getters.selectedDate;
      },
      set(val) {
        this.$store.commit('changeSelectedDate', val);
      },
    },
    selectedIntDate: {
      get() {
        return this.$store.getters.selectedIntDate;
      },
      set(val) {
        this.$store.commit('changeSelectedIntDate', val);
      },
    },
  },
  watch: {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .slider {
  -webkit-appearance: none;
  width: 100%;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
  }

</style>
