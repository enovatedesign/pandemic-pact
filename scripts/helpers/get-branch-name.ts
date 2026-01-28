import { execSync } from 'child_process'
import { warn } from './log'
import { normaliseBranchName } from '../../app/helpers/normalise-branch-name'

/**
 * Get the current Git branch name from CI environment variables or local git
 * Returns normalised branch name suitable for blob storage paths
 */
export function getBranchName(): string {
    // Try CI environment variables first
    const ciBranch =
        process.env.CI_COMMIT_REF_NAME || // passed from GitLab CI
        process.env.VERCEL_GIT_COMMIT_REF || // Vercel native (when present)
        null;

    if (ciBranch) {
        return normaliseBranchName(ciBranch)
    }

    // Fallback to git command for local development
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf-8',
        }).trim()

        return normaliseBranchName(branch)
    } catch (error) {
        warn('Could not detect git branch, using "unknown" as branch name')
        return 'unknown'
    }
}
