import { ref, onMounted, watch, type Ref } from 'vue';

export interface SatkerOption {
  label: string;
  value: string;
}

/**
 * Shared state and loader for Satker filter dropdowns across summary-table pages.
 */
export const useSatkerFilter = (selectedYear: Ref<string>) => {
  const selectedSatker = ref<string | null>(null);
  const satkerOptions = ref<SatkerOption[]>([]);

  const fetchSatker = async () => {
    try {
      const res = await $fetch<{ success: boolean; data: SatkerOption[] }>('/api/data/master-satker', {
        params: { tahun: selectedYear.value }
      });
      if (res?.success && Array.isArray(res.data)) {
        satkerOptions.value = res.data;
      } else {
        satkerOptions.value = [];
      }
    } catch (error) {
      console.error('Failed to load satker:', error);
      satkerOptions.value = [];
    }
  };

  onMounted(() => {
    fetchSatker();
  });

  watch(selectedYear, () => {
    selectedSatker.value = null;
    fetchSatker();
  });

  return {
    selectedSatker,
    satkerOptions,
    fetchSatker
  };
};
