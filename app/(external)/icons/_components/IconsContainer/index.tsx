'use client';

import { Suspense, useEffect, useState } from 'react';
import { getIconsByRepositoryIdAction } from '../../actions';
import { usePageContext } from '../PageContext';
import BottomModal from './BottomModal';
import IconsGrid from './IconsGrid';

export default function IconsContainer({
    variantsMapPromise
}: {
    variantsMapPromise: Promise<Record<number, Variant>>;
}) {
    const { repositoriesMap } = usePageContext();

    return (
        <>
            <div className="mt-6">
                {Object.keys(repositoriesMap)
                    .sort()
                    .map((repositoryId) => {
                        const repository = repositoriesMap[Number(repositoryId)];
                        return <IconsSection key={repository.id} repository={repository} />;
                    })}
            </div>
            <Suspense>
                <BottomModal variantsMapPromise={variantsMapPromise} />
            </Suspense>
        </>
    );
}

function IconsSection({ repository }: { repository: Repository }) {
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
