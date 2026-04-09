from app.models.community_member import CommunityMember
from app.models.questionnaire_survey import QuestionnaireSurveySubmission
from app.services.auth_service import get_current_user_context


def get_dashboard_data():
    context, err, status = get_current_user_context()
    if err:
        return None, err, status

    community = context['community']
    community_id = community.id

    member_count = CommunityMember.query.filter_by(community_id=community_id).count()
    response_count = QuestionnaireSurveySubmission.query.filter_by(community_id=community_id).count()

    return {
        'communityName': community.community_name,
        'region': community.region,
        'disasterType': community.disaster_type,
        'inviteCode': community.invite_code,
        'memberCount': member_count,
        'responseCount': response_count,
    }, None, 200
