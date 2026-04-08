import uuid

from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


class QuestionnaireSurvey(db.Model):    #question content
    __tablename__ = 'questionnaire_surveys'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  #main key use uuid, will not auto increase. or we can do use auto increase, may change later.
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)  #consider
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())  #time stamp
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
    )  #all of these make survey.questions.all() work
    
    #to_dict is trans data format from object to json.
    def to_dict(self, include_questions=False):  # for (include_questions)uncertain if need return question info, so just keep it.
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


class QuestionnaireQuestionBank(db.Model):  #library, to manage the question or update.
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


class QuestionnaireSurveyQuestion(db.Model):  # a mid table to connect the question survey and the Bank.
    __tablename__ = 'questionnaire_survey_questions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    survey_id = db.Column(UUID(as_uuid=True), db.ForeignKey('questionnaire_surveys.id', ondelete='CASCADE'), nullable=False)
    question_bank_id = db.Column(UUID(as_uuid=True), db.ForeignKey('questionnaire_question_bank.id', ondelete='CASCADE'), nullable=False)
    question_order = db.Column(db.Integer, nullable=False)
    is_required = db.Column(db.Boolean, nullable=False, default=True)

    __table_args__ = (
        db.UniqueConstraint('survey_id', 'question_bank_id', name='uq_survey_question_bank'), # no same question
        db.UniqueConstraint('survey_id', 'question_order', name='uq_survey_question_order'),
        db.Index('idx_qsq_survey_id', 'survey_id'),  # speed up
        db.Index('idx_qsq_question_bank_id', 'question_bank_id'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),  
            'surveyId': str(self.survey_id), # which survey it belongs to
            'questionBankId': str(self.question_bank_id), # whcih question in bank
            'questionText': self.question_bank.question_text if self.question_bank else None, # stand by, not sure???
            'category': self.question_bank.category if self.question_bank else None,
            'questionOrder': self.question_order,
            'isRequired': self.is_required, # necessory or not.
            'scaleOptions': [1, 2, 3, 4, 5, 6, 7],   # change later
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

    submission_id = db.Column(UUID(as_uuid=True), db.ForeignKey('questionnaire_survey_submissions.id', ondelete='CASCADE'), nullable=False)

    survey_question = db.relationship('QuestionnaireSurveyQuestion')

    __table_args__ = (
        db.CheckConstraint('score >= 1 AND score <= 7', name='chk_questionnaire_score_range'),   # changed
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
            'submissionId': str(self.submission_id),
        }

#=============================================submission part

import uuid

from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


class QuestionnaireSurveySubmission(db.Model):
    __tablename__ = 'questionnaire_survey_submissions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    survey_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('questionnaire_surveys.id', ondelete='CASCADE'),
        nullable=False
    )

    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False
    )

    # community(for dashboard）
    community_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('communities.id', ondelete='CASCADE'),
        nullable=False
    )

    # submit time
    submitted_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now()
    )

    # timestamp
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now()
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )

    # relation
    survey = db.relationship('QuestionnaireSurvey', backref=db.backref('submissions', lazy='dynamic'))
    user = db.relationship('User')
    community = db.relationship('Community')

    __table_args__ = (
        # prevent from repeat submit
        db.UniqueConstraint(
            'survey_id',
            'user_id',
            'community_id',
            name='uq_submission_user_survey_community'
        ),
        db.Index('idx_submission_survey_id', 'survey_id'),
        db.Index('idx_submission_user_id', 'user_id'),
        db.Index('idx_submission_community_id', 'community_id'),
    )

    def to_dict(self):
        return {
            'id': str(self.id),
            'surveyId': str(self.survey_id),
            'userId': str(self.user_id),
            'communityId': str(self.community_id),
            'status': self.status,
            'submittedAt': self.submitted_at.isoformat() + 'Z',
            'createdAt': self.created_at.isoformat() + 'Z',
        }
