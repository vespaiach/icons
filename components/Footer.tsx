import { ExternalLink } from 'lucide-react';

export default function Footer() {
    return (
        <div className="flex items-center justify-center my-5">
            <h5 className="text-center">
                © {new Date().getFullYear()} Trinh Nguyen |{' '}
                <a
                    href="https://github.com/vespaiach"
                    className="d-link inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer">
                    GitHub
                    <ExternalLink size={14} />
                </a>{' '}
                |{' '}
                <a
                    href="https://www.linkedin.com/in/trinh-nguyen-us/"
                    className="d-link inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer">
                    LinkedIn
                    <ExternalLink size={14} />
                </a>{' '}
                |{' '}
                <a href="/tou" className="d-link">
                    Terms of Use
                </a>
            </h5>
        </div>
    );
}
