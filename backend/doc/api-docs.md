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

## 3. 更新个人资料

`PUT /api/profile`

更新当前登录用户资料。`fullName` 更新用户姓名；`region` 更新当前用户所属社区的区域信息。

**Header**

| 名称 | 必填 | 说明 |
|------|------|------|
| `Authorization` | 是 | `Bearer <token>` |

**Request Body**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fullName` | string | 否 | 用户全名，1–100 字符 |
| `region` | string | 否 | 社区区域，仅社区管理员（admin）可更新 |

> 至少需要提供一个可更新字段。

```json
{
  "fullName": "New Name",
  "region": "Sydney, NSW"
}
```

**Response — 200 OK**

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.fullName` | string | 更新后的用户姓名 |
| `data.region` | string | 更新后的社区区域 |

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "fullName": "New Name",
    "region": "Sydney, NSW"
  }
}
```

**权限说明**

- 所有已登录用户都可以更新 `fullName`。
- 只有社区管理员（admin）可以更新 `region`。
- 非管理员提交 `region` 时返回 `403 Forbidden`。

---

## 4. 通用错误格式

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
| 400 | 参数缺失、格式错误、邮箱已存在、空请求体 |
| 401 | 邮箱或密码不正确，或未提供/无效/过期的 token |
| 403 | 权限不足（例如非 admin 尝试更新 `region`） |
| 500 | 服务器内部错误 |
