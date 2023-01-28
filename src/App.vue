<template>
  <v-app>
    <GoogleMaps />
  </v-app>
</template>

<script>
import GoogleMaps from './components/GoogleMaps';

export default {
  name: 'App',

  components: {
    GoogleMaps,
  },

  data: () => ({
    //
  }),
};
</script>
