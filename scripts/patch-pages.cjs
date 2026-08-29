const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'pages/summary-table/epurchasing-enriched.vue',
  'pages/summary-table/non-tender-enriched.vue',
  'pages/summary-table/pencatatan-nontender-enriched.vue',
  'pages/summary-table/pencatatan-swakelola-enriched.vue',
  'pages/summary-table/rup-penyedia-enriched.vue',
  'pages/summary-table/rup-swakelola-enriched.vue'
];

let modifiedFiles = [];
filesToPatch.forEach(file => {
  const absolutePath = path.resolve(file);
  let content = fs.readFileSync(absolutePath, 'utf8');
  
  if (!content.includes('selectedSatker')) {
    // 1. Add Satker Select in template
    const yearSelectRegex = /<MazSelect\s+v-model="selectedYear"[\s\S]*?\/>/;
    const satkerSelectHtml = `
        <div class="h-6 w-px bg-[color:hsl(var(--maz-border))]"></div>
        <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))] whitespace-nowrap">Satker:</span>
        <MazSelect
          v-model="selectedSatker"
          :options="satkerOptions"
          size="sm"
          search
          placeholder="Semua Satker"
          class="w-64"
          clearable
        />`;
    
    content = content.replace(yearSelectRegex, match => match + satkerSelectHtml);

    // 2. Pass prop to Analytics and Table
    content = content.replace(/:selected-year="selectedYear"\s*\/>/g, ':selected-year="selectedYear" :selected-satker="selectedSatker" />');
    
    // Also handle case where there is no space before />
    content = content.replace(/:selected-year="selectedYear"\/>/g, ':selected-year="selectedYear" :selected-satker="selectedSatker" />');

    // 3. Add Script Logic
    const scriptSetupRegex = /<script setup>[\s\S]*?const selectedYear = ref.*?;\n/;
    const satkerScriptLogic = `
import { onMounted, watch } from 'vue';

const selectedSatker = ref(null);
const satkerOptions = ref([]);

const fetchSatker = async () => {
  try {
    const res = await $fetch('/api/data/master-satker', {
      params: { tahun: selectedYear.value }
    });
    if (res.success) {
      satkerOptions.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load satker:', error);
  }
};

onMounted(() => {
  fetchSatker();
});

watch(selectedYear, () => {
  selectedSatker.value = null;
  fetchSatker();
});
`;
    content = content.replace(scriptSetupRegex, match => match + satkerScriptLogic);

    fs.writeFileSync(absolutePath, content, 'utf8');
    modifiedFiles.push(file);
  }
});
console.log('Modified pages:', modifiedFiles.join(', '));
