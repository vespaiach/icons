import { assertArray } from '@/db/assert.helpers';

export default function RepoForm({
    formState,
    isPending,
    formAction
}: {
    formState: Repository & { errors: Record<string, string[]> };
    isPending: boolean;
    formAction: (formData: FormData) => void;
}) {
    return (
        <form className="flex items-center gap-4" action={formAction}>
            {assertArray(formState.errors.repositoryId) && (
                <div className="text-red-600">
                    {formState.errors.repositoryId.map((err) => (
                        <div key={err}>{err}</div>
                    ))}
                </div>
            )}
            {assertArray(formState.errors.global) && (
                <div className="text-red-600">
                    {formState.errors.global.map((err) => (
                        <div key={err}>{err}</div>
                    ))}
                </div>
            )}
            <input type="hidden" name="repositoryId" value={formState.id} />
            {!isPending && (
                <button type="submit" className="d-btn d-btn-active w-40">
                    Import
                </button>
            )}
            {isPending && (
                <div className="d-btn w-40">
                    <span className="d-loading d-loading-spinner"></span>
                    loading
                </div>
            )}
        </form>
    );
}
