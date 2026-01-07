declare module '*/icon.repositories.yaml' {
    interface Repository {
        owner: string;
        name: string;
        ref: string;
        github_id: number;
        directories: {
            variant: string;
            path: string;
            attributes: { [key: string]: string };
        }[];
    }

    interface IconRepositories {
        repos: Repository[];
    }

    const value: IconRepositories;
    export default value;
}
