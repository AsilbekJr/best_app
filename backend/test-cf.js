const { spawn } = require('child_process');

console.log('Testing cloudflared tunnel...');
const child = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--url', 'http://localhost:5000'], { shell: true });

child.stdout.on('data', d => process.stdout.write('OUT: ' + d.toString()));
child.stderr.on('data', d => process.stderr.write('ERR: ' + d.toString()));
child.on('error', err => console.error('Spawn error:', err));
child.on('close', code => console.log(`Closed with code: ${code}`));
