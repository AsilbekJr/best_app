const { spawn } = require('child_process');
const fs = require('fs');

let isRestarting = false;
let currentChild = null;

async function startTunnel() {
    console.log('Starting localhost.run tunnel...');

    // SSH command to connect to localhost.run
    currentChild = spawn('ssh', [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ServerAliveInterval=15',
        '-R', '80:localhost:5000',
        'nokey@localhost.run'
    ]);

    currentChild.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(output);

        // Capture URL from output: e.g. "tunneled with tls termination, https://something.lhr.life"
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.lhr\.life/);
        if (match) {
            const url = match[0];
            console.log('\n\n✅ [Localhost.run] URL Active:', url);
            
            let envContent = fs.readFileSync('.env', 'utf8');
            if (envContent.includes('FRONTEND_URL=')) {
                envContent = envContent.replace(/FRONTEND_URL=.*/, `FRONTEND_URL=${url}`);
            } else {
                envContent += `\nFRONTEND_URL=${url}`;
            }
            fs.writeFileSync('.env', envContent);
            console.log('✅ .env updated with new tunnel URL! Triggering bot menu restart...');
            
            // Trigger nodemon restart
            const indexPath = 'src/index.ts';
            if (fs.existsSync(indexPath)) {
                let indexContent = fs.readFileSync(indexPath, 'utf8');
                indexContent = indexContent.replace(/\/\/ Restart triggered .*/g, '') + `\n// Restart triggered at ${new Date().toISOString()}`;
                fs.writeFileSync(indexPath, indexContent);
            }
        }
    });

    currentChild.stderr.on('data', (data) => {
        // ssh outputs connection info to stderr sometimes
        const output = data.toString();
        process.stderr.write(output);
        
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.lhr\.life/);
        if (match) {
            const url = match[0];
            console.log('\n\n✅ [Localhost.run] URL Active:', url);
            
            let envContent = fs.readFileSync('.env', 'utf8');
            if (envContent.includes('FRONTEND_URL=')) {
                envContent = envContent.replace(/FRONTEND_URL=.*/, `FRONTEND_URL=${url}`);
            } else {
                envContent += `\nFRONTEND_URL=${url}`;
            }
            fs.writeFileSync('.env', envContent);
            console.log('✅ .env updated with new tunnel URL! Triggering bot menu restart...');
            
            const indexPath = 'src/index.ts';
            if (fs.existsSync(indexPath)) {
                let indexContent = fs.readFileSync(indexPath, 'utf8');
                indexContent = indexContent.replace(/\/\/ Restart triggered .*/g, '') + `\n// Restart triggered at ${new Date().toISOString()}`;
                fs.writeFileSync(indexPath, indexContent);
            }
        }
    });

    currentChild.on('close', (code) => {
        console.log(`[Localhost.run] Tunnel closed with code ${code}. Restarting in 5 seconds...`);
        if (!isRestarting) {
            isRestarting = true;
            setTimeout(() => {
                isRestarting = false;
                startTunnel();
            }, 5000);
        }
    });

    currentChild.on('error', (err) => {
        console.error(`[Localhost.run] Error:`, err);
    });
}

startTunnel();

// Handle process exit to cleanup ssh
process.on('SIGINT', () => {
    if (currentChild) currentChild.kill();
    process.exit();
});
process.on('SIGTERM', () => {
    if (currentChild) currentChild.kill();
    process.exit();
});
