<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { useAuthStore, useStorageStore, useAccountsStore } from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';

import ConnectAccountsComponent from 'components/Account Components/ConnectAccountsComponent.vue';
import LemmyCommunitiesSearchComponent from 'components/LemmyCommunitiesSearchComponent.vue';

const auth = useAuthStore();
const accounts = useAccountsStore();
const storage = useStorageStore();
const $q = useQuasar();
const $router = useRouter();

const { handleError, validatePost, showValidationErrors } = useErrorHandling();

const title = ref('');
const message = ref('');
const tags = ref('');
const media_tab = ref('images');
const rawImages = ref<File[]>([]);
const images = ref<{ blob: File; url: string }[]>([]);
const imageFileInput = ref();
const video = ref();
const date = ref('');

const loading = ref(false);
const loadingProgress = ref(0);
const loadingStep = ref('');

const onSubmit = async () => {
  loadingProgress.value = 0;
  loadingStep.value = '';
  loading.value = true;

  let uploadedImageFilenames: string[] = [];
  let uploadedVideoFilename: string | null = null;

  try {
    //Step 1: Validate user
    if (!auth.user) {
      throw Error('You must be logged in to create posts');
    }

    console.log(accounts.enabledAccounts.length);
    if (!accounts || accounts.enabledAccounts.length === 0) {
      throw new Error('Please select at least one account to post to');
    }

    console.log(accounts.accounts);

    //Step 2: Validate post has some content
    const validationErrors = validatePost(message.value, rawImages.value, video.value);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    //Step 3: Validate media files
    if (images.value.length > 0 && media_tab.value === 'images') {
      try {
        loadingStep.value = 'Uploading images...';
        loadingProgress.value = 0.3;

        uploadedImageFilenames = await storage.uploadImages(rawImages.value);
        loadingProgress.value = 0.6;
      } catch (uploadError) {
        handleError(uploadError, 'Image Upload');
        return;
      }
    }

    if (video.value && media_tab.value === 'videos') {
      try {
        loadingStep.value = 'Uploading video...';
        loadingProgress.value = 0.3;
        // Implement video upload when ready
        // uploadedVideoFilename = await uploadVideoWithProgress(video.value);
        uploadedVideoFilename = null;
        loadingProgress.value = 0.6;
      } catch (uploadError) {
        handleError(uploadError, 'Video Upload');
        return;
      }
    }

    // Step 4: Prepare the payload
    loadingStep.value = 'Creating post...';
    loadingProgress.value = 0.7;

    const postPayload = {
      title: title.value || null,
      message: message.value || null,
      language: 'EN',
      nsfw: false,
      connected_accounts: accounts.enabledAccounts,
      media_filenames: uploadedImageFilenames.length > 0 ? uploadedImageFilenames : null,
      video_filename: uploadedVideoFilename,
      poll: null,
      type: uploadedVideoFilename ? 'video' : uploadedImageFilenames.length ? 'media' : 'text',
      visibility: 'public',
      user_id: auth.user.id,
      supabase_jwt: auth.session?.access_token,
      supabase_refresh_jwt: auth.session?.refresh_token,
      created_at: new Date().toISOString(),
    };

    //Step 5: Send payload to API
    loadingStep.value = 'Publishing post...';
    loadingProgress.value = 0.9;

    const response = await axios.post(
      `http://localhost:8000/create_post`,
      postPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 Seconds
      }
    );

    console.log(response.data);

    // Step 6: Post success
    loadingStep.value = 'Post created successfully!';
    loadingProgress.value = 1;

    $q.notify({
      type: 'positive',
      message: 'Post created successfully!',
      position: 'top-right',
      timeout: 3000,
      actions: [
        {
          icon: 'fa-solid fa-close',
          color: 'white',
          handler: () => {}
        }
      ]
    });

    resetForm();
  } catch (error) {
    // Clean up any uploaded files if post creation failed
    if (uploadedImageFilenames.length > 0) {
      try {
        await storage.deleteImages(uploadedImageFilenames);
      } catch (cleanupError) {
        // Log cleanup errors but don't show to user
        console.error('Failed to clean up uploaded images:', cleanupError);
      }
    }

    // Handle the error using our centralized system
    handleError(error, 'Post Creation');
  } finally {
    loadingProgress.value = 0;
    loadingStep.value = '';
    loading.value = false;
  }
};

