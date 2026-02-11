import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../database';
import { ProjectStatus } from '../../types';

export interface ProjectAttributes {
  id: string;
  organization_id: string;
  client_id?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: Date;
  end_date?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectCreationAttributes extends Optional<
  ProjectAttributes,
  | 'id'
  | 'client_id'
  | 'description'
  | 'status'
  | 'start_date'
  | 'end_date'
  | 'created_by'
  | 'created_at'
  | 'updated_at'
> {}

class Project
  extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes
{
  declare id: string;
  declare organization_id: string;
  public client_id?: string;
  declare name: string;
  public description?: string;
  declare status: ProjectStatus;
  public start_date?: Date;
  public end_date?: Date;
  public created_by?: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
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
    tableName: 'projects',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Project;
