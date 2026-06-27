import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as enrichCompanyInput,
  OutputType as enrichCompanyOutput,
  tool as enrichCompanyTool,
} from "./children/enrichCompany";
import {
  InputType as enrichProfileInput,
  OutputType as enrichProfileOutput,
  tool as enrichProfileTool,
} from "./children/enrichProfile";
import {
  InputType as reasoningInput,
  OutputType as reasoningOutput,
  tool as reasoningTool,
} from "./children/reasoningSearch";
import {
  InputType as searchCompanyInput,
  OutputType as searchCompanyOutput,
  tool as searchCompanyTool,
} from "./children/searchCompany";
import {
  InputType as searchPeopleInput,
  OutputType as searchPeopleOutput,
  tool as searchPeopleTool,
} from "./children/searchPeople";
import {
  InputType as typeaheadInput,
  OutputType as typeaheadOutput,
  tool as typeaheadTool,
} from "./children/typeahead";

/* -------------------------------------------------------------------------- */
/*  Shared secret                                                             */
/* -------------------------------------------------------------------------- */

const secretSchema = z.object({
  apiKey: z.string().min(1).meta({
    title: "DataForB2B API Key",
    description:
      "Get your API key from app.dataforb2b.ai (Settings > API Keys).",
    isSecret: true,
  }),
});

/* -------------------------------------------------------------------------- */
/*  Shared filter-slot fields for the two search tools                        */
/* -------------------------------------------------------------------------- */

const OPERATOR = z
  .enum([
    "=",
    "!=",
    "like",
    "not_like",
    "in",
    "not_in",
    ">",
    ">=",
    "<",
    "<=",
    "between",
  ])
  .optional();

const slotFields = (i: number, columnHint: string) => ({
  [`filter_${i}_column`]: z
    .string()
    .optional()
    .meta({
      title: `Filter ${i} — column`,
      description: columnHint,
      toolDescription: `Column name for filter slot ${i}`,
    }),
  [`filter_${i}_operator`]: OPERATOR.meta({
    title: `Filter ${i} — operator`,
    description:
      'Comparison operator. Use "in" for a comma-separated list, "between" for "min,max".',
  }),
  [`filter_${i}_value`]: z
    .string()
    .optional()
    .meta({
      title: `Filter ${i} — value`,
      description:
        'Value to match. For "in"/"not_in" use a comma-separated list; for "between" use "min,max".',
      toolDescription: `Value for filter slot ${i}`,
    }),
});

const searchCommonFields = (columnHint: string) => ({
  match: z.enum(["and", "or"]).optional().meta({
    title: "Match",
    description: "Combine the filter slots with AND (all) or OR (any).",
  }),
  ...slotFields(1, columnHint),
  ...slotFields(2, columnHint),
  ...slotFields(3, columnHint),
  ...slotFields(4, columnHint),
  ...slotFields(5, columnHint),
  advanced_filters: z.string().optional().meta({
    title: "Advanced filters (JSON)",
    description:
      'Optional raw filter group as JSON, e.g. {"op":"or","conditions":[{"column":"current_title","type":"like","value":"growth"}]}. Merged (AND) with the slots above.',
  }),
  count: z.number().optional().meta({
    title: "Count",
    description: "Number of results to return (1-100).",
  }),
  offset: z.number().optional().meta({
    title: "Offset",
    description: "Pagination offset (0, 25, 50, …).",
  }),
  enrich_live: z.boolean().optional().meta({
    title: "Enrich live",
    description: "Fetch fresh live data (uses more credits). Off by default.",
  }),
});

const searchOutputFields = (entity: string) => ({
  total: z.number().meta({
    title: "Total",
    description: `Total number of matching ${entity}.`,
  }),
  count: z.number().meta({
    title: "Count",
    description: `Number of ${entity} returned in this page.`,
  }),
  results: z
    .array(z.record(z.string(), z.unknown()))
    .meta({ title: "Results", description: `Array of matching ${entity}.` }),
});

