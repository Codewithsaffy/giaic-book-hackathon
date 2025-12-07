import { useState, useEffect } from 'react';

interface SelectionPosition {
    x: number;
    y: number;
}

interface TextSelectionState {
    text: string;
    position: SelectionPosition | null;
}

export function useTextSelection(): TextSelectionState {
    const [selection, setSelection] = useState<TextSelectionState>({
        text: '',
        position: null
    });

    useEffect(() => {
        const handleSelectionChange = () => {
            const selectedText = window.getSelection()?.toString().trim() || '';

            if (selectedText) {
                const range = window.getSelection()?.getRangeAt(0);
                if (range) {
                    const rect = range.getBoundingClientRect();
                    setSelection({
                        text: selectedText,
                        position: {
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10 // Position above the selection
                        }
                    });
                }
            } else {
                setSelection({ text: '', position: null });
            }
        };

        // Listen for mouseup and touchend events to detect selection
        document.addEventListener('mouseup', handleSelectionChange);
        document.addEventListener('touchend', handleSelectionChange);

        // Clear selection when clicking elsewhere
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't clear if clicking the ask button
            if (!target.closest('.text-selection-button')) {
                const selectedText = window.getSelection()?.toString().trim() || '';
                if (!selectedText) {
                    setSelection({ text: '', position: null });
                }
            }
        };

        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mouseup', handleSelectionChange);
            document.removeEventListener('touchend', handleSelectionChange);
            document.removeEventListener('mousedown', handleClick);
        };
    }, []);

    return selection;
}
