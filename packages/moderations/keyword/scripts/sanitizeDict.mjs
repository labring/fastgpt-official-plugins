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

console.log('Parsed categories:', Object.keys(rawCategories));
for (const [cat, words] of Object.entries(rawCategories)) {
  console.log(`  ${cat}: ${words.length} words`);
}

// 常见完全无害通用词白名单（绝不能作为敏感词拦截）
const HARMLESS_WHITELIST = new Set([
  // 通用电信/客服/号码
  '10086', '10010', '10000', '10001', '10011', '10020', '10088', '110', '120', '119', '122', '12345', '12315', '189',
  // 商业/商务/地理/机构缩写
  'cbd', 'cctv', 'cdma', 'chengdu', 'beijing', 'shanghai', 'china', 'chinese', 'gm', 'cs', 'bi', 'it', 'pc', 'app', 'api',
  'bj', 'sh', 'gz', 'sz', 'vip', 'top', 'ceo', 'cto', 'coo', 'hr', 'pr', 'qa', 'rd', 'ui', 'ue', 'pm', 'erp', 'crm', 'oa',
  'die', 'is', 'it', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'down', 'about', 'into', 'over', 'after',
  // 通用中文词汇
  '中国', '中文', '北京', '上海', '广州', '深圳', '成都', '武汉', '杭州', '南京', '天津', '重庆', '西安',
  '人民', '国家', '政府', '政治', '改革', '民主', '宪法', '法律', '社会', '经济', '科技', '教育', '文化',
  '书记', '省长', '市长', '主席', '总理', '部长', '官员', '党员', '干部', '学生', '老师', '记者', '新闻',
  '操作', '操场', '操心', '操办', '日本', '日本人', '日本料理', '生日', '向日葵', '白日', '日光', '日常',
  '免费', '官网', '客服', '电话', '微信', '咨询', '代理', '兼职', '招聘', '购买', '优惠', '折扣', '会员',
  '医院', '医生', '器官', '受精', '怀孕', '乳腺', '胸部', '妇科', '生殖', '精子', '卵子', '护士', '手术',
  '发展', '建设', '服务', '管理', '系统', '数据', '平台', '安全', '测试', '代码', '程序', '算法', '函数',
  '开发', '应用', '接口', '网络', '协议', '服务', '配置', '说明', '文档', '项目', '用户', '角色', '权限',
  '13亿', '14亿', '24小时', '12月26日', '0投资', '0风险', '80块钱', '100块'
]);

// 域名/网址特征
const DOMAIN_REGEX = /(\.(com|cn|net|org|io|gov|edu|info|tv|cc|me|vip|top|xyz|co|biz|mobi|asia|ws|la|in|tk|tw|hk|jp|us|kr|de|ru|fr|gp|gg|cc|pw)|\.(com|net)\.cn)/i;

// 纯数字或带单位的数字 (如 24, 65, 89, 13亿, 12月26日, 100%, 0投资, 0风险)
const NUMBER_LIKE_REGEX = /^[\d\.\-\+\:\s]+(亿|万|千|百|分|秒|点|月|日|号|年|岁|元|块|米|克|吨|平|级|肖|风|常|胖|学|大|倍|条|人|家|个)?$/;

// 纯英文且长度 <= 3 (除非是非常确切的高危词)
const SHORT_LATIN_REGEX = /^[a-zA-Z0-9_\-\.]{1,3}$/;

// 纯标点符号
const PUNCTUATION_ONLY_REGEX = /^[\*\&\#\@\$\%\^\(\)\_\+\-\=\[\]\{\}\<\>\,\.\?\/\\\|\!\:\;\'\"\`\~]+$/;

// IP 地址与电话格式
const IP_OR_PHONE_REGEX = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{3,4}[\-\s]\d{7,8}|1[3-9]\d{9})$/;

/**
 * 清洗规范化单个词：
 * 去除首尾星号、空格等论坛防屏蔽杂质
 */
function cleanRawWord(raw) {
  let w = raw.trim();
  // 去除包裹的星号，如 "*法轮功*" -> "法轮功", "假币*" -> "假币"
  w = w.replace(/^\*+|\*+$/g, '');
  // 去除首尾标点
  w = w.replace(/^[\s\-_=\+,]+|[\s\-_=\+,]+$/g, '');
  return w;
}

function shouldFilterOut(word, category) {
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

  // 6. 纯域名/网址/邮箱后缀 (如 www.xxx.com, xxx.cn 等)
  if (DOMAIN_REGEX.test(word) && !/[\u4e00-\u9fa5]/.test(word)) {
    return true;
  }

  // 7. 广告类如果包含常见网址且无实质中文特征
  if (category === 'ad' && DOMAIN_REGEX.test(word)) {
    return true;
  }

  return false;
}

// 统计清洗后各分类数量
const sanitizedCategories = {};
for (const [category, words] of Object.entries(rawCategories)) {
  const seen = new Set();
  const kept = [];
  for (const w of words) {
    const cleaned = cleanRawWord(w);
    if (!cleaned) continue;
    const lower = cleaned.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    if (!shouldFilterOut(cleaned, category)) {
      kept.push(cleaned);
    }
  }
  sanitizedCategories[category] = kept;
  console.log(`Sanitized ${category}: ${words.length} -> ${kept.length} words (filtered ${words.length - kept.length})`);
}

// 深入分析 politics 中的词长分布与特征
const politics = sanitizedCategories.politics;
const lengthMap = {};
const twoCharWords = [];
const latinWords = [];
const digitWords = [];

for (const w of politics) {
  const len = w.length;
  lengthMap[len] = (lengthMap[len] || 0) + 1;
  if (len === 2) twoCharWords.push(w);
  if (/^[a-zA-Z\s]+$/.test(w)) latinWords.push(w);
  if (/\d/.test(w)) digitWords.push(w);
}

console.log('\nPolitics length distribution:');
const sortedLengths = Object.keys(lengthMap).map(Number).sort((a,b) => a-b);
for (const len of sortedLengths) {
  if (len <= 10) console.log(`  Length ${len}: ${lengthMap[len]} words`);
}
console.log(`  Length > 10: ${politics.filter(w => w.length > 10).length} words`);
console.log('\nSample 2-char politics words (total', twoCharWords.length, '):', twoCharWords.slice(0, 40));
console.log('\nSample latin politics words (total', latinWords.length, '):', latinWords.slice(0, 30));
console.log('\nSample digit-containing politics words (total', digitWords.length, '):', digitWords.slice(0, 30));
