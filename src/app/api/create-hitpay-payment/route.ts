import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, redirectUrl } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const hitpayApiKey = process.env.HITPAY_API_KEY;
    
    if (!hitpayApiKey) {
      return NextResponse.json({ error: 'HitPay API key is missing' }, { status: 500 });
    }

    const hitpayApiUrl = 'https://api.sandbox.hit-pay.com/v1/payment-requests';

    const params = new URLSearchParams();
    params.append('amount', amount.toString());
    params.append('currency', 'SGD');
    if (redirectUrl) {
      params.append('redirect_url', redirectUrl);
    }

    const response = await fetch(hitpayApiUrl, {
      method: 'POST',
      headers: {
        'X-BUSINESS-API-KEY': hitpayApiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('HitPay Error:', data);
      return NextResponse.json(
        { error: data.message || 'HitPay API Error' },
        { status: response.status }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    console.error('Error creating HitPay payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create HitPay payment' },
      { status: 500 }
    );
  }
}
