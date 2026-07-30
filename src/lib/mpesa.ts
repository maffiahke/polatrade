import axios from "axios";

/**
 * Format Kenyan phone number to 2547XXXXXXXX
 */
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}

function cleanEnvVar(val: string | undefined): string {
  if (!val) return "";
  let clean = val.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1);
  }
  return clean.trim();
}

/** Base URL for Daraja API (sandbox vs production) */
const MPESA_API_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}${h}${min}${s}`;
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

function getDarajaConfig() {
  const consumerKey = cleanEnvVar(process.env.MPESA_CONSUMER_KEY);
  const consumerSecret = cleanEnvVar(process.env.MPESA_CONSUMER_SECRET);
  const passkey = cleanEnvVar(process.env.MPESA_PASSKEY);
  const shortcode = cleanEnvVar(process.env.MPESA_SHORTCODE);
  const tillNumber = cleanEnvVar(process.env.MPESA_TILL_NUMBER);
  const transactionType =
    cleanEnvVar(process.env.MPESA_TRANSACTION_TYPE) || "CustomerPayBillOnline";
  const callbackUrl = cleanEnvVar(process.env.MPESA_CALLBACK_URL);

  if (!consumerKey || !consumerSecret || !passkey || !shortcode || !callbackUrl) {
    throw new Error(
      "M-Pesa Daraja not configured. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, " +
        "MPESA_PASSKEY, MPESA_SHORTCODE, and MPESA_CALLBACK_URL in .env"
    );
  }

  if (transactionType === "CustomerBuyGoodsOnline" && !tillNumber) {
    throw new Error(
      "MPESA_TILL_NUMBER is required when MPESA_TRANSACTION_TYPE is CustomerBuyGoodsOnline"
    );
  }

  return { consumerKey, consumerSecret, passkey, shortcode, tillNumber, transactionType, callbackUrl };
}

/**
 * Obtain an OAuth access token from the Daraja API.
 * The token is short-lived (expires in 3600 s) — we fetch one per request.
 */
async function getOAuthToken(consumerKey: string, consumerSecret: string): Promise<string> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await axios.get(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.data.access_token;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Initiate an M-Pesa STK Push via the Daraja API.
 *
 * Supports both **CustomerPayBillOnline** (paybill) and
 * **CustomerBuyGoodsOnline** (buy goods – till) transaction types.
 *
 * Required env vars:
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY,
 *   MPESA_SHORTCODE, MPESA_CALLBACK_URL
 *
 * For buy-goods also set: MPESA_TILL_NUMBER, MPESA_TRANSACTION_TYPE
 */
export async function initiateStkPush(params: {
  phone: string;
  amountKes: number;
  accountReference: string;
  transactionDesc: string;
}) {
  const config = getDarajaConfig();
  const token = await getOAuthToken(config.consumerKey, config.consumerSecret);
  const timestamp = getTimestamp();
  const password = generatePassword(config.shortcode, config.passkey, timestamp);
  const formattedPhone = formatPhone(params.phone);

  // PartyB: for PayBill the shortcode itself; for BuyGoods the till number
  const partyB =
    config.transactionType === "CustomerBuyGoodsOnline" && config.tillNumber
      ? config.tillNumber
      : config.shortcode;

  let response;
  try {
    response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: config.transactionType,
        Amount: Math.round(params.amountKes),
        PartyA: formattedPhone,
        PartyB: partyB,
        PhoneNumber: formattedPhone,
        CallBackURL: config.callbackUrl,
        AccountReference: (params.accountReference ?? "SUMMITTRADES").slice(0, 12),
        TransactionDesc: (params.transactionDesc ?? "Deposit").slice(0, 13),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as {
        errorMessage?: string;
        ResponseDescription?: string;
        message?: string;
      };
      const errMsg = data.errorMessage || data.ResponseDescription || data.message || "STK push failed";
      throw new Error(errMsg);
    }
    throw err;
  }

  const data = response.data;

  // ResponseCode "0" means the request was accepted for processing
  if (data.ResponseCode !== "0") {
    throw new Error(data.ResponseDescription || data.errorMessage || "STK push rejected by Safaricom");
  }

  return {
    transactionId: data.CheckoutRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
    status: "pending",
    CustomerMessage: data.ResponseDescription || "Request accepted for processing",
  };
}

/* ------------------------------------------------------------------ */
/*  Status query interface & response                                  */
/* ------------------------------------------------------------------ */

export interface MpesaStatusResponse {
  success: boolean;
  data: {
    response: {
      Status: string; // "Success" | "Failed" | "Pending"
      Amount: number;
      ExternalReference: string;
      MpesaReceiptNumber: string;
      ResultDesc: string;
      CheckoutRequestID: string;
    };
  };
}

/**
 * Query the status of an STK push transaction via Daraja's query endpoint.
 *
 * Possible ResultCode values (from the query response):
 *   "0"   – Payment completed successfully
 *   "1032" – Transaction cancelled by customer
 *   "1037" – Timeout
 *   "1"   – Insufficient balance
 *   "2"   – Rejected by system
 *   "2001" – Initiator info error
 *
 * When the query succeeds (ResponseCode "0") but no ResultCode is returned,
 * the transaction is still pending processing.
 */
export async function checkStkStatus(checkoutRequestId: string): Promise<MpesaStatusResponse> {
  const config = getDarajaConfig();
  const token = await getOAuthToken(config.consumerKey, config.consumerSecret);
  const timestamp = getTimestamp();
  const password = generatePassword(config.shortcode, config.passkey, timestamp);

  const res = await axios.post(
    `${MPESA_API_URL}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = res.data;

  // ResponseCode "0" means the query itself succeeded
  const queryOk = data.ResponseCode === "0" || data.ResponseCode === 0;

  if (!queryOk) {
    return {
      success: false,
      data: {
        response: {
          Status: "Pending",
          Amount: 0,
          ExternalReference: checkoutRequestId,
          MpesaReceiptNumber: "",
          ResultDesc: data.ResponseDescription || "Query failed",
          CheckoutRequestID: checkoutRequestId,
        },
      },
    };
  }

  const resultCode = String(data.ResultCode ?? "");
  const resultDesc = data.ResultDesc || "";
  let normalizedStatus = "Pending";
  let amount = 0;
  let receiptNumber = "";

  if (resultCode === "0") {
    normalizedStatus = "Success";
    // Extract callback metadata if available from query response
    if (data.CallbackMetadata?.Item) {
      for (const item of data.CallbackMetadata.Item) {
        if (item.Name === "Amount") amount = Number(item.Value) || 0;
        if (item.Name === "MpesaReceiptNumber") receiptNumber = String(item.Value || "");
      }
    }
  } else if (["1032", "1037", "1", "2", "17", "2001"].includes(resultCode)) {
    normalizedStatus = "Failed";
  }
  // else stays "Pending" (no ResultCode yet, still processing)

  return {
    success: normalizedStatus !== "Failed",
    data: {
      response: {
        Status: normalizedStatus,
        Amount: amount,
        ExternalReference: checkoutRequestId,
        MpesaReceiptNumber: receiptNumber,
        ResultDesc: resultDesc,
        CheckoutRequestID: checkoutRequestId,
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Convert USD to KES using the configured rate.
 */
export function usdToKes(usd: number): number {
  const rate = parseFloat(process.env.USD_TO_KES ?? "130");
  return Math.ceil(usd * rate);
}

/**
 * Check whether the Daraja M-Pesa credentials are present in the environment.
 */
export function isMpesaConfigured(): boolean {
  const key = cleanEnvVar(process.env.MPESA_CONSUMER_KEY);
  const secret = cleanEnvVar(process.env.MPESA_CONSUMER_SECRET);
  const passkey = cleanEnvVar(process.env.MPESA_PASSKEY);
  const shortcode = cleanEnvVar(process.env.MPESA_SHORTCODE);
  const callbackUrl = cleanEnvVar(process.env.MPESA_CALLBACK_URL);
  return !!(key && secret && passkey && shortcode && callbackUrl);
}