import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './styles.module.css';

interface Message {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    sources?: Source[];
}

interface Source {
    id: string | number;
    score: number;
    text: string;
    metadata: Record<string, any>;
}

interface ChatRequest {
    question: string;
    top_k?: number;
}

interface ChatResponse {
    answer: string;
    sources?: Source[];
}

interface ChatWidgetProps {
    onClose: () => void;
    initialMessage?: string;
}

export default function ChatWidget({ onClose, initialMessage }: ChatWidgetProps): JSX.Element {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hi! How can I help you with the documentation today?'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSubmittedInitial, setHasSubmittedInitial] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmitWithMessage = async (message: string) => {
        if (!message.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: message
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const requestBody: ChatRequest = {
                question: message,
                top_k: 3
            };

            // Updated API endpoint
            const response = await fetch('https://roboticai-hacakthon-book-rag-api.vercel.app/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data: ChatResponse = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                sources: data.sources || []
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
            setError(errorMessage);

            const errorAssistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${errorMessage}. Please make sure you are connected to the internet.`
            };

            setMessages(prev => [...prev, errorAssistantMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-submit initial message if provided
    useEffect(() => {
        if (initialMessage && !hasSubmittedInitial) {
            setHasSubmittedInitial(true);
            // Submit immediately
            handleSubmitWithMessage(initialMessage);
        }
    }, [initialMessage, hasSubmittedInitial]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmitWithMessage(input);
    };

    return (
        <div className={styles.chatContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.headerIcon}>
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    Assistant
                </div>
                <div className={styles.headerControls}>
                    <button className={styles.controlBtn} title="Expand">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9" />
                            <polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" />
                            <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    </button>
                    <button className={styles.controlBtn} title="Clear chat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                    <button className={styles.controlBtn} onClick={onClose} title="Close">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.message} ${msg.role === 'assistant' ? styles.messageAssistant : styles.messageUser}`}>
                        {msg.role === 'user' && (
                            <div className={styles.messageContent}>{msg.content}</div>
                        )}

                        {msg.role === 'assistant' && (
                            <>
                                <div className={`${styles.messageContent} ${styles.markdownContent}`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>

                                {/* Display sources if available */}
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className={styles.sourcesContainer}>
                                        <div className={styles.sourcesTitle}>📚 Sources:</div>
                                        {msg.sources.map((source, idx) => (
                                            <div key={source.id} className={styles.sourceItem}>
                                                <div className={styles.sourceHeader}>
                                                    <span className={styles.sourceNumber}>Source {idx + 1}</span>
                                                    <span className={styles.sourceScore}>
                                                        Relevance: {(source.score * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className={styles.sourceText}>
                                                    {source.text.length > 150
                                                        ? `${source.text.substring(0, 150)}...`
                                                        : source.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={styles.messageActions}>
                                    <button className={styles.actionBtn} title="Good response">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                        </svg>
                                    </button>
                                    <button className={styles.actionBtn} title="Bad response">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                                        </svg>
                                    </button>
                                    <button className={styles.actionBtn} title="Copy">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                    </button>
                                    <button className={styles.actionBtn} title="Regenerate">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 4v6h-6" />
                                            <path d="M1 20v-6h6" />
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className={`${styles.message} ${styles.messageAssistant}`}>
                        <div className={styles.messageContent}>
                            <div className={styles.loadingDots}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
                <form onSubmit={handleSubmit} className={styles.inputWrapper}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className={styles.sendBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
