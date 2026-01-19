import { ChevronDown, Copy } from 'lucide-react';
import { useState } from 'react';
import { astToHtml, astToTsx } from '@/utils/client-side/svg-helpers';
import { cx } from '@/utils/common-helpers';

export default function CopyButton({ icon }: { icon: { name: string; svgAst: SvgNode } }) {
    const [copied, setCopied] = useState(false);
    const [text, setText] = useState('Raw SVG');

    const copy = (format: string) => {
        let contentToCopy = '';
        if (format === 'Raw SVG') {
            contentToCopy = astToHtml(icon.svgAst);
        } else if (format === 'React TSX') {
            contentToCopy = astToTsx({ name: icon.name, svgAst: icon.svgAst });
        }
        navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleSelection =
        (format: string) =>
        (e: { preventDefault: () => void }): void => {
            e.preventDefault();
            setText(format);
            copy(format);
        };

    return (
        <div className={cx('flex', copied && 'd-tooltip d-tooltip-top d-tooltip-open')} data-tip="Copied!">
            <button
                type="button"
                onClick={() => {
                    copy(text);
                }}
                className="d-btn d-btn-soft d-btn-sm d-btn-secondary rounded-tr-none rounded-br-none">
                <Copy size={18} />
                {text}
            </button>
            <div className="d-dropdown d-dropdown-end">
                <button
                    type="button"
                    className="d-btn d-btn-soft d-btn-secondary d-btn-sm px-1 rounded-tl-none rounded-bl-none">
                    <ChevronDown size={20} />
                </button>
                <ul
                    tabIndex={-1}
                    className="d-dropdown-content d-menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                    <li>
                        <button type="button" onClick={handleSelection('Raw SVG')}>
                            Raw SVG
                        </button>
                    </li>
                    <li>
                        <button type="button" onClick={handleSelection('React TSX')}>
                            React TSX
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}
