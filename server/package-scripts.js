// Package scripts for easy execution
const { exec } = require('child_process');
const path = require('path');

const scripts = {
  'upload-products': {
    description: 'Upload product images from food_images directory to database',
    command: 'node scripts/uploadProductImages.js'
  }
};

const runScript = (scriptName) => {
  const script = scripts[scriptName];
  
  if (!script) {
    console.log('Available scripts:');
    Object.keys(scripts).forEach(name => {
      console.log(`  ${name}: ${scripts[name].description}`);
    });
    return;
  }
  
  console.log(`Running: ${script.description}`);
  console.log(`Command: ${script.command}\n`);
  
  const child = exec(script.command, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log(stdout);
  });
  
  child.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  child.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
};

// Get script name from command line arguments
const scriptName = process.argv[2];
runScript(scriptName);