const PEOPLE_COLUMN_HINT =
  "People filter column. Examples: current_title, current_company, current_company_size, " +
  "current_company_industry, current_company_funding_stage, current_company_investor, " +
  "profile_country (ISO-2, e.g. GB), profile_industry, skill, school, degree_level, language, " +
  "years_of_experience, keyword (full-text headline). See docs.dataforb2b.ai for the full list.";

const COMPANY_COLUMN_HINT =
  "Company filter column. Examples: name, domain, industry, category, employee_count, " +
  "country_iso_code (ISO-2), city, region, founded_year, company_type, funding_stage_normalized, " +
  "last_funding_amount_usd, last_funding_date, employee_growth_12m, has_funding, " +
  "keyword (full-text company search). See docs.dataforb2b.ai for the full list.";

/* -------------------------------------------------------------------------- */
/*  Handlers (bridge the user-facing schema to the child logic)               */
/* -------------------------------------------------------------------------- */

const searchPeopleHandler = createToolHandler({
  inputSchema: z.object(searchCommonFields(PEOPLE_COLUMN_HINT)),
  outputSchema: z.object(searchOutputFields("people")),
  secretSchema,
  handler: async (input, ctx) => {
    const parsed = await searchPeopleInput.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    return searchPeopleOutput.parseAsync(await searchPeopleTool(parsed));
  },
});

const searchCompanyHandler = createToolHandler({
  inputSchema: z.object(searchCommonFields(COMPANY_COLUMN_HINT)),
  outputSchema: z.object(searchOutputFields("companies")),
  secretSchema,
  handler: async (input, ctx) => {
    const parsed = await searchCompanyInput.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    return searchCompanyOutput.parseAsync(await searchCompanyTool(parsed));
  },
});

const reasoningHandler = createToolHandler({
  inputSchema: z.object({
    query: z.string().optional().meta({
      title: "Query",
      description:
        "Natural-language description of who you want to find (required on the first call).",
      toolDescription:
        "Plain-English description of the target people or companies",
    }),
    category: z.enum(["people", "companies"]).optional().meta({
      title: "Category",
      description: "Search people or companies.",
    }),
    session_id: z.string().optional().meta({
      title: "Session ID",
      description:
        'Returned by a previous "needs_input" turn; provide it with answers to resolve clarifications.',
    }),
    answers: z.string().optional().meta({
      title: "Answers (JSON)",
      description:
        'Answers to a "needs_input" turn as JSON, e.g. {"q1":"Germany","q2":"Series B"}.',
    }),
    max_results: z.number().optional().meta({
      title: "Max results",
      description: "Number of results to return (1-100).",
    }),
    enrich_live: z.boolean().optional().meta({
      title: "Enrich live",
      description: "Fetch fresh live data (uses more credits). Off by default.",
    }),
  }),
  outputSchema: z.object({
    status: z.string().optional().meta({ title: "Status" }),
    session_id: z.string().optional().meta({ title: "Session ID" }),
    questions: z
      .array(z.record(z.string(), z.unknown()))
      .meta({ title: "Clarifying questions" }),
    total: z.number().meta({ title: "Total" }),
    results: z
      .array(z.record(z.string(), z.unknown()))
      .meta({ title: "Results" }),
  }),
  secretSchema,
  handler: async (input, ctx) => {
    const parsed = await reasoningInput.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    return reasoningOutput.parseAsync(await reasoningTool(parsed));
  },
});

