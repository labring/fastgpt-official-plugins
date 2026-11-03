import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dictPath = path.resolve(__dirname, '../src/dict/defaultDict.ts');

const content = fs.readFileSync(dictPath, 'utf-8');

// Parse raw dict categories from file
const categoryRegex = /([a-zA-Z_]+):\s*\[([\s\S]*?)\](?=,\s*[a-zA-Z_]+:|\s*};)/g;
const rawCategories = {};

let match;
while ((match = categoryRegex.exec(content)) !== null) {
  const category = match[1];
  const body = match[2];
  const words = body
    .split('\n')
    .map((line) => line.trim())
    .map((line) => line.replace(/^"/, '').replace(/",?$/, '').trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));
  rawCategories[category] = words;
}

// 常见完全无害通用词白名单（绝不能作为敏感词拦截）
const HARMLESS_WHITELIST = new Set([
  // 通用电信/客服/号码
  '10086', '10010', '10000', '10001', '10011', '10020', '10088', '110', '120', '119', '122', '12345', '12315', '189',
  // 商业/商务/地理/机构缩写与日常英文单词
  'admin', 'administrator', 'aids', 'client', 'government', 'kefu', 'carrefour', 'event', 'kissmyass', 'feelmistone', 'crestbone',
  'cbd', 'cctv', 'cdma', 'chengdu', 'beijing', 'shanghai', 'china', 'chinese', 'gm', 'cs', 'bi', 'it', 'pc', 'app', 'api',
  'bj', 'sh', 'gz', 'sz', 'vip', 'top', 'ceo', 'cto', 'coo', 'hr', 'pr', 'qa', 'rd', 'ui', 'ue', 'pm', 'erp', 'crm', 'oa',
  'die', 'is', 'it', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'down', 'about', 'into', 'over', 'after',
  // 通用中文词汇（绝不可作为无条件敏感词）
  '中国', '中文', '北京', '上海', '广州', '深圳', '成都', '武汉', '杭州', '南京', '天津', '重庆', '西安',
  '人民', '国家', '政府', '政治', '改革', '民主', '宪法', '法律', '社会', '经济', '科技', '教育', '文化',
  '书记', '省长', '市长', '主席', '总理', '部长', '官员', '党员', '干部', '学生', '老师', '记者', '新闻', '新闻出版署',
  '操作', '操场', '操心', '操办', '日本', '日本人', '日本料理', '生日', '向日葵', '白日', '日光', '日常',
  '免费', '官网', '客服', '电话', '微信', '咨询', '代理', '兼职', '招聘', '购买', '优惠', '折扣', '会员',
  '医院', '医生', '器官', '受精', '怀孕', '乳腺', '胸部', '妇科', '生殖', '精子', '卵子', '护士', '手术',
  '发展', '建设', '服务', '管理', '系统', '数据', '平台', '安全', '测试', '代码', '程序', '算法', '函数',
  '开发', '应用', '接口', '网络', '协议', '配置', '说明', '文档', '项目', '用户', '角色', '权限', '助手',
  '13亿', '14亿', '24小时', '12月26日', '0投资', '0风险', '80块钱', '100块', 'a级', 'b样', '2会', '2奶', '3退'
]);

// 域名/网址特征
const DOMAIN_REGEX = /(\.(com|cn|net|org|io|gov|edu|info|tv|cc|me|vip|top|xyz|co|biz|mobi|asia|ws|la|in|tk|tw|hk|jp|us|kr|de|ru|fr|gp|gg|cc|pw)|\.(com|net)\.cn)/i;

// 纯数字或带单位的数字 (如 24, 65, 89, 13亿, 12月26日, 100%, 0投资, 0风险)
const NUMBER_LIKE_REGEX = /^[\d\.\-\+\:\s]+(亿|万|千|百|分|秒|点|月|日|号|年|岁|元|块|米|克|吨|平|级|肖|风|常|胖|学|大|倍|条|人|家|个)?$/;

// 纯英文且长度 <= 3
const SHORT_LATIN_REGEX = /^[a-zA-Z0-9_\-\.]{1,3}$/;

// 纯标点符号
const PUNCTUATION_ONLY_REGEX = /^[\*\&\#\@\$\%\^\(\)\_\+\-\=\[\]\{\}\<\>\,\.\?\/\\\|\!\:\;\'\"\`\~]+$/;

// IP 地址与电话格式
const IP_OR_PHONE_REGEX = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{3,4}[\-\s]\d{7,8}|1[3-9]\d{9})$/;

// 过滤单英文字母+单个中文字，如 "x总", "g网", "d狗", "b嫩", "h站"
const LETTER_PLUS_SINGLE_HAN_REGEX = /^[a-zA-Z][\u4e00-\u9fa5]$|^[\u4e00-\u9fa5][a-zA-Z]$/;

function cleanRawWord(raw) {
  let w = raw.trim();
  w = w.replace(/^\*+|\*+$/g, '');
  w = w.replace(/^[\s\-_=\+,]+|[\s\-_=\+,]+$/g, '');
  return w;
}

