'use client';

import { use } from 'react';
import BottomModal from './BottomModal';
import { SelectedIconProvider } from './IconContext';
import IconsGrid from './IconsGrid';

export default function IconsContainer({
    repositoriesMapPromise,
    directoriesMapPromise
}: {
    repositoriesMapPromise: Promise<Record<number, RepositoryWithIconCount>>;
    directoriesMapPromise: Promise<Record<number, Directory>>;
}) {
    const repositoriesMap = use(repositoriesMapPromise);
    const directoriesMap = use(directoriesMapPromise);

    return (
        <SelectedIconProvider>
            <IconsSections repositoriesMap={repositoriesMap} />
            <BottomModal repositoriesMap={repositoriesMap} directoriesMap={directoriesMap} />
        </SelectedIconProvider>
    );
}

function IconsSections({ repositoriesMap }: { repositoriesMap: Record<number, RepositoryWithIconCount> }) {
    return (
        <div className="mt-6">
            {Object.keys(repositoriesMap)
                .sort()
                .map((repositoryId) => {
                    const repository = repositoriesMap[Number(repositoryId)];
                    return <IconsGrid key={repository.id} repository={repository} />;
                })}
        </div>
    );
}
