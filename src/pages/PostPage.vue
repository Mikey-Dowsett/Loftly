<script setup lang="ts">
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { QExpansionItem } from 'quasar';
import axios from 'axios';
import { useAuthStore, useStorageStore, useAccountsStore,
  useUsageStore, usePlansStore} from 'stores';
import { useErrorHandling } from 'src/composables/useErrorHandling';
import { useNotify } from 'src/composables/useNotifications';

import ConnectAccountsComponent from 'components/Connections/ConnectAccountsComponent.vue';
import LemmyCommunitiesSearchComponent from 'components/LemmyCommunitiesSearchComponent.vue';

const auth = useAuthStore();
const accounts = useAccountsStore();
const plan = usePlansStore();
const storage = useStorageStore();
const usage = useUsageStore();

const { handleError, validatePost, showValidationErrors } = useErrorHandling();
const { notifySuccess } = useNotify();

const title = ref('');
const message = ref('');
const tags = ref('');
const media_tab = ref('images');
const rawImages = ref<File[]>([]);
const images = ref<{ blob: File; url: string }[]>([]);
const imageFileInput = ref();
const lemmyImageUrl = ref('')
const video = ref();
const date = ref('');
const nsfw = ref(false);

const maxCharCount = ref(300);
const usageLimit = computed(() => plan.plan?.post_limit || 0);
const currentUsage = computed(() => usage.usage?.post_count || 0);
const hasReachedLimit = computed(() => currentUsage.value >= usageLimit.value);

const loading = ref(false);
const loadingProgress = ref(0);
const loadingStep = ref('');

const showImageLimits = ref(false);

