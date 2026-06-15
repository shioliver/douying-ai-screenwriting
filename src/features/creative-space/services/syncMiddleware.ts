// @ts-nocheck
/**
 * 抖影AI 数据同步工具
 *
 * 提供项目 ID 管理、在线状态管理、全量快照保存等工具函数。
 * 不做自动同步 — 数据只在用户点「保存」时写入数据库。
 *
 * @developer 光波 (a@ggbo.com)
 * @copyright Copyright (c) 2025 光波. All rights reserved.
 */

import type { AppNode, Connection, Group } from '../types';
import { saveProjectSnapshot } from './api';

let currentProjectId: string | null = null;
let online = false;

export function setSyncProjectId(id: string | null) {
  currentProjectId = id;
}

export function getSyncProjectId(): string | null {
  return currentProjectId;
}

export async function initSync(): Promise<boolean> {
  // 不做预先网络检测，直接在实际调用时处理错误
  online = true; // 假设在线，实际请求失败时会设置为 false
  return online;
}

export function isOnline(): boolean {
  return online && currentProjectId !== null;
}

export function setOnlineStatus(status: boolean) {
  online = status;
}

/** 全量快照保存（用户点「保存」时调用） */
export async function syncFullSnapshot(
  nodes: AppNode[],
  connections: Connection[],
  groups: Group[],
) {
  if (!isOnline()) return;
  await saveProjectSnapshot(currentProjectId!, { nodes, connections, groups });
}

/** 创建 store 订阅，用于自动同步数据变化 */
export function createStoreSubscription(store: any) {
  // 订阅 store 的变化，当数据改变时自动同步到后端
  const unsubscribe = store.subscribe(
    (state: any) => ({
      nodes: state.nodes,
      connections: state.connections,
      groups: state.groups,
    }),
    async (state) => {
      if (!isOnline() || !currentProjectId) return;
      try {
        await syncFullSnapshot(state.nodes, state.connections, state.groups);
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }
  );
  return unsubscribe;
}
