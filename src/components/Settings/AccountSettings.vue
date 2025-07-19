<template>
  <q-card v-if="auth.user" class="wrapper">
    <h4><strong>Email:</strong> {{ auth.user.email }}</h4>

    <!-- Update Email -->
    <div class="section">
      <q-input v-model="newEmail" label="New Email" standout class="item">
        <template v-slot:prepend>
          <q-icon name="fa-solid fa-envelope" />
        </template>
      </q-input>
      <q-btn label="Update Email" @click="updateEmail" color="primary" class=" item q-ml-lg" />
    </div>


    <h4><strong>Password</strong></h4>
    <!-- Update Password -->
    <div class="section">
      <q-input v-model="newPassword" label="New Password" type="password" standout class="item">
        <template v-slot:prepend>
          <q-icon name="fa-solid fa-key" />
        </template>
      </q-input>
      <q-btn label="Update Password" @click="updatePassword" class="item q-ml-lg" color="primary" />
    </div>

    <div class="actions">
      <!-- Sign Out -->
      <q-btn label="Sign Out" @click="signOut" color="negative" class="item" />

      <!-- Delete Account -->
      <q-btn
        label="Delete Account"
        color="negative"
        flat
        @click="confirmDelete = true"
        class="item"
      />
    </div>

    <!-- Confirm Dialog -->
    <q-dialog v-model="confirmDelete">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
          <p>Are you sure you want to delete your account? This action is permanent.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteAccount" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>

  <div v-else>
    <q-spinner />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores';

const auth = useAuthStore();
const router = useRouter();

const newEmail = ref('');
const newPassword = ref('');
const confirmDelete = ref(false);

const updateEmail = () => {
  if (!newEmail.value) return;

  // const { error } = await auth.updateUser({ email: newEmail.value });
  // if (error) {
  //   alert('Error updating email: ' + error.message);
  // } else {
  //   alert('Check your email to confirm the change.');
  // }
};

const updatePassword = () => {
  if (!newPassword.value) return;

  // const { error } = await auth.updateUser({ password: newPassword.value });
  // if (error) {
  //   alert('Error updating password: ' + error.message);
  // } else {
  //   alert('Password updated successfully.');
  // }
};

const signOut = async () => {
  await auth.signOut();
  await router.push('/');
};

const deleteAccount = () => {
  if (!auth.user) return;

  // const { error } = await functions.invoke('delete-user', {
  //   body: { user_id: auth.user?.id },
  // });

  // if (error) {
  //   alert('Error deleting account: ' + error.message);
  // } else {
  //   await signOut();
  // }
};
</script>

<style scoped>
.wrapper {
  width: 75%;
  margin: 0 auto;
}
.section {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}
.actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 2rem;
  gap: 1rem;
}
.item {
  width: 40%;
}
p {
  margin-bottom: 8px;
}
</style>
