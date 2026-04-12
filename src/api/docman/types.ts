export interface PageResult<T> {
  rows: T[];
  total: number;
}

export type DocmanId = string | number;

export interface DocProject {
  id: DocmanId;
  name: string;
  projectTypeCode?: string;
  customerType: string;
  businessType: string;
  documentCategory: string;
  telecomCode?: string;
  xiangyunCode?: string;
  telecomProjectDate?: string;
  planStartDate?: string;
  planEndDate?: string;
  status: string;
  ownerId: DocmanId;
  ownerName?: string;
  nasBasePath?: string;
  nasDirStatus?: string;
  remark?: string;
  memberIds?: DocmanId[];
  currentUserRole?: string;
  createTime?: string;
}

export interface DocProjectQuery extends PageQuery {
  name?: string;
  projectTypeCode?: string;
  customerType?: string;
  businessType?: string;
}

export interface DocProjectForm {
  id?: DocmanId;
  name: string;
  projectTypeCode?: string;
  customerType: string;
  businessType: string;
  documentCategory: string;
  telecomCode?: string;
  xiangyunCode?: string;
  telecomProjectDate?: string;
  planStartDate?: string;
  planEndDate?: string;
  remark?: string;
}

export interface DocDocumentRecord {
  id: DocmanId;
  projectId: DocmanId;
  projectName?: string;
  nodeInstanceId?: DocmanId;
  pluginId?: string;
  sourceType: string;
  fileName: string;
  nasPath: string;
  ossId?: DocmanId;
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
  id: DocmanId;
  projectId: DocmanId;
  definitionId: DocmanId;
  instanceId?: DocmanId;
  status: string;
}

export interface DocProjectDrawing {
  id: DocmanId;
  projectId: DocmanId;
  drawingCode?: string;
  orderSerialNo?: string;
  workContent?: string;
  includeInProject?: boolean;
  remark?: string;
  createTime?: string;
}

export interface DocProjectDrawingForm {
  id?: DocmanId;
  projectId: string | number;
  drawingCode?: string;
  orderSerialNo?: string;
  workContent?: string;
  includeInProject?: boolean;
  remark?: string;
}

export interface DocProjectDrawingWorkItem {
  id?: DocmanId;
  projectId: DocmanId;
  drawingId: DocmanId;
  workItemCode?: string;
  workItemName?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  includeInEstimate?: boolean;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface DocProjectDrawingWorkItemForm {
  id?: DocmanId;
  projectId: DocmanId;
  drawingId: DocmanId;
  workItemCode?: string;
  workItemName?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  includeInEstimate?: boolean;
  remark?: string;
}

export interface DocProjectAddRecordDetail {
  id?: DocmanId;
  projectId: DocmanId;
  projectAddRecordId?: DocmanId;
  name?: string;
  alias?: string;
  price?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface DocProjectAddRecord {
  id?: DocmanId;
  projectId: DocmanId;
  enable?: boolean;
  estimatedPrice?: number;
  remark?: string;
  details?: DocProjectAddRecordDetail[];
  createTime?: string;
  updateTime?: string;
}

export interface DocProjectAddRecordDetailForm {
  id?: DocmanId;
  projectId: string | number;
  projectAddRecordId?: DocmanId;
  name?: string;
  alias?: string;
  price?: number;
  remark?: string;
}

export interface DocProjectAddRecordForm {
  id?: DocmanId;
  projectId: string | number;
  enable?: boolean;
  estimatedPrice?: number;
  remark?: string;
  details?: DocProjectAddRecordDetailForm[];
}

export interface DocProjectVisa {
  id: DocmanId;
  projectId: DocmanId;
  reason?: string;
  contentBasis?: string;
  amount?: number;
  visaDate?: string;
  includeInProject?: boolean;
  remark?: string;
  createTime?: string;
}

export interface DocProjectVisaForm {
  id?: DocmanId;
  projectId: string | number;
  reason?: string;
  contentBasis?: string;
  amount?: number;
  visaDate?: string;
  includeInProject?: boolean;
  remark?: string;
}

export interface DocWorkflowNodeTask {
  id: DocmanId;
  nodeId?: DocmanId;
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
  id: DocmanId;
  templateId?: DocmanId;
  nodeCode: string;
  nodeName: string;
  sortOrder?: number;
  description?: string;
  status?: string;
  tasks?: DocWorkflowNodeTask[];
}

export interface DocProjectNodeTaskRuntime {
  id: DocmanId;
  projectId: DocmanId;
  nodeCode: string;
  taskCode: string;
  taskName?: string;
  taskType?: string;
  requiredFlag?: boolean;
  sortOrder?: number;
  completionRule?: string;
  pluginCodes?: string;
  status: string;
  completedBy?: DocmanId;
  completedAt?: string;
  evidenceRef?: string;
}

export interface DocProjectEstimateSnapshot {
  id: DocmanId;
  projectId: DocmanId;
  estimateType?: string;
  estimateAmount?: number;
  drawingCount?: number;
  visaCount?: number;
  status?: string;
  summary?: string;
  createTime?: string;
}

export interface DocProjectWorkspace {
  projectId: DocmanId;
  projectName: string;
  projectTypeCode?: string;
  currentNodeCode: string;
  currentNodeName: string;
  runtimeStatus: string;
  nodes: DocWorkflowTemplateNode[];
  currentNodeTasks: DocProjectNodeTaskRuntime[];
  drawingCount: number;
  includedDrawingCount?: number;
  visaCount: number;
  includedVisaCount?: number;
  estimateTriggerReady?: boolean;
  estimateTriggerBlockedReason?: string;
  exportTriggerReady?: boolean;
  exportTriggerBlockedReason?: string;
  latestEstimateSnapshot?: DocProjectEstimateSnapshot;
  latestExportArtifact?: DocDocumentRecord;
}

export interface DocProjectBalanceAdjustment {
  id: DocmanId;
  projectId: DocmanId;
  materialPrice?: number;
  balanceRemark?: string;
  status?: string;
  createTime?: string;
  updateTime?: string;
}

export interface DocProjectBalanceAdjustmentForm {
  id?: DocmanId;
  projectId?: string | number;
  materialPrice?: number;
  balanceRemark?: string;
  status?: string;
}

export interface DocProjectType {
  id: DocmanId;
  code: string;
  name: string;
  customerType: string;
  description?: string;
  sortOrder?: number;
  status?: string;
}

export interface DocProjectTypeForm {
  id?: DocmanId;
  code: string;
  name: string;
  customerType: string;
  description?: string;
  sortOrder?: number;
  status?: string;
}

export interface DocWorkflowNodeTaskForm {
  id?: DocmanId;
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
  id?: DocmanId;
  nodeCode: string;
  nodeName: string;
  sortOrder?: number;
  description?: string;
  status?: string;
  tasks?: DocWorkflowNodeTaskForm[];
}

export interface DocWorkflowTemplate {
  id: DocmanId;
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
  id?: DocmanId;
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
  id: DocmanId;
  projectId: DocmanId;
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
