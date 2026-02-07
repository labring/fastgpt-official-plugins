import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    apiKey,
    keyword,
    pageIndex,
    pageSize,
    sortFields,
    sortType,
    filter,
    filterDate,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // 基于5118官方API文档实现
    // 参考PHP示例代码和文档：https://www.5118.com/apistore/detail/8cf3d6ed-2b12-ed11-8da8-e43d1a103141/-1

    const apiUrl = "http://apis.5118.com/keyword/word/v2"; // 5118官方API端点
    const requestData: Record<string, string> = {
      keyword,
      page_index: String(pageIndex),
      page_size: String(pageSize),
      sort_fields: String(sortFields),
      sort_type: sortType,
      filter: String(filter),
    };

    // 如果提供了过滤日期，添加到请求中
    if (filterDate) {
      requestData.filter_date = filterDate;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: new URLSearchParams(requestData).toString(),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 检查API返回状态
    if (data.errcode !== "0") {
      return {
        keywords: "[]",
        total: 0,
        pageCount: 0,
        pageIndex: 1,
        pageSize: 100,
        success: false,
        message: data.errmsg || "API返回错误",
      };
    }

    // 处理返回的关键词数据
    const keywords = (data.data?.word || []).map((item: any) => ({
      keyword: item.keyword || "",
      index: item.index || 0,
      mobileIndex: item.mobile_index || 0,
      douyinIndex: item.douyin_index || 0,
      haosouIndex: item.haosou_index || 0,
      longKeywordCount: item.long_keyword_count || 0,
      pageUrl: item.page_url || "",
      bidwordCompanyCount: item.bidword_company_count || 0,
      bidwordKwc: item.bidword_kwc || 1,
      bidwordPcpv: item.bidword_pcpv || 0,
      bidwordWisepv: item.bidword_wisepv || 0,
      semReason: item.sem_reason || "",
      semPrice: item.sem_price || "",
    }));

    return {
      keywords: JSON.stringify(keywords),
      total: data.data?.total || keywords.length,
      pageCount: data.data?.page_count || 1,
      pageIndex: data.data?.page_index || pageIndex,
      pageSize: data.data?.page_size || pageSize,
      success: true,
    };
  } catch (error) {
    return {
      keywords: "[]",
      total: 0,
      pageCount: 0,
      pageIndex: 1,
      pageSize: 100,
      success: false,
      message: error instanceof Error ? error.message : "未知错误",
    };
  }
}
