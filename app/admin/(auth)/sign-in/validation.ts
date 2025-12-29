import * as v from 'valibot';
import { buildFormParser } from '@/utils/validation.helpers';

export const passwordSchema = v.pipe(
    v.string('Your password must be a string.'),
    v.nonEmpty('Please enter your password.'),
    v.minLength(8, 'Your password must have 8 characters or more.')
);

const signInPayloadSchema = v.object({
    email: v.pipe(
        v.string('Your email must be a string.'),
        v.nonEmpty('Please enter your email.'),
        v.email('The email address is badly formatted.')
    ),
    password: passwordSchema,
    keepMeSignedIn: v.nullish(v.string())
});

export type SignInPayload = v.InferOutput<typeof signInPayloadSchema>;

export const parseSignInForm = buildFormParser(signInPayloadSchema);
