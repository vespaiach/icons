declare global {
    interface Repository {
        id: number;
        owner: string;
        name: string;
        ref: string;
        lastImportedAt: Date | null;
        createdAt: Date;
    }

    interface RepositoryWithIconCount extends Repository {
        iconCount: number;
    }

    interface SvgAdjustableAttributes {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        height?: number;
        width?: number;
    }

    interface Variant {
        id: number;
        repositoryId: number;
        path: string;
        name: string;
        regex: string;
        defaultSvgAttributes: SvgAdjustableAttributes;
        iconCount: number;
        createdAt: Date;
        updatedAt: Date;
    }

    interface VariantWithRepository extends Variant {
        repositoryOwner: string;
        repositoryName: string;
    }

    interface SvgNode {
        id: string;
        type: string;
        attrs: Record<string, string>;
        children?: SvgNode[];
    }

    interface Icon {
        id: number;
        name: string;
        svgAst: SvgNode;
    }

    interface IconWithRelativeData extends Icon {
        repositoryId: number;
        variantId: number;
    }

    interface RepositoryVariants extends Repository {
        variants: Variant[];
    }

    interface RepositoryVariantsWithIconCount extends RepositoryVariants {
        iconCount: number;
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

    interface Favorite {
        iconId: number;
        svgAst: SvgNode;
    }
}

export {};
