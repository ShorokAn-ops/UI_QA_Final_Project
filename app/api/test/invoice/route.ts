import { NextRequest, NextResponse } from 'next/server';

const ERPNEXT_BASE_URL = (process.env.ERPNEXT_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY || '';
const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET || '';
const ERPNEXT_COMPANY = process.env.ERPNEXT_COMPANY || '';
const ERPNEXT_ITEM_ID = process.env.ERPNEXT_ITEM_ID || '';
const ERPNEXT_SUPPLIER = process.env.ERPNEXT_SUPPLIER || 'NovaTech Trading';
const ERPNEXT_CURRENCY = process.env.ERPNEXT_CURRENCY || 'USD';
const ERPNEXT_CONVERSION_RATE = parseFloat(process.env.ERPNEXT_CONVERSION_RATE || '1');

function authHeaders() {
  return {
    'Authorization': `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

export async function POST() {
  // Check for required environment variables
  const missing: string[] = [];
  if (!ERPNEXT_API_KEY) missing.push('ERPNEXT_API_KEY');
  if (!ERPNEXT_API_SECRET) missing.push('ERPNEXT_API_SECRET');
  if (!ERPNEXT_COMPANY) missing.push('ERPNEXT_COMPANY');
  if (!ERPNEXT_ITEM_ID) missing.push('ERPNEXT_ITEM_ID');
  
  if (missing.length > 0) {
    return NextResponse.json(
      { 
        error: 'Missing required ERPNext configuration',
        missing,
        hint: 'Set these environment variables in .env.local or your CI configuration'
      },
      { status: 500 }
    );
  }

  const url = `${ERPNEXT_BASE_URL}/api/resource/Purchase%20Invoice`;
  const payload = {
    supplier: ERPNEXT_SUPPLIER,
    company: ERPNEXT_COMPANY,
    posting_date: new Date().toISOString().split('T')[0],
    currency: ERPNEXT_CURRENCY,
    conversion_rate: ERPNEXT_CONVERSION_RATE,
    items: [
      {
        item_code: ERPNEXT_ITEM_ID,
        qty: 30,
        rate: 10000.0,
      },
    ],
  };

  // Retry logic for nginx 504 timeouts and network issues
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/3] Fetching ERPNext URL: ${url}`);
      console.log(`[Attempt ${attempt}/3] ERPNext Base URL: ${ERPNEXT_BASE_URL}`);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const invoiceId = data?.data?.name;
        if (!invoiceId) {
          return NextResponse.json(
            { error: 'ERPNext response missing invoice name', responseData: data },
            { status: 500 }
          );
        }
        console.log(`✅ Successfully created invoice: ${invoiceId}`);
        return NextResponse.json({ invoice_id: invoiceId });
      }

      if (response.status === 504 && attempt < 3) {
        console.log(`⚠️ Got 504 timeout, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 8000));
        continue;
      }

      const text = await response.text();
      console.error(`❌ ERPNext error: ${response.status} - ${text}`);
      return NextResponse.json(
        { error: `ERPNext error: ${response.status} - ${text}` },
        { status: response.status }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'Unknown';
      
      console.error(`❌ Attempt ${attempt}/3 failed:`, {
        name: errorName,
        message: errorMessage,
        url: ERPNEXT_BASE_URL,
        hasApiKey: !!ERPNEXT_API_KEY,
        hasApiSecret: !!ERPNEXT_API_SECRET,
      });
      
      if (attempt === 3) {
        return NextResponse.json(
          { 
            error: `Failed after ${attempt} retries: ${errorName}: ${errorMessage}`,
            details: {
              erpnext_url: ERPNEXT_BASE_URL,
              credentials_configured: !!(ERPNEXT_API_KEY && ERPNEXT_API_SECRET),
              error_type: errorName,
            }
          },
          { status: 500 }
        );
      }
      console.log(`⏳ Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
}

export async function DELETE(request: NextRequest) {
  const invoiceId = request.nextUrl.searchParams.get('id');
  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 });
  }

  try {
    // First, get the invoice to check its status
    const getUrl = `${ERPNEXT_BASE_URL}/api/resource/Purchase%20Invoice/${invoiceId}`;
    const getResponse = await fetch(getUrl, {
      method: 'GET',
      headers: authHeaders(),
    });

    if (!getResponse.ok) {
      const text = await getResponse.text();
      console.error(`Failed to get invoice ${invoiceId}: ${text}`);
      return NextResponse.json(
        { error: `Failed to get invoice: ${getResponse.status} - ${text}` },
        { status: getResponse.status }
      );
    }

    const invoiceData = await getResponse.json();
    const docstatus = invoiceData?.data?.docstatus;

    // If submitted (docstatus = 1), cancel it first
    if (docstatus === 1) {
      console.log(`Cancelling submitted invoice ${invoiceId}...`);
      const cancelUrl = `${ERPNEXT_BASE_URL}/api/resource/Purchase%20Invoice/${invoiceId}`;
      const cancelResponse = await fetch(cancelUrl, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ docstatus: 2 }), // 2 = Cancelled
      });

      if (!cancelResponse.ok) {
        const cancelText = await cancelResponse.text();
        console.error(`Failed to cancel invoice: ${cancelText}`);
        return NextResponse.json(
          { error: `Failed to cancel invoice: ${cancelResponse.status} - ${cancelText}` },
          { status: cancelResponse.status }
        );
      }
      console.log(`✅ Invoice ${invoiceId} cancelled successfully`);
    }

    // Now delete the invoice
    const deleteUrl = `${ERPNEXT_BASE_URL}/api/resource/Purchase%20Invoice/${invoiceId}`;
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!deleteResponse.ok) {
      const deleteText = await deleteResponse.text();
      console.error(`Failed to delete invoice: ${deleteText}`);
      return NextResponse.json(
        { error: `ERPNext delete failed: ${deleteResponse.status} - ${deleteText}` },
        { status: deleteResponse.status }
      );
    }

    console.log(`✅ Invoice ${invoiceId} deleted successfully`);
    return NextResponse.json({ success: true, message: `Invoice ${invoiceId} deleted successfully` });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Delete operation failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Delete failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
