## 接口1：获取题库列表

### 请求

**GET** `/api/v1/questionnaire-surveys/questions`

### 请求头

可根据你们项目规范决定是否带 token。
 如果题库只给管理员看，就要加权限；如果普通用户也能看，可不限制。

### 成功返回示例

```
{
  "success": true,
  "message": "Questions retrieved successfully",
  "data": [
    {
      "id": "8b8e3f18-1111-2222-3333-444444444444",
      "questionText": "Committee members actively participate in decision-making.",
      "category": "participation",
      "isActive": true,
      "createdAt": "2026-04-08T10:00:00Z"
    },
    {
      "id": "9c9f4a29-5555-6666-7777-888888888888",
      "questionText": "The committee communicates effectively with the community.",
      "category": "communication",
      "isActive": true,
      "createdAt": "2026-04-08T10:01:00Z"
    }
  ]
}
```

------

## 接口 2：新增题库题目

### 请求

**POST** `/api/v1/questionnaire-surveys/questions`

### 请求头

```
Authorization: Bearer <token>
```

### 请求体

```
{
  "questionText": "Committee members actively participate in decision-making.",
  "category": "participation"
}
```

### 字段说明

- `questionText`: 题目内容，必填
- `category`: 分类，可选

### 成功返回

```
{
  "success": true,
  "message": "Question created successfully",
  "data": {
    "id": "8b8e3f18-1111-2222-3333-444444444444",
    "questionText": "Committee members actively participate in decision-making.",
    "category": "participation",
    "isActive": true,
    "createdAt": "2026-04-08T10:00:00Z"
  }
}
```

### 失败返回示例

```
{
  "success": false,
  "message": "Validation failed",
  "details": {
    "questionText": "This field is required"
  }
}
```

------

## 接口 3：创建问卷

### 请求

**POST** `/api/v1/questionnaire-surveys`

### 请求头

```
Authorization: Bearer <token>
```

### 请求体

```
{
  "title": "CRC Governance Assessment",
  "description": "Questionnaire survey for governance effectiveness",
  "questionIds": [
    "8b8e3f18-1111-2222-3333-444444444444",
    "9c9f4a29-5555-6666-7777-888888888888"
  ]
}
```

### 字段说明

- `title`: 问卷标题，必填
- `description`: 问卷描述，可选
- `questionIds`: 题库题目 id 数组，必填，至少一题

### 成功返回

```
{
  "success": true,
  "message": "Questionnaire survey created successfully",
  "data": {
    "id": "11111111-2222-3333-4444-555555555555",
    "title": "CRC Governance Assessment",
    "description": "Questionnaire survey for governance effectiveness",
    "isActive": true,
    "createdAt": "2026-04-08T10:10:00Z",
    "questions": [
      {
        "id": "aaaa1111-2222-3333-4444-555555555555",
        "surveyId": "11111111-2222-3333-4444-555555555555",
        "questionBankId": "8b8e3f18-1111-2222-3333-444444444444",
        "questionText": "Committee members actively participate in decision-making.",
        "category": "participation",
        "questionOrder": 1,
        "isRequired": true,
        "scaleOptions": [1, 2, 3, 4, 5, 6, 7]
      },
      {
        "id": "bbbb1111-2222-3333-4444-555555555555",
        "surveyId": "11111111-2222-3333-4444-555555555555",
        "questionBankId": "9c9f4a29-5555-6666-7777-888888888888",
        "questionText": "The committee communicates effectively with the community.",
        "category": "communication",
        "questionOrder": 2,
        "isRequired": true,
        "scaleOptions": [1, 2, 3, 4, 5, 6, 7]
      }
    ]
  }
}
```

------

## 接口 4：获取问卷列表

### 请求

**GET** `/api/v1/questionnaire-surveys`

### 成功返回

```
{
  "success": true,
  "message": "Questionnaire surveys retrieved successfully",
  "data": [
    {
      "id": "11111111-2222-3333-4444-555555555555",
      "title": "CRC Governance Assessment",
      "description": "Questionnaire survey for governance effectiveness",
      "isActive": true,
      "createdAt": "2026-04-08T10:10:00Z"
    }
  ]
}
```

------

## 接口 5：获取单份问卷详情

### 请求

**GET** `/api/v1/questionnaire-surveys/<survey_id>`

### 作用

前端打开某份问卷页面时，调用该接口获取：

- 标题
- 描述
- 题目
- 每题固定 1–7 选项

### 成功返回

