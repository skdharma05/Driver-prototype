const fs = require('fs');
const path = require('path');
const files = [
  'app/(trip)/signature.js', 
  'app/(trip)/pod-capture.js', 
  'app/(trip)/assignment.js', 
  'app/(trip)/active.js', 
  'app/(tabs)/trips/index.js', 
  'app/(tabs)/profile.js', 
  'app/(tabs)/payments.js', 
  'app/(tabs)/loads.js', 
  'app/(tabs)/loads/[id].js', 
  'app/(tabs)/index.js', 
  'app/(auth)/profile-setup.js', 
  'app/(auth)/otp.js', 
  'app/(auth)/index.js', 
  'app/(auth)/document-upload.js'
];

files.forEach(f => {
  const fp = path.join(__dirname, f);
  if(!fs.existsSync(fp)) return;
  let text = fs.readFileSync(fp, 'utf8');

  if (text.includes('SafeAreaView') && text.includes('react-native')) {
    let newText = text.replace(/import\s+{([^}]*)}\s+from\s+['"]react-native['"]/g, (match, group1) => {
       if (group1.includes('SafeAreaView')) {
           let newGroup = group1.split(',').map(s => s.trim()).filter(s => s !== 'SafeAreaView' && s !== '').join(', ');
           if (newGroup === '') return ''; 
           return `import { ${newGroup} } from 'react-native'`;
       }
       return match;
    });
    
    if (newText !== text) {
        newText = `import { SafeAreaView } from 'react-native-safe-area-context';\n` + newText;
        fs.writeFileSync(fp, newText);
        console.log('Updated', f);
    }
  }
});
