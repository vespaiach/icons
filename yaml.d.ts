declare module '*/icon.repositories.yaml' {
    interface Repository {
        owner: string;
        name: string;
        ref: string;
        github_id: number;
    }

    interface IconRepositories {
        repos: Repository[];
    }

    const value: IconRepositories;
    export default value;
}
