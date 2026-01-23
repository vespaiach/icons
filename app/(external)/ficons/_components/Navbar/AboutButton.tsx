import Link from 'next/link';

export default function AboutButton() {
    return (
        <Link href="/about" className="d-btn d-btn-sm d-btn-ghost">
            About
        </Link>
    );
}
