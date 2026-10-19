const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function load(file, globals = {}, imports = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const context = vm.createContext({ module, exports: module.exports, require: name => imports[name] || require(name),
    process: { env: { NEXT_PUBLIC_AN_API: 'https://backend.test', NEXT_PUBLIC_AN_BUSINESS_ID: 'business' } },
    console, Headers, Response, Request, URL, AbortSignal, ...globals });
  vm.runInContext(code, context);
  return module.exports;
}
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

test('private GETs never reuse another identity or a prior account cache', async () => {
  let calls = 0;
  const client = load('lib/an-sdk/client.ts', { window: {}, localStorage: storage(), fetch: async (_, options) => {
    calls++; return Response.json({ identity: options.headers.Authorization });
  } });
  client.setToken('A');
  assert.equal((await client.anGet('/api/auth/me')).identity, 'Bearer A');
  client.setToken('B');
  assert.equal((await client.anGet('/api/auth/me')).identity, 'Bearer B');
  client.setToken(null);
  await client.anGet('/api/orders/list');
  await client.anGet('/api/orders/list');
  assert.equal(calls, 4);
});

test('an old in-flight public response cannot repopulate cache after a mutation', async () => {
  let resolveOld;
  let calls = 0;
  const client = load('lib/an-sdk/client.ts', { window: {}, localStorage: storage(), fetch: async (_, options) => {
    calls++;
    if (calls === 1) return new Promise(resolve => { resolveOld = resolve; });
    return Response.json({ value: calls, method: options.method });
  } });
  const old = client.anGet('/api/products');
  await client.anPost('/api/products', {});
  resolveOld(Response.json({ value: 'old' }));
  await old;
  const fresh = await client.anGet('/api/products');
  assert.equal(fresh.value, 3);
  assert.equal((await client.anGet('/api/products')).value, 3);
  assert.equal(calls, 3);
});

test('invoice generation never forwards privileged writes', async () => {
  let calls = 0;
  const route = load('app/api/invoice/generate/route.ts', { fetch: async () => { calls++; } });
  assert.equal((await route.POST()).status, 403);
  assert.equal(calls, 0);
});

test('invoice lookup requires a customer token before making any upstream call', async () => {
  let calls = 0;
  const route = load('app/api/my-orders/invoices/route.ts', { fetch: async () => { calls++; } });
  assert.equal((await route.POST(new Request('https://native.test/api/my-orders/invoices', { method: 'POST' }))).status, 401);
  assert.equal(calls, 0);
});

test('invoice lookup excludes another owner even if the authenticated user can list staff orders', async () => {
  const ownId = 'a'.repeat(24), otherId = 'b'.repeat(24);
  const route = load('app/api/my-orders/invoices/route.ts', { fetch: async (url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer customer');
    assert.equal(options.headers['x-service-key'], undefined);
    if (url.includes('/auth/me')) return Response.json({ user: { id: 'owner' } });
    return Response.json({ orders: [
      { _id: ownId, userId: 'owner', orderId: 'ORDER-A', invoice: { invoiceNumber: 'INV-A' } },
      { _id: otherId, userId: 'someone-else', orderId: 'ORDER-B', invoice: { invoiceNumber: 'INV-B' } },
    ] });
  } });
  const response = await route.POST(new Request('https://native.test/api/my-orders/invoices', {
    method: 'POST', headers: { Authorization: 'Bearer customer', 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderIds: [ownId, otherId] }),
  }));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.invoices[ownId].url, '/invoice/ORDER-A');
  assert.equal(body.invoices[otherId], undefined);
});

test('shop logout clears its httpOnly cookie locally and rejects cross-origin requests', async () => {
  const route = load('app/api/shop/[...path]/route.ts', { fetch: async () => { throw new Error('Must not forward logout'); } });
  const req = origin => ({ method: 'POST', headers: new Headers({ origin }), nextUrl: { origin: 'https://native.test' } });
  assert.equal((await route.POST(req('https://attacker.test'), { params: { path: ['logout'] } })).status, 403);
  const response = await route.POST(req('https://native.test'), { params: { path: ['logout'] } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /shop_token=;/);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/i);
});

test('vendor application uses verified account identity and required tax fields', async () => {
  let submitted;
  const route = load('lib/an-sdk/vendors.ts', {}, {
    './auth': { getMe: async () => ({ username: 'registered-user', email: 'real@example.test' }) },
    './client': { anPost: async (_, body) => { submitted = body; return { success: true }; } },
  });
  await route.applyAsVendor({ businessName: 'Shop', contactName: 'Owner', email: 'spoof@example.test', phone: '123', gstRegistered: false, panNumber: 'ABCDE1234F' });
  assert.equal(submitted.userId, 'registered-user');
  assert.equal(submitted.email, 'real@example.test');
  assert.equal(submitted.panNumber, 'ABCDE1234F');
  assert.equal(submitted.gstRegistered, false);
});

test('workers provide offline navigation, bypass APIs, and preserve unrelated caches', async () => {
  const sibling = path.resolve(root, '../native-admin');
  for (const project of [root, ...(fs.existsSync(path.join(sibling, 'public/sw.js')) ? [sibling] : [])]) {
    const handlers = {}, deleted = [];
    const offline = new Response('<h1>Offline</h1>');
    const context = vm.createContext({ URL, Response, fetch: async () => { throw new Error('offline'); },
      caches: { match: async () => offline, keys: async () => ['unrelated-cache', 'native-static-v1', 'native-executive-static-v1'], delete: async key => { deleted.push(key); } },
      self: { location: { origin: 'https://native.test' }, addEventListener: (name, fn) => { handlers[name] = fn; }, clients: { claim: async () => {} } },
    });
    vm.runInContext(fs.readFileSync(path.join(project, 'public/sw.js'), 'utf8'), context);
    let pending;
    handlers.fetch({ request: { method: 'GET', mode: 'navigate', url: 'https://native.test/orders' }, respondWith: promise => { pending = promise; } });
    assert.equal(await pending, offline);
    let intercepted = false;
    handlers.fetch({ request: { method: 'GET', url: 'https://native.test/api/orders' }, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false);
    handlers.activate({ waitUntil: promise => { pending = promise; } });
    await pending;
    assert.ok(!deleted.includes('unrelated-cache'));
    assert.equal(deleted.length, 1);
  }
});

test('vendor status handles pending, approved, rejected and absent profiles using the real endpoint', async () => {
  class ApiError extends Error { constructor(status) { super(); this.status = status; } }
  let status = 'APPLIED';
  const sdk = load('lib/an-sdk/vendors.ts', {}, {
    './auth': {}, './client': { ApiError, anGet: async endpoint => {
      assert.equal(endpoint, '/api/vendor/profile');
      if (!status) throw new ApiError(404);
      return { data: { status } };
    } },
  });
  assert.equal((await sdk.getMyVendorStatus()).status, 'pending');
  status = 'APPROVED';
  assert.equal((await sdk.getMyVendorStatus()).status, 'active');
  status = 'REJECTED';
  assert.equal((await sdk.getMyVendorStatus()).status, 'rejected');
  status = null;
  assert.equal(await sdk.getMyVendorStatus(), null);
});
