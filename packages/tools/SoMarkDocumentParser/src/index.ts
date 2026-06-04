import { z } from 'zod';
import { delay } from '../utils/delay';
import { POST } from '../utils/request';

const OutputFormatEnum = z.enum(['json', 'markdown']);
const ImageFormatEnum = z.enum(['url', 'base64', 'none']);
const FormulaFormatEnum = z.enum(['latex', 'mathml', 'ascii']);
const TableFormatEnum = z.enum(['markdown', 'html', 'image']);
const ChemicalStructureFormatEnum = z.enum(['image']);
const DEFAULT_BASE_URL = 'https://somark.tech/api/v1';

export const InputType = z.object({
  baseUrl: z.string(),
  apiKey: z.string().optional().default(''),
  file: z.array(z.string()).min(1, 'file is required'),
  outputFormats: z.array(OutputFormatEnum).min(1).default(['json', 'markdown']),
  imageFormat: ImageFormatEnum.default('url'),
  formulaFormat: FormulaFormatEnum.default('latex'),
  tableFormat: TableFormatEnum.default('html'),
  chemicalStructureFormat: ChemicalStructureFormatEnum.default('image'),
  enableTextCrossPage: z.boolean().default(false),
  enableTableCrossPage: z.boolean().default(false),
  enableTitleLevelRecognition: z.boolean().default(false),
  enableInlineImage: z.boolean().default(false),
  enableTableImage: z.boolean().default(true),
  enableImageUnderstanding: z.boolean().default(true),
  keepHeaderFooter: z.boolean().default(false)
});
export type InputProps = z.infer<typeof InputType>;

export const FileResultType = z.object({
  markdown: z.string().default(''),
  json: z.record(z.string(), z.any()).default({}),
  error: z.string().optional()
});
export type FileResult = z.infer<typeof FileResultType>;

export const OutputType = z.object({
  results: z.array(FileResultType).default([])
});
export type OutputProps = z.infer<typeof OutputType>;

const QPS_LIMIT_CODE = 1124;
const SUBMIT_BUDGET_MS = 10 * 60_000;
const SUBMIT_BACKOFF_BASE_MS = 1_000;
const SUBMIT_BACKOFF_MAX_MS = 10_000;
const SUBMIT_BACKOFF_JITTER_MS = 500;
const POLL_BUDGET_MS = 10 * 60_000;
const POLL_INTERVAL_BASE_MS = 2_000;
const POLL_INTERVAL_MAX_MS = 10_000;
const POLL_INTERVAL_GROWTH = 1.5;

function normalizeFileName(filename: string): string {
  return filename.split(/[\\/]/).at(-1)?.trim() || '';
}

function getFileName(fileUrl: string): string {
  try {
    const url = new URL(fileUrl);
    const filename = url.searchParams.get('filename');
    if (filename) {
      return normalizeFileName(filename) || 'document';
    }

    const name = decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) ?? '');
    return normalizeFileName(name) || 'document';
  } catch {
    return 'document';
  }
}

async function fetchFileBlob(fileUrl: string): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }

  return {
    blob: await response.blob(),
    filename: getFileName(fileUrl)
  };
}

type SubmitResponse = {
  code: number;
  message: string;
  data: {
    task_id?: string;
    status?: string;
  } | null;
};

type CheckResponse = {
  code: number;
  message: string;
  data: {
    record_id?: number;
    task_id?: string;
    status?: string;
    file_name?: string;
    metadata?: object;
    result?: {
      file_name?: string;
      outputs?: { markdown?: string; json?: object };
    };
  } | null;
};

