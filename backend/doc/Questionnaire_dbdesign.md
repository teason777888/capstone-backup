# 数据表设计说明

# 1. `questionnaire_surveys`

问卷模板表

### 作用

存一份问卷的基本信息。

### 字段

- `id`：问卷 id
- `title`：问卷标题
- `description`：问卷描述
- `is_active`：是否启用
- `created_at`：创建时间
- `updated_at`：更新时间

------

## 2. `questionnaire_question_bank`

题库表

### 作用

存所有可复用的题目。

### 字段

- `id`：题目 id
- `question_text`：题目文本
- `category`：题目分类
- `is_active`：是否启用
- `created_at`：创建时间
- `updated_at`：更新时间

------

## 3. `questionnaire_survey_questions`

问卷题目关联表

### 作用

把“问卷”和“题库题目”关联起来，并记录题目顺序。

### 字段

- `id`：关联 id
- `survey_id`：所属问卷 id
- `question_bank_id`：题库题目 id
- `question_order`：题目顺序
- `is_required`：是否必答

### 说明

这张表不是用户作答数据，而是问卷模板结构的一部分。

------

## 4. `questionnaire_survey_submissions`

整份问卷提交表

### 作用

表示某个用户完成了一整份问卷提交。

### 这是新增的关键表

### 字段

- `id`：submission id
- `survey_id`：对应哪份问卷
- `user_id`：谁提交的
- `community_id`：属于哪个组
- `submitted_at`：提交时间
- `status`：状态，当前建议固定为 `submitted`
- `created_at`：创建时间
- `updated_at`：更新时间

以前只有每道题答案，没有“整份提交”的概念。
 加入 submission 后，能准确支持：

- 统计组内提交人数
- 统计未提交人数
- 按一整份问卷结果做分析
- 给 dashboard 返回 `responseCount`

------

## 5. `questionnaire_survey_responses`

问卷答案表

### 作用

存每一道题的分数。

### 字段

- `id`：答案 id
- `survey_id`：问卷 id
- `survey_question_id`：问卷中的题目 id
- `submission_id`：属于哪一次整份提交
- `score`：分数，当前固定为 1–7
- `respondent_name`：可选
- `respondent_email`：可选
- `submitted_at`：提交时间

### 说明

这张表一条记录只表示一道题的答案。
 一整份问卷会对应多条 `response`，并通过 `submission_id` 归属到同一次提交。