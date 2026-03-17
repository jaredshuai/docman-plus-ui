export interface PageResult<T> {
  rows: T[];
  total: number;
}

export interface DocProject {
  id: number;
  name: string;
  customerType: string;
  businessType: string;
  documentCategory: string;
  status: string;
  ownerId: number;
  ownerName?: string;
  nasBasePath?: string;
  nasDirStatus?: string;
  remark?: string;
  memberIds?: number[];
  currentUserRole?: string;
  createTime?: string;
}

export interface DocProjectQuery extends PageQuery {
  name?: string;
  customerType?: string;
  businessType?: string;
}

export interface DocProjectForm {
  id?: number;
  name: string;
  customerType: string;
  businessType: string;
  documentCategory: string;
  remark?: string;
}

export interface DocDocumentRecord {
  id: number;
  projectId: number;
  projectName?: string;
  nodeInstanceId?: number;
  pluginId?: string;
  sourceType: string;
  fileName: string;
  nasPath: string;
  ossId?: number;
  status: string;
  generatedAt?: string;
  archivedAt?: string;
  createTime?: string;
}

export interface DocDocumentQuery extends PageQuery {
  projectId?: number;
}

export interface DocProcessConfig {
  id: number;
  projectId: number;
  definitionId: number;
  instanceId?: number;
  status: string;
}

export interface DocArchivePackage {
  id: number;
  projectId: number;
  archiveNo: string;
  archiveVersion: number;
  nasArchivePath: string;
  manifest: Array<{ fileName: string; path: string }>;
  snapshotChecksum?: string;
  status: string;
  requestedAt?: string;
  completedAt?: string;
  createTime?: string;
}

export interface DocPluginInfo {
  pluginId: string;
  pluginName: string;
  pluginType: string;
  inputFields: Array<{ name: string; type: string; required: boolean; description: string }>;
  outputFields: Array<{ name: string; type: string; required: boolean; description: string }>;
}
