declare module '*/icon.repositories.yaml' {
    interface Repository {
        owner: string;
        name: string;
        ref: string;
        variants: {
            name: string;
            path: string;
            regex?: string;
            fill?: string;
            stroke?: string;
            strokeWidth?: string;
        }[];
    }

    interface IconRepositories {
        repos: Repository[];
    }

    const value: IconRepositories;
    export default value;
}
