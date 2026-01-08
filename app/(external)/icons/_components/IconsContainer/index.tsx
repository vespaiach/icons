'use client';

import { Suspense, use, useEffect, useState } from 'react';
import { getIconsByRepositoryIdAction } from '../../actions';
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
            <div className="mt-6">
                {Object.keys(repositoriesMap)
                    .sort()
                    .map((repositoryId) => {
                        const repository = repositoriesMap[Number(repositoryId)];
                        return <IconsSection key={repository.id} repository={repository} />;
                    })}
            </div>
            <BottomModal repositoriesMap={repositoriesMap} directoriesMap={directoriesMap} />
        </SelectedIconProvider>
    );
}

function IconsSection({ repository }: { repository: RepositoryWithIconCount }) {
    const [iconsPromise, setIconsPromise] = useState<Promise<IconWithRelativeData[]>>();

    useEffect(() => {
        setIconsPromise(getIconsByRepositoryIdAction(repository.id));
    }, [repository.id]);

    if (!iconsPromise) {
        return null;
    }

    return (
        <Suspense>
            <IconsGrid repository={repository} iconsPromise={iconsPromise} />
        </Suspense>
    );
}
