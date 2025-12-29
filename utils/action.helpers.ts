// import { RedirectType, redirect } from 'next/navigation';
// import { getAuthSession } from './session';

type Errors = Record<string, string[]>;
type Values = Record<string, unknown>;
type AuthenticatedMeta = { loggedInUserId: number };
type AnonymousMeta = { loggedInUserId?: never };
type ServerAction = (
    state: {
        errors: Errors;
        values: Values;
    },
    formData: FormData
) => Promise<{
    errors: Errors;
    values: Values;
}>;
type ValidationResult<P> =
    | { success: true; payload: P; errors: null }
    | { success: false; payload: null; errors: Errors };
type InferPayload<T> = T extends (
    form: FormData
) => Promise<ValidationResult<infer P>>
    ? P
    : never;
type ActionFn<P, Auth extends boolean> = Auth extends true
    ? (
          payload: P,
          meta: AuthenticatedMeta
      ) => Promise<{ errors: Errors } | void>
    : (payload: P, meta?: AnonymousMeta) => Promise<{ errors: Errors } | void>;
type BuildServerActionFunction = <
    Auth extends boolean,
    Parser extends (form: FormData) => Promise<ValidationResult<any>>
>(params: {
    requireAuthenticated: Auth;
    formKeys: string[];
    formParser: Parser;
    action: ActionFn<InferPayload<Parser>, Auth>;
}) => ServerAction;

export const buildServerAction: BuildServerActionFunction =
    ({ formKeys, formParser, action }) =>
    async (_, formData) => {
        // let session: Awaited<ReturnType<typeof getAuthSession>> | null = null;
        // if (requireAuthenticated) {
        //     session = await getAuthSession();
        //     if (!session?.userId) {
        //         redirect('/sign-in', RedirectType.push);
        //     }
        // }

        const previousValues = formKeys.reduce(
            (acc, key) => {
                acc[key] = formData.get(key) as string;
                return acc;
            },
            {} as Record<string, string>
        );

        const { success, payload, errors } = await formParser(formData);

        if (!success) {
            return { errors, values: previousValues };
        }

        const result = await action(payload, { loggedInUserId: undefined });

        if (!result?.errors || Object.keys(result.errors).length === 0) {
            return { errors: {}, values: previousValues };
        }

        return {
            errors: result.errors,
            values: previousValues
        };
    };
