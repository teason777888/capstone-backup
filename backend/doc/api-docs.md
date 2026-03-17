# 灾害恢复社区管理系统 — API 文档

> Base URL: `/api`  |  Content-Type: `application/json`  |  认证: `Authorization: Bearer <token>`

---

## 1. 用户注册

`POST /api/register`

注册新用户并自动创建社区，注册者为社区管理员（admin）。

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fullName` | string | 是 | 用户全名，1–100 字符 |
| `email` | string | 是 | 邮箱，全局唯一 |
| `password` | string | 是 | 密码，最少 8 位 |
| `communityName` | string | 是 | 社区名称 |
| `groupNumber` | string | 否 | 组号 |
| `disasterType` | string | 是 | 灾害类型（flood / earthquake / hurricane / wildfire / tornado / tsunami / drought / other） |
| `region` | string | 是 | 受影响区域 |

**Response — 200 OK**

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.userId` | string (UUID) | 用户 ID |
| `data.groupName` | string | 社区名称 |
| `data.inviteCode` | string | 6 位邀请码，用于邀请他人加入社区 |
| `data.createdAt` | string (ISO 8601) | 创建时间 |

```json
// 请求
{
  "fullName": "Zhang Wei",
  "email": "zhangwei@example.com",
  "password": "SecurePass123",
  "communityName": "Riverside Recovery Committee",
  "groupNumber": "G-03",
  "disasterType": "flood",
  "region": "Brisbane South"
}

// 成功响应
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "groupName": "Riverside Recovery Committee",
    "inviteCode": "X7A9BQ",
    "createdAt": "2026-03-17T10:30:00Z"
  }
}

// 失败响应 — 400
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email already exists",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## 2. 用户登录

`POST /api/login`

验证凭据，返回用户信息和 JWT token。

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `email` | string | 是 | 注册邮箱 |
| `password` | string | 是 | 密码 |

**Response — 200 OK**

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.id` | string (UUID) | 用户 ID |
| `data.name` | string | 用户全名 |
| `data.email` | string | 邮箱 |
| `data.role` | string | 角色：`"admin"` 或 `"member"` |
| `data.token` | string | JWT token |
| `data.expiresIn` | number | token 有效期（秒），默认 3600 |

```json
// 请求
{
  "email": "zhangwei@example.com",
  "password": "SecurePass123"
}

// 成功响应
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Zhang Wei",
    "email": "zhangwei@example.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}

// 失败响应 — 401
{
  "success": false,
  "error": "Invalid email or password"
}

// 失败响应 — 400
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

---

## 通用错误格式

所有接口失败时统一返回：

```json
{
  "success": false,
  "error": "错误概述",
  "details": { "字段名": "具体错误" }  // 仅 400 时存在
}
```

| 状态码 | 使用场景 |
|--------|----------|
| 200 | 成功 |
| 400 | 参数缺失、格式错误、邮箱已存在 |
| 401 | 邮箱或密码不正确 |
| 500 | 服务器内部错误 |
