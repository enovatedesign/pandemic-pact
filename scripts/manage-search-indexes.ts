import dotenv from 'dotenv'
import chalk from 'chalk'
import readline from 'readline'

import { getSearchClient, getIndexName } from '../app/api/helpers/search'
import { title, info, warn, error } from './helpers/log'

main()

async function main() {
    dotenv.config({ path: './.env.local' })

    const client = getSearchClient()

    if (!client) {
        error('OpenSearch is not configured. Set SEARCH_HOST, SEARCH_USERNAME and SEARCH_PASSWORD in your environment.')
        process.exit(1)
    }

    const args = process.argv.slice(2)
    const action = args[0] ?? 'list'

    if (action === 'list') {
        await listIndexes(client)
        return
    }

    if (action === 'delete') {
        const targets = args.slice(1)
        if (targets.length === 0) {
            error('Usage: npm run search:indexes -- delete <index> [<index> ...]')
            process.exit(1)
        }
        await deleteIndexes(client, targets)
        return
    }

    if (action === 'delete-all-except') {
        const keep = args.slice(1)
        if (keep.length === 0) {
            error('Usage: npm run search:indexes -- delete-all-except <index> [<index> ...]')
            process.exit(1)
        }
        await deleteAllExcept(client, keep)
        return
    }

    error(`Unknown action "${action}". Use "list", "delete <index>...", or "delete-all-except <keep>...".`)
    process.exit(1)
}

function isSystemIndex(name: string) {
    return name.startsWith('.')
}

async function listIndexes(client: ReturnType<typeof getSearchClient>) {
    if (!client) return

    const activeIndex = getIndexName()

    title('OpenSearch indexes')
    info(`Active index (per current env): ${chalk.cyan(activeIndex)}\n`)

    const { body } = await client.cat.indices({
        format: 'json',
        h: 'index,docs.count,store.size,creation.date.string,health,status',
        s: 'index',
    })

    const rows = body as Array<{
        index: string
        'docs.count': string
        'store.size': string
        'creation.date.string': string
        health: string
        status: string
    }>

    if (rows.length === 0) {
        warn('No indexes found.')
        return
    }

    const header = `${'Index'.padEnd(40)}  ${'Docs'.padStart(10)}  ${'Size'.padStart(10)}  ${'Created'.padEnd(24)}  Health`
    info(header)
    info('-'.repeat(header.length))

    for (const row of rows) {
        const isActive = row.index === activeIndex
        const name = isActive ? chalk.cyan(row.index.padEnd(40)) : row.index.padEnd(40)
        const health = colourHealth(row.health)
        info(
            `${name}  ${row['docs.count'].padStart(10)}  ${row['store.size'].padStart(10)}  ${(row['creation.date.string'] ?? '').padEnd(24)}  ${health}`,
        )
    }

    info('')
    info(`To delete: npm run search:indexes -- delete <index> [<index> ...]`)
}

async function deleteIndexes(
    client: NonNullable<ReturnType<typeof getSearchClient>>,
    targets: string[],
) {
    const activeIndex = getIndexName()

    if (targets.includes(activeIndex)) {
        error(`Refusing to delete "${activeIndex}" — it matches the active index for the current env (SEARCH_INDEX_PREFIX/SEARCH_INDEX_VERSION).`)
        process.exit(2)
    }

    for (const target of targets) {
        if (target.includes('*')) {
            error(`Refusing wildcard "${target}". Pass exact index names only.`)
            process.exit(2)
        }
    }

    title('Indexes scheduled for deletion')
    for (const target of targets) {
        const { body: exists } = await client.indices.exists({ index: target })
        if (!exists) {
            warn(`  ${target} — does not exist (will skip)`)
        } else {
            info(`  ${chalk.red(target)}`)
        }
    }

    const confirmed = await confirm(`\nType "DELETE" to confirm: `)
    if (confirmed !== 'DELETE') {
        warn('Aborted.')
        return
    }

    for (const target of targets) {
        const { body: exists } = await client.indices.exists({ index: target })
        if (!exists) {
            warn(`Skipped ${target} (does not exist)`)
            continue
        }
        await client.indices.delete({ index: target })
        info(chalk.green(`Deleted ${target}`))
    }
}

