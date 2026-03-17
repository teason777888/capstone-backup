import random
import string
import uuid

from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


class Community(db.Model):
    __tablename__ = 'communities'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    community_name = db.Column(db.String(200), nullable=False)
    group_number = db.Column(db.String(50), nullable=True)
    disaster_type = db.Column(db.String(100), nullable=False)
    region = db.Column(db.String(200), nullable=False)
    invite_code = db.Column(db.String(10), nullable=False, unique=True)
    created_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now(), onupdate=db.func.now())

    # Relationships
    members = db.relationship('CommunityMember', backref='community', lazy='dynamic')

    # Indexes
    __table_args__ = (
        db.Index('idx_communities_disaster_type', 'disaster_type'),
        db.Index('idx_communities_region', 'region'),
    )

    @staticmethod
    def generate_invite_code():
        """Generate a unique 6-character invite code."""
        chars = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(random.choices(chars, k=6))
            if not Community.query.filter_by(invite_code=code).first():
                return code

    def to_dict(self):
        return {
            'id': str(self.id),
            'communityName': self.community_name,
            'groupNumber': self.group_number,
            'disasterType': self.disaster_type,
            'region': self.region,
            'inviteCode': self.invite_code,
            'createdBy': str(self.created_by),
            'createdAt': self.created_at.isoformat() + 'Z',
        }
