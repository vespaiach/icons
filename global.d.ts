declare global {
    interface Repository {
        id: number;
        owner: string;
        name: string;
        ref: string;
        githubId: number;
        createdAt: Date;
        lastImportedAt: Date | null;
    }

    interface RepositoryWithIconCount extends Repository {
        iconCount: number;
    }

    interface Directory {
        id: number;
        repositoryId: number;
        path: string;
        variant: string;
        attributes: { [key: string]: string };
        createdAt: Date;
    }

    interface Icon {
        id: string;
        directoryId: number;
        name: string;
        svgContent: string;
        svgAttributes: { [key: string]: string };
        createdAt: Date;
    }

    interface IconWithDirectoryVariant extends Icon {
        variant: string;
    }

    interface RepositoryDirectories extends Repository {
        directories: Directory[];
    }

    interface User {
        id: number;
        name: string;
        email: string;
        hashedPassword: string;
        profilePictureUrl: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }

    interface Session {
        userId: number;
        userName: string;
        userProfilePictureUrl: string | null;
    }
}

export {};
