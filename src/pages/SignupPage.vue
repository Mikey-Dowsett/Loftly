<script setup lang="ts">
import { ref } from 'vue';
import { QForm } from 'quasar';
import { eventBus } from '../tools/event-bus';
import { useAuthStore } from 'stores'
import { useErrorHandling } from 'src/composables/useErrorHandling';
import { useNotify } from 'src/composables/useNotifications';

import ConnectLemmyComponent from 'components/Connections/ConnectLemmyComponent.vue';
import ConnectPixelfedComponent from 'components/Connections/ConnectPixelfedComponent.vue';
import ConnectBlueSkyComponent from 'components/Connections/ConnectBlueskyComponent.vue';
import ConnectMastodonComponent from 'components/Connections/ConnectMastodonComponent.vue';

const auth = useAuthStore();
const { handleError } = useErrorHandling();
const { notifyInfo, notifySuccess } = useNotify();

const formRef = ref();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const showVerificationDialog = ref(false);
const verificationCode = ref('');
const pendingEmail = ref('');
const pendingPassword = ref('');

const showOnboardDialog = ref(false);
const newBlueskyAccount = ref<boolean>(false);
const newMastodonAccount = ref<boolean>(false);
const newLemmyAccount = ref<boolean>(false);
const newPixelfedAccount = ref<boolean>(false);
const refreshKey = ref(0);

const confirmPasswordRule = (val: string) =>
  val === password.value || 'Passwords do not match';

const handleAuth = async () => {
  try {
    await auth.signUpWithEmail(email.value, password.value);
    pendingEmail.value = email.value;
    pendingPassword.value = password.value;

    showVerificationDialog.value = true;

    notifyInfo('Check your email for a verification code');
  } catch (error) {
    handleError(error);
    console.error(error);
  }
};

const cancelVerification = () => {
  showVerificationDialog.value = false;
  verificationCode.value = '';
};

const submitVerificationCode = async () => {
  try {
    await auth.verifyEmailWithCode(pendingEmail.value, verificationCode.value);

    showVerificationDialog.value = false;
    notifySuccess('Email verified! Logging you in...');
    showOnboardDialog.value = true;
  } catch (error) {
    handleError(error);
  }
};

eventBus.on('close-bluesky-login', () => {
  newBlueskyAccount.value = false;
  refreshKey.value++;
});
eventBus.on('close-mastodon-login', () => {
  newMastodonAccount.value = false;
  refreshKey.value++;
});
eventBus.on('close-lemmy-login', () => {
  newLemmyAccount.value = false;
  refreshKey.value++;
});
eventBus.on('close-pixelfed-login', () => {
  newPixelfedAccount.value = false;
  refreshKey.value++;
});

const emailRule = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Please enter a valid email';

const passwordLengthRule = (val: string) =>
  val.length >= 8 || 'Password must be at least 8 characters';

const securePasswordRule = (val: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val) ||
  'Password must include uppercase, lowercase, number, and special character';

</script>

<template>
  <q-card class="wrapper">
    <q-img src="/images/bird_chat.svg" />
    <div>
      <h2>Sign Up</h2>
      <p>Create an account to continue</p>
    </div>

    <q-form v-model:ref="formRef" @submit.prevent="handleAuth">
      <q-input
        v-model="email" type="email" placeholder="Email"
        class="input" rounded outlined
        :rules="[emailRule]" autocomplete="email">
        <template v-slot:prepend>
          <q-icon name="email" />
        </template>
      </q-input>
      <q-input v-model="password" type="password" placeholder="Password"
               class="input" rounded outlined
               :rules="[passwordLengthRule, securePasswordRule]" autocomplete="new-password">
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
      </q-input>
      <q-input
        v-model="confirmPassword" type="password" placeholder="Confirm Password"
        class="input" rounded outlined
        :rules="[confirmPasswordRule, passwordLengthRule, securePasswordRule]" autocomplete="new-password">
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
      </q-input>

      <q-btn no-caps type="submit" class="submit btn" color="positive" label="Sign Up" />

      <div>
        <q-btn no-caps class="btn"
               flat label="Already have an account? Login"
            @click="eventBus.emit('show-login')"/>
      </div>
    </q-form>
  </q-card>

  <q-dialog v-model="showVerificationDialog" persistent>
    <q-card class="q-pa-md" style="min-width: 300px">
      <q-card-section>
        <h4>Enter Verification Code</h4>
        <p class="text-subtitle2">Check your email and enter the code to complete registration.</p>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="verificationCode"
          type="text"
          label="Verification Code"
          standout
          autofocus
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="negative" @click="cancelVerification" />
        <q-btn flat label="Verify" color="primary" @click="submitVerificationCode" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showOnboardDialog" persistent>
    <q-card class="q-pa-md" style="min-width: 300px">
      <q-card-section>
        <div style="text-align: center">
          <h4>Add your first account</h4>
          <div>
            <q-btn icon="fa-brands fa-mastodon" flat round style="color: #5d52e9" size="lg"
              @click="newMastodonAccount = true"/>
            <q-btn icon="fa-brands fa-bluesky" flat round style="color: #1185fe" size="lg"
                   @click="newBlueskyAccount = true"/>
            <q-btn flat round size="lg" @click="newPixelfedAccount = true">
              <template v-slot:default>
                <q-img src="/icons/pixelfed.svg" style="width: 45px; height: 45px; margin-right: 5px"/>
              </template>
            </q-btn>
            <q-btn flat round size="lg" @click="newLemmyAccount = true">
              <template v-slot:default>
                <q-img src="/icons/lemmy.svg" style="width: 45px; height: 45px; margin-right: 5px"/>
              </template>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div style="text-align: center">
          <h4>And make your first post!</h4>
          <q-btn label="Post" class="submit btn" color="positive" to="/post" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <ConnectBlueSkyComponent v-if="newBlueskyAccount" v-model="newBlueskyAccount" :key="refreshKey" />
  <ConnectMastodonComponent v-if="newMastodonAccount" v-model="newMastodonAccount" :key="refreshKey" />
  <ConnectLemmyComponent v-if="newLemmyAccount" v-model="newLemmyAccount" :key="refreshKey" />
  <ConnectPixelfedComponent v-if="newPixelfedAccount" v-model="newPixelfedAccount" :key="refreshKey" />
</template>

<style scoped>
.wrapper {
  width: 50%;
  margin: 3rem auto;
  overflow-y: hidden;
}
.btn {
  width: 100%;
  margin-bottom: 1rem;
}
</style>
