import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { tool, type InputProps } from '../src';
import { POST, type RequestResponse } from '../utils/request';

vi.mock('../utils/request', () => ({
  POST: vi.fn()
}));

vi.mock('../utils/delay', () => ({
  delay: vi.fn(() => Promise.resolve())
}));

const mockedPOST = vi.mocked(POST);
const fetchMock = vi.fn();

const DEFAULT_BASE_URL = 'https://somark.tech/api/v1';
const SELF_HOST_BASE_URL = 'https://somark.internal/api/v1';
const SAMPLE_FILE_URL = 'https://example.test/sample.pdf';
const QPS_LIMIT_CODE = 1124;

function mockResponse(data: unknown): RequestResponse<unknown> {
  return {
    data,
    status: 200,
    headers: new Headers()
  };
}

function createInput(overrides: Partial<InputProps> = {}): InputProps {
  return {
    apiKey: 'sk-test-api-key',
    baseUrl: DEFAULT_BASE_URL,
    file: [SAMPLE_FILE_URL],
    outputFormats: ['json', 'markdown'],
    imageFormat: 'url',
    formulaFormat: 'latex',
    tableFormat: 'html',
    chemicalStructureFormat: 'image',
    enableTextCrossPage: false,
    enableTableCrossPage: false,
    enableTitleLevelRecognition: false,
    enableInlineImage: true,
    enableTableImage: true,
    enableImageUnderstanding: true,
    keepHeaderFooter: false,
    ...overrides
  };
}

function mockFetchOk(body = 'file-content') {
  fetchMock.mockResolvedValueOnce(
    new Response(body, {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/pdf' }
    })
  );
}

function mockFetchNotFound() {
  fetchMock.mockResolvedValueOnce(
    new Response('missing', { status: 404, statusText: 'Not Found' })
  );
}

function mockSubmitSuccess(taskId = 'task-123') {
  mockedPOST.mockResolvedValueOnce(
    mockResponse({ code: 0, message: 'ok', data: { task_id: taskId } })
  );
}

function mockSubmitError(code: number, message: string) {
  mockedPOST.mockResolvedValueOnce(mockResponse({ code, message, data: null }));
}

function mockCheckSuccess(outputs: { markdown?: string; json?: Record<string, unknown> } = {}) {
  mockedPOST.mockResolvedValueOnce(
    mockResponse({
      code: 0,
      message: 'ok',
      data: { status: 'SUCCESS', result: { outputs } }
    })
  );
}

function mockCheckStatus(status: 'QUEUING' | 'PROCESSING' | 'FAILED', message = 'ok') {
  mockedPOST.mockResolvedValueOnce(mockResponse({ code: 0, message, data: { status } }));
}

function mockHappyFile(outputs: { markdown?: string; json?: Record<string, unknown> } = {}) {
  mockFetchOk();
  mockSubmitSuccess();
  mockCheckSuccess(outputs);
}

function nthSubmitForm(n: number): FormData {
  return mockedPOST.mock.calls[(n - 1) * 2]?.[1] as FormData;
}

function formEntries(form: FormData): Record<string, unknown[]> {
  const entries: Record<string, unknown[]> = {};
  for (const [key, value] of form.entries()) {
    entries[key] ??= [];
    entries[key].push(value);
  }
  return entries;
}

