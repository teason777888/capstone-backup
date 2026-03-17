import unittest
import uuid

from app import create_app
from app.extensions import db
from app.models import Community, CommunityMember, User


class LoginApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app('development')
        cls.client = cls.app.test_client()

    def make_identity(self):
        token = uuid.uuid4().hex[:10]
        return {
            'email': f'codex-login-{token}@example.com',
            'full_name': 'Codex Login Test',
            'password': 'SecurePass123',
            'community_name': 'Codex Recovery Group',
            'invite_code': f'{token[:6].upper()}X',
        }

    def create_user(self, *, role='admin'):
        identity = self.make_identity()
        with self.app.app_context():
            user = User(full_name=identity['full_name'], email=identity['email'])
            user.set_password(identity['password'])
            db.session.add(user)
            db.session.flush()

            community = Community(
                community_name=identity['community_name'],
                group_number='G-99',
                disaster_type='flood',
                region='Sydney',
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

        return identity

    def cleanup_email(self, email):
        with self.app.app_context():
            user = User.query.filter_by(email=email).first()
            if not user:
                return

            communities = Community.query.filter_by(created_by=user.id).all()
            community_ids = [community.id for community in communities]
            if community_ids:
                CommunityMember.query.filter(CommunityMember.community_id.in_(community_ids)).delete(synchronize_session=False)
                Community.query.filter(Community.id.in_(community_ids)).delete(synchronize_session=False)

            User.query.filter_by(email=email).delete(synchronize_session=False)
            db.session.commit()

    def test_login_success_matches_documented_contract(self):
        identity = self.create_user(role='admin')

        response = self.client.post('/api/login', json={
            'email': identity['email'],
            'password': identity['password'],
        })
        body = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(body.keys()), {'success', 'data'})
        self.assertTrue(body['success'])
        self.assertEqual(set(body['data'].keys()), {'id', 'name', 'email', 'role', 'token', 'expiresIn'})
        self.assertEqual(body['data']['name'], identity['full_name'])
        self.assertEqual(body['data']['email'], identity['email'])
        self.assertEqual(body['data']['role'], 'admin')
        self.assertEqual(body['data']['expiresIn'], 3600)
        self.assertTrue(body['data']['token'])
        self.assertNotIn('message', body)

        self.cleanup_email(identity['email'])

    def test_login_validation_errors_use_field_map(self):
        response = self.client.post('/api/login', json={})
        body = response.get_json()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(body, {
            'success': False,
            'error': 'Validation failed',
            'details': {
                'email': 'This field is required',
                'password': 'This field is required',
            },
        })

    def test_login_unknown_email_returns_401(self):
        response = self.client.post('/api/login', json={
            'email': 'missing-user@example.com',
            'password': 'SecurePass123',
        })
        body = response.get_json()

        self.assertEqual(response.status_code, 401)
        self.assertEqual(body, {
            'success': False,
            'error': 'Invalid email or password',
        })

    def test_login_wrong_password_returns_401(self):
        identity = self.create_user(role='member')

        response = self.client.post('/api/login', json={
            'email': identity['email'],
            'password': 'WrongPass123',
        })
        body = response.get_json()

        self.assertEqual(response.status_code, 401)
        self.assertEqual(body, {
            'success': False,
            'error': 'Invalid email or password',
        })

        self.cleanup_email(identity['email'])


if __name__ == '__main__':
    unittest.main()
