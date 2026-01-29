
const testTracking = async () => {
    try {
        console.log('Testing /api/track endpoint...');
        const response = await fetch('http://localhost:3001/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 1, // Changed to integer to match DB schema
                events: [{
                    action_type: 'page_view',
                    page_url: '/test-verification',
                    timestamp: new Date().toISOString(),
                    meta_data: { source: 'verification_script' }
                }]
            })
        });

        const data = await response.json();
        console.log('Response:', data);

        if (data.success) {
            console.log('✅ Tracking endpoint is working!');
        } else {
            console.error('❌ Tracking endpoint failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Error testing endpoint:', error);
    }
};

testTracking();
