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
        const handleSelectionChange = (e: Event) => {
            // Check if the interaction is with the ask button
            // We cast to any because Event target might not have closest method standardly typed in all environments or composedPath
            const target = e.target as HTMLElement;
            const isButtonInteraction = target?.closest?.('.text-selection-button');

            if (isButtonInteraction) {
                return;
            }

            const selectedText = window.getSelection()?.toString().trim() || '';

            if (selectedText) {
                const range = window.getSelection()?.getRangeAt(0);
                if (range) {
                    const rect = range.getBoundingClientRect();

                    // --- CSS Highlight API Implementation ---
                    // This keeps the text visually highlighted even if focus moves to the input field
                    // @ts-ignore
                    if (typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && CSS.highlights) {
                        try {
                            // @ts-ignore
                            const highlight = new Highlight(range);
                            // @ts-ignore
                            CSS.highlights.set('ask-ai-highlight', highlight);
                        } catch (err) {
                            console.warn('CSS Highlight API error:', err);
                        }
                    }
                    // ----------------------------------------

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
                // Clear the custom highlight
                // @ts-ignore
                if (typeof CSS !== 'undefined' && CSS.highlights) {
                    // @ts-ignore
                    CSS.highlights.delete('ask-ai-highlight');
                }
            }
        };

        // Handle clearing selection explicitly if needed
        const handleSelectionClear = () => {
            // Clear the custom highlight
            // @ts-ignore
            if (typeof CSS !== 'undefined' && CSS.highlights) {
                // @ts-ignore
                CSS.highlights.delete('ask-ai-highlight');
            }
        };

        // Listen for mouseup and touchend events to detect selection
        document.addEventListener('mouseup', handleSelectionChange);
        document.addEventListener('touchend', handleSelectionChange);
        document.addEventListener('keyup', handleSelectionChange);

        // Listen for scroll to clear/update
        const scrollHandler = () => {
            // Optional: Close on scroll to avoid positioning issues
            if (!window.getSelection()?.toString()) {
                setSelection({ text: '', position: null });
                handleSelectionClear();
            }
        };
        window.addEventListener('scroll', scrollHandler);

        return () => {
            document.removeEventListener('mouseup', handleSelectionChange);
            document.removeEventListener('touchend', handleSelectionChange);
            document.removeEventListener('keyup', handleSelectionChange);
            window.removeEventListener('scroll', scrollHandler);
            handleSelectionClear();
        };
    }, []);

    return selection;
}
