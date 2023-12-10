import chalk from 'chalk'
import {getHumanReadableFileSize} from '../helpers/files.mjs'

export function title(message: string) {
    console.log(chalk.blue(`\n${message}\n`))
}

export function info(message: string) {
    console.log(chalk.white(message))
}

export function warn(message: string) {
    console.warn(chalk.yellow(message))
}

export function printWrittenFileStats(pathname: string) {
    info(`Wrote file ${pathname} (${getHumanReadableFileSize(pathname)})`)
}
