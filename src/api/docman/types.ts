export interface PageResult<T> {
  rows: T[];
  total: number;
}

export interface DocProject {
  id: number;
  name: string;
  projectTypeCode?: string;
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
  projectTypeCode?: string;
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
  projectId?: string | number;
}

export interface DocViewerUrl {
  url: string;
  src: string;
  mode: string;
  saveUrl?: string | null;
  saveToken?: string | null;
  expireAt?: string;
}

export interface DocProcessConfig {
  id: number;
  projectId: number;
  definitionId: number;
  instanceId?: number;
  status: string;
}

export interface DocProjectDrawing {
  id: number;
  projectId: number;
  drawingCode?: string;
  orderSerialNo?: string;
  workContent?: string;
  includeInProject?: boolean;
  remark?: string;
  createTime?: string;
}

export interface DocProjectDrawingForm {
  id?: number;
  projectId: string | number;
  drawingCode?: string;
  orderSerialNo?: string;
  workContent?: string;
  includeInProject?: boolean;
  remark?: string;
}

export interface DocProjectAddRecordDetail {
  id?: number;
  projectId: number;
  projectAddRecordId?: number;
  name?: string;
  alias?: string;
  price?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface DocProjectAddRecord {
  id?: number;
  projectId: number;
  enable?: boolean;
  estimatedPrice?: number;
  remark?: string;
  details?: DocProjectAddRecordDetail[];
  createTime?: string;
  updateTime?: string;
}

export interface DocProjectAddRecordDetailForm {
  id?: number;
  projectId: string | number;
  projectAddRecordId?: number;
  name?: string;
  alias?: string;
  price?: number;
  remark?: string;
}

export interface DocProjectAddRecordForm {
  id?: number;
  projectId: string | number;
  enable?: boolean;
  estimatedPrice?: number;
  remark?: string;
  details?: DocProjectAddRecordDetailForm[];
}

export interface DocProjectVisa {
  id: number;
  projectId: number;
  reason?: string;
  contentBasis?: string;
  amount?: number;
  visaDate?: string;
  includeInProject?: boolean;
  remark?: string;
  createTime?: string;
}

export interface DocProjectVisaForm {
  id?: number;
  projectId: string | number;
  reason?: string;
  contentBasis?: string;
  amount?: number;
  visaDate?: string;
  includeInProject?: boolean;
  remark?: string;
}

export interface DocWorkflowNodeTask {
  id: number;
  nodeId?: number;
  taskCode: string;
  taskName: string;
  taskType: string;
  requiredFlag?: boolean;
  sortOrder?: number;
  completionRule?: string;
  pluginCodes?: string;
  status?: string;
}

export interface DocWorkflowTemplateNode {
  id: number;
  templateId?: number;
  nodeCode: string;
  nodeName: string;
  sortOrder?: number;
  description?: string;
  status?: string;
  tasks?: DocWorkflowNodeTask[];
}

export interface DocProjectNodeTaskRuntime {
  id: number;
  projectId: number;
  nodeCode: string;
  taskCode: string;
  taskName?: string;
  taskType?: string;
  requiredFlag?: boolean;
  sortOrder?: number;
  completionRule?: string;
  pluginCodes?: string;
  status: string;
  completedBy?: number;
  completedAt?: string;
  evidenceRef?: string;
}

export interface DocProjectEstimateSnapshot {
  id: number;
  projectId: number;
  estimateType?: string;
  estimateAmount?: number;
  drawingCount?: number;
  visaCount?: number;
  status?: string;
  summary?: string;
  createTime?: string;
}

export interface DocProjectWorkspace {
  projectId: number;
  projectName: string;
  projectTypeCode?: string;
  currentNodeCode: string;
  currentNodeName: string;
  runtimeStatus: string;
  nodes: DocWorkflowTemplateNode[];
  currentNodeTasks: DocProjectNodeTaskRuntime[];
  drawingCount: number;
  visaCount: number;
  latestEstimateSnapshot?: DocProjectEstimateSnapshot;
}

export interface DocProjectBalanceAdjustment {
  id: number;
  projectId: number;
  materialPrice?: number;
  balanceRemark?: string;
  status?: string;
  createTime?: string;
  updateTime?: string;
}

export interface DocProjectBalanceAdjustmentForm {
  id?: number;
  projectId?: string | number;
  materialPrice?: number;
  balanceRemark?: string;
  status?: string;
}

export interface DocProjectType {
  id: number;
  code: string;
  name: string;
  customerType: string;
  description?: string;
  sortOrder?: number;
  status?: string;
}

export interface DocProjectTypeForm {
  id?: number;
  code: string;
  name: string;
  customerType: string;
  description?: string;
  sortOrder?: number;
  status?: string;
}

export interface DocWorkflowNodeTaskForm {
  id?: number;
  taskCode: string;
  taskName: string;
  taskType: string;
  requiredFlag?: boolean;
  sortOrder?: number;
  completionRule?: string;
  pluginCodes?: string;
  pluginCodeList?: string[];
  description?: string;
  status?: string;
}

export interface DocWorkflowTemplateNodeForm {
  id?: number;
  nodeCode: string;
  nodeName: string;
  sortOrder?: number;
  description?: string;
  status?: string;
  tasks?: DocWorkflowNodeTaskForm[];
}

export interface DocWorkflowTemplate {
  id: number;
  code: string;
  name: string;
  projectTypeCode: string;
  description?: string;
  defaultFlag?: boolean;
  sortOrder?: number;
  status?: string;
  nodes?: DocWorkflowTemplateNodeForm[];
}

export interface DocWorkflowTemplateForm {
  id?: number;
  code: string;
  name: string;
  projectTypeCode: string;
  description?: string;
  defaultFlag?: boolean;
  sortOrder?: number;
  status?: string;
  nodes?: DocWorkflowTemplateNodeForm[];
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
