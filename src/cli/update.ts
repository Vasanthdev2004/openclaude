import chalk from 'chalk'
import { logEvent } from 'src/services/analytics/index.js'
import { getLatestVersion } from 'src/utils/autoUpdater.js'
import { writeToStdout } from 'src/utils/process.js'
import { gte } from 'src/utils/semver.js'
import { getInitialSettings } from 'src/utils/settings/settings.js'

function printSourceBuildUpdateHelp() {
  writeToStdout('This looks like a source/development build of OpenClaude.\n')
  writeToStdout('To update, pull the latest source and rebuild:\n')
  writeToStdout(chalk.bold('  git pull && bun install && bun run build') + '\n')
}

export async function update() {
  logEvent('tengu_update_check', {})
  writeToStdout(`OpenClaude version: ${MACRO.VERSION}\n`)

  const channel = getInitialSettings()?.autoUpdatesChannel ?? 'latest'
  writeToStdout(`Checking npm for the ${channel} release of ${MACRO.PACKAGE_URL}...\n`)

  const latestVersion = await getLatestVersion(channel)

  if (!latestVersion) {
    process.stderr.write(chalk.red('Failed to check for updates') + '\n')
    process.stderr.write(`Unable to fetch the latest version for ${MACRO.PACKAGE_URL}\n`)
    process.stderr.write('\n')
    process.stderr.write('If you are running OpenClaude from source, update with:\n')
    process.stderr.write('  git pull && bun install && bun run build\n')
    process.stderr.write('\n')
    process.stderr.write('Otherwise try:\n')
    process.stderr.write(`  npm view ${MACRO.PACKAGE_URL} version\n`)
    return
  }

  if (latestVersion === MACRO.VERSION || gte(MACRO.VERSION, latestVersion)) {
    writeToStdout(chalk.green(`OpenClaude is up to date (${MACRO.VERSION})`) + '\n')
    return
  }

  writeToStdout(`Update available: ${MACRO.VERSION} → ${latestVersion}\n`)
  writeToStdout('\n')
  writeToStdout('Recommended update paths:\n')
  writeToStdout(chalk.bold(`  npm install -g ${MACRO.PACKAGE_URL}@latest`) + '\n')
  writeToStdout('  or, for source checkouts:\n')
  writeToStdout(chalk.bold('  git pull && bun install && bun run build') + '\n')

  if (process.argv[1]?.includes('/dist/') || process.argv[1]?.includes('/src/')) {
    writeToStdout('\n')
    printSourceBuildUpdateHelp()
  }
}
