<template>
  <q-item clickable tag="router-link" :to="props.link" class="menu-item">
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" size="24px" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="menu-item-label">{{ props.title }}</q-item-label>
      <q-item-label caption v-if="props.caption">{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: '',
  },

  link: {
    type: String,
    default: '#',
  },

  icon: {
    type: String,
    default: '',
  },
})
</script>

<style scoped lang="scss">
.menu-item {
  padding: 12px 16px;
  min-height: 48px;

  .menu-item-label {
    font-weight: 500;
    font-size: 14px;
  }
}
</style>
