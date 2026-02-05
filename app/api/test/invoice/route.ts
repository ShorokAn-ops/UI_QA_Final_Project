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
  if (!ERPNEXT_API_KEY || !ERPNEXT_API_SECRET || !ERPNEXT_COMPANY || !ERPNEXT_ITEM_ID) {
    return NextResponse.json(
      { error: 'Missing required ERPNext configuration' },
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

  // Retry logic for nginx 504 timeouts
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const invoiceId = data?.data?.name;
        if (!invoiceId) {
          return NextResponse.json(
            { error: 'ERPNext response missing invoice name' },
            { status: 500 }
          );
        }
        return NextResponse.json({ invoice_id: invoiceId });
      }

      if (response.status === 504 && attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        continue;
      }

      const text = await response.text();
      return NextResponse.json(
        { error: `ERPNext error: ${response.status} - ${text}` },
        { status: response.status }
      );
    } catch (error) {
      if (attempt === 3) {
        return NextResponse.json(
          { error: `Failed after retries: ${error}` },
          { status: 500 }
        );
      }
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

  const url = `${ERPNEXT_BASE_URL}/api/resource/Purchase%20Invoice/${invoiceId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `ERPNext delete failed: ${response.status} - ${text}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Delete failed: ${error}` },
      { status: 500 }
    );
  }
}
