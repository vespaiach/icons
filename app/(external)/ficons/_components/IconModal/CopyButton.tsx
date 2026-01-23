import { ChevronDown, Copy } from 'lucide-react';
import { useState } from 'react';
import { astToHtml, prepareAst } from '@/utils/ast-2-html';
import { astToTsx, preparedAstToTsx } from '@/utils/ast-2-tsx';
import { cx } from '@/utils/common-helpers';

export default function CopyButton({
    icon,
    variant,
    adjustment
}: {
    icon: { name: string; svgAst: SvgNode };
    variant: Variant;
    adjustment?: Adjustment;
}) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [text, setText] = useState('Raw SVG');

    const copy = (format: string) => {
        let contentToCopy = '';
        if (format === 'Raw SVG') {
            const preparedAst = prepareAst(icon.svgAst, variant, adjustment);
            contentToCopy = astToHtml(preparedAst);
        } else if (format === 'React TSX') {
            const preparedAst = preparedAstToTsx(icon.svgAst, variant, adjustment);
            contentToCopy = astToTsx({ name: icon.name, svgAst: preparedAst });
        }
        navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleSelection =
        (format: string) =>
        (e: { preventDefault: () => void }): void => {
            e.preventDefault();
            setOpen(false);
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
                className="d-btn d-btn-sm d-btn-secondary rounded-tr-none rounded-br-none">
                <Copy size={18} />
                <span className="hidden md:inline">{text}</span>
            </button>
            <div className={cx('d-dropdown d-dropdown-end', open ? 'd-dropdown-open' : 'd-dropdown-close')}>
                <button
                    onClick={() => {
                        setOpen((v) => !v);
                    }}
                    type="button"
                    className="d-btn d-btn-secondary d-btn-sm px-1 rounded-tl-none rounded-bl-none">
                    <ChevronDown size={20} />
                </button>
                <ul
                    tabIndex={-1}
                    className={cx(
                        'd-dropdown-content d-menu bg-secondary text-secondary-content rounded-box z-10 w-52 p-2 shadow-sm',
                        'fixed bottom-15 right-15 md:right-37'
                    )}>
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
