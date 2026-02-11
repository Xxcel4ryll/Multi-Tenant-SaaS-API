import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../database';
import { UserRole } from '../../types';

export interface OrganizationUserAttributes {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface OrganizationUserCreationAttributes extends Optional<
  OrganizationUserAttributes,
  'id' | 'created_at' | 'updated_at'
> {}

class OrganizationUser
  extends Model<OrganizationUserAttributes, OrganizationUserCreationAttributes>
  implements OrganizationUserAttributes
{
  declare id: string;
  declare organization_id: string;
  declare user_id: string;
  declare role: UserRole;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

OrganizationUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('owner', 'admin', 'member'),
      allowNull: false,
      defaultValue: 'member',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'organization_users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrganizationUser;