const typeaheadHandler = createToolHandler({
  inputSchema: z.object({
    type: z
      .enum([
        "company",
        "people_industry",
        "company_industry",
        "category",
        "location",
        "city",
        "region",
        "school",
        "title",
        "skill",
        "investor",
      ])
      .meta({
        title: "Type",
        description: "Which kind of value to resolve.",
        toolDescription: "The category of value to autocomplete",
      }),
    q: z.string().min(1).meta({
      title: "Query",
      description: "Free-text term to autocomplete (1-100 characters).",
      toolDescription: "Term to resolve into a stored filter value",
    }),
    limit: z.number().optional().meta({
      title: "Limit",
      description: "Maximum number of suggestions (1-20).",
    }),
  }),
  outputSchema: z.object({
    values: z
      .array(z.string())
      .meta({ title: "Values", description: "Resolved stored values." }),
    results: z
      .array(z.record(z.string(), z.unknown()))
      .meta({ title: "Results" }),
  }),
  secretSchema,
  handler: async (input, ctx) => {
    const parsed = await typeaheadInput.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    return typeaheadOutput.parseAsync(await typeaheadTool(parsed));
  },
});

const enrichProfileHandler = createToolHandler({
  inputSchema: z.object({
    profile_identifier: z.string().min(1).meta({
      title: "Profile identifier",
      description:
        'Profile URL (LinkedIn supported), public id (e.g. "john-doe"), or encoded prof_… id (recommended).',
      toolDescription:
        "Profile URL / public id / prof_ id of the person to enrich",
    }),
    enrich_profile: z.boolean().optional().meta({
      title: "Full profile",
      description: "Return the full professional profile.",
    }),
    enrich_work_email: z.boolean().optional().meta({
      title: "Work email",
      description: "Find the professional / work email.",
    }),
    enrich_personal_email: z.boolean().optional().meta({
      title: "Personal email",
      description: "Find the personal email.",
    }),
    enrich_phone: z
      .boolean()
      .optional()
      .meta({ title: "Phone", description: "Find the phone number." }),
    enrich_github: z
      .boolean()
      .optional()
      .meta({ title: "GitHub", description: "Find the GitHub profile." }),
  }),
  outputSchema: z.object({
    result: z
      .record(z.string(), z.unknown())
      .meta({ title: "Result", description: "Enriched profile data." }),
  }),
  secretSchema,
  handler: async (input, ctx) => {
    const parsed = await enrichProfileInput.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    return enrichProfileOutput.parseAsync(await enrichProfileTool(parsed));
  },
});

const enrichCompanyHandler = createToolHandler({
  inputSchema: z.object({
    company_identifier: z.string().min(1).meta({
      title: "Company identifier",
      description:
        'Company slug (e.g. "google"), domain, company page URL (LinkedIn supported), or encoded org_… id.',
      toolDescription:
        "Slug / domain / company page URL / org_ id of the company",
    }),
  }),
  outputSchema: z.object({
    result: z
      .record(z.string(), z.unknown())
      .meta({ title: "Result", description: "Enriched company data." }),
  }),
  secretSchema,
  handler: async (input, ctx) => {
    const parsed = await enrichCompanyInput.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    return enrichCompanyOutput.parseAsync(await enrichCompanyTool(parsed));
  },
});

/* -------------------------------------------------------------------------- */
/*  Tool set                                                                  */
/* -------------------------------------------------------------------------- */

