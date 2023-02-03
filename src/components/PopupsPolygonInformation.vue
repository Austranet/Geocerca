<template>
  <v-overlay
    :absolute="absolute"
    :value="viewPolygonsInformation"
  >
    <PolygonInformation :establishment='establishment' :polygons='polygons' />
    <v-btn
      color="success"
      @click="viewPolygonsInformation = false"
    >
      Cerrar
    </v-btn>
  </v-overlay>
</template>

<script>
import PolygonInformation from '@/components/PolygonInformation.vue';

export default {
  name: 'PopupsPolygonInformation',
  components: { PolygonInformation },
  props: {
    polygons: {
      type: Array,
      required: true,
    },
    establishment: {
      type: Object,
      required: true,
    },
    viewPolygonsInformation: {
      type: Boolean,
      required: true,
    },
    absolute: {
      type: Boolean,
      default: false,
    },
  },
};
</script>