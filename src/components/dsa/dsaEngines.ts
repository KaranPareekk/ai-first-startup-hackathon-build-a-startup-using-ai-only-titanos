import { DsaAlgorithm, DsaStep } from '../../types';

export interface AlgorithmMetadata {
  id: DsaAlgorithm;
  name: string;
  category: 'Dynamic Programming' | 'Searching' | 'Sorting' | 'Graph Algorithms';
  timeComplexity: string;
  spaceComplexity: string;
  pseudocode: string[];
}

export const DSA_ALGORITHMS: AlgorithmMetadata[] = [
  {
    id: 'lcs',
    name: 'Longest Common Subsequence (DP)',
    category: 'Dynamic Programming',
    timeComplexity: 'O(m × n)',
    spaceComplexity: 'O(m × n)',
    pseudocode: [
      'for i from 1 to m:',
      '  for j from 1 to n:',
      '    if s1[i-1] == s2[j-1]:',
      '      dp[i][j] = 1 + dp[i-1][j-1]',
      '    else:',
      '      dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
      'return dp[m][n]',
    ],
  },
  {
    id: 'edit_distance',
    name: 'Edit Distance / Levenshtein (DP)',
    category: 'Dynamic Programming',
    timeComplexity: 'O(m × n)',
    spaceComplexity: 'O(m × n)',
    pseudocode: [
      'for i from 1 to m:',
      '  for j from 1 to n:',
      '    if s1[i-1] == s2[j-1]: cost = 0 else: cost = 1',
      '    dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost)',
      'return dp[m][n]',
    ],
  },
  {
    id: 'binary_search',
    name: 'Binary Search',
    category: 'Searching',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    pseudocode: [
      'low = 0, high = n - 1',
      'while low <= high:',
      '  mid = (low + high) // 2',
      '  if arr[mid] == target: return mid',
      '  else if arr[mid] < target: low = mid + 1',
      '  else: high = mid - 1',
      'return -1',
    ],
  },
  {
    id: 'bubble_sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: [
      'for i from 0 to n-1:',
      '  for j from 0 to n-i-2:',
      '    if arr[j] > arr[j+1]:',
      '      swap(arr[j], arr[j+1])',
    ],
  },
  {
    id: 'selection_sort',
    name: 'Selection Sort',
    category: 'Sorting',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: [
      'for i from 0 to n-1:',
      '  min_idx = i',
      '  for j from i+1 to n-1:',
      '    if arr[j] < arr[min_idx]: min_idx = j',
      '  swap(arr[i], arr[min_idx])',
    ],
  },
  {
    id: 'insertion_sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: [
      'for i from 1 to n-1:',
      '  key = arr[i], j = i - 1',
      '  while j >= 0 and arr[j] > key:',
      '    arr[j+1] = arr[j], j = j - 1',
      '  arr[j+1] = key',
    ],
  },
  {
    id: 'merge_sort',
    name: 'Merge Sort',
    category: 'Sorting',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    pseudocode: [
      'mergeSort(arr, l, r):',
      '  if l < r:',
      '    m = (l + r) // 2',
      '    mergeSort(arr, l, m)',
      '    mergeSort(arr, m+1, r)',
      '    merge(arr, l, m, r)',
    ],
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'Graph Algorithms',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'queue.push(start), visited[start] = true',
      'while queue is not empty:',
      '  u = queue.pop()',
      '  for each neighbor v of u:',
      '    if not visited[v]:',
      '      visited[v] = true, queue.push(v)',
    ],
  },
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'Graph Algorithms',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'dfs(u):',
      '  visited[u] = true',
      '  for each neighbor v of u:',
      '    if not visited[v]:',
      '      dfs(v)',
    ],
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Shortest Path",
    category: 'Graph Algorithms',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    pseudocode: [
      'dist[start] = 0, pq.push((0, start))',
      'while pq is not empty:',
      '  (d, u) = pq.pop()',
      '  for each neighbor v with weight w:',
      '    if dist[u] + w < dist[v]:',
      '      dist[v] = dist[u] + w, pq.push((dist[v], v))',
    ],
  },
];

