import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InputType as CreateRecordInputType,
  tool as createRecordTool,
} from "../children/createRecord/src";
import {
  InputType as ListRecordsInputType,
  tool as listRecordsTool,
} from "../children/listRecords/src";
import {
  InputType as UpdateRecordInputType,
  tool as updateRecordTool,
} from "../children/updateRecord/src";
import {
  AirtableClient,
  buildAirtableUrl,
  createRecord,
  handleAirtableError,
  listRecords,
  parseFieldsInput,
  redactAirtableSecrets,
  updateRecord,
} from "../client";

describe("Airtable toolset", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("exports all tool callbacks", () => {
    expect(typeof listRecordsTool).toBe("function");
    expect(typeof createRecordTool).toBe("function");
    expect(typeof updateRecordTool).toBe("function");
  });

  it("validates child inputs", () => {
    const base = {
      token: "pat_test",
      baseId: "appBase",
      tableIdOrName: "Tasks",
    };

    expect(ListRecordsInputType.safeParse(base).success).toBe(true);
    expect(
      CreateRecordInputType.safeParse({
        ...base,
        fields: { Name: "Ada" },
      }).success,
    ).toBe(true);
    expect(
      UpdateRecordInputType.safeParse({
        ...base,
        recordId: "recRecord",
        fields: { Status: "Done" },
      }).success,
    ).toBe(true);
  });

  it("builds only Airtable API URLs", () => {
    const url = buildAirtableUrl({
      baseId: "appBase",
      tableIdOrName: "Tasks/Table",
      searchParams: new URLSearchParams({ maxRecords: "10" }),
    });

    expect(url).toBe(
      "https://api.airtable.com/v0/appBase/Tasks%2FTable?maxRecords=10",
    );
  });

  it("lists records with bounded query params", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          records: [
            {
              id: "rec1",
              createdTime: "2026-01-01T00:00:00.000Z",
              fields: { Name: "Ada" },
            },
          ],
          offset: "next",
        }),
        { status: 200 },
      ),
    );
    const client = new AirtableClient({
      token: "pat_list",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    await expect(
      listRecords({
        client,
        baseId: "appBase",
        tableIdOrName: "Tasks",
        maxRecords: 200,
        pageSize: 200,
        filterByFormula: "{Status}='Open'",
        view: "Grid",
        sort: [{ field: "Created", direction: "desc" }],
      }),
    ).resolves.toEqual({
      records: [
        {
          id: "rec1",
          createdTime: "2026-01-01T00:00:00.000Z",
          fields: { Name: "Ada" },
        },
      ],
      offset: "next",
      count: 1,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const parsedUrl = new URL(url);

    expect(parsedUrl.origin).toBe("https://api.airtable.com");
    expect(parsedUrl.searchParams.get("maxRecords")).toBe("100");
    expect(parsedUrl.searchParams.get("pageSize")).toBe("100");
    expect(parsedUrl.searchParams.get("filterByFormula")).toBe(
      "{Status}='Open'",
    );
    expect(parsedUrl.searchParams.get("view")).toBe("Grid");
    expect(parsedUrl.searchParams.get("sort[0][field]")).toBe("Created");
    expect(parsedUrl.searchParams.get("sort[0][direction]")).toBe("desc");
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer pat_list",
    });
  });

  it("creates one record with typecast", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          records: [
            {
              id: "recCreated",
              fields: { Name: "Ada" },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const client = new AirtableClient({
      token: "pat_create",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    await expect(
      createRecord({
        client,
        baseId: "appBase",
        tableIdOrName: "Tasks",
        fields: { Name: "Ada" },
        typecast: true,
      }),
    ).resolves.toEqual({
      record: {
        id: "recCreated",
        fields: { Name: "Ada" },
      },
      success: true,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      records: [{ fields: { Name: "Ada" } }],
      typecast: true,
    });
  });

  it("updates one record with parsed JSON fields", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          records: [
            {
              id: "recUpdated",
              fields: { Status: "Done" },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const client = new AirtableClient({
      token: "pat_update",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    await expect(
      updateRecord({
        client,
        baseId: "appBase",
        tableIdOrName: "Tasks",
        recordId: "recUpdated",
        fields: '{"Status":"Done"}',
      }),
    ).resolves.toEqual({
      record: {
        id: "recUpdated",
        fields: { Status: "Done" },
      },
      success: true,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      records: [{ id: "recUpdated", fields: { Status: "Done" } }],
      typecast: false,
    });
  });

  it("returns readable Airtable error summaries without leaking tokens", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: {
            type: "INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND",
            message: "Cannot access token pat_secret_token",
          },
        }),
        {
          status: 403,
          statusText: "Forbidden",
        },
      ),
    );
    const client = new AirtableClient({
      token: "pat_secret_token",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    await expect(
      listRecords({
        client,
        baseId: "appBase",
        tableIdOrName: "Tasks",
      }),
    ).rejects.toThrow(
      "Airtable API error (403, INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND): Cannot access token [REDACTED]",
    );
  });

  it("redacts Authorization bearer tokens and PATs from errors", () => {
    const message =
      "failed Authorization: Bearer pat_secret_token and pat_another_secret";

    expect(redactAirtableSecrets(message)).toBe(
      "failed Authorization: Bearer [REDACTED] and [REDACTED]",
    );
    expect(handleAirtableError(new Error(message))).toBe(
      "failed Authorization: Bearer [REDACTED] and [REDACTED]",
    );
  });

  it("enforces field object limits", () => {
    expect(parseFieldsInput({ Name: "Ada" })).toEqual({ Name: "Ada" });
    expect(parseFieldsInput('{"Name":"Ada"}')).toEqual({ Name: "Ada" });
    expect(() => parseFieldsInput({})).toThrow("fields cannot be empty");
    expect(() => parseFieldsInput("[]")).toThrow(
      "fields must be a JSON object",
    );
  });
});
