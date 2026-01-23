export default function Footer() {
    return (
        <div className="flex items-center justify-center my-5">
            <h5 className="text-center">
                © {new Date().getFullYear()} Trinh Nguyen |{' '}
                <a
                    href="https://github.com/vespaiach"
                    className="d-link"
                    target="_blank"
                    rel="noopener noreferrer">
                    GitHub
                </a>{' '}
                |{' '}
                <a
                    href="https://www.linkedin.com/in/trinh-nguyen-us/"
                    className="d-link"
                    target="_blank"
                    rel="noopener noreferrer">
                    LinkedIn
                </a>
            </h5>
        </div>
    );
}
