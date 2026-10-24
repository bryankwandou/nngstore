// Midtrans Snap.js, loaded at checkout from app.midtrans.com (or the sandbox).
export {};

declare global {
  interface SnapResult {
    order_id?: string;
    status_code?: string;
    transaction_status?: string;
    payment_type?: string;
    status_message?: string;
  }

  interface SnapPayOptions {
    onSuccess?: (result: SnapResult) => void;
    onPending?: (result: SnapResult) => void;
    onError?: (result: SnapResult) => void;
    onClose?: () => void;
    language?: "en" | "id";
  }

  interface Window {
    snap?: {
      pay: (token: string, options?: SnapPayOptions) => void;
      hide?: () => void;
    };
  }
}
