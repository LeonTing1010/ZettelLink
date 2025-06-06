#!/usr/bin/env node

/**
 * ZettelLink Plugin Test Script
 * 
 * This script performs basic tests to verify that the plugin
 * components are working correctly.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 ZettelLink Plugin Test Suite');
console.log('===============================\n');

// Test 1: Check if required files exist
console.log('1. 📁 Checking required files...');
const requiredFiles = [
    'main.js',
    'manifest.json',
    'styles.css',
    'package.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} exists`);
    } else {
        console.log(`   ❌ ${file} missing`);
        allFilesExist = false;
    }
});

// Test 2: Validate manifest.json
console.log('\n2. 📄 Validating manifest.json...');
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    const requiredFields = ['id', 'name', 'version', 'minAppVersion', 'description', 'author'];
    
    let manifestValid = true;
    requiredFields.forEach(field => {
        if (manifest[field]) {
            console.log(`   ✅ ${field}: ${manifest[field]}`);
        } else {
            console.log(`   ❌ ${field}: missing`);
            manifestValid = false;
        }
    });
    
    if (manifestValid) {
        console.log('   ✅ Manifest is valid');
    }
} catch (error) {
    console.log(`   ❌ Manifest validation failed: ${error.message}`);
}

// Test 3: Check main.js structure
console.log('\n3. 🔍 Checking main.js structure...');
try {
    const mainJs = fs.readFileSync('main.js', 'utf8');
    
    // Check for key components
    const components = [
        'ZettelLinkPlugin',
        'ZettelTemplateModal',
        'OrphanedNotesView',
        'ZettelLinkSettingTab'
    ];
    
    components.forEach(component => {
        if (mainJs.includes(component)) {
            console.log(`   ✅ ${component} found`);
        } else {
            console.log(`   ❌ ${component} missing`);
        }
    });
    
    console.log(`   📊 File size: ${(mainJs.length / 1024).toFixed(2)} KB`);
} catch (error) {
    console.log(`   ❌ main.js check failed: ${error.message}`);
}

// Test 4: Template validation
console.log('\n4. 📝 Testing template functionality...');
try {
    // Simulate template variable replacement
    const testTemplate = `---
id: {{ID}}
zettel_type: fleeting
---

# Quick thought on {{DATE}}

- {{TIME}} [[ ]]`;
    
    const now = new Date();
    const id = now.getFullYear().toString() + 
              String(now.getMonth() + 1).padStart(2, '0') + 
              String(now.getDate()).padStart(2, '0') + 
              String(now.getHours()).padStart(2, '0') + 
              String(now.getMinutes()).padStart(2, '0') + 
              String(now.getSeconds()).padStart(2, '0');
    
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    
    const processedTemplate = testTemplate
        .replace(/\{\{ID\}\}/g, id)
        .replace(/\{\{DATE\}\}/g, date)
        .replace(/\{\{TIME\}\}/g, time);
    
    if (processedTemplate.includes(id) && processedTemplate.includes(date) && processedTemplate.includes(time)) {
        console.log('   ✅ Template variable replacement works');
        console.log(`   📅 Sample ID: ${id}`);
    } else {
        console.log('   ❌ Template variable replacement failed');
    }
} catch (error) {
    console.log(`   ❌ Template test failed: ${error.message}`);
}

// Test 5: CSS validation
console.log('\n5. 🎨 Checking styles.css...');
try {
    const css = fs.readFileSync('styles.css', 'utf8');
    
    const cssClasses = [
        '.zettel-template-modal',
        '.orphaned-note-item',
        '.zettel-type-button',
        '.nav-header'
    ];
    
    cssClasses.forEach(cssClass => {
        if (css.includes(cssClass)) {
            console.log(`   ✅ ${cssClass} found`);
        } else {
            console.log(`   ❌ ${cssClass} missing`);
        }
    });
    
    console.log(`   📊 CSS size: ${(css.length / 1024).toFixed(2)} KB`);
} catch (error) {
    console.log(`   ❌ CSS check failed: ${error.message}`);
}

console.log('\n🎉 Test suite completed!');
console.log('\n📋 Next Steps:');
console.log('1. Copy the plugin files to your Obsidian vault plugins folder');
console.log('2. Enable the plugin in Obsidian settings');
console.log('3. Test the features:');
console.log('   - Create new Zettel (Ctrl/Cmd + P → "Create new Zettel")');
console.log('   - View orphaned notes (Ctrl/Cmd + P → "Open Orphaned Notes view")');
console.log('   - Configure settings in plugin settings');
