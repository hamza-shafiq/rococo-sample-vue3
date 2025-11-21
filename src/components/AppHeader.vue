<template>
  <q-header elevated>
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click="toggleLeftDrawer"
        v-if="authStore.isAuthenticated"
      />

      <q-toolbar-title> Switchback </q-toolbar-title>

      <div class="q-mr-md text-caption text-grey-5">v{{ version }}</div>

      <div v-if="authStore.isAuthenticated" class="cursor-pointer">
        Logged in as
        <b>{{ authStore.user.first_name }} {{ authStore.user.last_name }}</b>
        <q-icon size="xs" name="arrow_drop_down" />
        <q-menu fir anchor="bottom right" self="top right">
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup>
              <q-item-section @click="authStore.logout()">Logout</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </q-toolbar>
  </q-header>

  <q-drawer v-if="authStore.isAuthenticated" v-model="leftDrawerOpen" show-if-above bordered>
    <q-list padding class="menu-list">
      <br/>
      <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
    </q-list>
  </q-drawer>
</template>


<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'stores/auth'
import versionData from '@/version.json'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Todo',
    icon: 'task_alt',
    link: '/todo',
  },
  {
    title: 'User Profile',
    icon: 'person_outline',
    link: '/profile',
  },
]

const authStore = useAuthStore()
const version = versionData.version

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped lang="scss">
.menu-list {
  padding-top: 20px;

  :deep(.q-item) {
    border-radius: 0 25px 25px 0;
    margin-right: 12px;
    margin-bottom: 4px;

    &.q-router-link--active {
      background-color: rgba(25, 118, 210, 0.1);
      color: #1976d2;

      .q-icon {
        color: #1976d2;
      }
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  :deep(.q-item-label--header) {
    padding-left: 16px;
    padding-bottom: 8px;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}
</style>
