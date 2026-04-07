from app.extensions import db
from app.models.questionnaire_survey import (
    QuestionnaireQuestionBank,
    QuestionnaireSurvey,
    QuestionnaireSurveyQuestion,
    QuestionnaireSurveyResponse,
)

# collect the data
SCALE_OPTIONS = [1, 2, 3, 4, 5, 6, 7]  # changed 


def create_questionnaire_question(data):   # add new question, stand by.
    question_text = (data.get('questionText') or '').strip()
    category = (data.get('category') or '').strip() or None

    if not question_text:
        return None, {'questionText': 'This field is required'}, 400

    if QuestionnaireQuestionBank.query.filter_by(question_text=question_text).first(): # check if there is the same questions.
        return None, {'questionText': 'Question already exists'}, 400

    try:
        question = QuestionnaireQuestionBank(
            question_text=question_text,
            category=category,
        )
        db.session.add(question)     # standerd SQLAlchemy submit process. rollback is for incase bad date into db
        db.session.commit()
        return question.to_dict(), None, 201
    except Exception:
        db.session.rollback()
        raise


def get_questionnaire_questions():  # get all active question in bank
    questions = QuestionnaireQuestionBank.query.filter_by(is_active=True).order_by(
        QuestionnaireQuestionBank.created_at.asc()
    ).all()
    return [question.to_dict() for question in questions], None, 200


def create_questionnaire_survey(data): # make title, id list,verify make sure question exist, build new survey, put in question, submit.
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip() or None
    question_ids = data.get('questionIds') or []

    if not title:
        return None, {'title': 'This field is required'}, 400

    if not isinstance(question_ids, list) or not question_ids: # check no none
        return None, {'questionIds': 'At least one question is required'}, 400

    questions = QuestionnaireQuestionBank.query.filter(
        QuestionnaireQuestionBank.id.in_(question_ids),
        QuestionnaireQuestionBank.is_active.is_(True),
    ).all()

    if len(questions) != len(question_ids):
        return None, {'questionIds': 'One or more questionIds are invalid'}, 400

    try:
        survey = QuestionnaireSurvey(
            title=title,
            description=description,
            is_active=True,
        )
        db.session.add(survey)
        db.session.flush()   # important!!! fluch make current object in to the bussiness, let db genrate id and no need real commit now. (sometime no id if not flush)

        for index, question_id in enumerate(question_ids, start=1): # reorder
            survey_question = QuestionnaireSurveyQuestion(
                survey_id=survey.id,
                question_bank_id=question_id,
                question_order=index,
                is_required=True,
            )
            db.session.add(survey_question)

        db.session.commit()

        created_survey = QuestionnaireSurvey.query.get(survey.id)
        return created_survey.to_dict(include_questions=True), None, 201
    except Exception:
        db.session.rollback()
        raise


def get_all_questionnaire_surveys():
    surveys = QuestionnaireSurvey.query.order_by(QuestionnaireSurvey.created_at.desc()).all()
    return [survey.to_dict() for survey in surveys], None, 200


def get_questionnaire_survey_by_id(survey_id):  #get into specific survey
    survey = QuestionnaireSurvey.query.get(survey_id)
    if not survey:
        return None, 'Questionnaire survey not found', 404

    return survey.to_dict(include_questions=True), None, 200


def submit_questionnaire_survey_responses(survey_id, data):
    survey = QuestionnaireSurvey.query.get(survey_id)
    if not survey:  #make sure exist
        return None, 'Questionnaire survey not found', 404

    answers = data.get('answers') or []   # get answers
    respondent_name = (data.get('respondentName') or '').strip() or None
    respondent_email = (data.get('respondentEmail') or '').strip() or None

    if not isinstance(answers, list) or not answers:
        return None, {'answers': 'This field is required'}, 400

    survey_questions = survey.questions.order_by(QuestionnaireSurveyQuestion.question_order.asc()).all()
    survey_question_ids = {str(question.id) for question in survey_questions}
    required_question_ids = {str(question.id) for question in survey_questions if question.is_required}

    answered_question_ids = []
    for answer in answers:
        survey_question_id = answer.get('surveyQuestionId')
        score = answer.get('score')

        if not survey_question_id:
            return None, {'surveyQuestionId': 'This field is required'}, 400

        if survey_question_id not in survey_question_ids:
            return None, {'surveyQuestionId': f'Invalid surveyQuestionId: {survey_question_id}'}, 400

        if not isinstance(score, int) or score not in SCALE_OPTIONS:
            return None, {'score': 'Score must be an integer between 1 and 5'}, 400

        answered_question_ids.append(survey_question_id)

    if len(answered_question_ids) != len(set(answered_question_ids)):   # correctness check ,see if list len= set len, (any repeat answer for one question)
        return None, {'answers': 'Each question can only be answered once'}, 400

    if set(answered_question_ids) != required_question_ids: # missing any question
        return None, {'answers': 'All required questions must be answered'}, 400

    try:
        created_responses = []
        for answer in answers:
            response = QuestionnaireSurveyResponse(  # write in db
                survey_id=survey.id,
                survey_question_id=answer['surveyQuestionId'],
                score=answer['score'],
                respondent_name=respondent_name,
                respondent_email=respondent_email,
            )
            db.session.add(response)
            created_responses.append(response)

        db.session.commit()
        return [response.to_dict() for response in created_responses], None, 201
    except Exception:
        db.session.rollback()
        raise
