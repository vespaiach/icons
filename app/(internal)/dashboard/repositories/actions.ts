'use server';

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { $ } from 'bun';
import { createIcon, deleteIconsByRepositoryId } from '@/db/icons';
import { getRepositoryDirectories, getRepositoryDirectoriesById, updateRepository } from '@/db/repositories';
import { log } from '@/utils/log.helpers';
import { parseRepositoryForm } from './validation';

export async function loadRepositoriesAction() {
    return await getRepositoryDirectories();
}

export async function importFromRepositoryAction(
    prevState: Repository & { errors: Record<string, string[]> },
    formData: FormData
): Promise<Repository & { errors: Record<string, string[]> }> {
    const { success, payload, errors } = await parseRepositoryForm(formData);
    if (!success) {
        return { ...prevState, errors };
    }

    const { repositoryId } = payload;

    const repository = await getRepositoryDirectoriesById(repositoryId);
    if (!repository) {
        return {
            ...prevState,
            errors: {
                repositoryId: ['Repository not found.']
            }
        };
    }

    await deleteIconsByRepositoryId(repository.id);

    // Download the repository as a ZIP file
    const downloadResult = await downloadRepository(repository);
    if (downloadResult?.errors) {
        return { ...prevState, errors: downloadResult.errors };
    }

    // Extract the ZIP file
    const extractResult = await extractZipFile(repository);
    if (extractResult?.errors) {
        return { ...prevState, errors: extractResult.errors };
    }

    // Scan the specified directories for SVG icons and save them to the database
    await scanIconDirectories(repository);

    // Record the import timestamp
    const updatedRepository = await recordImportTimestamp(repository);
    if (!updatedRepository) {
        return { ...prevState, errors: { repositoryId: ['Failed to update import timestamp.'] } };
    }

    // Clean up temporary files
    await cleanupTemporaryFiles(repository);

    return { ...updatedRepository, errors: {} };
}

async function downloadRepository(repo: Repository) {
    const url = `https://codeload.github.com/${repo.owner}/${repo.name}/zip/${repo.ref}`;
    const response = await fetch(url);

    if (!response.ok) {
        log('error', `Failed to download repository from: ${url}, status: ${response.status}`);
        return { errors: { global: [`Failed to download repository from ${repo.owner}/${repo.name}.`] } };
    }

    const saveTo = `${Bun.env.PWD}/tmp/${repo.owner}-${repo.name}-${repo.ref}.zip`;
    await Bun.write(saveTo, await response.arrayBuffer());

    log('info', `Downloaded repository from: ${url}`);
    log('info', `Saved repository to: ${saveTo}`);

    return null;
}

async function extractZipFile(repo: Repository) {
    try {
        await $`rm -rf ${Bun.env.PWD}/tmp/${repo.name}-${repo.ref}`;
        const zipFilePath = `${Bun.env.PWD}/tmp/${repo.owner}-${repo.name}-${repo.ref}.zip`;
        await $`unzip -q -d ${Bun.env.PWD}/tmp ${zipFilePath}`;
    } catch (error) {
        log('error', `Failed to extract ZIP file for repository: ${repo.owner}/${repo.name}`, error);
        return {
            errors: { global: [`Failed to extract ZIP file for repository: ${repo.owner}/${repo.name}.`] }
        };
    }
    return null;
}

async function scanIconDirectories(repo: RepositoryDirectories) {
    const BATCH_SIZE = Number(Bun.env.PROCESSING_BATCH_SIZE);

    for (const dir of repo.directories) {
        const fullPath = `${Bun.env.PWD}/tmp/${repo.name}-${repo.ref}${dir.path}`;
        log('info', `Scanning directories for icons in: ${fullPath}`);

        try {
            const files = await readdir(fullPath);
            const svgFiles = files.filter((fileName) => fileName.endsWith('.svg'));

            log('info', `Found ${svgFiles.length} SVG files in ${fullPath}`);

            // Process files in batches
            for (let i = 0; i < svgFiles.length; i += BATCH_SIZE) {
                const batch = svgFiles.slice(i, i + BATCH_SIZE);
                await Promise.all(
                    batch.map((fileName) =>
                        saveIconsToDatabase(dir.id, path.parse(fileName).name, path.join(fullPath, fileName))
                    )
                );
                log(
                    'info',
                    `Processed ${Math.min(i + BATCH_SIZE, svgFiles.length)}/${svgFiles.length} icons from ${dir.path}`
                );
            }
        } catch (error) {
            log('error', `Failed to read directory: ${fullPath}`, error);
        }
    }
}

async function saveIconsToDatabase(directoryId: number, fileName: string, fullPath: string) {
    try {
        const file = await Bun.file(fullPath);

        // Insert icon to database
        await createIcon(directoryId, fileName, (await file.text()).trim());

        log('info', `Saved icon ${fullPath}, from directory id: ${directoryId}`);
    } catch (error) {
        log(
            'error',
            `Failed to save icon ${fileName} from directory id: ${directoryId} to database (${fullPath})`,
            error
        );
    }
}

async function cleanupTemporaryFiles(repo: Repository) {
    try {
        await $`rm ${Bun.env.PWD}/tmp/${repo.owner}-${repo.name}-${repo.ref}.zip`;
        await $`rm -rf ${Bun.env.PWD}/tmp/${repo.name}-${repo.ref}`;
    } catch (error) {
        log('error', `Failed to clean up temporary files for repository: ${repo.owner}/${repo.name}`, error);
    }
}

async function recordImportTimestamp(repo: Repository) {
    const now = new Date();
    return await updateRepository({ ...repo, lastImportedAt: now });
}
