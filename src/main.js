import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.config.productionTip = false;

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyBD7Rmh9dkpF8wpYcaVA7obVdYyPm8ODPw',
    libraries: 'places,drawing', // This is required if you use the Autocomplete
  },
});

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
