import { promises as fs } from 'fs';

import { PLACEHOLDERS } from './constants.js';
const {
  GH_ACCESS_TOKEN,
} = process.env;
if (!GH_ACCESS_TOKEN) {
  console.error('GH_ACCESS_TOKEN is required');
  process.exit(1);
}
const header = {
  Authorization: `Bearer ${GH_ACCESS_TOKEN}`,
};
const getRepositories = async () => {
  const response = await fetch('https://api.github.com/orgs/Kitsune-Studios/repos',
    {
      headers: header,
    }
  )
  const repositories = await response.json()
  return repositories.filter(repo => !repo.private)
}

const getMembers = async () => {
  const repositories = await getRepositories();
  const memberMap = new Map();
  
  for (const repo of repositories) {
    const members = await fetch(repo.contributors_url, {
      headers: header,
    });
    const contributors = await members.json();
    contributors.forEach(member => {
      if (!memberMap.has(member.login)) {
        memberMap.set(member.login, member);
      }
    });
  }
  
  return Array.from(memberMap.values());
}

const generateRepoMarkdown = (repository) => { // Rename argument for clarity
  const { name, html_url, description, stargazers_count } = repository;
  return ` - [\`${name}/\`](${html_url}) - ${description} - ⭐️ ${stargazers_count}`;
};
  
const generateMemberMarkdown = (member) => {
  const { login, html_url, avatar_url } = member;
  return ` - <img src="${avatar_url}" width="32" height="32" style="border-radius: 50%"> [${login}](${html_url})\n`;
}

const _update = async () => {
  const template = await fs.readFile('./src/README.md.tpl', { encoding: 'utf-8' })
  const repositories = await getRepositories()
  const repo_placeholder =  await repositories.map(generateRepoMarkdown).join('\n')
  const newMarkdown = template
    .replace(PLACEHOLDERS.REPOS, repo_placeholder)
  // Wait for the write operation to finish
  await fs.writeFile('./profile/README.md', newMarkdown) // Update the path if necessary
}

const _update_internal = async () => {
  const template = await fs.readFile('./README.md.tpl', { encoding: 'utf-8' })
  const membersList = await getMembers()
  const members =  await membersList.map(generateMemberMarkdown).join('\n')
  const newMarkdown = template
    .replace(PLACEHOLDERS.MEMBERS, members)
  // Wait for the write operation to finish
  await fs.writeFile('./README.md', newMarkdown) // Update the path if necessary
}

_update()
_update_internal()
