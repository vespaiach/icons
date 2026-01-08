/** biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */
'use client';

import { use } from 'react';
import { useSelectedIcon } from './IconContext';

export default function BottomModal({
    repositoriesMapPromise,
    directoriesMapPromise
}: {
    repositoriesMapPromise: Promise<Record<number, RepositoryWithIconCount>>;
    directoriesMapPromise: Promise<Record<number, Directory>>;
}) {
    const repositoriesMap = use(repositoriesMapPromise);
    const directoriesMap = use(directoriesMapPromise);

    const { selectedIcon, setSelectedIcon } = useSelectedIcon();
    const repository = selectedIcon ? repositoriesMap[selectedIcon.repositoryId] : null;
    const directory = selectedIcon ? directoriesMap[selectedIcon.directoryId] : null;

    const handleClose = () => {
        setSelectedIcon(null);
    };

    return (
        <dialog id="bottom_panel" className="d-modal d-modal-bottom">
            <div className="d-modal-box">
                {selectedIcon && repository && directory && (
                    <SelectedIconDetails
                        selectedIcon={selectedIcon}
                        repository={repository}
                        directory={directory}
                    />
                )}
            </div>

            <form method="dialog" className="d-modal-backdrop">
                <button type="button" onClick={handleClose}>
                    close
                </button>
            </form>
        </dialog>
    );
}

function SelectedIconDetails({
    selectedIcon,
    repository,
    directory
}: {
    selectedIcon: IconWithRelativeData;
    repository: RepositoryWithIconCount;
    directory: Directory;
}) {
    return (
        <div className="flex items-start gap-8">
            <div className="shrink-0">
                <div className="w-64 h-64 bg-base-200 flex items-center justify-center rounded">
                    <svg
                        {...selectedIcon.svgAttributes}
                        width={200}
                        height={200}
                        dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent }}
                    />
                </div>
            </div>
            <div className="grow">
                <h3 className="font-bold text-lg mb-2 font-mono">{selectedIcon.name}</h3>
                <div className="space-y-2 text-sm">
                    <div>
                        <span className="font-semibold">ID:</span> {selectedIcon.id}
                    </div>
                    <div>
                        <span className="font-semibold">Directory ID:</span> {selectedIcon.directoryId}
                    </div>
                    <div>
                        <span className="font-semibold">Created:</span>{' '}
                        {new Date(selectedIcon.createdAt).toLocaleDateString()}
                    </div>
                    {Object.keys(selectedIcon.svgAttributes).length > 0 && (
                        <div>
                            <span className="font-semibold">SVG Attributes:</span>
                            <pre className="mt-1 text-xs bg-base-200 p-2 rounded overflow-x-auto">
                                {JSON.stringify(selectedIcon.svgAttributes, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
