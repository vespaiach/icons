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

    interface Adjustment {
        size?: string | number;
        color?: string;
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
        stroke: string | null;
        strokeOn: 'both' | 'parent' | 'children';
        fill: string | null;
        fillOn: 'both' | 'parent' | 'children';
        strokeWidth: string | null;
        strokeWidthOn: 'both' | 'parent' | 'children';
        iconCount: number;
        createdAt: Date;
        updatedAt: Date;
    }

    interface VariantWithRepository extends Variant {
        repositoryOwner: string;
        repositoryName: string;
    }

    interface SvgNode {
        i: string; // id
        t: string; // type
        a?: Record<string, string | number | boolean | undefined | null>; // attrs (optional)
        c?: SvgNode[]; // children (optional)
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
