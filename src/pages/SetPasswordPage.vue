<template>
  <q-page class="flex row flex-center">
    <q-card class="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3 q-pa-xs q-pa-md-sm q-mb-xl">
      <q-card-section v-if="!token || !uidb64" class="text-center">
        <q-banner class="bg-negative text-white">
          <template v-slot:avatar>
            <q-icon name="error" color="white" />
          </template>
        </q-banner>

        <q-btn
          label="Request Password Reset"
          color="primary"
          to="/forgot-password"
          class="q-mt-md"
        />
      </q-card-section>
      <q-card-section v-else>
        <q-form @submit.prevent="onSubmit" class="full-width">
          <!-- Password -->
          <q-input
            v-model="password"
            type="password"
            label="Password"
            outlined
            class="q-mb-lg"
            :rules="passwordRules"
          />

          <!-- Confirm Password -->
          <q-input
            v-model="passwordConfirm"
            type="password"
            label="Confirm password"
            outlined
            lazy-rules
            :rules="confirmPasswordRules"
            class="q-mb-lg"
          />

          <!-- Set password Button -->
          <q-btn
            label="Set password"
            color="primary" 
            type="submit" 
            class="full-width"
            :loading="isLoading"
            :disable="isLoading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>
  
<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { Notify } from 'quasar';

const route = useRoute()
const authStore = useAuthStore()

const token = route.query.token || route.params.token
const uidb64 = route.query.uidb64 || route.params.uidb64

const password = ref('')
const passwordConfirm = ref('')
const isLoading = ref(false)

const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => v.length >= 8 || 'Min 8 characters',
]

const confirmPasswordRules = [(v) => v === password.value || 'Passwords do not match.']

// Placeholder login function
async function onSubmit() {
  if (password.value !== passwordConfirm.value) {
    Notify.create({
      message: 'Passwords do not match',
      color: 'negative',
      icon: 'error',
    })
  return
  }

  isLoading.value = true
  
  try {
    await authStore.setPassword(token, uidb64, {
      password: password.value
    })
  } catch (error) {
    console.error("Set Password Failed:", error)
  } finally {
    isLoading.value = false
  }
}
</script>
  