function resetForm() {
  try {
    // Clean up form fields
    title.value = '';
    message.value = '';
    tags.value = '';
    media_tab.value = 'images';
    date.value = '';

    // Clean up file URLs to prevent memory leaks
    images.value.forEach(img => URL.revokeObjectURL(img.url));
    rawImages.value = [];
    images.value = [];

    // Reset file input
    if (imageFileInput.value) {
      imageFileInput.value = null;
    }

    video.value = null;
    loadingProgress.value = 0;
    loadingStep.value = '';

  } catch (error) {
    handleError(error, 'Form Reset');
  }
}

function onFileChange() {
  try {
    // Revoke previous URLs to prevent memory leaks
    images.value.forEach(({ url }) => URL.revokeObjectURL(url));

    // Validate files before creating URLs
    const validFiles = rawImages.value.filter(file => {
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        $q.notify({
          type: 'negative',
          message: `"${file.name}" is not a valid image file`,
          position: 'top-right'
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        $q.notify({
          type: 'negative',
          message: `"${file.name}" is too large (max 10MB)`,
          position: 'top-right'
        });
        return false;
      }

      return true;
    });

    // Update rawImages to only include valid files
    rawImages.value = validFiles;

    // Create preview URLs only for valid files
    images.value = validFiles.map((file) => ({
      blob: file,
      url: URL.createObjectURL(file),
    }));

  } catch (error) {
    handleError(error, 'File Selection');
  }
}

function removeFile(index: number) {
  try {
    // Revoke URL before removing to prevent memory leaks
    if (images.value[index]) {
      URL.revokeObjectURL(images.value[index].url);
    }

    rawImages.value.splice(index, 1);
    images.value.splice(index, 1);

  } catch (error) {
    handleError(error, 'File Removal');
  }
}

function shiftFiles(index: number, dir: number) {
  try {
    if (index < 0 || rawImages.value.length < 1) return;

    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= rawImages.value.length) return;

    // Swap raw images
    const curRawImage = rawImages.value[index];
    const nextRawImage = rawImages.value[index + dir];
    if (curRawImage && nextRawImage) {
      rawImages.value[index] = nextRawImage;
      rawImages.value[index + dir] = curRawImage;
    }

    // Swap display images
    const curImage = images.value[index];
    const nextImage = images.value[index + dir];
    if (curImage && nextImage) {
      images.value[index] = nextImage;
      images.value[index + dir] = curImage;
    }

  } catch (error) {
    handleError(error, 'File Reordering');
  }
}

onMounted(async () => {
  try {
    if (!auth.user) {
      $q.notify({
        type: 'negative',
        message: 'Please log in to create posts',
        position: 'top-right',
        timeout: 5000
      });

      await $router.push('/login');
    }
  } catch (error) {
    handleError(error, 'Component Mount');
  }
});

onUnmounted(() => {
  images.value.forEach(img => URL.revokeObjectURL(img.url));
});
</script>

