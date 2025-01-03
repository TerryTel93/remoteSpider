<script setup lang="ts">
import btConnection from './views/btConnection.vue';

const snackbar = true;

</script>
<template>
  <v-app>
    <btConnection />
    <!-- <template>

      <v-snackbar v-model="snackbar" multi-line color="red-darken-2" variant="tonal">
        this is a test
      </v-snackbar>
    </template> -->
  </v-app>
</template>