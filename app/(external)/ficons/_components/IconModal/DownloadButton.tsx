import { ChevronDown, Download } from 'lucide-react';
import { useState } from 'react';
import { astToHtml, prepareAst } from '@/utils/ast-2-html';
import { astToTsx, preparedAstToTsx } from '@/utils/ast-2-tsx';
import { cx } from '@/utils/common-helpers';

export default function DownloadButton({
    icon,
    variant,
    adjustment
}: {
    icon: IconWithRelativeData;
    variant: Variant;
    adjustment?: Adjustment;
}) {
    const [text, setText] = useState('Raw SVG');
    const [open, setOpen] = useState(false);

    const download = (format: string) => {
        let svgContent = '';
        if (format === 'Raw SVG') {
            const preparedAst = prepareAst(icon.svgAst, variant, adjustment);
            svgContent = astToHtml(preparedAst);
        } else if (format === 'React TSX') {
            const preparedAst = preparedAstToTsx(icon.svgAst, variant, adjustment);
            svgContent = astToTsx({
                name: icon.name,
                svgAst: preparedAst,
                colorOnChildren: variant.colorOnChildren
            });
        }

        const blob = new Blob([svgContent], { type: format === 'Raw SVG' ? 'image/svg+xml' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${icon.name}.${format === 'Raw SVG' ? 'svg' : 'tsx'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSelection =
        (format: string) =>
        (e: { preventDefault: () => void }): void => {
            e.preventDefault();
            setOpen(false);
            setText(format);
            download(format);
        };

    return (
        <div className="flex">
            <button
                type="button"
                onClick={() => {
                    download(text);
                }}
                className="d-btn d-btn-sm d-btn-secondary rounded-tr-none rounded-br-none">
                <Download size={18} />
                <span className="hidden md:inline">{text}</span>
            </button>
            <div className={cx('d-dropdown d-dropdown-end', open ? 'd-dropdown-open' : 'd-dropdown-close')}>
                <button
                    type="button"
                    onClick={() => {
                        setOpen((v) => !v);
                    }}
                    className="d-btn d-btn-secondary d-btn-sm px-1 rounded-tl-none rounded-bl-none">
                    <ChevronDown size={20} />
                </button>
                <ul
                    tabIndex={-1}
                    className="d-dropdown-content d-menu bg-secondary text-secondary-content rounded-box z-10 w-52 p-2 shadow-sm fixed bottom-14 right-5">
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
