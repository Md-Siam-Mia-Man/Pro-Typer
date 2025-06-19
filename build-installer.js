// build-installer.js
const compile = require('innosetup-compiler');
const path = require('path');

async function buildInstaller() {
    console.log('📦 Starting Inno Setup compiler...');
    const issPath = path.join(__dirname, 'setup.iss');

    try {
        // Run the compiler
        await compile(issPath, {
            gui: false,    // Don't show the Inno Setup GUI
            verbose: true  // Show detailed output in the console
        });
        
        console.log('✅ Installer built successfully!');
        console.log('Find your installer in the "InstallerOutput" folder.');

    } catch (error) {
        console.error('❌ Error building installer:');
        console.error(error);
        console.error('\n--> This error often means that Inno Setup is not installed or its path is not in your system\'s PATH environment variable.');
        console.error('--> Please download and install the main application from: https://jrsoftware.org/isdl.php');
        process.exit(1); // Exit with an error code to stop the process
    }
}

// Run the build function
buildInstaller();