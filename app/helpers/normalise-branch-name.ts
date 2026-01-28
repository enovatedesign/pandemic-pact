/**
 * Normalise branch name for use in blob storage paths
 * - Removes refs/heads/ prefix
 * - Converts to lowercase
 * - Replaces special characters with hyphens
 * - Truncates to 63 characters (safe for most storage systems)
 * 
 * This function is shared between build-time (scripts) and runtime (Next.js app)
 */
export function normaliseBranchName(branch: string): string {
    return branch
        .replace(/^refs\/heads\//, '') // Remove git refs prefix
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-') // Replace special chars with hyphens
        .slice(0, 63) // Truncate to 63 chars
}