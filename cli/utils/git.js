import { execSync } from 'child_process'
import chalk from 'chalk'

function run(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
    } catch {
        return null
    }
}
export function getGitContext() {
    // Check if we're in a git repo
    const isGitRepo = run('git rev-reparse --is-inside-work-tree')
    if (!isGitRepo) return null

    const branch = run('git branch --show-current')
    const status = run('git status --short')
    const staged = run('git diff --staged')
    const unstaged = run('git diff')
    const log = run('git log --oneline -10')
    const repoName = run('git rev-parse --show-toplevel')?.split('/').pop()

    const context = []

    if (repoName) context.push(`Repository: ${repoName}`)
    if (branch) context.push(`Current branch: ${branch}`)

    if (status) {
        context.push(`\nChanged files:\n${status}`)
    } else {
        context.push('\nWorking tree is clean')
    }

    if (staged) {
        context.push(`\nStaged changes (ready to commit):\n${staged}`)
    }

    if (unstaged) {
        // Limit diff size to avooid token overflow
        const truncated = unstaged.length > 8000
            ? unstaged.slice(0, 8000) + '\n... (diff truncated)'
            : unstaged
        context.push(`\nUnstaged changes:\n${truncated}`)
    }

    if (log) {
        context.push(`\nRecent commits:\n${log}`)
    }

    return context.join('\n')
}

export function isGitRepo() {
    return run('git rev-parse --is-inside-work-tree') !== null
}