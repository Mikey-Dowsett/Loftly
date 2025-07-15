<script setup lang="ts">
import { ref } from 'vue';
import { useLemmyStore } from 'stores';
import { type ConnectedAccount } from 'stores/models';
import type { ListCommunitiesResponse, CommunityView } from 'lemmy-js-client';

const lemmyStore = useLemmyStore();
const query = ref('');
const communities = ref();
const selectedCommunities = ref<CommunityView[]>([]);
const modelValue = defineModel<ConnectedAccount | null>({ default: null });

async function handleSearch() {
  if (!modelValue.value) return;

  const response: ListCommunitiesResponse = (await lemmyStore.searchCommunities(
    modelValue.value.instance,
    query.value,
    modelValue.value.access_token,
  )) ?? { communities: [] };

  communities.value = response.communities;
}

function selectCommunity(id: number) {
  const found: CommunityView = (communities.value.find((a: CommunityView) => a.community.id === id));

  if(found) {
    selectedCommunities.value.push(found);
    modelValue.value?.lemmy_communities.push({
      instance: modelValue.value.instance,
      community_id: found.community.id,
    });
    console.log(found);
  }
  communities.value = [];
  query.value = '';
}

function removeCommunity(id: number) {
  selectedCommunities.value = selectedCommunities.value.filter(
    (c) => c.community.id !== id
  );
  if (modelValue.value) {
    modelValue.value.lemmy_communities = modelValue.value.lemmy_communities.filter(
      (communityId) => communityId.community_id !== id
    );
  }
}
</script>

<template>
  <div>
    <div style="display: flex; align-items: center">
      <h6 class="q-mr-md">{{ modelValue?.instance }}: {{ modelValue?.handle }}</h6>
    </div>
    <q-input
      v-model="query"
      label="Search Communities"
      @update:model-value="handleSearch"
      debounce="250"
      standout
    >
      <q-list class="shadow-2 q-list-floating" v-if="query">
        <q-item
          v-for="c in communities"
          :key="c.id"
          clickable
          @click="selectCommunity(c.community.id)"
        >
          <q-item-section style="overflow-x: hidden; width: 50%">{{ c.community.title }}</q-item-section>
          <q-item-section>
            <div style="display: flex; align-items: center;">
              <q-chip v-if="c.community.local" color="positive" class="info-chip">Local</q-chip>
              <q-chip color="primary" class="info-chip">{{ c.community.visibility }}</q-chip>
              <q-chip v-if="c.community.nsfw" color="negative" class="info-chip">NSFW</q-chip>
            </div>
          </q-item-section>
          <q-tooltip>{{ c.community.actor_id }}</q-tooltip>
        </q-item>
      </q-list>
    </q-input>
    <q-chip
      v-for="(c, i) in selectedCommunities"
      :key="i"
      color="primary"
      removable
      @remove="removeCommunity(c.community.id)"
    >
      {{ c.community?.title }}
    </q-chip>
  </div>
</template>

<style scoped>
.q-list-floating {
  background-color: var(--q-background);
  color: var(--q-text);
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 10;
  max-height: 15rem;
  overflow-y: auto;
  border-radius: 1rem;
}

/* Hide scrollbar (cross-browser) */
.q-list-floating::-webkit-scrollbar {
  display: none;
}
.q-list-floating {
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
}
.q-item {
  font-size: larger;
}
.info-chip {
  margin-left: auto;
  margin-right: 0;
}
</style>