// Generator for LCS steps
export function generateLcsSteps(s1: string, s2: string): DsaStep[] {
  const steps: DsaStep[] = [];
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  steps.push({
    description: `Initialize DP table of size (${m + 1} × ${n + 1}) with zeroes for base cases.`,
    highlightLines: [0, 1],
    state: { s1, s2, dp: dp.map((r) => [...r]), currentCell: [-1, -1], match: false },
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = s1[i - 1] === s2[j - 1];
      if (match) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
        steps.push({
          description: `Characters match '${s1[i - 1]}' == '${s2[j - 1]}' at s1[${i - 1}] & s2[${j - 1}]. dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}.`,
          highlightLines: [2, 3],
          state: { s1, s2, dp: dp.map((r) => [...r]), currentCell: [i, j], match: true },
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({
          description: `Mismatch '${s1[i - 1]}' != '${s2[j - 1]}'. dp[${i}][${j}] = max(top: ${dp[i - 1][j]}, left: ${dp[i][j - 1]}) = ${dp[i][j]}.`,
          highlightLines: [4, 5],
          state: { s1, s2, dp: dp.map((r) => [...r]), currentCell: [i, j], match: false },
        });
      }
    }
  }

  steps.push({
    description: `LCS computation finished! Maximum common subsequence length is ${dp[m][n]}.`,
    highlightLines: [6],
    state: { s1, s2, dp: dp.map((r) => [...r]), currentCell: [m, n], completed: true },
  });

  return steps;
}

// Generator for Edit Distance
export function generateEditDistanceSteps(s1: string, s2: string): DsaStep[] {
  const steps: DsaStep[] = [];
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  steps.push({
    description: `Initialize base cases: converting prefix to empty string requires index deletions/insertions.`,
    highlightLines: [0, 1],
    state: { s1, s2, dp: dp.map((r) => [...r]), currentCell: [-1, -1] },
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = s1[i - 1] === s2[j - 1];
      const cost = match ? 0 : 1;
      const del = dp[i - 1][j] + 1;
      const ins = dp[i][j - 1] + 1;
      const sub = dp[i - 1][j - 1] + cost;
      dp[i][j] = Math.min(del, ins, sub);

      steps.push({
        description: match
          ? `'${s1[i - 1]}' == '${s2[j - 1]}': No op cost. dp[${i}][${j}] = ${dp[i][j]}.`
          : `'${s1[i - 1]}' != '${s2[j - 1]}': Min of (Del=${del}, Ins=${ins}, Sub=${sub}) = ${dp[i][j]}.`,
        highlightLines: [2, 3],
        state: { s1, s2, dp: dp.map((r) => [...r]), currentCell: [i, j], match },
      });
    }
  }

  steps.push({
    description: `Edit distance between "${s1}" and "${s2}" is ${dp[m][n]} operations.`,
    highlightLines: [4],
    state: { s1, s2, dp: dp.map((r) => [...r]), currentCell: [m, n], completed: true },
  });

  return steps;
}

// Generator for Binary Search
export function generateBinarySearchSteps(arr: number[], target: number): DsaStep[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: DsaStep[] = [];
  let low = 0;
  let high = sorted.length - 1;

  steps.push({
    description: `Initialize search bounds: low = 0, high = ${high}. Searching for target ${target}.`,
    highlightLines: [0],
    state: { arr: sorted, low, high, mid: -1, found: false },
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = sorted[mid];

    steps.push({
      description: `Mid calculated: mid = ${mid} (value = ${midVal}). Comparing with target ${target}.`,
      highlightLines: [1, 2],
      state: { arr: sorted, low, high, mid, found: false },
    });

    if (midVal === target) {
      steps.push({
        description: `Target ${target} found at index ${mid}! Search successful.`,
        highlightLines: [3],
        state: { arr: sorted, low, high, mid, found: true },
      });
      return steps;
    } else if (midVal < target) {
      low = mid + 1;
      steps.push({
        description: `${midVal} < ${target}: Target is in right half. Adjusting low = ${low}.`,
        highlightLines: [4],
        state: { arr: sorted, low, high, mid, found: false },
      });
    } else {
      high = mid - 1;
      steps.push({
        description: `${midVal} > ${target}: Target is in left half. Adjusting high = ${high}.`,
        highlightLines: [5],
        state: { arr: sorted, low, high, mid, found: false },
      });
    }
  }

  steps.push({
    description: `Search space exhausted (low > high). Target ${target} not found in array.`,
    highlightLines: [6],
    state: { arr: sorted, low, high, mid: -1, found: false, notFound: true },
  });

  return steps;
}

// Generator for Bubble Sort
export function generateBubbleSortSteps(initialArr: number[]): DsaStep[] {
  const arr = [...initialArr];
  const n = arr.length;
  const steps: DsaStep[] = [];

  steps.push({
    description: `Initial unsorted array of ${n} elements.`,
    highlightLines: [0],
    state: { arr: [...arr], i: -1, j: -1, swapped: false, sortedCount: 0 },
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        description: `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
        highlightLines: [1, 2],
        state: { arr: [...arr], i, j, comparing: [j, j + 1], swapped: false, sortedCount: i },
      });

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        steps.push({
          description: `Swap occurred: ${arr[j]} > ${arr[j + 1]}. Swapped elements.`,
          highlightLines: [3],
          state: { arr: [...arr], i, j, comparing: [j, j + 1], swapped: true, sortedCount: i },
        });
      }
    }
  }

  steps.push({
    description: `Sorting complete! All ${n} elements are in ascending order.`,
    highlightLines: [0],
    state: { arr: [...arr], i: n, j: -1, comparing: [], sortedCount: n, completed: true },
  });

  return steps;
}

// Generator for Selection Sort
export function generateSelectionSortSteps(initialArr: number[]): DsaStep[] {
  const arr = [...initialArr];
  const n = arr.length;
  const steps: DsaStep[] = [];

  steps.push({
    description: `Begin Selection Sort. We repeatedly select the minimum element from the unsorted portion.`,
    highlightLines: [0],
    state: { arr: [...arr], i: -1, minIdx: -1, j: -1, sortedCount: 0 },
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({
      description: `Outer loop i=${i}: assume arr[${i}] (${arr[i]}) is initial minimum.`,
      highlightLines: [1],
      state: { arr: [...arr], i, minIdx, j: -1, sortedCount: i },
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        description: `Checking arr[${j}] (${arr[j]}) against current minimum arr[${minIdx}] (${arr[minIdx]}).`,
        highlightLines: [2, 3],
        state: { arr: [...arr], i, minIdx, j, sortedCount: i },
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          description: `Found new smaller minimum: arr[${minIdx}] = ${arr[minIdx]}.`,
          highlightLines: [3],
          state: { arr: [...arr], i, minIdx, j, sortedCount: i },
        });
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      steps.push({
        description: `Swap minimum arr[${minIdx}] into sorted position arr[${i}].`,
        highlightLines: [4],
        state: { arr: [...arr], i, minIdx, j: -1, sortedCount: i + 1, swapped: true },
      });
    }
  }

  steps.push({
    description: `Array fully sorted via Selection Sort.`,
    highlightLines: [0],
    state: { arr: [...arr], i: n, minIdx: -1, j: -1, sortedCount: n, completed: true },
  });

  return steps;
}

// Generator for Insertion Sort
export function generateInsertionSortSteps(initialArr: number[]): DsaStep[] {
  const arr = [...initialArr];
  const n = arr.length;
  const steps: DsaStep[] = [];

  steps.push({
    description: `Initial array. First element arr[0] is trivially sorted.`,
    highlightLines: [0],
    state: { arr: [...arr], key: null, keyIdx: -1, j: -1, sortedCount: 1 },
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      description: `Pick key = ${key} at index ${i} to insert into sorted prefix [0..${i - 1}].`,
      highlightLines: [1],
      state: { arr: [...arr], key, keyIdx: i, j, sortedCount: i },
    });

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      steps.push({
        description: `arr[${j}] (${arr[j]}) > key (${key}). Shifted arr[${j}] to index ${j + 1}.`,
        highlightLines: [2, 3],
        state: { arr: [...arr], key, keyIdx: i, j, shifted: j + 1, sortedCount: i },
      });
      j = j - 1;
    }

    arr[j + 1] = key;
    steps.push({
      description: `Inserted key ${key} into position ${j + 1}. Prefix [0..${i}] is now sorted.`,
      highlightLines: [4],
      state: { arr: [...arr], key: null, keyIdx: -1, j: -1, sortedCount: i + 1 },
    });
  }

  steps.push({
    description: `Insertion Sort complete.`,
    highlightLines: [0],
    state: { arr: [...arr], key: null, keyIdx: -1, j: -1, sortedCount: n, completed: true },
  });

  return steps;
}

// Generator for Merge Sort
export function generateMergeSortSteps(initialArr: number[]): DsaStep[] {
  const arr = [...initialArr];
  const steps: DsaStep[] = [];

  steps.push({
    description: `Merge Sort uses Divide & Conquer. Recursively split then merge sorted subarrays.`,
    highlightLines: [0],
    state: { arr: [...arr], activeSubarray: [0, arr.length - 1], merging: false },
  });

  // Simulated clean step trace
  const aux = [...arr];
  function merge(l: number, m: number, r: number) {
    steps.push({
      description: `Merging sub-arrays [${l}..${m}] and [${m + 1}..${r}].`,
      highlightLines: [5],
      state: { arr: [...aux], activeSubarray: [l, r], leftPart: [l, m], rightPart: [m + 1, r], merging: true },
    });

    const left = aux.slice(l, m + 1);
    const right = aux.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        aux[k++] = left[i++];
      } else {
        aux[k++] = right[j++];
      }
    }
    while (i < left.length) aux[k++] = left[i++];
    while (j < right.length) aux[k++] = right[j++];

    steps.push({
      description: `Merged result for interval [${l}..${r}]: [${aux.slice(l, r + 1).join(', ')}]`,
      highlightLines: [5],
      state: { arr: [...aux], activeSubarray: [l, r], merging: false },
    });
  }

  function sort(l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  }

  sort(0, arr.length - 1);

  steps.push({
    description: `Merge sort complete! Full array is now stably sorted in O(n log n).`,
    highlightLines: [0],
    state: { arr: [...aux], activeSubarray: [0, arr.length - 1], completed: true },
  });

  return steps;
}

// Sample Graph structure for BFS, DFS, Dijkstra
export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export const SAMPLE_GRAPH = {
  nodes: [
    { id: 'A', x: 70, y: 70 },
    { id: 'B', x: 220, y: 50 },
    { id: 'C', x: 130, y: 170 },
    { id: 'D', x: 280, y: 160 },
    { id: 'E', x: 380, y: 70 },
    { id: 'F', x: 370, y: 190 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'C', to: 'D', weight: 8 },
    { from: 'B', to: 'E', weight: 2 },
    { from: 'D', to: 'F', weight: 3 },
    { from: 'E', to: 'F', weight: 6 },
  ],
};

// Generator for BFS
export function generateBfsSteps(startNode: string = 'A'): DsaStep[] {
  const steps: DsaStep[] = [];
  const queue: string[] = [startNode];
  const visited: Set<string> = new Set([startNode]);
  const traversalOrder: string[] = [];

  // adjacency
  const adj: Record<string, string[]> = {};
  SAMPLE_GRAPH.nodes.forEach((n) => (adj[n.id] = []));
  SAMPLE_GRAPH.edges.forEach((e) => {
    adj[e.from].push(e.to);
    adj[e.to].push(e.from);
  });

  steps.push({
    description: `Start BFS from node ${startNode}. Push into queue and mark visited.`,
    highlightLines: [0],
    state: {
      currentNode: null,
      visited: Array.from(visited),
      queue: [...queue],
      traversal: [...traversalOrder],
    },
  });

  while (queue.length > 0) {
    const u = queue.shift()!;
    traversalOrder.push(u);

    steps.push({
      description: `Dequeued node ${u}. Processing its unvisited neighbors.`,
      highlightLines: [1, 2],
      state: {
        currentNode: u,
        visited: Array.from(visited),
        queue: [...queue],
        traversal: [...traversalOrder],
      },
    });

    for (const v of adj[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        steps.push({
          description: `Discovered unvisited neighbor ${v} from ${u}. Enqueue ${v}.`,
          highlightLines: [3, 4, 5],
          state: {
            currentNode: u,
            activeEdge: { from: u, to: v },
            visited: Array.from(visited),
            queue: [...queue],
            traversal: [...traversalOrder],
          },
        });
      }
    }
  }

  steps.push({
    description: `BFS traversal finished. Traversal sequence: [${traversalOrder.join(' → ')}].`,
    highlightLines: [0],
    state: {
      currentNode: null,
      visited: Array.from(visited),
      queue: [],
      traversal: [...traversalOrder],
      completed: true,
    },
  });

  return steps;
}

// Generator for DFS
export function generateDfsSteps(startNode: string = 'A'): DsaStep[] {
  const steps: DsaStep[] = [];
  const visited: Set<string> = new Set();
  const stackTrace: string[] = [];
  const traversalOrder: string[] = [];

  const adj: Record<string, string[]> = {};
  SAMPLE_GRAPH.nodes.forEach((n) => (adj[n.id] = []));
  SAMPLE_GRAPH.edges.forEach((e) => {
    adj[e.from].push(e.to);
    adj[e.to].push(e.from);
  });

  function dfs(u: string) {
    visited.add(u);
    stackTrace.push(u);
    traversalOrder.push(u);

    steps.push({
      description: `Visiting node ${u}. Call stack: [${stackTrace.join(' → ')}].`,
      highlightLines: [0, 1],
      state: {
        currentNode: u,
        visited: Array.from(visited),
        stackTrace: [...stackTrace],
        traversal: [...traversalOrder],
      },
    });

    for (const v of adj[u]) {
      if (!visited.has(v)) {
        steps.push({
          description: `Exploring neighbor ${v} from ${u}.`,
          highlightLines: [2, 3],
          state: {
            currentNode: u,
            activeEdge: { from: u, to: v },
            visited: Array.from(visited),
            stackTrace: [...stackTrace],
            traversal: [...traversalOrder],
          },
        });
        dfs(v);
      }
    }

    stackTrace.pop();
    steps.push({
      description: `Backtracking from node ${u}.`,
      highlightLines: [4],
      state: {
        currentNode: u,
        visited: Array.from(visited),
        stackTrace: [...stackTrace],
        traversal: [...traversalOrder],
      },
    });
  }

  dfs(startNode);

  steps.push({
    description: `DFS traversal complete. Visited sequence: [${traversalOrder.join(' → ')}].`,
    highlightLines: [0],
    state: {
      currentNode: null,
      visited: Array.from(visited),
      stackTrace: [],
      traversal: [...traversalOrder],
      completed: true,
    },
  });

  return steps;
}

// Generator for Dijkstra
export function generateDijkstraSteps(startNode: string = 'A'): DsaStep[] {
  const steps: DsaStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited: Set<string> = new Set();

  SAMPLE_GRAPH.nodes.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  });
  dist[startNode] = 0;

  steps.push({
    description: `Initialize Dijkstra: dist[${startNode}] = 0, all other distances = ∞.`,
    highlightLines: [0],
    state: { dist: { ...dist }, visited: [], currentNode: null, activeEdge: null },
  });

  for (let i = 0; i < SAMPLE_GRAPH.nodes.length; i++) {
    // find unvisited node with smallest dist
    let u: string | null = null;
    let minDist = Infinity;

    for (const n of SAMPLE_GRAPH.nodes) {
      if (!visited.has(n.id) && dist[n.id] < minDist) {
        minDist = dist[n.id];
        u = n.id;
      }
    }

    if (!u || minDist === Infinity) break;

    visited.add(u);
    steps.push({
      description: `Extracted node ${u} with minimum settled distance ${minDist}.`,
      highlightLines: [1, 2],
      state: { dist: { ...dist }, visited: Array.from(visited), currentNode: u },
    });

    // Relax neighbors
    for (const edge of SAMPLE_GRAPH.edges) {
      let v: string | null = null;
      let w = edge.weight;
      if (edge.from === u) v = edge.to;
      else if (edge.to === u) v = edge.from;

      if (v && !visited.has(v)) {
        const newDist = dist[u] + w;
        if (newDist < dist[v]) {
          dist[v] = newDist;
          prev[v] = u;
          steps.push({
            description: `Relaxing edge (${u} - ${v}, wt: ${w}): New shorter distance to ${v} is ${newDist}.`,
            highlightLines: [3, 4, 5],
            state: {
              dist: { ...dist },
              visited: Array.from(visited),
              currentNode: u,
              activeEdge: { from: u, to: v },
            },
          });
        }
      }
    }
  }

  steps.push({
    description: `Dijkstra's algorithm terminated. All shortest paths from source ${startNode} computed!`,
    highlightLines: [0],
    state: { dist: { ...dist }, visited: Array.from(visited), currentNode: null, completed: true },
  });

  return steps;
}