describe('SoMarkDocumentParser tool', () => {
  beforeEach(() => {
    mockedPOST.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('submits to SoMark async API, polls result, and maps outputs', async () => {
    mockFetchOk();
    mockSubmitSuccess('task-abc');
    mockCheckSuccess({ markdown: '# Parsed', json: { pages: 1 } });

    const result = await tool(
      createInput({
        enableTextCrossPage: true,
        enableTableCrossPage: true,
        enableTitleLevelRecognition: true,
        enableInlineImage: false,
        enableTableImage: false,
        enableImageUnderstanding: false,
        keepHeaderFooter: true
      })
    );

    expect(result).toEqual({ results: [{ markdown: '# Parsed', json: { pages: 1 } }] });
    expect(mockedPOST).toHaveBeenNthCalledWith(1, '/parse/async', expect.any(FormData), {
      baseURL: DEFAULT_BASE_URL,
      headers: {},
      timeout: 60_000,
      retries: 1
    });
    expect(mockedPOST).toHaveBeenNthCalledWith(2, '/parse/async_check', expect.any(FormData), {
      baseURL: DEFAULT_BASE_URL,
      headers: {},
      timeout: 30_000,
      retries: 1
    });

    const submit = formEntries(nthSubmitForm(1));
    expect(fetchMock).toHaveBeenCalledWith(SAMPLE_FILE_URL);
    expect((submit.file[0] as File).name).toBe('sample.pdf');
    expect(submit.api_key).toEqual(['sk-test-api-key']);
    expect(submit.output_formats).toEqual(['json', 'markdown']);
    expect(JSON.parse(submit.element_formats[0] as string)).toEqual({
      image: 'url',
      formula: 'latex',
      table: 'html',
      cs: 'image'
    });
    expect(JSON.parse(submit.feature_config[0] as string)).toEqual({
      enable_text_cross_page: true,
      enable_table_cross_page: true,
      enable_title_level_recognition: true,
      enable_inline_image: false,
      enable_table_image: false,
      enable_image_understanding: false,
      keep_header_footer: true
    });

    const check = mockedPOST.mock.calls[1]?.[1] as FormData;
    expect(check.get('task_id')).toBe('task-abc');
    expect(check.get('api_key')).toBe('sk-test-api-key');
  });

  test('accepts self-host base URL and empty API key', async () => {
    mockHappyFile({ markdown: 'ok', json: {} });

    await tool(createInput({ baseUrl: SELF_HOST_BASE_URL, apiKey: '' }));

    expect(mockedPOST).toHaveBeenNthCalledWith(
      1,
      '/parse/async',
      expect.any(FormData),
      expect.objectContaining({ baseURL: SELF_HOST_BASE_URL })
    );
    expect(formEntries(nthSubmitForm(1)).api_key).toEqual(['']);
  });

  test('validates baseUrl and public SoMark API key before external calls', async () => {
    await expect(tool(createInput({ baseUrl: '' }))).rejects.toThrow('Base URL is required');
    await expect(tool(createInput({ baseUrl: 'somark.tech/api/v1' }))).rejects.toThrow(
      'Base URL must start with http:// or https://'
    );
    await expect(tool(createInput({ apiKey: 'plain-token' }))).rejects.toThrow(
      /API Key is invalid/
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockedPOST).not.toHaveBeenCalled();
  });

  test('uses filename query before URL path basename', async () => {
    mockHappyFile();

    await tool(
      createInput({
        file: [
          'http://localhost:3001/api/system/file/download/token?filename=%E4%B8%AA%E4%BA%BA%E7%9F%A5%E8%AF%86%E5%BA%93.pdf'
        ]
      })
    );

    expect((formEntries(nthSubmitForm(1)).file[0] as File).name).toBe('个人知识库.pdf');
  });

  test('maps selected output formats', async () => {
    mockHappyFile({ markdown: 'ignored', json: { kept: true } });
    await expect(tool(createInput({ outputFormats: ['json'] }))).resolves.toEqual({
      results: [{ markdown: '', json: { kept: true } }]
    });

    mockedPOST.mockReset();
    fetchMock.mockReset();
    mockHappyFile({ markdown: 'kept', json: { ignored: true } });
    await expect(tool(createInput({ outputFormats: ['markdown'] }))).resolves.toEqual({
      results: [{ markdown: 'kept', json: {} }]
    });
  });

  test(`retries submit when SoMark returns QPS limit code ${QPS_LIMIT_CODE}`, async () => {
    mockFetchOk();
    mockSubmitError(QPS_LIMIT_CODE, 'qps limit');
    mockSubmitSuccess('task-retry');
    mockCheckSuccess({ markdown: 'after-retry', json: {} });

    const result = await tool(createInput());

    expect(result.results[0]?.markdown).toBe('after-retry');
    expect(mockedPOST.mock.calls.map((call) => call[0])).toEqual([
      '/parse/async',
      '/parse/async',
      '/parse/async_check'
    ]);
  });

  test('polls pending task statuses until success', async () => {
    mockFetchOk();
    mockSubmitSuccess();
    mockCheckStatus('QUEUING');
    mockCheckStatus('PROCESSING');
    mockCheckSuccess({ markdown: 'eventually', json: {} });

    const result = await tool(createInput());

    expect(result.results[0]?.markdown).toBe('eventually');
    expect(mockedPOST).toHaveBeenCalledTimes(4);
  });

  test('continues all files and throws aggregated errors when any file fails', async () => {
    mockHappyFile({ markdown: 'A', json: {} });
    mockFetchNotFound();
    mockHappyFile({ markdown: 'C', json: {} });

    await expect(
      tool(
        createInput({
          file: [
            'https://example.test/a.pdf',
            'https://example.test/missing.pdf',
            'https://example.test/c.pdf'
          ]
        })
      )
    ).rejects.toThrow(/1 of 3 file\(s\) failed to parse: \[1\] .*Failed to download file/);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(mockedPOST).toHaveBeenCalledTimes(4);
  });

  test('wraps SoMark and polling failures with useful messages', async () => {
    mockFetchOk();
    mockSubmitError(400, 'request failed');
    await expect(tool(createInput())).rejects.toThrow(/SoMark API error: request failed/);

    mockedPOST.mockReset();
    fetchMock.mockReset();
    mockFetchOk();
    mockSubmitSuccess();
    mockCheckStatus('FAILED', 'parse error');
    await expect(tool(createInput())).rejects.toThrow(/SoMark task failed: parse error/);
  });
});
