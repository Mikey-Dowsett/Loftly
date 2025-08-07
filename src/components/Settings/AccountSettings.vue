<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';
import axios from 'axios';

const $q = useQuasar();
const auth = useAuthStore();
const router = useRouter();
const { handleError } = useErrorHandling();

const newEmail = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const confirmDelete = ref(false);

const updateEmail = async () => {
  if (!newEmail.value) return;
  $q.notify({
    message: 'Please check your inbox for a confirmation link',
    type: 'info',
    position: 'top-right'
  });

  try{
    await auth.updateUserEmail(newEmail.value);
  } catch (error) {
    handleError(error);
  }
};

const updatePassword = async () => {
  if (!newPassword.value || !confirmPassword.value) return;

  if (newPassword.value !== confirmPassword.value) {
    handleError('Passwords do not match');
    return;
  }

  try {
    await auth.updateUserPassword(newPassword.value);
    console.log('Password updated successfully');
    $q.notify({ type: 'positive', message: 'Password updated successfully', position: 'top-right' });

    // Optionally reset the fields
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error) {
    handleError(error);
  }
};

const signOut = async () => {
  await auth.signOut();
  await router.push('/');
};

const deleteAccount = async () => {
  if (!auth.user) return;

  try {
    const response = await axios.post('http://localhost:8000/delete-user', {
      user_id: auth.user?.id
    });
    $q.notify({
      message: 'Account deleted successfully',
      type: 'positive',
      position: 'top-right'
    });
    console.log(response.data);
    await auth.signOut();
    await router.push('/');
  } catch (error) {
    handleError(error);
  } finally {
    confirmDelete.value = false;
  }
};

const emailRule = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email';
</script>

<template>
  <div v-if="auth.user">
    <h4><q-icon name="fa-solid fa-circle-check" /> {{ auth.user.email }}</h4>

    <q-separator />

    <q-form @submit.prevent="updateEmail">
      <h5><strong>New Email</strong></h5>

      <!-- Update Email -->
      <div>
        <q-input v-model="newEmail" label="New Email" standout :rules="[emailRule]">
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-envelope" />
          </template>
        </q-input>
        <q-btn label="Update Email" @click="updateEmail" color="primary" class="submit" />
      </div>
    </q-form>

    <q-separator />

    <q-form @submit.prevent="updatePassword">
      <h5><strong>New Password</strong></h5>
      <!-- Update Password -->
      <div>
        <q-input v-model="newPassword" label="New Password" type="password" standout clearable>
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-key" />
          </template>
        </q-input>
        <q-input v-model="confirmPassword" label="Confirm Password" type="password" standout clearable>
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-key" />
          </template>
        </q-input>
        <q-btn label="Update Password" @click="updatePassword" class="submit" color="primary" />
      </div>
    </q-form>

    <q-separator />

    <!-- Sign Out -->
    <q-btn label="Sign Out" @click="signOut" color="negative" class="submit" flat />

    <q-separator />

    <!-- Delete Account -->
    <q-btn
      label="Delete Account"
      color="negative"
      @click="confirmDelete = true"
      class="submit"
    />

    <!-- Confirm Dialog -->
    <q-dialog v-model="confirmDelete">
      <q-card>
        <q-card-section>
          <h4><q-icon name="fa-solid fa-warning" color="negative" /> Confirm Delete</h4>
          <p>Are you sure you want to delete your account? This action is permanent.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Delete" color="negative" @click="deleteAccount" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>

  <div v-else>
    <q-spinner />
  </div>
</template>

<style scoped>
p {
  margin-bottom: 8px;
}
</style>
