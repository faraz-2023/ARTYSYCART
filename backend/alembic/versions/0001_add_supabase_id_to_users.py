"""add supabase_id to users

Revision ID: 0001_add_supabase_id_to_users
Revises: 
Create Date: 2026-07-26 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_add_supabase_id_to_users'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add supabase_id column to users table
    op.add_column('users', sa.Column('supabase_id', sa.String(length=128), nullable=True))
    # Create index for faster lookups
    op.create_index(op.f('ix_users_supabase_id'), 'users', ['supabase_id'], unique=False)
    # Add unique constraint to ensure one-to-one mapping
    op.create_unique_constraint('uq_users_supabase_id', 'users', ['supabase_id'])


def downgrade():
    op.drop_constraint('uq_users_supabase_id', 'users', type_='unique')
    op.drop_index(op.f('ix_users_supabase_id'), table_name='users')
    op.drop_column('users', 'supabase_id')