```
{
  "success": true,
  "message": "Questionnaire survey retrieved successfully",
  "data": {
    "id": "11111111-2222-3333-4444-555555555555",
    "title": "CRC Governance Assessment",
    "description": "Questionnaire survey for governance effectiveness",
    "isActive": true,
    "createdAt": "2026-04-08T10:10:00Z",
    "questions": [
      {
        "id": "aaaa1111-2222-3333-4444-555555555555",
        "surveyId": "11111111-2222-3333-4444-555555555555",
        "questionBankId": "8b8e3f18-1111-2222-3333-444444444444",
        "questionText": "Committee members actively participate in decision-making.",
        "category": "participation",
        "questionOrder": 1,
        "isRequired": true,
        "scaleOptions": [1, 2, 3, 4, 5, 6, 7]
      }
    ]
  }
}
```

### 失败返回

```
{
  "success": false,
  "message": "Questionnaire survey not found"
}
```

------

## 接口 6：提交整份问卷

### 请求

**POST** `/api/v1/questionnaire-surveys/<survey_id>/responses`

### 请求头

```
Authorization: Bearer <token>
```

### 请求体

```
{
  "answers": [
    {
      "surveyQuestionId": "aaaa1111-2222-3333-4444-555555555555",
      "score": 6
    },
    {
      "surveyQuestionId": "bbbb1111-2222-3333-4444-555555555555",
      "score": 7
    }
  ]
}
```

### 说明

- 当前题目量表固定为 `1–7`
- 前端不需要自己传 `submissionId`
- 后端在接收到整份问卷后，会自动：
  1. 创建一条 `submission`
  2. 为每一道题创建对应 `response`

### 建议成功返回

前端最好能拿到 submission 信息，所以建议返回如下结构：

```
{
  "success": true,
  "message": "Responses submitted successfully",
  "data": {
    "submission": {
      "id": "subm1111-2222-3333-4444-555555555555",
      "surveyId": "11111111-2222-3333-4444-555555555555",
      "userId": "user1111-2222-3333-4444-555555555555",
      "communityId": "comm1111-2222-3333-4444-555555555555",
      "status": "submitted",
      "submittedAt": "2026-04-08T10:20:00Z",
      "createdAt": "2026-04-08T10:20:00Z"
    },
    "responses": [
      {
        "id": "resp1111-2222-3333-4444-555555555555",
        "surveyId": "11111111-2222-3333-4444-555555555555",
        "surveyQuestionId": "aaaa1111-2222-3333-4444-555555555555",
        "submissionId": "subm1111-2222-3333-4444-555555555555",
        "score": 6,
        "submittedAt": "2026-04-08T10:20:00Z"
      },
      {
        "id": "resp2222-2222-3333-4444-555555555555",
        "surveyId": "11111111-2222-3333-4444-555555555555",
        "surveyQuestionId": "bbbb1111-2222-3333-4444-555555555555",
        "submissionId": "subm1111-2222-3333-4444-555555555555",
        "score": 7,
        "submittedAt": "2026-04-08T10:20:00Z"
      }
    ]
  }
}
```

### 失败返回示例

#### 分数不合法

```
{
  "success": false,
  "message": "Validation failed",
  "details": {
    "score": "Score must be an integer between 1 and 7"
  }
}
```

#### 问卷不存在

```
{
  "success": false,
  "message": "Questionnaire survey not found"
}
```

#### 题目不属于该问卷

```
{
  "success": false,
  "message": "Validation failed",
  "details": {
    "surveyQuestionId": "Invalid surveyQuestionId: aaaa1111-2222-3333-4444-555555555555"
  }
}
```





# 问卷回答数量接口：

GET /api/v1/questionnaire-surveys/123/submission-count?communityId=456

## 获取某组某份问卷的已提交人数

### 接口说明
用于统计某一个组（community）中，有多少个成员已经提交了指定问卷。  
该接口返回的是**已提交人数**，不是答案条数。

---

### 请求方式
`GET`

### 请求路径
`/api/v1/questionnaire-surveys/<survey_id>/submission-count?communityId=<community_id>`

---

### Path 参数

| 参数名    | 类型   | 必填 | 说明    |
| --------- | ------ | ---- | ------- |
| survey_id | string | 是   | 问卷 ID |

---

### Query 参数

| 参数名      | 类型   | 必填 | 说明  |
| ----------- | ------ | ---- | ----- |
| communityId | string | 是   | 组 ID |

---

