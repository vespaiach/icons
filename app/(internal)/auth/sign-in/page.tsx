import SignInForm from './_components/SignInForm';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ rt?: string }> }) {
    const returnTo = (await searchParams).rt;

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
                    <SignInForm returnTo={returnTo} />
                </div>
            </div>
        </>
    );
}
