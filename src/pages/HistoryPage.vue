<script setup lang="ts">
import { ref, computed } from 'vue'
import { date } from 'quasar';
import { useHistoryStore } from 'stores';
import { type AccountPost } from 'stores/models';
import { onMounted } from 'vue';

const history = useHistoryStore();
const currentPage = ref(1);
const pageSize = ref(10);

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return history.posts.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(history.posts.length / pageSize.value);
});

onMounted(async () => {
  if(history.posts?.length === 0) {
    await history.fetchPostHistory();
  }
})

function getSubPosts(postId: number): AccountPost[] {
  return history.sub_posts.filter((sp) => sp.post_id === postId);
}

function openLink(url: string, platform: string): void {
  if (platform === 'bluesky') {
    const did = url.split('at://')[1];
    const profile = did?.split('/')[0];
    const post = did?.split('/')[2];
    url = `https://bsky.app/profile/${profile}/post/${post}`;
  }

  window.open(url, '_blank');
}

function formatDate(d: string): string {
  return date.formatDate(d, 'HH:mm DD/MM/YYYY');
}

function getPostIcon(status: string): string {
  switch (status) {
    case 'Success':
      return 'fa-solid fa-thumbs-up';
    case 'Partial':
      return 'fa-solid fa-hand-spock';
    case 'Failed':
      return 'fa-solid fa-thumbs-down';
    default:
      return 'help';
  }
}

function getPostColor(status: string): string {
  switch (status) {
    case 'Success':
      return 'positive';
    case 'Partial':
      return 'warning';
    case 'Failed':
      return 'negative';
    default:
      return 'grey';
  }
}
</script>

<template>
  <q-timeline color="primary" class="timeline">
    <q-card class="history">
      <q-timeline-entry
        v-for="post in paginatedPosts"
        :key="post.id"
        :title="post.content"
        :subtitle="formatDate(post.created_at)"
        :icon="getPostIcon(post.status)"
        :color="getPostColor(post.status)"
      >
        <div>
          <q-badge :color="getPostColor(post.status)" align="top" class="q-mr-sm">
            {{ post.status }}
          </q-badge>
        </div>

        <q-expansion-item
          expand-icon="fa-solid fa-caret-up"
          label="View Platform Posts"
          style="font-weight: bold"
          icon="fa-solid fa-envelopes-bulk"
        >
          <q-list separator>
            <q-item v-for="sub in getSubPosts(post.id)" :key="sub.id" class="q-pa-sm">
              <q-item-section>
                <div class="subpost">
                  <div>
                    <div class="text-subtitle2 text-weight-bold">
                      {{ sub.platform }} ({{ sub.handle }})
                    </div>
                    <div class="text-caption">Status: {{ sub.status }}</div>
                    <div class="text-caption">Posted: {{ formatDate(sub.created_at) }}</div>
                    <div class="text-caption">Message: {{ sub.message }}</div>
                  </div>
                  <div v-if="sub.post_url" class="q-mt-auto q-mb-auto q-mr-none q-ml-auto">
                    <q-btn
                      @click="openLink(sub.post_url, sub.platform)"
                      target="_blank"
                      label="View Post"
                      flat
                      color="primary"
                      size="lg"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>

            <q-item v-if="getSubPosts(post.id).length === 0">
              <q-item-section>
                <div class="text-caption text-grey">No sub posts available.</div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-timeline-entry>

      <div class="pagination">
        <q-pagination v-if="totalPages > 1"
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          :ellipses="false"
          color="primary"
          class="q-mt-md"
          direction-links
          />
      </div>
    </q-card>
  </q-timeline>
</template>

<style scoped>
.timeline {
  width: 75%;
  margin: 3rem auto;
}
.history {
  padding: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
}

.subpost {
  display: flex;
}
@media (max-width: 600px) {
  .timeline {
    width: 90%;
    margin: 1rem auto;
  }
  .history {
    width: 100%;
    padding: 1rem;
  }

  .subpost {
    display: inline;
  }
}
</style>
