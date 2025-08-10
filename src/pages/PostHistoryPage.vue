<script setup lang="ts">
import { date } from 'quasar'
import { useHistoryStore } from 'stores'
import { type AccountPost } from 'stores/models'

const historyStore = useHistoryStore()
console.log('historyStore', historyStore.posts)

function getSubPosts(postId: number): AccountPost[] {
  return historyStore.sub_posts.filter((sp) => sp.post_id === postId)
}

function openLink(url: string, platform: string): void {
  if (platform === 'bluesky') {
    const did = url.split("at://")[1]
    const profile = did?.split("/")[0]
    const post = did?.split("/")[2]
    url = `https://bsky.app/profile/${profile}/post/${post}`
  }

  window.open(url, '_blank')
}

function formatDate(d: string): string {
  return date.formatDate(d, 'HH:mm DD/MM/YYYY')
}

function getPostIcon(status: string): string {
  switch (status) {
    case 'Success': return 'fa-solid fa-thumbs-up'
    case 'Partial': return 'fa-solid fa-hand-spock'
    case 'Failed': return 'fa-solid fa-thumbs-down'
    default: return 'help'
  }
}

function getPostColor(status: string): string {
  switch (status) {
    case 'Success': return 'positive'
    case 'Partial': return 'warning'
    case 'Failed': return 'negative'
    default: return 'grey'
  }
}
</script>

<template>
  <q-timeline color="primary" style="padding: 5rem;">
    <q-card class="q-mb-md">

    <q-timeline-entry
      v-for="post in historyStore.posts"
      :key="post.id"
      :title="post.content"
      :subtitle="formatDate(post.created_at)"
      :icon="getPostIcon(post.status)"
      :color="getPostColor(post.status)">
      <div>
        <q-badge :color="getPostColor(post.status)" align="top" class="q-mr-sm">
          {{ post.status }}
        </q-badge>
      </div>

      <q-expansion-item
        expand-icon="fa-solid fa-caret-up"
        label="View Platform Posts"
        style="font-weight: bold"
        icon="fa-solid fa-envelopes-bulk">
        <q-list separator>

          <q-item
            v-for="sub in getSubPosts(post.id)"
            :key="sub.id"
            class="q-pa-sm">
            <q-item-section>
              <div style="display: flex;">
                <div>
                  <div class="text-subtitle2 text-weight-bold">{{ sub.platform }} ({{ sub.handle }})</div>
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
  </q-card>

  </q-timeline>
</template>


<!--<template>-->
<!--  <div v-for="post in historyStore.posts" :key="post.id" class="q-ma-lg">-->
<!--    <q-card>-->

<!--      &lt;!&ndash; Main Post Header &ndash;&gt;-->
<!--      <q-card-section class="bg-primary text-white flex">-->
<!--        <div>-->
<!--          <h4>{{ post.content }}</h4>-->
<!--          <h4 class="text-caption">Posted: {{ formatDate(post.created_at) }}</h4>-->
<!--        </div>-->
<!--        <div style="margin: auto 1rem auto auto;">-->
<!--          <q-icon v-if="post.status === 'Success'" name="fa-solid fa-circle-check" color="positive" size="xl" />-->
<!--          <q-icon v-if="post.status === 'Partial'" name="fa-solid fa-circle-minus" color="warning" size="xl" />-->
<!--          <q-icon v-if="post.status === 'Failed'" name="fa-solid fa-circle-xmark" color="negative" size="xl" />-->
<!--        </div>-->
<!--      </q-card-section>-->

<!--      &lt;!&ndash; Sub Posts &ndash;&gt;-->
<!--      <q-separator />-->
<!--      <q-card-section>-->
<!--        <q-expansion-item-->
<!--          expand-separator-->
<!--          icon="expand_more"-->
<!--          label="Sub Posts (Platforms)"-->
<!--          default-opened-->
<!--        >-->
<!--          <q-list>-->

<!--            <q-item-->
<!--              v-for="sub in getSubPosts(post.id)"-->
<!--              :key="sub.id"-->
<!--            >-->
<!--              <q-item-section>-->
<!--                <div class="text-subtitle2">{{ sub.platform }} ({{ sub.handle }})</div>-->
<!--                <div class="text-caption">Status: {{ sub.status }}</div>-->
<!--                <div class="text-caption">Posted: {{ formatDate(sub.created_at) }}</div>-->
<!--                <div class="text-caption">Message: {{ sub.message }}</div>-->
<!--                <div v-if="sub.post_url" class="text-caption">-->
<!--                  <q-btn :href="sub.post_url" target="_blank" label="View Post" outline color="primary" size="md"-->
<!--                    class="q-mt-md"/>-->
<!--                </div>-->
<!--              </q-item-section>-->
<!--            </q-item>-->

<!--            <q-item v-if="getSubPosts(post.id).length === 0">-->
<!--              <q-item-section>-->
<!--                <div class="text-caption text-grey">No sub posts available.</div>-->
<!--              </q-item-section>-->
<!--            </q-item>-->

<!--          </q-list>-->
<!--        </q-expansion-item>-->
<!--      </q-card-section>-->

<!--    </q-card>-->
<!--  </div>-->
<!--</template>-->

<style scoped>

</style>
