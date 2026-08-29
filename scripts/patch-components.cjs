const fs = require('fs');
const path = require('path');
const glob = require('glob');

const analyticsFiles = glob.sync('components/summary-table/**/*Analytics.vue', { cwd: process.cwd() });
const tableFiles = glob.sync('components/summary-table/**/*Table.vue', { cwd: process.cwd() });

let modifiedFiles = [];

analyticsFiles.forEach(file => {
  const absolutePath = path.resolve(file);
  let content = fs.readFileSync(absolutePath, 'utf8');

  if (!content.includes('selectedSatker: {')) {
    // 1. Add selectedSatker to props
    content = content.replace(
      /selectedYear: {\s*type: String,\s*required: true\s*}/g,
      `selectedYear: {\n    type: String,\n    required: true\n  },\n  selectedSatker: {\n    type: String,\n    default: null\n  }`
    );

    // 2. Add satker to params
    content = content.replace(
      /params: {\s*tahun: props.selectedYear\s*}/g,
      `params: { tahun: props.selectedYear, satker: props.selectedSatker || undefined }`
    );

    // 3. Add watch for selectedSatker
    const watchRegex = /watch\(\s*\(\)\s*=>\s*props.selectedYear,\s*\(\)\s*=>\s*{\s*loadStatsAndAnalytics\(\);\s*}\s*\);/g;
    const newWatch = `watch(() => props.selectedYear, () => {
  loadStatsAndAnalytics();
});
watch(() => props.selectedSatker, () => {
  loadStatsAndAnalytics();
});`;
    
    if (content.match(watchRegex)) {
        content = content.replace(watchRegex, newWatch);
    } else {
        // Find existing watch or mount
        content = content.replace(
            /watch\(\(\) => props.selectedYear, \(\) => loadStatsAndAnalytics\(\)\);/g,
            `watch(() => props.selectedYear, () => loadStatsAndAnalytics());\nwatch(() => props.selectedSatker, () => loadStatsAndAnalytics());`
        );
    }

    fs.writeFileSync(absolutePath, content, 'utf8');
    modifiedFiles.push(file);
  }
});

tableFiles.forEach(file => {
  const absolutePath = path.resolve(file);
  let content = fs.readFileSync(absolutePath, 'utf8');

  if (!content.includes('selectedSatker: {')) {
    // 1. Add selectedSatker to props
    content = content.replace(
      /selectedYear: {\s*type: String,\s*required: true\s*}/g,
      `selectedYear: {\n    type: String,\n    required: true\n  },\n  selectedSatker: {\n    type: String,\n    default: null\n  }`
    );

    // 2. Add satker to params
    content = content.replace(
      /tahun: props.selectedYear,/g,
      `tahun: props.selectedYear,\n          satker: props.selectedSatker || undefined,`
    );
    // fallback if no trailing comma
    content = content.replace(
      /tahun: props.selectedYear\n/g,
      `tahun: props.selectedYear,\n          satker: props.selectedSatker || undefined,\n`
    );

    // 3. Add watch for selectedSatker
    const watchRegex = /watch\(\s*\(\)\s*=>\s*props.selectedYear,\s*\(\)\s*=>\s*{\s*currentPage.value = 1;\s*loadData\(\);\s*}\s*\);/g;
    const newWatch = `watch(() => props.selectedYear, () => {
  currentPage.value = 1;
  loadData();
});
watch(() => props.selectedSatker, () => {
  currentPage.value = 1;
  loadData();
});`;

    if (content.match(watchRegex)) {
        content = content.replace(watchRegex, newWatch);
    } else {
        content = content.replace(
            /watch\(\(\) => props.selectedYear, \(\) => {\n  currentPage.value = 1;\n  loadData\(\);\n}\);/g,
            newWatch
        );
    }


    fs.writeFileSync(absolutePath, content, 'utf8');
    modifiedFiles.push(file);
  }
});

console.log('Modified components:', modifiedFiles.join(', '));
