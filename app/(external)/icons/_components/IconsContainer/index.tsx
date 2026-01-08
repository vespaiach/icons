/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <explanation> */
'use client';

import { Suspense, use } from 'react';
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
    return (
        <SelectedIconProvider>
            <Suspense>
                <IconsSections repositoriesMapPromise={repositoriesMapPromise} />
                <BottomModal
                    repositoriesMapPromise={repositoriesMapPromise}
                    directoriesMapPromise={directoriesMapPromise}
                />
            </Suspense>
        </SelectedIconProvider>
    );
}

function IconsSections({
    repositoriesMapPromise
}: {
    repositoriesMapPromise: Promise<Record<number, RepositoryWithIconCount>>;
}) {
    const repositoriesMap = use(repositoriesMapPromise);

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
