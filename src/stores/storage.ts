import { ref, unref } from 'vue';
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useAuthStore } from 'stores'

export const useStorageStore = defineStore('storage', {
  state:() => ({
    loading: false,
  }),

  actions: {
    async uploadImages(files: (File | Blob)[]) {
      const auth = useAuthStore();
      if (!auth.user) return [];
      this.loading = true;

      const newFileNames = ref<string[]>([]);
      const timestamp = Date.now();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        let fileName: string;
        let fileExt: string;

        if (!file) {
          console.warn(`Skipping undefined file at index ${i}`);
          continue;
        }

        if(file instanceof File) {
          fileExt = file.name.split('.').pop() ?? '.jpg';
          const baseName = file.name.split('.').slice(0, -1).join('.');
          fileName = `${baseName}_${timestamp}.${fileExt}`;
        } else {
          fileExt = file.type.split('/')[1] ?? 'jpg';
          fileName = `upload_${i}_${timestamp}.${fileExt}`;
        }

        const path = `${auth.user?.id}/${fileName}`;

        const { error } = await supabase.storage.from('images').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (error) throw error;
        newFileNames.value.push(fileName);
      }

      this.loading = false;
      return unref(newFileNames);
    },

    async deleteImages(files: string[]) {
      const auth = useAuthStore();
      if (!auth.user) return [];
      this.loading = true;

      const { error } = await supabase
        .storage
        .from('images')
        .remove(files)

      if (error) throw error;
      this.loading = false;
    }
  }
})
