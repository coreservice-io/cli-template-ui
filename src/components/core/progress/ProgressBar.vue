<script setup>
const props = defineProps(["percent", "class", "tippy"]);
</script>
<template>
  <div class="progress-bar" v-tippy="{ placement: 'top', content: (props.tippy ? props.tippy : '') + props.percent + '%' }">
    <div :class="[props.class ? props.class : '', 'internal']" :style="'width:' + props.percent + '%'">&nbsp;</div>
  </div>
</template>
