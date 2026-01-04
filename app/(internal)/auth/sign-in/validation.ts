import * as v from 'valibot';
import { buildFormParser } from '@/utils/validation.helpers';

const signInPayloadSchema = v.object({
    email: v.pipe(
        v.string('Your email must be a string.'),
        v.nonEmpty('Please enter your email.'),
        v.email('The email address is badly formatted.')
    ),
    password: v.pipe(v.string('Your password must be a string.'), v.nonEmpty('Please enter your password.')),
    keepMeSignedIn: v.nullish(v.string()),
    returnTo: v.nullish(v.pipe(v.string(), v.startsWith('/')))
});

export type SignInPayload = v.InferOutput<typeof signInPayloadSchema>;

export const parseSignInForm = buildFormParser(signInPayloadSchema);
