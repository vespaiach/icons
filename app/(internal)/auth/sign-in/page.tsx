'use client';

import { CircleX, LogIn, Mail, SquareAsterisk } from 'lucide-react';
import { useActionState } from 'react';
import { cx } from '@/utils/common-helpers';
import { signInAction } from './actions';

export default function SignInPage() {
    const [formState, formAction, isPending] = useActionState(signInAction, {
        values: { email: '', password: '' },
        errors: {}
    });

    return (
        <>
            <div className="flex-8"></div>
            <div className="flex-4 p-7 flex justify-center">
                <div className="min-w-xs">
                    <div className="pt-4 pb-8">
                        <span className="text-[#38bdf8] font-semibold">STAY 🌐 ONLINE</span>
                    </div>
                    <h1 className="text-center font-semibold text-xl leading-normal">Sign In</h1>
                    <p className="mt-1 text-center text-sm text-muted-foreground">
                        Sign in to your account to continue with
                        <br /> Administration Dashboard.
                    </p>
                    <form className="space-y-1 mt-4" action={formAction}>
                        {formState.errors.global && (
                            <div role="alert" className="d-alert d-alert-error">
                                <CircleX className="w-4" />
                                {formState.errors.global.map((e) => (
                                    <span key={e}>{e}</span>
                                ))}
                            </div>
                        )}
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend">Email Address</legend>
                            <label
                                className={cx(
                                    'd-input w-full d-validator',
                                    formState.errors.email && 'd-input-error'
                                )}>
                                <Mail className="text-info-content opacity-50 w-4" />
                                <input
                                    required
                                    type="text"
                                    name="email"
                                    className="d-grow"
                                    placeholder="you@example.com"
                                    defaultValue={formState.values.email}
                                />
                            </label>
                            <p className="d-label text-error">{formState.errors.email}</p>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend d-validator">Password</legend>
                            <label className="d-input w-full">
                                <SquareAsterisk className="text-info-content opacity-50 w-4" />
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    className="d-grow"
                                    placeholder="Enter your password"
                                />
                            </label>
                            <p className="d-label hidden">Optional</p>
                        </fieldset>
                        {!isPending && (
                            <button type="submit" className="mt-4 d-btn d-btn-primary d-btn-soft w-full">
                                <LogIn className="w-4" />
                                Sign In
                            </button>
                        )}
                        {isPending && <span className="mt-4 d-btn d-btn-primary w-full">Sign In...</span>}
                    </form>
                </div>
            </div>
        </>
    );
}
