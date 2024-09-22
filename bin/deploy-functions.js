import { readdir } from 'fs/promises';
import { join, parse } from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '../..');
const functionsDir = join(__dirname, 'functions');

try {
	const files = await readdir(functionsDir);
	const deployPromises = files.map(async (file) => {
		const functionName = parse(file).name;
		const filePath = join(functionsDir, file);
		const command = `NODE_OPTIONS="--no-deprecation" fleek functions deploy --name ${functionName} --path ${filePath}`;
		try {
			const { stdout, stderr } = await execPromise(command);
			if (stderr) {
				throw new Error(stderr);
			}
			console.log(`🟢 Successfully deployed function`, {
				command,
				filePath,
				functionName,
				stderr,
				stdout,
			});
		} catch (error) {
			console.error(`🔴 Error deploying function`, { error });
		}
	});
	await Promise.all(deployPromises);
	console.log(`🟩 Finished deploying functions`, { functionsDir });
} catch (error) {
	console.error(`🟥 Error reading the functions directory`, { error, functionsDir });
	process.exit(1);
}
