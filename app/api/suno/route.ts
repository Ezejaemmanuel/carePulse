import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 SUNO API ROUTE: Function started');
  console.log('🔥 SUNO API ROUTE: Request method:', request.method);
  console.log('🔥 SUNO API ROUTE: Request headers:', Object.fromEntries(request.headers.entries()));

  try {
    console.log('🔥 SUNO API ROUTE: Parsing request body...');
    const {
      prompt,
      customMode = false,
      instrumental = false,
      model = 'V4_5ALL',
      callBackUrl,
      style,
      title
    } = await request.json();
    console.log('🔥 SUNO API ROUTE: Request body parsed successfully');
    console.log('🔥 SUNO API ROUTE: Parameters received:', {
      prompt,
      customMode,
      instrumental,
      model,
      callBackUrl,
      style,
      title
    });

    if (!prompt) {
      console.log('❌ SUNO API ROUTE: No prompt provided, returning 400 error');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('✅ SUNO API ROUTE: Prompt validation passed');
    console.log('🔥 SUNO API ROUTE: Preparing to call Suno API...');

    // Check if API key exists
    const apiKey = process.env.SUNO_API_KEY;
    console.log('🔥 SUNO API ROUTE: API key exists:', !!apiKey);
    if (!apiKey) {
      console.log('❌ SUNO API ROUTE: No API key found in environment variables');
    }

    // Prepare request payload according to Suno API docs
    const requestPayload: any = {
      prompt: prompt,
      customMode: customMode,
      instrumental: instrumental,
      model: model,
    };

    // Add optional parameters
    if (callBackUrl) {
      requestPayload.callBackUrl = callBackUrl;
    }
    if (customMode && style) {
      requestPayload.style = style;
    }
    if (customMode && title) {
      requestPayload.title = title;
    }

    console.log('🔥 SUNO API ROUTE: Final request payload:', requestPayload);

    // Call Suno API to generate music
    console.log('🚀 SUNO API ROUTE: Making API call to Suno...');
    const response = await fetch('https://api.sunoapi.org/api/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUNO_API_KEY}`,
      },
      body: JSON.stringify(requestPayload),
    });

    console.log('🔥 SUNO API ROUTE: Suno API response received');
    console.log('🔥 SUNO API ROUTE: Response status:', response.status);
    console.log('🔥 SUNO API ROUTE: Response status text:', response.statusText);
    console.log('🔥 SUNO API ROUTE: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log('❌ SUNO API ROUTE: Suno API returned error status');
      const errorData = await response.json();
      console.log('❌ SUNO API ROUTE: Suno API error data:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate music', details: errorData },
        { status: response.status }
      );
    }

    console.log('✅ SUNO API ROUTE: Suno API call successful, parsing response...');
    const data = await response.json();
    console.log('✅ SUNO API ROUTE: Suno API response data:', data);
    console.log('🔥 SUNO API ROUTE: Response data keys:', Object.keys(data));

    // Check if response follows expected format
    if (data.code !== 200) {
      console.log('❌ SUNO API ROUTE: Suno API returned error code:', data.code);
      return NextResponse.json(
        { error: data.msg || 'API returned error', details: data },
        { status: 400 }
      );
    }

    const responsePayload = {
      success: true,
      taskId: data.data.taskId,
      status: 'GENERATING',
      message: 'Music generation started. Use the taskId to check status.'
    };
    console.log('🔥 SUNO API ROUTE: Preparing response payload:', responsePayload);

    console.log('🎉 SUNO API ROUTE: Returning successful response');
    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('💥 SUNO API ROUTE: Error caught in try-catch block');
    console.error('💥 SUNO API ROUTE: Error details:', error);
    console.error('💥 SUNO API ROUTE: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 SUNO API ROUTE: Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    console.log('❌ SUNO API ROUTE: Returning 500 error response');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// New endpoint to check task status
export async function GET(request: NextRequest) {
  console.log('🔥 SUNO API ROUTE (STATUS): Function started');
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId') || searchParams.get('taskid');

  console.log('🔥 SUNO API ROUTE (STATUS): Task ID received:', taskId);

  if (!taskId) {
    console.log('❌ SUNO API ROUTE (STATUS): No taskId provided');
    return NextResponse.json(
      { error: 'taskId is required' },
      { status: 400 }
    );
  }

  try {
    console.log('🚀 SUNO API ROUTE (STATUS): Checking task status...');
    const response = await fetch(`https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUNO_API_KEY}`,
      },
    });

    console.log('🔥 SUNO API ROUTE (STATUS): Status check response received');
    console.log('🔥 SUNO API ROUTE (STATUS): Response status:', response.status);

    if (!response.ok) {
      console.log('❌ SUNO API ROUTE (STATUS): Status check failed');
      const errorData = await response.json();
      console.log('❌ SUNO API ROUTE (STATUS): Error data:', errorData);
      return NextResponse.json(
        { error: 'Failed to check status', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ SUNO API ROUTE (STATUS): Status data:', data);

    if (data.code !== 200) {
      console.log('❌ SUNO API ROUTE (STATUS): API returned error code:', data.code);
      return NextResponse.json(
        { error: data.msg || 'Status check failed', details: data },
        { status: 400 }
      );
    }

    const statusResponse = {
      success: true,
      taskId: data.data.taskId,
      status: data.data.status,
      response: data.data.response,
      message: data.data.status === 'TEXT_SUCCESS' ? 'Generation completed!' :
               data.data.status === 'SUCCESS' ? 'Generation completed!' :
               data.data.status === 'GENERATING' ? 'Still generating...' :
               data.data.status === 'FAILED' ? 'Generation failed' : 'Unknown status'
    };

    console.log('📊 Final status response structure:', {
      status: data.data.status,
      hasResponse: !!data.data.response,
      responseKeys: data.data.response ? Object.keys(data.data.response) : null,
      hasSunoData: data.data.response?.sunoData ? true : false,
      hasData: data.data.response?.data ? true : false
    });

    console.log('🎉 SUNO API ROUTE (STATUS): Returning status response');
    return NextResponse.json(statusResponse);

  } catch (error) {
    console.error('💥 SUNO API ROUTE (STATUS): Error caught');
    console.error('💥 SUNO API ROUTE (STATUS): Error details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}