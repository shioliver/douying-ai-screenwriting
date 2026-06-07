import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

// 检查 AWS 凭证是否已配置
const hasAwsCredentials = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_ACCESS_KEY_ID !== 'your-access-key-id' &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_SECRET_ACCESS_KEY !== 'your-secret-access-key'
)

const client = hasAwsCredentials
  ? new DynamoDBClient({
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    })
  : null

export const docClient = client ? DynamoDBDocumentClient.from(client) : null

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'douyin-scripts'

export const isDynamoDBAvailable = !!docClient

export interface ScriptRecord {
  userId: string
  scriptId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

// ---- 本地内存存储（DynamoDB 不可用时的 fallback） ----

const localStore = new Map<string, ScriptRecord>()

function localKey(userId: string, scriptId: string) {
  return `${userId}#${scriptId}`
}

// ---- 统一接口 ----

export async function listScripts(userId: string): Promise<ScriptRecord[]> {
  if (!isDynamoDBAvailable) {
    const results: ScriptRecord[] = []
    for (const [, record] of localStore) {
      if (record.userId === userId) {
        results.push(record)
      }
    }
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
    ScanIndexForward: false,
  })

  const result = await docClient!.send(command)
  return (result.Items || []) as ScriptRecord[]
}

export async function getScript(userId: string, scriptId: string): Promise<ScriptRecord | undefined> {
  if (!isDynamoDBAvailable) {
    return localStore.get(localKey(userId, scriptId))
  }

  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { userId, scriptId },
  })

  const result = await docClient!.send(command)
  return result.Item as ScriptRecord | undefined
}

export async function createScript(record: ScriptRecord): Promise<void> {
  if (!isDynamoDBAvailable) {
    localStore.set(localKey(record.userId, record.scriptId), record)
    return
  }

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: record,
  })

  await docClient!.send(command)
}

export async function updateScript(userId: string, scriptId: string, updates: Partial<ScriptRecord>): Promise<void> {
  if (!isDynamoDBAvailable) {
    const key = localKey(userId, scriptId)
    const existing = localStore.get(key)
    if (existing) {
      localStore.set(key, { ...existing, ...updates })
    }
    return
  }

  const updateExpr: string[] = []
  const exprAttrNames: Record<string, string> = {}
  const exprAttrValues: Record<string, unknown> = {}

  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'userId' || key === 'scriptId') return
    const placeholder = `#${key}`
    const valuePlaceholder = `:${key}`
    updateExpr.push(`${placeholder} = ${valuePlaceholder}`)
    exprAttrNames[placeholder] = key
    exprAttrValues[valuePlaceholder] = value
  })

  if (updateExpr.length === 0) return

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { userId, scriptId },
    UpdateExpression: `SET ${updateExpr.join(', ')}`,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
  })

  await docClient!.send(command)
}

export async function deleteScript(userId: string, scriptId: string): Promise<void> {
  if (!isDynamoDBAvailable) {
    localStore.delete(localKey(userId, scriptId))
    return
  }

  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { userId, scriptId },
  })

  await docClient!.send(command)
}
