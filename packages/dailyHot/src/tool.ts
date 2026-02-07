import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

type HotNewsItem = Output["hotNewsList"][number];

type Kr36Response = {
  data: {
    hotRankList: {
      templateMaterial: {
        widgetTitle: string;
      };
      publishTime: string;
    }[];
  };
};
async function get36krList(): Promise<HotNewsItem[]> {
  const url = `https://gateway.36kr.com/api/mis/nav/home/nav/rank/hot`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      partner_id: "wap",
      param: {
        siteId: 1,
        platformId: 2,
      },
      timestamp: Date.now(),
    }),
  });
  const kr36Response: Kr36Response = await response.json();
  const kr36List = kr36Response?.data?.hotRankList;
  if (!kr36List) {
    return Promise.reject({
      error: "Failed to get kr36 list",
    });
  }

  const hotNewsList: HotNewsItem[] = kr36List.map((item) => {
    return {
      title: item.templateMaterial.widgetTitle,
      source: "36氪",
      time: new Date(item.publishTime).toLocaleString("zh-CN"),
    };
  });

  return hotNewsList;
}

type ZhihuResponse = {
  data: {
    target: {
      title: string;
      created: number;
      excerpt: string;
    };
  }[];
};
async function getZhihuList(): Promise<HotNewsItem[]> {
  const url = `https://api.zhihu.com/topstory/hot-lists/total?limit=50`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const zhihuResponse: ZhihuResponse = await response.json();
  const zhihuList = zhihuResponse?.data;
  if (!zhihuList) {
    return Promise.reject({
      error: "Failed to get zhihu list",
    });
  }

  const hotNewsList: HotNewsItem[] = zhihuList.map((item) => {
    const data = item.target;
    return {
      title: data.title,
      description: data.excerpt,
      source: "知乎",
      time: new Date(data.created * 1000).toLocaleString("zh-CN"),
    };
  });

  return hotNewsList;
}

type WeiboResponse = {
  data: {
    cards: {
      card_group?: {
        desc: string;
      }[];
    }[];
  };
};
async function getWeiboList(): Promise<HotNewsItem[]> {
  const url =
    "https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot&title=%E5%BE%AE%E5%8D%9A%E7%83%AD%E6%90%9C&extparam=filter_type%3Drealtimehot%26mi_cid%3D100103%26pos%3D0_0%26c_type%3D30%26display_time%3D1540538388&luicode=10000011&lfid=231583";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });
  const weiboResponse: WeiboResponse = await response.json();
  const weiboList = weiboResponse.data.cards[0]?.card_group;
  if (!weiboList) {
    return Promise.reject({
      error: "Failed to get weibo list",
    });
  }

  const hotNewsList: HotNewsItem[] = weiboList.map((item) => {
    return {
      title: item.desc,
      source: "微博",
    };
  });

  return hotNewsList;
}

type JuejinResponse = {
  data: {
    content: {
      content_id: string;
      title: string;
      created_at: number;
      ctime: number;
    };
    author: {
      name: string;
    };
    content_counter: {
      hot_rank: number;
    };
  }[];
};
async function getJuejinList(): Promise<HotNewsItem[]> {
  const url =
    "https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const juejinResponse: JuejinResponse = await response.json();
  const juejinList = juejinResponse?.data;
  if (!juejinList) {
    return Promise.reject({
      error: "Failed to get juejin list",
    });
  }

  const hotNewsList: HotNewsItem[] = juejinList.map((item) => {
    return {
      title: item.content.title,
      source: "掘金",
    };
  });

  return hotNewsList;
}

type ToutiaoResponse = {
  data: {
    Title: string;
  }[];
};
async function getToutiaoList(): Promise<HotNewsItem[]> {
  const url = `https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const toutiaoResponse: ToutiaoResponse = await response.json();
  const toutiaoList = toutiaoResponse?.data;
  if (!toutiaoList) {
    return Promise.reject({
      error: "Failed to get toutiao list",
    });
  }
  const hotNewsList: HotNewsItem[] = toutiaoList.map((item) => {
    return {
      title: item.Title,
      source: "头条",
    };
  });

  return hotNewsList;
}

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { sources } = input;

  const map = {
    "36kr": get36krList,
    zhihu: getZhihuList,
    weibo: getWeiboList,
    juejin: getJuejinList,
    toutiao: getToutiaoList,
  };
  const promises = sources.map(async (source) => {
    return await map[source]();
  });

  const results = await Promise.allSettled(promises);
  const allHotNewsList: HotNewsItem[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      allHotNewsList.push(...result.value);
    } else {
      const source = sources[index] ?? "unknown";
      allHotNewsList.push({
        error: `Failed to get hot news from ${source}`,
        source: source,
      });
    }
  });

  if (!allHotNewsList.length) {
    return Promise.reject({
      error: "Failed to get hot news list",
    });
  }

  return {
    hotNewsList: allHotNewsList,
  };
}
