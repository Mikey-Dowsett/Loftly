<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore, useAccountsStore } from 'stores'

import ConnectAccountsComponent from 'components/ConnectAccountsComponent.vue';

const auth = useAuthStore();
const accounts = useAccountsStore();
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $q = useQuasar();

const title = ref('')
const message = ref('');
const tags = ref('')
const media_tab = ref('images');
const rawImages = ref<File[]>([]);
const images = ref<{ blob: File; url: string }[]>([]);
const imageFileInput = ref();
const video = ref();
const date = ref('');

const loading = ref(false);
const loadingProgress = ref(0);

const onSubmit = async () => {
  loadingProgress.value = 0;
  loading.value = true;
  if(!auth.user|| !accounts) return;

  if(accounts.enabledAccounts.length === 0) {
    $q.notify({
      message: 'Please select at least one account',
      type: 'negative',
      position: 'top-right',
    });
    loading.value = false;
    return;
  }

  try {
    //Upload any media files
    const uploadedMediaFilenames: string[] = [];
    let uploadedVideoFilename: string | null = null;

    if (images.value && media_tab.value === 'images') {
      const filesUploaded = ref(0);
      for (const file of images.value) {
        const uploaded = await uploadMedia(file.blob, 'images');
        uploadedMediaFilenames.push(uploaded.filename);
        filesUploaded.value++;
        loadingProgress.value = loadingProgress.value + filesUploaded.value / 10;
      }
    } else if (video.value && media_tab.value === 'videos') {
      const uploaded = await uploadMedia(video.value, 'videos');
      uploadedVideoFilename = uploaded.filename;
    }

    // Construct the Post payload
    const postPayload = {
      message: message.value || null,
      connected_accounts: accounts.enabledAccounts,
      media_filenames: uploadedMediaFilenames.length > 0 ? uploadedMediaFilenames : null,
      video_filename: uploadedVideoFilename,
      poll: null,
      type: uploadedVideoFilename ? 'video' : uploadedMediaFilenames.length ? 'media' : 'text',
      visibility: 'public',
      author_id: auth.user.id,
      created_at: new Date().toISOString(),
    };

    // Send to FastAPI
    const response = await axios.post('http://0.0.0.0:8000/create_post/', postPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response)

    loadingProgress.value = 1;
    $q.notify({
      type: 'positive',
      message: 'Successfully posted!',
      position: 'top-right',
    });

    resetForm();
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Something went wrong!',
      position: 'top-right',
    });

    console.error(err);
  }

  loadingProgress.value = 1;
  await sleep(2500);
  loading.value = false;
};

function resetForm() {
  title.value = '';
  message.value = '';
  tags.value = '';
  media_tab.value = 'images';

  rawImages.value = [];
  images.value.forEach(img => URL.revokeObjectURL(img.url)); // Clean up URLs
  images.value = [];
  imageFileInput.value = ref();

  video.value = null;
  loadingProgress.value = 0;
}

function onFileChange() {
  // Revoke previous URLs
  images.value.forEach(({ url }) => URL.revokeObjectURL(url));

  images.value = rawImages.value.map((file) => ({
    blob: file,
    url: URL.createObjectURL(file),
  }));
}

function removeFile(index: number) {
  rawImages.value.splice(index, 1);
  images.value.splice(index, 1);
}

function shiftFiles(index: number, dir: number) {
  if (index < 0 || rawImages.value.length < 1) return;
  const curRawImage = rawImages.value[index];
  const nextRawImage = rawImages.value[index + dir];
  if (curRawImage && nextRawImage) {
    rawImages.value[index] = nextRawImage;
    rawImages.value[index + dir] = curRawImage;
  }

  const curImage = images.value[index];
  const nextImage = images.value[index + dir];
  if (curImage && nextImage) {
    images.value[index] = nextImage;
    images.value[index + dir] = curImage;
  }
}

// Upload media to the user's supabase folders
async function uploadMedia(
  file: File,
  bucket: string,
): Promise<{ filename: string }> {
  try {
    if (!auth.user) return { filename: '' };
    const timestamp = Date.now(); // e.g. 1720293300000
    const fileExt = file.name.split('.').pop(); // Get file extension
    const baseName = file.name.split('.').slice(0, -1).join('.'); // Remove extension
    const newFileName = `${baseName}_${timestamp}.${fileExt}`;
    const path = `${auth.user.id}/${newFileName}`;
    console.log(`Before supabase: ${file.name}`);
    await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    console.log(`After supabase: ${file.name}`);
    return { filename: newFileName };
  } catch (error) {
    console.error(error);
    return { filename: '' };
  }
}

const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

onMounted( () => {
  if(!auth.user)  {
    window.location.href = '/';
  }
});
</script>

<template>
  <div class="main-wrapper">
    <q-form class="form-wrapper" @submit="onSubmit">
      <q-card>
        <div style="display: flex; align-items: center;">
          <q-icon name="fa-solid fa-pencil" size="sm" class="q-mr-md" />
          <h4>Message</h4>
        </div>
        <q-input label="Title" v-model="title" outlined hint="Used for Lemmy">
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-pen-fancy" />
          </template>
        </q-input>
        <q-input label="Main Body" v-model="message" outlined type="textarea" autogrow
                 style="font-size: large" input-style="min-height: 10rem; max-height: 10rem; overflow-y: auto;">
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-message" />
          </template>
        </q-input>

        <q-input label="Hashtags" v-model="tags" outlined type="textarea" autogrow bottom-slots hint="Used for Bluesky, Mastodon"
                 style="font-size: large" input-style="min-height: 5rem; max-height: 5rem; overflow-y: auto;">
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
        <q-file standout v-if="media_tab === 'images'" v-model="rawImages"
          multiple append counter accept="image/*" ref="imageFileInput"
          label="Drop image files here" @update:model-value="onFileChange" clearable>
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-upload" />
          </template>
        </q-file>
        <q-file standout v-else v-model="video" counter accept="video/*" label="Drop video file here">
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-upload" />
          </template>
        </q-file>

        <div v-if="media_tab === 'images'" class="image-gallery">
          <q-img v-for="(image, index) in images" :key="index" :src="image.url" class="preview_image">
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

        <div style="display: flex; align-items: center;">
          <q-icon name="fa-solid fa-calendar-days" size="md" class="q-mr-md"/>
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

        <q-btn label="Post" type="submit" color="positive" class="submit" :disable="loading" :loading="loading" />
      </q-card>
    </q-form>

    <ConnectAccountsComponent v-if="accounts.accounts" />
  </div>

  <div v-if="loading">
    <q-linear-progress :value="loadingProgress" color="warning" />
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
