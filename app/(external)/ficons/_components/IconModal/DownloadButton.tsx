import { ChevronDown, Download } from 'lucide-react';
import { useState } from 'react';
import { astToHtml, astToTsx } from '@/utils/client-side/svg-helpers';

export default function DownloadButton({ icon }: { icon: IconWithRelativeData }) {
    const [text, setText] = useState('Raw SVG');

    const download = (format: string) => {
        let svgContent = '';
        if (format === 'Raw SVG') {
            svgContent = astToHtml(icon.svgAst);
        } else if (format === 'React TSX') {
            svgContent = astToTsx({ name: icon.name, svgAst: icon.svgAst });
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
                className="d-btn d-btn-soft d-btn-sm d-btn-secondary rounded-tr-none rounded-br-none">
                <Download size={18} />
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