export default defineToolSet({
  manifest: {
    pluginId: "dataforb2b",
    name: {
      en: "DataForB2B",
      "zh-CN": "DataForB2B B2B 数据",
    },
    description: {
      en: "B2B data API for lead generation and sales prospecting. Search people and companies across 70+ filters (job title, skills, company size, industry, seniority, funding stage, investor, past employers, certifications, years of experience, languages) and enrich profiles or companies to get verified work emails, personal emails and phone numbers.",
      "zh-CN":
        "面向销售与招聘的 B2B 数据 API:基于 70+ 条件(职位、技能、公司规模、行业、资历、融资阶段、投资人、过往雇主等)搜索人物与公司,并对联系人/公司进行数据增强,获取经过验证的工作邮箱、个人邮箱与电话。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    author: "DataForB2B",
    tutorialUrl: "https://docs.dataforb2b.ai",
    tags: ["search"],
    permission: [],
  },
  secretSchema,
  children: [
    {
      id: "searchPeople",
      name: { en: "Search People", "zh-CN": "搜索人物" },
      description: {
        en: "Search B2B people and decision-makers by job title, company, LinkedIn URL, skills, location, funding and more.",
        "zh-CN":
          "基于职位、公司、LinkedIn 链接、技能、地区、融资等结构化条件搜索 B2B 人物 / 决策者。",
      },
      toolDescription:
        "Search people (B2B professional profiles) with structured filters. Combine up to 5 filter slots (column + operator + value) plus optional advanced JSON filters. Returns matching people for lead generation and prospecting.",
      handler: searchPeopleHandler,
    },
    {
      id: "searchCompany",
      name: { en: "Search Companies", "zh-CN": "搜索公司" },
      description: {
        en: "Search B2B companies and target accounts by industry, size, location, LinkedIn URL, funding, founding year and more.",
        "zh-CN":
          "基于行业、规模、地区、LinkedIn 链接、融资、成立年份等结构化条件搜索 B2B 公司 / 目标账户。",
      },
      toolDescription:
        "Search companies (B2B accounts) with structured filters. Combine up to 5 filter slots (column + operator + value) plus optional advanced JSON filters. Returns matching companies for account-based prospecting.",
      handler: searchCompanyHandler,
    },
    {
      id: "reasoningSearch",
      name: { en: "Reasoning Search", "zh-CN": "智能推理搜索" },
      description: {
        en: "Describe your ideal customer in natural language and get a B2B people or company search automatically.",
        "zh-CN": "用自然语言描述目标客户,自动转换为 B2B 人物/公司搜索。",
      },
      toolDescription:
        'Natural-language B2B search. Pass a plain-English query (e.g. "Heads of Growth at Series B SaaS startups in Germany"). If the API needs clarification it returns status "needs_input" with questions and a session_id — call again with session_id + answers to resolve.',
      handler: reasoningHandler,
    },
    {
      id: "typeahead",
      name: { en: "Typeahead", "zh-CN": "自动补全" },
      description: {
        en: "Resolve a free-text term into the exact stored value usable in a search filter.",
        "zh-CN": "将自由文本解析为搜索过滤器中可用的确切存储值。",
      },
      toolDescription:
        "Autocomplete / value resolver. Given a type (company, title, skill, location, industry, school, investor, …) and a query string, returns the exact stored values to use in Search People / Search Companies filters. Use it when a search returns few/no results.",
      handler: typeaheadHandler,
    },
    {
      id: "enrichProfile",
      name: { en: "Enrich LinkedIn Profile", "zh-CN": "LinkedIn 人物数据增强" },
      description: {
        en: "Get a full profile, work email, personal email and phone from a profile URL or public id.",
        "zh-CN":
          "通过个人主页链接 / 公共 ID 获取完整人物档案、工作邮箱、个人邮箱与电话。",
      },
      toolDescription:
        'Enrich a person. Pass a profile identifier (a profile URL, public id like "john-doe", or encoded prof_… id) and choose what to retrieve: full profile, work email, personal email, phone, GitHub. At least one flag must be enabled — defaults to full profile. Ideal for profile-to-email lead enrichment.',
      handler: enrichProfileHandler,
    },
    {
      id: "enrichCompany",
      name: { en: "Enrich Company", "zh-CN": "公司数据增强" },
      description: {
        en: "Get full company data from a domain, slug or company page URL.",
        "zh-CN": "通过域名 / slug / 公司主页链接获取完整的公司档案数据。",
      },
      toolDescription:
        'Enrich a company. Pass a company identifier (domain or slug like "google", a company page URL, or an encoded org_… id) and get the full company profile: industry, size, location, funding and more.',
      handler: enrichCompanyHandler,
    },
  ],
});
