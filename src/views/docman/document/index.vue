<template>
  <div class="app-container" data-testid="document-page">
    <el-page-header @back="$router.back()">
      <template #content>文档中心</template>
    </el-page-header>

    <el-alert
      v-if="!hasProjectId"
      title="请先在项目管理中选择项目后再进入文档中心"
      type="info"
      show-icon
      :closable="false"
      style="margin-top: 16px"
    />

    <el-row :gutter="10" class="mb8" style="margin-top: 16px">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Upload" @click="handleUpload" :disabled="!hasProjectId" v-hasPermi="['docman:document:upload']"
          >上传文档</el-button
        >
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="documentList" style="margin-top: 16px" :row-key="(row) => row.id" data-testid="document-table">
      <el-table-column prop="fileName" label="文件名" min-width="200" />
      <el-table-column prop="sourceType" label="来源" width="120">
        <template #default="{ row }">
          <el-tag :type="proxy?.selectDictLabel(doc_source_type.value, row.sourceType)?.cssClass || 'info'" size="small">
            {{ proxy?.selectDictLabel(doc_source_type.value, row.sourceType)?.label || row.sourceType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="proxy?.selectDictLabel(doc_document_status.value, row.status)?.cssClass || 'info'" size="small">
            {{ proxy?.selectDictLabel(doc_document_status.value, row.status)?.label || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="nasPath" label="存储路径" min-width="250" show-overflow-tooltip />
      <el-table-column prop="generatedAt" label="生成时间" width="180" />
      <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button v-hasPermi="['docman:document:query']" size="small" type="success" plain @click="handlePreview(row)">在线预览</el-button>
          <el-button v-hasPermi="['docman:document:download']" size="small" type="primary" plain @click="handleDownload(row)">下载</el-button>
          <el-button v-hasPermi="['docman:document:delete']" size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 上传文档对话框 -->
    <el-dialog v-model="upload.open" :title="upload.title" width="400px" append-to-body @close="handleClose">
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".pdf,.doc,.docx,.dwg"
        :http-request="submitUpload"
        :disabled="upload.isUploading"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <span>仅允许导入 pdf, doc, docx, dwg 格式文件。</span>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm" :loading="upload.isUploading" v-hasPermi="['docman:document:upload']">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRoute } from 'vue-router';
import { listDocument, uploadDocument, downloadDocument, deleteDocument, getDocumentViewerUrl } from '@/api/docman/document';
import { DocDocumentRecord, DocDocumentQuery } from '@/api/docman/types';
import { ElMessage, ElMessageBox, UploadInstance, UploadRequestOptions } from 'element-plus';
import { handleApiError } from '@/utils/error';
import { useRouteProjectId } from '@/hooks/useRouteProjectId';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { doc_source_type, doc_document_status } = toRefs(proxy?.useDict('doc_source_type', 'doc_document_status') ?? {});

const route = useRoute();
const { projectId, hasProjectId } = useRouteProjectId(route);
const documentList = ref<DocDocumentRecord[]>([]);
const total = ref(0);
const loading = ref(true);
const loadError = ref('');
const queryParams = ref<DocDocumentQuery>({ pageNum: 1, pageSize: 20 });

const uploadRef = ref<UploadInstance>();
const upload = reactive({
  open: false,
  title: '上传文档',
  isUploading: false
});

/** 查询文档列表 */
const getList = async () => {
  if (!hasProjectId.value) {
    documentList.value = [];
    total.value = 0;
    loading.value = false;
    return;
  }
  loading.value = true;
  loadError.value = '';
  try {
    const res = await listDocument(projectId.value, queryParams.value);
    documentList.value = res.rows;
    total.value = res.total;
  } catch (error) {
    documentList.value = [];
    total.value = 0;
    loadError.value = handleApiError(error, '获取文档列表失败');
  } finally {
    loading.value = false;
  }
};

/** 下载按钮操作 */
const handleDownload = (row: DocDocumentRecord) => {
  downloadDocument(row.id);
};

/** 在线预览按钮操作 */
const handlePreview = async (row: DocDocumentRecord) => {
  try {
    const res = await getDocumentViewerUrl(row.id);
    const viewerUrl = res?.data?.url;
    if (!viewerUrl) {
      ElMessage.error('在线预览地址获取失败');
      return;
    }
    window.location.href = viewerUrl;
  } catch (error) {
    handleApiError(error, '在线预览失败，请重试');
  }
};

/** 删除按钮操作 */
const handleDelete = async (row: DocDocumentRecord) => {
  await ElMessageBox.confirm(`确认删除文档「${row.fileName}」？`, '提示', { type: 'warning' });
  try {
    await deleteDocument(row.id);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    handleApiError(error, '删除失败，请重试');
  }
};

/** 上传按钮操作 */
function handleUpload() {
  if (!hasProjectId.value) {
    ElMessage.warning('请先在项目管理中选择项目');
    return;
  }
  upload.open = true;
}

/** 提交上传 */
async function submitUpload(options: UploadRequestOptions) {
  if (!hasProjectId.value) {
    ElMessage.warning('请先在项目管理中选择项目');
    return;
  }
  const formData = new FormData();
  formData.append('file', options.file);
  formData.append('projectId', String(projectId.value));

  upload.isUploading = true;
  try {
    await uploadDocument(formData);
    ElMessage.success('上传成功');
    upload.open = false;
    getList();
  } catch (error) {
    handleApiError(error, '上传失败，请重试');
  } finally {
    upload.isUploading = false;
  }
}

function submitFileForm() {
  uploadRef.value?.submit();
}

/** 对话框关闭清理 */
function handleClose() {
  uploadRef.value?.clearFiles();
}

watch(
  projectId,
  () => {
    queryParams.value.pageNum = 1;
    loadError.value = '';
    getList();
  },
  { immediate: true }
);
</script>
