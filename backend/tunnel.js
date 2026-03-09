const { spawn } = require('child_process');
const fs = require('fs');

console.log('Starting Cloudflare Tunnel...');
const cf = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--url', 'http://127.0.0.1:5000'], { shell: true });

cf.stderr.on('data', data => {
    const str = data.toString();
    process.stdout.write(str);
    const match = str.match(/(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/);
    if (match) {
        const url = match[1];
        console.log('\n\n✅ Tunnel URL Found:', url);
        
        let envContent = fs.readFileSync('.env', 'utf8');
        envContent = envContent.replace(/FRONTEND_URL=.*/, `FRONTEND_URL=${url}`);
        fs.writeFileSync('.env', envContent);
        console.log('✅ .env updated with new tunnel URL!');
        
        // Don't exit, keep tunnel running
    }
});

cf.on('close', code => {
    console.log(`Cloudflare tunnel exited with code ${code}`);
});