async function deleteAllExcept(
    client: NonNullable<ReturnType<typeof getSearchClient>>,
    keep: string[],
) {
    const activeIndex = getIndexName()
    const keepSet = new Set(keep)

    if (!keepSet.has(activeIndex)) {
        error(`Refusing to run: active index "${activeIndex}" is not in the keep list. Add it explicitly to confirm intent.`)
        process.exit(2)
    }

    const { body } = await client.cat.indices({
        format: 'json',
        h: 'index,docs.count,store.size,creation.date.string',
        s: 'index',
    })

    const rows = body as Array<{
        index: string
        'docs.count': string
        'store.size': string
        'creation.date.string': string
    }>

    const kept: string[] = []
    const protectedSystem: string[] = []
    const toDelete: typeof rows = []

    for (const row of rows) {
        if (keepSet.has(row.index)) {
            kept.push(row.index)
        } else if (isSystemIndex(row.index)) {
            protectedSystem.push(row.index)
        } else {
            toDelete.push(row)
        }
    }

    title('Plan')
    info(`Active index (per current env): ${chalk.cyan(activeIndex)}`)
    info(`\nKEEP (${kept.length}):`)
    for (const name of kept) info(`  ${chalk.green(name)}`)

    info(`\nPROTECTED system indexes — auto-skipped (${protectedSystem.length}):`)
    for (const name of protectedSystem) info(`  ${chalk.gray(name)}`)
    if (protectedSystem.length > 0) {
        warn(`  (System indexes like .opendistro_security are required by OpenSearch — skipping to avoid bricking the cluster.)`)
    }

    const grouped = groupForReview(toDelete.map(r => r.index))
    info(`\nDELETE (${toDelete.length}):`)
    for (const [label, names] of grouped) {
        info(`\n  ${chalk.yellow(label)} (${names.length}):`)
        for (const name of names) info(`    ${chalk.red(name)}`)
    }

    if (toDelete.length === 0) {
        info('\nNothing to delete.')
        return
    }

    const totalBytes = toDelete.reduce((sum, r) => sum + parseHumanSize(r['store.size']), 0)
    info(`\nApprox. total size to free: ${formatBytes(totalBytes)}`)

    const confirmed = await confirm(`\nType "DELETE ${toDelete.length}" to confirm: `)
    if (confirmed !== `DELETE ${toDelete.length}`) {
        warn('Aborted.')
        return
    }

    let deleted = 0
    let failed = 0
    for (const row of toDelete) {
        try {
            await client.indices.delete({ index: row.index })
            deleted++
            info(chalk.green(`Deleted ${row.index}`))
        } catch (e: any) {
            failed++
            error(`Failed to delete ${row.index}: ${e?.message ?? e}`)
        }
    }

    info(`\nDone. Deleted: ${deleted}. Failed: ${failed}. Kept: ${kept.length}. Protected: ${protectedSystem.length}.`)
}

function groupForReview(names: string[]): Array<[string, string[]]> {
    const securityAuditlogs: string[] = []
    const topQueries: string[] = []
    const grantsBranches: string[] = []
    const other: string[] = []

    for (const name of names) {
        if (name.startsWith('security-auditlog-')) securityAuditlogs.push(name)
        else if (name.startsWith('top_queries-')) topQueries.push(name)
        else if (name.endsWith('-grants') || name === 'grants') grantsBranches.push(name)
        else other.push(name)
    }

    const groups: Array<[string, string[]]> = []
    if (grantsBranches.length) groups.push(['Branch / staging grant indexes', grantsBranches])
    if (other.length) groups.push(['Other', other])
    if (securityAuditlogs.length) groups.push(['Security audit logs (auto-regenerated daily)', securityAuditlogs])
    if (topQueries.length) groups.push(['Top queries (auto-regenerated daily)', topQueries])
    return groups
}

function parseHumanSize(size: string): number {
    if (!size) return 0
    const match = size.match(/^([\d.]+)\s*(b|kb|mb|gb|tb)$/i)
    if (!match) return 0
    const value = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    const multipliers: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 }
    return value * (multipliers[unit] ?? 0)
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes.toFixed(0)} B`
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

function colourHealth(health: string) {
    if (health === 'green') return chalk.green(health)
    if (health === 'yellow') return chalk.yellow(health)
    if (health === 'red') return chalk.red(health)
    return health
}

function confirm(prompt: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    return new Promise(resolve => {
        rl.question(prompt, answer => {
            rl.close()
            resolve(answer.trim())
        })
    })
}
