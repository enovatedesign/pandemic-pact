import chalk from 'chalk'

export function title(message: string) {
    console.log(chalk.blue(`${message}\n`))
}

export function info(message: string) {
    console.log(chalk.white(`${message}`))
}

export function newline() {
    console.log()
}
