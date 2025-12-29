'use client';

import { useActionState } from 'react';
import { signInAction } from './actions';

export default function SignIn() {
    const [state, formAction, isPending] = useActionState(signInAction, { errors: {}, email: '' });

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8">
                    <h1 className="text-2xl font-bold text-center mb-6 text-foreground">Sign In</h1>

                    <form action={formAction} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                defaultValue={state.email as string}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-foreground"
                                placeholder="Enter your email"
                                disabled={isPending}
                            />
                            {state.errors.email && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-foreground"
                                placeholder="Enter your password"
                                disabled={isPending}
                            />
                            {state.errors.password && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type={isPending ? 'button' : 'submit'}
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                            {isPending ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
