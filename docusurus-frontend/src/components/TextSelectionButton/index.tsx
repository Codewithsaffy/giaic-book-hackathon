import React, { useState } from 'react';
import { useSession } from '@site/src/lib/auth-client';
import { useAuthUI } from '../Auth/AuthUIContext';
import { useTextSelection } from '@site/src/hooks/useTextSelection';
import ChatWidget from '../ChatWidget';
import styles from './styles.module.css';

export default function TextSelectionButton(): JSX.Element {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<string>('');
    const { data: session } = useSession();
    const { openLoginModal } = useAuthUI();
    const { text, position } = useTextSelection();

    const handleAskClick = () => {
        if (!session) {
            openLoginModal();
            return;
        }

        // Format the selected text with "explain:" prefix
        const formattedQuestion = `explain: ${text}`;
        setSelectedQuestion(formattedQuestion);
        setIsChatOpen(true);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
        setSelectedQuestion('');
    };

    // Don't render if no text is selected or if chat is already open
    if (!text || !position || isChatOpen) {
        return null;
    }

    return (
        <>
            <div
                className={`${styles.textSelectionButton} text-selection-button`}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
                onClick={handleAskClick}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span>Ask AI</span>
            </div>

            {isChatOpen && session && (
                <ChatWidget
                    onClose={handleChatClose}
                    initialMessage={selectedQuestion}
                />
            )}
        </>
    );
}
