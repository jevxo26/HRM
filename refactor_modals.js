const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/attendance/page.tsx',
  'src/app/dashboard/schedule/page.tsx',
  'src/app/dashboard/tasks/page.tsx',
  'src/app/dashboard/projects/page.tsx',
  'src/app/dashboard/team/page.tsx',
  'src/app/dashboard/users/page.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} - not found`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Check if already refactored
  if (content.includes('ConfirmModal')) continue;

  // 1. Add import
  content = content.replace(/(import React.*?from ["']react["'];?)/, `$1\nimport { ConfirmModal } from "@/components/ui/confirm-modal";`);

  // 2. Add state
  const stateRegex = /(const \[.*?\] = useState.*?;)/;
  content = content.replace(stateRegex, `$1\n  const [deleteId, setDeleteId] = useState<number | string | null>(null);`);

  // 3. Update handleDelete
  const confirmRegex = /const handleDelete = async \((.*?id): (.*?)\) => \{\s*if \(!confirm\("(.*?)"\)\) return;/;
  const match = content.match(confirmRegex);
  if (match) {
    const [fullMatch, idParam, idType, confirmText] = match;
    const newHandleDelete = `const executeDelete = async () => {\n    if (!deleteId) return;\n    const id = deleteId;`;
    content = content.replace(fullMatch, newHandleDelete);

    // 4. Update onClick
    // The onClick usually looks like onClick={() => handleDelete(record.id)}
    content = content.replace(/onClick=\{\(\) => handleDelete\((.*?)\)\}/g, `onClick={() => setDeleteId($1)}`);

    // 5. Add ConfirmModal before the last </div> which closes the main container
    // We can insert it just before the return's root element closing tag.
    // Instead of doing complicated parsing, we can just append it before the very last </div> if it ends with </div>, or find a safe spot.
    // Let's insert it before the last </div>
    const modalHtml = `\n      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={executeDelete} 
        title="Confirm Deletion" 
        description="${confirmText}" 
      />\n    </div>`;
    
    const lastDivIndex = content.lastIndexOf('</div>');
    if (lastDivIndex !== -1) {
      content = content.substring(0, lastDivIndex) + modalHtml + content.substring(lastDivIndex + 6);
    }
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
