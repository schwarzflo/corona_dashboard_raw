<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-10">
          <div class="row-md-10">
            <DateSlider/>
            <DropDown/>
          </div>
            <Map/>
        </div>
        <div class="col-md-4">
          <Lines/>
        </div>
        <div class="col-md-4">
          <TopBottom/>
        </div>
        <div class="col-md-4">
          <ScatterPlot/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ScatterPlot from './components/Scatterplot.vue';
import TopBottom from './components/TopBottom.vue';
import Lines from './components/LinePlotNew.vue';
import Map from './components/Map.vue';
import DateSlider from './components/DateSliderNew.vue';
import DropDown from './components/DropDown.vue';

export default {
  name: 'App',
  components: {
    ScatterPlot, TopBottom, Lines, Map, DateSlider, DropDown
  },
  mounted() {
    this.$store.dispatch('loadData');
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
#p0 { text-indent: 2em; }
</style>
