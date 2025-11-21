<template>
  <q-page class="flex flex-center">
    <q-card class="profile-card">
      <q-card-section class="text-center">
        <q-avatar size="100px" color="primary" text-color="white" class="q-mb-md">
          <span class="text-h4">{{ initials }}</span>
        </q-avatar>
        <div class="text-h5 q-mb-xs">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</div>
        <div class="text-subtitle2 text-grey-7">{{ authStore.user?.email }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label overline>Email</q-item-label>
              <q-item-label>{{ email }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>First Name</q-item-label>
              <q-item-label>{{ authStore.user?.first_name }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Last Name</q-item-label>
              <q-item-label>{{ authStore.user?.last_name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md">
        <q-btn
          color="primary"
          label="Edit Profile"
          icon="edit"
          @click="showEditDialog = true"
          unelevated
        />
      </q-card-actions>
    </q-card>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Profile</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="updateProfile">
            <q-input
              v-model="editForm.first_name"
              label="First Name"
              filled
              :rules="[val => !!val || 'First name is required']"
              class="q-mb-md"
            />

            <q-input
              v-model="editForm.last_name"
              label="Last Name"
              filled
              :rules="[val => !!val || 'Last name is required']"
              class="q-mb-md"
            />

            <div class="q-mt-lg">
              <q-btn
                label="Cancel"
                color="grey-7"
                flat
                v-close-popup
                class="q-mr-sm"
              />
              <q-btn
                label="Update"
                type="submit"
                color="primary"
                :loading="isUpdating"
                unelevated
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'stores/auth'
import { Notify } from 'quasar'
import apiClient from 'src/config/axios'

const authStore = useAuthStore()
const showEditDialog = ref(false)
const isUpdating = ref(false)
const email = ref("");

const editForm = ref({
  first_name: '',
  last_name: '',
})

const initials = computed(() => {
  const firstName = authStore.user?.first_name || ''
  const lastName = authStore.user?.last_name || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

function loadUserData() {
  editForm.value.first_name = authStore.user?.first_name || ''
  editForm.value.last_name = authStore.user?.last_name || ''
}

async function updateProfile() {
  if (!editForm.value.first_name || !editForm.value.last_name) {
    Notify.create({
      message: 'Please fill in all fields',
      color: 'negative',
      icon: 'error',
    })
    return
  }

  isUpdating.value = true
  try {
    const response = await apiClient.put('/person/me', {
      first_name: editForm.value.first_name,
      last_name: editForm.value.last_name,
    })

    if (response.data?.success && response.data?.person) {
      // Update the auth store with new user data (updates both store and localStorage)
      authStore.updateUser(response.data.person)
      
      Notify.create({
        message: 'Profile updated successfully',
        color: 'positive',
        icon: 'check_circle',
      })
      
      showEditDialog.value = false
    } else {
      Notify.create({
        message: response.data?.message || 'Failed to update profile',
        color: 'negative',
        icon: 'error',
      })
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    Notify.create({
      message: error.response?.data?.message || 'Failed to update profile',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  loadUserData()
   console.log(localStorage.getItem("user_email"))
    email.value = localStorage.getItem("user_email")
})
</script>

<style scoped lang="scss">
.profile-card {
  width: 100%;
  max-width: 500px;
  margin: 20px;
}
</style>
