import React, { useState } from 'react';
import { useSession } from '@site/src/lib/auth-client';
import { useAuthUI } from '../Auth/AuthUIContext';
import { useTextSelection } from '@site/src/hooks/useTextSelection';
import ChatWidget from '../ChatWidget';
import styles from './styles.module.css';

export default function TextSelectionButton(): JSX.Element {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<string>('');
    const [prompt, setPrompt] = useState('');
    const { data: session } = useSession();
    const { openLoginModal } = useAuthUI();
    const { text, position } = useTextSelection();

    const handleAskSubmit = () => {
        if (!session) {
            openLoginModal();
            return;
        }

        // Format: "{prompt}: {text}"
        const questionPrefix = prompt.trim() || "Explain";
        const formattedQuestion = `${questionPrefix}: ${text}`;

        setSelectedQuestion(formattedQuestion);
        setIsChatOpen(true);
        setPrompt(''); // Reset prompt
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
        setSelectedQuestion('');
    };

    // If no text/position and chat is closed, don't render anything
    if ((!text || !position) && !isChatOpen) {
        return null;
    }

    // If chat is open, we still need to render the wrapper to show the ChatWidget
    // But we should hide the ask button itself
    const showButton = text && position && !isChatOpen;

    return (
        <>
            {showButton && (
                <div
                    className={`${styles.textSelectionButton} text-selection-button`}
                    data-no-selection-clear="true"
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}
                    onMouseDown={(e) => {
                        // Prevent default to stop selection clear when clicking the container
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <div className={styles.inputWrapper}>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        <input
                            type="text"
                            className={styles.selectionInput}
                            placeholder="Ask with AI..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAskSubmit();
                                }
                            }}
                            onMouseDown={(e) => {
                                // Important: ALLOW default behavior so input gets focus
                                // But stop propagation so it doesn't bubbling up
                                e.stopPropagation();
                            }}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={handleAskSubmit}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {isChatOpen && session && (
                <ChatWidget
                    onClose={handleChatClose}
                    initialMessage={selectedQuestion}
                />
            )}
        </>
    );
}
