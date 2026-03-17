/**
 * 项目管理 VO
 */
export interface DocProjectVO extends BaseEntity {
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
}

/**
 * 项目查询参数
 */
export interface DocProjectQuery extends PageQuery {
  name?: string;
  customerType?: string;
  businessType?: string;
  documentCategory?: string;
  status?: string;
}

/**
 * 项目表单
 */
export interface DocProjectForm {
  id?: number;
  name: string;
  customerType: string;
  businessType: string;
  documentCategory: string;
  ownerId?: number;
  remark?: string;
  memberIds?: number[];
}

/**
 * 文档记录 VO
 */
export interface DocDocumentVO extends BaseEntity {
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
}

/**
 * 文档查询参数
 */
export interface DocDocumentQuery extends PageQuery {
  projectId: number;
}

/**
 * 文档上传表单
 */
export interface DocDocumentUploadForm {
  projectId: number;
  sourceType: string;
  fileName: string;
  nasPath: string;
  ossId?: number;
}

/**
 * 流程配置 VO
 */
export interface DocProcessConfigVO extends BaseEntity {
  id: number;
  projectId: number;
  definitionId: number;
  instanceId?: number;
  status: string;
}

/**
 * 归档包 VO
 */
export interface DocArchivePackageVO extends BaseEntity {
  id: number;
  projectId: number;
  archiveNo: string;
  archiveVersion: number;
  nasArchivePath: string;
  manifest: Array<Record<string, string>>;
  snapshotChecksum?: string;
  status: string;
  requestedAt?: string;
  completedAt?: string;
}

/**
 * 插件信息 VO
 */
export interface DocPluginInfoVO {
  pluginId: string;
  pluginName: string;
  pluginType: string;
  inputFields: Array<{ name: string; type: string; required: boolean; description: string }>;
  outputFields: Array<{ name: string; type: string; required: boolean; description: string }>;
}

/**
 * 插件执行日志 VO
 */
export interface DocPluginExecutionVO extends BaseEntity {
  id: number;
  projectId: number;
  processInstanceId?: number;
  nodeCode?: string;
  pluginId: string;
  pluginName: string;
  status: string;
  costMs?: number;
  generatedFileCount?: number;
  errorMessage?: string;
  requestSnapshot?: string;
  resultSnapshot?: string;
}

/**
 * 插件执行日志查询参数
 */
export interface DocPluginExecutionQuery extends PageQuery {
  projectId: number;
  processInstanceId?: number;
  nodeCode?: string;
  pluginId?: string;
}
