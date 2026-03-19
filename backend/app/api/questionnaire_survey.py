from flask import Blueprint, request

from app.services.questionnaire_survey_service import (
    create_questionnaire_question,
    create_questionnaire_survey,
    get_all_questionnaire_surveys,
    get_questionnaire_questions,
    get_questionnaire_survey_by_id,
    submit_questionnaire_survey_responses,
)
from app.utils.decorators import role_required
from app.utils.response import error_response, success_response
from app.utils.validators import validate_email, validate_required_fields

questionnaire_survey_bp = Blueprint('questionnaire_survey', __name__)


@questionnaire_survey_bp.route('/questions', methods=['POST'])
@role_required('admin')
def create_question():
    data = request.get_json(silent=True)
    if data is None:
        return error_response('Validation failed', 400, details={'body': 'Request body is required'})

    required = ['questionText']
    missing = validate_required_fields(data, required)
    if missing:
        return error_response(
            'Validation failed',
            400,
            details={field: 'This field is required' for field in missing},
        )

    result, err, status = create_questionnaire_question(data)
    if err:
        return error_response('Validation failed', status, details=err)

    return success_response(result, 'Question created successfully', status)


@questionnaire_survey_bp.route('/questions', methods=['GET'])
def get_questions():
    result, err, status = get_questionnaire_questions()
    if err:
        return error_response(err, status)

    return success_response(result, 'Questions retrieved successfully', status)


@questionnaire_survey_bp.route('', methods=['POST'])
@role_required('admin')
def create_survey():
    data = request.get_json(silent=True)
    if data is None:
        return error_response('Validation failed', 400, details={'body': 'Request body is required'})

    required = ['title', 'questionIds']
    missing = validate_required_fields(data, required)
    if missing:
        return error_response(
            'Validation failed',
            400,
            details={field: 'This field is required' for field in missing},
        )

    result, err, status = create_questionnaire_survey(data)
    if err:
        return error_response('Validation failed', status, details=err)

    return success_response(result, 'Questionnaire survey created successfully', status)


@questionnaire_survey_bp.route('', methods=['GET'])
def get_surveys():
    result, err, status = get_all_questionnaire_surveys()
    if err:
        return error_response(err, status)

    return success_response(result, 'Questionnaire surveys retrieved successfully', status)


@questionnaire_survey_bp.route('/<survey_id>', methods=['GET'])
def get_survey(survey_id):
    result, err, status = get_questionnaire_survey_by_id(survey_id)
    if err:
        return error_response(err, status)

    return success_response(result, 'Questionnaire survey retrieved successfully', status)


@questionnaire_survey_bp.route('/<survey_id>/responses', methods=['POST'])
def submit_responses(survey_id):
    data = request.get_json(silent=True)
    if data is None:
        return error_response('Validation failed', 400, details={'body': 'Request body is required'})

    respondent_email = data.get('respondentEmail')
    if respondent_email and not validate_email(respondent_email):
        return error_response(
            'Validation failed',
            400,
            details={'respondentEmail': 'Must be a valid email address'},
        )

    result, err, status = submit_questionnaire_survey_responses(survey_id, data)
    if err:
        if isinstance(err, dict):
            return error_response('Validation failed', status, details=err)
        return error_response(err, status)

    return success_response(result, 'Responses submitted successfully', status)
