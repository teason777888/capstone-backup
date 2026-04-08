from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required


from app.services.questionnaire_survey_service import (
    create_questionnaire_question,
    create_questionnaire_survey,
    get_all_questionnaire_surveys,
    get_questionnaire_questions,
    get_questionnaire_survey_by_id,
    submit_questionnaire_survey_responses,
    get_questionnaire_submission_count,
)
from app.utils.decorators import role_required
from app.utils.response import error_response, success_response
from app.utils.validators import validate_email, validate_required_fields

# http request to service call, then return http.

questionnaire_survey_bp = Blueprint('questionnaire_survey', __name__)   # flask learn.


@questionnaire_survey_bp.route('/questions', methods=['POST'])  #route
@role_required('admin')     # access limit
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
    data = request.get_json(silent=True)  # get json and if its illegal return none instead of expect a error.
    if data is None:
        return error_response('Validation failed', 400, details={'body': 'Request body is required'})

    required = ['title', 'questionIds']
    missing = validate_required_fields(data, required)   # utils check missing any necessary field.  learn..
    if missing:
        return error_response(
            'Validation failed',
            400,
            details={field: 'This field is required' for field in missing},
        )

    result, err, status = create_questionnaire_survey(data)   # call services each-=-=-=-=
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
@jwt_required()
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

    community_id = data.get('communityId')
    if not community_id:
        return error_response(
            'Validation failed',
            400,
            details={'communityId': 'This field is required'},
        )

    user_id = get_jwt_identity()

    result, err, status = submit_questionnaire_survey_responses(
        survey_id=survey_id,
        user_id=user_id,
        community_id=community_id,
        data=data,
    )
    if err:
        if isinstance(err, dict):
            return error_response('Validation failed', status, details=err)
        return error_response(err, status)

    return success_response(result, 'Responses submitted successfully', status)

@questionnaire_survey_bp.route('/<survey_id>/submission-count', methods=['GET'])
def get_submission_count(survey_id):
    community_id = request.args.get('communityId')
    if not community_id:
        return error_response(
            'Validation failed',
            400,
            details={'communityId': 'This field is required'},
            )
    result, err, status = get_questionnaire_submission_count(survey_id, community_id)
    if err:
        return error_response(err, status)

    return success_response(result, 'Submission count retrieved successfully', status)
