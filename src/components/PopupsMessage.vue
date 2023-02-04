<template>
  <v-snackbar
    v-model="isSaved"
    :timeout="timeout"
    :color="color"
    :top="top"
    :right="right"
    :bottom="bottom"
    :left="left"
  >
    {{ this.savedMessage }}
    <template v-slot:action="{ attrs }">
      <v-btn
        color="white"
        text
        v-bind="attrs"
        @click="isSaved = !isSaved"
      >
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'PopupsMessage',
  props: {
    isSaved: {
      type: Boolean,
      required: true,
    },
    savedMessage: {
      type: String,
      required: true,
    },
    timeout: {
      type: Number,
      default: 6000,
    },
    color: {
      type: String,
      default: 'success',
    },
    top: {
      type: Boolean,
      default: true,
    },
    right: {
      type: Boolean,
      default: true,
    },
    bottom: {
      type: Boolean,
      default: false,
    },
    left: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>

</style>