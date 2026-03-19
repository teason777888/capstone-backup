import uuid

from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


class QuestionnaireSurvey(db.Model):
    __tablename__ = 'questionnaire_surveys'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now(), onupdate=db.func.now())

    questions = db.relationship(
        'QuestionnaireSurveyQuestion',
        backref='survey',
        lazy='dynamic',
        cascade='all, delete-orphan',
    )
    responses = db.relationship(
        'QuestionnaireSurveyResponse',
        backref='survey',
        lazy='dynamic',
        cascade='all, delete-orphan',
    )

    def to_dict(self, include_questions=False):
        data = {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() + 'Z',
        }

        if include_questions:
            data['questions'] = [
                question.to_dict()
                for question in self.questions.order_by(QuestionnaireSurveyQuestion.question_order.asc()).all()
            ]

        return data


class QuestionnaireQuestionBank(db.Model):
    __tablename__ = 'questionnaire_question_bank'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = db.Column(db.Text, nullable=False, unique=True)
    category = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now(), onupdate=db.func.now())

    survey_links = db.relationship(
        'QuestionnaireSurveyQuestion',
        backref='question_bank',
        lazy='dynamic',
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'questionText': self.question_text,
            'category': self.category,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() + 'Z',
        }


class QuestionnaireSurveyQuestion(db.Model):
    __tablename__ = 'questionnaire_survey_questions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    survey_id = db.Column(UUID(as_uuid=True), db.ForeignKey('questionnaire_surveys.id', ondelete='CASCADE'), nullable=False)
    question_bank_id = db.Column(UUID(as_uuid=True), db.ForeignKey('questionnaire_question_bank.id', ondelete='CASCADE'), nullable=False)
    question_order = db.Column(db.Integer, nullable=False)
    is_required = db.Column(db.Boolean, nullable=False, default=True)

    __table_args__ = (
        db.UniqueConstraint('survey_id', 'question_bank_id', name='uq_survey_question_bank'),
        db.UniqueConstraint('survey_id', 'question_order', name='uq_survey_question_order'),
        db.Index('idx_qsq_survey_id', 'survey_id'),
        db.Index('idx_qsq_question_bank_id', 'question_bank_id'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'surveyId': str(self.survey_id),
            'questionBankId': str(self.question_bank_id),
            'questionText': self.question_bank.question_text if self.question_bank else None,
            'category': self.question_bank.category if self.question_bank else None,
            'questionOrder': self.question_order,
            'isRequired': self.is_required,
            'scaleOptions': [1, 2, 3, 4, 5],
        }


class QuestionnaireSurveyResponse(db.Model):
    __tablename__ = 'questionnaire_survey_responses'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    survey_id = db.Column(UUID(as_uuid=True), db.ForeignKey('questionnaire_surveys.id', ondelete='CASCADE'), nullable=False)
    survey_question_id = db.Column(UUID(as_uuid=True), db.ForeignKey('questionnaire_survey_questions.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    respondent_name = db.Column(db.String(100), nullable=True)
    respondent_email = db.Column(db.String(255), nullable=True)
    submitted_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())

    survey_question = db.relationship('QuestionnaireSurveyQuestion')

    __table_args__ = (
        db.CheckConstraint('score >= 1 AND score <= 5', name='chk_questionnaire_score_range'),
        db.Index('idx_qsr_survey_id', 'survey_id'),
        db.Index('idx_qsr_survey_question_id', 'survey_question_id'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'surveyId': str(self.survey_id),
            'surveyQuestionId': str(self.survey_question_id),
            'score': self.score,
            'respondentName': self.respondent_name,
            'respondentEmail': self.respondent_email,
            'submittedAt': self.submitted_at.isoformat() + 'Z',
        }
