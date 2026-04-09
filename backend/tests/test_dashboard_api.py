import unittest
import uuid

from app import create_app
from app.extensions import db
from app.models import Community, CommunityMember, User
from app.models.questionnaire_survey import QuestionnaireSurvey, QuestionnaireSurveySubmission


class DashboardApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app('development')
        cls.client = cls.app.test_client()

    def make_identity(self, prefix='dashboard', role='admin'):
        token = uuid.uuid4().hex[:10]
        return {
            'email': f'{prefix}-{token}@example.com',
            'full_name': f'{prefix.title()} User',
            'password': 'SecurePass123',
            'community_name': f'{prefix.title()} Community',
            'invite_code': f'{token[:6].upper()}X',
            'role': role,
        }

    def create_user_with_community(self, *, identity=None, community=None, role='admin'):
        identity = identity or self.make_identity(role=role)
        with self.app.app_context():
            user = User(full_name=identity['full_name'], email=identity['email'])
            user.set_password(identity['password'])
            db.session.add(user)
            db.session.flush()

            if community is None:
                community = Community(
                    community_name=identity['community_name'],
                    group_number='G-99',
                    disaster_type='flood',
                    region='Northern Rivers, NSW',
                    invite_code=identity['invite_code'],
                    created_by=user.id,
                )
                db.session.add(community)
                db.session.flush()

            membership = CommunityMember(
                user_id=user.id,
                community_id=community.id,
                role=role,
            )
            db.session.add(membership)
            db.session.commit()

            return {
                'identity': identity,
                'user_id': user.id,
                'community_id': community.id,
            }

    def create_survey(self, title):
        with self.app.app_context():
            survey = QuestionnaireSurvey(title=title, description=f'{title} description')
            db.session.add(survey)
            db.session.commit()
            return survey.id

    def create_submission(self, *, survey_id, user_id, community_id):
        with self.app.app_context():
            submission = QuestionnaireSurveySubmission(
                survey_id=survey_id,
                user_id=user_id,
                community_id=community_id,
            )
            db.session.add(submission)
            db.session.commit()
            return submission.id

    def login_and_get_token(self, email, password):
        response = self.client.post('/api/login', json={'email': email, 'password': password})
        self.assertEqual(response.status_code, 200)
        return response.get_json()['data']['token']

    def cleanup_state(self, *, user_ids=None, community_ids=None, survey_ids=None):
        user_ids = user_ids or []
        community_ids = community_ids or []
        survey_ids = survey_ids or []

        with self.app.app_context():
            if survey_ids:
                QuestionnaireSurveySubmission.query.filter(
                    QuestionnaireSurveySubmission.survey_id.in_(survey_ids)
                ).delete(synchronize_session=False)
                QuestionnaireSurvey.query.filter(
                    QuestionnaireSurvey.id.in_(survey_ids)
                ).delete(synchronize_session=False)

            if community_ids:
                CommunityMember.query.filter(
                    CommunityMember.community_id.in_(community_ids)
                ).delete(synchronize_session=False)
                Community.query.filter(
                    Community.id.in_(community_ids)
                ).delete(synchronize_session=False)

            if user_ids:
                User.query.filter(User.id.in_(user_ids)).delete(synchronize_session=False)

            db.session.commit()

    def test_dashboard_requires_token(self):
        response = self.client.get('/api/dashboard')
        body = response.get_json()

        self.assertEqual(response.status_code, 401)
        self.assertEqual(body, {
            'success': False,
            'error': 'Missing authorization token',
        })

    def test_dashboard_returns_current_community_summary(self):
        admin = self.create_user_with_community(identity=self.make_identity(prefix='dashboard-admin', role='admin'))

        with self.app.app_context():
            current_community = Community.query.filter_by(id=admin['community_id']).first()

        member_identity = self.make_identity(prefix='dashboard-member', role='member')
        member = self.create_user_with_community(
            identity=member_identity,
            community=current_community,
            role='member',
        )

        other_admin = self.create_user_with_community(identity=self.make_identity(prefix='dashboard-other', role='admin'))

        survey_ids = [
            self.create_survey('Current Community Survey A'),
            self.create_survey('Current Community Survey B'),
            self.create_survey('Other Community Survey'),
        ]

        self.create_submission(
            survey_id=survey_ids[0],
            user_id=admin['user_id'],
            community_id=admin['community_id'],
        )
        self.create_submission(
            survey_id=survey_ids[0],
            user_id=member['user_id'],
            community_id=admin['community_id'],
        )
        self.create_submission(
            survey_id=survey_ids[1],
            user_id=admin['user_id'],
            community_id=admin['community_id'],
        )
        self.create_submission(
            survey_id=survey_ids[2],
            user_id=other_admin['user_id'],
            community_id=other_admin['community_id'],
        )

        token = self.login_and_get_token(admin['identity']['email'], admin['identity']['password'])
        response = self.client.get('/api/dashboard', headers={'Authorization': f'Bearer {token}'})
        body = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body, {
            'success': True,
            'data': {
                'communityName': admin['identity']['community_name'],
                'region': 'Northern Rivers, NSW',
                'disasterType': 'flood',
                'inviteCode': admin['identity']['invite_code'],
                'memberCount': 2,
                'responseCount': 3,
            },
        })

        self.cleanup_state(
            user_ids=[admin['user_id'], member['user_id'], other_admin['user_id']],
            community_ids=[admin['community_id'], other_admin['community_id']],
            survey_ids=survey_ids,
        )


if __name__ == '__main__':
    unittest.main()