function isJunkWord(word, category) {
  if (!word || word.length <= 1) return true; // 单字一律剔除！

  const lower = word.toLowerCase();

  // 1. 在通用白名单中
  if (HARMLESS_WHITELIST.has(lower) || HARMLESS_WHITELIST.has(word)) return true;

  // 2. 纯标点
  if (PUNCTUATION_ONLY_REGEX.test(word)) return true;

  // 3. 数字或日期单位
  if (NUMBER_LIKE_REGEX.test(word)) return true;

  // 4. IP 或电话
  if (IP_OR_PHONE_REGEX.test(word)) return true;

  // 5. 短英文字符 (<=3)
  if (SHORT_LATIN_REGEX.test(word)) return true;

  // 6. 单字母+单汉字（如 "x总", "g网", "A级"）
  if (LETTER_PLUS_SINGLE_HAN_REGEX.test(word)) return true;

  // 7. 纯英文且属于普通英文单词 (无中文)，如 Carrefour, Administrator, Client, Government
  if (/^[a-zA-Z\s]+$/.test(word)) {
    // 只有特定已知极高危恐怖主义或毒品英文才保留
    if (!['isis', 'isil', 'al-qaeda', 'taliban', 'jihad'].includes(lower)) {
      return true;
    }
  }

  // 8. 包含域名的网址字符串
  if (DOMAIN_REGEX.test(word) && !/[\u4e00-\u9fa5]/.test(word)) {
    return true;
  }

  // 9. 废弃很长的网络句子（长度 >= 12 且看起来像特定网帖发牢骚）
  if (word.length >= 14 && /导致|只要|为什么|怎么|大家|我们|他们|发现|觉得/.test(word)) {
    return true;
  }

  return false;
}

// 核心拦截词特征（涉政反动、极端暴恐、枪爆毒品合成交易、严重淫秽色情、假币发票交易）
function isHighConfidenceBlock(word, category) {
  if (category === 'violence' || category === 'contraband') return true;

  // 涉政核心高危词（反党反宪、邪教、极恶历史事件代称、分裂国家等）
  if (category === 'politics') {
    // 带有明确敌对反动/煽动颠覆/邪教标志的词，设为 block
    if (/(法轮|大纪元|九评|退党|法lun|退dang|亡党|颠覆政权|六四坦克|天安门屠杀|8964|89学潮|反共|达赖|分裂分子|疆独|藏独|台独分裂)/i.test(word)) {
      return true;
    }
    // 其他普通政治敏感词、领导人姓名等放入 suspected（疑似）
    return false;
  }

  if (category === 'porn') {
    // 严重淫秽色情、卖淫招嫖、幼态色情设为 block
    if (/(幼女|幼童|幼幼|乱伦|群交|换妻|招嫖|全套服务|上门服务|包夜|做爱|性交|阴道|阴茎|抽插|口交|手淫|自慰|黄色网站|情色网站)/.test(word)) {
      return true;
    }
    return false;
  }

  if (category === 'ad') {
    // 广告中只有涉枪、涉假币、办假证、代开发票、博彩下注才 block
    if (/(假币|假钱|办假证|假发票|代开发票|六合彩|博彩网|百家乐|赌博网站|下注网站)/.test(word)) {
      return true;
    }
    return false;
  }

  return false;
}

const curatedBlockDict = {};
const curatedSuspectedDict = {};

let totalBlock = 0;
let totalSuspected = 0;

for (const [category, words] of Object.entries(rawCategories)) {
  const blockWords = [];
  const suspectedWords = [];
  const seen = new Set();

  for (const raw of words) {
    const cleaned = cleanRawWord(raw);
    if (!cleaned) continue;
    const lower = cleaned.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    if (isJunkWord(cleaned, category)) continue;

    if (isHighConfidenceBlock(cleaned, category)) {
      blockWords.push(cleaned);
    } else {
      suspectedWords.push(cleaned);
    }
  }

  curatedBlockDict[category] = blockWords;
  curatedSuspectedDict[category] = suspectedWords;
  totalBlock += blockWords.length;
  totalSuspected += suspectedWords.length;

  console.log(`Category ${category}:`);
  console.log(`  -> Block: ${blockWords.length}`);
  console.log(`  -> Suspected: ${suspectedWords.length}`);
}

console.log(`\nTotal Curated: Block=${totalBlock}, Suspected=${totalSuspected}`);

// Write output to curatedDict.ts
const outputCode = `// 精细化清洗与分级内容审查词库
// 区分 block（高危零容忍拦截）与 suspected（疑似风险/观察记录）

export const coreBlockCategorizedKeywords: Record<string, string[]> = ${JSON.stringify(curatedBlockDict, null, 2)};

export const suspectedCategorizedKeywords: Record<string, string[]> = ${JSON.stringify(curatedSuspectedDict, null, 2)};
`;

const outputPath = path.resolve(__dirname, '../src/dict/curatedDict.ts');
fs.writeFileSync(outputPath, outputCode, 'utf-8');
console.log(`Written curated lexicon to ${outputPath}`);
