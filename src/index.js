import { promises as fs } from 'fs';

import { PLACEHOLDERS } from './constants.js';

const getRepositories = async () => {
  const response = await fetch('https://api.github.com/orgs/Kitsune-Studios/repos')
  const repositories = await response.json()
  return repositories
}

const generateRepoMarkdown = (repository) => { // Rename argument for clarity
  const { name, html_url, description, stargazers_count } = repository;
  return ` - [\`${name}/\`](${html_url}) - ${description} - ⭐️ ${stargazers_count}`;
};
  

const apply_update = async () => {
  const template = await fs.readFile('./src/README.md.tpl', { encoding: 'utf-8' })
  const repositories = await getRepositories()
  const repo_placeholder =  await repositories.map(generateRepoMarkdown).join('\n')
  const newMarkdown = template
    .replace(PLACEHOLDERS.REPOS, repo_placeholder)
  console.log(newMarkdown)
  // Wait for the write operation to finish
  await fs.writeFile('./profile/README.md', newMarkdown) // Update the path if necessary
}

apply_update()