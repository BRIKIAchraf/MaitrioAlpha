const fs = require('fs');
const path = require('path');
const dirs = ['app', 'components', 'lib'];
const walk = (dir) => {
  let list = [];
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      list = list.concat(walk(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      list.push(fullPath);
    }
  });
  return list;
};

try {
  const allFiles = [...walk('app'), ...walk('components')];
  
  allFiles.forEach(f => {
    const p = path.resolve('c:/Users/Ashra/Downloads/MaitrioAlpha/MaitrioAlpha', f);
    if (!fs.existsSync(p)) return;
    let c = fs.readFileSync(p, 'utf8');
  
    // Fix implicit any
    c = c.replace(/\(\{ pressed \}\) =>/g, '({ pressed }: { pressed: boolean }) =>');
    c = c.replace(/\(\{ item \}\) =>/g, '({ item }: { item: any }) =>');
    c = c.replace(/renderItem=\{([^}]+)\}/g, (match, p1) => match.replace(/\(item\)/, '(item: any)'));
    c = c.replace(/\(_,\s*i\)/g, '(_: any, i: number)');
  
    // Fix React Native missing imports
    const needed = [];
    if (c.includes('<FlatList') && !/\bFlatList\b/.test(c.split('\"react-native\"')[0])) needed.push('FlatList');
    if (c.includes('<TextInput') && !/\bTextInput\b/.test(c.split('\"react-native\"')[0])) needed.push('TextInput');
    if (c.includes('<KeyboardAvoidingView') && !/\bKeyboardAvoidingView\b/.test(c.split('\"react-native\"')[0])) needed.push('KeyboardAvoidingView');
    if (c.includes('<ActivityIndicator') && !/\bActivityIndicator\b/.test(c.split('\"react-native\"')[0])) needed.push('ActivityIndicator');
    if (c.includes('Animated.') && !/\bAnimated\b/.test(c.split('\"react-native\"')[0])) needed.push('Animated');
    if (c.includes('Linking.') && !/\bLinking\b/.test(c.split('\"react-native\"')[0])) needed.push('Linking');
  
    if (needed.length > 0) {
      c = c.replace(/import\s*\{([^}]*)\}\s*from\s*['\"]react-native['\"];?/, (match, p1) => {
        const existing = p1.split(',').map(s => s.trim()).filter(Boolean);
        const toAdd = needed.filter(n => !existing.includes(n));
        if (toAdd.length === 0) return match;
        return 'import { ' + [...existing, ...toAdd].join(', ') + ' } from \"react-native\";';
      });
    }
  
    if (f.includes('ErrorFallback')) {
        c = c.replace('import { Feather }', 'import Feather').replace('from \"@expo/vector-icons\"', 'from \"@expo/vector-icons/Feather\"');
    }
  
    fs.writeFileSync(p, c);
  });
  console.log('Done script');
} catch (err) {
  console.error(err);
}
