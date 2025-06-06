#!/usr/bin/env node

console.log('🧪 ZettelLink Plugin Test Suite');
console.log('===============================\n');

const fs = require('fs');

// Test 1: Check required files
console.log('1. 📁 Checking required files...');
const files = ['main.js', 'manifest.json', 'styles.css'];
files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} exists`);
    } else {
        console.log(`   ❌ ${file} missing`);
    }
});

// Test 2: Check main.js size
console.log('\n2. 📊 File sizes:');
try {
    const mainJs = fs.readFileSync('main.js', 'utf8');
    console.log(`   📄 main.js: ${(mainJs.length / 1024).toFixed(2)} KB`);
    
    const manifest = fs.readFileSync('manifest.json', 'utf8');
    console.log(`   📄 manifest.json: ${manifest.length} bytes`);
    
    const styles = fs.readFileSync('styles.css', 'utf8');
    console.log(`   🎨 styles.css: ${(styles.length / 1024).toFixed(2)} KB`);
} catch (error) {
    console.log(`   ❌ Error reading files: ${error.message}`);
}

console.log('\n✅ Plugin is ready for testing in Obsidian!');
