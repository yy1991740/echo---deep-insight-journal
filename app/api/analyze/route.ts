import { NextResponse } from 'next/server';

const BASE_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, model, temperature } = body;

    // Access the API Key from server-side environment variables
    const apiKey = process.env.DOUBAO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: DOUBAO_API_KEY is missing." },
        { status: 500 }
      );
    }

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model, // This should be the Endpoint ID
        messages: messages,
        temperature: temperature || 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Doubao API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `API call failed: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
