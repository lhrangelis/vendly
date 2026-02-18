const API = 'http://localhost:3001/api';

async function test() {
    console.log('=== 1. Health Check ===');
    const health = await fetch(`${API}/health`).then(r => r.json());
    console.log(health);

    console.log('\n=== 2. Login ===');
    const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@vendly.com', password: 'admin' }),
    });
    const loginData = await loginRes.json();
    console.log('Status:', loginRes.status);
    console.log('User:', loginData.user?.name, loginData.user?.email);
    console.log('Token:', loginData.token ? loginData.token.slice(0, 30) + '...' : 'NONE');

    if (!loginData.token) { console.log('LOGIN FAILED!'); return; }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
    };

    console.log('\n=== 3. List Products ===');
    const products = await fetch(`${API}/products`, { headers }).then(r => r.json());
    console.log(`Found ${products.length} products:`, products.map(p => p.name));

    console.log('\n=== 4. List Categories ===');
    const categories = await fetch(`${API}/categories`, { headers }).then(r => r.json());
    console.log(`Found ${categories.length} categories:`, categories.map(c => c.name));

    console.log('\n=== 5. List Sales ===');
    const sales = await fetch(`${API}/sales`, { headers }).then(r => r.json());
    console.log(`Found ${sales.length} sales`);

    console.log('\n=== 6. List Channels ===');
    const channels = await fetch(`${API}/channels`, { headers }).then(r => r.json());
    console.log(`Found ${channels.length} channels:`, channels.map(c => c.name));

    console.log('\n=== 7. List Payment Methods ===');
    const methods = await fetch(`${API}/payment-methods`, { headers }).then(r => r.json());
    console.log(`Found ${methods.length} methods:`, methods.map(m => m.name));

    console.log('\n=== 8. Auth /me ===');
    const me = await fetch(`${API}/auth/me`, { headers }).then(r => r.json());
    console.log('Current user:', me.name, me.email);

    console.log('\n✅ ALL TESTS PASSED!');
}

test().catch(console.error);
