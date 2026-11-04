export type SensitiveWordItem = {
  word: string;
  category: string;
  isBlocked: boolean;
};

export type MatchResult = {
  word: string;
  category: string;
  isBlocked: boolean;
  index: number;
};

class AcNode {
  children: Map<string, AcNode> = new Map();
  fail: AcNode | null = null;
  outputs: SensitiveWordItem[] = [];
}

/**
 * 高性能 Aho-Corasick 多模式匹配自动机
 *
 * 时间复杂度 O(N + M)，其中 N 为输入文本长度，匹配性能与词库大小无关。
 */
export class AhoCorasick {
  private root: AcNode = new AcNode();
  private isBuilt = false;

  /**
   * 插入敏感词模式
   */
  addWord(word: string, category = "other", isBlocked = true): void {
    const normalized = word.trim().toLowerCase();
    if (!normalized) return;

    let curr = this.root;
    for (const char of normalized) {
      let next = curr.children.get(char);
      if (!next) {
        next = new AcNode();
        curr.children.set(char, next);
      }
      curr = next;
    }

    // 避免重复添加同一个词
    if (!curr.outputs.some((item) => item.word === normalized)) {
      curr.outputs.push({
        word: normalized,
        category,
        isBlocked,
      });
    }

    this.isBuilt = false;
  }

  /**
   * 批量添加敏感词
   */
  addWords(words: string[], category = "other", isBlocked = true): void {
    for (const word of words) {
      this.addWord(word, category, isBlocked);
    }
  }

  /**
   * 构建失败指针（BFS 广度优先遍历）
   */
  build(): void {
    if (this.isBuilt) return;

    const queue: AcNode[] = [];

    // 初始化第一层节点的 fail 指针指向 root
    for (const child of this.root.children.values()) {
      child.fail = this.root;
      queue.push(child);
    }

    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++]!;

      for (const [char, child] of curr.children.entries()) {
        queue.push(child);

        // 沿父节点的 fail 指针寻找匹配分支
        let failNode = curr.fail;
        while (failNode !== null && !failNode.children.has(char)) {
          failNode = failNode.fail;
        }

        child.fail = failNode ? failNode.children.get(char)! : this.root;

        // 继承 fail 节点的 outputs 模式串
        if (child.fail.outputs.length > 0) {
          child.outputs = [...child.outputs, ...child.fail.outputs];
        }
      }
    }

    this.isBuilt = true;
  }

  /**
   * 扫描文本并返回命中项
   */
  search(
    text: string,
    options?: {
      whiteList?: Set<string>;
    },
  ): MatchResult[] {
    if (!this.isBuilt) {
      this.build();
    }

    const whiteList = options?.whiteList;
    const normalized = text.toLowerCase();
    // 预计算长白名单覆盖区间，豁免如“弹药库管理系统”内包含的“弹药”等子串命中
    const coveredWhiteListRanges: Array<{ start: number; end: number }> = [];
    if (whiteList && whiteList.size > 0) {
      for (const safeWord of whiteList) {
        if (!safeWord) continue;
        let fromIndex = 0;
        while (fromIndex < normalized.length) {
          const foundIdx = normalized.indexOf(safeWord, fromIndex);
          if (foundIdx === -1) break;
          coveredWhiteListRanges.push({
            start: foundIdx,
            end: foundIdx + safeWord.length,
          });
          fromIndex = foundIdx + 1;
        }
      }
    }

    const results: MatchResult[] = [];
    let curr = this.root;

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      if (!char) continue;

      while (curr !== this.root && !curr.children.has(char)) {
        curr = curr.fail || this.root;
      }

      curr = curr.children.get(char) || this.root;

      if (curr.outputs.length > 0) {
        for (const item of curr.outputs) {
          const startIndex = i - item.word.length + 1;
          const endIndex = i + 1;

          // 白名单过滤：直接匹配或被更长的白名单专有名词完整包含时豁免
          if (
            (whiteList && whiteList.has(item.word)) ||
            coveredWhiteListRanges.some(
              (range) => startIndex >= range.start && endIndex <= range.end,
            )
          ) {
            continue;
          }

          results.push({
            word: item.word,
            category: item.category,
            isBlocked: item.isBlocked,
            index: startIndex,
          });
        }
      }
    }

    return results;
  }
}
