<template>
  <div>
      <select v-model="selectedMetric">
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
  </div>
</template>

<script>

export default {
  name: 'DropDown',
  props: {
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
  },
  computed: {
    selectedMetric: {
      get() {
        return this.$store.getters.selectedMetric;
      },
      set(val) {
        this.$store.commit('changeSelectedMetric', val);
      },
    },
  },
  watch: {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
