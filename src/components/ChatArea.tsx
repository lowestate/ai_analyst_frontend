import React from 'react';
import { Message } from '../types';
import { SampleTable } from './SampleTable';

interface ChatAreaProps {
    activeChat: string | null;
    messages: Message[];
    loading: boolean;
    loadingPhrase: string;
    input: string;
    setInput: (val: string) => void;
    onSendMessage: () => void;
    localDataPool: any[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({ activeChat, messages, loading, loadingPhrase, input, setInput, onSendMessage, localDataPool }) => {
    return (
        <div className="col-center">
            <div className="messages-wrapper">
                {activeChat && activeChat !== "temp_loading" && localDataPool.length > 0 && (
                    <SampleTable dataPool={localDataPool} />
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`msg-row ${msg.sender}`}>
                        <div className={`msg-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                            {msg.text.split('\n').map((line, i) => (
                                <React.Fragment key={i}>{line}<br/></React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="msg-row agent">
                        <div className="msg-bubble agent">
                            <span className="loading-text">{loadingPhrase}</span>
                        </div>
                    </div>
                )}
            </div>

            {activeChat && activeChat !== "temp_loading" && (
                <div className="input-container">
                    <div className="input-box">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onSendMessage()}
                            placeholder="Что исследуем?"
                        />
                        <button onClick={onSendMessage}>→</button>
                    </div>
                </div>
            )}
        </div>
    );
};