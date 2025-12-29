'use server';

import { $ } from 'bun';
import { url } from 'inspector/promises';
import { getRepositories, getRepositoryById } from '@/db/repositories';
import { parseRepositoryForm } from './validation';

export async function loadRepositories() {
    return await getRepositories();
}

export async function importFromRepository(
    _: Record<string, string[]>,
    formData: FormData
) {
    const { success, payload, errors } = await parseRepositoryForm(formData);
    if (!success) {
        return errors;
    }

    const { repositoryId } = payload;

    const repository = await getRepositoryById(repositoryId);
    if (!repository) {
        return {
            repositoryId: ['Repository not found.']
        };
    }

    // Download the repository as a ZIP file
    await downloadRepository(repository.owner, repository.name, repository.ref);

    return {};
}

async function downloadRepository(owner: string, repo: string, ref = 'main') {
    console.log(`Downloading repository ${owner}/${repo} at ref ${ref}...`);
    console.log(`https://codeload.github.com/${owner}/${repo}/zip/${ref}`);
    const response = await fetch(
        `https://codeload.github.com/${owner}/${repo}/zip/${ref}`
    );
    console.log('Response status:', response.status);
    if (!response.ok) {
        throw new Error('Failed to download repository');
    }

    await Bun.write(`${Bun.env.PWD}/tmp/icon.zip`, response);
}
