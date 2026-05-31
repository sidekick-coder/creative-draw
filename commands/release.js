import { Command } from 'commander'
import { execSync, spawnSync } from 'child_process'
import { select } from '@inquirer/prompts'

function exec(cmd) {
    return execSync(cmd, { encoding: 'utf-8' }).trim()
}

function run(cmd, args = []) {
    const result = spawnSync(cmd, args, { stdio: 'inherit' })

    if (result.status !== 0) {
        process.exit(result.status ?? 1)
    }
}

const command = new Command('release')

command
    .description('Bump version, publish to npm and push to origin')
    .option('--patch', 'Bump patch version')
    .option('--minor', 'Bump minor version')
    .option('--major', 'Bump major version')
    .action(async (options) => {
        const staged = exec('git diff --cached --name-only')
        const unstaged = exec('git diff --name-only')
        const branch = exec('git branch --show-current')

        console.log(`Current branch: ${branch}`)

        if (branch !== 'develop') {
            console.error('Error: you must be on the develop branch to release.')
            process.exit(1)
        }

        if (staged || unstaged) {
            console.error(
                'Error: there are uncommitted changes. Please commit or stash them before releasing.'
            )
            process.exit(1)
        }

        let bump

        if (options.patch) bump = 'patch'
        if (options.minor) bump = 'minor'
        if (options.major) bump = 'major'

        if (!bump) {
            bump = await select({
                message: 'Select version bump type:',
                choices: [
                    { name: 'Patch (x.y.Z)', value: 'patch' },
                    { name: 'Minor (x.Y.z)', value: 'minor' },
                    { name: 'Major (X.y.z)', value: 'major' },
                ],
            })
        }

        if (!bump) {
            console.error('No version bump type selected.')
            process.exit(1)
        }

        console.log('\nBuilding to check errors...')
        run('npm', ['run', 'build'])

        // checkout to main
        console.log('Checking out to main branch...')
        run('git', ['checkout', 'main'])

        // merge develop into main
        console.log('Merging develop into main...')
        run('git', ['merge', '--ff-only', 'develop'])

        console.log(`\nBumping ${bump} version...`)
        run('npm', ['version', bump])

        console.log('\nPushing commit and tag to origin...')
        run('git', ['push', 'origin', 'main', 'develop', '--tags'])

        console.log('\nRelease complete.')
    })

export default command