function extractErrorDetail(
  data: SubmitResponse | CheckResponse | null | undefined,
  fallback = 'unknown error'
): string {
  return data?.message || fallback;
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function buildConnectionError(baseUrl: string, endpoint: string): Error {
  const protocol = baseUrl.startsWith('https://') ? 'HTTPS' : 'HTTP';
  const host = baseUrl.replace(/^https?:\/\//, '');
  return new Error(
    `Failed to connect to the SoMark service at ${host}${endpoint} over ${protocol}. Please make sure the service is running and reachable from the plugin runtime`
  );
}

async function submitTask(form: FormData, baseURL: string): Promise<string> {
  const deadline = Date.now() + SUBMIT_BUDGET_MS;
  let attempt = 0;

  while (true) {
    let response;
    try {
      response = await POST<SubmitResponse>('/parse/async', form, {
        baseURL,
        headers: {},
        timeout: 60_000,
        retries: 1
      });
    } catch {
      throw buildConnectionError(baseURL, '/parse/async');
    }

    const { data } = response;
    if (data?.code === 0 && data.data?.task_id) {
      return data.data.task_id;
    }

    if (data?.code === QPS_LIMIT_CODE) {
      const backoff = Math.min(SUBMIT_BACKOFF_BASE_MS * 2 ** attempt, SUBMIT_BACKOFF_MAX_MS);
      const wait = backoff + Math.floor(Math.random() * SUBMIT_BACKOFF_JITTER_MS);

      if (Date.now() + wait > deadline) {
        throw new Error(
          'SoMark service is currently busy (QPS limit). Please retry later or reduce workflow concurrency'
        );
      }

      await delay(wait);
      attempt++;
      continue;
    }

    throw new Error(`SoMark API error: ${extractErrorDetail(data)}`);
  }
}

async function pollTask(
  taskId: string,
  baseURL: string,
  apiKey: string
): Promise<NonNullable<NonNullable<CheckResponse['data']>['result']>['outputs']> {
  const deadline = Date.now() + POLL_BUDGET_MS;
  let interval = POLL_INTERVAL_BASE_MS;

  while (Date.now() < deadline) {
    await delay(interval);

    const form = new FormData();
    form.append('api_key', apiKey);
    form.append('task_id', taskId);

    let response;
    try {
      response = await POST<CheckResponse>('/parse/async_check', form, {
        baseURL,
        headers: {},
        timeout: 30_000,
        retries: 1
      });
    } catch {
      throw buildConnectionError(baseURL, '/parse/async_check');
    }

    const { data } = response;
    if (data?.code !== 0) {
      throw new Error(`SoMark API error: ${extractErrorDetail(data)}`);
    }

    const status = data.data?.status;
    if (status === 'SUCCESS') {
      return data.data?.result?.outputs;
    }
    if (status === 'FAILED') {
      throw new Error(`SoMark task failed: ${extractErrorDetail(data, 'task failed')}`);
    }

    interval = Math.min(Math.floor(interval * POLL_INTERVAL_GROWTH), POLL_INTERVAL_MAX_MS);
  }

  throw new Error(
    `SoMark task ${taskId} timed out after ${POLL_BUDGET_MS / 1000}s while waiting for completion`
  );
}

async function parseOneFile(
  fileUrl: string,
  ctx: {
    baseURL: string;
    apiKey: string;
    outputFormats: InputProps['outputFormats'];
    imageFormat: InputProps['imageFormat'];
    formulaFormat: InputProps['formulaFormat'];
    tableFormat: InputProps['tableFormat'];
    chemicalStructureFormat: InputProps['chemicalStructureFormat'];
    enableTextCrossPage: boolean;
    enableTableCrossPage: boolean;
    enableTitleLevelRecognition: boolean;
    enableInlineImage: boolean;
    enableTableImage: boolean;
    enableImageUnderstanding: boolean;
    keepHeaderFooter: boolean;
  }
): Promise<FileResult> {
  if (!fileUrl) {
    throw new Error('File path is required');
  }

  let fileData: { blob: Blob; filename: string };
  try {
    fileData = await fetchFileBlob(fileUrl);
  } catch {
    throw new Error(
      'Failed to download file. Please ensure the FastGPT file URL is accessible from the plugin service'
    );
  }

  const form = new FormData();
  form.append('file', fileData.blob, fileData.filename);
  form.append('api_key', ctx.apiKey);

  for (const format of ctx.outputFormats) {
    form.append('output_formats', format);
  }

  form.append(
    'element_formats',
    JSON.stringify({
      image: ctx.imageFormat,
      formula: ctx.formulaFormat,
      table: ctx.tableFormat,
      cs: ctx.chemicalStructureFormat
    })
  );
  form.append(
    'feature_config',
    JSON.stringify({
      enable_text_cross_page: ctx.enableTextCrossPage,
      enable_table_cross_page: ctx.enableTableCrossPage,
      enable_title_level_recognition: ctx.enableTitleLevelRecognition,
      enable_inline_image: ctx.enableInlineImage,
      enable_table_image: ctx.enableTableImage,
      enable_image_understanding: ctx.enableImageUnderstanding,
      keep_header_footer: ctx.keepHeaderFooter
    })
  );

  const taskId = await submitTask(form, ctx.baseURL);
  const outputs = await pollTask(taskId, ctx.baseURL, ctx.apiKey);

  if (!outputs) {
    throw new Error('SoMark response has no outputs');
  }

  return {
    markdown: ctx.outputFormats.includes('markdown') ? outputs.markdown ?? '' : '',
    json: ctx.outputFormats.includes('json') ? outputs.json ?? {} : {}
  };
}

export async function tool(props: InputProps): Promise<OutputProps> {
  const {
    apiKey,
    baseUrl,
    file,
    outputFormats,
    imageFormat,
    formulaFormat,
    tableFormat,
    chemicalStructureFormat,
    enableTextCrossPage,
    enableTableCrossPage,
    enableTitleLevelRecognition,
    enableInlineImage,
    enableTableImage,
    enableImageUnderstanding,
    keepHeaderFooter
  } = props;

  let handledBaseUrl = baseUrl.trim();
  if (handledBaseUrl === '') {
    throw new Error('Base URL is required');
  }

  handledBaseUrl = handledBaseUrl.replace(/\/+$/, '');
  if (!handledBaseUrl.startsWith('http://') && !handledBaseUrl.startsWith('https://')) {
    throw new Error('Base URL must start with http:// or https://');
  }

  const handledApiKey = apiKey.trim();
  if (
    handledBaseUrl === DEFAULT_BASE_URL &&
    (handledApiKey.length === 0 || !handledApiKey.startsWith('sk-'))
  ) {
    throw new Error('API Key is invalid, please check the configuration and try again');
  }

  const ctx = {
    baseURL: handledBaseUrl,
    apiKey: handledApiKey,
    outputFormats,
    imageFormat,
    formulaFormat,
    tableFormat,
    chemicalStructureFormat,
    enableTextCrossPage,
    enableTableCrossPage,
    enableTitleLevelRecognition,
    enableInlineImage,
    enableTableImage,
    enableImageUnderstanding,
    keepHeaderFooter
  };

  const results: FileResult[] = [];
  for (const fileUrl of file) {
    try {
      results.push(await parseOneFile(fileUrl, ctx));
    } catch (err) {
      results.push({
        markdown: '',
        json: {},
        error: toErrorMessage(err)
      });
    }
  }

  const failedIndexes = results
    .map((result, index) => (result.error ? index : -1))
    .filter((index) => index >= 0);
  if (failedIndexes.length > 0) {
    const reasons = failedIndexes
      .map((index) => `[${index}] ${results[index]?.error ?? 'unknown error'}`)
      .join('; ');
    throw new Error(
      `${failedIndexes.length} of ${results.length} file(s) failed to parse: ${reasons}`
    );
  }

  return { results };
}
