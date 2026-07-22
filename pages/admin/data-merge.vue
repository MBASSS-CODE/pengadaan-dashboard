<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6 flex items-center gap-4">
      <NuxtLink to="/admin/system" class="text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Kelola Merge Data</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Pusat kontrol untuk menjalankan integrasi berbagai sumber data pengadaan</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 mb-6 pb-2 border-b border-[color:hsl(var(--maz-border))]">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'rup-penyedia' }"
        @click="activeTab = 'rup-penyedia'"
      >
        RUP Penyedia Master
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'non-tender' }"
        @click="activeTab = 'non-tender'"
      >
        Non-Tender
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content relative min-h-[400px]">
      <Transition name="fade" mode="out-in">
        <MergeRupPenyedia v-if="activeTab === 'rup-penyedia'" />
        <MergeNonTender v-else-if="activeTab === 'non-tender'" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MergeRupPenyedia from '~/components/admin/MergeRupPenyedia.vue';
import MergeNonTender from '~/components/admin/MergeNonTender.vue';

const activeTab = ref('rup-penyedia');
</script>

<style scoped>
.tab-btn {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--maz-muted));
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background-color: hsl(var(--maz-foreground) / 5%);
}

.tab-btn.active {
  background-color: hsl(var(--maz-primary) / 10%);
  color: hsl(var(--maz-primary));
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

/* Transition classes for smooth fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
