import { beforeEach, describe, expect, it, vi } from "vitest";
import { tool as enrichCompany } from "../children/enrichCompany";
import { tool as enrichProfile } from "../children/enrichProfile";
import { tool as reasoning } from "../children/reasoningSearch";
import { tool as searchCompany } from "../children/searchCompany";
import { tool as searchPeople } from "../children/searchPeople";
import { tool as typeahead } from "../children/typeahead";
import * as clientModule from "../client";

const mockPost = (data: unknown) => {
  const post = vi.fn().mockResolvedValue({ data });
  vi.spyOn(clientModule, "createDataForB2BClient").mockReturnValue({
    post,
  } as any);
  return post;
};
const mockGet = (data: unknown) => {
  const get = vi.fn().mockResolvedValue({ data });
  vi.spyOn(clientModule, "createDataForB2BClient").mockReturnValue({
    get,
  } as any);
  return get;
};

describe("DataForB2B toolset", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("searchPeople builds filters and maps results", async () => {
    const post = mockPost({
      total: 2,
      count: 1,
      results: [{ first_name: "Jane" }],
    });
    const out = await searchPeople({
      apiKey: "k",
      match: "and",
      filter_1_column: "current_title",
      filter_1_operator: "like",
      filter_1_value: "growth",
      count: 25,
      offset: 0,
      enrich_live: false,
    } as any);
    expect(post).toHaveBeenCalledWith(
      "/search/people",
      expect.objectContaining({ count: 25 }),
    );
    expect(out.total).toBe(2);
    expect(out.results).toHaveLength(1);
  });

  it("searchPeople rejects without any filter", async () => {
    await expect(
      searchPeople({
        apiKey: "k",
        match: "and",
        count: 25,
        offset: 0,
        enrich_live: false,
      } as any),
    ).rejects.toBeTruthy();
  });

  it("searchCompany hits /search/companies", async () => {
    const post = mockPost({
      total: 5,
      count: 2,
      results: [{ name: "Acme" }, { name: "Globex" }],
    });
    const out = await searchCompany({
      apiKey: "k",
      match: "and",
      filter_1_column: "industry",
      filter_1_operator: "like",
      filter_1_value: "software",
      count: 25,
      offset: 0,
      enrich_live: false,
    } as any);
    expect(post).toHaveBeenCalledWith("/search/companies", expect.any(Object));
    expect(out.results).toHaveLength(2);
  });

  it("reasoning sends a query and maps results", async () => {
    const post = mockPost({
      status: "ok",
      total: 3,
      results: [{ first_name: "Jane" }],
    });
    const out = await reasoning({
      apiKey: "k",
      query: "growth leaders in Germany",
      category: "people",
      max_results: 25,
      enrich_live: false,
    } as any);
    expect(post).toHaveBeenCalledWith(
      "/search/reasoning",
      expect.objectContaining({ category: "people" }),
    );
    expect(out.total).toBe(3);
  });

  it("reasoning surfaces a needs_input turn", async () => {
    mockPost({
      status: "needs_input",
      session_id: "s1",
      questions: [{ id: "q1", text: "Where?" }],
    });
    const out = await reasoning({
      apiKey: "k",
      query: "growth leaders",
      category: "people",
      max_results: 25,
      enrich_live: false,
    } as any);
    expect(out.status).toBe("needs_input");
    expect(out.session_id).toBe("s1");
    expect(out.questions).toHaveLength(1);
  });

  it("reasoning rejects without query or session", async () => {
    await expect(
      reasoning({
        apiKey: "k",
        category: "people",
        max_results: 25,
        enrich_live: false,
      } as any),
    ).rejects.toBeTruthy();
  });

  it("typeahead resolves values and clamps the limit", async () => {
    const get = mockGet({
      results: [
        { value: "Computer Software" },
        { value: "Software Development" },
      ],
    });
    const out = await typeahead({
      apiKey: "k",
      type: "people_industry",
      q: "soft",
      limit: 999,
    } as any);
    expect(get).toHaveBeenCalledWith(
      "/typeahead",
      expect.objectContaining({
        params: expect.objectContaining({ limit: 20 }),
      }),
    );
    expect(out.values).toEqual(["Computer Software", "Software Development"]);
  });

  it("enrichProfile sends identifier + flags", async () => {
    const post = mockPost({
      full_name: "Jane Doe",
      work_email: "jane@acme.com",
    });
    const out = await enrichProfile({
      apiKey: "k",
      profile_identifier: "jane-doe",
      enrich_profile: true,
      enrich_work_email: true,
      enrich_personal_email: false,
      enrich_phone: false,
      enrich_github: false,
    } as any);
    expect(post).toHaveBeenCalledWith(
      "/enrich/profile",
      expect.objectContaining({
        profile_identifier: "jane-doe",
        enrich_work_email: true,
      }),
    );
    expect(out.result).toMatchObject({ work_email: "jane@acme.com" });
  });

  it("enrichProfile defaults to full profile when no flag set", async () => {
    const post = mockPost({});
    await enrichProfile({
      apiKey: "k",
      profile_identifier: "jane-doe",
      enrich_profile: false,
      enrich_work_email: false,
      enrich_personal_email: false,
      enrich_phone: false,
      enrich_github: false,
    } as any);
    expect(post).toHaveBeenCalledWith(
      "/enrich/profile",
      expect.objectContaining({ enrich_profile: true }),
    );
  });

  it("enrichCompany sends identifier", async () => {
    const post = mockPost({ name: "Google" });
    const out = await enrichCompany({
      apiKey: "k",
      company_identifier: "google",
    } as any);
    expect(post).toHaveBeenCalledWith("/enrich/company", {
      company_identifier: "google",
    });
    expect(out.result).toMatchObject({ name: "Google" });
  });
});
