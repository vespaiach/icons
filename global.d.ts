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

    interface Directory {
        id: number;
        path: string;
        variant: string;
        createdAt: Date;
    }

    interface Icon {
        id: string;
        repositoryId: number;
        name: string;
        svgContent: string;
        createdAt: Date;
    }

    interface IconWithDirectoryVariant extends Icon {
        directoryId: number;
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