const getUsageDisplay = () => {
  const used = usage.usage?.post_count || 0;
  const limit = plan.plan?.post_limit || 0;
  if(limit - used < 0)
    return 'Posts left: 0'
  return `Posts left: ${limit - used}`;
};

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

    // Add usage limit check at the start
    if (hasReachedLimit.value) {
      throw Error('Post limit reached. Please upgrade your plan for more posts.');
    }

    console.log(accounts.enabledAccounts.length);
    if (!accounts || accounts.enabledAccounts.length === 0) {
      throw new Error('Please select at least one account to post to');
    }

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
      nsfw: nsfw.value || false,
      connected_accounts: accounts.enabledAccounts,
      media_filenames: uploadedImageFilenames.length > 0 ? uploadedImageFilenames : null,
      lemmy_image_url: lemmyImageUrl.value,
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
      `http://loftlyapi.fly.dev/create-post`,
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

    notifySuccess('Post created successfully');

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
    images.value = [];
    if (!rawImages.value || rawImages.value.length === 0) return;

    // Validate files before creating URLs
    const validFiles = rawImages.value.filter(file => {
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        handleError(`${file.name} is not a valid image file`, 'File Validation');
        return false;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        handleError(`${file.name} is not a valid image file`, 'File Validation');
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

function updateLimits() {
  const PLATFORM_LIMITS: Record<string, number> = {
    bluesky: 300,
    mastodon: 500,
    lemmy: 10000,
    pixelfed: 500,
  };

  const enabledAccounts = accounts.accounts.filter(acc => acc.enabled);

  const limits = enabledAccounts
    .map(acc => PLATFORM_LIMITS[acc.platform])
    .filter(limit => limit !== undefined);

  // Default to 10000 if no limits found (no enabled accounts or unknown platforms)
  maxCharCount.value = limits.length > 0 ? Math.min(...limits) : 10000;
}

watch(
  () => accounts.accounts,
  updateLimits,
  { deep: true, immediate: true }
)

watch(media_tab, (val) => {
  if (val === 'videos' && !plan.plan?.video_access) {
    media_tab.value = 'images';
  }
});

onMounted(async () => {
  try {
    if (!auth.user) return;

    await plan.init();
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
    <div class="content-wrapper">
      <ConnectAccountsComponent v-if="accounts.accounts" class="accounts-column" />

      <q-form class="form-wrapper" @submit="onSubmit">
        <q-card>
          <div style="display: flex; align-items: center">
            <q-icon name="fa-solid fa-pencil" size="sm" class="q-mr-md" />
            <h4>Message</h4>
            <h4 class="q-mr-none q-ml-auto">{{ getUsageDisplay() }}</h4>
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
            counter
            :maxlength="maxCharCount"
          >
            <template v-slot:prepend>
              <q-icon name="fa-solid fa-message" />
            </template>
          </q-input>

  <!--        <q-input-->
  <!--          v-if="plan.plan?.name !== 'free'"-->
  <!--          label="Hashtags"-->
  <!--          v-model="tags"-->
  <!--          outlined-->
  <!--          type="textarea"-->
  <!--          autogrow-->
  <!--          bottom-slots-->
  <!--          hint="Used for Bluesky, Mastodon"-->
  <!--          style="font-size: large"-->
  <!--          input-style="min-height: 5rem; max-height: 5rem; overflow-y: auto;"-->
  <!--          hide-bottom-space-->
  <!--        >-->
  <!--          <template v-slot:prepend>-->
  <!--            <q-icon name="fa-solid fa-hashtag" />-->
  <!--          </template>-->
  <!--          <template v-slot:counter>-->
  <!--            <q-btn label="Generate with AI" class="submit" color="positive" size="sm" />-->
  <!--          </template>-->
  <!--        </q-input>-->

          <q-separator />

          <!-- Media Uploader -->
          <div style="display: flex; align-items: center">
            <q-icon name="fa-solid fa-photo-film" size="md" class="q-mr-md" />
            <h4>Media Upload</h4>
            <p style="margin: auto 1rem">(Optional)</p>
          </div>
          <q-tabs v-model="media_tab" indicator-color="transparent">
            <q-tab name="images" icon="fa-solid fa-image" label="Images" />
            <q-tab name="videos" icon="fa-solid fa-film" label="Videos"
                   :disable="true">
              <q-tooltip>Coming Soon</q-tooltip>
            </q-tab>
          </q-tabs>
          <q-tab-panels v-model="media_tab" animated>
            <q-tab-panel name="images">
              <q-file
                standout
                v-model="rawImages"
                multiple
                append
                counter
                :max-files="plan.plan?.image_limit"
                accept="image/*"
                ref="imageFileInput"
                label="Drop image files here"
                @update:model-value="onFileChange"
                clearable
                bottom-slots
              >
                <template v-slot:prepend>
                  <q-icon name="fa-solid fa-upload" />
                </template>
                <template v-slot:hint>
                  <q-btn label="limits" icon="fa-solid fa-circle-exclamation" flat @click="showImageLimits = true" />
                  <q-dialog v-model="showImageLimits">
                    <q-card>
                      <h4>Image Upload Limits</h4>
                      <ul>
                        <li>Lemmy: 1 Image(With a link, not an upload. Found under lemmy options)</li>
                        <li>Mastodon, Bluesky: 4 Images</li>
                        <li>Pixelfed: 20 Images</li>
                      </ul>
                      <div>Images are uploaded in the order you pick</div>
                      <div>Images are also compressed before being uploaded to fit platform limits</div>
                      <q-btn icon="fa-solid fa-xmark" flat round class="absolute-top-right q-ma-xs" @click="showImageLimits = false" />
                    </q-card>
                  </q-dialog>
                </template>
              </q-file>
              <div class="image-gallery">
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
            </q-tab-panel>
            <q-tab-panel name="videos" v-if="plan.plan?.video_access">
              <q-file
                standout
                v-model="video"
                counter
                accept="video/*"
                label="Drop video file here"
              >
                <template v-slot:prepend>
                  <q-icon name="fa-solid fa-upload" />
                </template>
              </q-file>
            </q-tab-panel>
          </q-tab-panels>

          <q-separator />

          <q-expansion-item v-if="accounts.accounts.filter(a => a.platform === 'lemmy' && a.enabled).length > 0"
                            expand-icon="fa-solid fa-caret-up" hide-icon="fa-solid fa-caret-down">
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon :name="'img: /icons/lemmy.svg'" size="xl" class="q-mr-md" />
              </q-item-section>
              <q-item-section>
                <h4>Lemmy Options</h4>
              </q-item-section>
            </template>
            <q-input v-model="lemmyImageUrl" label="Image URL" standout class="q-mt-md" />
            <div style="display: flex; align-items: center">
              <q-icon name="fa-solid fa-users-line" size="md" class="q-mr-md" />
              <h4>Communities</h4>
            </div>
            <LemmyCommunitiesSearchComponent v-for="(account, index) in accounts.accounts.filter(a => a.platform === 'lemmy')" :key="index" :model-value="account" />
          </q-expansion-item>

          <q-separator v-if="accounts.accounts.filter(a => a.platform === 'lemmy' && a.enabled).length > 0" />

  <!--        <div>-->
  <!--          <div style="display: flex; align-items: center">-->
  <!--            <q-icon name="fa-solid fa-calendar-days" size="md" class="q-mr-md" />-->
  <!--            <h4>Schedule Post</h4>-->
  <!--          </div>-->

  <!--          <q-input standout v-model="date">-->
  <!--            <template v-slot:prepend>-->
  <!--              <q-icon name="event" class="cursor-pointer">-->
  <!--                <q-popup-proxy cover transition-show="scale" transition-hide="scale">-->
  <!--                  <q-date v-model="date" mask="YYYY-MM-DD HH:mm">-->
  <!--                    <div class="row items-center justify-end">-->
  <!--                      <q-btn v-close-popup label="Close" color="primary" flat />-->
  <!--                    </div>-->
  <!--                  </q-date>-->
  <!--                </q-popup-proxy>-->
  <!--              </q-icon>-->
  <!--            </template>-->

  <!--            <template v-slot:append>-->
  <!--              <q-icon name="access_time" class="cursor-pointer">-->
  <!--                <q-popup-proxy cover transition-show="scale" transition-hide="scale">-->
  <!--                  <q-time v-model="date" mask="YYYY-MM-DD HH:mm" format24h>-->
  <!--                    <div class="row items-center justify-end">-->
  <!--                      <q-btn v-close-popup label="Close" color="primary" flat />-->
  <!--                    </div>-->
  <!--                  </q-time>-->
  <!--                </q-popup-proxy>-->
  <!--              </q-icon>-->
  <!--            </template>-->
  <!--          </q-input>-->
  <!--        </div>-->

          <q-card-section style="display: flex; align-items: center; margin: 0;">
            <h4>NSFW</h4>
            <q-toggle v-model="nsfw" class="q-mr-none q-ml-auto" />
          </q-card-section>
          <q-btn
            label="Post"
            type="submit"
            color="positive"
            class="submit"
            :disable="loading || hasReachedLimit"
            :loading="loading"
          />
        </q-card>
      </q-form>

      <div class="right-spacer"></div>
    </div>
  </div>

  <div v-if="loading" class="loading-indicator">
    <q-linear-progress :value="loadingProgress" color="warning">
      <div class="absolute-full flex flex-center">
        <q-badge color="primary" text-color="white" :label="loadingStep" style="font-size: x-large; font-weight: bold" />
      </div>
    </q-linear-progress>
  </div>
</template>

<style scoped>
.main-wrapper {
  width: 90%;
  margin: 3rem auto;
}
.content-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 2rem; /* spacing between columns */
}
.accounts-column {
  flex: 1;
  position: sticky;
  align-self: flex-start;
  align-items: flex-start;
  top: 2rem;
}
.form-wrapper {
  flex: 2;
  border-radius: 1rem;
}
.right-spacer {
  flex: 1;
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

h4 {
  font-size: 1.4rem;
  font-weight: 600;
}
h6 {
  font-size: 0.9rem;
  font-weight: 400;
  color: #aaa;
}

@media (max-width: 1024px) {
  .main-wrapper {
    width: 90%;
    margin: 0 auto;
  }
  .content-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .accounts-column {
    max-width: 90%;
    order: 2;
    margin: 0 auto 1rem auto;
    position: static;
  }

  .form-wrapper {
    max-width: 90%;
    order: 1;
    margin: 0 auto;
  }
}
</style>
