const fs = require('fs');

const files = [
  'src/app/dashboard/attendance/page.tsx',
  'src/app/dashboard/schedule/page.tsx',
  'src/app/dashboard/tasks/page.tsx',
  'src/app/dashboard/projects/page.tsx',
  'src/app/dashboard/team/page.tsx',
  'src/app/dashboard/users/page.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // We want to add setDeleteId(null) at the end of the executeDelete function.
  // The executeDelete function is an async function that has a try/catch block.
  // Let's replace the last } catch (error) { ... } with } catch (error) { ... } finally { setDeleteId(null); }
  // or simply replace toast.error("An error occurred");\n    } with toast.error("An error occurred");\n    } finally { setDeleteId(null); }
  
  if (content.includes('executeDelete') && !content.includes('finally { setDeleteId(null); }') && !content.includes('finally {\n      setDeleteId(null);')) {
    content = content.replace(/toast\.error\("An error occurred"\);\n\s*\}\n/g, 'toast.error("An error occurred");\n    } finally {\n      setDeleteId(null);\n    }\n');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
