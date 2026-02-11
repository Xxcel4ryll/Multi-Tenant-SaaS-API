import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../database';

export interface ClientAttributes {
  id: string;
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ClientCreationAttributes extends Optional<
  ClientAttributes,
  'id' | 'email' | 'phone' | 'company' | 'notes' | 'created_by' | 'created_at' | 'updated_at'
> {}

class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  declare id: string;
  declare organization_id: string;
  declare name: string;
  public email?: string;
  public phone?: string;
  public company?: string;
  public notes?: string;
  public created_by?: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Client.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'clients',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Client;
