import Link from 'next/link';
import Footer from '@/components/Footer';

export default function TermOfUsagePage() {
    return (
        <div className="container mx-auto px-4 pt-8 max-w-3xl">
            <div className="mb-6">
                <Link href="/ficons" className="d-btn d-btn-sm d-btn-ghost">
                    ← Back to Icons
                </Link>
            </div>

            <h1 className="font-bold text-3xl mb-8 flex items-center gap-3">Terms of Use & Disclaimer</h1>

            <div className="prose max-w-none mb-10">
                <section className="mb-8">
                    <h2 className="mb-4 text-2xl font-semibold">1. Usage</h2>
                    <div className="space-y-4">
                        <p>
                            <strong>Free Service:</strong> Ficons is a free, curated explorer designed to help
                            you find and use open-source icons more efficiently.
                        </p>
                        <p>
                            <strong>Usage:</strong> You are free to browse, search, and download icons for
                            personal or commercial projects.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="mb-4 text-2xl font-semibold">2. Intellectual Property Disclaimer</h2>
                    <div className="space-y-4">
                        <p>
                            <strong>Third-Party Ownership:</strong> All icon sets featured on Ficons
                            (including Feather, Heroicons, Lucide, and others) are the sole intellectual
                            property of their original creators.
                        </p>
                        <p>
                            <strong>Respect Creator Rights:</strong> We are committed to supporting the
                            open-source community. Users are expected to respect the hard work of these
                            creators by using the icons ethically and legally.
                        </p>
                        <p>
                            <strong>License Verification:</strong> While Ficons helps you discover these tools
                            for free, each library carries its own specific license (such as MIT or CC BY). It
                            is your responsibility to verify and comply with the original license before
                            incorporating icons into your personal or commercial projects.
                        </p>
                        <p>
                            <strong>No Ownership Claim:</strong> Ficons acts strictly as a search and
                            discovery interface; we do not claim ownership, sell, or re-license any of the
                            third-party icons provided.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="mb-4 text-2xl font-semibold">3. Liability Disclaimer</h2>
                    <div className="space-y-4">
                        <p>
                            <strong>"As-Is" Policy:</strong> This website is provided for free and "as-is." We
                            do not guarantee that icons are error-free or that the service will be
                            uninterrupted.
                        </p>
                        <p>
                            <strong>Limitation of Liability:</strong> Trinh Nguyen and Ficons shall not be
                            held liable for any issues or damages arising from the use of the icons or the
                            website.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="mb-4 text-2xl font-semibold">4. How to Check Licenses</h2>
                    <p className="mb-4">
                        To ensure you are using icons correctly, we recommend verifying the license for each
                        collection:
                    </p>
                    <ol className="ml-6 list-decimal space-y-2">
                        <li>
                            <strong>Open Information:</strong> Click the Gear Icon (⚙️) next to the repository
                            name.
                        </li>
                        <li>
                            <strong>View Source:</strong> This will open a modal containing detailed
                            repository information and a direct link to the original source where you can read
                            the full license terms.
                        </li>
                    </ol>
                </section>
            </div>

            <Footer />
        </div>
    );
}
