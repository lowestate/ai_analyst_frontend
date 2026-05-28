import React from 'react';
import { DbCredentialsForm } from '../upload_data/DBCredentials';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    uploadTab: 'file' | 'db';
    setUploadTab: (tab: 'file' | 'db') => void;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    dbCreds: any;
    onDbCredsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    isSubmitDisabled: boolean;
    currentUser?: { username: string; id: number; plan_name?: string } | null;
    isBanned?: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    isOpen, onClose, uploadTab, setUploadTab, selectedFile, setSelectedFile,
    dbCreds, onDbCredsChange, onSubmit, isSubmitDisabled, currentUser, isBanned = false
}) => {
    if (!isOpen || isBanned) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="upload-modal" onClick={e => e.stopPropagation()}>

                <div className="upload-tabs">
                    <div className={`upload-tab ${uploadTab === 'file' ? 'active' : ''}`} onClick={() => setUploadTab('file')}>
                        Загрузить файл
                    </div>
                    <div
                        className={`upload-tab ${uploadTab === 'db' ? 'active' : ''}`}
                        onClick={() => {
                            if (currentUser?.plan_name !== 'senior') return;
                            setUploadTab('db');
                        }}
                        style={currentUser?.plan_name !== 'senior' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        title={currentUser?.plan_name !== 'senior' ? 'Только для тарифа senior' : ''}
                    >
                        База данных (PostgreSQL)
                    </div>
                </div>

                {uploadTab === 'file' ? (
                    <div className="file-drop-area" onClick={() => document.getElementById('hidden-file-input')?.click()}>
                        <input
                            id="hidden-file-input"
                            type="file"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                            }}
                        />
                        <span className="file-drop-text">
                            {selectedFile ? `Выбран файл: ${selectedFile.name}` : 'Нажмите, чтобы выбрать CSV или Excel файл'}
                        </span>
                    </div>
                ) : (
                    <DbCredentialsForm credentials={dbCreds} onChange={onDbCredsChange} />
                )}

                <div className="btn-submit-container">
                    <button
                        className="btn-submit"
                        onClick={onSubmit}
                        disabled={isSubmitDisabled}
                    >
                        Загрузить
                    </button>
                </div>

            </div>
        </div>
    );
};