<template>
  <div class="main-wrapper">
    <q-form class="form-wrapper" @submit="onSubmit">
      <q-card>
        <div style="display: flex; align-items: center">
          <q-icon name="fa-solid fa-pencil" size="sm" class="q-mr-md" />
          <h4>Message</h4>
        </div>
        <q-input label="Title" v-model="title" outlined hint="Used for Lemmy">
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-pen-fancy" />
          </template>
        </q-input>
        <q-input
          label="Main Body"
          v-model="message"
          outlined
          type="textarea"
          autogrow
          style="font-size: large"
          input-style="min-height: 10rem; max-height: 10rem; overflow-y: auto;"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-message" />
          </template>
        </q-input>

        <q-input
          label="Hashtags"
          v-model="tags"
          outlined
          type="textarea"
          autogrow
          bottom-slots
          hint="Used for Bluesky, Mastodon"
          style="font-size: large"
          input-style="min-height: 5rem; max-height: 5rem; overflow-y: auto;"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-hashtag" />
          </template>
          <!--          <template v-slot:counter>-->
          <!--            <q-btn label="Generate with AI" class="submit" color="positive" size="sm" />-->
          <!--          </template>-->
        </q-input>

        <!-- Media Uploader -->
        <div style="display: flex; align-items: center">
          <q-icon name="fa-solid fa-photo-film" size="md" class="q-mr-md" />
          <h4>Media Upload</h4>
          <p style="margin: auto 1rem">(Optional)</p>
        </div>
        <q-tabs v-model="media_tab" indicator-color="transparent">
          <q-tab name="images" icon="fa-solid fa-image" label="Images" />
          <q-tab name="videos" icon="fa-solid fa-film" label="Videos" />
        </q-tabs>
        <q-file
          standout
          v-if="media_tab === 'images'"
          v-model="rawImages"
          multiple
          append
          counter
          accept="image/*"
          ref="imageFileInput"
          label="Drop image files here"
          @update:model-value="onFileChange"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-upload" />
          </template>
        </q-file>
        <q-file
          standout
          v-else
          v-model="video"
          counter
          accept="video/*"
          label="Drop video file here"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-upload" />
          </template>
        </q-file>

        <div v-if="media_tab === 'images'" class="image-gallery">
          <q-img
            v-for="(image, index) in images"
            :key="index"
            :src="image.url"
            class="preview_image"
          >
            <div class="image-button-group">
              <q-btn
                icon="fa-solid fa-xmark"
                @click="removeFile(index)"
                class="image-remove"
                round
                color="negative"
              />
              <q-btn
                v-if="index !== 0"
                icon="fa-solid fa-caret-left"
                @click="shiftFiles(index, -1)"
                class="image-left"
                round
                color="info"
              />
              <q-btn
                v-if="index !== images.length - 1"
                icon="fa-solid fa-caret-right"
                @click="shiftFiles(index, 1)"
                class="image-right"
                round
                color="info"
              />
            </div>
          </q-img>
        </div>

        <q-expansion-item label="Lemmy Communities" v-if="accounts.accounts.filter(a => a.platform === 'lemmy' && a.enabled).length > 0">
          <LemmyCommunitiesSearchComponent v-for="(account, index) in accounts.accounts.filter(a => a.platform === 'lemmy')" :key="index" :model-value="account" />
        </q-expansion-item>

        <div style="display: flex; align-items: center">
          <q-icon name="fa-solid fa-calendar-days" size="md" class="q-mr-md" />
          <h4>Schedule Post</h4>
        </div>

        <q-input standout v-model="date">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="date" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="date" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-btn
          label="Post"
          type="submit"
          color="positive"
          class="submit"
          :disable="loading"
          :loading="loading"
        />
      </q-card>
    </q-form>

    <ConnectAccountsComponent v-if="accounts.accounts" />
  </div>

  <div v-if="loading" class="loading-indicator">
    <q-linear-progress :value="loadingProgress" color="warning" />
    <p v-if="loadingStep" class="loadingStep">{{ loadingStep }}</p>
  </div>
</template>

<style scoped>
.main-wrapper {
  min-height: 100vh;
}
.form-wrapper {
  padding: 1rem;
  border-radius: 1rem;
  max-width: 40%;
  margin: 1rem auto auto;
}
.preview_image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 1rem;
  margin: 5px;
}
.image-gallery {
  display: flex;
  flex-wrap: wrap;
}
.image-button-group {
  width: 100%;
  height: 100%;
  background-color: transparent;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.image-button-group:hover {
  opacity: 1;
  transition: opacity 0.25s ease;
}
.image-remove {
  position: absolute;
  top: 0;
  right: 0;
}
.image-left {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
}
.image-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
}
.loading-indicator {
  margin-bottom: 1rem;
}

.loading-step {
  margin-top: 0.5rem;
  font-size: 2rem;
  color: #666;
  text-align: center;
  z-index: 2;
}

h4 {
  font-size: 1.4rem;
  font-weight: 600;
}
h6 {
  font-size: 0.9rem;
  font-weight: 400;
  color: #aaa;
}
</style>
