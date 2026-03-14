import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import readline from 'readline'

export function extractCode(response) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const matches = [...response.matchAll(codeBlockRegex)]

  if (matches.length === 0) return response

  // Priority order — prefer these languages over bash/shell
  const priority = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'js', 'ts']

  // First try to find a priority language block
  for (const lang of priority) {
    const match = matches.find(m => m[1]?.toLowerCase() === lang)
    if (match) return match[2]
  }

  // If no priority language found, return the largest block
  return matches.reduce((longest, match) =>
    match[2].length > longest.length ? match[2] : longest
  , '')
}

export async function writeFile(filePath, content) {
    const resolved = path.resolve(filePath)
    const exists = fs.existsSync(resolved)

    // If file exists ask for confirmation
    if (exists) {
        const confirmed = await confirmOverwrite(filePath)
        if (!confirmed) {
            console.log(chalk.yellow('\nWrite Canceled\n'))
            return false
        }
    }
    
    const dir = path.dirname(resolved)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(resolved, content, 'utf8')
    return true
}

function confirmOverwrite(filePath) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        rl.question(
            chalk.yellow(`\nFile "$filePath" already exists. Overwrite? (y/n): `),
            (answer) => {
                rl.close()
                resolve(answer.toLowerCase() === 'y')
            }
        )
    })
}